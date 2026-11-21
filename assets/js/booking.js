/* benevents agency — "Book a call": the calendar that opens as a pop-up on the page (Lunacal).
   Vanilla JS, no dependencies.

   Every button marked data-book opens the calendar. The embed code is the one Lunacal gives for an
   "element click" pop-up; it is kept as it was given (the calendar, the namespace, the look of the
   pop-up), with two differences, both for the visitor:

   - It does not run when the page opens. Nothing is requested from Lunacal, and Lunacal learns
     nothing, until a visitor points at, touches or presses one of the buttons. The script of the
     calendar then loads (and prepares the pop-up behind it, which is what "prerenderIframe" is for),
     so that it is usually there before the click that follows.
   - A visitor who presses the button before the calendar is there is not left with nothing: the button
     shows that it is working, and the page presses it again once the pop-up is ready (the calendar says so
     itself, "prerenderReady": a pop-up opened before that can stay on its loading animation). If the
     calendar cannot load (a blocker, a bad connection), the same calendar opens as a page of its own,
     in a new tab.

   The buttons carry the attributes the calendar looks for (data-cal-link, data-cal-namespace,
   data-cal-config): they are added here, so that the link of the calendar is written in one place.
   Presses are counted without identifying anyone (assets/js/stats.js): call_click, with where on the page. */
(function () {
  'use strict';
  var doc = document;

  /* ------------------------------------------------------------------
     SETTINGS
     ------------------------------------------------------------------ */
  var ORIGIN = 'https://app.lunacal.ai';
  var SCRIPT = ORIGIN + '/embed/embed.js';
  var CAL_LINK = 'benamara/consult';           // whose calendar, and which event type
  var NAMESPACE = 'consult';
  var PAGE = ORIGIN + '/' + CAL_LINK;          // the same calendar as a page of its own: where a visitor goes if the pop-up cannot open
  var WAIT = 8000;                             // ms: the longest its script may take to load before the page of its own is used
  var WARM = 8000;                             // ms: once the script has loaded, the longest the pop-up may take to prepare itself behind the page
  // the look of the pop-up, as set in the Lunacal account
  var UI = {"theme":"dark","styles":{"branding":{}},"hideEventTypeDetails":true,"layout":"","cssVarsPerTheme":{"light":{"theme-border":"#1F1F1F","theme-background-primary":"#018CFF","theme-background-secondary":"#33353A","theme-background-card":"#090909","theme-background-base":"#090909","theme-text-primary":"#ffffff","theme-text-secondary":"#ffffff","theme-text-card":"#ffffff","theme-text-base":"#ffffff","theme-rounded-base":"12px","theme-rounded-calendar":"20px","theme-rounded-timeslot":"999px","theme-rounded-day":"999px","theme-rounded-button":"999px","theme-shadow-calendar":"1.5px 8.5px 4px 0px #0000001A","theme-shadow-button":"0px 0px 0px 0px #D1519A88","theme-shadow-timeslot":"0px 0px 0px 0px #000000","theme-font-family":"Outfit"},"dark":{"theme-border":"#1F1F1F","theme-background-primary":"#018CFF","theme-background-secondary":"#33353A","theme-background-card":"#090909","theme-background-base":"#090909","theme-text-primary":"#ffffff","theme-text-secondary":"#ffffff","theme-text-card":"#ffffff","theme-text-base":"#ffffff","theme-rounded-base":"12px","theme-rounded-calendar":"20px","theme-rounded-timeslot":"999px","theme-rounded-day":"999px","theme-rounded-button":"999px","theme-shadow-calendar":"1.5px 8.5px 4px 0px #0000001A","theme-shadow-button":"0px 0px 0px 0px #D1519A88","theme-shadow-timeslot":"0px 0px 0px 0px #000000","theme-font-family":"Outfit"}},"displayedContent":{"image":true,"name":true,"designation":true,"description":true,"eventName":true,"highlightBar":false},"background":{"type":"animated","presetId":"retro-grid"},"stylePreset":"blueshine"};
  /* ------------------------------------------------------------------ */

  var state = 'idle';                          // idle → loading (the script, then the pop-up behind the page) → ready, or failed
  var pending = null;                          // the button pressed while the calendar was loading
  var again = false;                           // true while the page presses a button for the visitor
  var timer = 0;

  // the embed code of Lunacal, as given: it defines window.Lunacal, which loads the script of the calendar on its first call
  function embed() {
    (function (L, U, N) { let p = (a, ar) => a.q.push(ar), d = L.document; L.Lunacal = L.Lunacal || function () { let lun = L.Lunacal, ar = arguments; if (!lun.loaded) { lun.ns = {}; lun.q = lun.q || []; d.head.appendChild(d.createElement('script')).src = U; lun.loaded = !0 } if (ar[0] === N) { const api = function () { p(api, arguments) }; const ns = ar[1]; api.q = api.q || []; if (typeof ns === 'string') { lun.ns[ns] = lun.ns[ns] || api; p(lun.ns[ns], ar); p(lun, ['initNamespace', ns]) } else p(lun, ar); return } p(lun, ar) }; if (!L.Cal) L.Cal = L.Lunacal })(window, SCRIPT, 'init');
    window.Lunacal('init', NAMESPACE, { origin: ORIGIN });
    window.Lunacal.config = window.Lunacal.config || {};
    window.Lunacal.config.forwardQueryParams = true;        // what is after the ? of this page goes on to the calendar
    window.Lunacal.ns[NAMESPACE]('preload', { calLink: CAL_LINK, type: 'modal', options: { prerenderIframe: true } });
    window.Lunacal.ns[NAMESPACE]('ui', UI);
    // the calendar says when the pop-up has prepared itself behind the page
    window.Lunacal.ns[NAMESPACE]('on', { action: 'prerenderReady', callback: function () { if (state === 'loading') ready(); } });
  }

  function busy(b, on) {
    if (!b) return;
    b.classList.toggle('is-waiting', on);
    b.setAttribute('aria-busy', on ? 'true' : 'false');
  }
  // the calendar as a page of its own; a blocked pop-up window takes the visitor there in this tab
  function page() {
    var w = null;
    try { w = window.open(PAGE, '_blank', 'noopener'); } catch (e) {}
    if (!w) window.location.assign(PAGE);
  }
  function ready() {
    if (state !== 'loading') return;
    clearTimeout(timer);
    state = 'ready';
    var b = pending;
    pending = null;
    busy(b, false);
    // the script has run and its own listener is on the page: the press that was waiting is made again
    if (b) setTimeout(function () { again = true; try { b.click(); } finally { again = false; } }, 80);
  }
  // the script has run; the pop-up now prepares itself. If it does not say that it is ready, it is used after a while all the same.
  function scriptIn() {
    if (state !== 'loading') return;
    clearTimeout(timer);
    timer = setTimeout(ready, WARM);
  }
  function failed() {
    if (state === 'ready' || state === 'failed') return;
    clearTimeout(timer);
    state = 'failed';
    var b = pending;
    pending = null;
    busy(b, false);
    if (b) page();
  }
  function load() {
    if (state !== 'idle') return;
    state = 'loading';
    try { embed(); } catch (e) { failed(); return; }
    var s = doc.querySelector('script[src="' + SCRIPT + '"]');
    if (!s) { failed(); return; }
    s.addEventListener('load', scriptIn);
    s.addEventListener('error', failed);
    timer = setTimeout(failed, WAIT);
  }

  // where on the page a button is, in a few plain words (never anything about the visitor)
  function where(b) {
    if (b.closest('.menu')) return 'menu';
    if (b.closest('.nav')) return 'header';
    if (b.closest('footer')) return 'footer';
    if (b.closest('#contact')) return 'contact section';
    return 'end of a page';
  }
  function closeMenu() {
    var burger = doc.querySelector('.burger');
    if (burger && doc.body.classList.contains('menu-open')) burger.click();      // the pop-up opens over the page, not over the menu
  }

  // the buttons carry what the calendar looks for
  Array.prototype.forEach.call(doc.querySelectorAll('[data-book]'), function (b) {
    b.setAttribute('data-cal-link', CAL_LINK);
    b.setAttribute('data-cal-namespace', NAMESPACE);
    b.setAttribute('data-cal-config', '{"layout":""}');
  });

  // a visitor who goes towards a button is about to press it: the calendar starts loading now
  ['pointerover', 'focusin', 'touchstart'].forEach(function (name) {
    doc.addEventListener(name, function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-book]') : null;
      if (!b) return;
      if (b.hasAttribute('aria-label')) b.title = b.getAttribute('aria-label');     // a button that shows only the calendar says its name on hover, in the language of the page
      load();
    }, { capture: true, passive: true });
  });

  doc.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-book]') : null;
    if (!b || again) return;
    if (window.benCount) window.benCount('call_click', { where: where(b) });
    closeMenu();
    if (state === 'ready') return;                           // the script of the calendar takes the press from here
    e.preventDefault();
    e.stopPropagation();
    if (state === 'failed') { page(); return; }
    if (pending && pending !== b) busy(pending, false);      // a second button pressed while the first one waits: only one waits
    pending = b;
    busy(b, true);
    load();
  }, true);

  // for the automated checks
  window.BEN_BOOKING = { state: function () { return state; }, link: CAL_LINK, namespace: NAMESPACE, page: PAGE };
})();
