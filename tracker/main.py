#!/usr/bin/env python3
"""
Telegram Gift Market Tracker
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Трекер маркета подарков Telegram Stars.
Юзербот опрашивает маркет, бот отправляет листинги в группу
с кнопками «Профиль продавца» и «Занять лот».

Использование:
    1. Создай .env файл (см. .env.example)
    2. pip install -r requirements.txt
    3. python tracker/main.py
"""
from __future__ import annotations

import asyncio
import logging
import signal
import sys
from datetime import datetime

from telethon import TelegramClient

from config import (
    API_ID, API_HASH, SESSION_NAME, BOT_TOKEN,
    POLL_INTERVAL_SECONDS, MAX_GIFTS_PER_PAGE,
    LOG_GROUP_ID, TRACK_COLLECTIONS,
    MIN_PRICE_STARS, MAX_PRICE_STARS,
    MAX_SELLER_LEVEL, MAX_SELLER_NFT_COUNT,
)
from db import (
    init_db, upsert_listing, upsert_collection,
    mark_delisted, get_stats, set_log_message_id,
)
from api import get_gift_catalog, get_resale_listings, ResaleListing
from checker import check_seller
from bot import create_bot, set_dependencies, send_listing_to_group
from display import (
    console, print_new_listing, print_delisted, print_stats,
)
from rich.panel import Panel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("tracker")

_running = True


def _handle_signal(signum, frame):
    global _running
    _running = False
    console.print("\n[bold red]⏹ Останавливаю трекер...[/]")


def _passes_price_filter(listing: ResaleListing) -> bool:
    """Проверить проходит ли листинг ценовой фильтр."""
    if MIN_PRICE_STARS and listing.price_stars < MIN_PRICE_STARS:
        return False
    if MAX_PRICE_STARS and listing.price_stars > MAX_PRICE_STARS:
        return False
    return True


async def poll_collection(
    userbot: TelegramClient,
    bot: TelegramClient | None,
    db,
    gift_id: int,
    collection_title: str,
) -> tuple[int, int, int]:
    """
    Опросить маркет для одной коллекции.
    Возвращает (новых, обновлённых, снятых).
    """
    new_count = 0
    updated_count = 0
    all_active_ids: set[int] = set()
    offset = ""
    page = 0

    while True:
        listings, next_offset = await get_resale_listings(
            userbot, gift_id,
            limit=MAX_GIFTS_PER_PAGE,
            offset=offset,
        )

        if not listings:
            break

        for listing in listings:
            all_active_ids.add(listing.unique_gift_id)

            if not _passes_price_filter(listing):
                continue

            # ── Проверка профиля продавца ──
            seller_level = None
            seller_nft = None

            if listing.owner_id and (MAX_SELLER_LEVEL or MAX_SELLER_NFT_COUNT):
                seller = await check_seller(userbot, listing.owner_id)
                seller_level = seller.level
                seller_nft = seller.nft_count

                if not seller.passes_filter:
                    logger.debug(
                        "Пропуск %s #%s: продавец %s не прошёл фильтр (%s)",
                        listing.title, listing.num,
                        listing.owner_display, seller.filter_reason,
                    )
                    continue

            # ── Сохраняем в БД ──
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

                # Отправляем в группу через бота
                if bot and LOG_GROUP_ID:
                    msg_id = await send_listing_to_group(
                        bot, listing,
                        seller_level=seller_level,
                        seller_nft=seller_nft,
                    )
                    if msg_id:
                        await set_log_message_id(
                            db, listing.unique_gift_id, msg_id
                        )
            else:
                updated_count += 1

        page += 1
        if not next_offset or page >= 3:
            break
        offset = next_offset

    # Пометить снятые листинги
    delisted = await mark_delisted(db, all_active_ids, gift_id)
    for info in delisted:
        print_delisted(info)

    return new_count, updated_count, len(delisted)


async def run_tracker():
    """Основной цикл трекера."""
    # ── Валидация конфигурации ──
    if not API_ID or not API_HASH:
        console.print(
            "[bold red]Ошибка:[/] API_ID и API_HASH не заданы.\n"
            "Создай .env файл по образцу .env.example"
        )
        sys.exit(1)

    if not BOT_TOKEN:
        console.print(
            "[bold red]Ошибка:[/] BOT_TOKEN не задан.\n"
            "Создай бота через @BotFather и укажи токен в .env"
        )
        sys.exit(1)

    if not LOG_GROUP_ID:
        console.print(
            "[bold red]Ошибка:[/] LOG_GROUP_ID не задан.\n"
            "Укажи ID группы для логов в .env"
        )
        sys.exit(1)

    # ── Баннер ──
    console.print(Panel(
        "[bold]🎁 Telegram Gift Market Tracker[/]\n\n"
        f"Интервал опроса: {POLL_INTERVAL_SECONDS}с\n"
        f"Группа логов: {LOG_GROUP_ID}\n"
        f"Фильтр продавца: уровень ≤ {MAX_SELLER_LEVEL or '∞'}, "
        f"NFT ≤ {MAX_SELLER_NFT_COUNT or '∞'}\n"
        f"Фильтр коллекций: {', '.join(TRACK_COLLECTIONS) or 'все'}\n"
        f"Фильтр цены: {MIN_PRICE_STARS or '—'} – {MAX_PRICE_STARS or '∞'} ⭐",
        border_style="bright_magenta",
    ))

    # ── Инициализация клиентов ──
    userbot = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await userbot.start()
    console.print("[green]✅ Юзербот подключен[/]")

    bot = create_bot()
    await bot.start(bot_token=BOT_TOKEN)
    console.print("[green]✅ Бот подключен[/]")

    db = await init_db()
    set_dependencies(db, userbot)

    # ── Загрузка каталога ──
    console.print("[dim]Загружаю каталог коллекций...[/]")
    catalog = await get_gift_catalog(userbot)

    if not catalog:
        console.print("[yellow]⚠ Каталог пуст. Проверь подключение.[/]")
        await _cleanup(userbot, bot, db)
        return

    if TRACK_COLLECTIONS:
        catalog = [
            c for c in catalog
            if c.title.lower() in [t.lower() for t in TRACK_COLLECTIONS]
        ]
        if not catalog:
            console.print(
                f"[yellow]⚠ Коллекции {TRACK_COLLECTIONS} не найдены.[/]"
            )
            await _cleanup(userbot, bot, db)
            return

    for c in catalog:
        await upsert_collection(db, c.gift_id, c.title, c.slug, c.total_issued)

    console.print(f"[green]📚 Отслеживаю {len(catalog)} коллекций[/]\n")

    # ── Основной цикл ──
    cycle = 0
    while _running:
        cycle += 1
        now = datetime.now().strftime("%H:%M:%S")
        console.rule(f"[dim]Цикл #{cycle} — {now}[/]")

        total_new = 0
        total_updated = 0
        total_delisted = 0

        for collection in catalog:
            if not _running:
                break

            new, updated, delisted = await poll_collection(
                userbot, bot, db,
                collection.gift_id, collection.title,
            )
            total_new += new
            total_updated += updated
            total_delisted += delisted

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
    """Закрытие всех соединений."""
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
