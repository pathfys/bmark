"""
SQLite хранилище для трекинга листингов.
Хранит историю листингов, цен, снэпшоты владельцев и клеймы.
"""
import aiosqlite
from config import DB_PATH


async def init_db() -> aiosqlite.Connection:
    """Инициализация БД и создание таблиц."""
    db = await aiosqlite.connect(DB_PATH)
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS collections (
            gift_id       INTEGER PRIMARY KEY,
            title         TEXT NOT NULL,
            slug          TEXT,
            total_issued  INTEGER DEFAULT 0,
            first_seen    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS listings (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_gift_id  INTEGER NOT NULL,
            gift_id         INTEGER NOT NULL,
            num             INTEGER,
            slug            TEXT,
            title           TEXT,
            -- owner info
            owner_id        INTEGER,
            owner_name      TEXT,
            owner_username  TEXT,
            owner_address   TEXT,
            -- seller profile
            seller_level    INTEGER,
            seller_nft_count INTEGER,
            -- цена
            price_stars     INTEGER NOT NULL,
            -- метаданные
            attributes_json TEXT,
            first_seen      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_seen       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active       BOOLEAN DEFAULT 1,
            -- сообщение в группе (для редактирования при клейме)
            log_message_id  INTEGER,
            -- клейм
            claimed_by      INTEGER,
            claimed_at      TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS price_history (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            unique_gift_id  INTEGER NOT NULL,
            price_stars     INTEGER NOT NULL,
            recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_listings_active
            ON listings(is_active, gift_id);
        CREATE INDEX IF NOT EXISTS idx_listings_unique_id
            ON listings(unique_gift_id);
        CREATE INDEX IF NOT EXISTS idx_price_history_gift
            ON price_history(unique_gift_id, recorded_at);
    """)
    await db.commit()
    return db


async def upsert_listing(
    db: aiosqlite.Connection,
    unique_gift_id: int,
    gift_id: int,
    num: int | None,
    slug: str | None,
    title: str | None,
    owner_id: int | None,
    owner_name: str | None,
    owner_username: str | None,
    owner_address: str | None,
    price_stars: int,
    attributes_json: str | None,
    seller_level: int | None = None,
    seller_nft_count: int | None = None,
) -> bool:
    """
    Вставить или обновить листинг.
    Возвращает True если это НОВЫЙ листинг (ранее не виден).
    """
    cursor = await db.execute(
        "SELECT id, price_stars FROM listings WHERE unique_gift_id = ?",
        (unique_gift_id,),
    )
    row = await cursor.fetchone()

    if row is None:
        await db.execute(
            """INSERT INTO listings
               (unique_gift_id, gift_id, num, slug, title,
                owner_id, owner_name, owner_username, owner_address,
                seller_level, seller_nft_count,
                price_stars, attributes_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                unique_gift_id, gift_id, num, slug, title,
                owner_id, owner_name, owner_username, owner_address,
                seller_level, seller_nft_count,
                price_stars, attributes_json,
            ),
        )
        await db.execute(
            "INSERT INTO price_history (unique_gift_id, price_stars) VALUES (?, ?)",
            (unique_gift_id, price_stars),
        )
        await db.commit()
        return True

    # Существующий — обновляем
    old_price = row[1]
    await db.execute(
        """UPDATE listings SET
            owner_id = ?, owner_name = ?, owner_username = ?,
            owner_address = ?, seller_level = ?, seller_nft_count = ?,
            price_stars = ?, last_seen = CURRENT_TIMESTAMP, is_active = 1
           WHERE unique_gift_id = ?""",
        (owner_id, owner_name, owner_username, owner_address,
         seller_level, seller_nft_count,
         price_stars, unique_gift_id),
    )

    if old_price != price_stars:
        await db.execute(
            "INSERT INTO price_history (unique_gift_id, price_stars) VALUES (?, ?)",
            (unique_gift_id, price_stars),
        )

    await db.commit()
    return False


async def set_log_message_id(
    db: aiosqlite.Connection, unique_gift_id: int, message_id: int
):
    """Сохранить ID сообщения в группе для последующего редактирования."""
    await db.execute(
        "UPDATE listings SET log_message_id = ? WHERE unique_gift_id = ?",
        (message_id, unique_gift_id),
    )
    await db.commit()


async def get_listing_by_unique_id(
    db: aiosqlite.Connection, unique_gift_id: int
) -> dict | None:
    """Получить листинг по unique_gift_id."""
    cursor = await db.execute(
        """SELECT unique_gift_id, gift_id, num, slug, title,
                  owner_id, owner_name, owner_username, owner_address,
                  seller_level, seller_nft_count,
                  price_stars, log_message_id, claimed_by
           FROM listings WHERE unique_gift_id = ?""",
        (unique_gift_id,),
    )
    row = await cursor.fetchone()
    if not row:
        return None
    return {
        "unique_gift_id": row[0],
        "gift_id": row[1],
        "num": row[2],
        "slug": row[3],
        "title": row[4],
        "owner_id": row[5],
        "owner_name": row[6],
        "owner_username": row[7],
        "owner_address": row[8],
        "seller_level": row[9],
        "seller_nft_count": row[10],
        "price_stars": row[11],
        "log_message_id": row[12],
        "claimed_by": row[13],
    }


async def set_claimed(
    db: aiosqlite.Connection, unique_gift_id: int, claimed_by: int
):
    """Пометить лот как занятый."""
    await db.execute(
        """UPDATE listings SET
            claimed_by = ?, claimed_at = CURRENT_TIMESTAMP
           WHERE unique_gift_id = ?""",
        (claimed_by, unique_gift_id),
    )
    await db.commit()


async def mark_delisted(
    db: aiosqlite.Connection, active_ids: set[int], gift_id: int
) -> list[dict]:
    """Пометить листинги как неактивные, если их нет в текущем списке."""
    cursor = await db.execute(
        "SELECT unique_gift_id, title, num, price_stars FROM listings "
        "WHERE is_active = 1 AND gift_id = ?",
        (gift_id,),
    )
    rows = await cursor.fetchall()
    delisted = []
    for row in rows:
        uid, title, num, price = row
        if uid not in active_ids:
            await db.execute(
                "UPDATE listings SET is_active = 0, last_seen = CURRENT_TIMESTAMP "
                "WHERE unique_gift_id = ?",
                (uid,),
            )
            delisted.append({
                "unique_gift_id": uid,
                "title": title,
                "num": num,
                "price_stars": price,
            })
    if delisted:
        await db.commit()
    return delisted


async def upsert_collection(
    db: aiosqlite.Connection,
    gift_id: int,
    title: str,
    slug: str | None,
    total_issued: int,
):
    """Обновить или добавить коллекцию в каталог."""
    await db.execute(
        """INSERT INTO collections (gift_id, title, slug, total_issued)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(gift_id) DO UPDATE SET
               title = excluded.title,
               slug = excluded.slug,
               total_issued = excluded.total_issued""",
        (gift_id, title, slug, total_issued),
    )
    await db.commit()


async def get_stats(db: aiosqlite.Connection) -> dict:
    """Общая статистика трекера."""
    cursor = await db.execute(
        "SELECT COUNT(*) FROM listings WHERE is_active = 1"
    )
    active = (await cursor.fetchone())[0]

    cursor = await db.execute("SELECT COUNT(*) FROM listings")
    total = (await cursor.fetchone())[0]

    cursor = await db.execute("SELECT COUNT(*) FROM collections")
    collections = (await cursor.fetchone())[0]

    cursor = await db.execute(
        "SELECT COUNT(*) FROM listings WHERE claimed_by IS NOT NULL"
    )
    claimed = (await cursor.fetchone())[0]

    return {
        "active_listings": active,
        "total_seen": total,
        "collections_tracked": collections,
        "total_claimed": claimed,
    }
