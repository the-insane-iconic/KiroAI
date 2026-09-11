import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

function AddTransaction() {
  const [type, setType] = useState("Expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, text: "", type: "success" });

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      setNotification({ show: true, text: "Please sign in to record transactions.", type: "error" });
      return;
    }

    if (!amount || !category) {
      setNotification({ show: true, text: "Please specify both amount and category.", type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          type,
          category,
          amount,
          description,
          transaction_date: transactionDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({ show: true, text: data.message || "Transaction recorded successfully!", type: "success" });
        setCategory("");
        setAmount("");
        setDescription("");
        setTransactionDate("");
      } else {
        setNotification({ show: true, text: data.message || "Failed to save transaction.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setNotification({ show: true, text: "Cannot connect to server.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: "680px",
      margin: "0 auto",
      padding: "32px 20px"
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        padding: "36px",
        boxShadow: "var(--shadow-md)",
        backdropFilter: "blur(14px)",
        transition: "all 0.28s ease"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(13, 148, 136, 0.2), rgba(16, 185, 129, 0.2))",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px"
          }}>
            💳
          </div>
          <div>
            <div style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "var(--primary-accent)",
              letterSpacing: "1.2px",
              textTransform: "uppercase"
            }}>
              Financial Ledger
            </div>
            <h2 style={{ margin: "2px 0 0", fontSize: "22px", color: "var(--text-h)", fontWeight: 800 }}>
              Record New Transaction
            </h2>
          </div>
        </div>

        {notification.show && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "12px",
            fontWeight: 600,
            background: notification.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${notification.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            color: notification.type === "success" ? "#10B981" : "#EF4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>{notification.text}</span>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ display: "grid", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "6px" }}>
              TRANSACTION TYPE
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setType("Expense")}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: type === "Expense" ? "1px solid #EF4444" : "1px solid var(--border)",
                  background: type === "Expense" ? "rgba(239, 68, 68, 0.12)" : "var(--surface-soft)",
                  color: type === "Expense" ? "#EF4444" : "var(--muted)",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "0.2s ease"
                }}
              >
                💸 Expense
              </button>
              <button
                type="button"
                onClick={() => setType("Income")}
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: type === "Income" ? "1px solid var(--primary)" : "1px solid var(--border)",
                  background: type === "Income" ? "rgba(16, 185, 129, 0.12)" : "var(--surface-soft)",
                  color: type === "Income" ? "var(--primary)" : "var(--muted)",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "0.2s ease"
                }}
              >
                💰 Income
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "6px" }}>
                CATEGORY
              </label>
              <input
                type="text"
                placeholder="e.g. Raw Material, Utility, Sales"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--text-h)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "6px" }}>
                AMOUNT (₹)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--text-h)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "6px" }}>
                DESCRIPTION / NOTES
              </label>
              <input
                type="text"
                placeholder="Vendor name or description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--text-h)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--muted)", marginBottom: "6px" }}>
                DATE
              </label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  color: "var(--text-h)",
                  fontSize: "13px",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={submitting}
            style={{
              marginTop: "10px",
              padding: "14px 20px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, var(--primary-accent), var(--primary))",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 10px 25px rgba(13, 148, 136, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              opacity: submitting ? 0.7 : 1,
              transition: "0.2s ease"
            }}
          >
            {submitting ? "Saving..." : "✓ Save Transaction to Ledger"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTransaction;
