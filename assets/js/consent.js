/* benevents agency — the visitor's choice about cookies, on every page that loads the Google tag.

   The head of the page starts Google's consent mode at "denied" (or at the choice already made, for six months),
   before Google Tag Manager loads: nothing is stored by Google's tools until the visitor accepts.
   This script shows a small banner at the first visit (Accept / Decline, the same weight), remembers the choice in the
   browser for six months (localStorage "ben-consent"), passes it on to Google (gtag consent update), and opens the
   banner again from any "Cookie settings" button of the page (data-consent-open).
   The site's own audience measurement (Rybbit) works without cookies and does not depend on this choice.
   The banner speaks the language of the page, and follows it when the home page switches language. */
(function () {
  'use strict';
  var KEY = 'ben-consent', KEEP = 182 * 864e5;               // six months
  var WORDS = {
    en: { label: 'Cookies', text: 'We would like to use cookies to measure visits and the results of our advertising (Google), only if you agree.',
          yes: 'Accept', no: 'Decline', more: 'Privacy policy' },
    fr: { label: 'Cookies', text: 'Nous aimerions utiliser des cookies pour mesurer les visites et les résultats de nos publicités (Google), seulement si vous êtes d’accord.',
          yes: 'Accepter', no: 'Refuser', more: 'Politique de confidentialité' }
  };
  var gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
  var box = null, timer = 0;

  function stored() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && (c.v === 'granted' || c.v === 'denied') && Date.now() - c.t < KEEP) return c.v;
    } catch (e) {}
    return null;
  }
  function lang() { return /^fr/.test(document.documentElement.lang || '') ? 'fr' : 'en'; }

  function style() {
    var s = document.createElement('style');
    s.textContent =
      '.cc{position:fixed;left:22px;bottom:22px;z-index:170;width:min(380px,calc(100vw - 44px));padding:18px 20px 16px;border-radius:20px;' +
      'border:1px solid rgba(255,255,255,.12);background:#141418;color:#f6f5f1;box-shadow:0 24px 60px -18px rgba(0,0,0,.75);' +
      'font:14px/1.5 "Inter Tight","Helvetica Neue",Helvetica,Arial,sans-serif;opacity:0;transform:translateY(10px);transition:opacity .35s,transform .5s cubic-bezier(.19,1,.22,1)}' +
      '.cc.is-on{opacity:1;transform:none}.cc[hidden]{display:none}' +
      '.cc__h{margin:0 0 6px;font-size:11.5px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:#a1a1ab}' +
      '.cc__h::before{content:"";display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:linear-gradient(100deg,#f9b24e,#e94b5b,#00adb0,#5dbea3);transform:translateY(-1px)}' +
      '.cc__t{margin:0 0 14px;color:rgba(246,245,241,.86)}' +
      '.cc__b{display:flex;flex-wrap:wrap;align-items:center;gap:8px}' +
      '.cc__b button{flex:1 1 0;min-width:110px;padding:10px 16px;border-radius:99px;font:inherit;font-weight:600;cursor:pointer;transition:background .25s,border-color .25s,color .25s}' +
      '.cc__yes{border:1px solid #f6f5f1;background:#f6f5f1;color:#08080a}.cc__yes:hover,.cc__yes:focus-visible{background:#fff}' +
      '.cc__no{border:1px solid rgba(255,255,255,.28);background:transparent;color:#f6f5f1}.cc__no:hover,.cc__no:focus-visible{border-color:#f6f5f1}' +
      '.cc__more{display:inline-block;margin-top:10px;font-size:12.5px;color:#a1a1ab;text-decoration:underline;text-underline-offset:3px}.cc__more:hover{color:#f6f5f1}' +
      '.cc :focus-visible{outline:2px solid #f9b24e;outline-offset:2px}' +
      'button[data-consent-open]{padding:0;border:0;background:none;font:inherit;color:inherit;cursor:pointer;transition:color .3s}' +
      'button[data-consent-open]:hover,button[data-consent-open]:focus-visible{color:#f6f5f1}' +
      '@media (max-width:700px){.cc{left:12px;right:12px;width:auto;bottom:calc(84px + env(safe-area-inset-bottom,0px))}}' +
      '@media (prefers-reduced-motion:reduce){.cc{transition:opacity .2s;transform:none}}';
    document.head.appendChild(s);
  }

  function words() {
    if (!box) return;
    var w = WORDS[lang()];
    box.setAttribute('aria-label', w.label);
    box.querySelector('.cc__h').textContent = w.label;
    box.querySelector('.cc__t').textContent = w.text;
    box.querySelector('.cc__yes').textContent = w.yes;
    box.querySelector('.cc__no').textContent = w.no;
    var more = box.querySelector('.cc__more');
    more.textContent = w.more;
    more.href = '/privacy?lang=' + lang();
  }

  function build() {
    if (box) return;
    style();
    box = document.createElement('div');
    box.className = 'cc';
    box.setAttribute('role', 'region');
    box.hidden = true;
    box.innerHTML = '<p class="cc__h"></p><p class="cc__t"></p><div class="cc__b"><button type="button" class="cc__yes"></button><button type="button" class="cc__no"></button></div><a class="cc__more"></a>';
    box.querySelector('.cc__yes').addEventListener('click', function () { choose('granted'); });
    box.querySelector('.cc__no').addEventListener('click', function () { choose('denied'); });
    document.body.appendChild(box);
    words();
    // the home page switches language without loading again: the banner follows
    if (window.MutationObserver) new MutationObserver(words).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function show() {
    build();
    clearTimeout(timer);
    box.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('is-on'); }); });
  }
  function hide() {
    if (!box) return;
    box.classList.remove('is-on');
    clearTimeout(timer);
    timer = setTimeout(function () { box.hidden = true; }, 400);
  }

  function choose(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: v, t: Date.now() })); } catch (e) {}
    gtag('consent', 'update', { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
    (window.dataLayer = window.dataLayer || []).push({ event: 'consent_' + v });
    hide();
  }

  // "Cookie settings", at the foot of the pages
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-consent-open]');
    if (!b) return;
    e.preventDefault();
    show();
    var yes = box.querySelector('.cc__yes');
    if (yes) yes.focus({ preventScroll: true });
  });

  // the first visit, or a choice older than six months: the banner, once the page is there
  if (!stored()) {
    var later = function () { setTimeout(show, 700); };
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later);
  }
})();
