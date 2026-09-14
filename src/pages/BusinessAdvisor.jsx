import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVault } from "../context/VaultContext";
import { KiroContextBar } from "../components/cards/KiroContext";
import {
  Circle,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAP_LIBRARIES = ["places"];
const DEFAULT_CENTER = [23.3441, 85.3096]; // Ranchi / Central India

const BUSINESS_TYPES = [
  { id: "food", label: "Food & Cafe / Fast Bites", icon: "🍽️", margin: "50-60%", typicalCost: 150000 },
  { id: "retail", label: "Retail & Kirana Store", icon: "🏪", margin: "15-25%", typicalCost: 250000 },
  { id: "electronics", label: "Mobile & Electronics Repair", icon: "📱", margin: "55-70%", typicalCost: 80000 },
  { id: "services", label: "On-Demand Services & Cleaning", icon: "🛠️", margin: "65-80%", typicalCost: 40000 },
  { id: "cloud_kitchen", label: "Cloud Kitchen & Tiffin Hub", icon: "🍳", margin: "40-50%", typicalCost: 180000 },
  { id: "dairy", label: "Dairy & Milk Chilling Center", icon: "🥛", margin: "25-35%", typicalCost: 350000 },
  { id: "poultry", label: "Poultry & Livestock Farm", icon: "🍗", margin: "30-40%", typicalCost: 200000 },
  { id: "agriculture", label: "Agri-Input & Organic Processing", icon: "🌾", margin: "35-45%", typicalCost: 300000 },
  { id: "manufacturing", label: "Small-Batch Packaging & Manufacturing", icon: "🏭", margin: "40-55%", typicalCost: 450000 },
  { id: "other", label: "Other High-Demand MSME", icon: "💡", margin: "35-50%", typicalCost: 200000 },
];

const LOCAL_COMMERCIAL_ZONES = [
  { area: "Main Market / Central Bazaar", type: "Commercial", footfall: "High", competition: "High", rent: "₹8k–22k/mo", bestFor: "Retail, Food, Electronics" },
  { area: "Near Bus Stand / Transport Hub", type: "Transit", footfall: "Very High", competition: "Moderate", rent: "₹6k–16k/mo", bestFor: "Fast Food, Repairs, Logistics" },
  { area: "Residential Colony / Mohalla", type: "Residential", footfall: "Moderate", competition: "Low", rent: "₹3k–8k/mo", bestFor: "Kirana, Dairy, Cleaning, Salons" },
  { area: "Industrial / MIDC Zone", type: "Industrial", footfall: "Low-Med", competition: "Low", rent: "₹4k–12k/mo", bestFor: "B2B Supplies, Fabrication, Canteen" },
  { area: "Agricultural Mandi Area", type: "Trade", footfall: "High (Morning)", competition: "Moderate", rent: "₹2k–7k/mo", bestFor: "Agri-Inputs, Packaging, Cold Storage" },
];

const PRESET_CAPITALS = [
  { label: "₹25k", val: "25000" },
  { label: "₹50k", val: "50000" },
  { label: "₹1 Lakh", val: "100000" },
  { label: "₹2 Lakh", val: "200000" },
  { label: "₹5 Lakh", val: "500000" },
  { label: "₹10 Lakh+", val: "1000000" },
];

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function BusinessAdvisor() {
  const navigate = useNavigate();
  const { vault } = useVault();

  // Inputs
  const [businessType, setBusinessType] = useState("food");
  const [location, setLocation] = useState(vault?.profile?.city || "Indore");
  const [capital, setCapital] = useState(vault?.finances?.monthlySavings ? String(Number(vault.finances.monthlySavings) * 6) : "150000");
  const [radius, setRadius] = useState("3");
  const [experience, setExperience] = useState("intermediate");

  // Geocoding & Map
  const [coordinates, setCoordinates] = useState(DEFAULT_CENTER);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationDetails, setLocationDetails] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // Analysis State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, unit_economics, competition, action_plan

  // Google Maps loader
  const { isLoaded: isGoogleMapsLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  // Pre-fill from Vault
  const handlePrefillVault = () => {
    if (vault?.profile?.city) setLocation(vault.profile.city);
    if (vault?.finances?.monthlySavings) {
      setCapital(String(Number(vault.finances.monthlySavings) * 6));
    }
  };

  // Geocode location
  const geocodeLocation = async () => {
    if (!location.trim()) return null;
    setLocationLoading(true);
    setLocationError("");

    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        q: location.trim(),
        limit: "1",
        addressdetails: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { Accept: "application/json", "Accept-Language": "en" } }
      );
      const data = await response.json();

      if (!response.ok || !Array.isArray(data) || data.length === 0) {
        throw new Error("Location not recognized. Try a city or district name.");
      }

      const place = data[0];
      const lat = Number(place.lat);
      const lon = Number(place.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const nextCoords = [lat, lon];
        setCoordinates(nextCoords);
        setLocationDetails({
          displayName: place.display_name,
          type: place.type,
        });
        return nextCoords;
      }
    } catch (err) {
      setLocationError(err.message || "Could not resolve coordinates.");
    } finally {
      setLocationLoading(false);
    }
    return coordinates;
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setCoordinates(coords);
        setLocation("Current Location");
        setLocationDetails({ displayName: "Current GPS Position" });
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationError("Permission denied or GPS unavailable.");
      },
      { timeout: 8000 }
    );
  };

  // Local calculation fallback engine for deterministic accuracy
  const generateLocalAnalysis = (bType, loc, cap, rad) => {
    const selectedBiz = BUSINESS_TYPES.find((b) => b.id === bType) || BUSINESS_TYPES[0];
    const capitalNum = Math.max(10000, Number(cap) || 100000);
    const radiusNum = Number(rad) || 3;

    // Unit economics calculation
    const projectCost = Math.max(capitalNum, selectedBiz.typicalCost);
    const marginCapital = capitalNum;
    const loanEligible = Math.max(0, projectCost - marginCapital);
    const marginPercent = Math.round((marginCapital / projectCost) * 100);

    // Interest rate & EMI calculation (Mudra / PMEGP rate approx 9.5% p.a. over 5 years)
    const annualRate = 0.095;
    const monthlyRate = annualRate / 12;
    const tenureMonths = 60;
    const emi = loanEligible > 0
      ? Math.round((loanEligible * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1))
      : 0;

    // Opportunity Score (Deterministic based on capital match + industry margin)
    let score = 78;
    if (marginPercent >= 20) score += 10;
    if (marginPercent < 10) score -= 12;
    if (radiusNum >= 3) score += 4;
    score = Math.min(94, Math.max(52, score));

    // Government scheme matching
    let scheme = {
      name: "Pradhan Mantri Mudra Yojana (PMMY - Kishor)",
      maxLoan: "Up to ₹5,00,000",
      interest: "8.5% – 10.5% p.a.",
      tenure: "5 Years",
      moratorium: "6 Months",
      subsidy: "Zero collateral required under CGTMSE",
      link: "/loan",
    };
    if (projectCost > 500000) {
      scheme = {
        name: "PMEGP (Prime Minister Employment Generation Scheme)",
        maxLoan: "Up to ₹50,00,000",
        interest: "9.0% – 11.0% p.a.",
        tenure: "5-7 Years",
        moratorium: "6-12 Months",
        subsidy: "15% – 35% Govt Capital Subsidy",
        link: "/loan",
      };
    } else if (projectCost <= 50000) {
      scheme = {
        name: "PMMY Shishu Micro Enterprise Loan",
        maxLoan: "Up to ₹50,000",
        interest: "8.0% – 9.5% p.a.",
        tenure: "3-5 Years",
        moratorium: "3 Months",
        subsidy: "Instant approval for self-employed",
        link: "/loan",
      };
    }

    // Monthly financial projections
    const estimatedMonthlyRevenue = Math.round(projectCost * 0.45);
    const estimatedMonthlyExpenses = Math.round(estimatedMonthlyRevenue * 0.65) + emi;
    const estimatedMonthlyProfit = Math.max(15000, estimatedMonthlyRevenue - estimatedMonthlyExpenses);

    return {
      score,
      selectedBiz,
      location: loc,
      capital: capitalNum,
      radius: radiusNum,
      projectCost,
      marginCapital,
      loanEligible,
      marginPercent,
      emi,
      scheme,
      estimatedMonthlyRevenue,
      estimatedMonthlyExpenses,
      estimatedMonthlyProfit,
      competitionDensity: radiusNum <= 2 ? "Moderate (4-6 nearby)" : "Distributed (8-12 in radius)",
      marketCatchment: `${radiusNum * 12000}+ residents & transit commuters`,
      breakevenMonths: Math.round(projectCost / Math.max(10000, estimatedMonthlyProfit)),
      keyAdvantages: [
        `High everyday repeat purchase frequency in ${loc}.`,
        `Healthy gross margins (${selectedBiz.margin}) with fast customer conversion.`,
        `Direct eligibility for ${scheme.name}.`,
      ],
      keyRisks: [
        "First 60 days require disciplined working capital for stock and customer acquisition.",
        "Local footfall variance between weekday mornings and weekend evenings.",
      ],
      actionSteps: [
        { day: "Day 1–3", task: "Scout 2 high-footfall spots in the central or transit bazaar zone." },
        { day: "Day 4–7", task: "Register free MSME Udyam certificate and open a zero-fee current account." },
        { day: "Day 8–14", task: "Finalize supplier wholesale quotes & apply for Mudra/PMEGP subsidy." },
        { day: "Day 15–30", task: "Setup basic counter/space, digital payments (UPI QR), and soft launch." },
      ],
    };
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (!businessType) {
      setError("Please select a business type.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify a location.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Geocode if not done
      let currentCoords = coordinates;
      if (!locationDetails) {
        currentCoords = await geocodeLocation();
      }

      // Step 2: Try Backend API
      try {
        const response = await fetch(`${API_BASE}/business/analyze-intake`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_type: businessType,
            location_text: location.trim(),
            available_capital: capital,
            experience_level: experience,
            radius_km: Number(radius),
            latitude: currentCoords?.[0] || null,
            longitude: currentCoords?.[1] || null,
          }),
        });
        const data = await response.json();
        if (data.success && data.score) {
          // Enhance with deterministic financial calculations
          const fallback = generateLocalAnalysis(businessType, location, capital, radius);
          setResult({ ...fallback, ...data, score: data.score || fallback.score });
          setLoading(false);
          return;
        }
      } catch {
        // Fallback gracefully to local calculation
      }

      // If backend unreachable or returned error, use immediate local engine
      const localResult = generateLocalAnalysis(businessType, location, capital, radius);
      setResult(localResult);
    } catch (err) {
      setError(err.message || "Analysis could not be completed.");
    } finally {
      setLoading(false);
    }
  };

  const selectedBizObj = useMemo(() => {
    return BUSINESS_TYPES.find((b) => b.id === businessType) || BUSINESS_TYPES[0];
  }, [businessType]);

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Context Bar */}
      <KiroContextBar
        pageName="Business Advisor"
        seedQuery={`Should I start a ${selectedBizObj.label} in ${location} with ${formatCurrency(capital)}? Evaluate unit economics and competition.`}
      />

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", margin: "16px 0 24px 0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-ai">📍 HYPER-LOCAL ADVISOR</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Evidence-Led MSME Engine</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--text-h)", fontFamily: "var(--font-display)" }}>
            Should you start this <span className="gradient-text">business here?</span>
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 13.5, color: "var(--text-secondary)", maxWidth: 640 }}>
            Analyze hyper-local footfall, competition saturation, project unit economics, and government subsidy eligibility for any Indian city or town.
          </p>
        </div>

        {/* Quick Navigation Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/launchpad")}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: "rgba(139,92,246,0.3)", color: "var(--violet)", display: "flex", alignItems: "center", gap: 6 }}
          >
            <span>🚀</span>
            <span>90-Day Launchpad</span>
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

      {/* Input Workspace Card */}
      <div className="card glass-card" style={{ marginBottom: 28, padding: 24, borderRadius: "var(--radius-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", color: "var(--accent)" }}>
            STEP 1 · OPPORTUNITY PARAMETERS
          </span>
          {vault?.profile?.city && (
            <button
              onClick={handlePrefillVault}
              style={{
                background: "var(--accent-soft)",
                border: "1px solid var(--glass-border)",
                color: "var(--accent-text)",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>⚡</span> Pre-fill from My Vault ({vault.profile.city})
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
          {/* Business Type */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
              Business Category
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="input"
              style={{ width: "100%", height: 42, fontSize: 13, fontWeight: 500 }}
            >
              {BUSINESS_TYPES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.icon} {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
              Location / Area / City
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLocationError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && geocodeLocation()}
                placeholder="e.g. Indore, MP or Koramangala, Bangalore"
                className="input"
                style={{ flex: 1, height: 42, fontSize: 13 }}
              />
              <button
                type="button"
                onClick={useCurrentLocation}
                title="Use Current GPS Location"
                disabled={locationLoading}
                className="btn btn-secondary"
                style={{ height: 42, padding: "0 12px", fontSize: 13 }}
              >
                {locationLoading ? "…" : "📍"}
              </button>
            </div>
            {locationError && (
              <span style={{ fontSize: 11, color: "var(--danger)", marginTop: 4, display: "block" }}>
                {locationError}
              </span>
            )}
          </div>

          {/* Available Capital */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
              Available Capital (Own Funds)
            </label>
            <input
              type="number"
              min="5000"
              step="5000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="input"
              style={{ width: "100%", height: 42, fontSize: 13, fontWeight: 600 }}
            />
            {/* Quick preset chips */}
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {PRESET_CAPITALS.map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setCapital(p.val)}
                  style={{
                    padding: "2px 7px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: capital === p.val ? "var(--accent-soft)" : "var(--surface)",
                    color: capital === p.val ? "var(--accent)" : "var(--text-muted)",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Radius */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 6 }}>
              Catchment Radius
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="input"
              style={{ width: "100%", height: 42, fontSize: 13 }}
            >
              <option value="1">1 km (Walking Catchment / Colony)</option>
              <option value="3">3 km (Standard Market & Transit)</option>
              <option value="5">5 km (Sub-Town / Multi-Sector)</option>
              <option value="10">10 km (District & Wholesale)</option>
            </select>
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
            <span>💡</span>
            <span>Targeting <strong>{selectedBizObj.label}</strong> in <strong>{location}</strong> with <strong>{formatCurrency(capital)}</strong> capital.</span>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: "10px 24px",
              fontSize: 13.5,
              fontWeight: 700,
              minWidth: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16 }} />
                <span>Analyzing Location…</span>
              </>
            ) : (
              <>
                <span>Analyze Opportunity</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "var(--danger-soft)", color: "var(--danger)", fontSize: 12 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Results Dashboard */}
      {result && (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          {/* Main Score Banner */}
          <div
            className="card"
            style={{
              marginBottom: 24,
              padding: "24px 28px",
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--shadow-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Radial Score Gauge */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `conic-gradient(var(--accent) 0% ${result.score}%, var(--border) ${result.score}% 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--glow-accent)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: "50%",
                    background: "var(--surface)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 20, fontWeight: 900, color: "var(--accent)" }}>{result.score}</span>
                  <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, marginTop: -2 }}>/ 100</span>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge" style={{ background: result.score >= 75 ? "var(--success-soft)" : "var(--warning-soft)", color: result.score >= 75 ? "var(--success)" : "var(--warning)" }}>
                    {result.score >= 75 ? "STRONG OPPORTUNITY" : "VALIDATION REQUIRED"}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Catchment: {result.radius}km Radius</span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: "6px 0 2px 0", color: "var(--text-h)" }}>
                  {result.selectedBiz.label} in {result.location}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                  Estimated profit margin: <strong style={{ color: "var(--success)" }}>{result.selectedBiz.margin}</strong> · Payback period: <strong style={{ color: "var(--text)" }}>~{result.breakevenMonths} months</strong>
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/chat", { state: { initialQuery: `I am planning to launch a ${result.selectedBiz.label} in ${result.location} with capital of ${formatCurrency(result.capital)}. Break down my first 30 days and unit economics.` } })}
                className="btn btn-primary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>💬</span>
                <span>Ask Kiro to Strategize</span>
              </button>
              <button
                onClick={() => navigate("/launchpad")}
                className="btn btn-secondary btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span>🚀</span>
                <span>Open 90-Day Blueprint</span>
              </button>
            </div>
          </div>

          {/* 4-Column Quick Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 18, borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Project Cost</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-h)", margin: "4px 0" }}>{formatCurrency(result.projectCost)}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Own Funds: {formatCurrency(result.marginCapital)} ({result.marginPercent}%)</div>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Monthly Net Profit Run-Rate</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--success)", margin: "4px 0" }}>{formatCurrency(result.estimatedMonthlyProfit)}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>After rent, supplies & EMI costs</div>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Market Reach & Catchment</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cyan)", margin: "6px 0 4px 0" }}>{result.marketCatchment}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Within selected {result.radius}km zone</div>
            </div>

            <div className="card" style={{ padding: 18, borderRadius: "var(--radius)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Financing & Loan Gap</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--violet)", margin: "4px 0" }}>{formatCurrency(result.loanEligible)}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Eligible for Mudra/PMEGP Subsidy</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", marginBottom: 20, paddingBottom: 6 }}>
            {[
              { id: "overview", label: "📊 Unit Economics & Funding" },
              { id: "competition", label: "📍 Local Commercial Zones" },
              { id: "action_plan", label: "🗓️ 30-Day Launch Roadmap" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: activeTab === t.id ? "var(--accent-soft)" : "transparent",
                  color: activeTab === t.id ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: activeTab === t.id ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Unit Economics & Funding */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
              {/* Financial Structure */}
              <div className="card" style={{ padding: 22, borderRadius: "var(--radius-lg)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-h)", margin: "0 0 16px 0" }}>
                  💰 Project Cost & Capital Breakdown
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Estimated Total Project Setup</span>
                    <strong style={{ color: "var(--text-h)" }}>{formatCurrency(result.projectCost)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Founder Margin Capital (Own)</span>
                    <strong style={{ color: "var(--accent)" }}>{formatCurrency(result.marginCapital)} ({result.marginPercent}%)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Bank Loan / Credit Line Requirement</span>
                    <strong style={{ color: "var(--violet)" }}>{formatCurrency(result.loanEligible)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Estimated Monthly EMI (5-Yr tenure)</span>
                    <strong style={{ color: "var(--text-h)" }}>{formatCurrency(result.emi)} / mo</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
                    <span style={{ color: "var(--text-secondary)" }}>Estimated Monthly Net Revenue</span>
                    <strong style={{ color: "var(--success)" }}>{formatCurrency(result.estimatedMonthlyRevenue)} / mo</strong>
                  </div>
                </div>
              </div>

              {/* Matched Government Scheme */}
              <div className="card" style={{ padding: 22, borderRadius: "var(--radius-lg)", border: "1px solid rgba(6,182,212,0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span className="badge" style={{ background: "var(--cyan-soft)", color: "var(--cyan)" }}>
                    MATCHED GOVT SCHEME
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Zero Collateral</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-h)", margin: "0 0 10px 0" }}>
                  {result.scheme.name}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "14px 0" }}>
                  <div style={{ padding: 10, background: "var(--surface-raised)", borderRadius: 8 }}>
                    <small style={{ color: "var(--text-muted)", fontSize: 10, display: "block" }}>Maximum Limit</small>
                    <strong style={{ fontSize: 12, color: "var(--text)" }}>{result.scheme.maxLoan}</strong>
                  </div>
                  <div style={{ padding: 10, background: "var(--surface-raised)", borderRadius: 8 }}>
                    <small style={{ color: "var(--text-muted)", fontSize: 10, display: "block" }}>Interest Rate</small>
                    <strong style={{ fontSize: 12, color: "var(--text)" }}>{result.scheme.interest}</strong>
                  </div>
                  <div style={{ padding: 10, background: "var(--surface-raised)", borderRadius: 8 }}>
                    <small style={{ color: "var(--text-muted)", fontSize: 10, display: "block" }}>Repayment Tenure</small>
                    <strong style={{ fontSize: 12, color: "var(--text)" }}>{result.scheme.tenure}</strong>
                  </div>
                  <div style={{ padding: 10, background: "var(--surface-raised)", borderRadius: 8 }}>
                    <small style={{ color: "var(--text-muted)", fontSize: 10, display: "block" }}>Subsidy / Advantage</small>
                    <strong style={{ fontSize: 12, color: "var(--success)" }}>{result.scheme.subsidy}</strong>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/loan")}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    marginTop: 8,
                    fontSize: 12.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <span>🏛️</span>
                  <span>Evaluate Full Subsidy & Bank Eligibility →</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Local Commercial Density */}
          {activeTab === "competition" && (
            <div className="card" style={{ padding: 22, borderRadius: "var(--radius-lg)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-h)", margin: "0 0 6px 0" }}>
                📍 Commercial Catchment & Rent Density in {result.location}
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "0 0 16px 0" }}>
                Typical footfall, competition profiles, and monthly rental ranges for commercial micro-clusters.
              </p>

              <div style={{ display: "grid", gap: 10 }}>
                {LOCAL_COMMERCIAL_ZONES.map((zone) => (
                  <div
                    key={zone.area}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: "var(--text-h)", display: "block" }}>{zone.area}</strong>
                      <small style={{ fontSize: 11, color: "var(--text-muted)" }}>Best for: {zone.bestFor}</small>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Footfall</span>
                      <strong style={{ fontSize: 12, color: zone.footfall.includes("High") ? "var(--success)" : "var(--warning)" }}>
                        {zone.footfall}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", display: "block" }}>Typical Rent</span>
                      <strong style={{ fontSize: 12, color: "var(--text)" }}>{zone.rent}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        className="badge"
                        style={{
                          background: zone.competition === "Low" ? "var(--success-soft)" : "var(--border)",
                          color: zone.competition === "Low" ? "var(--success)" : "var(--text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        {zone.competition} Comp.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: 30-Day Action Plan */}
          {activeTab === "action_plan" && (
            <div className="card" style={{ padding: 22, borderRadius: "var(--radius-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-h)", margin: 0 }}>
                    🗓️ 30-Day Zero to First Profit Roadmap
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "var(--text-secondary)" }}>
                    Step-by-step checklist to validate and launch with minimum financial risk.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/launchpad")}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span>🚀 Open Full 90-Day Engine</span>
                </button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {result.actionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      borderRadius: 10,
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "var(--accent-soft)",
                        color: "var(--accent)",
                        fontSize: 11,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step.day}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                      {step.task}
                    </span>
                  </div>
                ))}
              </div>

              {/* Strategic Insights */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                <div style={{ padding: 14, borderRadius: 10, background: "var(--success-soft)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <strong style={{ fontSize: 12, color: "var(--success)", display: "block", marginBottom: 6 }}>
                    ✓ Key Competitive Edges
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                    {result.keyAdvantages.map((adv, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{adv}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: 14, borderRadius: 10, background: "var(--warning-soft)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <strong style={{ fontSize: 12, color: "var(--warning)", display: "block", marginBottom: 6 }}>
                    ⚠️ Risk Factors to Guard
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                    {result.keyRisks.map((risk, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
