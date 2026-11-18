import React from "react";
import {
  Sparkles,
  Calculator,
  Settings,
  Database,
  RotateCcw
} from "lucide-react";

export default function Header({
  activeTab,
  chunkCount,
  isBackendConnected,
  toggleCalculator,
  openSettings,
  onResetChat,
  useMockMode
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "chat":
        return { title: "AI Study Assistant", sub: "Ask questions, cite PDF sources, & study lectures" };
      case "summarizer":
        return { title: "PDF Summary Suite", sub: "Generate instant executive summaries & bullet breakdowns" };
      case "quiz":
        return { title: "Interactive Quiz Engine", sub: "Test your understanding with AI-generated practice questions" };
      case "flashcards":
        return { title: "Active Recall Flashcards", sub: "3D flip cards generated from your indexed study materials" };
      case "vector":
        return { title: "Vector Store Inspector", sub: "Live RAG embedding metrics, similarity scores & retrieval latency" };
      default:
        return { title: "Study Agent Studio", sub: "Next-Level RAG AI Workspace" };
    }
  };

  const { title, sub } = getTabTitle();

  return (
    <header className="header-bar">
      <div className="header-title-group">
        <div>
          <h2>
            {title} <Sparkles size={18} style={{ color: "var(--accent-cyan)", display: "inline" }} />
          </h2>
          <p className="header-subtitle">{sub}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Backend Status Ping Badge */}
        <div
          className="status-badge-live"
          title={
            useMockMode
              ? "Running in Simulated Demo mode (Mock Enabled in Settings)"
              : isBackendConnected
              ? "Connected to FastAPI backend at http://127.0.0.1:8000"
              : "Offline - Running in Demo Simulation mode"
          }
          style={{
            background: !useMockMode && isBackendConnected ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
            borderColor: !useMockMode && isBackendConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
            color: !useMockMode && isBackendConnected ? "var(--accent-emerald)" : "var(--accent-amber)"
          }}
        >
          <span
            className="pulse-dot"
            style={{
              background: !useMockMode && isBackendConnected ? "var(--accent-emerald)" : "var(--accent-amber)"
            }}
          />
          <span>{!useMockMode && isBackendConnected ? "FastAPI Online" : "Demo Mode"}</span>
        </div>

        {/* Database Chunk Counter Badge */}
        <div className="status-badge-live" style={{ background: "rgba(99, 102, 241, 0.12)", color: "var(--accent-cyan)", borderColor: "rgba(6, 182, 212, 0.3)" }}>
          <Database size={14} />
          <span>{chunkCount} Chunks Indexed</span>
        </div>

        {/* Quick Scientific Calculator Button */}
        <button
          onClick={toggleCalculator}
          className="btn btn-secondary"
          title="Open Scientific Calculator Tool"
          style={{ padding: "8px 12px" }}
        >
          <Calculator size={16} />
          <span>Calc</span>
        </button>

        {/* New Chat / Reset */}
        {activeTab === "chat" && (
          <button onClick={onResetChat} className="btn btn-secondary" title="Clear chat history" style={{ padding: "8px 12px" }}>
            <RotateCcw size={15} />
            <span>Clear</span>
          </button>
        )}

        {/* Settings Modal Button */}
        <button onClick={openSettings} className="btn btn-secondary" title="Configure LLM & RAG Settings" style={{ padding: "8px 12px" }}>
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
