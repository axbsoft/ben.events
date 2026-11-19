/* benevents agency — interactions. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SITE SETTINGS — edit these two blocks.
     ------------------------------------------------------------------ */

  // Address that receives enquiries from the contact form.
  var CONTACT_EMAIL = 'contact@ben.events';

  // Photos and logo. Put files in assets/img/ and set the path here.
  // Any slot left empty keeps its coloured placeholder artwork.
  // A slot can also be ['path', 'position'] to choose which part of the photo
  // stays in view when it is cropped (any CSS background-position).
  // The photo wall is listed in index.html, not here.
  var MEDIA = {
    logo: '',        // e.g. 'assets/img/logo-white.svg' (replaces the drawn wordmark)
    hero: 'assets/img/gala-dinner.jpg',
    about1: 'assets/img/stage-runway.jpg',
    about2: 'assets/img/control-desk-ballroom.jpg',
    service1: 'assets/img/conference-opening.jpg',
    service2: 'assets/img/graduation-ceremony.jpg',
    service3: 'assets/img/reception-golden-spheres.jpg',
    service4: 'assets/img/production-desk.jpg',
    statement: ['assets/img/light-beams.jpg', 'center 22%'],
    gallery1: ['assets/img/mta-cycle-meeting.jpg', 'center 30%'],
    gallery2: 'assets/img/tech-fest-maroc.jpg',
    gallery3: 'assets/img/led-stage-set.jpg',
    gallery4: 'assets/img/awards-celebration.jpg',
    gallery5: 'assets/img/gsk-day.jpg',
    gallery6: 'assets/img/uae-morocco-forum.jpg',
    gallery7: ['assets/img/volvo-built-on-trust.jpg', 'center 25%'],
    gallery8: ['assets/img/fanzone-can-2025.jpg', 'center 30%'],
    gallery9: 'assets/img/forum-panel.jpg',
    gallery10: 'assets/img/leo-regional-conference.jpg',
    gallery11: ['assets/img/onco-days.jpg', 'center 30%'],
    gallery12: 'assets/img/showroom-reception.jpg'
  };
  /* ------------------------------------------------------------------ */

  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var hasIO = 'IntersectionObserver' in window;

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
  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- Language ---------- */
  var I18N = window.BEN_I18N || { fr: {}, meta: {}, js: {} };
  var en = {}, enPh = {}, enAlt = {};
  $$('[data-i18n]').forEach(function (n) { var k = n.getAttribute('data-i18n'); if (!(k in en)) en[k] = n.textContent; });
  $$('[data-i18n-ph]').forEach(function (n) { enPh[n.getAttribute('data-i18n-ph')] = n.getAttribute('placeholder'); });
  $$('[data-i18n-alt]').forEach(function (n) { enAlt[n.getAttribute('data-i18n-alt')] = n.getAttribute('alt'); });
  var lang = 'en';
  function ui() { return I18N.js[lang] || I18N.js.en || {}; }

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
    $$('[data-i18n-alt]').forEach(function (n) {
      var k = n.getAttribute('data-i18n-alt');
      n.setAttribute('alt', dict[k] != null ? dict[k] : enAlt[k]);
    });
    labelViewer();
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

  /* ---------- Services: expanding cards ---------- */
  var rows = $$('.srv__row');
  function activate(row) { rows.forEach(function (r) { r.classList.toggle('is-active', r === row); }); }
  rows.forEach(function (r) {
    r.addEventListener('mouseenter', function () { if (fine) activate(r); });
    r.addEventListener('click', function () { activate(r); });
    r.addEventListener('focus', function () { activate(r); });
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
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleMenu(false); });

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
  var gallery = $('.gallery'), track = $('.gallery__track');
  var parallax = $$('[data-parallax]');
  var lastY = 0, vh = window.innerHeight, maxX = 0, desktop = false, ticking = false;
  var GALLERY_PACE = 0.8;   // page scroll needed for each pixel the portfolio slides sideways

  function measure() {
    vh = window.innerHeight;
    desktop = window.innerWidth > 900 && !reduced;
    layoutWall();
    if (gallery) {
      if (desktop) {
        maxX = Math.max(0, track.scrollWidth - window.innerWidth);
        gallery.style.height = Math.round(vh + maxX * GALLERY_PACE) + 'px';
        gallery.classList.add('is-pinned');
      } else {
        gallery.style.height = ''; track.style.transform = '';
        gallery.classList.remove('is-pinned');
      }
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
  if (track) track.addEventListener('scroll', paintGalleryRest, { passive: true });   // phones: the strip is swiped
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
      var hit = e.target.closest && e.target.closest('a, button, .srv__row, .card');
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
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        var was = running; running = es[0].isIntersecting;
        if (running && !was) requestAnimationFrame(draw);
      }).observe(hero);
    }
    size(); requestAnimationFrame(draw);
  }

  /* ---------- Photo viewer: portfolio cards and wall photos open full size ---------- */
  var zoomEls = $$('[data-zoom]');
  var lb = null, lbImg, lbCap, lbCount, lbBtns = [], lbIndex = -1, lbReturn = null;

  function lbItem(i) {
    var el = zoomEls[i], key = el.getAttribute('data-zoom');
    if (key) {                                     // portfolio card
      var fig = el.closest('figure'), m = mediaOf(key);
      return { src: m ? m.src : '', caption: $('b', fig).textContent + ' — ' + $('figcaption span', fig).textContent };
    }
    return { src: el.getAttribute('data-full'), caption: $('img', el).getAttribute('alt') };   // wall photo
  }

  function labelViewer() {
    var s = ui().viewer || {};
    zoomEls.forEach(function (el) {
      if (el.getAttribute('data-zoom')) el.setAttribute('aria-label', s.open + (lang === 'fr' ? ' : ' : ': ') + $('b', el.closest('figure')).textContent);
    });
    if (!lb) return;
    lb.setAttribute('aria-label', s.label);
    lbBtns[0].setAttribute('aria-label', s.close);
    lbBtns[1].setAttribute('aria-label', s.prev);
    lbBtns[2].setAttribute('aria-label', s.next);
    if (lbIndex > -1) lbShow(lbIndex);
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
    var n = zoomEls.length, it;
    lbIndex = ((i % n) + n) % n;
    it = lbItem(lbIndex);
    if (lbImg.getAttribute('src') !== it.src) { lb.classList.add('is-loading'); lbImg.src = it.src; }
    lbImg.alt = it.caption;
    lbCap.textContent = it.caption;
    lbCount.textContent = (lbIndex + 1) + ' / ' + n;
    [lbIndex + 1, lbIndex - 1].forEach(function (j) {   // warm up the neighbours
      var next = lbItem(((j % n) + n) % n);
      if (next.src) { new Image().src = next.src; }
    });
  }

  function lbOpen(i, opener) {
    if (!zoomEls.length) return;
    if (!lb) lbBuild();
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

  zoomEls.forEach(function (el, i) { el.addEventListener('click', function () { lbOpen(i, el); }); });
  $$('[data-zoom-all]').forEach(function (b) {
    b.addEventListener('click', function () { lbOpen(Math.max(0, zoomEls.indexOf(tiles[0])), b); });
  });
  doc.addEventListener('keydown', function (e) {
    if (lbIndex < 0) return;
    if (e.key === 'Escape') lbClose();
    else if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    else if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    else if (e.key === 'Tab') {                    // keep the keyboard inside the viewer
      var at = lbBtns.indexOf(doc.activeElement), to = at + (e.shiftKey ? -1 : 1);
      e.preventDefault();
      lbBtns[(to + lbBtns.length) % lbBtns.length].focus();
    }
  });

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
