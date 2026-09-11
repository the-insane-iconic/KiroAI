import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_BACKEND_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5001"
    : "/api")
).replace(/\/$/, "");

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [legalModal, setLegalModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          termsAccepted: true,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Could not create your account.");
      }

      navigate("/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(err.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      />

      <div style={cardStyle}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0D9488, #06B6D4)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "900",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(13, 148, 136, 0.4)",
              marginBottom: "12px",
            }}
          >
            A
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: "800",
              background: "linear-gradient(90deg, #14B8A6, #2DD4BF, #38BDF8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Amivest AI
          </h1>
          <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "12px" }}>
            Create your Rural & MSME Financial Co-Pilot account
          </p>
        </div>

        {error && <div style={errorStyle}>⚠️ {error}</div>}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Deepanshu Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Create Password</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        {/* Legal Disclaimer */}
        <p style={termsLabelStyle}>
          By registering, you accept our{" "}
          <button type="button" onClick={() => setLegalModal("terms")} style={legalButtonStyle}>
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" onClick={() => setLegalModal("privacy")} style={legalButtonStyle}>
            Privacy Policy
          </button>
          .
        </p>

        <p style={loginTextStyle}>
          Already have an account?{" "}
          <Link to="/login" style={linkStyle}>
            Sign In
          </Link>
        </p>
      </div>

      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
}

function LegalModal({ type, onClose }) {
  const isTerms = type === "terms";

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h3 style={{ margin: 0, color: "#2DD4BF", fontSize: "16px" }}>
            {isTerms ? "Terms & Conditions" : "Privacy Policy"}
          </h3>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        <div style={modalContentStyle}>
          {isTerms ? (
            <>
              <h4 style={{ color: "#F8FAFC", margin: "12px 0 4px" }}>1. Acceptance</h4>
              <p>By using Amivest AI, you agree to these Terms & Conditions for financial guidance, loan eligibility tools, and feasibility intelligence.</p>

              <h4 style={{ color: "#F8FAFC", margin: "12px 0 4px" }}>2. Advisory Scope</h4>
              <p>Amivest AI provides educational and data-driven insights. Official loan sanctions are subject to government nodal agencies and banking parameters.</p>

              <h4 style={{ color: "#F8FAFC", margin: "12px 0 4px" }}>3. Data Privacy</h4>
              <p>Financial records, PIN lookups, and feasibility evaluations are encrypted and strictly scoped to your authorized user session.</p>
            </>
          ) : (
            <>
              <h4 style={{ color: "#F8FAFC", margin: "12px 0 4px" }}>1. Data Encryption</h4>
              <p>All bank statement extractions, loan inputs, and session credentials are encrypted in transit and at rest.</p>

              <h4 style={{ color: "#F8FAFC", margin: "12px 0 4px" }}>2. Zero Telemetry Leaks</h4>
              <p>Your business idea, financial logs, and personal identity numbers are never sold or shared with unverified external third parties.</p>
            </>
          )}
        </div>

        <button type="button" onClick={onClose} style={modalDoneButtonStyle}>
          Understood
        </button>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "var(--bg)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px 16px",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  transition: "all 0.28s ease",
};

const cardStyle = {
  width: "100%",
  maxWidth: "440px",
  background: "var(--surface)",
  padding: "36px 32px",
  borderRadius: "24px",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-md)",
  backdropFilter: "blur(20px)",
  boxSizing: "border-box",
  position: "relative",
  zIndex: 2,
  transition: "all 0.28s ease",
};

const labelStyle = {
  display: "block",
  fontSize: "11.5px",
  fontWeight: "700",
  color: "var(--muted)",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  background: "var(--surface-soft)",
  color: "var(--text-h)",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.2s ease",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  background: "linear-gradient(90deg, var(--primary-accent), var(--primary))",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  fontSize: "13.5px",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(13, 148, 136, 0.4)",
  transition: "transform 0.15s ease",
  marginTop: "4px",
};

const errorStyle = {
  background: "rgba(239, 68, 68, 0.14)",
  border: "1px solid rgba(239, 68, 68, 0.35)",
  color: "#EF4444",
  padding: "11px 14px",
  borderRadius: "10px",
  marginBottom: "16px",
  fontSize: "12.5px",
};

const termsLabelStyle = {
  marginTop: "20px",
  color: "var(--muted)",
  fontSize: "11px",
  textAlign: "center",
  lineHeight: "1.5",
};

const legalButtonStyle = {
  background: "none",
  border: "none",
  color: "var(--primary-accent)",
  fontSize: "11px",
  cursor: "pointer",
  fontWeight: "600",
  padding: 0,
  textDecoration: "underline",
};

const loginTextStyle = {
  marginTop: "16px",
  textAlign: "center",
  color: "var(--muted)",
  fontSize: "12.5px",
};

const linkStyle = {
  color: "var(--primary-accent)",
  fontWeight: "700",
  textDecoration: "none",
  marginLeft: "4px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  padding: "20px",
  backdropFilter: "blur(8px)",
};

const modalStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "20px",
  padding: "24px",
  maxWidth: "460px",
  width: "100%",
  color: "var(--text)",
  boxShadow: "var(--shadow-md)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "12px",
  borderBottom: "1px solid var(--border)",
};

const closeButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--muted)",
  fontSize: "16px",
  cursor: "pointer",
};

const modalContentStyle = {
  fontSize: "12.5px",
  lineHeight: "1.6",
  color: "var(--muted)",
  margin: "14px 0",
};

const modalDoneButtonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "var(--primary)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "12.5px",
  cursor: "pointer",
};