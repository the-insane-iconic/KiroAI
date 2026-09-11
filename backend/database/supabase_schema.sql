-- ============================================================
-- BizzAI / AmiVest Supabase PostgreSQL Schema
-- Run this script in the Supabase Dashboard -> SQL Editor
-- ============================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. GOALS TABLE
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) DEFAULT 0.00,
    deadline DATE,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. SPENDING LIMITS TABLE
CREATE TABLE IF NOT EXISTS spending_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    monthly_limit NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. BUDGET LIMITS TABLE
CREATE TABLE IF NOT EXISTS budget_limits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    monthly_limit NUMERIC(12, 2) NOT NULL,
    spent NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. LOANS TABLE
CREATE TABLE IF NOT EXISTS loans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    scheme_name VARCHAR(255),
    amount NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. LOAN TRACKER TABLE
CREATE TABLE IF NOT EXISTS loan_tracker (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    loan_name VARCHAR(255),
    amount NUMERIC(12, 2),
    emi NUMERIC(12, 2),
    interest_rate NUMERIC(5, 2),
    tenure_months INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. RBI RECORDS TABLE
CREATE TABLE IF NOT EXISTS rbi_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    rule_name VARCHAR(255),
    status VARCHAR(50),
    checked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. INVESTMENT PROFILE TABLE
CREATE TABLE IF NOT EXISTS investment_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    investment_goal TEXT,
    investment_horizon_years INTEGER DEFAULT 0,
    monthly_investable NUMERIC(12, 2) DEFAULT 0.00,
    risk_tolerance VARCHAR(50) DEFAULT 'Medium',
    has_emergency_fund INTEGER DEFAULT 0,
    has_existing_investments INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. LOAN PROFILE TABLE
CREATE TABLE IF NOT EXISTS loan_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    loan_type VARCHAR(100),
    requested_amount NUMERIC(12, 2) DEFAULT 0.00,
    loan_purpose TEXT,
    employment_status VARCHAR(100),
    existing_emi NUMERIC(12, 2) DEFAULT 0.00,
    duration_years INTEGER DEFAULT 0,
    credit_score VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_spending_limits_user ON spending_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user ON budget_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_tracker_user ON loan_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_rbi_records_user ON rbi_records(user_id);
