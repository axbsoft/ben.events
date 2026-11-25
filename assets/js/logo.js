/* benevents agency — the logo plays sound and light with the scroll, on every page that shows it.

   Scrolling down:  <html data-logo="sound">, the line of the logo breaks into bars that play like a sound meter.
   Scrolling up:    <html data-logo="light">, the line brightens and its colours run faster.
   A moment after the scroll stops, the logo comes back to rest (its colours drift slowly).
   The looks are in assets/css/style.css ("the logo plays sound and light"); the bars in assets/img/logo-bars.svg.
   Nothing moves for visitors who ask their device for less motion. */
(function () {
  'use strict';
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  var last = window.scrollY, timer = 0;
  var rate = 1, target = 1, raf = 0, flows = null;

  // the drift of the colours runs faster while scrolling up, and slows down smoothly afterwards
  function animations() {
    if (!flows || !flows.length) {
      flows = document.getAnimations ? document.getAnimations().filter(function (a) { return a.animationName === 'logo-flow'; }) : [];
    }
    return flows;
  }
  function step() {
    rate += (target - rate) * 0.08;
    if (Math.abs(target - rate) < 0.02) rate = target;
    animations().forEach(function (a) {
      if (a.updatePlaybackRate) a.updatePlaybackRate(rate); else a.playbackRate = rate;
    });
    raf = rate === target ? 0 : requestAnimationFrame(step);
  }
  function mode(m) {
    if (m) root.setAttribute('data-logo', m); else root.removeAttribute('data-logo');
    target = m === 'light' ? 5 : 1;
    if (!raf) raf = requestAnimationFrame(step);
  }

  window.addEventListener('scroll', function () {
    var y = window.scrollY, d = y - last;
    if (Math.abs(d) < 2) return;
    last = y;
    var m = d > 0 ? 'sound' : 'light';
    if (root.getAttribute('data-logo') !== m) mode(m);
    clearTimeout(timer);
    timer = setTimeout(function () { mode(''); }, 900);
  }, { passive: true });
})();
