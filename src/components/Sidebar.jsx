import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  // PRIMARY: Financial Management (dedicated AmiVest purpose)
  const financialMenu = [
    { name: "Dashboard", path: "/", icon: "📊", desc: "Cashflow & financial health" },
    { name: "Goals & Targets", path: "/goals", icon: "🎯", desc: "Business & capital milestones" },
    { name: "Investments", path: "/investments", icon: "📈", desc: "Growth & surplus allocation" },
    { name: "Tax & Subsidies", path: "/tax", icon: "🧾", desc: "Tax savings & filing alerts" },
    { name: "Market News", path: "/news", icon: "📰", desc: "Local trade & scheme updates" },
  ];

  // SECONDARY: Entrepreneur toolset
  const entrepreneurMenu = [
    {
      name: "Ami-Business Feasibility",
      path: "/business",
      icon: "🏪",
      badge: "Market AI",
      badgeColor: "#10B981",
      desc: "Hyper-local demand & footfall",
    },
    {
      name: "90-Day Launchpad",
      path: "/launchpad",
      icon: "🚀",
      badge: "Roadmap",
      badgeColor: "#8B5CF6",
      desc: "Zero to first profit plan",
    },
    {
      name: "Govt Loan Advisor",
      path: "/loan",
      icon: "🏛️",
      badge: "Subsidies",
      badgeColor: "#06B6D4",
      desc: "PMEGP, Mudra & repayment fit",
    },
    {
      name: "RBI Rules & Norms",
      path: "/rbi",
      icon: "📜",
      badge: "Compliance",
      badgeColor: "#8B5CF6",
      desc: "Lending rules & protection",
    },
  ];

  return (
    <aside
      style={{
        width: "275px",
        minWidth: "275px",
        height: "100vh",
        maxHeight: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        padding: "18px 14px 18px 14px",
        boxShadow: "var(--shadow-md)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        zIndex: 100,
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        onClick={() => navigate("/")}
        style={{
          cursor: "pointer",
          paddingBottom: "16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "11px",
              background: "linear-gradient(135deg, var(--primary), var(--primary-accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(13, 148, 136, 0.4)",
              fontSize: "18px",
              fontWeight: "900",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "21px",
                fontWeight: "800",
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #14B8A6, #2DD4BF, #38BDF8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Amivest AI
            </h1>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.9px",
                color: "var(--muted)",
              }}
            >
              Rural & MSME Co-Pilot
            </span>
          </div>
        </div>
      </div>

      {/* Nav List Wrapper */}
      <div
        className="sidebar-nav-scroll"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          overflowY: "auto",
          paddingRight: "2px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* SECTION 1: FINANCIAL PLANNING — Primary */}
        <div>
          <div style={{ padding: "0 6px 9px 6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "1.3px",
                textTransform: "uppercase",
                color: "var(--primary-accent)",
              }}
            >
              💼 Financial Planning
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {financialMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  padding: "10px 13px",
                  borderRadius: "11px",
                  textDecoration: "none",
                  transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: isActive ? "var(--primary-soft)" : "var(--surface-soft)",
                  border: isActive ? "1px solid var(--border-strong)" : "1px solid var(--border)",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  color: isActive ? "var(--text-h)" : "var(--text)",
                })}
              >
                {({ isActive }) => (
                  <>
                    <span
                      style={{
                        fontSize: "17px",
                        flexShrink: 0,
                        filter: isActive ? "drop-shadow(0 0 6px rgba(45, 212, 191, 0.5))" : "none",
                      }}
                    >
                      {item.icon}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: isActive ? "700" : "600",
                          letterSpacing: "-0.2px",
                          color: isActive ? "var(--text-h)" : "var(--text)",
                          lineHeight: "1.25",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          color: isActive ? "var(--primary-accent)" : "var(--muted)",
                          marginTop: "2px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Subtle Divider between main sections */}
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--border-strong), transparent)",
            margin: "2px 4px",
          }}
        />

        {/* SECTION 2: ENTREPRENEUR ENGINES — Secondary */}
        <div>
          <div style={{ padding: "0 6px 9px 6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "1.3px",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              🏪 Entrepreneur Tools
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {entrepreneurMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 13px",
                  borderRadius: "11px",
                  textDecoration: "none",
                  transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: isActive ? "var(--primary-soft)" : "var(--surface-soft)",
                  border: isActive ? "1px solid var(--border-strong)" : "1px solid var(--border)",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  color: isActive ? "var(--text-h)" : "var(--text)",
                })}
              >
                {({ isActive }) => (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontSize: "17px",
                          flexShrink: 0,
                          filter: isActive ? "drop-shadow(0 0 6px rgba(45, 212, 191, 0.5))" : "none",
                        }}
                      >
                        {item.icon}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13.5px",
                            fontWeight: isActive ? "700" : "600",
                            color: isActive ? "var(--text-h)" : "var(--text)",
                            lineHeight: "1.25",
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: "10.5px",
                            color: isActive ? "var(--primary-accent)" : "var(--muted)",
                            marginTop: "2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: "9.5px",
                          fontWeight: "700",
                          padding: "3px 7px",
                          borderRadius: "9999px",
                          background: `${item.badgeColor}24`,
                          color: item.badgeColor,
                          border: `1px solid ${item.badgeColor}55`,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginLeft: "6px",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Card */}
      <div
        style={{
          padding: "14px",
          borderRadius: "14px",
          background: "var(--surface-soft)",
          border: "1px solid var(--border-strong)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🚀</span>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-h)" }}>
            MSME Pro Intelligence
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)", lineHeight: "1.4" }}>
          Instant subsidy checks, localized footfall data & loan assistance.
        </p>
        <button
          onClick={() => navigate("/premium")}
          style={{
            marginTop: "4px",
            width: "100%",
            padding: "9px 12px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(90deg, #0D9488, #06B6D4)",
            color: "#FFFFFF",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "12px",
            boxShadow: "0 3px 10px rgba(13, 148, 136, 0.3)",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ⭐ Unlock Pro Access
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;