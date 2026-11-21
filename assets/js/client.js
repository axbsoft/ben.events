/* benevents agency — a presentation, slide by slide. Vanilla JS, no dependencies.
   Two kinds of page use this file (tools/lock-presentation.mjs prepares the files of both):

   - a client page, opened with an access code (m-automotiv.html). The slides, their thumbnails and
     the PDF are stored encrypted. The code a visitor types is turned into a key in their browser;
     a wrong code opens nothing. The code is not written anywhere in this file or in the site.
   - an open presentation, made to be shared (presentation.html): no code, plain files.
     A page is of this kind when it has no access form.

   The page says where its files are: <body data-deck="assets/<folder>/">. */
(function () {
  'use strict';

  var doc = document, root = doc.documentElement, body = doc.body;
  var DIR = body.getAttribute('data-deck') || 'assets/m-automotiv/';      // the files of the presentation and their manifest
  var CLIENT = body.getAttribute('data-client') || 'M-Automotiv';         // the brand the presentation is made for ({client} in the words below)
  var STORE = 'ben-client-' + DIR.replace(/^assets\/|\/$/g, '');           // keeps a locked page open while the browser tab lives
  var LIVE_MIN = 900;                       // px: a narrower frame shows a live slide as a tall card instead of a scaled slide
  var CHECK = 'benevents:open';

  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var subtle = window.crypto && window.crypto.subtle;

  /* ---------- Words (French first: the presentation is in French) ---------- */
  var TEXT = {
    fr: {
      'gate.eyebrow': 'Espace client · Accès réservé',
      'gate.for': 'Une proposition de benevents agency pour',
      'gate.label': 'Code d’accès',
      'gate.show': 'Afficher le code',
      'gate.hide': 'Masquer le code',
      'gate.open': 'Ouvrir la présentation',
      'gate.help': 'Pas de code ?',
      'gate.helplink': 'Écrivez-nous',
      'gate.empty': 'Saisissez votre code d’accès.',
      'gate.checking': 'Vérification…',
      'gate.wrong': 'Ce code n’est pas le bon. Vérifiez-le et réessayez.',
      'gate.ok': 'Bienvenue.',
      'gate.unsupported': 'Ce navigateur ne peut pas ouvrir la présentation protégée. Essayez avec une version récente de Chrome, Safari, Edge ou Firefox.',
      'gate.offline': 'La présentation n’a pas pu être chargée. Vérifiez votre connexion et rechargez la page.',
      'deck.label': 'Présentation',
      'deck.grid': 'Toutes les diapositives',
      'deck.full': 'Plein écran',
      'deck.exit': 'Quitter le plein écran',
      'deck.pdf': 'Télécharger le PDF',
      'deck.prev': 'Diapositive précédente',
      'deck.next': 'Diapositive suivante',
      'deck.dots': 'Diapositives',
      'deck.close': 'Fermer',
      'deck.slide': 'Diapositive {i} sur {n}',
      'deck.goto': 'Aller à la diapositive {i}',
      'deck.try': 'Essayer cette animation',
      'deck.hint': '← → pour naviguer · F plein écran · G vue d’ensemble',
      'deck.hinttouch': 'Balayez pour naviguer · tournez votre téléphone pour agrandir',
      'deck.rotate': 'Tournez votre téléphone pour agrandir',
      'deck.pdfwait': 'Préparation du PDF…',
      'deck.pdfdone': 'Le PDF est prêt.',
      'deck.error': 'Cette diapositive n’a pas pu être chargée. Vérifiez votre connexion.',
      'deck.share': 'Partager la présentation',
      'deck.copied': 'Lien copié : il ne reste qu’à le coller dans un message.',
      'deck.nocopy': 'Le lien n’a pas pu être copié : copiez l’adresse de cette page.',
      'open.cta.title': 'Un événement en préparation ?',
      'open.cta.btn': 'Parlons de votre événement',
      'book.cta': 'Réserver un appel',
      'cta.eyebrow': 'Et maintenant',
      'cta.title': 'Une question sur cette proposition ?',
      'cta.btn': 'Contacter benevents',
      'calli.title1': 'Votre prénom en',
      'calli.title2': 'calligraphie chinoise',
      'calli.title2.ko': 'hangeul',
      'calli.cap1': 'Le visiteur saisit son prénom',
      'calli.cap2': 'Il reçoit d’abord sa calligraphie par e-mail',
      'calli.cap3': 'Puis son marque-page est imprimé sur place',
      'calli.label': 'Votre prénom',
      'calli.go': 'Révéler',
      'calli.maillabel': 'Votre e-mail',
      'calli.send': 'Envoyer',
      'calli.consent': 'J’accepte d’être recontacté(e) par {client}.',
      'calli.print': 'Imprimer le marque-page',
      'calli.pdf': 'Télécharger le PDF',
      'calli.shop': 'Version imprimeur',
      'calli.side': 'Côté {client}',
      'calli.leadtitle': 'Une animation qui collecte des contacts',
      'calli.leadtext': 'Chaque participation laisse un prénom et un e-mail, recueillis avec l’accord du visiteur.',
      'calli.listtitle': 'Contacts collectés',
      'calli.none': 'Le premier contact apparaîtra ici.',
      'calli.csv': 'Exporter la liste (CSV)',
      'calli.demo': 'Démonstration : aucun e-mail n’est envoyé et rien n’est conservé.'
    },
    en: {
      'gate.eyebrow': 'Client area · Private access',
      'gate.for': 'A proposal by benevents agency for',
      'gate.label': 'Access code',
      'gate.show': 'Show the code',
      'gate.hide': 'Hide the code',
      'gate.open': 'Open the presentation',
      'gate.help': 'No code?',
      'gate.helplink': 'Get in touch',
      'gate.empty': 'Enter your access code.',
      'gate.checking': 'Checking…',
      'gate.wrong': 'That code isn’t right. Check it and try again.',
      'gate.ok': 'Welcome.',
      'gate.unsupported': 'This browser cannot open the protected presentation. Try a recent version of Chrome, Safari, Edge or Firefox.',
      'gate.offline': 'The presentation could not be loaded. Check your connection and reload the page.',
      'deck.label': 'Presentation',
      'deck.grid': 'All slides',
      'deck.full': 'Full screen',
      'deck.exit': 'Leave full screen',
      'deck.pdf': 'Download the PDF',
      'deck.prev': 'Previous slide',
      'deck.next': 'Next slide',
      'deck.dots': 'Slides',
      'deck.close': 'Close',
      'deck.slide': 'Slide {i} of {n}',
      'deck.goto': 'Go to slide {i}',
      'deck.try': 'Try this activity',
      'deck.hint': '← → to navigate · F full screen · G overview',
      'deck.hinttouch': 'Swipe to navigate · turn your phone sideways for a larger view',
      'deck.rotate': 'Turn your phone sideways for a larger view',
      'deck.pdfwait': 'Preparing the PDF…',
      'deck.pdfdone': 'The PDF is ready.',
      'deck.error': 'This slide could not be loaded. Check your connection.',
      'deck.share': 'Share the presentation',
      'deck.copied': 'Link copied: all that is left is to paste it into a message.',
      'deck.nocopy': 'The link could not be copied: copy the address of this page.',
      'open.cta.title': 'An event in the works?',
      'open.cta.btn': 'Talk to us about your event',
      'book.cta': 'Book a call',
      'cta.eyebrow': 'What next',
      'cta.title': 'A question about this proposal?',
      'cta.btn': 'Contact benevents',
      'calli.title1': 'Your first name in',
      'calli.title2': 'Chinese calligraphy',
      'calli.title2.ko': 'Hangul',
      'calli.cap1': 'The visitor types their first name',
      'calli.cap2': 'They first receive their calligraphy by email',
      'calli.cap3': 'Then their bookmark is printed on the spot',
      'calli.label': 'Your first name',
      'calli.go': 'Reveal',
      'calli.maillabel': 'Your email',
      'calli.send': 'Send',
      'calli.consent': 'I agree to be contacted by {client}.',
      'calli.print': 'Print the bookmark',
      'calli.pdf': 'Download the PDF',
      'calli.shop': 'Print-shop version',
      'calli.side': 'On {client}’s side',
      'calli.leadtitle': 'An activity that collects contacts',
      'calli.leadtext': 'Every participation leaves a first name and an email address, collected with the visitor’s consent.',
      'calli.listtitle': 'Contacts collected',
      'calli.none': 'The first contact will appear here.',
      'calli.csv': 'Export the list (CSV)',
      'calli.demo': 'Demonstration: no email is sent and nothing is kept.'
    }
  };
  var lang = 'fr';
  function t(key, vars) {
    var s = ((TEXT[lang] && TEXT[lang][key]) || TEXT.fr[key] || '').replace(/\{client\}/g, CLIENT);
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function setLang(next, save) {
    lang = next === 'en' ? 'en' : 'fr';
    $$('[data-t]').forEach(function (n) { n.textContent = t(n.getAttribute('data-t')); });
    $$('[data-t-ph]').forEach(function (n) { n.setAttribute('placeholder', t(n.getAttribute('data-t-ph'))); });
    $$('[data-t-aria]').forEach(function (n) { n.setAttribute('aria-label', t(n.getAttribute('data-t-aria'))); });
    // words of one page only, written on the page in both languages: <span data-en="…">mot</span>
    $$('[data-en]').forEach(function (n) { if (!n.hasAttribute('data-fr')) n.setAttribute('data-fr', n.textContent); n.textContent = n.getAttribute('data-' + lang); });
    root.lang = lang;
    var title = body.getAttribute('data-title-' + lang);
    if (title) doc.title = title;
    $$('[data-home]').forEach(function (a) { a.href = (lang === 'fr' ? 'fr' : './') + a.getAttribute('data-home'); });     // the site, in the same language (/ or /fr)
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    if (save) { try { localStorage.setItem('ben-lang', lang); } catch (e) {} }
    relabel();
    if (built && !deck.hidden) edition();
    doc.dispatchEvent(new CustomEvent('ben:lang', { detail: lang }));
  }
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); }); });

  /* ---------- Locked files ---------- */
  function bytesOf(b64) {
    var bin = atob(b64), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function b64Of(u) {
    var s = '';
    for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return btoa(s);
  }
  // capitals and the spaces around the code do not matter
  function plain(code) { return (code.normalize ? code.normalize('NFKC') : code).trim().toLowerCase(); }
  function keyFrom(code, kdf) {
    return subtle.importKey('raw', new TextEncoder().encode(plain(code)), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return subtle.deriveKey({ name: 'PBKDF2', salt: bytesOf(kdf.salt), iterations: kdf.iterations, hash: kdf.hash },
        base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
    });
  }
  // a locked file: 12 bytes, then the encrypted content
  function unseal(key, u) { return subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, key, u.subarray(12)); }
  function opens(key, m) {
    return unseal(key, bytesOf(m.check)).then(function (buf) { return new TextDecoder().decode(buf) === CHECK; }, function () { return false; });
  }

  var KEY = null, M = null;
  var manifest = fetch(DIR + 'manifest.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('manifest');
    return r.json();
  });
  manifest.catch(function () {});               // reported when the visitor asks to open
  function fileOf(name) {
    return fetch(DIR + name + '?v=' + M.rev).then(function (r) {
      if (!r.ok) throw new Error('file');
      return r.arrayBuffer();
    }).then(function (buf) { return unseal(KEY, new Uint8Array(buf)); });
  }
  // an open presentation: its files are read as they are
  // (a full address: the sheet of thumbnails is handed to the style sheet, which would otherwise read it from its own folder)
  function plainUrl(name) { return new URL(DIR + name + '?v=' + M.rev, doc.baseURI).href; }
  function pictureAt(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(url); };
      img.onerror = function () { reject(new Error('file')); };
      img.src = url;
    });
  }

  /* ---------- Gate (client pages only) ---------- */
  var gate = $('.gate'), form = $('.gate__form'), input = form ? form.elements.code : null, note = $('.gate__note'), eye = $('.gate__eye');
  var deck = $('.deck');

  function say(msg, bad) { note.textContent = msg; note.classList.toggle('is-error', !!bad); }
  function refuse() {
    form.classList.remove('is-wrong');
    void form.offsetWidth;                       // lets the shake play again
    form.classList.add('is-wrong');
    input.select();
  }
  function remember() {
    return subtle.exportKey('raw', KEY).then(function (raw) {
      try { sessionStorage.setItem(STORE, JSON.stringify({ rev: M.rev, k: b64Of(new Uint8Array(raw)) })); } catch (e) {}
    }, function () {});
  }
  function restore() {
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch (e) {}
    if (!saved || !saved.k || !subtle) return Promise.resolve(false);
    body.classList.add('is-restoring');
    return manifest.then(function (m) {
      if (saved.rev !== m.rev) return false;
      return subtle.importKey('raw', bytesOf(saved.k), { name: 'AES-GCM' }, true, ['decrypt']).then(function (key) {
        return opens(key, m).then(function (ok) { if (ok) { KEY = key; M = m; } return ok; });
      });
    }).then(function (ok) { return ok; }, function () { return false; });
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.classList.contains('is-busy')) return;
    var code = input.value;
    form.classList.remove('is-wrong');
    if (!plain(code)) { say(t('gate.empty'), true); input.focus(); return; }
    if (!subtle || !window.TextEncoder) { say(t('gate.unsupported'), true); return; }
    form.classList.add('is-busy');
    say(t('gate.checking'));
    manifest.then(function (m) {
      return keyFrom(code, m.kdf).then(function (key) {
        return opens(key, m).then(function (ok) {
          if (!ok) return 'wrong';
          KEY = key; M = m;
          return remember().then(function () { return 'ok'; });
        });
      });
    }).then(function (result) {
      form.classList.remove('is-busy');
      if (result === 'ok') { say(t('gate.ok')); openDeck(false); }
      else { say(t('gate.wrong'), true); refuse(); }
    }, function () {
      form.classList.remove('is-busy');
      say(t('gate.offline'), true);
    });
  });
  if (form) input.addEventListener('input', function () { form.classList.remove('is-wrong'); if (note.classList.contains('is-error')) say(''); });
  if (form) eye.addEventListener('click', function () {
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.setAttribute('aria-pressed', String(show));
    relabel();
    input.focus();
  });

  /* ---------- Presentation ---------- */
  var stage = $('.deck__stage'), frame = $('.deck__frame'), layers = $$('.deck__img', frame);
  var dots = $('.deck__dots'), countNow = $('.deck__count b'), countAll = $('.deck__count span'), badge = $('.deck__badge');
  var dnote = $('.deck__note'), grid = $('.deck__grid'), gridIn = $('.deck__grid-in'), prog = $('.progress b');
  var prevBtn = $('.deck__nav--prev'), nextBtn = $('.deck__nav--next'), gridBtn = $('.cbar [data-act="grid"]');
  var links = $('.deck__links', frame), tryLinks = $$('.deck__try'), calli = $('.calli', frame);
  tryLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {         // on to the slide where the activity can be tried
      e.preventDefault();
      e.stopPropagation();
      go(liveIndex());
    });
  });
  var N = 0, cur = -1, top = 0, turn = 0, urls = {}, sprites = {}, META = null, built = false, gridBuilt = false, swiped = 0, shown = '';

  // the edition on screen: the page's language when the presentation exists in it
  function ed() { return M.langs[lang] ? lang : Object.keys(M.langs)[0]; }
  function slideUrl(i) {
    var e = ed(), set = urls[e] || (urls[e] = []);
    if (!set[i]) {
      set[i] = M.open ? pictureAt(plainUrl(e + '/' + pad(i + 1) + '.' + M.langs[e].ext)) : fileOf(e + '/' + pad(i + 1) + '.bin').then(function (buf) {
        return URL.createObjectURL(new Blob([buf], { type: M.langs[e].type }));
      });
      set[i].catch(function () { set[i] = null; });        // a failed slide can be asked for again
    }
    return set[i];
  }
  // what each slide says and where its links are (for screen readers and for the clickable contact)
  function about(i) { var m = META && META[ed()]; return (m && m[i]) || null; }
  function describe() {
    if (cur < 0) return;
    var a = about(cur), label = t('deck.slide', { i: cur + 1, n: N });
    frame.setAttribute('aria-label', label);
    layers[top].alt = frame.classList.contains('is-live') ? '' : a && a.text ? label + ' — ' + a.text : label;   // a live slide speaks for itself
    links.textContent = '';
    ((a && a.links) || []).forEach(function (l) {
      if (!/^(mailto:|tel:|https:\/\/)/.test(l.href)) return;
      var el = doc.createElement('a');
      el.href = l.href;
      el.setAttribute('aria-label', l.label);
      el.title = l.label;
      el.style.left = l.box[0] + '%'; el.style.top = l.box[1] + '%';
      el.style.width = l.box[2] + '%'; el.style.height = l.box[3] + '%';
      if (/^https:/.test(l.href)) { el.target = '_blank'; el.rel = 'noopener'; }
      // the link to book a call opens the calendar over the presentation (assets/js/booking.js, where the page has it)
      if (l.href === 'https://www.ben.events/book' && window.BEN_BOOKING) { el.setAttribute('data-book', ''); el.setAttribute('aria-haspopup', 'dialog'); }
      links.appendChild(el);
    });
  }
  // the language changed while the presentation is open: same slide, other edition
  function edition() {
    if (shown === ed() || cur < 0) return;
    var i = cur;
    cur = -1;
    go(i, 1, true);
    thumbs();
  }

  /* A slide that is alive (the manifest lists them): the demonstration takes the place of its picture.
     In a wide frame it is drawn as a slide, on a 1856 x 1044 canvas scaled to the frame;
     in a narrow one it becomes a tall card and the frame grows with it.
     Its picture is never shown while the demonstration works: the picture stays unseen underneath,
     and when the presentation moves on, the demonstration waits for the next slide and fades into it. */
  var liveNow = '', liveOut = 0;
  function liveAt(i) { return !!(M && M.live && M.live.indexOf(i + 1) > -1); }
  function liveIndex() { return M && M.live && M.live.length ? M.live[0] - 1 : -1; }
  function live() {
    if (!calli || !built) return;
    var on = cur >= 0 && liveAt(cur) && !!window.BEN_CALLI, w = frame.clientWidth, skin = !on ? '' : w >= LIVE_MIN ? 'slide' : 'tall';   // without its script, the picture stays
    var near = !on && (liveAt(cur + 1) || liveAt(cur - 1)), now = skin + '|' + cur + '|' + near;
    if (skin === 'slide') calli.style.setProperty('--k', (w / 1856).toFixed(5));
    if (now === liveNow) return;
    liveNow = now;
    if (on) {
      clearTimeout(liveOut);
      calli.classList.remove('is-leaving', 'is-out');
      calli.hidden = false;
      calli.setAttribute('data-skin', skin);
      $('.calli__page b', calli).textContent = cur + 1;
      frame.classList.add('is-live');
      frame.classList.toggle('is-tall', skin === 'tall');
      stage.classList.add('has-live');
      stage.classList.toggle('has-tall', skin === 'tall');
    } else if (!calli.hidden) calli.classList.add('is-leaving');       // it leaves when the next slide is ready: see liveGone
    doc.dispatchEvent(new CustomEvent('ben:live', { detail: { on: on, near: near } }));
  }
  // the next slide is ready (or could not be loaded): the demonstration that was leaving goes, or stays as it was
  function liveGone(loaded, instant) {
    if (!calli || !calli.classList.contains('is-leaving')) return;
    if (!loaded) { calli.classList.remove('is-leaving'); return; }
    var tall = calli.getAttribute('data-skin') === 'tall';
    frame.classList.remove('is-live', 'is-tall');
    stage.classList.remove('has-live', 'has-tall');
    clearTimeout(liveOut);
    var end = function () { calli.hidden = true; calli.classList.remove('is-leaving', 'is-out'); };
    if (tall || instant || reduced) return end();
    calli.classList.add('is-out');
    liveOut = setTimeout(end, 480);
  }
  if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(live); }).observe(frame);
  else window.addEventListener('resize', live);

  function relabel() {
    if (form) eye.setAttribute('aria-label', t(input.type === 'password' ? 'gate.show' : 'gate.hide'));
    stage.setAttribute('data-rotate', t('deck.rotate'));
    if (!built) return;
    $$('button', dots).forEach(function (b, i) { b.setAttribute('aria-label', t('deck.goto', { i: i + 1 })); });
    $$('.thumb', gridIn).forEach(function (b, i) { b.setAttribute('aria-label', t('deck.goto', { i: i + 1 })); });
    var x = $('.deck__grid-x', grid);
    if (x) x.setAttribute('aria-label', t('deck.close'));
    describe();
  }

  function build() {
    if (built) return;
    built = true;
    N = M.langs[ed()].count;
    countAll.textContent = pad(N);
    for (var i = 0; i < N; i++) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.setAttribute('data-go', i);
      dots.appendChild(b);
    }
    relabel();
  }

  function chrome() {
    countNow.textContent = pad(cur + 1);
    badge.textContent = pad(cur + 1) + ' / ' + pad(N);
    $$('button', dots).forEach(function (b, i) {
      b.classList.toggle('is-done', i < cur);
      if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    $$('.thumb', gridIn).forEach(function (b, i) {
      if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    tryLinks.forEach(function (a) { a.hidden = !(liveIndex() > 0 && cur === liveIndex() - 1); });
    live();
    prevBtn.disabled = cur <= 0;
    nextBtn.disabled = cur >= N - 1;
    if (prog) prog.style.transform = 'scaleX(' + ((cur + 1) / N) + ')';
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }

  // what visitors do, counted without identifying anyone (assets/js/stats.js, on the open presentation only)
  var seenEnd = false, count = function (name, props) { if (window.benCount) window.benCount(name, props); };
  // dir: 1 forwards, -1 backwards (worked out when left empty)
  function go(i, dir, instant) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === cur) return;
    var my = ++turn, e = ed();
    if (!dir) dir = i > cur ? 1 : -1;
    cur = i;
    if (i === N - 1 && !seenEnd) { seenEnd = true; count('presentation_finished'); }
    links.textContent = '';
    chrome();
    var slow = setTimeout(function () { if (my === turn) frame.classList.add('is-loading'); }, 180);
    slideUrl(i).then(function (url) {
      if (my !== turn) return;
      var next = layers[1 - top], prev = layers[top];
      next.className = 'deck__img';
      next.src = url;
      var ready = next.decode ? next.decode().catch(function () {}) : Promise.resolve();
      return ready.then(function () {
        if (my !== turn) return;
        clearTimeout(slow);
        frame.classList.remove('is-loading');
        dnote.textContent = ''; dnote.classList.remove('is-error');
        frame.style.setProperty('--dir', dir);
        liveGone(true, instant);
        var unseen = liveAt(i) && frame.classList.contains('is-live');    // a live slide shows itself, not its picture
        if (instant || reduced) {
          prev.className = 'deck__img';
          next.className = unseen ? 'deck__img' : 'deck__img is-cur';
        } else {
          next.className = unseen ? 'deck__img' : 'deck__img is-enter';
          void next.offsetWidth;
          if (!unseen) next.className = 'deck__img is-cur';
          prev.className = 'deck__img is-leave';
        }
        prev.alt = '';
        top = 1 - top;
        shown = e;
        describe();
        [i + 1, i - 1].forEach(function (j) { if (j >= 0 && j < N) slideUrl(j).catch(function () {}); });   // neighbours ready
      });
    }, function () {
      if (my !== turn) return;
      clearTimeout(slow);
      frame.classList.remove('is-loading');
      liveGone(false);
      dnote.textContent = t('deck.error'); dnote.classList.add('is-error');
    });
  }

  function openDeck(instant) {
    build();
    var show = function () {
      if (gate) gate.hidden = true;
      deck.hidden = false;
      body.classList.add('is-open');
      body.classList.remove('is-leaving', 'is-restoring');
      if (!instant && !reduced) { deck.classList.add('is-in'); setTimeout(function () { deck.classList.remove('is-in'); }, 1600); }
      window.scrollTo(0, 0);
      var m = /^#(\d+)$/.exec(location.hash);
      go(m ? parseInt(m[1], 10) - 1 : 0, 1, true);
      frame.focus({ preventScroll: true });
      doc.dispatchEvent(new CustomEvent('ben:open'));
      if (M.meta && !META) (M.open ? fetch(plainUrl('meta.json')).then(function (r) { if (!r.ok) throw new Error('file'); return r.json(); })
        : fileOf('meta.bin').then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); })).then(function (meta) {
        META = meta;
        describe();
      }).catch(function () {});
    };
    if (instant || reduced) show();
    else { body.classList.add('is-leaving'); setTimeout(show, 520); }
  }

  /* full screen */
  function fullEl() { return doc.fullscreenElement || doc.webkitFullscreenElement || null; }
  var idle = 0;
  function wake() {
    stage.classList.remove('is-idle');
    clearTimeout(idle);
    if (stage.classList.contains('is-full')) idle = setTimeout(function () { stage.classList.add('is-idle'); }, 2600);
  }
  function syncFull() {
    var soft = stage.classList.contains('is-immersive');
    stage.classList.toggle('is-full', soft || fullEl() === stage);
    body.classList.toggle('lb-open', soft || !grid.hidden);
    wake();
  }
  function softFull(on) { stage.classList.toggle('is-immersive', on); syncFull(); }
  function toggleFull() {
    if (fullEl()) { (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc); return; }
    if (stage.classList.contains('is-immersive')) { softFull(false); return; }
    var ask = stage.requestFullscreen || stage.webkitRequestFullscreen;
    if (!ask) { softFull(true); return; }          // phones without real full screen: fill the window instead
    try {
      var p = ask.call(stage);
      if (p && p.then) p.then(function () {
        try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); } catch (e) {}
      }, function () { softFull(true); });
    } catch (e) { softFull(true); }
  }
  doc.addEventListener('fullscreenchange', syncFull);
  doc.addEventListener('webkitfullscreenchange', syncFull);
  stage.addEventListener('mousemove', wake);
  stage.addEventListener('touchstart', wake, { passive: true });

  /* every slide at a glance */
  var behind = $$('.cbar, .deck__stage, .deck__foot, .deck__cta');
  function buildGrid() {
    if (gridBuilt) return;
    gridBuilt = true;
    var cols = M.langs[ed()].thumbs.columns, rows = Math.ceil(N / cols);
    var x = doc.createElement('button');
    x.type = 'button';
    x.className = 'tool deck__grid-x';
    x.setAttribute('data-act', 'grid');
    x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    grid.insertBefore(x, gridIn);
    for (var i = 0; i < N; i++) {
      var b = doc.createElement('button'), n = doc.createElement('span');
      b.type = 'button';
      b.className = 'thumb';
      b.setAttribute('data-go', i);
      b.style.backgroundSize = (cols * 100) + '% ' + (rows * 100) + '%';
      b.style.backgroundPosition = (cols > 1 ? (i % cols) / (cols - 1) * 100 : 0) + '% ' + (rows > 1 ? Math.floor(i / cols) / (rows - 1) * 100 : 0) + '%';
      n.textContent = pad(i + 1);
      n.setAttribute('aria-hidden', 'true');
      b.appendChild(n);
      gridIn.appendChild(b);
    }
    thumbs();
    relabel();
    chrome();
  }
  function thumbs() {
    if (!gridBuilt) return;
    var e = ed();
    if (!sprites[e]) {
      sprites[e] = M.open ? Promise.resolve(plainUrl(e + '/' + M.langs[e].thumbs.file)) : fileOf(e + '/thumbs.bin').then(function (buf) {
        return URL.createObjectURL(new Blob([buf], { type: M.langs[e].thumbs.type }));
      });
      sprites[e].catch(function () { sprites[e] = null; });
    }
    sprites[e].then(function (url) { if (e === ed()) gridIn.style.setProperty('--thumbs', 'url("' + url + '")'); }, function () {});
  }
  function toggleGrid(open) {
    if (open === undefined) open = grid.hidden;
    if (open === !grid.hidden) return;
    if (open && fullEl()) (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
    if (open && stage.classList.contains('is-immersive')) stage.classList.remove('is-immersive');
    if (open) buildGrid();
    grid.hidden = !open;
    gridBtn.setAttribute('aria-pressed', String(open));
    behind.forEach(function (n) { if (open) n.setAttribute('inert', ''); else n.removeAttribute('inert'); });
    syncFull();
    if (open) { var c = $('.thumb[aria-current="true"]', gridIn); if (c) { c.focus({ preventScroll: true }); c.scrollIntoView({ block: 'center' }); } }
    else gridBtn.focus({ preventScroll: true });
  }

  /* the PDF */
  var pdfBusy = false;
  function savePdf(btn) {
    if (M.open) {                                 // a plain file: the browser downloads it
      count('presentation_pdf', { language: ed() });
      var e0 = ed(), a0 = doc.createElement('a');
      a0.href = plainUrl(e0 + '/' + M.langs[e0].pdf.file);
      a0.download = M.langs[e0].pdf.name;
      body.appendChild(a0);
      a0.click();
      body.removeChild(a0);
      return;
    }
    if (pdfBusy) return;
    pdfBusy = true;
    btn.classList.add('is-busy');
    dnote.classList.remove('is-error');
    dnote.textContent = t('deck.pdfwait');
    var e = ed();
    fileOf(e + '/deck.bin').then(function (buf) {
      var url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' })), a = doc.createElement('a');
      a.href = url;
      a.download = M.langs[e].pdf.name;
      body.appendChild(a);
      a.click();
      body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
      dnote.textContent = t('deck.pdfdone');
    }, function () {
      dnote.textContent = t('gate.offline');
      dnote.classList.add('is-error');
    }).then(function () { pdfBusy = false; btn.classList.remove('is-busy'); });
  }

  /* sharing an open presentation: the phone's own share sheet, or the link copied */
  var said = 0;
  function tell(key, bad) {
    dnote.classList.toggle('is-error', !!bad);
    dnote.textContent = t(key);
    clearTimeout(said);
    said = setTimeout(function () { if (dnote.textContent === t(key)) { dnote.textContent = ''; dnote.classList.remove('is-error'); } }, 6000);
  }
  function share() {
    count('presentation_share');
    var url = location.origin + location.pathname + '?lang=' + lang;
    var byHand = function () {
      try {
        var i = doc.createElement('input');
        i.value = url; i.setAttribute('readonly', ''); i.style.cssText = 'position:fixed;left:-999px;top:0';
        body.appendChild(i); i.select();
        var ok = doc.execCommand('copy');
        body.removeChild(i);
        tell(ok ? 'deck.copied' : 'deck.nocopy', !ok);
      } catch (e) { tell('deck.nocopy', true); }
    };
    if (navigator.share && !fine) { navigator.share({ title: doc.title, url: url }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { tell('deck.copied'); }, byHand);
    else byHand();
  }

  /* controls */
  doc.addEventListener('click', function (e) {
    var target = e.target.closest ? e.target.closest('[data-act], [data-go]') : null;
    if (!target || deck.hidden) return;
    if (target.hasAttribute('data-go')) {
      go(parseInt(target.getAttribute('data-go'), 10));
      if (!grid.hidden) toggleGrid(false);
      return;
    }
    var act = target.getAttribute('data-act');
    if (act === 'prev') go(cur - 1);
    else if (act === 'next') go(cur + 1);
    else if (act === 'grid') toggleGrid();
    else if (act === 'full') toggleFull();
    else if (act === 'pdf') savePdf(target);
    else if (act === 'share') share();
  });
  frame.addEventListener('click', function (e) {
    if (e.target.closest('button, a, .calli') || Date.now() - swiped < 450) return;      // a live slide is not a "next" button
    var r = frame.getBoundingClientRect();
    go(cur + ((e.clientX - r.left) / r.width < 0.3 ? -1 : 1));    // the left third goes back
  });
  var sx = null, sy = 0;
  frame.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1 && !e.target.closest('input, textarea, select')) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } else sx = null;
  }, { passive: true });
  frame.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) { swiped = Date.now(); go(cur + (dx < 0 ? 1 : -1)); }
  }, { passive: true });
  doc.addEventListener('keydown', function (e) {
    if (deck.hidden || e.altKey || e.metaKey || e.ctrlKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    var k = e.key;
    if (!grid.hidden) {
      if (k === 'Escape' || k === 'g' || k === 'G') { e.preventDefault(); toggleGrid(false); }
      return;
    }
    if (k === 'ArrowRight' || k === 'PageDown') go(cur + 1);
    else if (k === 'ArrowLeft' || k === 'PageUp') go(cur - 1);
    else if (k === ' ' || k === 'Spacebar') { if (tag === 'button' || tag === 'a') return; go(cur + (e.shiftKey ? -1 : 1)); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(N - 1);
    else if (k === 'f' || k === 'F') toggleFull();
    else if (k === 'g' || k === 'G') toggleGrid(true);
    else if (k === 'Escape' && stage.classList.contains('is-immersive')) softFull(false);
    else return;
    e.preventDefault();
  });

  /* buttons that lean towards the pointer, as on the rest of the site */
  if (fine && !reduced) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Go ---------- */
  var asked = /[?&]lang=(en|fr)\b/.exec(location.search), kept = null;
  try { kept = localStorage.getItem('ben-lang'); } catch (e) {}
  if (form) {
    // a client page: in the language its presentation comes in first (French unless the page says <body data-first-lang="en">),
    // or the one chosen before; then the access form, or straight in if this tab already opened it
    var first = body.getAttribute('data-first-lang') === 'en' ? 'en' : 'fr';
    setLang((asked && asked[1]) || (kept === 'en' || kept === 'fr' ? kept : first), false);
    restore().then(function (ok) {
      if (ok) return openDeck(true);
      body.classList.remove('is-restoring');
      if (fine) input.focus({ preventScroll: true });
    });
  } else {
    // an open presentation: the language asked for, else the one chosen on the site, else the browser's; then straight in
    setLang((asked && asked[1]) || kept || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'), false);
    manifest.then(function (m) {
      if (!m.open) throw new Error('locked');
      M = m;
      openDeck(true);
      if (!reduced) { deck.classList.add('is-in'); setTimeout(function () { deck.classList.remove('is-in'); }, 1600); }
    }).catch(function () {
      deck.hidden = false;
      $('.deck__stage').hidden = true;
      dnote.textContent = t('gate.offline');
      dnote.classList.add('is-error');
    });
  }
})();
