import React, { useState } from "react";
import phonePeQR from "../assets/phonepe-qr.png";

// Multi-Port Matrix Fallback Configuration
const BASE_5001 = "http://127.0.0.1:5001";
const BASE_5000 = "http://127.0.0.1:5000";
const UPI_ID_TARGET = "6202266267-2.wallet@phonepe";

export default function Premium() {
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyStatus, setCopyStatus] = useState("Copy");

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID_TARGET);
      setCopyStatus("Copied! ✓");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    } catch (_) {
      alert("Failed to write to clipboard string matrix.");
    }
  };

  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    const cleanUtr = transactionId.trim();

    // 12-Digit Numeric Verification Pass
    if (!/^\d{12}$/.test(cleanUtr)) {
      alert("⚠️ Standard Indian UPI UTR profiles require exactly 12 numeric digits.");
      return;
    }

    setIsSubmitting(true);
    const ports = [BASE_5001, BASE_5000];
    let successState = false;

    for (const host of ports) {
      if (successState) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`${host}/verify-premium`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utr: cleanUtr }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (response.ok) {
          alert("🎉 Payment UTR submitted successfully! Processing active access verification layer shortly.");
          setTransactionId("");
          successState = true;
        } else {
          alert(`❌ Server error: ${data.error || "Mismatched tokens."}`);
          successState = true; // Request landed but validation failed
        }
      } catch (_) {
        console.warn(`Host target connection timeout on ${host}`);
      }
    }

    if (!successState) {
      alert("❌ Critical Network Error: Could not reach the backend on port 5000 or 5001.");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>PRO PLAN</div>
        <h2 style={styles.title}>Unlock Premium Features</h2>
        <p style={styles.subtitle}>Get advanced AI advice, instant PDF parsing, and unlimited transaction predictions.</p>
        
        <div style={styles.priceContainer}>
          <span style={styles.currency}>₹</span>
          <span style={styles.amount}>299</span>
          <span style={styles.duration}>/ one-time</span>
        </div>

        <hr style={styles.divider} />

        {/* Payment QR Stage Block */}
        <div style={styles.qrSection}>
          <p style={styles.instruction}>Scan with any UPI application to complete payment:</p>
          
          <div style={styles.qrContainer}>
            <img 
              src={phonePeQR} 
              alt="PhonePe Payment UPI QR Code" 
              style={styles.qrImage} 
              onError={(e) => {
                e.target.style.display = "none";
                document.getElementById("qr-fallback-block").style.display = "flex";
              }}
            />
            {/* Visual Fallback Container if file asset parsing fails on load */}
            <div id="qr-fallback-block" style={styles.qrPlaceholderFallback}>
              <span style={{ color: "#121212", fontWeight: "bold" }}>[ Image Parsing Exception ]</span>
            </div>
          </div>

          <div style={styles.upiRow}>
            <span style={styles.upiId}>{UPI_ID_TARGET}</span>
            <button onClick={handleCopyUpi} style={styles.copyBtn}>{copyStatus}</button>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerifyPayment} style={styles.form}>
          <label style={styles.label}>Enter Payment UTR / Transaction ID:</label>
          <input 
            type="text" 
            maxLength={12}
            placeholder="12-digit UPI reference number (e.g., 6192...)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ""))} // Numbers only filtering
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? "Verifying Token..." : "Verify Payment Activation"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "40px 20px", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "system-ui, sans-serif" },
  card: { background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", padding: "35px", maxWidth: "420px", width: "100%", textAlign: "center", color: "var(--text)", transition: "all 0.28s ease" },
  badge: { background: "var(--primary)", color: "white", display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", letterSpacing: "1px", marginBottom: "15px" },
  title: { fontSize: "1.75rem", fontWeight: "700", marginBottom: "10px", color: "var(--text-h)" },
  subtitle: { color: "var(--muted)", fontSize: "0.9rem", lineHeight: "1.4", marginBottom: "20px" },
  priceContainer: { display: "flex", justifyContent: "center", alignItems: "baseline", marginBottom: "20px" },
  currency: { fontSize: "1.5rem", fontWeight: "600", color: "var(--primary)" },
  amount: { fontSize: "3rem", fontWeight: "800", color: "var(--primary)", margin: "0 4px" },
  duration: { color: "var(--muted)", fontSize: "0.9rem" },
  divider: { border: "0", borderTop: "1px solid var(--border)", margin: "20px 0" },
  qrSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  instruction: { fontSize: "0.9rem", color: "var(--text)", marginBottom: "4px" },
  qrContainer: { width: "220px", height: "360px", background: "white", borderRadius: "12px", padding: "8px", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid var(--border)" },
  qrImage: { width: "100%", height: "100%", objectFit: "contain", borderRadius: "4px" },
  qrPlaceholderFallback: { display: "none", width: "100%", height: "100%", background: "#F1F5F9", borderRadius: "4px", flexDirection: "column", justifyContent: "center", alignItems: "center" },
  upiRow: { display: "flex", alignItems: "center", gap: "8px", background: "var(--surface-soft)", padding: "4px 4px 4px 12px", borderRadius: "8px", border: "1px solid var(--border)", maxWidth: "100%" },
  upiId: { fontFamily: "monospace", fontSize: "0.75rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  copyBtn: { background: "var(--primary)", border: "none", color: "white", padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" },
  form: { marginTop: "25px", textAlign: "left", display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.85rem", color: "var(--muted)", fontWeight: "500" },
  input: { background: "var(--surface-soft)", border: "1px solid var(--border)", padding: "12px", borderRadius: "8px", color: "var(--text-h)", fontSize: "0.95rem", outline: "none" },
  button: { background: "linear-gradient(90deg, var(--primary-accent), var(--primary))", color: "white", border: "none", padding: "14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", marginTop: "8px", fontSize: "1rem" },
};