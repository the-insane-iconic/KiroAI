import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVault } from "../context/VaultContext";
import { KiroContextBar } from "../components/cards/KiroContext";

// Local storage persistence keys
const STORAGE_KEY = "kiro_launchpad_data";
const TASKS_KEY = "kiro_launchpad_tasks";

const INDUSTRIES = [
  "Food & Cafe / Quick Bites",
  "Cloud Kitchen & Tiffin Service",
  "Mobile & Gadget Repair",
  "Retail & Kirana Store",
  "Home Deep Cleaning & Pest Control",
  "Spice & Dry Fruit Packaging",
  "Dairy & Farm Products",
  "Digital Marketing & Local SEO",
  "Sneaker & Apparel Care",
  "Event & Party Rentals",
  "Print, Xerox & Stationers",
  "Car & Bike Detailing",
  "Health, Fitness & Yoga",
  "Tutoring & Skill Academy",
  "E-commerce & Dropshipping",
  "Other High-Demand Service",
];

const CAPITAL_BRACKETS = [
  {
    id: "zero",
    label: "Zero / Micro Capital",
    range: "< ₹10,000",
    desc: "Service, agency, brokering, or mobile-first skills. Zero physical inventory risk.",
    icon: "⚡",
    badge: "Fast Launch · Low Risk",
  },
  {
    id: "seed",
    label: "Seed Capital",
    range: "₹10,000 – ₹50,000",
    desc: "Kiosks, home food, quick-repair, small packaging, or local on-demand service.",
    icon: "🌱",
    badge: "High Margin (40-60%)",
  },
  {
    id: "growth",
    label: "Growth Capital",
    range: "₹50,000 – ₹2,00,000",
    desc: "Cloud kitchen, retail store, water plant, mini-laundry, or campus print hub.",
    icon: "🚀",
    badge: "High Scalability",
  },
  {
    id: "enterprise",
    label: "Mid / Enterprise Capital",
    range: "₹2,00,000 – ₹10,00,000+",
    desc: "Franchise, dairy chilling center, auto workshop, or wholesale distribution.",
    icon: "🏢",
    badge: "Asset-Backed",
  },
];

// Curated profitable business models by capital tier
const CURATED_BUSINESSES = {
  zero: [
    {
      id: "z1",
      title: "Local Retailer Google Maps & WhatsApp Business Optimizer",
      tagline: "Help local shops, doctors & salons get discovered on Google Maps and take WhatsApp orders.",
      estimatedStartup: "₹2,500",
      monthlyProfit: "₹35,000 – ₹60,000",
      margin: "85%",
      breakevenDays: 14,
      whyWins: "Every retailer wants more local walk-ins but 80% have unverified or poorly ranked Google Business Profiles.",
      equipment: ["Smartphone / Laptop", "Business visiting cards", "Sample demo catalog"],
      licenses: ["MSME Udyam (Free)"],
    },
    {
      id: "z2",
      title: "Hyper-Local Residential & Commercial Rental Matchmaker",
      tagline: "Curate verified PG, room, flat and commercial listings for migrants and students.",
      estimatedStartup: "₹1,500",
      monthlyProfit: "₹40,000 – ₹75,000",
      margin: "95%",
      breakevenDays: 10,
      whyWins: "No deposit or space needed. You charge a standard 15-30 day rental facilitation fee from owners.",
      equipment: ["Phone with WhatsApp Business", "Local territory inventory sheet"],
      licenses: ["MSME Udyam (Free)"],
    },
    {
      id: "z3",
      title: "On-Demand Sofa & Mattress Deep-Cleaning Aggregator",
      tagline: "Book cleaning contracts from apartments and partner with local certified equipment operators.",
      estimatedStartup: "₹5,000",
      monthlyProfit: "₹30,000 – ₹55,000",
      margin: "70%",
      breakevenDays: 20,
      whyWins: "Urban households eagerly pay ₹1,200–₹2,500 for clean upholstery, with zero machine purchase required upfront.",
      equipment: ["Uniform T-shirt", "Flyers for housing societies", "WhatsApp booking portal"],
      licenses: ["MSME Udyam (Free)", "Shop Act"],
    },
  ],
  seed: [
    {
      id: "s1",
      title: "Specialty Kulhad Chai & Evening Samosa/Fast-Bites Hub",
      tagline: "High-footfall evening corner serving hygienic tandoori/ginger tea and hot snacks.",
      estimatedStartup: "₹32,000",
      monthlyProfit: "₹45,000 – ₹85,000",
      margin: "55%",
      breakevenDays: 30,
      whyWins: "Tea and quick bites enjoy the highest repeat purchase frequency in India with 250-400 daily transactions.",
      equipment: ["Gas burner & brass pots", "Collapsible steel counter", "Eco-friendly clay kulhads", "Branded signage board"],
      licenses: ["FSSAI Basic (₹100/yr)", "MSME Udyam (Free)", "Local Municipal Vendor Pass"],
    },
    {
      id: "s2",
      title: "On-Demand Smartphone Screen, Battery & Tempered Glass Kiosk",
      tagline: "Quick 20-minute screen and battery replacements at 40% below authorized service center rates.",
      estimatedStartup: "₹45,000",
      monthlyProfit: "₹50,000 – ₹90,000",
      margin: "65%",
      breakevenDays: 25,
      whyWins: "Mobile screens crack daily. People prefer same-day neighborhood trust over 7-day service center delays.",
      equipment: ["Heat gun & separation tools", "Initial screen & glass stock", "Precision screwdriver kit", "Testing rig"],
      licenses: ["MSME Udyam (Free)", "Trade License / Shop Act"],
    },
    {
      id: "s3",
      title: "Organic Whole Spices & Roasted Dry Fruits Small-Batch Packaging",
      tagline: "Sourcing whole turmeric, cardamom, cashews in bulk and packaging in zip-lock eco-pouches.",
      estimatedStartup: "₹38,000",
      monthlyProfit: "₹35,000 – ₹65,000",
      margin: "42%",
      breakevenDays: 35,
      whyWins: "Direct margin between wholesale APMC mandis and retail packaging is over 60%, ideal for residential societies.",
      equipment: ["Digital precision weighing scale", "Continuous band impulse pouch sealer", "Custom label stickers", "Stand-up zip pouches"],
      licenses: ["FSSAI Basic (₹100/yr)", "MSME Udyam (Free)"],
    },
  ],
  growth: [
    {
      id: "g1",
      title: "Cloud Kitchen for Late-Night Biryani, Rolls & Bowls",
      tagline: "Delivery-only kitchen operating on Swiggy, Zomato and direct WhatsApp orders from a low-rent alley.",
      estimatedStartup: "₹1,35,000",
      monthlyProfit: "₹70,000 – ₹1,40,000",
      margin: "38%",
      breakevenDays: 45,
      whyWins: "Avoids high street showroom rent while capturing prime 7 PM to 2 AM hungry corporate and student orders.",
      equipment: ["Commercial 2-burner gas range", "Double-door deep refrigerator", "Exhaust chimney", "Tamper-proof meal packaging"],
      licenses: ["FSSAI State License", "GST Registration", "MSME Udyam", "Fire NOC / Kitchen clearance"],
    },
    {
      id: "g2",
      title: "Automated 20L Mineral Water Purification & Delivery Route",
      tagline: "Supplying daily 20L chilled RO water cans to local offices, stores, and apartments.",
      estimatedStartup: "₹1,60,000",
      monthlyProfit: "₹65,000 – ₹1,20,000",
      margin: "50%",
      breakevenDays: 50,
      whyWins: "Recurring subscription business model. Once 80 corporate/residential accounts are locked, cashflow is guaranteed.",
      equipment: ["1000 LPH RO commercial unit", "150 food-grade 20L polycarbonate bubble jars", "Electric delivery cargo loader"],
      licenses: ["BIS / Water Quality Certification", "FSSAI Registration", "MSME Udyam", "GST Registration"],
    },
    {
      id: "g3",
      title: "Campus Speed-Print, Binding & Creative Merchandise Hub",
      tagline: "High-speed laser printing, spiral binding, custom ID cards, and student projects near colleges.",
      estimatedStartup: "₹1,10,000",
      monthlyProfit: "₹55,000 – ₹95,000",
      margin: "58%",
      breakevenDays: 35,
      whyWins: "Heavy exam and project submission cycles yield massive daily page volume with 70%+ gross margin on paper.",
      equipment: ["High-speed duplex laser MFP printer", "Heavy-duty electric cutter & spiral binder", "Paper inventory", "Desktop PC"],
      licenses: ["MSME Udyam (Free)", "Shop & Establishment Act"],
    },
  ],
  enterprise: [
    {
      id: "e1",
      title: "Multi-Brand Two-Wheeler Quick-Service & Water-Wash Workshop",
      tagline: "Full oil change, electronic scan, brake service and foam wash with 45-minute turnaround.",
      estimatedStartup: "₹3,80,000",
      monthlyProfit: "₹1,20,000 – ₹2,40,000",
      margin: "45%",
      breakevenDays: 60,
      whyWins: "Authorized bike service centers charge high labor and require 2-day drops. Hyperlocal express centers win customer trust.",
      equipment: ["Hydraulic bike lift", "High-pressure washer & foam gun", "Air compressor", "Diagnostic scan tool"],
      licenses: ["Trade License", "Pollution Control Board Consent (Green category)", "GST", "MSME Udyam"],
    },
    {
      id: "e2",
      title: "Mini Cold-Pressed Oil & Pure Spices Extraction Plant",
      tagline: "Live expelling of mustard, groundnut, and sesame oils in front of customers ensuring 100% purity.",
      estimatedStartup: "₹4,50,000",
      monthlyProfit: "₹1,40,000 – ₹2,80,000",
      margin: "35%",
      breakevenDays: 65,
      whyWins: "Adulteration fears have skyrocketed demand for live wood-pressed and cold-pressed edible oils at premium prices.",
      equipment: ["Wooden Ghani / Cold-press oil expeller", "Seed cleaning & roasting sieve", "Stainless steel storage tanks", "Bottling station"],
      licenses: ["FSSAI Manufacturing License", "GST Registration", "Udyam MSME (Subsidized under PMEGP 25-35%)"],
    },
  ],
};

export default function BusinessLaunchpad() {
  const navigate = useNavigate();
  const { vault } = useVault();

  // Wizard Step
  const [step, setStep] = useState(1);

  // Form Data
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      name: "",
      hasIdea: "no", // "no" = suggest based on capital, "yes" = have idea
      ideaDescription: "",
      capitalTier: "seed", // zero, seed, growth, enterprise
      approxCapital: "₹35,000",
      offeringType: "both",
      industry: "Food & Cafe / Quick Bites",
      timeCommitment: "fulltime",
      city: "Indore",
      tier: "tier2",
      spaceType: "kiosk",
      targetAudience: "local_residents",
      selectedBusinessId: "s1",
      customBusinessTitle: "",
    };
  });

  // Task checklist state
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(TASKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {};
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(completedTasks));
    } catch (_) {}
  }, [completedTasks]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Pre-fill from Vault
  const handlePrefillVault = () => {
    if (vault?.profile?.name && !formData.name) {
      updateField("name", vault.profile.name);
    }
    if (vault?.profile?.city) {
      updateField("city", vault.profile.city);
    }
  };

  // Recommendations calculated based on selected capital bracket
  const recommendedBusinesses = useMemo(() => {
    return CURATED_BUSINESSES[formData.capitalTier] || CURATED_BUSINESSES.seed;
  }, [formData.capitalTier]);

  // Active chosen business object
  const activeBusiness = useMemo(() => {
    const all = [
      ...CURATED_BUSINESSES.zero,
      ...CURATED_BUSINESSES.seed,
      ...CURATED_BUSINESSES.growth,
      ...CURATED_BUSINESSES.enterprise,
    ];
    const match = all.find((b) => b.id === formData.selectedBusinessId);
    if (match) return match;
    return recommendedBusinesses[0] || all[0];
  }, [formData.selectedBusinessId, recommendedBusinesses]);

  // Task count and progress
  const totalTasksCount = 18;
  const completedTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  const phases = [
    {
      phaseNumber: 1,
      name: "Days 1–30: Foundation & Validation",
      badge: "PHASE 01 · ZERO RISK VALIDATION",
      desc: "Prove market demand, secure registrations & build your supplier pipeline before spending on fixed assets.",
      color: "var(--accent)",
      tasks: [
        { id: "p1_1", days: "Days 1–5", title: "Hyper-Local Competitor & Footfall Audit", desc: "Spend 2 hours during peak morning & evening times counting walk-ins at 3 nearby competitors." },
        { id: "p1_2", days: "Days 6–10", title: "Zero-Cost MSME Udyam & Basic FSSAI Registration", desc: "Register your entity free on udyamregistration.gov.in using Aadhaar & PAN in 15 minutes." },
        { id: "p1_3", days: "Days 11–15", title: "Direct Wholesale Supplier & Margin Negotiation", desc: "Get minimum 3 supplier quotes for core ingredients/equipment. Negotiate 30-day payment terms." },
        { id: "p1_4", days: "Days 16–20", title: "50-Customer Pre-Launch Taste / Service Test", desc: "Sample your product or offer initial free trial service to 50 local residents to gather honest feedback." },
        { id: "p1_5", days: "Days 21–25", title: "Zero-Balance Current Account & Merchant UPI Setup", desc: "Open an online current account and configure QR payment soundboxes for instant instant settlements." },
        { id: "p1_6", days: "Days 26–30", title: "Final Unit Economics & Breakeven Calibration", desc: "Lock down your exact daily operating cost and break-even ticket volume target." },
      ],
    },
    {
      phaseNumber: 2,
      name: "Days 31–60: Space, Equipment & Operations",
      badge: "PHASE 02 · SETUP & SOURCING",
      desc: "Install core tools, finalize location lease, setup digital presence, and test operational workflow.",
      color: "var(--violet)",
      tasks: [
        { id: "p2_1", days: "Days 31–38", title: "Commercial Space Lease Agreement & Stamp Duty", desc: "Secure the counter/kiosk/space with maximum 2-month refundable security deposit." },
        { id: "p2_2", days: "Days 39–45", title: "Core Machinery & Equipment Procurement", desc: "Procure inspected new or refurbished equipment with minimum 6-month warranty." },
        { id: "p2_3", days: "Days 46–50", title: "Google Business Profile & WhatsApp Catalog Setup", desc: "Create a verified Google Maps pin with HD photos and build a WhatsApp Business product catalog." },
        { id: "p2_4", days: "Days 51–55", title: "Branded Signage & Packaging Delivery", desc: "Print standee boards, menu flyers, and eco-friendly branded packaging materials." },
        { id: "p2_5", days: "Days 56–58", title: "Government Subsidy / Mudra Loan Application", desc: "Submit your business plan on JanSamarth portal or local bank branch for interest subvention." },
        { id: "p2_6", days: "Days 59–60", title: "Dry-Run Simulation & Speed-of-Service Audit", desc: "Execute a full mock-day of 50 orders with friends to eliminate operational bottlenecks." },
      ],
    },
    {
      phaseNumber: 3,
      name: "Days 61–90: Grand Launch & First 100 Paying Customers",
      badge: "PHASE 03 · REVENUE ENGINE",
      desc: "Drive hyper-local footfall, launch inaugural referral campaigns, and achieve weekly profitability.",
      color: "var(--success)",
      tasks: [
        { id: "p3_1", days: "Days 61–65", title: "Launch Day 1+1 Special & Community Inauguration", desc: "Offer opening day specials with local society WhatsApp groups and neighboring shopkeepers." },
        { id: "p3_2", days: "Days 66–70", title: "Local Society Flyer Distribution & WhatsApp Outreach", desc: "Distribute 500 targeted flyers at apartment security gates and morning walking parks." },
        { id: "p3_3", days: "Days 71–75", title: "Google Maps 5-Star Review Incentive System", desc: "Reward customers with a ₹10 discount or free add-on for authentic Google reviews." },
        { id: "p3_4", days: "Days 76–80", title: "Corporate & Neighborhood Monthly Subscription Pass", desc: "Lock 20 recurring weekly/monthly subscribers for guaranteed baseline cashflow." },
        { id: "p3_5", days: "Days 81–85", title: "First Month Profit-and-Loss Audit & Cost Trimming", desc: "Review real margins vs estimates; eliminate slow-moving items and double down on bestsellers." },
        { id: "p3_6", days: "Days 86–90", title: "Expansion Plan & Reinvestment Strategy", desc: "Allocate 30% of month-1 net profit into working capital buffer and second-counter exploration." },
      ],
    },
  ];

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Context Bar */}
      <KiroContextBar
        pageName="90-Day Launchpad"
        seedQuery={`Help me review and optimize my 90-day launch roadmap for ${activeBusiness.title} with a capital bracket of ${formData.approxCapital}.`}
      />

      {/* Hero Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", margin: "16px 0 24px 0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-ai">🚀 90-DAY LAUNCH ENGINE</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Zero to Profit Blueprint</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--text-h)", fontFamily: "var(--font-display)" }}>
            Build Your 90-Day <span className="gradient-text">Launch Plan</span>
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 680 }}>
            Don't have a business idea yet? Or have capital ready? We analyze your capital, location, and skills to calculate unit economics and map out a day-by-day roadmap to first profit.
          </p>
        </div>

        {/* Quick Badges & Nav */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/business")}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: "rgba(99,102,241,0.3)", color: "var(--accent)", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>📍</span>
            <span>Hyper-Local Advisor</span>
          </button>
          <button
            onClick={() => navigate("/loan")}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: "rgba(6,182,212,0.3)", color: "var(--cyan)", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>🏛️</span>
            <span>Govt Loans & Subsidies</span>
          </button>
        </div>
      </div>

      {/* 5-Step Stepper Progress Bar */}
      <div className="card glass-card" style={{ padding: "16px 20px", marginBottom: 24, borderRadius: "var(--radius-lg)" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          {/* Track */}
          <div style={{ height: 4, background: "var(--border)", borderRadius: 999, width: "100%" }}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--accent), var(--violet))",
                borderRadius: 999,
                width: `${((step - 1) / 4) * 100}%`,
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[
            { num: 1, label: "You & Capital", short: "Capital" },
            { num: 2, label: "Location & Space", short: "Location" },
            { num: 3, label: "AI Discovery", short: "Match" },
            { num: 4, label: "Unit Economics", short: "Economics" },
            { num: 5, label: "90-Day Blueprint", short: "Roadmap" },
          ].map((s) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 0",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    background: isDone
                      ? "var(--success)"
                      : isActive
                      ? "linear-gradient(135deg, var(--accent), var(--violet))"
                      : "var(--surface-raised)",
                    color: isDone || isActive ? "#ffffff" : "var(--text-muted)",
                    border: `2px solid ${isActive ? "var(--accent)" : isDone ? "var(--success)" : "var(--border)"}`,
                    boxShadow: isActive ? "var(--glow-accent)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isDone ? "✓" : s.num}
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--text-h)" : isDone ? "var(--success)" : "var(--text-muted)",
                    textAlign: "center",
                  }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="card" style={{ padding: 26, borderRadius: "var(--radius-lg)", marginBottom: 24 }}>
        {/* ================= STEP 1: YOU & CAPITAL ================= */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <div>
                <span className="badge badge-ai" style={{ marginBottom: 6 }}>STEP 01 OF 05</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 2px 0", color: "var(--text-h)" }}>
                  Starting Capital & Founder Profile
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                  Whether starting with zero capital or seed funds, this unlocks the highest-margin models for you.
                </p>
              </div>
              {vault?.profile?.city && (
                <button
                  type="button"
                  onClick={handlePrefillVault}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span>⚡</span> Pre-fill from Vault
                </button>
              )}
            </div>

            <div style={{ display: "grid", gap: 18 }}>
              {/* Founder Handle */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Founder Name / Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="input"
                  style={{ height: 42, fontSize: 13 }}
                />
              </div>

              {/* Has Idea or Needs Suggestions */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                  Do you already have a specific business idea?
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => updateField("hasIdea", "no")}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${formData.hasIdea === "no" ? "var(--accent)" : "var(--border)"}`,
                      background: formData.hasIdea === "no" ? "var(--accent-soft)" : "var(--surface)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>💡</span>
                    <div>
                      <strong style={{ display: "block", fontSize: 13, color: "var(--text-h)" }}>
                        No Idea — Discover High-ROI Businesses
                      </strong>
                      <small style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                        Match me with profitable businesses based on my capital.
                      </small>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField("hasIdea", "yes")}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${formData.hasIdea === "yes" ? "var(--accent)" : "var(--border)"}`,
                      background: formData.hasIdea === "yes" ? "var(--accent-soft)" : "var(--surface)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>🎯</span>
                    <div>
                      <strong style={{ display: "block", fontSize: 13, color: "var(--text-h)" }}>
                        I Have A Specific Idea
                      </strong>
                      <small style={{ color: "var(--text-secondary)", fontSize: 11 }}>
                        I have a concept and need the 90-day profit roadmap.
                      </small>
                    </div>
                  </button>
                </div>
              </div>

              {/* Capital Bracket Grid */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                  Select Available Capital Bracket
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  {CAPITAL_BRACKETS.map((tier) => {
                    const isSelected = formData.capitalTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => updateField("capitalTier", tier.id)}
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                          background: isSelected ? "var(--accent-soft)" : "var(--surface-raised)",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 22 }}>{tier.icon}</span>
                          <span
                            className="badge"
                            style={{
                              background: isSelected ? "var(--accent)" : "var(--border)",
                              color: isSelected ? "#fff" : "var(--text-secondary)",
                              fontSize: 10,
                            }}
                          >
                            {tier.range}
                          </span>
                        </div>
                        <strong style={{ display: "block", fontSize: 13.5, color: "var(--text-h)", marginBottom: 4 }}>
                          {tier.label}
                        </strong>
                        <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                          {tier.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LOCATION & SPACE ================= */}
        {step === 2 && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <span className="badge badge-ai" style={{ marginBottom: 6 }}>STEP 02 OF 05</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 2px 0", color: "var(--text-h)" }}>
              Location & Commercial Space Profile
            </h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--text-secondary)" }}>
              Hyper-local territory parameters determine footfall velocity and real estate overheads.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {/* City */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Target City / District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indore, MP"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="input"
                  style={{ height: 42, fontSize: 13 }}
                />
              </div>

              {/* City Tier */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                  City / Market Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => updateField("tier", e.target.value)}
                  className="input"
                  style={{ height: 42, fontSize: 13 }}
                >
                  <option value="tier1">Tier 1 Metro (High Rent, Massive Demand)</option>
                  <option value="tier2">Tier 2/3 City (Balanced Rent, High Growth)</option>
                  <option value="rural">Township / Semi-Rural (Low Rent, Strong Trust)</option>
                </select>
              </div>

              {/* Space Type */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Commercial Space Strategy
                </label>
                <select
                  value={formData.spaceType}
                  onChange={(e) => updateField("spaceType", e.target.value)}
                  className="input"
                  style={{ height: 42, fontSize: 13 }}
                >
                  <option value="home">Home-Based / Online (Zero Rent)</option>
                  <option value="kiosk">Collapsible Kiosk / Street Corner (₹2k-5k rent)</option>
                  <option value="shop">Retail Shopfront / Alley (₹8k-18k rent)</option>
                  <option value="commercial">Commercial Unit / Hub (₹20k+ rent)</option>
                </select>
              </div>

              {/* Primary Target Audience */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Target Audience Catchment
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => updateField("targetAudience", e.target.value)}
                  className="input"
                  style={{ height: 42, fontSize: 13 }}
                >
                  <option value="local_residents">Residential Families & Colonies</option>
                  <option value="students">College Students & Migrants</option>
                  <option value="retailers">Local Retailers & B2B Businesses</option>
                  <option value="transit">Commuters & Transit Passers</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: AI DISCOVERY & MATCH ================= */}
        {step === 3 && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <span className="badge badge-ai" style={{ marginBottom: 6 }}>STEP 03 OF 05</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 2px 0", color: "var(--text-h)" }}>
              Curated Business Matches for {formData.capitalTier.toUpperCase()} Capital
            </h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--text-secondary)" }}>
              Calculated for fast break-even, high margins, and zero dead-stock risk. Select one to generate your blueprint.
            </p>

            <div style={{ display: "grid", gap: 14 }}>
              {recommendedBusinesses.map((biz) => {
                const isSelected = formData.selectedBusinessId === biz.id;
                return (
                  <div
                    key={biz.id}
                    onClick={() => updateField("selectedBusinessId", biz.id)}
                    style={{
                      padding: "18px 22px",
                      borderRadius: 14,
                      border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                      background: isSelected ? "var(--accent-soft)" : "var(--surface-raised)",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>⭐</span>
                          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--text-h)" }}>
                            {biz.title}
                          </h3>
                        </div>
                        <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "var(--text-secondary)" }}>
                          {biz.tagline}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <span className="badge" style={{ background: "var(--success-soft)", color: "var(--success)", fontSize: 11 }}>
                          Profit: {biz.monthlyProfit}/mo
                        </span>
                        <span className="badge" style={{ background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11 }}>
                          Margin: {biz.margin}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <div>
                        <small style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Why It Wins</small>
                        <span style={{ fontSize: 11.5, color: "var(--text)" }}>{biz.whyWins}</span>
                      </div>
                      <div>
                        <small style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Break-Even Horizon</small>
                        <span style={{ fontSize: 11.5, color: "var(--success)", fontWeight: 700 }}>~{biz.breakevenDays} Days to Profit</span>
                      </div>
                      <div>
                        <small style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Key Equipment</small>
                        <span style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{biz.equipment.slice(0, 2).join(", ")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: UNIT ECONOMICS & SUBSIDIES ================= */}
        {step === 4 && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <span className="badge badge-ai" style={{ marginBottom: 6 }}>STEP 04 OF 05</span>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 2px 0", color: "var(--text-h)" }}>
              Unit Economics & Subsidy Matching: {activeBusiness.title}
            </h2>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--text-secondary)" }}>
              Financial architecture, operating cost run-rate, and matched government schemes.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
              {/* Financial Summary Card */}
              <div className="card" style={{ padding: 20, borderRadius: 12, background: "var(--surface-raised)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px 0", color: "var(--text-h)" }}>
                  📊 Financial Projections
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Estimated Startup Cost</span>
                    <strong style={{ color: "var(--text-h)" }}>{activeBusiness.estimatedStartup}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Gross Profit Margin</span>
                    <strong style={{ color: "var(--success)" }}>{activeBusiness.margin}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Target Monthly Net Profit</span>
                    <strong style={{ color: "var(--accent)" }}>{activeBusiness.monthlyProfit}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Breakeven Velocity</span>
                    <strong style={{ color: "var(--violet)" }}>~{activeBusiness.breakevenDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* Subsidies & Compliance */}
              <div className="card" style={{ padding: 20, borderRadius: 12, background: "var(--surface-raised)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 14px 0", color: "var(--text-h)" }}>
                  🏛️ Matched Government Schemes & Licenses
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <small style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Required Registrations</small>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                      {activeBusiness.licenses.map((lic, i) => (
                        <span key={i} className="badge" style={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 11 }}>
                          {lic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <small style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Subsidy Route</small>
                    <span style={{ fontSize: 12.5, color: "var(--cyan)", fontWeight: 600 }}>
                      PMMY Mudra Shishu/Kishor + PMEGP 25-35% Capital Subsidy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: 90-DAY BLUEPRINT ================= */}
        {step === 5 && (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="badge badge-ai" style={{ marginBottom: 6 }}>STEP 05 OF 05 · EXECUTION BLUEPRINT</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 2px 0", color: "var(--text-h)" }}>
                  90-Day Roadmap for {activeBusiness.title}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                  Tick off each milestone as you progress. Progress is saved automatically.
                </p>
              </div>

              {/* Readiness Score Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 16px",
                  borderRadius: 12,
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--success)" }}>{progressPercentage}%</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                  <strong>{completedTasksCount} / {totalTasksCount}</strong> tasks complete
                </div>
              </div>
            </div>

            {/* Timeline Phases */}
            <div style={{ display: "grid", gap: 20 }}>
              {phases.map((phase) => (
                <div key={phase.phaseNumber} className="card" style={{ padding: 22, borderRadius: 14, border: `1px solid var(--border)` }}>
                  <div style={{ marginBottom: 14 }}>
                    <span className="badge" style={{ background: "var(--accent-soft)", color: phase.color, fontSize: 10, fontWeight: 800 }}>
                      {phase.badge}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-h)", margin: "6px 0 2px 0" }}>
                      {phase.name}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
                      {phase.desc}
                    </p>
                  </div>

                  {/* Task List */}
                  <div style={{ display: "grid", gap: 8 }}>
                    {phase.tasks.map((task) => {
                      const isDone = Boolean(completedTasks[task.id]);
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: `1px solid ${isDone ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                            background: isDone ? "var(--success-soft)" : "var(--surface-raised)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}}
                            style={{ marginTop: 3, cursor: "pointer", accentColor: "var(--success)" }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: "var(--accent)", background: "var(--accent-soft)", padding: "1px 6px", borderRadius: 4 }}>
                                {task.days}
                              </span>
                              <strong style={{ fontSize: 13, color: isDone ? "var(--text-muted)" : "var(--text-h)", textDecoration: isDone ? "line-through" : "none" }}>
                                {task.title}
                              </strong>
                            </div>
                            <p style={{ margin: "3px 0 0 0", fontSize: 11.5, color: "var(--text-secondary)" }}>
                              {task.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}>
              <button
                onClick={() => window.print()}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>🖨️</span>
                <span>Print Roadmap</span>
              </button>

              <button
                onClick={() => navigate("/chat", { state: { initialQuery: `Help me customize the 90-day launch roadmap for ${activeBusiness.title} in ${formData.city}. How can I accelerate Phase 1 customer acquisition?` } })}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>💬</span>
                <span>Ask Kiro to Customize Blueprint →</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="btn btn-secondary"
            style={{ opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? "not-allowed" : "pointer" }}
          >
            ← Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              className="btn btn-primary"
              style={{ padding: "10px 24px", fontWeight: 700 }}
            >
              Continue to Step {step + 1} →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/chat", { state: { initialQuery: `I am executing the 90-day plan for ${activeBusiness.title}. What should my week-1 priorities be?` } })}
              className="btn btn-primary"
              style={{ padding: "10px 24px", fontWeight: 700 }}
            >
              Start Day 1 Execution with Kiro 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
