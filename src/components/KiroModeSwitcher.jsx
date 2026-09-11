import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/*
  Kiro AI 2.0 — Global Mode Switcher

  Three interfaces:
    💰 Finance
    🏠 Rent
    🏪 Business

  Put this component ONCE in your shared/root layout so it stays
  available while the user moves between pages.

  Expected routes:
    Finance  -> /dashboard   (change to "/" if your finance page is "/")
    Rent     -> /rent
    Business -> /business

  This component does not touch your finance database or Alexa logic.
*/

const MODES = [
  {
    id: "finance",
    name: "Finance",
    icon: "💰",
    path: "/dashboard",
    description: "Money, goals, loans and investments",
  },
  {
    id: "rent",
    name: "Rent",
    icon: "🏠",
    path: "/rent",
    description: "PG, rooms, flats and stays",
  },
  {
    id: "business",
    name: "Business",
    icon: "🏪",
    path: "/business",
    description: "Business ideas and local feasibility",
  },
];

function modeFromPath(pathname) {
  if (pathname.startsWith("/rent")) return "rent";
  if (pathname.startsWith("/business")) return "business";
  return "finance";
}

export default function Kiro AIModeSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  const rootRef = useRef(null);

  const activeMode = useMemo(
    () => modeFromPath(location.pathname),
    [location.pathname]
  );

  const active = MODES.find((mode) => mode.id === activeMode) || MODES[0];

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "kiro_active_mode",
      activeMode
    );
  }, [activeMode]);

  function switchMode(mode) {
    setOpen(false);
    navigate(mode.path);
  }

  return (
    <>
      <style>{`
        .kiro-mode-root {
          position: fixed;
          right: 22px;
          bottom: 22px;
          z-index: 10050;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .kiro-mode-panel {
          width: 286px;
          margin-bottom: 10px;
          padding: 10px;
          border: 1px solid rgba(45, 220, 207, .28);
          border-radius: 20px;
          background: rgba(5, 20, 35, .97);
          box-shadow:
            0 22px 60px rgba(0,0,0,.42),
            0 0 30px rgba(10,190,185,.12);
          backdrop-filter: blur(18px);
        }

        .kiro-mode-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 7px 8px 10px;
        }

        .kiro-mode-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .9px;
          text-transform: uppercase;
          color: #dceaf2;
        }

        .kiro-mode-subtitle {
          margin-top: 2px;
          font-size: 10px;
          color: #6f8798;
        }

        .kiro-mode-list {
          display: grid;
          gap: 7px;
        }

        .kiro-mode-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 14px;
          background: rgba(255,255,255,.035);
          color: #fff;
          text-align: left;
          cursor: pointer;
          transition:
            transform .15s ease,
            border-color .15s ease,
            background .15s ease;
        }

        .kiro-mode-item:hover {
          transform: translateY(-1px);
          border-color: rgba(24,168,112,.55);
          background: rgba(24,168,112,.08);
        }

        .kiro-mode-item.active {
          border-color: rgba(24,168,112,.8);
          background: rgba(24,168,112,.13);
        }

        .kiro-mode-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          flex: 0 0 36px;
          border-radius: 11px;
          background: rgba(255,255,255,.07);
          font-size: 18px;
        }

        .kiro-mode-copy {
          min-width: 0;
          flex: 1;
        }

        .kiro-mode-name {
          font-size: 12px;
          font-weight: 800;
          color: #eef7fb;
        }

        .kiro-mode-desc {
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 9px;
          color: #7892a4;
        }

        .kiro-mode-badge {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .5px;
          color: #69e0c6;
        }

        .kiro-mode-trigger {
          min-width: 64px;
          height: 54px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 11px;
          border: 1px solid rgba(24,168,112,.62);
          border-radius: 18px;
          background: rgba(5, 24, 39, .96);
          color: #fff;
          cursor: pointer;
          box-shadow:
            0 10px 28px rgba(0,0,0,.32),
            0 0 22px rgba(10,190,185,.10);
        }

        .kiro-mode-trigger:hover {
          border-color: rgba(48,229,209,.9);
        }

        .kiro-mode-trigger-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #11a89a, #0a77a2);
          font-size: 19px;
        }

        .kiro-mode-trigger-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .kiro-mode-trigger-name {
          font-size: 11px;
          font-weight: 900;
        }

        .kiro-mode-trigger-caption {
          margin-top: 2px;
          font-size: 8px;
          color: #7e97a7;
        }

        .kiro-mode-arrow {
          margin-left: 1px;
          font-size: 12px;
          color: #8fa7b5;
        }

        @media (max-width: 560px) {
          .kiro-mode-root {
            right: 12px;
            bottom: 12px;
          }

          .kiro-mode-panel {
            width: min(286px, calc(100vw - 24px));
          }

          .kiro-mode-trigger-copy,
          .kiro-mode-arrow {
            display: none;
          }

          .kiro-mode-trigger {
            width: 54px;
            min-width: 54px;
            justify-content: center;
            padding: 7px;
          }
        }
      `}</style>

      <div
        ref={rootRef}
        className="kiro-mode-root"
        aria-label="Kiro AI application mode switcher"
      >
        {open && (
          <div className="kiro-mode-panel">
            <div className="kiro-mode-heading">
              <div>
                <div className="kiro-mode-title">
                  Kiro AI 2.0
                </div>
                <div className="kiro-mode-subtitle">
                  Choose your workspace
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close mode switcher"
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#8fa7b5",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>

            <div className="kiro-mode-list">
              {MODES.map((mode) => {
                const isActive = mode.id === activeMode;

                return (
                  <button
                    key={mode.id}
                    className={`kiro-mode-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => switchMode(mode)}
                  >
                    <div className="kiro-mode-icon">
                      {mode.icon}
                    </div>

                    <div className="kiro-mode-copy">
                      <div className="kiro-mode-name">
                        {mode.name}
                      </div>

                      <div className="kiro-mode-desc">
                        {mode.description}
                      </div>
                    </div>

                    {isActive && (
                      <div className="kiro-mode-badge">
                        ACTIVE
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          className="kiro-mode-trigger"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={`Current mode: ${active.name}. Open Kiro AI mode switcher.`}
        >
          <span className="kiro-mode-trigger-icon">
            {active.icon}
          </span>

          <span className="kiro-mode-trigger-copy">
            <span className="kiro-mode-trigger-name">
              {active.name}
            </span>
            <span className="kiro-mode-trigger-caption">
              Switch workspace
            </span>
          </span>

          <span className="kiro-mode-arrow">
            {open ? "⌄" : "⌃"}
          </span>
        </button>
      </div>
    </>
  );
}
