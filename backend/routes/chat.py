"""
AmiVest AI Financial Co-Pilot - Intelligent Chatbot with Full Backend Access

Features:
- Fast deterministic command execution (add expense, add income, delete transaction, add goal, set budget)
- Natural Language Intent Extraction using Groq (English, Hindi, Hinglish)
- Direct Backend CRUD:
  - Add Expense & Income
  - Delete / Undo Transactions
  - Create & Delete Financial Goals
  - Set & Update Category Budget Limits
- Personalized Financial Planning:
  - Real-time 50/30/20 breakdown based on actual income & expense
  - Goal feasibility timelines & milestone calculations
  - Surplus optimization & Indian investment/scheme advisory (PPF, SIP, Mudra, PMEGP)
- Rich action feedback envelopes with live dashboard synchronization
"""

from __future__ import annotations

import json
import logging
import os
import re
import time
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Blueprint, jsonify, request, session
from groq import Groq

from database.db import get_connection

# ============================================================
# ENVIRONMENT
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

logger = logging.getLogger("amivest.chat")

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(handler)

logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())

# ============================================================
# BLUEPRINT
# ============================================================

chat = Blueprint("chat", __name__)

# ============================================================
# GROQ CLIENT & MODELS
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "").strip()

MAX_MESSAGE_LENGTH = 2000
MAX_HISTORY_ITEMS = 8

# Active models confirmed on Groq account
MODEL_PRIORITY = [
    "groq/compound",
    "qwen/qwen3.8-27b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
]

EXCLUDED_MODEL_WORDS = ("whisper", "guard", "safeguard", "speech", "audio", "tts", "embed")

groq_client = None

if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        logger.exception("Could not initialize Groq client.")
else:
    logger.warning("GROQ_API_KEY is missing from environment.")

_model_cache = {"ids": [], "fetched_at": 0.0}


# ============================================================
# HELPERS
# ============================================================

def safe_decimal(value) -> Decimal:
    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return Decimal("0")


def safe_float(value) -> float:
    return float(safe_decimal(value))


def money(value) -> str:
    amount = safe_decimal(value)
    return f"₹{amount:,.2f}"


def clean_text(value) -> str:
    if value is None:
        return ""
    text = str(value).replace("\x00", " ")
    return re.sub(r"\s+", " ", text).strip()


def clean_ai_answer(answer: str) -> str:
    if not answer:
        return ""
    # Strip <think>...</think> reasoning blocks
    cleaned = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL)
    cleaned = cleaned.replace("```json", "").replace("```text", "").replace("```", "")
    return cleaned.strip()


def get_current_user_id() -> int:
    user_id = session.get("user_id") or session.get("userId") or session.get("id")
    if user_id:
        try:
            return int(user_id)
        except (ValueError, TypeError):
            return 1
    return 1


def table_columns(cursor, table_name: str) -> set[str]:
    try:
        cursor.execute(f"PRAGMA table_info({table_name})")
        rows = cursor.fetchall() or []
        cols = {row["name"] if isinstance(row, dict) else row[1] for row in rows}
        if cols:
            return cols
    except Exception:
        pass

    try:
        cursor.execute(
            """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = %s
            """,
            (table_name,),
        )
        rows = cursor.fetchall() or []
        result = set()
        for row in rows:
            val = row.get("COLUMN_NAME") if isinstance(row, dict) else row[0]
            if val:
                result.add(str(val))
        return result
    except Exception:
        return set()


# ============================================================
# LIVE FINANCIAL CONTEXT RETRIEVAL
# ============================================================

def get_financial_context(user_id: int) -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            raise RuntimeError("Database unavailable")

        cursor = conn.cursor(dictionary=True)

        # 1. Total ledger calculations
        cursor.execute(
            """
            SELECT
                COALESCE(SUM(amount), 0) AS balance,
                COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS expenses
            FROM transactions
            WHERE user_id = %s
            """,
            (user_id,),
        )
        ledger_row = cursor.fetchone() or {}

        # 2. Monthly calculations
        today = date.today()
        month_start = today.replace(day=1).isoformat()
        cursor.execute(
            """
            SELECT
                COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS income,
                COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS expenses
            FROM transactions
            WHERE user_id = %s AND transaction_date >= %s
            """,
            (user_id, month_start),
        )
        month_row = cursor.fetchone() or {}

        # 3. Recent transactions (latest 10)
        cursor.execute(
            """
            SELECT id, type, category, amount, description, transaction_date
            FROM transactions
            WHERE user_id = %s
            ORDER BY transaction_date DESC, id DESC
            LIMIT 10
            """,
            (user_id,),
        )
        transactions = cursor.fetchall() or []

        # 4. Goals
        goals = []
        try:
            cursor.execute(
                """
                SELECT * FROM goals WHERE user_id = %s ORDER BY id DESC LIMIT 10
                """,
                (user_id,),
            )
            goals = cursor.fetchall() or []
        except Exception:
            pass

        # 5. Spending / Budget limits
        limits = []
        try:
            cursor.execute(
                """
                SELECT * FROM spending_limits WHERE user_id = %s ORDER BY id DESC LIMIT 10
                """,
                (user_id,),
            )
            limits = cursor.fetchall() or []
        except Exception:
            pass

        balance = safe_decimal(ledger_row.get("balance", 0))
        total_income = safe_decimal(ledger_row.get("income", 0))
        total_expenses = safe_decimal(ledger_row.get("expenses", 0))
        monthly_income = safe_decimal(month_row.get("income", 0))
        monthly_expenses = safe_decimal(month_row.get("expenses", 0))
        monthly_surplus = monthly_income - monthly_expenses
        savings_rate = float((balance / total_income * 100)) if total_income > 0 else 0.0

        return {
            "current_balance": balance,
            "total_income": total_income,
            "total_expenses": total_expenses,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "monthly_surplus": monthly_surplus,
            "savings_rate": max(0.0, min(100.0, savings_rate)),
            "transactions": transactions,
            "goals": goals,
            "limits": limits,
        }

    except Exception:
        logger.exception("Could not retrieve financial context.")
        return {
            "current_balance": Decimal("0"),
            "total_income": Decimal("0"),
            "total_expenses": Decimal("0"),
            "monthly_income": Decimal("0"),
            "monthly_expenses": Decimal("0"),
            "monthly_surplus": Decimal("0"),
            "savings_rate": 0.0,
            "transactions": [],
            "goals": [],
            "limits": [],
        }
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


# ============================================================
# BACKEND ACTION EXECUTION ENGINES
# ============================================================

def execute_add_expense(user_id: int, amount: float | Decimal, category: str, description: str = "") -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            return {"success": False, "error": "Database connection unavailable."}

        cursor = conn.cursor()
        neg_amount = -abs(safe_decimal(amount))
        cat = clean_text(category).capitalize() or "General"
        desc = clean_text(description) or f"{cat} expense"
        tx_date = date.today().isoformat()

        cursor.execute(
            """
            INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
            VALUES (%s, 'expense', %s, %s, %s, %s)
            """,
            (user_id, cat, float(neg_amount), desc, tx_date),
        )
        conn.commit()
        new_id = cursor.lastrowid

        return {
            "success": True,
            "action": "add_expense",
            "transaction": {
                "id": new_id,
                "amount": float(abs(neg_amount)),
                "type": "expense",
                "category": cat,
                "description": desc,
                "date": tx_date,
            },
        }
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("execute_add_expense error")
        return {"success": False, "error": str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def execute_add_income(user_id: int, amount: float | Decimal, category: str, description: str = "") -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            return {"success": False, "error": "Database connection unavailable."}

        cursor = conn.cursor()
        pos_amount = abs(safe_decimal(amount))
        cat = clean_text(category).capitalize() or "Salary"
        desc = clean_text(description) or f"{cat} credit"
        tx_date = date.today().isoformat()

        cursor.execute(
            """
            INSERT INTO transactions (user_id, type, category, amount, description, transaction_date)
            VALUES (%s, 'income', %s, %s, %s, %s)
            """,
            (user_id, cat, float(pos_amount), desc, tx_date),
        )
        conn.commit()
        new_id = cursor.lastrowid

        return {
            "success": True,
            "action": "add_income",
            "transaction": {
                "id": new_id,
                "amount": float(pos_amount),
                "type": "income",
                "category": cat,
                "description": desc,
                "date": tx_date,
            },
        }
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("execute_add_income error")
        return {"success": False, "error": str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def execute_delete_transaction(user_id: int, tx_id: int | None = None, category_hint: str = "") -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            return {"success": False, "error": "Database connection unavailable."}

        cursor = conn.cursor(dictionary=True)

        target = None
        if tx_id:
            cursor.execute(
                "SELECT id, type, category, amount, description FROM transactions WHERE id = %s AND user_id = %s",
                (tx_id, user_id),
            )
            target = cursor.fetchone()
        elif category_hint:
            cursor.execute(
                """
                SELECT id, type, category, amount, description FROM transactions
                WHERE user_id = %s AND LOWER(category) LIKE %s
                ORDER BY id DESC LIMIT 1
                """,
                (user_id, f"%{category_hint.lower()}%"),
            )
            target = cursor.fetchone()

        if not target:
            # Delete most recent transaction
            cursor.execute(
                """
                SELECT id, type, category, amount, description FROM transactions
                WHERE user_id = %s ORDER BY id DESC LIMIT 1
                """,
                (user_id,),
            )
            target = cursor.fetchone()

        if not target:
            return {"success": False, "error": "No matching transaction found to delete."}

        del_id = target["id"]
        cursor.execute("DELETE FROM transactions WHERE id = %s AND user_id = %s", (del_id, user_id))
        conn.commit()

        return {
            "success": True,
            "action": "delete_transaction",
            "deleted": {
                "id": del_id,
                "category": target.get("category", "General"),
                "amount": float(abs(safe_decimal(target.get("amount", 0)))),
                "description": target.get("description", ""),
            },
        }
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("execute_delete_transaction error")
        return {"success": False, "error": str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def execute_add_goal(user_id: int, title: str, target_amount: float | Decimal, deadline: str = "", category: str = "General") -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            return {"success": False, "error": "Database connection unavailable."}

        cursor = conn.cursor(dictionary=True)
        cols = table_columns(cursor, "goals")

        t_amt = float(safe_decimal(target_amount))
        t_title = clean_text(title) or "Financial Milestone"
        t_deadline = deadline or date(date.today().year, 12, 31).isoformat()
        t_cat = clean_text(category) or "General"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if "goal_name" in cols:
            cursor.execute(
                """
                INSERT INTO goals (user_id, goal_name, category, target_amount, current_saved, target_date, status, created_at)
                VALUES (%s, %s, %s, %s, 0, %s, 'Active', %s)
                """,
                (user_id, t_title, t_cat, t_amt, t_deadline, now_str),
            )
        else:
            cursor.execute(
                """
                INSERT INTO goals (user_id, title, target_amount, current_amount, deadline, category, created_at)
                VALUES (%s, %s, %s, 0, %s, %s, %s)
                """,
                (user_id, t_title, t_amt, t_deadline, t_cat, now_str),
            )

        conn.commit()
        new_id = cursor.lastrowid

        return {
            "success": True,
            "action": "add_goal",
            "goal": {
                "id": new_id,
                "title": t_title,
                "target_amount": t_amt,
                "deadline": t_deadline,
                "category": t_cat,
            },
        }
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("execute_add_goal error")
        return {"success": False, "error": str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def execute_delete_goal(user_id: int, goal_id: int | None = None, title_match: str = "") -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            return {"success": False, "error": "Database connection unavailable."}

        cursor = conn.cursor(dictionary=True)
        cols = table_columns(cursor, "goals")
        name_col = "goal_name" if "goal_name" in cols else "title"

        target = None
        if goal_id:
            cursor.execute(f"SELECT id, {name_col} as name FROM goals WHERE id = %s AND user_id = %s", (goal_id, user_id))
            target = cursor.fetchone()
        elif title_match:
            cursor.execute(
                f"SELECT id, {name_col} as name FROM goals WHERE user_id = %s AND LOWER({name_col}) LIKE %s ORDER BY id DESC LIMIT 1",
                (user_id, f"%{title_match.lower()}%"),
            )
            target = cursor.fetchone()
        else:
            cursor.execute(f"SELECT id, {name_col} as name FROM goals WHERE user_id = %s ORDER BY id DESC LIMIT 1", (user_id,))
            target = cursor.fetchone()

        if not target:
            return {"success": False, "error": "No matching goal found to delete."}

        gid = target["id"]
        cursor.execute("DELETE FROM goals WHERE id = %s AND user_id = %s", (gid, user_id))
        conn.commit()

        return {
            "success": True,
            "action": "delete_goal",
            "deleted_goal": {"id": gid, "title": target.get("name", "Goal")},
        }
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("execute_delete_goal error")
        return {"success": False, "error": str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def execute_set_budget(user_id: int, category: str, monthly_limit: float | Decimal) -> dict[str, Any]:
    conn = None
    cursor = None
    try:
        conn = get_connection()
        if not conn:
            return {"success": False, "error": "Database connection unavailable."}

        cursor = conn.cursor(dictionary=True)
        cat = clean_text(category).capitalize() or "General"
        lim = float(safe_decimal(monthly_limit))

        # 1. Update spending_limits
        cursor.execute("SELECT id FROM spending_limits WHERE user_id = %s AND LOWER(category) = LOWER(%s)", (user_id, cat))
        existing = cursor.fetchone()

        if existing:
            cursor.execute(
                "UPDATE spending_limits SET monthly_limit = %s WHERE id = %s",
                (lim, existing["id"]),
            )
        else:
            cursor.execute(
                "INSERT INTO spending_limits (user_id, category, monthly_limit) VALUES (%s, %s, %s)",
                (user_id, cat, lim),
            )

        # 2. Update budget_limits if table exists
        try:
            cursor.execute("SELECT id FROM budget_limits WHERE user_id = %s AND LOWER(category) = LOWER(%s)", (user_id, cat))
            b_existing = cursor.fetchone()
            if b_existing:
                cursor.execute("UPDATE budget_limits SET monthly_limit = %s WHERE id = %s", (lim, b_existing["id"]))
            else:
                cursor.execute("INSERT INTO budget_limits (user_id, category, monthly_limit, spent) VALUES (%s, %s, %s, 0)", (user_id, cat, lim))
        except Exception:
            pass

        conn.commit()

        return {
            "success": True,
            "action": "set_budget",
            "budget": {"category": cat, "monthly_limit": lim},
        }
    except Exception as e:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        logger.exception("execute_set_budget error")
        return {"success": False, "error": str(e)}
    finally:
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if conn:
            try:
                conn.close()
            except Exception:
                pass


# ============================================================
# PERSONALIZED FINANCIAL PLANNER ENGINE
# ============================================================

def generate_personalized_plan(financial_context: dict[str, Any], user_name: str = "Friend", specific_query: str = "") -> str:
    total_income = float(financial_context.get("total_income", 0))
    total_expenses = float(financial_context.get("total_expenses", 0))
    surplus = float(financial_context.get("monthly_surplus", 0))
    balance = float(financial_context.get("current_balance", 0))
    savings_rate = financial_context.get("savings_rate", 0.0)
    goals = financial_context.get("goals", [])

    # Standard 50-30-20 benchmark adjusted for current income
    needs_budget = total_income * 0.50 if total_income > 0 else 15000
    wants_budget = total_income * 0.30 if total_income > 0 else 9000
    savings_target = total_income * 0.20 if total_income > 0 else 6000

    plan = f"""🎯 **Personalized Financial Blueprint for {user_name}**

📊 **Current Financial Position:**
• **Recorded Inflows:** ₹{total_income:,.2f}
• **Recorded Outflows:** ₹{total_expenses:,.2f}
• **Net Liquid Surplus:** ₹{balance:,.2f}
• **Savings Rate:** {savings_rate:.1f}%

📋 **Recommended 50 / 30 / 20 Monthly Allocation:**
1. **Essential Needs (50%):** ₹{needs_budget:,.2f} / month (Rent, groceries, utilities, loan EMIs)
2. **Discretionary Wants (30%):** ₹{wants_budget:,.2f} / month (Dining, shopping, subscriptions)
3. **Surplus & Wealth Building (20%):** ₹{savings_target:,.2f} / month

🛡️ **Actionable 3-Step Strategy:**
1. **Emergency Shield:** Maintain ₹{(total_expenses * 3 if total_expenses > 0 else 50000):,.2f} (3 months of expenses) in high-yield liquid FD / safe bank savings (DICGC guaranteed up to ₹5 Lakh).
2. **Disciplined Growth:** Allocate ₹{max(1000.0, surplus * 0.6 if surplus > 0 else savings_target * 0.5):,.2f}/month into low-risk Index SIPs or PPF.
3. **Goal Tracking:**"""

    if goals:
        plan += f"\n• You have {len(goals)} active goal(s). Keep allocating surplus to reach your milestone on schedule!"
    else:
        plan += "\n• No active goals set yet. Tell me: *'Set a goal to save ₹50,000 for emergency'* and I will set it up for you!"

    plan += "\n\n💡 *Tip: You can tell me anytime: 'Add ₹500 for lunch' or 'Set ₹4,000 dining budget' to track in real-time.*"
    return plan


# ============================================================
# INTENT ANALYZER (HYBRID: REGEX FAST-PATH + GROQ LLM)
# ============================================================

def fast_regex_intent(text: str) -> dict[str, Any] | None:
    t = text.lower().strip()

    # 1. Expense: "add 500 food", "spent 1200 on petrol", "paid 300 for lunch"
    m_exp1 = re.match(r"^(?:add|spent|spend|paid|kharcha|expense)\s+₹?\s*([\d,]+(?:\.\d+)?)\s+(?:in|on|for|ka|ki|ke liye)?\s*(.+)$", t)
    if m_exp1:
        amt = float(m_exp1.group(1).replace(",", ""))
        cat = m_exp1.group(2).strip()
        if amt > 0 and cat:
            return {"action": "add_expense", "amount": amt, "category": cat, "description": f"{cat} expense"}

    m_exp2 = re.match(r"^(?:add|spent|spend|paid)\s+(.+?)\s+₹?\s*([\d,]+(?:\.\d+)?)$", t)
    if m_exp2:
        cat = m_exp2.group(1).strip()
        amt = float(m_exp2.group(2).replace(",", ""))
        if amt > 0 and cat:
            return {"action": "add_expense", "amount": amt, "category": cat, "description": f"{cat} expense"}

    # 2. Income: "salary 50000", "income 25000", "received 10000"
    m_inc = re.match(r"^(?:add\s+income|salary|received|income|credit)\s+₹?\s*([\d,]+(?:\.\d+)?)(?:\s+(?:from|as|in)?\s*(.*))?$", t)
    if m_inc:
        amt = float(m_inc.group(1).replace(",", ""))
        source = m_inc.group(2).strip() if m_inc.group(2) else "Salary"
        if amt > 0:
            return {"action": "add_income", "amount": amt, "category": "Salary", "description": source}

    # 3. Delete transaction: "delete last transaction", "delete last expense", "remove transaction"
    if re.search(r"\b(?:delete|remove|hata|undo)\s+(?:last|previous|pichla|latest)?\s*(?:transaction|expense|kharcha|record)?\b", t):
        return {"action": "delete_transaction"}

    # 4. Budget limit: "set budget 5000 food", "set limit 3000 shopping"
    m_bud = re.match(r"^(?:set\s+budget|set\s+limit|budget|limit)\s+₹?\s*([\d,]+(?:\.\d+)?)\s+(?:for|on|in)?\s*(.+)$", t)
    if m_bud:
        amt = float(m_bud.group(1).replace(",", ""))
        cat = m_bud.group(2).strip()
        if amt > 0 and cat:
            return {"action": "set_budget", "amount": amt, "category": cat}

    # 5. Financial plan request: "plan my money", "create a plan", "financial plan"
    if re.search(r"\b(?:financial plan|plan my (?:money|budget|finances|savings)|budget plan|batao plan)\b", t):
        return {"action": "plan"}

    return None


def analyze_intent_with_llm(user_message: str, user_name: str = "User") -> dict[str, Any]:
    # Check fast-path first
    fast = fast_regex_intent(user_message)
    if fast:
        return fast

    if not groq_client:
        return {"action": "chat"}

    prompt = f"""You are an intent parser for AmiVest Personal Finance AI.
Analyze the user's message and output a single JSON object.

Allowed actions:
- "add_expense": user spent money or wants to record an expense.
- "add_income": user received money, salary, deposit, or earnings.
- "delete_transaction": user wants to delete/remove/undo a transaction.
- "add_goal": user wants to create a savings target or financial goal.
- "delete_goal": user wants to delete or cancel a financial goal.
- "set_budget": user wants to set a monthly limit or cap on a spending category.
- "plan": user wants financial planning, advice, or budgeting breakdown.
- "chat": conversational question, balance inquiry, scheme question, general talk.

Schema:
{{
  "action": "add_expense" | "add_income" | "delete_transaction" | "add_goal" | "delete_goal" | "set_budget" | "plan" | "chat",
  "amount": number or null,
  "category": string or null,
  "description": string or null,
  "title": string or null,
  "target_amount": number or null,
  "deadline": string or null
}}

Respond ONLY with the JSON. No explanation.

User Message: "{user_message}"
JSON:"""

    for model in MODEL_PRIORITY:
        try:
            completion = groq_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=200,
            )
            raw = clean_ai_answer(completion.choices[0].message.content or "")
            parsed = json.loads(raw)
            if isinstance(parsed, dict) and "action" in parsed:
                return parsed
        except Exception:
            continue

    return {"action": "chat"}


# ============================================================
# CONVERSATIONAL GROQ CHAT WITH LIVE CONTEXT
# ============================================================

def execute_chat_with_context(user_id: int, user_message: str, history: list[dict], financial: dict[str, Any], user_name: str = "Friend") -> str:
    if not groq_client:
        return "I am currently disconnected from the AI engine. Please check GROQ_API_KEY."

    balance = float(financial.get("current_balance", 0))
    income = float(financial.get("total_income", 0))
    expenses = float(financial.get("total_expenses", 0))
    surplus = float(financial.get("monthly_surplus", 0))
    recent_tx = financial.get("transactions", [])[:5]
    goals = financial.get("goals", [])[:5]

    system_prompt = f"""You are AmiVest AI, an empathetic, smart, and proactive Indian personal finance co-pilot.
User's Name: {user_name}

LIVE DATABASE FINANCIAL CONTEXT:
• Current Balance: ₹{balance:,.2f}
• Recorded Total Income: ₹{income:,.2f}
• Recorded Total Expenses: ₹{expenses:,.2f}
• Monthly Surplus: ₹{surplus:,.2f}
• Recent Transactions: {json.dumps(recent_tx, default=str)}
• Active Goals: {json.dumps(goals, default=str)}

Guidelines:
1. Always reference their real numbers when answering about balances, spending, or savings.
2. Be warm, supportive, and practical. You can speak fluent English, Hindi, or Hinglish depending on how the user greets you.
3. Suggest concrete next steps (e.g. UPI budgeting, DICGC deposit guarantee, Mudra/PMEGP subsidies for business, low-cost SIPs).
4. Keep answers concise, clear, and structured with clean bullet points and emojis. Do not output raw markdown code blocks."""

    messages = [{"role": "system", "content": system_prompt}]

    for item in history[-MAX_HISTORY_ITEMS:]:
        role = item.get("role", "user")
        text = clean_text(item.get("message") or item.get("text") or "")
        if role in ("user", "assistant") and text:
            messages.append({"role": role, "content": text})

    messages.append({"role": "user", "content": user_message})

    for model in MODEL_PRIORITY:
        try:
            completion = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
                max_tokens=400,
            )
            raw = completion.choices[0].message.content or ""
            answer = clean_ai_answer(raw)
            if answer:
                return answer
        except Exception as e:
            logger.warning("Groq chat model %s failed: %s", model, e)
            continue

    return f"Namaste {user_name}! Aapka current recorded balance ₹{balance:,.2f} hai. Main aapke transactions, goals aur budgeting me madad kar sakta hoon."


# ============================================================
# MAIN CHAT ROUTE
# ============================================================

@chat.route("/chat", methods=["POST"])
def chat_endpoint():
    try:
        data = request.get_json(silent=True) or {}

        # 1. Determine user identity & clean user prompt
        raw_message = data.get("message") or data.get("prompt") or data.get("text") or ""
        # Strip any accidental frontend system context preamble
        clean_user_message = re.sub(r"\[SYSTEM CONTEXT:.*?\]", "", raw_message, flags=re.DOTALL).strip()
        clean_user_message = clean_text(clean_user_message)

        if not clean_user_message:
            return jsonify({"success": False, "error": "Message cannot be empty."}), 400

        user_id = get_current_user_id() or data.get("user_id") or 1
        user_name = clean_text(data.get("user_name") or session.get("user_name") or "Friend")
        history = data.get("conversation_history") or []

        # 2. Retrieve live financial data for the user
        financial = get_financial_context(user_id)

        # 3. Analyze user intent
        intent = analyze_intent_with_llm(clean_user_message, user_name)
        action_type = intent.get("action", "chat")

        action_result = None
        reply_message = ""

        # 4. Execute Backend Actions
        if action_type == "add_expense":
            amt = intent.get("amount") or 0.0
            cat = intent.get("category") or "General"
            desc = intent.get("description") or f"{cat} expense"

            if amt > 0:
                res = execute_add_expense(user_id, amt, cat, desc)
                if res.get("success"):
                    fresh = get_financial_context(user_id)
                    action_result = {
                        "type": "add_expense",
                        "data": res["transaction"],
                    }
                    reply_message = f"✅ Done! Recorded expense of **₹{amt:,.2f}** for **{cat}**.\n\n💰 *Your updated balance is **{money(fresh['current_balance'])}**.*"
                else:
                    reply_message = f"❌ Could not record expense: {res.get('error')}"
            else:
                reply_message = "Kitna amount kharch hua? Kripya amount specify karein (jaise: 'Spent ₹500 on dinner')."

        elif action_type == "add_income":
            amt = intent.get("amount") or 0.0
            cat = intent.get("category") or "Salary"
            desc = intent.get("description") or f"{cat} credit"

            if amt > 0:
                res = execute_add_income(user_id, amt, cat, desc)
                if res.get("success"):
                    fresh = get_financial_context(user_id)
                    action_result = {
                        "type": "add_income",
                        "data": res["transaction"],
                    }
                    reply_message = f"🎉 Great news! Credited **₹{amt:,.2f}** ({cat}) to your account.\n\n💰 *Your new balance is **{money(fresh['current_balance'])}**.*"
                else:
                    reply_message = f"❌ Could not add income: {res.get('error')}"
            else:
                reply_message = "Kitni income aayi? Kripya amount specify karein (jaise: 'Salary received ₹45,000')."

        elif action_type == "delete_transaction":
            res = execute_delete_transaction(user_id, tx_id=intent.get("id"), category_hint=intent.get("category") or "")
            if res.get("success"):
                fresh = get_financial_context(user_id)
                del_info = res["deleted"]
                action_result = {"type": "delete_transaction", "data": del_info}
                reply_message = f"🗑️ Removed transaction **#{del_info['id']}** (₹{del_info['amount']:,.2f} - {del_info['category']}).\n\n💰 *Current balance adjusted to **{money(fresh['current_balance'])}**.*"
            else:
                reply_message = f"⚠️ {res.get('error', 'Could not delete transaction.')}"

        elif action_type == "add_goal":
            title = intent.get("title") or intent.get("description") or "Savings Goal"
            t_amt = intent.get("target_amount") or intent.get("amount") or 0.0
            deadline = intent.get("deadline") or ""

            if t_amt > 0:
                res = execute_add_goal(user_id, title, t_amt, deadline)
                if res.get("success"):
                    action_result = {"type": "add_goal", "data": res["goal"]}
                    reply_message = f"🎯 Goal created! **{title}** with a target of **₹{t_amt:,.2f}**.\n\nAap is goal ko Goals page par track kar sakte hain!"
                else:
                    reply_message = f"❌ Could not create goal: {res.get('error')}"
            else:
                reply_message = "Kripya goal ka target amount batayein (jaise: 'Create goal for Laptop ₹60,000')."

        elif action_type == "delete_goal":
            res = execute_delete_goal(user_id, goal_id=intent.get("goal_id"), title_match=intent.get("title") or "")
            if res.get("success"):
                del_g = res["deleted_goal"]
                action_result = {"type": "delete_goal", "data": del_g}
                reply_message = f"🗑️ Deleted goal **'{del_g['title']}'**."
            else:
                reply_message = f"⚠️ {res.get('error', 'Could not delete goal.')}"

        elif action_type == "set_budget":
            cat = intent.get("category") or "General"
            lim = intent.get("amount") or 0.0
            if lim > 0:
                res = execute_set_budget(user_id, cat, lim)
                if res.get("success"):
                    action_result = {"type": "set_budget", "data": res["budget"]}
                    reply_message = f"📊 Monthly budget limit of **₹{lim:,.2f}** set for **{cat}**."
                else:
                    reply_message = f"❌ Could not set budget: {res.get('error')}"
            else:
                reply_message = "Kripya monthly limit batayein (jaise: 'Set food budget limit to ₹5,000')."

        elif action_type == "plan":
            reply_message = generate_personalized_plan(financial, user_name, clean_user_message)
            action_result = {"type": "plan", "data": {"plan_generated": True}}

        else:
            # General conversational or advisory question
            reply_message = execute_chat_with_context(user_id, clean_user_message, history, financial, user_name)

        # 5. Fetch fresh financial state for live UI synchronization
        updated_financial = get_financial_context(user_id)

        return jsonify({
            "success": True,
            "message": reply_message,
            "reply": reply_message,
            "response": reply_message,
            "answer": reply_message,
            "action_performed": action_result,
            "dashboard": {
                "current_balance": float(updated_financial["current_balance"]),
                "total_income": float(updated_financial["total_income"]),
                "total_expenses": float(updated_financial["total_expenses"]),
                "monthly_surplus": float(updated_financial["monthly_surplus"]),
                "savings_rate": updated_financial["savings_rate"],
            },
        }), 200

    except Exception as exc:
        logger.exception("Error in /chat endpoint")
        return jsonify({
            "success": False,
            "error": str(exc),
            "code": "chat_endpoint_error",
        }), 500


# ============================================================
# CHAT HISTORY ENDPOINT
# ============================================================

@chat.route("/chat/history", methods=["GET"])
def chat_history():
    user_id = get_current_user_id() or request.args.get("user_id", 1)
    # Chat history default greeting
    return jsonify({
        "success": True,
        "user_id": user_id,
        "messages": [],
    }), 200
