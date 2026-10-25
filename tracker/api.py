"""
Обёртка над Telegram MTProto API для работы с маркетом подарков.

Использует raw Telethon requests, т.к. высокоуровневые методы
для маркета подарков пока не реализованы в Telethon.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field

from telethon import TelegramClient
from telethon.tl import functions, types
from telethon.tl.tlobject import TLObject

logger = logging.getLogger(__name__)


@dataclass
class GiftAttribute:
    """Атрибут коллекционного подарка (модель, бэкдроп, символ)."""
    type: str       # "model", "pattern", "backdrop"
    name: str
    rarity_percent: float = 0.0


@dataclass
class ResaleListing:
    """Один листинг на маркете."""
    unique_gift_id: int
    gift_id: int
    num: int | None = None
    slug: str | None = None
    title: str | None = None
    # Owner info — то что отдаёт API
    owner_id: int | None = None
    owner_name: str | None = None
    owner_username: str | None = None
    owner_address: str | None = None
    # Цена
    price_stars: int = 0
    # Атрибуты
    attributes: list[GiftAttribute] = field(default_factory=list)

    @property
    def owner_display(self) -> str:
        """Отображаемое имя владельца."""
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
    """Базовая информация о коллекции подарков."""
    gift_id: int
    title: str
    slug: str | None = None
    total_issued: int = 0
    availability_remains: int = 0
    star_count: int = 0  # базовая цена в Stars


def _safe_getattr(obj: TLObject, name: str, default=None):
    """Безопасно достать атрибут из TL-объекта."""
    try:
        return getattr(obj, name, default)
    except Exception:
        return default


def _parse_attributes(gift: TLObject) -> list[GiftAttribute]:
    """Извлечь атрибуты из starGiftUnique."""
    attrs = []
    raw_attrs = _safe_getattr(gift, "attributes", [])
    if not raw_attrs:
        return attrs

    for attr in raw_attrs:
        class_name = type(attr).__name__.lower()
        if "model" in class_name:
            attrs.append(GiftAttribute(
                type="model",
                name=_safe_getattr(attr, "name", "?"),
                rarity_percent=_safe_getattr(attr, "rarity_permille", 0) / 10.0,
            ))
        elif "pattern" in class_name:
            attrs.append(GiftAttribute(
                type="pattern",
                name=_safe_getattr(attr, "name", "?"),
                rarity_percent=_safe_getattr(attr, "rarity_permille", 0) / 10.0,
            ))
        elif "backdrop" in class_name:
            attrs.append(GiftAttribute(
                type="backdrop",
                name=_safe_getattr(attr, "name", "?"),
                rarity_percent=_safe_getattr(attr, "rarity_permille", 0) / 10.0,
            ))
    return attrs


def _resolve_owner(gift: TLObject, users_map: dict) -> tuple[int | None, str | None, str | None]:
    """
    Извлечь owner_id, owner_name, owner_username из starGiftUnique.
    Пытаемся резолвить username через users вектор ответа.
    """
    owner_id_raw = _safe_getattr(gift, "owner_id")
    owner_name = _safe_getattr(gift, "owner_name")
    owner_username = None
    owner_id = None

    if owner_id_raw is not None:
        # owner_id может быть Peer или int в зависимости от layer
        if hasattr(owner_id_raw, "user_id"):
            owner_id = owner_id_raw.user_id
        elif hasattr(owner_id_raw, "channel_id"):
            owner_id = owner_id_raw.channel_id
        elif isinstance(owner_id_raw, int):
            owner_id = owner_id_raw

        # Пробуем достать username из users вектора
        if owner_id and owner_id in users_map:
            user = users_map[owner_id]
            owner_username = _safe_getattr(user, "username")
            if not owner_name:
                first = _safe_getattr(user, "first_name", "")
                last = _safe_getattr(user, "last_name", "")
                owner_name = f"{first} {last}".strip() or None

    return owner_id, owner_name, owner_username


async def get_gift_catalog(client: TelegramClient) -> list[CollectionInfo]:
    """
    Получить каталог базовых подарков (коллекций).
    Возвращает список коллекций, у которых есть коллекционные версии.
    """
    try:
        result = await client(functions.payments.GetStarGiftsRequest(hash=0))
    except Exception as e:
        logger.error("Ошибка получения каталога: %s", e)
        return []

    gifts = _safe_getattr(result, "gifts", [])
    catalog = []

    for gift in gifts:
        class_name = type(gift).__name__
        # Нас интересуют только обычные подарки которые можно апгрейдить
        # (они же базовые для коллекций на маркете)
        gift_id = _safe_getattr(gift, "id")
        if gift_id is None:
            continue

        title_raw = _safe_getattr(gift, "title", "")
        # title может быть строкой или не быть — зависит от слоя
        if not isinstance(title_raw, str):
            title_raw = str(gift_id)

        avail = _safe_getattr(gift, "availability_remains", 0) or 0
        total = _safe_getattr(gift, "availability_total", 0) or 0
        stars = _safe_getattr(gift, "stars", 0) or 0
        slug = _safe_getattr(gift, "slug", None)

        catalog.append(CollectionInfo(
            gift_id=gift_id,
            title=title_raw,
            slug=slug,
            total_issued=total,
            availability_remains=avail,
            star_count=stars,
        ))

    logger.info("Каталог: %d коллекций", len(catalog))
    return catalog


async def get_resale_listings(
    client: TelegramClient,
    gift_id: int,
    limit: int = 50,
    offset: str = "",
    sort_by_price: bool = False,
) -> tuple[list[ResaleListing], str]:
    """
    Получить листинги маркета для конкретной коллекции.

    Args:
        gift_id: ID базового подарка (коллекции)
        limit: макс. количество результатов
        offset: строка пагинации
        sort_by_price: сортировать по цене (иначе по времени изменения цены)

    Returns:
        (список листингов, next_offset для пагинации)
    """
    # Собираем TL-запрос напрямую, т.к. Telethon может не иметь
    # встроенного метода для этого
    try:
        # Попробуем через Telethon's raw API
        request = functions.payments.GetResaleStarGiftsRequest(
            gift_id=gift_id,
            offset=offset,
            limit=limit,
            sort_by_price=sort_by_price,
        )
        result = await client(request)
    except AttributeError:
        logger.error(
            "Telethon не поддерживает GetResaleStarGiftsRequest. "
            "Нужна версия с поддержкой layer 210+. "
            "Попробуй: pip install telethon --pre"
        )
        return [], ""
    except Exception as e:
        logger.error("Ошибка получения листингов для gift_id=%d: %s", gift_id, e)
        return [], ""

    # Строим маппинг user_id -> User из ответа
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
        owner_address = _safe_getattr(gift, "owner_address")
        attributes = _parse_attributes(gift)

        listing = ResaleListing(
            unique_gift_id=unique_id,
            gift_id=gift_id,
            num=_safe_getattr(gift, "num"),
            slug=_safe_getattr(gift, "slug"),
            title=_safe_getattr(gift, "title", ""),
            owner_id=owner_id,
            owner_name=owner_name,
            owner_username=owner_username,
            owner_address=owner_address,
            price_stars=_safe_getattr(gift, "resale_star_count", 0) or 0,
            attributes=attributes,
        )
        listings.append(listing)

    return listings, next_offset


async def get_unique_gift_info(
    client: TelegramClient, slug: str
) -> ResaleListing | None:
    """Получить информацию о конкретном коллекционном подарке по слагу."""
    try:
        result = await client(
            functions.payments.GetUniqueStarGiftRequest(slug=slug)
        )
    except Exception as e:
        logger.error("Ошибка получения подарка %s: %s", slug, e)
        return None

    gift = _safe_getattr(result, "gift")
    if gift is None:
        return None

    users_map = {}
    for user in _safe_getattr(result, "users", []):
        uid = _safe_getattr(user, "id")
        if uid:
            users_map[uid] = user

    owner_id, owner_name, owner_username = _resolve_owner(gift, users_map)

    return ResaleListing(
        unique_gift_id=_safe_getattr(gift, "id", 0),
        gift_id=0,  # не известен из этого запроса
        num=_safe_getattr(gift, "num"),
        slug=slug,
        title=_safe_getattr(gift, "title", ""),
        owner_id=owner_id,
        owner_name=owner_name,
        owner_username=owner_username,
        owner_address=_safe_getattr(gift, "owner_address"),
        price_stars=_safe_getattr(gift, "resale_star_count", 0) or 0,
        attributes=_parse_attributes(gift),
    )
