#!/usr/bin/env python3
"""
Telegram Gift Market Tracker
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Трекер маркета подарков Telegram Stars.
Отслеживает новые листинги, изменения цен, и снятия с продажи.

Использование:
    1. Создай .env файл (см. .env.example)
    2. pip install -r requirements.txt
    3. python tracker/main.py

При первом запуске попросит авторизацию в Telegram (номер + код).
"""
from __future__ import annotations

import asyncio
import logging
import signal
import sys
from datetime import datetime

from telethon import TelegramClient

from config import (
    API_ID, API_HASH, SESSION_NAME,
    POLL_INTERVAL_SECONDS, MAX_GIFTS_PER_PAGE,
    NOTIFY_CHAT_ID, TRACK_COLLECTIONS,
    MIN_PRICE_STARS, MAX_PRICE_STARS,
)
from db import init_db, upsert_listing, upsert_collection, mark_delisted, get_stats
from api import get_gift_catalog, get_resale_listings, ResaleListing
from display import (
    console, print_new_listing, print_delisted,
    print_listings_table, print_stats,
    format_tg_notification,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("tracker")

# Глобальный флаг для graceful shutdown
_running = True


def _handle_signal(signum, frame):
    global _running
    _running = False
    console.print("\n[bold red]⏹ Останавливаю трекер...[/]")


async def send_notification(client: TelegramClient, listing: ResaleListing):
    """Отправить уведомление о новом листинге в Telegram чат/канал."""
    if not NOTIFY_CHAT_ID:
        return
    try:
        text = format_tg_notification(listing)
        await client.send_message(NOTIFY_CHAT_ID, text, parse_mode="html")
    except Exception as e:
        logger.warning("Не удалось отправить уведомление: %s", e)


def _passes_filter(listing: ResaleListing) -> bool:
    """Проверить проходит ли листинг через фильтры конфигурации."""
    if MIN_PRICE_STARS and listing.price_stars < MIN_PRICE_STARS:
        return False
    if MAX_PRICE_STARS and listing.price_stars > MAX_PRICE_STARS:
        return False
    return True


async def poll_collection(
    client: TelegramClient,
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
            client, gift_id,
            limit=MAX_GIFTS_PER_PAGE,
            offset=offset,
        )

        if not listings:
            break

        for listing in listings:
            all_active_ids.add(listing.unique_gift_id)

            if not _passes_filter(listing):
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
            )

            if is_new:
                new_count += 1
                print_new_listing(listing)
                await send_notification(client, listing)
            else:
                updated_count += 1

        page += 1
        # Берём только первые 3 страницы по умолчанию чтобы не перегружать
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
    if not API_ID or not API_HASH:
        console.print(
            "[bold red]Ошибка:[/] API_ID и API_HASH не заданы.\n"
            "Создай .env файл по образцу .env.example и укажи свои данные "
            "с https://my.telegram.org"
        )
        sys.exit(1)

    console.print(Panel(
        "[bold]🎁 Telegram Gift Market Tracker[/]\n\n"
        f"Интервал опроса: {POLL_INTERVAL_SECONDS}с\n"
        f"Уведомления: {'✅ ' + str(NOTIFY_CHAT_ID) if NOTIFY_CHAT_ID else '❌ отключены'}\n"
        f"Фильтр коллекций: {', '.join(TRACK_COLLECTIONS) or 'все'}\n"
        f"Фильтр цены: "
        f"{MIN_PRICE_STARS or '—'} - {MAX_PRICE_STARS or '∞'} ⭐",
        border_style="bright_magenta",
    ))

    client = TelegramClient(SESSION_NAME, API_ID, API_HASH)
    await client.start()
    console.print("[green]✅ Подключено к Telegram[/]\n")

    db = await init_db()

    # Загружаем каталог коллекций
    console.print("[dim]Загружаю каталог коллекций...[/]")
    catalog = await get_gift_catalog(client)

    if not catalog:
        console.print("[yellow]⚠ Каталог пуст. Проверь подключение.[/]")
        await client.disconnect()
        return

    # Фильтруем коллекции если заданы в конфиге
    if TRACK_COLLECTIONS:
        catalog = [
            c for c in catalog
            if c.title.lower() in [t.lower() for t in TRACK_COLLECTIONS]
        ]
        if not catalog:
            console.print(
                f"[yellow]⚠ Коллекции {TRACK_COLLECTIONS} не найдены в каталоге.[/]"
            )
            await client.disconnect()
            return

    for c in catalog:
        await upsert_collection(db, c.gift_id, c.title, c.slug, c.total_issued)

    console.print(
        f"[green]📚 Отслеживаю {len(catalog)} коллекций[/]\n"
    )

    # Основной цикл
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
                client, db, collection.gift_id, collection.title,
            )
            total_new += new
            total_updated += updated
            total_delisted += delisted

            # Небольшая пауза между коллекциями чтобы не флудить API
            await asyncio.sleep(1)

        # Итоги цикла
        if total_new or total_delisted:
            console.print(
                f"\n  [green]+{total_new} новых[/]  "
                f"[dim]{total_updated} обновлено[/]  "
                f"[red]-{total_delisted} снято[/]"
            )
        else:
            console.print(f"  [dim]Без изменений ({total_updated} проверено)[/]")

        # Статистика каждые 10 циклов
        if cycle % 10 == 0:
            stats = await get_stats(db)
            print_stats(stats)

        # Ждём следующий цикл
        if _running:
            try:
                await asyncio.sleep(POLL_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                break

    # Cleanup
    console.print("\n[dim]Закрываю соединения...[/]")
    await db.close()
    await client.disconnect()
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
