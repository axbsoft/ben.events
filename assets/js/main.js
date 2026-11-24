/* benevents agency — interactions. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SITE SETTINGS — edit these two blocks.
     The portfolio projects and their photos are in assets/js/projects.js.
     ------------------------------------------------------------------ */

  // Address that receives enquiries from the contact form.
  var CONTACT_EMAIL = 'contact@ben.events';
  var WHATSAPP = '+212 661 11 85 90';       // the number WhatsApp opens, with its country code; empty: no WhatsApp links
  var FILM_PLAYER = 'https://livid.com/embed/L6GCH7EFgl4D';     // the address of the film's player, the "src" of the embed code its hosting gives; empty: the play button opens the film's own page

  // Photos and logo. Put files in assets/img/ and set the path here.
  // Any slot left empty keeps its coloured placeholder artwork.
  // A slot can also be ['path', 'position'] to choose which part of the photo
  // stays in view when it is cropped (any CSS background-position).
  // The photo wall is listed in index.html, not here.
  var MEDIA = {
    logo: '',        // e.g. 'assets/img/logo-white.svg' (replaces the drawn wordmark)
    hero: 'assets/img/hero.webp',     // a lighter copy of hero.jpg (the gala tables before the LED wall), made by tools/site/images.py
    about1: 'assets/img/stage-runway.jpg',
    about2: 'assets/img/control-desk-ballroom.jpg',
    service1: 'assets/img/conference-opening.jpg',
    service2: 'assets/img/graduation-ceremony.jpg',
    service3: 'assets/img/reception-golden-spheres.jpg',
    service4: 'assets/img/production-desk.jpg',
    statement: ['assets/img/light-beams.jpg', 'center 22%'],
    reel: 'assets/img/film-cover.jpg'                           // the cover shown before the film plays
  };
  // the photo of each service is given with the service (assets/js/services.js)
  (window.BEN_SERVICES || []).forEach(function (s, i) { if (s.image) MEDIA['service' + (i + 1)] = s.image[0]; });
  /* ------------------------------------------------------------------ */

  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var hasIO = 'IntersectionObserver' in window;
  var two = function (n) { return (n < 10 ? '0' : '') + n; };
  var el = function (tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  var plainClick = function (e) { return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button); };
  // what visitors do, counted without identifying anyone (assets/js/stats.js); where that file is absent nothing happens
  var count = function (name, props) { if (window.benCount) window.benCount(name, props); };

  var I18N = window.BEN_I18N || { fr: {}, meta: {}, js: {} };
  var PROJECTS = window.BEN_PROJECTS || [], PLACES = window.BEN_PLACES || {};
  var lang = 'en';
  function ui() { return I18N.js[lang] || I18N.js.en || {}; }
  // text of a value that is either a string or { en: '…', fr: '…' }
  function tr(v) { return v == null ? '' : typeof v === 'string' ? v : (v[lang] || v.en || ''); }

  /* ---------- The film: it plays in place, once the visitor asks for it ---------- */
  var reelFrame = $('.reel__frame'), reelPlay = $('.reel__play');
  if (reelPlay && /^https:\/\//.test(FILM_PLAYER)) {
    reelPlay.setAttribute('data-i18n-aria', 'reel.play');
    reelPlay.setAttribute('aria-label', 'Play the film');
    reelPlay.addEventListener('click', function (e) {
      e.preventDefault();
      var player = doc.createElement('iframe');
      player.src = FILM_PLAYER + (FILM_PLAYER.indexOf('?') > -1 ? '&' : '?') + 'autoplay=1';       // the visitor has just pressed play
      player.title = $('.reel__title').textContent + ' — benevents agency';
      player.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share';
      player.setAttribute('allowfullscreen', '');
      player.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      reelFrame.appendChild(player);
      reelPlay.hidden = true;
      player.focus();
      count('film_play');
    });
  }

  /* ---------- Key figures and client quotes, built from voices.js ---------- */
  var voices = $('.voices'), figBox = $('.figures'), quoteBox = $('.quotes');
  var FIGURES = (window.BEN_FIGURES || []).slice(0, 4), QUOTES = window.BEN_QUOTES || [];
  // A preview for the agency only. With ?apercu=avis at the end of the address, drafts of reviews show where the
  // real ones will go, each marked as a draft: texts proposed to a client, who has not yet agreed to them. No
  // person is named. Visitors of the site never see them, and as soon as voices.js holds a real quote, the
  // drafts are gone for good.
  var SAMPLE = !QUOTES.length && /[?&]apercu=avis\b/.test(location.search);
  var SAMPLE_WORDS = { fr: ['Brouillon', 'Aperçu : ces avis sont des brouillons, en attente de l’accord de chaque client. Ils ne s’affichent qu’avec ce lien, jamais pour les visiteurs du site.'],
    en: ['Draft', 'Preview: these reviews are drafts, awaiting each client’s approval. They show only with this link, never to visitors of the site.'] };
  if (SAMPLE) {
    QUOTES = [
      { text: { fr: 'Une équipe qui maîtrise parfaitement son métier. La coordination, la scénographie et la gestion technique ont été menées avec beaucoup de rigueur. Ce qui fait la différence avec benevents, c’est cette capacité à anticiper les détails tout en gardant une vraie vision d’ensemble.',
          en: 'A team that truly masters its craft. Coordination, scenography and the technical side were handled with great rigour. What sets benevents apart is the ability to anticipate the details while keeping the whole picture in view.' },
        name: 'Prénom Nom', role: { fr: 'RMA · Convention d’entreprise', en: 'RMA · Corporate convention' } },
      { text: { fr: 'Nous avons particulièrement apprécié l’accompagnement de l’équipe, toujours disponible et à l’écoute. De la préparation de la scène à la gestion des interventions, tout a été pensé pour assurer le bon déroulement de nos cérémonies. Une collaboration très professionnelle.',
          en: 'We particularly valued the support of the team, always available and attentive. From preparing the stage to managing the speakers, everything was designed so that our ceremonies would run smoothly. A very professional collaboration.' },
        name: 'Prénom Nom', role: { fr: 'EFE Maroc · A Chance to Reset', en: 'EFE Maroc · A Chance to Reset' } },
      { text: { fr: 'benevents a su traduire notre univers de marque en une mise en scène élégante et cohérente. L’équipe a été force de proposition tout en respectant nos attentes. Le résultat correspondait parfaitement à l’esprit que nous souhaitions donner à cette soirée.',
          en: 'benevents translated the world of our brand into an elegant, coherent staging. The team came with ideas of its own while respecting our expectations. The result matched exactly the spirit we wanted for the evening.' },
        name: 'Prénom Nom', role: { fr: 'Volvo · Built on Trust', en: 'Volvo · Built on Trust' } }
    ];
    var noIndex = doc.createElement('meta');             // a preview is not a page for search engines
    noIndex.name = 'robots'; noIndex.content = 'noindex';
    doc.head.appendChild(noIndex);
  }
  function figureText(f, v) { return (f.before || '') + v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') + (f.after || ''); }
  function voicesText() {                              // everything that depends on the language
    if (!voices || voices.hidden) return;
    $$('.figure', figBox).forEach(function (n, i) {
      $('b', n).textContent = figureText(FIGURES[i], FIGURES[i].value);
      $('span', n).textContent = tr(FIGURES[i].label);
    });
    $$('.quote', quoteBox).forEach(function (n, i) {
      $('blockquote', n).textContent = tr(QUOTES[i].text);
      $('figcaption span', n).textContent = [tr(QUOTES[i].role), QUOTES[i].company].filter(Boolean).join(' · ');
      if (SAMPLE) n.setAttribute('data-tag', (SAMPLE_WORDS[lang] || SAMPLE_WORDS.en)[0]);
    });
    if (SAMPLE) $('.voices__sample', voices).textContent = (SAMPLE_WORDS[lang] || SAMPLE_WORDS.en)[1];
  }
  if (voices && (FIGURES.length || QUOTES.length)) {
    FIGURES.forEach(function () {
      var li = doc.createElement('li');
      li.className = 'figure';
      li.setAttribute('data-reveal', '');
      li.innerHTML = '<b></b><span></span>';
      figBox.appendChild(li);
    });
    QUOTES.forEach(function (q) {
      var fig = doc.createElement('figure');
      fig.className = 'quote';
      fig.setAttribute('data-reveal', '');
      fig.innerHTML = '<blockquote></blockquote><figcaption><b></b><span></span></figcaption>';
      $('figcaption b', fig).textContent = q.name || '';
      quoteBox.appendChild(fig);
    });
    figBox.hidden = !FIGURES.length;
    quoteBox.hidden = !QUOTES.length;
    voices.hidden = false;
    if (SAMPLE) {                                        // the examples say what they are, above them and on each
      quoteBox.classList.add('quotes--sample');
      var sampleNote = doc.createElement('p');
      sampleNote.className = 'voices__sample';
      sampleNote.setAttribute('role', 'note');
      voices.insertBefore(sampleNote, quoteBox);
    }
    // each number counts up the first time it is seen
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var counted = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          counted.unobserve(e.target);
          var f = FIGURES[$$('.figure', figBox).indexOf(e.target)], b = $('b', e.target), t0 = performance.now();
          (function step(now) {
            var p = Math.max(0, Math.min(1, (now - t0) / 1400));
            b.textContent = figureText(f, Math.round(f.value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: 0.4 });
      $$('.figure', figBox).forEach(function (n) { counted.observe(n); });
    }
  }

  /* ---------- Portfolio cards, built from projects.js ---------- */
  var track = $('.gallery__track'), byId = {};
  var ICON_PHOTOS = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="14" height="14" rx="2.5"/><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17"/></svg>';
  (function () {
    var last = track ? $('.card--cta', track) : null;
    // taken out while the cards go in: a swiped strip would otherwise stay parked on this last card
    if (last) track.removeChild(last);
    PROJECTS.forEach(function (p, i) {
      p.index = i;
      byId[p.id] = p;
      MEDIA['pj-' + p.id] = [p.photos[0][0], p.cover || ''];
      I18N.fr['pj.' + p.id + '.t'] = typeof p.title === 'string' ? p.title : p.title.fr;
      I18N.fr['pj.' + p.id + '.k'] = p.kind.fr;
      if (!track) return;

      var card = el('a', 'card' + (i % 2 ? ' card--low' : ''));
      card.href = '#project/' + p.id;
      card.setAttribute('data-project', p.id);
      card.setAttribute('data-tilt', '');

      var pic = el('div', 'card__media'), photo = el('div', 'media');
      photo.setAttribute('data-img', 'pj-' + p.id);
      pic.appendChild(photo);
      if (p.photos.length > 1) {
        var count = el('span', 'card__count');
        count.setAttribute('aria-hidden', 'true');
        count.innerHTML = ICON_PHOTOS;
        count.appendChild(doc.createTextNode(p.photos.length));
        pic.appendChild(count);
      }
      var go = el('span', 'card__go');
      go.setAttribute('aria-hidden', 'true');
      pic.appendChild(go);

      var cap = el('div', 'card__cap');
      var num = el('em', '', two(i + 1));
      var name = el('b', '', typeof p.title === 'string' ? p.title : p.title.en);
      var kind = el('span', 'card__kind', p.kind.en);
      var view = el('span', 'card__view', 'View project');
      num.setAttribute('aria-hidden', 'true');
      name.setAttribute('data-i18n', 'pj.' + p.id + '.t');
      kind.setAttribute('data-i18n', 'pj.' + p.id + '.k');
      view.setAttribute('data-i18n', 'gal.view');
      cap.appendChild(num); cap.appendChild(name); cap.appendChild(kind); cap.appendChild(view);

      card.appendChild(pic); card.appendChild(cap);
      track.appendChild(card);
    });
    if (last) track.appendChild(last);
    if (track) track.scrollLeft = 0;
  })();

  /* ---------- Media slots (photos load as their section comes near) ---------- */
  function mediaOf(key) {
    var m = MEDIA[key];
    if (!m) return null;
    return typeof m === 'string' ? { src: m, pos: '' } : { src: m[0], pos: m[1] || '' };
  }
  function paint(el) {
    var m = mediaOf(el.getAttribute('data-img'));
    if (!m || el.classList.contains('has-img')) return;
    if (m.pos) el.style.backgroundPosition = m.pos;
    el.style.backgroundImage = 'url("' + m.src + '")';
    el.classList.add('has-img');
  }
  var galleryEl = $('.gallery'), galleryLater = [];
  function paintGalleryRest() { galleryLater.forEach(paint); galleryLater = []; }
  var nearIO = hasIO ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      nearIO.unobserve(entry.target);
      if (entry.target === galleryEl) {
        // the portfolio slides sideways: its first photos load now, the others once it starts moving
        var slots = $$('[data-img]', galleryEl);
        slots.slice(0, 4).forEach(paint);
        galleryLater = slots.slice(4);
      } else paint(entry.target);
    });
  }, { rootMargin: '800px 0px' }) : null;
  $$('[data-img]').forEach(function (el) {
    var m = mediaOf(el.getAttribute('data-img'));
    if (!m) return;
    if (el.tagName === 'IMG') {
      el.src = m.src; el.hidden = false;
      var t = el.parentNode.querySelector('.logo__text'); if (t) t.hidden = true;
    } else if (!nearIO || el.closest('.hero')) {
      paint(el);
    } else if (!galleryEl || !galleryEl.contains(el)) {
      nearIO.observe(el);
    }
  });
  if (nearIO && galleryEl) nearIO.observe(galleryEl);

  /* ---------- Contact email ---------- */
  $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + CONTACT_EMAIL; a.textContent = CONTACT_EMAIL; });
  // WhatsApp opens on a first line written in the visitor's language
  function waLinks() {
    var number = WHATSAPP.replace(/\D/g, '');
    $$('[data-wa]').forEach(function (a) {
      a.hidden = !number;
      if (number) a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent((I18N.js[lang] || I18N.js.en).wa);
    });
    if (mbar) {
      mbar.hidden = !number;
      $$('[data-tel]', mbar).forEach(function (a) { a.href = 'tel:+' + number; });
    }
  }
  // On phones, a bar with WhatsApp and a call stays at the bottom of the screen. It comes once the first screen
  // is passed, and steps aside where the page has its own ways to reach us: the contact section and the footer.
  var mbar = $('.mbar'), mbarWhy = { top: true, contact: false, foot: false };
  if (mbar && hasIO) {
    var mbarSet = function () { mbar.classList.toggle('is-away', mbarWhy.top || mbarWhy.contact || mbarWhy.foot); };
    var mbarWatch = function (node, key, test, options) {
      if (node) new IntersectionObserver(function (es) { mbarWhy[key] = test(es[es.length - 1]); mbarSet(); }, options).observe(node);
    };
    mbarWatch($('.hero'), 'top', function (e) { return e.intersectionRatio > .4; }, { threshold: [0, .4, 1] });
    mbarWatch($('#contact'), 'contact', function (e) { return e.isIntersecting; }, { rootMargin: '0px 0px -30% 0px' });
    mbarWatch($('.footer__top'), 'foot', function (e) { return e.isIntersecting; }, { rootMargin: '0px 0px -80px 0px' });
  }
  // the floating button steps aside where the footer shows its own WhatsApp link
  var waFloat = $('.wa'), footTop = $('.footer__top');
  if (waFloat && footTop && hasIO) {
    new IntersectionObserver(function (es) { waFloat.classList.toggle('is-away', es[0].isIntersecting); }, { rootMargin: '0px 0px -80px 0px' }).observe(footTop);
  }
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Language ---------- */
  // The English words are those of index.html. The French page (fr.html, written by tools/site/build.mjs)
  // is the same page already in French: it brings the English words along, in window.BEN_EN.
  var EN = window.BEN_EN || {};
  var en = EN.text || {}, enPh = EN.ph || {}, enAlt = EN.alt || {}, enAria = EN.aria || {};
  // what is not handed over is read from the page: all of it on index.html, and everywhere the parts
  // this script has just built (the project cards), which are in English at this point
  $$('[data-i18n]').forEach(function (n) { var k = n.getAttribute('data-i18n'); if (!(k in en)) en[k] = n.textContent; });
  $$('[data-i18n-ph]').forEach(function (n) { var k = n.getAttribute('data-i18n-ph'); if (!(k in enPh)) enPh[k] = n.getAttribute('placeholder'); });
  $$('[data-i18n-alt]').forEach(function (n) { var k = n.getAttribute('data-i18n-alt'); if (!(k in enAlt)) enAlt[k] = n.getAttribute('alt'); });
  $$('[data-i18n-aria]').forEach(function (n) { var k = n.getAttribute('data-i18n-aria'); if (!(k in enAria)) enAria[k] = n.getAttribute('aria-label'); });

  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', words.join(' '));
    el.textContent = '';
    words.forEach(function (w, i) {
      var sp = doc.createElement('span');
      sp.className = 'w'; sp.setAttribute('aria-hidden', 'true'); sp.style.setProperty('--i', i); sp.textContent = w;
      el.appendChild(sp); el.appendChild(doc.createTextNode(' '));
    });
  }

  // the words around the round button are spaced to close the circle exactly, whatever the language
  function fitSeal() {
    $$('.seal textPath').forEach(function (tp) {
      var text = tp.parentNode, path = doc.getElementById((tp.getAttribute('href') || '').slice(1));
      if (!path || !tp.getComputedTextLength) return;
      text.style.letterSpacing = '0px';
      var n = tp.textContent.length, len = tp.getComputedTextLength();
      if (len > 0 && n) text.style.letterSpacing = ((path.getTotalLength() - .6 - len) / n).toFixed(3) + 'px';
    });
  }

  function setLang(next, save) {
    lang = next === 'fr' ? 'fr' : 'en';
    var dict = lang === 'fr' ? I18N.fr : en;
    $$('[data-i18n]').forEach(function (n) {
      var k = n.getAttribute('data-i18n');
      n.textContent = dict[k] != null ? dict[k] : en[k];
      if (n.hasAttribute('data-words')) splitWords(n);
    });
    $$('[data-i18n-ph]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-ph');
      n.setAttribute('placeholder', dict[k] != null ? dict[k] : enPh[k]);
    });
    $$('[data-i18n-alt]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-alt');
      n.setAttribute('alt', dict[k] != null ? dict[k] : enAlt[k]);
    });
    $$('[data-i18n-aria]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-aria');
      n.setAttribute('aria-label', dict[k] != null ? dict[k] : enAria[k]);
    });
    fitSeal();
    pjText();
    refText();
    waLinks();
    voicesText();
    svText();
    $$('[data-legal]').forEach(function (a) { a.href = a.getAttribute('data-legal') + '?lang=' + lang; });   // the legal pages and the presentation open in the same language
    // the pages of the services and projects, in the language on screen (a plain press still opens them over the site)
    $$('[data-page]').forEach(function (a) { var v = a.getAttribute('data-page').split(':'); a.href = pageUrl(v[0], v[1]); });
    $$('a[data-project]').forEach(function (a) { a.href = pageUrl('project', a.getAttribute('data-project')); });
    labelViewer();
    root.lang = lang;
    var m = I18N.meta[lang];
    if (m) { doc.title = m.title; var d = $('meta[name="description"]'); if (d) d.content = m.desc; }
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    if (save) { try { localStorage.setItem('ben-lang', lang); } catch (e) {} }
    // each language has its address (/ in English, /fr in French): the address bar follows the language on screen
    if (CLEAN) {
      var want = lang === 'fr' ? '/fr' : '/';
      if (location.pathname !== want || /[?&]lang=/.test(location.search)) { try { history.replaceState(history.state, '', want + location.hash); } catch (e) {} }
    }
    measure();
  }
  // the address of the page of a service, of a project, or of the list of projects
  function pageUrl(kind, id) {
    var fr = lang === 'fr';
    if (kind === 'service') {
      var s = (window.BEN_SERVICES || []).filter(function (x) { return x.id === id; })[0];
      return (fr ? 'fr/services/' : 'services/') + (s && s.slug ? s.slug[lang] || s.slug.en : id);
    }
    if (kind === 'project') return (fr ? 'fr/realisations/' : 'projects/') + id;
    if (kind === 'agency') return fr ? 'fr/agence' : 'agency';
    if (kind === 'city') return (fr ? 'fr/agence-evenementielle-' : 'event-agency-') + id;
    return fr ? 'fr/realisations' : 'projects';
  }

  var stored = null;
  try { stored = localStorage.getItem('ben-lang'); } catch (e) {}
  var qs = /[?&]lang=(en|fr)\b/.exec(location.search);
  var CLEAN = /^\/(fr)?$/.test(location.pathname);                    // served at its own address (not opened as a file)
  var FRENCH = /\/fr(\.html)?$/.test(location.pathname);              // the French page
  // on the French page, French; elsewhere the language asked for, else the one chosen before, else the browser's
  // (a browser set to Moroccan Arabic gets French rather than English)
  var initial = FRENCH ? 'fr' : (qs && qs[1]) || stored || (/^(fr|ar-ma)/i.test(navigator.language || '') ? 'fr' : 'en');

  $$('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = b.getAttribute('data-lang');
      if (next === lang) return;
      if (reduced) return setLang(next, true);
      body.classList.add('is-switching');
      setTimeout(function () { setLang(next, true); body.classList.remove('is-switching'); }, 280);
    });
  });

  /* ---------- Preloader ---------- */
  var counter = $('.preloader__count'), bar = $('.preloader__bar b');
  function finishLoad() { body.classList.remove('is-loading'); body.classList.add('is-loaded'); }
  if (reduced || !counter) { finishLoad(); }
  else {
    var t0 = performance.now(), dur = 1700;
    (function tick(now) {
      var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      counter.textContent = Math.round(e * 100);
      bar.style.transform = 'scaleX(' + e + ')';
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finishLoad, 250);
    })(t0);
    setTimeout(finishLoad, 4000); // safety net if the tab was in the background
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = $$('[data-reveal], [data-words]');
  if (reduced || !hasIO) {
    revealables.forEach(function (n) { n.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in'); io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (n) {
      // stagger siblings that reveal together
      var sibs = n.parentNode ? $$(':scope > [data-reveal]', n.parentNode) : [];
      n.style.setProperty('--d', (Math.max(0, sibs.indexOf(n)) * 90) + 'ms');
      io.observe(n);
    });
  }

  /* ---------- Services: expanding cards ---------- */
  var rows = $$('.srv__row');
  function activate(row) { rows.forEach(function (r) { r.classList.toggle('is-active', r === row); }); }
  rows.forEach(function (r, i) {
    var open = false;                               // was the card already open when it was pressed?
    r.addEventListener('mouseenter', function () { if (fine) activate(r); });
    r.addEventListener('pointerdown', function () { open = r.classList.contains('is-active'); });
    r.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('.srv__more') : null;
      if (link && !plainClick(e)) return;           // let the link open in a new tab
      if (!open && !link) { open = true; return activate(r); }    // on a touch screen the first tap opens the card, the next one its page
      if (sv && SERVICES[i]) { e.preventDefault(); svGo(SERVICES[i], link || r); }
    });
    r.addEventListener('focus', function () { activate(r); });
    r.addEventListener('keydown', function (e) {
      if (e.target === r && (e.key === 'Enter' || e.key === ' ') && sv && SERVICES[i]) { e.preventDefault(); svGo(SERVICES[i], r); }
    });
  });
  if (rows[0]) activate(rows[0]);

  /* ---------- Menu ---------- */
  var burger = $('.burger'), menu = $('.menu');
  function toggleMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  }
  burger.addEventListener('click', function () { toggleMenu(!body.classList.contains('menu-open')); });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  /* ---------- Photo wall: columns of photos drifting in opposite directions ---------- */
  var wallWin = $('.wall__window'), wallGrid = $('.wall__grid');
  var tiles = wallGrid ? $$('.tile', wallGrid) : [];
  var wallCols = [], wallCount = 0, wallRange = [], wallNear = false;
  function loadWall() { wallCols.forEach(function (col) { $$('img', col).forEach(function (img) { img.loading = 'eager'; }); }); }

  function layoutWall() {
    if (!wallGrid || !tiles.length) return;
    var w = window.innerWidth;
    var n = w > 1100 ? 4 : w > 640 ? 3 : 2;       // same breakpoints as the CSS grid
    var per = n === 4 ? 5 : n === 3 ? 6 : 7;      // photos per column
    if (n !== wallCount) {
      wallCount = n;
      var frag = doc.createDocumentFragment(), rest = doc.createElement('div');
      wallCols = [];
      for (var c = 0; c < n; c++) {
        var col = doc.createElement('div');
        col.className = 'wall__col';
        wallCols.push(col); frag.appendChild(col);
      }
      rest.hidden = true;                          // extra photos stay reachable in the viewer
      frag.appendChild(rest);
      tiles.forEach(function (t, i) { (i < n * per ? wallCols[i % n] : rest).appendChild(t); });
      wallGrid.textContent = '';
      wallGrid.appendChild(frag);
      if (wallNear) loadWall();
    }
    var h = wallWin.clientHeight;
    wallRange = wallCols.map(function (col) { return Math.max(0, col.offsetHeight - h); });
  }
  // the window clips its columns, so the browser's own lazy loading would start too late
  if (wallWin && hasIO) {
    var wallIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      wallIO.disconnect();
      wallNear = true;
      loadWall();
    }, { rootMargin: '900px 0px' });
    wallIO.observe(wallWin);
  }
  tiles.forEach(function (t) {
    var img = $('img', t);
    img.addEventListener('error', function swap() {   // browser without WebP: use the full photo
      img.removeEventListener('error', swap);
      img.src = t.getAttribute('data-full');
    });
  });

  /* ---------- Scroll-driven: nav, progress, parallax, gallery, wall ---------- */
  var nav = $('.nav'), prog = $('.progress b');
  var gallery = galleryEl, gbar = $('.gallery__bar b');
  var parallax = $$('[data-parallax]');
  var lastY = 0, vh = window.innerHeight, maxX = 0, desktop = false, ticking = false;
  var GALLERY_PACE = 0.62;   // page scroll needed for each pixel the portfolio slides sideways
  function galleryBar(p) { if (gbar) gbar.style.transform = 'scaleX(' + clamp(p, .05, 1).toFixed(4) + ')'; }

  function measure() {
    vh = window.innerHeight;
    desktop = window.innerWidth > 900 && !reduced;
    layoutWall();
    if (gallery && track) {
      if (desktop) {
        maxX = Math.max(0, track.scrollWidth - window.innerWidth);
        gallery.style.height = Math.round(vh + maxX * GALLERY_PACE) + 'px';
        gallery.classList.add('is-pinned');
      } else {
        gallery.style.height = ''; track.style.transform = '';
        gallery.classList.remove('is-pinned');
        galleryBar(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth));
      }
    }
    if (pjCur && pjModeNow() !== pjMode) pjPhotos();
    update();
  }

  function update() {
    ticking = false;
    var y = window.pageYOffset;
    var max = root.scrollHeight - vh;
    if (prog && !pjCur) prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

    nav.classList.toggle('is-scrolled', y > 40);
    if (!body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;

    if (!reduced) {
      parallax.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-parallax'));
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0) scale(1.15)';
      });
    }

    if (desktop && gallery && track) {
      var gr = gallery.getBoundingClientRect();
      var p = clamp(-gr.top / (gr.height - vh || 1), 0, 1);
      track.style.transform = 'translate3d(' + (-p * maxX).toFixed(1) + 'px,0,0)';
      galleryBar(p);
      if (galleryLater.length && gr.top < vh * 0.6) paintGalleryRest();
    }

    if (!reduced && wallCols.length) {
      var wr = wallWin.getBoundingClientRect();
      if (wr.bottom > -100 && wr.top < vh + 100) {
        // 0 when the window enters at the bottom of the screen, 1 when it leaves at the top
        var wp = clamp((vh - wr.top) / (vh + wr.height), 0, 1);
        for (var c = 0; c < wallCols.length; c++) {
          var shift = (c % 2 ? 1 - wp : wp) * wallRange[c];
          wallCols[c].style.transform = 'translate3d(0,' + (-shift).toFixed(1) + 'px,0)';
        }
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  var swiped = false;
  if (track) {
    ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(function (type) {
      track.addEventListener(type, function () { swiped = true; }, { passive: true });
    });
    window.addEventListener('load', function () { if (!swiped) track.scrollLeft = 0; });
  }
  if (track) track.addEventListener('scroll', function () {   // phones: the strip is swiped
    paintGalleryRest();
    if (!desktop) galleryBar(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth));
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitSeal(); measure(); });

  /* ---------- Magnetic buttons, tilt (mouse only) ---------- */
  if (fine && !reduced) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    $$('[data-tilt]').forEach(function (el) {
      var inner = $('.card__media', el);
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = 'perspective(900px) rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { inner.style.transform = ''; });
    });
  }

  /* ---------- Hero canvas: drifting brand-coloured light ---------- */
  var canvas = $('.hero__canvas');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d'), W, H, dpr, motes = [], running = true, hero = $('.hero');
    var px = 0.5, py = 0.5;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(clamp(W * H / 16000, 30, 90));
      motes = [];
      for (var i = 0; i < n; i++) motes.push(mote(true));
    }
    function mote(anywhere) {
      var z = Math.random();
      return {
        x: Math.random() * W, y: anywhere ? Math.random() * H : H + 20,
        r: 0.6 + z * z * 3.2, z: z,
        vy: -(0.08 + z * 0.35), vx: (Math.random() - 0.5) * 0.15,
        c: ['249,178,78', '233,75,91', '0,173,176', '93,190,163'][Math.floor(Math.random() * 4)],
        a: 0.15 + Math.random() * 0.55, tw: Math.random() * Math.PI * 2, ts: 0.006 + Math.random() * 0.02
      };
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.x += m.vx + (px - 0.5) * m.z * 0.6; m.y += m.vy; m.tw += m.ts;
        if (m.y < -20 || m.x < -20 || m.x > W + 20) { motes[i] = mote(false); continue; }
        var a = m.a * (0.55 + 0.45 * Math.sin(m.tw));
        var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
        g.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')');
        g.addColorStop(0.25, 'rgba(' + m.c + ',' + (a * 0.5).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + m.c + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 5, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    hero.addEventListener('mousemove', function (e) { px = e.clientX / W; py = e.clientY / H; }, { passive: true });
    window.addEventListener('resize', size);
    if (hasIO) {
      new IntersectionObserver(function (es) {
        var was = running; running = es[0].isIntersecting;
        if (running && !was) requestAnimationFrame(draw);
      }).observe(hero);
    }
    size(); requestAnimationFrame(draw);
  }

  /* ---------- Footer: a light follows the pointer across the big wordmark ---------- */
  var fpanel = $('.footer__panel'), fbig = $('.footer__big');
  if (fpanel && fbig && !reduced) {
    var fx = .5, fy = .55, ftx = .5, fty = .55, fLive = false, fHover = false;
    var fTick = function (now) {
      if (!fLive) return;
      if (!fHover) {                               // nobody pointing: the light wanders on its own
        var t = now / 1000;
        ftx = .5 + .44 * Math.sin(t * .5); fty = .55 + .2 * Math.cos(t * .8);
      }
      fx += (ftx - fx) * .08; fy += (fty - fy) * .08;
      fbig.style.setProperty('--mx', (fx * 100).toFixed(2) + '%');
      fbig.style.setProperty('--my', (fy * 100).toFixed(2) + '%');
      requestAnimationFrame(fTick);
    };
    fpanel.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = fbig.getBoundingClientRect();
      ftx = (e.clientX - r.left) / r.width; fty = (e.clientY - r.top) / r.height;
      fHover = true;
    }, { passive: true });
    fpanel.addEventListener('pointerleave', function () { fHover = false; });
    fbig.classList.add('is-live');
    if (hasIO) {
      new IntersectionObserver(function (es) {
        var was = fLive; fLive = es[0].isIntersecting;
        if (fLive && !was) requestAnimationFrame(fTick);
      }).observe(fpanel);
    } else { fLive = true; requestAnimationFrame(fTick); }
  }

  /* ---------- Photo viewer: wall photos and project photos open full size ---------- */
  var lb = null, lbImg, lbCap, lbCount, lbBtns = [], lbIndex = -1, lbReturn = null, lbSource = null, lbSet = [];

  function labelViewer() {
    if (!lb) return;
    var s = ui().viewer || {};
    lb.setAttribute('aria-label', s.label);
    lbBtns[0].setAttribute('aria-label', s.close);
    lbBtns[1].setAttribute('aria-label', s.prev);
    lbBtns[2].setAttribute('aria-label', s.next);
    if (lbIndex > -1) { lbSet = lbSource(); lbShow(lbIndex); }   // captions follow the language
  }

  function lbBuild() {
    var icon = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    lb = doc.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<button class="lightbox__btn lightbox__close" type="button">' + icon('M6 6l12 12M18 6L6 18') + '</button>' +
      '<button class="lightbox__btn lightbox__prev" type="button">' + icon('M14.5 5.5L8 12l6.5 6.5') + '</button>' +
      '<figure class="lightbox__fig"><img class="lightbox__img" alt="">' +
      '<figcaption class="lightbox__bar"><span class="lightbox__cap"></span><span class="lightbox__count"></span></figcaption></figure>' +
      '<button class="lightbox__btn lightbox__next" type="button">' + icon('M9.5 5.5L16 12l-6.5 6.5') + '</button>';
    body.appendChild(lb);
    lbImg = $('.lightbox__img', lb); lbCap = $('.lightbox__cap', lb); lbCount = $('.lightbox__count', lb);
    lbBtns = [$('.lightbox__close', lb), $('.lightbox__prev', lb), $('.lightbox__next', lb)];
    var settle = function () { lb.classList.remove('is-loading'); };
    lbImg.addEventListener('load', settle);
    lbImg.addEventListener('error', settle);

    lbBtns[0].addEventListener('click', lbClose);
    lbBtns[1].addEventListener('click', function () { lbShow(lbIndex - 1); });
    lbBtns[2].addEventListener('click', function () { lbShow(lbIndex + 1); });
    lbImg.addEventListener('click', function () { lbShow(lbIndex + 1); });
    lb.addEventListener('click', function (e) {    // a click on the dark surround closes
      if (e.target === lb || e.target.classList.contains('lightbox__fig')) lbClose();
    });
    var startX = null;
    lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
    labelViewer();
  }

  function lbShow(i) {
    var n = lbSet.length, it;
    if (!n) return;
    lbIndex = ((i % n) + n) % n;
    it = lbSet[lbIndex];
    if (lbImg.getAttribute('src') !== it.src) { lb.classList.add('is-loading'); lbImg.src = it.src; }
    lbImg.alt = it.caption;
    lbCap.textContent = it.caption;
    lbCount.textContent = (lbIndex + 1) + ' / ' + n;
    lb.classList.toggle('is-single', n < 2);
    if (n > 1) [lbIndex + 1, lbIndex - 1].forEach(function (j) {   // warm up the neighbours
      var next = lbSet[((j % n) + n) % n];
      if (next.src) { new Image().src = next.src; }
    });
  }

  // source: a function returning the photos as [{ src, caption }, …]
  function lbOpen(source, i, opener) {
    var set = source();
    if (!set.length) return;
    if (!lb) lbBuild();
    lbSource = source; lbSet = set;
    lbReturn = opener || doc.activeElement;
    lbShow(i);
    lb.classList.add('is-open');
    body.classList.add('lb-open');
    lbBtns[0].focus();
  }

  function lbClose() {
    if (!lb || lbIndex < 0) return;
    lbIndex = -1;
    lb.classList.remove('is-open');
    body.classList.remove('lb-open');
    if (lbReturn && lbReturn.focus) lbReturn.focus({ preventScroll: true });
  }

  function wallPhotos() {
    return tiles.map(function (t) { return { src: t.getAttribute('data-full'), caption: $('img', t).getAttribute('alt') }; });
  }
  tiles.forEach(function (t, i) { t.addEventListener('click', function () { lbOpen(wallPhotos, i, t); }); });
  $$('[data-zoom-all]').forEach(function (b) { b.addEventListener('click', function () { lbOpen(wallPhotos, 0, b); }); });

  /* ---------- Project pages: a portfolio card opens its project over the site ---------- */
  var pj = $('.pj'), pjScroll = $('.pj__scroll');
  var pjCur = null, pjReturn = null, pjMode = '', pjTimer = 0, pjTurn = 0;
  var pjE = pj ? {
    back: $('.pj__back', pj), pos: $('.pj__pos', pj), page: $('.pj__page', pj), top: $('.pj__top', pj),
    kind: $('.pj__kind', pj), title: $('.pj__title', pj), intro: $('.pj__intro', pj), count: $('.pj__count', pj),
    facts: $('.pj__facts', pj), did: $('.pj__did', pj),
    cover: $('.pj__cover', pj), rows: $('.pj__rows', pj), mail: $('.pj__mail', pj),
    next: $('.pj__next', pj), nextTitle: $('.pj__next-title', pj), nextMedia: $('.pj__next-media', pj)
  } : null;
  var behind = $$('.skip, .nav, .menu, main, .footer');   // everything a project page covers
  var PJ_HASH = /^#project\/([\w-]+)$/;

  function pjRatio(ph) { return ph[1] / ph[2]; }
  function pjModeNow() { var w = window.innerWidth; return w <= 700 ? 's' : w <= 1100 ? 'm' : 'l'; }
  function pjPhotosOf(p) {
    return p.photos.map(function (ph) { return { src: ph[0], caption: tr(p.title) + ' — ' + tr(p.kind) }; });
  }

  // which photos share a row: every row then fills the width at one height
  function pjRows(ratios, mode) {
    var out = [], i;
    if (mode === 's') {                            // phones: wide photos alone, upright ones in pairs
      for (i = 0; i < ratios.length; i++) {
        if (ratios[i] < 1.1 && i + 1 < ratios.length && ratios[i + 1] < 1.1) { out.push([i, i + 1]); i++; }
        else out.push([i]);
      }
      return out;
    }
    var total = ratios.reduce(function (s, r) { return s + r; }, 0);
    var n = Math.max(1, Math.round(total / (mode === 'm' ? 2 : 2.6))), per = total / n, acc = 0, cur = [];
    for (i = 0; i < ratios.length; i++) {
      cur.push(i); acc += ratios[i];
      var left = ratios.length - 1 - i, need = n - 1 - out.length;   // photos left, rows still to fill
      if (need > 0 && left >= need && (left === need || acc >= per * (out.length + 1) - ratios[i] / 2)) { out.push(cur); cur = []; }
    }
    if (cur.length) out.push(cur);
    return out;
  }

  // "Name · Client" is set on two lines, the second one in the accent face
  function pjHeading(node, text) {
    var parts = text.split(' · ');
    node.textContent = '';
    node.appendChild(el('span', '', parts[0]));
    if (parts.length > 1) {
      node.appendChild(doc.createTextNode(' '));
      node.appendChild(el('em', '', parts.slice(1).join(' · ')));
    }
  }

  function pjLoad(img, src) {
    img.classList.remove('is-in');
    img.onload = img.onerror = function () { img.classList.add('is-in'); };
    img.src = src;
  }

  function pjLabels() {
    if (!pjCur) return;
    var s = ui().viewer || {}, n = pjCur.photos.length, name = tr(pjCur.title);
    $$('[data-pj-photo]', pj).forEach(function (b) {
      b.setAttribute('aria-label', s.open + (lang === 'fr' ? ' : ' : ': ') + name + ' (' + (+b.getAttribute('data-pj-photo') + 1) + '/' + n + ')');
    });
  }

  function pjText() {
    var p = pjCur;
    if (!p) return;
    var n = p.photos.length, next = PROJECTS[(p.index + 1) % PROJECTS.length];
    pjE.kind.textContent = tr(p.kind);
    pjHeading(pjE.title, tr(p.title));
    pjE.intro.textContent = tr(p.intro);
    // the facts of the case: who for, where, when, how many guests, each shown only when projects.js gives it
    var L = ui().project || {}, place = p.city ? PLACES[p.city] : null;
    pjE.facts.textContent = '';
    var fact = function (label, value) {
      var row = el('div'), dd = el('dd');
      row.appendChild(el('dt', '', label));
      (Array.isArray(value) ? value : [value]).forEach(function (v) { dd.appendChild(typeof v === 'string' ? doc.createTextNode(v) : v); });
      row.appendChild(dd);
      pjE.facts.appendChild(row);
    };
    if (p.client) fact(L.client, tr(p.client));
    if (place || p.venue) {
      var spot = [];
      if (p.venue) spot.push(p.venue + (place ? ', ' : ''));
      if (place && place.page) { var a = el('a', '', tr(place)); a.href = pageUrl('city', p.city); spot.push(a); }
      else if (place) spot.push(tr(place));
      fact(L.where, spot);
    }
    if (p.date) fact(L.when, tr(p.date));
    if (p.guests) fact(L.guests, String(p.guests));
    pjE.facts.hidden = !pjE.facts.firstChild;
    var did = p.did && (p.did[lang] || p.did.en), list = $('ul', pjE.did);
    list.textContent = '';
    (did || []).forEach(function (line) { list.appendChild(el('li', '', line)); });
    pjE.did.hidden = !did || !did.length;
    pjE.count.textContent = n > 1 ? n + ' ' + (ui().project || {}).photos : '';
    pjE.pos.textContent = two(p.index + 1) + ' / ' + two(PROJECTS.length);
    pjE.mail.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent((ui().subject || '') + ' — ' + tr(p.title));
    pjE.next.hidden = next === p;
    pjE.next.href = '#project/' + next.id;
    pjHeading(pjE.nextTitle, tr(next.title));
    pjE.nextMedia.style.backgroundImage = 'url("' + next.photos[0][0] + '")';
    pjE.nextMedia.style.backgroundPosition = next.cover || '';
    pjE.nextMedia.classList.add('has-img');
    pjLabels();
  }

  function pjPhotos() {
    var p = pjCur;
    if (!p) return;
    var first = p.photos[0], rest = p.photos.slice(1), ratios = rest.map(pjRatio), cover = $('img', pjE.cover);
    pjMode = pjModeNow();
    pjE.top.classList.toggle('is-solo', !rest.length);
    pjE.cover.style.setProperty('--ratio', clamp(pjRatio(first), .78, 1.6).toFixed(4));
    cover.width = first[1]; cover.height = first[2];
    cover.style.objectPosition = p.cover || '';
    if (cover.getAttribute('src') !== first[0]) pjLoad(cover, first[0]);
    pjE.rows.textContent = '';
    pjRows(ratios, pjMode).forEach(function (row) {
      var line = el('div', 'pj__row'), sum = 0;
      row.forEach(function (k) {
        var ph = rest[k], b = el('button', 'pj__ph'), img = doc.createElement('img');
        sum += ratios[k];
        b.type = 'button';
        b.setAttribute('data-pj-photo', k + 1);
        b.style.setProperty('--ratio', ratios[k].toFixed(4));
        img.alt = ''; img.decoding = 'async'; img.width = ph[1]; img.height = ph[2];
        if (k > 2) img.loading = 'lazy';
        b.appendChild(img);
        pjLoad(img, ph[0]);
        line.appendChild(b);
      });
      line.style.setProperty('--sum', sum.toFixed(4));
      pjE.rows.appendChild(line);
    });
    pjLabels();
  }

  function pjProgress() {
    if (!prog || !pjCur) return;
    var max = pjScroll.scrollHeight - pjScroll.clientHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? pjScroll.scrollTop / max : 0) + ')';
  }

  function pjFill(p) {
    var held = pj.contains(doc.activeElement);
    pjCur = p; pjText(); pjPhotos(); pjScroll.scrollTop = 0; pjProgress();
    if (held && !pj.contains(doc.activeElement)) pjE.title.focus({ preventScroll: true });   // the focused photo is gone
  }

  function pjShow(p, opener) {
    if (!pj || !p || p === pjCur) return;
    pjTurn++;
    count('project_open', { project: p.id });
    if (pjCur) {                                   // already open: change project
      if (reduced) return pjFill(p);
      pjCur = p;
      pjE.page.classList.add('is-out');
      clearTimeout(pjTimer);
      pjTimer = setTimeout(function () { pjFill(pjCur); pjE.page.classList.remove('is-out'); }, 240);
      return;
    }
    pjReturn = opener || doc.activeElement;
    toggleMenu(false);
    pjFill(p);
    pj.classList.add('is-open');
    body.classList.add('pj-open');
    behind.forEach(function (n) { n.setAttribute('inert', ''); });
    pjE.back.focus({ preventScroll: true });
  }

  function pjHide() {
    if (!pjCur) return;
    pjTurn++;
    clearTimeout(pjTimer);
    pjE.page.classList.remove('is-out');
    pjCur = null;
    pj.classList.remove('is-open');
    body.classList.remove('pj-open');
    if (!svCur) behind.forEach(function (n) { n.removeAttribute('inert'); });
    if (pjReturn && pjReturn.focus && doc.contains(pjReturn)) pjReturn.focus({ preventScroll: true });
    pjReturn = null;
    update();
  }

  // the address decides what is shown, so the browser's back button closes a project
  function pjSync() {
    var m = PJ_HASH.exec(location.hash), p = m ? byId[m[1]] : null;
    if (lbIndex > -1) lbClose();
    if (p) pjShow(p); else pjHide();
  }
  function pjGo(p, opener, replace) {
    if (replace) history.replaceState(history.state, '', '#project/' + p.id);
    else history.pushState({ pj: true }, '', '#project/' + p.id);
    pjShow(p, opener);
  }
  function pjClose() {
    if (!pjCur) return;
    var turn = pjTurn, drop = function () { history.replaceState(null, '', location.pathname + location.search); pjHide(); };
    if (!(history.state && history.state.pj)) return drop();
    history.back();                                // step back over the entry this page added
    setTimeout(function () { if (pjCur && turn === pjTurn) drop(); }, 700);   // nothing to go back to: close anyway
  }
  function pjStep(d, from) {
    if (!pjCur) return;
    var n = PROJECTS.length;
    pjGo(PROJECTS[(pjCur.index + d + n) % n], null, true);
    if (from === pjE.next) pjE.title.focus({ preventScroll: true });
  }
  function pjContact() {                            // "contact us about this project"
    var p = pjCur, target = $('#contact');
    if (!p) return;
    setRef(p);
    history.replaceState(null, '', '#contact');
    pjReturn = null;
    pjHide();
    if (target) {
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, Math.round(target.getBoundingClientRect().top + window.pageYOffset));
      root.style.scrollBehavior = '';
    }
    if (refBox) refBox.focus({ preventScroll: true });
  }

  if (pj) {
    if (track) {
      track.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[data-project]') : null, p = a && byId[a.getAttribute('data-project')];
        if (!p || !plainClick(e)) return;
        e.preventDefault();
        pjGo(p, a);
      });
      // have the next photos ready by the time a card is opened
      var warm = function (e) {
        var a = e.target.closest ? e.target.closest('a[data-project]') : null, p = a && byId[a.getAttribute('data-project')];
        if (!p || p.warm) return;
        p.warm = true;
        p.photos.slice(1, 3).forEach(function (ph) { new Image().src = ph[0]; });
      };
      track.addEventListener('pointerenter', warm, true);
      track.addEventListener('focusin', warm);
    }
    pj.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-pj-close], [data-pj-step], [data-pj-photo], [data-pj-contact]') : null;
      if (!t || !pjCur) return;
      if (t.hasAttribute('data-pj-close')) pjClose();
      else if (t.hasAttribute('data-pj-photo')) { var cur = pjCur; lbOpen(function () { return pjPhotosOf(cur); }, +t.getAttribute('data-pj-photo'), t); }
      else if (!plainClick(e)) return;             // let a link open in a new tab
      else if (t.hasAttribute('data-pj-step')) { e.preventDefault(); pjStep(+t.getAttribute('data-pj-step'), t); }
      else { e.preventDefault(); pjContact(); }
    });
    pjScroll.addEventListener('scroll', pjProgress, { passive: true });
    window.addEventListener('popstate', pjSync);
    window.addEventListener('hashchange', pjSync);
  }

  /* ---------- Service pages: a card of "What we create" opens its page over the site ---------- */
  var sv = $('.sv'), SERVICES = window.BEN_SERVICES || [], SV_HASH = /^#service\/([\w-]+)$/;
  var svCur = null, svReturn = null, svTurn = 0;
  var svE = sv ? {
    back: $('.pj__back', sv), pos: $('.pj__pos', sv), scroll: $('.pj__scroll', sv), media: $('.sv__media', sv),
    title: $('.sv__title', sv), intro: $('.sv__intro', sv), does: $('.sv__does ul', sv), cards: $('.sv__cards', sv)
  } : null;
  SERVICES.forEach(function (s, i) { s.index = i; s.row = rows[i] || null; });
  function svOf(id) { return SERVICES.filter(function (s) { return s.id === id && s.row; })[0] || null; }

  function svText() {                               // everything the page says, in the language of the site
    if (!svCur) return;
    var s = svCur, parts = $('h3', s.row).textContent.split(' & ');
    svE.pos.textContent = two(s.index + 1) + ' / ' + two(SERVICES.length);
    svE.title.textContent = '';
    svE.title.appendChild(el('span', '', parts[0]));
    if (parts.length > 1) {
      svE.title.appendChild(doc.createTextNode(' '));
      svE.title.appendChild(el('em', '', '& ' + parts.slice(1).join(' & ')));
    }
    svE.intro.textContent = $('.srv__body p', s.row).textContent;
    svE.does.textContent = '';
    (s.does[lang] || s.does.en).forEach(function (line) { svE.does.appendChild(el('li', '', line)); });
    svE.cards.textContent = '';
    s.ideas.forEach(function (idea) {
      var p = byId[idea.project], card = el(p ? 'a' : 'div', 'sv__idea'), text = el('span', 'sv__idea-in');
      if (p) {
        card.href = '#project/' + p.id;
        card.setAttribute('data-sv-project', p.id);
        var ph = el('span', 'sv__idea-ph'), img = doc.createElement('img');
        img.alt = ''; img.loading = 'lazy'; img.src = p.photos[0][0];
        ph.appendChild(img);
        card.appendChild(ph);
      }
      text.appendChild(el('b', '', tr(idea.title)));
      text.appendChild(el('span', '', tr(idea.text)));
      if (p) text.appendChild(el('small', '', ui().seen + ' ' + tr(p.title).split(' · ')[0]));
      card.appendChild(text);
      svE.cards.appendChild(card);
    });
  }

  function svShow(s, opener) {
    if (!sv || !s) return;
    var was = svCur, m = mediaOf('service' + (s.index + 1));
    svTurn++;
    if (s !== was) count('service_open', { service: s.id });
    svCur = s;
    svText();
    svE.media.style.backgroundImage = m ? 'url("' + m.src + '")' : '';
    svE.scroll.scrollTop = 0;
    if (was) return;                                // already open: another service takes its place
    svReturn = opener || doc.activeElement;
    toggleMenu(false);
    sv.classList.add('is-open');
    body.classList.add('sv-open');
    behind.forEach(function (n) { n.setAttribute('inert', ''); });
    svE.back.focus({ preventScroll: true });
  }
  function svHide() {
    if (!svCur) return;
    svTurn++;
    svCur = null;
    sv.classList.remove('is-open');
    body.classList.remove('sv-open');
    if (!pjCur) behind.forEach(function (n) { n.removeAttribute('inert'); });
    if (svReturn && svReturn.focus && doc.contains(svReturn)) svReturn.focus({ preventScroll: true });
    svReturn = null;
    update();
  }
  // the address decides what is shown, so the browser's back button closes a service page
  function svSync() {
    var m = SV_HASH.exec(location.hash), s = m ? svOf(m[1]) : null;
    if (s) svShow(s); else svHide();
  }
  function svGo(s, opener, replace) {
    if (replace) history.replaceState(history.state, '', '#service/' + s.id);
    else history.pushState({ sv: true }, '', '#service/' + s.id);
    svShow(s, opener);
  }
  function svClose() {
    if (!svCur) return;
    var turn = svTurn, drop = function () { history.replaceState(null, '', location.pathname + location.search); svHide(); };
    if (!(history.state && history.state.sv)) return drop();
    history.back();                                // step back over the entry this page added
    setTimeout(function () { if (svCur && turn === svTurn) drop(); }, 700);
  }
  function svStep(d) {
    if (!svCur) return;
    var n = SERVICES.length;
    svGo(SERVICES[(svCur.index + d + n) % n], null, true);
  }
  function svContact() {                            // "talk to us about your event": the form, with this kind of event chosen
    var s = svCur, target = $('#contact'), type = form && form.elements.type;
    if (!s) return;
    if (type && type.options[s.index]) { type.selectedIndex = s.index; type.dispatchEvent(new Event('change')); }
    history.replaceState(null, '', '#contact');
    svReturn = null;
    svHide();
    if (target) {
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, Math.round(target.getBoundingClientRect().top + window.pageYOffset));
      root.style.scrollBehavior = '';
    }
    if (form) form.elements.name.focus({ preventScroll: true });
  }
  if (sv) {
    sv.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-sv-close], [data-sv-step], [data-sv-contact], [data-sv-project]') : null;
      if (!t || !svCur) return;
      if (t.hasAttribute('data-sv-close')) return svClose();
      if (t.hasAttribute('data-sv-step')) return svStep(+t.getAttribute('data-sv-step'));
      if (!plainClick(e)) return;                   // let a link open in a new tab
      e.preventDefault();
      if (t.hasAttribute('data-sv-contact')) return svContact();
      var p = byId[t.getAttribute('data-sv-project')];   // an idea opens the project it was seen in; "back" returns here
      if (!p) return;
      history.pushState({ pj: true }, '', '#project/' + p.id);
      svHide();
      pjShow(p);
    });
    window.addEventListener('popstate', svSync);
    window.addEventListener('hashchange', svSync);
  }

  /* ---------- Keyboard: the topmost layer answers ---------- */
  doc.addEventListener('keydown', function (e) {
    if (lbIndex > -1) {
      if (e.key === 'Escape') lbClose();
      else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
      else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      else if (e.key === 'Tab') {                  // keep the keyboard inside the viewer
        var at = lbBtns.indexOf(doc.activeElement), to = at + (e.shiftKey ? -1 : 1);
        e.preventDefault();
        lbBtns[(to + lbBtns.length) % lbBtns.length].focus();
      }
      return;
    }
    if (pjCur) {
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === 'Escape') pjClose();
      else if (e.key === 'ArrowRight') pjStep(1);
      else if (e.key === 'ArrowLeft') pjStep(-1);
      return;
    }
    if (svCur) {
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      var typing = /^(input|textarea|select)$/i.test(e.target.tagName || '');
      if (e.key === 'Escape') svClose();
      else if (e.key === 'ArrowRight' && !typing) svStep(1);
      else if (e.key === 'ArrowLeft' && !typing) svStep(-1);
      return;
    }
    if (e.key === 'Escape') toggleMenu(false);
  });

  /* ---------- Contact form ----------
     The enquiry goes to the site's own /api/contact, which passes it on to the webhook chosen
     for the site (see api/contact.js). Where that is not set up, or cannot be reached, the
     visitor's mail app opens with the enquiry instead, so that it is never lost. */
  var form = $('.form'), note = $('.form__note');
  var refBox = $('.form__ref'), refName = $('.form__ref-name'), refProject = null;
  function refText() { if (refName && refProject) refName.textContent = tr(refProject.title); }
  function setRef(p) {                              // the project an enquiry refers to, if any
    refProject = p || null;
    if (!refBox) return;
    refBox.hidden = !refProject;
    refText();
  }
  if (form) {
    var fields = $$('input, textarea, select', form), sending = false, started = false;
    var filled = function () { fields.forEach(function (f) { f.parentNode.classList.toggle('is-filled', !!f.value); }); };
    fields.forEach(function (f) { f.addEventListener('input', filled); f.addEventListener('change', filled); });
    form.addEventListener('input', function (e) {                     // counted once: someone began to write
      if (started || !e.target || e.target.name === 'hp') return;
      started = true;
      count('enquiry_started');
    });
    // the same words whatever the language on screen: the place of the choice in its list
    var KINDS = ['conference', 'ceremony', 'brand event', 'audiovisual', 'other'], BUDGETS = ['', 'under 100k', '100k to 300k', '300k to 1M', 'over 1M'];
    var about = function () {
      return { kind: KINDS[form.elements.type.selectedIndex], budget: BUDGETS[form.elements.budget.selectedIndex], city: (form.elements.city.value || '').trim().slice(0, 40),
        project: refProject ? refProject.id : '', language: lang };
    };
    filled();
    var refX = $('.form__ref-x', form);
    if (refX) refX.addEventListener('click', function () { setRef(null); form.elements.name.focus(); });
    // the enquiry written out as an e-mail, in the visitor's own mail app
    var byMail = function (d, s) {
      var L = s.labels, lines = [L.name + ': ' + d.name, L.email + ': ' + d.email, L.phone + ': ' + d.phone, L.type + ': ' + d.type, L.date + ': ' + d.date, L.guests + ': ' + d.guests,
        L.city + ': ' + d.city, L.budget + ': ' + d.budget];
      if (d.project) lines.push(L.project + ': ' + d.project);
      lines.push('', d.message);
      var url = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(s.subject + ' — ' + d.name + (d.project ? ' (' + d.project + ')' : '')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      // a browser may refuse to open the mail app by itself: the same e-mail is one click away
      var again = doc.createElement('a');
      again.href = url;
      again.textContent = s.again;
      note.textContent = s.opening + ' ';
      note.appendChild(again);
      location.href = url;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var s = I18N.js[lang] || I18N.js.en, v = function (n) { return (form.elements[n].value || '').trim(); };
      var ok = v('name') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) && v('message');
      note.classList.toggle('is-error', !ok);
      if (!ok) { note.textContent = s.required; return; }
      var d = { name: v('name'), email: v('email'), phone: v('phone'), type: v('type'), date: v('date'), guests: v('guests'), city: v('city'),
        budget: form.elements.budget.selectedIndex ? v('budget') : '', message: v('message'),
        project: refProject ? tr(refProject.title) : '', lang: lang, page: location.origin + location.pathname, hp: v('hp') };
      var what = about();
      sending = true;
      form.classList.add('is-sending');
      note.textContent = s.sending;
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).then(function (r) {
        return r.ok ? r.json() : Promise.reject(r.status);
      }).then(function (out) {
        if (!out || !out.ok) return Promise.reject(0);
        if (!d.hp) count('enquiry_sent', what);
        form.reset();
        setRef(null);
        filled();
        note.textContent = (I18N.js[lang] || I18N.js.en).sent;
      }).catch(function () {
        count('enquiry_by_email', what);
        byMail(d, s);                               // not set up, or out of reach
      }).then(function () {
        sending = false;
        form.classList.remove('is-sending');
      });
    });
  }

  /* ---------- Go ---------- */
  setLang(initial, false);
  measure();
  if (pj) pjSync();
  if (sv) svSync();
})();
