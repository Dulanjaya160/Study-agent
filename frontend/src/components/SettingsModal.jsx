import React from "react";
import { Settings, X, Save } from "lucide-react";

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  setSettings,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--glass-border)", paddingBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Settings size={20} style={{ color: "var(--accent-cyan)" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>AI Agent Settings</h3>
          </div>
          <X size={20} style={{ cursor: "pointer", color: "var(--text-muted)" }} onClick={onClose} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "450px", paddingRight: "4px" }}>
          {/* Top K Chunks Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.88rem" }}>
              <label style={{ fontWeight: "600" }}>Top-K Chunk Retrieval Count</label>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{settings.topK} Chunks</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.topK}
              onChange={(e) => setSettings({ ...settings, topK: parseInt(e.target.value) })}
              style={{ width: "100%", accentColor: "var(--accent-indigo)" }}
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.88rem" }}>
              <label style={{ fontWeight: "600" }}>LLM Temperature (Creativity)</label>
              <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              style={{ width: "100%", accentColor: "var(--accent-indigo)" }}
            />
          </div>

          {/* Model Selector */}
          <div>
            <label style={{ display: "block", fontWeight: "600", fontSize: "0.88rem", marginBottom: "6px" }}>
              LLM Model Engine
            </label>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--bg-input)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-main)",
                fontSize: "0.9rem"
              }}
            >
              <option value="llama3.2">Ollama - Llama 3.2 (Default Local)</option>
              <option value="mistral">Ollama - Mistral 7B</option>
              <option value="all-minilm">SentenceTransformer Direct</option>
            </select>
          </div>

          {/* API Base Endpoint URL */}
          <div>
            <label style={{ display: "block", fontWeight: "600", fontSize: "0.88rem", marginBottom: "6px" }}>
              FastAPI Endpoint URL
            </label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--bg-input)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-main)",
                fontSize: "0.9rem",
                fontFamily: "var(--font-mono)"
              }}
            />
          </div>

          {/* Demo Fallback Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "12px" }}>
            <div>
              <strong style={{ fontSize: "0.9rem", display: "block" }}>Demo / Mock Simulation Mode</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Simulate RAG answers when local Ollama is offline</span>
            </div>
            <input
              type="checkbox"
              checked={settings.useMockMode}
              onChange={(e) => setSettings({ ...settings, useMockMode: e.target.checked })}
              style={{ width: "18px", height: "18px", accentColor: "var(--accent-indigo)" }}
            />
          </div>

          {/* System Prompt Customization */}
          <div>
            <label style={{ display: "block", fontWeight: "600", fontSize: "0.88rem", marginBottom: "6px" }}>
              Custom System Prompt Instructions
            </label>
            <textarea
              rows={3}
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                background: "var(--bg-input)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                fontFamily: "var(--font-body)",
                resize: "vertical"
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--glass-border)", paddingTop: "14px" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onSave} className="btn btn-primary">
            <Save size={16} />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
