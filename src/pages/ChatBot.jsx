import { useState, useEffect, useRef } from "react";

// ==========================================
// SYSTEM CONFIGURATION
// ==========================================
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

const cleanNumericString = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const getUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.name?.split(" ")[0] || "Friend";
  } catch (_) {
    return "Friend";
  }
};

const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.id || user?.user_id || 1;
  } catch (_) {
    return 1;
  }
};

const QUICK_CHIPS = [
  { label: "💸 Spent ₹450 on Lunch", text: "Spent ₹450 on lunch" },
  { label: "💵 Salary ₹45,000 Received", text: "Salary ₹45000 received" },
  { label: "📋 Plan My Finances", text: "Make a personalized financial plan for me" },
  { label: "🎯 Save ₹50,000 for Emergency", text: "Create a goal to save ₹50,000 for emergency fund in 6 months" },
  { label: "📊 Set ₹5,000 Food Budget", text: "Set monthly budget for food to ₹5,000" },
  { label: "🗑️ Delete Last Transaction", text: "Delete last transaction" },
  { label: "💳 What is my balance?", text: "What is my current balance and financial status?" },
];

function ChatBot({
  transactions: propTransactions,
  setTransactions: propSetTransactions,
  totalIncome: dashboardTotalIncome,
  totalExpenses: dashboardTotalExpenses,
  netSavings: dashboardNetSavings,
}) {
  const [userName, setUserName] = useState(() => getUserName());
  const [messages, setMessages] = useState(() => {
    const name = getUserName();
    return [
      {
        who: "ai",
        text: `👋 Namaste ${name}! Main AmiVest AI financial co-pilot hoon.\n\nMain aapke backend database se directly connected hoon:\n• 💸 **Kharche jod sakte hain:** 'Spent ₹450 on lunch'\n• 💵 **Income record karein:** 'Salary ₹40,000 received'\n• 🗑️ **Transactions delete karein:** 'Delete last transaction'\n• 🎯 **Goals banayein:** 'Save ₹50,000 for emergency'\n• 📋 **Personalized plan:** 'Plan my finances'\n\nAap Hindi, English ya Hinglish me baat kar sakte hain! 💰`,
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localTransactions, setLocalTransactions] = useState([]);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, success, error
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Sync user name if localStorage updates
  useEffect(() => {
    setUserName(getUserName());
  }, []);

  const calculateFinancials = (items) => {
    let income = 0;
    let expenses = 0;

    items.forEach((t) => {
      const rawAmount = t.amount !== undefined ? t.amount : (t.value || 0);
      const numericAmount = cleanNumericString(rawAmount);
      const amount = Math.abs(numericAmount);
      const rawType = String(t.type || "").toLowerCase().trim();

      const isCredit = numericAmount > 0 || rawType === "credit" || rawType === "income";

      if (isCredit) {
        income += amount;
      } else {
        expenses += amount;
      }
    });

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: income - expenses,
    };
  };

  const usingDashboardValues =
    dashboardTotalIncome !== undefined &&
    dashboardTotalExpenses !== undefined &&
    dashboardNetSavings !== undefined;

  const fallbackCalc = calculateFinancials(localTransactions);

  const totalIncome = usingDashboardValues ? dashboardTotalIncome : fallbackCalc.totalIncome;
  const totalExpenses = usingDashboardValues ? dashboardTotalExpenses : fallbackCalc.totalExpenses;
  const netSavings = usingDashboardValues ? dashboardNetSavings : fallbackCalc.netSavings;

  const syncTransactions = async () => {
    setSyncStatus("syncing");

    try {
      const response = await fetch(`${API_BASE}/transactions`, { method: "GET", credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        let fetchedList = [];

        if (Array.isArray(data)) {
          fetchedList = data;
        } else if (data.transactions && Array.isArray(data.transactions)) {
          fetchedList = data.transactions;
        }

        if (fetchedList.length >= 0) {
          setLocalTransactions(fetchedList);
          localStorage.setItem("amivest_transactions", JSON.stringify(fetchedList));
          localStorage.setItem("transactions", JSON.stringify(fetchedList));

          if (propSetTransactions) {
            propSetTransactions(fetchedList);
          }
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2500);
          return;
        }
      }
      throw new Error("Invalid structure from endpoint");
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  useEffect(() => {
    if (propTransactions && propTransactions.length > 0) {
      setLocalTransactions(propTransactions);
      return;
    }
    syncTransactions();
  }, [propTransactions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speakMessage = (text, index) => {
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingIndex(null);

      const cleanText = text.replace(/[👋💰❌🤖📊🎯📈⚖💸🛡*`#_•]/g, "").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();

      const isHindi = /[\u0900-\u097F]/.test(text) || /\b(main|aap|hai|hoon|bhi|kar|sakte|ho|ka|ke|ki|aur|karein|kharcha)\b/i.test(text);

      if (voices && voices.length > 0) {
        if (isHindi) {
          const hiVoice = voices.find((v) => v.lang.includes("hi-IN") || v.lang.includes("hi"));
          if (hiVoice) utterance.voice = hiVoice;
          utterance.lang = "hi-IN";
        } else {
          const enVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en-US") || v.lang.includes("en-GB"));
          if (enVoice) utterance.voice = enVoice;
          utterance.lang = "en-US";
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingIndex(index);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingIndex(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingIndex(null);
  };

  const send = async (overrideText) => {
    const question = typeof overrideText === "string" ? overrideText.trim() : input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { who: "user", text: question }]);
    if (typeof overrideText !== "string") {
      setInput("");
    }
    setLoading(true);

    const payload = {
      user_id: getCurrentUserId(),
      user_name: userName,
      message: question,
      conversation_history: messages.slice(-6).map((m) => ({
        role: m.who === "user" ? "user" : "assistant",
        message: m.text,
      })),
      summary_context: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_savings: netSavings,
      },
    };

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server status: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.reply || data.response || data.message || "No response received.";

      setMessages((prev) => [
        ...prev,
        {
          who: "ai",
          text: aiResponse,
          action: data.action_performed,
        },
      ]);

      // If backend performed an action, auto sync ledger immediately!
      if (data.action_performed) {
        syncTransactions();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          who: "ai",
          text: `❌ Connection error: ${err.message}. Please verify the backend is running.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "var(--text-h)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🤖</span> AmiVest AI Financial Assistant
          </h1>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px" }}>
            Personalized co-pilot with direct access to your financial ledger & goals
          </div>
        </div>

        <button
          onClick={syncTransactions}
          disabled={syncStatus === "syncing"}
          style={{
            background: syncStatus === "syncing" ? "var(--surface-soft)" : "linear-gradient(90deg, var(--primary), var(--primary-accent))",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "12px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {syncStatus === "syncing" && "🔄 Syncing Ledger..."}
          {syncStatus === "success" && "✅ Ledger Synced!"}
          {syncStatus === "error" && "⚠️ Sync Error"}
          {syncStatus === "idle" && "🔄 Sync Dashboard Data"}
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", minHeight: "75vh" }}>
        {/* Chat Box Shell */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "18px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
            transition: "all 0.28s ease",
          }}
        >
          {/* Chat Window Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              background: "var(--surface-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-accent))",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: "#fff",
                  boxShadow: "0 2px 8px var(--glow)",
                }}
              >
                ✦
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-h)" }}>AmiVest AI Co-Pilot</div>
                <div style={{ fontSize: "11px", color: "#10B981", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                  Connected to Database • Live Mode
                </div>
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "var(--muted)", background: "var(--surface)", padding: "4px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
              User: <strong style={{ color: "var(--text-h)" }}>{userName}</strong>
            </div>
          </div>

          {/* Message Stream */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.who === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "14px 18px",
                    borderRadius: "16px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    background: m.who === "user" ? "linear-gradient(135deg, var(--primary-accent), var(--primary))" : "var(--surface-soft)",
                    color: m.who === "user" ? "#FFFFFF" : "var(--text-h)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {m.text}

                  {/* Visual Action Confirmation Card */}
                  {m.action && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {m.action.type === "add_expense" && <span style={{ fontSize: "16px" }}>💸</span>}
                        {m.action.type === "add_income" && <span style={{ fontSize: "16px" }}>💵</span>}
                        {m.action.type === "delete_transaction" && <span style={{ fontSize: "16px" }}>🗑️</span>}
                        {m.action.type === "add_goal" && <span style={{ fontSize: "16px" }}>🎯</span>}
                        {m.action.type === "set_budget" && <span style={{ fontSize: "16px" }}>📊</span>}
                        {m.action.type === "plan" && <span style={{ fontSize: "16px" }}>📋</span>}
                        <div>
                          <strong style={{ color: "var(--text-h)" }}>Backend Action Executed: </strong>
                          <span style={{ color: "var(--primary-accent)", textTransform: "capitalize" }}>
                            {m.action.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {m.action.type === "add_expense" && (
                        <button
                          onClick={() => send("Delete last transaction")}
                          style={{
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#EF4444",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          Undo ✕
                        </button>
                      )}
                    </div>
                  )}

                  {/* Speech button */}
                  {m.who === "ai" && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={() => speakMessage(m.text, i)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          background: isSpeaking && speakingIndex === i ? "var(--surface)" : "var(--surface)",
                          border: isSpeaking && speakingIndex === i ? "1px solid var(--primary-accent)" : "1px solid var(--border)",
                          color: isSpeaking && speakingIndex === i ? "var(--primary-accent)" : "var(--muted)",
                          borderRadius: "6px",
                          padding: "4px 10px",
                          fontSize: "11px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          transition: "all 0.2s",
                        }}
                      >
                        {isSpeaking && speakingIndex === i ? "🔊 Speaking..." : "🔊 Listen"}
                      </button>

                      {isSpeaking && speakingIndex === i && (
                        <button
                          onClick={stopSpeaking}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            color: "#EF4444",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          ⏹ Stop
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "var(--surface-soft)",
                    border: "1px solid var(--border)",
                    padding: "12px 18px",
                    borderRadius: "14px",
                    color: "var(--muted)",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span className="av-pulse">⏳</span> AmiVest AI is accessing backend & processing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div
            style={{
              padding: "8px 18px",
              borderTop: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => send(chip.text)}
                style={{
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  borderRadius: "999px",
                  padding: "5px 12px",
                  fontSize: "11.5px",
                  color: "var(--text-h)",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary-accent)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: "16px 18px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "10px",
              background: "var(--surface-soft)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type anything (e.g. 'Spent ₹350 on petrol' or 'Plan my month')..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-h)",
                fontSize: "14px",
                outline: "none",
              }}
            />

            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: !input.trim() || loading ? "var(--surface)" : "linear-gradient(90deg, var(--primary), var(--primary-accent))",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 22px",
                color: !input.trim() || loading ? "var(--muted)" : "#fff",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: !input.trim() || loading ? "default" : "pointer",
                transition: "all 0.18s ease",
                boxShadow: !input.trim() || loading ? "none" : "var(--shadow-sm)",
              }}
            >
              Send ➤
            </button>
          </div>
        </div>

        {/* Live Dashboard HUD Sidebar */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "18px",
            padding: "20px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all 0.28s ease",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "16px" }}>
              <h3 style={{ color: "var(--text-h)", fontSize: "16px", margin: 0 }}>
                📊 Live Dashboard HUD
              </h3>
              <span style={{ fontSize: "10px", color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "999px", fontWeight: "700" }}>
                LIVE SYNC
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div style={{ background: "var(--surface-soft)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border)", borderLeft: "4px solid #10B981" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "700" }}>
                  TOTAL DEPOSITS (INCOME)
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>
                  ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>

              <div style={{ background: "var(--surface-soft)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border)", borderLeft: "4px solid #EF4444" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "700" }}>
                  TOTAL OUTFLOWS (EXPENSES)
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#EF4444", marginTop: "4px" }}>
                  ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>

              <div style={{ background: "var(--surface-soft)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border)", borderLeft: "4px solid #38BDF8" }}>
                <div style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: "700" }}>
                  NET WALLET SURPLUS
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#38BDF8", marginTop: "4px" }}>
                  ₹{netSavings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            <h4 style={{ color: "var(--text-h)", fontSize: "13px", marginBottom: "8px", fontWeight: "700" }}>Supported Voice / Text Commands:</h4>
            <ul style={{ color: "var(--muted)", fontSize: "12px", lineHeight: "1.7", paddingLeft: "18px", margin: 0 }}>
              <li><strong>Add Expense:</strong> <em>"Spent ₹350 on petrol"</em></li>
              <li><strong>Add Income:</strong> <em>"Salary ₹45,000 received"</em></li>
              <li><strong>Delete:</strong> <em>"Delete last transaction"</em></li>
              <li><strong>Goals:</strong> <em>"Save ₹50,000 for laptop"</em></li>
              <li><strong>Budget:</strong> <em>"Set ₹4,000 dining budget"</em></li>
              <li><strong>Planning:</strong> <em>"Plan my finances"</em></li>
            </ul>
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", color: "var(--muted)", fontSize: "11px", textAlign: "center" }}>
            AmiVest AI • Backend Integrated Engine
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;