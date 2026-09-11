import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* =========================================================
   API CONFIG
========================================================= */
const DEFAULT_API_BASE = "http://127.0.0.1:5001";
const API_BASE = String(import.meta.env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/+$/, "");

/* =========================================================
   TAB CONTEXT GENERATOR
========================================================= */
function getTabContext(pathname) {
  const p = (pathname || "").toLowerCase();

  if (p.startsWith("/loan")) {
    return {
      mode: "loan",
      title: "Govt Loan Advisor",
      badge: "🏛️ Govt Loan",
      badgeColor: "#06B6D4",
      subNote: "Tuned to Mudra, PMEGP, 35% Subsidies & EMI Calculations",
      welcome:
        "👋 Hello! I am Kiro AI, your Govt Loan & Subsidy Advisor. Ask me anything about Mudra loans (up to ₹10L), PMEGP subsidies (up to 35%), collateral-free schemes under CGTMSE, or EMI schedules!",
      welcomeHi:
        "👋 नमस्ते! मैं Kiro AI हूँ, आपकी सरकारी लोन एवं सब्सिडी सलाहकार। Mudra, PMEGP, 35% सब्सिडी, पात्रता व ज़रूरी दस्तावेज़ों के बारे में पूछें।",
      placeholder: "Ask about Mudra, PMEGP subsidy, loan eligibility, EMI...",
      actions: [
        { icon: "🏛️", label: "Mudra Categories", command: "What are the Mudra loan categories (Shishu, Kishore, Tarun) and limits?" },
        { icon: "📜", label: "PMEGP 35% Subsidy", command: "How does the PMEGP scheme work and who gets 35% subsidy?" },
        { icon: "📑", label: "Required Documents", command: "What documents are required for a government business loan?" },
        { icon: "🧮", label: "Calculate ₹5L EMI", command: "Calculate EMI for ₹5 Lakh loan at 9% for 5 years" },
        { icon: "🛡️", label: "Collateral-Free", command: "Can I get a loan without collateral under CGTMSE?" },
        { icon: "⚠️", label: "Avoid Rejection", command: "Why do banks reject loan applications and how to avoid it?" },
      ],
    };
  }

  if (p.startsWith("/business")) {
    return {
      mode: "business",
      title: "Business Advisor",
      badge: "🏪 Business",
      badgeColor: "#10B981",
      subNote: "Tuned to Market Demand, Footfall, Profit Margins & Capital",
      welcome:
        "👋 Hello! I am Kiro AI, your Business Advisor. Ask me about shop feasibility, footfall analysis, initial capital requirements, profit margins, or high-demand business ideas for your area.",
      welcomeHi:
        "👋 नमस्ते! मैं Kiro AI हूँ। दुकान की व्यवहार्यता, स्थानीय मांग, लागत, और कम जोखिम वाले बिज़नेस आइडिया के बारे में पूछें।",
      placeholder: "Ask about business ideas, footfall, profit margin...",
      actions: [
        { icon: "🏪", label: "Best Business ₹2-5L", command: "What is a good business to start with ₹2-5 Lakh capital?" },
        { icon: "👥", label: "Footfall & Demand", command: "How do I check local demand and footfall before opening a shop?" },
        { icon: "⚖️", label: "Calculate Break-Even", command: "How to calculate break-even point and monthly running costs?" },
        { icon: "🛒", label: "Kirana Margins", command: "What are typical profit margins in a grocery or retail store?" },
        { icon: "🚜", label: "Rural MSME Ideas", command: "Profitable business ideas for rural and semi-urban markets" },
      ],
    };
  }

  if (p.startsWith("/goals")) {
    return {
      mode: "goals",
      title: "Goals & Targets",
      badge: "🎯 Goals",
      badgeColor: "#F59E0B",
      subNote: "Tuned to Financial Targets, Timelines & Capital Milestones",
      welcome:
        "👋 Hello! I am Kiro AI. Ask me how to plan, track, and accelerate your financial milestones and business emergency buffers.",
      welcomeHi:
        "👋 नमस्ते! मैं Kiro AI हूँ। अपने बचत लक्ष्य, बिज़नेस माइलस्टोन और समय सीमा की योजना बनाएं।",
      placeholder: "Ask about goals, targets, milestones...",
      actions: [
        { icon: "🎯", label: "Show My Goals", command: "Show my goals" },
        { icon: "💡", label: "Plan ₹5L Milestone", command: "How much to save per month to reach ₹5 Lakh in 2 years?" },
        { icon: "⚡", label: "Speed Up Savings", command: "How can I accelerate my savings milestone without hurting cashflow?" },
        { icon: "🛡️", label: "Emergency Buffer", command: "How big should my business emergency fund be?" },
      ],
    };
  }

  if (p.startsWith("/investments")) {
    return {
      mode: "investments",
      title: "Investments & Growth",
      badge: "📈 Investments",
      badgeColor: "#8B5CF6",
      subNote: "Tuned to Wealth Growth — SIPs, Gold, FDs & Capital Safety",
      welcome:
        "👋 Hello! I am Kiro AI. Ask me about safe investment avenues, SIPs, gold, fixed deposits, and how to allocate monthly surplus.",
      welcomeHi:
        "👋 नमस्ते! मैं Kiro AI हूँ। म्यूचुअल फंड, SIP, गोल्ड, एफडी और सुरक्षित निवेश के बारे में पूछें।",
      placeholder: "Ask about SIP, mutual funds, gold, FD...",
      actions: [
        { icon: "📈", label: "Show Portfolio", command: "Show my investments" },
        { icon: "🌱", label: "Low-Risk SIP", command: "What are safe low-risk investment options for small business owners?" },
        { icon: "🪙", label: "Gold vs Bank FD", command: "Compare sovereign gold bonds vs bank fixed deposits" },
        { icon: "💰", label: "Surplus Rule", command: "How should I divide monthly surplus between savings and investments?" },
      ],
    };
  }

  if (p.startsWith("/tax")) {
    return {
      mode: "tax",
      title: "Tax & Subsidies",
      badge: "🧾 Tax Advisor",
      badgeColor: "#EC4899",
      subNote: "Tuned to Tax Deductions, 80C, GST & MSME Exemptions",
      welcome:
        "👋 Hello! I am Kiro AI. Ask me about income tax slabs, Section 80C deductions, new vs old regime, or MSME 45-day payment protections.",
      welcomeHi:
        "👋 नमस्ते! मैं Kiro AI हूँ। टैक्स छूट, नई vs पुरानी टैक्स व्यवस्था और GST नियमों के बारे में पूछें।",
      placeholder: "Ask about tax savings, 80C, slabs, GST...",
      actions: [
        { icon: "🧾", label: "80C Deductions", command: "What investments qualify for Section 80C tax deduction?" },
        { icon: "⚖️", label: "New vs Old Regime", command: "Which tax regime is better for income of ₹10 Lakh?" },
        { icon: "🏛️", label: "MSME Tax Benefits", command: "What tax benefits and exemptions exist for MSME registered businesses?" },
        { icon: "📑", label: "GST Thresholds", command: "What is the GST registration turnover threshold in India?" },
      ],
    };
  }

  if (p.startsWith("/rbi")) {
    return {
      mode: "rbi",
      title: "RBI Compliance",
      badge: "📜 RBI Consumer",
      badgeColor: "#3B82F6",
      subNote: "Tuned to Borrower Protection — Recovery Rules & Ombudsman",
      welcome:
        "👋 Hello! I am Kiro AI. Ask me about RBI digital lending rules, protection from recovery agent harassment, free ombudsman complaints, and credit score disputes.",
      welcomeHi:
        "👋 नमस्ते! मैं Kiro AI हूँ। RBI के डिजिटल लोन नियम, रिकवरी एजेंट से सुरक्षा और लोकपाल शिकायत के बारे में पूछें।",
      placeholder: "Ask about borrower rights, recovery rules...",
      actions: [
        { icon: "📜", label: "Recovery Norms", command: "What are RBI rules regarding loan recovery agents and allowed call timings?" },
        { icon: "🛡️", label: "RBI Ombudsman", command: "How to file an online complaint against a bank or NBFC on RBI portal?" },
        { icon: "📱", label: "Digital Loan Apps", command: "How to check if a digital loan app is RBI registered and legal?" },
        { icon: "💳", label: "Fix CIBIL Dispute", command: "How to correct a wrong entry in my CIBIL credit report?" },
      ],
    };
  }

  // Default / Finance Mode
  return {
    mode: "finance",
    title: "Financial Co-Pilot",
    badge: "💼 Financial Co-Pilot",
    badgeColor: "#14B8A6",
    subNote: "Tuned to Cashflow, Budgeting & Smart Daily Money Management",
    welcome:
      "👋 Hello! I am Kiro AI, your personal finance co-pilot. I can help you track expenses, analyze budgets, plan savings, check loan schemes, and optimize cashflow.",
    welcomeHi:
      "👋 नमस्ते! मैं Kiro AI हूँ। अपने खर्च, बजट, लोन, बचत और वित्तीय लक्ष्यों के लिए कुछ भी पूछें।",
    placeholder: "Ask Kiro AI anything...",
    actions: [
      { icon: "📊", label: "Monthly Budget", command: "Show my monthly budget" },
      { icon: "💳", label: "Recent Transactions", command: "Show my recent transactions" },
      { icon: "🎯", label: "View Goals", command: "Show my goals" },
      { icon: "🍔", label: "Add ₹500 Food", command: "Add 500 in food" },
      { icon: "💰", label: "Savings Advice", command: "How much should I save this month based on my income?" },
      { icon: "📈", label: "Investments", command: "Show my investments" },
    ],
  };
}

/* =========================================================
   TEXT & SPEECH HELPERS
========================================================= */
function safeText(val) {
  if (val === null || val === undefined) return "";
  return String(val);
}

function cleanSpeechText(value) {
  return safeText(value)
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/₹/g, " rupees ")
    .replace(/\bRs\.?\s*/gi, " rupees ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(text, selected = "en") {
  const value = safeText(text);
  if (/[\u0900-\u097f]/.test(value)) return "hi";
  return selected === "hi" ? "hi" : "en";
}

function stopBrowserSpeech() {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }
  } catch (_) {}
}

function chooseVoice(language) {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  if (language === "hi") {
    return (
      voices.find((v) => /^hi[-_]/i.test(v.lang)) ||
      voices.find((v) => String(v.lang).toLowerCase().includes("hi")) ||
      voices.find((v) => /hindi/i.test(v.name)) ||
      voices.find((v) => /en[-_]in/i.test(v.lang)) ||
      null
    );
  }

  return (
    voices.find((v) => /en[-_]in/i.test(v.lang)) ||
    voices.find((v) => /en[-_]us/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

function speakText(text, language, onStart, onEnd, onError) {
  if (!("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  stopBrowserSpeech();
  const synth = window.speechSynthesis;
  const clean = cleanSpeechText(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  const detected = detectLanguage(clean, language);
  const lang = detected === "hi" ? "hi-IN" : "en-IN";
  const utterance = new SpeechSynthesisUtterance(clean.slice(0, 450));
  utterance.lang = lang;
  utterance.rate = detected === "hi" ? 0.94 : 1.0;

  const voice = chooseVoice(detected);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    if (e?.error !== "canceled" && e?.error !== "interrupted") {
      onError?.(e?.error);
    }
    onEnd?.();
  };

  try {
    synth.speak(utterance);
  } catch (err) {
    onEnd?.();
  }
}

/* =========================================================
   MARKDOWN RENDERER (ChatGPT Format)
========================================================= */
function FormattedMessageContent({ text }) {
  const parts = useMemo(() => {
    if (!text) return [];
    return text.split("\n");
  }, [text]);

  const renderInline = (line) => {
    // Replace **bold** with bold spans
    const segments = line.split(/(\*\*.*?\*\*)/g);
    return segments.map((seg, idx) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return (
          <strong key={idx} style={{ color: "#F8FAFC", fontWeight: "700" }}>
            {seg.slice(2, -2)}
          </strong>
        );
      }
      return seg;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {parts.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: "4px" }} />;
        }

        // Bullet point
        if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletContent = trimmed.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "flex-start", paddingLeft: "4px" }}>
              <span style={{ color: "#38BDF8", fontSize: "12px", lineHeight: "1.5" }}>•</span>
              <span style={{ flex: 1 }}>{renderInline(bulletContent)}</span>
            </div>
          );
        }

        // Numbered item: 1. 2. 3.
        const numMatch = trimmed.match(/^(\d+[\.\)])\s*(.+)/);
        if (numMatch) {
          return (
            <div key={idx} style={{ display: "flex", gap: "6px", alignItems: "flex-start", paddingLeft: "4px" }}>
              <span style={{ color: "#2DD4BF", fontWeight: "700", minWidth: "16px", fontSize: "11px" }}>{numMatch[1]}</span>
              <span style={{ flex: 1 }}>{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} style={{ margin: 0, lineHeight: "1.55" }}>
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/* =========================================================
   COMPREHENSIVE LOCAL INTELLIGENCE FALLBACK
========================================================= */
function buildLocalReply(query, language, tabMode) {
  const q = safeText(query).toLowerCase();
  const isHi = language === "hi";

  // 1. Mudra Loan
  if (q.includes("mudra")) {
    if (isHi) {
      return `🏛️ **Mudra Loan (PMMY) योजना विवरण:**\n• **शिशु (Shishu):** ₹50,000 तक (शुरुआती बिज़नेस के लिए)\n• **किशोर (Kishore):** ₹50,000 से ₹5 लाख तक (मशीन व माल खरीदने के लिए)\n• **तरुण (Tarun):** ₹5 लाख से ₹10 लाख तक (बिज़नेस विस्तार के लिए)\n\n✅ **खास बात:** 100% बिना किसी गारंटी या कोलेटरल के उपलब्ध है। किसी भी सरकारी/प्राइवेट बैंक से आवेदन करें।`;
    }
    return `🏛️ **Pradhan Mantri Mudra Yojana (PMMY):**\n• **Shishu:** Loans up to ₹50,000 (for new startups & micro units)\n• **Kishore:** Loans from ₹50,001 to ₹5,00,000 (for inventory, machinery)\n• **Tarun:** Loans from ₹5,00,001 to ₹10,00,000 (for business expansion)\n\n✅ **Key Benefit:** 100% collateral-free credit backed by government guarantee. Available at all public/private banks, RRBs, and NBFCs.`;
  }

  // 2. PMEGP Scheme & Subsidy
  if (q.includes("pmegp") || q.includes("subsidy") || q.includes("subsidies")) {
    if (isHi) {
      return `📜 **PMEGP सरकारी सब्सिडी योजना:**\n• **अधिकतम प्रोजेक्ट:** मैन्युफैक्चरिंग ₹50 लाख तक, सर्विस सेक्टर ₹20 लाख तक।\n• **सब्सिडी दर (ग्रामीण):** सामान्य वर्ग को 25%, विशेष वर्ग (महिला/SC/ST/OBC) को 35%!\n• **सब्सिडी दर (शहरी):** सामान्य वर्ग को 15%, विशेष वर्ग को 25%।\n• **स्वयं का अंशदान:** केवल 5% से 10%।\n\n📌 आवेदन KVIC ऑनलाइन पोर्टल (kviconline.gov.in) पर किया जाता है।`;
    }
    return `📜 **Prime Minister's Employment Generation Programme (PMEGP):**\n• **Max Project Cost:** Up to ₹50 Lakh (Manufacturing) & ₹20 Lakh (Services)\n• **Rural Subsidy:** 25% for General category, **35% for Special Categories** (Women, SC/ST, OBC, Minorities)!\n• **Urban Subsidy:** 15% for General, 25% for Special Categories\n• **Own Contribution:** Only 5% to 10% of project cost\n\n📌 Apply online directly on the KVIC portal (kviconline.gov.in).`;
  }

  // 3. Required Documents for Loans
  if (q.includes("document") || q.includes("dastavej") || q.includes("papers")) {
    if (isHi) {
      return `📑 **सरकारी बिज़नेस लोन के लिए ज़रूरी दस्तावेज़:**\n1. **पहचान व पता प्रमाण:** आधार कार्ड, पैन कार्ड, वोटर आईडी\n2. **बिज़नेस प्रमाण:** Udyam MSME रजिस्ट्रेशन सर्टिफिकेट, ट्रेड लाइसेंस\n3. **बैंक स्टेटमेंट:** पिछले 6 से 12 महीने का चालू बैंक खाता स्टेटमेंट\n4. **प्रोजेक्ट रिपोर्ट:** लागत, अनुमानित बिक्री और मुनाफे का विवरण (DPR)\n5. **निवास/दुकान प्रमाण:** बिजली बिल या रेंट एग्रीमेंट`;
    }
    return `📑 **Essential Documents for Business & Govt Loans:**\n1. **KYC:** Aadhaar Card, PAN Card, Voter ID\n2. **Business Registration:** Udyam MSME Certificate (free from udyamregistration.gov.in)\n3. **Banking:** Last 6–12 months active bank account statements\n4. **Financials:** Last 1-2 years ITR (if available), GST returns\n5. **Project Report (DPR):** Cost breakdown, projected cashflow & margin estimates`;
  }

  // 4. EMI Calculation
  if (q.includes("emi") || q.includes("calculate") || q.includes("interest")) {
    if (isHi) {
      return `🧮 **EMI गणना (₹5,00,000 लोन @ 9% p.a. 5 वर्ष के लिए):**\n• **मासिक EMI:** लगभग ₹10,379 / महीना\n• **कुल ब्याज:** ₹1,22,755\n• **कुल भुगतान:** ₹6,22,755\n\n💡 **सलाह:** यदि आपकी मासिक शुद्ध बचत EMI से कम से कम 2 गुना है, तो लोन सुरक्षित माना जाता है।`;
    }
    return `🧮 **Indicative EMI Calculation (₹5,00,000 at 9.0% for 5 Years):**\n• **Monthly EMI:** ~₹10,379 / month\n• **Total Interest:** ~₹1,22,755\n• **Total Repayment:** ~₹6,22,755\n\n💡 **Safety Rule:** Your projected net monthly cash surplus should ideally be at least 2x the monthly EMI amount.`;
  }

  // 5. Collateral Free / CGTMSE
  if (q.includes("collateral") || q.includes("guarantee") || q.includes("cgtmse")) {
    if (isHi) {
      return `🛡️ **बिना गारंटी (Collateral-Free) लोन:**\n• **CGTMSE स्कीम:** सरकार ₹5 करोड़ तक के MSME लोन की गारंटी बैंकों को देती है।\n• **Mudra Loan:** ₹10 लाख तक 100% बिना कोलेटरल मिलता है।\n• किसी भी बैंक से बात करते समय CGTMSE कवरेज का उल्लेख करें।`;
    }
    return `🛡️ **Collateral-Free Loans in India:**\n• **CGTMSE Scheme:** Covers collateral-free credit facilities up to ₹5 Crore for micro and small enterprises.\n• **Mudra Loans:** 100% collateral-free up to ₹10 Lakh.\n• Banks cannot mandate collateral for micro loans up to ₹10 Lakh as per RBI guidelines.`;
  }

  // 6. Business Ideas & Feasibility
  if (q.includes("business") || q.includes("shop") || q.includes("start") || q.includes("capital")) {
    if (isHi) {
      return `🏪 **कम लागत वाले लाभदायक बिज़नेस आइडियाज (₹2-5 लाख):**\n1. **किराना व दैनिक उपभोग स्टोर:** 15-25% ग्रॉस मार्जिन, रोज़ाना नकदी आमदनी\n2. **कृषि सेवा केंद्र (खाद/बीज/दवा):** ग्रामीण क्षेत्रों में उच्च मांग, 10-20% मार्जिन\n3. **मोबाइल रिपेयर व एक्सेसरीज:** 35-50% मार्जिन, कम इन्वेंट्री रिस्क\n4. **डेयरी व मिल्क कलेक्शन पॉइंट:** दैनिक रोटेशन, स्थिर मांग\n\n💡 **सफलता का नियम:** पहले स्थान का फुटफॉल जांचें और कम से कम 3 महीने का वर्किंग कैपिटल रिज़र्व रखें।`;
    }
    return `🏪 **High-Demand Businesses for ₹2L–₹5L Capital:**\n1. **Daily Needs / Kirana Store:** 15–25% gross margin, steady daily cashflow\n2. **Agri-Inputs & Services:** High rural & semi-urban demand, 12–20% margin\n3. **Mobile & Electronics Service:** High margin (35–50%) on repairs/accessories\n4. **Food / Fast Food Outlet:** 40–55% gross margin near transit points\n\n💡 **Key Principle:** Always reserve 20-30% of your starting capital for initial working capital & rent buffers.`;
  }

  // 7. RBI Rules & Harassment
  if (q.includes("rbi") || q.includes("recovery") || q.includes("harass") || q.includes("ombudsman")) {
    if (isHi) {
      return `📜 **RBI नियम व उपभोक्ता अधिकार:**\n• **कॉलिंग समय:** रिकवरी एजेंट केवल सुबह 8:00 से शाम 7:00 के बीच ही संपर्क कर सकते हैं।\n• **बदसलूकी निषेध:** धमकी, गाली-गलौज, या रिश्तेदारों को फोन करना सख्त गैरकानूनी है।\n• **शिकायत:** पहले बैंक को लिखें। 30 दिन में समाधान न होने पर **RBI CMS पोर्टल (cms.rbi.org.in)** पर 100% निशुल्क शिकायत करें।`;
    }
    return `📜 **RBI Borrower Protection Guidelines:**\n• **Contact Timings:** Recovery agents can only call/visit between 8:00 AM and 7:00 PM.\n• **Strict Prohibition:** Threats, abusive language, or contacting friends/family/phonebook is strictly illegal.\n• **Grievance Redressal:** If the lender does not resolve your dispute in 30 days, escalate directly to the **RBI Integrated Ombudsman (cms.rbi.org.in)** for free binding resolution.`;
  }

  // 8. Tax Savings
  if (q.includes("tax") || q.includes("80c") || q.includes("regime") || q.includes("gst")) {
    if (isHi) {
      return `🧾 **टैक्स बचत व नियम:**\n• **Section 80C:** ₹1.5 लाख तक की छूट (PPF, ELSS, Life Insurance, EPF)\n• **New vs Old:** New Tax Regime में ₹7 लाख तक की आय पर कोई टैक्स नहीं (Rebate u/s 87A)\n• **MSME लाभ:** 45 दिन में MSME पेमेंट न करने पर खरीदार को टैक्स छूट नहीं मिलती।`;
    }
    return `🧾 **Tax Optimization Essentials:**\n• **Section 80C:** Up to ₹1.5 Lakh deductions via PPF, ELSS mutual funds, Term Insurance, Tax-saving FDs\n• **New vs Old Regime:** New Regime offers zero tax for income up to ₹7 Lakh (Section 87A rebate)\n• **MSME Section 43B(h):** Buyers must pay registered MSMEs within 45 days, or they cannot claim tax deductions on that expense.`;
  }

  // 9. Goals, Budget, Savings
  if (q.includes("goal") || q.includes("budget") || q.includes("save") || q.includes("savings")) {
    if (isHi) {
      return `🎯 **स्मार्ट वित्तीय योजना (50/30/20 नियम):**\n• **50% जरूरतें:** राशन, किराया, बिजली, स्कूल फीस\n• **30% बिज़नेस व विकास:** कार्यशील पूंजी, इन्वेंट्री, सुधार\n• **20% बचत व निवेश:** आपातकालीन फंड, SIP, गोल्ड\n\n📌 6 महीने के खर्च जितना इमरजेंसी फंड हमेशा सुरक्षित रखें।`;
    }
    return `🎯 **Smart Money Management (50/30/20 Rule):**\n• **50% Needs:** Rent, groceries, bills, loan EMIs\n• **30% Business Growth / Operations:** Inventory restocking, working buffer\n• **20% Savings & Growth:** Emergency fund, SIPs, gold, debt reduction\n\n📌 Maintain an emergency reserve equal to at least 3-6 months of operating expenses.`;
  }

  // Generic Greetings
  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("namaste")) {
    if (isHi) {
      return `नमस्ते! मैं Kiro AI हूँ। मैं आपके बिज़नेस, लोन, खर्च, बजट और बचत के निर्णयों में सहायता कर सकती हूँ। आप क्या जानना चाहते हैं?`;
    }
    return `Hello! I am Kiro AI. I can assist you with government loans, business viability, budgeting, investments, and financial planning. How can I help you today?`;
  }

  // Default intelligent response
  if (isHi) {
    return `मैंने आपका प्रश्न समझ लिया है: "${query}"। \n\nKiro AI आपको सरकारी लोन (Mudra, PMEGP), बिज़नेस फिजिबिलिटी, बजट और बचत योजनाओं पर सटीक मार्गदर्शन प्रदान करता है। कृपया ऊपर दिए गए सुझावों में से चुनें या अधिक विवरण साझा करें।`;
  }
  return `I have noted your query: "${query}". \n\nKiro AI provides hyper-local guidance on government schemes (Mudra, PMEGP), business feasibility, cashflow optimization, and financial safety. Feel free to tap one of the suggested topics above or ask for specific numbers!`;
}

/* =========================================================
   MAIN KIRO AI COMPONENT (ChatGPT / Gemini Pro Aesthetic)
========================================================= */
export default function Kiro AIAlexaPro() {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab context computed on every route change
  const currentTab = useMemo(() => getTabContext(location.pathname), [location.pathname]);

  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sendLockRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(
    () => localStorage.getItem("kiro_alexa_language") || "en"
  );

  const [message, setMessage] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome-init",
      role: "assistant",
      text: currentTab.welcome,
    },
  ]);

  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null); // Tracks which specific message is being read aloud
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState("");

  // Update initial welcome message when route changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: `welcome-${currentTab.mode}`,
            role: "assistant",
            text: language === "hi" ? currentTab.welcomeHi : currentTab.welcome,
          },
        ];
      }
      return prev;
    });
  }, [currentTab.mode, currentTab.welcome, currentTab.welcomeHi, language]);

  // Scroll smoothly to bottom
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, thinking, open]);

  // Stop browser speech when window is closed or unmounted
  useEffect(() => {
    return () => {
      stopBrowserSpeech();
    };
  }, []);

  const pushMessage = useCallback((role, text) => {
    const clean = safeText(text).trim();
    if (!clean) return;
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text: clean },
    ]);
  }, []);

  // MANUAL Speech Playback: Triggered ONLY on user explicit click on "🔊 Listen"
  const toggleSpeakMessage = useCallback(
    (msgId, text) => {
      if (speakingId === msgId) {
        // Stop current speech
        stopBrowserSpeech();
        setSpeakingId(null);
        return;
      }

      if (!text) return;
      stopBrowserSpeech();
      setSpeakingId(msgId);
      setError("");

      speakText(
        text,
        language,
        () => setSpeakingId(msgId),
        () => setSpeakingId(null),
        (err) => {
          setSpeakingId(null);
          if (err) setError(err);
        }
      );
    },
    [language, speakingId]
  );

  const handleCopyText = useCallback((id, text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  }, []);

  const handleClearChat = useCallback(() => {
    stopBrowserSpeech();
    setSpeakingId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: language === "hi" ? currentTab.welcomeHi : currentTab.welcome,
      },
    ]);
  }, [currentTab.welcome, currentTab.welcomeHi, language]);

  // Send message: NO auto-speech triggers
  const sendMessage = useCallback(
    async (overrideText = null) => {
      const text = safeText(overrideText ?? message).trim();
      if (!text || thinking || sendLockRef.current) return;

      sendLockRef.current = true;
      setMessage("");
      setLiveTranscript("");
      setError("");
      pushMessage("user", text);
      setThinking(true);

      // Generate rich contextual local reply as instant baseline
      const localReply = buildLocalReply(text, language, currentTab.mode);

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(`${API_BASE}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
          body: JSON.stringify({
            message: text,
            context: currentTab.mode,
            pathname: location.pathname,
          }),
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const reply = safeText(data.reply || data.response || data.message || data.answer).trim();
          if (reply) {
            pushMessage("assistant", reply);
            return; // Finished without auto-speaking
          }
        }
      } catch (_) {
        // Backend unavailable or timed out: use local intelligence smoothly
      } finally {
        setThinking(false);
        sendLockRef.current = false;
      }

      // Deliver local answer without auto-speaking
      pushMessage("assistant", localReply);
    },
    [currentTab.mode, language, location.pathname, message, pushMessage, thinking]
  );

  // Speech Recognition (Voice Input)
  const startVoice = useCallback(async () => {
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      recognitionRef.current = null;
      setListening(false);
      setLiveTranscript("");
      return;
    }

    stopBrowserSpeech();
    setSpeakingId(null);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setListening(true);
        setLiveTranscript("");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);
        if (event.results[0].isFinal) {
          const finalText = transcript.trim();
          if (finalText) {
            sendMessage(finalText);
          }
          setListening(false);
        }
      };

      recognition.onerror = (e) => {
        setListening(false);
        setLiveTranscript("");
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      setListening(false);
      setError("Could not start microphone.");
    }
  }, [language, listening, sendMessage]);

  return (
    <>
      {/* ── STYLES & GEMINI NEON ANIMATIONS ── */}
      <style>{`
        @keyframes geminiBorderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes geminiPulseAura {
          0%, 100% {
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.4), 0 0 35px rgba(99, 102, 241, 0.25);
          }
          50% {
            box-shadow: 0 0 28px rgba(56, 189, 248, 0.75), 0 0 55px rgba(168, 85, 247, 0.45);
          }
        }

        @keyframes geminiSparkleGlow {
          0%, 100% { filter: drop-shadow(0 0 5px #38BDF8) brightness(1.1); }
          50% { filter: drop-shadow(0 0 12px #C084FC) brightness(1.4); }
        }

        @keyframes chatGptSoundWave {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }

        .chatgpt-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .chatgpt-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatgpt-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.14);
          border-radius: 9999px;
        }
        .chatgpt-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.45);
        }
      `}</style>

      {/* ── 1. COLLAPSED FLOATING TRIGGER PILL (Google Gemini & ChatGPT Minimalist Orb) ── */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 99999,
            cursor: "pointer",
            background: "linear-gradient(90deg, #38BDF8, #818CF8, #C084FC, #F472B6, #2DD4BF, #38BDF8)",
            backgroundSize: "300% 100%",
            animation: listening
              ? "geminiBorderFlow 2s linear infinite"
              : "geminiBorderFlow 4s linear infinite, geminiPulseAura 3.5s ease-in-out infinite",
            padding: "2px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            boxSizing: "border-box",
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03) translateY(-2px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) translateY(0)")}
        >
          {/* Inner glass body */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(10, 17, 34, 0.95), rgba(7, 12, 24, 0.98))",
              borderRadius: "9999px",
              padding: "7px 16px 7px 8px",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              color: "#FFFFFF",
              backdropFilter: "blur(18px)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Sparkling Gemini Orb */}
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #67E8F9, #38BDF8 40%, #6366F1 80%, #A855F7 100%)",
                display: "grid",
                placeItems: "center",
                fontSize: "17px",
                fontWeight: "900",
                boxShadow: "0 0 14px rgba(56, 189, 248, 0.6)",
                animation: "geminiSparkleGlow 2.5s infinite",
                flexShrink: 0,
              }}
            >
              ✦
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: "800", fontSize: "13px", letterSpacing: "-0.2px", color: "#F8FAFC" }}>
                  Kiro AI
                </span>
                <span
                  style={{
                    fontSize: "8.5px",
                    fontWeight: "800",
                    padding: "1.5px 6px",
                    borderRadius: "9999px",
                    background: `${currentTab.badgeColor}22`,
                    color: currentTab.badgeColor,
                    border: `1px solid ${currentTab.badgeColor}55`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {currentTab.badge}
                </span>
              </div>

              <span style={{ fontSize: "9.5px", color: "#94A3B8" }}>
                {listening ? "🎤 Listening..." : "Ask Kiro AI anything"}
              </span>
            </div>

            {/* Quick Mic Action */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
                startVoice();
              }}
              title="Speak to Kiro AI"
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                background: listening ? "#EF4444" : "rgba(14, 165, 233, 0.15)",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                fontSize: "13px",
                marginLeft: "4px",
                transition: "all 0.18s ease",
              }}
            >
              {listening ? "■" : "🎤"}
            </button>
          </div>
        </div>
      )}

      {/* ── 2. MODERN CHATGPT / GEMINI EXPANDED CHAT WINDOW ── */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "85px",
            right: "24px",
            width: "410px",
            maxWidth: "calc(100vw - 32px)",
            height: "600px",
            maxHeight: "calc(100vh - 110px)",
            zIndex: 99999,
            background: "linear-gradient(135deg, var(--primary-accent), var(--blue), #8B5CF6, var(--primary-accent))",
            backgroundSize: "300% 100%",
            animation: "geminiBorderFlow 4s linear infinite",
            padding: "2px",
            borderRadius: "24px",
            boxShadow: "var(--shadow-md), 0 0 35px var(--glow)",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
          }}
        >
          {/* Inner Glass Shell */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "var(--surface)",
              borderRadius: "22px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "var(--text)",
              backdropFilter: "blur(25px)",
            }}
          >
            {/* ── HEADER ── */}
            <div
              style={{
                padding: "13px 16px",
                borderBottom: "1px solid var(--border)",
                background: "var(--navbar-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              {/* Left: Avatar + Title + Model Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #67E8F9, #38BDF8 40%, #6366F1 80%, #A855F7 100%)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "16px",
                    fontWeight: "900",
                    color: "#FFFFFF",
                    animation: "geminiSparkleGlow 2.5s infinite",
                    boxShadow: "0 0 12px var(--glow)",
                    flexShrink: 0,
                  }}
                >
                  ✦
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: "800", fontSize: "14px", letterSpacing: "-0.2px", color: "var(--text-h)" }}>
                      Kiro AI
                    </span>
                    <span
                      style={{
                        fontSize: "8.5px",
                        fontWeight: "800",
                        padding: "1.5px 6px",
                        borderRadius: "9999px",
                        background: `${currentTab.badgeColor}22`,
                        color: currentTab.badgeColor,
                        border: `1px solid ${currentTab.badgeColor}55`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {currentTab.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: "9.5px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "5px", marginTop: "1px" }}>
                    <span style={{ color: "#10B981" }}>●</span>
                    <span>LLaMA 3.3 • Smart Co-Pilot</span>
                  </div>
                </div>
              </div>

              {/* Right: Language + Clear + Close */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {/* Language Switcher */}
                <div
                  style={{
                    display: "flex",
                    background: "var(--surface-soft)",
                    borderRadius: "8px",
                    padding: "2px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("en");
                      localStorage.setItem("kiro_alexa_language", "en");
                    }}
                    style={{
                      padding: "2px 7px",
                      borderRadius: "6px",
                      border: "none",
                      background: language === "en" ? "linear-gradient(90deg, var(--primary), var(--blue))" : "transparent",
                      color: language === "en" ? "#FFF" : "var(--muted)",
                      fontSize: "9.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("hi");
                      localStorage.setItem("kiro_alexa_language", "hi");
                    }}
                    style={{
                      padding: "2px 7px",
                      borderRadius: "6px",
                      border: "none",
                      background: language === "hi" ? "linear-gradient(90deg, var(--primary), var(--blue))" : "transparent",
                      color: language === "hi" ? "#FFF" : "var(--muted)",
                      fontSize: "9.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    हिन्दी
                  </button>
                </div>

                {/* Clear Chat Button */}
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-soft)",
                    color: "var(--muted)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    fontSize: "12px",
                    transition: "all 0.15s ease",
                  }}
                >
                  🗑️
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    stopBrowserSpeech();
                    setOpen(false);
                  }}
                  title="Close Assistant"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--surface-soft)",
                    color: "var(--muted)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "all 0.15s ease",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── CONTEXT SUB-STRIP ── */}
            <div
              style={{
                padding: "6px 16px",
                background: "var(--primary-soft)",
                borderBottom: "1px solid var(--border)",
                fontSize: "10.5px",
                color: "var(--primary-accent)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>📌</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentTab.subNote}
              </span>
            </div>

            {/* ── MESSAGES CHAT AREA (ChatGPT Layout) ── */}
            <div
              className="chatgpt-scrollbar"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {messages.map((m) => {
                const isUser = m.role === "user";
                const isThisSpeaking = speakingId === m.id;

                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "9px",
                        maxWidth: isUser ? "85%" : "95%",
                        flexDirection: isUser ? "row-reverse" : "row",
                      }}
                    >
                      {/* AI Avatar */}
                      {!isUser && (
                        <div
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, var(--primary), var(--blue))",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "12px",
                            color: "#FFFFFF",
                            flexShrink: 0,
                            marginTop: "2px",
                            boxShadow: "0 2px 8px var(--glow)",
                          }}
                        >
                          ✦
                        </div>
                      )}

                      {/* Bubble Body */}
                      <div
                        style={{
                          padding: isUser ? "10px 14px" : "12px 15px",
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isUser
                            ? "linear-gradient(135deg, var(--primary) 0%, var(--blue) 100%)"
                            : "var(--surface-soft)",
                          border: isUser ? "1px solid var(--border-strong)" : "1px solid var(--border)",
                          boxShadow: isUser
                            ? "0 4px 14px var(--glow)"
                            : "var(--shadow-sm)",
                          color: isUser ? "#FFFFFF" : "var(--text-h)",
                          fontSize: "12px",
                          lineHeight: "1.55",
                          wordBreak: "break-word",
                        }}
                      >
                        <FormattedMessageContent text={m.text} />
                      </div>
                    </div>

                    {/* AI Message Action Toolbar (Listen & Copy) */}
                    {!isUser && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginLeft: "35px",
                          marginTop: "2px",
                        }}
                      >
                        {/* Listen Button (Explicit Click Only) */}
                        <button
                          type="button"
                          onClick={() => toggleSpeakMessage(m.id, m.text)}
                          title={isThisSpeaking ? "Stop speaking" : "Listen aloud"}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: isThisSpeaking ? "1px solid #10B981" : "1px solid var(--border)",
                            background: isThisSpeaking ? "rgba(16, 185, 129, 0.18)" : "var(--surface-soft)",
                            color: isThisSpeaking ? "#10B981" : "var(--muted)",
                            fontSize: "10px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isThisSpeaking ? (
                            <>
                              <span style={{ color: "#10B981" }}>■</span>
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <span>🔊</span>
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(m.id, m.text)}
                          title="Copy text"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid var(--border)",
                            background: "var(--surface-soft)",
                            color: copiedId === m.id ? "#10B981" : "var(--muted)",
                            fontSize: "10px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span>{copiedId === m.id ? "✓" : "📋"}</span>
                          <span>{copiedId === m.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Live Voice Input Transcript */}
              {listening && liveTranscript && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "9px 13px",
                      borderRadius: "14px",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px dashed #EF4444",
                      color: "#FCA5A5",
                      fontSize: "11.5px",
                      fontStyle: "italic",
                    }}
                  >
                    🎤 {liveTranscript}
                  </div>
                </div>
              )}

              {/* Thinking / Analyzing Indicator */}
              {thinking && (
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--primary), var(--blue))",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "12px",
                      color: "#FFFFFF",
                    }}
                  >
                    ✦
                  </div>
                  <div
                    style={{
                      padding: "9px 14px",
                      borderRadius: "14px",
                      background: "var(--surface-soft)",
                      border: "1px solid var(--border)",
                      fontSize: "11.5px",
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                    }}
                  >
                    <span>Kiro AI is thinking...</span>
                    <span style={{ animation: "geminiSparkleGlow 1.2s infinite" }}>✦</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── CONTEXTUAL 1-TAP PROMPT CHIPS ── */}
            <div
              style={{
                padding: "8px 14px 4px 14px",
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                whiteSpace: "nowrap",
                borderTop: "1px solid var(--border)",
                background: "var(--navbar-bg)",
              }}
              className="chatgpt-scrollbar"
            >
              {currentTab.actions.map((action, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(action.command)}
                  style={{
                    padding: "5px 10px",
                    background: "var(--surface-soft)",
                    border: "1px solid var(--border)",
                    borderRadius: "9999px",
                    color: "var(--primary-accent)",
                    fontSize: "10.5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary-accent)";
                    e.currentTarget.style.background = "var(--primary-soft)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--surface-soft)";
                  }}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            {/* ── CHATGPT-STYLE PILL INPUT BAR ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              style={{
                padding: "8px 14px 14px 14px",
                background: "var(--navbar-bg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 6px 5px 14px",
                  borderRadius: "16px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-sm)",
                  transition: "border-color 0.18s ease",
                }}
              >
                <input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={currentTab.placeholder}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    color: "var(--text-h)",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />

                {/* Mic Button */}
                <button
                  type="button"
                  onClick={startVoice}
                  title="Voice Input"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: listening ? "#EF4444" : "var(--surface)",
                    color: listening ? "#FFFFFF" : "var(--primary-accent)",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {listening ? "■" : "🎤"}
                </button>

                {/* Circular Send Arrow Button (ChatGPT iconic up-arrow) */}
                <button
                  type="submit"
                  disabled={thinking || !message.trim()}
                  title="Send message"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "none",
                    background:
                      thinking || !message.trim()
                        ? "var(--surface)"
                        : "linear-gradient(135deg, var(--primary), var(--blue))",
                    color: thinking || !message.trim() ? "var(--muted)" : "#FFFFFF",
                    cursor: thinking || !message.trim() ? "not-allowed" : "pointer",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "16px",
                    fontWeight: "900",
                    flexShrink: 0,
                    boxShadow: thinking || !message.trim() ? "none" : "0 2px 8px var(--glow)",
                    transition: "all 0.18s ease",
                  }}
                >
                  ↑
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
