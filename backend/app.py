import streamlit as st
import fitz
import chromadb
from sentence_transformers import SentenceTransformer
import ollama
import tempfile
import os

st.set_page_config(page_title="Study Agent", layout="wide")

@st.cache_resource
def load_model():
    return SentenceTransformer("all-MiniLM-L6-v2")

@st.cache_resource
def get_chroma_client():
    return chromadb.PersistentClient(path="./chroma_db_ui")

model = load_model()
client = get_chroma_client()

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

def process_pdfs(uploaded_files, collection_name):
    collection = client.get_or_create_collection(name=collection_name)
    all_chunks = []
    for uploaded_file in uploaded_files:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(uploaded_file.read())
            tmp_path = tmp.name
        doc = fitz.open(tmp_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        os.unlink(tmp_path)

        chunks = chunk_text(text)
        for c in chunks:
            all_chunks.append({"filename": uploaded_file.name, "text": c})

    if all_chunks:
        texts = [c["text"] for c in all_chunks]
        embeddings = model.encode(texts, show_progress_bar=False)
        existing_count = collection.count()
        ids = [str(existing_count + i) for i in range(len(all_chunks))]
        collection.add(
            ids=ids,
            embeddings=embeddings.tolist(),
            documents=texts,
            metadatas=[{"filename": c["filename"]} for c in all_chunks],
        )
    return len(all_chunks)

def search(collection, query, n_results=5):
    query_embedding = model.encode([query]).tolist()
    return collection.query(query_embeddings=query_embedding, n_results=n_results)

def generate_answer(question, context_chunks, sources):
    context = "\n\n".join([f"[From {s}]: {c}" for c, s in zip(context_chunks, sources)])
    prompt = f"""Answer the question using ONLY the context below. Cite the source filename for each fact.
If the answer isn't in the context, say "I don't know based on the provided documents."

Context:
{context}

Question: {question}

Answer:"""
    response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"]

# ---------------- UI ----------------

st.title("📚 Study Agent")
st.caption("Upload your lecture slides and ask questions about them")

with st.sidebar:
    st.header("Upload Materials")
    uploaded_files = st.file_uploader("Upload PDF lecture slides", type="pdf", accept_multiple_files=True)
    if st.button("Process Documents") and uploaded_files:
        with st.spinner("Reading and indexing your documents..."):
            count = process_pdfs(uploaded_files, "student_docs")
        st.success(f"Indexed {count} chunks from {len(uploaded_files)} files!")

    st.divider()
    collection = client.get_or_create_collection(name="student_docs")
    st.write(f"📄 {collection.count()} chunks currently in database")
    if st.button("Clear all documents"):
        try:
            client.delete_collection("student_docs")
        except Exception:
            pass
        st.rerun()

if "messages" not in st.session_state:
    st.session_state.messages = []

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

if question := st.chat_input("Ask a question about your slides..."):
    st.session_state.messages.append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.write(question)

    with st.chat_message("assistant"):
        collection = client.get_or_create_collection(name="student_docs")
        if collection.count() == 0:
            answer = "Please upload some lecture slides first!"
        else:
            with st.spinner("Thinking..."):
                results = search(collection, question, n_results=5)
                sources = [m["filename"] for m in results["metadatas"][0]]
                answer = generate_answer(question, results["documents"][0], sources)
        st.write(answer)
    st.session_state.messages.append({"role": "assistant", "content": answer})