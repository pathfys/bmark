#!/usr/bin/env python3
"""Applies both outstanding changes to a live GGZ Payouts deployment:

  1. a "gift links" field on the payout form (frontend + backend + operator message)
  2. the private-channel invite handed to a user when their application is approved

Every edit is anchored on exact text and skipped when already present, so the
script is safe to re-run and safe to apply whether or not an earlier patch
landed. Nothing is written unless all anchors for a file match.

    python3 patch-ggz.py

Paths can be overridden:
    python3 patch-ggz.py --html /var/www/ggzpays/index.html \
                         --server /root/ggz-payouts/server.py \
                         --env /root/ggz-payouts/.env
"""
import argparse
import os
import shutil
import subprocess
import sys
import time

INVITE_LINK = "https://t.me/+OuJFnYNgKgMzOWJh"

# ── Фронтенд ────────────────────────────────────────────────────────────────
# Фронт поставляется только собранным, поэтому правится по точным строкам.
# Поле намеренно неуправляемое: добавление useState в минифицированный React
# сдвинуло бы порядок хуков и сломало экран, а чтение значения из DOM в момент
# отправки не трогает хуки вовсе.
GIFT_FIELD = (
    'k.jsxs("div",{style:{marginBottom:18},children:['
    'k.jsx("label",{htmlFor:"ggz-gifts",style:Rw,children:"Ссылки на подарки"}),'
    'k.jsx("div",{id:"ggz-gifts-box",style:{display:"flex",alignItems:"stretch",gap:6,'
    'background:"#0a0a0a",border:"1px solid #1c1c1e",borderRadius:16,'
    'padding:"10px 14px",transition:"border-color 0.22s cubic-bezier(0.16, 1, 0.3, 1)"},'
    'children:k.jsx("textarea",{id:"ggz-gifts",rows:3,'
    'placeholder:"https://t.me/nft/…",'
    'autoComplete:"off",autoCapitalize:"off",spellCheck:!1,'
    'style:{flex:1,minWidth:0,minHeight:74,background:"transparent",border:"none",'
    'outline:"none",fontSize:14,color:"#ffffff",resize:"vertical",lineHeight:1.5,'
    'fontFamily:"inherit",padding:0}})}),'
    'k.jsx("div",{style:{fontSize:12,color:"#8e8e93",marginTop:7,paddingLeft:2},'
    'children:"Каждую ссылку с новой строки"})]}),'
)

COMMENT_BLOCK = (
    'k.jsxs("div",{style:{marginBottom:22},children:['
    'k.jsx("label",{htmlFor:"ggz-comment",style:Rw,children:"Комментарий — опционально"})'
)

HTML_EDITS = [
    ("поле «Ссылки на подарки»", 'htmlFor:"ggz-gifts"',
     COMMENT_BLOCK, GIFT_FIELD + COMMENT_BLOCK),

    ("отправка ссылок с заявкой", 'gifts:((document.getElementById',
     '_9({amount:p,address:m,memo:S,comment:y})',
     '_9({amount:p,address:m,memo:S,comment:y,'
     'gifts:((document.getElementById("ggz-gifts")||{}).value||"").trim()})'),

    ("поле обязательно к заполнению", 'GZr',
     'k.jsx(Et.button,{className:"pressable",onClick:N,disabled:!_,',
     'k.jsx(Et.button,{className:"pressable",onClick:(...GZr)=>{'
     'var GZe=document.getElementById("ggz-gifts"),'
     'GZb=document.getElementById("ggz-gifts-box");'
     'if(GZe&&!GZe.value.trim()){if(GZb)GZb.style.borderColor="#5c1f1c";'
     'GZe.focus();return}'
     'if(GZb)GZb.style.borderColor="#1c1c1e";'
     'return N(...GZr)},disabled:!_,'),
]

# ── Бэкенд ──────────────────────────────────────────────────────────────────
SERVER_EDITS = [
    ("приём ссылок в заявке на выплату", 'body.get("gifts"',
     '                    comment = str(body.get("comment", "")).strip()[:280]\n'
     '                    now_ms = int(time.time() * 1000)',
     '                    comment = str(body.get("comment", "")).strip()[:280]\n'
     '                    gifts = str(body.get("gifts", "")).strip()[:1000]\n'
     '                    now_ms = int(time.time() * 1000)'),

    ("сохранение ссылок", '"gifts": gifts,',
     '                        "memo": memo, "comment": comment, "status": "pending",',
     '                        "memo": memo, "comment": comment, "gifts": gifts,\n'
     '                        "status": "pending",'),

    ("возврат ссылок клиенту", '"gifts": rec.get("gifts")',
     '        "comment": rec.get("comment") or "",\n'
     '        "status": rec.get("status", "pending"),',
     '        "comment": rec.get("comment") or "",\n'
     '        "gifts": rec.get("gifts") or "",\n'
     '        "status": rec.get("status", "pending"),'),

    ("ссылки в сообщении оператору", "<b>Подарки:</b>",
     '        f"<b>Memo:</b> {_ue(rec.get(\'memo\', \'—\'), 32)}\\n"\n'
     '        f"<b>Статус:</b> {html.escape(label)}"\n'
     '    )\n'
     '    return text + suffix',
     '        f"<b>Memo:</b> {_ue(rec.get(\'memo\', \'—\'), 32)}\\n"\n'
     '    )\n'
     '    # Ссылки на подарки — оператор проверяет их перед выплатой, поэтому они\n'
     '    # идут отдельным блоком, а не в одну строку с остальным.\n'
     '    gifts = str(rec.get("gifts") or "").strip()\n'
     '    text += f"<b>Подарки:</b>\\n{_ue(gifts, 700) if gifts else \'— не указаны\'}\\n"\n'
     '    text += f"<b>Статус:</b> {html.escape(label)}"\n'
     '    return text + suffix'),

    ("настройка ссылки-приглашения", "INVITE_LINK = os.environ.get",
     'APP_URL = os.environ.get("APP_URL", "").strip()',
     'APP_URL = os.environ.get("APP_URL", "").strip()\n'
     '# Приглашение в закрытый канал — выдаётся пользователю при одобрении заявки.\n'
     'INVITE_LINK = os.environ.get("INVITE_LINK", "").strip()'),

    ("приглашение в тексте одобрения", "Ссылка на закрытый канал",
     'MSG_APPROVED = "🎉 <b>Ваша заявка одобрена! Доступ к GGZ Pay открыт.</b>"',
     'MSG_APPROVED = "🎉 <b>Ваша заявка одобрена! Доступ к GGZ Pay открыт.</b>"\n'
     'if INVITE_LINK:\n'
     '    # Ссылку дублируем текстом: кнопку легко потерять в истории, а ссылку\n'
     '    # можно скопировать и переслать.\n'
     '    MSG_APPROVED += f"\\n\\n🔗 Ссылка на закрытый канал:\\n{html.escape(INVITE_LINK)}"'),

    ("кнопка вступления в канал", "Вступить в канал",
     'def _open_keyboard() -> dict | None:\n'
     '    # web_app-кнопка работает только по https и только в личке\n'
     '    if not APP_URL.startswith("https://"):\n'
     '        return None\n'
     '    return {"inline_keyboard": [[{"text": "🚀 Открыть GGZ Pay", '
     '"web_app": {"url": APP_URL}}]]}',
     'def _open_keyboard() -> dict | None:\n'
     '    rows = []\n'
     '    # web_app-кнопка работает только по https и только в личке\n'
     '    if APP_URL.startswith("https://"):\n'
     '        rows.append([{"text": "🚀 Открыть GGZ Pay", "web_app": {"url": APP_URL}}])\n'
     '    if INVITE_LINK.startswith("https://"):\n'
     '        rows.append([{"text": "🔗 Вступить в канал", "url": INVITE_LINK}])\n'
     '    return {"inline_keyboard": rows} if rows else None'),
]


def patch_file(path, edits, label):
    with open(path, encoding="utf-8") as f:
        text = f.read()

    original = text
    applied, skipped = [], []

    for name, marker, old, new in edits:
        if marker in text:
            skipped.append(name)
            continue
        found = text.count(old)
        if found != 1:
            sys.exit(f"ОШИБКА [{label} / {name}]: якорь найден {found} раз(а), "
                     f"ожидался ровно один.\nНичего не записано — файл цел.")
        text = text.replace(old, new)
        applied.append(name)

    if text == original:
        print(f"{label}: уже пропатчен, изменений нет")
        return False

    backup = f"{path}.{time.strftime('%Y%m%d-%H%M%S')}.bak"
    shutil.copy2(path, backup)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"{label}: {os.path.basename(path)}")
    print(f"  бэкап: {backup}")
    for n in applied:
        print(f"  + {n}")
    for n in skipped:
        print(f"  · {n} (уже было)")
    return True


def read_env(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def ensure_invite(path):
    env = read_env(path)
    if env.get("INVITE_LINK") == INVITE_LINK:
        print(".env: INVITE_LINK уже на месте")
        return
    shutil.copy2(path, f"{path}.{time.strftime('%Y%m%d-%H%M%S')}.bak")
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()
    lines = [l for l in lines if not l.strip().startswith("INVITE_LINK=")]
    if lines and not lines[-1].endswith("\n"):
        lines[-1] += "\n"
    lines.append(f"INVITE_LINK={INVITE_LINK}\n")
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f".env: INVITE_LINK={INVITE_LINK}")


def restart(env_path):
    # pm2 --update-env берёт окружение вызывающего процесса, а server.py сам
    # .env не читает. Передаём файл явно, чтобы не зависеть от того, что
    # экспортировано в оболочке.
    env = {**os.environ, **read_env(env_path)}
    try:
        subprocess.run(["pm2", "restart", "ggz-payouts", "--update-env"],
                       env=env, check=True)
    except FileNotFoundError:
        print("pm2 не найден — перезапусти сервис вручную")
        return
    except subprocess.CalledProcessError as e:
        print(f"pm2 вернул код {e.returncode} — проверь `pm2 list`")
        return
    print("ggz-payouts перезапущен")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", default="/var/www/ggzpays/index.html")
    ap.add_argument("--server", default="/root/ggz-payouts/server.py")
    ap.add_argument("--env", default="/root/ggz-payouts/.env")
    ap.add_argument("--no-restart", action="store_true")
    args = ap.parse_args()

    for p in (args.html, args.server, args.env):
        if not os.path.exists(p):
            sys.exit(f"ОШИБКА: не найден {p}")

    patch_file(args.html, HTML_EDITS, "Фронтенд")
    print()
    patch_file(args.server, SERVER_EDITS, "Бэкенд")
    print()
    ensure_invite(args.env)
    print()
    if not args.no_restart:
        restart(args.env)
    print("\nГотово.")


if __name__ == "__main__":
    main()
