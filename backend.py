"""
P2P Exchange — Telegram Mini App Backend
Единый файл: FastAPI + aiogram 3 + SQLite + admin broadcast

Запуск:
  pip install aiogram fastapi uvicorn aiosqlite python-dotenv pydantic
  BOT_TOKEN=... ADMIN_IDS=123,456 WEBAPP_URL=https://... python backend.py
"""

import os
import json
import html
import hmac
import hashlib
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import parse_qs
from contextlib import asynccontextmanager

import aiosqlite
from dotenv import load_dotenv
from pydantic import BaseModel, field_validator

from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from aiogram import Bot, Dispatcher, Router, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, URLInputFile
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://blnance.click")
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip()]
DATABASE_PATH = os.getenv("DATABASE_PATH", "p2p_exchanger.db")
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
WEBHOOK_PATH = os.getenv("WEBHOOK_PATH", "/webhook")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://blnance.click")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "")
LOG_CHANNEL_ID = int(os.getenv("LOG_CHANNEL_ID", "0"))

WELCOME_PHOTO_URL = "https://i.postimg.cc/pV9xPWd4/novyj-i-ulucsennyj.jpg"

if WEBHOOK_URL and not WEBHOOK_SECRET:
    raise SystemExit(
        "FATAL: WEBHOOK_SECRET must be set when WEBHOOK_URL is configured.\n"
        "Without it the webhook endpoint accepts forged updates and anyone can\n"
        "run admin bot commands. Generate one and add it to .env:\n"
        "  python3 -c 'import secrets; print(secrets.token_hex(32))'"
    )

MAX_DEAL_AMOUNT = float(os.getenv("MAX_DEAL_AMOUNT", "1000000000"))

CRYPTO_CURRENCIES = ["BTC", "ETH", "USDT", "GRAM", "STARS"]
FIAT_CURRENCIES = ["USD", "EUR", "RUB", "UAH", "MDL", "TRY", "CNY", "GBP"]
ALL_CURRENCIES = CRYPTO_CURRENCIES + FIAT_CURRENCIES

# ═══════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════

_db: Optional[aiosqlite.Connection] = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        _db = await aiosqlite.connect(DATABASE_PATH)
        _db.row_factory = aiosqlite.Row
        await _db.execute("PRAGMA journal_mode=WAL")
        await _db.execute("PRAGMA foreign_keys=ON")
    return _db


async def init_db():
    db = await get_db()
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            avatar_url TEXT,
            language TEXT DEFAULT 'en',
            is_admin BOOLEAN DEFAULT FALSE,
            status TEXT DEFAULT 'Beginner',
            uid INTEGER DEFAULT 0,
            total_deals INTEGER DEFAULT 0,
            successful_deals INTEGER DEFAULT 0,
            activity_pct INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            currency TEXT NOT NULL,
            balance REAL DEFAULT 0.0,
            frozen REAL DEFAULT 0.0,
            UNIQUE(user_id, currency)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            side TEXT NOT NULL,
            crypto_currency TEXT NOT NULL,
            fiat_currency TEXT NOT NULL,
            price REAL NOT NULL,
            amount REAL NOT NULL,
            min_limit REAL,
            max_limit REAL,
            payment_method TEXT,
            terms TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS deals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER REFERENCES orders(id),
            buyer_id INTEGER REFERENCES users(id),
            seller_id INTEGER REFERENCES users(id),
            crypto_currency TEXT NOT NULL,
            fiat_currency TEXT NOT NULL,
            price REAL NOT NULL,
            crypto_amount REAL NOT NULL,
            fiat_amount REAL NOT NULL,
            status TEXT DEFAULT 'awaiting_payment',
            admin_paid BOOLEAN DEFAULT FALSE,
            links TEXT,
            initiator_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            paid_at TIMESTAMP,
            completed_at TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deal_id INTEGER REFERENCES deals(id),
            sender_id INTEGER REFERENCES users(id),
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER REFERENCES users(id),
            message_text TEXT NOT NULL,
            total_users INTEGER DEFAULT 0,
            sent_count INTEGER DEFAULT 0,
            failed_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS saved_wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            wallet_type TEXT NOT NULL,
            address TEXT NOT NULL,
            UNIQUE(user_id, wallet_type)
        );
    """)
    await db.commit()
    await migrate_db(db)


async def migrate_db(db):
    """Добавляет колонки, появившиеся после первого релиза, в существующие БД."""
    expected = {
        "deals": {"links": "TEXT", "admin_paid": "BOOLEAN DEFAULT FALSE",
                  "initiator_id": "INTEGER"},
        "users": {
            "status": "TEXT DEFAULT 'Beginner'",
            "uid": "INTEGER DEFAULT 0",
            "total_deals": "INTEGER DEFAULT 0",
            "successful_deals": "INTEGER DEFAULT 0",
            "activity_pct": "INTEGER DEFAULT 0",
        },
    }
    for table, columns in expected.items():
        cur = await db.execute(f"PRAGMA table_info({table})")
        existing = {r["name"] for r in await cur.fetchall()}
        for name, decl in columns.items():
            if name not in existing:
                await db.execute(f"ALTER TABLE {table} ADD COLUMN {name} {decl}")
                logger.info(f"Migrated: {table}.{name} added")

    # Deals created before the 4-step escrow sit in 'pending', which no endpoint
    # and no frontend button matches — they would hang with nothing to click.
    cur = await db.execute("SELECT COUNT(*) AS c FROM deals WHERE status='pending'")
    row = await cur.fetchone()
    if row["c"]:
        await db.execute("UPDATE deals SET status='awaiting_payment' WHERE status='pending'")
        logger.info(f"Migrated: {row['c']} deals moved from 'pending' to 'awaiting_payment'")

    # Users predating the uid column got the column default of 0. create_user's
    # ON CONFLICT clause never rewrites uid, so without this they keep 0 forever
    # and no counterparty can look them up.
    cur = await db.execute("SELECT id, telegram_id FROM users WHERE uid IS NULL OR uid=0")
    stale = await cur.fetchall()
    if stale:
        for r in stale:
            await db.execute("UPDATE users SET uid=? WHERE id=?",
                             (generate_uid(r["telegram_id"]), r["id"]))
        logger.info(f"Migrated: assigned uid to {len(stale)} users")

    await db.commit()


async def close_db():
    global _db
    if _db:
        await _db.close()
        _db = None


# ═══════════════════════════════════════════
# DB MODELS (queries)
# ═══════════════════════════════════════════

def generate_uid(telegram_id: int) -> int:
    tid = abs(telegram_id)
    return ((tid * 2654435761) & 0xFFFFFFFF) % 90000000 + 10000000


async def create_user(telegram_id, username=None, first_name=None, language="en", avatar_url=None):
    db = await get_db()
    uid = generate_uid(telegram_id)
    await db.execute(
        """INSERT INTO users (telegram_id, username, first_name, language, avatar_url, uid)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(telegram_id) DO UPDATE SET
             username=excluded.username, first_name=excluded.first_name, avatar_url=excluded.avatar_url""",
        (telegram_id, username, first_name, language, avatar_url, uid))
    await db.commit()
    return await get_user_by_tg(telegram_id)


async def get_user_by_tg(telegram_id):
    db = await get_db()
    cur = await db.execute("SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
    row = await cur.fetchone()
    return dict(row) if row else None


async def get_user_by_id(uid):
    db = await get_db()
    cur = await db.execute("SELECT * FROM users WHERE id = ?", (uid,))
    row = await cur.fetchone()
    return dict(row) if row else None


async def update_user_language(uid, lang):
    db = await get_db()
    await db.execute("UPDATE users SET language = ? WHERE id = ?", (lang, uid))
    await db.commit()


async def get_all_users():
    db = await get_db()
    cur = await db.execute("SELECT * FROM users ORDER BY created_at DESC")
    return [dict(r) for r in await cur.fetchall()]


async def get_or_create_wallet(uid, currency):
    db = await get_db()
    cur = await db.execute("SELECT * FROM wallets WHERE user_id=? AND currency=?", (uid, currency))
    row = await cur.fetchone()
    if row:
        return dict(row)
    await db.execute("INSERT INTO wallets (user_id, currency) VALUES (?, ?)", (uid, currency))
    await db.commit()
    cur = await db.execute("SELECT * FROM wallets WHERE user_id=? AND currency=?", (uid, currency))
    return dict(await cur.fetchone())


async def get_all_balances(uid):
    result = []
    for c in ALL_CURRENCIES:
        w = await get_or_create_wallet(uid, c)
        result.append({"currency": c, "balance": w["balance"], "frozen": w["frozen"]})
    return result


async def get_balance(uid, currency):
    w = await get_or_create_wallet(uid, currency)
    return {"currency": currency, "balance": w["balance"], "frozen": w["frozen"]}


async def update_balance(uid, currency, amount):
    await get_or_create_wallet(uid, currency)
    db = await get_db()
    await db.execute("UPDATE wallets SET balance=balance+? WHERE user_id=? AND currency=?",
                     (amount, uid, currency))
    await db.commit()


# The sufficiency condition lives in the UPDATE itself, not only in the caller's
# preceding SELECT: between that read and this write a concurrent request can
# spend the same funds, and an unguarded UPDATE would take the balance negative.
async def freeze_balance(uid, currency, amount):
    await get_or_create_wallet(uid, currency)
    db = await get_db()
    cur = await db.execute(
        "UPDATE wallets SET balance=balance-?, frozen=frozen+? "
        "WHERE user_id=? AND currency=? AND balance>=?",
        (amount, amount, uid, currency, amount))
    await db.commit()
    if cur.rowcount == 0:
        raise HTTPException(400, "Insufficient balance")


async def unfreeze_balance(uid, currency, amount):
    db = await get_db()
    cur = await db.execute(
        "UPDATE wallets SET balance=balance+?, frozen=frozen-? "
        "WHERE user_id=? AND currency=? AND frozen>=?",
        (amount, amount, uid, currency, amount))
    await db.commit()
    if cur.rowcount == 0:
        raise HTTPException(400, "Insufficient frozen balance")


async def release_frozen(uid, currency, amount):
    db = await get_db()
    cur = await db.execute(
        "UPDATE wallets SET frozen=frozen-? WHERE user_id=? AND currency=? AND frozen>=?",
        (amount, uid, currency, amount))
    await db.commit()
    if cur.rowcount == 0:
        raise HTTPException(400, "Insufficient frozen balance")


async def db_create_order(uid, side, crypto, fiat, price, amount, min_l=None, max_l=None, payment=None, terms=None):
    db = await get_db()
    cur = await db.execute(
        """INSERT INTO orders (user_id, side, crypto_currency, fiat_currency, price, amount,
                               min_limit, max_limit, payment_method, terms) VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (uid, side, crypto, fiat, price, amount, min_l, max_l, payment, terms))
    await db.commit()
    return await db_get_order(cur.lastrowid)


async def db_get_order(oid):
    db = await get_db()
    cur = await db.execute(
        "SELECT o.*, u.username, u.first_name, u.avatar_url FROM orders o JOIN users u ON o.user_id=u.id WHERE o.id=?",
        (oid,))
    row = await cur.fetchone()
    return dict(row) if row else None


async def db_get_active_orders(side=None, crypto=None, fiat=None):
    db = await get_db()
    q = "SELECT o.*, u.username, u.first_name, u.avatar_url FROM orders o JOIN users u ON o.user_id=u.id WHERE o.status='active'"
    p = []
    if side:
        q += " AND o.side=?"
        p.append(side)
    if crypto:
        q += " AND o.crypto_currency=?"
        p.append(crypto)
    if fiat:
        q += " AND o.fiat_currency=?"
        p.append(fiat)
    q += " ORDER BY o.created_at DESC"
    cur = await db.execute(q, p)
    return [dict(r) for r in await cur.fetchall()]


async def db_get_user_orders(uid):
    db = await get_db()
    cur = await db.execute(
        "SELECT o.*, u.username, u.first_name FROM orders o JOIN users u ON o.user_id=u.id WHERE o.user_id=? ORDER BY o.created_at DESC",
        (uid,))
    return [dict(r) for r in await cur.fetchall()]


async def db_cancel_order(oid, uid):
    db = await get_db()
    cur = await db.execute("UPDATE orders SET status='cancelled' WHERE id=? AND user_id=? AND status='active'",
                           (oid, uid))
    await db.commit()
    return cur.rowcount > 0


async def db_create_deal(order_id, buyer_id, seller_id, crypto, fiat, price, c_amount, f_amount,
                         links=None, initiator_id=None, status="awaiting_payment"):
    db = await get_db()
    # Status is set explicitly: databases created before the 4-step escrow still
    # carry DEFAULT 'pending', and CREATE TABLE IF NOT EXISTS never rewrites it.
    cur = await db.execute(
        """INSERT INTO deals (order_id, buyer_id, seller_id, crypto_currency, fiat_currency,
                              price, crypto_amount, fiat_amount, links, initiator_id, status)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (order_id, buyer_id, seller_id, crypto, fiat, price, c_amount, f_amount, links,
         initiator_id, status))
    await db.commit()
    return await db_get_deal(cur.lastrowid)


async def db_get_deal(did):
    db = await get_db()
    cur = await db.execute("SELECT * FROM deals WHERE id=?", (did,))
    row = await cur.fetchone()
    return dict(row) if row else None


async def db_get_user_deals(uid):
    db = await get_db()
    cur = await db.execute("SELECT * FROM deals WHERE buyer_id=? OR seller_id=? ORDER BY created_at DESC",
                           (uid, uid))
    return [dict(r) for r in await cur.fetchall()]


async def db_update_deal_status(did, status, admin_paid=False):
    db = await get_db()
    now = datetime.now(timezone.utc).isoformat()
    extra, p = "", [status]
    if status == "paid":
        extra, p = ", paid_at=?", [status, now]
    elif status == "completed":
        extra, p = ", completed_at=?", [status, now]
    if admin_paid:
        extra += ", admin_paid=TRUE"
    p.append(did)
    await db.execute(f"UPDATE deals SET status=?{extra} WHERE id=?", p)
    await db.commit()


async def db_get_all_deals():
    db = await get_db()
    cur = await db.execute("SELECT * FROM deals ORDER BY created_at DESC")
    return [dict(r) for r in await cur.fetchall()]


async def db_create_message(deal_id, sender_id, text):
    db = await get_db()
    cur = await db.execute("INSERT INTO messages (deal_id, sender_id, text) VALUES (?,?,?)",
                           (deal_id, sender_id, text))
    await db.commit()
    c2 = await db.execute("SELECT * FROM messages WHERE id=?", (cur.lastrowid,))
    return dict(await c2.fetchone())


async def db_get_deal_messages(deal_id):
    db = await get_db()
    cur = await db.execute(
        "SELECT m.*, u.username, u.first_name FROM messages m JOIN users u ON m.sender_id=u.id WHERE m.deal_id=? ORDER BY m.created_at ASC",
        (deal_id,))
    return [dict(r) for r in await cur.fetchall()]


async def db_create_broadcast(admin_id, text, total):
    db = await get_db()
    cur = await db.execute("INSERT INTO broadcasts (admin_id, message_text, total_users) VALUES (?,?,?)",
                           (admin_id, text, total))
    await db.commit()
    c2 = await db.execute("SELECT * FROM broadcasts WHERE id=?", (cur.lastrowid,))
    return dict(await c2.fetchone())


async def db_update_broadcast(bid, sent, failed, status):
    db = await get_db()
    completed = datetime.now(timezone.utc).isoformat() if status in ("completed", "failed") else None
    await db.execute("UPDATE broadcasts SET sent_count=?, failed_count=?, status=?, completed_at=? WHERE id=?",
                     (sent, failed, status, completed, bid))
    await db.commit()


async def db_get_broadcasts():
    db = await get_db()
    cur = await db.execute("SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT 50")
    return [dict(r) for r in await cur.fetchall()]


# ═══════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════

# How long a signed initData payload stays usable. Telegram's scheme has no
# nonce, so the same payload replays freely inside this window — it is the only
# thing limiting a captured payload's usefulness. One hour covers a long
# session; the app re-issues initData whenever it is reopened, and an expiry
# surfaces as "reopen from the bot" rather than a silent failure.
INIT_DATA_MAX_AGE = int(os.getenv("INIT_DATA_MAX_AGE", "3600"))
# Logs why a signature was rejected (hashes only, never the bot token).
DEBUG_AUTH = os.getenv("DEBUG_AUTH", "") == "1"


def validate_init_data(init_data: str) -> dict:
    # keep_blank_values: Telegram signs empty params such as `start_param=`, so
    # dropping them changes the check string and every hash fails to match.
    parsed = parse_qs(init_data, keep_blank_values=True)
    check_hash = parsed.get("hash", [None])[0]
    if not check_hash:
        raise HTTPException(401, "Missing hash")

    auth_date_str = parsed.get("auth_date", [None])[0]
    if not auth_date_str:
        raise HTTPException(401, "Missing auth_date")
    try:
        auth_date = int(auth_date_str)
    except (ValueError, TypeError):
        raise HTTPException(401, "Invalid auth_date")
    now = int(datetime.now(timezone.utc).timestamp())
    age = now - auth_date
    if age > INIT_DATA_MAX_AGE:
        raise HTTPException(401, "Init data expired (replay attack protection)")
    # A future-dated auth_date would otherwise keep a negative age under the
    # limit indefinitely, turning the expiry into a no-op. Allow only enough
    # slack for ordinary clock drift.
    if age < -300:
        raise HTTPException(401, "Init data is dated in the future")

    pairs = []
    for key, values in sorted(parsed.items()):
        if key == "hash":
            continue
        # parse_qs already decoded these. Decoding again corrupts any literal
        # '%' in a name ("100%AF" -> unquote eats it as an escape).
        pairs.append(f"{key}={values[0]}")
    data_check_string = "\n".join(pairs)
    secret = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    computed = hmac.new(secret, data_check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed, check_hash):
        if DEBUG_AUTH:
            logger.warning(
                "initData hash mismatch: expected=%s received=%s keys=%s",
                computed, check_hash, sorted(k for k in parsed if k != "hash"))
        raise HTTPException(401, "Invalid init data")
    user_data = parsed.get("user", [None])[0]
    if not user_data:
        raise HTTPException(401, "No user data")
    try:
        tg_user = json.loads(user_data)
    except (ValueError, TypeError):
        # Signed but malformed: still a rejected credential, not a server fault.
        raise HTTPException(401, "Malformed user data")
    if not isinstance(tg_user, dict) or not isinstance(tg_user.get("id"), int):
        raise HTTPException(401, "Malformed user data")
    return tg_user


async def get_current_user(request: Request) -> dict:
    init_data = request.headers.get("X-Telegram-Init-Data", "")
    if not init_data:
        raise HTTPException(401, "Missing init data header")
    tg_user = validate_init_data(init_data)
    # The signature is already verified here, so an unknown id just means the
    # person opened the Mini App without sending /start first. Rejecting them
    # left a usable-looking app that failed on every action.
    user = await get_user_by_tg(tg_user["id"])
    if not user:
        lang = tg_user.get("language_code", "en")
        user = await create_user(
            tg_user["id"],
            tg_user.get("username"),
            tg_user.get("first_name"),
            lang if lang in ("en", "ru") else "en",
        )
    return user


# Per-user sliding windows. A valid initData is otherwise a licence to hammer
# any endpoint: spam deal invitations at arbitrary UIDs, or walk the 8-digit UID
# space to harvest names and usernames.
_rate_buckets: dict = {}


def rate_limit(user_id: int, bucket: str, limit: int, window: int):
    now = datetime.now(timezone.utc).timestamp()
    key = (user_id, bucket)
    hits = [t for t in _rate_buckets.get(key, ()) if now - t < window]
    if len(hits) >= limit:
        retry = int(window - (now - hits[0])) + 1
        raise HTTPException(429, f"Too many requests, retry in {retry}s",
                            headers={"Retry-After": str(retry)})
    hits.append(now)
    _rate_buckets[key] = hits
    # Drop buckets that have gone quiet so this cannot grow without bound.
    if len(_rate_buckets) > 10000:
        for k in [k for k, v in _rate_buckets.items() if not v or now - v[-1] > 3600]:
            _rate_buckets.pop(k, None)


async def is_admin_tg(telegram_id: int) -> bool:
    """Single source of truth for bot commands. ADMIN_IDS alone was not enough:
    it is rebuilt from the env var on every start, so anyone promoted through
    /ggz silently lost every bot command at the next restart while keeping
    admin rights in the API, which reads the database flag."""
    if telegram_id in ADMIN_IDS:
        return True
    user = await get_user_by_tg(telegram_id)
    return bool(user and user.get("is_admin"))


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if not user.get("is_admin"):
        raise HTTPException(403, "Admin access required")
    return user


# ═══════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════

class LanguageUpdate(BaseModel):
    language: str

class OrderCreate(BaseModel):
    side: str
    crypto_currency: str
    fiat_currency: str
    price: float
    amount: float
    min_limit: Optional[float] = None
    max_limit: Optional[float] = None
    payment_method: Optional[str] = None
    terms: Optional[str] = None

    @field_validator("side")
    @classmethod
    def validate_side(cls, v):
        if v not in ("buy", "sell"):
            raise ValueError("side must be 'buy' or 'sell'")
        return v

    @field_validator("price", "amount")
    @classmethod
    def validate_positive(cls, v):
        if v <= 0:
            raise ValueError("Value must be positive")
        return v

    @field_validator("crypto_currency")
    @classmethod
    def validate_crypto(cls, v):
        allowed = {"BTC", "ETH", "USDT", "GRAM", "TON", "STARS", "BNB", "SOL"}
        if v.upper() not in allowed:
            raise ValueError(f"Unsupported crypto: {v}")
        return v.upper()

class DealCreate(BaseModel):
    order_id: int
    crypto_amount: float

    @field_validator("crypto_amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

class MessageCreate(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def validate_text(cls, v):
        v = v.strip()
        if not v or len(v) > 4096:
            raise ValueError("Message must be 1-4096 characters")
        return v

class BroadcastMessage(BaseModel):
    message: str
    parse_mode: Optional[str] = "HTML"

    @field_validator("message")
    @classmethod
    def validate_message(cls, v):
        v = v.strip()
        if not v or len(v) > 4096:
            raise ValueError("Message must be 1-4096 characters")
        return v

    @field_validator("parse_mode")
    @classmethod
    def validate_parse_mode(cls, v):
        if v is not None and v not in ("HTML", "Markdown", "MarkdownV2"):
            raise ValueError("Unsupported parse mode")
        return v


# ═══════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════

api = APIRouter(prefix="/api")


@api.get("/user/me")
async def api_get_me(request: Request):
    return await get_current_user(request)


@api.put("/user/language")
async def api_update_language(request: Request, body: LanguageUpdate):
    user = await get_current_user(request)
    if body.language not in ("en", "ru"):
        raise HTTPException(400, "Unsupported language")
    await update_user_language(user["id"], body.language)
    return {"ok": True}


@api.get("/wallet/balances")
async def api_balances(request: Request):
    user = await get_current_user(request)
    return {"balances": await get_all_balances(user["id"])}


@api.get("/wallet/balance/{currency}")
async def api_balance(request: Request, currency: str):
    user = await get_current_user(request)
    return await get_balance(user["id"], currency.upper())


@api.get("/orders")
async def api_list_orders(request: Request, side: str = None, crypto: str = None, fiat: str = None):
    await get_current_user(request)
    return {"orders": await db_get_active_orders(side, crypto, fiat)}


@api.post("/orders")
async def api_create_order(request: Request, body: OrderCreate):
    user = await get_current_user(request)
    if body.side == "sell":
        bal = await get_balance(user["id"], body.crypto_currency)
        if bal["balance"] < body.amount:
            raise HTTPException(400, "Insufficient balance")
        await freeze_balance(user["id"], body.crypto_currency, body.amount)
    return await db_create_order(
        user["id"], body.side, body.crypto_currency, body.fiat_currency,
        body.price, body.amount, body.min_limit, body.max_limit,
        body.payment_method, body.terms)


@api.delete("/orders/{order_id}")
async def api_cancel_order(request: Request, order_id: int):
    user = await get_current_user(request)
    order = await db_get_order(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    if order["user_id"] != user["id"]:
        raise HTTPException(403, "Not your order")
    # Cancel first: unfreezing before this check credited the balance again on
    # every repeat call, even once the order was already cancelled.
    if not await db_cancel_order(order_id, user["id"]):
        raise HTTPException(400, "Cannot cancel")
    if order["side"] == "sell" and order["status"] == "active":
        await unfreeze_balance(user["id"], order["crypto_currency"], order["amount"])
    return {"ok": True}


@api.get("/orders/my")
async def api_my_orders(request: Request):
    user = await get_current_user(request)
    return {"orders": await db_get_user_orders(user["id"])}


@api.post("/deals")
async def api_create_deal(request: Request, body: DealCreate):
    user = await get_current_user(request)
    order = await db_get_order(body.order_id)
    if not order or order["status"] != "active":
        raise HTTPException(404, "Order not found or inactive")
    fiat_amount = body.crypto_amount * order["price"]
    if order["min_limit"] and fiat_amount < order["min_limit"]:
        raise HTTPException(400, "Below minimum limit")
    if order["max_limit"] and fiat_amount > order["max_limit"]:
        raise HTTPException(400, "Above maximum limit")
    if body.crypto_amount > order["amount"]:
        raise HTTPException(400, "Amount exceeds available")

    if order["side"] == "sell":
        buyer_id, seller_id = user["id"], order["user_id"]
    else:
        seller_id, buyer_id = user["id"], order["user_id"]

    # Checked before freezing: rejecting afterwards would strand the amount in
    # `frozen` with nothing left to unfreeze it.
    if buyer_id == seller_id:
        raise HTTPException(400, "Cannot trade with yourself")

    if order["side"] == "buy":
        bal = await get_balance(seller_id, order["crypto_currency"])
        if bal["balance"] < body.crypto_amount:
            raise HTTPException(400, "Seller insufficient balance")
        await freeze_balance(seller_id, order["crypto_currency"], body.crypto_amount)

    deal = await db_create_deal(body.order_id, buyer_id, seller_id,
                                order["crypto_currency"], order["fiat_currency"],
                                order["price"], body.crypto_amount, fiat_amount)
    buyer = await get_user_by_id(buyer_id)
    seller = await get_user_by_id(seller_id)
    await log_deal_created(deal, buyer, seller)
    return deal


class DirectDealCreate(BaseModel):
    participant_uid: int
    role: str
    currency: str
    amount: float
    links: Optional[list[str]] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("buy", "sell"):
            raise ValueError("role must be 'buy' or 'sell'")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v):
        allowed = {"BTC","ETH","USDT","GRAM","TON","STARS","BNB","SOL",
                   "RUB","USD","EUR","MDL","UAH"}
        v = (v or "").upper()
        if v not in allowed:
            raise ValueError(f"Unsupported currency: {v}")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        # Upper bound as well as lower: without one a deal can carry 1e308,
        # which renders as garbage and is never a real trade.
        if v > MAX_DEAL_AMOUNT or v != v or v in (float("inf"), float("-inf")):
            raise ValueError(f"Amount must not exceed {MAX_DEAL_AMOUNT:g}")
        return v

    @field_validator("links")
    @classmethod
    def validate_links(cls, v):
        # Presence is not required: every tradable asset here is fungible, so
        # most deals have nothing to link to. Format is enforced regardless,
        # since the client check is a convenience and not a control.
        if not v:
            return v
        if len(v) > 10:
            raise ValueError("Too many links")
        cleaned = []
        for link in v:
            link = link.strip()
            if not link:
                continue
            if len(link) > 512 or not link.startswith(("http://", "https://")):
                raise ValueError("Links must be valid http(s) URLs")
            # Links are stored newline-joined, so an embedded newline would
            # split one entry into several and walk past the ten-link cap.
            if any(ch in link for ch in "\n\r\t"):
                raise ValueError("Links must not contain line breaks")
            cleaned.append(link)
        return cleaned or None


@api.post("/deals/direct")
async def api_create_direct_deal(request: Request, body: DirectDealCreate):
    """Прямая P2P-сделка между двумя пользователями (без ордера).
    Эскроу процедурный — средства не замораживаются, стороны проходят 4 шага."""
    user = await get_current_user(request)
    # Each one sends the counterparty a Telegram message, so this is the spam path.
    rate_limit(user["id"], "deal_create", limit=10, window=600)
    participant = await get_user_by_uid_val(body.participant_uid)
    if not participant:
        raise HTTPException(404, "Participant not found")
    if participant["id"] == user["id"]:
        raise HTTPException(400, "Cannot trade with yourself")
    if body.role == "buy":
        buyer_id, seller_id = user["id"], participant["id"]
    else:
        buyer_id, seller_id = participant["id"], user["id"]
    links = "\n".join(body.links) if body.links else None
    # Starts unaccepted: the initiator picks the counterparty by UID and sets the
    # terms alone, so the other side has to agree before the escrow can run.
    deal = await db_create_deal(
        None, buyer_id, seller_id, body.currency, body.currency,
        body.amount, body.amount, body.amount, links,
        initiator_id=user["id"], status="awaiting_acceptance")
    buyer = await get_user_by_id(buyer_id)
    seller = await get_user_by_id(seller_id)
    await log_deal_created(deal, buyer, seller)
    await notify_deal_invitation(deal, participant, user)
    await notify_deal_created_initiator(deal, participant, user)
    return deal


@api.put("/deals/{deal_id}/accept")
async def api_accept_deal(request: Request, deal_id: int):
    """Counterparty agrees to the terms; only then does the escrow start."""
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if user["id"] not in (deal["buyer_id"], deal["seller_id"]):
        raise HTTPException(403, "Not a participant")
    if user["id"] == deal["initiator_id"]:
        raise HTTPException(403, "The initiator cannot accept their own deal")
    if deal["status"] != "awaiting_acceptance":
        raise HTTPException(400, "Deal is not awaiting acceptance")
    await db_update_deal_status(deal_id, "awaiting_payment")
    await notify_deal_status(await db_get_deal(deal_id), user["id"], "accepted")
    return {"ok": True, "status": "awaiting_payment"}


@api.get("/deals/{deal_id}")
async def api_get_deal(request: Request, deal_id: int):
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404, "Deal not found")
    if deal["buyer_id"] != user["id"] and deal["seller_id"] != user["id"] and not user.get("is_admin"):
        raise HTTPException(403, "Access denied")
    # The acceptance screen has to show who is proposing the deal. Only the
    # fields it displays go out — telegram_id and the rest of the row stay in.
    if deal.get("initiator_id"):
        initiator = await get_user_by_id(deal["initiator_id"])
        if initiator:
            deal["initiator"] = {
                "first_name": initiator.get("first_name") or "",
                "username": initiator.get("username") or "",
                "uid": initiator.get("uid") or 0,
                "status": initiator.get("status") or "Beginner",
            }
    return deal


@api.put("/deals/{deal_id}/pay")
async def api_mark_paid(request: Request, deal_id: int):
    """Шаг 1 → 2: покупатель отметил оплату."""
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["buyer_id"] != user["id"]:
        raise HTTPException(403, "Only buyer can mark as paid")
    if deal["status"] != "awaiting_payment":
        raise HTTPException(400, "Deal is not awaiting payment")
    await db_update_deal_status(deal_id, "paid")
    updated_deal = await db_get_deal(deal_id)
    await log_deal_payment(updated_deal, user)
    await notify_deal_status(updated_deal, user["id"], "paid")
    return {"ok": True, "status": "paid"}


@api.put("/deals/{deal_id}/confirm-payment")
async def api_confirm_payment(request: Request, deal_id: int):
    """Шаг 2 → 3: продавец подтвердил получение оплаты."""
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["seller_id"] != user["id"]:
        raise HTTPException(403, "Only seller can confirm payment")
    if deal["status"] != "paid":
        raise HTTPException(400, "Deal is not marked as paid")
    await db_update_deal_status(deal_id, "payment_confirmed")
    await notify_deal_status(await db_get_deal(deal_id), user["id"], "payment_confirmed")
    return {"ok": True, "status": "payment_confirmed"}


@api.put("/deals/{deal_id}/ship")
async def api_ship_goods(request: Request, deal_id: int):
    """Шаг 3 → 4: продавец отправил товар/актив."""
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["seller_id"] != user["id"]:
        raise HTTPException(403, "Only seller can mark as sent")
    if deal["status"] != "payment_confirmed":
        raise HTTPException(400, "Payment is not confirmed yet")
    await db_update_deal_status(deal_id, "goods_sent")
    await notify_deal_status(await db_get_deal(deal_id), user["id"], "goods_sent")
    return {"ok": True, "status": "goods_sent"}


@api.put("/deals/{deal_id}/confirm")
async def api_confirm_deal(request: Request, deal_id: int):
    """Шаг 4 → завершение: покупатель подтвердил получение, средства released."""
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["buyer_id"] != user["id"]:
        raise HTTPException(403, "Only buyer can confirm receipt")
    if deal["status"] != "goods_sent":
        raise HTTPException(400, "Goods are not marked as sent")
    if deal["order_id"] is not None:
        await release_frozen(deal["seller_id"], deal["crypto_currency"], deal["crypto_amount"])
        await update_balance(deal["buyer_id"], deal["crypto_currency"], deal["crypto_amount"])
    await db_update_deal_status(deal_id, "completed")
    updated_deal = await db_get_deal(deal_id)
    await log_deal_completed(updated_deal, user)
    await notify_deal_status(updated_deal, user["id"], "completed")
    return {"ok": True, "status": "completed"}


@api.put("/deals/{deal_id}/cancel")
async def api_cancel_deal(request: Request, deal_id: int):
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["buyer_id"] != user["id"] and deal["seller_id"] != user["id"]:
        raise HTTPException(403)
    # Also covers declining an invitation: either side may walk away while the
    # deal is still unaccepted.
    if deal["status"] not in ("awaiting_acceptance", "awaiting_payment"):
        raise HTTPException(400, "Cannot cancel at this stage")
    if deal["order_id"] is not None:
        await unfreeze_balance(deal["seller_id"], deal["crypto_currency"], deal["crypto_amount"])
    await db_update_deal_status(deal_id, "cancelled")
    # Walking away before acceptance is a refusal of the terms, not the same
    # thing as calling off a deal both sides had already agreed to.
    was_unaccepted = deal["status"] == "awaiting_acceptance"
    event = "declined" if was_unaccepted and user["id"] != deal["initiator_id"] else "cancelled"
    await notify_deal_status(await db_get_deal(deal_id), user["id"], event)
    return {"ok": True, "status": "cancelled"}


@api.get("/users/by-uid/{uid}")
async def api_user_by_uid(request: Request, uid: int):
    user = await get_current_user(request)
    rate_limit(user["id"], "uid_lookup", limit=30, window=60)
    target = await get_user_by_uid_val(uid)
    if not target:
        raise HTTPException(404, "User not found")
    return {
        "id": target["id"],
        "uid": target["uid"],
        "username": target.get("username", ""),
        "first_name": target.get("first_name", ""),
        "status": target.get("status", "Beginner"),
    }


class WalletSave(BaseModel):
    wallet_type: str
    address: str

    @field_validator("wallet_type")
    @classmethod
    def validate_type(cls, v):
        allowed = {"TON", "BTC", "ETH", "BNB", "SOL"}
        if v.upper() not in allowed:
            raise ValueError(f"Unsupported wallet type: {v}")
        return v.upper()

    @field_validator("address")
    @classmethod
    def validate_address(cls, v):
        v = v.strip()
        if not v or len(v) > 256:
            raise ValueError("Invalid address")
        return v


@api.get("/wallets")
async def api_get_wallets(request: Request):
    user = await get_current_user(request)
    db = await get_db()
    cur = await db.execute(
        "SELECT wallet_type, address FROM saved_wallets WHERE user_id=?", (user["id"],))
    rows = await cur.fetchall()
    return {r["wallet_type"]: r["address"] for r in rows}


@api.post("/wallets")
async def api_save_wallet(request: Request, body: WalletSave):
    user = await get_current_user(request)
    db = await get_db()
    await db.execute(
        "INSERT INTO saved_wallets (user_id, wallet_type, address) VALUES (?,?,?) "
        "ON CONFLICT(user_id, wallet_type) DO UPDATE SET address=excluded.address",
        (user["id"], body.wallet_type, body.address))
    await db.commit()
    return {"ok": True}


@api.delete("/wallets/{wallet_type}")
async def api_delete_wallet(request: Request, wallet_type: str):
    user = await get_current_user(request)
    wt = wallet_type.upper()
    db = await get_db()
    await db.execute("DELETE FROM saved_wallets WHERE user_id=? AND wallet_type=?", (user["id"], wt))
    await db.commit()
    return {"ok": True}


@api.get("/deals/my/list")
async def api_my_deals(request: Request):
    user = await get_current_user(request)
    return {"deals": await db_get_user_deals(user["id"])}


@api.get("/deals/{deal_id}/messages")
async def api_get_messages(request: Request, deal_id: int):
    user = await get_current_user(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["buyer_id"] != user["id"] and deal["seller_id"] != user["id"] and not user.get("is_admin"):
        raise HTTPException(403)
    return {"messages": await db_get_deal_messages(deal_id)}


@api.post("/deals/{deal_id}/messages")
async def api_send_message(request: Request, deal_id: int, body: MessageCreate):
    user = await get_current_user(request)
    rate_limit(user["id"], "chat", limit=30, window=60)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["buyer_id"] != user["id"] and deal["seller_id"] != user["id"]:
        raise HTTPException(403)
    if not body.text.strip():
        raise HTTPException(400, "Empty message")
    return await db_create_message(deal_id, user["id"], body.text.strip())


# ─── Admin Routes ───

admin_api = APIRouter(prefix="/api/admin")


@admin_api.get("/deals")
async def adm_all_deals(request: Request):
    await require_admin(request)
    return {"deals": await db_get_all_deals()}


@admin_api.put("/deals/{deal_id}/pay")
async def adm_silent_pay(request: Request, deal_id: int):
    """Тихая оплата — НЕ отправляет уведомления участникам!"""
    await require_admin(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["status"] != "awaiting_payment":
        raise HTTPException(400, "Deal is not awaiting payment")
    await db_update_deal_status(deal_id, "paid", admin_paid=True)
    return {"ok": True, "status": "paid", "admin_paid": True}


@admin_api.put("/deals/{deal_id}/complete")
async def adm_force_complete(request: Request, deal_id: int):
    await require_admin(request)
    deal = await db_get_deal(deal_id)
    if not deal:
        raise HTTPException(404)
    if deal["status"] not in ("awaiting_payment", "paid", "payment_confirmed", "goods_sent"):
        raise HTTPException(400, "Cannot complete this deal")
    if deal["order_id"] is not None:
        await release_frozen(deal["seller_id"], deal["crypto_currency"], deal["crypto_amount"])
        await update_balance(deal["buyer_id"], deal["crypto_currency"], deal["crypto_amount"])
    await db_update_deal_status(deal_id, "completed")
    return {"ok": True, "status": "completed"}


@admin_api.get("/users")
async def adm_list_users(request: Request):
    await require_admin(request)
    users = await get_all_users()
    return {"users": users, "total": len(users)}


@admin_api.post("/broadcast")
async def adm_broadcast(request: Request, body: BroadcastMessage):
    """Рассылка сообщения всем пользователям через бота"""
    admin_user = await require_admin(request)
    if not body.message.strip():
        raise HTTPException(400, "Empty message")
    users = await get_all_users()
    if not users:
        return {"ok": True, "sent": 0, "failed": 0, "total": 0}
    broadcast = await db_create_broadcast(admin_user["id"], body.message, len(users))
    sent, failed = 0, 0
    for u in users:
        try:
            await bot.send_message(chat_id=u["telegram_id"], text=body.message, parse_mode=body.parse_mode)
            sent += 1
        except Exception:
            failed += 1
        await asyncio.sleep(0.05)
    await db_update_broadcast(broadcast["id"], sent, failed, "completed")
    return {"ok": True, "broadcast_id": broadcast["id"], "total": len(users), "sent": sent, "failed": failed}


@admin_api.get("/broadcasts")
async def adm_broadcast_history(request: Request):
    await require_admin(request)
    return {"broadcasts": await db_get_broadcasts()}


# ═══════════════════════════════════════════
class BalanceTopUp(BaseModel):
    uid: int
    currency: str
    amount: float

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v):
        v = (v or "").upper()
        if v not in ALL_CURRENCIES:
            raise ValueError(f"Unsupported currency: {v}")
        return v

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0 or v != v or v in (float("inf"), float("-inf")):
            raise ValueError("Amount must be positive")
        if v > MAX_DEAL_AMOUNT:
            raise ValueError(f"Amount must not exceed {MAX_DEAL_AMOUNT:g}")
        return v


@admin_api.post("/balance/topup")
async def adm_balance_topup(request: Request, body: BalanceTopUp):
    """Админ пополняет внутренний баланс пользователя по UID."""
    admin_user = await require_admin(request)
    target = await get_user_by_uid_val(body.uid)
    if not target:
        raise HTTPException(404, "User not found")
    await update_balance(target["id"], body.currency, body.amount)
    bal = await get_balance(target["id"], body.currency)
    await log_balance_topup(admin_user, target, body.currency, body.amount, bal["balance"])
    await notify_balance_topup(target, body.currency, body.amount, bal["balance"])
    return {"ok": True, "uid": body.uid, "currency": body.currency,
            "added": body.amount, "balance": bal["balance"]}


# TELEGRAM BOT (aiogram 3)
# ═══════════════════════════════════════════

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()
bot_router = Router()


@bot_router.message(Command("start"))
async def cmd_start(message: types.Message):
    tg = message.from_user
    avatar_url = None
    try:
        photos = await bot.get_user_profile_photos(tg.id, limit=1)
        if photos.total_count > 0:
            file = await bot.get_file(photos.photos[0][-1].file_id)
            avatar_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file.file_path}"
    except Exception:
        pass
    await create_user(tg.id, tg.username, tg.first_name, tg.language_code or "en", avatar_url)
    if tg.id in ADMIN_IDS:
        db = await get_db()
        await db.execute("UPDATE users SET is_admin=TRUE WHERE telegram_id=?", (tg.id,))
        await db.commit()
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🇷🇺 Русский", callback_data="lang_ru"),
            InlineKeyboardButton(text="🇬🇧 English", callback_data="lang_en"),
        ]
    ])
    await message.answer(
        "🌐 <b>Выберите язык / Choose language</b>",
        reply_markup=kb,
    )


async def _send_welcome(target, tg, lang: str):
    if lang == "ru":
        caption = (
            f"👋 <b>Добро пожаловать, {tg.first_name}!</b>\n\n"
            "<blockquote>P2P Exchange — безопасная платформа для обмена "
            "криптовалют напрямую между пользователями с эскроу-защитой</blockquote>\n\n"
            "💰 <b>Доступные активы:</b>\n"
            "├ Bitcoin (BTC)\n"
            "├ Ethereum (ETH)\n"
            "├ Tether (USDT)\n"
            "├ Gram / TON\n"
            "├ BNB\n"
            "├ Solana (SOL)\n"
            "└ Telegram Stars ⭐\n\n"
            "🛡 <b>Безопасность:</b>\n"
            "<blockquote>Каждая сделка защищена 4-этапной эскроу-системой. "
            "Средства блокируются до подтверждения обеими сторонами.</blockquote>"
        )
    else:
        caption = (
            f"👋 <b>Welcome, {tg.first_name}!</b>\n\n"
            "<blockquote>P2P Exchange is a secure platform for direct crypto trading "
            "between users, protected by escrow.</blockquote>\n\n"
            "💰 <b>Available assets:</b>\n"
            "├ Bitcoin (BTC)\n"
            "├ Ethereum (ETH)\n"
            "├ Tether (USDT)\n"
            "├ Gram / TON\n"
            "├ BNB\n"
            "├ Solana (SOL)\n"
            "└ Telegram Stars ⭐\n\n"
            "🛡 <b>Security:</b>\n"
            "<blockquote>Every deal is protected by a 4-step escrow. "
            "Funds stay locked until both sides confirm.</blockquote>"
        )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Market", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    try:
        photo = URLInputFile(WELCOME_PHOTO_URL)
        await target.answer_photo(photo=photo, caption=caption, reply_markup=kb)
    except Exception:
        await target.answer(caption, reply_markup=kb)


@bot_router.callback_query(F.data.in_({"lang_ru", "lang_en"}))
async def cb_lang(cq: types.CallbackQuery):
    lang = "ru" if cq.data == "lang_ru" else "en"
    try:
        db = await get_db()
        await db.execute("UPDATE users SET language=? WHERE telegram_id=?", (lang, cq.from_user.id))
        await db.commit()
    except Exception:
        pass
    try:
        await cq.message.delete()
    except Exception:
        pass
    await _send_welcome(cq.message, cq.from_user, lang)
    await cq.answer()



@bot_router.message(Command("admin"))
async def cmd_admin(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        await message.answer("⛔ У вас нет доступа к админ-панели.")
        return
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📊 Все сделки", callback_data="adm_deals")],
        [InlineKeyboardButton(text="👥 Все пользователи", callback_data="adm_users")],
        [InlineKeyboardButton(text="📢 Рассылка", callback_data="adm_bc")],
        [InlineKeyboardButton(text="📋 История рассылок", callback_data="adm_bc_hist")],
    ])
    await message.answer("🔧 <b>Админ-панель</b>\n\nВыберите действие:", reply_markup=kb)


@bot_router.callback_query(F.data == "adm_deals")
async def cb_adm_deals(cb: types.CallbackQuery):
    if not await is_admin_tg(cb.from_user.id):
        return await cb.answer("Нет доступа", show_alert=True)
    deals = await db_get_all_deals()
    if not deals:
        await cb.message.answer("Сделок пока нет.")
        return await cb.answer()
    txt = "📊 <b>Последние сделки:</b>\n\n"
    for d in deals[:10]:
        txt += f"#{d['id']} | {d['fiat_amount']} {d['fiat_currency']} | {d['status']}\n"
    await cb.message.answer(txt)
    await cb.answer()


@bot_router.callback_query(F.data.startswith("adm_users"))
async def cb_adm_users(cb: types.CallbackQuery):
    if not await is_admin_tg(cb.from_user.id):
        return await cb.answer("Нет доступа", show_alert=True)

    parts = cb.data.split(":")
    page = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0

    PAGE_SIZE = 10
    users = await get_all_users()
    total = len(users)
    pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
    page = max(0, min(page, pages - 1))

    start = page * PAGE_SIZE
    chunk = users[start:start + PAGE_SIZE]

    txt = f"👥 <b>Пользователи ({total}):</b>\n\n"
    for u in chunk:
        badge = " 👑" if u.get("is_admin") else ""
        txt += f"• {u.get('first_name', 'N/A')} (@{u.get('username', 'N/A')}) — ID: {u['telegram_id']}{badge}\n"
    txt += f"\n<i>Страница {page+1}/{pages}</i>"

    nav = []
    if page > 0:
        nav.append(InlineKeyboardButton(text="◀️", callback_data=f"adm_users:{page-1}"))
    if page < pages - 1:
        nav.append(InlineKeyboardButton(text="▶️", callback_data=f"adm_users:{page+1}"))
    kb = InlineKeyboardMarkup(inline_keyboard=[nav]) if nav else None

    try:
        await cb.message.edit_text(txt, reply_markup=kb, parse_mode="HTML")
    except Exception:
        await cb.message.answer(txt, reply_markup=kb, parse_mode="HTML")
    await cb.answer()

    del users, chunk


@bot_router.callback_query(F.data == "adm_bc")
async def cb_adm_bc(cb: types.CallbackQuery):
    if not await is_admin_tg(cb.from_user.id):
        return await cb.answer("Нет доступа", show_alert=True)
    await cb.message.answer(
        "📢 <b>Рассылка</b>\n\nОтправьте текст сообщения для рассылки:\n"
        "<code>/broadcast Ваше сообщение</code>")
    await cb.answer()


@bot_router.callback_query(F.data == "adm_bc_hist")
async def cb_adm_bc_hist(cb: types.CallbackQuery):
    if not await is_admin_tg(cb.from_user.id):
        return await cb.answer("Нет доступа", show_alert=True)
    bcs = await db_get_broadcasts()
    if not bcs:
        await cb.message.answer("История рассылок пуста.")
        return await cb.answer()
    txt = "📋 <b>История рассылок:</b>\n\n"
    for b in bcs[:10]:
        txt += f"#{b['id']} | ✅ {b['sent_count']}/{b['total_users']} | ❌ {b['failed_count']} | {b['status']}\n"
    await cb.message.answer(txt)
    await cb.answer()


@bot_router.message(Command("broadcast"))
async def cmd_broadcast(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return await message.answer("⛔ У вас нет доступа.")
    text = message.text.replace("/broadcast", "", 1).strip()
    if not text:
        return await message.answer("❌ Укажите текст: <code>/broadcast Ваше сообщение</code>")
    users = await get_all_users()
    if not users:
        return await message.answer("❌ Нет пользователей для рассылки.")
    status_msg = await message.answer(f"📢 Начинаю рассылку для <b>{len(users)}</b> пользователей...")
    admin_user = await get_user_by_tg(message.from_user.id)
    bc = await db_create_broadcast(admin_user["id"], text, len(users))
    sent, failed = 0, 0
    for u in users:
        try:
            await bot.send_message(chat_id=u["telegram_id"], text=text, parse_mode=ParseMode.HTML)
            sent += 1
        except Exception:
            failed += 1
        await asyncio.sleep(0.05)
    await db_update_broadcast(bc["id"], sent, failed, "completed")
    await status_msg.edit_text(f"✅ <b>Рассылка завершена!</b>\n\n📨 Отправлено: {sent}/{len(users)}\n❌ Ошибок: {failed}")


async def send_log(text: str, reply_markup=None):
    if not LOG_CHANNEL_ID:
        return
    try:
        await bot.send_message(LOG_CHANNEL_ID, text, parse_mode=ParseMode.HTML, reply_markup=reply_markup)
    except Exception as e:
        logger.error(f"Failed to send log: {e}")


async def log_deal_created(deal, buyer, seller):
    text = (
        "📋 <b>Новая сделка создана</b>\n\n"
        f"🆔 Сделка: #{deal['id']}\n"
        f"👤 Покупатель: {buyer.get('first_name','')} (@{buyer.get('username','—')}) | UID: {buyer.get('uid',0)}\n"
        f"👤 Продавец: {seller.get('first_name','')} (@{seller.get('username','—')}) | UID: {seller.get('uid',0)}\n"
        f"💰 Сумма: {deal['fiat_amount']} {deal['fiat_currency']}\n"
        f"🏷 Статус покупателя: {buyer.get('status','Beginner')}\n"
        f"🏷 Статус продавца: {seller.get('status','Beginner')}\n"
        f"📅 {deal.get('created_at','')}"
    )
    await send_log(text)


def deal_web_app_url(deal_id: int) -> str:
    base = WEBAPP_URL.rstrip("/")
    return f"{base}/?deal={deal_id}"


def deal_role(deal, user_id) -> str:
    return "покупатель" if deal["buyer_id"] == user_id else "продавец"


def fmt_user(u) -> str:
    """Names come from Telegram and land inside HTML-parsed messages, so a '<'
    in one would break parsing and Telegram would reject the whole send."""
    name = html.escape(str(u.get("first_name") or "—"))
    username = html.escape(str(u.get("username") or "—"))
    return f"{name} (@{username}) | UID: {u.get('uid', 0)}"


def deal_button(deal_id, label="🔎 Открыть сделку"):
    # Deep-link straight at the deal. web_app buttons open the URL verbatim, so
    # the query survives; a bare WEBAPP_URL would drop the person on the home
    # screen to hunt for it themselves.
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=label, web_app=WebAppInfo(url=deal_web_app_url(deal_id)))]
    ])


async def send_deal_notice(user, deal, text, kb=None):
    """Delivery is best-effort: the person may never have pressed /start, and a
    failed message must not roll back the transition that triggered it."""
    if not user or not user.get("telegram_id"):
        return
    try:
        await bot.send_message(user["telegram_id"], text,
                               parse_mode=ParseMode.HTML, reply_markup=kb)
    except Exception as e:
        logger.warning(f"Could not notify user {user['id']} about deal {deal['id']}: {e}")


def deal_summary(deal) -> str:
    return f"💰 {deal['fiat_amount']} {deal['fiat_currency']}"


async def notify_deal_invitation(deal, participant, initiator):
    """Tells the counterparty a deal is waiting on them. Worded as an invitation:
    they have not agreed to anything yet and nothing proceeds until they do."""
    text = (
        "📨 <b>Вам предлагают сделку</b>\n\n"
        f"👤 От: {fmt_user(initiator)}\n"
        f"🎭 Ваша роль: <b>{deal_role(deal, participant['id'])}</b>\n"
        f"{deal_summary(deal)}\n\n"
        "<blockquote>Условия выставил инициатор. Сделка не начнётся, пока "
        "вы её не подтвердите — проверьте сумму и роль перед согласием.</blockquote>"
    )
    await send_deal_notice(participant, deal, text,
                           deal_button(deal["id"], "🔎 Открыть и подтвердить"))


async def notify_deal_created_initiator(deal, participant, initiator):
    """Mirror of the invitation for the person who created the deal, so they
    know it went out and what it is waiting on."""
    text = (
        "📤 <b>Сделка создана</b>\n\n"
        f"👤 Кому: {fmt_user(participant)}\n"
        f"🎭 Ваша роль: <b>{deal_role(deal, initiator['id'])}</b>\n"
        f"{deal_summary(deal)}\n\n"
        "<blockquote>Ожидает подтверждения второй стороной. Пока она не "
        "согласится с условиями, сделка не начнётся.</blockquote>"
    )
    await send_deal_notice(initiator, deal, text, deal_button(deal["id"]))


# For each transition: what the person who did it is told, what the other side
# is told, and whose move it is next. `turn` is the role that has to act, or
# None when the deal is over.
DEAL_EVENTS = {
    "accepted": {
        "icon": "🤝", "title": "Условия приняты",
        "actor": "Вы приняли условия сделки.",
        "other": "Вторая сторона приняла условия.",
        "turn": "buyer", "next": "перевести оплату",
    },
    "paid": {
        "icon": "💳", "title": "Оплата отправлена",
        "actor": "Вы отметили оплату как отправленную.",
        "other": "Покупатель отметил оплату как отправленную.",
        "turn": "seller", "next": "подтвердить получение оплаты",
    },
    "payment_confirmed": {
        "icon": "✅", "title": "Оплата подтверждена",
        "actor": "Вы подтвердили получение оплаты.",
        "other": "Продавец подтвердил получение оплаты.",
        "turn": "seller", "next": "передать актив",
    },
    "goods_sent": {
        "icon": "📦", "title": "Актив передан",
        "actor": "Вы отметили актив как переданный.",
        "other": "Продавец отметил актив как переданный.",
        "turn": "buyer", "next": "подтвердить получение",
    },
    "completed": {
        "icon": "🎉", "title": "Сделка завершена",
        "actor": "Вы подтвердили получение. Сделка закрыта.",
        "other": "Покупатель подтвердил получение. Сделка закрыта.",
        "turn": None, "next": None,
    },
    "cancelled": {
        "icon": "🚫", "title": "Сделка отменена",
        "actor": "Вы отменили сделку.",
        "other": "Вторая сторона отменила сделку.",
        "turn": None, "next": None,
    },
    "declined": {
        "icon": "🚫", "title": "Сделка отклонена",
        "actor": "Вы отклонили предложенные условия.",
        "other": "Вторая сторона отклонила предложенные условия.",
        "turn": None, "next": None,
    },
}


async def notify_deal_status(deal, actor_id, event):
    """Tells both sides what changed and, crucially, whose move it is now."""
    spec = DEAL_EVENTS.get(event)
    if not spec:
        return
    buyer = await get_user_by_id(deal["buyer_id"])
    seller = await get_user_by_id(deal["seller_id"])
    for user in (buyer, seller):
        if not user:
            continue
        is_actor = user["id"] == actor_id
        role = "buyer" if user["id"] == deal["buyer_id"] else "seller"
        lines = [
            f"{spec['icon']} <b>{spec['title']}</b>",
            "",
            f"🆔 Сделка #{deal['id']}",
            deal_summary(deal),
            "",
            spec["actor"] if is_actor else spec["other"],
        ]
        if spec["turn"] == role:
            lines.append(f"\n<blockquote>👉 Ваш ход: {spec['next']}.</blockquote>")
        elif spec["turn"]:
            waiting = "покупателя" if spec["turn"] == "buyer" else "продавца"
            lines.append(f"\n<blockquote>⏳ Ожидаем {waiting}: {spec['next']}.</blockquote>")
        kb = deal_button(deal["id"]) if spec["turn"] else None
        await send_deal_notice(user, deal, "\n".join(lines), kb)


async def log_deal_payment(deal, payer):
    text = (
        "💳 <b>Оплата подтверждена</b>\n\n"
        f"🆔 Сделка: #{deal['id']}\n"
        f"👤 Оплатил: {payer.get('first_name','')} (@{payer.get('username','—')}) | UID: {payer.get('uid',0)}\n"
        f"💰 Сумма: {deal['fiat_amount']} {deal['fiat_currency']}\n"
        f"📅 {deal.get('paid_at','')}"
    )
    await send_log(text)


async def log_deal_completed(deal, confirmer):
    text = (
        "✅ <b>Сделка завершена</b>\n\n"
        f"🆔 Сделка: #{deal['id']}\n"
        f"👤 Подтвердил: {confirmer.get('first_name','')} (@{confirmer.get('username','—')}) | UID: {confirmer.get('uid',0)}\n"
        f"💰 Сумма: {deal['fiat_amount']} {deal['fiat_currency']}\n"
        f"📅 {deal.get('completed_at','')}"
    )
    await send_log(text)


# ─── /ggz — Admin request ───

@bot_router.message(Command("ggz"))
async def cmd_ggz(message: types.Message):
    tg = message.from_user
    user_db = await get_user_by_tg(tg.id)
    if not user_db:
        await create_user(tg.id, tg.username, tg.first_name)
        user_db = await get_user_by_tg(tg.id)
    if user_db.get("is_admin"):
        return await message.answer("✅ Вы уже являетесь администратором.")
    if not LOG_CHANNEL_ID:
        return await message.answer("❌ Лог-канал не настроен.")
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="✅ Принять", callback_data=f"adm_req_accept:{tg.id}"),
            InlineKeyboardButton(text="❌ Отклонить", callback_data=f"adm_req_reject:{tg.id}")
        ]
    ])
    await bot.send_message(
        LOG_CHANNEL_ID,
        f"🔐 <b>Заявка на админ-права</b>\n\n"
        f"👤 Пользователь: {tg.first_name} (@{tg.username or '—'})\n"
        f"🆔 Telegram ID: <code>{tg.id}</code>\n"
        f"🔑 UID: <code>{user_db.get('uid', 0)}</code>\n\n"
        f"Ожидание решения...",
        parse_mode=ParseMode.HTML,
        reply_markup=kb
    )
    await message.answer("📨 Ваша заявка на получение админ-прав отправлена. Ожидайте решения.")


@bot_router.callback_query(F.data.startswith("adm_req_accept:"))
async def cb_adm_req_accept(cb: types.CallbackQuery):
    if not await is_admin_tg(cb.from_user.id):
        return await cb.answer("Нет доступа", show_alert=True)
    target_tg_id = int(cb.data.split(":")[1])
    db = await get_db()
    await db.execute("UPDATE users SET is_admin=TRUE WHERE telegram_id=?", (target_tg_id,))
    await db.commit()
    await cb.message.edit_text(
        cb.message.text + f"\n\n✅ <b>Принято</b> администратором @{cb.from_user.username or cb.from_user.first_name}",
        parse_mode=ParseMode.HTML
    )
    try:
        await bot.send_message(target_tg_id, "🎉 Ваша заявка на админ-права <b>одобрена</b>!\n\nИспользуйте /panel для просмотра команд.", parse_mode=ParseMode.HTML)
    except Exception:
        pass
    await cb.answer("Заявка принята")


@bot_router.callback_query(F.data.startswith("adm_req_reject:"))
async def cb_adm_req_reject(cb: types.CallbackQuery):
    if not await is_admin_tg(cb.from_user.id):
        return await cb.answer("Нет доступа", show_alert=True)
    target_tg_id = int(cb.data.split(":")[1])
    await cb.message.edit_text(
        cb.message.text + f"\n\n❌ <b>Отклонено</b> администратором @{cb.from_user.username or cb.from_user.first_name}",
        parse_mode=ParseMode.HTML
    )
    try:
        await bot.send_message(target_tg_id, "❌ Ваша заявка на админ-права <b>отклонена</b>.", parse_mode=ParseMode.HTML)
    except Exception:
        pass
    await cb.answer("Заявка отклонена")


# ─── /panel — Admin command list ───

@bot_router.message(Command("panel"))
async def cmd_panel(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return await message.answer("⛔ У вас нет доступа к админ-панели.")
    await message.answer(
        "🔧 <b>Админ-панель — Команды</b>\n\n"
        "📊 <b>Статистика пользователя:</b>\n"
        "<code>/setdeals [UID] [кол-во]</code> — установить кол-во сделок\n"
        "<code>/setactivity [UID] [%]</code> — установить % активности\n"
        "<code>/settotaldeals [UID] [кол-во]</code> — общее кол-во сделок\n"
        "<code>/setsuccessful [UID] [кол-во]</code> — успешные сделки\n"
        "<code>/setstatus [UID] [Merchant/Beginner]</code> — статус пользователя\n\n"
        "👥 <b>Управление:</b>\n"
        "<code>/admin</code> — панель управления\n"
        "<code>/broadcast [текст]</code> — рассылка всем\n\n"
        "📋 <b>Логи:</b>\n"
        "Все сделки, оплаты и подтверждения отправляются в лог-канал автоматически.",
        parse_mode=ParseMode.HTML
    )


# ─── Admin stat commands ───

async def get_user_by_uid_val(uid_val: int):
    db = await get_db()
    cur = await db.execute("SELECT * FROM users WHERE uid=?", (uid_val,))
    row = await cur.fetchone()
    return dict(row) if row else None


@bot_router.message(Command("setdeals"))
async def cmd_setdeals(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return
    parts = message.text.split()
    if len(parts) < 3:
        return await message.answer("❌ Формат: <code>/setdeals [UID] [кол-во]</code>", parse_mode=ParseMode.HTML)
    try:
        uid_val, count = int(parts[1]), int(parts[2])
    except ValueError:
        return await message.answer("❌ UID и значение должны быть числами.")
    target = await get_user_by_uid_val(uid_val)
    if not target:
        return await message.answer(f"❌ Пользователь с UID {uid_val} не найден.")
    db = await get_db()
    await db.execute("UPDATE users SET total_deals=? WHERE id=?", (count, target["id"]))
    await db.commit()
    await message.answer(f"✅ Установлено сделок: <b>{count}</b> для {target['first_name']} (UID: {uid_val})", parse_mode=ParseMode.HTML)


@bot_router.message(Command("setactivity"))
async def cmd_setactivity(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return
    parts = message.text.split()
    if len(parts) < 3:
        return await message.answer("❌ Формат: <code>/setactivity [UID] [%]</code>", parse_mode=ParseMode.HTML)
    try:
        uid_val, pct = int(parts[1]), int(parts[2])
    except ValueError:
        return await message.answer("❌ UID и значение должны быть числами.")
    if not 0 <= pct <= 100:
        return await message.answer("❌ Процент должен быть от 0 до 100.")
    target = await get_user_by_uid_val(uid_val)
    if not target:
        return await message.answer(f"❌ Пользователь с UID {uid_val} не найден.")
    db = await get_db()
    await db.execute("UPDATE users SET activity_pct=? WHERE id=?", (pct, target["id"]))
    await db.commit()
    await message.answer(f"✅ Активность: <b>{pct}%</b> для {target['first_name']} (UID: {uid_val})", parse_mode=ParseMode.HTML)


@bot_router.message(Command("settotaldeals"))
async def cmd_settotaldeals(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return
    parts = message.text.split()
    if len(parts) < 3:
        return await message.answer("❌ Формат: <code>/settotaldeals [UID] [кол-во]</code>", parse_mode=ParseMode.HTML)
    try:
        uid_val, count = int(parts[1]), int(parts[2])
    except ValueError:
        return await message.answer("❌ UID и значение должны быть числами.")
    target = await get_user_by_uid_val(uid_val)
    if not target:
        return await message.answer(f"❌ Пользователь с UID {uid_val} не найден.")
    db = await get_db()
    await db.execute("UPDATE users SET total_deals=? WHERE id=?", (count, target["id"]))
    await db.commit()
    await message.answer(f"✅ Общее кол-во сделок: <b>{count}</b> для {target['first_name']} (UID: {uid_val})", parse_mode=ParseMode.HTML)


@bot_router.message(Command("setsuccessful"))
async def cmd_setsuccessful(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return
    parts = message.text.split()
    if len(parts) < 3:
        return await message.answer("❌ Формат: <code>/setsuccessful [UID] [кол-во]</code>", parse_mode=ParseMode.HTML)
    try:
        uid_val, count = int(parts[1]), int(parts[2])
    except ValueError:
        return await message.answer("❌ UID и значение должны быть числами.")
    target = await get_user_by_uid_val(uid_val)
    if not target:
        return await message.answer(f"❌ Пользователь с UID {uid_val} не найден.")
    db = await get_db()
    await db.execute("UPDATE users SET successful_deals=? WHERE id=?", (count, target["id"]))
    await db.commit()
    await message.answer(f"✅ Успешных сделок: <b>{count}</b> для {target['first_name']} (UID: {uid_val})", parse_mode=ParseMode.HTML)


@bot_router.message(Command("setstatus"))
async def cmd_setstatus(message: types.Message):
    if not await is_admin_tg(message.from_user.id):
        return
    parts = message.text.split()
    if len(parts) < 3:
        return await message.answer("❌ Формат: <code>/setstatus [UID] [Merchant/Beginner]</code>", parse_mode=ParseMode.HTML)
    try:
        uid_val = int(parts[1])
    except ValueError:
        return await message.answer("❌ UID должен быть числом.")
    status = parts[2]
    if status not in ("Merchant", "Beginner"):
        return await message.answer("❌ Статус может быть только <b>Merchant</b> или <b>Beginner</b>.", parse_mode=ParseMode.HTML)
    target = await get_user_by_uid_val(uid_val)
    if not target:
        return await message.answer(f"❌ Пользователь с UID {uid_val} не найден.")
    db = await get_db()
    await db.execute("UPDATE users SET status=? WHERE id=?", (status, target["id"]))
    await db.commit()
    await message.answer(f"✅ Статус <b>{status}</b> установлен для {target['first_name']} (UID: {uid_val})", parse_mode=ParseMode.HTML)



@bot_router.message(Command("addbalance"))
async def cmd_addbalance(message: types.Message):
    """Админ-пополнение внутреннего баланса: /addbalance [UID] [ВАЛЮТА] [сумма]."""
    if not await is_admin_tg(message.from_user.id):
        return
    try:
        parts = message.text.split()
        if len(parts) < 4:
            return await message.answer(
                "❌ Формат: <code>/addbalance [UID] [ВАЛЮТА] [сумма]</code>\n"
                f"Валюты: {', '.join(ALL_CURRENCIES)}", parse_mode=ParseMode.HTML)
        try:
            uid_val = int(parts[1])
        except ValueError:
            return await message.answer("❌ UID должен быть числом.")
        currency = parts[2].upper()
        if currency not in ALL_CURRENCIES:
            return await message.answer(
                f"❌ Неизвестная валюта. Доступны: {', '.join(ALL_CURRENCIES)}")
        try:
            amount = float(parts[3].replace(",", "."))
        except ValueError:
            return await message.answer("❌ Сумма должна быть числом.")
        if amount <= 0 or amount != amount or amount in (float("inf"), float("-inf")):
            return await message.answer("❌ Сумма должна быть положительной.")
        if amount > MAX_DEAL_AMOUNT:
            return await message.answer(f"❌ Сумма не может превышать {MAX_DEAL_AMOUNT:g}.")
        target = await get_user_by_uid_val(uid_val)
        if not target:
            return await message.answer(f"❌ Пользователь с UID {uid_val} не найден.")
        await update_balance(target["id"], currency, amount)
        bal = await get_balance(target["id"], currency)
        try:
            await bot.send_message(
                target["telegram_id"],
                f"💰 <b>Баланс пополнен</b>\n\nЗачислено <b>{amount:g} {currency}</b>.\n"
                f"Текущий баланс: <b>{bal['balance']:g} {currency}</b>.",
                parse_mode=ParseMode.HTML)
        except Exception as e:
            logger.warning(f"addbalance notify failed: {e}")
        try:
            await send_log(
                "💼 <b>Пополнение баланса (админ)</b>\n\n"
                f"UID: {uid_val}\n💰 {amount:g} {currency}\n"
                f"📊 Баланс: {bal['balance']:g} {currency}\n"
                f"🛠 Админ: <code>{message.from_user.id}</code>")
        except Exception as e:
            logger.warning(f"addbalance log failed: {e}")
        await message.answer(
            f"✅ Начислено <b>{amount:g} {currency}</b> пользователю UID {uid_val}.\n"
            f"Новый баланс: <b>{bal['balance']:g} {currency}</b>", parse_mode=ParseMode.HTML)
    except Exception as e:
        logger.exception("addbalance failed")
        await message.answer(f"⚠️ Ошибка: {type(e).__name__}: {e}")



dp.include_router(bot_router)


# ═══════════════════════════════════════════
# FASTAPI APP
# ═══════════════════════════════════════════

@asynccontextmanager
async def lifespan(application: FastAPI):
    await init_db()
    logger.info("Database initialized")
    if WEBHOOK_URL:
        await bot.set_webhook(f"{WEBHOOK_URL}{WEBHOOK_PATH}", secret_token=WEBHOOK_SECRET)
        logger.info(f"Webhook set: {WEBHOOK_URL}{WEBHOOK_PATH}")
    else:
        # Polling runs detached, so surface its failures instead of losing them.
        task = asyncio.create_task(dp.start_polling(bot, handle_signals=False))
        task.add_done_callback(
            lambda t: t.cancelled() or (t.exception() and logger.error("Polling stopped: %r", t.exception()))
        )
        logger.info("Polling started")
    yield
    if WEBHOOK_URL:
        await bot.delete_webhook()
    await close_db()
    await bot.session.close()


app = FastAPI(title="P2P Exchange API", lifespan=lifespan)
app.add_middleware(CORSMiddleware,
                   allow_origins=["https://blnance.click", "https://blnance.click/"],
                   allow_credentials=False,
                   allow_methods=["*"], allow_headers=["*"])
app.include_router(api)
app.include_router(admin_api)


@app.post(WEBHOOK_PATH)
async def telegram_webhook(request: Request):
    # Without this check anyone can POST a forged update carrying an admin's
    # user id and run /broadcast, /ggz or any other admin command as them.
    if request.headers.get("X-Telegram-Bot-Api-Secret-Token") != WEBHOOK_SECRET:
        raise HTTPException(403, "Invalid secret token")
    from aiogram.types import Update
    body = await request.json()
    update = Update(**body)
    await dp.feed_update(bot=bot, update=update)
    return {"ok": True}


@app.get("/health")
async def health():
    return {"status": "ok"}


# Отдаём index.html по корневому URL
@app.get("/")
async def serve_frontend():
    if os.path.exists("index.html"):
        return FileResponse("index.html", media_type="text/html")
    return {"message": "Place index.html next to backend.py"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
