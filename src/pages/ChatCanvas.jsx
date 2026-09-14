import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { sendChat } from "../services/chatApi";
import { useVault } from "../context/VaultContext";

// ── Icons ──────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  send:    "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  copy:    "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2",
  check:   "M20 6L9 17l-5-5",
  attach:  "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  pin:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 7v1M12 12h.01",
  save:    "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8",
  vault:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  arrow:   "M5 12h14M12 5l7 7-7 7",
  edit:    "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
};

// ── Typing Indicator ───────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--accent), var(--violet))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 800, color: "#fff",
        boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
      }}>K</div>
      <div style={{
        display: "flex", gap: 5, padding: "10px 14px",
        background: "var(--bg-secondary)", borderRadius: "0 12px 12px 12px",
        border: "1px solid var(--border)",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

// ── Follow-up Suggestions ──────────────────────────────────────────────────────
function FollowUpChips({ onSelect }) {
  const CHIPS = [
    "Run the numbers for 12% annual return",
    "What if I start 6 months later?",
    "Show me the risk analysis",
    "Compare with a more conservative approach",
    "What's the tax impact of this?",
    "Explain this in simpler terms",
  ];
  // Pick 3 random each time
  const [chips] = useState(() => CHIPS.sort(() => 0.5 - Math.random()).slice(0, 3));
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, marginBottom: 4 }}>
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onSelect(chip)}
          style={{
            padding: "6px 12px", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--text-secondary)", fontSize: 12, fontWeight: 500,
            cursor: "pointer", transition: "all var(--anim-fast)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent-text)";
            e.currentTarget.style.background = "var(--accent-soft)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "var(--surface)";
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

// ── Save as Mission Dialog ─────────────────────────────────────────────────────
function SaveMissionDialog({ chatId, messageContent, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("other");

  const TYPES = [
    { v: "home", l: "🏠 Home Purchase" },
    { v: "investment", l: "📈 Investment" },
    { v: "startup", l: "🚀 Startup" },
    { v: "retirement", l: "🌅 Retirement" },
    { v: "loan", l: "🏦 Loan" },
    { v: "education", l: "🎓 Education" },
    { v: "other", l: "🎯 Other" },
  ];

  const save = () => {
    if (!title.trim()) return;
    const missions = JSON.parse(localStorage.getItem("kiro_missions") || "[]");
    missions.unshift({ id: `m_${Date.now()}`, title: title.trim(), type, chatId, createdAt: Date.now(), status: "active", progress: 10 });
    localStorage.setItem("kiro_missions", JSON.stringify(missions));
    onSave();
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div
        style={{
          background: "var(--surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)", padding: 24, width: "100%", maxWidth: 420,
          boxShadow: "var(--shadow-xl)",
          animation: "scaleIn 0.2s both",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4 }}>
          📌 Save as Mission
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
          This conversation thread will be saved as a tracked mission on your Home Command Center.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Mission Name</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Buy a home by 2027"
              autoFocus
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "var(--radius-sm)", border: "1px solid var(--border)",
                fontSize: 14, background: "var(--bg-secondary)", color: "var(--text)",
                outline: "none", fontFamily: "var(--font)",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Mission Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {TYPES.map(t => (
                <button key={t.v} onClick={() => setType(t.v)}
                  style={{
                    padding: "5px 11px", borderRadius: "var(--radius-sm)",
                    border: `1.5px solid ${type === t.v ? "var(--accent)" : "var(--border)"}`,
                    background: type === t.v ? "var(--accent-soft)" : "var(--surface)",
                    color: type === t.v ? "var(--accent-text)" : "var(--text-secondary)",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>📌 Save Mission</button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────
function Message({ role, content, timestamp, isLast, onFollowUp, chatId }) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [showSaveMission, setShowSaveMission] = useState(false);
  const [missionSaved, setMissionSaved] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{
          maxWidth: "72%",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)",
          padding: "12px 16px",
          fontSize: 14, color: "var(--text)", lineHeight: 1.65, whiteSpace: "pre-wrap",
        }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-start", animation: "fadeSlideUp 0.35s both" }}>
      {/* Kiro Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, var(--accent), var(--violet))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: "#fff",
        marginTop: 2,
        boxShadow: "0 2px 6px rgba(99,102,241,0.35)",
      }}>K</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Markdown */}
        <div className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={copy}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, color: "var(--text-muted)", fontWeight: 500,
              background: "none", border: "none", cursor: "pointer",
              padding: "3px 8px", borderRadius: 4,
              transition: "all var(--anim-fast)",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
          >
            <Icon d={copied ? ICONS.check : ICONS.copy} size={12} />
            {copied ? "Copied" : "Copy"}
          </button>

          {/* Save as Mission button */}
          {!missionSaved ? (
            <button onClick={() => setShowSaveMission(true)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "var(--accent-text)", fontWeight: 600,
                background: "var(--accent-soft)", border: "1px solid var(--accent-soft)",
                cursor: "pointer", padding: "3px 8px", borderRadius: 4,
                transition: "all var(--anim-fast)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.20)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--accent-soft)"}
            >
              <Icon d={ICONS.pin} size={12} /> Save as Mission
            </button>
          ) : (
            <span style={{ fontSize: 11, color: "var(--success)", fontWeight: 600, padding: "3px 8px" }}>
              ✓ Mission saved
            </span>
          )}

          {timestamp && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>
              {new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* Follow-up suggestions on last message */}
        {isLast && <FollowUpChips onSelect={onFollowUp} />}

        {showSaveMission && (
          <SaveMissionDialog
            chatId={chatId}
            messageContent={content}
            onSave={() => setMissionSaved(true)}
            onClose={() => setShowSaveMission(false)}
          />
        )}
      </div>
    </div>
  );
}

// ── Vault Context Banner ───────────────────────────────────────────────────────
function VaultContextBanner({ vault, completeness, navigate }) {
  if (completeness < 10) return null;
  const parts = [];
  if (vault.finances.monthlyIncome) parts.push(`₹${Number(vault.finances.monthlyIncome).toLocaleString("en-IN")} income`);
  if (vault.goals.length) parts.push(`${vault.goals.length} goal${vault.goals.length > 1 ? "s" : ""}`);
  if (vault.risk) parts.push(`${vault.risk} risk`);
  if (vault.profile.city) parts.push(vault.profile.city);
  if (!parts.length) return null;
  return (
    <div className="kiro-context-bar" style={{ margin: "0 24px 0", fontSize: 11 }}>
      <span style={{ fontWeight: 700, opacity: 1 }}>🧠 Kiro sees:</span>
      <span style={{ opacity: 0.9 }}>{parts.join(" · ")}</span>
      <button
        onClick={() => navigate("/vault")}
        style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 4, border: "none", background: "none", color: "var(--accent-text)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}
      >
        Edit Vault →
      </button>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ vault, completeness, navigate, onSuggestion }) {
  const QUICK_STARTS = [
    { icon: "📊", text: "Analyze my savings and suggest optimizations", cat: "finance" },
    { icon: "🎯", text: "Build a plan to reach my financial goal", cat: "invest" },
    { icon: "🚀", text: "Evaluate my startup idea with unit economics", cat: "business" },
    { icon: "🧾", text: "Compare tax regimes for my income level", cat: "tax" },
    { icon: "🏛️", text: "Check which government loan schemes I qualify for", cat: "loan" },
    { icon: "🏠", text: "Plan a home purchase — down payment and EMI strategy", cat: "invest" },
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 24px", maxWidth: 600, margin: "0 auto",
    }}>
      {/* Kiro intro */}
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), var(--violet))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, fontWeight: 900, color: "#fff",
        boxShadow: "var(--glow-accent)",
        marginBottom: 16,
        animation: "breathe 3s ease-in-out infinite",
      }}>K</div>

      <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", textAlign: "center", marginBottom: 8 }}>
        Start a new mission
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", textAlign: "center", maxWidth: 380, lineHeight: 1.65, marginBottom: 24 }}>
        Tell Kiro what you want to accomplish. It will research, calculate, compare options, and guide you from zero to a confident decision.
      </p>

      {/* Vault summary if filled */}
      {completeness > 20 && (
        <div style={{
          width: "100%", padding: "12px 16px", marginBottom: 20,
          background: "var(--accent-soft)", borderRadius: "var(--radius)",
          border: "1px solid var(--glass-border)", fontSize: 13,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>🧠</span>
          <span style={{ color: "var(--text)", fontWeight: 500 }}>
            Kiro knows your profile ({completeness}% complete). Responses will be personalized to your situation.
          </span>
          <button onClick={() => navigate("/vault")}
            style={{ marginLeft: "auto", fontSize: 11, color: "var(--accent-text)", fontWeight: 600, border: "none", background: "none", cursor: "pointer" }}>
            Edit →
          </button>
        </div>
      )}

      {/* Quick starts */}
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {QUICK_STARTS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 14px", borderRadius: "var(--radius)",
              border: "1px solid var(--border)", background: "var(--surface)",
              cursor: "pointer", textAlign: "left",
              transition: "all var(--anim-medium)",
              animation: `fadeSlideUp 0.4s ${i * 50}ms both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.background = "var(--accent-soft)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, fontWeight: 500 }}>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Chat Canvas ────────────────────────────────────────────────────────────────
export default function ChatCanvas() {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { vault, completeness, vaultContext } = useVault();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const [error, setError] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(chatId);

  // Generate a chat ID if new conversation
  useEffect(() => {
    if (!currentChatId) {
      setCurrentChatId(`chat_${Date.now()}`);
    }
  }, []);

  // Load existing chat
  useEffect(() => {
    if (!chatId) return;
    try {
      const chats = JSON.parse(localStorage.getItem("kiro_chats") || "[]");
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setMessages(chat.messages || []);
        setChatTitle(chat.title || "");
      }
    } catch {}
  }, [chatId]);

  // Handle initial query from Home/suggestion
  useEffect(() => {
    const initialQuery = location.state?.initialQuery;
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
      window.history.replaceState({}, "");
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const persistMessages = useCallback((updatedMessages, title) => {
    const id = currentChatId || chatId;
    if (!id) return;
    try {
      const chats = JSON.parse(localStorage.getItem("kiro_chats") || "[]");
      const idx = chats.findIndex(c => c.id === id);
      if (idx >= 0) {
        chats[idx].messages = updatedMessages;
        if (title) chats[idx].title = title;
      } else {
        chats.unshift({ id, title: title || "Chat", messages: updatedMessages, createdAt: Date.now() });
      }
      localStorage.setItem("kiro_chats", JSON.stringify(chats));
    } catch {}
  }, [currentChatId, chatId]);

  const sendMessage = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setError(null);

    const userMsg = { role: "user", content: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const title = chatTitle || trimmed.slice(0, 60);
    if (!chatTitle) setChatTitle(title);

    setLoading(true);
    try {
      // Build history with vault context injected as system context
      const history = newMessages.slice(-12).map(m => ({ role: m.role, content: m.content }));

      // Inject vault context into the system message
      const systemContext = vaultContext
        ? `You are Kiro, an autonomous financial decision guide for Indian users. You research, calculate, compare, and explain financial decisions — you do NOT give investment advice. Always frame outputs as analysis and comparison, not recommendations.\n\n${vaultContext}`
        : `You are Kiro, an autonomous financial decision guide for Indian users. You research, calculate, compare, and explain financial decisions — you do NOT give investment advice.`;

      const result = await sendChat(trimmed, history.slice(0, -1), "finance", systemContext);
      const aiMsg = {
        role: "assistant",
        content: result.reply || result.response || "I couldn't process that request. Please try again.",
        timestamp: Date.now(),
      };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      persistMessages(finalMessages, title);
    } catch (err) {
      setError("Connection failed. Make sure the Kiro backend is running at http://127.0.0.1:5001");
      const errorMsg = {
        role: "assistant",
        content: "⚠️ I couldn't connect to the server. Please ensure the Kiro backend is running and try again.\n\n*Tip: Start the backend with `python app.py` or `uvicorn main:app`*",
        timestamp: Date.now(),
      };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      persistMessages(finalMessages, title);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>

      {/* ── Chat header ── */}
      {chatTitle && (
        <div style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border)",
          fontSize: 14, fontWeight: 600,
          color: "var(--text-secondary)",
          flexShrink: 0,
          background: "var(--bg)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ flex: 1 }} className="truncate">{chatTitle}</span>
          {messages.length > 0 && (
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {messages.length} messages
            </span>
          )}
        </div>
      )}

      {/* ── Vault context banner ── */}
      {!isEmpty && (
        <div style={{ padding: "8px 0 0" }}>
          <VaultContextBanner vault={vault} completeness={completeness} navigate={navigate} />
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 740, width: "100%", margin: "0 auto", flex: 1 }}>
          {isEmpty ? (
            <EmptyState
              vault={vault}
              completeness={completeness}
              navigate={navigate}
              onSuggestion={text => sendMessage(text)}
            />
          ) : (
            <>
              {messages.map((m, i) => (
                <Message
                  key={i}
                  role={m.role}
                  content={m.content}
                  timestamp={m.timestamp}
                  isLast={i === messages.length - 1 && m.role === "assistant"}
                  onFollowUp={text => sendMessage(text)}
                  chatId={currentChatId || chatId}
                />
              ))}
              {loading && <TypingIndicator />}
              {error && (
                <div style={{
                  padding: "12px 16px", borderRadius: "var(--radius-sm)",
                  background: "var(--danger-soft)", color: "var(--danger)",
                  fontSize: 13, marginBottom: 12, border: "1px solid rgba(239,68,68,0.15)",
                }}>
                  {error}
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg)",
        padding: "14px 24px 20px",
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div className="prompt-input-wrapper">
            <input ref={fileInputRef} type="file" style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx" />

            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={completeness > 30 ? `Message Kiro (using your vault profile)…` : "Message Kiro…"}
              rows={1}
              style={{
                width: "100%",
                padding: "14px 52px 14px 16px",
                border: "none", outline: "none",
                background: "transparent", resize: "none",
                fontSize: 14, color: "var(--text)", lineHeight: 1.6,
                fontFamily: "var(--font)", maxHeight: 200, overflowY: "auto",
              }}
            />

            <div style={{
              display: "flex", alignItems: "center",
              padding: "6px 10px", borderTop: "1px solid var(--border)", gap: 4,
            }}>
              {/* Attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 9px", borderRadius: "var(--radius-sm)",
                  fontSize: 12, color: "var(--text-muted)",
                  background: "none", border: "none", cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
                title="Attach document"
              >
                <Icon d={ICONS.attach} size={13} />
                Attach
              </button>

              {/* Vault shortcut */}
              <button
                onClick={() => navigate("/vault")}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 9px", borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  color: completeness > 30 ? "var(--accent-text)" : "var(--text-muted)",
                  background: completeness > 30 ? "var(--accent-soft)" : "none",
                  border: "none", cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                onMouseLeave={e => e.currentTarget.style.background = completeness > 30 ? "var(--accent-soft)" : "none"}
                title="Open financial vault"
              >
                <Icon d={ICONS.vault} size={13} />
                Vault {completeness > 0 ? `${completeness}%` : ""}
              </button>

              <div style={{ flex: 1 }} />

              {/* Send */}
              <button
                id="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 34, height: 34, borderRadius: "var(--radius-sm)",
                  background: input.trim() && !loading ? "var(--accent)" : "var(--bg-tertiary)",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all var(--anim-fast)",
                  boxShadow: input.trim() && !loading ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
                  flexShrink: 0,
                }}
                onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                {loading
                  ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  : <Icon d={ICONS.send} size={14} strokeWidth={2.2} />
                }
              </button>
            </div>
          </div>

          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            Kiro provides analysis and comparison, not financial advice. Verify important decisions independently.
          </p>
        </div>
      </div>
    </div>
  );
}
