#!/bin/sh
# benevents agency — rebuild the agency's own presentation (presentation.html) from what the site says.
#
# The slides take their words from the site (index.html, assets/js/i18n.js, projects.js, services.js)
# and their pictures from assets/img/. After changing the site, or the slides themselves
# (build.py: what each slide holds; deck.css: how it looks), run from the root of the site:
#
#     sh tools/presentation/build.sh
#
# It writes the slides, the thumbnails and the two PDFs into assets/presentation/, and the picture shown
# when the link is shared into assets/img/og-presentation.jpg.
# Needs Python 3 with Pillow, and Node with Playwright. Working files go to a temporary folder
# (or to the folder given as first argument, to look at them afterwards).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../.." && pwd)
WORK=${1:-$(mktemp -d)}
mkdir -p "$WORK"

node "$HERE/dump.js" "$WORK/site.json"
python3 "$HERE/build.py" "$WORK/site.json" "$WORK"
for L in fr en; do
  DECK_META="$WORK/meta-$L.json" node "$HERE/render.js" "$WORK/deck-$L.html" "$WORK" "$WORK/png-$L" png
done
python3 "$HERE/pack.py" "$WORK"
for L in fr en; do
  node "$HERE/render.js" "$WORK/deck-$L.html" "$WORK" "$WORK/web" pdf "benevents-agency-presentation-$L.pdf"
done
# the cover, cut to the shape of a link preview
python3 -c "
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
w, h = im.size
ch = round(w * 630 / 1200)
top = (h - ch) // 2
im.crop((0, top, w, top + ch)).resize((1200, 630), Image.LANCZOS).save(sys.argv[2], quality=86, optimize=True, progressive=True)
" "$WORK/png-fr/s01.png" "$ROOT/assets/img/og-presentation.jpg"

cd "$ROOT"
node tools/lock-presentation.mjs --out assets/presentation --open \
  --lang fr --slides "$WORK/web/slides-fr" --thumbs "$WORK/web/thumbs-fr.webp" --pdf "$WORK/web/benevents-agency-presentation-fr.pdf" --pdf-name "benevents-agency-presentation-fr.pdf" \
  --lang en --slides "$WORK/web/slides-en" --thumbs "$WORK/web/thumbs-en.webp" --pdf "$WORK/web/benevents-agency-presentation-en.pdf" --pdf-name "benevents-agency-presentation-en.pdf" \
  --meta "$WORK/web/meta.json"
echo "done (working files: $WORK)"
