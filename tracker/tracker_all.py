#!/usr/bin/env python3
"""
Telegram Gift Market Tracker (single-file version)

Юзербот опрашивает маркет подарков Telegram Stars,
бот отправляет листинги в группу с кнопками
«Профиль продавца» и «Занять лот».

Запуск:
    1. pip install telethon aiosqlite rich python-dotenv
    2. Заполни переменные ниже или создай .env
    3. python tracker_all.py
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import signal
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime

import aiosqlite
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from telethon import TelegramClient, events, Button
from telethon.tl import functions
from telethon.tl.tlobject import TLObject

load_dotenv()

# ═══════════════════════════════════════════════════════
#  CONFIG
# ═══════════════════════════════════════════════════════

API_ID = int(os.getenv("API_ID", "0"))
API_HASH = os.getenv("API_HASH", "")
SESSION_NAME = os.getenv("SESSION_NAME", "gift_tracker")

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
LOG_GROUP_ID = int(os.getenv("LOG_GROUP_ID", "0")) or None

POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL", "30"))
MAX_GIFTS_PER_PAGE = int(os.getenv("MAX_GIFTS_PER_PAGE", "50"))
DB_PATH = os.getenv("DB_PATH", "gifts.db")

MAX_SELLER_LEVEL = int(os.getenv("MAX_SELLER_LEVEL", "10"))
MAX_SELLER_NFT_COUNT = int(os.getenv("MAX_SELLER_NFT_COUNT", "10"))

TRACK_COLLECTIONS = [
    x.strip() for x in os.getenv("TRACK_COLLECTIONS", "").split(",") if x.strip()
]

MIN_PRICE_STARS = int(os.getenv("MIN_PRICE_STARS", "0"))
MAX_PRICE_STARS = int(os.getenv("MAX_PRICE_STARS", "0"))

CLAIM_DM_TEMPLATE = os.getenv(
    "CLAIM_DM_TEMPLATE",
    "Привет! Хочу приобрести ваш подарок «{title}» #{num} за {price} ⭐\n"
    "Ссылка: {link}",
)

SELLER_CACHE_TTL = int(os.getenv("SELLER_CACHE_TTL", "300"))

# ═══════════════════════════════════════════════════════
#  LOGGING & CONSOLE
# ═══════════════════════════════════════════════════════

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("tracker")
console = Console()

# ═══════════════════════════════════════════════════════
#  DATA CLASSES
# ═══════════════════════════════════════════════════════


@dataclass
class GiftAttribute:
    type: str
    name: str
    rarity_percent: float = 0.0


@dataclass
class ResaleListing:
    unique_gift_id: int
    gift_id: int
    num: int | None = None
    slug: str | None = None
    title: str | None = None
    owner_id: int | None = None
    owner_name: str | None = None
    owner_username: str | None = None
    owner_address: str | None = None
    price_stars: int = 0
    attributes: list[GiftAttribute] = field(default_factory=list)

    @property
    def owner_display(self) -> str:
        if self.owner_username:
            return f"@{self.owner_username}"
        if self.owner_name:
            return self.owner_name
        if self.owner_address:
            return f"TON:{self.owner_address[:8]}…{self.owner_address[-4:]}"
        if self.owner_id:
            return f"id:{self.owner_id}"
        return "скрыт"

    @property
    def attributes_json(self) -> str:
        return json.dumps(
            [{"type": a.type, "name": a.name, "rarity": a.rarity_percent}
             for a in self.attributes],
            ensure_ascii=False,
        )

    @property
    def gift_link(self) -> str:
        if self.slug:
            return f"https://t.me/nft/{self.slug}"
        return ""


@dataclass
class CollectionInfo:
    gift_id: int
    title: str
    slug: str | None = None
    total_issued: int = 0
    availability_remains: int = 0
    star_count: int = 0


@dataclass
class SellerProfile:
    user_id: int
    level: int | None = None
    nft_count: int | None = None
    username: str | None = None
    first_name: str | None = None
    checked_at: float = 0.0

    @property
    def passes_filter(self) -> bool:
        if MAX_SELLER_LEVEL and self.level is not None:
            if self.level > MAX_SELLER_LEVEL:
                return False
        if MAX_SELLER_NFT_COUNT and self.nft_count is not None:
            if self.nft_count > MAX_SELLER_NFT_COUNT:
                return False
        return True

    @property
    def filter_reason(self) -> str:
        reasons = []
        if MAX_SELLER_LEVEL and self.level is not None and self.level > MAX_SELLER_LEVEL:
            reasons.append(f"уровень {self.level} > {MAX_SELLER_LEVEL}")
        if MAX_SELLER_NFT_COUNT and self.nft_count is not None and self.nft_count > MAX_SELLER_NFT_COUNT:
            reasons.append(f"NFT {self.nft_count} > {MAX_SELLER_NFT_COUNT}")
        return ", ".join(reasons)


# ═══════════════════════════════════════════════════════
#  API — MTProto marketplace
# ═══════════════════════════════════════════════════════


def _safe_getattr(obj: TLObject, name: str, default=None):
    try:
        return getattr(obj, name, default)
    except Exception:
        return default


def _parse_attributes(gift: TLObject) -> list[GiftAttribute]:
    attrs = []
    raw_attrs = _safe_getattr(gift, "attributes", [])
    if not raw_attrs:
        return attrs
    for attr in raw_attrs:
        class_name = type(attr).__name__.lower()
        if "model" in class_name:
            attrs.append(GiftAttribute("model", _safe_getattr(attr, "name", "?"),
                                       _safe_getattr(attr, "rarity_permille", 0) / 10.0))
        elif "pattern" in class_name:
            attrs.append(GiftAttribute("pattern", _safe_getattr(attr, "name", "?"),
                                       _safe_getattr(attr, "rarity_permille", 0) / 10.0))
        elif "backdrop" in class_name:
            attrs.append(GiftAttribute("backdrop", _safe_getattr(attr, "name", "?"),
                                       _safe_getattr(attr, "rarity_permille", 0) / 10.0))
    return attrs


def _resolve_owner(gift: TLObject, users_map: dict) -> tuple[int | None, str | None, str | None]:
    owner_id_raw = _safe_getattr(gift, "owner_id")
    owner_name = _safe_getattr(gift, "owner_name")
    owner_username = None
    owner_id = None
    if owner_id_raw is not None:
        if hasattr(owner_id_raw, "user_id"):
            owner_id = owner_id_raw.user_id
        elif hasattr(owner_id_raw, "channel_id"):
            owner_id = owner_id_raw.channel_id
        elif isinstance(owner_id_raw, int):
            owner_id = owner_id_raw
        if owner_id and owner_id in users_map:
            user = users_map[owner_id]
            owner_username = _safe_getattr(user, "username")
            if not owner_name:
                first = _safe_getattr(user, "first_name", "")
                last = _safe_getattr(user, "last_name", "")
                owner_name = f"{first} {last}".strip() or None
    return owner_id, owner_name, owner_username


async def get_gift_catalog(client: TelegramClient) -> list[CollectionInfo]:
    try:
        result = await client(functions.payments.GetStarGiftsRequest(hash=0))
    except Exception as e:
        logger.error("Ошибка получения каталога: %s", e)
        return []
    gifts = _safe_getattr(result, "gifts", [])
    catalog = []
    for gift in gifts:
        gift_id = _safe_getattr(gift, "id")
        if gift_id is None:
            continue
        title_raw = _safe_getattr(gift, "title", "")
        if not isinstance(title_raw, str):
            title_raw = str(gift_id)
        catalog.append(CollectionInfo(
            gift_id=gift_id,
            title=title_raw,
            slug=_safe_getattr(gift, "slug", None),
            total_issued=_safe_getattr(gift, "availability_total", 0) or 0,
            availability_remains=_safe_getattr(gift, "availability_remains", 0) or 0,
            star_count=_safe_getattr(gift, "stars", 0) or 0,
        ))
    logger.info("Каталог: %d коллекций", len(catalog))
    return catalog


async def get_resale_listings(
    client: TelegramClient, gift_id: int,
    limit: int = 50, offset: str = "", sort_by_price: bool = False,
) -> tuple[list[ResaleListing], str]:
    try:
        result = await client(functions.payments.GetResaleStarGiftsRequest(
            gift_id=gift_id, offset=offset, limit=limit, sort_by_price=sort_by_price,
        ))
    except AttributeError:
        logger.error("Telethon не поддерживает GetResaleStarGiftsRequest (нужен layer 210+)")
        return [], ""
    except Exception as e:
        logger.error("Ошибка листингов gift_id=%d: %s", gift_id, e)
        return [], ""

    users_map = {}
    for user in _safe_getattr(result, "users", []):
        uid = _safe_getattr(user, "id")
        if uid:
            users_map[uid] = user

    gifts = _safe_getattr(result, "gifts", [])
    next_offset = _safe_getattr(result, "next_offset", "") or ""
    listings = []
    for gift in gifts:
        unique_id = _safe_getattr(gift, "id")
        if unique_id is None:
            continue
        owner_id, owner_name, owner_username = _resolve_owner(gift, users_map)
        listings.append(ResaleListing(
            unique_gift_id=unique_id,
            gift_id=gift_id,
            num=_safe_getattr(gift, "num"),
            slug=_safe_getattr(gift, "slug"),
            title=_safe_getattr(gift, "title", ""),
            owner_id=owner_id,
            owner_name=owner_name,
            owner_username=owner_username,
            owner_address=_safe_getattr(gift, "owner_address"),
            price_stars=_safe_getattr(gift, "resale_star_count", 0) or 0,
            attributes=_parse_attributes(gift),
        ))
    return listings, next_offset


# ═══════════════════════════════════════════════════════
#  SELLER CHECKER (with cache)
# ═══════════════════════════════════════════════════════

_seller_cache: dict[int, SellerProfile] = {}


def _is_cached(user_id: int) -> bool:
    if user_id not in _seller_cache:
        return False
    return (time.time() - _seller_cache[user_id].checked_at) < SELLER_CACHE_TTL


async def get_user_level(client: TelegramClient, user_id: int) -> int | None:
    try:
        full = await client(functions.users.GetFullUserRequest(id=user_id))
        uf = full.full_user
        level = getattr(uf, "level", None)
        if level is not None:
            return int(level)
        pc = getattr(uf, "profile_color", None)
        if pc is not None:
            level = getattr(pc, "level", None)
            if level is not None:
                return int(level)
        pc2 = getattr(uf, "peer_color", None)
        if pc2 is not None:
            level = getattr(pc2, "level", None)
            if level is not None:
                return int(level)
        return 0
    except Exception as e:
        logger.warning("Уровень user_id=%d: %s", user_id, e)
        return None


async def get_user_nft_count(client: TelegramClient, user_id: int) -> int | None:
    try:
        try:
            result = await client(functions.payments.GetSavedStarGiftsRequest(
                peer=user_id, offset="", limit=100,
            ))
        except (AttributeError, TypeError):
            try:
                result = await client(functions.payments.GetUserStarGiftsRequest(
                    user_id=user_id, offset="", limit=100,
                ))
            except (AttributeError, TypeError):
                return None

        gifts = getattr(result, "gifts", [])
        if not gifts:
            return getattr(result, "count", 0)
        nft_count = 0
        for gw in gifts:
            inner = getattr(gw, "gift", None) or gw
            if "unique" in type(inner).__name__.lower():
                nft_count += 1
        return nft_count
    except Exception as e:
        logger.warning("NFT count user_id=%d: %s", user_id, e)
        return None


async def check_seller(client: TelegramClient, user_id: int) -> SellerProfile:
    if _is_cached(user_id):
        return _seller_cache[user_id]
    level = await get_user_level(client, user_id)
    nft_count = await get_user_nft_count(client, user_id)
    username = None
    first_name = None
    try:
        entity = await client.get_entity(user_id)
        username = getattr(entity, "username", None)
        first_name = getattr(entity, "first_name", None)
    except Exception:
        pass
    profile = SellerProfile(
        user_id=user_id, level=level, nft_count=nft_count,
        username=username, first_name=first_name, checked_at=time.time(),
    )
    _seller_cache[user_id] = profile
    logger.info("Продавец %s (id:%d): level=%s, nft=%s, pass=%s",
                username or "?", user_id, level, nft_count, profile.passes_filter)
    return profile


# ═══════════════════════════════════════════════════════
#  DATABASE (SQLite)
# ═══════════════════════════════════════════════════════


async def init_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS collections (
            gift_id       INTEGER PRIMARY KEY,
            title         TEXT NOT NULL,
            slug          TEXT,
            total_issued  INTEGER DEFAULT 0,
            first_seen    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS listings (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_gift_id  INTEGER NOT NULL,
            gift_id         INTEGER NOT NULL,
            num             INTEGER,
            slug            TEXT,
            title           TEXT,
            owner_id        INTEGER,
            owner_name      TEXT,
            owner_username  TEXT,
            owner_address   TEXT,
            seller_level    INTEGER,
            seller_nft_count INTEGER,
            price_stars     INTEGER NOT NULL,
            attributes_json TEXT,
            first_seen      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active       BOOLEAN DEFAULT 1,
            log_message_id  INTEGER,
            claimed_by      INTEGER,
            claimed_at      TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS price_history (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_gift_id  INTEGER NOT NULL,
            price_stars     INTEGER NOT NULL,
            recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active, gift_id);
        CREATE INDEX IF NOT EXISTS idx_listings_unique_id ON listings(unique_gift_id);
        CREATE INDEX IF NOT EXISTS idx_price_history_gift ON price_history(unique_gift_id, recorded_at);
    """)
    await db.commit()
    return db


async def upsert_listing(db, **kw) -> bool:
    uid = kw["unique_gift_id"]
    cursor = await db.execute(
        "SELECT id, price_stars FROM listings WHERE unique_gift_id = ?", (uid,),
    )
    row = await cursor.fetchone()
    if row is None:
        await db.execute(
            """INSERT INTO listings
               (unique_gift_id, gift_id, num, slug, title,
                owner_id, owner_name, owner_username, owner_address,
                seller_level, seller_nft_count, price_stars, attributes_json)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (uid, kw["gift_id"], kw.get("num"), kw.get("slug"), kw.get("title"),
             kw.get("owner_id"), kw.get("owner_name"), kw.get("owner_username"),
             kw.get("owner_address"), kw.get("seller_level"), kw.get("seller_nft_count"),
             kw["price_stars"], kw.get("attributes_json")),
        )
        await db.execute(
            "INSERT INTO price_history (unique_gift_id, price_stars) VALUES (?,?)",
            (uid, kw["price_stars"]),
        )
        await db.commit()
        return True
    old_price = row[1]
    await db.execute(
        """UPDATE listings SET
            owner_id=?, owner_name=?, owner_username=?, owner_address=?,
            seller_level=?, seller_nft_count=?, price_stars=?,
            last_seen=CURRENT_TIMESTAMP, is_active=1
           WHERE unique_gift_id=?""",
        (kw.get("owner_id"), kw.get("owner_name"), kw.get("owner_username"),
         kw.get("owner_address"), kw.get("seller_level"), kw.get("seller_nft_count"),
         kw["price_stars"], uid),
    )
    if old_price != kw["price_stars"]:
        await db.execute(
            "INSERT INTO price_history (unique_gift_id, price_stars) VALUES (?,?)",
            (uid, kw["price_stars"]),
        )
    await db.commit()
    return False


async def set_log_message_id(db, unique_gift_id: int, message_id: int):
    await db.execute(
        "UPDATE listings SET log_message_id=? WHERE unique_gift_id=?",
        (message_id, unique_gift_id),
    )
    await db.commit()


async def get_listing_by_unique_id(db, unique_gift_id: int) -> dict | None:
    cursor = await db.execute(
        """SELECT unique_gift_id, gift_id, num, slug, title,
                  owner_id, owner_name, owner_username, owner_address,
                  seller_level, seller_nft_count,
                  price_stars, log_message_id, claimed_by
           FROM listings WHERE unique_gift_id=?""",
        (unique_gift_id,),
    )
    row = await cursor.fetchone()
    if not row:
        return None
    keys = ["unique_gift_id", "gift_id", "num", "slug", "title",
            "owner_id", "owner_name", "owner_username", "owner_address",
            "seller_level", "seller_nft_count", "price_stars",
            "log_message_id", "claimed_by"]
    return dict(zip(keys, row))


async def set_claimed(db, unique_gift_id: int, claimed_by: int):
    await db.execute(
        "UPDATE listings SET claimed_by=?, claimed_at=CURRENT_TIMESTAMP WHERE unique_gift_id=?",
        (claimed_by, unique_gift_id),
    )
    await db.commit()


async def mark_delisted(db, active_ids: set[int], gift_id: int) -> list[dict]:
    cursor = await db.execute(
        "SELECT unique_gift_id, title, num, price_stars FROM listings "
        "WHERE is_active=1 AND gift_id=?", (gift_id,),
    )
    rows = await cursor.fetchall()
    delisted = []
    for uid, title, num, price in rows:
        if uid not in active_ids:
            await db.execute(
                "UPDATE listings SET is_active=0, last_seen=CURRENT_TIMESTAMP "
                "WHERE unique_gift_id=?", (uid,),
            )
            delisted.append({"unique_gift_id": uid, "title": title, "num": num, "price_stars": price})
    if delisted:
        await db.commit()
    return delisted


async def upsert_collection(db, gift_id, title, slug, total_issued):
    await db.execute(
        """INSERT INTO collections (gift_id, title, slug, total_issued)
           VALUES (?,?,?,?)
           ON CONFLICT(gift_id) DO UPDATE SET
               title=excluded.title, slug=excluded.slug, total_issued=excluded.total_issued""",
        (gift_id, title, slug, total_issued),
    )
    await db.commit()


async def get_stats(db) -> dict:
    active = (await (await db.execute("SELECT COUNT(*) FROM listings WHERE is_active=1")).fetchone())[0]
    total = (await (await db.execute("SELECT COUNT(*) FROM listings")).fetchone())[0]
    colls = (await (await db.execute("SELECT COUNT(*) FROM collections")).fetchone())[0]
    claimed = (await (await db.execute("SELECT COUNT(*) FROM listings WHERE claimed_by IS NOT NULL")).fetchone())[0]
    return {"active_listings": active, "total_seen": total,
            "collections_tracked": colls, "total_claimed": claimed}


# ═══════════════════════════════════════════════════════
#  DISPLAY (Rich console)
# ═══════════════════════════════════════════════════════


def format_stars(amount: int) -> str:
    if amount >= 1_000_000:
        return f"{amount / 1_000_000:.1f}M ⭐"
    if amount >= 1_000:
        return f"{amount / 1_000:.1f}K ⭐"
    return f"{amount} ⭐"


def print_new_listing(listing: ResaleListing):
    owner = listing.owner_display
    attrs = ", ".join(f"{a.type}: {a.name} ({a.rarity_percent:.1f}%)" for a in listing.attributes)
    t = Text()
    t.append("Коллекция: ", style="dim")
    t.append(f"{listing.title}\n", style="bold")
    t.append("Номер: ", style="dim")
    t.append(f"#{listing.num}\n" if listing.num else "—\n")
    t.append("Цена: ", style="dim")
    t.append(f"{format_stars(listing.price_stars)}\n", style="bold yellow")
    t.append("Владелец: ", style="dim")
    t.append(f"{owner}\n", style="bold cyan" if listing.owner_username else "")
    if attrs:
        t.append("Атрибуты: ", style="dim")
        t.append(f"{attrs}\n")
    if listing.gift_link:
        t.append("Ссылка: ", style="dim")
        t.append(listing.gift_link, style="underline blue")
    console.print(Panel(t, title="🆕 Новый листинг", border_style="green"))


def print_delisted(info: dict):
    console.print(
        f"  ❌ [dim]Снят:[/] {info.get('title', '?')} "
        f"#{info.get('num', '?')} [dim]{format_stars(info.get('price_stars', 0))}[/]"
    )


def print_stats(stats: dict):
    console.print(Panel(
        f"[bold]Активных:[/] {stats['active_listings']}\n"
        f"[bold]Всего:[/] {stats['total_seen']}\n"
        f"[bold]Коллекций:[/] {stats['collections_tracked']}\n"
        f"[bold]Занято:[/] {stats['total_claimed']}",
        title="📊 Статистика", border_style="blue",
    ))


# ═══════════════════════════════════════════════════════
#  BOT (group messages + inline buttons)
# ═══════════════════════════════════════════════════════

_db = None
_userbot: TelegramClient | None = None

FOOTER = "\n\n<i>Dev by fiesta</i>"


def set_dependencies(db, userbot: TelegramClient):
    global _db, _userbot
    _db = db
    _userbot = userbot


def create_bot() -> TelegramClient:
    bot = TelegramClient("gift_bot", API_ID, API_HASH)

    @bot.on(events.CallbackQuery(pattern=rb"^claim:(\d+)$"))
    async def on_claim(event):
        await _handle_claim(bot, event)

    return bot


def _build_listing_text(listing: ResaleListing, seller_level=None, seller_nft=None) -> str:
    owner = listing.owner_display
    attrs = "\n".join(
        f"  • {a.type}: <b>{a.name}</b> ({a.rarity_percent:.1f}%)" for a in listing.attributes
    )
    lines = [
        "🆕 <b>Новый листинг на маркете</b>", "",
        f"📦 <b>{listing.title}</b> #{listing.num or '?'}",
        f"💰 Цена: <b>{format_stars(listing.price_stars)}</b>",
        f"👤 Продавец: <code>{owner}</code>",
    ]
    parts = []
    if seller_level is not None:
        parts.append(f"Уровень: {seller_level}")
    if seller_nft is not None:
        parts.append(f"NFT: {seller_nft}")
    if parts:
        lines.append(f"📊 {' | '.join(parts)}")
    if attrs:
        lines.append(f"🎨 Атрибуты:\n{attrs}")
    if listing.gift_link:
        lines.append(f'🔗 <a href="{listing.gift_link}">Открыть подарок</a>')
    lines.append(FOOTER)
    return "\n".join(lines)


def _build_buttons(listing: ResaleListing) -> list[list[Button]]:
    if listing.owner_username:
        profile_url = f"https://t.me/{listing.owner_username}"
    elif listing.owner_id:
        profile_url = f"tg://user?id={listing.owner_id}"
    else:
        profile_url = None
    row = []
    if profile_url:
        row.append(Button.url("👤 Профиль продавца", profile_url))
    row.append(Button.inline("🔒 Занять лот", data=f"claim:{listing.unique_gift_id}".encode()))
    return [row]


def _build_claimed_text(title, num, price_stars, owner_display, claimer_name) -> str:
    lines = [
        f"📦 <b>{title}</b> #{num or '?'}",
        f"💰 Цена: <b>{format_stars(price_stars)}</b>",
        f"👤 Продавец: <code>{owner_display}</code>",
        "",
        f"✅ <b>Лот был занят</b> — {claimer_name}",
        FOOTER,
    ]
    return "\n".join(lines)


async def send_listing_to_group(bot, listing, seller_level=None, seller_nft=None) -> int | None:
    if not LOG_GROUP_ID:
        return None
    text = _build_listing_text(listing, seller_level, seller_nft)
    buttons = _build_buttons(listing)
    try:
        msg = await bot.send_message(
            LOG_GROUP_ID, text, buttons=buttons, parse_mode="html", link_preview=False,
        )
        return msg.id
    except Exception as e:
        logger.error("Ошибка отправки в группу: %s", e)
        return None


async def _handle_claim(bot, event):
    unique_gift_id = int(event.pattern_match.group(1))
    claimer = await event.get_sender()
    claimer_id = claimer.id
    claimer_name = (
        f"@{claimer.username}" if claimer.username
        else (claimer.first_name or f"id:{claimer_id}")
    )

    listing_data = await get_listing_by_unique_id(_db, unique_gift_id)
    if not listing_data:
        await event.answer("❌ Листинг не найден", alert=True)
        return
    if listing_data["claimed_by"]:
        await event.answer("❌ Этот лот уже занят!", alert=True)
        return

    await set_claimed(_db, unique_gift_id, claimer_id)

    owner_id = listing_data["owner_id"]
    dm_sent = False
    if _userbot and owner_id:
        try:
            dm_text = CLAIM_DM_TEMPLATE.format(
                title=listing_data["title"] or "подарок",
                num=listing_data["num"] or "?",
                price=listing_data["price_stars"],
                link=f"https://t.me/nft/{listing_data['slug']}" if listing_data["slug"] else "",
            )
            await _userbot.send_message(owner_id, dm_text)
            dm_sent = True
        except Exception as e:
            logger.warning("DM продавцу %d: %s", owner_id, e)

    owner_display = (
        f"@{listing_data['owner_username']}" if listing_data.get("owner_username")
        else listing_data.get("owner_name")
        or (f"id:{owner_id}" if owner_id else "скрыт")
    )

    claimed_text = _build_claimed_text(
        listing_data["title"] or "?", listing_data["num"],
        listing_data["price_stars"], owner_display, claimer_name,
    )
    try:
        await bot.edit_message(
            LOG_GROUP_ID, event.message_id, claimed_text, buttons=None, parse_mode="html",
        )
    except Exception as e:
        logger.error("Ошибка редактирования: %s", e)

    status = "✅ Лот занят! DM отправлен." if dm_sent else "✅ Лот занят!"
    await event.answer(status, alert=True)


# ═══════════════════════════════════════════════════════
#  MAIN TRACKER LOOP
# ═══════════════════════════════════════════════════════

_running = True


def _handle_signal(signum, frame):
    global _running
    _running = False
    console.print("\n[bold red]⏹ Останавливаю трекер...[/]")


def _passes_price_filter(listing: ResaleListing) -> bool:
    if MIN_PRICE_STARS and listing.price_stars < MIN_PRICE_STARS:
        return False
    if MAX_PRICE_STARS and listing.price_stars > MAX_PRICE_STARS:
        return False
    return True


async def poll_collection(userbot, bot, db, gift_id, collection_title) -> tuple[int, int, int]:
    new_count = 0
    updated_count = 0
    all_active_ids: set[int] = set()
    offset = ""
    page = 0

    while True:
        listings, next_offset = await get_resale_listings(
            userbot, gift_id, limit=MAX_GIFTS_PER_PAGE, offset=offset,
        )
        if not listings:
            break
        for listing in listings:
            all_active_ids.add(listing.unique_gift_id)
            if not _passes_price_filter(listing):
                continue

            seller_level = None
            seller_nft = None
            if listing.owner_id and (MAX_SELLER_LEVEL or MAX_SELLER_NFT_COUNT):
                seller = await check_seller(userbot, listing.owner_id)
                seller_level = seller.level
                seller_nft = seller.nft_count
                if not seller.passes_filter:
                    continue

            is_new = await upsert_listing(
                db,
                unique_gift_id=listing.unique_gift_id,
                gift_id=listing.gift_id,
                num=listing.num,
                slug=listing.slug,
                title=listing.title,
                owner_id=listing.owner_id,
                owner_name=listing.owner_name,
                owner_username=listing.owner_username,
                owner_address=listing.owner_address,
                price_stars=listing.price_stars,
                attributes_json=listing.attributes_json,
                seller_level=seller_level,
                seller_nft_count=seller_nft,
            )
            if is_new:
                new_count += 1
                print_new_listing(listing)
                if bot and LOG_GROUP_ID:
                    msg_id = await send_listing_to_group(bot, listing, seller_level, seller_nft)
                    if msg_id:
                        await set_log_message_id(db, listing.unique_gift_id, msg_id)
            else:
                updated_count += 1

        page += 1
        if not next_offset or page >= 3:
            break
        offset = next_offset

    delisted = await mark_delisted(db, all_active_ids, gift_id)
    for info in delisted:
        print_delisted(info)
    return new_count, updated_count, len(delisted)


async def run_tracker():
    if not API_ID or not API_HASH:
        console.print("[bold red]Ошибка:[/] API_ID и API_HASH не заданы. Создай .env")
        sys.exit(1)
    if not BOT_TOKEN:
        console.print("[bold red]Ошибка:[/] BOT_TOKEN не задан. Создай бота через @BotFather")
        sys.exit(1)
    if not LOG_GROUP_ID:
        console.print("[bold red]Ошибка:[/] LOG_GROUP_ID не задан.")
        sys.exit(1)

    console.print(Panel(
        "[bold]🎁 Telegram Gift Market Tracker[/]\n\n"
        f"Интервал: {POLL_INTERVAL_SECONDS}с\n"
        f"Группа: {LOG_GROUP_ID}\n"
        f"Фильтр продавца: уровень ≤ {MAX_SELLER_LEVEL or '∞'}, "
        f"NFT ≤ {MAX_SELLER_NFT_COUNT or '∞'}\n"
        f"Коллекции: {', '.join(TRACK_COLLECTIONS) or 'все'}\n"
        f"Цена: {MIN_PRICE_STARS or '—'} – {MAX_PRICE_STARS or '∞'} ⭐",
        border_style="bright_magenta",
    ))

    userbot = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await userbot.start()
    console.print("[green]✅ Юзербот подключен[/]")

    bot = create_bot()
    await bot.start(bot_token=BOT_TOKEN)
    console.print("[green]✅ Бот подключен[/]")

    db = await init_db()
    set_dependencies(db, userbot)

    console.print("[dim]Загружаю каталог коллекций...[/]")
    catalog = await get_gift_catalog(userbot)
    if not catalog:
        console.print("[yellow]⚠ Каталог пуст.[/]")
        await _cleanup(userbot, bot, db)
        return

    if TRACK_COLLECTIONS:
        catalog = [c for c in catalog if c.title.lower() in [t.lower() for t in TRACK_COLLECTIONS]]
        if not catalog:
            console.print(f"[yellow]⚠ Коллекции {TRACK_COLLECTIONS} не найдены.[/]")
            await _cleanup(userbot, bot, db)
            return

    for c in catalog:
        await upsert_collection(db, c.gift_id, c.title, c.slug, c.total_issued)
    console.print(f"[green]📚 Отслеживаю {len(catalog)} коллекций[/]\n")

    cycle = 0
    while _running:
        cycle += 1
        now = datetime.now().strftime("%H:%M:%S")
        console.rule(f"[dim]Цикл #{cycle} — {now}[/]")

        total_new = total_updated = total_delisted = 0
        for collection in catalog:
            if not _running:
                break
            new, updated, dl = await poll_collection(userbot, bot, db, collection.gift_id, collection.title)
            total_new += new
            total_updated += updated
            total_delisted += dl
            await asyncio.sleep(1)

        if total_new or total_delisted:
            console.print(
                f"\n  [green]+{total_new} новых[/]  "
                f"[dim]{total_updated} обновлено[/]  "
                f"[red]-{total_delisted} снято[/]"
            )
        else:
            console.print(f"  [dim]Без изменений ({total_updated} проверено)[/]")

        if cycle % 10 == 0:
            stats = await get_stats(db)
            print_stats(stats)

        if _running:
            try:
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                break

    await _cleanup(userbot, bot, db)


async def _cleanup(userbot, bot, db):
    console.print("\n[dim]Закрываю соединения...[/]")
    await db.close()
    await bot.disconnect()
    await userbot.disconnect()
    console.print("[green]✅ Трекер остановлен.[/]")


def main():
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)
    try:
        asyncio.run(run_tracker())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
