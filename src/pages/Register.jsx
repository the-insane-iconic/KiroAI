import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  registerWithEmail,
  loginWithGoogle,
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
      if (isFirebaseConfigured()) {
        const userCredential = await registerWithEmail(email.trim(), password, name.trim());
        const fbUser = userCredential.user;

        const userData = {
          email: fbUser.email,
          name: name.trim(),
          uid: fbUser.uid,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", fbUser.uid);

        // Optional backend record registration
        try {
          await fetch(`${API_URL}/register`, {
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
        } catch {
          // Firebase registration is complete
        }

        navigate("/");
      } else {
        // Fallback to backend API
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
      }
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      let msg = err.message || "Unable to register.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
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

        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("GOOGLE SIGNUP ERROR:", err);
      setError(err.message || "Google registration failed.");
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
            Create Your Account
          </h1>
          <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "12px" }}>
            Get started with BizzAI / AmiVest in seconds
          </p>
        </div>

        {/* Error Alert */}
        {error && <div style={errorStyle}>⚠️ {error}</div>}

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Password (min. 6 characters)</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating account..." : "Sign Up with Firebase →"}
          </button>
        </form>

        {/* Divider */}
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>OR</span>
          <div style={dividerLineStyle} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
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
          Continue with Google
        </button>

        {/* Bottom Switcher */}
        <p style={{ textAlign: "center", marginTop: "24px", color: "#94A3B8", fontSize: "13px" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#2DD4BF", fontWeight: "600", textDecoration: "none" }}
          >
            Sign in
          </Link>
        </p>

        {/* Legal Disclaimer */}
        <div style={{ textAlign: "center", marginTop: "18px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
          <p style={{ margin: 0, color: "#64748B", fontSize: "11px" }}>
            By creating an account, you agree to our{" "}
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
                  Welcome to BizzAI. By accessing or using our financial analysis, business launchpad, and co-pilot tools, you agree to comply with applicable regulations and utilize suggestions for educational and advisory reference.
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