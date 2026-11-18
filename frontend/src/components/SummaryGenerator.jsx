import React, { useState } from "react";
import { FileText, Sparkles, Copy, Check, Download, Zap, BookOpen, ListOrdered } from "lucide-react";

export default function SummaryGenerator({ onGenerateSummary, isGenerating, summaryResult }) {
  const [activePreset, setActivePreset] = useState("bullet");
  const [copied, setCopied] = useState(false);

  const presets = [
    { id: "bullet", title: "Bullet Takeaways", desc: "Concise bulleted key points", icon: ListOrdered },
    { id: "executive", title: "Executive Overview", desc: "Comprehensive high-level summary", icon: FileText },
    { id: "formulas", title: "Formulas & Terms", desc: "Glossary of key formulas & definitions", icon: Zap },
    { id: "cram", title: "Exam Cram Sheet", desc: "Must-know facts for upcoming tests", icon: BookOpen }
  ];

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summaryResult) return;
    const blob = new Blob([summaryResult], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Lecture_Summary_${activePreset}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="summary-container">
      <div>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" }}>
          PDF Summary Suite <Sparkles size={18} style={{ color: "var(--accent-cyan)", display: "inline" }} />
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Select a summary preset format below and let Study Agent synthesize your uploaded lecture slides into structured study sheets.
        </p>
      </div>

      {/* Summary Mode Presets Grid */}
      <div className="summary-preset-grid">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = activePreset === p.id;
          return (
            <div
              key={p.id}
              className={`preset-card ${isSelected ? "active" : ""}`}
              onClick={() => setActivePreset(p.id)}
            >
              <Icon size={24} style={{ color: isSelected ? "var(--accent-cyan)" : "var(--accent-indigo)" }} />
              <div>
                <strong style={{ fontSize: "0.95rem", display: "block", color: "var(--text-main)" }}>{p.title}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Action Button */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <button
          onClick={() => onGenerateSummary(activePreset)}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ padding: "12px 24px", fontSize: "0.95rem" }}
        >
          {isGenerating ? (
            <>
              <div className="dot" style={{ width: "6px", height: "6px" }} />
              <span>Analyzing Document Chunks...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Generate Summary ({presets.find(p => p.id === activePreset)?.title})</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Output Card */}
      {summaryResult && (
        <div className="summary-result-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
              <strong style={{ fontSize: "1rem" }}>Generated Study Summary</strong>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                {copied ? <Check size={14} style={{ color: "var(--accent-emerald)" }} /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button onClick={handleDownload} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                <Download size={14} />
                <span>Export TXT</span>
              </button>
            </div>
          </div>

          <div style={{ fontSize: "0.95rem", color: "var(--text-main)", whiteSpace: "pre-wrap" }}>
            {summaryResult}
          </div>
        </div>
      )}
    </div>
  );
}
