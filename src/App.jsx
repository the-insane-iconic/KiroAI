import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "./App.css";

import { ThemeProvider } from "./context/ThemeContext";
import { VaultProvider } from "./context/VaultContext";
import Layout from "./components/Layout";

// ── Auth guard ────────────────────────────────────────────────────────────────
function isLoggedIn() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Boolean(user?.email || user?.uid);
  } catch {
    return false;
  }
}

function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// ── Lazy page imports ──────────────────────────────────────────────────────────
const Landing      = lazy(() => import("./pages/Landing"));
const Home         = lazy(() => import("./pages/Home"));
const ChatCanvas   = lazy(() => import("./pages/ChatCanvas"));
const Login        = lazy(() => import("./pages/Login"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Goals        = lazy(() => import("./pages/Goals"));
const Investments  = lazy(() => import("./pages/Investments"));
const TaxAlerts    = lazy(() => import("./pages/TaxAlerts"));
const BusinessAdvisor   = lazy(() => import("./pages/BusinessAdvisor"));
const BusinessLaunchpad = lazy(() => import("./pages/BusinessLaunchpad"));
const LoanAssistant     = lazy(() => import("./pages/LoanAssistant"));
const News         = lazy(() => import("./pages/News"));
const RBIRules     = lazy(() => import("./pages/RBIRules"));
const Premium      = lazy(() => import("./pages/Premium"));
const Vault        = lazy(() => import("./pages/Vault"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms        = lazy(() => import("./pages/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Disclaimer   = lazy(() => import("./pages/Disclaimer"));

// ── Loading fallback ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        flexDirection: "column",
        gap: 12,
        color: "var(--text-muted)",
      }}
    >
      <div className="spinner" style={{ width: 24, height: 24 }} />
      <span style={{ fontSize: 13 }}>Loading…</span>
    </div>
  );
}

// ── Smart Root Route: Landing for guests, Home for authenticated users ────────
function RootRoute() {
  return isLoggedIn() ? (
    <RequireAuth>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Home />
        </Suspense>
      </Layout>
    </RequireAuth>
  ) : (
    <Suspense fallback={<PageLoader />}>
      <Landing />
    </Suspense>
  );
}

// ── Settings page (inline, lightweight) ───────────────────────────────────────
function SettingsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Manage your account and preferences</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Account</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Name", JSON.parse(localStorage.getItem("user") || "{}").name || "—"],
            ["Email", JSON.parse(localStorage.getItem("user") || "{}").email || "—"],
            ["Plan", "Free"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ maxWidth: 560 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Upgrade to Pro</h3>
        <p style={{ fontSize: 14, marginBottom: 14 }}>Unlock unlimited chats, advanced analysis, and priority support.</p>
        <a href="/premium" className="btn btn-primary btn-sm">View Plans</a>
      </div>
    </div>
  );
}

// ── Not found page ────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="empty-state" style={{ height: "100%", justifyContent: "center" }}>
      <div className="empty-state-icon">🔍</div>
      <h3>Page not found</h3>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>Go home</a>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
    <VaultProvider>
      <BrowserRouter>
        <Routes>
          {/* Smart Root Route */}
          <Route path="/" element={<RootRoute />} />

          {/* Public routes */}
          <Route path="/landing" element={<Suspense fallback={<PageLoader />}><Landing /></Suspense>} />
          <Route path="/login"   element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
          <Route path="/terms"   element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
          <Route path="/refund"  element={<Suspense fallback={<PageLoader />}><RefundPolicy /></Suspense>} />
          <Route path="/disclaimer" element={<Suspense fallback={<PageLoader />}><Disclaimer /></Suspense>} />

          {/* Protected routes — wrapped in Layout (sidebar + main) */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="home"        element={<Home />} />
                      <Route path="chat"        element={<ChatCanvas />} />
                      <Route path="chat/:chatId" element={<ChatCanvas />} />

                      {/* Finance */}
                      <Route path="finance"     element={<Dashboard />} />
                      <Route path="goals"       element={<Goals />} />
                      <Route path="investments" element={<Investments />} />
                      <Route path="tax"         element={<TaxAlerts />} />

                      {/* Business */}
                      <Route path="business"  element={<BusinessAdvisor />} />
                      <Route path="launchpad" element={<BusinessLaunchpad />} />
                      <Route path="loan"      element={<LoanAssistant />} />

                      {/* Tools */}
                      <Route path="news"     element={<News />} />
                      <Route path="rbi"      element={<RBIRules />} />
                      <Route path="premium"  element={<Premium />} />
                      <Route path="vault"    element={<Vault />} />
                      <Route path="settings" element={<SettingsPage />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </VaultProvider>
    </ThemeProvider>
  );
}
