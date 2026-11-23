/* benevents agency — "Talk to our AI agent": the voice agent (Dialora) that opens from the header.
   Vanilla JS, no dependencies.

   Every button marked data-agent opens a small panel under the header. The agent shows itself in that
   panel: its script finds the box marked data-dialora-widget and puts its card there (a status line and
   the button that starts the call). For that, the widget must be set to the "inline" placement in the
   Dialora account; set to "floating", it shows its own round button in a corner of the screen instead.

   - Nothing is requested from Dialora, and Dialora learns nothing, until a visitor presses the button.
     Its script then loads (with Google reCAPTCHA, which it uses to tell people from robots).
   - The call itself starts only when the visitor presses the agent's own button, and the browser asks
     for the microphone first.
   - If the agent cannot load (a blocker, a bad connection), the panel says so and points to the other
     ways to reach us.

   Presses are counted without identifying anyone (assets/js/stats.js): agent_open, with where on the page. */
(function () {
  'use strict';
  var doc = document;

  /* ------------------------------------------------------------------
     SETTINGS
     ------------------------------------------------------------------ */
  var KEY = 'wdgt_vl3ed3xpp4btlncdoreqk9v7';          // the widget's public key, as given by Dialora
  var SCRIPT = 'https://app.dialora.ai/widget.js';
  var WAIT = 10000;                                     // ms: the longest its script may take to load
  var SHOW = 6000;                                      // ms: once it has loaded, the longest its card may take to appear in the panel
  var WORDS = {
    en: { title: 'AI voice agent', sub: 'Ask about your event, out loud.', wait: 'Connecting…', close: 'Close',
          fail: 'The agent cannot open right now. Write to us on WhatsApp or through the contact form.',
          corner: 'Press the round button at the bottom right of the screen to talk to the agent.' },
    fr: { title: 'Agent vocal IA', sub: 'Posez vos questions sur votre événement, de vive voix.', wait: 'Connexion…', close: 'Fermer',
          fail: 'L’agent ne peut pas s’ouvrir pour le moment. Écrivez-nous sur WhatsApp ou via le formulaire de contact.',
          corner: 'Appuyez sur le bouton rond en bas à droite de l’écran pour parler à l’agent.' }
  };
  /* ------------------------------------------------------------------ */

  var state = 'idle';                                   // idle → loading → ready (the card is in the panel), floating, or failed
  var panel = null, box = null, opener = null, timer = 0, poll = 0;

  function lang() { return doc.documentElement.lang === 'fr' ? 'fr' : 'en'; }
  function w() { return WORDS[lang()]; }
  function shown() { return !!panel && panel.classList.contains('is-open'); }

  // the panel is made once; closed, it stays laid out but invisible, so that the agent's card can settle in it
  function build() {
    panel = doc.createElement('div');
    panel.className = 'agent';
    panel.id = 'agent';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'agent-t');
    panel.innerHTML =
      '<div class="agent__top">' +
        '<span class="agent__ico" aria-hidden="true"></span>' +
        '<div class="agent__say"><p class="agent__t" id="agent-t"></p><p class="agent__s"></p></div>' +
        '<button class="agent__x" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '</div>' +
      '<div class="agent__box" data-dialora-widget="' + KEY + '"><p class="agent__wait" role="status"></p></div>';
    doc.body.appendChild(panel);
    box = panel.querySelector('.agent__box');
    panel.querySelector('.agent__x').addEventListener('click', function () { close(true); });
  }
  function words() {
    var t = w();
    panel.querySelector('.agent__t').textContent = t.title;
    panel.querySelector('.agent__s').textContent = t.sub;
    panel.querySelector('.agent__x').setAttribute('aria-label', t.close);
    panel.querySelector('.agent__wait').textContent = state === 'failed' ? t.fail : state === 'floating' ? t.corner : t.wait;
  }
  // the panel hangs under the button that opened it, inside the screen
  function place() {
    if (!shown() || !opener) return;
    var r = opener.getBoundingClientRect(), vw = doc.documentElement.clientWidth;
    panel.style.top = Math.round(r.bottom + 12) + 'px';
    panel.style.right = Math.max(12, Math.min(Math.round(vw - r.right - 8), vw - panel.offsetWidth - 12)) + 'px';
  }
  function expanded(on) {
    Array.prototype.forEach.call(doc.querySelectorAll('[data-agent]'), function (b) { b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
  }
  function open(b) {
    if (!panel) build();
    opener = b;
    words();
    panel.classList.add('is-open');
    expanded(true);
    place();
    load();
    try { panel.querySelector('.agent__x').focus({ preventScroll: true }); } catch (e) {}
  }
  function close(back) {
    if (!shown()) return;
    panel.classList.remove('is-open');                  // a call in progress goes on: the button opens the panel again, with its end-call button
    expanded(false);
    if (back && opener) try { opener.focus({ preventScroll: true }); } catch (e) {}
  }

  // what the agent's script put in the panel, if anything
  function card() {
    for (var i = 0; i < box.children.length; i++) if (!box.children[i].classList.contains('agent__wait')) return box.children[i];
    return null;
  }
  // the agent's settings have come back from Dialora (the browser keeps a note of every request it made)
  function settingsIn() {
    try { return performance.getEntriesByType('resource').some(function (e) { return e.name.indexOf('/api/widgets/' + KEY) > -1 && e.responseEnd > 0; }); } catch (e) { return false; }
  }
  // the card shows in the panel when the widget is set to "inline": it then has a height. Set to "floating", it never does.
  function watch() {
    var since = 0;
    clearInterval(poll);
    poll = setInterval(function () {
      if (state !== 'loading') { clearInterval(poll); return; }
      var c = card();
      if (c && c.offsetHeight > 40) { ready(); return; }
      if (!since && settingsIn()) since = Date.now();
      if (since && Date.now() - since > 1500) failed();
    }, 150);
  }
  function ready() {
    clearTimeout(timer);
    clearInterval(poll);
    state = 'ready';
    panel.classList.add('is-ready');
    place();
  }
  function failed() {
    if (state !== 'loading') return;
    clearTimeout(timer);
    clearInterval(poll);
    // the widget is there but set to float in a corner: it goes there (out of the panel), its own round button is the way in,
    // it takes the place of the WhatsApp button, and the panel says where to press
    var floating = !!(window.__dialoraWidget && window.__dialoraWidget.mounted);
    state = floating ? 'floating' : 'failed';
    if (floating) {
      box.removeAttribute('data-dialora-widget');
      doc.documentElement.classList.add('agent-floating');
    }
    words();
    place();
  }
  function load() {
    if (state !== 'idle') return;
    state = 'loading';
    var s = doc.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.setAttribute('data-client-key', KEY);
    s.addEventListener('error', failed);
    s.addEventListener('load', function () { if (state !== 'loading') return; clearTimeout(timer); timer = setTimeout(failed, SHOW); watch(); });
    doc.head.appendChild(s);
    timer = setTimeout(failed, WAIT);
  }

  function where(b) {
    if (b.closest('.menu')) return 'menu';
    if (b.closest('.nav')) return 'header';
    if (b.closest('footer')) return 'footer';
    return 'page';
  }

  doc.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-agent]') : null;
    if (b) {
      e.preventDefault();
      if (shown() && opener === b) { close(true); return; }
      if (window.benCount) window.benCount('agent_open', { where: where(b) });
      open(b);
      return;
    }
    // a press outside the panel closes it
    if (shown() && !panel.contains(e.target)) close(false);
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && shown()) close(true);
  });
  window.addEventListener('resize', place, { passive: true });
  window.addEventListener('scroll', place, { passive: true });
  // the language changes in place on the home page: the panel follows
  new MutationObserver(function () { if (panel) words(); }).observe(doc.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // for the automated checks
  window.BEN_AGENT = { state: function () { return state; }, key: KEY, script: SCRIPT };
})();
