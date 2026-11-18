import os
import chromadb
from sentence_transformers import SentenceTransformer
import ollama

# Reconnect to saved database robustly from any working directory
base_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists("./chroma_db"):
    db_path = "./chroma_db"
elif os.path.exists(os.path.join(base_dir, "..", "chroma_db")):
    db_path = os.path.join(base_dir, "..", "chroma_db")
else:
    db_path = "./chroma_db"

client = chromadb.PersistentClient(path=db_path)
collection = client.get_or_create_collection(name="lecture_notes")

# Load the same embedding model (fast — it's already downloaded/cached)
model = SentenceTransformer("all-MiniLM-L6-v2")

def search(query, n_results=3):
    if collection.count() == 0:
        return {"documents": [[]], "metadatas": [[]]}
    query_embedding = model.encode([query]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(n_results, collection.count()),
    )
    return results

def generate_answer(question, context_chunks):
    if not context_chunks:
        return "I don't know based on the provided documents."
    context = "\n\n".join(context_chunks)
    
    prompt = f"""Answer the question using ONLY the context below. 
If the answer isn't in the context, say "I don't know based on the provided documents."

Context:
{context}

Question: {question}

Answer:"""

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[{"role": "user", "content": prompt}]
        )
    except Exception:
        # Fallback to CPU execution if GPU VRAM is exhausted
        response = ollama.chat(
            model="llama3.2",
            messages=[{"role": "user", "content": prompt}],
            options={"num_gpu": 0}
        )
    return response["message"]["content"]

if __name__ == "__main__":
    question = "What is the difference between an agent function and an agent program?"
    results = search(question)

    if results["documents"] and results["documents"][0]:
        for i in range(len(results["documents"][0])):
            filename = results["metadatas"][0][i]["filename"]
            text = results["documents"][0][i]
            print(f"\n--- Match {i+1} (from {filename}) ---")
            print(text[:300])

        context_chunks = results["documents"][0]
        answer = generate_answer(question, context_chunks)
        print("\n=== FINAL ANSWER ===")
        print(answer)
    else:
        print("No documents found in lecture_notes database.")