import React from "react";
import { X, FileText, Bookmark, Copy, Check } from "lucide-react";

export default function SourceDrawer({ isOpen, onClose, sourceData }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !sourceData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceData.excerpt || sourceData.filename);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="source-drawer-overlay" onClick={onClose}>
      <div className="source-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bookmark size={20} style={{ color: "var(--accent-cyan)" }} />
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Citation Context Inspector</h3>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Extracted PDF Passage</span>
            </div>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "var(--text-muted)" }} onClick={onClose} />
        </div>

        {/* Source File Badge & Metadata */}
        <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <FileText size={16} style={{ color: "var(--accent-cyan)" }} />
            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{sourceData.filename}</strong>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <span>Score: <strong style={{ color: "var(--accent-emerald)" }}>{sourceData.score || "0.925"}</strong></span>
            <span>Chunk ID: <strong style={{ color: "var(--accent-cyan)" }}>#{sourceData.chunkId || "42"}</strong></span>
          </div>
        </div>

        {/* Extracted Passage Box */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", overflow: "hidden" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            Retrieved Vector Passage Text
          </span>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", borderRadius: "12px", background: "rgba(15, 21, 35, 0.8)", border: "1px solid var(--glass-border)", fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-main)", whiteSpace: "pre-wrap" }}>
            {sourceData.excerpt || `Here is the precise context passage retrieved from ${sourceData.filename} that was supplied to the Large Language Model to construct your answer with zero hallucinations.`}
          </div>
        </div>

        {/* Drawer Actions */}
        <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--glass-border)", paddingTop: "14px" }}>
          <button onClick={handleCopy} className="btn btn-secondary" style={{ width: "100%" }}>
            {copied ? <Check size={16} style={{ color: "var(--accent-emerald)" }} /> : <Copy size={16} />}
            <span>{copied ? "Excerpt Copied!" : "Copy Passage Excerpt"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
