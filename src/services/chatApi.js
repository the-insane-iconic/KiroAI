// chatApi.js — Kiro AI backend communication
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5001";

/**
 * Send a chat message and receive AI response.
 * @param {string} message        - User message
 * @param {Array}  history        - Previous messages [{role, content}]
 * @param {string} mode           - 'finance' | 'business' | 'general'
 * @param {string} systemContext  - Optional system-level context (vault profile)
 * @returns {Promise<{reply: string, intent?: string, data?: any}>}
 */
export async function sendChat(message, history = [], mode = "general", systemContext = "") {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, mode, system_context: systemContext }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Server error ${res.status}`);
  }
  return res.json();
}

/**
 * Detect intent of a message to route to the right engine.
 * @param {string} message
 * @returns {Promise<{intent: string, confidence: number}>}
 */
export async function detectIntent(message) {
  try {
    const res = await fetch(`${API_BASE}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return { intent: "general", confidence: 0.5 };
    return res.json();
  } catch {
    return { intent: "general", confidence: 0.5 };
  }
}

/**
 * Upload a document for OCR / vision analysis.
 * @param {File} file
 * @returns {Promise<{text: string, structured: any}>}
 */
export async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/document/analyze`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Document upload failed");
  return res.json();
}

/**
 * Get financial summary for the logged-in user.
 */
export async function getFinancialSummary() {
  const res = await fetch(`${API_BASE}/api/finance/summary`);
  if (!res.ok) return null;
  return res.json();
}