/* benevents agency — the access page of a client presentation where two countries meet (kgm.html: Korea and Morocco).
   A festive welcome, never a clash: the two flags rise gently into place beside their words and wave in the breeze,
   each pops a little shower of confetti, like a party popper, that floats up and falls slowly; cherry-blossom petals
   and golden sparks of lantern light drift down the page until the presentation opens.
   With reduced motion the flags are simply there. Vanilla JS (Web Animations), no dependencies. */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var h1 = doc.querySelector('.gate__title');
  if (!h1) return;
  var gate = h1.closest('.gate') || body;
  var flags = h1.querySelectorAll('.flag');
  if (flags.length < 2) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !Element.prototype.animate) return;
  var COLOURS = ['#cd2e3a', '#0047a0', '#ffffff', '#c1272d', '#006233', '#f9b24e', '#00adb0', '#f48fb1'];
  var POP = [2350, 2550], PETALS = 1200, EVERY = 650, MOST = 16;      // ms: the poppers of the two flags; the first petal; between petals; petals at once

  function open() { return body.classList.contains('is-open'); }
  function box(el, inside) {
    var r = el.getBoundingClientRect(), b = inside.getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  }
  function gone(p) { if (p.parentNode) p.parentNode.removeChild(p); }

  // a party popper: confetti that floats up from the flag and falls slowly
  function popper(f) {
    var b = box(f, h1);
    for (var i = 0; i < 26; i++) {
      var p = doc.createElement('i'), round = i % 3 === 0;
      p.className = 'meet__bit' + (round ? ' is-round' : '');
      p.style.left = (b.x + b.w / 2) + 'px';
      p.style.top = (b.y + b.h * .3) + 'px';
      p.style.background = COLOURS[i % COLOURS.length];
      h1.appendChild(p);
      var dx = (Math.random() - .5) * b.w * 4.2, up = b.h * (1.4 + Math.random() * 1.6), down = b.h * (1.6 + Math.random() * 2.2), r = (Math.random() - .5) * 900;
      var a = p.animate([
        { transform: 'translate(0, 0) rotate(0deg) scale(.5)', opacity: 1, easing: 'cubic-bezier(.15, .7, .35, 1)' },
        { transform: 'translate(' + (dx * .55) + 'px, ' + (-up) + 'px) rotate(' + (r * .4) + 'deg) scale(1)', opacity: 1, offset: .32, easing: 'cubic-bezier(.45, 0, .75, .5)' },
        { transform: 'translate(' + dx + 'px, ' + down + 'px) rotate(' + r + 'deg) scale(.9)', opacity: 0 }
      ], { duration: 2200 + Math.random() * 1000, fill: 'forwards' });
      a.onfinish = function (q) { return function () { gone(q); }; }(p);
    }
  }

  // petals and golden sparks drifting down the page
  var falling = 0;
  function drift() {
    if (open() || falling >= MOST || doc.hidden) return;
    var W = gate.clientWidth, H = gate.clientHeight, spark = Math.random() < .3;
    var p = doc.createElement('i');
    p.className = spark ? 'meet__spark' : 'meet__petal';
    var x = Math.random() * W, sway = 40 + Math.random() * 90, dir = Math.random() < .5 ? -1 : 1, s = .7 + Math.random() * .7;
    p.style.left = x + 'px';
    p.style.top = '-24px';
    gate.appendChild(p);
    falling++;
    var steps = [], n = 6;
    for (var k = 0; k <= n; k++) {
      var t = k / n;
      steps.push({ transform: 'translate(' + (Math.sin(t * Math.PI * 2) * sway * dir) + 'px, ' + (t * (H + 60)) + 'px) rotate(' + (t * 300 * dir) + 'deg) scale(' + s + ')', opacity: k === 0 ? 0 : k === n ? 0 : spark ? .9 : .75 });
    }
    var a = p.animate(steps, { duration: (spark ? 9000 : 11000) + Math.random() * 5000, easing: 'linear', fill: 'forwards' });
    a.onfinish = function () { falling--; gone(p); };
  }

  POP.forEach(function (ms, k) { setTimeout(function () { if (!open()) popper(flags[k]); }, ms); });
  setTimeout(function () {
    drift();
    var loop = setInterval(function () { if (open()) { clearInterval(loop); return; } drift(); }, EVERY);
  }, PETALS);
})();
