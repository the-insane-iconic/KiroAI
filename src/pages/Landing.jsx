import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // ── Interactive Calculator State ──────────────────────────────────────────
  const [calcType, setCalcType] = useState("sip"); // "sip" | "business"
  const [monthlyInvest, setMonthlyInvest] = useState(15000);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(14);

  // Business ROI state
  const [initialCapital, setInitialCapital] = useState(500000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(120000);
  const [profitMargin, setProfitMargin] = useState(25);

  // SIP calculation
  const totalMonths = years * 12;
  const monthlyRate = expectedReturn / 12 / 100;
  const investedAmount = monthlyInvest * totalMonths;
  const futureValue = Math.round(
    monthlyInvest *
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      (1 + monthlyRate)
  );
  const wealthGained = futureValue - investedAmount;

  // Business calculation
  const monthlyProfit = Math.round((monthlyRevenue * profitMargin) / 100);
  const annualProfit = monthlyProfit * 12;
  const breakEvenMonths = Math.max(1, Math.round(initialCapital / Math.max(monthlyProfit, 1)));
  const threeYearRoi = Math.round(((annualProfit * 3 - initialCapital) / initialCapital) * 100);

  // FAQ open item tracker
  const [openFaq, setOpenFaq] = useState(null);

  // Quick 1-Click Demo Login handler
  const handleQuickDemo = () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        uid: "1",
        name: "Admin",
        email: "admin@kiro.ai",
      })
    );
    navigate("/");
  };

  return (
    <div className="landing-viewport">
      {/* ── STICKY TOP NAVBAR ────────────────────────────────────────────── */}
      <header className="landing-header">
        <div className="landing-nav-inner">
          <div className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="landing-logo-box">
              <span className="landing-logo-letter">K</span>
              <div className="landing-logo-glow" />
            </div>
            <div className="landing-brand-text">
              <span className="landing-brand-name">Kiro AI</span>
              <span className="landing-brand-badge">2.0</span>
            </div>
          </div>

          <nav className="landing-links">
            <a href="#features" className="nav-anchor">Features</a>
            <a href="#solutions" className="nav-anchor">Solutions</a>
            <a href="#calculator" className="nav-anchor">Simulator</a>
            <a href="#pricing" className="nav-anchor">Pricing</a>
            <a href="#faq" className="nav-anchor">FAQ</a>
          </nav>

          <div className="landing-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            <button onClick={() => navigate("/login")} className="landing-btn-secondary">
              Sign In
            </button>

            <button onClick={() => navigate("/login?tab=signup")} className="landing-btn-primary">
              Get Started Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-ambient-glow-1" />
        <div className="hero-ambient-glow-2" />

        <div className="hero-content">
          <div className="hero-pill-badge">
            <span className="hero-pulse-dot" />
            <span>KIRO AI 2.0 IS LIVE</span>
            <span className="hero-pill-divider">|</span>
            <span className="hero-pill-sub">Dual-Core Intelligence for Finance & Business</span>
          </div>

          <h1 className="hero-title">
            Master Your Finances. <br />
            Scale Your Business. <br />
            <span className="hero-gradient-text">All Powered by AI.</span>
          </h1>

          <p className="hero-description">
            The autonomous intelligence platform combining real-time cashflow optimization,
            instant government loan matching, 90-day business launchpads, and automated tax compliance.
          </p>

          <div className="hero-cta-group">
            <button onClick={() => navigate("/login?tab=signup")} className="hero-cta-primary">
              <span>Start Free Trial</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button onClick={handleQuickDemo} className="hero-cta-demo">
              <span className="demo-icon">⚡</span>
              <span>1-Click Interactive Demo</span>
            </button>
          </div>

          <div className="hero-trust-badges">
            <span>✓ No credit card required</span>
            <span>✓ Bank-grade AES 256 encryption</span>
            <span>✓ RBI rules compliant</span>
          </div>
        </div>

        {/* ── HERO INTERACTIVE PREVIEW ──────────────────────────────────── */}
        <div className="hero-preview-wrapper">
          <div className="hero-preview-glass">
            <div className="preview-top-bar">
              <div className="preview-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="preview-search-pill">
                <span className="preview-lock-icon">🔒</span>
                <span>app.kiroai.io/workspace</span>
              </div>
              <div className="preview-badge-status">
                <span className="live-pulse" />
                <span>AI Core Active</span>
              </div>
            </div>

            <div className="preview-body">
              {/* Left simulation chat */}
              <div className="preview-chat-pane">
                <div className="preview-message user-msg">
                  <span className="msg-avatar">👤</span>
                  <div className="msg-bubble">
                    "Analyze my last quarter spending, suggest tax deductions under Section 80C, and check if my cloud kitchen qualifies for MUDRA loan."
                  </div>
                </div>

                <div className="preview-message ai-msg">
                  <span className="msg-avatar ai-avatar">K</span>
                  <div className="msg-bubble ai-bubble">
                    <p className="ai-lead">
                      ✨ <strong>Audit Complete</strong> — 3 high-impact opportunities identified:
                    </p>
                    <ul className="ai-bullets">
                      <li><strong>Tax Optimization:</strong> ₹46,200 additional deductions available in ELSS & Health insurance.</li>
                      <li><strong>Govt. Loan Eligibility:</strong> Your cloud kitchen scores <strong>88/100</strong> for <em>MUDRA Kishore</em> (up to ₹5,00,000 at 8.5% p.a.).</li>
                      <li><strong>Cashflow Advisory:</strong> Operating margin can increase +14.2% by renegotiating raw material logistics.</li>
                    </ul>
                    <div className="ai-actions-preview">
                      <span className="ai-tag">Apply Loan Form</span>
                      <span className="ai-tag">Download Tax Plan</span>
                      <span className="ai-tag">Simulate 90-Day P&L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right live telemetry cards */}
              <div className="preview-metrics-pane">
                <div className="preview-metric-card highlight">
                  <div className="pm-label">PORTFOLIO & CASHFLOW ALPHA</div>
                  <div className="pm-val">+28.4%</div>
                  <div className="pm-trend">↑ Outperforming benchmark by 9.2%</div>
                  <div className="pm-bar"><div className="pm-bar-fill" style={{ width: "78%" }} /></div>
                </div>

                <div className="preview-metric-card">
                  <div className="pm-label">ESTIMATED TAX SAVINGS</div>
                  <div className="pm-val">₹64,800</div>
                  <div className="pm-sub">Sec 80C, 80D & Business Depreciation</div>
                </div>

                <div className="preview-metric-card">
                  <div className="pm-label">LOAN READINESS SCORE</div>
                  <div className="pm-val text-accent">92 / 100</div>
                  <div className="pm-sub">Eligible for MUDRA, PMEGP & CGTMSE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── METRICS STRIP ─────────────────────────────────────────────────── */}
      <section className="metrics-strip">
        <div className="metrics-container">
          <div className="metric-item">
            <div className="metric-number">₹140Cr+</div>
            <div className="metric-caption">Capital & Transactions Modeled</div>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <div className="metric-number">99.4%</div>
            <div className="metric-caption">Tax & RBI Regulatory Accuracy</div>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <div className="metric-number">12,500+</div>
            <div className="metric-caption">MSME & Govt. Loans Matched</div>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <div className="metric-number">4.9 / 5</div>
            <div className="metric-caption">User Satisfaction (45K+ Founders)</div>
          </div>
        </div>
      </section>

      {/* ── CORE SOLUTIONS / MODULES ──────────────────────────────────────── */}
      <section id="solutions" className="section-padding">
        <div className="section-header">
          <span className="section-sub">COMPLETE CAPABILITY SUITE</span>
          <h2 className="section-title">One Intelligent Ecosystem. Five Specialized Engines.</h2>
          <p className="section-desc">
            Everything your personal wealth and business need to grow, automate compliance, and make confident capital moves.
          </p>
        </div>

        <div className="solutions-grid">
          {/* Card 1 */}
          <div className="solution-card">
            <div className="sol-icon-box bg-blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <h3>Intelligent Personal Finance</h3>
            <p>
              Auto-parse bank statements with AI OCR, track expense leakage, forecast monthly runway,
              and enforce intelligent budget caps automatically.
            </p>
            <ul className="sol-features">
              <li>Statement PDF & CSV auto-categorization</li>
              <li>Predictive month-end balance forecasting</li>
              <li>Real-time expense anomaly alerts</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="solution-card">
            <div className="sol-icon-box bg-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3>90-Day Business Launchpad</h3>
            <p>
              Turn any raw concept into a bulletproof business plan with dynamic CAPEX, OPEX, break-even
              milestones, unit economics, and competitive positioning.
            </p>
            <ul className="sol-features">
              <li>Instant unit economics & CAC vs LTV modeling</li>
              <li>Step-by-step 90-day launch roadmap</li>
              <li>Competitor & pricing strategy generator</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="solution-card">
            <div className="sol-icon-box bg-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2l10 8H2l10-8z" />
              </svg>
            </div>
            <h3>Govt. Loan & Subsidy Finder</h3>
            <p>
              Direct matching engine for MUDRA, PMEGP, Stand-Up India, and CGTMSE schemes with
              automated document checklists and subsidy calculators.
            </p>
            <ul className="sol-features">
              <li>Real-time eligibility score & pre-vetting</li>
              <li>Interest subsidy calculator for MSMEs</li>
              <li>Bank-ready PDF proposal generator</li>
            </ul>
          </div>

          {/* Card 4 */}
          <div className="solution-card">
            <div className="sol-icon-box bg-orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3>Tax Optimizer & RBI Compliance</h3>
            <p>
              Never overpay tax. Identify proactive exemptions under the latest tax regimes, track advance
              tax deadlines, and monitor RBI regulatory circulars.
            </p>
            <ul className="sol-features">
              <li>Old vs New Tax regime comparative optimizer</li>
              <li>Deduction finder (Sec 80C, 80D, 80G, HRA, 80E)</li>
              <li>RBI monetary policy & repo rate watch</li>
            </ul>
          </div>

          {/* Card 5 */}
          <div className="solution-card">
            <div className="sol-icon-box bg-cyan">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <h3>Investment & SIP Co-Pilot</h3>
            <p>
              Align your surplus cashflow with goal-based asset allocation across Mutual Funds, Index Funds,
              Gold, and Fixed Income with dynamic risk scoring.
            </p>
            <ul className="sol-features">
              <li>Goal tracking with Monte Carlo simulation</li>
              <li>Emergency fund liquidity calculator</li>
              <li>Automated monthly SIP allocation rebalancing</li>
            </ul>
          </div>

          {/* Card 6 */}
          <div className="solution-card highlight-box">
            <div className="sol-icon-box bg-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <h3>Conversational AI ChatCanvas</h3>
            <p>
              Ask any complex financial question in natural language and receive deep tabular analysis,
              instant charts, and actionable next steps.
            </p>
            <button onClick={() => navigate("/login")} className="sol-btn-action">
              Try ChatCanvas Now →
            </button>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE FINANCIAL SIMULATOR ───────────────────────────────── */}
      <section id="calculator" className="section-padding bg-tinted">
        <div className="section-header">
          <span className="section-sub">INTERACTIVE INTELLIGENCE</span>
          <h2 className="section-title">Simulate Your Growth in Real Time</h2>
          <p className="section-desc">
            Test how disciplined monthly capital allocation or a new business launch scales over time.
          </p>
        </div>

        <div className="calculator-container">
          <div className="calc-switch">
            <button
              className={`calc-switch-btn ${calcType === "sip" ? "active" : ""}`}
              onClick={() => setCalcType("sip")}
            >
              📈 Wealth & SIP Growth
            </button>
            <button
              className={`calc-switch-btn ${calcType === "business" ? "active" : ""}`}
              onClick={() => setCalcType("business")}
            >
              🏢 Business Break-Even & ROI
            </button>
          </div>

          {calcType === "sip" ? (
            <div className="calc-grid">
              <div className="calc-controls">
                <div className="slider-group">
                  <div className="slider-header">
                    <label>Monthly Investment</label>
                    <span className="slider-val">₹{monthlyInvest.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={monthlyInvest}
                    onChange={(e) => setMonthlyInvest(Number(e.target.value))}
                    className="calc-range"
                  />
                  <div className="slider-hints"><span>₹1K</span><span>₹50K</span><span>₹100K</span></div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Investment Horizon</label>
                    <span className="slider-val">{years} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="calc-range"
                  />
                  <div className="slider-hints"><span>1 Yr</span><span>15 Yrs</span><span>30 Yrs</span></div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Expected Annual Return</label>
                    <span className="slider-val">{expectedReturn}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="25"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="calc-range"
                  />
                  <div className="slider-hints"><span>6% (FD)</span><span>12% (Nifty)</span><span>25% (Alpha)</span></div>
                </div>
              </div>

              <div className="calc-results-card">
                <div className="cr-top">
                  <span className="cr-title">PROJECTED WEALTH AT {years} YEARS</span>
                  <div className="cr-big-val">₹{futureValue.toLocaleString("en-IN")}</div>
                </div>

                <div className="cr-stats">
                  <div className="cr-stat">
                    <span className="cr-stat-label">Invested Amount</span>
                    <span className="cr-stat-num">₹{investedAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="cr-stat">
                    <span className="cr-stat-label">Estimated Gains</span>
                    <span className="cr-stat-num text-success">+₹{wealthGained.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="cr-stat">
                    <span className="cr-stat-label">Wealth Multiplier</span>
                    <span className="cr-stat-num text-accent">{(futureValue / Math.max(investedAmount, 1)).toFixed(1)}x</span>
                  </div>
                </div>

                <div className="cr-ai-note">
                  <span className="ai-spark">✨</span>
                  <span>
                    <strong>Kiro Insight:</strong> Increasing your monthly SIP by just 10% annually with Kiro's Step-Up rule would yield an extra <strong>₹{Math.round(wealthGained * 0.42).toLocaleString("en-IN")}</strong>.
                  </span>
                </div>

                <button onClick={() => navigate("/login?tab=signup")} className="cr-cta">
                  Build Your Investment Plan in Kiro AI →
                </button>
              </div>
            </div>
          ) : (
            <div className="calc-grid">
              <div className="calc-controls">
                <div className="slider-group">
                  <div className="slider-header">
                    <label>Initial Capital / Setup Cost</label>
                    <span className="slider-val">₹{initialCapital.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="5000000"
                    step="50000"
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                    className="calc-range"
                  />
                  <div className="slider-hints"><span>₹50K</span><span>₹25L</span><span>₹50L</span></div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Estimated Monthly Revenue</label>
                    <span className="slider-val">₹{monthlyRevenue.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="10000"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="calc-range"
                  />
                  <div className="slider-hints"><span>₹10K</span><span>₹5L</span><span>₹10L</span></div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Net Profit Margin</label>
                    <span className="slider-val">{profitMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="calc-range"
                  />
                  <div className="slider-hints"><span>5%</span><span>30%</span><span>60%</span></div>
                </div>
              </div>

              <div className="calc-results-card">
                <div className="cr-top">
                  <span className="cr-title">BREAK-EVEN TIME HORIZON</span>
                  <div className="cr-big-val">{breakEvenMonths} Months</div>
                </div>

                <div className="cr-stats">
                  <div className="cr-stat">
                    <span className="cr-stat-label">Monthly Net Profit</span>
                    <span className="cr-stat-num">₹{monthlyProfit.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="cr-stat">
                    <span className="cr-stat-label">Annual Run Rate</span>
                    <span className="cr-stat-num">₹{annualProfit.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="cr-stat">
                    <span className="cr-stat-label">3-Year Net ROI</span>
                    <span className="cr-stat-num text-success">{threeYearRoi}%</span>
                  </div>
                </div>

                <div className="cr-ai-note">
                  <span className="ai-spark">✨</span>
                  <span>
                    <strong>Govt. Subsidy Match:</strong> You can potentially offset up to 35% of this capital via <strong>PMEGP Subsidy</strong>.
                  </span>
                </div>

                <button onClick={() => navigate("/login?tab=signup")} className="cr-cta">
                  Generate Full 90-Day Business Feasibility →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── COMPARISON SECTION ────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="section-header">
          <span className="section-sub">THE KIRO ADVANTAGE</span>
          <h2 className="section-title">Why Modern Builders Choose Kiro AI</h2>
          <p className="section-desc">
            Manual spreadsheets take hours. Outdated accounting software lacks intelligence. Kiro AI acts as your always-on CFO.
          </p>
        </div>

        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: "35%" }}>Feature Capability</th>
                <th style={{ width: "20%" }}>Spreadsheets</th>
                <th style={{ width: "22%" }}>Traditional Software</th>
                <th style={{ width: "23%" }} className="col-highlight">Kiro AI 2.0</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Real-time AI Financial Analysis</strong></td>
                <td>❌ Manual formulas</td>
                <td>❌ Static charts</td>
                <td className="col-highlight">✅ Autonomous neural insights</td>
              </tr>
              <tr>
                <td><strong>Govt. Loan & Subsidy Pre-vetting</strong></td>
                <td>❌ None</td>
                <td>❌ None</td>
                <td className="col-highlight">✅ Instant MUDRA, PMEGP & CGTMSE matching</td>
              </tr>
              <tr>
                <td><strong>90-Day Startup Launchpad</strong></td>
                <td>❌ DIY templates</td>
                <td>❌ None</td>
                <td className="col-highlight">✅ Automated roadmap & CAPEX/OPEX model</td>
              </tr>
              <tr>
                <td><strong>Tax Regime Optimization</strong></td>
                <td>❌ Complex tax charts</td>
                <td>⚠️ End-of-year only</td>
                <td className="col-highlight">✅ Continuous proactive deductions</td>
              </tr>
              <tr>
                <td><strong>Interactive AI ChatCanvas</strong></td>
                <td>❌ None</td>
                <td>❌ None</td>
                <td className="col-highlight">✅ Deep conversational financial co-pilot</td>
              </tr>
              <tr>
                <td><strong>Data Security</strong></td>
                <td>⚠️ Easily lost / leaks</td>
                <td>⚠️ Basic server storage</td>
                <td className="col-highlight">✅ 256-Bit Bank-grade encryption</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="section-padding bg-tinted">
        <div className="section-header">
          <span className="section-sub">TESTED BY BUILDERS</span>
          <h2 className="section-title">Loved by Founders, Investors & Freelancers</h2>
          <p className="section-desc">
            Here's what real users achieve with Kiro AI as their financial co-pilot.
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="t-stars">★★★★★</div>
            <p className="t-quote">
              "Kiro AI's business launchpad saved our D2C brand months of financial modeling. We qualified for a ₹10 Lakh PMEGP loan subsidy with zero middlemen."
            </p>
            <div className="t-author">
              <div className="t-avatar">AK</div>
              <div>
                <div className="t-name">Ananya Kulkarni</div>
                <div className="t-title">Founder, TerraOrganics</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="t-stars">★★★★★</div>
            <p className="t-quote">
              "The automated tax optimizer spotted ₹54,000 in deductions I was missing between old and new regimes. It pays for itself 50 times over."
            </p>
            <div className="t-author">
              <div className="t-avatar">RS</div>
              <div>
                <div className="t-name">Rahul Sharma</div>
                <div className="t-title">Senior Software Architect</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="t-stars">★★★★★</div>
            <p className="t-quote">
              "Having ChatCanvas explain RBI repo rate shifts and how they impact my business debt was game changing. It’s like having a top CFO on tap 24/7."
            </p>
            <div className="t-author">
              <div className="t-avatar">VM</div>
              <div>
                <div className="t-name">Vikram Mehta</div>
                <div className="t-title">Managing Director, Mehta Logistics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ───────────────────────────────────────────────── */}
      <section id="pricing" className="section-padding">
        <div className="section-header">
          <span className="section-sub">TRANSPARENT VALUE</span>
          <h2 className="section-title">Simple, Predictable Plans</h2>
          <p className="section-desc">
            Start completely free. Upgrade whenever you need unlimited AI intelligence and priority modeling.
          </p>
        </div>

        <div className="pricing-grid">
          {/* Free Tier */}
          <div className="pricing-card">
            <div className="p-badge">Free Forever</div>
            <h3 className="p-title">Starter</h3>
            <div className="p-price">₹0 <span>/ month</span></div>
            <p className="p-desc">Ideal for students and personal expense tracking.</p>
            <ul className="p-features">
              <li>✓ Basic expense & cashflow tracking</li>
              <li>✓ Up to 30 AI queries per month</li>
              <li>✓ Bank statement CSV parser</li>
              <li>✓ Standard tax regime estimator</li>
            </ul>
            <button onClick={() => navigate("/login?tab=signup")} className="p-btn">
              Get Started Free
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="pricing-card featured">
            <div className="p-featured-badge">MOST POPULAR</div>
            <div className="p-badge">For Individuals & Investors</div>
            <h3 className="p-title">Pro Wealth</h3>
            <div className="p-price">₹499 <span>/ month</span></div>
            <p className="p-desc">Complete personal wealth, SIP simulation & proactive tax optimization.</p>
            <ul className="p-features">
              <li>✓ Unlimited ChatCanvas AI conversations</li>
              <li>✓ Proactive Tax Optimizer & Sec 80 deduction finder</li>
              <li>✓ Dynamic SIP & Mutual fund portfolio simulator</li>
              <li>✓ Bank PDF auto-parsing OCR</li>
              <li>✓ Priority AI response speeds</li>
            </ul>
            <button onClick={() => navigate("/login?tab=signup")} className="p-btn-featured">
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Business Tier */}
          <div className="pricing-card">
            <div className="p-badge">For Founders & MSMEs</div>
            <h3 className="p-title">Founder Scale</h3>
            <div className="p-price">₹1,499 <span>/ month</span></div>
            <p className="p-desc">End-to-end business feasibility, loan matching, and compliance engine.</p>
            <ul className="p-features">
              <li>✓ Everything in Pro Wealth</li>
              <li>✓ 90-Day Business Launchpad generator</li>
              <li>✓ Govt. Loan & Subsidy Eligibility Engine</li>
              <li>✓ Bank-ready PDF export for loan applications</li>
              <li>✓ RBI regulatory circulars watchdog</li>
              <li>✓ 1-on-1 Priority advisor support</li>
            </ul>
            <button onClick={() => navigate("/login?tab=signup")} className="p-btn">
              Empower Your Business
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ACCORDION ─────────────────────────────────────────────────── */}
      <section id="faq" className="section-padding bg-tinted">
        <div className="section-header">
          <span className="section-sub">GOT QUESTIONS?</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-container">
          {[
            {
              q: "How safe is my financial and personal data in Kiro AI?",
              a: "Your data is encrypted using AES-256 bank-grade encryption in transit and at rest. We do not sell or share personal transaction records with third parties, and all AI processing is sandboxed.",
            },
            {
              q: "Which government loan and subsidy schemes are supported?",
              a: "We currently support MUDRA (Shishu, Kishore, Tarun), PMEGP (Prime Minister's Employment Generation Programme), Stand-Up India, CGTMSE credit guarantee loans, and MSME 59-minute loan frameworks.",
            },
            {
              q: "Can I use Kiro AI for both personal finances and my small business?",
              a: "Yes! Kiro AI features a dual-core architecture. You can seamlessly switch between Personal Wealth mode and Business Launchpad / MSME Advisor within the same account.",
            },
            {
              q: "Do I need accounting experience to use the 90-Day Business Launchpad?",
              a: "Not at all. You provide your business idea and rough estimates in plain English, and Kiro AI calculates your CAPEX, OPEX, unit economics, and 90-day execution milestones automatically.",
            },
            {
              q: "Can I test Kiro AI before signing up?",
              a: "Yes! You can click the '1-Click Interactive Demo' button anywhere on this page to instantly experience Kiro AI with sample financial data.",
            },
          ].map((item, idx) => (
            <div key={idx} className="faq-item">
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{item.q}</span>
                <span className={`faq-arrow ${openFaq === idx ? "open" : ""}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM HIGH-IMPACT CTA ────────────────────────────────────────── */}
      <section className="bottom-cta-section">
        <div className="bottom-cta-inner">
          <h2>Ready to Take Total Control of Your Financial Future?</h2>
          <p>
            Join over 45,000 founders, investors, and professionals scaling smarter with Kiro AI today.
          </p>
          <div className="bottom-cta-btns">
            <button onClick={() => navigate("/login?tab=signup")} className="hero-cta-primary">
              <span>Create Free Account</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={handleQuickDemo} className="hero-cta-demo">
              <span>⚡ Try 1-Click Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="landing-brand">
              <div className="landing-logo-box">
                <span className="landing-logo-letter">K</span>
              </div>
              <span className="landing-brand-name">Kiro AI</span>
            </div>
            <p className="footer-tagline">
              Autonomous financial intelligence, wealth optimization, and business execution system.
            </p>
            <div className="footer-security-pill">
              <span>🔒 256-Bit Bank-Grade Security</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <a href="#solutions">Personal Finance</a>
            <a href="#solutions">Business Launchpad</a>
            <a href="#solutions">Govt Loans & Subsidies</a>
            <a href="#calculator">SIP & ROI Simulator</a>
            <a href="/login">ChatCanvas AI</a>
          </div>

          <div className="footer-links-col">
            <h4>Tools</h4>
            <a href="/login">Expense Tracker</a>
            <a href="/login">Tax Alerts</a>
            <a href="/login">Investment Co-Pilot</a>
            <a href="/login">RBI Circular Watchdog</a>
            <a href="/login">MSME Feasibility</a>
          </div>

          <div className="footer-links-col">
            <h4>Legal & Trust</h4>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms of Service</a>
            <a href="/refund" onClick={(e) => { e.preventDefault(); navigate("/refund"); }}>Refund Policy</a>
            <a href="/disclaimer" onClick={(e) => { e.preventDefault(); navigate("/disclaimer"); }}>Disclaimer</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Kiro AI, Inc. All rights reserved.</span>
          <span>Designed with precision for modern builders & investors.</span>
        </div>
      </footer>

      {/* ── STYLES ────────────────────────────────────────────────────────── */}
      <style>{`
        .landing-viewport {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          overflow-x: hidden;
          position: relative;
        }

        /* ── NAVBAR ── */
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          background: rgba(var(--bg), 0.82);
          border-bottom: 1px solid var(--border);
          transition: background var(--transition);
        }

        .landing-nav-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .landing-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .landing-logo-box {
          position: relative;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px var(--accent-soft);
        }

        .landing-logo-letter {
          color: #ffffff;
          font-weight: 800;
          font-size: 19px;
          line-height: 1;
        }

        .landing-brand-text {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .landing-brand-name {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text);
        }

        .landing-brand-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--accent);
          background: var(--accent-soft);
          padding: 2px 6px;
          border-radius: 99px;
        }

        .landing-links {
          display: flex;
          align-items: center;
          gap: 26px;
        }

        .nav-anchor {
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: color var(--transition);
        }

        .nav-anchor:hover {
          color: var(--text);
        }

        .landing-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-toggle-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
        }

        .theme-toggle-btn:hover {
          color: var(--text);
          border-color: var(--border-strong);
        }

        .landing-btn-secondary {
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .landing-btn-secondary:hover {
          background: var(--bg-secondary);
          border-color: var(--border-strong);
        }

        .landing-btn-primary {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 18px;
          border-radius: var(--radius-sm);
          background: var(--accent);
          border: 1px solid var(--accent);
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
          box-shadow: 0 4px 12px var(--accent-soft);
        }

        .landing-btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        /* ── HERO ── */
        .hero-section {
          position: relative;
          padding: 70px 24px 80px;
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-ambient-glow-1 {
          position: absolute;
          width: 500px;
          height: 500px;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
        }

        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 99px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .hero-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseGreen 2s infinite;
        }

        @keyframes pulseGreen {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .hero-pill-divider {
          color: var(--border-strong);
        }

        .hero-pill-sub {
          color: var(--text-muted);
          font-weight: 500;
        }

        .hero-title {
          font-size: clamp(34px, 5.5vw, 62px);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 20px;
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-description {
          font-size: clamp(16px, 2vw, 19px);
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 720px;
          margin: 0 auto 36px;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .hero-cta-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: var(--radius);
          background: var(--accent);
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all var(--transition);
          box-shadow: 0 8px 24px var(--accent-soft);
        }

        .hero-cta-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px var(--accent-soft);
        }

        .hero-cta-demo {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          border-radius: var(--radius);
          background: var(--bg-secondary);
          color: var(--text);
          font-size: 15px;
          font-weight: 600;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all var(--transition);
        }

        .hero-cta-demo:hover {
          background: var(--bg-tertiary);
          border-color: var(--border-strong);
          transform: translateY(-1px);
        }

        .hero-trust-badges {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          font-size: 12.5px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        /* ── HERO PREVIEW GLASS ── */
        .hero-preview-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1100px;
          margin-top: 48px;
        }

        .hero-preview-glass {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          overflow: hidden;
          text-align: left;
        }

        .preview-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .preview-dots {
          display: flex;
          gap: 6px;
        }

        .preview-dots .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .preview-dots .red { background: #ef4444; }
        .preview-dots .yellow { background: #f59e0b; }
        .preview-dots .green { background: #10b981; }

        .preview-search-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 99px;
          background: var(--bg);
          border: 1px solid var(--border);
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .preview-badge-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--accent);
        }

        .live-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 6px var(--accent);
        }

        .preview-body {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
          padding: 24px;
          background: var(--bg);
        }

        .preview-chat-pane {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .preview-message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          border: 1px solid var(--border);
        }

        .ai-avatar {
          background: var(--accent);
          color: #fff;
          font-weight: 700;
          border: none;
        }

        .msg-bubble {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--text);
        }

        .ai-bubble {
          background: var(--surface-raised);
          border-color: var(--border-strong);
        }

        .ai-lead {
          margin-bottom: 8px;
          font-size: 13px;
        }

        .ai-bullets {
          padding-left: 18px;
          font-size: 12.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .ai-actions-preview {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ai-tag {
          padding: 3px 10px;
          border-radius: 99px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 11px;
          font-weight: 600;
        }

        .preview-metrics-pane {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .preview-metric-card {
          padding: 16px;
          border-radius: var(--radius);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
        }

        .preview-metric-card.highlight {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .pm-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .pm-val {
          font-size: 24px;
          font-weight: 800;
          color: var(--text);
          line-height: 1.2;
        }

        .pm-trend {
          font-size: 12px;
          color: var(--success);
          font-weight: 600;
          margin-top: 2px;
        }

        .pm-sub {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .pm-bar {
          height: 6px;
          border-radius: 99px;
          background: var(--border);
          margin-top: 10px;
          overflow: hidden;
        }

        .pm-bar-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 99px;
        }

        /* ── METRICS STRIP ── */
        .metrics-strip {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
          padding: 36px 24px;
        }

        .metrics-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 24px;
        }

        .metric-item {
          text-align: center;
        }

        .metric-number {
          font-size: clamp(28px, 3.5vw, 38px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 4px;
        }

        .metric-caption {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .metric-divider {
          width: 1px;
          height: 44px;
          background: var(--border);
        }

        /* ── SOLUTIONS SECTION ── */
        .section-padding {
          padding: 90px 24px;
          max-width: 1240px;
          margin: 0 auto;
        }

        .bg-tinted {
          background: var(--bg-secondary);
          max-width: 100% !important;
        }

        .section-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 56px;
        }

        .section-sub {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--accent);
          display: block;
          margin-bottom: 10px;
        }

        .section-title {
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 14px;
        }

        .section-desc {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .solutions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 24px;
        }

        .solution-card {
          padding: 28px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all var(--transition);
          display: flex;
          flex-direction: column;
        }

        .solution-card:hover {
          transform: translateY(-3px);
          border-color: var(--border-strong);
          box-shadow: var(--shadow-md);
        }

        .solution-card.highlight-box {
          background: linear-gradient(135deg, var(--surface) 0%, var(--bg-secondary) 100%);
          border-color: var(--accent);
        }

        .sol-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .bg-blue { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
        .bg-purple { background: rgba(168, 85, 247, 0.12); color: #a855f7; }
        .bg-green { background: rgba(16, 185, 129, 0.12); color: #10b981; }
        .bg-orange { background: rgba(249, 115, 22, 0.12); color: #f97316; }
        .bg-cyan { background: rgba(6, 182, 212, 0.12); color: #06b6d4; }
        .bg-accent { background: var(--accent); color: #fff; }

        .solution-card h3 {
          font-size: 19px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 10px;
        }

        .solution-card p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 18px;
          flex: 1;
        }

        .sol-features {
          padding-left: 18px;
          font-size: 13px;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .sol-features li::marker {
          color: var(--accent);
        }

        .sol-btn-action {
          margin-top: 14px;
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          background: var(--accent);
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background var(--transition);
        }

        .sol-btn-action:hover {
          background: var(--accent-hover);
        }

        /* ── CALCULATOR ── */
        .calculator-container {
          max-width: 980px;
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 36px;
          box-shadow: var(--shadow-lg);
        }

        .calc-switch {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .calc-switch-btn {
          padding: 10px 22px;
          border-radius: 99px;
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .calc-switch-btn.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 0 4px 12px var(--accent-soft);
        }

        .calc-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 36px;
          align-items: center;
        }

        .calc-controls {
          display: flex;
          flex-direction: column;
          gap: 26px;
        }

        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-header label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
        }

        .slider-val {
          font-size: 15px;
          font-weight: 700;
          color: var(--accent);
        }

        .calc-range {
          width: 100%;
          accent-color: var(--accent);
          cursor: pointer;
        }

        .slider-hints {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
        }

        .calc-results-card {
          padding: 28px;
          border-radius: var(--radius-lg);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .cr-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .cr-big-val {
          font-size: 34px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-top: 4px;
        }

        .cr-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 14px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .cr-stat-label {
          display: block;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .cr-stat-num {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }

        .text-success { color: var(--success); }
        .text-accent { color: var(--accent); }

        .cr-ai-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--text-secondary);
          background: var(--surface);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .cr-cta {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-sm);
          background: var(--accent);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: background var(--transition);
        }

        .cr-cta:hover {
          background: var(--accent-hover);
        }

        /* ── COMPARISON TABLE ── */
        .comparison-table-wrap {
          overflow-x: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .comparison-table th, .comparison-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }

        .comparison-table th {
          background: var(--bg-secondary);
          font-weight: 700;
          color: var(--text);
          font-size: 13px;
        }

        .col-highlight {
          background: var(--accent-soft);
          font-weight: 600;
          color: var(--accent);
        }

        /* ── TESTIMONIALS ── */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .testimonial-card {
          padding: 28px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .t-stars {
          color: #f59e0b;
          font-size: 16px;
          letter-spacing: 2px;
        }

        .t-quote {
          font-size: 14.5px;
          line-height: 1.6;
          color: var(--text);
          flex: 1;
        }

        .t-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .t-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .t-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .t-title {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* ── PRICING ── */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 28px;
          align-items: stretch;
        }

        .pricing-card {
          padding: 34px 28px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .pricing-card.featured {
          border-color: var(--accent);
          box-shadow: 0 12px 36px var(--accent-soft);
          transform: translateY(-4px);
        }

        .p-featured-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--accent);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 12px;
          border-radius: 99px;
          letter-spacing: 0.05em;
        }

        .p-badge {
          font-size: 12px;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .p-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 8px;
        }

        .p-price {
          font-size: 38px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 10px;
        }

        .p-price span {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .p-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-bottom: 24px;
          min-height: 40px;
        }

        .p-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-bottom: 32px;
          flex: 1;
        }

        .p-btn {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-strong);
          background: var(--bg-secondary);
          color: var(--text);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all var(--transition);
        }

        .p-btn:hover {
          background: var(--bg-tertiary);
        }

        .p-btn-featured {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: none;
          background: var(--accent);
          color: #fff;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background var(--transition);
          box-shadow: 0 4px 14px var(--accent-soft);
        }

        .p-btn-featured:hover {
          background: var(--accent-hover);
        }

        /* ── FAQ ── */
        .faq-container {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: none;
          border: none;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          cursor: pointer;
        }

        .faq-arrow {
          color: var(--text-muted);
          transition: transform var(--transition);
        }

        .faq-arrow.open {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 22px 18px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* ── BOTTOM CTA ── */
        .bottom-cta-section {
          padding: 100px 24px;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--surface) 100%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          text-align: center;
        }

        .bottom-cta-inner {
          max-width: 740px;
          margin: 0 auto;
        }

        .bottom-cta-inner h2 {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 16px;
        }

        .bottom-cta-inner p {
          font-size: 17px;
          color: var(--text-secondary);
          margin-bottom: 32px;
        }

        .bottom-cta-btns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* ── FOOTER ── */
        .landing-footer {
          padding: 70px 24px 30px;
          background: var(--bg);
          border-top: 1px solid var(--border);
        }

        .footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 50px;
        }

        .footer-tagline {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 320px;
          margin: 14px 0 18px;
        }

        .footer-security-pill {
          display: inline-block;
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg-secondary);
          padding: 4px 10px;
          border-radius: 99px;
          border: 1px solid var(--border);
        }

        .footer-links-col h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 16px;
        }

        .footer-links-col a {
          display: block;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13.5px;
          margin-bottom: 10px;
          transition: color var(--transition);
        }

        .footer-links-col a:hover {
          color: var(--accent);
        }

        .footer-bottom {
          max-width: 1240px;
          margin: 0 auto;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 12px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .landing-links { display: none; }
          .preview-body { grid-template-columns: 1fr; }
          .calc-grid { grid-template-columns: 1fr; }
          .footer-inner { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 600px) {
          .footer-inner { grid-template-columns: 1fr; }
          .metrics-container { flex-direction: column; gap: 18px; }
          .metric-divider { display: none; }
          .hero-section { padding: 40px 16px 50px; }
        }
      `}</style>
    </div>
  );
}
