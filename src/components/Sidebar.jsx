import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useVault } from "../context/VaultContext";

// ── Icons ──────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  kiro:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  ask:       "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  missions:  "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  vault:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  finance:   "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  goals:     "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  invest:    "M23 6l-9.5 9.5-5-5L1 18",
  tax:       "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  business:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  launchpad: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z",
  loan:      "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  news:      "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z",
  rbi:       "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  sun:       "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 100-10 5 5 0 000 10z",
  moon:      "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  logout:    "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  trash:     "M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2",
  plus:      "M12 5v14M5 12h14",
  premium:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

// ── Vault Progress Ring (small) ────────────────────────────────────────────────
function MiniVaultRing({ pct, size = 22 }) {
  const r = (size - 3) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? "var(--success)" : pct >= 40 ? "var(--accent)" : "var(--warning)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={2.5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

// ── Primary Nav Item (Ask Kiro / Missions / Vault) ─────────────────────────────
function PrimaryNavItem({ to, icon, label, badge, extra, onClick }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== "/" || location.pathname === "/");

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={`nav-item nav-item-primary ${isActive ? "active" : ""}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 2,
      }}
    >
      <Icon d={ICONS[icon]} size={17} strokeWidth={2} />
      <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          minWidth: 20, height: 20, borderRadius: "99px",
          background: "var(--accent)", color: "#fff",
          fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 5px",
        }}>{badge}</span>
      )}
      {extra}
    </NavLink>
  );
}

// ── Secondary Nav Item ─────────────────────────────────────────────────────────
function SecNavItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
    >
      <Icon d={ICONS[icon]} size={15} />
      <span>{label}</span>
    </NavLink>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { completeness, vault } = useVault();

  const [recentChats, setRecentChats] = useState([]);
  const [missionCount, setMissionCount] = useState(0);

  useEffect(() => {
    try {
      const chats = JSON.parse(localStorage.getItem("kiro_chats") || "[]");
      setRecentChats(chats.slice(0, 5));
    } catch { setRecentChats([]); }

    try {
      const missions = JSON.parse(localStorage.getItem("kiro_missions") || "[]");
      setMissionCount(missions.length);
    } catch { setMissionCount(0); }
  }, [location.pathname]);

  const deleteChat = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    const updated = recentChats.filter(c => c.id !== id);
    setRecentChats(updated);
    const all = JSON.parse(localStorage.getItem("kiro_chats") || "[]").filter(c => c.id !== id);
    localStorage.setItem("kiro_chats", JSON.stringify(all));
  };

  const userName = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}").name || "User"; } catch { return "User"; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isMobile = window.innerWidth <= 768;

  const sidebarStyle = {
    width: 248,
    minWidth: 248,
    height: "100vh",
    background: "var(--sidebar-bg)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flexShrink: 0,
    position: isMobile ? "fixed" : "relative",
    top: 0, left: 0,
    zIndex: 200,
    transform: isMobile ? (isOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
    transition: "transform 220ms cubic-bezier(0.4,0,0.2,1)",
  };

  return (
    <aside style={sidebarStyle}>

      {/* ── Brand ─────────────────────────────────────── */}
      <div style={{ padding: "16px 14px 12px" }}>
        <div
          onClick={() => { navigate("/home"); onClose?.(); }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", cursor: "pointer", borderRadius: "var(--radius-sm)", marginBottom: 12 }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent), var(--violet))",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(99,102,241,0.40)",
          }}>
            <Icon d={ICONS.kiro} size={15} strokeWidth={2.2} />
            <span style={{ display: "none" }}>K</span>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text)", lineHeight: 1.1 }}>Kiro AI</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--accent-text)", letterSpacing: "0.05em" }}>COMMAND CENTER</div>
          </div>
        </div>

        {/* New Chat button */}
        <button
          onClick={() => { navigate("/chat"); onClose?.(); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            padding: "9px 14px", borderRadius: "var(--radius-sm)",
            background: "var(--accent)", color: "#fff",
            fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
            transition: "all var(--anim-medium)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.transform = "none"; }}
        >
          <Icon d={ICONS.plus} size={14} strokeWidth={2.5} />
          New Mission
        </button>
      </div>

      {/* ── Scrollable nav ────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px 12px", display: "flex", flexDirection: "column", gap: 1 }}>

        {/* ── PRIMARY: Core 3 ── */}
        <PrimaryNavItem to="/chat" icon="ask" label="Ask Kiro" onClick={onClose} />

        <PrimaryNavItem
          to="/home"
          icon="missions"
          label="Missions"
          badge={missionCount || null}
          onClick={onClose}
        />

        <PrimaryNavItem
          to="/vault"
          icon="vault"
          label="My Vault"
          extra={<MiniVaultRing pct={completeness} />}
          onClick={onClose}
        />

        {/* Recent chats */}
        {recentChats.length > 0 && (
          <>
            <div className="sidebar-label" style={{ marginTop: 14 }}>Recent Chats</div>
            {recentChats.map(chat => (
              <div
                key={chat.id}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "6px 10px", borderRadius: "var(--radius-sm)",
                  cursor: "pointer", fontSize: 13,
                  color: location.pathname === `/chat/${chat.id}` ? "var(--text)" : "var(--text-secondary)",
                  background: location.pathname === `/chat/${chat.id}` ? "var(--sidebar-active)" : "transparent",
                  transition: "background var(--anim-fast)",
                }}
                onClick={() => { navigate(`/chat/${chat.id}`); onClose?.(); }}
                onMouseEnter={e => { if (location.pathname !== `/chat/${chat.id}`) e.currentTarget.style.background = "var(--sidebar-hover)"; }}
                onMouseLeave={e => { if (location.pathname !== `/chat/${chat.id}`) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon d={ICONS.ask} size={13} />
                <span className="truncate flex-1">{chat.title || "Untitled chat"}</span>
                <button
                  onClick={e => deleteChat(e, chat.id)}
                  style={{ opacity: 0.4, padding: 2, color: "var(--text-muted)", border: "none", background: "none", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
                >
                  <Icon d={ICONS.trash} size={12} />
                </button>
              </div>
            ))}
          </>
        )}

        {/* ── SECONDARY: Finance ── */}
        <div className="sidebar-label" style={{ marginTop: 14 }}>Finance</div>
        <SecNavItem to="/finance"     icon="finance"   label="Dashboard"       onClick={onClose} />
        <SecNavItem to="/goals"       icon="goals"     label="Goals"           onClick={onClose} />
        <SecNavItem to="/investments" icon="invest"    label="Investments"     onClick={onClose} />
        <SecNavItem to="/tax"         icon="tax"       label="Tax & Subsidies" onClick={onClose} />

        {/* ── SECONDARY: Business ── */}
        <div className="sidebar-label" style={{ marginTop: 8 }}>Business</div>
        <SecNavItem to="/business"  icon="business"  label="Advisor"         onClick={onClose} />
        <SecNavItem to="/launchpad" icon="launchpad" label="90-Day Launchpad" onClick={onClose} />
        <SecNavItem to="/loan"      icon="loan"      label="Loan Assistant"   onClick={onClose} />

        {/* ── SECONDARY: Tools ── */}
        <div className="sidebar-label" style={{ marginTop: 8 }}>Tools</div>
        <SecNavItem to="/news" icon="news" label="Market News"   onClick={onClose} />
        <SecNavItem to="/rbi"  icon="rbi"  label="RBI Rules"     onClick={onClose} />

      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px 10px 14px", display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="nav-item"
          style={{ color: "var(--text-secondary)" }}
        >
          <Icon d={theme === "dark" ? ICONS.sun : ICONS.moon} size={15} />
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>

        {/* Settings */}
        <SecNavItem to="/settings" icon="settings" label="Settings" onClick={onClose} />

        {/* Premium */}
        <SecNavItem to="/premium" icon="premium" label="Upgrade to Pro" onClick={onClose} />

        {/* User */}
        <div
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px", borderRadius: "var(--radius-sm)",
            cursor: "pointer", marginTop: 4,
            transition: "background var(--anim-fast)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--sidebar-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          title="Sign out"
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-soft), var(--violet-soft))",
            border: "1.5px solid var(--accent-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "var(--accent-text)", flexShrink: 0,
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }} className="truncate">{userName}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Sign out</div>
          </div>
          <Icon d={ICONS.logout} size={13} />
        </div>
      </div>
    </aside>
  );
}