import React, { useState, useEffect, useMemo } from "react";

const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/* Standard RBI Topics (always available offline/guest) */
const DEFAULT_RBI_TOPICS = [
  {
    title: "Deposit Insurance (DICGC ₹5 Lakh Limit)",
    detail: "Bank deposits (savings, fixed, current, recurring) are insured up to ₹5 lakh per depositor, per bank (all branches combined) by the Deposit Insurance and Credit Guarantee Corporation (DICGC).",
    tag: "Safety",
  },
  {
    title: "Zero Liability on Unauthorized Transactions",
    detail: "If an unauthorized electronic banking transaction happens and you report it to your bank within 3 working days, your liability is ZERO. Reporting between 4–7 days caps liability at ₹10,000.",
    tag: "Protection",
  },
  {
    title: "Digital Lending & Harassment Protection",
    detail: "RBI mandates that digital lending apps must disclose the regulated lending entity (Bank/NBFC) upfront. All loan disbursals and repayments must happen directly into bank accounts. Recovery agents cannot call before 8 AM or after 7 PM, and contacting personal contacts or using abusive language is strictly illegal.",
    tag: "Borrower Rights",
  },
  {
    title: "No Prepayment Penalty on Floating Rate Loans",
    detail: "Banks and NBFCs cannot charge any prepayment or foreclosure penalties on floating-rate term loans taken by individual borrowers for non-business purposes.",
    tag: "Loans",
  },
  {
    title: "RBI Integrated Ombudsman Scheme",
    detail: "If your bank, NBFC, or payment system operator fails to resolve your grievance within 30 days, you can escalate free of cost to the RBI Integrated Ombudsman on the CMS portal (cms.rbi.org.in).",
    tag: "Redressal",
  },
  {
    title: "Large Cash Transaction Reporting (SFT)",
    detail: "Cash deposits or withdrawals exceeding ₹10 Lakh in a financial year in savings accounts (or ₹50 Lakh in current accounts) are reported by banks to tax authorities under Statement of Financial Transactions (SFT).",
    tag: "Compliance",
  },
  {
    title: "KYC Periodic Updation & Account Safety",
    detail: "Banks must periodically update KYC (every 2 years for high risk, 8 for medium, 10 for low risk). Banks must give adequate notice before placing any operations restriction.",
    tag: "Banking",
  },
];

const DICGC_LIMIT = 500000;

function computeClientChecks(transactions = []) {
  const txList = Array.isArray(transactions) ? transactions : [];

  const income = txList
    .filter((t) => Number(t.amount) > 0 || String(t.type || "").toLowerCase().includes("cr") || String(t.type || "").toLowerCase().includes("income"))
    .reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);

  const expense = txList
    .filter((t) => Number(t.amount) < 0 || String(t.type || "").toLowerCase().includes("dr") || String(t.type || "").toLowerCase().includes("expense"))
    .reduce((s, t) => s + Math.abs(Number(t.amount) || 0), 0);

  const netSavings = income - expense;
  const largeTxns = txList.filter((t) => Math.abs(Number(t.amount) || 0) >= 200000);

  const checks = [];

  // Check 1: DICGC Deposit Insurance
  if (netSavings > DICGC_LIMIT) {
    const uninsured = netSavings - DICGC_LIMIT;
    checks.push({
      title: "Deposit Insurance (DICGC)",
      status: "warning",
      message: `Your tracked net balance (₹${netSavings.toLocaleString("en-IN")}) exceeds the ₹5,00,000 DICGC insurance cap. If kept in a single bank account, ₹${uninsured.toLocaleString("en-IN")} would be above the statutory cover limit. Consider distributing across multiple scheduled banks.`,
    });
  } else {
    checks.push({
      title: "Deposit Insurance (DICGC)",
      status: "ok",
      message: `Your tracked balance (₹${Math.max(0, netSavings).toLocaleString("en-IN")}) is fully within the ₹5,00,000 DICGC insurance limit per bank.`,
    });
  }

  // Check 2: Large Transaction Flag
  if (largeTxns.length > 0) {
    checks.push({
      title: "High-Value Transaction Notice",
      status: "info",
      message: `Found ${largeTxns.length} transaction(s) of ₹2 Lakh or above. If these were cash-based transactions, banks are required to maintain reporting records under PMLA/SFT guidelines. Non-cash digital transfers carry no tax reporting issues.`,
    });
  } else {
    checks.push({
      title: "Transaction SFT Thresholds",
      status: "ok",
      message: "No individual single-day transactions above the ₹2,00,000 cash monitoring threshold were detected in your records.",
    });
  }

  // Check 3: Digital Lending & Prepayment Rights
  checks.push({
    title: "Borrower Protection & Prepayment",
    status: "ok",
    message: "Under RBI guidelines, floating-rate personal loans to individuals carry 0% prepayment penalty. Lenders cannot contact references without explicit consent.",
  });

  return { success: true, checks };
}

export default function RBIRules({ transactions = [] }) {
  const [topics, setTopics] = useState(DEFAULT_RBI_TOPICS);
  const [checksData, setChecksData] = useState(() => computeClientChecks(transactions));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchRBIData() {
      try {
        const endpoints = [
          "/api/rbi/topics",
          "/rbi/topics",
          `${API_BASE}/rbi/topics`,
        ];

        for (const ep of endpoints) {
          try {
            const res = await fetch(ep, { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              if (data?.success && Array.isArray(data.topics) && mounted) {
                setTopics(data.topics);
                break;
              }
            }
          } catch (_) {}
        }

        // Try backend checks endpoint
        const checkEndpoints = [
          "/api/rbi/check?user_id=1",
          "/rbi/check?user_id=1",
          `${API_BASE}/rbi/check?user_id=1`,
        ];

        for (const ep of checkEndpoints) {
          try {
            const res = await fetch(ep, { credentials: "include" });
            if (res.ok) {
              const data = await res.json();
              if (data?.success && Array.isArray(data.checks) && mounted) {
                setChecksData(data);
                return;
              }
            }
          } catch (_) {}
        }
      } catch (_) {
        // Fallback is already initialized
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRBIData();

    return () => {
      mounted = false;
    };
  }, []);

  // Update client checks if transactions change
  useEffect(() => {
    setChecksData(computeClientChecks(transactions));
  }, [transactions]);

  const { checks } = checksData;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", color: "var(--text)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "24px" }}>📜</span>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "var(--text-h)" }}>
            RBI Rules & Consumer Protection
          </h1>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "9999px",
              background: "var(--primary-soft)",
              color: "var(--primary-accent)",
              border: "1px solid var(--border)",
            }}
          >
            Updated Regulations
          </span>
        </div>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: "13px", lineHeight: "1.5" }}>
          Key banking regulations, borrower rights, and automatic checks based on your real transactions.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Section 1: Real-Time Account Checks */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "22px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "18px" }}>🛡️</span>
            <h3 style={{ margin: 0, color: "var(--text-h)", fontSize: "16px", fontWeight: "700" }}>
              Automated Financial Safety Checks
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {checks.map((c, idx) => {
              const bg =
                c.status === "warning"
                  ? "rgba(245, 158, 11, 0.1)"
                  : c.status === "info"
                  ? "var(--primary-soft)"
                  : "rgba(16, 185, 129, 0.1)";
              const border =
                c.status === "warning"
                  ? "rgba(245, 158, 11, 0.3)"
                  : c.status === "info"
                  ? "var(--border)"
                  : "rgba(16, 185, 129, 0.3)";
              const icon =
                c.status === "warning" ? "⚠️" : c.status === "info" ? "ℹ️" : "✅";
              const textCol =
                c.status === "warning"
                  ? "#FCD34D"
                  : c.status === "info"
                  ? "var(--primary-accent)"
                  : "#6EE7B7";

              return (
                <div
                  key={idx}
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px" }}>{icon}</span>
                    <strong style={{ color: "var(--text-h)", fontSize: "13px" }}>{c.title}</strong>
                  </div>
                  <div style={{ color: textCol, fontSize: "12px", lineHeight: "1.5" }}>
                    {c.message}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Key RBI Regulations Repository */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "22px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <span style={{ fontSize: "18px" }}>📘</span>
            <h3 style={{ margin: 0, color: "var(--text-h)", fontSize: "16px", fontWeight: "700" }}>
              Key RBI Regulations Every Citizen & MSME Should Know
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
            {topics.map((t, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ color: "var(--primary-accent)", fontWeight: "700", fontSize: "13.5px" }}>
                    {t.title}
                  </div>
                  {t.tag && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "700",
                        padding: "2px 6px",
                        borderRadius: "9999px",
                        background: "var(--primary-soft)",
                        color: "var(--primary-accent)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {t.tag}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--muted)", fontSize: "12px", lineHeight: "1.55" }}>
                  {t.detail}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "12px 14px",
              background: "var(--primary-soft)",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>
              💡 <strong>Official Portal:</strong> File grievances at{" "}
              <a
                href="https://cms.rbi.org.in"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--primary-accent)", textDecoration: "underline" }}
              >
                cms.rbi.org.in
              </a>{" "}
              or check circulars at{" "}
              <a
                href="https://rbi.org.in"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--primary-accent)", textDecoration: "underline" }}
              >
                rbi.org.in
              </a>
              .
            </div>
            <span style={{ fontSize: "10.5px", color: "var(--muted)" }}>
              General financial literacy reference
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
