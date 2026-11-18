/* Ben Events — interactions. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SITE SETTINGS — edit these two blocks.
     ------------------------------------------------------------------ */

  // Address that receives enquiries from the contact form.
  var CONTACT_EMAIL = 'contact@ben.events';

  // Photos and logo. Put files in assets/img/ and set the path here.
  // Any slot left empty keeps its gold placeholder artwork.
  var MEDIA = {
    logo: '',        // e.g. 'assets/img/logo.svg' (replaces the text wordmark)
    hero: '',        // e.g. 'assets/img/hero.jpg' (wide, 2400px+)
    about1: '',      // tall portrait
    about2: '',      // small landscape
    service1: '', service2: '', service3: '', service4: '',
    statement: '',   // wide background
    gallery1: '', gallery2: '', gallery3: '', gallery4: '', gallery5: '', gallery6: ''
  };

  /* ------------------------------------------------------------------ */

  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- Media slots ---------- */
  $$('[data-img]').forEach(function (el) {
    var src = MEDIA[el.getAttribute('data-img')];
    if (!src) return;
    if (el.tagName === 'IMG') {
      el.src = src; el.hidden = false;
      var t = el.parentNode.querySelector('.logo__text'); if (t) t.hidden = true;
    } else {
      el.style.backgroundImage = 'url("' + src + '")';
      el.classList.add('has-img');
    }
  });

  /* ---------- Contact email ---------- */
  $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + CONTACT_EMAIL; a.textContent = CONTACT_EMAIL; });
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Language ---------- */
  var I18N = window.BEN_I18N || { fr: {}, meta: {}, js: {} };
  var en = {}, enPh = {};
  $$('[data-i18n]').forEach(function (n) { var k = n.getAttribute('data-i18n'); if (!(k in en)) en[k] = n.textContent; });
  $$('[data-i18n-ph]').forEach(function (n) { enPh[n.getAttribute('data-i18n-ph')] = n.getAttribute('placeholder'); });
  var lang = 'en';

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
    root.lang = lang;
    var m = I18N.meta[lang];
    if (m) { doc.title = m.title; var d = $('meta[name="description"]'); if (d) d.content = m.desc; }
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    if (save) { try { localStorage.setItem('ben-lang', lang); } catch (e) {} }
    measure();
  }

  var stored = null;
  try { stored = localStorage.getItem('ben-lang'); } catch (e) {}
  var qs = /[?&]lang=(en|fr)\b/.exec(location.search);
  var initial = (qs && qs[1]) || stored || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en');

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
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (n) { n.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in'); io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (n, i) {
      // stagger siblings that reveal together
      var sibs = n.parentNode ? $$(':scope > [data-reveal]', n.parentNode) : [];
      n.style.setProperty('--d', (Math.max(0, sibs.indexOf(n)) * 90) + 'ms');
      io.observe(n);
    });
  }

  /* ---------- Menu ---------- */
  var burger = $('.burger'), menu = $('.menu');
  function toggleMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
  }
  burger.addEventListener('click', function () { toggleMenu(!body.classList.contains('menu-open')); });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- Scroll-driven: nav, progress, parallax, gallery ---------- */
  var nav = $('.nav'), prog = $('.progress b');
  var gallery = $('.gallery'), track = $('.gallery__track');
  var parallax = $$('[data-parallax]');
  var lastY = 0, vh = window.innerHeight, maxX = 0, desktop = false, ticking = false;

  function measure() {
    vh = window.innerHeight;
    desktop = window.innerWidth > 900 && !reduced;
    if (!gallery) return;
    if (desktop) {
      maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      gallery.style.height = (vh + maxX) + 'px';
      gallery.classList.add('is-pinned');
    } else {
      gallery.style.height = ''; track.style.transform = '';
      gallery.classList.remove('is-pinned');
    }
    update();
  }

  function update() {
    ticking = false;
    var y = window.pageYOffset;
    var max = root.scrollHeight - vh;
    if (prog) prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';

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

    if (desktop && gallery) {
      var gr = gallery.getBoundingClientRect();
      var p = clamp(-gr.top / (gr.height - vh || 1), 0, 1);
      track.style.transform = 'translate3d(' + (-p * maxX).toFixed(1) + 'px,0,0)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);

  /* ---------- Cursor, magnetic buttons, tilt (mouse only) ---------- */
  if (fine && !reduced) {
    body.classList.add('has-cursor', 'cursor-out');
    var dot = $('.cursor__dot'), ring = $('.cursor__ring');
    var mx = -100, my = -100, rx = -100, ry = -100;
    doc.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (rx < -50) { rx = mx; ry = my; body.classList.remove('cursor-out'); }
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }, { passive: true });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      requestAnimationFrame(loop);
    })();
    doc.addEventListener('mouseover', function (e) {
      var hit = e.target.closest && e.target.closest('a, button, .srv__row, .card, input, textarea, select');
      body.classList.toggle('cursor-hover', !!hit);
    });
    doc.addEventListener('mouseleave', function () { body.classList.add('cursor-out'); });
    doc.addEventListener('mouseenter', function () { body.classList.remove('cursor-out'); });

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

  /* ---------- Hero canvas: drifting gold light ---------- */
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
        g.addColorStop(0, 'rgba(240,214,160,' + a.toFixed(3) + ')');
        g.addColorStop(0.25, 'rgba(201,169,106,' + (a * 0.45).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(201,169,106,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 5, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    hero.addEventListener('mousemove', function (e) { px = e.clientX / W; py = e.clientY / H; }, { passive: true });
    window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var was = running; running = es[0].isIntersecting;
        if (running && !was) requestAnimationFrame(draw);
      }).observe(hero);
    }
    size(); requestAnimationFrame(draw);
  }

  /* ---------- Contact form (opens the visitor's mail app) ---------- */
  var form = $('.form'), note = $('.form__note');
  if (form) {
    $$('input, textarea, select', form).forEach(function (f) {
      var sync = function () { f.parentNode.classList.toggle('is-filled', !!f.value); };
      f.addEventListener('input', sync); f.addEventListener('change', sync); sync();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = I18N.js[lang] || I18N.js.en, v = function (n) { return (form.elements[n].value || '').trim(); };
      var ok = v('name') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) && v('message');
      note.classList.toggle('is-error', !ok);
      if (!ok) { note.textContent = s.required; return; }
      var L = s.labels, lines = [
        L.name + ': ' + v('name'), L.email + ': ' + v('email'), L.phone + ': ' + v('phone'),
        L.type + ': ' + v('type'), L.date + ': ' + v('date'), L.guests + ': ' + v('guests'), '', v('message')
      ];
      note.textContent = s.opening;
      location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(s.subject + ' — ' + v('name')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }

  /* ---------- Go ---------- */
  setLang(initial, false);
  measure();
})();
