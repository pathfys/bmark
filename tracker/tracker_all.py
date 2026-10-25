#!/usr/bin/env python3
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
import urllib.request
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
from telethon.errors import (
    FloodWaitError,
    RPCError,
    AuthKeyUnregisteredError,
    UserDeactivatedBanError,
    SessionRevokedError,
)

load_dotenv()

# ═══════════════════════════════════════════════════════
#  CONFIG
# ═══════════════════════════════════════════════════════

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

CLAIM_DM_TEMPLATE = os.getenv(
    "CLAIM_DM_TEMPLATE",
    "Привет! Хочу приобрести ваш подарок \"{title}\" #{num} за {price} Stars\n"
    "Ссылка: {link}",
)

SELLER_CACHE_TTL = int(os.getenv("SELLER_CACHE_TTL", "300"))

MAX_CONCURRENT_PER_SESSION = int(os.getenv("MAX_CONCURRENT_PER_SESSION", "3"))

# -- Session protection --
DEVICE_MODEL = os.getenv("DEVICE_MODEL", "Desktop")
SYSTEM_VERSION = os.getenv("SYSTEM_VERSION", "Windows 10")
APP_VERSION = os.getenv("APP_VERSION", "4.16.8")
LANG_CODE = os.getenv("LANG_CODE", "en")

FLOOD_SLEEP_THRESHOLD = int(os.getenv("FLOOD_SLEEP_THRESHOLD", "120"))
CONNECTION_RETRIES = int(os.getenv("CONNECTION_RETRIES", "10"))
RETRY_DELAY = int(os.getenv("RETRY_DELAY", "2"))
AUTH_DELAY = int(os.getenv("AUTH_DELAY", "5"))
API_CALL_RETRIES = int(os.getenv("API_CALL_RETRIES", "3"))

HEALTH_CHECK_EVERY_N_CYCLES = int(os.getenv("HEALTH_CHECK_CYCLES", "10"))
SESSION_BACKUP_EVERY_N_CYCLES = int(os.getenv("SESSION_BACKUP_CYCLES", "60"))
SESSION_BACKUP_DIR = os.getenv("SESSION_BACKUP_DIR", "session_backups")

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


# ═══════════════════════════════════════════════════════
#  SESSION PROTECTION
# ═══════════════════════════════════════════════════════

# Fatal errors that mean the session is permanently dead
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
            # Telethon auto-sleeps up to flood_sleep_threshold;
            # this catches waits ABOVE the threshold
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
    # keep only last 10 backups per session
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


# ═══════════════════════════════════════════════════════
#  API
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

    if owner_id is None and users_map:
        users_list = list(users_map.values())
        if len(users_list) == 1:
            u = users_list[0]
            owner_id = _safe_getattr(u, "id")
            owner_username = _safe_getattr(u, "username")
            if not owner_name:
                first = _safe_getattr(u, "first_name", "")
                last = _safe_getattr(u, "last_name", "")
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
_META_TG_RE = re.compile(
    r'<meta\s+(?:property|name)="og:description"[^>]*content="([^"]*)"',
    re.IGNORECASE,
)
_FRAG_OWNER_RE = re.compile(
    r'(?:owner|seller)["\s:]*(?:<[^>]+>)*\s*<a[^>]*href="https?://t\.me/([^"?/]+)"',
    re.IGNORECASE | re.DOTALL,
)
_FRAG_LINK_RE = re.compile(r'href="https?://t\.me/([^"?/]+)"')


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

    meta_m = _META_TG_RE.search(html)
    if meta_m:
        desc = meta_m.group(1)
        if "@" in desc:
            at_m = re.search(r'@([A-Za-z]\w{3,31})', desc)
            if at_m:
                uname = at_m.group(1)
                if uname.lower() not in ("nft", "giftrelayer", "fragment", "ton"):
                    return uname, None

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

            links = _FRAG_LINK_RE.findall(html)
            for link_uname in links:
                if link_uname.lower() not in (
                    "nft", "giftrelayer", "fragment", "ton",
                    "telegram", "privacy", "tos",
                ):
                    logger.info("Fragment(link) resolved %s -> @%s", slug, link_uname)
                    return link_uname, None
        except Exception as e:
            logger.debug("Fragment resolve %s (%s): %s", slug, url, e)
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


async def resolve_owner_full(
    client: TelegramClient, listing_slug: str,
    listing_owner_address: str | None, tag: str = "",
) -> tuple[int | None, str | None, str | None]:
    html_task = asyncio.create_task(resolve_owner_via_html(listing_slug))
    fragment_task = asyncio.create_task(resolve_owner_via_fragment(listing_slug))
    slug_task = asyncio.create_task(
        resolve_owner_by_slug(client, listing_slug, tag=tag)
    )

    html_uname, html_name = await html_task
    frag_uname, frag_name = await fragment_task
    oid, oname, ouname, ton_addr = await slug_task

    best_uname = html_uname or frag_uname or ouname
    best_name = oname or html_name or frag_name
    best_id = oid

    if best_uname:
        if not best_id:
            resolved_id = await resolve_username_to_id(
                client, best_uname, tag=tag,
            )
            if resolved_id:
                best_id = resolved_id
        return best_id, best_name, best_uname

    if best_id:
        return best_id, best_name, best_uname

    addr = ton_addr or listing_owner_address
    if addr:
        ton_id, ton_uname = await resolve_owner_via_ton(addr)
        if ton_uname:
            resolved_id = await resolve_username_to_id(
                client, ton_uname, tag=tag,
            )
            return resolved_id or ton_id, best_name, ton_uname

    return best_id, best_name, best_uname


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

    # Debug: dump first gift's TL structure once to find correct field names
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


# ═══════════════════════════════════════════════════════
#  SELLER CHECKER
# ═══════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════
#  DATABASE
# ═══════════════════════════════════════════════════════

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


# ═══════════════════════════════════════════════════════
#  DISPLAY
# ═══════════════════════════════════════════════════════


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


# ═══════════════════════════════════════════════════════
#  BOT
# ═══════════════════════════════════════════════════════

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


def create_bot() -> TelegramClient:
    bot = _create_client("gift_bot")

    @bot.on(events.CallbackQuery(pattern=rb"^claim:(\d+)$"))
    async def on_claim(event):
        await _handle_claim(bot, event)

    return bot


def _build_listing_text(listing: ResaleListing, seller_level=None, seller_nft=None) -> str:
    owner = listing.owner_display
    attrs = "\n".join(
        f"  - {a.type}: <b>{a.name}</b> ({a.rarity_percent:.1f}%)" for a in listing.attributes
    )
    lines = [
        "<b>New listing</b>", "",
        f"<b>{listing.title}</b> #{listing.num or '?'}",
        f"Price: <b>{format_stars(listing.price_stars)}</b>",
        f"Seller: <code>{owner}</code>",
    ]
    parts = []
    if seller_level is not None:
        parts.append(f"Level: {seller_level}")
    if seller_nft is not None:
        parts.append(f"NFT: {seller_nft}")
    if parts:
        lines.append(f"{' | '.join(parts)}")
    if attrs:
        lines.append(f"Attributes:\n{attrs}")
    if listing.gift_link:
        lines.append(f'<a href="{listing.gift_link}">Open gift</a>')
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
        row.append(Button.url("Seller profile", profile_url))
    row.append(Button.inline("Claim", data=f"claim:{listing.unique_gift_id}".encode()))
    return [row]


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


async def send_listing_to_group(bot, listing, seller_level=None, seller_nft=None) -> int | None:
    if not LOG_GROUP_ID:
        return None
    text = _build_listing_text(listing, seller_level, seller_nft)
    buttons = _build_buttons(listing)
    async with _send_lock:
        for attempt in range(3):
            try:
                msg = await bot.send_message(
                    LOG_GROUP_ID, text, buttons=buttons, parse_mode="html", link_preview=False,
                )
                await asyncio.sleep(0.1)
                return msg.id
            except FloodWaitError as e:
                logger.warning("Send FloodWait %ds, sleeping...", e.seconds)
                await asyncio.sleep(e.seconds + 1)
            except (ConnectionError, TimeoutError, OSError) as e:
                if attempt >= 2:
                    logger.error("Send to group failed after retries: %s", e)
                    return None
                await asyncio.sleep(2 ** (attempt + 1))
                if not bot.is_connected():
                    try:
                        await bot.connect()
                    except Exception:
                        pass
            except Exception as e:
                logger.error("Send to group: %s", e)
                return None
    return None


async def _handle_claim(bot, event):
    unique_gift_id = int(event.pattern_match.group(1))
    claimer = await event.get_sender()
    claimer_id = claimer.id
    claimer_name = (
        f"@{claimer.username}" if claimer.username
        else (claimer.first_name or f"id:{claimer_id}")
    )

    listing_data = await get_listing_by_unique_id(_db_ref, unique_gift_id)
    if not listing_data:
        await event.answer("Listing not found", alert=True)
        return
    if listing_data["claimed_by"]:
        await event.answer("Already claimed", alert=True)
        return

    await set_claimed(_db_ref, unique_gift_id, claimer_id)

    owner_id = listing_data["owner_id"]
    owner_username = listing_data.get("owner_username")
    dm_target = owner_id or (f"@{owner_username}" if owner_username else None)
    dm_sent = False
    userbot = _next_userbot()
    if userbot and dm_target:
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
    try:
        await bot.edit_message(
            LOG_GROUP_ID, event.message_id, claimed_text, buttons=None, parse_mode="html",
        )
    except Exception as e:
        logger.error("Edit message: %s", e)

    status = "Claimed! DM sent." if dm_sent else "Claimed!"
    await event.answer(status, alert=True)


# ═══════════════════════════════════════════════════════
#  MAIN LOOP
# ═══════════════════════════════════════════════════════

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

            msg_id = None
            if bot and LOG_GROUP_ID:
                msg_id = await send_listing_to_group(bot, listing, None, None)
                if msg_id:
                    await set_log_message_id(db, listing.unique_gift_id, msg_id)

            if listing.owner_id is None and listing.owner_username is None and listing.slug:
                oid, oname, ouname = await resolve_owner_full(
                    userbot, listing.slug, listing.owner_address,
                    tag=session_tag,
                )
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

            seller_level = seller_nft = None
            if listing.owner_id and (MAX_SELLER_LEVEL or MAX_SELLER_NFT_COUNT):
                seller = await check_seller(userbot, listing.owner_id, tag=session_tag)
                seller_level = seller.level
                seller_nft = seller.nft_count
                if not seller.passes_filter:
                    if msg_id and bot:
                        try:
                            await bot.delete_messages(LOG_GROUP_ID, [msg_id])
                        except Exception:
                            pass
                    continue
            elif listing.owner_username and not listing.owner_id and (MAX_SELLER_LEVEL or MAX_SELLER_NFT_COUNT):
                resolved_id = await resolve_username_to_id(
                    userbot, listing.owner_username, tag=session_tag,
                )
                if resolved_id:
                    listing = ResaleListing(
                        unique_gift_id=listing.unique_gift_id,
                        gift_id=listing.gift_id,
                        num=listing.num, slug=listing.slug, title=listing.title,
                        owner_id=resolved_id,
                        owner_name=listing.owner_name,
                        owner_username=listing.owner_username,
                        owner_address=listing.owner_address,
                        price_stars=listing.price_stars,
                        attributes=listing.attributes,
                    )
                    seller = await check_seller(userbot, resolved_id, tag=session_tag)
                    seller_level = seller.level
                    seller_nft = seller.nft_count
                    if not seller.passes_filter:
                        if msg_id and bot:
                            try:
                                await bot.delete_messages(LOG_GROUP_ID, [msg_id])
                            except Exception:
                                pass
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

            if msg_id and bot and (listing.owner_username or listing.owner_id):
                try:
                    updated_text = _build_listing_text(listing, seller_level, seller_nft)
                    updated_buttons = _build_buttons(listing)
                    await bot.edit_message(
                        LOG_GROUP_ID, msg_id, updated_text,
                        buttons=updated_buttons, parse_mode="html",
                        link_preview=False,
                    )
                except Exception as e:
                    logger.debug("Edit listing msg: %s", e)

        page += 1
        if not next_offset or page >= 3:
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


async def run_tracker():
    if not API_ID or not API_HASH:
        console.print("[bold red]Error:[/] API_ID and API_HASH not set.")
        sys.exit(1)
    if not BOT_TOKEN:
        console.print("[bold red]Error:[/] BOT_TOKEN not set.")
        sys.exit(1)
    if not LOG_GROUP_ID:
        console.print("[bold red]Error:[/] LOG_GROUP_ID not set.")
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

    # -- Sequential auth with delay to avoid security flags --
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

    # -- Initial session backup --
    _backup_sessions()

    bot = create_bot()
    try:
        await bot.start(bot_token=BOT_TOKEN)
        console.print("[green]Bot connected[/]")
    except Exception as e:
        console.print(f"[bold red]Bot failed: {e}[/]")
        for ub in userbots:
            await ub.disconnect()
        return

    db = await init_db()
    set_dependencies(db, userbots)

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

        # -- Health check --
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
                # try reconnecting all
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

        # -- Session backup --
        if cycle % SESSION_BACKUP_EVERY_N_CYCLES == 0:
            _backup_sessions()

        # -- Poll --
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

        # -- Bot health --
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


def main():
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)
    try:
        asyncio.run(run_tracker())
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
