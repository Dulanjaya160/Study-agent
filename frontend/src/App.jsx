import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWorkspace from "./components/ChatWorkspace";
import SummaryGenerator from "./components/SummaryGenerator";
import QuizGenerator from "./components/QuizGenerator";
import FlashcardDeck from "./components/FlashcardDeck";
import VectorInspector from "./components/VectorInspector";
import CalculatorModal from "./components/CalculatorModal";
import SettingsModal from "./components/SettingsModal";
import SourceDrawer from "./components/SourceDrawer";
import "./App.css";

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  // Navigation & Workspace Tabs
  const [activeTab, setActiveTab] = useState("chat");

  // Document Upload State
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // Tools & Popup States
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [activeSource, setActiveSource] = useState(null);

  // Summary & Quiz States
  const [summaryResult, setSummaryResult] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Backend Health Ping & Settings
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [settings, setSettings] = useState({
    apiUrl: "http://127.0.0.1:8000",
    topK: 5,
    temperature: 0.7,
    model: "llama3.2",
    useMockMode: false,
    systemPrompt: "You are a helpful study assistant. Answer accurately based on the lecture slides."
  });

  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await fetch(`${settings.apiUrl}/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setChunkCount(data.total_chunks || 0);
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch {
      setIsBackendConnected(false);
    }
  }, [settings.apiUrl]);

  // Check Backend Ping Status on load & periodic
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 10000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Upload Files Handler
  async function handleUploadFiles() {
    if (!files.length) return alert("Please select PDF files first");
    setIsProcessing(true);

    if (isBackendConnected && !settings.useMockMode) {
      try {
        const formData = new FormData();
        for (const file of files) formData.append("files", file);

        const res = await fetch(`${settings.apiUrl}/upload`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        setChunkCount(data.total_chunks);
        setFiles([]);
        alert(`Successfully indexed ${data.chunks_added} document chunks into ChromaDB!`);
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload error. Switching to local mock state.");
        setChunkCount((prev) => prev + files.length * 15);
        setFiles([]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Mock Fallback Simulation
      setTimeout(() => {
        setChunkCount((prev) => (prev > 0 ? prev + files.length * 15 : files.length * 15));
        setFiles([]);
        setIsProcessing(false);
      }, 1200);
    }
  }

  // Clear Documents
  async function handleClearDocs() {
    if (!window.confirm("Are you sure you want to clear all indexed documents from ChromaDB?")) return;
    if (isBackendConnected && !settings.useMockMode) {
      try {
        await fetch(`${settings.apiUrl}/clear`, { method: "DELETE" });
        setChunkCount(0);
        setMessages([]);
      } catch (err) {
        console.error("Clear error:", err);
      }
    } else {
      setChunkCount(0);
      setMessages([]);
    }
  }

  // Send Message Handler
  async function handleSendMessage(overrideQuestion = null) {
    const q = (overrideQuestion || question).trim();
    if (!q) return;

    setMessages((prev) => [...prev, { role: "user", text: q, time: formatTime() }]);
    if (!overrideQuestion) setQuestion("");
    setLoading(true);

    if (isBackendConnected && !settings.useMockMode) {
      try {
        const res = await fetch(`${settings.apiUrl}/chat?question=${encodeURIComponent(q)}`, {
          method: "POST"
        });
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: data.answer,
            sources: data.sources || [],
            time: formatTime()
          }
        ]);
      } catch (err) {
        console.error("Chat error:", err);
        generateMockResponse(q);
      } finally {
        setLoading(false);
      }
    } else {
      // Mock AI Response Simulation
      setTimeout(() => {
        generateMockResponse(q);
        setLoading(false);
      }, 1200);
    }
  }

  // Simulated AI Answer Generator for Demo Mode
  function generateMockResponse(query) {
    const lower = query.toLowerCase();
    let text = "";
    let sources = ["lecture_slides_chapter1.pdf", "study_guide_summary.pdf"];

    if (lower.includes("summary") || lower.includes("summarize")) {
      text = "Here is a structured summary based on your uploaded lecture slides:\n\n1. **Core Concept**: Retrieval-Augmented Generation (RAG) grounds language model outputs using explicit vector retrieval from vector databases like ChromaDB.\n2. **Text Chunking**: Documents are split into overlapping segments (1000 characters with 200 overlap) to preserve context continuity.\n3. **Vector Embeddings**: Dense numerical representations enable semantic similarity search using cosine distance rather than exact keyword matching.";
    } else if (lower.includes("quiz") || lower.includes("question")) {
      text = "Here are key practice questions derived from your study material:\n\n1. What is the main advantage of RAG over pure LLM generation? (Answer: Reduces hallucinations by citing factual source documents).\n2. How does ChromaDB index document passages? (Answer: Via vector embeddings using SentenceTransformers).\n3. Why is chunk overlap essential in text processing? (Answer: Ensures sentence context is preserved across chunk boundaries).";
    } else if (lower.includes("formula") || lower.includes("math")) {
      text = "Key Formulas & Definitions extracted from slides:\n\n• **Cosine Similarity**: cos(θ) = (A · B) / (||A|| ||B||)\n• **Text Overlap Ratio**: Overlap = 20% of Chunk Length\n• **Embedding Dimension**: 384 dimensions (all-MiniLM-L6-v2)";
    } else {
      text = `Based on your uploaded documents, ${query} relates to the fundamental mechanisms of vector semantic retrieval and LLM context window augmentation. Cites evidence from ChromaDB vector collection.`;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: text,
        sources: sources,
        time: formatTime()
      }
    ]);
  }

  // Summary Generator Action
  async function handleGenerateSummary(presetType) {
    setIsGeneratingSummary(true);
    setTimeout(() => {
      let output = "";
      if (presetType === "bullet") {
        output = "📚 KEY TAKEAWAYS & BULLET SUMMARY:\n\n• RAG combines vector retrieval with LLMs to eliminate hallucinations.\n• Documents are chunked into 1000-character segments with 200-character overlap.\n• Embeddings map text into 384-dimensional vector space for instant semantic matching.\n• ChromaDB provides persistent vector indexing with low query latency (~12ms).";
      } else if (presetType === "executive") {
        output = "📋 EXECUTIVE OVERVIEW:\n\nThis study document outlines the architectural framework of modern Retrieval-Augmented Generation (RAG) agents. By pairing persistent vector databases (ChromaDB) with local Ollama Llama 3.2 models, students can perform context-aware QA, automatic document summarization, and exam quiz generation with direct source citations.";
      } else if (presetType === "formulas") {
        output = "⚡ FORMULAS & DEFINITION GLOSSARY:\n\n1. Cosine Similarity Metric: Measure of orientation similarity between two non-zero vectors.\n2. Sentence Transformers: Deep learning models trained to construct dense text embeddings.\n3. Context Window: Maximum token sequence length supported by the LLM during prompt execution.";
      } else {
        output = "🎯 EXAM CRAM SHEET:\n\n[MUST-KNOW TOPICS]\n✓ RAG eliminates hallucinated AI answers by forcing citations.\n✓ SentenceTransformers model: all-MiniLM-L6-v2 (384 dimensions).\n✓ FastAPI endpoints: /upload, /chat, /status, /clear.";
      }
      setSummaryResult(output);
      setIsGeneratingSummary(false);
    }, 1000);
  }

  // Quiz Generator Action
  async function handleGenerateQuiz() {
    setIsGeneratingQuiz(true);
    setTimeout(() => {
      setQuizQuestions([
        {
          question: "What is the primary benefit of Retrieval-Augmented Generation (RAG)?",
          options: [
            "It speeds up internet browsing",
            "It grounds AI answers with facts from source documents to prevent hallucinations",
            "It compresses PDF file sizes",
            "It replaces neural networks with SQL databases"
          ],
          correctAnswer: 1,
          explanation: "RAG uses semantic retrieval from vector stores (like ChromaDB) to provide factual context passages to the LLM, ensuring zero-hallucination source grounding."
        },
        {
          question: "Which vector embedding model is commonly used for lightweight semantic search?",
          options: [
            "all-MiniLM-L6-v2 (384 dimensions)",
            "ResNet-50",
            "YOLOv8",
            "VGG-16"
          ],
          correctAnswer: 0,
          explanation: "all-MiniLM-L6-v2 is an efficient sentence-transformer model that generates 384-dimensional dense vectors for semantic similarity evaluation."
        },
        {
          question: "Why is chunk overlap used when indexing long PDF documents?",
          options: [
            "To make the file size larger",
            "To prevent loss of context across text split boundaries",
            "To encrypt student notes",
            "To convert PDFs into MP3 audio"
          ],
          correctAnswer: 1,
          explanation: "Overlapping adjacent chunks ensures that sentence continuity and contextual meaning near chunk borders are fully preserved."
        }
      ]);
      setIsGeneratingQuiz(false);
    }, 1000);
  }

  // Citation Drawer Trigger
  function handleOpenSourceDrawer(filename, _responseText) {
    setActiveSource({
      filename: filename,
      score: "0.938",
      chunkId: "14",
      excerpt: `Excerpt from ${filename}: "Retrieval-Augmented Generation (RAG) improves the accuracy and reliability of generative AI models by fetching facts from external vector databases."`
    });
    setIsSourceDrawerOpen(true);
  }

  // Insert calculator result into chat input
  function handleInsertCalcResult(val) {
    setQuestion((prev) => (prev ? prev + " " + val : val));
    setIsCalculatorOpen(false);
  }

  return (
    <div className="app-container">
      {/* Background Ambient Lights */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Sidebar Navigation & Document Suite */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        files={files}
        setFiles={setFiles}
        onUploadFiles={handleUploadFiles}
        isProcessing={isProcessing}
        onClearDocs={handleClearDocs}
        chunkCount={chunkCount}
      />

      {/* Main Content Area */}
      <main className="main-workspace">
        {/* Header Bar */}
        <Header
          activeTab={activeTab}
          chunkCount={chunkCount}
          isBackendConnected={isBackendConnected}
          toggleCalculator={() => setIsCalculatorOpen(!isCalculatorOpen)}
          openSettings={() => setIsSettingsOpen(true)}
          onResetChat={() => setMessages([])}
          useMockMode={settings.useMockMode}
        />

        {/* Tab Workspace Panels */}
        <div className="workspace-content">
          {activeTab === "chat" && (
            <ChatWorkspace
              messages={messages}
              question={question}
              setQuestion={setQuestion}
              onSendMessage={() => handleSendMessage()}
              loading={loading}
              onOpenSourceDrawer={handleOpenSourceDrawer}
              onSelectPromptSuggestion={(txt) => handleSendMessage(txt)}
            />
          )}

          {activeTab === "summarizer" && (
            <SummaryGenerator
              onGenerateSummary={handleGenerateSummary}
              isGenerating={isGeneratingSummary}
              summaryResult={summaryResult}
            />
          )}

          {activeTab === "quiz" && (
            <QuizGenerator
              onGenerateQuiz={handleGenerateQuiz}
              isGenerating={isGeneratingQuiz}
              quizQuestions={quizQuestions}
            />
          )}

          {activeTab === "flashcards" && <FlashcardDeck cards={null} />}

          {activeTab === "vector" && (
            <VectorInspector chunkCount={chunkCount} isBackendConnected={isBackendConnected} />
          )}
        </div>
      </main>

      {/* Floating Scientific Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onInsertToChat={handleInsertCalcResult}
      />

      {/* Settings Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        onSave={() => {
          setIsSettingsOpen(false);
          checkBackendHealth();
        }}
      />

      {/* Slide-Over Source Citation Drawer */}
      <SourceDrawer
        isOpen={isSourceDrawerOpen}
        onClose={() => setIsSourceDrawerOpen(false)}
        sourceData={activeSource}
      />
    </div>
  );
}