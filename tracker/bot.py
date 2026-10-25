"""
Telegram Bot — отправляет листинги в группу с инлайн-кнопками,
обрабатывает «Занять лот» и редактирует сообщение.

Бот работает параллельно с юзерботом:
- Бот: группа + кнопки + коллбэки
- Юзербот: маркет API + отправка DM продавцу
"""
from __future__ import annotations

import logging
from telethon import TelegramClient, events, Button

from config import (
    API_ID, API_HASH, BOT_TOKEN, LOG_GROUP_ID,
    CLAIM_DM_TEMPLATE,
)
from api import ResaleListing
from display import format_stars

logger = logging.getLogger(__name__)

# Ссылки на db и userbot — устанавливаются из main.py
_db = None
_userbot: TelegramClient | None = None

FOOTER = "\n\n<i>Dev by fiesta</i>"


def set_dependencies(db, userbot: TelegramClient):
    """Установить зависимости из main — вызывается при старте."""
    global _db, _userbot
    _db = db
    _userbot = userbot


def create_bot() -> TelegramClient:
    """Создать и настроить бот-клиент."""
    bot = TelegramClient("gift_bot", API_ID, API_HASH)

    @bot.on(events.CallbackQuery(pattern=rb"^claim:(\d+)$"))
    async def on_claim(event: events.CallbackQuery.Event):
        """Обработка нажатия «Занять лот»."""
        await _handle_claim(bot, event)

    return bot


def _build_listing_text(listing: ResaleListing, seller_level: int | None = None,
                        seller_nft: int | None = None) -> str:
    """Сформировать текст сообщения для группы."""
    owner = listing.owner_display
    attrs = "\n".join(
        f"  • {a.type}: <b>{a.name}</b> ({a.rarity_percent:.1f}%)"
        for a in listing.attributes
    )

    lines = [
        "🆕 <b>Новый листинг на маркете</b>",
        "",
        f"📦 <b>{listing.title}</b> #{listing.num or '?'}",
        f"💰 Цена: <b>{format_stars(listing.price_stars)}</b>",
        f"👤 Продавец: <code>{owner}</code>",
    ]

    # Информация о профиле продавца
    profile_parts = []
    if seller_level is not None:
        profile_parts.append(f"Уровень: {seller_level}")
    if seller_nft is not None:
        profile_parts.append(f"NFT: {seller_nft}")
    if profile_parts:
        lines.append(f"📊 {' | '.join(profile_parts)}")

    if attrs:
        lines.append(f"🎨 Атрибуты:\n{attrs}")

    if listing.gift_link:
        lines.append(f"🔗 <a href=\"{listing.gift_link}\">Открыть подарок</a>")

    lines.append(FOOTER)
    return "\n".join(lines)


def _build_buttons(listing: ResaleListing) -> list[list[Button]]:
    """Сформировать инлайн-кнопки для листинга."""
    buttons = []

    # Кнопка «Профиль продавца»
    if listing.owner_username:
        profile_url = f"https://t.me/{listing.owner_username}"
    elif listing.owner_id:
        profile_url = f"tg://user?id={listing.owner_id}"
    else:
        profile_url = None

    row = []
    if profile_url:
        row.append(Button.url("👤 Профиль продавца", profile_url))

    # Кнопка «Занять лот» — callback
    row.append(Button.inline(
        "🔒 Занять лот",
        data=f"claim:{listing.unique_gift_id}".encode(),
    ))

    buttons.append(row)
    return buttons


def _build_claimed_text(
    title: str,
    num: int | None,
    price_stars: int,
    owner_display: str,
    claimer_name: str,
) -> str:
    """Текст сообщения после клейма (кнопки убраны)."""
    lines = [
        f"📦 <b>{title}</b> #{num or '?'}",
        f"💰 Цена: <b>{format_stars(price_stars)}</b>",
        f"👤 Продавец: <code>{owner_display}</code>",
        "",
        f"✅ <b>Лот был занят</b> — {claimer_name}",
        FOOTER,
    ]
    return "\n".join(lines)


async def send_listing_to_group(
    bot: TelegramClient,
    listing: ResaleListing,
    seller_level: int | None = None,
    seller_nft: int | None = None,
) -> int | None:
    """
    Отправить листинг в группу с кнопками.
    Возвращает message_id отправленного сообщения.
    """
    if not LOG_GROUP_ID:
        return None

    text = _build_listing_text(listing, seller_level, seller_nft)
    buttons = _build_buttons(listing)

    try:
        msg = await bot.send_message(
            LOG_GROUP_ID,
            text,
            buttons=buttons,
            parse_mode="html",
            link_preview=False,
        )
        return msg.id
    except Exception as e:
        logger.error("Ошибка отправки в группу: %s", e)
        return None


async def _handle_claim(bot: TelegramClient, event: events.CallbackQuery.Event):
    """Обработчик нажатия «Занять лот»."""
    # Импорт внутри чтобы избежать циклических зависимостей
    from db import get_listing_by_unique_id, set_claimed

    unique_gift_id = int(event.pattern_match.group(1))
    claimer = await event.get_sender()
    claimer_id = claimer.id
    claimer_name = f"@{claimer.username}" if claimer.username else (
        claimer.first_name or f"id:{claimer_id}"
    )

    # Получаем листинг из БД
    listing_data = await get_listing_by_unique_id(_db, unique_gift_id)
    if not listing_data:
        await event.answer("❌ Листинг не найден", alert=True)
        return

    # Проверяем не занят ли уже
    if listing_data["claimed_by"]:
        await event.answer("❌ Этот лот уже занят!", alert=True)
        return

    # Помечаем как занятый в БД
    await set_claimed(_db, unique_gift_id, claimer_id)

    # ── Отправляем DM продавцу через юзербот ──
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
            logger.info("DM отправлен продавцу %d", owner_id)
        except Exception as e:
            logger.warning("Не удалось отправить DM продавцу %d: %s", owner_id, e)

    # ── Определяем owner_display ──
    owner_display = (
        f"@{listing_data['owner_username']}" if listing_data.get("owner_username")
        else listing_data.get("owner_name")
        or (f"id:{owner_id}" if owner_id else "скрыт")
    )

    # ── Редактируем сообщение в группе — убираем кнопки ──
    claimed_text = _build_claimed_text(
        title=listing_data["title"] or "?",
        num=listing_data["num"],
        price_stars=listing_data["price_stars"],
        owner_display=owner_display,
        claimer_name=claimer_name,
    )

    try:
        await bot.edit_message(
            LOG_GROUP_ID,
            event.message_id,
            claimed_text,
            buttons=None,  # убираем кнопки
            parse_mode="html",
        )
    except Exception as e:
        logger.error("Ошибка редактирования сообщения: %s", e)

    # Ответ на callback
    status = "✅ Лот занят! DM отправлен." if dm_sent else "✅ Лот занят!"
    await event.answer(status, alert=True)
