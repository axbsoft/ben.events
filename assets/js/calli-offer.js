/* benevents agency — the page a QR code leads to (offer.html, served at /o/<name>).
   Vanilla JS, no dependencies.

   The name in the address is looked up in assets/calligraphy/offers.json. Where it is listed, the scan
   is counted (the audience measurement of the site records this page, and one event: qr_scan, with the
   offer and where the visitor came from) and the visitor is taken to the offer. The destination always
   comes from that file, and only an https address is accepted: the page cannot be made to lead anywhere
   else by writing a different address. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $ = function (s) { return doc.querySelector(s); };
  var q = new URLSearchParams(location.search);
  var WAIT = 3200;                 // ms: the longest the measurement may take before the visitor is taken on anyway
  var AFTER = 450;                 // ms: after the measurement is ready, so that what it records has left

  var TEXT = {
    fr: { 'offer.wait': 'Un instant…', 'offer.text': 'Nous vous emmenons vers l’offre.', 'offer.go': 'Continuer', 'offer.lost': 'Cette offre n’existe pas ou plus.', 'offer.losttext': 'Le lien est peut-être incomplet. Vous pouvez découvrir benevents agency.', 'offer.home': 'Découvrir benevents' },
    en: { 'offer.wait': 'One moment…', 'offer.text': 'We are taking you to the offer.', 'offer.go': 'Continue', 'offer.lost': 'This offer does not exist any more.', 'offer.losttext': 'The link may be incomplete. You can discover benevents agency.', 'offer.home': 'Discover benevents' }
  };
  var kept = null;
  try { kept = localStorage.getItem('ben-lang'); } catch (e) {}
  var asked = q.get('l');
  var lang = asked === 'en' || asked === 'fr' ? asked : kept === 'en' || kept === 'fr' ? kept : (navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  root.lang = lang;
  function t(key) { return TEXT[lang][key] || TEXT.fr[key] || ''; }
  function words() {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-t]'), function (n) { n.textContent = t(n.getAttribute('data-t')); });
    Array.prototype.forEach.call(doc.querySelectorAll('[data-home]'), function (a) { a.href = lang === 'fr' ? '/fr' : '/'; });
  }
  words();

  var title = $('.ca-offer__title'), text = $('.ca-offer__text'), go = $('.ca-offer__go'), brand = $('.ca-offer__brand'), bar = $('.ca-offer__bar');
  function lost() {
    title.textContent = t('offer.lost');
    text.textContent = t('offer.losttext');
    $('.ca-offer__go span').textContent = t('offer.home');
    go.hidden = false;
    bar.hidden = true;
    root.setAttribute('data-state', 'lost');
  }

  var m = /^\/o\/([a-z0-9][a-z0-9-]{1,23})\/?$/.exec(location.pathname), slug = m && m[1];
  if (!slug) { lost(); return; }

  fetch('/assets/calligraphy/offers.json', { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('offers');
    return r.json();
  }).then(function (j) {
    var o = j && j.offers && Object.prototype.hasOwnProperty.call(j.offers, slug) ? j.offers[slug] : null, url = null;
    try { var u = new URL(o && o.url); if (u.protocol === 'https:' && u.hostname) url = u.href; } catch (e) {}
    if (!url) { lost(); return; }

    var label = (o.label && (o.label[lang] || o.label.fr || o.label.en)) || '';
    if (o.brand) { brand.textContent = o.brand; brand.hidden = false; }
    if (label) title.textContent = label;
    go.href = url;
    go.hidden = false;
    doc.title = (o.brand ? o.brand + ' · ' : '') + 'benevents agency';
    root.setAttribute('data-state', 'going');

    var left = false, counted = false, from = q.get('from') === 'card' ? 'card' : 'qr', began = Date.now();
    function leave() { if (left) return; left = true; location.replace(url); }
    go.addEventListener('click', function () { left = true; });        // the visitor does not wait: the link takes them
    // the measurement of the site is ready when it has taken its place on the page; the scan is counted, then the visitor goes on
    var optedOut = false;
    try { optedOut = localStorage.getItem('disable-rybbit') !== null; } catch (e) {}
    (function tick() {
      if (left) return;
      var ready = window.rybbit && typeof window.rybbit.event === 'function';
      if (ready && !counted) {
        counted = true;
        if (window.benCount) window.benCount('qr_scan', { offer: slug, brand: o.brand || '', from: from });
        setTimeout(leave, AFTER);
        return;
      }
      if (window.benNoStats || optedOut) { setTimeout(leave, 500); return; }       // nothing to wait for
      if (Date.now() - began > WAIT) { leave(); return; }
      setTimeout(tick, 100);
    })();
  }).catch(lost);
})();
