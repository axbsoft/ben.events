#!/usr/bin/env python3
"""benevents agency — calligraphy app: build the data the engine uses (assets/js/calli-core.js).

Writes into assets/calligraphy/:
  latin.json            the letters of the visitor's own name (from data.json, built by build.py)
  zh.json, zh-0.json …  Chinese: the names and tables, and the outlines a few characters per file
                        (from data.json too: run build.py first when names.txt or syllables.txt change)
  ja.json, ja-0.json …  Japanese: the names of names-ja.txt, and the outlines of the katakana, drawn
                        from a Japanese brush typeface in the forms it keeps for writing downwards
  ko.json, ko-0.json …  Korean: the names of names-ko.txt, and the outline of every syllable block
                        the engine can write, drawn from a Korean brush typeface

The outlines are split over several small files so that the page a visitor opens from their
e-mail fetches only the few characters of one name; the app at an event fetches them all.

Fonts (SIL Open Font License, see assets/calligraphy/NOTICE.txt):
  --korean    East Sea Dokdo (Korean brush script), e.g. from the npm package
              @fontsource/east-sea-dokdo: files/east-sea-dokdo-korean-400-normal.woff2
  --japanese  Yuji Boku (Japanese brush script), e.g. from the npm package
              @fontsource/yuji-boku: files/yuji-boku-japanese-400-normal.woff2

usage:  python3 tools/calligraphy/build_app.py --korean <file> --japanese <file>
needs:  pip install fonttools brotli
"""
import argparse
import hashlib
import json
import os
import re
import statistics
import sys
import unicodedata

from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'assets', 'calligraphy')
ZH_PARTS, JA_PARTS, KO_PARTS = 8, 2, 24
KO_INK = 860          # the usual height of a Korean block, in a cell of 1000 (Chinese characters fill about 900)
JA_INK = 800          # the usual height of a katakana sign: they are drawn smaller than characters
KATAKANA = ('アイウエオカキクケコガギグゲゴサシスセソザジズゼゾタチツテトダヂヅデドナニヌネノハヒフヘホバビブベボパピプペポ'
            'マミムメモヤユヨラリルレロワヲンヴァィゥェォャュョッー')

ap = argparse.ArgumentParser()
ap.add_argument('--korean', required=True)
ap.add_argument('--japanese', required=True)
args = ap.parse_args()
problems = []


def key(s):
    """how a spelling is looked up: lower case, no accents, letters only"""
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z]', '', ''.join(c for c in s if not unicodedata.combining(c)))


def write(name, data):
    path = os.path.join(OUT, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    return os.path.getsize(path)


def split(script, glyphs, parts):
    """the outlines over several files: a character is in the file its code points to"""
    sets = [{} for _ in range(parts)]
    for ch, d in glyphs.items():
        sets[(((ord(ch) * 0x9E3779B1) & 0xFFFFFFFF) >> 16) % parts][ch] = d      # the same sum as part() in calli-core.js
    return [write('%s-%d.json' % (script, k), s) for k, s in enumerate(sets)]


def stamp(obj):
    return hashlib.sha1(json.dumps(obj, ensure_ascii=False, sort_keys=True).encode('utf-8')).hexdigest()[:8]


# ---- Chinese and Latin: taken from data.json as build.py wrote it
old = json.load(open(os.path.join(OUT, 'data.json'), encoding='utf-8'))
write('latin.json', old['la'])
zh = {'v': stamp(old['zh']), 'names': old['names'], 'table': old['table'], 'finalL': old['finalL'], 'feminine': old['feminine'],
      'pinyin': old['pinyin'], 'upm': old['zh']['upm'], 'parts': ZH_PARTS}
zh_sizes = split('zh', old['zh']['glyphs'], ZH_PARTS)
write('zh.json', zh)

def read_names(file, first, last):
    """a list of names: forms written with the characters from first to last, then their spellings"""
    found = {}
    for n, line in enumerate(open(os.path.join(HERE, file), encoding='utf-8'), 1):
        line = line.split('#')[0].strip()
        if not line:
            continue
        forms, _, spellings = line.partition(':')
        forms = [f.strip() for f in forms.split('/')]
        if not spellings.strip() or not all(f and all(first <= c <= last for c in f) for f in forms):
            problems.append('%s line %d: cannot read "%s"' % (file, n, line))
            continue
        for sp in spellings.split():
            k = key(sp)
            if k in found and found[k] != forms:
                problems.append('%s line %d: "%s" is already listed as %s' % (file, n, sp, found[k][0]))
            found[k] = forms
    return found


names = read_names('names-ko.txt', '가', '힣')
names_ja = read_names('names-ja.txt', 'ァ', 'ー')

# ---- every block the engine can write (see writeKo in calli-core.js), and those of the names
#      consonants ㅇㅂㅍㄷㅌㄱㅋㅈㅊㅅㅎㅁㄴㄹ, closing consonants none ㄱ ㄴ ㄹ ㅁ ㅂ ㅇ
LEAD = [11, 7, 17, 3, 16, 0, 15, 12, 14, 9, 18, 6, 2, 5]
TAIL = [0, 1, 4, 8, 16, 17, 21]
PLAIN = [0, 5, 11, 20, 8, 13, 18, 4]          # ㅏ ㅔ ㅚ ㅣ ㅗ ㅜ ㅡ ㅓ, after any consonant
GLIDE = [2, 7, 6, 12, 17]                     # ㅑ ㅖ ㅕ ㅛ ㅠ, after ㅇ and ㅅ only
ROUND = [9, 15, 14, 16]                       # ㅘ ㅞ ㅝ ㅟ, after ㅇ only


def block(l, v, t):
    return chr(0xAC00 + (l * 21 + v) * 28 + t)


wanted = set()
for t in TAIL:
    for v in PLAIN:
        wanted |= {block(l, v, t) for l in LEAD}
    for v in GLIDE:
        wanted |= {block(11, v, t), block(9, v, t)}
    for v in ROUND:
        wanted.add(block(11, v, t))
listed = {c for forms in names.values() for f in forms for c in f}


# ---- outlines
class PathPen(BasePen):
    """the outline as an SVG path in a cell of 1000, y pointing down, whole numbers"""

    def __init__(self, glyphset, fit):
        BasePen.__init__(self, glyphset)
        self.fit, self.d = fit, []

    def pt(self, p):
        k, cx, cy = self.fit
        return '%d %d' % (round(500 + k * (p[0] - cx)), round(500 - k * (p[1] - cy)))

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


font = TTFont(args.korean)
cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font['hmtx']
have = sorted(c for c in wanted | listed if ord(c) in cmap)
for c in sorted(listed):
    if ord(c) not in cmap:
        problems.append('the Korean typeface has no glyph for %s (used in names-ko.txt)' % c)

# the typeface draws its blocks smaller than its cell: they are enlarged to the size of the Chinese characters,
# each one about the centre of its own cell (the middle of its width, the middle of the line)
heights = []
for c in have:
    b = BoundsPen(gs)
    gs[cmap[ord(c)]].draw(b)
    if b.bounds:
        heights.append(b.bounds[3] - b.bounds[1])
scale = round(KO_INK / statistics.median(heights), 3)
mid = (font['hhea'].ascent + font['hhea'].descent) / 2
ko_glyphs = {}
for c in have:
    g = cmap[ord(c)]
    pen = PathPen(gs, (scale, hmtx[g][0] / 2, mid))
    gs[g].draw(pen)
    ko_glyphs[c] = ''.join(pen.d)

# ---- Japanese: the katakana, each in the form the typeface keeps for writing downwards
#      (the long-vowel mark stands upright, the small signs sit at the top right of their cell)
jfont = TTFont(args.japanese)
jcmap, jgs, jhmtx = jfont.getBestCmap(), jfont.getGlyphSet(), jfont['hmtx']
upright = {}
if 'GSUB' in jfont:
    gsub = jfont['GSUB'].table
    for rec in gsub.FeatureList.FeatureRecord:
        if rec.FeatureTag == 'vert':
            for index in rec.Feature.LookupListIndex:
                for sub in gsub.LookupList.Lookup[index].SubTable:
                    sub = getattr(sub, 'ExtSubTable', sub)
                    upright.update(getattr(sub, 'mapping', {}) or {})
ja_chars = sorted(set(KATAKANA) | {c for forms in names_ja.values() for f in forms for c in f})
for c in ja_chars:
    if ord(c) not in jcmap:
        problems.append('the Japanese typeface has no glyph for %s' % c)
ja_chars = [c for c in ja_chars if ord(c) in jcmap]
if 'ー' in ja_chars and jcmap[ord('ー')] not in upright:
    problems.append('the Japanese typeface has no upright long-vowel mark: names would be wrong when written downwards')
jheights = []
for c in ja_chars:
    if c in 'ァィゥェォャュョッー':
        continue
    b = BoundsPen(jgs)
    jgs[jcmap[ord(c)]].draw(b)
    if b.bounds:
        jheights.append(b.bounds[3] - b.bounds[1])
jscale = round(JA_INK / statistics.median(jheights), 3)
jmid = jfont['head'].unitsPerEm * .38          # the middle of the cell of a full-width sign: it runs from -120 to 880
ja_glyphs = {}
for c in ja_chars:
    g = jcmap[ord(c)]
    g = upright.get(g, g)
    pen = PathPen(jgs, (jscale, jhmtx[g][0] / 2, jmid))
    jgs[g].draw(pen)
    ja_glyphs[c] = ''.join(pen.d)

if problems:
    print('\n'.join('PROBLEM: ' + p for p in problems))
    sys.exit(1)

ja = {'v': stamp(ja_glyphs), 'names': {k: v for k, v in sorted(names_ja.items())}, 'have': ''.join(ja_chars), 'upm': 1000, 'parts': JA_PARTS}
ja_sizes = split('ja', ja_glyphs, JA_PARTS)
write('ja.json', ja)

ko = {'v': stamp(ko_glyphs), 'names': {k: v for k, v in sorted(names.items())}, 'have': ''.join(have), 'upm': 1000, 'parts': KO_PARTS}
ko_sizes = split('ko', ko_glyphs, KO_PARTS)
write('ko.json', ko)

lacking = sorted(wanted - set(have))
print('Chinese: %d spellings, %d characters in %d files (%.0f KB, largest %.0f KB)' % (
    len(zh['names']), len(old['zh']['glyphs']), ZH_PARTS, sum(zh_sizes) / 1024, max(zh_sizes) / 1024))
print('Japanese: %d spellings listed, %d signs in %d files (%.0f KB), %d in their upright form, enlarged %.2f times' % (
    len(names_ja), len(ja_glyphs), JA_PARTS, sum(ja_sizes) / 1024, sum(1 for c in ja_chars if jcmap[ord(c)] in upright), jscale))
print('Korean:  %d spellings listed, %d blocks in %d files (%.0f KB, largest %.0f KB), enlarged %.2f times' % (
    len(names), len(have), KO_PARTS, sum(ko_sizes) / 1024, max(ko_sizes) / 1024, scale))
print('         %d blocks the engine could ask for are not in the typeface (it then writes a simpler vowel, or the closing consonant apart): %s' % (
    len(lacking), ''.join(lacking)))
