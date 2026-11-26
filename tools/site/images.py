"""benevents agency — lighter copies of the photos, so that pages open fast on a phone.

For every photo in assets/img/ (the projects, the wall, the photos of the services) this writes smaller
copies in assets/img/_w/<width>/, as WebP:
    480 pixels wide   for every photo
    960 pixels wide   for the large ones, and for the JPEG photos of that width (the copy is about half their weight)
and a WebP copy of the first picture of the home page (assets/img/hero.webp), with a narrower one for phones held upright
(assets/img/hero-phone.webp: the middle of the photo, which is all a phone shows of it).
The pages written by tools/site/build.mjs offer these copies to the browser, which picks the right one.

Run it from the root of the site when photos are added or replaced, before tools/site/build.mjs:

    python3 tools/site/images.py

Needs Python 3 with Pillow. Copies that are already there and newer than their photo are left alone."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(os.path.join(HERE, '..', '..', 'assets', 'img'))
SKIP_DIRS = {'_w', 'clients', 'thumbs', 'og'}   # logos, link previews, and the thumbnails the photo wall already has
SKIP = ('og', 'logo', 'favicon', 'film-cover', 'hero')   # the hero has its own copy, below
WIDTHS = [480, 960]


def worth(width, w, name):
    """Is a copy of this width lighter enough than the photo itself?"""
    if w >= width * 1.25:
        return True
    return width == 960 and w >= 960 and not name.lower().endswith('.webp')

made = kept = 0
total = 0
for folder, dirs, files in os.walk(IMG):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in sorted(files):
        if not f.lower().endswith(('.jpg', '.jpeg', '.webp', '.png')) or f.startswith(SKIP):
            continue
        src = os.path.join(folder, f)
        rel = os.path.relpath(src, IMG)
        with Image.open(src) as im:
            w, h = im.size
            for width in WIDTHS:
                if not worth(width, w, f):
                    continue
                out = os.path.join(IMG, '_w', str(width), os.path.splitext(rel)[0] + '.webp')
                if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
                    kept += 1
                    total += os.path.getsize(out)
                    continue
                os.makedirs(os.path.dirname(out), exist_ok=True)
                (im.convert('RGB') if w == width else im.convert('RGB').resize((width, round(h * width / w)), Image.LANCZOS)).save(out, 'WEBP', quality=76, method=6)
                made += 1
                total += os.path.getsize(out)

# the first picture of the home page: the same photo, lighter
hero, light = os.path.join(IMG, 'hero.jpg'), os.path.join(IMG, 'hero.webp')
if not os.path.exists(light) or os.path.getmtime(light) < os.path.getmtime(hero):
    with Image.open(hero) as im:
        im.convert('RGB').save(light, 'WEBP', quality=70, method=6)
    made += 1
# phones held upright show only the middle of the square photo (style.css, "media--hero"): this is that middle,
# a little wider than any phone shows, so the picture is the same and the download lighter
phone = os.path.join(IMG, 'hero-phone.webp')
if not os.path.exists(phone) or os.path.getmtime(phone) < os.path.getmtime(hero):
    with Image.open(hero) as im:
        w, h = im.size
        cw = round(h * 0.66)
        im.convert('RGB').crop(((w - cw) // 2, 0, (w - cw) // 2 + cw, h)).save(phone, 'WEBP', quality=70, method=6)
    made += 1
print('%d copies written, %d already there, %.1f MB in assets/img/_w; first picture of the home page: %d KB (was %d KB)' % (
    made, kept, total / 1048576, os.path.getsize(light) // 1024, os.path.getsize(hero) // 1024))
