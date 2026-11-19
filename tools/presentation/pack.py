"""Web set of the agency presentation: numbered slide pictures, the sheet of thumbnails and the descriptions.
Step 4 of tools/presentation/build.sh.

usage: pack.py DECK_DIR
Reads DECK_DIR/png-<lang>/sNN.png (2560 x 1440) and DECK_DIR/meta-<lang>.json,
writes DECK_DIR/web/slides-<lang>/NN.webp, DECK_DIR/web/thumbs-<lang>.webp and DECK_DIR/web/meta.json."""
import json
import os
import sys
from PIL import Image

d = sys.argv[1]
web = os.path.join(d, 'web')
TW, TH, COLS = 384, 216, 6
meta = {}
for lang in ('fr', 'en'):
    src = os.path.join(d, 'png-' + lang)
    files = sorted(f for f in os.listdir(src) if f.endswith('.png'))
    out = os.path.join(web, 'slides-' + lang)
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.webp'):
            os.remove(os.path.join(out, f))
    rows = -(-len(files) // COLS)
    sheet = Image.new('RGB', (TW * COLS, TH * rows), (8, 8, 10))
    total = 0
    for i, f in enumerate(files):
        im = Image.open(os.path.join(src, f)).convert('RGB')
        assert im.size == (2560, 1440), (f, im.size)
        name = os.path.join(out, '%02d.webp' % (i + 1))
        im.save(name, quality=82, method=6)
        total += os.path.getsize(name)
        sheet.paste(im.resize((TW, TH), Image.LANCZOS), ((i % COLS) * TW, (i // COLS) * TH))
    sheet.save(os.path.join(web, 'thumbs-%s.webp' % lang), quality=80, method=6)
    by_id = {m['id']: m for m in json.load(open(os.path.join(d, 'meta-%s.json' % lang), encoding='utf-8'))}
    meta[lang] = [{'text': by_id[f[:-4]]['text'], 'links': by_id[f[:-4]]['links']} for f in files]
    print(lang, len(files), 'slides, %.2f MB,' % (total / 1048576), rows, 'rows of thumbnails')
json.dump(meta, open(os.path.join(web, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('meta.json written')
