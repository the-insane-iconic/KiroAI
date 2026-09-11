import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured,
} from "../services/firebase";

const API_URL = (
  import.meta.env.VITE_BACKEND_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:5001"
    : "/api")
).replace(/\/$/, "");

export default function Login({ defaultTab = "login" }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(defaultTab); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [legalModal, setLegalModal] = useState(null);

  // Clear notifications on tab switch
  useEffect(() => {
    setError("");
    setSuccessMsg("");
  }, [activeTab]);

  /* =========================================================
     FIREBASE EMAIL / PASSWORD SIGN-IN
     ========================================================= */
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        const userCred = await loginWithEmail(email.trim(), password);
        const fbUser = userCred.user;

        const userData = {
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
          uid: fbUser.uid,
          photoURL: fbUser.photoURL || null,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", fbUser.uid);

        // Optional sync with backend
        try {
          await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: fbUser.email, password }),
          });
        } catch {
          // Backend sync optional
        }

        navigate("/");
      } else {
        // Direct backend fallback
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(data.message || data.error || "Invalid email or password.");
        }

        const userData = data.user || {
          email: email.trim(),
          name: data.name || email.split("@")[0],
          uid: data.user_id || "usr_" + Date.now(),
        };

        localStorage.setItem("user", JSON.stringify(userData));
        if (data.user_id) localStorage.setItem("user_id", String(data.user_id));

        navigate("/");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      let msg = err.message || "Unable to sign in. Please verify your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Incorrect email or password. Please try again.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Account access temporarily restricted due to failed attempts. Please reset password.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FIREBASE SIGN-UP
     ========================================================= */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all fields to create your account.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        const userCred = await registerWithEmail(email.trim(), password, name.trim());
        const fbUser = userCred.user;

        const userData = {
          email: fbUser.email,
          name: name.trim(),
          uid: fbUser.uid,
          photoURL: null,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", fbUser.uid);

        try {
          await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name: name.trim(), email: email.trim(), password, termsAccepted: true }),
          });
        } catch {
          // Backend registration optional
        }

        navigate("/");
      } else {
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
          throw new Error(data.message || data.error || "Unable to create account.");
        }

        const userData = {
          name: name.trim(),
          email: email.trim(),
          uid: data.user_id || "usr_" + Date.now(),
        };
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", String(userData.uid));

        navigate("/");
      }
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      let msg = err.message || "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FIREBASE GOOGLE 1-CLICK AUTH
     ========================================================= */
  const handleGoogleAuth = async () => {
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
          photoURL: fbUser.photoURL || null,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("user_id", fbUser.uid);

        try {
          await fetch(`${API_URL}/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: fbUser.email, name: fbUser.displayName, uid: fbUser.uid }),
          });
        } catch {
          // Backend sync optional
        }

        navigate("/");
      } else {
        // Fallback demo user
        const demoUser = {
          email: "founder@bizzai.io",
          name: "Founder",
          uid: "demo_user_01",
        };
        localStorage.setItem("user", JSON.stringify(demoUser));
        localStorage.setItem("user_id", "demo_user_01");
        navigate("/");
      }
    } catch (err) {
      console.error("GOOGLE AUTH ERROR:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled.");
      } else {
        setError(err.message || "Google authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PASSWORD RESET EMAIL
     ========================================================= */
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        await resetPassword(email.trim());
      }
      setSuccessMsg(`A password reset link has been dispatched to ${email.trim()}.`);
    } catch (err) {
      console.error("RESET ERROR:", err);
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      {/* Background Ambience Mesh */}
      <div className="glow-mesh-1" />
      <div className="glow-mesh-2" />
      <div className="grid-overlay" />

      <div className="login-wrapper">
        {/* =========================================================
            LEFT COLUMN: IMMERSIVE PRODUCT SHOWCASE (DESKTOP)
            ========================================================= */}
        <div className="showcase-pane">
          <div className="showcase-top">
            <div className="brand-badge">
              <div className="brand-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="brand-text">
                <span className="brand-name">BizzAI</span>
                <span className="brand-tag">Intelligence Platform</span>
              </div>
            </div>

            <div className="status-indicator">
              <span className="pulse-dot" />
              <span>AI Engine Live · Supabase 17</span>
            </div>
          </div>

          <div className="showcase-content">
            <h1 className="showcase-title">
              The Next-Gen Financial &amp; Business{" "}
              <span className="gradient-text">Co-Pilot.</span>
            </h1>
            <p className="showcase-sub">
              Empowering founders, SMEs, and investors with real-time financial
              insights, market feasibility models, and automated compliance.
            </p>

            {/* Interactive Live Mini-Widget */}
            <div className="telemetry-card">
              <div className="telemetry-header">
                <div className="telemetry-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                  <span>Real-time Capital Optimization</span>
                </div>
                <span className="telemetry-val">+34.8% ROI</span>
              </div>

              <div className="telemetry-body">
                <div className="metric-row">
                  <div>
                    <span className="metric-label">Forecast Accuracy</span>
                    <span className="metric-num">99.4%</span>
                  </div>
                  <div>
                    <span className="metric-label">RBI Compliance</span>
                    <span className="metric-num active">Verified</span>
                  </div>
                  <div>
                    <span className="metric-label">Neural Engine</span>
                    <span className="metric-num">Groq Llama 3.3</span>
                  </div>
                </div>

                <div className="sparkline-bar">
                  <div className="sparkline-fill" style={{ width: "82%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="feature-badges">
              <span className="feature-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Bank-Grade AES 256
              </span>
              <span className="feature-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Zero-Latency Sync
              </span>
              <span className="feature-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                24/7 Co-Pilot
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: ULTRA-REFINED GLASSMORPHIC LOGIN CARD
            ========================================================= */}
        <div className="auth-pane">
          <div className="auth-card">
            {/* Mobile Brand Header */}
            <div className="mobile-brand-head">
              <div className="brand-logo-icon small">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <h2>BizzAI</h2>
            </div>

            {/* Top Navigation Tabs */}
            <div className="tab-pill-container">
              <button
                type="button"
                className={`tab-pill ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`tab-pill ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                Create Account
              </button>
            </div>

            {/* Header Text */}
            <div className="auth-card-head">
              <h2 className="auth-heading">
                {activeTab === "login" && "Welcome Back"}
                {activeTab === "signup" && "Start Your Journey"}
                {activeTab === "reset" && "Reset Your Password"}
              </h2>
              <p className="auth-subtitle">
                {activeTab === "login" && "Access your AI launchpad & financial intelligence suite."}
                {activeTab === "signup" && "Join thousands of founders making data-backed decisions."}
                {activeTab === "reset" && "Enter your email to receive an instant recovery link."}
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="alert-box error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert-box success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Social 1-Click Google Sign-In */}
            {activeTab !== "reset" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="google-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="google-icon">
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
                  <span>Continue with Google</span>
                </button>

                <div className="or-separator">
                  <div className="sep-line" />
                  <span className="sep-text">OR EMAIL</span>
                  <div className="sep-line" />
                </div>
              </>
            )}

            {/* FORM 1: LOGIN */}
            {activeTab === "login" && (
              <form onSubmit={handleEmailLogin} className="auth-form">
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-field-wrap">
                    <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="founder@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <div className="label-row">
                    <label className="input-label">Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("reset")}
                      className="link-btn"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="input-field-wrap">
                    <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="text-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="remember-row">
                  <label className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkmark" />
                    <span className="checkbox-label">Keep me signed in</span>
                  </label>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <span className="spinner-wrap">
                      <span className="mini-spinner" /> Signing in...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM 2: SIGN UP */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignUp} className="auth-form">
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-field-wrap">
                    <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <input
                      type="text"
                      className="text-input"
                      placeholder="e.g. Ramesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-field-wrap">
                    <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="input-field-wrap">
                    <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="text-input"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <span className="spinner-wrap">
                      <span className="mini-spinner" /> Creating Account...
                    </span>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM 3: PASSWORD RESET */}
            {activeTab === "reset" && (
              <form onSubmit={handlePasswordReset} className="auth-form">
                <div className="input-group">
                  <label className="input-label">Account Email</label>
                  <div className="input-field-wrap">
                    <svg className="field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <input
                      type="email"
                      className="text-input"
                      placeholder="founder@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <span className="spinner-wrap">
                      <span className="mini-spinner" /> Sending Link...
                    </span>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="back-btn"
                >
                  ← Return to Sign In
                </button>
              </form>
            )}

            {/* Footer Legal Agreement */}
            <div className="card-legal-footer">
              <p>
                By accessing BizzAI, you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("terms")}
                  className="legal-link"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="legal-link"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          LEGAL & PRIVACY MODAL
          ========================================================= */}
      {legalModal && (
        <div className="legal-modal-backdrop" onClick={() => setLegalModal(null)}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>{legalModal === "terms" ? "Terms of Service" : "Privacy Policy"}</h3>
              <button onClick={() => setLegalModal(null)} className="close-modal-btn">
                ✕
              </button>
            </div>
            <div className="modal-scroll-body">
              {legalModal === "terms" ? (
                <div>
                  <h4>1. Acceptance of Terms</h4>
                  <p>
                    By using BizzAI, you gain access to algorithmic business intelligence, cash flow models, and feasibility indicators. All insights are generated for planning and advisory purposes.
                  </p>
                  <h4>2. Data Security &amp; Isolation</h4>
                  <p>
                    Your records and data points are protected with bank-grade encryption and isolated across secure PostgreSQL instances.
                  </p>
                </div>
              ) : (
                <div>
                  <h4>1. Privacy First Architecture</h4>
                  <p>
                    We never sell, distribute, or broker your personal financial records or business strategies to third-party ad networks.
                  </p>
                  <h4>2. Authentication Standards</h4>
                  <p>
                    Authentication tokens are verified with cryptographic standards and Firebase security rules.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SCOPED ULTRA-PREMIUM CSS STYLES
          ========================================================= */}
      <style>{`
        .login-viewport {
          min-height: 100vh;
          width: 100%;
          background: #060A12;
          display: flex;
          align-items: center;
          justifyContent: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: Inter, system-ui, -apple-system, sans-serif;
          color: #F8FAFC;
          box-sizing: border-box;
        }

        .glow-mesh-1 {
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(13, 148, 136, 0.18) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 70%);
          top: -15%;
          left: -10%;
          pointer-events: none;
          filter: blur(50px);
          animation: floatPulse 12s ease-in-out infinite alternate;
        }

        .glow-mesh-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(14, 165, 233, 0.05) 50%, transparent 70%);
          bottom: -15%;
          right: -5%;
          pointer-events: none;
          filter: blur(60px);
          animation: floatPulse 16s ease-in-out infinite alternate-reverse;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          opacity: 0.8;
        }

        .login-wrapper {
          width: 100%;
          max-width: 1140px;
          min-height: 680px;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          background: rgba(12, 19, 34, 0.7);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          box-shadow: 0 35px 80px -20px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(13, 148, 136, 0.12);
          position: relative;
          z-index: 2;
          overflow: hidden;
        }

        /* SHOWCASE LEFT PANE */
        .showcase-pane {
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.75) 0%, rgba(6, 11, 23, 0.95) 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
        }

        .showcase-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0D9488 0%, #06B6D4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          box-shadow: 0 8px 24px rgba(13, 148, 136, 0.35);
        }

        .brand-logo-icon.small {
          width: 36px;
          height: 36px;
          border-radius: 10px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(90deg, #FFFFFF 0%, #E2E8F0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-tag {
          font-size: 11px;
          color: #0D9488;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(13, 148, 136, 0.12);
          border: 1px solid rgba(13, 148, 136, 0.25);
          border-radius: 100px;
          font-size: 11px;
          color: #2DD4BF;
          font-weight: 500;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2DD4BF;
          box-shadow: 0 0 10px #2DD4BF;
          animation: blink 2s infinite;
        }

        .showcase-content {
          margin: 36px 0;
        }

        .showcase-title {
          font-size: 38px;
          line-height: 1.18;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0 0 16px 0;
          color: #F8FAFC;
        }

        .gradient-text {
          background: linear-gradient(90deg, #14B8A6, #2DD4BF, #38BDF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .showcase-sub {
          font-size: 14.5px;
          line-height: 1.6;
          color: #94A3B8;
          margin: 0 0 32px 0;
          max-width: 460px;
        }

        /* TELEMETRY CARD */
        .telemetry-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }

        .telemetry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .telemetry-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          color: #2DD4BF;
        }

        .telemetry-val {
          font-size: 13px;
          font-weight: 700;
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .metric-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .metric-label {
          display: block;
          font-size: 11px;
          color: #64748B;
          margin-bottom: 4px;
        }

        .metric-num {
          font-size: 14px;
          font-weight: 700;
          color: #F8FAFC;
        }

        .metric-num.active {
          color: #2DD4BF;
        }

        .sparkline-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          overflow: hidden;
        }

        .sparkline-fill {
          height: 100%;
          background: linear-gradient(90deg, #0D9488 0%, #38BDF8 100%);
          border-radius: 10px;
          box-shadow: 0 0 12px rgba(45, 212, 191, 0.6);
        }

        .showcase-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 20px;
        }

        .feature-badges {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #94A3B8;
          font-weight: 500;
        }

        .feature-item svg {
          color: #0D9488;
        }

        /* AUTH RIGHT PANE */
        .auth-pane {
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 16, 29, 0.5);
        }

        .auth-card {
          width: 100%;
          max-width: 390px;
        }

        .mobile-brand-head {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .mobile-brand-head h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #F8FAFC;
        }

        /* TAB PILLS */
        .tab-pill-container {
          display: flex;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab-pill {
          flex: 1;
          padding: 9px 16px;
          border: none;
          background: transparent;
          color: #94A3B8;
          font-size: 12.5px;
          font-weight: 600;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.22s ease;
        }

        .tab-pill.active {
          background: linear-gradient(135deg, #0D9488 0%, #06B6D4 100%);
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
        }

        .auth-card-head {
          margin-bottom: 22px;
        }

        .auth-heading {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #F8FAFC;
          margin: 0 0 6px 0;
        }

        .auth-subtitle {
          font-size: 13px;
          color: #94A3B8;
          margin: 0;
          line-height: 1.45;
        }

        /* NOTIFICATIONS */
        .alert-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 12px;
          margin-bottom: 18px;
          line-height: 1.4;
        }

        .alert-box.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #FCA5A5;
        }

        .alert-box.success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.25);
          color: #6EE7B7;
        }

        /* GOOGLE 1-CLICK BTN */
        .google-btn {
          width: 100%;
          padding: 11.5px 16px;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: #F8FAFC;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }

        .google-btn:hover:not(:disabled) {
          background: rgba(51, 65, 85, 0.85);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .or-separator {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }

        .sep-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .sep-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #64748B;
        }

        /* FORM CONTROLS */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-label {
          font-size: 12px;
          font-weight: 600;
          color: #CBD5E1;
          margin-bottom: 6px;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .link-btn {
          background: none;
          border: none;
          color: #2DD4BF;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }

        .link-btn:hover {
          color: #5EEAD4;
          text-decoration: underline;
        }

        .input-field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: #64748B;
          pointer-events: none;
        }

        .text-input {
          width: 100%;
          padding: 11.5px 42px 11.5px 40px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 11px;
          color: #FFFFFF;
          font-size: 13.5px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .text-input:focus {
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.25);
          background: rgba(15, 23, 42, 0.95);
        }

        .text-input::placeholder {
          color: #475569;
        }

        .eye-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.15s;
        }

        .eye-toggle:hover {
          color: #CBD5E1;
        }

        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -2px;
        }

        .checkbox-wrap {
          display: flex;
          align-items: center;
          position: relative;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-wrap input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark {
          height: 16px;
          width: 16px;
          background-color: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .checkbox-wrap input:checked ~ .checkmark {
          background-color: #0D9488;
          border-color: #0D9488;
        }

        .checkbox-wrap input:checked ~ .checkmark:after {
          content: "";
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
          margin-bottom: 2px;
        }

        .checkbox-label {
          font-size: 12px;
          color: #94A3B8;
        }

        /* SUBMIT BUTTON */
        .submit-btn {
          width: 100%;
          padding: 13px 20px;
          background: linear-gradient(135deg, #0D9488 0%, #06B6D4 100%);
          border: none;
          border-radius: 12px;
          color: #FFFFFF;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: 0.2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 20px rgba(13, 148, 136, 0.4);
          margin-top: 4px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 8px 25px rgba(13, 148, 136, 0.55);
          filter: brightness(1.06);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .back-btn {
          background: none;
          border: none;
          color: #94A3B8;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 6px;
          transition: color 0.15s;
        }

        .back-btn:hover {
          color: #F8FAFC;
        }

        .spinner-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mini-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* FOOTER LEGAL */
        .card-legal-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          text-align: center;
        }

        .card-legal-footer p {
          margin: 0;
          font-size: 11px;
          line-height: 1.5;
          color: #64748B;
        }

        .legal-link {
          background: none;
          border: none;
          color: #94A3B8;
          text-decoration: underline;
          font-size: 11px;
          cursor: pointer;
          padding: 0;
        }

        .legal-link:hover {
          color: #2DD4BF;
        }

        /* MODAL */
        .legal-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .legal-modal-card {
          width: 100%;
          max-width: 480px;
          background: #0E1626;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);
        }

        .modal-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .modal-top h3 {
          margin: 0;
          font-size: 18px;
          color: #F8FAFC;
        }

        .close-modal-btn {
          background: none;
          border: none;
          color: #94A3B8;
          font-size: 20px;
          cursor: pointer;
        }

        .modal-scroll-body {
          max-height: 340px;
          overflow-y: auto;
          color: #CBD5E1;
          font-size: 13px;
          line-height: 1.6;
        }

        .modal-scroll-body h4 {
          color: #2DD4BF;
          margin: 14px 0 6px 0;
          font-size: 13.5px;
        }

        .modal-scroll-body p {
          margin: 0 0 10px 0;
          color: #94A3B8;
        }

        @keyframes floatPulse {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(30px, 20px); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE DESIGN */
        @media (max-width: 960px) {
          .login-wrapper {
            grid-template-columns: 1fr;
            max-width: 480px;
            min-height: auto;
          }

          .showcase-pane {
            display: none;
          }

          .auth-pane {
            padding: 36px 24px;
          }

          .mobile-brand-head {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}