/* benevents agency — the project photos switch on like an LED wall.

   As a project card comes into view (and once its photo has loaded), a fine pixel grid lights up from the top down,
   the way an LED screen comes on, then fades and leaves the photo as it is. Once per card and per visit of the page.
   The cards: .pcard__ph on the site's pages, .card__media in the portfolio of the home page.
   Visitors who ask their device for less motion, or browsers without IntersectionObserver, see the photos at once:
   nothing is added to the page. The styles are in style.css ("LED wall"). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cards = document.querySelectorAll('.pcard__ph, .card__media');
  if (!cards.length) return;

  var SCAN = 1200, FADE = 950, GAP = 140, last = 0;

  // the photo of a card is ready: an <img> loaded, or the background painted by main.js (class has-img) and loaded
  function ready(card, go) {
    var done = false, finish = function () { if (!done) { done = true; go(); } };
    setTimeout(finish, 4000);                                   // never keep a card dark for long
    var img = card.querySelector('img');
    if (img) {
      if (img.complete && img.naturalWidth) return finish();
      img.addEventListener('load', finish, { once: true });
      img.addEventListener('error', finish, { once: true });
      return;
    }
    var bg = card.querySelector('[data-img]');
    if (!bg) return finish();
    var load = function () {
      var m = /url\(["']?([^"')]+)["']?\)/.exec(bg.style.backgroundImage || '');
      if (!m) return finish();
      var pic = new Image();
      pic.onload = pic.onerror = finish;
      pic.src = m[1];
    };
    if (bg.classList.contains('has-img')) return load();
    var watch = new MutationObserver(function () { if (bg.classList.contains('has-img')) { watch.disconnect(); load(); } });
    watch.observe(bg, { attributes: true, attributeFilter: ['class', 'style'] });
  }

  // cards that come into view together light up one after the other
  function turnOn(card, led) {
    var now = Date.now(), wait = Math.min(Math.max(0, last + GAP - now), 900);
    last = now + wait;
    setTimeout(function () {
      led.classList.add('is-scan');
      setTimeout(function () { led.classList.add('is-done'); }, SCAN - 150);
      setTimeout(function () { if (led.parentNode) led.parentNode.removeChild(led); card.classList.remove('led-host'); }, SCAN + FADE);
    }, wait);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var card = e.target, led = card.querySelector('.led');
      if (led) ready(card, function () { turnOn(card, led); });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.2 });

  Array.prototype.forEach.call(cards, function (card) {
    if (card.querySelector('.led')) return;
    var led = document.createElement('i');
    led.className = 'led';
    led.setAttribute('aria-hidden', 'true');
    led.appendChild(document.createElement('b'));
    card.classList.add('led-host');
    card.appendChild(led);
    io.observe(card);
  });
})();
