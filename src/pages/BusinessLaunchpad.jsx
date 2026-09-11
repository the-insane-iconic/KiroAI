import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Local storage keys
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
    badge: "Low Risk · Fast Launch",
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

// Pre-configured curated profitable business recommendations by capital tier
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
      equipment: ["1000 LPH RO commercial unit", "150 food-grade 20L polycarbonate bubble jars", "Electric delivery cargo tricycle/loader"],
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
      tagline: "Full oil change, electronic scan, brake service and foam wash with 45-minute guaranteed turnaround.",
      estimatedStartup: "₹3,80,000",
      monthlyProfit: "₹1,20,000 – ₹2,40,000",
      margin: "45%",
      breakevenDays: 60,
      whyWins: "Authorized bike service centers charge high labor and require 2-day drops. Hyperlocal express centers win customer trust.",
      equipment: ["Hydraulic bike lift", "High-pressure washer & foam gun", "Air compressor", "Diagnostic scan tool & tool trolley"],
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
      equipment: ["Wooden Ghani / Cold-press oil expeller", "Seed cleaning & roasting sieve", "Stainless steel storage tanks", "Bottling & capping station"],
      licenses: ["FSSAI Manufacturing License", "GST Registration", "Udyam MSME (Subsidized under PMEGP 25-35%)"],
    },
  ],
};

export default function BusinessLaunchpad() {
  const navigate = useNavigate();

  // Wizard state
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
      offeringType: "both", // product, service, both
      industry: "Food & Cafe / Quick Bites",
      timeCommitment: "fulltime", // fulltime, parttime
      city: "Indore",
      tier: "tier2", // tier1, tier2, rural
      spaceType: "kiosk", // home, online, kiosk, shop, commercial
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

  // Persist form data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  // Persist tasks
  useEffect(() => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(completedTasks));
    } catch (_) {}
  }, [completedTasks]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTask = (taskId) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      return next;
    });
  };

  // Recommendations calculated based on selected capital bracket
  const recommendedBusinesses = useMemo(() => {
    const list = CURATED_BUSINESSES[formData.capitalTier] || CURATED_BUSINESSES.seed;
    return list;
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

  // Total tasks count & completion
  const totalTasksCount = 18; // 6 tasks per 30-day phase
  const completedTasksCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100);

  return (
    <div style={styles.page}>

      {/* Main Launchpad Container */}
      <div style={styles.container}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroTag}>
            <span style={styles.pulseDot}></span>
            90-Day Business Engine · Zero to Profit
          </div>
          <h1 style={styles.heroTitle}>Build Your 90-Day Launch Plan</h1>
          <p style={styles.heroSub}>
            Don't have a business idea yet? Or only have capital? We analyze your capital, location, and skills to recommend the highest-profit business and map out an exact day-by-day roadmap to first profit.
          </p>

          {/* Quick value badges */}
          <div style={styles.badgeRow}>
            <span style={styles.pillBadge}>⚡ Zero or Seed Capital Ready</span>
            <span style={styles.pillBadge}>🏛️ Mudra & PMEGP Subsidy Match</span>
            <span style={styles.pillBadge}>📈 Break-Even & Unit Economics</span>
            <span style={styles.pillBadge}>🗓️ Daily 90-Day Checklist</span>
          </div>
        </section>

        {/* 5-Step Stepper Progress Bar */}
        <div style={styles.stepperWrapper}>
          <div style={styles.stepperTrack}>
            <div
              style={{
                ...styles.stepperFill,
                width: `${((step - 1) / 4) * 100}%`,
              }}
            />
          </div>

          <div style={styles.stepperButtons}>
            {[
              { num: 1, label: "You & Capital", short: "Capital" },
              { num: 2, label: "Location & Space", short: "Location" },
              { num: 3, label: "AI Discovery", short: "Opportunity" },
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
                    ...styles.stepBtn,
                    color: isActive ? "var(--text-h)" : isDone ? "#10B981" : "var(--muted)",
                  }}
                >
                  <div
                    style={{
                      ...styles.stepCircle,
                      background: isDone
                        ? "#10B981"
                        : isActive
                        ? "linear-gradient(135deg, #8B5CF6, #6366F1)"
                        : "var(--surface)",
                      color: isDone || isActive ? "#FFFFFF" : "var(--muted)",
                      borderColor: isActive ? "#8B5CF6" : isDone ? "#10B981" : "var(--border)",
                      boxShadow: isActive ? "0 0 12px rgba(139, 92, 246, 0.45)" : "none",
                    }}
                  >
                    {isDone ? "✓" : s.num}
                  </div>
                  <span style={styles.stepLabel}>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Card */}
        <div style={styles.card}>
          {/* ================= STEP 1: YOU & CAPITAL ================= */}
          {step === 1 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepTag}>STEP 01 OF 05</div>
                <h2 style={styles.stepTitle}>Your Starting Capital & Background</h2>
                <p style={styles.stepDesc}>
                  Whether you have capital looking for an idea, or zero capital looking for a fast-start service, this determines your highest-margin opportunities.
                </p>
              </div>

              <div style={styles.formGrid}>
                {/* Name */}
                <div style={styles.fieldFull}>
                  <label style={styles.label}>
                    Your Name or Founder Handle <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    style={styles.input}
                  />
                </div>

                {/* Do you have an idea? */}
                <div style={styles.fieldFull}>
                  <label style={styles.label}>
                    Do you already have a specific business idea? <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={styles.choiceGrid2}>
                    <button
                      type="button"
                      onClick={() => updateField("hasIdea", "no")}
                      style={{
                        ...styles.choiceCard,
                        borderColor: formData.hasIdea === "no" ? "#8B5CF6" : "var(--border)",
                        background: formData.hasIdea === "no" ? "rgba(139, 92, 246, 0.12)" : "var(--surface-soft)",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>🪙</span>
                      <div>
                        <strong style={{ display: "block", color: "var(--text-h)", fontSize: "13px" }}>
                          No Idea — Suggest Profitable Businesses
                        </strong>
                        <small style={{ color: "var(--muted)", fontSize: "10.5px" }}>
                          I have capital or skills; match me with high-ROI businesses in my city.
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField("hasIdea", "yes")}
                      style={{
                        ...styles.choiceCard,
                        borderColor: formData.hasIdea === "yes" ? "#8B5CF6" : "var(--border)",
                        background: formData.hasIdea === "yes" ? "rgba(139, 92, 246, 0.12)" : "var(--surface-soft)",
                      }}
                    >
                      <span style={{ fontSize: "22px" }}>💡</span>
                      <div>
                        <strong style={{ display: "block", color: "var(--text-h)", fontSize: "13px" }}>
                          I Have An Idea
                        </strong>
                        <small style={{ color: "var(--muted)", fontSize: "10.5px" }}>
                          I have a rough concept and need the step-by-step 90-day profit plan.
                        </small>
                      </div>
                    </button>
                  </div>
                </div>

                {/* If has idea, describe it */}
                {formData.hasIdea === "yes" && (
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>
                      Describe Your Idea & Target Customer
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What do you plan to sell? Who is your customer? What makes you unique?"
                      value={formData.ideaDescription}
                      onChange={(e) => updateField("ideaDescription", e.target.value)}
                      style={styles.textarea}
                    />
                  </div>
                )}

                {/* Capital Brackets Selector */}
                <div style={styles.fieldFull}>
                  <label style={styles.label}>
                    Available Investment Capital <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={styles.capitalGrid}>
                    {CAPITAL_BRACKETS.map((cap) => {
                      const isSel = formData.capitalTier === cap.id;
                      return (
                        <div
                          key={cap.id}
                          onClick={() => {
                            updateField("capitalTier", cap.id);
                            // Auto select first business in that tier
                            const tierList = CURATED_BUSINESSES[cap.id] || [];
                            if (tierList[0]) updateField("selectedBusinessId", tierList[0].id);
                          }}
                          style={{
                            ...styles.capCard,
                            borderColor: isSel ? "#8B5CF6" : "var(--border)",
                            background: isSel ? "rgba(139, 92, 246, 0.14)" : "var(--surface-soft)",
                          }}
                        >
                          <div style={styles.capHeader}>
                            <span style={{ fontSize: "24px" }}>{cap.icon}</span>
                            <span style={{ ...styles.capBadge, background: isSel ? "#8B5CF6" : "var(--border)", color: "#fff" }}>
                              {cap.range}
                            </span>
                          </div>
                          <strong style={{ fontSize: "13px", color: "var(--text-h)", marginTop: "8px", display: "block" }}>
                            {cap.label}
                          </strong>
                          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                            {cap.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Product vs Service */}
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Product, Service, or Hybrid?</label>
                  <div style={styles.buttonGroup3}>
                    {["product", "service", "both"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateField("offeringType", opt)}
                        style={{
                          ...styles.segmentedBtn,
                          background: formData.offeringType === opt ? "linear-gradient(135deg, #8B5CF6, #6366F1)" : "var(--surface-soft)",
                          color: formData.offeringType === opt ? "#FFFFFF" : "var(--muted)",
                          borderColor: formData.offeringType === opt ? "#8B5CF6" : "var(--border)",
                        }}
                      >
                        {opt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry Interest */}
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Industry / Domain of Interest</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateField("industry", e.target.value)}
                    style={styles.select}
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Commitment */}
                <div style={styles.fieldFull}>
                  <label style={styles.label}>Weekly Time Commitment</label>
                  <div style={styles.choiceGrid2}>
                    <button
                      type="button"
                      onClick={() => updateField("timeCommitment", "fulltime")}
                      style={{
                        ...styles.choiceCardMini,
                        borderColor: formData.timeCommitment === "fulltime" ? "#8B5CF6" : "var(--border)",
                        background: formData.timeCommitment === "fulltime" ? "rgba(139, 92, 246, 0.12)" : "var(--surface-soft)",
                      }}
                    >
                      <span>💼 Full-Time Founder (40+ hrs/week)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("timeCommitment", "parttime")}
                      style={{
                        ...styles.choiceCardMini,
                        borderColor: formData.timeCommitment === "parttime" ? "#8B5CF6" : "var(--border)",
                        background: formData.timeCommitment === "parttime" ? "rgba(139, 92, 246, 0.12)" : "var(--surface-soft)",
                      }}
                    >
                      <span>🌙 Part-Time / Weekend Hustle (15-20 hrs)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Wizard Footer Navigation */}
              <div style={styles.wizardFooter}>
                <div></div>
                <button
                  onClick={() => setStep(2)}
                  style={styles.primaryNextBtn}
                >
                  Continue to Location & Space →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: LOCATION & SPACE ================= */}
          {step === 2 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepTag}>STEP 02 OF 05</div>
                <h2 style={styles.stepTitle}>Location, Workspace & Target Market</h2>
                <p style={styles.stepDesc}>
                  Rent is the #1 killer of early businesses. Choosing whether to start home-based, cloud-first, or in a kiosk drastically alters your break-even point.
                </p>
              </div>

              <div style={styles.formGrid}>
                {/* City */}
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Your City / District</label>
                  <input
                    type="text"
                    placeholder="e.g. Ranchi, Indore, Lucknow, Pune"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    style={styles.input}
                  />
                </div>

                {/* Tier */}
                <div style={styles.fieldHalf}>
                  <label style={styles.label}>Location Geography Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => updateField("tier", e.target.value)}
                    style={styles.select}
                  >
                    <option value="tier1">Tier 1 Metro (High purchasing power, high rent)</option>
                    <option value="tier2">Tier 2 / 3 City (Rapid growth, moderate rent)</option>
                    <option value="rural">Semi-Urban Town / Rural Village (Low competition, low rent)</option>
                  </select>
                </div>

                {/* Space Type */}
                <div style={styles.fieldFull}>
                  <label style={styles.label}>Proposed Workspace / Premises</label>
                  <div style={styles.spaceGrid}>
                    {[
                      { id: "home", icon: "🏠", label: "Home / Garage Based", rent: "₹0 / mo", desc: "No shop lease. Perfect for delivery, packaging or digital services." },
                      { id: "online", icon: "🌐", label: "Online & WhatsApp First", rent: "₹0 / mo", desc: "Zero physical retail presence. All orders through phone & social." },
                      { id: "kiosk", icon: "🎪", label: "Street Booth / Kiosk", rent: "₹2,000 – ₹6,000 / mo", desc: "High footfall street corner with small municipal permit." },
                      { id: "shop", icon: "🏪", label: "High Street Rented Shop", rent: "₹12,000 – ₹25,000 / mo", desc: "Physical retail walk-ins and prominent exterior branding." },
                    ].map((sp) => {
                      const isSel = formData.spaceType === sp.id;
                      return (
                        <div
                          key={sp.id}
                          onClick={() => updateField("spaceType", sp.id)}
                          style={{
                            ...styles.spaceCard,
                            borderColor: isSel ? "#8B5CF6" : "var(--border)",
                            background: isSel ? "rgba(139, 92, 246, 0.12)" : "var(--surface-soft)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "24px" }}>{sp.icon}</span>
                            <span style={{ fontSize: "10px", fontWeight: "700", color: "#10B981" }}>{sp.rent}</span>
                          </div>
                          <strong style={{ fontSize: "12.5px", color: "var(--text-h)", marginTop: "8px", display: "block" }}>
                            {sp.label}
                          </strong>
                          <p style={{ fontSize: "10.5px", color: "var(--muted)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                            {sp.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Audience */}
                <div style={styles.fieldFull}>
                  <label style={styles.label}>Primary Customer Segment</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => updateField("targetAudience", e.target.value)}
                    style={styles.select}
                  >
                    <option value="local_residents">Local residential families & housing societies</option>
                    <option value="students">College students & young professionals</option>
                    <option value="b2b">Local businesses, offices & retailers (B2B wholesale)</option>
                    <option value="online_nationwide">Online customers across India</option>
                  </select>
                </div>
              </div>

              {/* Wizard Footer Navigation */}
              <div style={styles.wizardFooter}>
                <button
                  onClick={() => setStep(1)}
                  style={styles.secondaryBackBtn}
                >
                  ← Back to Capital
                </button>
                <button
                  onClick={() => setStep(3)}
                  style={styles.primaryNextBtn}
                >
                  Discover AI Opportunities →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: AI DISCOVERY ================= */}
          {step === 3 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepTag}>STEP 03 OF 05</div>
                <h2 style={styles.stepTitle}>AI Business Discovery & Competitive Edge</h2>
                <p style={styles.stepDesc}>
                  Based on your <strong>{CAPITAL_BRACKETS.find((c) => c.id === formData.capitalTier)?.label}</strong> in <strong>{formData.city}</strong>, we've identified the top 3 highest-margin business models. Select one to proceed to the 90-day plan.
                </p>
              </div>

              {/* Opportunities List */}
              <div style={styles.opportunityList}>
                {recommendedBusinesses.map((biz) => {
                  const isSelected = formData.selectedBusinessId === biz.id;
                  return (
                    <div
                      key={biz.id}
                      onClick={() => updateField("selectedBusinessId", biz.id)}
                      style={{
                        ...styles.opportunityCard,
                        borderColor: isSelected ? "#8B5CF6" : "var(--border)",
                        background: isSelected ? "rgba(139, 92, 246, 0.08)" : "var(--surface-soft)",
                        boxShadow: isSelected ? "0 0 16px rgba(139, 92, 246, 0.2)" : "none",
                      }}
                    >
                      <div style={styles.opportunityHeader}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <h3 style={{ margin: 0, fontSize: "15px", color: "var(--text-h)" }}>
                              {biz.title}
                            </h3>
                            {isSelected && (
                              <span style={styles.selectedPill}>★ SELECTED TO LAUNCH</span>
                            )}
                          </div>
                          <p style={{ margin: "4px 0 0 0", fontSize: "11.5px", color: "var(--muted)" }}>
                            {biz.tagline}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="selectedBiz"
                          checked={isSelected}
                          onChange={() => updateField("selectedBusinessId", biz.id)}
                          style={{ width: "18px", height: "18px", accentColor: "#8B5CF6", cursor: "pointer" }}
                        />
                      </div>

                      {/* Metrics bar */}
                      <div style={styles.metricRow}>
                        <div style={styles.metricBox}>
                          <span style={styles.metricLabel}>Startup Capex</span>
                          <strong style={styles.metricVal}>{biz.estimatedStartup}</strong>
                        </div>
                        <div style={styles.metricBox}>
                          <span style={styles.metricLabel}>Net Monthly Profit</span>
                          <strong style={{ ...styles.metricVal, color: "#10B981" }}>{biz.monthlyProfit}</strong>
                        </div>
                        <div style={styles.metricBox}>
                          <span style={styles.metricLabel}>Gross Margin</span>
                          <strong style={{ ...styles.metricVal, color: "#38BDF8" }}>{biz.margin}</strong>
                        </div>
                        <div style={styles.metricBox}>
                          <span style={styles.metricLabel}>Days to Break-Even</span>
                          <strong style={{ ...styles.metricVal, color: "#F59E0B" }}>{biz.breakevenDays} Days</strong>
                        </div>
                      </div>

                      {/* Why this wins */}
                      <div style={styles.whyWinsBox}>
                        <strong style={{ fontSize: "11px", color: "var(--text-h)" }}>🎯 Why It Wins Locally:</strong>
                        <p style={{ fontSize: "11px", color: "var(--text)", margin: "3px 0 0 0", lineHeight: 1.4 }}>
                          {biz.whyWins}
                        </p>
                      </div>

                      {/* Equipment preview */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
                        {biz.equipment.map((eq, i) => (
                          <span key={i} style={styles.equipmentChip}>
                            📦 {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wizard Footer Navigation */}
              <div style={styles.wizardFooter}>
                <button
                  onClick={() => setStep(2)}
                  style={styles.secondaryBackBtn}
                >
                  ← Back to Location
                </button>
                <button
                  onClick={() => setStep(4)}
                  style={styles.primaryNextBtn}
                >
                  Review Unit Economics & Subsidies →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 4: UNIT ECONOMICS & LICENSES ================= */}
          {step === 4 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepTag}>STEP 04 OF 05</div>
                <h2 style={styles.stepTitle}>Unit Economics, Licenses & Govt Subsidies</h2>
                <p style={styles.stepDesc}>
                  Clear math prevents business failure. Here is your initial cashflow requirement, break-even target, and free government schemes.
                </p>
              </div>

              {/* Selected Plan Summary Banner */}
              <div style={styles.highlightBanner}>
                <div>
                  <small style={{ color: "#A78BFA", fontWeight: "700", textTransform: "uppercase", fontSize: "10px", letterSpacing: "1px" }}>
                    Selected Venture
                  </small>
                  <h3 style={{ margin: "2px 0 0 0", fontSize: "16px", color: "#FFFFFF" }}>
                    {activeBusiness.title}
                  </h3>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: "#94A3B8" }}>Target Margin</span>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: "#10B981" }}>
                    {activeBusiness.margin} Net
                  </div>
                </div>
              </div>

              <div style={styles.grid2Col}>
                {/* Left: Financial Math */}
                <div style={styles.subCard}>
                  <h4 style={styles.subCardTitle}>💰 Setup vs Operational Capital</h4>
                  <div style={styles.financeList}>
                    <div style={styles.financeItem}>
                      <span>Core Tools & Equipment</span>
                      <strong>{activeBusiness.estimatedStartup}</strong>
                    </div>
                    <div style={styles.financeItem}>
                      <span>First Batch Inventory / Raw Materials</span>
                      <strong>₹5,000 – ₹15,000</strong>
                    </div>
                    <div style={styles.financeItem}>
                      <span>Signage, QR Codes & WhatsApp Business</span>
                      <strong>₹1,000 – ₹2,500</strong>
                    </div>
                    <div style={styles.financeItem}>
                      <span>Safety Buffer Reserve</span>
                      <strong>₹5,000</strong>
                    </div>
                    <div style={{ ...styles.financeItem, borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                      <b style={{ color: "var(--text-h)" }}>Break-Even Target Volume</b>
                      <b style={{ color: "#10B981" }}>12 – 18 orders / day</b>
                    </div>
                  </div>
                </div>

                {/* Right: Govt Schemes & Free Registrations */}
                <div style={styles.subCard}>
                  <h4 style={styles.subCardTitle}>🏛️ Free Govt Schemes & Subsidies</h4>
                  <div style={styles.schemeList}>
                    <div style={styles.schemeItem}>
                      <div style={styles.schemeIcon}>📜</div>
                      <div>
                        <strong style={{ fontSize: "12px", color: "var(--text-h)" }}>
                          MSME Udyam Registration (100% Free)
                        </strong>
                        <p style={{ fontSize: "10.5px", color: "var(--muted)", margin: "2px 0 0 0" }}>
                          Get priority sector lending, bank account opening without fee, and credit subsidies.
                        </p>
                      </div>
                    </div>

                    <div style={styles.schemeItem}>
                      <div style={styles.schemeIcon}>💳</div>
                      <div>
                        <strong style={{ fontSize: "12px", color: "var(--text-h)" }}>
                          PM MUDRA Yojana (Up to ₹50k to ₹10 Lakhs)
                        </strong>
                        <p style={{ fontSize: "10.5px", color: "var(--muted)", margin: "2px 0 0 0" }}>
                          Collateral-free micro loans from PSU banks (Shishu & Kishor brackets).
                        </p>
                      </div>
                    </div>

                    <div style={styles.schemeItem}>
                      <div style={styles.schemeIcon}>🏷️</div>
                      <div>
                        <strong style={{ fontSize: "12px", color: "var(--text-h)" }}>
                          PMEGP Subsidy (15% to 35% Govt Grant)
                        </strong>
                        <p style={{ fontSize: "10.5px", color: "var(--muted)", margin: "2px 0 0 0" }}>
                          Margin money subsidy on manufacturing and service projects funded via KVIC.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wizard Footer Navigation */}
              <div style={styles.wizardFooter}>
                <button
                  onClick={() => setStep(3)}
                  style={styles.secondaryBackBtn}
                >
                  ← Back to Discovery
                </button>
                <button
                  onClick={() => setStep(5)}
                  style={styles.primaryNextBtn}
                >
                  Generate 90-Day Profit Roadmap →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 5: 90-DAY PROFIT ROADMAP ================= */}
          {step === 5 && (
            <div style={styles.stepContent}>
              <div style={styles.stepHeader}>
                <div style={styles.stepTag}>STEP 05 OF 05 · MASTER ROADMAP</div>
                <h2 style={styles.stepTitle}>Your 90-Day Day-by-Day Launch & Profit Blueprint</h2>
                <p style={styles.stepDesc}>
                  Executing every single milestone ensures you break-even by Day 45 and lock in sustained net monthly profit by Day 90. Click the checkboxes as you complete each task.
                </p>
              </div>

              {/* Readiness Score Panel */}
              <div style={styles.readinessPanel}>
                <div style={styles.scoreCircle}>
                  <span style={{ fontSize: "28px", fontWeight: "900", color: "#10B981" }}>94%</span>
                  <small style={{ fontSize: "9px", color: "var(--muted)" }}>VIABILITY</small>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <strong style={{ fontSize: "14px", color: "var(--text-h)" }}>
                      Execution Progress: {completedTasksCount} / {totalTasksCount} Milestones Done
                    </strong>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#8B5CF6" }}>
                      {progressPercentage}% Completed
                    </span>
                  </div>
                  <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${progressPercentage}%` }} />
                  </div>
                  <div style={{ display: "flex", gap: "14px", marginTop: "8px", flexWrap: "wrap" }}>
                    <span style={styles.quickStat}>🚀 Venture: <strong>{activeBusiness.title}</strong></span>
                    <span style={styles.quickStat}>📍 Location: <strong>{formData.city}</strong></span>
                    <span style={styles.quickStat}>💰 Target Net: <strong>{activeBusiness.monthlyProfit}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  style={styles.printBtn}
                  title="Print or Save PDF"
                >
                  🖨️ Print Blueprint
                </button>
              </div>

              {/* 3 PHASES TIMELINE */}
              <div style={styles.phaseTimeline}>
                {/* PHASE 1: DAYS 1 - 30 */}
                <div style={styles.phaseCard}>
                  <div style={styles.phaseHeader}>
                    <div style={{ ...styles.phaseBadge, background: "rgba(139, 92, 246, 0.18)", color: "#A78BFA" }}>
                      PHASE 1 · DAYS 1 TO 30
                    </div>
                    <h3 style={styles.phaseTitle}>Foundation, Zero-Cost Legal & Pilot Batch</h3>
                    <p style={styles.phaseDesc}>Setting up bank account, vendor sourcing, and family/beta trials with zero wasted capex.</p>
                  </div>

                  <div style={styles.taskList}>
                    {[
                      { id: "p1_1", days: "Days 1–5", title: "Complete Free Udyam Registration & Open Bank Current Account", desc: "Use Aadhaar & PAN on udyamregistration.gov.in. Zero fee, instant MSME recognition." },
                      { id: "p1_2", days: "Days 6–10", title: "Shortlist 3 Wholesale Vendors & Order First Sample Stock", desc: "Compare prices across wholesale markets (APMC / local distributors). Negotiate credit for reorders." },
                      { id: "p1_3", days: "Days 11–15", title: "Set Up WhatsApp Business Catalogue & Payment QR Code", desc: "Add product photos, pricing, business bio, and print standee QR code with zero transaction fee." },
                      { id: "p1_4", days: "Days 16–20", title: "Workspace & Equipment Inspection Setup", desc: `Assemble core equipment (${activeBusiness.equipment.join(", ")}) and test run under full load.` },
                      { id: "p1_5", days: "Days 21–25", title: "Trial Run with 20 Friendly Testers", desc: "Deliver your product/service to 20 neighbors or friends. Gather feedback on quality and packaging." },
                      { id: "p1_6", days: "Days 26–30", title: "Lock Pricing & Prepare Launch Inventory", desc: "Audit direct costs, fix 40-55% gross margin, and stock raw material for opening week." },
                    ].map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        style={{
                          ...styles.taskRow,
                          background: completedTasks[task.id] ? "rgba(16, 185, 129, 0.08)" : "var(--surface-soft)",
                          borderColor: completedTasks[task.id] ? "#10B981" : "var(--border)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!completedTasks[task.id]}
                          onChange={() => {}}
                          style={{ width: "18px", height: "18px", accentColor: "#10B981", cursor: "pointer", marginTop: "2px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={styles.taskDays}>{task.days}</span>
                            <strong style={{ fontSize: "12.5px", color: completedTasks[task.id] ? "var(--text-h)" : "var(--text-h)", textDecoration: completedTasks[task.id] ? "line-through" : "none" }}>
                              {task.title}
                            </strong>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "3px 0 0 0", lineHeight: 1.4 }}>
                            {task.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PHASE 2: DAYS 31 - 60 */}
                <div style={styles.phaseCard}>
                  <div style={styles.phaseHeader}>
                    <div style={{ ...styles.phaseBadge, background: "rgba(56, 189, 248, 0.18)", color: "#38BDF8" }}>
                      PHASE 2 · DAYS 31 TO 60
                    </div>
                    <h3 style={styles.phaseTitle}>The First 100 Paying Customers & Local Marketing</h3>
                    <p style={styles.phaseDesc}>Transitioning from soft launch to a steady daily stream of walk-ins or orders.</p>
                  </div>

                  <div style={styles.taskList}>
                    {[
                      { id: "p2_1", days: "Days 31–35", title: "Grand Soft Opening with Launch Incentive", desc: "Announce 'Buy 1 Get Free Extra' or 'Flat 20% Opening Special' across local apartment WhatsApp groups." },
                      { id: "p2_2", days: "Days 36–40", title: "Create & Verify Google Business Profile", desc: "Upload high-res photos, business hours, and place an in-store QR code asking happy customers to review." },
                      { id: "p2_3", days: "Days 41–45", title: "Targeted Pamphlet & Society Gate Distribution", desc: "Distribute 500 flyers within a 1.5 km radius offering a free trial or first-visit discount code." },
                      { id: "p2_4", days: "Days 46–50", title: "Reach 50 Unique Paying Transactions", desc: "Track every payment and mobile number to build your direct VIP customer broadcast list." },
                      { id: "p2_5", days: "Days 51–55", title: "Address Early Bottlenecks & Speed Up Service", desc: "Identify what caused wait times or customer drop-offs and optimize operational speed by 25%." },
                      { id: "p2_6", days: "Days 56–60", title: "Hit Milestone: First 100 Paying Customers!", desc: "Break-even volume achieved! Operating cashflow now pays for daily stock and rent." },
                    ].map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        style={{
                          ...styles.taskRow,
                          background: completedTasks[task.id] ? "rgba(16, 185, 129, 0.08)" : "var(--surface-soft)",
                          borderColor: completedTasks[task.id] ? "#10B981" : "var(--border)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!completedTasks[task.id]}
                          onChange={() => {}}
                          style={{ width: "18px", height: "18px", accentColor: "#10B981", cursor: "pointer", marginTop: "2px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ ...styles.taskDays, background: "rgba(56, 189, 248, 0.15)", color: "#38BDF8" }}>{task.days}</span>
                            <strong style={{ fontSize: "12.5px", color: "var(--text-h)", textDecoration: completedTasks[task.id] ? "line-through" : "none" }}>
                              {task.title}
                            </strong>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "3px 0 0 0", lineHeight: 1.4 }}>
                            {task.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PHASE 3: DAYS 61 - 90 */}
                <div style={styles.phaseCard}>
                  <div style={styles.phaseHeader}>
                    <div style={{ ...styles.phaseBadge, background: "rgba(16, 185, 129, 0.18)", color: "#10B981" }}>
                      PHASE 3 · DAYS 61 TO 90
                    </div>
                    <h3 style={styles.phaseTitle}>Repeat Sales Engine & Net Monthly Profit Realization</h3>
                    <p style={styles.phaseDesc}>Slashing supplier cost, creating repeat loops, and taking your first owner profit draw.</p>
                  </div>

                  <div style={styles.taskList}>
                    {[
                      { id: "p3_1", days: "Days 61–65", title: "Launch WhatsApp VIP Loyalty Club", desc: "Offer monthly subscriptions or 'Buy 5 get 6th Free' cards to turn occasional buyers into weekly regulars." },
                      { id: "p3_2", days: "Days 66–70", title: "Negotiate 8% to 15% Bulk Discount with Suppliers", desc: "Leverage your proven monthly purchase volume to lower raw material cost and expand gross margins." },
                      { id: "p3_3", days: "Days 71–75", title: "Launch Referral Engine ('Bring a Friend')", desc: "Give existing customers a ₹50 credit for every new paying customer they introduce." },
                      { id: "p3_4", days: "Days 76–80", title: "Log All Financials in Ami-Vest Finance Hub", desc: "Track exact revenue vs expenses on Ami-Vest to view cashflow trends and reserve ratios." },
                      { id: "p3_5", days: "Days 81–85", title: "Achieve Target Monthly Net Profit Margin", desc: `Reach steady run-rate of ${activeBusiness.monthlyProfit} with stable unit economics.` },
                      { id: "p3_6", days: "Days 86–90", title: "Profit Split & Growth Capital Allocation", desc: "Deploy the 50/30/20 formula: 50% owner salary/profit take, 30% inventory reinvestment, 20% marketing." },
                    ].map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        style={{
                          ...styles.taskRow,
                          background: completedTasks[task.id] ? "rgba(16, 185, 129, 0.08)" : "var(--surface-soft)",
                          borderColor: completedTasks[task.id] ? "#10B981" : "var(--border)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!completedTasks[task.id]}
                          onChange={() => {}}
                          style={{ width: "18px", height: "18px", accentColor: "#10B981", cursor: "pointer", marginTop: "2px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ ...styles.taskDays, background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>{task.days}</span>
                            <strong style={{ fontSize: "12.5px", color: "var(--text-h)", textDecoration: completedTasks[task.id] ? "line-through" : "none" }}>
                              {task.title}
                            </strong>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--muted)", margin: "3px 0 0 0", lineHeight: 1.4 }}>
                            {task.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cross-Link Actions to Ami-Vest & Ami-Business */}
              <div style={styles.actionBanner}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "var(--text-h)" }}>
                    Ready to Connect Your Tools?
                  </h4>
                  <p style={{ margin: 0, fontSize: "11.5px", color: "var(--muted)" }}>
                    Track your daily launch expenses in Ami-Vest or map competitor density in Ami-Business.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => navigate("/")}
                    style={styles.actionBtnVest}
                  >
                    💰 Track Expenses in Ami-Vest
                  </button>
                  <button
                    onClick={() => navigate("/business")}
                    style={styles.actionBtnBiz}
                  >
                    🏪 Check Map in Ami-Business
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    style={styles.actionBtnReset}
                  >
                    🔄 Tweak Parameters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Styles mapped cleanly to theme variables
const styles = {
  page: {
    minHeight: "100%",
    background: "transparent",
    color: "var(--text)",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "36px 20px 80px 20px",
  },
  heroSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 14px",
    borderRadius: "999px",
    background: "rgba(139, 92, 246, 0.15)",
    border: "1px solid rgba(139, 92, 246, 0.35)",
    color: "#A78BFA",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    marginBottom: "12px",
  },
  pulseDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#A78BFA",
    boxShadow: "0 0 8px #A78BFA",
  },
  heroTitle: {
    fontSize: "clamp(26px, 4vw, 36px)",
    fontWeight: "900",
    color: "var(--text-h)",
    margin: "0 0 10px 0",
    letterSpacing: "-0.5px",
  },
  heroSub: {
    maxWidth: "680px",
    margin: "0 auto",
    fontSize: "13.5px",
    color: "var(--muted)",
    lineHeight: "1.6",
  },
  badgeRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  pillBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  },

  // Stepper
  stepperWrapper: {
    position: "relative",
    marginBottom: "28px",
  },
  stepperTrack: {
    position: "absolute",
    top: "18px",
    left: "40px",
    right: "40px",
    height: "3px",
    background: "var(--border)",
    zIndex: 1,
  },
  stepperFill: {
    height: "100%",
    background: "linear-gradient(90deg, #8B5CF6, #6366F1, #10B981)",
    transition: "width 0.4s ease",
  },
  stepperButtons: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
  },
  stepBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "0 4px",
  },
  stepCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontSize: "13px",
    fontWeight: "800",
    border: "2px solid var(--border)",
    transition: "all 0.3s ease",
  },
  stepLabel: {
    fontSize: "11px",
    fontWeight: "700",
    textAlign: "center",
  },

  // Card
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "var(--shadow-md)",
    backdropFilter: "blur(16px)",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  stepHeader: {
    borderBottom: "1px solid var(--border)",
    paddingBottom: "18px",
  },
  stepTag: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#8B5CF6",
    letterSpacing: "1px",
  },
  stepTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-h)",
    margin: "4px 0 6px 0",
  },
  stepDesc: {
    fontSize: "12px",
    color: "var(--muted)",
    lineHeight: "1.5",
    margin: 0,
  },

  // Form Fields
  formGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldFull: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldHalf: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-h)",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: "12.5px",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: "12.5px",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontSize: "12.5px",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  choiceGrid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "10px",
  },
  choiceCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  choiceCardMini: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-h)",
    transition: "all 0.2s ease",
  },

  capitalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  },
  capCard: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  capHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  capBadge: {
    fontSize: "9.5px",
    fontWeight: "800",
    padding: "2px 7px",
    borderRadius: "999px",
  },

  buttonGroup3: {
    display: "flex",
    gap: "6px",
  },
  segmentedBtn: {
    flex: 1,
    padding: "9px 8px",
    borderRadius: "9px",
    border: "1px solid var(--border)",
    fontSize: "11px",
    fontWeight: "800",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  spaceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  },
  spaceCard: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Opportunities
  opportunityList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  opportunityCard: {
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  opportunityHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  selectedPill: {
    fontSize: "9.5px",
    fontWeight: "800",
    color: "#A78BFA",
    background: "rgba(139, 92, 246, 0.2)",
    padding: "2px 6px",
    borderRadius: "999px",
    letterSpacing: "0.5px",
  },
  metricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "8px",
    margin: "14px 0",
  },
  metricBox: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "9px",
    padding: "8px 10px",
  },
  metricLabel: {
    display: "block",
    fontSize: "9.5px",
    color: "var(--muted)",
  },
  metricVal: {
    display: "block",
    fontSize: "13px",
    color: "var(--text-h)",
    marginTop: "2px",
  },
  whyWinsBox: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "9px",
    padding: "10px 12px",
  },
  equipmentChip: {
    fontSize: "10px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    padding: "3px 8px",
    borderRadius: "6px",
    color: "var(--text)",
  },

  // Step 4
  highlightBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(124, 58, 237, 0.25)",
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  subCard: {
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "18px",
  },
  subCardTitle: {
    margin: "0 0 14px 0",
    fontSize: "13.5px",
    color: "var(--text-h)",
  },
  financeList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  financeItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11.5px",
    color: "var(--text)",
  },
  schemeList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  schemeItem: {
    display: "flex",
    gap: "10px",
  },
  schemeIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },

  // Step 5
  readinessPanel: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "18px 22px",
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    flexWrap: "wrap",
  },
  scoreCircle: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    background: "rgba(16, 185, 129, 0.15)",
    border: "2px solid #10B981",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  progressTrack: {
    width: "100%",
    height: "7px",
    background: "var(--border)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #8B5CF6, #10B981)",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  quickStat: {
    fontSize: "11px",
    color: "var(--muted)",
  },
  printBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer",
  },

  // Phase Timeline
  phaseTimeline: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "10px",
  },
  phaseCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "20px",
  },
  phaseHeader: {
    marginBottom: "14px",
  },
  phaseBadge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: "800",
    padding: "3px 8px",
    borderRadius: "999px",
    letterSpacing: "0.8px",
    marginBottom: "4px",
  },
  phaseTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "var(--text-h)",
    margin: "2px 0 4px 0",
  },
  phaseDesc: {
    fontSize: "11.5px",
    color: "var(--muted)",
    margin: 0,
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  taskRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  taskDays: {
    fontSize: "9.5px",
    fontWeight: "800",
    padding: "2px 6px",
    borderRadius: "5px",
    background: "rgba(139, 92, 246, 0.15)",
    color: "#A78BFA",
  },

  actionBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  actionBtnVest: {
    padding: "8px 14px",
    borderRadius: "9px",
    background: "linear-gradient(135deg, var(--primary), var(--blue))",
    border: "none",
    color: "#fff",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer",
  },
  actionBtnBiz: {
    padding: "8px 14px",
    borderRadius: "9px",
    background: "rgba(16, 185, 129, 0.18)",
    border: "1px solid #10B981",
    color: "#10B981",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer",
  },
  actionBtnReset: {
    padding: "8px 14px",
    borderRadius: "9px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    fontSize: "11.5px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Footer Navigation
  wizardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid var(--border)",
    paddingTop: "18px",
    marginTop: "10px",
  },
  primaryNextBtn: {
    padding: "11px 22px",
    borderRadius: "11px",
    background: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    border: "none",
    color: "#FFFFFF",
    fontSize: "12.5px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
    transition: "all 0.18s ease",
  },
  secondaryBackBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    background: "var(--surface-soft)",
    border: "1px solid var(--border)",
    color: "var(--text-h)",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
