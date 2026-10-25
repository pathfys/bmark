# 🎁 Telegram Gift Market Tracker

Трекер маркета подарков Telegram Stars. Отслеживает новые листинги,
изменения цен и снятия с продажи коллекционных подарков.

## Что делает

- 📡 Опрашивает маркет подарков через MTProto API (`payments.getResaleStarGifts`)
- 🆕 Детектит новые листинги и выводит полную информацию
- 💰 Трекает изменения цен с историей
- ❌ Замечает снятие с продажи
- 👤 Показывает владельца (**если API его отдаёт**: `owner_id` → username, `owner_name`, или TON-адрес)
- 📊 Ведёт SQLite базу со всей историей
- 📢 Может слать уведомления в Telegram канал/чат
- 🎨 Rich-вывод в консоль (таблицы, панели, цвета)

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
# Клонируй репо
git clone <repo-url>
cd bmark

# Виртуальное окружение (рекомендуется)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Зависимости
pip install -r tracker/requirements.txt
```

## Настройка

1. Получи `API_ID` и `API_HASH` на https://my.telegram.org
2. Скопируй `.env.example` → `.env` и заполни:

```bash
cp tracker/.env.example .env
```

3. Редактируй `.env`:

```env
API_ID=12345678
API_HASH=your_api_hash_here

# Опционально: куда слать уведомления
NOTIFY_CHAT_ID=-1001234567890

# Опционально: трекать только определённые коллекции
TRACK_COLLECTIONS=Lunar Snake,Heart Crown
```

## Запуск

```bash
python tracker/main.py
```

При первом запуске Telethon попросит:
1. Номер телефона
2. Код из Telegram
3. 2FA пароль (если есть)

Сессия сохраняется в `gift_tracker.session`, повторный вход не нужен.

## Структура

```
tracker/
├── main.py          # Точка входа, основной цикл
├── api.py           # MTProto обёртка (Telethon raw requests)
├── db.py            # SQLite хранилище
├── display.py       # Rich-вывод + Telegram-уведомления
├── config.py        # Конфигурация из .env
├── requirements.txt # Зависимости
└── .env.example     # Пример конфигурации
```

## Требования

- Python 3.11+
- Telethon с поддержкой layer 210+ (для `GetResaleStarGiftsRequest`)
- Telegram аккаунт (userbot, не бот — метод доступен только юзерам)
