"""
Конфигурация трекера маркета подарков Telegram.

Получи api_id и api_hash на https://my.telegram.org
Создай бота через @BotFather и получи BOT_TOKEN.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Telegram MTProto (юзербот для API маркета) ──
API_ID = int(os.getenv("API_ID", "0"))
API_HASH = os.getenv("API_HASH", "")
SESSION_NAME = os.getenv("SESSION_NAME", "gift_tracker")

# ── Telegram Bot (для группы с кнопками) ──
BOT_TOKEN = os.getenv("BOT_TOKEN", "")

# ── Группа для логов ──
# ID группы/канала куда бот шлёт листинги с кнопками
# Формат: -100XXXXXXXXXX (супергруппа) или числовой chat_id
LOG_GROUP_ID = int(os.getenv("LOG_GROUP_ID", "0")) or None

# ── Tracking settings ──
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL", "30"))
MAX_GIFTS_PER_PAGE = int(os.getenv("MAX_GIFTS_PER_PAGE", "50"))
DB_PATH = os.getenv("DB_PATH", "tracker/gifts.db")

# ── Фильтры продавца ──
# Макс. уровень профиля продавца (0 = без ограничения)
MAX_SELLER_LEVEL = int(os.getenv("MAX_SELLER_LEVEL", "10"))
# Макс. количество NFT подарков на профиле продавца (0 = без ограничения)
MAX_SELLER_NFT_COUNT = int(os.getenv("MAX_SELLER_NFT_COUNT", "10"))

# ── Фильтры коллекций ──
# Список имён коллекций для отслеживания. Пустой = все.
TRACK_COLLECTIONS = [
    x.strip()
    for x in os.getenv("TRACK_COLLECTIONS", "").split(",")
    if x.strip()
]

# Минимальная/максимальная цена в Stars (0 = без ограничений)
MIN_PRICE_STARS = int(os.getenv("MIN_PRICE_STARS", "0"))
MAX_PRICE_STARS = int(os.getenv("MAX_PRICE_STARS", "0"))

# ── Шаблон DM при «Занять лот» ──
CLAIM_DM_TEMPLATE = os.getenv(
    "CLAIM_DM_TEMPLATE",
    "Привет! Хочу приобрести ваш подарок «{title}» #{num} за {price} ⭐\n"
    "Ссылка: {link}",
)

# ── Кэш проверок профилей (секунды) ──
SELLER_CACHE_TTL = int(os.getenv("SELLER_CACHE_TTL", "300"))
