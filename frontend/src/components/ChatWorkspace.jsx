import React, { useRef, useEffect } from "react";
import {
  Send, User, Bot, Sparkles, BookOpen,
  Copy, Check, FileText, HelpCircle, Zap, Bookmark
} from "lucide-react";

export default function ChatWorkspace({
  messages, question, setQuestion,
  onSendMessage, loading, onOpenSourceDrawer, onSelectPromptSuggestion
}) {
  const chatEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const promptSuggestions = [
    { label: "Summarize main concepts from uploaded PDF slides", icon: FileText, text: "Can you provide a comprehensive summary of the main concepts in my uploaded PDF lecture slides?" },
    { label: "Generate 5 practice quiz questions with answers", icon: HelpCircle, text: "Generate 5 multiple-choice quiz questions based on the uploaded lecture materials with explanations." },
    { label: "List all key formulas, equations, and definitions", icon: Zap, text: "Please list all key formulas, equations, definitions, and technical terms mentioned in the documents." },
    { label: "Explain the most complex topic in simple terms", icon: BookOpen, text: "Identify the most complex technical topic in the uploaded slides and explain it simply step-by-step." }
  ];

  return (
    <>
      {/* Scrollable messages */}
      <div className="chat-messages">
        {messages.length === 0 && !loading ? (
          <div className="empty-chat-hero">
            <div className="hero-icon-ring"><Sparkles size={36} /></div>
            <div>
              <h3 className="hero-title">
                What would you like to <span className="gradient-text">master today?</span>
              </h3>
              <p className="hero-desc">
                Upload your lecture PDFs in the sidebar to ask questions, extract key takeaways, or click a quick prompt starter below.
              </p>
            </div>
            <div className="prompt-suggestions">
              {promptSuggestions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button key={idx} className="suggestion-pill" onClick={() => onSelectPromptSuggestion(item.text)}>
                    <Icon size={18} className="pill-icon" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="messages-stream">
            <div className="messages-spacer" />
            {messages.map((m, i) => (
              <div key={i} className={`msg-row ${m.role}`}>
                <div className="msg-avatar">
                  {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="msg-bubble-wrapper">
                  <div className="msg-bubble"><p>{m.text}</p></div>
                  {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                    <div className="citation-box">
                      <div className="citation-header"><Bookmark size={12} /><span>Cited Sources ({m.sources.length}):</span></div>
                      <div className="citation-tags">
                        {m.sources.map((src, sIdx) => (
                          <span key={sIdx} className="citation-chip" onClick={() => onOpenSourceDrawer(src, m.text)}>
                            <FileText size={12} /><span>{src}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="msg-actions">
                    <span>{m.time}</span>
                    {m.role === "assistant" && (
                      <button className="msg-action-btn" onClick={() => copyToClipboard(m.text, i)} title="Copy response">
                        {copiedIndex === i ? <Check size={14} style={{ color: "var(--accent-emerald)" }} /> : <Copy size={14} />}
                        <span>{copiedIndex === i ? "Copied" : "Copy"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="msg-row assistant">
                <div className="msg-avatar"><Bot size={18} /></div>
                <div className="msg-bubble typing-dots">
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar with explicit background glass style to override underlying container blocks */}
      <div 
        className="chat-input-wrapper" 
        style={{ background: "rgba(7, 9, 14, 0.85)", backdropFilter: "blur(12px)" }}
      >
        <div className="chat-input-inner">
          <input
            type="text"
            className="chat-input-field"
            placeholder="Ask a question about your PDF lecture slides..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={() => onSendMessage()}
            disabled={!question.trim() || loading}
            className="send-btn-round"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}