import React, { useState } from "react";
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Sparkles, Award, ArrowRight } from "lucide-react";

export default function QuizGenerator({ onGenerateQuiz, isGenerating, quizQuestions }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qIdx, optionIdx) => {
    if (selectedOption[qIdx] !== undefined) return; // prevent re-selecting
    setSelectedOption((prev) => ({ ...prev, [qIdx]: optionIdx }));
  };

  const calculateScore = () => {
    if (!quizQuestions || quizQuestions.length === 0) return 0;
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedOption[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const handleResetQuiz = () => {
    setSelectedOption({});
    setCurrentIdx(0);
    setShowResults(false);
  };

  const currentQ = quizQuestions && quizQuestions.length > 0 ? quizQuestions[currentIdx] : null;

  return (
    <div className="quiz-container">
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "6px" }}>
          Interactive Practice Quiz <Sparkles size={18} style={{ color: "var(--accent-cyan)", display: "inline" }} />
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Test your comprehension with auto-generated practice questions derived directly from your lecture PDF chunks.
        </p>

        <button
          onClick={onGenerateQuiz}
          disabled={isGenerating}
          className="btn btn-primary"
          style={{ marginTop: "16px", padding: "10px 22px" }}
        >
          {isGenerating ? (
            <>
              <div className="dot" style={{ width: "6px", height: "6px" }} />
              <span>Generating Quiz Questions...</span>
            </>
          ) : (
            <>
              <HelpCircle size={18} />
              <span>Generate New Practice Quiz</span>
            </>
          )}
        </button>
      </div>

      {quizQuestions && quizQuestions.length > 0 && !showResults && currentQ && (
        <div className="quiz-card">
          {/* Header Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "14px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--accent-cyan)" }}>
              Question {currentIdx + 1} of {quizQuestions.length}
            </span>

            <div style={{ display: "flex", gap: "6px" }}>
              {quizQuestions.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    width: "28px",
                    height: "6px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    background:
                      idx === currentIdx
                        ? "var(--gradient-primary)"
                        : selectedOption[idx] !== undefined
                        ? "var(--accent-cyan)"
                        : "rgba(255, 255, 255, 0.1)"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Question Title */}
          <h4 style={{ fontSize: "1.15rem", fontWeight: "600", color: "var(--text-main)", lineHeight: "1.5" }}>
            {currentQ.question}
          </h4>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedOption[currentIdx] === oIdx;
              const isAnswered = selectedOption[currentIdx] !== undefined;
              const isCorrect = oIdx === currentQ.correctAnswer;

              let optionClass = "quiz-option";
              if (isAnswered) {
                if (isCorrect) optionClass += " correct";
                else if (isSelected) optionClass += " wrong";
              }

              return (
                <div
                  key={oIdx}
                  className={optionClass}
                  onClick={() => handleSelectOption(currentIdx, oIdx)}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      flexShrink: 0
                    }}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle size={18} style={{ color: "var(--accent-emerald)" }} />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={18} style={{ color: "var(--accent-rose)" }} />}
                </div>
              );
            })}
          </div>

          {/* Answer Explanation */}
          {selectedOption[currentIdx] !== undefined && (
            <div
              style={{
                marginTop: "10px",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "rgba(99, 102, 241, 0.1)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                fontSize: "0.88rem",
                color: "var(--text-main)"
              }}
            >
              <strong style={{ color: "var(--accent-cyan)", display: "block", marginBottom: "4px" }}>
                Explanation & Citation:
              </strong>
              {currentQ.explanation}
            </div>
          )}

          {/* Navigation Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="btn btn-secondary"
              style={{ padding: "8px 16px" }}
            >
              Previous
            </button>

            {currentIdx < quizQuestions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="btn btn-primary"
                style={{ padding: "8px 16px" }}
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowResults(true)}
                className="btn btn-primary"
                style={{ padding: "8px 16px" }}
              >
                <span>Complete Quiz</span>
                <Award size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Results Summary */}
      {showResults && (
        <div className="quiz-card" style={{ textAlign: "center", alignItems: "center" }}>
          <Award size={48} style={{ color: "var(--accent-cyan)" }} />
          <h3 style={{ fontSize: "1.6rem", fontWeight: "700" }}>Quiz Score Summary</h3>
          <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>
            {calculateScore()} / {quizQuestions.length}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {calculateScore() === quizQuestions.length
              ? "🎉 Outstanding! You mastered all lecture concepts."
              : "Great effort! Review the flashcards or re-read citations to reinforce weaker areas."}
          </p>
          <button onClick={handleResetQuiz} className="btn btn-secondary" style={{ marginTop: "12px" }}>
            <RotateCcw size={16} />
            <span>Retake Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
}
