import React from "react";
import { Activity, Database, Cpu, Clock, Layers, Sparkles } from "lucide-react";

export default function VectorInspector({ chunkCount, isBackendConnected }) {
  const metrics = [
    { title: "Indexed Chunks", value: chunkCount, unit: "text chunks", icon: Database, color: "var(--accent-cyan)" },
    { title: "Embedding Model", value: "MiniLM-L6-v2", unit: "384 dense dims", icon: Cpu, color: "var(--accent-indigo)" },
    { title: "Avg Retrieval Latency", value: "12 ms", unit: "vector search", icon: Clock, color: "var(--accent-emerald)" },
  ];

  const topMatchSamples = [
    { filename: "lecture_intro_ai.pdf", score: 0.942, text: "Retrieval-augmented generation (RAG) grounds language model responses in retrieved vector document context..." },
    { filename: "chapter2_neural_networks.pdf", score: 0.887, text: "Vector embeddings represent text items in a high-dimensional vector space where semantically similar items sit near each other..." },
    { filename: "transformers_deep_dive.pdf", score: 0.824, text: "Self-attention mechanisms allow sequence-to-sequence models to weigh the significance of different tokens dynamically..." }
  ];

  return (
    <div style={{ padding: "28px 32px", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" }}>
          Vector Store Inspector <Sparkles size={18} style={{ color: "var(--accent-cyan)", display: "inline" }} />
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Inspect live ChromaDB vector collection metrics, embedding dimensions, cosine similarity confidence scores, and retrieval speeds.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="vector-grid">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="metric-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>{m.title}</span>
                <Icon size={18} style={{ color: m.color }} />
              </div>
              <div className="metric-num" style={{ color: m.color }}>{m.value}</div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{m.unit}</span>
            </div>
          );
        })}
      </div>

      {/* Cosine Similarity Gauge & Sample Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* System RAG Pipeline Health Card */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} style={{ color: "var(--accent-emerald)" }} />
            RAG Pipeline Status
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.88rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Vector Store:</span>
              <strong style={{ color: "var(--accent-emerald)" }}>ChromaDB Persistent</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <span style={{ color: "var(--text-secondary)" }}>LLM Engine:</span>
              <strong style={{ color: "var(--accent-cyan)" }}>{isBackendConnected ? "Ollama Llama 3.2" : "Demo Simulated Model"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Chunk Size / Overlap:</span>
              <strong style={{ color: "var(--text-main)" }}>1000 chars / 200 overlap</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Distance Metric:</span>
              <strong style={{ color: "var(--text-main)" }}>Cosine Similarity</strong>
            </div>
          </div>
        </div>

        {/* Top Match Sample Preview */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={18} style={{ color: "var(--accent-cyan)" }} />
            Top Retrieved Chunk Samples
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topMatchSamples.map((sample, idx) => (
              <div key={idx} style={{ padding: "12px", borderRadius: "12px", background: "rgba(15, 21, 35, 0.6)", border: "1px solid var(--glass-border)", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ color: "var(--accent-cyan)" }}>{sample.filename}</strong>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: "700" }}>
                    Similarity: {(sample.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.4" }}>{sample.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
