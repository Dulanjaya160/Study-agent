import React, { useState } from "react";
import { RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Sparkles, HelpCircle } from "lucide-react";

export default function FlashcardDeck({ cards }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState({});

  const cardList = cards && cards.length > 0 ? cards : [
    { front: "What is Retrieval-Augmented Generation (RAG)?", back: "RAG is an AI framework that combines document retrieval from a vector database (like ChromaDB) with a Large Language Model (like Llama 3) to generate accurate, fact-grounded responses." },
    { front: "What is Vector Embedding?", back: "Vector embedding is the mathematical conversion of text/documents into dense high-dimensional numerical vectors using neural models (e.g. SentenceTransformers all-MiniLM-L6-v2)." },
    { front: "How does Semantic Search work?", back: "Semantic search calculates cosine similarity between the query embedding vector and stored chunk vectors to retrieve contextually relevant passages regardless of exact keyword matches." },
    { front: "Why overlap text chunks during document indexing?", back: "Chunk overlap preserves contextual continuity across document split boundaries so critical sentence context isn't lost between chunks." }
  ];

  const currentCard = cardList[currentIdx];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev + 1) % cardList.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx((prev) => (prev - 1 + cardList.length) % cardList.length);
    }, 150);
  };

  const toggleMastered = (e) => {
    e.stopPropagation();
    setMasteredCards((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx]
    }));
  };

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", height: "100%", overflowY: "auto" }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" }}>
          Active Recall Flashcards <Sparkles size={18} style={{ color: "var(--accent-cyan)", display: "inline" }} />
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Click the card to flip between Question and Explanation. Use active recall to test key terms!
        </p>
      </div>

      {/* Counter & Mastered */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--accent-cyan)" }}>
          Card {currentIdx + 1} of {cardList.length}
        </span>
        <button
          onClick={toggleMastered}
          className={`btn ${masteredCards[currentIdx] ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "4px 12px", fontSize: "0.78rem" }}
        >
          <CheckCircle2 size={14} />
          <span>{masteredCards[currentIdx] ? "Mastered ✓" : "Mark as Mastered"}</span>
        </button>
      </div>

      {/* 3D Flip Card Component */}
      <div className="flashcard-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
          {/* Front Face */}
          <div className="flashcard-face">
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-indigo)", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <HelpCircle size={14} /> QUESTION (Click to flip)
            </span>
            <p style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.5" }}>
              {currentCard.front}
            </p>
          </div>

          {/* Back Face */}
          <div className="flashcard-face flashcard-back">
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent-cyan)", fontWeight: "700", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} /> ANSWER EXPLANATION
            </span>
            <p style={{ fontSize: "1.05rem", color: "var(--text-main)", lineHeight: "1.6" }}>
              {currentCard.back}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={handlePrev} className="btn btn-secondary" style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0 }}>
          <ChevronLeft size={20} />
        </button>

        <button onClick={() => setIsFlipped(!isFlipped)} className="btn btn-secondary" style={{ padding: "10px 20px" }}>
          <RotateCcw size={16} />
          <span>Flip Card</span>
        </button>

        <button onClick={handleNext} className="btn btn-secondary" style={{ borderRadius: "50%", width: "44px", height: "44px", padding: 0 }}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
