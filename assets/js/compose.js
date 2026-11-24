/* benevents agency — "Compose your event", on the home page (#compose).

   The visitor chooses the kind of event, the number of guests and the city. The card beside shows a real
   photo of a similar event we produced (from projects.js, with a link to that project), says the brief in one
   sentence, and sends it on WhatsApp in one tap, or fills in the contact form with it.

   The photos shown for each kind of event are listed below (TYPES): [id of the project, number of the photo,
   from 0]. The pages "How we run …" are the pages of the kinds of events (tools/site/events.mjs, their addresses
   are written into index.html by tools/site/build.mjs) or of a service (services.js).

   Needs projects.js and services.js, and main.js before it (the WhatsApp number, the language). */
(function () {
  'use strict';

  var TYPES = {
    seminar: { page: 'event:seminar', form: 0, shots: [['mta-cycle-meeting', 0], ['leo-regional-conference', 0], ['tech-fest-maroc', 0], ['gsk-day', 0]] },
    convention: { page: 'event:convention', form: 0, shots: [['rma-convention', 0], ['rma-convention', 1], ['onco-days', 0], ['leo-regional-conference', 1]] },
    conference: { page: 'service:conferences', form: 0, shots: [['wexchange-forum', 0], ['femmes-en-jeu', 0], ['uae-morocco-forum', 0], ['gsk-day', 1]] },
    gala: { page: 'event:gala', form: 1, shots: [['mta-cycle-meeting', 2], ['rma-convention', 0], ['marrakech-cocktail', 0], ['onco-days', 0]] },
    ceremony: { page: 'service:ceremonies', form: 1, shots: [['a-chance-to-reset', 0], ['sustainable-innovation-fest', 0], ['a-chance-to-reset', 2]] },
    launch: { page: 'event:launch', form: 2, shots: [['volvo-built-on-trust', 0], ['cupra-open-day', 0], ['gillette-watch-party', 0], ['centrale-automobile-cherifienne', 0]] },
    openday: { page: 'event:openday', form: 2, shots: [['cupra-open-day', 0], ['cupra-open-day', 7], ['cupra-open-day', 3], ['centrale-automobile-cherifienne', 0]] }
  };
  var CITY = {
    en: { casablanca: 'Casablanca', rabat: 'Rabat', marrakech: 'Marrakech', tangier: 'Tangier', other: '' },
    fr: { casablanca: 'Casablanca', rabat: 'Rabat', marrakech: 'Marrakech', tangier: 'Tanger', other: '' }
  };
  var WORDS = {
    en: {
      a: { seminar: 'a seminar', convention: 'a convention', conference: 'a conference', gala: 'a gala evening', ceremony: 'a ceremony', launch: 'a product launch', openday: 'an open day' },
      where: function (c) { return c ? 'in ' + c : 'in Morocco'; },
      sum: function (a, n, w) { return a.charAt(0).toUpperCase() + a.slice(1) + ' for ' + n + ' guests ' + w + '.'; },
      wa: function (a, n, w) { return 'Hello benevents, I am preparing ' + a + ' for about ' + n + ' guests ' + w + '. Could we talk about it?'; },
      how: { seminar: 'How we run a seminar', convention: 'How we stage a convention', conference: 'Our conferences and conventions', gala: 'How we run a gala evening', ceremony: 'Our ceremonies and gala evenings', launch: 'How we run a launch', openday: 'How we run an open day' },
      photo: function (i, n) { return 'Photo ' + i + ' of ' + n; },
      alt: function (t) { return 'Photo of the event: ' + t; },
      many: '1,000+'
    },
    fr: {
      a: { seminar: 'un séminaire', convention: 'une convention', conference: 'une conférence', gala: 'une soirée de gala', ceremony: 'une cérémonie', launch: 'un lancement de produit', openday: 'une journée portes ouvertes' },
      where: function (c) { return c ? 'à ' + c : 'au Maroc'; },
      sum: function (a, n, w) { return a.charAt(0).toUpperCase() + a.slice(1) + ' pour ' + n + ' invités ' + w + '.'; },
      wa: function (a, n, w) { return 'Bonjour benevents, je prépare ' + a + ' pour environ ' + n + ' invités ' + w + '. Pouvons-nous en parler ?'; },
      how: { seminar: 'Comment nous menons un séminaire', convention: 'Comment nous mettons en scène une convention', conference: 'Nos conférences et conventions', gala: 'Comment nous menons une soirée de gala', ceremony: 'Nos cérémonies et soirées de gala', launch: 'Comment nous menons un lancement', openday: 'Comment nous menons une journée portes ouvertes' },
      photo: function (i, n) { return 'Photo ' + i + ' sur ' + n; },
      alt: function (t) { return 'Photo de l’événement : ' + t; },
      many: '1 000+'
    }
  };

  var box = document.getElementById('compose');
  if (!box) return;
  var $ = function (s) { return box.querySelector(s); };
  var projects = {};
  (window.BEN_PROJECTS || []).forEach(function (p) { projects[p.id] = p; });
  var services = {};
  (window.BEN_SERVICES || []).forEach(function (s) { services[s.id] = s; });
  var pages = window.BEN_EVENT_PAGES || {};
  var number = window.BEN_WHATSAPP || '';

  var range = $('.compose__range'), out = $('.compose__n'), photo = $('.compose__ph img'), seen = $('.compose__seen a'),
    dots = $('.compose__dots'), sum = $('.compose__sum'), wa = $('.compose__wa'), toForm = $('.compose__to-form'), page = $('.compose__page');
  var shot = 0;

  var lang = function () { return document.documentElement.lang === 'fr' ? 'fr' : 'en'; };
  var picked = function (name) { var r = box.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; };
  var title = function (p, l) { var t = p.title; return typeof t === 'string' ? t : (t[l] || t.en); };
  var guests = function (l) { var v = +range.value; return v >= +range.max ? WORDS[l].many : v.toLocaleString(l === 'fr' ? 'fr-FR' : 'en-US'); };
  var shots = function () {
    return (TYPES[picked('cp-type')] || TYPES.seminar).shots.filter(function (s) { return projects[s[0]] && projects[s[0]].photos[s[1]]; });
  };
  var pageOf = function (kind, l) {
    var v = kind.split(':');
    if (v[0] === 'event') return pages[v[1]] ? pages[v[1]][l] : '';
    var s = services[v[1]];
    return s ? (l === 'fr' ? '/fr/services/' : '/services/') + s.slug[l] : '';
  };

  function draw() {
    var l = lang(), w = WORDS[l], type = picked('cp-type') || 'seminar', t = TYPES[type], list = shots();
    if (shot >= list.length) shot = 0;
    var s = list[shot], p = s && projects[s[0]];
    if (p) {
      var ph = p.photos[s[1]];
      if (photo.getAttribute('src') !== ph[0]) {
        photo.src = ph[0];
        photo.width = ph[1];
        photo.height = ph[2];
      }
      photo.alt = w.alt(title(p, l));
      seen.textContent = title(p, l);
      seen.href = (l === 'fr' ? '/fr/realisations/' : '/projects/') + p.id;
      seen.setAttribute('data-project', p.id);
    }
    // one button per photo of this kind of event
    if (dots.children.length !== list.length) {
      dots.textContent = '';
      list.forEach(function (x, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.addEventListener('click', function () { shot = i; draw(); });
        dots.appendChild(b);
      });
    }
    [].forEach.call(dots.children, function (b, i) { b.setAttribute('aria-pressed', String(i === shot)); b.setAttribute('aria-label', w.photo(i + 1, list.length)); });
    var city = CITY[l][picked('cp-city')] || '', n = guests(l), a = w.a[type];
    out.textContent = n;
    sum.textContent = w.sum(a, n, w.where(city));
    wa.hidden = !number;
    if (number) wa.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(w.wa(a, n, w.where(city)));
    var href = pageOf(t.page, l);
    page.hidden = !href;
    if (href) { page.href = href; page.textContent = w.how[type]; }
  }

  box.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'cp-type') shot = 0;
    draw();
  });
  range.addEventListener('input', draw);
  document.addEventListener('ben:lang', draw);

  // "Or fill in the form": the form below gets the same brief, then the page goes there
  toForm.addEventListener('click', function () {
    var form = document.querySelector('#contact form');
    if (!form) return;
    var l = lang(), t = TYPES[picked('cp-type')] || TYPES.seminar;
    var set = function (f, v) { if (!f) return; f.value = v; f.dispatchEvent(new Event('change', { bubbles: true })); };
    var type = form.querySelector('select[name="type"]');
    if (type && type.options[t.form]) set(type, type.options[t.form].value);
    set(form.querySelector('input[name="guests"]'), +range.value >= +range.max ? '1000+' : range.value);
    set(form.querySelector('input[name="city"]'), CITY[l][picked('cp-city')] || '');
  });

  draw();
})();
