# 📚 Study Agent (RAG Nexus)

A local Retrieval-Augmented Generation (RAG) study assistant powered by **FastAPI**, **React + Vite**, **ChromaDB**, **SentenceTransformers**, and **Ollama (Llama 3.2)**.

---

## 🚀 Features

- **Document Ingestion**: Upload PDF lecture notes and slides with automatic text chunking and overlap.
- **Persistent Vector Store**: Dense semantic embeddings (384-dimensional `all-MiniLM-L6-v2`) indexed in ChromaDB.
- **Context-Aware AI Chat**: Answers questions with zero hallucinations by citing exact document passages.
- **Intent-Driven Responses**: Auto-detects whether the user is asking for:
  - 💬 **Casual greetings & guidance**
  - 📋 **Structured summaries & key takeaways**
  - ❓ **Practice quiz questions with answers**
  - 🔍 **Specific factual Q&A with source citations**
- **Full Study Suite (React UI)**:
  - **AI Chat Studio** with source citation drawers
  - **PDF Summary Suite** (bullet points, executive summaries, cram sheets)
  - **Interactive Practice Quiz** with instant scorecards
  - **Active Recall Flashcards** (3D flip cards with mastery tracking)
  - **Vector Store Inspector** (live chunk counts & latency metrics)
  - **Floating Scientific Calculator**

---

## 🛠️ Tech Stack

- **Backend**: Python 3.14 / 3.10+, FastAPI, Uvicorn, PyMuPDF (`fitz`), ChromaDB, SentenceTransformers, Ollama
- **Frontend**: React 19, Vite, Lucide Icons
- **Local LLM**: Ollama (`llama3.2`)

---

## 🏃 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- [Ollama](https://ollama.com/) with `llama3.2` pulled (`ollama pull llama3.2`)

### 2. Backend Setup
```powershell
# Create & activate virtual environment (if needed)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install fastapi uvicorn chromadb sentence-transformers pymupdf ollama python-multipart

# Start FastAPI server
python -m uvicorn backend.backend:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run backend test suite:
```powershell
python tests/test_backend.py
```
Run live end-to-end server integration tests:
```powershell
python tests/test_e2e_live.py
```

