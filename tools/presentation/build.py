"""The agency presentation: sixteen slides, in French and in English, written from what the site says.
Step 2 of tools/presentation/build.sh.

usage: build.py SITE_JSON OUT_DIR
Reads SITE_JSON (dump.js: the site's words, projects and services) and the site's pictures,
writes OUT_DIR/img/*.jpg (each picture cut to its frame), OUT_DIR/deck-fr.html and OUT_DIR/deck-en.html.
The pages are then drawn by render.js. The look of the slides is in deck.css; what each slide holds is below."""
import html
import json
import os
import sys
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.normpath(os.path.join(HERE, '..', '..')) + os.sep
src, out = sys.argv[1], sys.argv[2]
D = json.load(open(src, encoding='utf-8'))
os.makedirs(out + '/img', exist_ok=True)
K = 4 / 3                                   # pictures are kept a third larger than their frame: the slides are drawn at 2560 x 1440
MAIL, PHONE, WA = 'contact@ben.events', '+212 661 11 85 90', 'https://wa.me/212661118590'
FILM = 'https://livid.com/watch/L6GCH7EFgl4D'
P = {p['id']: p for p in D['projects']}
SV = D['services']
made = {}


def e(s):
    return html.escape(s, quote=True)


def pic(name, path, w, h, focus=(.5, .5), blur=0, q=86):
    """Cut the picture at `path` to a w x h frame around `focus` and keep it as img/<name>.jpg."""
    if name in made:
        assert made[name] == (path, w, h), name
        return '/_img/%s.jpg' % name
    im = Image.open(SITE + 'assets/img/' + path).convert('RGB')
    W, H = im.size
    r = w / h
    if W / H > r:
        cw, ch = H * r, H
    else:
        cw, ch = W, W / r
    x = min(max(focus[0] * W - cw / 2, 0), W - cw)
    y = min(max(focus[1] * H - ch / 2, 0), H - ch)
    im = im.crop((round(x), round(y), round(x + cw), round(y + ch)))
    tw, th = round(w * K), round(h * K)
    if im.width != tw:
        im = im.resize((tw, th), Image.LANCZOS)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    im.save('%s/img/%s.jpg' % (out, name), quality=q, optimize=True, progressive=True)
    made[name] = (path, w, h)
    return '/_img/%s.jpg' % name


BRAND = '<div class="brand"><span class="brand__w"><b>ben</b>events</span><span class="brand__bar"><i></i><i></i><i></i><i></i></span><span class="brand__a">agency</span></div>'
BAR = '<div class="bar"><i></i><i></i><i></i><i></i></div>'
ICONS = [
    '<path d="M20 4H4a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 4 17h3v3.5l4.5-3.5H20a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 20 4z"/><path d="M8 9.5v2"/><path d="M12 8v5"/><path d="M16 9.5v2"/>',
    '<path d="M10 3.5c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6z"/><path d="M18 14c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3z"/><path d="M18.5 3.5v3"/><path d="M17 5h3"/>',
    '<path d="M6 3.5V9"/><path d="M6 13v7.5"/><path d="M12 3.5v2"/><path d="M12 9.5v11"/><path d="M18 3.5V13"/><path d="M18 17v3.5"/><circle cx="6" cy="11" r="2"/><circle cx="12" cy="7.5" r="2"/><circle cx="18" cy="15" r="2"/>',
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="m8.5 14.5 2.5 2.5 4.5-5"/>',
]

# words the site does not have, in both languages
W = {
    'fr': {'lang': 'fr', 'deck': 'benevents agency — Présentation', 'tagline': 'Présentation de l’agence', 'craft': 'Savoir-faire', 'does': 'Ce que nous prenons en charge',
           'work': 'Réalisation', 'film': 'Le film', 'mail': 'E-mail', 'site': 'Site', 'gala': 'dîner de gala', 'desk': 'régie',
           'clients': 'Entreprises, institutions et fondations nous confient les moments qui comptent pour elles.',
           'book': {'eyebrow': 'Prochaine étape', 'title': ['Quinze minutes', 'pour lancer votre projet.'],
                    'lede': 'Choisissez le créneau qui vous convient. Parlez-nous de l’occasion, de vos invités, de la date et de la ville : nous revenons vers vous avec de premières idées et la suite.',
                    'btn': 'Réserver un appel', 'note': '15 minutes, au créneau de votre choix', 'scan': 'Scannez pour réserver'},
           'split': {'about.title': 'C’est une signature.', 'srv.title': 'Une seule exigence.', 'pr.title': 'au dernier toast.', 'wall.title': 'sur scène.', 'cl.title': 'compagnie.', 'st.text': 'Voilà une production bien faite.'}},
    'en': {'lang': 'en', 'deck': 'benevents agency — Presentation', 'tagline': 'Agency presentation', 'craft': 'Craft', 'does': 'What we take care of',
           'work': 'Selected event', 'film': 'The film', 'mail': 'Email', 'site': 'Website', 'gala': 'gala dinner', 'desk': 'control desk',
           'clients': 'Companies, institutions and foundations trust us with the moments that matter to them.',
           'book': {'eyebrow': 'Next step', 'title': ['Fifteen minutes', 'to start your event.'],
                    'lede': 'Choose a time that suits you. Tell us about the occasion, your guests, the date and the city: we come back to you with first ideas and the next steps.',
                    'btn': 'Book a call', 'note': '15 minutes, at a time you choose', 'scan': 'Scan to book'},
           'split': {'about.title': 'It is a signature.', 'srv.title': 'One standard.', 'pr.title': 'to final toast.', 'wall.title': 'on stage.', 'cl.title': 'company.', 'st.text': 'That is production done properly.'}},
}


def deck(lang):
    T, w = D['text'][lang], W[lang]
    tr = lambda v: v if isinstance(v, str) else (v.get(lang) or v['en'])
    n = [0]

    def two(key):
        """A title of the site with its last words set apart: ('first part', 'last words')."""
        full, tail = T[key], w['split'][key]
        assert full.endswith(tail), (key, full, tail)
        return e(full[:-len(tail)].strip()), e(tail)

    def page(cls, body, bare=False):
        n[0] += 1
        return '<section id="s%02d" class="%s">\n<div class="stage"></div>\n%s\n%s<p class="pager"><i></i>%02d</p>\n</section>' % (n[0], cls, body, '' if bare else BRAND + '\n', n[0])

    def eyebrow(text):
        return '<p class="eyebrow"><i></i>%s</p>' % e(text)

    def shot(name, path, w_, h_, cap='', focus=(.5, .5), cls=''):
        return '<div class="ph %s" style="width:%dpx;height:%dpx;background-image:url(%s)">%s</div>' % (cls, w_, h_, pic(name, path, w_, h_, focus), '<p class="cap">%s</p>' % e(cap) if cap else '')

    S = []

    # 1 — cover
    S.append(page('cover', '''<div class="bg" style="background-image:url(%s)"></div>
<div class="veil veil--left"></div>
<div class="cover__in">
%s
<h1 class="mega%s">%s<br><span class="g">%s</span><br>%s</h1>
%s
<p class="lede">%s</p>
</div>
<p class="foot"><span>%s</span><span class="web" data-href="https://www.ben.events/">www.ben.events</span></p>''' % (
        pic('cover', 'gala-dinner.jpg', 1920, 1080, (.5, .5)), eyebrow(T['hero.eyebrow']), ' mega--long' if max(len(T['hero.l%d' % k]) for k in (1, 2, 3)) > 15 else '', e(T['hero.l1']), e(T['hero.l2']), e(T['hero.l3']), BAR, e(T['hero.lede']), e(w['tagline']))))

    # 2 — the agency
    a, b = two('about.title')
    S.append(page('about', '''<div class="col">
%s
<h2 class="h">%s <span class="g">%s</span></h2>
<p class="lede">%s</p>
<p class="body">%s</p>
<div class="pillars">%s</div>
</div>
<div class="about__pics">%s%s</div>''' % (
        eyebrow(T['about.eyebrow']), a, b, e(T['about.p1']), e(T['about.p2']),
        ''.join('<div class="pillar c%d"><b>%s</b><p>%s</p></div>' % (i, e(T['about.k%d' % i]), e(T['about.v%d' % i])) for i in (1, 2, 3)),
        shot('about-1', 'stage-runway.jpg', 600, 850, focus=(.5, .55), cls='ph--tall'), shot('about-2', 'control-desk-ballroom.jpg', 330, 248, cls='ph--small'))))

    # 3 — the four crafts at a glance
    a, b = two('srv.title')
    cards = []
    for i, (path, focus) in enumerate([('conference-opening.jpg', (.5, .5)), ('graduation-ceremony.jpg', (.5, .5)), ('reception-golden-spheres.jpg', (.42, .5)), ('production-desk.jpg', (.5, .5))], 1):
        cards.append('''<div class="craft" style="background-image:url(%s)"><span class="num">%02d</span><div class="craft__in"><h3>%s</h3><p class="tags">%s</p></div></div>''' % (
            pic('craft-%d' % i, path, 417, 590, focus), i, e(T['srv.%d.t' % i]).replace(' &amp; ', ' &amp;<br>', 1), ''.join('<span>%s</span>' % e(T['srv.%d.%s' % (i, k)]) for k in 'abc')))
    S.append(page('crafts', '''<div class="head">
%s
<h2 class="h">%s <span class="g">%s</span></h2>
</div>
<div class="crafts__row">%s</div>''' % (eyebrow(T['srv.eyebrow']), a, b, ''.join(cards))))

    # 4 to 7 — one slide per craft, with three events
    shots = [
        [('gsk-day.jpg', 'gsk-day', (.5, .55), ''), ('forum-panel.jpg', 'wexchange-forum', (.5, .5), ''), ('leo-regional-conference.jpg', 'leo-regional-conference', (.5, .5), '')],
        [('mta-cycle-meeting.jpg', 'mta-cycle-meeting', (.5, .6), ''), ('awards-celebration.jpg', 'sustainable-innovation-fest', (.5, .45), ''), ('wall/gala-tables-led-art.jpg', 'mta-cycle-meeting', (.5, .55), 'gala')],
        [('fanzone-can-2025.jpg', 'fanzone-can-2025', (.5, .5), ''), ('showroom-reception.jpg', 'centrale-automobile-cherifienne', (.5, .5), ''), ('volvo-built-on-trust.jpg', 'volvo-built-on-trust', (.5, .42), '')],
        [('onco-days.jpg', 'onco-days', (.5, .5), ''), ('production-desk.jpg', 'wexchange-forum', (.5, .5), 'desk'), ('tech-fest-maroc.jpg', 'tech-fest-maroc', (.5, .5), '')],
    ]
    for i in range(1, 5):
        title = T['srv.%d.t' % i].split(' & ')
        s = SV[i - 1]
        rows = ''.join('<li class="c%d">%s</li>' % (k % 4 + 1, e(line)) for k, line in enumerate(s['does'][lang]))
        ph = []
        for k, (path, pid, focus, extra) in enumerate(shots[i - 1]):
            cap = tr(P[pid]['title']) + (' · ' + w[extra] if extra else '')
            ph.append(shot('craft-%d-%d' % (i, k + 1), path, 430 if k == 0 else 430, 850 if k == 0 else 415, cap, focus, 'ph--a' if k == 0 else 'ph--b' if k == 1 else 'ph--c'))
        S.append(page('one', '''<div class="col">
<p class="kicker"><b>%02d</b> / 04<span>%s</span></p>
<h2 class="h%s">%s<br><span class="g">&amp; %s</span></h2>
<p class="lede">%s</p>
<p class="label">%s</p>
<ul class="rows">%s</ul>
</div>
<div class="mosaic">%s</div>''' % (i, e(w['craft']), ' h--long' if len(' & '.join(title[1:])) > 20 else '', e(title[0]), e(' & '.join(title[1:])), e(T['srv.%d.d' % i]), e(w['does']), rows, ''.join(ph))))

    # 8 — the statement
    full, tail = T['st.text'], w['split']['st.text']
    assert full.endswith(tail)
    S.append(page('say', '''<div class="bg" style="background-image:url(%s)"></div>
<div class="veil veil--all"></div>
<div class="say__in">
<h2 class="quote">%s<br><span class="g">%s</span></h2>
%s
</div>''' % (pic('statement', 'light-beams.jpg', 1920, 1080, (.5, .3), blur=2.2), e(full[:-len(tail)].strip()), e(tail), BAR)))

    # 9 — the approach, and the film
    a, b = two('pr.title')
    steps = ''.join('''<div class="step c%d"><div class="step__top"><span class="ico"><svg viewBox="0 0 24 24">%s</svg></span><span class="num">%02d</span></div><h3>%s</h3><p>%s</p></div>''' % (
        i, ICONS[i - 1], i, e(T['pr.%d.t' % i]), e(T['pr.%d.d' % i])) for i in (1, 2, 3, 4))
    S.append(page('how', '''<div class="head">
%s
<h2 class="h">%s <span class="g">%s</span></h2>
</div>
<div class="steps">%s</div>
<div class="film" data-href="%s" data-label="%s">
<div class="film__ph" style="background-image:url(%s)"><i></i></div>
<p class="film__k">%s</p>
<p class="film__t">%s</p>
<p class="film__s">%s</p>
<span class="film__go"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg></span>
</div>''' % (eyebrow(T['pr.eyebrow']), a, b, steps, FILM, e(T['reel.title']), pic('film', 'film-cover.jpg', 224, 126), e(w['film']), e(T['reel.title']), e(T['reel.sub']))))

    # 10 to 12 — three events, told
    def story(pid, apart=False):
        p = P[pid]
        t = tr(p['title']).split(' · ')
        head = '<h2 class="h">%s%s</h2>' % (e(t[0]), '<br><span class="g">%s</span>' % e(' · '.join(t[1:])) if len(t) > 1 else '')
        top = '<p class="kicker"><b>%s</b><span>%s</span></p>\n%s' % (e(w['work']), e(tr(p['kind'])), head)
        lede = '<p class="lede">%s</p>' % e(tr(p['intro']))
        return (top, lede) if apart else top + '\n' + lede

    top, lede = story('a-chance-to-reset', True)
    S.append(page('story story--band', '''<div class="band" style="background-image:url(%s)"></div>
<div class="col">
%s
</div>
%s''' % (pic('story-1', 'graduation-ceremony.jpg', 1728, 540, (.5, .453)), top, lede)))
    S.append(page('story', '''<div class="col">
%s
</div>
<div class="mosaic">%s%s%s</div>''' % (story('femmes-en-jeu'),
                                    shot('story-2-a', 'led-stage-set.jpg', 430, 850, focus=(.5, .55), cls='ph--a'),
                                    shot('story-2-b', 'projects/femmes-en-jeu/06.webp', 430, 415, focus=(.5, .45), cls='ph--b'),
                                    shot('story-2-c', 'projects/femmes-en-jeu/02.webp', 430, 415, focus=(.5, .5), cls='ph--c'))))
    S.append(page('story story--flip', '''<div class="mosaic">%s%s%s</div>
<div class="col">
%s
</div>''' % (shot('story-3-a', 'projects/marrakech-cocktail/01.webp', 430, 850, focus=(.5, .5), cls='ph--a'),
             shot('story-3-b', 'reception-golden-spheres.jpg', 430, 415, focus=(.45, .5), cls='ph--b'),
             shot('story-3-c', 'projects/marrakech-cocktail/02.webp', 430, 415, focus=(.5, .62), cls='ph--c'), story('marrakech-cocktail'))))

    # 13 — in pictures
    a, b = two('wall.title')
    wall = ['ballroom-purple', 'red-stage', 'conference-stage-armchairs', 'exhibition-stand', 'sound-console', 'rooftop-sunset',
            'led-wall-scientific-day', 'video-desk', 'stage-armchairs-led', 'watch-party-bean-bags', 'branded-entrance', 'sound-desk-gala']
    S.append(page('wall', '''<div class="head">
%s
<h2 class="h">%s <span class="g">%s</span></h2>
</div>
<div class="wall__grid">%s</div>''' % (eyebrow(T['wall.eyebrow']), a, b, ''.join(shot('wall-%02d' % (k + 1), 'wall/%s.jpg' % f, 274, 296, focus=(.5, .5)) for k, f in enumerate(wall)))))

    # 14 — clients
    a, b = two('cl.title')
    S.append(page('clients', '''<div class="head">
%s
<h2 class="h">%s <span class="g">%s</span></h2>
</div>
<div class="logos">%s</div>
<p class="clients__note">%s</p>''' % (eyebrow(T['cl.eyebrow']), a, b, ''.join('<div class="logo"><img src="/_site/%s" alt="%s"></div>' % (c['src'], e(c['name'])) for c in D['clients']), e(w['clients']))))

    # 15 — contact
    rows = [(w['mail'], MAIL, 'mailto:' + MAIL), ('WhatsApp', PHONE, WA), (w['site'], 'www.ben.events', 'https://www.ben.events/'),
            ('Instagram', '@benevents.agency', 'https://www.instagram.com/benevents.agency'), ('LinkedIn', 'benevents', 'https://www.linkedin.com/company/benevents/')]
    S.append(page('contact', '''<div class="bg" style="background-image:url(%s)"></div>
<div class="veil veil--left veil--deep"></div>
<div class="contact__in">
%s
<h2 class="mega mega--sm">%s<br><span class="g">%s</span></h2>
%s
<p class="lede">%s</p>
</div>
<div class="reach">%s</div>''' % (pic('contact', 'conference-opening.jpg', 1920, 1080, (.5, .5)), eyebrow(T['ct.eyebrow']), e(T['ft.cta1']), e(T['ft.cta2']), BAR, e(T['ct.lede']),
                                 ''.join('<p class="reach__row" data-href="%s" data-label="%s"><span>%s</span><b>%s</b></p>' % (e(h), e(k + ' : ' + v if lang == 'fr' else k + ': ' + v), e(k), e(v)) for k, v, h in rows))))

    # 16 — book a call: the button opens the calendar (on the site, as a pop-up; in the PDF, the page ben.events/book, which opens it), the QR code leads there from a screen or a printed page
    b = w['book']
    url = D['book']['url']
    rows = D['book']['qr']
    q = len(rows)
    cells = ''.join('<rect x="%d" y="%d" width="1" height="1"/>' % (c + 4, r + 4) for r, row in enumerate(rows) for c, v in enumerate(row) if v == '1')
    code = '<svg class="book__qr-code" viewBox="0 0 %d %d" shape-rendering="crispEdges" aria-hidden="true"><rect width="%d" height="%d" fill="#fff"/><g fill="#0a0a0c">%s</g></svg>' % (q + 8, q + 8, q + 8, q + 8, cells)
    cal = '<svg class="book__cal" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 10.5h17M8 3v4M16 3v4"/></svg>'
    short = url.replace('https://www.', '')
    S.append(page('book', '''<div class="bg" style="background-image:url(%s)"></div>
<div class="veil veil--left veil--deep"></div>
<div class="book__in">
%s
<h2 class="mega mega--sm">%s<br><span class="g">%s</span></h2>
%s
<p class="lede">%s</p>
<p class="book__btn" data-href="%s" data-label="%s">%s<span>%s</span></p>
<p class="book__note">%s</p>
</div>
<div class="book__qr">%s<p class="book__qr-say">%s</p><p class="book__qr-url">%s</p></div>''' % (pic('book', 'control-desk-ballroom.jpg', 1920, 1080, (.6, .5)), eyebrow(b['eyebrow']), e(b['title'][0]), e(b['title'][1]), BAR, e(b['lede']),
                                    e(url), e(b['btn'] + (' : ' if lang == 'fr' else ': ') + short), cal, e(b['btn']), e(b['note']), code, e(b['scan']), e(short))))

    return '''<!doctype html>
<html lang="%s">
<head>
<meta charset="utf-8">
<title>%s</title>
<style>
%s
</style>
</head>
<body>
%s
</body>
</html>
''' % (lang, e(w['deck']), CSS, '\n\n'.join(S))


CSS = open(os.path.join(HERE, 'deck.css'), encoding='utf-8').read()
for lang in ('fr', 'en'):
    open('%s/deck-%s.html' % (out, lang), 'w', encoding='utf-8').write(deck(lang))
    print('deck-%s.html written' % lang)
print(len(made), 'pictures')
