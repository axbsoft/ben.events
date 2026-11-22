#!/usr/bin/env python3
"""benevents agency — the pictures of link previews.

When a link to a page is shared (WhatsApp, LinkedIn, a text message…), the picture shown under it should be
1200 x 630, a plain JPEG and light: a tall photo is cut badly or left out, a heavy one is not loaded.
This tool cuts each page's own picture to that shape, into assets/img/og/.

    python3 tools/site/previews.py            make the previews that are missing or older than their picture
    python3 tools/site/previews.py --all      make them all again
    python3 tools/site/previews.py --sheet F  also write one picture showing them all, to check the cuts

Which pictures: the site builder says (node tools/site/build.mjs --previews). Then build the pages again,
so that they point to the new previews:  node tools/site/build.mjs

Where the cut is taken: the middle, a little above centre. For a picture whose subject is elsewhere, give its
place in FOCUS below (0 = left or top, 1 = right or bottom). Needs Pillow (pip install Pillow)."""
import os
import subprocess
import sys
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
W, H = 1200, 630
MOST = 240 * 1024                      # bytes: a preview heavier than about 300 KB is not shown by some messaging apps

# picture (its name in assets/img) -> where its subject is: (across, down)
FOCUS = {
}


def cut(src, out, focus):
    im = Image.open(src).convert('RGB')
    k = max(W / im.width, H / im.height)
    im = im.resize((max(W, round(im.width * k)), max(H, round(im.height * k))), Image.LANCZOS)
    x = round((im.width - W) * focus[0])
    y = round((im.height - H) * focus[1])
    im = im.crop((x, y, x + W, y + H))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    for q in (86, 82, 78, 74, 70, 64):
        im.save(out, 'JPEG', quality=q, optimize=True, progressive=False)      # plain (baseline): every app reads it
        if os.path.getsize(out) <= MOST:
            break
    return im


def main():
    every = '--all' in sys.argv
    sheet = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else None
    lines = subprocess.run(['node', os.path.join(ROOT, 'tools', 'site', 'build.mjs'), '--previews'], capture_output=True, text=True, check=True).stdout.split('\n')
    pairs = [l.split('\t') for l in lines if '\t' in l]
    made, shown = 0, []
    for src, out in pairs:
        s, o = os.path.join(ROOT, src), os.path.join(ROOT, out)
        if not os.path.exists(s):
            print('missing picture:', src)
            continue
        name = src[len('assets/img/'):]
        if every or not os.path.exists(o) or os.path.getmtime(o) < os.path.getmtime(s):
            cut(s, o, FOCUS.get(name, (.5, .42)))
            made += 1
            print('%-52s %4d KB' % (out, os.path.getsize(o) // 1024))
        shown.append(o)
    print('%d preview(s) made, %d in all' % (made, len(shown)))
    if sheet and shown:
        cols, w, h = 4, 600, 315
        rows = (len(shown) + cols - 1) // cols
        page = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
        for i, f in enumerate(shown):
            page.paste(Image.open(f).resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
        page.save(sheet, quality=85)
        print('sheet:', sheet)


if __name__ == '__main__':
    main()
