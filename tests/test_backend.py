import os
import sys
import unittest
import tempfile
import shutil
import fitz
from starlette.testclient import TestClient

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import chromadb
import backend as backend_module
from backend import app, chunk_text


class TestBackendFunctions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create an isolated temporary directory for ChromaDB during tests
        cls.test_dir = tempfile.mkdtemp()
        cls.orig_client = backend_module.client
        cls.orig_collection = backend_module.collection

        # Point backend to the test temporary ChromaDB
        test_client = chromadb.PersistentClient(path=cls.test_dir)
        test_collection = test_client.get_or_create_collection(name="test_student_docs")
        backend_module.client = test_client
        backend_module.collection = test_collection

        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        # Restore original client and collection
        backend_module.client = cls.orig_client
        backend_module.collection = cls.orig_collection
        # Clean up test directory
        shutil.rmtree(cls.test_dir, ignore_errors=True)

    def setUp(self):
        # Ensure collection is clean before each test if needed
        pass

    def test_chunk_text_empty(self):
        """Test that chunk_text handles empty string gracefully."""
        chunks = chunk_text("")
        self.assertEqual(chunks, [])

    def test_chunk_text_short(self):
        """Test text shorter than chunk size produces exactly one chunk."""
        text = "This is a short sample lecture note."
        chunks = chunk_text(text, chunk_size=1000, overlap=200)
        self.assertEqual(len(chunks), 1)
        self.assertEqual(chunks[0], text)

    def test_chunk_text_overlap(self):
        """Test chunking with overlap splits correctly and overlaps characters."""
        # Create 2500 character text
        text = "A" * 800 + "B" * 200 + "C" * 800 + "D" * 200 + "E" * 500
        chunks = chunk_text(text, chunk_size=1000, overlap=200)
        # Expected:
        # chunk 0: 0..1000
        # chunk 1: 800..1800
        # chunk 2: 1600..2500
        self.assertEqual(len(chunks), 3)
        self.assertEqual(chunks[0][800:1000], chunks[1][0:200])
        self.assertEqual(chunks[1][800:1000], chunks[2][0:200])

    def test_chat_empty_collection(self):
        """Test chat returns prompt to upload slides when collection is empty."""
        # Clear collection first
        res = self.client.delete("/clear")
        self.assertEqual(res.status_code, 200)

        response = self.client.post("/chat?question=What is RAG?")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["answer"], "Please upload some lecture slides first!")
        self.assertEqual(data["sources"], [])

    def test_status_endpoint(self):
        """Test GET /status returns correct total chunks."""
        response = self.client.get("/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_chunks", data)
        self.assertIsInstance(data["total_chunks"], int)

    def test_pdf_upload_and_status(self):
        """Test uploading a dynamically generated PDF and verifying indexation."""
        # Generate a test PDF in memory
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text(
            (50, 72),
            "Microeconomics is the study of individuals, households and firms' behavior in decision making "
            "and allocation of resources. Scarcity means human wants exceed available resources. "
            "Supply and demand determine market equilibrium prices and quantities."
        )
        pdf_bytes = doc.tobytes()
        doc.close()

        # Upload the PDF via FastAPI test client
        files = {
            "files": ("test_economics.pdf", pdf_bytes, "application/pdf")
        }
        res = self.client.post("/upload", files=files)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("chunks_added", data)
        self.assertIn("total_chunks", data)
        self.assertGreater(data["chunks_added"], 0)
        self.assertEqual(data["total_chunks"], data["chunks_added"])

        # Verify status endpoint reflects updated count
        status_res = self.client.get("/status")
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["total_chunks"], data["total_chunks"])

    def test_chat_greeting(self):
        """Test chat classifies greeting intent and responds without sources."""
        response = self.client.post("/chat?question=Hello! How are you today?")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIsInstance(data["answer"], str)
        self.assertGreater(len(data["answer"]), 0)
        self.assertEqual(data["sources"], [])

    def test_chat_summary(self):
        """Test chat classifies summary intent and summarizes uploaded content."""
        response = self.client.post("/chat?question=Summarize test_economics.pdf key points")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIn("sources", data)
        self.assertGreater(len(data["answer"]), 0)

    def test_chat_quiz(self):
        """Test chat classifies quiz intent and creates practice questions."""
        response = self.client.post("/chat?question=Create a quiz with sample practice questions")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIn("sources", data)
        self.assertGreater(len(data["answer"]), 0)

    def test_chat_factual_question(self):
        """Test chat retrieves relevant chunks and answers a specific question."""
        response = self.client.post("/chat?question=What does scarcity mean in economics?")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("answer", data)
        self.assertIn("sources", data)
        self.assertGreater(len(data["answer"]), 0)

    def test_clear_endpoint(self):
        """Test DELETE /clear resets the collection to 0 chunks."""
        res = self.client.delete("/clear")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json(), {"status": "cleared"})

        status_res = self.client.get("/status")
        self.assertEqual(status_res.json()["total_chunks"], 0)


if __name__ == "__main__":
    unittest.main()

