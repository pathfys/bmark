"""
Конфигурация трекера маркета подарков Telegram.

Получи api_id и api_hash на https://my.telegram.org
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Telegram MTProto credentials
API_ID = int(os.getenv("API_ID", "0"))
API_HASH = os.getenv("API_HASH", "")
SESSION_NAME = os.getenv("SESSION_NAME", "gift_tracker")

# Tracking settings
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL", "30"))  # как часто опрашивать маркет
MAX_GIFTS_PER_PAGE = int(os.getenv("MAX_GIFTS_PER_PAGE", "50"))  # лимит на запрос
DB_PATH = os.getenv("DB_PATH", "tracker/gifts.db")

# Опционально: ID канала/чата куда слать уведомления о новых листингах
# Формат: -100XXXXXXXXXX (для каналов/супергрупп) или числовой user_id
NOTIFY_CHAT_ID = int(os.getenv("NOTIFY_CHAT_ID", "0")) or None

# Фильтры (опционально)
# Список имён коллекций для отслеживания. Пустой = все.
TRACK_COLLECTIONS = [
    x.strip()
    for x in os.getenv("TRACK_COLLECTIONS", "").split(",")
    if x.strip()
]

# Минимальная/максимальная цена в Stars для фильтрации (0 = без ограничений)
MIN_PRICE_STARS = int(os.getenv("MIN_PRICE_STARS", "0"))
MAX_PRICE_STARS = int(os.getenv("MAX_PRICE_STARS", "0"))
