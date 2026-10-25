"""
Проверка профиля продавца: уровень + количество NFT подарков.

Кэширует результаты чтобы не перегружать API повторными запросами.
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from telethon import TelegramClient
from telethon.tl import functions, types

from config import MAX_SELLER_LEVEL, MAX_SELLER_NFT_COUNT, SELLER_CACHE_TTL

logger = logging.getLogger(__name__)


@dataclass
class SellerProfile:
    """Результат проверки продавца."""
    user_id: int
    level: int | None = None       # уровень профиля Telegram
    nft_count: int | None = None   # кол-во NFT подарков на профиле
    username: str | None = None
    first_name: str | None = None
    checked_at: float = 0.0

    @property
    def passes_filter(self) -> bool:
        """Проходит ли продавец фильтры."""
        if MAX_SELLER_LEVEL and self.level is not None:
            if self.level > MAX_SELLER_LEVEL:
                return False
        if MAX_SELLER_NFT_COUNT and self.nft_count is not None:
            if self.nft_count > MAX_SELLER_NFT_COUNT:
                return False
        return True

    @property
    def filter_reason(self) -> str:
        """Причина непрохождения фильтра (для логов)."""
        reasons = []
        if MAX_SELLER_LEVEL and self.level is not None and self.level > MAX_SELLER_LEVEL:
            reasons.append(f"уровень {self.level} > {MAX_SELLER_LEVEL}")
        if MAX_SELLER_NFT_COUNT and self.nft_count is not None and self.nft_count > MAX_SELLER_NFT_COUNT:
            reasons.append(f"NFT {self.nft_count} > {MAX_SELLER_NFT_COUNT}")
        return ", ".join(reasons)


# Кэш проверенных продавцов: user_id -> SellerProfile
_cache: dict[int, SellerProfile] = {}


def _is_cached(user_id: int) -> bool:
    """Есть ли актуальная запись в кэше."""
    if user_id not in _cache:
        return False
    return (time.time() - _cache[user_id].checked_at) < SELLER_CACHE_TTL


async def get_user_level(client: TelegramClient, user_id: int) -> int | None:
    """
    Получить уровень профиля пользователя.

    Telegram хранит уровень в UserFull (profile_color, peer_color)
    или как отдельное поле в зависимости от layer.
    """
    try:
        full = await client(functions.users.GetFullUserRequest(id=user_id))
        user_full = full.full_user

        # Пробуем разные места где может быть level
        # 1. Прямое поле level
        level = getattr(user_full, "level", None)
        if level is not None:
            return int(level)

        # 2. profile_color.level (PeerColor)
        profile_color = getattr(user_full, "profile_color", None)
        if profile_color is not None:
            level = getattr(profile_color, "level", None)
            if level is not None:
                return int(level)

        # 3. peer_color (старый вариант)
        peer_color = getattr(user_full, "peer_color", None)
        if peer_color is not None:
            level = getattr(peer_color, "level", None)
            if level is not None:
                return int(level)

        # Не нашли level — возвращаем 0 (базовый)
        return 0

    except Exception as e:
        logger.warning("Не удалось получить уровень user_id=%d: %s", user_id, e)
        return None


async def get_user_nft_count(client: TelegramClient, user_id: int) -> int | None:
    """
    Подсчитать количество NFT (коллекционных) подарков на профиле пользователя.

    Используем payments.getSavedStarGifts с peer = user_id.
    Считаем только уникальные/коллекционные подарки (starGiftUnique).
    """
    try:
        # Пробуем GetSavedStarGiftsRequest (получает публичные подарки на профиле)
        try:
            result = await client(functions.payments.GetSavedStarGiftsRequest(
                peer=user_id,
                offset="",
                limit=100,  # берём до 100 для подсчёта
            ))
        except (AttributeError, TypeError):
            # Если метод недоступен, пробуем альтернативный
            try:
                result = await client(functions.payments.GetUserStarGiftsRequest(
                    user_id=user_id,
                    offset="",
                    limit=100,
                ))
            except (AttributeError, TypeError):
                logger.warning("Методы получения подарков недоступны в этой версии Telethon")
                return None

        # Считаем подарки
        gifts = getattr(result, "gifts", [])
        if not gifts:
            # Если есть поле count — используем его
            count = getattr(result, "count", 0)
            return count

        # Считаем только уникальные (NFT) подарки
        nft_count = 0
        for gift_wrapper in gifts:
            # Внутри может быть savedStarGift с полем gift
            inner_gift = getattr(gift_wrapper, "gift", None)
            if inner_gift is None:
                inner_gift = gift_wrapper

            class_name = type(inner_gift).__name__.lower()
            # starGiftUnique = коллекционный NFT подарок
            if "unique" in class_name:
                nft_count += 1

        return nft_count

    except Exception as e:
        logger.warning("Не удалось подсчитать NFT user_id=%d: %s", user_id, e)
        return None


async def check_seller(
    client: TelegramClient, user_id: int
) -> SellerProfile:
    """
    Проверить продавца: уровень и количество NFT.
    Результат кэшируется на SELLER_CACHE_TTL секунд.
    """
    if _is_cached(user_id):
        return _cache[user_id]

    level = await get_user_level(client, user_id)
    nft_count = await get_user_nft_count(client, user_id)

    # Получаем базовую инфу о юзере
    username = None
    first_name = None
    try:
        entity = await client.get_entity(user_id)
        username = getattr(entity, "username", None)
        first_name = getattr(entity, "first_name", None)
    except Exception:
        pass

    profile = SellerProfile(
        user_id=user_id,
        level=level,
        nft_count=nft_count,
        username=username,
        first_name=first_name,
        checked_at=time.time(),
    )

    _cache[user_id] = profile

    logger.info(
        "Проверен продавец %s (id:%d): level=%s, nft=%s, pass=%s",
        username or "?", user_id, level, nft_count, profile.passes_filter,
    )

    return profile


def clear_cache():
    """Очистить кэш проверок."""
    _cache.clear()
