#!/usr/bin/env python3
"""benevents agency — Chinese calligraphy experience: build the data the page uses.

Reads names.txt and syllables.txt (next to this file) and two fonts, and writes
assets/calligraphy/data.json: the name dictionary, the syllable table, the pinyin of
every character, and the outline of every character and letter the page can draw.
The page draws those outlines itself (on screen and in the PDF), so what is printed
never depends on the fonts of the tablet or of the printer.

Fonts (both under the SIL Open Font License, see assets/calligraphy/NOTICE.txt):
  --brush  Ma Shan Zheng (Chinese brush script), e.g. from the npm package
           @fontsource/ma-shan-zheng: files/ma-shan-zheng-chinese-simplified-400-normal.woff2
  --latin  Instrument Serif Italic (the visitor's own name), .ttf or .woff2

usage:  python3 tools/calligraphy/build.py --brush <file> --latin <file>
needs:  pip install fonttools brotli pypinyin uharfbuzz
"""
import argparse
import json
import os
import re
import sys
import unicodedata

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont
from pypinyin import Style, pinyin

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'assets', 'calligraphy', 'data.json')

ap = argparse.ArgumentParser()
ap.add_argument('--brush', required=True)
ap.add_argument('--latin', required=True)
args = ap.parse_args()


def key(s):
    """how a spelling is looked up: lower case, no accents, letters only"""
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z]', '', ''.join(c for c in s if not unicodedata.combining(c)))


def is_han(c):
    return '一' <= c <= '鿿'


# ---- names
names, problems = {}, []
for n, line in enumerate(open(os.path.join(HERE, 'names.txt'), encoding='utf-8'), 1):
    line = line.split('#')[0].strip()
    if not line:
        continue
    forms, _, spellings = line.partition(':')
    forms = [f.strip() for f in forms.split('/')]
    if not spellings.strip() or not all(f and all(is_han(c) for c in f) for f in forms):
        problems.append('names.txt line %d: cannot read "%s"' % (n, line))
        continue
    for sp in spellings.split():
        k = key(sp)
        if k in names and names[k] != forms:
            problems.append('names.txt line %d: "%s" is already listed as %s' % (n, sp, names[k][0]))
        names[k] = forms

# ---- syllable table
cols, table, final_l, feminine, readings = None, {}, '', {}, {}
for line in open(os.path.join(HERE, 'syllables.txt'), encoding='utf-8'):
    if line.startswith('#     _'):
        cols = line[1:].split()
        continue
    line = line.split('#')[0].strip()
    if not line:
        continue
    parts = line.split()
    if parts[0] == 'final-l':
        final_l = parts[1]
    elif parts[0] == 'feminine':
        feminine = {p[0]: p[1] for p in parts[1:]}
    elif parts[0] == 'pinyin':
        readings = {p[0]: p[1:] for p in parts[1:]}
    else:
        if len(parts) != len(cols) + 1:
            problems.append('syllables.txt: row "%s" has %d cells, expected %d' % (parts[0], len(parts) - 1, len(cols)))
            continue
        table[parts[0]] = {c: ('' if v == '-' else v) for c, v in zip(cols, parts[1:])}

chars = set(final_l) | set(feminine.values())
for forms in names.values():
    for f in forms:
        chars |= set(f)
for row in table.values():
    for v in row.values():
        chars |= set(v)
chars = sorted(c for c in chars if is_han(c))

# ---- pinyin of every character
py = {}
for c in chars:
    py[c] = readings.get(c) or pinyin(c, style=Style.TONE, heteronym=False)[0][0]


# ---- outlines
class PathPen(BasePen):
    """the outline as an SVG path, y pointing down, whole numbers"""

    def __init__(self, glyphset, top):
        BasePen.__init__(self, glyphset)
        self.top, self.d, self.box = top, [], [1e9, 1e9, -1e9, -1e9]

    def pt(self, p):
        x, y = round(p[0]), round(self.top - p[1])
        b = self.box
        b[0], b[1], b[2], b[3] = min(b[0], x), min(b[1], y), max(b[2], x), max(b[3], y)
        return '%d %d' % (x, y)

    def _moveTo(self, p):
        self.d.append('M' + self.pt(p))

    def _lineTo(self, p):
        self.d.append('L' + self.pt(p))

    def _qCurveToOne(self, c, p):
        self.d.append('Q%s %s' % (self.pt(c), self.pt(p)))

    def _curveToOne(self, c1, c2, p):
        self.d.append('C%s %s %s' % (self.pt(c1), self.pt(c2), self.pt(p)))

    def _closePath(self):
        self.d.append('Z')

    def _endPath(self):
        self.d.append('Z')


def outlines(path, wanted, with_advance):
    font = TTFont(path)
    upm = font['head'].unitsPerEm
    cmap = font.getBestCmap()
    gs = font.getGlyphSet()
    hmtx = font['hmtx']
    asc = font['hhea'].ascent if with_advance else round(upm * .88)
    out, missing = {}, []
    for c in wanted:
        g = cmap.get(ord(c))
        if g is None:
            missing.append(c)
            continue
        pen = PathPen(gs, asc)
        gs[g].draw(pen)
        d = ''.join(pen.d)
        out[c] = [hmtx[g][0], d] if with_advance else d
    return font, upm, asc, out, missing


_, upm_b, top_b, zh, missing = outlines(args.brush, chars, False)
if missing:
    problems.append('the brush font has no glyph for: ' + ' '.join(missing))

LATIN = (" -'’." + 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
         + ''.join(chr(c) for c in range(0xC0, 0x100) if c not in (0xD7, 0xF7)) + 'ŒœŸ')
font_l, upm_l, top_l, la, missing = outlines(args.latin, LATIN, True)
if missing:
    print('note: the Latin font has no glyph for', ' '.join(missing), '(those letters are drawn without their accent)')

# kerning of the Latin font, pair by pair, as the font's own shaping gives it
import uharfbuzz as hb
blob = hb.Blob(open(args.latin, 'rb').read())
face = hb.Face(blob)
hbfont = hb.Font(face)
kern = {}
letters = [c for c in la if c != ' ']
for a in letters:
    for b in letters:
        buf = hb.Buffer()
        buf.add_str(a + b)
        buf.guess_segment_properties()
        hb.shape(hbfont, buf, {'kern': True, 'liga': False})
        if len(buf.glyph_positions) != 2:
            continue
        delta = buf.glyph_positions[0].x_advance - la[a][0]
        if delta:
            kern[a + b] = delta

if problems:
    print('\n'.join('PROBLEM: ' + p for p in problems))
    sys.exit(1)

data = {
    'v': 1,
    'names': {k: v for k, v in sorted(names.items())},
    'table': table,
    'finalL': final_l,
    'feminine': feminine,
    'pinyin': py,
    'zh': {'upm': upm_b, 'top': top_b, 'glyphs': zh},
    'la': {'upm': upm_l, 'top': top_l, 'glyphs': la, 'kern': kern},
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
print('%d spellings of %d names, %d characters, %d Latin letters, %d kerning pairs -> %s (%.0f KB)' % (
    len(names), len({v[0] for v in names.values()}), len(zh), len(la), len(kern), os.path.relpath(OUT), os.path.getsize(OUT) / 1024))
