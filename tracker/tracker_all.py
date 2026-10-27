"""
Telegram Gift Market Tracker (multi-session, hardened)

До 8 юзербот-сессий для параллельного опроса маркета.
Защита от слёта сессий: auto-reconnect, FloodWait handling,
health checks, session backups, realistic device fingerprint.

Запуск:
    1. pip install telethon aiosqlite rich python-dotenv
    2. Заполни .env (см. ниже)
    3. python tracker_all.py
       При первом запуске каждая сессия попросит номер + код.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import signal
import ssl
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime

import aiosqlite
from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from telethon import TelegramClient, events, Button
from telethon.tl import functions, types
from telethon.tl.tlobject import TLObject
from telethon.errors import (
    FloodWaitError,
    RPCError,
    AuthKeyUnregisteredError,
    UserDeactivatedBanError,
    SessionRevokedError,
    ButtonUrlInvalidError,
)

load_dotenv()


API_ID = int(os.getenv("API_ID", "0"))
API_HASH = os.getenv("API_HASH", "")

SESSION_NAMES_RAW = os.getenv("SESSION_NAMES", "").strip()
SESSION_NAME = os.getenv("SESSION_NAME", "gift_tracker")

if SESSION_NAMES_RAW:
    SESSION_NAMES = [s.strip() for s in SESSION_NAMES_RAW.split(",") if s.strip()]
else:
    SESSION_NAMES = [SESSION_NAME]

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
# Max NEW listings processed per collection per sweep (0 = unlimited). Keeps the
# sweep moving across ALL collections instead of drowning in a few hot ones.
MAX_NEW_PER_COLLECTION = int(os.getenv("MAX_NEW_PER_COLLECTION", "0"))

OWNER_CACHE_TTL = int(os.getenv("OWNER_CACHE_TTL", "0"))
OWNER_CACHE_NEG_TTL = int(os.getenv("OWNER_CACHE_NEG_TTL", "21600"))

# Branches = forum topics inside one supergroup.
# t.me/c/3940557866/<topic> -> chat id is -100 prefixed.
BRANCH_CHAT_ID = int(os.getenv("BRANCH_CHAT_ID", "-1003940557866"))
TOPIC_ALL = int(os.getenv("TOPIC_ALL", "5"))
TOPIC_RICH = int(os.getenv("TOPIC_RICH", "3"))
TOPIC_POOR = int(os.getenv("TOPIC_POOR", "4"))
TOPIC_BLACK = int(os.getenv("TOPIC_BLACK", "6"))
RICH_MIN_STARS = int(os.getenv("RICH_MIN_STARS", "2000"))
POOR_MAX_STARS = int(os.getenv("POOR_MAX_STARS", "500"))
BLACK_COLLECTIONS = [
    x.strip().lower() for x in os.getenv("BLACK_COLLECTIONS", "").split(",") if x.strip()
]
# Whitelist for the rich branch: lots from these collections ALWAYS go to rich
# (regardless of price). Collections outside it never reach rich.
RICH_COLLECTIONS = [
    x.strip() for x in os.getenv("RICH_COLLECTIONS", "").split(",") if x.strip()
]

# ── Seller verification (resolve-check + entity-type + NFT presence) ──
# All three run before posting. Each is cheap-ish per unique seller because we
# cache both success and failure.
#   VERIFY_SELLER=1       -> master switch. Off = no checks.
#   REQUIRE_USER_ENTITY=1 -> drop channels / bots / deleted accounts.
#   REQUIRE_HAS_NFTS=1    -> drop sellers whose star-gift inventory is empty.
#   MIN_NFT_COUNT=0       -> optional floor on how many gifts they must own.
#   VERIFY_CACHE_TTL      -> seconds a positive verify is reused.
#   VERIFY_NEG_CACHE_TTL  -> seconds a negative verify is reused (longer, so
#                            dead handles don't get retried every post).
VERIFY_SELLER = os.getenv("VERIFY_SELLER", "1") not in ("0", "", "false", "False")
REQUIRE_USER_ENTITY = os.getenv("REQUIRE_USER_ENTITY", "1") not in ("0", "", "false", "False")
REQUIRE_HAS_NFTS = os.getenv("REQUIRE_HAS_NFTS", "0") not in ("0", "", "false", "False")
MIN_NFT_COUNT = int(os.getenv("MIN_NFT_COUNT", "0"))
VERIFY_CACHE_TTL = int(os.getenv("VERIFY_CACHE_TTL", "86400"))
VERIFY_NEG_CACHE_TTL = int(os.getenv("VERIFY_NEG_CACHE_TTL", "3600"))

GIFT_PREVIEW = os.getenv("GIFT_PREVIEW", "1") not in ("0", "", "false", "False")
POSTS_PER_MIN = int(os.getenv("POSTS_PER_MIN", "40"))
# Only post listings whose seller has a public @username (so the Seller
# profile button can open a chat). Set to 0 to post all.
REQUIRE_USERNAME = os.getenv("REQUIRE_USERNAME", "1") not in ("0", "", "false", "False")

CLAIM_MAX_PER_WINDOW = int(os.getenv("CLAIM_MAX_PER_WINDOW", "10"))
CLAIM_WINDOW_SEC = int(os.getenv("CLAIM_WINDOW_SEC", "30"))
REQUIRE_START = os.getenv("REQUIRE_START", "1") not in ("0", "", "false", "False")
BOT_USERNAME = os.getenv("BOT_USERNAME", "").lstrip("@")

CLAIM_DM_TEMPLATE = os.getenv(
    "CLAIM_DM_TEMPLATE",
    "Привет! Хочу приобрести ваш подарок \"{title}\" #{num} за {price} Stars\n"
    "Ссылка: {link}",
)
# Have the userbot DM the seller on Claim. OFF by default: messaging strangers
# from a userbot gets the account spam-reported and limited.
CLAIM_DM_SELLER = os.getenv("CLAIM_DM_SELLER", "0") not in ("0", "", "false", "False")

SELLER_CACHE_TTL = int(os.getenv("SELLER_CACHE_TTL", "300"))

MAX_CONCURRENT_PER_SESSION = int(os.getenv("MAX_CONCURRENT_PER_SESSION", "3"))

DEVICE_MODEL = os.getenv("DEVICE_MODEL", "Desktop")
SYSTEM_VERSION = os.getenv("SYSTEM_VERSION", "Windows 10")
APP_VERSION = os.getenv("APP_VERSION", "4.16.8")
LANG_CODE = os.getenv("LANG_CODE", "en")

FLOOD_SLEEP_THRESHOLD = int(os.getenv("FLOOD_SLEEP_THRESHOLD", "120"))
# Never sleep longer than this on a FloodWait; above it, skip instead of
# freezing the whole session (a huge flood = the account is rate-limited/banned).
FLOOD_MAX_SLEEP = int(os.getenv("FLOOD_MAX_SLEEP", "300"))
CONNECTION_RETRIES = int(os.getenv("CONNECTION_RETRIES", "10"))
RETRY_DELAY = int(os.getenv("RETRY_DELAY", "2"))
AUTH_DELAY = int(os.getenv("AUTH_DELAY", "5"))
API_CALL_RETRIES = int(os.getenv("API_CALL_RETRIES", "3"))

HEALTH_CHECK_EVERY_N_CYCLES = int(os.getenv("HEALTH_CHECK_CYCLES", "10"))
SESSION_BACKUP_EVERY_N_CYCLES = int(os.getenv("SESSION_BACKUP_CYCLES", "60"))
SESSION_BACKUP_DIR = os.getenv("SESSION_BACKUP_DIR", "session_backups")

# Where owner data comes from: "kartoshka" = ONLY see.tg public API (default),
# "all" = also try Portals / t.me page / Fragment / TON as fallbacks.
OWNER_SOURCE = os.getenv("OWNER_SOURCE", "kartoshka").strip().lower()

GIFTSTAT_ENABLED = os.getenv("GIFTSTAT_ENABLED", "0") not in ("0", "", "false", "False")
GIFTSTAT_API = os.getenv("GIFTSTAT_API", "https://api.giftstat.app").rstrip("/")
GIFTSTAT_MARKETPLACE = os.getenv("GIFTSTAT_MARKETPLACE", "portals")
GIFTSTAT_REFRESH_SEC = int(os.getenv("GIFTSTAT_REFRESH", "600"))
UNDERPRICED_PCT = float(os.getenv("UNDERPRICED_PCT", "0"))
STARS_PER_TON = float(os.getenv("STARS_PER_TON", "0"))

PORTALS_ENABLED = os.getenv("PORTALS_ENABLED", "0") not in ("0", "", "false", "False")
PORTALS_API = os.getenv("PORTALS_API", "https://portals-market.com/api/")
PORTALS_BOT = os.getenv("PORTALS_BOT", "portals")
PORTALS_AUTH_TTL = int(os.getenv("PORTALS_AUTH_TTL", "1800"))
PORTALS_SEARCH_LIMIT = int(os.getenv("PORTALS_SEARCH_LIMIT", "50"))
PORTALS_SEARCH_PAGES = int(os.getenv("PORTALS_SEARCH_PAGES", "3"))

TONNEL_ENABLED = os.getenv("TONNEL_ENABLED", "1") not in ("0", "", "false", "False")
TONNEL_API = os.getenv("TONNEL_API", "https://gifts2.tonnel.network/api")
TONNEL_SEARCH_LIMIT = int(os.getenv("TONNEL_SEARCH_LIMIT", "30"))

LOOKTG_AUTH = os.getenv("LOOKTG_AUTH", "")
LOOKTG_API = os.getenv("LOOKTG_API", "https://look.tg").rstrip("/")
LOOKTG_ENABLED = bool(LOOKTG_AUTH) and os.getenv("LOOKTG_ENABLED", "1") not in ("0", "", "false", "False")

KARTOSHKA_TOKEN = os.getenv("KARTOSHKA_TOKEN", "")
KARTOSHKA_API = os.getenv("KARTOSHKA_API", "https://kartoshka.free").rstrip("/")
KARTOSHKA_GIFT_PATH = os.getenv("KARTOSHKA_GIFT_PATH", "/v1/gift/{slug}/who")
# Minimum seconds between see.tg API requests (global). 5 = 1 request / 5s.
KARTOSHKA_MIN_INTERVAL = float(os.getenv("KARTOSHKA_MIN_INTERVAL", "1.0"))
KARTOSHKA_ENABLED = bool(KARTOSHKA_TOKEN) and os.getenv("KARTOSHKA_ENABLED", "1") not in ("0", "", "false", "False")

# ── Local gift DB feed (owners.db from gift_parser_bot) ──
# Mixes lots read from a local SQLite DB (resale_listings + owners) with live
# market lots at a fixed COUNT ratio, alternating. Default: 8 DB : 2 market,
# i.e. post 8 DB lots, then 2 market lots, repeating (Variant B).
GIFTDB_ENABLED = os.getenv("GIFTDB_ENABLED", "1") not in ("0", "", "false", "False")
GIFTDB_PATH = os.getenv("GIFTDB_PATH", "owners.db")
GIFTDB_RATIO_DB = int(os.getenv("GIFTDB_RATIO_DB", "8"))
GIFTDB_RATIO_MARKET = int(os.getenv("GIFTDB_RATIO_MARKET", "2"))
GIFTDB_BATCH = int(os.getenv("GIFTDB_BATCH", "200"))
GIFTDB_IDLE_SLEEP = float(os.getenv("GIFTDB_IDLE_SLEEP", "10"))
# "desc" = newest listings first (by posted_at); "asc" = oldest first.
GIFTDB_ORDER = os.getenv("GIFTDB_ORDER", "desc").strip().lower()
# Only feed DB lots whose seller has a public @username (same gate as market).
GIFTDB_REQUIRE_USERNAME = os.getenv("GIFTDB_REQUIRE_USERNAME", "1") not in ("0", "", "false", "False")
# unique_gift_id namespace offset so DB lots never collide with market ids.
# MUST stay positive -- the Claim callback matches ^claim:(\d+)$.
GIFTDB_ID_OFFSET = int(os.getenv("GIFTDB_ID_OFFSET", "9000000000000000"))
# Sentinel gift_id for DB lots so market delisting (keyed on gift_id) never
# touches them.
GIFTDB_GIFT_ID = -1
# Extra delay (seconds) after each DB-sourced post. Lets DB lots trickle out
# slower without slowing market posts. 0 = disabled.
GIFTDB_EXTRA_DELAY = float(os.getenv("GIFTDB_EXTRA_DELAY", "0"))


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("tracker")
console = Console()



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
            return f"TON:{self.owner_address[:8]}...{self.owner_address[-4:]}"
        if self.owner_id:
            return f"id:{self.owner_id}"
        return "hidden"

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
            reasons.append(f"level {self.level} > {MAX_SELLER_LEVEL}")
        if MAX_SELLER_NFT_COUNT and self.nft_count is not None and self.nft_count > MAX_SELLER_NFT_COUNT:
            reasons.append(f"NFT {self.nft_count} > {MAX_SELLER_NFT_COUNT}")
        return ", ".join(reasons)



_FATAL_ERRORS = (AuthKeyUnregisteredError, UserDeactivatedBanError, SessionRevokedError)


def _create_client(session_name: str) -> TelegramClient:
    return TelegramClient(
        session_name,
        API_ID,
        API_HASH,
        device_model=DEVICE_MODEL,
        system_version=SYSTEM_VERSION,
        app_version=APP_VERSION,
        lang_code=LANG_CODE,
        auto_reconnect=True,
        connection_retries=CONNECTION_RETRIES,
        retry_delay=RETRY_DELAY,
        flood_sleep_threshold=FLOOD_SLEEP_THRESHOLD,
    )


async def _api_call(client: TelegramClient, request, retries: int = 0, tag: str = ""):
    if retries <= 0:
        retries = API_CALL_RETRIES
    last_exc = None
    for attempt in range(retries):
        try:
            return await client(request)
        except FloodWaitError as e:
            if FLOOD_MAX_SLEEP and e.seconds > FLOOD_MAX_SLEEP:
                logger.error("[%s] FloodWait %ds > cap %ds -- skipping (account "
                             "likely rate-limited/spam-restricted)", tag,
                             e.seconds, FLOOD_MAX_SLEEP)
                raise
            logger.warning("[%s] FloodWait %ds, sleeping...", tag, e.seconds)
            await asyncio.sleep(e.seconds + 1)
        except _FATAL_ERRORS as e:
            logger.error("[%s] FATAL session error: %s", tag, e)
            raise
        except (ConnectionError, TimeoutError, OSError) as e:
            last_exc = e
            if attempt >= retries - 1:
                raise
            delay = min(2 ** (attempt + 1), 30)
            logger.warning("[%s] Network error: %s, retry #%d in %ds",
                           tag, type(e).__name__, attempt + 1, delay)
            await asyncio.sleep(delay)
            if not client.is_connected():
                try:
                    await client.connect()
                except Exception:
                    pass
        except RPCError:
            raise
        except Exception as e:
            last_exc = e
            if attempt >= retries - 1:
                raise
            delay = min(2 ** (attempt + 1), 10)
            logger.warning("[%s] Unexpected error: %s, retry #%d in %ds",
                           tag, e, attempt + 1, delay)
            await asyncio.sleep(delay)
    raise last_exc or RuntimeError(f"[{tag}] API call failed after {retries} retries")


async def _ensure_connected(client: TelegramClient, name: str) -> bool:
    try:
        if not client.is_connected():
            logger.warning("[%s] Disconnected, reconnecting...", name)
            await client.connect()
        if not await client.is_user_authorized():
            logger.error("[%s] Auth lost! Session may need re-login.", name)
            return False
        await client.get_me()
        return True
    except _FATAL_ERRORS as e:
        logger.error("[%s] Session permanently dead: %s", name, e)
        return False
    except Exception as e:
        logger.warning("[%s] Health check failed: %s, trying hard reconnect...", name, e)
        try:
            await client.disconnect()
        except Exception:
            pass
        await asyncio.sleep(2)
        try:
            await client.connect()
            me = await client.get_me()
            if me:
                logger.info("[%s] Reconnected successfully", name)
                return True
        except Exception as e2:
            logger.error("[%s] Reconnect failed: %s", name, e2)
        return False


def _backup_sessions():
    os.makedirs(SESSION_BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backed = 0
    for name in SESSION_NAMES:
        src = f"{name}.session"
        if os.path.exists(src):
            dst = os.path.join(SESSION_BACKUP_DIR, f"{name}_{ts}.session")
            latest = os.path.join(SESSION_BACKUP_DIR, f"{name}_latest.session")
            try:
                shutil.copy2(src, dst)
                shutil.copy2(src, latest)
                backed += 1
            except Exception as e:
                logger.warning("Backup %s failed: %s", src, e)
    bot_src = "gift_bot.session"
    if os.path.exists(bot_src):
        try:
            shutil.copy2(bot_src, os.path.join(SESSION_BACKUP_DIR, f"gift_bot_{ts}.session"))
            shutil.copy2(bot_src, os.path.join(SESSION_BACKUP_DIR, "gift_bot_latest.session"))
            backed += 1
        except Exception:
            pass
    _cleanup_old_backups()
    if backed:
        logger.info("Backed up %d session files to %s", backed, SESSION_BACKUP_DIR)


def _cleanup_old_backups():
    try:
        files_by_prefix: dict[str, list[str]] = {}
        for f in os.listdir(SESSION_BACKUP_DIR):
            if f.endswith(".session") and "_latest" not in f:
                prefix = f.rsplit("_", 2)[0] if f.count("_") >= 2 else f
                files_by_prefix.setdefault(prefix, []).append(f)
        for prefix, files in files_by_prefix.items():
            files.sort()
            for old in files[:-10]:
                try:
                    os.remove(os.path.join(SESSION_BACKUP_DIR, old))
                except Exception:
                    pass
    except Exception:
        pass




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
        cn = type(attr).__name__.lower()
        if "model" in cn:
            attrs.append(GiftAttribute("model", _safe_getattr(attr, "name", "?"),
                                       _safe_getattr(attr, "rarity_permille", 0) / 10.0))
        elif "pattern" in cn:
            attrs.append(GiftAttribute("pattern", _safe_getattr(attr, "name", "?"),
                                       _safe_getattr(attr, "rarity_permille", 0) / 10.0))
        elif "backdrop" in cn:
            attrs.append(GiftAttribute("backdrop", _safe_getattr(attr, "name", "?"),
                                       _safe_getattr(attr, "rarity_permille", 0) / 10.0))
    return attrs


def _extract_price(gift: TLObject) -> int:
    resell = _safe_getattr(gift, "resell_amount")
    if resell and isinstance(resell, (list, tuple)):
        for sa in resell:
            amt = _safe_getattr(sa, "amount")
            if amt and isinstance(amt, int) and amt > 0:
                return amt
    for field in ("transfer_star_count", "star_count", "stars"):
        val = _safe_getattr(gift, field)
        if val and isinstance(val, int) and val > 0:
            return val
    return 0


def _peer_to_id(peer) -> int | None:
    if peer is None:
        return None
    if hasattr(peer, "user_id"):
        return peer.user_id
    if hasattr(peer, "channel_id"):
        return peer.channel_id
    if isinstance(peer, int):
        return peer
    return None


def _resolve_owner(gift: TLObject, users_map: dict) -> tuple[int | None, str | None, str | None]:
    owner_name = _safe_getattr(gift, "owner_name")
    owner_username = None
    owner_id = _peer_to_id(_safe_getattr(gift, "owner_id"))

    if owner_id is None:
        owner_id = _peer_to_id(_safe_getattr(gift, "host_id"))

    if owner_id and owner_id in users_map:
        user = users_map[owner_id]
        owner_username = _safe_getattr(user, "username")
        if not owner_name:
            first = _safe_getattr(user, "first_name", "")
            last = _safe_getattr(user, "last_name", "")
            owner_name = f"{first} {last}".strip() or None

    return owner_id, owner_name, owner_username


async def get_gift_catalog(client: TelegramClient, tag: str = "") -> list[CollectionInfo]:
    try:
        result = await _api_call(
            client, functions.payments.GetStarGiftsRequest(hash=0), tag=tag or "catalog",
        )
    except _FATAL_ERRORS:
        raise
    except Exception as e:
        logger.error("Catalog error: %s", e)
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
            gift_id=gift_id, title=title_raw,
            slug=_safe_getattr(gift, "slug", None),
            total_issued=_safe_getattr(gift, "availability_total", 0) or 0,
            availability_remains=_safe_getattr(gift, "availability_remains", 0) or 0,
            star_count=_safe_getattr(gift, "stars", 0) or 0,
        ))
    logger.info("Catalog: %d collections", len(catalog))
    return catalog


async def resolve_owner_by_slug(
    client: TelegramClient, slug: str, tag: str = "",
) -> tuple[int | None, str | None, str | None, str | None]:
    if not slug:
        return None, None, None, None
    try:
        result = await _api_call(
            client,
            functions.payments.GetUniqueStarGiftRequest(slug=slug),
            tag=tag or f"slug:{slug}",
        )
    except _FATAL_ERRORS:
        raise
    except Exception as e:
        logger.debug("resolve_owner_by_slug(%s): %s", slug, e)
        return None, None, None, None

    gift = _safe_getattr(result, "gift")
    if gift is None:
        return None, None, None, None

    users_map = {}
    for user in _safe_getattr(result, "users", []):
        uid = _safe_getattr(user, "id")
        if uid:
            users_map[uid] = user

    owner_id, owner_name, owner_username = _resolve_owner(gift, users_map)
    gift_address = _safe_getattr(gift, "gift_address")
    owner_address = _safe_getattr(gift, "owner_address")

    return owner_id, owner_name, owner_username, gift_address or owner_address


_ton_ctx = ssl.create_default_context()


async def resolve_owner_via_ton(
    ton_address: str,
) -> tuple[int | None, str | None]:
    if not ton_address:
        return None, None
    try:
        url = f"https://tonapi.io/v2/nfts/{ton_address}"
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        resp = await asyncio.to_thread(
            urllib.request.urlopen, req, timeout=10, context=_ton_ctx,
        )
        data = json.loads(resp.read())
        wallet = data.get("owner", {}).get("address")
        if not wallet:
            return None, None
        url2 = f"https://tonapi.io/v2/accounts/{wallet}"
        req2 = urllib.request.Request(url2, headers={"Accept": "application/json"})
        resp2 = await asyncio.to_thread(
            urllib.request.urlopen, req2, timeout=10, context=_ton_ctx,
        )
        acct = json.loads(resp2.read())
        name = acct.get("name")
        icon = acct.get("icon")
        socials = acct.get("socials", [])
        for s in socials:
            if "t.me/" in s.get("url", ""):
                uname = s["url"].rstrip("/").split("/")[-1]
                if uname:
                    return None, uname
        if name:
            return None, None
    except Exception as e:
        logger.debug("TON resolve %s: %s", ton_address, e)
    return None, None


_TG_LINK_RE = re.compile(r'href="https?://t\.me/([^"?/]+)"')
_ROW_RE = re.compile(r'<tr[^>]*?>(.*?)</tr>', re.DOTALL)
_TH_RE = re.compile(r'<th[^>]*>(.*?)</th>', re.DOTALL)
_TD_RE = re.compile(r'<td[^>]*>(.*?)</td>', re.DOTALL)
_TAG_RE = re.compile(r'<[^>]+>')
_FRAG_OWNER_RE = re.compile(
    r'(?:owner|seller)["\s:]*(?:<[^>]+>)*\s*<a[^>]*href="https?://t\.me/([^"?/]+)"',
    re.IGNORECASE | re.DOTALL,
)


def _make_html_request(url: str) -> urllib.request.Request:
    return urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/125.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )


async def _fetch_html(url: str, timeout: int = 12) -> str | None:
    try:
        req = _make_html_request(url)
        resp = await asyncio.to_thread(
            urllib.request.urlopen, req, timeout=timeout, context=_ton_ctx,
        )
        return resp.read().decode("utf-8", errors="replace")
    except Exception:
        return None


def _parse_owner_from_html(html: str) -> tuple[str | None, str | None]:
    owner_cell = None
    for row_m in _ROW_RE.finditer(html):
        row = row_m.group(1)
        th_m = _TH_RE.search(row)
        if not th_m:
            continue
        label = _TAG_RE.sub("", th_m.group(1)).strip().lower()
        if "owner" in label:
            td_m = _TD_RE.search(row)
            if td_m:
                owner_cell = td_m.group(1)
            break

    if owner_cell:
        link_m = _TG_LINK_RE.search(owner_cell)
        if link_m:
            username = link_m.group(1)
            if username and username.lower() not in (
                "nft", "giftrelayer", "fragment", "ton",
            ):
                return username, None
        name = _TAG_RE.sub("", owner_cell).strip()
        name = re.sub(r'\s+', ' ', name).strip()
        if name:
            return None, name

    return None, None


async def resolve_owner_via_html(slug: str) -> tuple[str | None, str | None]:
    if not slug:
        return None, None
    try:
        html = await _fetch_html(f"https://t.me/nft/{slug}")
        if not html:
            return None, None
        uname, name = _parse_owner_from_html(html)
        if uname:
            logger.info("HTML(t.me) resolved %s -> @%s", slug, uname)
        elif name:
            logger.debug("HTML(t.me) %s: name '%s' (no link)", slug, name)
        return uname, name
    except Exception as e:
        logger.debug("HTML resolve %s: %s", slug, e)
    return None, None


async def resolve_owner_via_fragment(slug: str) -> tuple[str | None, str | None]:
    if not slug:
        return None, None
    for url in (
        f"https://fragment.com/gift/{slug}",
        f"https://fragment.com/nft/{slug}",
    ):
        try:
            html = await _fetch_html(url)
            if not html or len(html) < 200:
                continue
            m = _FRAG_OWNER_RE.search(html)
            if m:
                uname = m.group(1)
                if uname.lower() not in ("nft", "giftrelayer", "fragment", "ton"):
                    logger.info("Fragment resolved %s -> @%s", slug, uname)
                    return uname, None

            uname, name = _parse_owner_from_html(html)
            if uname:
                logger.info("Fragment(table) resolved %s -> @%s", slug, uname)
                return uname, name
            if name:
                return None, name
        except Exception as e:
            logger.debug("Fragment resolve %s (%s): %s", slug, url, e)
    return None, None


_SLUG_PARTS_RE = re.compile(r'^(.+?)-(\d+)$')


async def resolve_owner_via_fragment_json(slug: str) -> tuple[str | None, str | None]:
    if not slug:
        return None, None
    m = _SLUG_PARTS_RE.match(slug)
    if not m:
        return None, None
    gift_name, gift_num = m.group(1), m.group(2)
    urls = [
        f"https://nft.fragment.com/gift/{gift_name}-{gift_num}.json",
        f"https://fragment.com/gift/{gift_name}-{gift_num}.json",
    ]
    for url in urls:
        try:
            req = urllib.request.Request(url, headers={
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0",
            })
            resp = await asyncio.to_thread(
                urllib.request.urlopen, req, timeout=10, context=_ton_ctx,
            )
            data = json.loads(resp.read())
            owner = data.get("owner") or {}
            if isinstance(owner, str):
                if owner.startswith("@"):
                    uname = owner[1:]
                    if uname:
                        logger.info("FragmentJSON resolved %s -> @%s", slug, uname)
                        return uname, None
            else:
                uname = owner.get("username") or owner.get("telegram_username")
                oname = owner.get("name") or owner.get("telegram_name")
                if uname:
                    logger.info("FragmentJSON resolved %s -> @%s", slug, uname)
                    return uname, oname
                if oname:
                    return None, oname

            seller = data.get("seller") or {}
            if isinstance(seller, dict):
                uname = seller.get("username") or seller.get("telegram_username")
                sname = seller.get("name") or seller.get("telegram_name")
                if uname:
                    logger.info("FragmentJSON(seller) resolved %s -> @%s", slug, uname)
                    return uname, sname
                if sname:
                    return None, sname

            for key in ("owner_username", "seller_username", "telegram_username"):
                val = data.get(key)
                if val and isinstance(val, str):
                    uname = val.lstrip("@")
                    if uname:
                        logger.info("FragmentJSON(%s) resolved %s -> @%s", key, slug, uname)
                        return uname, None

            for key in ("owner_name", "seller_name", "name"):
                val = data.get(key)
                if val and isinstance(val, str):
                    return None, val

        except Exception as e:
            logger.debug("FragmentJSON %s (%s): %s", slug, url, e)
    return None, None


async def resolve_owner_via_ton_account(wallet_address: str) -> tuple[str | None, str | None]:
    if not wallet_address:
        return None, None
    try:
        url = f"https://tonapi.io/v2/accounts/{wallet_address}"
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        resp = await asyncio.to_thread(
            urllib.request.urlopen, req, timeout=10, context=_ton_ctx,
        )
        acct = json.loads(resp.read())
        for s in acct.get("socials", []):
            surl = s.get("url", "")
            if "t.me/" in surl:
                uname = surl.rstrip("/").split("/")[-1]
                if uname and uname.lower() not in ("nft", "fragment", "ton"):
                    logger.info("TON account socials %s -> @%s", wallet_address[:12], uname)
                    return uname, acct.get("name")
        name = acct.get("name")
        if name:
            return None, name
    except Exception as e:
        logger.debug("TON account resolve %s: %s", wallet_address[:12] if wallet_address else "", e)
    return None, None



_giftstat_floors: dict[str, float] = {}
_giftstat_model_floors: dict[str, float] = {}
_giftstat_ton_rate: float = 0.0
_giftstat_last_refresh: float = 0.0
_giftstat_lock = asyncio.Lock()


def _giftstat_get_sync(url: str):
    headers = {"Accept": "application/json", "User-Agent": "Mozilla/5.0"}
    if _HAS_CFFI:
        r = _cffi_requests.get(url, headers=headers, impersonate="chrome110", timeout=15)
        if r.status_code != 200:
            raise RuntimeError(f"giftstat http {r.status_code}")
        return r.json()
    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req, timeout=15, context=_ton_ctx)
    return json.loads(resp.read())


async def _giftstat_get(path: str, params: dict | None = None):
    url = GIFTSTAT_API + path
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v not in (None, "")})
    return await asyncio.to_thread(_giftstat_get_sync, url)


def _giftstat_rows(payload) -> list:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("data", "results", "items", "floorPrices", "floor_prices"):
            val = payload.get(key)
            if isinstance(val, list):
                return val
    return []


async def _refresh_giftstat() -> None:
    global _giftstat_ton_rate, _giftstat_last_refresh
    try:
        col = await _giftstat_get("/current/collections/floor", {
            "marketplace": GIFTSTAT_MARKETPLACE, "limit": 1000,
        })
        floors = {}
        for row in _giftstat_rows(col):
            if not isinstance(row, dict):
                continue
            price = row.get("floor_price") or row.get("floorPrice") or row.get("floor")
            if price in (None, ""):
                continue
            try:
                price = float(price)
            except (TypeError, ValueError):
                continue
            for key in (row.get("collection"), row.get("name"), row.get("slug")):
                if key:
                    floors[str(key).strip().lower()] = price
        if floors:
            _giftstat_floors.clear()
            _giftstat_floors.update(floors)
    except Exception as e:
        logger.warning("Giftstat collection floor refresh failed: %s", e)

    try:
        mod = await _giftstat_get("/current/collections/models/floor", {"limit": 5000})
        model_floors = {}
        for row in _giftstat_rows(mod):
            if not isinstance(row, dict):
                continue
            price = row.get("floor_price") or row.get("floorPrice") or row.get("floor")
            model = row.get("model") or row.get("model_name")
            coll = (row.get("collection_slug") or row.get("collection")
                    or row.get("slug") or row.get("name"))
            if price in (None, "") or not model or not coll:
                continue
            try:
                price = float(price)
            except (TypeError, ValueError):
                continue
            model_floors[f"{str(coll).strip().lower()}|{str(model).strip().lower()}"] = price
        if model_floors:
            _giftstat_model_floors.clear()
            _giftstat_model_floors.update(model_floors)
    except Exception as e:
        logger.debug("Giftstat model floor refresh: %s", e)

    try:
        rate = await _giftstat_get("/current/ton-rate")
        if isinstance(rate, dict):
            for key in ("rate", "price", "usd", "ton_usd", "value"):
                if rate.get(key):
                    _giftstat_ton_rate = float(rate[key])
                    break
        elif isinstance(rate, (int, float)):
            _giftstat_ton_rate = float(rate)
    except Exception as e:
        logger.debug("Giftstat ton-rate refresh: %s", e)

    _giftstat_last_refresh = time.time()
    logger.info(
        "Giftstat refreshed: %d collection floors, %d model floors, TON=%.3f",
        len(_giftstat_floors), len(_giftstat_model_floors), _giftstat_ton_rate,
    )


async def _ensure_giftstat_fresh() -> None:
    if not GIFTSTAT_ENABLED:
        return
    if (time.time() - _giftstat_last_refresh) < GIFTSTAT_REFRESH_SEC and _giftstat_floors:
        return
    async with _giftstat_lock:
        if (time.time() - _giftstat_last_refresh) < GIFTSTAT_REFRESH_SEC and _giftstat_floors:
            return
        await _refresh_giftstat()


def _lookup_floor(collection: str | None, model: str | None = None) -> float | None:
    if model and collection:
        mf = _giftstat_model_floors.get(
            f"{collection.strip().lower()}|{model.strip().lower()}"
        )
        if mf:
            return mf
    if collection:
        return _giftstat_floors.get(collection.strip().lower())
    return None


async def floor_context_for(listing: "ResaleListing") -> tuple[str | None, bool]:
    """Return (floor_note, is_underpriced) for a listing, best-effort."""
    if not GIFTSTAT_ENABLED:
        return None, False
    try:
        await _ensure_giftstat_fresh()
    except Exception:
        return None, False
    model = None
    for a in listing.attributes:
        if (a.type or "").strip().lower() in ("model", "модель"):
            model = a.name
            break
    floor = _lookup_floor(listing.title, model)
    if not floor:
        return None, False

    note = f"Floor: {floor:g} TON ({GIFTSTAT_MARKETPLACE})"
    if _giftstat_ton_rate:
        note += f" ~ ${floor * _giftstat_ton_rate:,.0f}"

    underpriced = False
    if STARS_PER_TON > 0 and UNDERPRICED_PCT > 0 and listing.price_stars:
        floor_stars = floor * STARS_PER_TON
        if floor_stars > 0:
            discount = (floor_stars - listing.price_stars) / floor_stars * 100
            if discount >= UNDERPRICED_PCT:
                underpriced = True
                note += f" | UNDERPRICED -{discount:.0f}%"
    return note, underpriced



try:
    from curl_cffi import requests as _cffi_requests
    _HAS_CFFI = True
except Exception:
    _HAS_CFFI = False

_portals_auth: str | None = None
_portals_auth_ts: float = 0.0
_portals_lock = asyncio.Lock()

_PORTALS_SORTS = {
    "price_asc": "&sort_by=price+asc",
    "latest": "&sort_by=listed_at+desc",
}

_PORTALS_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,ru;q=0.8",
    "Origin": "https://portals-market.com",
    "Referer": "https://portals-market.com/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    ),
}


async def _acquire_portals_auth(client: TelegramClient) -> str | None:
    try:
        bot = await client.get_entity(PORTALS_BOT)
    except Exception as e:
        logger.debug("Portals bot entity: %s", e)
        return None

    res = None
    try:
        res = await client(functions.messages.RequestMainWebViewRequest(
            peer=bot, bot=bot, platform="android",
        ))
    except Exception:
        try:
            res = await client(functions.messages.RequestWebViewRequest(
                peer=bot, bot=bot, platform="android",
                url="https://portals-market.com/",
            ))
        except Exception as e:
            logger.debug("Portals webview request: %s", e)
            return None

    url = getattr(res, "url", None)
    if not url:
        return None
    try:
        frag = urllib.parse.urlparse(url).fragment
        init_data = None
        for part in frag.split("&"):
            if part.startswith("tgWebAppData="):
                init_data = urllib.parse.unquote(part[len("tgWebAppData="):])
                break
        if not init_data:
            return None
        return f"tma {init_data}"
    except Exception as e:
        logger.debug("Portals initData parse: %s", e)
        return None


async def get_portals_auth(client: TelegramClient, force: bool = False) -> str | None:
    global _portals_auth, _portals_auth_ts
    if not PORTALS_ENABLED:
        return None
    async with _portals_lock:
        fresh = _portals_auth and (time.time() - _portals_auth_ts) < PORTALS_AUTH_TTL
        if fresh and not force:
            return _portals_auth
        auth = await _acquire_portals_auth(client)
        if auth:
            _portals_auth = auth
            _portals_auth_ts = time.time()
            logger.info("Portals auth acquired")
        return _portals_auth


def _portals_http_get(url: str, auth: str) -> dict | list | None:
    headers = dict(_PORTALS_HEADERS)
    headers["Authorization"] = auth
    if _HAS_CFFI:
        r = _cffi_requests.get(url, headers=headers, impersonate="chrome110", timeout=15)
        if r.status_code != 200:
            raise RuntimeError(f"portals http {r.status_code}")
        return r.json()
    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req, timeout=15, context=_ton_ctx)
    return json.loads(resp.read())


async def _portals_search(auth: str, collection_name: str) -> list:
    rows: list = []
    coll = urllib.parse.quote_plus((collection_name or "").strip())
    for page in range(max(1, PORTALS_SEARCH_PAGES)):
        offset = page * PORTALS_SEARCH_LIMIT
        url = (
            f"{PORTALS_API.rstrip('/')}/nfts/search?"
            f"offset={offset}&limit={PORTALS_SEARCH_LIMIT}"
            f"{_PORTALS_SORTS['price_asc']}"
            f"&filter_by_collections={coll}&status=listed"
        )
        try:
            payload = await asyncio.to_thread(_portals_http_get, url, auth)
        except Exception as e:
            logger.warning("Portals search '%s' p%d HTTP error: %s",
                           collection_name, page, e)
            break
        batch = []
        if isinstance(payload, dict):
            batch = payload.get("results") or payload.get("nfts") or []
        elif isinstance(payload, list):
            batch = payload
        if page == 0:
            logger.info("Portals search %r -> %d rows (page0)", coll, len(batch))
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < PORTALS_SEARCH_LIMIT:
            break
    return rows


def _portals_collection_candidates(
    collection_name: str | None, slug: str | None,
) -> list[str]:
    """Candidate values for Portals' filter_by_collections. Portals expects the
    Title-cased display name ("Plush Pepe"); we also try the raw title and the
    slug stem as fallbacks."""
    out: list[str] = []

    def add(v: str | None) -> None:
        v = (v or "").strip()
        if v and v not in out:
            out.append(v)

    if collection_name:
        add(collection_name.title())
        add(collection_name)
    if slug:
        m = _SLUG_PARTS_RE.match(slug)
        if m:
            add(m.group(1))
    return out


_PORTALS_OWNER_KEYS = ("owner_id", "tg_id", "owner", "user_id", "seller_id", "seller")


def _portals_find_owner(rows: list, num: int) -> int | None:
    for g in rows:
        if not isinstance(g, dict):
            continue
        ext = g.get("external_collection_number")
        if ext is None:
            continue
        try:
            if int(ext) != int(num):
                continue
        except (TypeError, ValueError):
            continue
        for k in _PORTALS_OWNER_KEYS:
            v = g.get(k)
            if isinstance(v, bool):
                continue
            if isinstance(v, int) and v > 0:
                return v
            if isinstance(v, str) and v.isdigit():
                return int(v)
            if isinstance(v, dict):
                for ik in ("id", "user_id", "tg_id"):
                    iv = v.get(ik)
                    if isinstance(iv, int) and iv > 0:
                        return iv
                    if isinstance(iv, str) and iv.isdigit():
                        return int(iv)
    return None


async def resolve_owner_via_portals(
    client: TelegramClient, collection_name: str | None, num: int | None,
    slug: str | None = None,
) -> tuple[int | None, str | None]:
    """Return (owner_id, None) of the hidden seller, via Portals Market.
    Portals exposes no owner name, so the second tuple slot is always None."""
    if not PORTALS_ENABLED or num is None:
        return None, None
    candidates = _portals_collection_candidates(collection_name, slug)
    if not candidates:
        return None, None
    auth = await get_portals_auth(client)
    if not auth:
        return None, None

    for cand in candidates:
        rows = await _portals_search(auth, cand)
        oid = _portals_find_owner(rows, num)
        if oid:
            logger.info(
                "Portals resolved %s #%s (filter=%r) -> owner_id=%s",
                collection_name, num, cand, oid,
            )
            return oid, None
    return None, None


_KARTOSHKA_OWNER_KEYS = ("username", "owner_username", "telegram_username")
_KARTOSHKA_ID_KEYS = ("id", "owner_id", "user_id", "tg_id", "telegram_id")


_kartoshka_rate_lock = asyncio.Lock()
_kartoshka_last_ts = 0.0


async def _kartoshka_rate_limit():
    global _kartoshka_last_ts
    if KARTOSHKA_MIN_INTERVAL <= 0:
        return
    async with _kartoshka_rate_lock:
        wait = KARTOSHKA_MIN_INTERVAL - (time.time() - _kartoshka_last_ts)
        if wait > 0:
            await asyncio.sleep(wait)
        _kartoshka_last_ts = time.time()


def _kartoshka_http_get(url: str) -> dict | list | None:
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {KARTOSHKA_TOKEN}",
        "User-Agent": "gift-tracker/1.0 (+https://kartoshka.free)",
    }
    if _HAS_CFFI:
        r = _cffi_requests.get(url, headers=headers, impersonate="chrome110", timeout=15)
        if r.status_code != 200:
            raise RuntimeError(f"kartoshka http {r.status_code}")
        return r.json()
    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req, timeout=15, context=_ton_ctx)
    return json.loads(resp.read())


def _kartoshka_owner_from(obj: dict) -> tuple[int | None, str | None, str | None]:
    if obj.get("hidden"):
        return None, None, obj.get("full_name") or obj.get("name")
    uname = None
    for k in _KARTOSHKA_OWNER_KEYS:
        v = obj.get(k)
        if isinstance(v, str) and v.strip():
            uname = v.strip().lstrip("@")
            break
    oid = None
    for k in _KARTOSHKA_ID_KEYS:
        v = obj.get(k)
        if isinstance(v, int) and v > 0:
            oid = v
            break
        if isinstance(v, str) and v.isdigit():
            oid = int(v)
            break
    name = obj.get("full_name") or obj.get("name")
    return oid, uname, name


async def resolve_owner_via_kartoshka(
    collection_name: str | None, num: int | None, slug: str | None = None,
) -> tuple[int | None, str | None, str | None]:
    """Owner via the official see.tg public API (kartoshka.free). Returns
    (owner_id, owner_username, owner_name)."""
    if not KARTOSHKA_ENABLED or num is None:
        return None, None, None
    path = KARTOSHKA_GIFT_PATH.format(
        collection=urllib.parse.quote(collection_name or ""),
        num=num,
        slug=urllib.parse.quote(slug or ""),
    )
    url = KARTOSHKA_API + path
    await _kartoshka_rate_limit()
    try:
        data = await asyncio.to_thread(_kartoshka_http_get, url)
    except Exception as e:
        logger.warning("kartoshka '%s' #%s: %s", collection_name, num, e)
        return None, None, None

    if isinstance(data, dict) and "ok" in data:
        if not data.get("ok"):
            return None, None, None
        data = data.get("result")

    records = []
    if isinstance(data, list):
        records = data
    elif isinstance(data, dict):
        for key in ("results", "gifts", "items", "data"):
            if isinstance(data.get(key), list):
                records = data[key]
                break
        else:
            records = [data]

    for rec in records:
        if not isinstance(rec, dict):
            continue
        # Only filter by num when the record carries a scalar gift number. For
        # /gift/{ref} the ref already identifies the gift (and result["number"]
        # is a classification object, not the num), so don't filter there.
        rec_num = rec.get("num")
        if rec_num is None and isinstance(rec.get("number"), (int, str)):
            rec_num = rec.get("number")
        if rec_num is not None and str(rec_num).lstrip("-").isdigit() and num is not None:
            if int(rec_num) != int(num):
                continue
        owner_obj = None
        for key in ("owner", "owner_info", "owners", "holder", "current_owner",
                    "currentOwner", "user", "seller", "ownerInfo"):
            v = rec.get(key)
            if isinstance(v, list) and v and isinstance(v[0], dict):
                owner_obj = v[0]
                break
            if isinstance(v, dict):
                owner_obj = v
                break
        if owner_obj is None:
            owner_obj = rec
        oid, uname, name = _kartoshka_owner_from(owner_obj)
        if oid or uname:
            logger.info("kartoshka resolved %s #%s -> id=%s @%s",
                        collection_name, num, oid, uname)
            return oid, uname, name
    return None, None, None


_LOOKTG_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://look.tg",
    "Referer": "https://look.tg/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    ),
}


def _looktg_http_get(url: str) -> dict | list | None:
    headers = dict(_LOOKTG_HEADERS)
    headers["Authorization"] = LOOKTG_AUTH
    if _HAS_CFFI:
        r = _cffi_requests.get(url, headers=headers, impersonate="chrome110", timeout=15)
        if r.status_code != 200:
            raise RuntimeError(f"looktg http {r.status_code}")
        return r.json()
    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req, timeout=15, context=_ton_ctx)
    return json.loads(resp.read())


async def resolve_owner_via_looktg(
    collection_name: str | None, num: int | None,
) -> tuple[int | None, str | None, str | None]:
    """Return (owner_id, owner_username, owner_name) from the look.tg/see.tg DB."""
    if not LOOKTG_ENABLED or not collection_name or num is None:
        return None, None, None
    url = (
        f"{LOOKTG_API}/api/getnftgifts?page=1&limit=20"
        f"&name={urllib.parse.quote(collection_name)}&number={num}"
    )
    try:
        data = await asyncio.to_thread(_looktg_http_get, url)
    except Exception as e:
        logger.warning("look.tg '%s' #%s: %s", collection_name, num, e)
        return None, None, None
    results = data.get("results") if isinstance(data, dict) else (data if isinstance(data, list) else [])
    for r in results or []:
        if not isinstance(r, dict):
            continue
        try:
            if int(r.get("number")) != int(num):
                continue
        except (TypeError, ValueError):
            continue
        owners = r.get("owner_info") or []
        if owners and isinstance(owners[0], dict):
            o = owners[0]
            if o.get("hidden"):
                return None, None, o.get("full_name")
            oid = o.get("id")
            uname = o.get("username")
            name = o.get("full_name")
            try:
                oid = int(oid) if oid else None
            except (TypeError, ValueError):
                oid = None
            if oid or uname:
                logger.info("look.tg resolved %s #%s -> id=%s @%s",
                            collection_name, num, oid, uname)
                return oid, uname, name
    return None, None, None



_TONNEL_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": "https://marketplace.tonnel.network",
    "Referer": "https://marketplace.tonnel.network/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
    ),
}

_TONNEL_OWNER_KEYS = ("seller", "owner", "owner_id", "user_id", "buyer")


def _tonnel_http_post(url: str, payload: dict) -> list | dict | None:
    body = json.dumps(payload).encode("utf-8")
    if _HAS_CFFI:
        r = _cffi_requests.post(
            url, data=body, headers=_TONNEL_HEADERS,
            impersonate="chrome110", timeout=15,
        )
        if r.status_code != 200:
            raise RuntimeError(f"tonnel http {r.status_code}")
        return r.json()
    req = urllib.request.Request(url, data=body, headers=_TONNEL_HEADERS, method="POST")
    resp = urllib.request.urlopen(req, timeout=15, context=_ton_ctx)
    return json.loads(resp.read())


def _tonnel_owner_from(gift: dict) -> int | None:
    for k in _TONNEL_OWNER_KEYS:
        v = gift.get(k)
        if isinstance(v, bool):
            continue
        if isinstance(v, int) and v > 0:
            return v
        if isinstance(v, str) and v.isdigit():
            return int(v)
        if isinstance(v, dict):
            for ik in ("id", "user_id", "tg_id", "telegram_id"):
                iv = v.get(ik)
                if isinstance(iv, int) and iv > 0:
                    return iv
                if isinstance(iv, str) and iv.isdigit():
                    return int(iv)
    return None


async def resolve_owner_via_tonnel(
    collection_name: str | None, num: int | None,
) -> tuple[int | None, str | None]:
    """Return (seller_id, None) from Tonnel, matched by collection + gift_num."""
    if not TONNEL_ENABLED or not collection_name or num is None:
        return None, None
    flt = {
        "price": {"$exists": True},
        "refunded": {"$ne": True},
        "buyer": {"$exists": False},
        "gift_name": collection_name,
        "asset": "TON",
    }
    payload = {
        "page": 1,
        "limit": TONNEL_SEARCH_LIMIT,
        "sort": json.dumps({"gift_num": 1}),
        "filter": json.dumps(flt),
        "price_range": None,
        "ref": 0,
        "user_auth": "",
    }
    try:
        data = await asyncio.to_thread(
            _tonnel_http_post, f"{TONNEL_API.rstrip('/')}/pageGifts", payload,
        )
    except Exception as e:
        logger.debug("Tonnel search '%s': %s", collection_name, e)
        return None, None
    rows = data if isinstance(data, list) else (data.get("gifts") or data.get("data") or [])
    for g in rows:
        if not isinstance(g, dict):
            continue
        gn = g.get("gift_num")
        try:
            if gn is not None and int(gn) == int(num):
                sid = _tonnel_owner_from(g)
                if sid:
                    logger.info(
                        "Tonnel resolved %s #%s -> seller_id=%s",
                        collection_name, num, sid,
                    )
                    return sid, None
        except (TypeError, ValueError):
            continue
    return None, None


async def resolve_username_to_id(
    client: TelegramClient, username: str, tag: str = "",
) -> int | None:
    if not username:
        return None
    try:
        entity = await _api_call(
            client,
            functions.contacts.ResolveUsernameRequest(username=username),
            tag=tag or f"resolve:@{username}",
        )
        if entity and hasattr(entity, "users") and entity.users:
            return entity.users[0].id
        if entity and hasattr(entity, "peer"):
            peer_id = _peer_to_id(entity.peer)
            if peer_id:
                return peer_id
    except _FATAL_ERRORS:
        raise
    except Exception as e:
        logger.debug("Resolve @%s: %s", username, e)
    try:
        ent = await client.get_entity(username)
        if ent and hasattr(ent, "id"):
            return ent.id
    except Exception:
        pass
    return None


async def _id_to_username(
    client: TelegramClient, user_id: int, tag: str = "",
) -> str | None:
    try:
        entity = await client.get_entity(user_id)
        return getattr(entity, "username", None)
    except Exception as e:
        logger.debug("id_to_username(%d): %s", user_id, e)
    return None


async def _verify_id_username(
    client: TelegramClient, user_id: int | None, username: str | None,
    tag: str = "",
) -> tuple[int | None, str | None]:
    if user_id and username:
        try:
            entity = await client.get_entity(username)
            eid = getattr(entity, "id", None)
            if eid == user_id:
                return user_id, username
            logger.debug(
                "ID/username mismatch: id=%s, @%s resolved to id=%s",
                user_id, username, eid,
            )
            return eid, username
        except Exception:
            pass
    if username and not user_id:
        rid = await resolve_username_to_id(client, username, tag=tag)
        return rid, username
    if user_id and not username:
        uname = await _id_to_username(client, user_id, tag=tag)
        return user_id, uname
    return user_id, username


async def _resolve_via_db(client, uname, uid, name, owner_name, tag):
    best = name or owner_name
    if uname and uid:
        return uid, best, uname
    if uname:
        rid = await resolve_username_to_id(client, uname, tag=tag)
        return rid, best, uname
    if uid:
        u = await _id_to_username(client, uid, tag=tag)
        return uid, best, u
    return None, best, None


async def resolve_owner_full(
    client: TelegramClient, listing_slug: str,
    listing_owner_address: str | None, tag: str = "",
    owner_name: str | None = None,
    collection_name: str | None = None, num: int | None = None,
) -> tuple[int | None, str | None, str | None]:
    if OWNER_SOURCE == "kartoshka":
        kid, kuname, kname = await resolve_owner_via_kartoshka(
            collection_name, num, slug=listing_slug,
        )
        return await _resolve_via_db(client, kuname, kid, kname, owner_name, tag)

    html_task = asyncio.create_task(resolve_owner_via_html(listing_slug))
    fragment_task = asyncio.create_task(resolve_owner_via_fragment(listing_slug))
    frag_json_task = asyncio.create_task(resolve_owner_via_fragment_json(listing_slug))
    slug_task = asyncio.create_task(
        resolve_owner_by_slug(client, listing_slug, tag=tag)
    )
    portals_task = asyncio.create_task(
        resolve_owner_via_portals(client, collection_name, num, slug=listing_slug)
    )
    kartoshka_task = asyncio.create_task(
        resolve_owner_via_kartoshka(collection_name, num, slug=listing_slug)
    )
    looktg_task = asyncio.create_task(
        resolve_owner_via_looktg(collection_name, num)
    )

    html_uname, html_name = await html_task
    frag_uname, frag_name = await fragment_task
    frag_json_uname, frag_json_name = await frag_json_task
    oid, oname, ouname, ton_addr = await slug_task
    portals_id, portals_name = await portals_task
    kartoshka_id, kartoshka_uname, kartoshka_name = await kartoshka_task
    looktg_id, looktg_uname, looktg_name = await looktg_task

    best_name = (oname or html_name or frag_name or frag_json_name
                 or portals_name or kartoshka_name or looktg_name or owner_name)

    for db_id, db_uname in ((kartoshka_id, kartoshka_uname),
                            (looktg_id, looktg_uname)):
        if db_uname or db_id:
            if db_uname and db_id:
                return db_id, best_name, db_uname
            if db_uname:
                rid = await resolve_username_to_id(client, db_uname, tag=tag)
                return rid, best_name, db_uname
            uname = await _id_to_username(client, db_id, tag=tag)
            return db_id, best_name, uname

    if portals_id:
        uname = await _id_to_username(client, portals_id, tag=tag)
        return portals_id, best_name, uname

    if oid:
        if ouname:
            verified_id, verified_uname = await _verify_id_username(
                client, oid, ouname, tag=tag,
            )
            return verified_id, best_name, verified_uname
        uname = await _id_to_username(client, oid, tag=tag)
        return oid, best_name, uname

    page_uname = html_uname or frag_uname or frag_json_uname or ouname
    if page_uname:
        verified_id, verified_uname = await _verify_id_username(
            client, None, page_uname, tag=tag,
        )
        return verified_id, best_name, verified_uname

    addr = ton_addr or listing_owner_address
    if addr:
        ton_nft_task = asyncio.create_task(resolve_owner_via_ton(addr))
        ton_acct_task = asyncio.create_task(resolve_owner_via_ton_account(addr))
        ton_id, ton_uname = await ton_nft_task
        ton_acct_uname, ton_acct_name = await ton_acct_task

        best_ton_uname = ton_uname or ton_acct_uname
        if not best_name and ton_acct_name:
            best_name = ton_acct_name

        if best_ton_uname:
            verified_id, verified_uname = await _verify_id_username(
                client, ton_id, best_ton_uname, tag=tag,
            )
            return verified_id, best_name, verified_uname
        if ton_id:
            uname = await _id_to_username(client, ton_id, tag=tag)
            if uname:
                return ton_id, best_name, uname

    return None, best_name, None


async def get_resale_listings(
    client: TelegramClient, gift_id: int,
    limit: int = 50, offset: str = "", sort_by_price: bool = False,
    tag: str = "",
) -> tuple[list[ResaleListing], str]:
    try:
        result = await _api_call(
            client,
            functions.payments.GetResaleStarGiftsRequest(
                gift_id=gift_id, offset=offset, limit=limit, sort_by_price=sort_by_price,
            ),
            tag=tag or f"listings:{gift_id}",
        )
    except AttributeError:
        logger.error("Telethon does not support GetResaleStarGiftsRequest (need layer 210+)")
        return [], ""
    except _FATAL_ERRORS:
        raise
    except Exception as e:
        logger.error("Listings gift_id=%d: %s", gift_id, e)
        return [], ""

    users_map = {}
    for user in _safe_getattr(result, "users", []):
        uid = _safe_getattr(user, "id")
        if uid:
            users_map[uid] = user

    gifts = _safe_getattr(result, "gifts", [])
    next_offset = _safe_getattr(result, "next_offset", "") or ""
    listings = []

    if gifts and logger.isEnabledFor(logging.DEBUG):
        g0 = gifts[0]
        logger.debug("TL class: %s", type(g0).__name__)
        for attr_name in dir(g0):
            if attr_name.startswith("_"):
                continue
            try:
                val = getattr(g0, attr_name)
                if not callable(val):
                    logger.debug("  %s = %r", attr_name, val)
            except Exception:
                pass

    for gift in gifts:
        unique_id = _safe_getattr(gift, "id")
        if unique_id is None:
            continue
        owner_id, owner_name, owner_username = _resolve_owner(gift, users_map)
        price = _extract_price(gift)
        listings.append(ResaleListing(
            unique_gift_id=unique_id, gift_id=gift_id,
            num=_safe_getattr(gift, "num"),
            slug=_safe_getattr(gift, "slug"),
            title=_safe_getattr(gift, "title", ""),
            owner_id=owner_id, owner_name=owner_name,
            owner_username=owner_username,
            owner_address=_safe_getattr(gift, "owner_address"),
            price_stars=price,
            attributes=_parse_attributes(gift),
        ))
    return listings, next_offset



_seller_cache: dict[int, SellerProfile] = {}


def _is_cached(user_id: int) -> bool:
    if user_id not in _seller_cache:
        return False
    return (time.time() - _seller_cache[user_id].checked_at) < SELLER_CACHE_TTL


async def get_user_level(client: TelegramClient, user_id: int, tag: str = "") -> int | None:
    try:
        full = await _api_call(
            client, functions.users.GetFullUserRequest(id=user_id),
            tag=tag or f"level:{user_id}",
        )
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
    except _FATAL_ERRORS:
        raise
    except Exception as e:
        logger.warning("Level user_id=%d: %s", user_id, e)
        return None


async def get_user_nft_count(client: TelegramClient, user_id: int, tag: str = "") -> int | None:
    try:
        try:
            result = await _api_call(
                client, functions.payments.GetSavedStarGiftsRequest(
                    peer=user_id, offset="", limit=100,
                ),
                tag=tag or f"nft:{user_id}",
            )
        except (AttributeError, TypeError):
            try:
                result = await _api_call(
                    client, functions.payments.GetUserStarGiftsRequest(
                        user_id=user_id, offset="", limit=100,
                    ),
                    tag=tag or f"nft:{user_id}",
                )
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
    except _FATAL_ERRORS:
        raise
    except Exception as e:
        logger.warning("NFT count user_id=%d: %s", user_id, e)
        return None


async def check_seller(client: TelegramClient, user_id: int, tag: str = "") -> SellerProfile:
    if _is_cached(user_id):
        return _seller_cache[user_id]
    level = await get_user_level(client, user_id, tag)
    nft_count = await get_user_nft_count(client, user_id, tag)
    username = first_name = None
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
    logger.info("Seller %s (id:%d): level=%s, nft=%s, pass=%s",
                username or "?", user_id, level, nft_count, profile.passes_filter)
    return profile


# Verify cache keyed by "@username" or "id:12345". Value:
#   {"valid": bool, "user_id": int|None, "username": str|None,
#    "nft_count": int|None, "entity_type": str, "checked_at": float}
_verify_cache: dict[str, dict] = {}
_verify_lock = asyncio.Lock()


async def _verify_seller(
    uname: str | None, uid: int | None, tag: str = "",
) -> tuple[bool, int | None, str | None, int | None, str]:
    """Three checks before posting a lot:
      1) The @username / user_id actually resolves on Telegram (not a dead
         handle that opens "Данного пользователя не существует").
      2) The resolved entity is a real User, not a Channel/Chat/bot.
      3) The user owns at least MIN_NFT_COUNT star-gifts (optional).
    Returns (valid, resolved_user_id, resolved_username, nft_count, reason).
    Both positive and negative results are cached so dead handles never cost
    more than one lookup per TTL."""
    if not VERIFY_SELLER:
        return (True, uid, uname, None, "disabled")
    key_uname = f"@{uname.lstrip('@').lower()}" if uname else None
    key_uid = f"id:{uid}" if uid else None
    key = key_uname or key_uid
    if key is None:
        return (False, None, None, None, "no_handle")

    now = time.time()
    for k in (key_uname, key_uid):
        if not k:
            continue
        cached = _verify_cache.get(k)
        if not cached:
            continue
        ttl = VERIFY_CACHE_TTL if cached["valid"] else VERIFY_NEG_CACHE_TTL
        if now - cached["checked_at"] < ttl:
            return (cached["valid"], cached["user_id"], cached["username"],
                    cached["nft_count"], cached.get("reason", "cache"))

    client = _next_userbot()
    if client is None:
        return (True, uid, uname, None, "no_userbot")

    async with _verify_lock:
        # re-check cache after taking the lock (another coro may have filled it)
        for k in (key_uname, key_uid):
            if not k:
                continue
            cached = _verify_cache.get(k)
            if cached and now - cached["checked_at"] < VERIFY_NEG_CACHE_TTL:
                return (cached["valid"], cached["user_id"], cached["username"],
                        cached["nft_count"], cached.get("reason", "cache"))

        entity_type = "none"
        resolved_uid = uid
        resolved_uname = uname.lstrip("@") if uname else None
        try:
            target = f"@{resolved_uname}" if resolved_uname else uid
            entity = await asyncio.wait_for(client.get_entity(target), timeout=15)
            etype = type(entity).__name__
            if etype == "User":
                if getattr(entity, "deleted", False):
                    entity_type = "deleted"
                elif getattr(entity, "bot", False):
                    entity_type = "bot"
                else:
                    entity_type = "user"
                    resolved_uid = entity.id
                    resolved_uname = getattr(entity, "username", None) or resolved_uname
            elif etype in ("Channel", "Chat", "ChannelForbidden", "ChatForbidden"):
                entity_type = "channel"
            else:
                entity_type = "other"
        except (ValueError, TypeError):
            entity_type = "none"
        except FloodWaitError as e:
            logger.warning("verify %s FloodWait %ds", key, e.seconds)
            return (True, uid, uname, None, "flood")
        except Exception as e:
            logger.debug("verify %s: %s", key, e)
            entity_type = "none"

        if REQUIRE_USER_ENTITY:
            valid_entity = (entity_type == "user")
        else:
            valid_entity = (entity_type != "none")

        nft_count: int | None = None
        if valid_entity and REQUIRE_HAS_NFTS and resolved_uid:
            try:
                nft_count = await asyncio.wait_for(
                    get_user_nft_count(client, resolved_uid, tag=tag), timeout=20,
                )
            except Exception as e:
                logger.debug("verify nft %s: %s", key, e)
                nft_count = None

        nft_pass = True
        if REQUIRE_HAS_NFTS:
            if nft_count is None or nft_count < max(1, MIN_NFT_COUNT):
                nft_pass = False
        elif MIN_NFT_COUNT and nft_count is not None and nft_count < MIN_NFT_COUNT:
            nft_pass = False

        valid = valid_entity and nft_pass
        reason = (f"entity={entity_type}"
                  + (f",nft={nft_count}" if REQUIRE_HAS_NFTS or MIN_NFT_COUNT else ""))

        rec = {"valid": valid, "user_id": resolved_uid, "username": resolved_uname,
               "nft_count": nft_count, "entity_type": entity_type,
               "reason": reason, "checked_at": now}
        if key_uname:
            _verify_cache[key_uname] = rec
        if key_uid and key_uid != key_uname:
            _verify_cache[key_uid] = rec
        return (valid, resolved_uid, resolved_uname, nft_count, reason)


_db_lock = asyncio.Lock()


async def init_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA busy_timeout=5000")
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
        CREATE TABLE IF NOT EXISTS owner_cache (
            slug           TEXT PRIMARY KEY,
            owner_id       INTEGER,
            owner_username TEXT,
            owner_name     TEXT,
            resolved_at    REAL
        );
        CREATE TABLE IF NOT EXISTS listing_messages (
            unique_gift_id INTEGER NOT NULL,
            chat_id        INTEGER NOT NULL,
            topic_id       INTEGER,
            message_id     INTEGER NOT NULL,
            PRIMARY KEY (unique_gift_id, chat_id, message_id)
        );
        CREATE TABLE IF NOT EXISTS bot_started (
            user_id    INTEGER PRIMARY KEY,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_listing_messages ON listing_messages(unique_gift_id);
        CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(is_active, gift_id);
        CREATE INDEX IF NOT EXISTS idx_listings_unique_id ON listings(unique_gift_id);
        CREATE INDEX IF NOT EXISTS idx_price_history_gift ON price_history(unique_gift_id, recorded_at);
    """)
    await db.commit()
    return db


async def upsert_listing(db, **kw) -> bool:
    uid = kw["unique_gift_id"]
    async with _db_lock:
        cursor = await db.execute(
            "SELECT id, price_stars FROM listings WHERE unique_gift_id=?", (uid,),
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
    async with _db_lock:
        await db.execute(
            "UPDATE listings SET log_message_id=? WHERE unique_gift_id=?",
            (message_id, unique_gift_id),
        )
        await db.commit()


async def add_listing_message(db, unique_gift_id, chat_id, topic_id, message_id):
    async with _db_lock:
        await db.execute(
            "INSERT OR REPLACE INTO listing_messages "
            "(unique_gift_id, chat_id, topic_id, message_id) VALUES (?,?,?,?)",
            (unique_gift_id, chat_id, topic_id, message_id),
        )
        await db.commit()


async def get_listing_messages(db, unique_gift_id) -> list[tuple[int, int]]:
    cursor = await db.execute(
        "SELECT chat_id, message_id FROM listing_messages WHERE unique_gift_id=?",
        (unique_gift_id,),
    )
    return [(r[0], r[1]) for r in await cursor.fetchall()]


async def mark_bot_started(db, user_id: int):
    async with _db_lock:
        await db.execute(
            "INSERT OR IGNORE INTO bot_started (user_id) VALUES (?)", (user_id,),
        )
        await db.commit()


async def has_started_bot(db, user_id: int) -> bool:
    cursor = await db.execute(
        "SELECT 1 FROM bot_started WHERE user_id=?", (user_id,),
    )
    return await cursor.fetchone() is not None


async def get_cached_owner(db, slug: str | None) -> dict | None:
    if not slug:
        return None
    cursor = await db.execute(
        "SELECT owner_id, owner_username, owner_name, resolved_at "
        "FROM owner_cache WHERE slug=?", (slug,),
    )
    row = await cursor.fetchone()
    if not row:
        return None
    owner_id, owner_username, owner_name, resolved_at = row
    age = time.time() - (resolved_at or 0)
    positive = bool(owner_id or owner_username)
    if positive:
        if OWNER_CACHE_TTL > 0 and age > OWNER_CACHE_TTL:
            return None
    else:
        if OWNER_CACHE_NEG_TTL > 0 and age > OWNER_CACHE_NEG_TTL:
            return None
    return {"owner_id": owner_id, "owner_username": owner_username,
            "owner_name": owner_name}


async def set_cached_owner(db, slug, owner_id, owner_username, owner_name):
    if not slug:
        return
    async with _db_lock:
        await db.execute(
            "INSERT INTO owner_cache (slug, owner_id, owner_username, owner_name, resolved_at) "
            "VALUES (?,?,?,?,?) "
            "ON CONFLICT(slug) DO UPDATE SET owner_id=excluded.owner_id, "
            "owner_username=excluded.owner_username, owner_name=excluded.owner_name, "
            "resolved_at=excluded.resolved_at",
            (slug, owner_id, owner_username, owner_name, time.time()),
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
    async with _db_lock:
        await db.execute(
            "UPDATE listings SET claimed_by=?, claimed_at=CURRENT_TIMESTAMP WHERE unique_gift_id=?",
            (claimed_by, unique_gift_id),
        )
        await db.commit()


async def mark_delisted(db, active_ids: set[int], gift_id: int) -> list[dict]:
    async with _db_lock:
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
    async with _db_lock:
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




def format_stars(amount: int) -> str:
    if amount >= 1_000_000:
        return f"{amount / 1_000_000:.1f}M Stars"
    if amount >= 1_000:
        return f"{amount / 1_000:.1f}K Stars"
    return f"{amount} Stars"


def print_new_listing(listing: ResaleListing, session_tag: str = ""):
    owner = listing.owner_display
    attrs = ", ".join(f"{a.type}: {a.name} ({a.rarity_percent:.1f}%)" for a in listing.attributes)
    t = Text()
    if session_tag:
        t.append(f"[{session_tag}] ", style="dim magenta")
    t.append("Collection: ", style="dim")
    t.append(f"{listing.title}\n", style="bold")
    t.append("Num: ", style="dim")
    t.append(f"#{listing.num}\n" if listing.num else "--\n")
    t.append("Price: ", style="dim")
    t.append(f"{format_stars(listing.price_stars)}\n", style="bold yellow")
    t.append("Owner: ", style="dim")
    t.append(f"{owner}\n", style="bold cyan" if listing.owner_username else "")
    if attrs:
        t.append("Attrs: ", style="dim")
        t.append(f"{attrs}\n")
    if listing.gift_link:
        t.append("Link: ", style="dim")
        t.append(listing.gift_link, style="underline blue")
    console.print(Panel(t, title="NEW LISTING", border_style="green"))


def print_delisted(info: dict):
    console.print(
        f"  [red]X[/] [dim]Delisted:[/] {info.get('title', '?')} "
        f"#{info.get('num', '?')} [dim]{format_stars(info.get('price_stars', 0))}[/]"
    )


def print_stats(stats: dict):
    console.print(Panel(
        f"[bold]Active:[/] {stats['active_listings']}\n"
        f"[bold]Total:[/] {stats['total_seen']}\n"
        f"[bold]Collections:[/] {stats['collections_tracked']}\n"
        f"[bold]Claimed:[/] {stats['total_claimed']}",
        title="Stats", border_style="blue",
    ))



_db_ref = None
_userbots: list[TelegramClient] = []
_userbot_rr = 0

FOOTER = "\n\n<i>Dev by fiesta</i>"


def _next_userbot() -> TelegramClient | None:
    global _userbot_rr
    if not _userbots:
        return None
    ub = _userbots[_userbot_rr % len(_userbots)]
    _userbot_rr += 1
    return ub


def set_dependencies(db, userbots: list[TelegramClient]):
    global _db_ref, _userbots
    _db_ref = db
    _userbots = userbots


async def _prime_branch_chat(bot):
    """Make the bot able to resolve the supergroup by id. A bot can only send
    to a channel it is a member of; this caches its entity so send_message by
    id works instead of failing with 'Could not find the input entity'."""
    try:
        await bot.get_entity(BRANCH_CHAT_ID)
        console.print(f"[green]Branch chat resolved:[/] {BRANCH_CHAT_ID}")
        return
    except Exception:
        pass
    try:
        raw = str(BRANCH_CHAT_ID)
        raw_id = int(raw[4:]) if raw.startswith("-100") else int(raw)
        await bot(functions.channels.GetChannelsRequest(
            [types.InputChannel(channel_id=raw_id, access_hash=0)]
        ))
        await bot.get_entity(BRANCH_CHAT_ID)
        console.print(f"[green]Branch chat resolved:[/] {BRANCH_CHAT_ID}")
    except Exception as e:
        console.print(f"[bold red]Cannot resolve branch chat {BRANCH_CHAT_ID}:[/] {e}")
        console.print("[yellow]Add the bot to that supergroup as ADMIN (with "
                      "post rights in topics), then restart.[/]")


def create_bot() -> TelegramClient:
    bot = _create_client("gift_bot")

    @bot.on(events.NewMessage(pattern=r"^/start"))
    async def on_start(event):
        if event.is_private:
            await mark_bot_started(_db_ref, event.sender_id)
            try:
                await event.respond(
                    "Готово. Теперь можешь занимать лоты (Claim) в каналах.",
                )
            except Exception:
                pass

    @bot.on(events.CallbackQuery(pattern=rb"^claim:(\d+)$"))
    async def on_claim(event):
        await _handle_claim(bot, event)

    return bot



def _build_listing_text(
    listing: ResaleListing, seller_level=None, seller_nft=None,
    floor_note: str | None = None,
) -> str:
    attrs = "\n".join(
        f"  - {a.type}: <b>{a.name}</b> ({a.rarity_percent:.1f}%)" for a in listing.attributes
    )
    if listing.owner_username:
        seller_line = (
            f'Seller: <a href="https://t.me/{listing.owner_username}">'
            f'@{listing.owner_username}</a>'
        )
    elif listing.owner_id:
        label = listing.owner_name or f"id {listing.owner_id}"
        seller_line = (
            f'Seller: <a href="tg://user?id={listing.owner_id}">{label}</a>'
        )
    else:
        seller_line = f"Seller: <code>{listing.owner_display}</code>"
    if listing.gift_link:
        title_line = (f'<a href="{listing.gift_link}"><b>{listing.title}</b> '
                      f'#{listing.num or "?"}</a>')
    else:
        title_line = f"<b>{listing.title}</b> #{listing.num or '?'}"
    lines = [
        "<b>New listing</b>", "",
        title_line,
        f"Price: <b>{format_stars(listing.price_stars)}</b>",
        seller_line,
    ]
    if floor_note:
        lines.append(floor_note)
    parts = []
    if seller_level is not None:
        parts.append(f"Level: {seller_level}")
    if seller_nft is not None:
        parts.append(f"NFT: {seller_nft}")
    if parts:
        lines.append(f"{' | '.join(parts)}")
    if attrs:
        lines.append(f"Attributes:\n{attrs}")
    lines.append(FOOTER)
    return "\n".join(lines)


def _build_buttons(listing: ResaleListing, tg_user: bool = True) -> list[list[Button]]:
    """The "Seller profile" button ALWAYS opens the gift owner's Telegram
    profile -- never the NFT card:
      1. @username -> https://t.me/<username>  (opens the owner's profile/chat)
      2. owner_id  -> tg://user?id=<id>         (opens the owner's profile by id,
                       no username needed)
    If the owner is not resolved yet, no seller button is shown (only Claim) --
    we never substitute the gift card for it. `tg_user=False` is the
    ButtonUrlInvalidError fallback (drops the tg:// button).
    """
    row = []
    if listing.owner_username:
        row.append(Button.url(
            "Seller profile",
            f"https://t.me/{listing.owner_username}",
        ))
    elif tg_user and listing.owner_id:
        row.append(Button.url(
            "Seller profile",
            f"tg://user?id={listing.owner_id}",
        ))
    row.append(Button.inline("Claim", data=f"claim:{listing.unique_gift_id}".encode()))
    return [row]


async def _emit_with_buttons(send_fn, listing: ResaleListing):
    """Send/edit a listing message, retrying without the tg://user button if
    Telegram rejects it (ButtonUrlInvalidError)."""
    try:
        return await send_fn(_build_buttons(listing, tg_user=True))
    except ButtonUrlInvalidError:
        return await send_fn(_build_buttons(listing, tg_user=False))


def _build_claimed_text(title, num, price_stars, owner_display, claimer_name) -> str:
    return "\n".join([
        f"<b>{title}</b> #{num or '?'}",
        f"Price: <b>{format_stars(price_stars)}</b>",
        f"Seller: <code>{owner_display}</code>",
        "",
        f"<b>Claimed</b> by {claimer_name}",
        FOOTER,
    ])


_send_lock = asyncio.Lock()
_last_post_ts = 0.0


def _branches_for(listing: ResaleListing) -> list[tuple[int, int | None]]:
    """Per-branch routing (independent filters):
      all  -> every listing
      rich -> only RICH_COLLECTIONS whitelist (price-independent). If the
              whitelist is empty, falls back to RICH_MIN_STARS by price.
      poor -> only lots with price <= POOR_MAX_STARS (price-only, any collection)
      black -> only BLACK_COLLECTIONS."""
    title_norm = (listing.title or "").strip().lower()
    price = listing.price_stars or 0
    topics: list[int] = [TOPIC_ALL]
    rich_wl = {t.strip().lower() for t in RICH_COLLECTIONS} if RICH_COLLECTIONS else set()
    if rich_wl:
        if title_norm in rich_wl:
            topics.append(TOPIC_RICH)
    elif RICH_MIN_STARS and price >= RICH_MIN_STARS:
        topics.append(TOPIC_RICH)
    if POOR_MAX_STARS and price <= POOR_MAX_STARS:
        topics.append(TOPIC_POOR)
    if BLACK_COLLECTIONS and title_norm in BLACK_COLLECTIONS:
        topics.append(TOPIC_BLACK)
    out: list[tuple[int, int | None]] = []
    seen: set[int] = set()
    for t in topics:
        if t and t not in seen:
            seen.add(t)
            out.append((BRANCH_CHAT_ID, t))
    if not out and LOG_GROUP_ID:
        out.append((LOG_GROUP_ID, None))
    return out


async def _post_throttle():
    """Pace posts to roughly POSTS_PER_MIN. Called while holding _send_lock."""
    global _last_post_ts
    if POSTS_PER_MIN <= 0:
        return
    min_gap = 60.0 / POSTS_PER_MIN
    wait = min_gap - (time.time() - _last_post_ts)
    if wait > 0:
        await asyncio.sleep(wait)
    _last_post_ts = time.time()


@dataclass
class _PostItem:
    listing: "ResaleListing"
    seller_level: int | None = None
    seller_nft: int | None = None
    floor_note: str | None = None
    source: str = "market"


class _PostMixer:
    """Interleaves DB-sourced and market-sourced listings at a fixed COUNT
    ratio (default 8 DB : 2 market), alternating. A single consumer drains it,
    so all posting stays serialized and paced by POSTS_PER_MIN. If the slot's
    queue is empty, it borrows from the other side instead of stalling (the DB
    is effectively infinite, so in practice the market just fills its 2 slots
    whenever it has fresh lots, and DB fills the rest)."""

    def __init__(self, db_n: int, market_n: int, maxsize: int = 5000):
        self._q = {
            "db": asyncio.Queue(maxsize),
            "market": asyncio.Queue(maxsize),
        }
        self._pattern = ["db"] * max(0, db_n) + ["market"] * max(0, market_n)
        if not self._pattern:
            self._pattern = ["market"]
        self._pos = 0

    async def put(self, source: str, item: "_PostItem"):
        await self._q[source].put(item)

    async def get(self) -> "_PostItem | None":
        while True:
            primary = self._pattern[self._pos % len(self._pattern)]
            other = "market" if primary == "db" else "db"
            for src in (primary, other):
                try:
                    item = self._q[src].get_nowait()
                    self._pos += 1
                    return item
                except asyncio.QueueEmpty:
                    continue
            await asyncio.sleep(0.4)


_post_mixer = _PostMixer(GIFTDB_RATIO_DB, GIFTDB_RATIO_MARKET)


async def send_listing_to_chat(
    bot, chat_id, listing, seller_level=None, seller_nft=None, floor_note=None,
    topic_id: int | None = None,
) -> int | None:
    if not chat_id:
        return None
    text = _build_listing_text(listing, seller_level, seller_nft, floor_note=floor_note)
    async with _send_lock:
        await _post_throttle()
        for attempt in range(3):
            try:
                msg = await _emit_with_buttons(
                    lambda b: bot.send_message(
                        chat_id, text, buttons=b, reply_to=topic_id,
                        parse_mode="html", link_preview=GIFT_PREVIEW,
                    ),
                    listing,
                )
                return msg.id
            except FloodWaitError as e:
                logger.warning("Send FloodWait %ds, sleeping...", e.seconds)
                await asyncio.sleep(e.seconds + 1)
            except (ConnectionError, TimeoutError, OSError) as e:
                if attempt >= 2:
                    logger.error("Send to %s failed after retries: %s", chat_id, e)
                    return None
                await asyncio.sleep(2 ** (attempt + 1))
                if not bot.is_connected():
                    try:
                        await bot.connect()
                    except Exception:
                        pass
            except Exception as e:
                logger.error("Send to %s: %s", chat_id, e)
                return None
    return None


_claim_times: dict[int, list[float]] = {}


def _claim_cooldown_ok(user_id: int) -> bool:
    now = time.time()
    times = [t for t in _claim_times.get(user_id, []) if now - t < CLAIM_WINDOW_SEC]
    if len(times) >= CLAIM_MAX_PER_WINDOW:
        _claim_times[user_id] = times
        return False
    times.append(now)
    _claim_times[user_id] = times
    return True


async def _handle_claim(bot, event):
    unique_gift_id = int(event.pattern_match.group(1))
    claimer = await event.get_sender()
    claimer_id = claimer.id
    claimer_name = (
        f"@{claimer.username}" if claimer.username
        else (claimer.first_name or f"id:{claimer_id}")
    )

    if REQUIRE_START and not await has_started_bot(_db_ref, claimer_id):
        start_link = f"https://t.me/{BOT_USERNAME}?start=1" if BOT_USERNAME else "the bot"
        await event.answer(
            f"Сначала нажмите /start у бота: {start_link}", alert=True,
        )
        return

    if not _claim_cooldown_ok(claimer_id):
        await event.answer(
            f"Слишком быстро. Лимит {CLAIM_MAX_PER_WINDOW} лотов "
            f"за {CLAIM_WINDOW_SEC}с.", alert=True,
        )
        return

    listing_data = await get_listing_by_unique_id(_db_ref, unique_gift_id)
    if not listing_data:
        await event.answer("Listing not found", alert=True)
        return
    if listing_data["claimed_by"]:
        await event.answer("Уже занято", alert=True)
        return

    await set_claimed(_db_ref, unique_gift_id, claimer_id)

    owner_id = listing_data["owner_id"]
    owner_username = listing_data.get("owner_username")
    dm_target = owner_id or (f"@{owner_username}" if owner_username else None)
    dm_sent = False
    userbot = _next_userbot()
    if CLAIM_DM_SELLER and userbot and dm_target:
        try:
            dm_text = CLAIM_DM_TEMPLATE.format(
                title=listing_data["title"] or "gift",
                num=listing_data["num"] or "?",
                price=listing_data["price_stars"],
                link=f"https://t.me/nft/{listing_data['slug']}" if listing_data["slug"] else "",
            )
            await userbot.send_message(dm_target, dm_text)
            dm_sent = True
        except FloodWaitError as e:
            logger.warning("DM FloodWait %ds", e.seconds)
            await asyncio.sleep(e.seconds + 1)
            try:
                await userbot.send_message(dm_target, dm_text)
                dm_sent = True
            except Exception as e2:
                logger.warning("DM retry failed: %s", e2)
        except Exception as e:
            logger.warning("DM to seller %s: %s", dm_target, e)

    owner_display = (
        f"@{listing_data['owner_username']}" if listing_data.get("owner_username")
        else listing_data.get("owner_name")
        or (f"id:{owner_id}" if owner_id else "hidden")
    )

    claimed_text = _build_claimed_text(
        listing_data["title"] or "?", listing_data["num"],
        listing_data["price_stars"], owner_display, claimer_name,
    )
    msgs = await get_listing_messages(_db_ref, unique_gift_id)
    if (event.chat_id, event.message_id) not in msgs:
        msgs.append((event.chat_id, event.message_id))
    for chat_id, mid in msgs:
        try:
            await bot.edit_message(
                chat_id, mid, claimed_text, buttons=None, parse_mode="html",
                link_preview=False,
            )
        except Exception as e:
            logger.debug("Claim edit %s/%s: %s", chat_id, mid, e)

    try:
        if owner_username:
            seller_ref = f"@{owner_username}"
            dm_buttons = [[Button.url("Seller profile", f"https://t.me/{owner_username}")]]
        elif owner_id:
            seller_ref = f'<a href="tg://user?id={owner_id}">продавец</a>'
            dm_buttons = None
        else:
            seller_ref = "—"
            dm_buttons = None
        gift_link = f"https://t.me/nft/{listing_data['slug']}" if listing_data.get("slug") else ""
        claimer_dm = (
            f"Ты занял лот:\n"
            f"<b>{listing_data['title'] or '?'}</b> #{listing_data['num'] or '?'}\n"
            f"Цена: <b>{format_stars(listing_data['price_stars'])}</b>\n"
            f"Продавец: {seller_ref}"
        )
        if gift_link:
            claimer_dm += f'\n<a href="{gift_link}">Открыть подарок</a>'
        await bot.send_message(
            claimer_id, claimer_dm, parse_mode="html",
            link_preview=False, buttons=dm_buttons,
        )
    except Exception as e:
        logger.warning("Claim DM to claimer %s: %s", claimer_id, e)

    status = "Занято! Лот отправлен тебе в личку." if dm_sent else "Занято! Лот в личке."
    await event.answer(status, alert=True)



_running = True


def _handle_signal(signum, frame):
    global _running
    _running = False
    console.print("\n[bold red]Stopping tracker...[/]")


def _passes_price_filter(listing: ResaleListing) -> bool:
    if MIN_PRICE_STARS and listing.price_stars < MIN_PRICE_STARS:
        return False
    if MAX_PRICE_STARS and listing.price_stars > MAX_PRICE_STARS:
        return False
    # Troll listings: >100000 Stars is basically "do-not-buy" sentinel pricing.
    if listing.price_stars and listing.price_stars > 100000:
        return False
    return True


async def poll_collection(
    userbot: TelegramClient, bot, db, gift_id: int,
    collection_title: str, session_tag: str,
) -> tuple[int, int, int]:
    new_count = 0
    updated_count = 0
    all_active_ids: set[int] = set()
    offset = ""
    page = 0

    while True:
        listings, next_offset = await get_resale_listings(
            userbot, gift_id, limit=MAX_GIFTS_PER_PAGE, offset=offset,
            tag=session_tag,
        )
        if not listings:
            break
        for listing in listings:
            all_active_ids.add(listing.unique_gift_id)
            if MAX_NEW_PER_COLLECTION and new_count >= MAX_NEW_PER_COLLECTION:
                continue
            if not _passes_price_filter(listing):
                continue

            is_new = await upsert_listing(
                db,
                unique_gift_id=listing.unique_gift_id,
                gift_id=listing.gift_id,
                num=listing.num, slug=listing.slug, title=listing.title,
                owner_id=listing.owner_id, owner_name=listing.owner_name,
                owner_username=listing.owner_username,
                owner_address=listing.owner_address,
                price_stars=listing.price_stars,
                attributes_json=listing.attributes_json,
                seller_level=None, seller_nft_count=None,
            )
            if not is_new:
                updated_count += 1
                continue

            new_count += 1
            print_new_listing(listing, session_tag)

            # Resolve the owner BEFORE posting so we can gate on username and
            # post the final message once (no post-then-edit).
            if listing.owner_id is None and listing.owner_username is None and listing.slug:
                cached = await get_cached_owner(db, listing.slug)
                if cached is not None:
                    oid = cached["owner_id"]
                    ouname = cached["owner_username"]
                    oname = cached["owner_name"]
                    src = "cache"
                else:
                    oid, oname, ouname = await resolve_owner_full(
                        userbot, listing.slug, listing.owner_address,
                        tag=session_tag, owner_name=listing.owner_name,
                        collection_name=listing.title, num=listing.num,
                    )
                    await set_cached_owner(db, listing.slug, oid, ouname, oname)
                    src = "resolve"
                logger.info("OWNER %s #%s -> id=%s username=%s (%s)",
                            listing.title, listing.num, oid, ouname, src)
                if oid or ouname:
                    listing = ResaleListing(
                        unique_gift_id=listing.unique_gift_id,
                        gift_id=listing.gift_id,
                        num=listing.num, slug=listing.slug, title=listing.title,
                        owner_id=oid or listing.owner_id,
                        owner_name=oname or listing.owner_name,
                        owner_username=ouname or listing.owner_username,
                        owner_address=listing.owner_address,
                        price_stars=listing.price_stars,
                        attributes=listing.attributes,
                    )

            # Only post lots we can open a chat with: require a @username.
            if REQUIRE_USERNAME and not listing.owner_username:
                continue

            # Verify seller: @username/user_id resolves, entity is a real User
            # (not Channel/bot), and (optional) they own at least one NFT.
            if VERIFY_SELLER and (listing.owner_username or listing.owner_id):
                v_ok, v_uid, v_uname, v_nft, v_reason = await _verify_seller(
                    listing.owner_username, listing.owner_id, tag=session_tag,
                )
                if not v_ok:
                    logger.info("VERIFY SKIP %s #%s: @%s id=%s (%s)",
                                listing.title, listing.num,
                                listing.owner_username, listing.owner_id, v_reason)
                    continue
                if v_uname and v_uname != listing.owner_username:
                    listing = ResaleListing(
                        unique_gift_id=listing.unique_gift_id,
                        gift_id=listing.gift_id,
                        num=listing.num, slug=listing.slug, title=listing.title,
                        owner_id=v_uid or listing.owner_id,
                        owner_name=listing.owner_name,
                        owner_username=v_uname,
                        owner_address=listing.owner_address,
                        price_stars=listing.price_stars,
                        attributes=listing.attributes,
                    )

            seller_level = seller_nft = None
            if listing.owner_id and (MAX_SELLER_LEVEL or MAX_SELLER_NFT_COUNT):
                seller = await check_seller(userbot, listing.owner_id, tag=session_tag)
                seller_level = seller.level
                seller_nft = seller.nft_count
                if not seller.passes_filter:
                    continue

            await upsert_listing(
                db,
                unique_gift_id=listing.unique_gift_id,
                gift_id=listing.gift_id,
                num=listing.num, slug=listing.slug, title=listing.title,
                owner_id=listing.owner_id, owner_name=listing.owner_name,
                owner_username=listing.owner_username,
                owner_address=listing.owner_address,
                price_stars=listing.price_stars,
                attributes_json=listing.attributes_json,
                seller_level=seller_level, seller_nft_count=seller_nft,
            )

            floor_note, _underpriced = await floor_context_for(listing)
            # Hand the lot to the 8:2 mixer; the single consumer does the
            # branch fan-out + message recording (so counts stay honest and
            # posting stays paced by POSTS_PER_MIN).
            await _post_mixer.put(
                "market",
                _PostItem(listing, seller_level, seller_nft, floor_note, "market"),
            )

        page += 1
        if not next_offset or page >= 3:
            break
        if MAX_NEW_PER_COLLECTION and new_count >= MAX_NEW_PER_COLLECTION:
            break
        offset = next_offset

    delisted = await mark_delisted(db, all_active_ids, gift_id)
    for info in delisted:
        print_delisted(info)
    return new_count, updated_count, len(delisted)


async def _poll_session_batch(
    userbot: TelegramClient, bot, db,
    collections: list[CollectionInfo], session_tag: str,
) -> tuple[int, int, int]:
    sem = asyncio.Semaphore(MAX_CONCURRENT_PER_SESSION)

    async def _poll_one(col: CollectionInfo):
        async with sem:
            if not _running:
                return (0, 0, 0)
            return await poll_collection(userbot, bot, db, col.gift_id, col.title, session_tag)

    tasks = [_poll_one(c) for c in collections]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    total_new = total_updated = total_delisted = 0
    for r in results:
        if isinstance(r, _FATAL_ERRORS):
            raise r
        if isinstance(r, Exception):
            logger.error("[%s] Poll error: %s", session_tag, r)
            continue
        total_new += r[0]
        total_updated += r[1]
        total_delisted += r[2]
    return total_new, total_updated, total_delisted


def _distribute_collections(
    catalog: list[CollectionInfo], n_sessions: int,
) -> list[list[CollectionInfo]]:
    buckets: list[list[CollectionInfo]] = [[] for _ in range(n_sessions)]
    for i, col in enumerate(catalog):
        buckets[i % n_sessions].append(col)
    return buckets


async def _post_consumer_loop(bot, db):
    """Single drain of the 8:2 mixer: fan a listing out to its branches and
    record every posted message. All posts (DB + market) go through here."""
    while _running:
        try:
            item = await asyncio.wait_for(_post_mixer.get(), timeout=2.0)
        except asyncio.TimeoutError:
            continue
        except asyncio.CancelledError:
            break
        if item is None:
            continue
        listing = item.listing
        targets = _branches_for(listing)
        if not (bot and targets):
            continue
        try:
            first_mid = None
            for chat_id, topic_id in targets:
                mid = await send_listing_to_chat(
                    bot, chat_id, listing, item.seller_level, item.seller_nft,
                    floor_note=item.floor_note, topic_id=topic_id,
                )
                if mid:
                    await add_listing_message(
                        db, listing.unique_gift_id, chat_id, topic_id, mid,
                    )
                    if first_mid is None:
                        first_mid = mid
            if first_mid:
                await set_log_message_id(db, listing.unique_gift_id, first_mid)
        except Exception as e:
            logger.error("Post consumer error: %s", e)
        # Extra pause for DB-sourced posts only (market posts aren't slowed).
        if item.source == "db" and GIFTDB_EXTRA_DELAY > 0:
            await asyncio.sleep(GIFTDB_EXTRA_DELAY)


async def _giftdb_feeder_loop(db):
    """Feed lots from the local owners.db (resale_listings joined with owners)
    into the mixer's DB queue. Dedupes via a giftdb_posted table kept inside
    owners.db itself, so each row is posted once per dump."""
    if not GIFTDB_ENABLED:
        return
    if not os.path.exists(GIFTDB_PATH):
        logger.warning("GIFTDB: %s not found -- DB feed disabled", GIFTDB_PATH)
        return
    try:
        conn = await aiosqlite.connect(GIFTDB_PATH)
        await conn.execute("PRAGMA busy_timeout=5000")
        await conn.execute(
            "CREATE TABLE IF NOT EXISTS giftdb_posted ("
            "instance_id INTEGER PRIMARY KEY, posted_at REAL)"
        )
        await conn.commit()
    except Exception as e:
        logger.error("GIFTDB: open %s failed: %s", GIFTDB_PATH, e)
        return

    order = "ASC" if GIFTDB_ORDER == "asc" else "DESC"
    # Troll-listing cutoffs: price_ton >= 100000 ("un-buyable" sentinel) and
    # price_stars absurdly high. Also apply the user's own MIN/MAX stars floor
    # and TRACK_COLLECTIONS whitelist here so filtered rows don't even leave DB.
    conds = ["p.instance_id IS NULL",
             "COALESCE(r.price_ton,0) < 100000",
             "COALESCE(r.price_stars,0) <= 100000"]
    sql_params: list = []
    if MIN_PRICE_STARS:
        conds.append(f"COALESCE(r.price_stars,0) >= {int(MIN_PRICE_STARS)}")
    if MAX_PRICE_STARS:
        conds.append(f"COALESCE(r.price_stars,0) <= {int(MAX_PRICE_STARS)}")
    if TRACK_COLLECTIONS:
        placeholders = ",".join("?" * len(TRACK_COLLECTIONS))
        conds.append(f"LOWER(TRIM(r.title)) IN ({placeholders})")
        sql_params.extend([t.strip().lower() for t in TRACK_COLLECTIONS])
    query = (
        "SELECT r.instance_id, r.gift_id, r.title, r.slug, r.num, r.price_stars, "
        "       r.seller_id, r.seller_name, o.username, o.first_name "
        "FROM resale_listings r "
        "LEFT JOIN owners o ON o.user_id = r.seller_id "
        "LEFT JOIN giftdb_posted p ON p.instance_id = r.instance_id "
        f"WHERE {' AND '.join(conds)} "
        f"ORDER BY r.posted_at {order} "
        "LIMIT ?"
    )
    logger.info("GIFTDB: feeding from %s (%d DB : %d market, %s, whitelist=%d)",
                GIFTDB_PATH, GIFTDB_RATIO_DB, GIFTDB_RATIO_MARKET, order,
                len(TRACK_COLLECTIONS) if TRACK_COLLECTIONS else 0)
    fed_total = 0
    while _running:
        try:
            cur = await conn.execute(query, (*sql_params, GIFTDB_BATCH))
            rows = await cur.fetchall()
        except Exception as e:
            logger.error("GIFTDB: query failed: %s", e)
            await asyncio.sleep(GIFTDB_IDLE_SLEEP)
            continue
        if not rows:
            await asyncio.sleep(GIFTDB_IDLE_SLEEP)
            continue
        for row in rows:
            if not _running:
                break
            (instance_id, gift_id, title, slug, num, price_stars,
             seller_id, seller_name, username, first_name) = row
            try:
                num_i = int(num) if num is not None else None
            except (TypeError, ValueError):
                num_i = None
            try:
                price_i = int(price_stars or 0)
            except (TypeError, ValueError):
                price_i = 0
            uname = (username or "").lstrip("@").strip() or None
            if not uname and seller_name and str(seller_name).startswith("@"):
                uname = str(seller_name).lstrip("@").strip() or None
            oname = first_name or (
                None if (seller_name or "").startswith("@") else seller_name
            )
            try:
                oid = int(seller_id) if seller_id else None
            except (TypeError, ValueError):
                oid = None

            listing = ResaleListing(
                unique_gift_id=GIFTDB_ID_OFFSET + int(instance_id),
                gift_id=GIFTDB_GIFT_ID,
                num=num_i, slug=slug, title=title,
                owner_id=oid, owner_name=oname, owner_username=uname,
                price_stars=price_i,
            )

            # Mark posted first so a crash/restart never refeeds this row.
            try:
                await conn.execute(
                    "INSERT OR IGNORE INTO giftdb_posted(instance_id, posted_at) "
                    "VALUES (?, ?)", (int(instance_id), time.time()),
                )
                await conn.commit()
            except Exception as e:
                logger.debug("GIFTDB: mark posted %s: %s", instance_id, e)

            if GIFTDB_REQUIRE_USERNAME and not listing.owner_username:
                continue
            if not _passes_price_filter(listing):
                continue

            # Same three-check verify as the market path: handle resolves,
            # entity is a real User, (optional) owns NFTs. Skips dead handles,
            # @channel sellers, and empty collectors.
            if VERIFY_SELLER and (listing.owner_username or listing.owner_id):
                v_ok, v_uid, v_uname, v_nft, v_reason = await _verify_seller(
                    listing.owner_username, listing.owner_id, tag="giftdb",
                )
                if not v_ok:
                    logger.debug("GIFTDB verify skip %s #%s: @%s id=%s (%s)",
                                 listing.title, listing.num,
                                 listing.owner_username, listing.owner_id, v_reason)
                    continue
                if v_uname and v_uname != listing.owner_username:
                    listing = ResaleListing(
                        unique_gift_id=listing.unique_gift_id,
                        gift_id=listing.gift_id,
                        num=listing.num, slug=listing.slug, title=listing.title,
                        owner_id=v_uid or listing.owner_id,
                        owner_name=listing.owner_name,
                        owner_username=v_uname,
                        price_stars=listing.price_stars,
                    )

            # Store in listings so Claim (cross-branch lock + claimer DM) works.
            await upsert_listing(
                db,
                unique_gift_id=listing.unique_gift_id,
                gift_id=listing.gift_id,
                num=listing.num, slug=listing.slug, title=listing.title,
                owner_id=listing.owner_id, owner_name=listing.owner_name,
                owner_username=listing.owner_username, owner_address=None,
                price_stars=listing.price_stars,
                attributes_json=listing.attributes_json,
                seller_level=None, seller_nft_count=None,
            )
            await _post_mixer.put(
                "db", _PostItem(listing, None, None, None, "db"),
            )
            fed_total += 1
        logger.info("GIFTDB: fed %d lots total", fed_total)

    try:
        await conn.close()
    except Exception:
        pass


async def run_tracker():
    if not API_ID or not API_HASH:
        console.print("[bold red]Error:[/] API_ID and API_HASH not set.")
        sys.exit(1)
    if not BOT_TOKEN:
        console.print("[bold red]Error:[/] BOT_TOKEN not set.")
        sys.exit(1)
    if not (BRANCH_CHAT_ID or LOG_GROUP_ID):
        console.print("[bold red]Error:[/] set BRANCH_CHAT_ID or LOG_GROUP_ID.")
        sys.exit(1)

    n = len(SESSION_NAMES)
    console.print(Panel(
        f"[bold]Telegram Gift Market Tracker[/]\n\n"
        f"Sessions: [bold cyan]{n}[/] ({', '.join(SESSION_NAMES)})\n"
        f"Interval: {POLL_INTERVAL_SECONDS}s\n"
        f"Group: {LOG_GROUP_ID}\n"
        f"Seller filter: level <= {MAX_SELLER_LEVEL or 'inf'}, "
        f"NFT <= {MAX_SELLER_NFT_COUNT or 'inf'}\n"
        f"Collections: {', '.join(TRACK_COLLECTIONS) or 'all'}\n"
        f"Price: {MIN_PRICE_STARS or '--'} - {MAX_PRICE_STARS or 'inf'} Stars\n\n"
        f"[dim]Protection: flood_sleep={FLOOD_SLEEP_THRESHOLD}s, "
        f"conn_retries={CONNECTION_RETRIES}, "
        f"api_retries={API_CALL_RETRIES}, "
        f"auth_delay={AUTH_DELAY}s[/]",
        border_style="bright_magenta",
    ))

    userbots: list[TelegramClient] = []
    dead_sessions: set[str] = set()

    for i, name in enumerate(SESSION_NAMES, 1):
        console.print(f"[dim]Connecting session {i}/{n}: {name}...[/]")
        ub = _create_client(name)
        try:
            await ub.start()
            me = await ub.get_me()
            tag = f"@{me.username}" if me.username else f"id:{me.id}"
            console.print(f"  [green]{name}[/] -- {tag}")
            userbots.append(ub)
        except _FATAL_ERRORS as e:
            console.print(f"  [bold red]{name} -- SESSION DEAD: {e}[/]")
            console.print(f"  [yellow]Delete {name}.session and re-login to fix[/]")
            dead_sessions.add(name)
            continue
        except Exception as e:
            console.print(f"  [red]{name} -- connect error: {e}[/]")
            dead_sessions.add(name)
            continue

        if i < n:
            console.print(f"  [dim]Waiting {AUTH_DELAY}s before next session...[/]")
            await asyncio.sleep(AUTH_DELAY)

    if not userbots:
        console.print("[bold red]No sessions connected. Exiting.[/]")
        return

    if dead_sessions:
        console.print(f"[yellow]{len(dead_sessions)} sessions failed: {', '.join(dead_sessions)}[/]")
        console.print(f"[green]Continuing with {len(userbots)} active sessions[/]")

    _backup_sessions()

    bot = create_bot()
    try:
        await bot.start(bot_token=BOT_TOKEN)
        console.print("[green]Bot connected[/]")
        try:
            me_bot = await bot.get_me()
            if me_bot and not getattr(me_bot, "bot", False):
                console.print("[bold red]WARNING: 'gift_bot' session is logged in "
                              "as a USER, not the bot[/] (id="
                              f"{getattr(me_bot, 'id', '?')}). The bot_token was "
                              "ignored because gift_bot.session already had a user.")
                console.print("[yellow]Delete gift_bot.session (and "
                              "gift_bot.session-journal) and restart so it logs "
                              "in as the bot.[/]")
            if me_bot and me_bot.username and not BOT_USERNAME:
                globals()["BOT_USERNAME"] = me_bot.username
        except Exception:
            pass
        if BRANCH_CHAT_ID:
            await _prime_branch_chat(bot)
    except Exception as e:
        console.print(f"[bold red]Bot failed: {e}[/]")
        for ub in userbots:
            await ub.disconnect()
        return

    db = await init_db()
    set_dependencies(db, userbots)

    # Single post consumer (drains the 8:2 mixer) + optional local DB feeder.
    bg_tasks: list[asyncio.Task] = [
        asyncio.create_task(_post_consumer_loop(bot, db)),
    ]
    if GIFTDB_ENABLED:
        bg_tasks.append(asyncio.create_task(_giftdb_feeder_loop(db)))
        console.print(
            f"[green]DB feed ON[/] -- {GIFTDB_PATH} "
            f"({GIFTDB_RATIO_DB} DB : {GIFTDB_RATIO_MARKET} market, alternating)"
        )

    await owner_resolver_selfcheck(userbots[0])

    console.print("[dim]Loading gift catalog...[/]")
    catalog = await get_gift_catalog(userbots[0], tag=SESSION_NAMES[0])
    if not catalog:
        console.print("[yellow]Catalog empty.[/]")
        await _cleanup(userbots, bot, db)
        return

    if TRACK_COLLECTIONS:
        catalog = [c for c in catalog if c.title.lower() in [t.lower() for t in TRACK_COLLECTIONS]]
        if not catalog:
            console.print(f"[yellow]Collections {TRACK_COLLECTIONS} not found.[/]")
            await _cleanup(userbots, bot, db)
            return

    for c in catalog:
        await upsert_collection(db, c.gift_id, c.title, c.slug, c.total_issued)

    active_names = [s for s in SESSION_NAMES if s not in dead_sessions]
    buckets = _distribute_collections(catalog, len(userbots))
    for ub_name, bucket in zip(active_names, buckets):
        titles = [c.title for c in bucket]
        console.print(f"  [dim]{ub_name}:[/] {len(bucket)} collections -- {', '.join(titles[:5])}"
                       + ("..." if len(titles) > 5 else ""))

    console.print(f"\n[green]Tracking {len(catalog)} collections via {len(userbots)} sessions[/]\n")

    cycle = 0
    while _running:
        cycle += 1
        now = datetime.now().strftime("%H:%M:%S")
        console.rule(f"[dim]Cycle #{cycle} -- {now}[/]")

        if cycle % HEALTH_CHECK_EVERY_N_CYCLES == 0:
            console.print("[dim]Running health check...[/]")
            healthy = []
            for ub, name in zip(userbots, active_names):
                ok = await _ensure_connected(ub, name)
                if ok:
                    healthy.append((ub, name))
                else:
                    console.print(f"  [red]{name} -- DEAD, removing from rotation[/]")
            if not healthy:
                console.print("[bold red]All sessions dead! Waiting 60s before retry...[/]")
                await asyncio.sleep(60)
                healthy = []
                for ub, name in zip(userbots, active_names):
                    ok = await _ensure_connected(ub, name)
                    if ok:
                        healthy.append((ub, name))
                if not healthy:
                    console.print("[bold red]All sessions still dead. Exiting.[/]")
                    break
            userbots_active = [h[0] for h in healthy]
            names_active = [h[1] for h in healthy]
            if len(userbots_active) < len(userbots):
                buckets = _distribute_collections(catalog, len(userbots_active))
                console.print(f"  [yellow]Redistributed to {len(userbots_active)} sessions[/]")
            else:
                userbots_active = userbots
                names_active = active_names
        else:
            userbots_active = userbots
            names_active = active_names
            if cycle > 1:
                buckets = _distribute_collections(catalog, len(userbots_active))

        if cycle % SESSION_BACKUP_EVERY_N_CYCLES == 0:
            _backup_sessions()

        tasks = []
        for ub, bucket, name in zip(userbots_active, buckets, names_active):
            if bucket:
                tasks.append(_poll_session_batch(ub, bot, db, bucket, name))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        total_new = total_updated = total_delisted = 0
        session_died = False
        for r in results:
            if isinstance(r, _FATAL_ERRORS):
                logger.error("Session fatal error during poll: %s", r)
                session_died = True
                continue
            if isinstance(r, Exception):
                logger.error("Session error: %s", r)
                continue
            total_new += r[0]
            total_updated += r[1]
            total_delisted += r[2]

        if session_died:
            console.print("[yellow]A session died during polling, will health-check next cycle[/]")

        if total_new or total_delisted:
            console.print(
                f"\n  [green]+{total_new} new[/]  "
                f"[dim]{total_updated} updated[/]  "
                f"[red]-{total_delisted} delisted[/]"
            )
        else:
            console.print(f"  [dim]No changes ({total_updated} checked)[/]")

        if cycle % 10 == 0:
            stats = await get_stats(db)
            print_stats(stats)

        if cycle % HEALTH_CHECK_EVERY_N_CYCLES == 0:
            if not bot.is_connected():
                logger.warning("Bot disconnected, reconnecting...")
                try:
                    await bot.connect()
                except Exception as e:
                    logger.error("Bot reconnect failed: %s", e)

        if _running:
            try:
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                break

    for t in bg_tasks:
        t.cancel()
    await _cleanup(userbots, bot, db)


async def _cleanup(userbots: list[TelegramClient], bot, db):
    console.print("\n[dim]Closing connections...[/]")
    _backup_sessions()
    try:
        await db.close()
    except Exception:
        pass
    try:
        await bot.disconnect()
    except Exception:
        pass
    for ub in userbots:
        try:
            await ub.disconnect()
        except Exception:
            pass
    console.print("[green]Tracker stopped.[/]")


async def owner_resolver_selfcheck(userbot: TelegramClient):
    """Run once at startup: say plainly whether the seller-resolution bypass can
    work in THIS environment, and why not. The "Seller profile" button only
    appears when a marketplace returns the seller, so if everything here is
    FAIL, no buttons is expected -- fix what this prints."""
    console.rule("[bold]Seller-resolution self-check[/]")

    if not _HAS_CFFI:
        console.print("[bold red]curl_cffi: NOT installed[/] -- Portals and "
                      "Tonnel sit behind Cloudflare and will almost always be "
                      "blocked (403) without it.")
        console.print("  Fix: [bold]pip install curl_cffi[/] "
                      "(or: pip install -r tracker/requirements.txt), then restart.")
    else:
        console.print("[green]curl_cffi: installed[/]")

    portals_ok = False
    if OWNER_SOURCE == "all":
        try:
            auth = await get_portals_auth(userbot, force=True)
            if auth:
                console.print(f"[green]Portals auth: OK[/] (token len={len(auth)})")
                probe = await _portals_search(auth, "Plush Pepe")
                if probe and isinstance(probe[0], dict):
                    keys = sorted(probe[0].keys())
                    owner_key = next((k for k in _PORTALS_OWNER_KEYS if k in keys), None)
                    console.print(f"[green]Portals search: OK[/] "
                                  f"({len(probe)} rows). gift keys: {keys}")
                    portals_ok = bool(owner_key)
                else:
                    console.print("[red]Portals search: 0 rows[/]")
            else:
                console.print("[red]Portals auth: FAILED[/]")
        except Exception as e:
            console.print(f"[red]Portals: FAILED[/] -- {e}")
    else:
        console.print(f"[dim]Owner source = {OWNER_SOURCE} (Portals/other markets "
                      f"off; using kartoshka.free only).[/]")

    kartoshka_ok = False
    if not KARTOSHKA_TOKEN:
        console.print("[yellow]kartoshka.free (see.tg public API): disabled[/] "
                      "(set KARTOSHKA_TOKEN -- token from see.tg mini app -> "
                      "Useful/Polezno -> API. Official owner API, 100 req/day "
                      "free then 0.00005 TON/req).")
    else:
        probe_slug = os.getenv("KARTOSHKA_PROBE_SLUG", "PlushPepe-1")
        try:
            kid, kuname, kname = await resolve_owner_via_kartoshka(
                "Plush Pepe", 1, slug=probe_slug,
            )
            console.print(f"[green]kartoshka.free: reachable[/] ({probe_slug}) -> "
                          f"id={kid} username={kuname} name={kname}")
            kartoshka_ok = bool(kid or kuname)
            if not kartoshka_ok:
                try:
                    raw = await asyncio.to_thread(
                        _kartoshka_http_get, KARTOSHKA_API
                        + KARTOSHKA_GIFT_PATH.format(collection="", num=1, slug=probe_slug),
                    )
                    res = raw.get("result") if isinstance(raw, dict) else None
                    if isinstance(res, dict):
                        console.print(f"  result keys: {sorted(res.keys())}")
                        for k in ("owner", "owner_info", "holder", "current_owner",
                                  "user", "seller", "ownerInfo", "owners"):
                            if k in res:
                                console.print(f"  result[{k!r}] = {str(res[k])[:400]}")
                    else:
                        console.print(f"  raw /gift response (truncated): {str(raw)[:500]}")
                except Exception as e:
                    console.print(f"  raw probe error: {e}")
        except Exception as e:
            console.print(f"[red]kartoshka.free: FAILED[/] -- {e}")

    looktg_ok = False
    if LOOKTG_AUTH:
        try:
            lid, luname, lname = await resolve_owner_via_looktg("Plush Pepe", 1)
            console.print(f"[green]look.tg: reachable[/] -> "
                          f"id={lid} username={luname} name={lname}")
            looktg_ok = bool(lid or luname)
        except Exception as e:
            console.print(f"[red]look.tg: FAILED[/] -- {e}")

    if portals_ok or kartoshka_ok or looktg_ok:
        console.print("[bold green]Verdict: seller resolution CAN work.[/] "
                      "Buttons appear for gifts whose owner a source exposes.")
    else:
        console.print("[bold red]Verdict: seller resolution will NOT work yet.[/] "
                      "No source returned an owner -> expect no 'Seller "
                      "profile' button. Recommended: set KARTOSHKA_TOKEN "
                      "(official see.tg public API).")
    console.rule()


async def diagnose(slug: str):
    """Probe every owner-resolution source for one gift and print what each
    returns. Run: python tracker_all.py --diag <slug>   e.g. PlushPepe-3
    Use it to see exactly where resolution breaks in your environment."""
    console.rule(f"[bold]Resolver diagnostic for {slug}[/]")
    m = _SLUG_PARTS_RE.match(slug)
    collection = m.group(1) if m else slug
    num = int(m.group(2)) if m else None
    console.print(f"collection(from slug)={collection!r}  num={num}")
    console.print(f"curl_cffi installed: {_HAS_CFFI}  "
                  f"(Portals/Tonnel behind Cloudflare need it)")

    console.print("\n[bold]t.me/nft page (Owner row):[/]")
    try:
        console.print(f"  -> {await resolve_owner_via_html(slug)}")
    except Exception as e:
        console.print(f"  [red]error: {e}[/]")

    console.print("\n[bold]Fragment JSON:[/]")
    try:
        console.print(f"  -> {await resolve_owner_via_fragment_json(slug)}")
    except Exception as e:
        console.print(f"  [red]error: {e}[/]")

    console.print("\n[bold]Tonnel pageGifts (no auth):[/]")
    try:
        console.print(f"  -> seller_id={await resolve_owner_via_tonnel(collection, num)}")
    except Exception as e:
        console.print(f"  [red]error: {e}[/]")

    ub = _create_client(SESSION_NAMES[0])
    try:
        await ub.start()
        console.print("\n[bold]Portals auth (webview token):[/]")
        auth = await get_portals_auth(ub, force=True)
        console.print(f"  token: {'OK len=' + str(len(auth)) if auth else 'FAILED (no token)'}")
        console.print("\n[bold]Portals search -> owner_id:[/]")
        console.print(f"  -> {await resolve_owner_via_portals(ub, collection, num, slug=slug)}")
        console.print("\n[bold]getUniqueStarGift (Telegram slug API):[/]")
        console.print(f"  -> {await resolve_owner_by_slug(ub, slug)}")
        console.print("\n[bold]Combined resolve_owner_full:[/]")
        console.print(f"  -> (id, name, username) = "
                      f"{await resolve_owner_full(ub, slug, None, collection_name=collection, num=num)}")
    finally:
        try:
            await ub.disconnect()
        except Exception:
            pass
    console.rule("[bold]done[/]")


def main():
    if len(sys.argv) >= 2 and sys.argv[1] in ("--diag", "diag"):
        if len(sys.argv) < 3:
            console.print("[red]usage: python tracker_all.py --diag <slug>  "
                          "(e.g. PlushPepe-3)[/]")
            return
        asyncio.run(diagnose(sys.argv[2]))
        return
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)
    try:
        asyncio.run(run_tracker())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
