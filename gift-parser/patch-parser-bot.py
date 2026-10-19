#!/usr/bin/env python3
"""Adds two admin features to gift_parser_bot.py:

  1. an autoparse toggle button — the parser comes back up by itself after a
     restart instead of waiting for someone to press "Запустить парсер"
  2. /broadcast — a message to everyone who has started the bot, with a preview,
     a confirmation step and a delivery report

Each edit is keyed to a marker and skipped when already present, so the script
is safe to re-run. Nothing is written unless every anchor matches exactly once.

    python3 patch-parser-bot.py [/root/gift_parser_bot/gift_parser_bot.py]
"""
import shutil
import sys
import time

TARGET = sys.argv[1] if len(sys.argv) > 1 else "/root/gift_parser_bot/gift_parser_bot.py"

EDITS = [
    # ── БД: таблица настроек и доступ к ней ────────────────────────────────
    ("таблица настроек", "CREATE TABLE IF NOT EXISTS app_settings",
     "CREATE INDEX IF NOT EXISTS idx_gifts_collection ON gifts(collection, number);",
     "-- Переживающие перезапуск настройки, которыми управляет админ из бота\n"
     "CREATE TABLE IF NOT EXISTS app_settings (\n"
     "    key   TEXT PRIMARY KEY,\n"
     "    value TEXT NOT NULL\n"
     ");\n\n"
     "CREATE INDEX IF NOT EXISTS idx_gifts_collection ON gifts(collection, number);"),

    ("доступ к настройкам и список юзеров", "async def get_flag",
     "    async def stats(self) -> dict[str, int]:",
     "    async def get_flag(self, key: str, default: bool = False) -> bool:\n"
     "        cur = await self.conn.execute(\"SELECT value FROM app_settings WHERE key = ?\", (key,))\n"
     "        row = await cur.fetchone()\n"
     "        return default if row is None else row[0] == \"1\"\n"
     "\n"
     "    async def set_flag(self, key: str, value: bool) -> None:\n"
     "        await self.conn.execute(\n"
     "            \"INSERT INTO app_settings (key, value) VALUES (?, ?) \"\n"
     "            \"ON CONFLICT(key) DO UPDATE SET value = excluded.value\",\n"
     "            (key, \"1\" if value else \"0\"),\n"
     "        )\n"
     "        await self.conn.commit()\n"
     "\n"
     "    async def bot_user_ids(self) -> list[int]:\n"
     "        \"\"\"Все, кто хоть раз запускал бота — получатели рассылки.\"\"\"\n"
     "        cur = await self.conn.execute(\"SELECT user_id FROM users WHERE is_bot_user = 1\")\n"
     "        return [r[0] for r in await cur.fetchall()]\n"
     "\n"
     "    async def stats(self) -> dict[str, int]:"),

    # ── Клавиатуры ─────────────────────────────────────────────────────────
    ("описание действий кнопок", "bcast_go",
     "    action: str  # start | stop | speed | sync | refresh",
     "    action: str  # start | stop | speed | sync | refresh | autoparse | bcast_go | bcast_no"),

    ("кнопки автопарсинга и рассылки", "def broadcast_confirm",
     'def admin_panel(running: bool, preset: str) -> InlineKeyboardMarkup:\n'
     '    toggle = (\n'
     '        _btn("Остановить парсер", AdminCb(action="stop"))\n'
     '        if running\n'
     '        else _btn("Запустить парсер", AdminCb(action="start"))\n'
     '    )\n'
     '    speed_row = [_btn(f"[{p}]" if p == preset else p, AdminCb(action="speed", value=p)) for p in SPEED_PRESETS]\n'
     '    return InlineKeyboardMarkup(\n'
     '        inline_keyboard=[\n'
     '            [toggle],\n'
     '            speed_row,\n'
     '            [_btn("Коллекции и floor", AdminCb(action="sync")), _btn("Обновить", AdminCb(action="refresh"))],\n'
     '        ]\n'
     '    )',
     'def admin_panel(running: bool, preset: str, autoparse: bool = False) -> InlineKeyboardMarkup:\n'
     '    toggle = (\n'
     '        _btn("Остановить парсер", AdminCb(action="stop"))\n'
     '        if running\n'
     '        else _btn("Запустить парсер", AdminCb(action="start"))\n'
     '    )\n'
     '    speed_row = [_btn(f"[{p}]" if p == preset else p, AdminCb(action="speed", value=p)) for p in SPEED_PRESETS]\n'
     '    auto_btn = _btn(\n'
     '        f"Автопарсинг: {\'вкл\' if autoparse else \'выкл\'}", AdminCb(action="autoparse")\n'
     '    )\n'
     '    return InlineKeyboardMarkup(\n'
     '        inline_keyboard=[\n'
     '            [toggle],\n'
     '            [auto_btn],\n'
     '            speed_row,\n'
     '            [_btn("Коллекции и floor", AdminCb(action="sync")), _btn("Обновить", AdminCb(action="refresh"))],\n'
     '        ]\n'
     '    )\n'
     '\n'
     '\n'
     'def broadcast_confirm() -> InlineKeyboardMarkup:\n'
     '    return InlineKeyboardMarkup(\n'
     '        inline_keyboard=[\n'
     '            [\n'
     '                _btn("Отправить", AdminCb(action="bcast_go")),\n'
     '                _btn("Отмена", AdminCb(action="bcast_no")),\n'
     '            ]\n'
     '        ]\n'
     '    )'),

    # ── Админский модуль: импорты ──────────────────────────────────────────
    ("импорты для рассылки", "TelegramForbiddenError",
     "import time\n"
     "from html import escape\n"
     "\n"
     "from aiogram import F, Router\n"
     "from aiogram.filters import Command, CommandObject\n"
     "from aiogram.types import CallbackQuery, Message",
     "import asyncio\n"
     "import time\n"
     "from html import escape\n"
     "\n"
     "from aiogram import F, Router\n"
     "from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError, TelegramRetryAfter\n"
     "from aiogram.filters import Command, CommandObject\n"
     "from aiogram.types import CallbackQuery, Message"),

    ("регистрация /broadcast", 'Command("broadcast")',
     '    router.message.register(cmd_floor, Command("floor"))',
     '    router.message.register(cmd_broadcast, Command("broadcast"))\n'
     '    router.message.register(cmd_floor, Command("floor"))'),

    # ── Панель: состояние автопарсинга ─────────────────────────────────────
    ("чтение флага в панели", 'autoparse = await db.get_flag',
     "    st = crawler.status\n"
     "    stats = await db.stats()",
     "    st = crawler.status\n"
     "    stats = await db.stats()\n"
     "    autoparse = await db.get_flag(\"autoparse\")"),

    ("строка автопарсинга в панели", "поднимется сам после перезапуска",
     "        f\"Состояние: <b>{'работает' if crawler.running else 'остановлен'}</b> · {uptime}\",",
     "        f\"Состояние: <b>{'работает' if crawler.running else 'остановлен'}</b> · {uptime}\",\n"
     "        f\"Автопарсинг: <b>{'вкл' if autoparse else 'выкл'}</b>\"\n"
     "        + (\" — поднимется сам после перезапуска\" if autoparse else \"\"),"),

    ("подсказка о /broadcast", "/broadcast",
     '        "\\n<i>Команды: /floor &lt;slug&gt; &lt;TON|auto&gt; · /recrawl &lt;slug&gt; · /parse_user &lt;user_id&gt;</i>"',
     '        "\\n<i>Команды: /floor &lt;slug&gt; &lt;TON|auto&gt; · /recrawl &lt;slug&gt; · /parse_user &lt;user_id&gt;"\n'
     '        " · /broadcast &lt;текст&gt;</i>"'),

    # ── Обработчики ────────────────────────────────────────────────────────
    ("флаг в клавиатуре /admin", "kb.admin_panel(crawler.running, crawler.preset, await db.get_flag",
     "async def cmd_admin(message: Message, crawler: Crawler, db: Database, checker: SubscriptionChecker) -> None:\n"
     "    await message.answer(\n"
     "        await panel_text(crawler, db, checker), reply_markup=kb.admin_panel(crawler.running, crawler.preset)\n"
     "    )",
     "async def cmd_admin(message: Message, crawler: Crawler, db: Database, checker: SubscriptionChecker) -> None:\n"
     "    await message.answer(\n"
     "        await panel_text(crawler, db, checker),\n"
     "        reply_markup=kb.admin_panel(crawler.running, crawler.preset, await db.get_flag(\"autoparse\")),\n"
     "    )"),

    ("обработка рассылки в колбэках", 'if action in ("bcast_go", "bcast_no")',
     '    action = callback_data.action\n'
     '    note = ""\n'
     '    if action == "start":',
     '    action = callback_data.action\n'
     '    note = ""\n'
     '    if action in ("bcast_go", "bcast_no"):\n'
     '        text = _pending_broadcast.pop(call.from_user.id, "")\n'
     '        if action == "bcast_no":\n'
     '            await call.answer("Рассылка отменена")\n'
     '            await safe_edit(call.message, "Рассылка отменена.", None)\n'
     '            return\n'
     '        if not text:\n'
     '            await call.answer("Нечего отправлять")\n'
     '            await safe_edit(call.message, "Текст потерян — наберите /broadcast заново.", None)\n'
     '            return\n'
     '        ids = await db.bot_user_ids()\n'
     '        await call.answer(f"Отправляю: {len(ids)}")\n'
     '        await safe_edit(call.message, f"Рассылка пошла · получателей: {len(ids)}", None)\n'
     '        spawn(_run_broadcast(call.bot, ids, text, call.message))\n'
     '        return\n'
     '    if action == "start":'),

    ("переключатель автопарсинга", 'action == "autoparse"',
     '    elif action == "speed" and callback_data.value in SPEED_PRESETS:',
     '    elif action == "autoparse":\n'
     '        enabled = not await db.get_flag("autoparse")\n'
     '        await db.set_flag("autoparse", enabled)\n'
     '        if enabled and not crawler.running:\n'
     '            crawler.start()\n'
     '            note = "Автопарсинг включён, парсер запущен"\n'
     '        elif enabled:\n'
     '            note = "Автопарсинг включён"\n'
     '        else:\n'
     '            note = "Автопарсинг выключен"\n'
     '    elif action == "speed" and callback_data.value in SPEED_PRESETS:'),

    ("флаг в клавиатуре после колбэка", "        kb.admin_panel(crawler.running, crawler.preset, await db.get_flag",
     "    await safe_edit(\n"
     "        call.message, await panel_text(crawler, db, checker), kb.admin_panel(crawler.running, crawler.preset)\n"
     "    )",
     "    await safe_edit(\n"
     "        call.message,\n"
     "        await panel_text(crawler, db, checker),\n"
     "        kb.admin_panel(crawler.running, crawler.preset, await db.get_flag(\"autoparse\")),\n"
     "    )"),

    # ── Сама рассылка ──────────────────────────────────────────────────────
    ("команда и отправка рассылки", "async def cmd_broadcast",
     "async def cmd_floor(message: Message, command: CommandObject, db: Database) -> None:",
     '_pending_broadcast: dict[int, str] = {}\n'
     '\n'
     '\n'
     'async def cmd_broadcast(message: Message, command: CommandObject, db: Database) -> None:\n'
     '    """/broadcast <текст> — рассылка всем, кто запускал бота. Сначала предпросмотр."""\n'
     '    text = (command.args or "").strip()\n'
     '    if not text:\n'
     '        await message.answer(\n'
     '            "Формат: <code>/broadcast текст сообщения</code>\\n"\n'
     '            "Можно использовать HTML-разметку. Перед отправкой покажу предпросмотр."\n'
     '        )\n'
     '        return\n'
     '    ids = await db.bot_user_ids()\n'
     '    if not ids:\n'
     '        await message.answer("Некому отправлять: в базе нет ни одного пользователя бота.")\n'
     '        return\n'
     '    try:\n'
     '        await message.answer(\n'
     '            f"<b>Предпросмотр</b> · получателей: {len(ids)}\\n\\n{text}",\n'
     '            reply_markup=kb.broadcast_confirm(),\n'
     '        )\n'
     '    except TelegramBadRequest as e:\n'
     '        # Разметку пишет человек: сломанный HTML не должен ронять обработчик.\n'
     '        await message.answer(f"Разметка некорректна: <code>{escape(str(e))}</code>")\n'
     '        return\n'
     '    _pending_broadcast[message.from_user.id] = text\n'
     '\n'
     '\n'
     'async def _run_broadcast(bot, ids: list[int], text: str, report_to: Message) -> None:\n'
     '    """Рассылка идёт в фоне: при сотнях получателей обработчик не должен ждать её конца."""\n'
     '    sent = blocked = failed = 0\n'
     '    for uid in ids:\n'
     '        try:\n'
     '            await bot.send_message(uid, text)\n'
     '            sent += 1\n'
     '        except TelegramRetryAfter as e:\n'
     '            await asyncio.sleep(e.retry_after + 1)\n'
     '            try:\n'
     '                await bot.send_message(uid, text)\n'
     '                sent += 1\n'
     '            except Exception:\n'
     '                failed += 1\n'
     '        except TelegramForbiddenError:\n'
     '            blocked += 1          # заблокировал бота или удалил аккаунт\n'
     '        except Exception:\n'
     '            failed += 1\n'
     '        await asyncio.sleep(0.05)  # ~20 сообщений/с, ниже лимита Telegram\n'
     '    await report_to.answer(\n'
     '        f"<b>Рассылка завершена</b>\\n"\n'
     '        f"Отправлено: {sent}\\n"\n'
     '        f"Заблокировали бота: {blocked}\\n"\n'
     '        f"Ошибок: {failed}"\n'
     '    )\n'
     '\n'
     '\n'
     'async def cmd_floor(message: Message, command: CommandObject, db: Database) -> None:'),

    # ── Запуск ─────────────────────────────────────────────────────────────
    ("автозапуск по сохранённому флагу", "settings.autostart_parser or await db.get_flag",
     "    if settings.autostart_parser:\n"
     "        crawler.start()",
     "    if settings.autostart_parser or await db.get_flag(\"autoparse\"):\n"
     "        crawler.start()"),
]


def main():
    with open(TARGET, encoding="utf-8") as f:
        text = f.read()

    applied, skipped = [], []
    for name, marker, old, new in EDITS:
        if marker in text:
            skipped.append(name)
            continue
        found = text.count(old)
        if found != 1:
            sys.exit(f"ОШИБКА [{name}]: якорь найден {found} раз(а), ожидался ровно один.\n"
                     f"Ничего не записано — файл цел.")
        text = text.replace(old, new)
        applied.append(name)

    if not applied:
        print("Уже пропатчено — изменений нет.")
        return

    backup = f"{TARGET}.{time.strftime('%Y%m%d-%H%M%S')}.bak"
    shutil.copy2(TARGET, backup)
    with open(TARGET, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Бэкап: {backup}")
    for n in applied:
        print(f"  + {n}")
    for n in skipped:
        print(f"  · {n} (уже было)")
    print("\nГотово. Перезапусти: pm2 restart gift_parser_bot")


if __name__ == "__main__":
    main()
