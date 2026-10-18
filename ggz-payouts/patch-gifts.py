#!/usr/bin/env python3
"""Adds a "gift links" field to the payout form inside the built frontend.

The frontend ships only as a minified bundle, so this edits it by exact string
match. The new field is deliberately uncontrolled — introducing a useState into
minified React would shift the hook order and break the screen, whereas reading
the value from the DOM at submit time touches no hooks at all.

Usage: python3 patch-gifts.py /var/www/ggzpays/index.html
Re-running is a no-op.
"""
import shutil
import sys
import time

TARGET = sys.argv[1] if len(sys.argv) > 1 else "/var/www/ggzpays/index.html"

FIELD = (
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

# Anchors are matched verbatim against the shipped bundle; each must appear once.
EDITS = [
    (
        "gift links field",
        'k.jsxs("div",{style:{marginBottom:22},children:['
        'k.jsx("label",{htmlFor:"ggz-comment",style:Rw,children:"Комментарий — опционально"})',
        FIELD
        + 'k.jsxs("div",{style:{marginBottom:22},children:['
        'k.jsx("label",{htmlFor:"ggz-comment",style:Rw,children:"Комментарий — опционально"})',
    ),
    (
        "send gifts with the request",
        '_9({amount:p,address:m,memo:S,comment:y})',
        '_9({amount:p,address:m,memo:S,comment:y,'
        'gifts:((document.getElementById("ggz-gifts")||{}).value||"").trim()})',
    ),
    (
        "require the field before submitting",
        'k.jsx(Et.button,{className:"pressable",onClick:N,disabled:!_,',
        'k.jsx(Et.button,{className:"pressable",onClick:(...GZr)=>{'
        'var GZe=document.getElementById("ggz-gifts"),'
        'GZb=document.getElementById("ggz-gifts-box");'
        'if(GZe&&!GZe.value.trim()){if(GZb)GZb.style.borderColor="#5c1f1c";'
        'GZe.focus();return}'
        'if(GZb)GZb.style.borderColor="#1c1c1e";'
        'return N(...GZr)},disabled:!_,',
    ),
]

with open(TARGET, encoding="utf-8") as f:
    html = f.read()

if 'id:"ggz-gifts"' in html:
    print("Уже пропатчено — изменений нет.")
    sys.exit(0)

for name, old, new in EDITS:
    found = html.count(old)
    if found != 1:
        sys.exit(f"ОШИБКА [{name}]: якорь найден {found} раз(а), ожидался ровно один.\n"
                 f"Файл не изменён. Вероятно, фронт пересобран и якоря разошлись.")
    html = html.replace(old, new)

backup = f"{TARGET}.{time.strftime('%Y%m%d-%H%M%S')}.bak"
shutil.copy2(TARGET, backup)
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Бэкап:  {backup}")
for name, _, _ in EDITS:
    print(f"  + {name}")
print("Готово.")
