import React, { useState } from "react";
import { Calculator, X, CornerDownLeft } from "lucide-react";

export default function CalculatorModal({ isOpen, onClose, onInsertToChat }) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  if (!isOpen) return null;

  const handleBtnClick = (val) => {
    if (val === "C") {
      setDisplay("0");
      setExpression("");
      return;
    }

    if (val === "DEL") {
      if (display.length > 1) {
        setDisplay(display.slice(0, -1));
      } else {
        setDisplay("0");
      }
      return;
    }

    if (val === "=") {
      try {
        let expr = (expression + display)
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/√/g, "Math.sqrt")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/log/g, "Math.log10")
          .replace(/\^/g, "**");

        // Safe eval replacement
        const result = Function(`"use strict"; return (${expr})`)();
        setExpression((expression + display + " ="));
        setDisplay(String(result));
      } catch {
        setDisplay("Error");
      }
      return;
    }

    // Mathematical Functions
    if (["sin", "cos", "tan", "log", "√"].includes(val)) {
      if (display === "0") setDisplay(val + "(");
      else setDisplay(display + val + "(");
      return;
    }

    // Operators
    if (["+", "-", "×", "÷", "^"].includes(val)) {
      setExpression((prev) => prev + display + " " + val + " ");
      setDisplay("0");
      return;
    }

    if (display === "0" || display === "Error") {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const buttons = [
    "sin", "cos", "tan", "log",
    "√", "^", "(", ")",
    "C", "DEL", "÷", "×",
    "7", "8", "9", "-",
    "4", "5", "6", "+",
    "1", "2", "3", "=",
    "0", "."
  ];

  return (
    <div style={{ position: "fixed", bottom: "90px", right: "30px", zIndex: 90 }}>
      <div className="calculator-modal">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calculator size={18} style={{ color: "var(--accent-cyan)" }} />
            <strong style={{ fontSize: "0.95rem" }}>Study Calculator</strong>
          </div>
          <X size={18} style={{ cursor: "pointer", color: "var(--text-muted)" }} onClick={onClose} />
        </div>

        {/* Screen Display */}
        <div className="calc-screen">
          <div className="calc-expression">{expression}</div>
          <div className="calc-value">{display}</div>
        </div>

        {/* Buttons Grid */}
        <div className="calc-grid">
          {buttons.map((btn, idx) => {
            const isOp = ["+", "-", "×", "÷", "^", "sin", "cos", "tan", "log", "√", "(", ")", "C", "DEL"].includes(btn);
            const isEquals = btn === "=";
            return (
              <button
                key={idx}
                className={`calc-btn ${isOp ? "op" : ""} ${isEquals ? "equals" : ""}`}
                onClick={() => handleBtnClick(btn)}
              >
                {btn}
              </button>
            );
          })}
        </div>

        {/* Action: Copy result to chat input */}
        <button
          onClick={() => onInsertToChat(`The calculated result is: ${display}`)}
          className="btn btn-secondary"
          style={{ width: "100%", padding: "8px", fontSize: "0.82rem" }}
        >
          <CornerDownLeft size={14} />
          <span>Insert Result into Chat</span>
        </button>
      </div>
    </div>
  );
}
