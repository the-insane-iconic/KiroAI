import os
import re
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

SQLITE_DB_PATH = BASE_DIR / "database" / "kiroai.db"


class GenericCursorWrapper:
    def __init__(self, cursor, dictionary=True, is_postgres=False):
        self._cursor = cursor
        self.dictionary = dictionary
        self.is_postgres = is_postgres
        self._lastrowid = None

    @property
    def lastrowid(self):
        return getattr(self._cursor, "lastrowid", self._lastrowid)

    @property
    def rowcount(self):
        return getattr(self._cursor, "rowcount", -1)

    def _convert_query(self, query):
        if not query:
            return query
        if not self.is_postgres:
            # Replace %s with ? for sqlite
            converted = re.sub(r'(?<!%)(?:%%)*%s', '?', query)
            converted = converted.replace('%%', '%')
            return converted
        return query

    def execute(self, query, params=None):
        sql = self._convert_query(query)
        if self.is_postgres and "RETURNING id" not in sql.upper() and sql.strip().upper().startswith("INSERT INTO"):
            # If postgres insert, we can optionally append RETURNING id to capture lastrowid
            pass

        if params is not None:
            if isinstance(params, (list, tuple)):
                res = self._cursor.execute(sql, params)
            elif isinstance(params, dict):
                res = self._cursor.execute(sql, params)
            else:
                res = self._cursor.execute(sql, (params,))
        else:
            res = self._cursor.execute(sql)
        return res

    def executemany(self, query, seq_of_params):
        sql = self._convert_query(query)
        return self._cursor.executemany(sql, seq_of_params)

    def fetchone(self):
        row = self._cursor.fetchone()
        if row is None:
            return None
        if self.dictionary:
            if isinstance(row, dict):
                return row
            if hasattr(row, "keys"):
                return dict(row)
            if hasattr(self._cursor, "description") and self._cursor.description:
                cols = [d[0] for d in self._cursor.description]
                return dict(zip(cols, row))
        return row

    def fetchall(self):
        rows = self._cursor.fetchall()
        if not rows:
            return []
        if self.dictionary:
            if isinstance(rows[0], dict):
                return rows
            if hasattr(rows[0], "keys"):
                return [dict(r) for r in rows]
            if hasattr(self._cursor, "description") and self._cursor.description:
                cols = [d[0] for d in self._cursor.description]
                return [dict(zip(cols, r)) for r in rows]
        return rows

    def fetchmany(self, size=None):
        rows = self._cursor.fetchmany(size)
        if not rows:
            return []
        if self.dictionary:
            if isinstance(rows[0], dict):
                return rows
            if hasattr(rows[0], "keys"):
                return [dict(r) for r in rows]
            if hasattr(self._cursor, "description") and self._cursor.description:
                cols = [d[0] for d in self._cursor.description]
                return [dict(zip(cols, r)) for r in rows]
        return rows

    def close(self):
        try:
            self._cursor.close()
        except Exception:
            pass


class GenericConnectionWrapper:
    def __init__(self, raw_conn, is_postgres=False):
        self._conn = raw_conn
        self.is_postgres = is_postgres
        if not is_postgres and hasattr(self._conn, "row_factory"):
            self._conn.row_factory = sqlite3.Row

    def cursor(self, dictionary=True, **kwargs):
        if self.is_postgres:
            try:
                import psycopg2.extras
                cur = self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor if dictionary else None)
                return GenericCursorWrapper(cur, dictionary=dictionary, is_postgres=True)
            except Exception:
                cur = self._conn.cursor()
                return GenericCursorWrapper(cur, dictionary=dictionary, is_postgres=True)

        cur = self._conn.cursor()
        return GenericCursorWrapper(cur, dictionary=dictionary, is_postgres=False)

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
    # 1. Try Supabase / PostgreSQL via DATABASE_URL if configured
    db_url = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
    if db_url:
        try:
            import psycopg2
            conn = psycopg2.connect(db_url)
            return GenericConnectionWrapper(conn, is_postgres=True)
        except Exception as e:
            print(f"⚠️ PostgreSQL connection via DATABASE_URL failed: {e}")

    # 2. Try MySQL if configured
    mysql_host = os.getenv("DB_HOST", "127.0.0.1")
    mysql_port = int(os.getenv("DB_PORT", "3306"))
    mysql_user = os.getenv("DB_USER", "root")
    mysql_pwd = os.getenv("DB_PASSWORD", "")
    mysql_db = os.getenv("DB_NAME", "kiroai")

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

    # 3. Transparent SQLite Fallback (creates on-demand if no remote DB yet)
    try:
        SQLITE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        raw_conn = sqlite3.connect(str(SQLITE_DB_PATH), check_same_thread=False)
        init_sqlite_schema(raw_conn)
        return GenericConnectionWrapper(raw_conn, is_postgres=False)
    except Exception as e:
        print(f"❌ SQLite fallback initialization failed: {e}")
        return None