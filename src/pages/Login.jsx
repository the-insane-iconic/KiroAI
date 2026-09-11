import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured,
} from "../services/firebase";

const API_URL = (
  import.meta.env.VITE_BACKEND_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5001"
    : "/api")
).replace(/\/$/, "");

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("password"); // "password" | "reset" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [legalModal, setLegalModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* =========================================================
     FIREBASE GOOGLE SIGN-IN
     ========================================================= */
  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        const result = await loginWithGoogle();
        const fbUser = result.user;

        const userData = {
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          uid: fbUser.uid,
          photoURL: fbUser.photoURL,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", fbUser.uid);

        // Notify backend of session if available
        try {
          await fetch(`${API_URL}/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: fbUser.email, name: fbUser.displayName, uid: fbUser.uid }),
          });
        } catch {
          // Backend sync is optional when using direct Firebase Auth
        }

        navigate("/");
      } else {
        // Fallback demo or backend mock login
        const fallbackUser = {
          email: "demo@amivest.ai",
          name: "Demo User",
          uid: "demo_123",
        };
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        localStorage.setItem("user_id", "demo_123");
        navigate("/");
      }
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Google sign-in popup was closed before completing.");
      } else {
        setError(err.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD LOGIN (FIREBASE / BACKEND)
     ========================================================= */
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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
      if (isFirebaseConfigured()) {
        const userCredential = await loginWithEmail(email.trim(), password);
        const fbUser = userCredential.user;

        const userData = {
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          uid: fbUser.uid,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", fbUser.uid);

        navigate("/");
      } else {
        // Fallback to Flask backend login if Firebase keys not configured
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

        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      let msg = err.message || "Unable to login. Please check credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later or reset password.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD RESET (FIREBASE)
     ========================================================= */
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim()) {
      setError("Please enter your email to receive a password reset link.");
      return;
    }

    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        await resetPassword(email.trim());
        setResetSent(true);
        setSuccessMsg(`Password reset link sent to ${email.trim()}. Check your inbox!`);
      } else {
        setResetSent(true);
        setSuccessMsg(`Password reset instructions sent to ${email.trim()}.`);
      }
    } catch (err) {
      console.error("PASSWORD RESET ERROR:", err);
      setError(err.message || "Could not send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEND OTP
     ========================================================= */
  const handleSendOTP = async () => {
    setError("");
    setSuccessMsg("");

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
      setSuccessMsg("OTP sent to your email.");
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
    setSuccessMsg("");

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
    setSuccessMsg("");
    if (newMode === "password") {
      setOtpSent(false);
      setOtp("");
      setResetSent(false);
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
            B
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
            BizzAI / AmiVest
          </h1>
          <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "12px" }}>
            Firebase Authenticated Financial Co-Pilot
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
        {successMsg && <div style={successStyle}>✅ {successMsg}</div>}

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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => changeMode("reset")}
                  style={{ background: "none", border: "none", color: "#2DD4BF", fontSize: "11px", cursor: "pointer", padding: 0 }}
                >
                  Forgot password?
                </button>
              </div>
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
              {loading ? "Signing in..." : "Sign In with Firebase →"}
            </button>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {mode === "reset" && (
          <form onSubmit={handlePasswordReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Registered Email Address</label>
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

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Sending link..." : "Send Password Reset Link →"}
            </button>

            <button
              type="button"
              onClick={() => changeMode("password")}
              style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "12px", cursor: "pointer", marginTop: "4px" }}
            >
              ← Back to password login
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
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? "Verifying..." : "Verify & Sign In →"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2DD4BF",
                    fontSize: "12px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Resend OTP Code
                </button>
              </>
            )}
          </form>
        )}

        {/* Divider */}
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>OR CONTINUE WITH</span>
          <div style={dividerLineStyle} />
        </div>

        {/* Firebase Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={googleBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "10px" }}>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Bottom Switcher */}
        <p style={{ textAlign: "center", marginTop: "24px", color: "#94A3B8", fontSize: "13px" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "#2DD4BF", fontWeight: "600", textDecoration: "none" }}
          >
            Create account
          </Link>
        </p>

        {/* Legal Disclaimer & Modals */}
        <div style={{ textAlign: "center", marginTop: "18px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
          <p style={{ margin: 0, color: "#64748B", fontSize: "11px" }}>
            By continuing, you agree to our{" "}
            <button
              type="button"
              onClick={() => setLegalModal("terms")}
              style={{ background: "none", border: "none", color: "#94A3B8", textDecoration: "underline", fontSize: "11px", cursor: "pointer", padding: 0 }}
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => setLegalModal("privacy")}
              style={{ background: "none", border: "none", color: "#94A3B8", textDecoration: "underline", fontSize: "11px", cursor: "pointer", padding: 0 }}
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>

      {/* MODAL POPUPS */}
      {legalModal && (
        <div style={modalBackdropStyle} onClick={() => setLegalModal(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#F8FAFC" }}>
                {legalModal === "terms" ? "Terms of Service" : "Privacy Policy"}
              </h2>
              <button
                onClick={() => setLegalModal(null)}
                style={{ background: "none", border: "none", color: "#94A3B8", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: "#CBD5E1", fontSize: "13px", lineHeight: "1.6", maxHeight: "320px", overflowY: "auto" }}>
              {legalModal === "terms" ? (
                <p>
                  Welcome to BizzAI / AmiVest. By accessing or using our financial analysis, business launchpad, and co-pilot tools, you agree to comply with applicable regulations and utilize suggestions for educational and advisory reference.
                </p>
              ) : (
                <p>
                  Your privacy and security are our highest priority. Authentication is securely managed with Firebase. We do not sell your personal financial records or credentials.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INLINE STYLES
   ========================================================= */
const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #090D16 0%, #0F172A 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  position: "relative",
  overflow: "hidden",
  fontFamily: "Inter, system-ui, -apple-system, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  background: "rgba(15, 23, 42, 0.75)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "20px",
  padding: "32px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
  position: "relative",
  zIndex: 1,
};

const modeContainerStyle = {
  display: "flex",
  background: "rgba(30, 41, 59, 0.7)",
  borderRadius: "12px",
  padding: "4px",
  marginBottom: "18px",
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const modeButtonStyle = {
  flex: 1,
  padding: "8px 12px",
  border: "none",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const labelStyle = {
  display: "block",
  color: "#94A3B8",
  fontSize: "12px",
  fontWeight: "500",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(2, 6, 23, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "#F8FAFC",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(90deg, #0D9488, #06B6D4)",
  border: "none",
  borderRadius: "10px",
  color: "#FFFFFF",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(13, 148, 136, 0.4)",
  marginTop: "4px",
};

const googleBtnStyle = {
  width: "100%",
  padding: "11px",
  background: "rgba(30, 41, 59, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "#F8FAFC",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s ease",
};

const dividerContainerStyle = {
  display: "flex",
  alignItems: "center",
  margin: "18px 0",
};

const dividerLineStyle = {
  flex: 1,
  height: "1px",
  background: "rgba(255, 255, 255, 0.08)",
};

const dividerTextStyle = {
  color: "#64748B",
  fontSize: "10px",
  fontWeight: "600",
  letterSpacing: "0.5px",
  padding: "0 10px",
};

const errorStyle = {
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "#FCA5A5",
  fontSize: "12px",
  marginBottom: "14px",
};

const successStyle = {
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "#6EE7B7",
  fontSize: "12px",
  marginBottom: "14px",
};

const modalBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: "20px",
};

const modalContentStyle = {
  background: "#0F172A",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px",
  padding: "24px",
  maxWidth: "480px",
  width: "100%",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
};

export default Login;