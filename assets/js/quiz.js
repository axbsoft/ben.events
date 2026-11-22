/* benevents agency — a personality quiz on a slide of a client presentation ("Which KGM are you?").
   Vanilla JS, no dependencies.

   Five questions on a tablet match each visitor to a model; the visitor leaves a first name and a phone or
   an e-mail to book a test drive of that model, so the sales team knows who wants what.

   The questions, the models and their pictures come with the presentation itself (the "data" of its
   descriptions, encrypted with it on a client page: window.BEN_DECK_DATA, event ben:data), so the quiz is
   only known to those who have the code. This file holds the words around it, in French and in English.
   The page shows the quiz on a live slide: <section class="calli quiz" data-needs="BEN_QUIZ" data-client="KGM">.
   This page is a demonstration: nothing is sent and nothing is stored. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var root = $('.quiz');
  if (!root) return;
  var CLIENT = root.getAttribute('data-client') || '';
  var SHOWN = 3;                                      // contacts listed on the slide (the newest first)

  var TEXT = {
    fr: {
      sub: 'Cinq questions. Sept modèles. Un seul vous ressemble.',
      count: 'Question {i} sur {n}',
      back: 'Question précédente',
      you: 'Vous êtes le',
      ask: 'Réserver un essai du {model}',
      name: 'Votre prénom',
      contact: 'Téléphone ou e-mail',
      consent: 'J’accepte d’être recontacté(e) par {client} au sujet de ce modèle.',
      send: 'Envoyer aux commerciaux',
      again: 'Recommencer',
      noName: 'Saisissez un prénom.',
      noContact: 'Saisissez un téléphone ou un e-mail.',
      badContact: 'Ce téléphone ou cet e-mail ne semble pas valide.',
      sent: 'Sur l’événement, la demande d’essai du {model} part à l’équipe commerciale de {client}. Ici, rien n’est envoyé : c’est une démonstration.',
      side: 'Côté {client}',
      sideTitle: 'Qui veut quoi',
      sideText: 'Chaque visiteur repart avec son modèle ; l’équipe commerciale sait à qui le montrer.',
      matches: 'Résultats par modèle',
      leads: 'Demandes d’essai',
      none: 'La première demande apparaîtra ici.',
      agree: 'Accord',
      noagree: 'Sans accord',
      csv: 'Exporter la liste (CSV)',
      demo: 'Démonstration : rien n’est envoyé ni conservé.',
      head: ['Prénom', 'Contact', 'Modèle', 'Accord pour être recontacté', 'Date'],
      yes: 'oui',
      no: 'non',
      file: 'demandes-essai'
    },
    en: {
      sub: 'Five questions. Seven models. One is just like you.',
      count: 'Question {i} of {n}',
      back: 'Previous question',
      you: 'You are the',
      ask: 'Book a test drive of the {model}',
      name: 'Your first name',
      contact: 'Phone or email',
      consent: 'I agree to be contacted by {client} about this model.',
      send: 'Send to the sales team',
      again: 'Start again',
      noName: 'Enter a first name.',
      noContact: 'Enter a phone number or an email.',
      badContact: 'This phone number or email does not look valid.',
      sent: 'At the event, the test drive request for the {model} goes to {client}’s sales team. Here nothing is sent: this is a demonstration.',
      side: 'On {client}’s side',
      sideTitle: 'Who wants what',
      sideText: 'Every visitor leaves with their model; the sales team knows whom to show it to.',
      matches: 'Matches by model',
      leads: 'Test drive requests',
      none: 'The first request will appear here.',
      agree: 'Consent',
      noagree: 'No consent',
      csv: 'Export the list (CSV)',
      demo: 'Demonstration: nothing is sent or kept.',
      head: ['First name', 'Contact', 'Model', 'Agrees to be contacted', 'Date'],
      yes: 'yes',
      no: 'no',
      file: 'test-drive-requests'
    }
  };
  var lang = doc.documentElement.lang === 'en' ? 'en' : 'fr';
  function t(k, vars) {
    var s = TEXT[lang][k] != null ? TEXT[lang][k] : TEXT.fr[k];
    if (typeof s !== 'string') return s;
    s = s.replace(/\{client\}/g, CLIENT);
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  }
  var tr = function (o) { return o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.en || o.fr || ''); };
  function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }

  // For the event, this is the one function to connect to the sales team's tool: it receives
  // { name, contact, model, consent, answers, at } and must return a promise that resolves once it has left.
  function deliver(lead) { return Promise.resolve({ demo: true, lead: lead }); }

  var D = null;                                       // the quiz: { title, order, models, questions }
  var state = { step: 0, answers: [], model: '', tally: {}, leads: [] };
  var parts = {};

  function build() {
    root.querySelector('.quiz__main').textContent = '';
    var main = root.querySelector('.quiz__main');
    var h = el('h2', 'calli__title quiz__title');
    h.id = 'quiz-title';
    parts.t1 = el('span'); parts.t2 = el('em');
    h.appendChild(parts.t1); h.appendChild(doc.createTextNode(' ')); h.appendChild(parts.t2);
    parts.sub = el('p', 'quiz__sub');
    // the questions
    parts.card = el('div', 'quiz__card');
    var prog = el('div', 'quiz__progress');
    parts.count = el('span', 'quiz__count');
    parts.bar = el('span', 'quiz__bar');
    D.questions.forEach(function () { parts.bar.appendChild(el('i')); });
    prog.appendChild(parts.count); prog.appendChild(parts.bar);
    parts.q = el('p', 'quiz__q');
    parts.q.tabIndex = -1;
    parts.answers = el('div', 'quiz__answers');
    parts.back = el('button', 'quiz__back');
    parts.back.type = 'button';
    parts.back.addEventListener('click', function () { if (state.step > 0) { state.step--; state.answers.length = state.step; ask(); } });
    parts.card.appendChild(prog); parts.card.appendChild(parts.q); parts.card.appendChild(parts.answers); parts.card.appendChild(parts.back);
    // the result
    parts.result = el('div', 'quiz__result');
    parts.result.hidden = true;
    var car = el('div', 'quiz__car');
    parts.img = el('img');
    parts.img.alt = '';
    parts.img.decoding = 'async';
    car.appendChild(parts.img);
    var about = el('div', 'quiz__about');
    parts.you = el('p', 'quiz__you');
    parts.name = el('h3', 'quiz__name');
    parts.persona = el('p', 'quiz__persona');
    parts.kind = el('p', 'quiz__kind');
    parts.line = el('p', 'quiz__line');
    parts.motto = el('p', 'quiz__motto');
    parts.form = el('form', 'quiz__lead');
    parts.form.noValidate = true;
    parts.ask = el('p', 'quiz__ask');
    var fields = el('div', 'quiz__fields');
    var f1 = el('label', 'calli__field'), f2 = el('label', 'calli__field');
    parts.fname = el('input'); parts.fname.name = 'name'; parts.fname.maxLength = 40; parts.fname.autocomplete = 'off';
    parts.fcontact = el('input'); parts.fcontact.name = 'contact'; parts.fcontact.maxLength = 120; parts.fcontact.autocomplete = 'off';
    parts.fcontact.setAttribute('inputmode', 'email');
    f1.appendChild(parts.fname); f2.appendChild(parts.fcontact);
    fields.appendChild(f1); fields.appendChild(f2);
    var consent = el('label', 'calli__consent');
    parts.agree = el('input'); parts.agree.type = 'checkbox';
    parts.consent = el('span');
    consent.appendChild(parts.agree); consent.appendChild(parts.consent);
    var acts = el('div', 'quiz__acts');
    parts.send = el('button', 'btn'); parts.send.type = 'submit'; parts.sendText = el('span'); parts.send.appendChild(parts.sendText);
    parts.again = el('button', 'btn btn--ghost quiz__again'); parts.again.type = 'button'; parts.againText = el('span'); parts.again.appendChild(parts.againText);
    parts.again.addEventListener('click', restart);
    acts.appendChild(parts.send); acts.appendChild(parts.again);
    parts.note = el('p', 'quiz__note');
    parts.note.setAttribute('role', 'status');
    parts.note.setAttribute('aria-live', 'polite');
    [parts.ask, fields, consent, acts, parts.note].forEach(function (n) { parts.form.appendChild(n); });
    parts.form.addEventListener('submit', submit);
    [parts.you, parts.name, parts.persona, parts.kind, parts.line, parts.motto, parts.form].forEach(function (n) { about.appendChild(n); });
    parts.result.appendChild(car); parts.result.appendChild(about);
    [h, parts.sub, parts.card, parts.result].forEach(function (n) { main.appendChild(n); });
    // the side of the brand
    var side = root.querySelector('.quiz__side');
    side.textContent = '';
    parts.side = el('p', 'calli__side');
    parts.sideTitle = el('h3', 'calli__leadtitle');
    parts.sideText = el('p', 'calli__leadtext');
    parts.matches = el('p', 'quiz__head');
    parts.tally = el('ul', 'quiz__tally');
    D.order.forEach(function (id) {
      var li = el('li'), nm = el('b', null, D.models[id].name), tk = el('span', 'quiz__track'), fill = el('i'), n = el('em', null, '0');
      li.setAttribute('data-model', id);
      tk.appendChild(fill);
      li.appendChild(nm); li.appendChild(tk); li.appendChild(n);
      parts.tally.appendChild(li);
    });
    var list = el('div', 'calli__list quiz__list');
    var lh = el('p', 'calli__listhead');
    parts.leadsHead = el('span');
    parts.leadsCount = el('b', 'calli__count', '0');
    lh.appendChild(parts.leadsHead); lh.appendChild(parts.leadsCount);
    parts.rows = el('ul', 'calli__rows');
    parts.none = el('p', 'calli__none');
    list.appendChild(lh); list.appendChild(parts.rows); list.appendChild(parts.none);
    parts.csv = el('button', 'calli__csv');
    parts.csv.type = 'button';
    parts.csv.disabled = true;
    parts.csv.addEventListener('click', function () { save(new Blob([csvOf()], { type: 'text/csv;charset=utf-8' }), [CLIENT, t('file'), 'demo'].filter(Boolean).join('-') + '.csv'); });
    parts.demo = el('p', 'calli__demo');
    [parts.side, parts.sideTitle, parts.sideText, parts.matches, parts.tally, list, parts.csv, parts.demo].forEach(function (n) { side.appendChild(n); });
  }

  function words() {
    parts.t1.textContent = tr(D.title)[0] || '';
    parts.t2.textContent = tr(D.title)[1] || '';
    parts.sub.textContent = t('sub');
    parts.back.textContent = t('back');
    parts.you.textContent = t('you');
    parts.fname.placeholder = t('name'); parts.fname.setAttribute('aria-label', t('name'));
    parts.fcontact.placeholder = t('contact'); parts.fcontact.setAttribute('aria-label', t('contact'));
    parts.consent.textContent = t('consent');
    parts.sendText.textContent = t('send');
    parts.againText.textContent = t('again');
    parts.side.textContent = t('side');
    parts.sideTitle.textContent = t('sideTitle');
    parts.sideText.textContent = t('sideText');
    parts.matches.textContent = t('matches');
    parts.leadsHead.textContent = t('leads');
    parts.none.textContent = t('none');
    parts.csv.textContent = t('csv');
    parts.demo.textContent = t('demo');
    if (parts.note._said) say(parts.note._said.key, parts.note._said.vars, parts.note._said.kind);
  }

  function ask() {
    var n = D.questions.length, q = D.questions[state.step];
    parts.card.hidden = false;
    parts.result.hidden = true;
    parts.count.textContent = t('count', { i: state.step + 1, n: n });
    Array.prototype.forEach.call(parts.bar.children, function (b, i) { b.className = i < state.step ? 'is-done' : i === state.step ? 'is-now' : ''; });
    parts.q.textContent = tr(q.q);
    parts.answers.textContent = '';
    q.a.forEach(function (a, i) {
      var b = el('button', 'quiz__a');
      b.type = 'button';
      b.appendChild(el('b', null, 'ABCD'.charAt(i)));
      b.appendChild(el('span', null, tr(a.t)));
      b.addEventListener('click', function () { choose(i); });
      parts.answers.appendChild(b);
    });
    parts.back.hidden = state.step === 0;
    parts.card.classList.remove('is-in');
    void parts.card.offsetWidth;
    parts.card.classList.add('is-in');
  }

  function choose(i) {
    state.answers[state.step] = i;
    if (state.step < D.questions.length - 1) { state.step++; ask(); return; }
    state.model = match(state.answers);
    state.tally[state.model] = (state.tally[state.model] || 0) + 1;
    showResult();
    showTally(state.model);
  }

  // the model with the most points; a tie goes to the model the answers about what matters, then who rides, then the weekend favour
  var TIE = [2, 1, 0, 3, 4];
  function match(answers) {
    var sc = {};
    D.order.forEach(function (id) { sc[id] = 0; });
    answers.forEach(function (a, qi) { var s = D.questions[qi].a[a].s; Object.keys(s).forEach(function (id) { if (id in sc) sc[id] += s[id]; }); });
    var top = Math.max.apply(null, D.order.map(function (id) { return sc[id]; }));
    var cand = D.order.filter(function (id) { return sc[id] === top; });
    for (var k = 0; k < TIE.length && cand.length > 1; k++) {
      var qi = TIE[k];
      if (qi >= answers.length) continue;
      var s = D.questions[qi].a[answers[qi]].s, best = Math.max.apply(null, cand.map(function (id) { return s[id] || 0; }));
      var c2 = cand.filter(function (id) { return (s[id] || 0) === best; });
      if (c2.length < cand.length) cand = c2;
    }
    return cand[0];
  }

  function showResult() {
    var m = D.models[state.model];
    parts.card.hidden = true;
    parts.result.hidden = false;
    parts.img.src = m.img;
    parts.img.alt = m.name;
    parts.name.textContent = m.name;
    parts.persona.textContent = tr(m.persona);
    parts.kind.textContent = tr(m.kind);
    parts.line.textContent = tr(m.line);
    parts.motto.textContent = m.motto ? (lang === 'fr' ? '« ' + m.motto + ' »' : '“' + m.motto + '”') + ' — ' + CLIENT : '';
    parts.motto.hidden = !m.motto;
    parts.ask.textContent = t('ask', { model: m.name });
    parts.form.classList.remove('is-sent');
    parts.send.disabled = false;
    say('');
    parts.result.classList.remove('is-in');
    void parts.result.offsetWidth;
    parts.result.classList.add('is-in');
  }

  function showTally(fresh) {
    var max = Math.max.apply(null, [1].concat(D.order.map(function (id) { return state.tally[id] || 0; })));
    Array.prototype.forEach.call(parts.tally.children, function (li) {
      var id = li.getAttribute('data-model'), n = state.tally[id] || 0;
      li.querySelector('i').style.width = (n / max * 100) + '%';
      li.querySelector('em').textContent = n;
      li.classList.toggle('is-fresh', id === fresh);
    });
  }

  function say(key, vars, kind) {
    parts.note._said = key ? { key: key, vars: vars, kind: kind } : null;
    parts.note.textContent = key ? t(key, vars) : '';
    parts.note.classList.toggle('is-error', kind === 'error');
    parts.note.classList.toggle('is-done', kind === 'done');
  }

  function submit(e) {
    e.preventDefault();
    if (parts.form.classList.contains('is-sent')) return;
    var name = parts.fname.value.trim().replace(/\s+/g, ' '), contact = parts.fcontact.value.trim();
    if (!name) { say('noName', null, 'error'); parts.fname.focus(); return; }
    if (!contact) { say('noContact', null, 'error'); parts.fcontact.focus(); return; }
    var mail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact), phone = /^\+?[\d\s.\-()]{8,20}$/.test(contact) && contact.replace(/\D/g, '').length >= 8;
    if (!mail && !phone) { say('badContact', null, 'error'); parts.fcontact.focus(); return; }
    var lead = { name: name.slice(0, 40), contact: contact, model: D.models[state.model].name, consent: parts.agree.checked, answers: state.answers.slice(), at: new Date() };
    parts.send.disabled = true;
    deliver(lead).then(function () {
      state.leads = state.leads.filter(function (l) { return l.contact.toLowerCase() !== lead.contact.toLowerCase(); });
      state.leads.unshift(lead);
      showLeads(true);
      parts.form.classList.add('is-sent');
      say('sent', { model: lead.model }, 'done');
    }, function () { parts.send.disabled = false; });
  }

  function showLeads(fresh) {
    parts.rows.textContent = '';
    state.leads.slice(0, SHOWN).forEach(function (l, i) {
      var li = el('li'), who = el('b', null, l.name + ' · ' + l.model), where = el('span', null, l.contact), tag = el('i', l.consent ? '' : 'is-no', t(l.consent ? 'agree' : 'noagree'));
      if (i || !fresh) li.style.animation = 'none';
      li.appendChild(who); li.appendChild(where); li.appendChild(tag);
      parts.rows.appendChild(li);
    });
    parts.none.hidden = state.leads.length > 0;
    parts.leadsCount.textContent = state.leads.length;
    parts.csv.disabled = !state.leads.length;
  }

  function restart() {
    state.step = 0;
    state.answers = [];
    state.model = '';
    parts.fname.value = '';
    parts.fcontact.value = '';
    parts.agree.checked = false;
    say('');
    ask();
    try { parts.q.focus({ preventScroll: true }); } catch (e) {}
  }

  function csvOf() {
    var z = function (v) { return (v < 10 ? '0' : '') + v; };
    var when = function (d) { return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
    var cell = function (v) { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = '\'' + v; return '"' + v.replace(/"/g, '""') + '"'; };    // never a formula
    var lines = [t('head')].concat(state.leads.slice().reverse().map(function (l) { return [l.name, l.contact, l.model, t(l.consent ? 'yes' : 'no'), when(l.at)]; }));
    return '﻿' + lines.map(function (l) { return l.map(cell).join(';'); }).join('\r\n') + '\r\n';
  }
  function save(blob, name) {
    var url = URL.createObjectURL(blob), a = doc.createElement('a');
    a.href = url; a.download = name;
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }

  root.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && /^(input)$/i.test(e.target.tagName)) e.target.blur();      // the keyboard goes back to the presentation
    if (!parts.card || parts.card.hidden || /^(input)$/i.test(e.target.tagName)) return;
    var k = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[e.key.toLowerCase()];
    if (k != null && D.questions[state.step].a[k]) { e.preventDefault(); e.stopPropagation(); choose(k); }
  });

  // the quiz arrives with the presentation's descriptions
  function start(data) {
    if (D || !data || !data.quiz || !data.quiz.questions) return;
    D = data.quiz;
    D.order.forEach(function (id) { state.tally[id] = 0; var img = new Image(); img.src = D.models[id].img; });     // the pictures are ready before the result
    build();
    words();
    ask();
    showTally('');
    showLeads(false);
    window.BEN_QUIZ = {
      data: function () { return D; },
      match: match,
      state: function () { return { step: state.step, answers: state.answers.slice(), model: state.model, tally: JSON.parse(JSON.stringify(state.tally)), leads: state.leads.length }; },
      csv: csvOf
    };
    doc.dispatchEvent(new CustomEvent('ben:live-ready'));
  }
  doc.addEventListener('ben:data', function (e) { start(e.detail); });
  if (window.BEN_DECK_DATA) start(window.BEN_DECK_DATA);

  doc.addEventListener('ben:lang', function (e) {
    lang = e.detail === 'en' ? 'en' : 'fr';
    if (!D) return;
    words();
    if (!parts.result.hidden && state.model) {
      var m = D.models[state.model];
      parts.persona.textContent = tr(m.persona); parts.kind.textContent = tr(m.kind); parts.line.textContent = tr(m.line);
      parts.ask.textContent = t('ask', { model: m.name });
      if (m.motto) parts.motto.textContent = (lang === 'fr' ? '« ' + m.motto + ' »' : '“' + m.motto + '”') + ' — ' + CLIENT;
    } else ask();
    showLeads(false);
  });
})();
