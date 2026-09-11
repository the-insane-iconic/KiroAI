import os
import re
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / ".en")

SQLITE_DB_PATH = BASE_DIR / "database" / "finsaathi.db"


class SQLiteCursorWrapper:
    def __init__(self, cursor, dictionary=True):
        self._cursor = cursor
        self.dictionary = dictionary

    @property
    def lastrowid(self):
        return self._cursor.lastrowid

    @property
    def rowcount(self):
        return self._cursor.rowcount

    def _convert_query(self, query):
        if not query:
            return query
        # Replace %s with ? for sqlite parameter substitution
        # Replace MySQL specific backticks or AUTO_INCREMENT if in DDL
        converted = re.sub(r'(?<!%)(?:%%)*%s', '?', query)
        converted = converted.replace('%%', '%')
        return converted

    def execute(self, query, params=None):
        sql = self._convert_query(query)
        try:
            if params is not None:
                if isinstance(params, (list, tuple)):
                    return self._cursor.execute(sql, params)
                elif isinstance(params, dict):
                    return self._cursor.execute(sql, params)
                else:
                    return self._cursor.execute(sql, (params,))
            return self._cursor.execute(sql)
        except Exception as e:
            # Handle some MySQL vs SQLite syntax differences gracefully
            raise e

    def executemany(self, query, seq_of_params):
        sql = self._convert_query(query)
        return self._cursor.executemany(sql, seq_of_params)

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        if self.dictionary:
            return dict(row)
        return row

    def fetchall(self):
        rows = self._cursor.fetchall()
        if self.dictionary:
            return [dict(r) for r in rows]
        return rows

    def fetchmany(self, size=None):
        rows = self._cursor.fetchmany(size)
        if self.dictionary:
            return [dict(r) for r in rows]
        return rows

    def close(self):
        try:
            self._cursor.close()
        except Exception:
            pass


class SQLiteConnectionWrapper:
    def __init__(self, raw_conn):
        self._conn = raw_conn
        self._conn.row_factory = sqlite3.Row

        # Register MySQL compatibility functions in SQLite
        try:
            from datetime import date as d_date, datetime as dt_datetime

            self._conn.create_function("CURDATE", 0, lambda: d_date.today().isoformat())
            self._conn.create_function("NOW", 0, lambda: dt_datetime.now().isoformat())

            def _sqlite_month(v):
                if not v:
                    return 0
                s = str(v).strip()
                if len(s) >= 7 and s[4] == "-":
                    try:
                        return int(s[5:7])
                    except:
                        pass
                return 0

            def _sqlite_year(v):
                if not v:
                    return 0
                s = str(v).strip()
                if len(s) >= 4:
                    try:
                        return int(s[:4])
                    except:
                        pass
                return 0

            def _sqlite_day(v):
                if not v:
                    return 0
                s = str(v).strip()
                if len(s) >= 10 and s[7] == "-":
                    try:
                        return int(s[8:10])
                    except:
                        pass
                return 0

            def _sqlite_date_format(v, fmt="%Y-%m"):
                if not v:
                    return ""
                s = str(v).strip()
                if "%Y-%m" in str(fmt):
                    return s[:7]
                elif "%Y" in str(fmt):
                    return s[:4]
                return s[:10]

            self._conn.create_function("MONTH", 1, _sqlite_month)
            self._conn.create_function("YEAR", 1, _sqlite_year)
            self._conn.create_function("DAY", 1, _sqlite_day)
            self._conn.create_function("DATE_FORMAT", 2, _sqlite_date_format)
        except Exception:
            pass

    def cursor(self, dictionary=True, **kwargs):
        cur = self._conn.cursor()
        return SQLiteCursorWrapper(cur, dictionary=dictionary)

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        return self._conn.close()

    def is_connected(self):
        return True


def init_sqlite_schema(conn):
    raw_conn = getattr(conn, "_conn", conn)
    raw_conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        amount REAL NOT NULL,
        description TEXT,
        transaction_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0.0,
        deadline TEXT,
        category TEXT DEFAULT 'General',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS spending_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT NOT NULL,
        monthly_limit REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS budget_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT NOT NULL,
        monthly_limit REAL NOT NULL,
        spent REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        scheme_name TEXT,
        amount REAL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loan_tracker (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        loan_name TEXT,
        amount REAL,
        emi REAL,
        interest_rate REAL,
        tenure_months INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rbi_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        rule_name TEXT,
        status TEXT,
        checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS investment_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        investment_goal TEXT,
        investment_horizon_years INTEGER DEFAULT 0,
        monthly_investable REAL DEFAULT 0.0,
        risk_tolerance TEXT DEFAULT 'Medium',
        has_emergency_fund INTEGER DEFAULT 0,
        has_existing_investments INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS loan_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        loan_type TEXT,
        requested_amount REAL DEFAULT 0.0,
        loan_purpose TEXT,
        employment_status TEXT,
        existing_emi REAL DEFAULT 0.0,
        duration_years INTEGER DEFAULT 0,
        credit_score TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)
    raw_conn.commit()


def get_connection():
    # 1. Try MySQL if configured
    mysql_host = os.getenv("DB_HOST", "127.0.0.1")
    mysql_port = int(os.getenv("DB_PORT", "3306"))
    mysql_user = os.getenv("DB_USER", "root")
    mysql_pwd = os.getenv("DB_PASSWORD", "")
    mysql_db = os.getenv("DB_NAME", "finsaathi")

    try:
        import mysql.connector
        conn = mysql.connector.connect(
            host=mysql_host,
            port=mysql_port,
            user=mysql_user,
            password=mysql_pwd,
            database=mysql_db,
            connection_timeout=2,
        )
        if conn.is_connected():
            return conn
    except Exception:
        pass

    # 2. Transparent SQLite Fallback
    try:
        SQLITE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        raw_conn = sqlite3.connect(str(SQLITE_DB_PATH), check_same_thread=False)
        init_sqlite_schema(raw_conn)
        return SQLiteConnectionWrapper(raw_conn)
    except Exception as e:
        print(f"❌ SQLite initialization failed: {e}")
        return None