import React from "react";
import { useNavigate } from "react-router-dom";
import { useVault } from "../../context/VaultContext";

// ── Kiro Context Bar + Chat FAB ────────────────────────────────────────────────
// Drop this at the top of any feature page for vault context awareness

function Icon({ d, size = 14, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/**
 * KiroContextBar — Shows the user's vault data at a glance
 * and links to the chat with optional pre-seeded query.
 *
 * @param {string}  pageName  - Name of the current page, e.g. "Finance Dashboard"
 * @param {string}  seedQuery - Optional pre-seeded query to open in chat
 */
export function KiroContextBar({ pageName = "", seedQuery = "" }) {
  const navigate = useNavigate();
  const { vault, completeness } = useVault();

  const parts = [];
  if (vault.finances.monthlyIncome)  parts.push(`₹${Number(vault.finances.monthlyIncome).toLocaleString("en-IN")} income`);
  if (vault.goals.length)            parts.push(`${vault.goals.length} mission${vault.goals.length > 1 ? "s" : ""}`);
  if (vault.risk)                    parts.push(`${vault.risk} risk`);
  if (vault.profile.city)            parts.push(vault.profile.city);

  const openChat = () => {
    const query = seedQuery || (pageName ? `Help me understand and optimize my ${pageName.toLowerCase()}` : "");
    navigate("/chat", query ? { state: { initialQuery: query } } : {});
  };

  if (completeness < 10) return null;

  return (
    <div className="kiro-context-bar" style={{ marginBottom: 0 }}>
      <span style={{ fontWeight: 700, opacity: 1, fontSize: 12 }}>🧠 Kiro sees:</span>
      {parts.length > 0 ? (
        <span style={{ fontSize: 12, opacity: 0.95 }}>{parts.join(" · ")}</span>
      ) : (
        <span style={{ fontSize: 12 }}>Vault connected</span>
      )}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button
          onClick={() => navigate("/vault")}
          style={{
            padding: "3px 10px", borderRadius: 4,
            border: "1px solid rgba(99,102,241,0.3)",
            background: "none", color: "var(--accent-text)",
            cursor: "pointer", fontSize: 11, fontWeight: 600,
          }}
        >
          Edit Vault
        </button>
        <button
          onClick={openChat}
          style={{
            padding: "3px 10px", borderRadius: 4,
            background: "var(--accent)", color: "#fff",
            border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" size={11} />
          Ask Kiro
        </button>
      </div>
    </div>
  );
}

/**
 * KiroFAB — Floating action button to open Kiro chat
 * Place inside any page that wants a floating chat button.
 */
export function KiroFAB({ seedQuery = "", label = "💬" }) {
  const navigate = useNavigate();
  return (
    <button
      className="kiro-fab"
      onClick={() => navigate("/chat", seedQuery ? { state: { initialQuery: seedQuery } } : {})}
      title="Ask Kiro"
    >
      {label}
    </button>
  );
}

export default KiroContextBar;
