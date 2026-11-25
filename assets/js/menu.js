/* benevents agency — the Services menu of the header, on every page.

   The menu opens with CSS alone (hover, or keyboard focus inside it). This script adds what CSS cannot:
   - aria-expanded on the Services link, so that screen readers know the menu is open;
   - Escape closes it and puts the focus back on Services;
   - on a touch screen, a first tap on Services opens the menu, a second one follows the link;
   - a tap outside closes it;
   - the photos of the recent projects load the first time it opens. */
(function () {
  'use strict';
  var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
  [].forEach.call(document.querySelectorAll('.drop'), function (drop) {
    var btn = drop.querySelector('.drop__btn');
    if (!btn) return;
    var say = function (open) { btn.setAttribute('aria-expanded', String(open)); };
    // the photos of the recent projects are loaded the first time the menu opens, not with the page
    var shown = false;
    var photos = function () {
      if (shown) return;
      shown = true;
      [].forEach.call(drop.querySelectorAll('[data-bg]'), function (n) { n.style.backgroundImage = 'url("' + n.getAttribute('data-bg') + '")'; n.removeAttribute('data-bg'); });
    };
    drop.addEventListener('mouseenter', photos);
    drop.addEventListener('focusin', photos);
    btn.addEventListener('touchstart', photos, { passive: true });
    var close = function () { drop.classList.remove('is-open'); say(false); };
    drop.addEventListener('mouseenter', function () { drop.classList.remove('is-closed'); say(true); });
    drop.addEventListener('mouseleave', function () { drop.classList.remove('is-closed'); close(); });
    drop.addEventListener('focusin', function () { if (!drop.classList.contains('is-closed')) say(true); });
    drop.addEventListener('focusout', function (e) {
      if (drop.contains(e.relatedTarget)) return;
      drop.classList.remove('is-closed');
      close();
    });
    drop.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      drop.classList.add('is-closed');
      close();
      btn.focus();
    });
    btn.addEventListener('click', function (e) {
      if (!touch || drop.classList.contains('is-open')) return;
      e.preventDefault();
      drop.classList.add('is-open');
      say(true);
    });
    document.addEventListener('click', function (e) { if (!drop.contains(e.target)) close(); });
    // a link of the menu followed: the menu closes behind it (the home page scrolls to its sections)
    [].forEach.call(drop.querySelectorAll('.drop__panel a'), function (a) {
      a.addEventListener('click', function () { drop.classList.add('is-closed'); close(); if (document.activeElement) document.activeElement.blur(); });
    });
  });
})();
