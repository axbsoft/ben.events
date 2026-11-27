/* benevents agency — the registration demo (/registration-demo): register a guest, see their badge with its QR code,
   check them in at the door (by name, by code, or by scanning the badge where the browser reads QR codes), download
   the list. An imaginary event: the guests live in this browser only (localStorage "ben-regdemo"), nothing is sent.
   Its words are in the page (<script id="reg-words" type="application/json">), from tools/site/registration.mjs.
   Needs assets/js/qrcode.js (the QR codes). */
(function () {
  'use strict';
  var root = document.querySelector('[data-reg]');
  if (!root) return;
  var W = JSON.parse(document.getElementById('reg-words').textContent);
  var KEY = 'ben-regdemo', EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var guests = [], current = null;

  function load() { try { guests = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { guests = []; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(guests)); } catch (e) {} }
  function code() {
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', a = new Uint8Array(5), out = '';
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (var i = 0; i < a.length; i++) out += abc[a[i] % abc.length];
    return 'BE-' + out;
  }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  var time = function (t) { return new Date(t).toLocaleTimeString(document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-GB', { hour: '2-digit', minute: '2-digit' }); };

  /* ---------- the three steps ---------- */
  var tabs = root.querySelectorAll('[data-step-btn]'), panels = root.querySelectorAll('[data-step]');
  function step(n) {
    [].forEach.call(tabs, function (t) { var on = t.getAttribute('data-step-btn') === String(n); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    [].forEach.call(panels, function (p) { p.hidden = p.getAttribute('data-step') !== String(n); });
    if (n === 2) drawBadge();
    if (n === 3) drawDoor();
  }
  [].forEach.call(tabs, function (t) {
    t.addEventListener('click', function () { step(+t.getAttribute('data-step-btn')); });
    t.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var n = +t.getAttribute('data-step-btn') + (e.key === 'ArrowRight' ? 1 : -1);
      n = n < 1 ? 3 : n > 3 ? 1 : n;
      step(n); root.querySelector('[data-step-btn="' + n + '"]').focus();
    });
  });

  /* ---------- 1. the registration ---------- */
  var form = $('.reg__form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, g = { first: f.first.value.trim(), last: f.last.value.trim(), company: f.company.value.trim(), role: f.role.value.trim(), email: f.email.value.trim(), gala: f.gala.checked };
    var note = $('.reg__note', form);
    if (!g.first || !g.last || !EMAIL.test(g.email)) { note.textContent = W.form.missing; note.classList.add('is-error'); return; }
    note.textContent = ''; note.classList.remove('is-error');
    g.code = code(); g.at = Date.now();
    guests.push(g); save();
    current = g;
    form.reset();
    if (window.benCount) window.benCount('regdemo_register');
    step(2);
  });

  /* ---------- 2. the badge ---------- */
  function qrSvg(text) {
    var qr = qrcode(0, 'M'); qr.addData(text); qr.make();
    var n = qr.getModuleCount(), m = 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (qr.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    return '<svg viewBox="0 0 ' + (n + 2 * m) + ' ' + (n + 2 * m) + '" role="img" aria-label="QR code ' + text + '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#0a0a0c"/></svg>';
  }
  function drawBadge() {
    var box = $('.reg__badge-box');
    box.textContent = '';
    if (!current && guests.length) current = guests[guests.length - 1];
    $('.reg__badge-actions').hidden = !current;
    if (!current) { box.appendChild(el('p', 'reg__none', W.badge.none)); return; }
    var b = el('article', 'badge');
    var top = el('div', 'badge__top');
    top.appendChild(el('span', 'badge__event', W.event.name));
    top.appendChild(el('span', 'badge__when', W.event.when + ' · ' + W.event.where));
    b.appendChild(top);
    b.appendChild(el('p', 'badge__name', current.first + ' ' + current.last));
    if (current.role || current.company) b.appendChild(el('p', 'badge__co', [current.role, current.company].filter(Boolean).join(' · ')));
    var foot = el('div', 'badge__foot');
    var qr = el('div', 'badge__qr'); qr.innerHTML = qrSvg(current.code);
    var tags = el('div', 'badge__tags');
    tags.appendChild(el('span', 'badge__type', W.badge.guest));
    if (current.gala) tags.appendChild(el('span', 'badge__gala', W.badge.gala));
    tags.appendChild(el('span', 'badge__code', current.code));
    foot.appendChild(tags); foot.appendChild(qr);
    b.appendChild(foot);
    box.appendChild(b);
  }
  $('[data-print]').addEventListener('click', function () { document.documentElement.classList.add('reg-printing'); window.print(); setTimeout(function () { document.documentElement.classList.remove('reg-printing'); }, 500); });
  $('[data-another]').addEventListener('click', function () { current = null; step(1); form.elements.first.focus(); });
  $('[data-next]').addEventListener('click', function () { step(3); });

  /* ---------- 3. the check-in at the door ---------- */
  var search = $('.reg__search'), list = $('.reg__list'), say = $('.reg__say');
  function drawDoor() {
    var q = (search.value || '').trim().toLowerCase();
    $('[data-count="registered"]').textContent = guests.length;
    $('[data-count="arrived"]').textContent = guests.filter(function (g) { return g.in; }).length;
    list.textContent = '';
    var shown = guests.slice().reverse().filter(function (g) { return !q || (g.first + ' ' + g.last + ' ' + (g.company || '') + ' ' + g.code).toLowerCase().indexOf(q) >= 0; });
    if (!guests.length) { list.appendChild(el('li', 'reg__empty', W.door.empty)); return; }
    shown.forEach(function (g) {
      var li = el('li', 'reg__row' + (g.in ? ' is-in' : ''));
      var who = el('div', 'reg__who');
      who.appendChild(el('b', null, g.first + ' ' + g.last));
      who.appendChild(el('span', null, [g.company, g.code].filter(Boolean).join(' · ')));
      li.appendChild(who);
      if (g.in) li.appendChild(el('span', 'reg__in', W.door.arrivedAt + ' ' + time(g.in)));
      else {
        var btn = el('button', 'btn btn--ghost btn--sm', W.door.checkIn); btn.type = 'button';
        btn.addEventListener('click', function () { checkIn(g); });
        li.appendChild(btn);
      }
      list.appendChild(li);
    });
  }
  function checkIn(g) {
    if (g.in) { tell(g.first + ' ' + g.last + ' ' + W.door.already + ' ' + time(g.in)); return; }
    g.in = Date.now(); save();
    tell(W.door.welcome + ', ' + g.first + ' ' + g.last + '.');
    if (window.benCount) window.benCount('regdemo_checkin');
    drawDoor();
  }
  function tell(t) { say.textContent = t; say.classList.remove('is-on'); void say.offsetWidth; say.classList.add('is-on'); }
  search.addEventListener('input', drawDoor);
  search.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var q = search.value.trim().toUpperCase(), g = guests.filter(function (x) { return x.code === q; })[0];
    if (g) { checkIn(g); search.value = ''; drawDoor(); }
  });
  $('[data-samples]').addEventListener('click', function () {
    JSON.parse(document.getElementById('reg-samples').textContent).forEach(function (s) {
      if (guests.some(function (g) { return g.first === s.first && g.last === s.last; })) return;
      guests.push(Object.assign({}, s, { email: '', code: code(), at: Date.now() }));
    });
    save(); drawDoor();
  });
  $('[data-reset]').addEventListener('click', function () { guests = []; current = null; save(); drawDoor(); say.textContent = ''; });
  $('[data-csv]').addEventListener('click', function () {
    var cell = function (v) { v = String(v == null ? '' : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var rows = [['code', 'first_name', 'last_name', 'company', 'job_title', 'email', 'gala_dinner', 'registered', 'arrived']].concat(guests.map(function (g) {
      return [g.code, g.first, g.last, g.company, g.role, g.email, g.gala ? 'yes' : 'no', new Date(g.at).toISOString(), g.in ? new Date(g.in).toISOString() : ''];
    }));
    var blob = new Blob(['﻿' + rows.map(function (r) { return r.map(cell).join(','); }).join('\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'attendance-demo.csv';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });

  // scanning a badge: where the browser reads QR codes with the camera (BarcodeDetector); elsewhere, the search does it
  var scanBtn = $('[data-scan]'), scanBox = document.querySelector('.reg__scan'), video = scanBox && scanBox.querySelector('video'), stream = null, timer = 0;
  var canScan = 'BarcodeDetector' in window && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
  if (!canScan) { scanBtn.disabled = true; scanBtn.title = W.door.noScan; scanBtn.setAttribute('aria-describedby', 'reg-noscan'); $('#reg-noscan').hidden = false; }
  function stopScan() { clearInterval(timer); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; if (scanBox) scanBox.hidden = true; }
  scanBtn.addEventListener('click', function () {
    if (!canScan) return;
    var detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (s) {
      stream = s; video.srcObject = s; scanBox.hidden = false; video.play();
      timer = setInterval(function () {
        detector.detect(video).then(function (codes) {
          if (!codes.length) return;
          var raw = codes[0].rawValue, g = guests.filter(function (x) { return x.code === raw; })[0];
          stopScan();
          if (g) checkIn(g); else tell(W.door.unknown);
        }).catch(function () {});
      }, 300);
    }).catch(function () { tell(W.door.noScan); });
  });
  if (scanBox) scanBox.querySelector('[data-scan-close]').addEventListener('click', stopScan);

  load();
  step(1);
})();
