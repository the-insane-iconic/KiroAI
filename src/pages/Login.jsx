import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_BACKEND_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5001"
    : "/api")
).replace(/\/$/, "");

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password"); // "password" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [legalModal, setLegalModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     GOOGLE LOGIN INITIALIZATION
     ========================================================= */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return;

      const container = document.getElementById("google-login-button");
      if (!container) return;

      container.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(container, {
        theme: "filled_blue",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
      });
    };

    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogle();
      } else {
        existingScript.addEventListener("load", initializeGoogle, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  /* =========================================================
     GOOGLE LOGIN HANDLER
     ========================================================= */
  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      setError("Google authentication failed. Please try again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/google-login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Google login failed.");
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      if (data.user_id) {
        localStorage.setItem("user_id", String(data.user_id));
      }

      navigate("/");
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError(err.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD LOGIN
     ========================================================= */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Invalid Email or Password.");
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email.trim(),
            name: data.name || email.split("@")[0],
          })
        );
      }

      if (data.user_id) {
        localStorage.setItem("user_id", String(data.user_id));
      }

      // Fast immediate navigation
      navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.message || "Unable to login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEND OTP
     ========================================================= */
  const handleSendOTP = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email to receive OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Unable to send OTP.");
      }

      setOtpSent(true);
      setOtp("");
    } catch (err) {
      console.error("OTP SEND ERROR:", err);
      setError(err.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     VERIFY OTP
     ========================================================= */
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Invalid OTP code.");
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email.trim(),
            name: data.name || email.split("@")[0],
          })
        );
      }

      if (data.user_id) {
        localStorage.setItem("user_id", String(data.user_id));
      }

      navigate("/");
    } catch (err) {
      console.error("OTP VERIFY ERROR:", err);
      setError(err.message || "Invalid OTP verification.");
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setError("");
    if (newMode === "password") {
      setOtpSent(false);
      setOtp("");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Background radial glow */}
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
            Rural & MSME Financial Intelligence Co-Pilot
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={modeContainerStyle}>
          <button
            type="button"
            onClick={() => changeMode("password")}
            style={{
              ...modeButtonStyle,
              background: mode === "password" ? "linear-gradient(90deg, #0D9488, #06B6D4)" : "transparent",
              color: mode === "password" ? "#FFFFFF" : "#94A3B8",
              boxShadow: mode === "password" ? "0 4px 14px rgba(13, 148, 136, 0.35)" : "none",
            }}
          >
            🔑 Password
          </button>

          <button
            type="button"
            onClick={() => changeMode("otp")}
            style={{
              ...modeButtonStyle,
              background: mode === "otp" ? "linear-gradient(90deg, #0D9488, #06B6D4)" : "transparent",
              color: mode === "otp" ? "#FFFFFF" : "#94A3B8",
              boxShadow: mode === "otp" ? "0 4px 14px rgba(13, 148, 136, 0.35)" : "none",
            }}
          >
            ✉️ Email OTP
          </button>
        </div>

        {/* Error Alert */}
        {error && <div style={errorStyle}>⚠️ {error}</div>}

        {/* PASSWORD FORM */}
        {mode === "password" && (
          <form onSubmit={handlePasswordLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Signing in..." : "Sign In with Password →"}
            </button>
          </form>
        )}

        {/* OTP FORM */}
        {mode === "otp" && (
          <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                style={buttonStyle}
              >
                {loading ? "Sending OTP..." : "Send Verification OTP →"}
              </button>
            ) : (
              <>
                <div>
                  <label style={labelStyle}>6-Digit Security Code</label>
                  <input
                    style={{
                      ...inputStyle,
                      textAlign: "center",
                      letterSpacing: "6px",
                      fontSize: "18px",
                      fontWeight: "700",
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? "Verifying..." : "Verify & Log In →"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  style={resendButtonStyle}
                >
                  Resend OTP Code
                </button>
              </>
            )}
          </form>
        )}

        {/* Google Login Section */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div style={dividerStyle}>
              <span>OR</span>
            </div>
            <div id="google-login-button" style={{ display: "flex", justifyContent: "center", minHeight: "42px" }} />
          </>
        )}

        {/* Legal & Terms Note */}
        <p style={termsLabelStyle}>
          By signing in, you accept our{" "}
          <button type="button" onClick={() => setLegalModal("terms")} style={legalButtonStyle}>
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" onClick={() => setLegalModal("privacy")} style={legalButtonStyle}>
            Privacy Policy
          </button>
          .
        </p>

        {/* Register Link */}
        <p style={registerTextStyle}>
          Don't have an account?{" "}
          <Link to="/register" style={linkStyle}>
            Create an Account
          </Link>
        </p>
      </div>

      {/* Legal Modal */}
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </div>
  );
}

/* ===========================================================
   LEGAL MODAL COMPONENT
   =========================================================== */
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

/* ===========================================================
   STYLES
   =========================================================== */
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

const modeContainerStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "6px",
  padding: "4px",
  background: "var(--surface-soft)",
  borderRadius: "12px",
  marginBottom: "20px",
  border: "1px solid var(--border)",
};

const modeButtonStyle = {
  padding: "10px",
  border: "none",
  borderRadius: "10px",
  fontSize: "12.5px",
  fontWeight: "700",
  cursor: "pointer",
  transition: "all 0.15s ease",
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
};

const resendButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--primary-accent)",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "4px",
  textAlign: "center",
};

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "18px 0",
  color: "var(--muted)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
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

const registerTextStyle = {
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

export default Login;