import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVault } from "../context/VaultContext";

// ── Icons ──────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16, strokeWidth = 1.8, fill = "none" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// ── Progress Ring ──────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, strokeWidth = 6 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "var(--warning)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color }}>{pct}%</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600, marginTop: -1 }}>COMPLETE</span>
      </div>
    </div>
  );
}

// ── Step Configs ───────────────────────────────────────────────────────────────
const STEPS = [
  { id: "profile",  label: "Identity",  icon: "👤", tip: "Your name and life stage help Kiro tailor advice to your specific situation." },
  { id: "finances", label: "Finances",  icon: "💰", tip: "Your income and expenses let Kiro calculate real numbers — not generic advice." },
  { id: "assets",   label: "Assets",    icon: "📦", tip: "Knowing what you already have helps Kiro suggest what's missing in your portfolio." },
  { id: "goals",    label: "Goals",     icon: "🎯", tip: "Kiro builds a custom roadmap toward each goal — from zero knowledge to a decision." },
  { id: "risk",     label: "Risk & Skills", icon: "⚡", tip: "Your risk tolerance determines what strategies Kiro will recommend." },
];

const STAGE_OPTIONS = [
  { value: "student", label: "📚 Student" },
  { value: "early-career", label: "🚀 Early Career (< 5 yrs)" },
  { value: "mid-career", label: "💼 Mid Career" },
  { value: "business-owner", label: "🏢 Business Owner" },
  { value: "pre-retirement", label: "🌅 Pre-Retirement" },
  { value: "retired", label: "🏡 Retired" },
];

const RISK_OPTIONS = [
  { value: "conservative", label: "🛡️ Conservative", desc: "Capital preservation. Prefer FDs, bonds, and debt funds." },
  { value: "moderate", label: "⚖️ Moderate", desc: "Balanced growth. Mix of equity and debt. Some market exposure OK." },
  { value: "aggressive", label: "🚀 Aggressive", desc: "High growth focus. Comfortable with market volatility and high equity." },
];

const DEBT_OPTIONS = ["home-loan", "personal-loan", "credit-card", "vehicle-loan", "education-loan", "business-loan"];

const SKILL_OPTIONS = [
  "Stock Market", "Mutual Funds", "Real Estate", "Business Planning",
  "Tax Planning", "Crypto/Web3", "Excel/Finance Tools", "Insurance",
  "SIP/Goal Investing", "GST/Accounting",
];

const GOAL_TYPES = [
  { value: "home", label: "🏠 Buy a Home" },
  { value: "car", label: "🚗 Buy a Vehicle" },
  { value: "education", label: "🎓 Education / Child's Education" },
  { value: "startup", label: "🚀 Start a Business" },
  { value: "retirement", label: "🌅 Retirement Corpus" },
  { value: "travel", label: "✈️ Travel / Experiences" },
  { value: "emergency", label: "🛡️ Emergency Fund" },
  { value: "investment", label: "📈 Wealth Building" },
  { value: "other", label: "✨ Other" },
];

// ── Field helpers ──────────────────────────────────────────────────────────────
function FieldRow({ label, tip, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</label>
        {tip && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>— {tip}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, prefix, type = "text" }) {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      {prefix && (
        <span style={{
          position: "absolute", left: 12, fontSize: 14, fontWeight: 600,
          color: "var(--text-muted)", pointerEvents: "none",
        }}>{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: prefix ? "10px 14px 10px 28px" : "10px 14px",
          borderRadius: "var(--radius-sm)",
          fontSize: 14,
          fontFamily: "var(--font)",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          outline: "none",
          transition: "all var(--anim-fast)",
        }}
        onFocus={e => {
          e.target.style.borderColor = "var(--accent)";
          e.target.style.boxShadow = "0 0 0 3px var(--accent-soft)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function ChipSelect({ options, value, onChange, multi = false }) {
  const isActive = (v) => multi ? (value || []).includes(v) : value === v;
  const toggle = (v) => {
    if (multi) {
      const arr = value || [];
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    } else {
      onChange(value === v ? "" : v);
    }
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const active = isActive(typeof opt === "object" ? opt.value : opt);
        const val = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : opt;
        return (
          <button
            key={val}
            onClick={() => toggle(val)}
            style={{
              padding: "7px 14px",
              borderRadius: "var(--radius)",
              border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`,
              background: active ? "var(--accent-soft)" : "var(--surface)",
              color: active ? "var(--accent-text)" : "var(--text-secondary)",
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              transition: "all var(--anim-fast)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Step Panels ────────────────────────────────────────────────────────────────
function StepProfile({ vault, updateVault }) {
  const p = vault.profile;
  const set = (k, v) => updateVault("profile", { [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FieldRow label="Your Name">
          <TextInput value={p.name} onChange={v => set("name", v)} placeholder="e.g. Deepanshu" />
        </FieldRow>
        <FieldRow label="Age">
          <TextInput value={p.age} onChange={v => set("age", v)} placeholder="e.g. 28" type="number" />
        </FieldRow>
      </div>
      <FieldRow label="City / Location">
        <TextInput value={p.city} onChange={v => set("city", v)} placeholder="e.g. Delhi, Mumbai, Bangalore" />
      </FieldRow>
      <FieldRow label="Occupation / What do you do?">
        <TextInput value={p.occupation} onChange={v => set("occupation", v)} placeholder="e.g. Software Engineer at Startup" />
      </FieldRow>
      <FieldRow label="Life Stage" tip="Kiro adapts advice based on where you are in life">
        <ChipSelect options={STAGE_OPTIONS} value={p.stage} onChange={v => set("stage", v)} />
      </FieldRow>
    </div>
  );
}

function StepFinances({ vault, updateVault }) {
  const f = vault.finances;
  const set = (k, v) => updateVault("finances", { [k]: v });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FieldRow label="Monthly Income (Take-home)">
          <TextInput value={f.monthlyIncome} onChange={v => set("monthlyIncome", v)} placeholder="85000" prefix="₹" type="number" />
        </FieldRow>
        <FieldRow label="Monthly Expenses">
          <TextInput value={f.monthlyExpenses} onChange={v => set("monthlyExpenses", v)} placeholder="45000" prefix="₹" type="number" />
        </FieldRow>
        <FieldRow label="Monthly Savings / Investment">
          <TextInput value={f.monthlySavings} onChange={v => set("monthlySavings", v)} placeholder="20000" prefix="₹" type="number" />
        </FieldRow>
        <FieldRow label="Total Outstanding Debt">
          <TextInput value={f.totalDebt} onChange={v => set("totalDebt", v)} placeholder="0" prefix="₹" type="number" />
        </FieldRow>
      </div>
      <FieldRow label="Emergency Fund Coverage" tip="How many months of expenses can you sustain without income?">
        <ChipSelect
          options={["0", "1", "2", "3", "4-6", "6-12", "12+"]}
          value={f.emergencyFundMonths}
          onChange={v => set("emergencyFundMonths", v)}
        />
      </FieldRow>
      <FieldRow label="Debt Types (select all that apply)">
        <ChipSelect options={DEBT_OPTIONS.map(d => ({ value: d, label: d.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) }))}
          value={f.debtType} onChange={v => set("debtType", v)} multi />
      </FieldRow>
    </div>
  );
}

function StepAssets({ vault, updateVault }) {
  const a = vault.assets;
  const set = (k, v) => updateVault("assets", { [k]: v });
  const fields = [
    ["mutualFunds", "Mutual Funds (current value)"],
    ["stocks", "Stocks / Direct Equity"],
    ["fixedDeposits", "Fixed Deposits / RD"],
    ["realEstate", "Real Estate (market value)"],
    ["gold", "Gold / Silver"],
    ["ppfNps", "PPF / NPS / EPF"],
    ["cryptoOther", "Crypto / Other"],
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
        Enter approximate current values. Even rough numbers help Kiro give you better guidance. Leave blank if none.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {fields.map(([key, label]) => (
          <FieldRow key={key} label={label}>
            <TextInput value={a[key]} onChange={v => set(key, v)} placeholder="0" prefix="₹" type="number" />
          </FieldRow>
        ))}
      </div>
    </div>
  );
}

function StepGoals({ vault, addGoal, removeGoal }) {
  const [form, setForm] = useState({ title: "", type: "", targetAmount: "", targetDate: "", priority: "medium" });
  const [adding, setAdding] = useState(false);

  const submit = () => {
    if (!form.title || !form.targetAmount) return;
    addGoal(form);
    setForm({ title: "", type: "", targetAmount: "", targetDate: "", priority: "medium" });
    setAdding(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {vault.goals.length === 0 && !adding && (
        <div className="empty-state" style={{ padding: "32px 24px" }}>
          <div className="empty-state-icon">🎯</div>
          <h3>No missions yet</h3>
          <p>Add financial goals and Kiro will build a plan to get you there.</p>
        </div>
      )}
      {vault.goals.map(g => (
        <div key={g.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", background: "var(--surface)",
        }}>
          <span style={{ fontSize: 22 }}>{GOAL_TYPES.find(t => t.value === g.type)?.label.split(" ")[0] || "🎯"}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{g.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              ₹{Number(g.targetAmount || 0).toLocaleString("en-IN")} · {g.targetDate || "No deadline"} · {g.priority} priority
            </div>
          </div>
          <button onClick={() => removeGoal(g.id)} style={{ color: "var(--danger)", padding: 6, borderRadius: "var(--radius-sm)" }}>
            <Icon d="M18 6L6 18M6 6l12 12" size={14} />
          </button>
        </div>
      ))}

      {adding && (
        <div style={{
          padding: 20, borderRadius: "var(--radius)", border: "1px solid var(--accent)", background: "var(--accent-soft)",
          display: "flex", flexDirection: "column", gap: 14,
          animation: "fadeSlideUp 0.25s both",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FieldRow label="Goal Name">
              <TextInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Buy a home in Gurgaon" />
            </FieldRow>
            <FieldRow label="Target Amount">
              <TextInput value={form.targetAmount} onChange={v => setForm(f => ({ ...f, targetAmount: v }))} placeholder="5000000" prefix="₹" type="number" />
            </FieldRow>
            <FieldRow label="Target Date">
              <TextInput value={form.targetDate} onChange={v => setForm(f => ({ ...f, targetDate: v }))} placeholder="e.g. 2029" />
            </FieldRow>
            <FieldRow label="Priority">
              <ChipSelect options={["high", "medium", "low"]} value={form.priority} onChange={v => setForm(f => ({ ...f, priority: v }))} />
            </FieldRow>
          </div>
          <FieldRow label="Goal Type">
            <ChipSelect options={GOAL_TYPES} value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} />
          </FieldRow>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={submit}>Add Goal</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {!adding && (
        <button className="btn btn-secondary" onClick={() => setAdding(true)} style={{ alignSelf: "flex-start" }}>
          <Icon d="M12 5v14M5 12h14" size={14} /> Add a Goal
        </button>
      )}
    </div>
  );
}

function StepRisk({ vault, updateVault }) {
  const set = (k, v) => updateVault(k, v);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <FieldRow label="Risk Tolerance" tip="How comfortable are you with investment volatility?">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RISK_OPTIONS.map(opt => {
            const active = vault.risk === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => set("risk", opt.value)}
                style={{
                  padding: "14px 18px",
                  borderRadius: "var(--radius)",
                  border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: active ? "var(--accent-soft)" : "var(--surface)",
                  display: "flex", alignItems: "center", gap: 12,
                  cursor: "pointer", textAlign: "left",
                  transition: "all var(--anim-fast)",
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.label.split(" ")[0]}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: active ? "var(--accent-text)" : "var(--text)" }}>
                    {opt.label.replace(/^.\s/, "")}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </FieldRow>
      <FieldRow label="Areas you already know" tip="Kiro won't over-explain topics you're already comfortable with">
        <ChipSelect options={SKILL_OPTIONS} value={vault.skills} onChange={v => set("skills", v)} multi />
      </FieldRow>
    </div>
  );
}

// ── Main Vault Page ────────────────────────────────────────────────────────────
export default function Vault() {
  const navigate = useNavigate();
  const { vault, completeness, updateVault, addGoal, removeGoal } = useVault();
  const [currentStep, setCurrentStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const stepContent = [
    <StepProfile vault={vault} updateVault={updateVault} />,
    <StepFinances vault={vault} updateVault={updateVault} />,
    <StepAssets vault={vault} updateVault={updateVault} />,
    <StepGoals vault={vault} addGoal={addGoal} removeGoal={removeGoal} />,
    <StepRisk vault={vault} updateVault={updateVault} />,
  ];

  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="page-container" style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ProgressRing pct={completeness} size={72} strokeWidth={6} />
          <div>
            <h1 style={{ fontSize: 24, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 4 }}>
              Your Financial Vault
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              {completeness < 40
                ? "Kiro needs to know you before it can guide you. Fill in your profile."
                : completeness < 80
                ? "Good progress! Fill in more details for better AI guidance."
                : "Your vault is comprehensive. Kiro can give you highly personalized guidance."}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/home")}>
            ← Back to Home
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { handleSave(); navigate("/chat"); }}>
            Ask Kiro →
          </button>
        </div>
      </div>

      {/* Vault completeness tip */}
      {completeness < 40 && (
        <div className="kiro-context-bar" style={{ animation: "fadeSlideUp 0.4s both" }}>
          <span className="badge-ai">Kiro Tip</span>
          <span style={{ color: "var(--accent-text)", opacity: 1, fontSize: 13 }}>
            The more you share, the more specific Kiro's calculations become. No data leaves your device.
          </span>
        </div>
      )}

      {/* Step Navigation */}
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
        {STEPS.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(i)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                borderRadius: "var(--radius)", border: `1.5px solid ${isActive ? "var(--accent)" : isDone ? "var(--success)" : "var(--border)"}`,
                background: isActive ? "var(--accent-soft)" : isDone ? "var(--success-soft)" : "var(--surface)",
                color: isActive ? "var(--accent-text)" : isDone ? "var(--success)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", flexShrink: 0,
                transition: "all var(--anim-medium)",
              }}
            >
              <span>{isDone ? "✓" : step.icon}</span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 28,
        animation: "fadeSlideUp 0.3s both",
      }} key={currentStep}>
        {/* Step header */}
        <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>{STEPS[currentStep].icon}</span>
            <h2 style={{ fontSize: 18, fontFamily: "var(--font-display)" }}>{STEPS[currentStep].label}</h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            💡 {STEPS[currentStep].tip}
          </p>
        </div>

        {/* Step form */}
        {stepContent[currentStep]}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <button
            className="btn btn-ghost"
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={isFirst}
            style={{ opacity: isFirst ? 0.4 : 1 }}
          >
            <Icon d="M15 18l-6-6 6-6" size={15} /> Previous
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleSave}>
              {saved ? "✓ Saved" : "Save"}
            </button>
            {isLast ? (
              <button className="btn btn-primary" onClick={() => { handleSave(); navigate("/home"); }}>
                Done — Go to Command Center <Icon d="M5 12h14M12 5l7 7-7 7" size={15} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentStep(s => s + 1)}>
                Next: {STEPS[currentStep + 1]?.label} <Icon d="M9 18l6-6-6-6" size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
