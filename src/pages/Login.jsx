import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
  isFirebaseConfigured,
} from "../services/firebase";
import { useTheme } from "../context/ThemeContext";

const API_URL = (
  import.meta.env.VITE_BACKEND_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:5001"
    : "/api")
).replace(/\/$/, "");

// ── Google "G" Logo ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Read tab parameter from URL query (e.g. /login?tab=signup)
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") === "signup" ? "signup" : "login";

  const [tab, setTab] = useState(initialTab); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [legalModal, setLegalModal] = useState(null); // "terms" | "privacy" | null

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [tab]);

  // ── Session persistence ───────────────────────────────────────────────────
  function saveUser(user) {
    const data = {
      uid: user.uid || "usr_" + Date.now(),
      name: user.displayName || name || user.email?.split("@")[0] || "User",
      email: user.email,
      photo: user.photoURL || null,
    };
    localStorage.setItem("user", JSON.stringify(data));
    if (user.uid) localStorage.setItem("user_id", String(user.uid));
  }

  // ── Quick 1-Click Admin Demo Login ─────────────────────────────────────────
  const handleAdminBypass = () => {
    saveUser({
      uid: "1",
      displayName: "Admin",
      email: "admin@kiro.ai",
    });
    // Async background session ping
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin", password: "admin" }),
      credentials: "include",
    }).catch(() => {});
    navigate("/");
  };

  // ── Email Auth (Login / Signup / Reset) ────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email or username.");
      return;
    }

    if (tab === "reset") {
      setLoading(true);
      try {
        if (isFirebaseConfigured()) {
          await resetPassword(cleanEmail);
        }
        setSuccess(`Password reset email dispatched to ${cleanEmail}. Check your inbox.`);
      } catch (err) {
        setError(err.message || "Unable to send reset instructions.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (tab === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // ── Built-in Admin Bypass Check ─────────────────────────────────────────
    const lowerUser = cleanEmail.toLowerCase();
    if (
      (lowerUser === "admin" || lowerUser === "admin@admin.com" || lowerUser === "admin@kiro.ai") &&
      password === "admin"
    ) {
      handleAdminBypass();
      return;
    }

    setLoading(true);

    try {
      if (tab === "signup") {
        if (isFirebaseConfigured()) {
          const cred = await registerWithEmail(cleanEmail, password, name.trim());
          saveUser({ ...cred.user, displayName: name.trim() });
        } else {
          const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password, name: name.trim() }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Registration failed. Try again.");
          saveUser({ uid: data.user_id, displayName: name.trim(), email: cleanEmail });
        }
      } else {
        // Sign In
        if (isFirebaseConfigured()) {
          const cred = await loginWithEmail(cleanEmail, password);
          saveUser(cred.user);
        } else {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Invalid credentials. Please verify your email and password.");
          saveUser({ uid: data.user_id, displayName: data.name, email: cleanEmail });
        }
      }
      navigate("/");
    } catch (err) {
      console.error("AUTH ERROR:", err);
      let msg = err.message || "Authentication failed.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Incorrect email or password. You can also use the 1-Click Demo.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please sign in.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password must be at least 6 characters.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Access temporarily locked due to multiple attempts. Please try again shortly or reset password.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google SSO ────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      if (!isFirebaseConfigured()) {
        throw new Error("Google Sign-In is initializing. You can use 1-Click Demo or Email login.");
      }
      const cred = await loginWithGoogle();
      saveUser(cred.user);
      navigate("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in could not be completed.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      {/* Dynamic Ambient Background Glows */}
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />

      <div className="login-card-container">
        {/* ===================================================================
            LEFT COLUMN: IMMERSIVE PRODUCT SHOWCASE (DESKTOP)
            =================================================================== */}
        <div className="showcase-pane">
          <div className="showcase-top">
            <div className="showcase-brand" onClick={() => navigate("/landing")}>
              <div className="brand-logo-box">
                <span className="brand-logo-letter">K</span>
              </div>
              <div className="brand-text">
                <span className="brand-name">Kiro AI</span>
                <span className="brand-tag">Platform 2.0</span>
              </div>
            </div>

            <div className="showcase-status">
              <span className="live-pulse" />
              <span>Gemini & Groq Neural Core</span>
            </div>
          </div>

          <div className="showcase-content">
            <h1 className="showcase-title">
              Autonomous Intelligence for Wealth &amp; Business{" "}
              <span className="showcase-gradient">Growth.</span>
            </h1>
            <p className="showcase-desc">
              From real-time cashflow optimization and automated tax exemptions to 90-day startup feasibility and instant MUDRA &amp; PMEGP loan matching.
            </p>

            {/* Live Financial Telemetry Card */}
            <div className="telemetry-box">
              <div className="telemetry-head">
                <div className="telemetry-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                  <span>Real-time Capital Optimization</span>
                </div>
                <span className="telemetry-val">+34.8% ROI</span>
              </div>

              <div className="telemetry-metrics-grid">
                <div className="tm-item">
                  <span className="tm-label">Forecast Accuracy</span>
                  <span className="tm-num">99.4%</span>
                </div>
                <div className="tm-item">
                  <span className="tm-label">RBI Compliance</span>
                  <span className="tm-num text-success">Verified</span>
                </div>
                <div className="tm-item">
                  <span className="tm-label">Tax Saved</span>
                  <span className="tm-num text-accent">₹46,200</span>
                </div>
              </div>

              <div className="telemetry-bar">
                <div className="telemetry-fill" style={{ width: "84%" }} />
              </div>
            </div>

            {/* Founder Testimonial Snippet */}
            <div className="showcase-quote-card">
              <div className="sq-stars">★★★★★</div>
              <p className="sq-text">
                "Kiro AI pre-approved our ₹10L MSME subsidy loan and automated our entire quarterly tax planning. An absolute game-changer."
              </p>
              <span className="sq-author">— Ananya K., Founder at TerraOrganics</span>
            </div>
          </div>

          <div className="showcase-footer">
            <div className="showcase-trust-items">
              <span className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Bank-Grade AES 256
              </span>
              <span className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Zero Data Sharing
              </span>
              <span className="trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Real-Time Sync
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT COLUMN: AUTHENTICATION FORM PANE
            =================================================================== */}
        <div className="auth-pane">
          {/* Top navigation row */}
          <div className="auth-top-nav">
            <button onClick={() => navigate("/landing")} className="back-link-btn" title="Back to Landing Page">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Landing</span>
            </button>

            <button onClick={toggleTheme} className="theme-toggle-btn-small" title="Toggle theme">
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>

          {/* Mobile brand header (visible on < 960px) */}
          <div className="mobile-brand-head">
            <div className="brand-logo-box small">
              <span className="brand-logo-letter">K</span>
            </div>
            <div>
              <div className="brand-name" style={{ fontSize: 16 }}>Kiro AI</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Financial &amp; Business Intelligence</div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn ${tab === "signup" ? "active" : ""}`}
              onClick={() => setTab("signup")}
            >
              Create Account
            </button>
            <button
              className={`auth-tab-btn ${tab === "reset" ? "active" : ""}`}
              onClick={() => setTab("reset")}
            >
              Reset
            </button>
          </div>

          {/* Title and Subtitle */}
          <div className="auth-header">
            <h2 className="auth-title">
              {tab === "login" && "Welcome back"}
              {tab === "signup" && "Start your journey"}
              {tab === "reset" && "Reset your password"}
            </h2>
            <p className="auth-subtitle">
              {tab === "login" && "Sign in to access your wealth models and business co-pilot."}
              {tab === "signup" && "Join over 45,000 founders and investors using Kiro AI."}
              {tab === "reset" && "Enter your email to receive recovery instructions."}
            </p>
          </div>

          {/* Error and Success Banners */}
          {error && (
            <div className="auth-alert error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="auth-alert success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="auth-form">
            {tab === "signup" && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="auth-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="auth-input"
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                {tab === "reset" ? "Email Address" : "Email or Username"}
              </label>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  id="auth-email-input"
                  type={tab === "reset" ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tab === "reset" ? "name@company.com" : "admin or you@example.com"}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            {tab !== "reset" && (
              <div className="form-group">
                <div className="label-split">
                  <label className="form-label">Password</label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => setTab("reset")}
                      className="forgot-link"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="auth-password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input with-eye"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-toggle-btn"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
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
            )}

            {tab === "login" && (
              <div className="remember-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <span className="submit-spinner" />
              ) : tab === "login" ? (
                "Sign In"
              ) : tab === "signup" ? (
                "Create Free Account"
              ) : (
                "Send Reset Instructions"
              )}
            </button>

            {/* ── FAST 1-CLICK DEMO LOGIN BUTTON ──────────────────────────── */}
            <div className="demo-bypass-card">
              <div className="demo-bypass-text">
                <span className="demo-badge">DEV DEMO</span>
                <span>Fast test credentials: <strong>admin / admin</strong></span>
              </div>
              <button
                type="button"
                onClick={handleAdminBypass}
                className="demo-bypass-btn"
                title="Log in immediately as Admin"
              >
                ⚡ 1-Click Enter
              </button>
            </div>
          </form>

          {/* Social Sign-in Divider */}
          {tab !== "reset" && (
            <>
              <div className="auth-divider">
                <div className="divider-line" />
                <span className="divider-text">or continue with</span>
                <div className="divider-line" />
              </div>

              <button
                id="google-auth-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="google-sso-btn"
              >
                {googleLoading ? (
                  <span className="submit-spinner" />
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Footer Switcher */}
          <div className="auth-footer-switcher">
            {tab === "login" ? (
              <p>
                Don't have an account?{" "}
                <button onClick={() => setTab("signup")} className="switch-link">
                  Create account
                </button>
              </p>
            ) : tab === "signup" ? (
              <p>
                Already have an account?{" "}
                <button onClick={() => setTab("login")} className="switch-link">
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{" "}
                <button onClick={() => setTab("login")} className="switch-link">
                  Back to sign in
                </button>
              </p>
            )}
          </div>

          {/* Legal micro-copy */}
          <div className="auth-legal-footer">
            <span>By proceeding, you agree to Kiro AI's </span>
            <button onClick={() => setLegalModal("terms")} className="legal-btn">
              Terms
            </button>
            <span> and </span>
            <button onClick={() => setLegalModal("privacy")} className="legal-btn">
              Privacy Policy
            </button>
            <span>.</span>
          </div>
        </div>
      </div>

      {/* ── LEGAL MODAL ────────────────────────────────────────────────────── */}
      {legalModal && (
        <div className="legal-modal-backdrop" onClick={() => setLegalModal(null)}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>{legalModal === "terms" ? "Terms of Service" : "Privacy Policy"}</h3>
              <button onClick={() => setLegalModal(null)} className="modal-close-btn">×</button>
            </div>
            <div className="modal-body">
              {legalModal === "terms" ? (
                <>
                  <h4>1. Acceptance of Terms</h4>
                  <p>By accessing Kiro AI, you agree to abide by these terms and applicable Indian and international regulations.</p>
                  <h4>2. Use of Financial AI</h4>
                  <p>Kiro AI provides educational and analytical intelligence. All loan eligibility matching, tax recommendations, and business feasibility models should be validated with authorized institutions.</p>
                  <h4>3. Data Security</h4>
                  <p>Your data is encrypted using AES-256 protocols. You retain total ownership over your financial records.</p>
                </>
              ) : (
                <>
                  <h4>1. Data We Collect</h4>
                  <p>We process only the email, authentication details, and financial parameters you supply to provide personalized models.</p>
                  <h4>2. Bank-Grade Protection</h4>
                  <p>Your data is never sold or shared with advertisers. All statement OCR and telemetry analysis is strictly sandboxed.</p>
                  <h4>3. Data Deletion</h4>
                  <p>You can request total deletion of your profile and data history at any time from your account settings.</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setLegalModal(null)} className="btn btn-primary btn-sm">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSS STYLES ────────────────────────────────────────────────────── */}
      <style>{`
        .login-viewport {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        /* ── AMBIENT ORBS ── */
        .ambient-orb-1 {
          position: absolute;
          width: 550px;
          height: 550px;
          top: -150px;
          left: -150px;
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-orb-2 {
          position: absolute;
          width: 450px;
          height: 450px;
          bottom: -150px;
          right: -150px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── DUAL PANE CONTAINER ── */
        .login-card-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1040px;
          min-height: 640px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          overflow: hidden;
        }

        /* ── SHOWCASE PANE (LEFT) ── */
        .showcase-pane {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .showcase-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .showcase-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .brand-logo-box {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px var(--accent-soft);
        }

        .brand-logo-box.small {
          width: 30px;
          height: 30px;
        }

        .brand-logo-letter {
          color: #ffffff;
          font-weight: 800;
          font-size: 19px;
          line-height: 1;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .brand-tag {
          font-size: 10px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.04em;
        }

        .showcase-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 99px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .live-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .showcase-content {
          margin: 32px 0;
        }

        .showcase-title {
          font-size: 26px;
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 12px;
        }

        .showcase-gradient {
          background: linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .showcase-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 24px;
        }

        /* ── TELEMETRY BOX ── */
        .telemetry-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 18px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }

        .telemetry-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .telemetry-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent);
          background: var(--accent-soft);
          padding: 4px 10px;
          border-radius: 99px;
        }

        .telemetry-val {
          font-size: 15px;
          font-weight: 800;
          color: var(--success);
        }

        .telemetry-metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }

        .tm-item {
          display: flex;
          flex-direction: column;
        }

        .tm-label {
          font-size: 10.5px;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .tm-num {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .text-success { color: var(--success); }
        .text-accent { color: var(--accent); }

        .telemetry-bar {
          height: 5px;
          border-radius: 99px;
          background: var(--border);
          overflow: hidden;
        }

        .telemetry-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent) 0%, #06b6d4 100%);
          border-radius: 99px;
        }

        /* ── TESTIMONIAL MINI ── */
        .showcase-quote-card {
          padding: 14px 16px;
          border-radius: var(--radius);
          background: var(--surface);
          border: 1px solid var(--border);
        }

        .sq-stars {
          color: #f59e0b;
          font-size: 13px;
          letter-spacing: 2px;
          margin-bottom: 4px;
        }

        .sq-text {
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--text-secondary);
          margin-bottom: 6px;
          font-style: italic;
        }

        .sq-author {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
        }

        /* ── SHOWCASE FOOTER ── */
        .showcase-trust-items {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* ── AUTH PANE (RIGHT) ── */
        .auth-pane {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--surface);
        }

        .auth-top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .back-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color var(--transition);
        }

        .back-link-btn:hover {
          color: var(--text);
        }

        .theme-toggle-btn-small {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color var(--transition);
        }

        .theme-toggle-btn-small:hover {
          border-color: var(--border-strong);
        }

        .mobile-brand-head {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .auth-tabs {
          display: flex;
          background: var(--bg-secondary);
          padding: 3px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          margin-bottom: 22px;
        }

        .auth-tab-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: calc(var(--radius) - 3px);
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }

        .auth-tab-btn.active {
          background: var(--surface);
          color: var(--text);
          box-shadow: var(--shadow-sm);
        }

        .auth-header {
          margin-bottom: 20px;
        }

        .auth-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }

        .auth-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .auth-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 12.5px;
          margin-bottom: 16px;
        }

        .auth-alert.error {
          background: var(--danger-soft);
          color: var(--danger);
          border: 1px solid rgba(217, 48, 37, 0.2);
        }

        .auth-alert.success {
          background: var(--success-soft);
          color: var(--success);
          border: 1px solid rgba(24, 128, 56, 0.2);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .label-split {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .auth-input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text);
          font-size: 13.5px;
          font-family: var(--font);
          outline: none;
          transition: all var(--transition);
        }

        .auth-input:focus {
          background: var(--surface);
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }

        .auth-input.with-eye {
          padding-right: 38px;
        }

        .eye-toggle-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color var(--transition);
        }

        .eye-toggle-btn:hover {
          color: var(--text);
        }

        .remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -2px;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .submit-btn {
          width: 100%;
          padding: 11px;
          border-radius: var(--radius-sm);
          background: var(--accent);
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition);
          margin-top: 4px;
          box-shadow: 0 4px 12px var(--accent-soft);
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── FAST 1-CLICK DEMO LOGIN ── */
        .demo-bypass-card {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          border: 1px dashed var(--border-strong);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 6px;
        }

        .demo-bypass-text {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }

        .demo-badge {
          font-size: 10px;
          font-weight: 700;
          background: var(--border);
          color: var(--text-secondary);
          padding: 2px 5px;
          border-radius: 4px;
        }

        .demo-bypass-btn {
          padding: 5px 12px;
          background: var(--accent);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-sm);
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition);
        }

        .demo-bypass-btn:hover {
          background: var(--accent-hover);
        }

        /* ── SOCIAL AUTH DIVIDER ── */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0 14px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .divider-text {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .google-sso-btn {
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all var(--transition);
        }

        .google-sso-btn:hover:not(:disabled) {
          background: var(--bg-secondary);
          border-color: var(--border-strong);
        }

        /* ── FOOTER SWITCHER ── */
        .auth-footer-switcher {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .switch-link {
          background: none;
          border: none;
          color: var(--accent);
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .switch-link:hover {
          text-decoration: underline;
        }

        .auth-legal-footer {
          text-align: center;
          margin-top: 14px;
          font-size: 11.5px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .legal-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 11.5px;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }

        .legal-btn:hover {
          color: var(--accent);
        }

        /* ── LEGAL MODAL ── */
        .legal-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .legal-modal-card {
          width: 100%;
          max-width: 480px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-lg);
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .modal-top h3 {
          font-size: 17px;
          font-weight: 700;
          color: var(--text);
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 22px;
          color: var(--text-muted);
          cursor: pointer;
          line-height: 1;
        }

        .modal-body {
          max-height: 300px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 18px;
        }

        .modal-body h4 {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text);
          margin: 12px 0 4px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .login-card-container {
            grid-template-columns: 1fr;
            max-width: 460px;
            min-height: auto;
          }

          .showcase-pane {
            display: none;
          }

          .auth-pane {
            padding: 32px 24px;
          }

          .mobile-brand-head {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}