/* benevents agency — the access page of a client presentation where two countries meet (kgm.html: Korea and Morocco).
   The two flags of the title fly in from opposite sides of the screen, meet in the middle of the title and clink
   together (a burst of colour, a ring of light), then each glides to its place beside its word. Afterwards they sway
   towards each other, and now and then hop together with a little sparkle, until the presentation opens.
   With reduced motion the flags are simply there. Vanilla JS (Web Animations), no dependencies. */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var h1 = doc.querySelector('.gate__title');
  if (!h1) return;
  var flags = h1.querySelectorAll('.flag');
  if (flags.length < 2) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLOURS = ['#cd2e3a', '#0047a0', '#ffffff', '#c1272d', '#006233', '#f9b24e', '#00adb0', '#e94b5b'];
  var START = 1250, FLY = 2500, CLINK = .5, AGAIN = 8000;     // ms after the page opens; the flight; when they meet (share of the flight); the hops

  function done() { h1.classList.add('is-done'); }
  if (reduced || !Element.prototype.animate) { done(); return; }

  function box(el) {
    var r = el.getBoundingClientRect(), b = h1.getBoundingClientRect();
    return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  }
  // a burst of colour around a point of the title (px, from its top left corner)
  function burst(x, y, n, reach) {
    for (var i = 0; i < n; i++) {
      var p = doc.createElement('i'), a = Math.PI * 2 * i / n + Math.random() * .6, d = reach * (.55 + Math.random() * .75);
      p.className = 'meet__bit';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.setProperty('--r', Math.round(Math.random() * 540 - 270) + 'deg');
      p.style.background = COLOURS[i % COLOURS.length];
      h1.appendChild(p);
      setTimeout(function (q) { return function () { if (q.parentNode) q.parentNode.removeChild(q); }; }(p), 1500);
    }
  }
  function ring(x, y) {
    ['meet__ring', 'meet__flash'].forEach(function (cls) {
      var r = doc.createElement('i');
      r.className = cls;
      r.style.left = x + 'px';
      r.style.top = y + 'px';
      h1.appendChild(r);
      setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 1300);
    });
  }

  function fly() {
    var hb = h1.getBoundingClientRect(), W = window.innerWidth;
    var mx = h1.offsetWidth / 2, my = h1.offsetHeight * .48;            // where they meet: the middle of the title
    var ghosts = [];
    Array.prototype.forEach.call(flags, function (f, k) {
      var b = box(f), side = k === 0 ? -1 : 1, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      var g = doc.createElement('span');
      g.className = 'meet__fly';
      g.style.left = b.x + 'px';
      g.style.top = b.y + 'px';
      g.style.width = b.w + 'px';
      g.style.height = b.h + 'px';
      g.appendChild(f.cloneNode(true));
      h1.appendChild(g);
      ghosts.push(g);
      // from beyond its own side of the screen, to its half of the meeting point, a clink, then home
      var startX = side < 0 ? -hb.left - b.w * 2 - cx : (W - hb.left) + b.w * 2 - cx;
      var px = mx + side * b.w * .56 - cx, py = my - cy;
      var t = function (x, y, r, s) { return 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r + 'deg) scale(' + s + ')'; };
      g.animate([
        { transform: t(startX, py - b.h * 1.6, side * -40, .55), opacity: 0, offset: 0 },
        { opacity: 1, offset: .1 },
        { transform: t(px, py, side * -8, 1.45), offset: .42, easing: 'cubic-bezier(.5, 0, .5, 1)' },
        { transform: t(px - side * b.w * .14, py, side * 16, 1.55), offset: CLINK, easing: 'cubic-bezier(.2, .9, .3, 1)' },
        { transform: t(px + side * b.w * .05, py, side * -5, 1.45), offset: .6, easing: 'cubic-bezier(.65, 0, .35, 1)' },
        { transform: t(0, 0, 0, 1), opacity: 1, offset: 1 }
      ], { duration: FLY, easing: 'cubic-bezier(.33, .8, .3, 1)', fill: 'forwards' });
    });
    // the clink
    setTimeout(function () {
      var b = box(flags[0]);
      ring(mx, my);
      burst(mx, my, 34, b.h * 2.4);
      h1.classList.add('is-clink');
      setTimeout(function () { h1.classList.remove('is-clink'); }, 700);
    }, FLY * CLINK);
    // home: the real flags take over
    setTimeout(function () {
      done();
      ghosts.forEach(function (g) { if (g.parentNode) g.parentNode.removeChild(g); });
      var loop = setInterval(function () {
        if (body.classList.contains('is-open')) { clearInterval(loop); return; }
        h1.classList.remove('is-hop');
        void h1.offsetWidth;
        h1.classList.add('is-hop');
        setTimeout(function () {
          Array.prototype.forEach.call(flags, function (f) { var b = box(f); burst(b.x + b.w / 2, b.y + b.h / 2, 10, b.h * 1.3); });
        }, 330);
      }, AGAIN);
    }, FLY + 30);
  }
  setTimeout(fly, START);
})();
