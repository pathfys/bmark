"""
Форматирование и вывод данных трекера.
Консольный вывод через Rich + форматирование для Telegram-уведомлений.
"""
from __future__ import annotations

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from api import ResaleListing

console = Console()


def format_stars(amount: int) -> str:
    """Форматировать количество Stars с разделителями."""
    if amount >= 1_000_000:
        return f"{amount / 1_000_000:.1f}M ⭐"
    if amount >= 1_000:
        return f"{amount / 1_000:.1f}K ⭐"
    return f"{amount} ⭐"


def print_new_listing(listing: ResaleListing):
    """Вывести новый листинг в консоль."""
    owner = listing.owner_display
    attrs = ", ".join(
        f"{a.type}: {a.name} ({a.rarity_percent:.1f}%)"
        for a in listing.attributes
    )

    panel_content = Text()
    panel_content.append("Коллекция: ", style="dim")
    panel_content.append(f"{listing.title}\n", style="bold")
    panel_content.append("Номер: ", style="dim")
    panel_content.append(f"#{listing.num}\n" if listing.num else "—\n")
    panel_content.append("Цена: ", style="dim")
    panel_content.append(f"{format_stars(listing.price_stars)}\n", style="bold yellow")
    panel_content.append("Владелец: ", style="dim")
    panel_content.append(f"{owner}\n", style="bold cyan" if listing.owner_username else "")
    if attrs:
        panel_content.append("Атрибуты: ", style="dim")
        panel_content.append(f"{attrs}\n")
    if listing.gift_link:
        panel_content.append("Ссылка: ", style="dim")
        panel_content.append(listing.gift_link, style="underline blue")

    console.print(Panel(
        panel_content,
        title="🆕 Новый листинг",
        border_style="green",
    ))


def print_price_change(listing: ResaleListing, old_price: int):
    """Вывести изменение цены."""
    direction = "📈" if listing.price_stars > old_price else "📉"
    console.print(
        f"  {direction} [bold]{listing.title}[/] #{listing.num or '?'} "
        f"[dim]{format_stars(old_price)}[/] → "
        f"[bold yellow]{format_stars(listing.price_stars)}[/] "
        f"[dim]({listing.owner_display})[/]"
    )


def print_delisted(info: dict):
    """Вывести снятый с продажи листинг."""
    console.print(
        f"  ❌ [dim]Снят:[/] {info.get('title', '?')} "
        f"#{info.get('num', '?')} "
        f"[dim]{format_stars(info.get('price_stars', 0))}[/]"
    )


def print_listings_table(listings: list[ResaleListing], title: str = "Листинги"):
    """Вывести таблицу текущих листингов."""
    table = Table(title=title, show_lines=False)
    table.add_column("#", style="dim", width=6)
    table.add_column("Коллекция", style="bold")
    table.add_column("Номер", justify="right")
    table.add_column("Цена", justify="right", style="yellow")
    table.add_column("Владелец", style="cyan")
    table.add_column("Атрибуты", style="dim")
    table.add_column("Ссылка", style="dim underline")

    for i, l in enumerate(listings, 1):
        attrs_short = " / ".join(a.name for a in l.attributes[:3])
        table.add_row(
            str(i),
            l.title or "?",
            f"#{l.num}" if l.num else "—",
            format_stars(l.price_stars),
            l.owner_display,
            attrs_short,
            l.gift_link or "—",
        )

    console.print(table)


def print_stats(stats: dict):
    """Вывести статистику трекера."""
    console.print(Panel(
        f"[bold]Активных листингов:[/] {stats['active_listings']}\n"
        f"[bold]Всего замечено:[/] {stats['total_seen']}\n"
        f"[bold]Коллекций:[/] {stats['collections_tracked']}",
        title="📊 Статистика",
        border_style="blue",
    ))


def format_tg_notification(listing: ResaleListing) -> str:
    """Форматировать уведомление для отправки в Telegram."""
    attrs = "\n".join(
        f"  • {a.type}: {a.name} ({a.rarity_percent:.1f}%)"
        for a in listing.attributes
    )

    lines = [
        f"🆕 <b>Новый листинг на маркете</b>",
        f"",
        f"📦 <b>{listing.title}</b> #{listing.num or '?'}",
        f"💰 <b>{format_stars(listing.price_stars)}</b>",
        f"👤 Владелец: <code>{listing.owner_display}</code>",
    ]
    if attrs:
        lines.append(f"🎨 Атрибуты:\n{attrs}")
    if listing.gift_link:
        lines.append(f"🔗 <a href=\"{listing.gift_link}\">Открыть подарок</a>")

    return "\n".join(lines)
