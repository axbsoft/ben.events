/* benevents agency — the page a visitor opens from the e-mail they receive after the calligraphy
   activity (calligraphy/card.html). Vanilla JS, no dependencies.

   The address of the page says everything: ?s= the language (zh, ja, ko) · m= the printed model ·
   n= the first name · c= its characters (parts separated by ·) · l= the language of the page ·
   o= the brand offer the bookmark's QR code led to, when it had one (assets/calligraphy/offers.json):
   the bookmark is then drawn with the same QR code, and a button leads to the offer.
   The name is drawn again here, from the same outlines as at the event; nothing is fetched about
   the visitor and nothing is stored. Engine: assets/js/calli-core.js. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body, C = window.BEN_CALLI_CORE;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var main = $('.ca-card__main'), lost = $('.ca-card__lost'), note = $('.ca-card__note');
  if (!C || !main) return;

  var TEXT = {
    fr: {
      'card.text': 'Voici votre prénom tel qu’il a été tracé pour vous. Gardez-le, imprimez-le, partagez-le.',
      'card.png': 'Enregistrer l’image', 'card.pdf': 'PDF à imprimer', 'card.share': 'Partager',
      'card.by': 'Une animation signée', 'card.by2': ', agence événementielle au Maroc.',
      'card.losteyebrow': 'Calligraphie', 'card.lost': 'Ce lien est incomplet.', 'card.losttext': 'Ouvrez le lien depuis l’e-mail reçu après l’animation, sans le modifier.', 'card.home': 'Découvrir benevents',
      'card.title': '{name}, {em}au pinceau{/em}', 'card.said': 'Se prononce {reading}', 'card.spoken': '{chars}, prononcé {reading}',
      'card.saved': 'L’image est enregistrée.', 'card.pdfdone': 'Le PDF est prêt : imprimez-le à 100 %.', 'card.failed': 'Votre calligraphie n’a pas pu être chargée. Vérifiez la connexion et rechargez la page.',
      'card.sharetext': 'Mon prénom {into}'
    },
    en: {
      'card.text': 'Here is your first name as it was written for you. Keep it, print it, share it.',
      'card.png': 'Save the picture', 'card.pdf': 'PDF to print', 'card.share': 'Share',
      'card.by': 'An activity by', 'card.by2': ', event agency in Morocco.',
      'card.losteyebrow': 'Calligraphy', 'card.lost': 'This link is incomplete.', 'card.losttext': 'Open the link from the email you received after the activity, without changing it.', 'card.home': 'Discover benevents',
      'card.title': '{name}, {em}by brush{/em}', 'card.said': 'Pronounced {reading}', 'card.spoken': '{chars}, pronounced {reading}',
      'card.saved': 'The picture is saved.', 'card.pdfdone': 'The PDF is ready: print it at 100%.', 'card.failed': 'Your calligraphy could not be loaded. Check the connection and reload the page.',
      'card.sharetext': 'My first name {into}'
    }
  };
  var q = new URLSearchParams(location.search), lang = 'fr', res = null, page = null, offers = {};
  var offer = /^[a-z0-9][a-z0-9-]{1,23}$/.test(q.get('o') || '') ? q.get('o') : '';
  function t(key, vars) {
    var s = (TEXT[lang] && TEXT[lang][key]) || TEXT.fr[key] || '';
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function say(key, bad) { note._said = key; note.textContent = key ? t(key) : ''; note.classList.toggle('is-error', !!bad); }

  function draw() {
    if (!res) return;
    var script = res.script, lines = res.forms[0], sc = C.SCRIPTS[script], said = C.reading(script, lines), k = 0;
    $('.ca-card__of').textContent = sc.of[lang].charAt(0).toUpperCase() + sc.of[lang].slice(1);
    $('.ca-card__title').innerHTML = t('card.title', { name: esc(res.name), em: '<em>', '/em': '</em>' });
    var han = $('.ca-card__han');
    han.innerHTML = lines.map(function (line) {             // one group for each part of the name
      return '<b>' + line.split('').map(function (ch) { return '<span style="--i:' + (k++) + '">' + C.tile(script, ch, 40) + '</span>'; }).join('') + '</b>';
    }).join('');
    han.setAttribute('aria-label', t('card.spoken', { chars: lines.join(' '), reading: said }));
    $('.ca-card__read').textContent = t('card.said', { reading: said });
    doc.title = res.name + ' · ' + (body.getAttribute('data-title-' + lang) || doc.title);
    // the way to the offer, counted like a scan (offer.html)
    var go = $('.ca-card__offer'), o = offer && offers[offer];
    go.hidden = !o;
    if (o) {
      $('span', go).textContent = (o.label && (o.label[lang] || o.label.fr)) || o.brand || '';
      go.href = '/o/' + offer + '?from=card&l=' + lang;
    }
  }
  function setLang(next, save) {
    lang = next === 'en' ? 'en' : 'fr';
    $$('[data-t]').forEach(function (n) { n.textContent = t(n.getAttribute('data-t')); });
    $$('[data-home]').forEach(function (a) { a.href = lang === 'fr' ? '/fr' : '/'; });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    root.lang = lang;
    doc.title = body.getAttribute('data-title-' + lang) || doc.title;
    if (save) { try { localStorage.setItem('ben-lang', lang); } catch (e) {} }
    if (note._said) say(note._said, note.classList.contains('is-error'));
    draw();
  }
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); }); });

  function save(blob, name) {
    var url = URL.createObjectURL(blob), a = doc.createElement('a');
    a.href = url; a.download = name;
    body.appendChild(a); a.click(); body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }
  function fileName(ext) { return 'calligraphie-' + C.strip(res.name).replace(/[^A-Za-z]+/g, '-') + '.' + ext; }
  main.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !page) return;
    var act = b.getAttribute('data-act');
    if (act === 'png') {
      C.canvasOf(page, 14).then(function (cv) {
        cv.toBlob(function (blob) { if (blob) { save(blob, fileName('png')); say('card.saved'); } }, 'image/png');
      }).catch(function () { say('card.failed', true); });
    } else if (act === 'pdf') {
      save(new Blob([C.pdfOf(page, res.name + ' ' + res.forms[0].join(''), false)], { type: 'application/pdf' }), fileName('pdf'));
      say('card.pdfdone');
    } else if (act === 'share' && navigator.share) {
      navigator.share({ title: doc.title, text: t('card.sharetext', { into: C.SCRIPTS[res.script].into[lang] }), url: location.href }).catch(function () {});
    }
  });

  var kept = null;
  try { kept = localStorage.getItem('ben-lang'); } catch (e) {}
  var asked = q.get('l');
  setLang(asked === 'en' || asked === 'fr' ? asked : kept || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'), false);

  var script = q.get('s'), model = q.get('m');
  if (!C.SCRIPTS[script] || !model || !q.get('n') || !q.get('c')) { lost.hidden = false; return; }
  body.setAttribute('data-script', script);
  Promise.all([C.load(script), C.offers()]).then(function (got) {
    offers = got[1];
    var tp = C.TEMPLATES[model];
    if (!tp || tp.script !== script) { lost.hidden = false; return null; }
    res = C.fromChars(script, q.get('n'), q.get('c'));
    if (!res) { lost.hidden = false; return null; }
    return C.ready(model, res, 0, { qr: tp.qr ? C.qrOf(offer) : null }).then(function (pg) {
      page = pg;
      $('.ca-card__paper').innerHTML = C.svgOf(page);
      $('[data-act="share"]').hidden = !navigator.share;
      main.hidden = false;
      draw();
    });
  }).catch(function () {
    main.hidden = true;
    lost.hidden = false;
    $('[data-t="card.lost"]').removeAttribute('data-t');
    $('.ca-card__lost .ca-h').textContent = t('card.failed');
  });

  // for the automated checks
  window.BEN_CALLI_CARD = { state: function () { return { name: res && res.name, chars: res && res.forms[0].join('·'), shown: !main.hidden, lost: !lost.hidden, lang: lang }; }, pdf: function () { return C.pdfOf(page, res.name, false); } };
})();
