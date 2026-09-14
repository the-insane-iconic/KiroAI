import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  ask:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  vault:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mission: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  finance: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  invest:  "M23 6l-9.5 9.5-5-5L1 18",
  biz:     "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z",
  loan:    "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  tax:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6",
  plus:    "M12 5v14M5 12h14",
  arrow:   "M5 12h14M12 5l7 7-7 7",
  edit:    "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  goal:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  home:    "M3 9.5L12 3l9 6.5V21H3V9.5z",
  trash:   "M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2",
};

// ── Greeting helpers ───────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return "Working late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function getDate() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

// ── Vault Progress Ring ────────────────────────────────────────────────────────
function VaultRing({ pct, size = 48 }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "var(--success)" : pct >= 40 ? "var(--accent)" : "var(--warning)";
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={3.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color, fontFamily: "var(--font-display)" }}>
        {pct}%
      </div>
    </div>
  );
}

// ── MISSION TYPE CONFIGS ───────────────────────────────────────────────────────
const MISSION_COLORS = {
  home:       { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", icon: "🏠", color: "#10b981" },
  investment: { bg: "rgba(6,182,212,0.08)",  border: "rgba(6,182,212,0.25)",  icon: "📈", color: "#06b6d4" },
  startup:    { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", icon: "🚀", color: "#8b5cf6" },
  retirement: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "🌅", color: "#f59e0b" },
  loan:       { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", icon: "🏦", color: "#6366f1" },
  education:  { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  icon: "🎓", color: "#ef4444" },
  other:      { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.25)", icon: "🎯", color: "#6366f1" },
};

// ── Kiro Standing Recommendation ───────────────────────────────────────────────
function KiroRecommendation({ vault, completeness, navigate }) {
  const income = Number(vault.finances.monthlyIncome) || 0;
  const expenses = Number(vault.finances.monthlyExpenses) || 0;
  const emergency = vault.finances.emergencyFundMonths;
  const goals = vault.goals;
  const risk = vault.risk;

  // Build recommendation based on vault data
  let title = "Kiro's Standing Recommendation";
  let message = "";
  let action = "";
  let actionPath = "";
  let icon = "💡";

  if (completeness < 30) {
    icon = "📋";
    message = "Your Vault is mostly empty. Kiro works best when it knows your income, expenses, and goals. Complete your profile for personalized, calculated guidance — not generic advice.";
    action = "Complete Your Vault →";
    actionPath = "/vault";
  } else if (!emergency || emergency === "0" || emergency === "1" || emergency === "2") {
    const missing = income > 0 ? `${6 - Number(emergency || 0)} more months` : "an emergency fund";
    icon = "🛡️";
    message = `Your emergency fund covers only ${emergency || "0"} months of expenses. The standard rule is 6 months. A financial shock without a buffer forces you to liquidate investments at the worst time — often at a loss.`;
    action = "Build a 90-day emergency plan →";
    actionPath = "/chat";
  } else if (goals.length === 0) {
    icon = "🎯";
    message = `You have a solid income of ₹${income.toLocaleString("en-IN")}/month but no defined financial mission. Without a goal, savings drift into lifestyle inflation. Tell Kiro what you want to achieve.`;
    action = "Add your first goal →";
    actionPath = "/vault";
  } else if (income > 0 && expenses > 0) {
    const savings = income - expenses;
    const savingsRate = ((savings / income) * 100).toFixed(0);
    icon = "📊";
    message = `You're saving ₹${savings.toLocaleString("en-IN")}/month (${savingsRate}% savings rate). ${Number(savingsRate) < 20 ? "The 50-30-20 rule suggests 20% minimum — you may be leaving wealth-building potential on the table." : "That's a healthy rate. The next step is optimizing where that money goes."} Want Kiro to run the numbers?`;
    action = `Optimize my ${income ? "₹" + savings.toLocaleString("en-IN") : ""} monthly savings →`;
    actionPath = "/chat";
  } else {
    icon = "📈";
    message = risk
      ? `As a ${risk} investor, your current portfolio allocation may not be optimized. Want Kiro to analyze and compare asset allocation strategies for your profile?`
      : "Tell Kiro your risk tolerance and goals, and it will build a personalized investment comparison — from SIP stepping to tax-efficient strategies.";
    action = "Run investment analysis →";
    actionPath = "/investments";
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--accent-soft) 0%, var(--violet-soft) 100%)",
      border: "1px solid var(--glass-border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px 22px",
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
      animation: "fadeSlideUp 0.5s both",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 100, height: 100,
        borderRadius: "50%", background: "var(--accent-soft)", filter: "blur(30px)", pointerEvents: "none",
      }} />

      <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-text)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          {title}
        </div>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, margin: "0 0 14px", fontWeight: 400 }}>
          {message}
        </p>
        <button
          onClick={() => navigate(actionPath)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: "var(--radius-sm)",
            background: "var(--accent)", color: "#fff",
            fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
            transition: "all var(--anim-medium)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.transform = "none"; }}
        >
          {action}
          <Icon d={ICONS.arrow} size={13} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

// ── Prompt suggestions ─────────────────────────────────────────────────────────
const ALL_SUGGESTIONS = [
  { icon: "📊", text: "Analyze my monthly spending and identify budget leaks", category: "finance" },
  { icon: "🚀", text: "Build a 90-day execution roadmap for my startup idea", category: "business" },
  { icon: "🏛️", text: "Check my eligibility for MUDRA Kishore and PMEGP loan subsidy", category: "loan" },
  { icon: "🎯", text: "Create a SIP plan to build a ₹50 Lakh portfolio in 8 years", category: "invest" },
  { icon: "🧾", text: "Compare Old vs New Tax Regime for my income and deductions", category: "tax" },
  { icon: "📈", text: "How will the latest RBI repo rate revision impact home loans?", category: "rbi" },
  { icon: "🏠", text: "Plan my home purchase — down payment, EMI vs rent analysis", category: "invest" },
  { icon: "💼", text: "Calculate unit economics and break-even for my business idea", category: "business" },
  { icon: "🛡️", text: "Build a 6-month emergency fund plan starting from scratch", category: "finance" },
  { icon: "📉", text: "Restructure my debt to reduce EMI burden and interest outflow", category: "loan" },
];

const CATS = [
  { key: "all", label: "All" },
  { key: "finance", label: "💰 Finance" },
  { key: "invest", label: "📈 Invest" },
  { key: "business", label: "🚀 Business" },
  { key: "loan", label: "🏛️ Loans" },
  { key: "tax", label: "🧾 Tax" },
];

// ── Mission Card ───────────────────────────────────────────────────────────────
function MissionCard({ mission, onDelete, navigate }) {
  const cfg = MISSION_COLORS[mission.type] || MISSION_COLORS.other;
  return (
    <div
      className="mission-card"
      style={{ borderColor: cfg.border, background: cfg.bg }}
      onClick={() => navigate(`/chat/${mission.chatId || mission.id}`)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 3 }} className="truncate">
            {mission.title}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {mission.targetAmount
              ? `₹${Number(mission.targetAmount).toLocaleString("en-IN")} · `
              : ""}
            {mission.targetDate || "No deadline"} · {mission.status || "active"}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(mission.id); }}
          style={{ color: "var(--text-muted)", padding: 4, border: "none", background: "none", cursor: "pointer", opacity: 0.5, flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
          onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
        >
          <Icon d={ICONS.trash} size={13} />
        </button>
      </div>
      <div style={{
        marginTop: 10, height: 3, borderRadius: 99,
        background: "var(--border)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${Math.min(mission.progress || 15, 100)}%`,
          background: cfg.color, borderRadius: 99,
          transition: "width 1s ease",
        }} />
      </div>
    </div>
  );
}

// ── Module quick links ─────────────────────────────────────────────────────────
const MODULES = [
  { icon: "💳", label: "Finance",     path: "/finance",     color: "#6366f1" },
  { icon: "📈", label: "Investments", path: "/investments", color: "#06b6d4" },
  { icon: "🏛️", label: "Loans",      path: "/loan",        color: "#10b981" },
  { icon: "🧾", label: "Tax",         path: "/tax",         color: "#f59e0b" },
  { icon: "🚀", label: "Launchpad",   path: "/launchpad",   color: "#8b5cf6" },
  { icon: "🏢", label: "Business",    path: "/business",    color: "#ec4899" },
];

// ── Main Home ──────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { vault, completeness } = useVault();
  const textareaRef = useRef(null);

  const [input, setInput] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [missions, setMissions] = useState([]);
  const [vaultGoalMissions, setVaultGoalMissions] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const m = JSON.parse(localStorage.getItem("kiro_missions") || "[]");
      setMissions(m);
    } catch { setMissions([]); }
  }, []);

  // Build "missions" from vault goals
  useEffect(() => {
    setVaultGoalMissions(vault.goals.map(g => ({
      id: g.id,
      title: g.title,
      type: g.type || "other",
      targetAmount: g.targetAmount,
      targetDate: g.targetDate,
      status: "planning",
      progress: g.priority === "high" ? 35 : 15,
    })));
  }, [vault.goals]);

  const allMissions = [...missions, ...vaultGoalMissions].slice(0, 6);

  const deleteMission = (id) => {
    const updated = missions.filter(m => m.id !== id);
    setMissions(updated);
    localStorage.setItem("kiro_missions", JSON.stringify(updated));
    // also try vault goals
    const updatedGoals = vaultGoalMissions.filter(m => m.id !== id);
    setVaultGoalMissions(updatedGoals);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const id = `chat_${Date.now()}`;
    navigate("/chat", { state: { initialQuery: input.trim() } });
  };

  const handleSuggestion = (text) => {
    navigate("/chat", { state: { initialQuery: text } });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [input]);

  const suggestions = catFilter === "all"
    ? ALL_SUGGESTIONS.slice(0, 6)
    : ALL_SUGGESTIONS.filter(s => s.category === catFilter).slice(0, 6);

  const userName = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").name?.split(" ")[0] || ""; } catch { return ""; }
  })();

  return (
    <div style={{
      flex: 1,
      overflowY: "auto",
      background: "var(--bg)",
    }}>
      <div style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "36px 24px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}>

        {/* ── Header ── */}
        <div style={{ animation: "fadeSlideUp 0.4s both" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{
                fontSize: 26, fontFamily: "var(--font-display)", fontWeight: 800,
                color: "var(--text)", lineHeight: 1.2, marginBottom: 4,
              }}>
                {getGreeting()}{userName ? `, ${userName}` : ""}. 👋
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>{getDate()}</p>
            </div>

            {/* Vault completeness */}
            <div
              onClick={() => navigate("/vault")}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: "var(--radius)",
                border: "1px solid var(--border)", background: "var(--surface)",
                cursor: "pointer", transition: "all var(--anim-medium)", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-soft)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
            >
              <VaultRing pct={completeness} size={44} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 1 }}>
                  {completeness < 40 ? "🔴" : completeness < 80 ? "🟡" : "🟢"} Financial Vault
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {completeness < 40 ? "Needs attention" : completeness < 80 ? "Good progress" : "Comprehensive"} · Click to edit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Kiro Standing Recommendation ── */}
        <div style={{ animation: "fadeSlideUp 0.5s both", animationDelay: "60ms" }}>
          <KiroRecommendation vault={vault} completeness={completeness} navigate={navigate} />
        </div>

        {/* ── Active Missions ── */}
        {allMissions.length > 0 && (
          <section style={{ animation: "fadeSlideUp 0.5s both", animationDelay: "120ms" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 2 }}>
                  Active Missions
                </h2>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Goal threads Kiro is tracking for you</p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("/vault")}
              >
                <Icon d={ICONS.plus} size={13} /> Add Goal
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
              {allMissions.map(m => (
                <MissionCard key={m.id} mission={m} onDelete={deleteMission} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* ── Command Prompt ── */}
        <section style={{ animation: "fadeSlideUp 0.5s both", animationDelay: "180ms" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 12 }}>
            What's your mission today?
          </h2>
          <div className="prompt-input-wrapper" style={{ borderRadius: "var(--radius-lg)" }}>
            <textarea
              ref={textareaRef}
              id="home-prompt-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tell Kiro what you want to do with your money, business, or investments…"
              rows={2}
              style={{
                width: "100%",
                padding: "16px 18px",
                border: "none", outline: "none",
                background: "transparent",
                resize: "none",
                fontSize: 15,
                color: "var(--text)",
                lineHeight: 1.6,
                fontFamily: "var(--font)",
                maxHeight: 150,
                overflowY: "auto",
              }}
            />
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderTop: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {completeness > 30 ? `🧠 Using your vault: ${vault.profile.name || "profile"}` : "💡 Complete your vault for smarter answers"}
              </span>
              <button
                id="home-send-btn"
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: "var(--radius-sm)",
                  background: input.trim() ? "var(--accent)" : "var(--bg-tertiary)",
                  border: "none", cursor: input.trim() ? "pointer" : "default",
                  color: input.trim() ? "#fff" : "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all var(--anim-fast)",
                  boxShadow: input.trim() ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
                }}
              >
                <Icon d={ICONS.send} size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>

        {/* ── Suggestions ── */}
        <section style={{ animation: "fadeSlideUp 0.5s both", animationDelay: "240ms" }}>
          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 14, flexWrap: "nowrap" }}>
            {CATS.map(c => (
              <button
                key={c.key}
                onClick={() => setCatFilter(c.key)}
                style={{
                  padding: "5px 12px", borderRadius: 99,
                  border: `1.5px solid ${catFilter === c.key ? "var(--accent)" : "var(--border)"}`,
                  background: catFilter === c.key ? "var(--accent-soft)" : "var(--surface)",
                  color: catFilter === c.key ? "var(--accent-text)" : "var(--text-muted)",
                  fontSize: 12, fontWeight: catFilter === c.key ? 700 : 500,
                  cursor: "pointer", transition: "all var(--anim-fast)", flexShrink: 0,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="suggestion-chip"
                onClick={() => handleSuggestion(s.text)}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ textAlign: "left", lineHeight: 1.4 }}>{s.text}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Quick Module Links ── */}
        <section style={{ animation: "fadeSlideUp 0.5s both", animationDelay: "300ms" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Specialist Tools
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
            {MODULES.map(m => (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "16px 12px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  cursor: "pointer",
                  transition: "all var(--anim-medium)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = m.color + "60";
                  e.currentTarget.style.background = m.color + "10";
                  e.currentTarget.style.color = "var(--text)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Vault CTA (only if incomplete) ── */}
        {completeness < 60 && (
          <div
            onClick={() => navigate("/vault")}
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius)",
              border: "1px dashed var(--accent)",
              background: "var(--accent-soft)",
              display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer",
              transition: "all var(--anim-medium)",
              animation: "fadeSlideUp 0.5s 360ms both",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--accent-soft)"; e.currentTarget.style.transform = "none"; }}
          >
            <span style={{ fontSize: 28 }}>🗄️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-text)", marginBottom: 3 }}>
                Complete your Financial Vault ({completeness}% done)
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Kiro's advice becomes 10× more specific when it knows your income, goals, and risk profile. Takes 3 minutes.
              </div>
            </div>
            <Icon d={ICONS.arrow} size={18} strokeWidth={2} style={{ color: "var(--accent)", flexShrink: 0 }} />
          </div>
        )}

      </div>
    </div>
  );
}
