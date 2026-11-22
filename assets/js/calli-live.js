/* benevents agency — "Your first name in calligraphy": the slide of a client presentation where the activity
   can be tried, in the script the page asks for. Vanilla JS; the characters come from assets/js/calli-core.js
   (the engine of the calligraphy app: Korean, Chinese or Japanese, the same outlines on screen and in the PDF).

   The page says what it wants on the slide itself:
     <section class="calli" data-script="ko" data-model="hangul-bookmark" data-models="kgm-hanok,kgm-kpop" data-client="KGM" data-example="Yassine">
   data-models: the client's own designs (assets/calligraphy/models.json), offered with a toggle above the bookmark; those that
   are not in the registry are left out, and data-model is used when none is.
   (assets/js/calligraphy.js is the older, Chinese-only version of this slide, kept for the M-Automotiv page.)

   1. A visitor types a first name; it is written in the script, by its sound (never a meaning).
   2. The visitor leaves an e-mail address to receive the calligraphy: this is how the activity collects
      contacts, each with or without the visitor's consent to be contacted by the brand.
   3. The bookmark is printed (a PDF at true size; the print-shop version has a bleed and crop marks).
   This page is a demonstration: nothing is sent and nothing is stored. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var root = $('.calli');
  var C = window.BEN_CALLI_CORE;
  if (!root || !C) return;

  var SCRIPT = root.getAttribute('data-script') || 'ko';
  var MODEL = root.getAttribute('data-model') || 'hangul-bookmark';
  var WANTED = (root.getAttribute('data-models') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var DESIGNS = [];                                                    // the designs offered by the toggle (two or more)
  var CLIENT = root.getAttribute('data-client') || '';
  var EXAMPLE = root.getAttribute('data-example') || 'Yassine';      // shown before the visitor types anything
  var SHOWN = 4;                                                       // contacts listed on the slide (the newest first)

  var TEXT = {
    fr: {
      empty: 'Saisissez un prénom.',
      letters: 'Utilisez uniquement des lettres latines, des espaces et des traits d’union.',
      refused: 'Ce prénom ne peut pas être traité ici. Adressez-vous à l’équipe.',
      loading: 'Préparation de l’encre…',
      failed: 'La démonstration n’a pas pu être chargée. Vérifiez votre connexion et réessayez.',
      usage: 'Forme d’usage',
      usageNote: 'Transcription couramment utilisée pour ce prénom.',
      proposal: 'Proposition phonétique',
      proposalNote: 'Transcription automatique, syllabe par syllabe. Sur l’événement, elle est validée par l’équipe avant impression.',
      alts: 'Autre graphie',
      spoken: '{han}, prononcé {reading}',
      paper: 'Marque-page de {name} : {han}',
      specs: 'Marque-page {w} × {h} mm',
      specsBleed: '{w} × {h} mm + fond perdu {b} mm, traits de coupe',
      mailFirst: 'Révélez d’abord un prénom.',
      mailEmpty: 'Saisissez une adresse e-mail.',
      mailBad: 'Cette adresse e-mail ne semble pas valide.',
      mailDemo: 'Sur l’événement, {email} reçoit sa calligraphie dans la minute. Ici, rien n’est envoyé : c’est une démonstration.',
      mailFailed: 'L’e-mail n’a pas pu être envoyé. Vérifiez la connexion et réessayez.',
      printLocked: 'L’impression se débloque après l’étape e-mail.',
      printReady: 'Le marque-page peut maintenant être imprimé.',
      printOpen: 'Le PDF s’ouvre dans un nouvel onglet : imprimez-le à 100 %.',
      ready: 'Le PDF est prêt.',
      agree: 'Accord',
      noagree: 'Sans accord',
      csv: ['Prénom', 'Caractères', 'Lecture', 'E-mail', 'Accord pour être recontacté', 'Date'],
      yes: 'oui',
      no: 'non',
      file: 'marque-page',
      designs: 'Modèle du marque-page'
    },
    en: {
      empty: 'Enter a first name.',
      letters: 'Use Latin letters, spaces and hyphens only.',
      refused: 'This name cannot be handled here. Please ask the team.',
      loading: 'Preparing the ink…',
      failed: 'The demonstration could not be loaded. Check your connection and try again.',
      usage: 'Established form',
      usageNote: 'The transcription commonly used for this name.',
      proposal: 'Phonetic proposal',
      proposalNote: 'Automatic transcription, syllable by syllable. At the event it is checked by the team before printing.',
      alts: 'Other spelling',
      spoken: '{han}, pronounced {reading}',
      paper: 'Bookmark for {name}: {han}',
      specs: 'Bookmark {w} × {h} mm',
      specsBleed: '{w} × {h} mm + {b} mm bleed, crop marks',
      mailFirst: 'Reveal a first name first.',
      mailEmpty: 'Enter an email address.',
      mailBad: 'This email address does not look valid.',
      mailDemo: 'At the event, {email} receives the calligraphy within a minute. Here nothing is sent: this is a demonstration.',
      mailFailed: 'The email could not be sent. Check the connection and try again.',
      printLocked: 'Printing unlocks after the email step.',
      printReady: 'The bookmark can now be printed.',
      printOpen: 'The PDF opens in a new tab: print it at 100%.',
      ready: 'The PDF is ready.',
      agree: 'Consent',
      noagree: 'No consent',
      csv: ['First name', 'Characters', 'Reading', 'Email', 'Agrees to be contacted', 'Date'],
      yes: 'yes',
      no: 'no',
      file: 'bookmark',
      designs: 'Bookmark design'
    }
  };
  var lang = doc.documentElement.lang === 'en' ? 'en' : 'fr';
  function t(k, vars) {
    var s = TEXT[lang][k] || TEXT.fr[k] || '';
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  }

  // For the event, this is the one function to connect to the mail service: it receives the contact
  // { name, han, reading, email, consent, at } and must return a promise that resolves once the e-mail has left.
  function deliver(contact) { return Promise.resolve({ demo: true, contact: contact }); }

  var form = $('.calli__form', root), input = form.elements.name, note = $('.calli__note', root);
  var result = $('.calli__result', root), hanBox = $('.calli__han', root), readBox = $('.calli__pinyin', root);
  var chip = $('.calli__chip', root), chipNote = $('.calli__chipnote', root), altBox = $('.calli__alts', root);
  var paper = $('.calli__paper', root), specs = $('.calli__specs', root);
  var mail = $('.calli__mail', root), email = mail.elements.email, agree = $('.calli__consent input', root), mnote = $('.calli__mnote', root);
  var last = $('.calli__step[data-step="3"]', root), shop = $('.calli__shop input', root), anote = $('.calli__anote', root);
  var rows = $('.calli__rows', root), none = $('.calli__none', root), count = $('.calli__count', root);
  var state = { res: null, form: 0, page: null, loading: null, sent: '', leads: [], turn: 0 };

  function say(el, key, vars, kind) {
    el._said = key ? { key: key, vars: vars, kind: kind } : null;
    el.textContent = key ? t(key, vars) : '';
    el.classList.toggle('is-error', kind === 'error');
    el.classList.toggle('is-done', kind === 'done');
  }
  function sayAgain(el) { if (el._said) say(el, el._said.key, el._said.vars, el._said.kind); }

  function load() {
    if (state.loading) return state.loading;
    say(note, 'loading');
    state.loading = C.load(SCRIPT).then(function () { return C.models(); }).then(function () {
      DESIGNS = WANTED.filter(function (id) { return C.TEMPLATES[id] && C.TEMPLATES[id].script === SCRIPT; });
      if (DESIGNS.length && DESIGNS.indexOf(MODEL) < 0) MODEL = DESIGNS[0];
      designs();
      return C.picture(MODEL);
    }).then(function () { say(note, ''); });
    state.loading.catch(function () { state.loading = null; say(note, 'failed', null, 'error'); });
    return state.loading;
  }
  var reading = function (lines) { return C.reading(SCRIPT, lines); };
  var tiles = function (text, pad) { return text.split('').map(function (ch) { return C.tile(SCRIPT, ch, pad); }).join(''); };

  function showHan(still) {
    var res = state.res, lines = res.forms[state.form], text = lines.join(lines.length > 1 ? '·' : '');
    hanBox.textContent = '';
    var k = 0, longest = 2;
    lines.forEach(function (line) {
      var row = doc.createElement('div');
      row.className = 'calli__line';
      longest = Math.max(longest, line.length);
      line.split('').forEach(function (ch) {
        var holder = doc.createElement('span');
        holder.className = 'calli__char';
        holder.style.setProperty('--i', k++);
        holder.innerHTML = C.tile(SCRIPT, ch, 40);
        row.appendChild(holder);
      });
      hanBox.appendChild(row);
    });
    hanBox.style.setProperty('--n', longest);
    hanBox.style.setProperty('--rows', lines.length);
    var said = reading(lines);
    hanBox.setAttribute('aria-label', t('spoken', { han: text, reading: said }));
    readBox.textContent = said;
    chip.textContent = t(res.known ? 'usage' : 'proposal');
    chip.classList.toggle('is-proposal', !res.known);
    chipNote.textContent = t(res.known ? 'usageNote' : 'proposalNote');
    altBox.textContent = '';
    if (res.forms.length > 1) {
      var lab = doc.createElement('span');
      lab.textContent = t('alts');
      altBox.appendChild(lab);
      res.forms.forEach(function (f, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.innerHTML = tiles(f.join(''), 20);
        b.setAttribute('aria-label', reading(f));
        b.setAttribute('aria-pressed', String(i === state.form));
        b.addEventListener('click', function () { if (state.form !== i) { state.form = i; showHan(); showPaper(); } });
        altBox.appendChild(b);
      });
    }
    result.hidden = false;
    result.classList.remove('is-in', 'is-still');
    void result.offsetWidth;
    result.classList.add(still ? 'is-still' : 'is-in');
  }

  // the toggle between the client's designs, above the bookmark
  var designBox = null;
  function designs() {
    if (DESIGNS.length < 2) { if (designBox) designBox.hidden = true; paper.parentNode.classList.remove('has-designs'); return; }
    if (!designBox) {
      designBox = doc.createElement('div');
      designBox.className = 'calli__designs';
      designBox.setAttribute('role', 'group');
      paper.parentNode.insertBefore(designBox, paper);
    }
    designBox.hidden = false;
    designBox.setAttribute('aria-label', t('designs'));
    paper.parentNode.classList.add('has-designs');
    designBox.textContent = '';
    DESIGNS.forEach(function (id) {
      var b = doc.createElement('button'), lab = C.TEMPLATES[id].label || {};
      b.type = 'button';
      b.textContent = String(lab[lang] || lab.en || id).replace(/^.*?·\s*/, '');
      b.setAttribute('aria-pressed', String(id === MODEL));
      b.addEventListener('click', function () {
        if (id === MODEL) return;
        MODEL = id;
        designs();
        C.picture(MODEL).then(function () { if (state.res) showPaper(); });
      });
      designBox.appendChild(b);
    });
  }

  function showPaper() {
    var pg = state.page = C.compose(MODEL, state.res, state.form);
    paper.innerHTML = C.svgOf(pg, 'calli__svg');
    paper.firstChild.setAttribute('aria-label', t('paper', { name: state.res.name, han: state.res.forms[state.form].join('') }));
    specs.textContent = t(shop.checked ? 'specsBleed' : 'specs', { w: pg.w, h: pg.h, b: C.BLEED });
  }

  function unlock(to) {
    state.sent = to || '';
    last.classList.toggle('is-off', !state.sent);
    $$('[data-calli="print"], [data-calli="pdf"]', root).forEach(function (b) { b.disabled = !state.sent; });
    say(anote, state.sent ? 'printReady' : 'printLocked', null, state.sent ? 'done' : '');
  }

  function reveal(raw, quiet) {
    var turn = ++state.turn;
    return load().then(function () {
      var res = C.transliterate(SCRIPT, raw);
      if (res.error) { if (!quiet) say(note, res.error, null, 'error'); return false; }
      // the outlines of every form shown (the alternatives too), and the picture of the bookmark
      return C.ready(MODEL, res, 0).then(function () { return C.need(SCRIPT, res.forms.map(function (f) { return f.join(''); }).join('')); }).then(function () {
        if (turn !== state.turn) return false;                // a newer name was asked for meanwhile
        say(note, '');
        state.res = res; state.form = 0;
        if (state.sent) { say(mnote, ''); unlock(''); }       // another first name: the e-mail step starts again
        showHan();
        showPaper();
        return true;
      });
    }).catch(function () { say(note, 'failed', null, 'error'); return false; });
  }

  function slug(s) { return C.strip(s).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fileName() { return [CLIENT, slug(state.res.name), t('file')].filter(Boolean).map(slug).join('-') + (shop.checked ? '-print' : '') + '.pdf'; }
  function makePdf() {
    var bytes = C.pdfOf(state.page, state.res.name + ' ' + state.res.forms[state.form].join(''), shop.checked);
    return new Blob([bytes], { type: 'application/pdf' });
  }
  function save(blob, name) {
    var url = URL.createObjectURL(blob), a = doc.createElement('a');
    a.href = url; a.download = name;
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }

  function showLeads(fresh) {
    rows.textContent = '';
    state.leads.slice(0, SHOWN).forEach(function (c, i) {
      var li = doc.createElement('li'), who = doc.createElement('b'), where = doc.createElement('span'), tag = doc.createElement('i');
      who.textContent = c.name;
      who.insertAdjacentHTML('beforeend', tiles(c.han, 20));
      where.textContent = c.email;
      tag.textContent = t(c.consent ? 'agree' : 'noagree');
      if (!c.consent) tag.className = 'is-no';
      if (i || !fresh) li.style.animation = 'none';
      li.appendChild(who); li.appendChild(where); li.appendChild(tag);
      rows.appendChild(li);
    });
    none.hidden = state.leads.length > 0;
    count.textContent = state.leads.length;
    $('[data-calli="csv"]', root).disabled = !state.leads.length;
  }
  function keep(contact) {
    state.leads = state.leads.filter(function (c) { return c.email.toLowerCase() !== contact.email.toLowerCase(); });
    state.leads.unshift(contact);
    showLeads(true);
  }
  function csvOf() {
    var z = function (v) { return (v < 10 ? '0' : '') + v; };
    var when = function (d) { return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
    var cell = function (v) { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = '\'' + v; return '"' + v.replace(/"/g, '""') + '"'; };    // never a formula
    var lines = [TEXT[lang].csv].concat(state.leads.slice().reverse().map(function (c) {
      return [c.name, c.han, c.reading, c.email, t(c.consent ? 'yes' : 'no'), when(c.at)];
    }));
    return '﻿' + lines.map(function (l) { return l.map(cell).join(';'); }).join('\r\n') + '\r\n';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!C.tidy(input.value)) { say(note, 'empty', null, 'error'); input.focus(); return; }
    reveal(input.value);
  });
  input.addEventListener('input', function () { if (note.classList.contains('is-error')) say(note, ''); });

  mail.addEventListener('submit', function (e) {
    e.preventDefault();
    if (mail.classList.contains('is-busy')) return;
    var to = email.value.trim();
    if (!state.res) { say(mnote, 'mailFirst', null, 'error'); input.focus(); return; }
    if (!to) { say(mnote, 'mailEmpty', null, 'error'); email.focus(); return; }
    if (to.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) { say(mnote, 'mailBad', null, 'error'); email.focus(); return; }
    var lines = state.res.forms[state.form];
    var contact = { name: state.res.name, han: lines.join(''), reading: reading(lines), email: to, consent: agree.checked, at: new Date() };
    mail.classList.add('is-busy');
    deliver(contact).then(function () {
      keep(contact);
      say(mnote, 'mailDemo', { email: to }, 'done');
      unlock(to);
    }, function () {
      say(mnote, 'mailFailed', null, 'error');
    }).then(function () { mail.classList.remove('is-busy'); });
  });
  email.addEventListener('input', function () { if (mnote.classList.contains('is-error')) say(mnote, ''); });

  shop.addEventListener('change', function () { if (state.res) showPaper(); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-calli]') : null;
    if (!b || b.disabled) return;
    var what = b.getAttribute('data-calli');
    if (what === 'csv') { save(new Blob([csvOf()], { type: 'text/csv;charset=utf-8' }), [CLIENT, 'contacts', 'demo'].filter(Boolean).join('-') + '.csv'); return; }
    if (!state.res || !state.sent) return;
    var blob = makePdf();
    if (what === 'print') {                            // the browser's PDF viewer prints at true size
      var url = URL.createObjectURL(blob), w = window.open(url, '_blank');
      if (w) { setTimeout(function () { URL.revokeObjectURL(url); }, 120000); say(anote, 'printOpen', null, 'done'); return; }
      URL.revokeObjectURL(url);
    }
    save(blob, fileName());
    say(anote, 'ready', null, 'done');
  });
  root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && /^(input)$/i.test(e.target.tagName)) e.target.blur(); });   // the keyboard goes back to the presentation

  doc.addEventListener('ben:lang', function (e) {
    lang = e.detail === 'en' ? 'en' : 'fr';
    [note, mnote, anote].forEach(sayAgain);
    designs();
    if (state.res) { showHan(true); showPaper(); }
    showLeads(false);
  });

  // the engine and the bookmark are fetched when the presentation comes near this slide
  var started = false;
  function start() {
    if (started) return;
    started = true;
    load().then(function () { if (!state.res) return reveal(EXAMPLE, true); }).catch(function () { started = false; });
  }
  doc.addEventListener('ben:live', function (e) { if (e.detail && (e.detail.on || e.detail.near)) start(); });
  unlock('');
  if (!root.hidden) start();

  // for the automated checks
  window.BEN_CALLI = {
    script: SCRIPT, model: function () { return MODEL; }, designs: function () { return DESIGNS.slice(); },
    ready: function () { return load().then(function () { return true; }); },
    transliterate: function (s) { return C.transliterate(SCRIPT, s); },
    reveal: function (s) { return reveal(s); },
    pdf: function (name, withBleed) {
      var res = C.transliterate(SCRIPT, name);
      return C.ready(MODEL, res, 0).then(function (pg) { return C.pdfOf(pg, res.name, !!withBleed); });
    },
    contacts: function () { return state.leads.slice(); },
    csv: csvOf
  };
})();
