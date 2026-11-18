import fitz
import os

folder_path = "."  # current folder, since your script is with your PDFs

all_documents = {}  # will store {filename: text}

for filename in os.listdir(folder_path):
    if filename.endswith(".pdf"):
        path = os.path.join(folder_path, filename)
        doc = fitz.open(path)
        
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        all_documents[filename] = text
        print(f"Extracted {filename}: {len(text)} characters")

print(f"\nTotal PDFs processed: {len(all_documents)}")

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap
    return chunks

all_chunks = []

for filename, text in all_documents.items():
    chunks = chunk_text(text)
    for chunk in chunks:
        all_chunks.append({"filename": filename, "text": chunk})
    print(f"{filename}: split into {len(chunks)} chunks")

print(f"\nTotal chunks created: {len(all_chunks)}")

from sentence_transformers import SentenceTransformer

# Load a small, free embedding model (downloads once, then cached)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Turn every chunk's text into a vector (list of numbers)
texts = [chunk["text"] for chunk in all_chunks]
embeddings = model.encode(texts, show_progress_bar=True)

print(f"\nCreated {len(embeddings)} embeddings")
print(f"Each embedding has {len(embeddings[0])} numbers")

import chromadb

# Create a persistent database (saves to disk, so it's still there next time)
client = chromadb.PersistentClient(path="./chroma_db")

# Create (or get) a collection — think of this like a table
collection = client.get_or_create_collection(name="lecture_notes")

# Add all chunks into the database
collection.add(
    ids=[str(i) for i in range(len(all_chunks))],  # unique ID for each chunk
    embeddings=embeddings.tolist(),
    documents=[chunk["text"] for chunk in all_chunks],
    metadatas=[{"filename": chunk["filename"]} for chunk in all_chunks],
)

print(f"\nStored {collection.count()} chunks in the database")