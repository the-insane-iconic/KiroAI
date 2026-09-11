import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Sidebar handles structured navigation */}
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "radial-gradient(ellipse at 80% 0%, var(--glow) 0%, transparent 60%), var(--bg)",
          transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Navbar />

        <main
          style={{
            flex: 1,
            padding: "24px 28px 40px 28px",
            overflowY: "auto",
            boxSizing: "border-box",
            transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Child pages (Dashboard, Goals, Loans, Investments, etc.) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;