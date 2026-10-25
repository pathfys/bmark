# Telegram Gift Market Tracker

Трекер маркета подарков Telegram Stars. Юзербот опрашивает маркет,
бот отправляет листинги в группу с кнопками «Профиль продавца» и «Занять лот».

## Что делает

- Опрашивает маркет подарков через MTProto API (`payments.getResaleStarGifts`)
- Детектит новые листинги и снятия с продажи
- Фильтрует продавцов по уровню профиля и количеству NFT подарков
- Отправляет листинги в группу с инлайн-кнопками
- «Профиль продавца» — открывает профиль в Telegram
- «Занять лот» — отправляет DM продавцу и помечает лот занятым
- Ведёт SQLite базу со всей историей
- Rich-вывод в консоль

## Архитектура

Два клиента работают параллельно:

| Клиент | Задачи |
|--------|--------|
| **Юзербот** (Telethon) | Маркет API, проверка профилей, DM продавцам |
| **Бот** (Telethon) | Группа с кнопками, обработка callback'ов |

## Про скрытых владельцев

Telegram скрывает `owner_id` у подарков по умолчанию. Трекер работает с тем что доступно:

| Поле | Когда видно | Что показываем |
|------|------------|----------------|
| `owner_id` → username | Владелец публичный | `@username` |
| `owner_name` | Ник без привязки к аккаунту | Строку как есть |
| `owner_address` | Подарок на TON блокчейне | Сокращённый адрес |
| Ничего | Всё скрыто | «скрыт» |

## Установка

```bash
git clone <repo-url>
cd bmark

python -m venv venv
source venv/bin/activate  # Linux/Mac

pip install -r tracker/requirements.txt
```

## Настройка

1. Получи `API_ID` и `API_HASH` на https://my.telegram.org
2. Создай бота через [@BotFather](https://t.me/BotFather) и получи `BOT_TOKEN`
3. Создай супергруппу, добавь бота как админа, получи `LOG_GROUP_ID`
4. Скопируй и заполни `.env`:

```bash
cp tracker/.env.example .env
```

```env
API_ID=12345678
API_HASH=your_api_hash_here
BOT_TOKEN=123456:ABC-DEF...
LOG_GROUP_ID=-1001234567890

# Фильтры продавца
MAX_SELLER_LEVEL=10
MAX_SELLER_NFT_COUNT=10
```

## Запуск

```bash
python tracker/main.py
```

При первом запуске Telethon попросит номер телефона, код из Telegram и 2FA пароль (если есть).
Сессия сохраняется в `gift_tracker.session`.

## Структура

```
tracker/
├── main.py          # Точка входа, основной цикл
├── api.py           # MTProto обёртка (Telethon raw requests)
├── bot.py           # Бот: группа + кнопки + callback'и
├── checker.py       # Проверка профиля продавца (уровень, NFT)
├── db.py            # SQLite хранилище
├── display.py       # Rich-вывод в консоль
├── config.py        # Конфигурация из .env
├── requirements.txt # Зависимости
└── .env.example     # Пример конфигурации
```

## Требования

- Python 3.11+
- Telethon с поддержкой layer 210+
- Telegram аккаунт (юзербот) + бот (через BotFather)
