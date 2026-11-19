/* benevents agency — the two legal pages (privacy.html, terms.html).
   Each page holds its text in French and in English; this file shows the right one: the language asked for
   in the address (?lang=fr), else the one chosen on the site, else the language of the browser. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, stored = null;
  var qs = /[?&]lang=(en|fr)\b/.exec(location.search);
  try { stored = localStorage.getItem('ben-lang'); } catch (e) {}
  var lang = (qs && qs[1]) || stored || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en');
  root.lang = lang === 'fr' ? 'fr' : 'en';       // set at once, before the page is drawn

  function each(sel, fn) { Array.prototype.forEach.call(doc.querySelectorAll(sel), fn); }

  function setLang(next, save) {
    lang = next === 'fr' ? 'fr' : 'en';
    root.lang = lang;
    var b = doc.body, title = b.getAttribute('data-title-' + lang), desc = b.getAttribute('data-desc-' + lang), meta = doc.querySelector('meta[name="description"]');
    if (title) doc.title = title;
    if (desc && meta) meta.content = desc;
    each('[data-lang]', function (n) { n.setAttribute('aria-pressed', String(n.getAttribute('data-lang') === lang)); });
    // the links to the site and to the other page keep the language (the home page is / in English, /fr in French)
    each('[data-href]', function (a) { var to = a.getAttribute('data-href'); a.href = to === './' ? (lang === 'fr' ? 'fr' : './') : to + '?lang=' + lang; });
    if (save) {
      try { localStorage.setItem('ben-lang', lang); } catch (e) {}
      try { history.replaceState(null, '', location.pathname + '?lang=' + lang + location.hash); } catch (e) {}
    }
  }

  function start() {
    each('[data-year]', function (n) { n.textContent = new Date().getFullYear(); });
    each('[data-lang]', function (n) { n.addEventListener('click', function () { setLang(n.getAttribute('data-lang'), true); }); });
    setLang(lang, false);
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start); else start();
})();
