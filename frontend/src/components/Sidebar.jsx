import React from "react";
import {
  MessageSquare,
  FileText,
  HelpCircle,
  Layers,
  Activity,
  Upload,
  CheckCircle2,
  Trash2,
  BookOpen,
  File,
  X
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  files,
  setFiles,
  onUploadFiles,
  isProcessing,
  onClearDocs,
  chunkCount
}) {
  const navItems = [
    { id: "chat", label: "AI Chat Studio", icon: MessageSquare },
    { id: "summarizer", label: "PDF Summarizer", icon: FileText },
    { id: "quiz", label: "Interactive Quiz", icon: HelpCircle },
    { id: "flashcards", label: "Flashcard Deck", icon: Layers },
    { id: "vector", label: "Vector Inspector", icon: Activity },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="brand-title">Study Agent</h1>
            <span className="brand-badge">RAG NEXUS 2.0</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-section">
          <span className="section-title">WORKSPACE VIEWS</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* PDF Upload Dropzone */}
        <div className="sidebar-upload-box">
          <span className="section-title">KNOWLEDGE DOCUMENTS</span>
          <input
            type="file"
            multiple
            accept=".pdf"
            id="sidebar-file-input"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor="sidebar-file-input" className="dropzone-label">
            <div className="dropzone-icon">
              <Upload size={18} />
            </div>
            <div className="dropzone-text">
              <strong>Click to upload PDFs</strong>
              <br />
              <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Lecture slides & notes</span>
            </div>
          </label>

          {/* Selected File Chips */}
          {files.length > 0 && (
            <div className="file-chip-list">
              {files.map((file, idx) => (
                <div key={idx} className="file-chip">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <File size={14} style={{ color: "var(--accent-cyan)" }} />
                    <span>{file.name}</span>
                  </div>
                  <X
                    size={14}
                    style={{ cursor: "pointer", color: "var(--text-muted)" }}
                    onClick={() => removeFile(idx)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Upload Action Button */}
          {files.length > 0 && (
            <button
              onClick={onUploadFiles}
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "4px" }}
            >
              {isProcessing ? (
                <>
                  <div className="dot" style={{ width: "6px", height: "6px" }} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Process ({files.length}) Docs</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sidebar Footer - Always Anchored At Bottom */}
      <div className="sidebar-footer">
        <div className="status-card">
          <CheckCircle2 size={16} />
          <span>{chunkCount} Chunks in Vector DB</span>
        </div>

        <button onClick={onClearDocs} className="btn btn-danger" style={{ width: "100%" }}>
          <Trash2 size={16} />
          <span>Clear Vector Database</span>
        </button>
      </div>
    </aside>
  );
}
