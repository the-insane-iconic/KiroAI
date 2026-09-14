import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Default Vault State ────────────────────────────────────────────────────────
const DEFAULT_VAULT = {
  profile: {
    name: "",
    age: "",
    city: "",
    occupation: "",
    stage: "", // "student" | "early-career" | "mid-career" | "business-owner" | "pre-retirement" | "retired"
  },
  finances: {
    monthlyIncome: "",
    monthlyExpenses: "",
    monthlySavings: "",
    totalDebt: "",
    debtType: [], // ["home-loan", "personal-loan", "credit-card", "vehicle-loan", "education-loan"]
    emergencyFundMonths: "",
  },
  assets: {
    mutualFunds: "",
    stocks: "",
    fixedDeposits: "",
    realEstate: "",
    gold: "",
    ppfNps: "",
    cryptoOther: "",
  },
  goals: [
    // { id, title, targetAmount, targetDate, priority: "high"|"medium"|"low", type }
  ],
  risk: "", // "conservative" | "moderate" | "aggressive"
  skills: [], // array of strings
  createdAt: null,
  updatedAt: null,
};

// ── Completeness Calculator ────────────────────────────────────────────────────
function calcCompleteness(vault) {
  let total = 0;
  let filled = 0;

  // Profile (20 pts)
  const profileFields = ["name", "age", "city", "occupation", "stage"];
  profileFields.forEach(f => {
    total += 4;
    if (vault.profile[f]) filled += 4;
  });

  // Finances (30 pts)
  const financeFields = ["monthlyIncome", "monthlyExpenses", "monthlySavings", "totalDebt", "emergencyFundMonths"];
  financeFields.forEach(f => {
    total += 6;
    if (vault.finances[f] !== "" && vault.finances[f] !== null && vault.finances[f] !== undefined) filled += 6;
  });

  // Assets (20 pts — at least 2 non-zero)
  const assetValues = Object.values(vault.assets).filter(v => v !== "" && v !== "0" && Number(v) > 0);
  total += 20;
  if (assetValues.length >= 1) filled += 10;
  if (assetValues.length >= 3) filled += 10;

  // Goals (15 pts)
  total += 15;
  if (vault.goals.length >= 1) filled += 10;
  if (vault.goals.length >= 2) filled += 5;

  // Risk (10 pts)
  total += 10;
  if (vault.risk) filled += 10;

  // Skills (5 pts)
  total += 5;
  if (vault.skills.length >= 1) filled += 5;

  return Math.round((filled / total) * 100);
}

// ── Build AI context string from vault ────────────────────────────────────────
export function buildVaultContext(vault) {
  if (!vault) return "";
  const lines = [];

  if (vault.profile.name) lines.push(`User: ${vault.profile.name}`);
  if (vault.profile.age) lines.push(`Age: ${vault.profile.age}`);
  if (vault.profile.city) lines.push(`City: ${vault.profile.city}`);
  if (vault.profile.occupation) lines.push(`Occupation: ${vault.profile.occupation}`);
  if (vault.profile.stage) lines.push(`Life Stage: ${vault.profile.stage}`);
  if (vault.finances.monthlyIncome) lines.push(`Monthly Income: ₹${Number(vault.finances.monthlyIncome).toLocaleString("en-IN")}`);
  if (vault.finances.monthlyExpenses) lines.push(`Monthly Expenses: ₹${Number(vault.finances.monthlyExpenses).toLocaleString("en-IN")}`);
  if (vault.finances.monthlySavings) lines.push(`Monthly Savings: ₹${Number(vault.finances.monthlySavings).toLocaleString("en-IN")}`);
  if (vault.finances.totalDebt) lines.push(`Total Debt: ₹${Number(vault.finances.totalDebt).toLocaleString("en-IN")}`);
  if (vault.finances.emergencyFundMonths) lines.push(`Emergency Fund Coverage: ${vault.finances.emergencyFundMonths} months`);

  const assets = Object.entries(vault.assets)
    .filter(([, v]) => v && Number(v) > 0)
    .map(([k, v]) => `${k}: ₹${Number(v).toLocaleString("en-IN")}`);
  if (assets.length) lines.push(`Assets: ${assets.join(", ")}`);

  if (vault.goals.length) {
    const goalStr = vault.goals.map(g => `${g.title} (₹${Number(g.targetAmount || 0).toLocaleString("en-IN")} by ${g.targetDate || "TBD"})`).join("; ");
    lines.push(`Financial Goals: ${goalStr}`);
  }

  if (vault.risk) lines.push(`Risk Tolerance: ${vault.risk}`);
  if (vault.skills.length) lines.push(`Skills: ${vault.skills.join(", ")}`);

  if (!lines.length) return "";
  return `[USER FINANCIAL PROFILE]\n${lines.join("\n")}\n[END PROFILE]`;
}

// ── Context ────────────────────────────────────────────────────────────────────
const VaultContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function VaultProvider({ children }) {
  const [vault, setVaultState] = useState(() => {
    try {
      const saved = localStorage.getItem("kiro_vault");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        return {
          ...DEFAULT_VAULT,
          ...parsed,
          profile: { ...DEFAULT_VAULT.profile, ...(parsed.profile || {}) },
          finances: { ...DEFAULT_VAULT.finances, ...(parsed.finances || {}) },
          assets: { ...DEFAULT_VAULT.assets, ...(parsed.assets || {}) },
          goals: parsed.goals || [],
          skills: parsed.skills || [],
        };
      }
    } catch {}
    return { ...DEFAULT_VAULT };
  });

  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    setCompleteness(calcCompleteness(vault));
  }, [vault]);

  const updateVault = useCallback((section, data) => {
    setVaultState(prev => {
      const next = {
        ...prev,
        [section]: section === "goals" || section === "skills" || section === "risk"
          ? data
          : { ...prev[section], ...data },
        updatedAt: Date.now(),
      };
      if (!next.createdAt) next.createdAt = Date.now();
      try {
        localStorage.setItem("kiro_vault", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const addGoal = useCallback((goal) => {
    setVaultState(prev => {
      const goals = [...prev.goals, { ...goal, id: `goal_${Date.now()}` }];
      const next = { ...prev, goals, updatedAt: Date.now() };
      try { localStorage.setItem("kiro_vault", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeGoal = useCallback((goalId) => {
    setVaultState(prev => {
      const goals = prev.goals.filter(g => g.id !== goalId);
      const next = { ...prev, goals, updatedAt: Date.now() };
      try { localStorage.setItem("kiro_vault", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetVault = useCallback(() => {
    const fresh = { ...DEFAULT_VAULT };
    localStorage.removeItem("kiro_vault");
    setVaultState(fresh);
  }, []);

  const contextValue = {
    vault,
    completeness,
    updateVault,
    addGoal,
    removeGoal,
    resetVault,
    vaultContext: buildVaultContext(vault),
  };

  return (
    <VaultContext.Provider value={contextValue}>
      {children}
    </VaultContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used inside <VaultProvider>");
  return ctx;
}

export default VaultContext;
