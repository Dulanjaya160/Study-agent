import os
import uuid

# Memory and startup optimizations for background workers
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz
import chromadb
from sentence_transformers import SentenceTransformer
import ollama
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust path resolution: ensure chroma_db_api points to the backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("CHROMA_PATH", os.path.join(BASE_DIR, "chroma_db_api"))

model = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path=DB_PATH)
COLLECTION_NAME = "student_docs"
collection = client.get_or_create_collection(name=COLLECTION_NAME)


def call_ollama(messages, model="llama3.2"):
    """Robust Ollama caller with automatic CPU fallback on CUDA out-of-memory."""
    try:
        return ollama.chat(model=model, messages=messages)
    except Exception as e:
        # If GPU allocation / VRAM is exhausted or fails, retry on CPU
        try:
            return ollama.chat(model=model, messages=messages, options={"num_gpu": 0})
        except Exception as e2:
            print(f"[ERROR] Ollama request failed: {e2}")
            raise e2


def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start = end - overlap
    return chunks


@app.post("/upload")
async def upload_pdfs(files: list[UploadFile] = File(...)):
    all_chunks = []
    for file in files:
        content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        doc = fitz.open(tmp_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        os.unlink(tmp_path)

        for c in chunk_text(text):
            all_chunks.append({"filename": file.filename, "text": c})

    if all_chunks:
        texts = [c["text"] for c in all_chunks]
        embeddings = model.encode(texts, show_progress_bar=False)
        existing_count = collection.count()
        ids = [f"{existing_count + i}_{uuid.uuid4().hex[:8]}" for i in range(len(all_chunks))]
        collection.add(
            ids=ids,
            embeddings=embeddings.tolist(),
            documents=texts,
            metadatas=[{"filename": c["filename"]} for c in all_chunks],
        )

    return {"chunks_added": len(all_chunks), "total_chunks": collection.count()}


@app.get("/status")
def status():
    return {"total_chunks": collection.count()}


@app.post("/chat")
def chat(question: str):
    if collection.count() == 0:
        return {"answer": "Please upload some lecture slides first!", "sources": []}

    print(f"\n[DEBUG] Received question: {question}")

    classification_prompt = f"""Classify this message into exactly ONE category:
- "greeting" - casual message, greeting, small talk (e.g. "hi", "hello", "thanks", "how are you")
- "summary" - asking to summarize a document or topic
- "quiz" - asking for sample questions, quiz questions, or practice questions
- "question" - a specific factual question needing an answer

Message: "{question}"

Respond with ONLY one word: greeting, summary, quiz, or question"""

    try:
        classification = call_ollama(
            model="llama3.2",
            messages=[{"role": "user", "content": classification_prompt}]
        )
        intent = classification["message"]["content"].strip().lower()
    except Exception as err:
        print(f"[WARN] Intent classification failed: {err}")
        intent = "question"

    print(f"[DEBUG] Classified intent: {intent}")

    if "greeting" in intent:
        friendly_prompt = f"""You are a friendly study assistant. Respond briefly and naturally to: "{question}"
Then remind them they can ask about their uploaded lecture slides, request a summary, or ask for practice questions."""
        try:
            response = call_ollama(model="llama3.2", messages=[{"role": "user", "content": friendly_prompt}])
            return {"answer": response["message"]["content"], "sources": []}
        except Exception as err:
            return {"answer": "Hello! I am your study assistant. Ask me questions about your uploaded lecture slides!", "sources": []}

    if "summary" in intent or "quiz" in intent:
        all_data = collection.get()
        all_docs = all_data["documents"]
        all_metas = all_data["metadatas"]

        target_filename = None
        for meta in all_metas:
            fname = meta["filename"]
            if fname.lower().replace(".pdf", "") in question.lower():
                target_filename = fname
                break

        if target_filename:
            chunks = [d for d, m in zip(all_docs, all_metas) if m["filename"] == target_filename]
            sources = [target_filename]
        else:
            chunks = all_docs[:40]
            sources = list(set(m["filename"] for m in all_metas[:40]))

        context = "\n\n".join(chunks)

        if "summary" in intent:
            task_prompt = f"""Summarize the key points from the following lecture content in clear, organized bullet points.

Content:
{context}

Summary:"""
        else:
            task_prompt = f"""Based on the following lecture content, create 5 sample study questions a student could use to test their understanding.

Content:
{context}

Sample Questions:"""

        try:
            response = call_ollama(model="llama3.2", messages=[{"role": "user", "content": task_prompt}])
            return {"answer": response["message"]["content"], "sources": sources}
        except Exception as err:
            return {"answer": f"Unable to generate response via LLM: {err}", "sources": sources}

    query_embedding = model.encode([question]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=5)

    chunks = results["documents"][0]
    sources = [m["filename"] for m in results["metadatas"][0]]

    context = "\n\n".join([f"[From {s}]: {c}" for c, s in zip(chunks, sources)])
    prompt = f"""Answer the question using ONLY the context below. Cite the source filename for each fact.
If the answer isn't in the context, say "I don't know based on the provided documents." and nothing else.

Context:
{context}

Question: {question}

Answer:"""

    try:
        response = call_ollama(model="llama3.2", messages=[{"role": "user", "content": prompt}])
        answer = response["message"]["content"]
    except Exception as err:
        return {"answer": f"Unable to generate answer via LLM: {err}", "sources": sources}
    answer = response["message"]["content"]

    if "i don't know" in answer.lower():
        return {"answer": answer, "sources": []}

    return {"answer": answer, "sources": list(set(sources))}


@app.delete("/clear")
def clear():
    global collection
    col_name = getattr(collection, "name", COLLECTION_NAME)
    try:
        client.delete_collection(col_name)
    except Exception:
        pass
    collection = client.get_or_create_collection(name=col_name)
    return {"status": "cleared"}