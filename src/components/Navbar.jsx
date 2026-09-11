import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state
  const path = location.pathname;
  const isBusiness = path.startsWith("/business");
  const isLaunchpad = path.startsWith("/launchpad");
  const isFinance = !isBusiness && !isLaunchpad;

  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // User state
  const [user, setUser] = useState(null);
  const [userInitial, setUserInitial] = useState("G");

  // Modals & settings
  const [activeModal, setActiveModal] = useState(null);
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "English");

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const modeRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);


  // Load session
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setEditName(parsedUser?.name || "");
        setEditEmail(parsedUser?.email || "");

        const displayName = parsedUser?.name || parsedUser?.username || "Guest";
        if (displayName && displayName.length > 0) {
          setUserInitial(displayName.charAt(0).toUpperCase());
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  }, []);

  // Click outside listener for all popups
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeRef.current && !modeRef.current.contains(event.target)) {
        setModeOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateProfile = () => {
    if (!user) return;
    const updated = { ...user, name: editName, email: editEmail };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    if (editName) setUserInitial(editName.charAt(0).toUpperCase());
    setActiveModal(null);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout`, { method: "POST", credentials: "include" });
    } catch (_) {}
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const currentPath = location.pathname;

  const handleSwitchService = (targetPath) => {
    setModeOpen(false);
    navigate(targetPath);
  };

  return (
    <>
      <header
        style={{
          height: "64px",
          background: "var(--navbar-bg)",
          backdropFilter: "blur(18px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* LEFT: PAGE CONTEXT BREADCRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "19px" }}>
            {currentPath.startsWith("/launchpad") ? "🚀" :
             currentPath.startsWith("/business") ? "🏪" :
             currentPath.startsWith("/loan") ? "🏛️" :
             currentPath.startsWith("/rbi") ? "📜" :
             currentPath.startsWith("/goals") ? "🎯" :
             currentPath.startsWith("/investments") ? "📈" :
             currentPath.startsWith("/tax") ? "🧾" :
             currentPath.startsWith("/news") ? "📰" :
             currentPath.startsWith("/premium") ? "⭐" :
             "📊"}
          </span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-h)", lineHeight: 1.2 }}>
              {currentPath.startsWith("/launchpad") ? "90-Day Business Launchpad" :
               currentPath.startsWith("/business") ? "Business Advisor" :
               currentPath.startsWith("/loan") ? "Govt Loan Advisor" :
               currentPath.startsWith("/rbi") ? "RBI Rules & Norms" :
               currentPath.startsWith("/goals") ? "Goals & Targets" :
               currentPath.startsWith("/investments") ? "Investments" :
               currentPath.startsWith("/tax") ? "Tax & Subsidies" :
               currentPath.startsWith("/news") ? "Market News" :
               currentPath.startsWith("/premium") ? "MSME Pro Access" :
               "Dashboard"}
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
              Kiro AI · Financial Co-Pilot
            </div>
          </div>
        </div>

        {/* RIGHT: MODE SWITCHER + SETTINGS BUTTON + USER PROFILE / SIGN IN */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          
          {/* 1. AMI-VEST SERVICE DROPDOWN */}
          <div ref={modeRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setModeOpen(!modeOpen);
                setSettingsOpen(false);
                setProfileOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 12px 5px 6px",
                borderRadius: "9999px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--text-h)",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary), var(--blue))",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "14px",
                  boxShadow: "0 0 8px var(--glow)",
                  flexShrink: 0,
                }}
              >
                💰
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "800", fontSize: "12px", color: "var(--text-h)", lineHeight: 1.1 }}>
                  Kiro AI
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--primary-accent)",
                    fontWeight: "600",
                  }}
                >
                  Financial Suite
                </div>
              </div>

              <span style={{ fontSize: "8px", color: "var(--muted)", marginLeft: "2px", transform: modeOpen ? "rotate(180deg)" : "none", transition: "transform 0.18s ease" }}>
                ▼
              </span>
            </button>

            {/* Mode Switcher Dropdown Menu */}
            {modeOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "46px",
                  width: "300px",
                  padding: "10px",
                  borderRadius: "16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-md)",
                  backdropFilter: "blur(20px)",
                  zIndex: 1100,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "4px 6px 8px 6px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "9.5px",
                    fontWeight: "800",
                    color: "var(--muted)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Switch Workspace</span>
                  <span style={{ color: "#10B981", fontSize: "8.5px" }}>● ACTIVE</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                  {/* Ami-Vest */}
                  <button
                    onClick={() => handleSwitchService("/")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 10px",
                      borderRadius: "11px",
                      border: isFinance ? "1px solid var(--primary-accent)" : "1px solid var(--border)",
                      background: isFinance
                        ? "var(--primary-soft)"
                        : "var(--surface-soft)",
                      color: "var(--text-h)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "9px",
                        background: "var(--primary-soft)",
                        border: "1px solid var(--border)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      💰
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <b style={{ fontSize: "12.5px", color: "var(--text-h)" }}>Ami-Vest</b>
                        <span style={{ fontSize: "8px", fontWeight: "700", padding: "1px 5px", borderRadius: "999px", background: "var(--primary-soft)", color: "var(--primary-accent)" }}>Finance</span>
                      </div>
                      <small style={{ fontSize: "9.5px", color: "var(--muted)", display: "block", marginTop: "1px" }}>
                        Cashflow, statements, investments & loans
                      </small>
                    </div>
                    {isFinance && <span style={{ color: "var(--primary-accent)", fontWeight: "900", fontSize: "14px" }}>✓</span>}
                  </button>

                  {/* Ami-Business */}
                  <button
                    onClick={() => handleSwitchService("/business")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 10px",
                      borderRadius: "11px",
                      border: isBusiness ? "1px solid #10B981" : "1px solid var(--border)",
                      background: isBusiness
                        ? "rgba(16, 185, 129, 0.15)"
                        : "var(--surface-soft)",
                      color: "var(--text-h)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "9px",
                        background: "rgba(16, 185, 129, 0.2)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      🏪
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <b style={{ fontSize: "12.5px", color: "var(--text-h)" }}>Ami-Business</b>
                        <span style={{ fontSize: "8px", fontWeight: "700", padding: "1px 5px", borderRadius: "999px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>Feasibility</span>
                      </div>
                      <small style={{ fontSize: "9.5px", color: "var(--muted)", display: "block", marginTop: "1px" }}>
                        Hyper-local footfall, demand & break-even
                      </small>
                    </div>
                    {isBusiness && <span style={{ color: "#10B981", fontWeight: "900", fontSize: "14px" }}>✓</span>}
                  </button>

                  {/* Ami-Launch */}
                  <button
                    onClick={() => handleSwitchService("/launchpad")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 10px",
                      borderRadius: "11px",
                      border: isLaunchpad ? "1px solid #8B5CF6" : "1px solid var(--border)",
                      background: isLaunchpad
                        ? "rgba(139, 92, 246, 0.15)"
                        : "var(--surface-soft)",
                      color: "var(--text-h)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "9px",
                        background: "rgba(139, 92, 246, 0.2)",
                        border: "1px solid rgba(139, 92, 246, 0.35)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      🚀
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <b style={{ fontSize: "12.5px", color: "var(--text-h)" }}>Ami-Launch</b>
                        <span style={{ fontSize: "8px", fontWeight: "700", padding: "1px 5px", borderRadius: "999px", background: "rgba(139, 92, 246, 0.2)", color: "#A78BFA" }}>90-Day</span>
                      </div>
                      <small style={{ fontSize: "9.5px", color: "var(--muted)", display: "block", marginTop: "1px" }}>
                        Zero or capital to 90-day profit roadmap
                      </small>
                    </div>
                    {isLaunchpad && <span style={{ color: "#8B5CF6", fontWeight: "900", fontSize: "14px" }}>✓</span>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. SETTINGS BUTTON (WITH CHANGE THEME OPTION) */}
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setModeOpen(false);
                setProfileOpen(false);
              }}
              title="App Settings & Theme"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--primary-accent)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                fontSize: "15px",
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary-accent)";
                e.currentTarget.style.transform = "rotate(30deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "rotate(0deg)";
              }}
            >
              ⚙️
            </button>

            {/* Settings Modal / Dropdown */}
            {settingsOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "46px",
                  width: "280px",
                  padding: "14px",
                  borderRadius: "16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-md)",
                  backdropFilter: "blur(20px)",
                  zIndex: 1100,
                  color: "var(--text)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "14px" }}>⚙️</span>
                  <strong style={{ fontSize: "13px", color: "var(--text-h)" }}>App Settings</strong>
                </div>

                {/* THEME SELECTOR */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--primary-accent)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    🎨 Color Theme
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <button
                      onClick={() => setTheme("emerald")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: "9px",
                        border: theme === "emerald" ? "1px solid #10B981" : "1px solid var(--border)",
                        background: theme === "emerald" ? "rgba(16, 185, 129, 0.18)" : "var(--surface-soft)",
                        color: "var(--text-h)",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>🌲</span> Dark Emerald (Default)
                      </span>
                      {theme === "emerald" && <span style={{ color: "#10B981", fontWeight: "bold" }}>✓</span>}
                    </button>

                    <button
                      onClick={() => setTheme("midnight")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: "9px",
                        border: theme === "midnight" ? "1px solid #38BDF8" : "1px solid var(--border)",
                        background: theme === "midnight" ? "rgba(56, 189, 248, 0.18)" : "var(--surface-soft)",
                        color: "var(--text-h)",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>🌌</span> Cyber Midnight (Deep Dark)
                      </span>
                      {theme === "midnight" && <span style={{ color: "#38BDF8", fontWeight: "bold" }}>✓</span>}
                    </button>

                    <button
                      onClick={() => setTheme("light")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: "9px",
                        border: theme === "light" ? "1px solid #F59E0B" : "1px solid var(--border)",
                        background: theme === "light" ? "rgba(245, 158, 11, 0.18)" : "var(--surface-soft)",
                        color: "var(--text-h)",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>☀️</span> Clean Light Mode
                      </span>
                      {theme === "light" && <span style={{ color: "#F59E0B", fontWeight: "bold" }}>✓</span>}
                    </button>
                  </div>
                </div>

                {/* LANGUAGE PREFERENCE */}
                <div>
                  <label style={{ display: "block", fontSize: "10.5px", fontWeight: "700", color: "var(--primary-accent)", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    🌐 Language
                  </label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => {
                        setLanguage("English");
                        localStorage.setItem("language", "English");
                        localStorage.setItem("kiro_alexa_language", "en");
                      }}
                      style={{
                        flex: 1,
                        padding: "7px",
                        borderRadius: "8px",
                        border: language === "English" ? "1px solid var(--primary-accent)" : "1px solid var(--border)",
                        background: language === "English" ? "linear-gradient(90deg, var(--primary), var(--blue))" : "var(--surface-soft)",
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("Hindi");
                        localStorage.setItem("language", "Hindi");
                        localStorage.setItem("kiro_alexa_language", "hi");
                      }}
                      style={{
                        flex: 1,
                        padding: "7px",
                        borderRadius: "8px",
                        border: language === "Hindi" ? "1px solid var(--primary-accent)" : "1px solid var(--border)",
                        background: language === "Hindi" ? "linear-gradient(90deg, var(--primary), var(--blue))" : "var(--surface-soft)",
                        color: "#FFFFFF",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                      }}
                    >
                      हिन्दी
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. USER PROFILE / SIGN IN BUTTON */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setModeOpen(false);
                setSettingsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px 4px 5px",
                borderRadius: "9999px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                color: "var(--text-h)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary), var(--blue))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12.5px",
                  fontWeight: "bold",
                  color: "#FFFFFF",
                }}
              >
                {userInitial}
              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "700", fontSize: "11.5px", color: "var(--text-h)" }}>
                  {user?.name || user?.username || "Guest"}
                </div>
                <div style={{ fontSize: "9px", color: "var(--muted)" }}>
                  {user ? "Active" : "Sign In"}
                </div>
              </div>

              <span style={{ fontSize: "8px", color: "var(--muted)", marginLeft: "2px" }}>
                {profileOpen ? "▲" : "▼"}
              </span>
            </button>

            {/* Profile Dropdown Modal */}
            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "46px",
                  width: "300px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "18px",
                  padding: "16px",
                  boxShadow: "var(--shadow-md)",
                  color: "var(--text)",
                  zIndex: 1100,
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* User Info Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--primary), var(--blue))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      fontWeight: "800",
                      color: "#FFFFFF",
                    }}
                  >
                    {userInitial}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-h)" }}>{user?.name || "Guest Account"}</div>
                    <div style={{ color: "var(--muted)", fontSize: "10.5px" }}>{user?.email || "No email linked"}</div>
                    <div style={{ color: "var(--primary-accent)", fontSize: "9.5px", marginTop: "2px" }}>
                      User ID: #{user?.id || "Unregistered"}
                    </div>
                  </div>
                </div>

                {/* GUEST NUDGE OR USER ACTIONS */}
                {!user ? (
                  <div style={{ margin: "12px 0 6px 0" }}>
                    <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0 0 10px 0", lineHeight: "1.45" }}>
                      Sign in to sync your bank records, get personalized MSME financial insights, and save your decisions.
                    </p>
                    <button
                      onClick={() => { setProfileOpen(false); navigate("/login"); }}
                      style={{
                        width: "100%",
                        padding: "9px",
                        background: "linear-gradient(90deg, var(--primary), var(--blue))",
                        border: "none",
                        borderRadius: "10px",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Sign In / Register →
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "12px 0" }}>
                      <button
                        onClick={() => { setActiveModal("edit_profile"); setProfileOpen(false); }}
                        style={profileMenuBtn}
                      >
                        <span>👤</span> Edit Profile
                      </button>
                      <button
                        onClick={() => { setActiveModal("change_password"); setProfileOpen(false); }}
                        style={profileMenuBtn}
                      >
                        <span>🔒</span> Security & Password
                      </button>
                      <button
                        onClick={() => { setActiveModal("privacy"); setProfileOpen(false); }}
                        style={profileMenuBtn}
                      >
                        <span>🛡️</span> Privacy Policy
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate("/premium"); }}
                        style={profileMenuBtn}
                      >
                        <span>⭐</span> MSME Pro Intelligence
                      </button>
                    </div>

                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        borderRadius: "10px",
                        color: "#FCA5A5",
                        fontWeight: "700",
                        fontSize: "11.5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* EDIT PROFILE MODAL */}
      {activeModal === "edit_profile" && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: "15px", color: "var(--text-h)" }}>Edit Profile</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtn}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
              <div>
                <label style={modalLabel}>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={modalInput}
                />
              </div>
              <div>
                <label style={modalLabel}>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={modalInput}
                />
              </div>
              <button onClick={handleUpdateProfile} style={modalSubmitBtn}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {activeModal === "change_password" && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: "15px", color: "var(--text-h)" }}>Change Password</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtn}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
              <div>
                <label style={modalLabel}>Current Password</label>
                <input type="password" placeholder="••••••••" style={modalInput} />
              </div>
              <div>
                <label style={modalLabel}>New Password</label>
                <input type="password" placeholder="••••••••" style={modalInput} />
              </div>
              <button
                onClick={() => { alert("Password updated successfully!"); setActiveModal(null); }}
                style={modalSubmitBtn}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {activeModal === "privacy" && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0, fontSize: "15px", color: "var(--text-h)" }}>Privacy & Data Rights</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtn}>✕</button>
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--muted)", lineHeight: "1.6", marginTop: "14px" }}>
              <p>• <strong>Zero Data Selling:</strong> Your financial statements and transaction data are encrypted and never sold.</p>
              <p>• <strong>Strict Isolation:</strong> Your transaction records are isolated to your unique user account.</p>
              <p>• <strong>Account Erasure:</strong> You can request complete erasure of your records anytime.</p>
            </div>
            <button onClick={() => setActiveModal(null)} style={{ ...modalSubmitBtn, marginTop: "14px" }}>
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const profileMenuBtn = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "8px 10px",
  borderRadius: "9px",
  background: "var(--surface-soft)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontSize: "11.5px",
  fontWeight: "500",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.18s ease",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(8px)",
  display: "grid",
  placeItems: "center",
  zIndex: 9999,
};

const modalContent = {
  width: "360px",
  maxWidth: "calc(100vw - 32px)",
  background: "var(--surface)",
  border: "1px solid var(--border-strong)",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "var(--shadow-md)",
  color: "var(--text)",
  transition: "all 0.28s ease",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeBtn = {
  background: "none",
  border: "none",
  color: "var(--muted)",
  fontSize: "15px",
  cursor: "pointer",
};

const modalLabel = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  color: "var(--muted)",
  marginBottom: "5px",
};

const modalInput = {
  width: "100%",
  padding: "8px 11px",
  borderRadius: "9px",
  border: "1px solid var(--border)",
  background: "var(--surface-soft)",
  color: "var(--text-h)",
  fontSize: "12px",
  boxSizing: "border-box",
  outline: "none",
  transition: "all 0.2s ease",
};

const modalSubmitBtn = {
  width: "100%",
  padding: "9px",
  background: "linear-gradient(90deg, var(--primary), var(--blue))",
  border: "none",
  borderRadius: "9px",
  color: "#fff",
  fontWeight: "700",
  fontSize: "11.5px",
  cursor: "pointer",
};

export default Navbar;