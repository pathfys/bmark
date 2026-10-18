#!/usr/bin/env python3
# ─────────────────────────────────────────────────────────────────────────────
# GGZ Payouts — бэкенд в ОДНОМ файле, без внешних зависимостей.
# Запуск:  BOT_TOKEN=... JWT_SECRET=... ADMIN_IDS=... python3 GGZ-Payouts-server.py
# Только стандартная библиотека Python 3 — pip install не нужен.
#
# Здесь живёт вся безопасность мини-аппа:
#   • проверка подписи Telegram initData (HMAC ботового токена, constant-time);
#   • анти-replay: окно свежести auth_date + одноразовость initData;
#   • выдача короткоживущего сессионного токена (не слать initData каждый раз);
#   • rate limiting (общий + строгий на /auth) — защита от перебора/DDoS;
#   • строгий CORS, security-заголовки, лимит тела, без утечки стектрейсов;
#   • серверная модерация: роль админа и бан-лист (клиенту не доверяем).
# ─────────────────────────────────────────────────────────────────────────────

import base64
import hashlib
import hmac
import html
import json
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qsl, urlparse
from urllib.request import Request, urlopen

# ── Конфигурация из окружения ───────────────────────────────────────────────
PORT = int(os.environ.get("PORT", "8080"))
BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "")
INITDATA_TTL = int(os.environ.get("INITDATA_TTL_SECONDS", "3600"))
SESSION_TTL = int(os.environ.get("SESSION_TTL_SECONDS", "3600"))
TRUST_PROXY = bool(os.environ.get("TRUST_PROXY", ""))
ADMINS = {s for s in re.split(r"[,\s]+", os.environ.get("ADMIN_IDS", "")) if s}
ORIGINS = {s for s in (o.strip() for o in os.environ.get("ALLOWED_ORIGIN", "").split(",")) if s}

# Лог-канал: сюда бот шлёт заявки на вступление (с кнопками Принять/Отклонить)
# и заявки на выплату. Это chat_id канала/группы (напр. -1001234567890);
# бот должен быть её администратором. APP_URL — https-адрес мини-аппа для
# кнопки «Открыть» после одобрения. DATA_FILE — куда сохранять заявки/баны,
# чтобы они пережили перезапуск (по умолчанию только в памяти).
LOG_CHANNEL_ID = os.environ.get("LOG_CHANNEL_ID", "").strip()
APP_URL = os.environ.get("APP_URL", "").strip()
DATA_FILE = os.environ.get("DATA_FILE", "").strip()
BOT_POLL = os.environ.get("BOT_POLL", "1").lower() not in ("0", "", "false", "no")
# База Bot API (переопределяется только для тестов; в проде не трогать)
TELEGRAM_API = os.environ.get("TELEGRAM_API_BASE", "https://api.telegram.org").rstrip("/")
# Обязательная подписка на канал: мини-апп откроется только подписчикам.
# Бот должен быть АДМИНОМ этого канала (иначе Telegram не отдаёт участников).
# Пусто — проверка выключена. Формат: @username или -100... (id канала).
REQUIRED_CHANNEL = os.environ.get("REQUIRED_CHANNEL", "@fiestagod").strip()
SUBS_TTL = int(os.environ.get("SUBS_TTL_SECONDS", "120"))  # кэш статуса подписки

if not BOT_TOKEN or not JWT_SECRET:
    sys.stderr.write(
        "FATAL: нужны переменные окружения BOT_TOKEN и JWT_SECRET.\n"
        "Пример: BOT_TOKEN=123:AA.. JWT_SECRET=$(openssl rand -hex 48) "
        "ADMIN_IDS=111,222 python3 GGZ-Payouts-server.py\n"
    )
    sys.exit(1)

HEX64 = re.compile(r"^[a-f0-9]{64}$", re.IGNORECASE)
BAN_ID = re.compile(r"^\d{3,}$")
BAN_PATH = re.compile(r"^/api/admin/bans/(\d{3,})$")
ART_PATH = re.compile(r"^/api/articles/([A-Za-z0-9_-]{6,})$")

# ── Безопасность: initData, сессионные токены ───────────────────────────────
def b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def b64url_decode(s: str) -> bytes:
    pad = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def verify_init_data(init_data: str, bot_token: str, max_age: int, now=None):
    """Проверка подписи и свежести Telegram initData."""
    if not isinstance(init_data, str) or not init_data:
        return None, "empty"
    now = now if now is not None else time.time()

    # keep_blank_values=True — не терять пустые поля; parse_qsl декодирует значения
    pairs = parse_qsl(init_data, keep_blank_values=True)
    fields = {}
    received_hash = None
    for k, v in pairs:
        if k == "hash":
            received_hash = v
        elif k != "signature":  # signature не участвует в data_check_string
            fields[k] = v

    if not received_hash or not HEX64.match(received_hash):
        return None, "no_hash"

    data_check_string = "\n".join(f"{k}={fields[k]}" for k in sorted(fields))
    secret = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    computed = hmac.new(secret, data_check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed, received_hash.lower()):
        return None, "bad_hash"

    try:
        auth_date = int(fields.get("auth_date", "0"))
    except ValueError:
        return None, "no_auth_date"
    if auth_date <= 0:
        return None, "no_auth_date"

    age = int(now) - auth_date
    if age > max_age:
        return None, "expired"
    if age < -60:  # защита от рассинхрона часов
        return None, "future"

    try:
        user = json.loads(fields["user"]) if fields.get("user") else None
    except (ValueError, KeyError):
        return None, "bad_user"
    # user должен быть объектом: иначе .get(id) ниже упал бы (защита от кривого,
    # но валидно подписанного payload)
    if user is not None and not isinstance(user, dict):
        return None, "bad_user"

    return {"user": user, "auth_date": auth_date, "hash": received_hash.lower()}, None


def sign_session(payload: dict, secret: str, ttl: int, now=None) -> str:
    iat = int(now if now is not None else time.time())
    body = {**payload, "iat": iat, "exp": iat + ttl}
    data = b64url(json.dumps(body, separators=(",", ":")).encode())
    sig = b64url(hmac.new(secret.encode(), data.encode(), hashlib.sha256).digest())
    return f"{data}.{sig}"


def verify_session(token: str, secret: str, now=None):
    if not isinstance(token, str) or "." not in token:
        return None
    data, _, sig = token.partition(".")
    expected = b64url(hmac.new(secret.encode(), data.encode(), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        payload = json.loads(b64url_decode(data))
    except (ValueError, json.JSONDecodeError):
        return None
    now = int(now if now is not None else time.time())
    if payload.get("exp") and now > payload["exp"]:
        return None
    return payload


# ── Состояние (демо в памяти; в проде — Redis/БД), защищено локом ───────────
_lock = threading.Lock()
_seen = {}       # hash -> expires_at (анти-replay)
_bans = set()    # заблокированные user id
_buckets = {}    # "name:ip" -> [count, reset_at] (rate limit)
_apps = {}       # uid -> заявка на вступление {user, source, experience, status, ts}
_convo = {}      # uid -> состояние опроса бота {step, source}
_payouts = {}    # id -> заявка на выплату {uid, memo, amount, address, status, ...}
_articles = {}   # id -> статья {title, body, author, created_at, updated_at}
_toolscfg = {}   # конфиг вкладки «Инструменты» (проекты + плитки), правит админ
_subs = {}       # uid -> [subscribed_bool, checked_at] — кэш подписки на канал


def use_once(h: str, now=None) -> bool:
    now = now if now is not None else time.time()
    with _lock:
        if len(_seen) > 50_000:
            for k in [k for k, exp in _seen.items() if exp <= now]:
                _seen.pop(k, None)
        exp = _seen.get(h)
        if exp and exp > now:
            return False
        _seen[h] = now + INITDATA_TTL
        return True


def rate_limit(name: str, ip: str, max_hits: int, window: float, now=None) -> bool:
    now = now if now is not None else time.time()
    key = f"{name}:{ip}"
    with _lock:
        b = _buckets.get(key)
        if not b or b[1] <= now:
            b = [0, now + window]
            _buckets[key] = b
        b[0] += 1
        if len(_buckets) > 100_000:
            for k in [k for k, v in _buckets.items() if v[1] <= now]:
                _buckets.pop(k, None)
        return b[0] <= max_hits


def is_banned(uid) -> bool:
    with _lock:
        return str(uid) in _bans


def app_status(uid) -> str:
    """Статус заявки пользователя: none | pending | approved | rejected."""
    with _lock:
        a = _apps.get(str(uid))
        return a["status"] if a else "none"


def is_subscribed(uid, force: bool = False) -> bool:
    """Подписан ли пользователь на REQUIRED_CHANNEL (getChatMember, с кэшем).
    Бот должен быть админом канала. Пустой REQUIRED_CHANNEL — проверка выключена.
    """
    if not REQUIRED_CHANNEL:
        return True
    uid = str(uid)
    now = time.time()
    if not force:
        with _lock:
            c = _subs.get(uid)
            if c and c[1] + SUBS_TTL > now:
                return c[0]
    try:
        user_id = int(uid)
    except (TypeError, ValueError):
        return False
    res = tg_api("getChatMember", {"chat_id": REQUIRED_CHANNEL, "user_id": user_id})
    if not res or not res.get("ok"):
        # не смогли проверить (сеть/бот не админ) — отдаём прошлый кэш, иначе False;
        # НЕ кэшируем, чтобы повторить проверку на следующем запросе
        with _lock:
            c = _subs.get(uid)
            return c[0] if c else False
    status = (res.get("result") or {}).get("status")
    if status == "restricted":
        ok = bool((res.get("result") or {}).get("is_member", False))
    else:
        ok = status in ("creator", "administrator", "member")
    with _lock:
        if len(_subs) > 100_000:
            for k in [k for k, v in _subs.items() if v[1] + SUBS_TTL <= now]:
                _subs.pop(k, None)
        _subs[uid] = [ok, now]
    return ok


# ── Персистентность заявок/банов (чтобы пережить перезапуск) ────────────────
def _persist():
    """Пишем состояние в DATA_FILE атомарно. Вызывать под _lock."""
    if not DATA_FILE:
        return
    try:
        tmp = DATA_FILE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump({"apps": _apps, "bans": sorted(_bans), "payouts": _payouts,
                       "articles": _articles, "toolscfg": _toolscfg}, f, ensure_ascii=False)
        os.replace(tmp, DATA_FILE)
    except OSError as e:
        sys.stderr.write(f"persist: {e}\n")


def _load():
    if not DATA_FILE or not os.path.exists(DATA_FILE):
        return
    try:
        with open(DATA_FILE, encoding="utf-8") as f:
            data = json.load(f)
        with _lock:
            _apps.update(data.get("apps", {}))
            _bans.update(str(b) for b in data.get("bans", []))
            _payouts.update(data.get("payouts", {}))
            _articles.update(data.get("articles", {}))
            _toolscfg.update(data.get("toolscfg", {}))
    except (OSError, ValueError) as e:
        sys.stderr.write(f"load: {e}\n")


# ── Телеграм-бот: опрос на вступление + модерация из лог-канала ─────────────
# Клиенту по-прежнему не доверяем: бот сам задаёт вопросы в личке, собирает
# ответы и кладёт заявку в лог-канал. Доступ к мини-аппу открывается только
# после нажатия «Принять» администратором (проверяем id по ADMIN_IDS).

# Всё, что бот пишет в личку/канал, идёт жирным (parse_mode=HTML, см. act_send).
# Приветствие на /start + вопросы анкеты, с эмодзи.
GREETING = (
    "🎰 <b>GGZ CLUB — шанс стать игроком</b>\n\n"
    "📝 <b>Ответьте на пару вопросов, чтобы начать работу 👇</b>"
)
Q_SOURCE = "❓ <b>Откуда вы о нас узнали?</b>"
Q_SOURCE_CUSTOM = "✍️ <b>Напишите, откуда вы о нас узнали:</b>"
Q_EXPERIENCE = (
    "💼 <b>Чем вы раньше занимались, был ли у вас опыт в работе с похожей сферой?</b>\n\n"
    "<b>Ответьте «да» или «нет» и укажите ваш опыт, сумму профитов.</b>"
)
MSG_SUBMITTED = "✅ <b>Отлично, ваша заявка отправлена на рассмотрение, ожидайте.</b>"
MSG_PENDING = "⏳ <b>Ваша заявка уже на рассмотрении. Ожидайте решения.</b>"
MSG_APPROVED = "🎉 <b>Ваша заявка одобрена! Доступ к GGZ Pay открыт.</b>"
MSG_REJECTED = "❌ <b>К сожалению, ваша заявка отклонена.</b>"
MSG_START_HINT = "👉 <b>Нажмите /start, чтобы подать заявку на вступление.</b>"

SOURCE_LABELS = {"friends": "От знакомых", "ads": "Реклама"}
SOURCE_KEYBOARD = {
    "inline_keyboard": [
        [{"text": "👥 От знакомых", "callback_data": "src:friends"}],
        [{"text": "📢 Реклама", "callback_data": "src:ads"}],
        [{"text": "✍️ Свой ответ", "callback_data": "src:custom"}],
    ]
}


def _decision_keyboard(uid: str) -> dict:
    return {
        "inline_keyboard": [[
            {"text": "✅ Принять", "callback_data": f"app:accept:{uid}"},
            {"text": "❌ Отклонить", "callback_data": f"app:reject:{uid}"},
        ]]
    }


def _open_keyboard() -> dict | None:
    # web_app-кнопка работает только по https и только в личке
    if not APP_URL.startswith("https://"):
        return None
    return {"inline_keyboard": [[{"text": "🚀 Открыть GGZ Pay", "web_app": {"url": APP_URL}}]]}


# ── Выплаты: стадии и кнопки оператора в лог-канале ──────────────────────────
PAYOUT_LABELS = {"pending": "⏳ Ожидает", "processing": "🔄 В обработке", "paid": "✅ Выплачено"}


def _payout_keyboard(pid: str, status: str) -> dict | None:
    # pending → [В обработку][Выплачено]; processing → [Выплачено]; paid → без кнопок
    if status == "pending":
        return {"inline_keyboard": [[
            {"text": "🔄 В обработку", "callback_data": f"pay:proc:{pid}"},
            {"text": "✅ Выплачено", "callback_data": f"pay:paid:{pid}"},
        ]]}
    if status == "processing":
        return {"inline_keyboard": [[
            {"text": "✅ Выплачено", "callback_data": f"pay:paid:{pid}"},
        ]]}
    return None


def format_payout(rec: dict, suffix: str = "") -> str:
    label = PAYOUT_LABELS.get(rec.get("status"), rec.get("status", "—"))
    text = (
        "💸 <b>Заявка на выплату</b>\n\n"
        f"<b>Пользователь ID:</b> {html.escape(str(rec.get('uid', '—')))}\n"
        f"<b>Сумма:</b> {_ue(rec.get('amount', '—'), 32)} TON\n"
        f"<b>Адрес:</b> {_ue(rec.get('address', '—'), 80)}\n"
        f"<b>Memo:</b> {_ue(rec.get('memo', '—'), 32)}\n"
        f"<b>Статус:</b> {html.escape(label)}"
    )
    return text + suffix


def _payout_dto(rec: dict) -> dict:
    """Представление выплаты для клиента (совпадает с PayoutRequest на фронте)."""
    return {
        "id": rec["id"],
        "memo": rec.get("memo", ""),
        "amount": rec.get("amount", 0),
        "address": rec.get("address", ""),
        "comment": rec.get("comment") or "",
        "status": rec.get("status", "pending"),
        "createdAt": rec.get("created_at", 0),
        "updatedAt": rec.get("updated_at", 0),
        "paidAt": rec.get("paid_at"),
    }


# Управляющие символы (вкл. переводы строк): вырезаем из любого текста,
# который пользователь может подставить и который уходит в сообщение оператору.
# Иначе ответом с «\n✅ Принято» или «\nID: 777» можно подделать строки заявки.
_CTRL = re.compile(r"[\x00-\x1f\x7f-\x9f]")


def _clean_text(s, limit: int = 1000) -> str:
    return _CTRL.sub(" ", str(s)).strip()[:limit]


# Для тела статьи переводы строк сохраняем (это проза), режем только прочие
# управляющие символы; клиент рендерит как текст (React экранирует → без XSS).
_CTRL_KEEP_NL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")


def _clean_body(s, limit: int = 20000) -> str:
    return _CTRL_KEEP_NL.sub(" ", str(s)).strip()[:limit]


def _article_dto(rec: dict) -> dict:
    return {
        "id": rec["id"],
        "title": rec.get("title", ""),
        "body": rec.get("body", ""),
        "createdAt": rec.get("created_at", 0),
        "updatedAt": rec.get("updated_at", 0),
    }


# ── Конфиг вкладки «Инструменты» (проекты + произвольные плитки) ─────────────
# Админ может менять заголовки/тексты/ссылки и добавлять/убирать плитки.
DEFAULT_TOOLS = {
    "projects": {
        "title": "Проекты",
        "intro": "Наши проекты и ссылки",
        "items": [
            {"id": "p1", "name": "GGZ Payouts", "caption": "Выплаты в TON", "url": "https://t.me/"},
        ],
    },
    "tiles": [
        {"id": "t1", "title": "Мануал ОТС", "caption": "Гайд по безопасным OTC-сделкам",
         "kind": "text", "url": "",
         "body": "Внебиржевая (OTC) сделка идёт напрямую между сторонами.\n\n"
                 "• Работайте через гаранта или эскроу площадки.\n"
                 "• Проверяйте репутацию контрагента и историю сделок.\n"
                 "• Крупную сумму дробите, фиксируйте курс и объём письменно.\n\n"
                 "Красные флаги: предоплата без гаранта, курс заметно лучше рынка, "
                 "спешка и давление."},
    ],
}


def _safe_url(u) -> str:
    # только http/https — против javascript:/data: в ссылках плиток
    u = _clean_text(u, 300)
    return u if u.startswith(("http://", "https://")) else ""


def _gen_id(prefix: str) -> str:
    return prefix + "_" + b64url(os.urandom(6))


def _sanitize_tools(cfg) -> dict:
    """Чистим присланный админом конфиг: лимиты длин/количеств, безопасные ссылки."""
    if not isinstance(cfg, dict):
        raise ValueError("bad config")
    proj = cfg.get("projects") if isinstance(cfg.get("projects"), dict) else {}
    items = []
    for it in (proj.get("items") or [])[:50]:
        if not isinstance(it, dict):
            continue
        name = _clean_text(it.get("name", ""), 120)
        if not name:
            continue
        items.append({
            "id": _clean_text(it.get("id", ""), 40) or _gen_id("p"),
            "name": name,
            "caption": _clean_text(it.get("caption", ""), 200),
            "url": _safe_url(it.get("url", "")),
        })
    tiles = []
    for t in (cfg.get("tiles") or [])[:50]:
        if not isinstance(t, dict):
            continue
        title = _clean_text(t.get("title", ""), 160)
        if not title:
            continue
        kind = t.get("kind") if t.get("kind") in ("link", "text") else "link"
        tiles.append({
            "id": _clean_text(t.get("id", ""), 40) or _gen_id("t"),
            "title": title,
            "caption": _clean_text(t.get("caption", ""), 200),
            "kind": kind,
            "url": _safe_url(t.get("url", "")) if kind == "link" else "",
            "body": _clean_body(t.get("body", ""), 8000) if kind == "text" else "",
        })
    return {
        "projects": {
            "title": _clean_text(proj.get("title", "Проекты"), 160) or "Проекты",
            "intro": _clean_body(proj.get("intro", ""), 2000),
            "items": items,
        },
        "tiles": tiles,
    }


def _get_tools() -> dict:
    return _toolscfg if _toolscfg else DEFAULT_TOOLS


# Текст от пользователя для HTML-сообщений: чистим управляющие символы и
# экранируем <>& — ответы пользователя не ломают разметку и не инъектят HTML.
def _ue(s, limit: int = 1000) -> str:
    return html.escape(_clean_text(s, limit))


def _full_name(user: dict) -> str:
    name = " ".join(p for p in (user.get("first_name"), user.get("last_name")) if p)
    return _clean_text(name, 128) or "—"


def format_application(uid: str, app: dict, suffix: str = "") -> str:
    user = app.get("user") or {}
    username = f"@{_ue(user['username'], 64)}" if user.get("username") else "—"
    # parse_mode=HTML: метки жирным; все поля от пользователя экранируем
    text = (
        "🆕 <b>Заявка на вступление</b>\n\n"
        f"<b>Пользователь:</b> {html.escape(_full_name(user))}\n"
        f"<b>Username:</b> {username}\n"
        f"<b>ID:</b> {html.escape(str(uid))}\n\n"
        f"<b>1) Откуда узнали:</b> {_ue(app.get('source', '—'), 400)}\n"
        f"<b>2) Опыт / профиты:</b> {_ue(app.get('experience', '—'), 1500)}"
    )
    return text + suffix


# действия для бота: словари {method, payload}; отправляет их цикл опроса.
# Весь текст бота — жирный/с разметкой: parse_mode=HTML.
def act_send(chat_id, text, reply_markup=None) -> dict:
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML",
               "disable_web_page_preview": True}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return {"method": "sendMessage", "payload": payload}


def act_answer(callback_id, text="", alert=False) -> dict:
    # всплывашка callback — без HTML (Telegram показывает её как обычный текст)
    return {"method": "answerCallbackQuery",
            "payload": {"callback_query_id": callback_id, "text": text, "show_alert": alert}}


def act_edit(chat_id, message_id, text, reply_markup=None) -> dict:
    # без reply_markup кнопки убираются; с ним — заменяются (стадия выплаты)
    payload = {"chat_id": chat_id, "message_id": message_id, "text": text,
               "parse_mode": "HTML", "disable_web_page_preview": True}
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return {"method": "editMessageText", "payload": payload}


def bot_process_update(update: dict) -> list:
    """Чистый разбор апдейта: меняет состояние под локом, возвращает действия."""
    with _lock:
        return _bot_decide(update)


def _bot_decide(update: dict) -> list:
    if "callback_query" in update:
        return _bot_callback(update["callback_query"])

    msg = update.get("message") or update.get("edited_message")
    if not msg:
        return []
    chat = msg.get("chat") or {}
    frm = msg.get("from") or {}
    uid = str(frm.get("id", ""))
    # опрос ведём только в личке и не с ботами
    if not uid or chat.get("type") != "private" or frm.get("is_bot"):
        return []

    text = (msg.get("text") or "").strip()
    app = _apps.get(uid)
    status = app["status"] if app else "none"

    if text.startswith("/start"):
        if status == "approved":
            return [act_send(uid, MSG_APPROVED, _open_keyboard())]
        if status == "pending":
            return [act_send(uid, MSG_PENDING)]
        # ограничиваем число незавершённых опросов (брошенные анкеты не копятся)
        if len(_convo) > 10_000:
            for k in list(_convo)[:1000]:
                _convo.pop(k, None)
        _convo[uid] = {"step": "source", "source": None}
        # приветствие GGZ CLUB + первый вопрос с кнопками
        return [act_send(uid, GREETING + "\n\n" + Q_SOURCE, SOURCE_KEYBOARD)]

    convo = _convo.get(uid)
    if not convo:
        if status == "approved":
            return [act_send(uid, MSG_APPROVED, _open_keyboard())]
        if status == "pending":
            return [act_send(uid, MSG_PENDING)]
        return [act_send(uid, MSG_START_HINT)]

    if not text:
        return []  # ждём текстовый ответ, игнорируем стикеры/медиа

    step = convo["step"]
    if step in ("source", "source_custom"):
        # на шаге source ждали кнопку, но текст тоже принимаем как свой ответ
        convo["source"] = text[:400]
        convo["step"] = "experience"
        return [act_send(uid, Q_EXPERIENCE)]
    if step == "experience":
        return _finalize(uid, frm, convo["source"], text[:1500])
    return []


def _bot_callback(cq: dict) -> list:
    data = cq.get("data") or ""
    cq_id = cq.get("id", "")
    frm = cq.get("from") or {}
    presser = str(frm.get("id", ""))

    if data.startswith("src:"):
        convo = _convo.get(presser)
        if not convo or convo.get("step") != "source":
            return [act_answer(cq_id, "Кнопка больше не активна")]
        choice = data[4:]
        if choice == "custom":
            convo["step"] = "source_custom"
            return [act_answer(cq_id), act_send(presser, Q_SOURCE_CUSTOM)]
        convo["source"] = SOURCE_LABELS.get(choice, "—")
        convo["step"] = "experience"
        return [act_answer(cq_id), act_send(presser, Q_EXPERIENCE)]

    if data.startswith("app:"):
        parts = data.split(":", 2)
        if len(parts) != 3:
            return [act_answer(cq_id, "Некорректная кнопка")]
        _, action, target = parts
        if presser not in ADMINS:
            return [act_answer(cq_id, "Нет прав", alert=True)]
        app = _apps.get(target)
        if not app:
            return [act_answer(cq_id, "Заявка не найдена")]
        if app["status"] != "pending":
            return [act_answer(cq_id, "Заявка уже обработана")]

        chat_id = (cq.get("message") or {}).get("chat", {}).get("id")
        message_id = (cq.get("message") or {}).get("message_id")
        who = html.escape(_full_name(frm))
        actions = []
        if action == "accept":
            app["status"] = "approved"
            _persist()
            actions.append(act_answer(cq_id, "Принято ✅"))
            if chat_id and message_id:
                actions.append(act_edit(chat_id, message_id,
                                        format_application(target, app, f"\n\n✅ Принято ({who})")))
            actions.append(act_send(target, MSG_APPROVED, _open_keyboard()))
            return actions
        if action == "reject":
            app["status"] = "rejected"
            _persist()
            actions.append(act_answer(cq_id, "Отклонено"))
            if chat_id and message_id:
                actions.append(act_edit(chat_id, message_id,
                                        format_application(target, app, f"\n\n❌ Отклонено ({who})")))
            actions.append(act_send(target, MSG_REJECTED))
            return actions
        return [act_answer(cq_id, "Неизвестное действие")]

    if data.startswith("pay:"):
        parts = data.split(":", 2)
        if len(parts) != 3:
            return [act_answer(cq_id, "Некорректная кнопка")]
        _, action, pid = parts
        if presser not in ADMINS:
            return [act_answer(cq_id, "Нет прав", alert=True)]
        rec = _payouts.get(pid)
        if not rec:
            return [act_answer(cq_id, "Выплата не найдена")]
        if rec["status"] == "paid":
            return [act_answer(cq_id, "Уже выплачено")]

        chat_id = (cq.get("message") or {}).get("chat", {}).get("id")
        message_id = (cq.get("message") or {}).get("message_id")
        who = html.escape(_full_name(frm))
        now_ms = int(time.time() * 1000)
        actions = []
        if action == "proc":
            if rec["status"] != "pending":
                return [act_answer(cq_id, "Недоступно")]
            rec["status"] = "processing"
            rec["updated_at"] = now_ms
            _persist()
            actions.append(act_answer(cq_id, "В обработке 🔄"))
            if chat_id and message_id:
                actions.append(act_edit(chat_id, message_id,
                                        format_payout(rec, f"\n\n🔄 Взято в обработку ({who})"),
                                        _payout_keyboard(pid, "processing")))
            return actions
        if action == "paid":
            rec["status"] = "paid"
            rec["updated_at"] = now_ms
            rec["paid_at"] = now_ms
            _persist()
            actions.append(act_answer(cq_id, "Выплачено ✅"))
            if chat_id and message_id:
                actions.append(act_edit(chat_id, message_id,
                                        format_payout(rec, f"\n\n✅ Выплачено ({who})")))
            # уведомляем пользователя в личке (в приложении статус подтянется сам)
            actions.append(act_send(
                rec["uid"],
                f"✅ <b>Выплата по заявке {_ue(rec.get('memo', ''), 32)} проведена: "
                f"{_ue(rec.get('amount', ''), 32)} TON</b>"))
            return actions
        return [act_answer(cq_id, "Неизвестное действие")]

    return [act_answer(cq_id, "")]


def _finalize(uid: str, user: dict, source, experience: str) -> list:
    _apps[uid] = {
        "user": {k: user.get(k) for k in ("id", "first_name", "last_name", "username")},
        "source": source or "—",
        "experience": experience,
        "status": "pending",
        "ts": int(time.time()),
    }
    _convo.pop(uid, None)
    _persist()
    actions = [act_send(uid, MSG_SUBMITTED)]
    if LOG_CHANNEL_ID:
        actions.append(act_send(LOG_CHANNEL_ID,
                                format_application(uid, _apps[uid]),
                                _decision_keyboard(uid)))
    return actions


# ── Телеграм Bot API: тонкая обёртка (long polling, без вебхука) ────────────
def tg_api(method: str, payload: dict):
    if not BOT_TOKEN:
        return None
    url = f"{TELEGRAM_API}/bot{BOT_TOKEN}/{method}"
    data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=40) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:  # сеть/таймаут/HTTP-ошибка — не валим цикл
        sys.stderr.write(f"tg_api {method}: {e}\n")
        return None


def post_payout_to_channel(rec: dict):
    """Заявка на выплату → в лог-канал с кнопками оператора (best-effort)."""
    if not LOG_CHANNEL_ID:
        return
    try:
        tg_api("sendMessage", {
            "chat_id": LOG_CHANNEL_ID,
            "text": format_payout(rec),
            "disable_web_page_preview": True,
            "reply_markup": _payout_keyboard(rec["id"], rec["status"]),
        })
    except Exception as e:
        sys.stderr.write(f"post_payout_to_channel: {e}\n")


def bot_loop():
    """Фоновый поток: длинный опрос getUpdates и диспетч действий."""
    offset = 0
    tg_api("deleteWebhook", {"drop_pending_updates": False})
    while True:
        res = tg_api("getUpdates", {
            "offset": offset, "timeout": 25,
            "allowed_updates": ["message", "callback_query"],
        })
        if not res or not res.get("ok"):
            time.sleep(3)
            continue
        for upd in res.get("result", []):
            offset = max(offset, upd.get("update_id", 0) + 1)
            try:
                for action in bot_process_update(upd):
                    tg_api(action["method"], action["payload"])
            except Exception as e:
                sys.stderr.write(f"bot: {e}\n")


# ── HTTP ────────────────────────────────────────────────────────────────────
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "same-site",
    "Cache-Control": "no-store",
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "GGZ"
    sys_version = ""

    def log_message(self, *args):  # тише в консоли
        pass

    # ── вспомогательное ──
    def _client_ip(self) -> str:
        if TRUST_PROXY:
            xff = self.headers.get("X-Forwarded-For")
            if xff:
                return xff.split(",")[0].strip()
        return self.client_address[0]

    def _cors_headers(self):
        origin = self.headers.get("Origin")
        h = {
            "Vary": "Origin",
            "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "600",
        }
        if origin and origin in ORIGINS:
            h["Access-Control-Allow-Origin"] = origin
        return h

    def _send(self, status: int, obj: dict):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        for k, v in SECURITY_HEADERS.items():
            self.send_header(k, v)
        for k, v in self._cors_headers().items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self, limit: int = 8192):
        # тело уже прочитано в _route (self._raw) — здесь только разбор и лимит
        raw = getattr(self, "_raw", b"")
        if len(raw) > limit:
            return None
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return None

    def _auth(self):
        header = self.headers.get("Authorization", "")
        token = header[7:] if header.startswith("Bearer ") else ""
        payload = verify_session(token, JWT_SECRET)
        if not payload:
            return None
        uid = str(payload.get("sub"))
        return {"user_id": uid, "is_admin": uid in ADMINS}

    # ── методы ──
    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in SECURITY_HEADERS.items():
            self.send_header(k, v)
        for k, v in self._cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        self._route("GET")

    def do_POST(self):
        self._route("POST")

    def do_DELETE(self):
        self._route("DELETE")

    def _route(self, method: str):
        try:
            path = urlparse(self.path).path
            ip = self._client_ip()

            # Читаем тело запроса СРАЗУ и целиком: иначе ранний ответ (401/403/
            # 400) оставит непрочитанные байты в keep-alive-соединении и побьёт
            # следующий запрос. Транспортный предел 1 МБ (семантический — в
            # _read_json); сверх него закрываем соединение, чтобы не дренировать.
            length = int(self.headers.get("Content-Length") or 0)
            if length < 0 or length > (1 << 20):
                self.close_connection = True
                self._raw = b""
                return self._send(413, {"error": "too_large"})
            self._raw = self.rfile.read(length) if length else b""

            if not rate_limit("global", ip, 300, 60):
                return self._send(429, {"error": "too_many_requests"})

            if path == "/api/health" and method == "GET":
                return self._send(200, {"ok": True})

            # POST /api/auth — обмен initData на сессионный токен
            if path == "/api/auth" and method == "POST":
                if not rate_limit("auth", ip, 20, 60):
                    return self._send(429, {"error": "too_many_requests"})
                body = self._read_json()
                if body is None:
                    return self._send(400, {"error": "bad_request"})
                init_data = body.get("initData") if isinstance(body.get("initData"), str) else ""
                result, reason = verify_init_data(init_data, BOT_TOKEN, INITDATA_TTL)
                if not result:
                    return self._send(401, {"error": "invalid_init_data", "reason": reason})
                if not use_once(result["hash"]):
                    return self._send(401, {"error": "replay_detected"})
                uid = str((result["user"] or {}).get("id", ""))
                if not uid:
                    return self._send(401, {"error": "no_user"})
                token = sign_session({"sub": uid}, JWT_SECRET, SESSION_TTL)
                return self._send(200, {
                    "token": token,
                    "user": result["user"],
                    "isAdmin": uid in ADMINS,
                    "blocked": is_banned(uid),
                    "status": app_status(uid),
                    "subscribed": is_subscribed(uid),
                    "channel": REQUIRED_CHANNEL,
                })

            # дальше — только по сессионному токену
            ctx = self._auth()
            if not ctx:
                return self._send(401, {"error": "unauthorized"})

            if path == "/api/me" and method == "GET":
                return self._send(200, {
                    "userId": ctx["user_id"],
                    "isAdmin": ctx["is_admin"],
                    "blocked": is_banned(ctx["user_id"]),
                    "status": app_status(ctx["user_id"]),
                    "subscribed": is_subscribed(ctx["user_id"]),
                    "channel": REQUIRED_CHANNEL,
                })

            # повторная проверка подписки на канал (кнопка «Я подписался»)
            if path == "/api/subscription" and method == "GET":
                return self._send(200, {
                    "subscribed": is_subscribed(ctx["user_id"], force=True),
                    "channel": REQUIRED_CHANNEL,
                })

            # рейтинг «Топ»: агрегируем ВЫПЛАЧЕННЫЕ выплаты по пользователям
            if path == "/api/leaderboard" and method == "GET":
                with _lock:
                    agg = {}
                    for r in _payouts.values():
                        if r.get("status") == "paid":
                            a = agg.setdefault(r.get("uid"), [0.0, 0])
                            try:
                                a[0] += float(r.get("amount") or 0)
                            except (TypeError, ValueError):
                                pass
                            a[1] += 1
                    leaders = []
                    for luid, (vol, cnt) in agg.items():
                        ap = _apps.get(luid) or {}
                        u = ap.get("user") or {}
                        nm = " ".join(p for p in (u.get("first_name"), u.get("last_name")) if p)
                        leaders.append({"id": luid, "name": _clean_text(nm, 64) or f"ID {luid}",
                                        "volume": round(vol, 2), "payouts": cnt})
                leaders.sort(key=lambda e: (-e["volume"], e["name"]))
                leaders = leaders[:100]
                for i, e in enumerate(leaders):
                    e["rank"] = i + 1
                return self._send(200, {"leaders": leaders, "you": ctx["user_id"]})

            # конфиг «Инструменты»: читают все вошедшие, меняет только админ
            if path == "/api/tools":
                if method == "GET":
                    with _lock:
                        return self._send(200, _get_tools())
                if method == "POST":
                    if not ctx["is_admin"]:
                        return self._send(403, {"error": "forbidden"})
                    body = self._read_json(limit=65536)
                    if body is None:
                        return self._send(400, {"error": "bad_request"})
                    try:
                        cfg = _sanitize_tools(body)
                    except (ValueError, TypeError):
                        return self._send(400, {"error": "bad_config"})
                    with _lock:
                        _toolscfg.clear()
                        _toolscfg.update(cfg)
                        _persist()
                        return self._send(200, _get_tools())

            # заявки на выплату. Доступно только одобренным и не забаненным.
            #   GET  — свои заявки со статусами (приложение тянет стадии);
            #   POST — создать заявку (уходит оператору в лог-канал с кнопками).
            if path == "/api/payouts":
                uid = ctx["user_id"]
                if method == "GET":
                    with _lock:
                        mine = sorted(
                            (r for r in _payouts.values() if r.get("uid") == uid),
                            key=lambda r: r.get("created_at", 0), reverse=True)
                        return self._send(200, {"payouts": [_payout_dto(r) for r in mine]})
                if method == "POST":
                    if is_banned(uid):
                        return self._send(403, {"error": "banned"})
                    if app_status(uid) != "approved":
                        return self._send(403, {"error": "not_approved"})
                    body = self._read_json()
                    if body is None:
                        return self._send(400, {"error": "bad_request"})
                    try:
                        amount = float(str(body.get("amount", "")).strip())
                    except ValueError:
                        return self._send(400, {"error": "bad_amount"})
                    if not (0 < amount < 1e9):
                        return self._send(400, {"error": "bad_amount"})
                    address = str(body.get("address", "")).strip()[:120]
                    if not address:
                        return self._send(400, {"error": "bad_address"})
                    memo = str(body.get("memo", "")).strip()[:40]
                    comment = str(body.get("comment", "")).strip()[:280]
                    now_ms = int(time.time() * 1000)
                    pid = "po_" + b64url(os.urandom(9))
                    rec = {
                        "id": pid, "uid": uid, "amount": amount, "address": address,
                        "memo": memo, "comment": comment, "status": "pending",
                        "created_at": now_ms, "updated_at": now_ms, "paid_at": None,
                    }
                    with _lock:
                        if len(_payouts) > 200_000:  # защита памяти: срезаем старые paid
                            old = sorted((r for r in _payouts.values() if r["status"] == "paid"),
                                         key=lambda r: r.get("updated_at", 0))[:1000]
                            for r in old:
                                _payouts.pop(r["id"], None)
                        _payouts[pid] = rec
                        _persist()
                    # оператору в лог-канал с кнопками (вне лока — сетевой вызов)
                    post_payout_to_channel(rec)
                    return self._send(200, {"ok": True, "payout": _payout_dto(rec)})

            # статьи: читают все вошедшие, создаёт/удаляет только админ
            if path == "/api/articles":
                if method == "GET":
                    with _lock:
                        items = sorted(_articles.values(),
                                       key=lambda a: a.get("created_at", 0), reverse=True)
                        return self._send(200, {"articles": [_article_dto(a) for a in items]})
                if method == "POST":
                    if not ctx["is_admin"]:
                        return self._send(403, {"error": "forbidden"})
                    body = self._read_json(limit=32768)
                    if body is None:
                        return self._send(400, {"error": "bad_request"})
                    title = _clean_text(body.get("title", ""), 160)
                    text = _clean_body(body.get("body", ""), 20000)
                    if not title or not text:
                        return self._send(400, {"error": "empty"})
                    now_ms = int(time.time() * 1000)
                    aid = "ar_" + b64url(os.urandom(9))
                    rec = {"id": aid, "title": title, "body": text,
                           "author": ctx["user_id"], "created_at": now_ms, "updated_at": now_ms}
                    with _lock:
                        if len(_articles) > 10_000:
                            old = sorted(_articles.values(), key=lambda a: a.get("created_at", 0))[:500]
                            for a in old:
                                _articles.pop(a["id"], None)
                        _articles[aid] = rec
                        _persist()
                    return self._send(200, {"article": _article_dto(rec)})

            m_art = ART_PATH.match(path)
            if m_art and method == "DELETE":
                if not ctx["is_admin"]:
                    return self._send(403, {"error": "forbidden"})
                with _lock:
                    _articles.pop(m_art.group(1), None)
                    _persist()
                    items = sorted(_articles.values(),
                                   key=lambda a: a.get("created_at", 0), reverse=True)
                    return self._send(200, {"articles": [_article_dto(a) for a in items]})

            # модерация — только админ
            if path == "/api/admin/bans":
                if not ctx["is_admin"]:
                    return self._send(403, {"error": "forbidden"})
                if method == "GET":
                    with _lock:
                        return self._send(200, {"banned": sorted(_bans)})
                if method == "POST":
                    body = self._read_json()
                    if body is None:
                        return self._send(400, {"error": "bad_request"})
                    bid = str(body.get("id", "")).strip()
                    if not BAN_ID.match(bid):
                        return self._send(400, {"error": "bad_id"})
                    with _lock:
                        _bans.add(bid)
                        _persist()
                        return self._send(200, {"banned": sorted(_bans)})

            m = BAN_PATH.match(path)
            if m and method == "DELETE":
                if not ctx["is_admin"]:
                    return self._send(403, {"error": "forbidden"})
                with _lock:
                    _bans.discard(m.group(1))
                    _persist()
                    return self._send(200, {"banned": sorted(_bans)})

            return self._send(404, {"error": "not_found"})
        except Exception as e:  # не протекаем стектрейсами наружу
            sys.stderr.write(f"error: {e}\n")
            try:
                self._send(500, {"error": "internal"})
            except Exception:
                pass


def main():
    _load()
    if BOT_POLL:
        if not LOG_CHANNEL_ID:
            sys.stderr.write("ВНИМАНИЕ: LOG_CHANNEL_ID не задан — заявки некуда "
                             "слать, бот будет только опрашивать пользователей.\n")
        threading.Thread(target=bot_loop, daemon=True).start()
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(
        f"GGZ Payouts API на :{PORT} | admins={len(ADMINS)} | "
        f"origins={len(ORIGINS) or 'нет (CORS закрыт)'} | "
        f"bot={'on' if BOT_POLL else 'off'} | "
        f"log_channel={'есть' if LOG_CHANNEL_ID else 'нет'}",
        flush=True,
    )
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()


if __name__ == "__main__":
    main()
