/* benevents agency — the access page of a client presentation where two countries meet (kgm.html: Korea and Morocco).
   The two flags of the title fly in from opposite sides; a thread in the colours of both draws itself from one flag
   to the other, a spark runs along it, and where it arrives a burst of colour says that the two have met.
   Afterwards the flags sway towards each other and the spark goes back and forth now and then, until the
   presentation opens. With reduced motion, the thread is simply there. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var doc = document, body = doc.body;
  var h1 = doc.querySelector('.gate__title');
  if (!h1) return;
  var flags = h1.querySelectorAll('.flag');
  if (flags.length < 2) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var COLOURS = ['#cd2e3a', '#0047a0', '#ffffff', '#c1272d', '#006233', '#f9b24e', '#00adb0', '#e94b5b'];
  var LAND = 1950, DRAW = 1300, AGAIN = 7000;           // ms: the flags have landed; the thread draws; the spark comes back

  var svg = doc.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'meet');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<defs><linearGradient id="meet-colours" gradientUnits="userSpaceOnUse">' +
    '<stop offset="0" stop-color="#5b8cff"/><stop offset=".3" stop-color="#ff5f6a"/><stop offset=".72" stop-color="#e0343b"/><stop offset="1" stop-color="#1fae6f"/>' +
    '</linearGradient></defs><path class="meet__thread" pathLength="1"/><circle class="meet__spark" r="4.5"/>';
  h1.appendChild(svg);
  var thread = svg.querySelector('.meet__thread'), spark = svg.querySelector('.meet__spark'), grad = svg.querySelector('linearGradient');

  function centre(f) {
    var r = f.getBoundingClientRect(), b = h1.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, top: r.top - b.top, bottom: r.bottom - b.top, w: r.width, h: r.height };
  }
  // the leftmost edge of the words written below a height (the thread goes round them, never through them)
  function leftBelow(y) {
    var b = h1.getBoundingClientRect(), left = Infinity, walk = doc.createTreeWalker(h1, NodeFilter.SHOW_TEXT), n, rg = doc.createRange();
    while ((n = walk.nextNode())) {
      if (!n.nodeValue.trim() || n.parentNode.closest('svg')) continue;
      rg.selectNodeContents(n);
      Array.prototype.forEach.call(rg.getClientRects(), function (r) { if (r.top - b.top > y && r.width > 0) left = Math.min(left, r.left - b.left); });
    }
    return left;
  }
  // from under one flag, round the words below it, under the title, and up into the other flag
  function draw() {
    var a = centre(flags[0]), m = centre(flags[1]), W = h1.offsetWidth, H = h1.offsetHeight;
    var fs = parseFloat(getComputedStyle(h1).fontSize) || 100, y1 = a.bottom + 4, y2 = m.bottom + 4;
    var bottom = H + Math.max(4, fs * .05), r = Math.max(8, fs * .16), k = Math.max(10, fs * .2);
    var L = Math.min(a.x, leftBelow(a.bottom) - fs * .16);
    var d = 'M' + a.x + ' ' + y1 +
      'Q' + a.x + ' ' + (y1 + k) + ' ' + L + ' ' + (y1 + k) +          // out to the left of the words below, if any
      'L' + L + ' ' + (bottom - r) +
      'Q' + L + ' ' + bottom + ' ' + (L + r) + ' ' + bottom +
      'L' + (m.x - r) + ' ' + bottom +
      'Q' + m.x + ' ' + bottom + ' ' + m.x + ' ' + (bottom - r) +
      'L' + m.x + ' ' + y2;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H + fs);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (H + fs));
    svg.style.overflow = 'visible';
    thread.setAttribute('d', d);
    grad.setAttribute('x1', L); grad.setAttribute('x2', m.x); grad.setAttribute('y1', 0); grad.setAttribute('y2', 0);
    thread.style.strokeWidth = Math.max(1.5, fs / 60) + 'px';
  }

  // a burst of colour at a flag
  function burst(f, n) {
    var c = centre(f), k = c.h;
    for (var i = 0; i < n; i++) {
      var p = doc.createElement('i'), angle = Math.PI * 2 * i / n + Math.random() * .5, dist = k * (.9 + Math.random() * 1.1);
      p.className = 'meet__bit';
      p.style.left = c.x + 'px';
      p.style.top = (c.top + c.h / 2) + 'px';
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.setProperty('--r', Math.round(Math.random() * 360) + 'deg');
      p.style.background = COLOURS[i % COLOURS.length];
      h1.appendChild(p);
      setTimeout(function (q) { return function () { if (q.parentNode) q.parentNode.removeChild(q); }; }(p), 1300);
    }
    f.classList.remove('is-hit');
    void f.getBoundingClientRect();
    f.classList.add('is-hit');
    clearTimeout(f._hit);
    f._hit = setTimeout(function () { f.classList.remove('is-hit'); }, 1100);
  }

  // the spark along the thread, one way or the other
  var running = false;
  function travel(back, done) {
    if (running) return;
    running = true;
    var len = thread.getTotalLength(), t0 = 0;
    spark.classList.add('is-on');
    function step(now) {
      if (!t0) t0 = now;
      var u = Math.min(1, (now - t0) / DRAW), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      var pt = thread.getPointAtLength((back ? 1 - e : e) * len);
      spark.setAttribute('cx', pt.x);
      spark.setAttribute('cy', pt.y);
      if (u < 1) return requestAnimationFrame(step);
      spark.classList.remove('is-on');
      running = false;
      if (done) done();
    }
    requestAnimationFrame(step);
  }

  function open() { return body.classList.contains('is-open'); }
  draw();
  if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(draw); }).observe(h1);
  else window.addEventListener('resize', draw);
  doc.addEventListener('ben:lang', function () { requestAnimationFrame(function () { requestAnimationFrame(draw); }); });
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(draw);

  if (reduced) { h1.classList.add('is-linked', 'is-still'); return; }
  setTimeout(function () {
    draw();
    h1.classList.add('is-linked');                     // the thread draws itself, with the spark at its head
    travel(false, function () {
      h1.classList.add('is-met');
      burst(flags[1], 24);
      burst(flags[0], 14);
      var back = true;
      var loop = setInterval(function () {
        if (open()) { clearInterval(loop); return; }
        travel(back, function (b) { return function () { burst(flags[b ? 0 : 1], 10); }; }(back));
        back = !back;
      }, AGAIN);
    });
  }, LAND);
})();
