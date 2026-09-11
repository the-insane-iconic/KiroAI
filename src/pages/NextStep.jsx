function NextStep() {
  return (
    <div
      style={{
        padding: "30px",
        color: "var(--text)",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "var(--text-h)", fontSize: "28px", fontWeight: "800", marginBottom: "24px" }}>
        🛡️ Next Step Advisor
      </h1>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.28s ease",
        }}
      >
        <h2 style={{ color: "var(--warning)", marginTop: 0, fontSize: "18px" }}>⚠️ EMI Alert</h2>

        <p style={{ color: "var(--text-h)", fontSize: "14px", margin: "8px 0" }}>
          EMI Amount: <strong>₹12,500</strong>
        </p>

        <p style={{ color: "var(--muted)", fontSize: "13px", margin: "4px 0" }}>
          Due Date: 5 July
        </p>

        <p style={{ color: "var(--primary-accent)", fontSize: "13px", margin: "4px 0", fontWeight: "700" }}>
          Days Remaining: 3
        </p>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "24px",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.28s ease",
        }}
      >
        <h2 style={{ color: "var(--text-h)", marginTop: 0, fontSize: "18px" }}>🤖 AI Recommendation</h2>

        <ul style={{ color: "var(--muted)", lineHeight: "1.8", paddingLeft: "20px", margin: "10px 0 0 0" }}>
          <li>Keep ₹12,500 ready in your bank account.</li>
          <li>Avoid unnecessary spending this week.</li>
          <li>Enable auto-debit for EMI payment.</li>
          <li>Maintain emergency funds.</li>
        </ul>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "var(--shadow-md)",
          transition: "all 0.28s ease",
        }}
      >
        <h2 style={{ color: "var(--text-h)", marginTop: 0, fontSize: "18px" }}>🎯 Financial Goals</h2>

        <p style={{ color: "var(--text-h)", margin: "6px 0" }}>Monthly Savings Goal: <strong>₹10,000</strong></p>
        <p style={{ color: "var(--text-h)", margin: "6px 0" }}>Current Progress: <strong>₹8,200</strong></p>
        <p style={{ color: "var(--primary)", margin: "6px 0", fontWeight: "800" }}>Completion: 82%</p>

        <h3 style={{ color: "var(--text-h)", marginTop: "16px", fontSize: "15px" }}>Next Best Action</h3>

        <p style={{ color: "var(--muted)", fontSize: "13px", margin: "4px 0" }}>
          Save ₹1,800 more this month to achieve your goal.
        </p>
      </div>
    </div>
  );
}

export default NextStep;