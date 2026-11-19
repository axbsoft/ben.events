/* benevents agency — what visitors do on the site, counted without identifying anyone.

   The audience measurement itself (Rybbit, no cookies) is one line in the head of each page,
   <script src="https://app.rybbit.io/api/script.js?siteId=…" defer>: it counts the pages seen.
   This file adds what a page view does not say. In Rybbit these appear under "Events":

     enquiry_started        the visitor began filling in the contact form
     enquiry_sent           the form was delivered (kind of event, language, city, budget, project it refers to)
     enquiry_by_email       the form could not be delivered: the visitor's mail app was opened instead
     whatsapp_click         a WhatsApp link was pressed (where on the page)
     email_click            the e-mail address was pressed (where on the page)
     phone_click            a phone number was pressed
     project_open           a project was opened on the home page (which one)
     service_open           a service was opened on the home page (which one)
     film_play              the film was started
     presentation_pdf, presentation_share, presentation_finished      on /presentation

   Nothing personal goes with them: never a name, an address, a phone number or a message.

   Not to be counted yourself: open the site once with ?stats=off at the end of the address
   (www.ben.events/?stats=off) in each browser you use. ?stats=on counts that browser again. */
(function () {
  'use strict';
  var KEY = 'disable-rybbit';                    // the name Rybbit's script looks for before it counts anything
  var ask = /[?&]stats=(off|on)\b/.exec(location.search);
  if (ask) {
    var off = ask[1] === 'off', done = true;
    try { if (off) localStorage.setItem(KEY, '1'); else localStorage.removeItem(KEY); } catch (e) { done = false; }
    var say = function () {
      var p = document.createElement('p');
      p.setAttribute('role', 'status');
      p.style.cssText = 'position:fixed;z-index:9999;left:50%;bottom:24px;transform:translateX(-50%);max-width:calc(100% - 32px);margin:0;padding:12px 18px;border-radius:12px;background:#f4f1ea;color:#0b0b0d;font:500 14px/1.4 system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.45)';
      p.textContent = !done ? 'This browser does not let the site remember the choice. / Ce navigateur ne permet pas de retenir ce choix.'
        : off ? 'Visits from this browser are no longer counted. / Les visites de ce navigateur ne sont plus comptées.'
          : 'Visits from this browser are counted again. / Les visites de ce navigateur sont de nouveau comptées.';
      document.body.appendChild(p);
      setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 9000);
    };
    if (document.body) say(); else document.addEventListener('DOMContentLoaded', say);
  }

  // Rybbit's script arrives after the page: what happens before it is there waits for it (20 seconds at most)
  var waiting = [], tries = 0;
  function there() { return window.rybbit && typeof window.rybbit.event === 'function'; }
  function send(name, props) { try { window.rybbit.event(name, props); } catch (e) {} }
  function later() {
    if (there()) { var q = waiting; waiting = []; q.forEach(function (e) { send(e[0], e[1]); }); return; }
    if (++tries < 40) setTimeout(later, 500); else waiting = [];
  }
  // name: what happened · props: a few plain words or numbers about it, never anything personal
  window.benCount = function (name, props) {
    var clean = {}, k, v;
    for (k in (props || {})) {
      v = props[k];
      if (v === '' || v == null) continue;
      clean[k] = typeof v === 'number' ? v : String(v).slice(0, 80);
    }
    if (there()) return send(name, clean);
    waiting.push([name, clean]);
    if (waiting.length === 1) { tries = 0; setTimeout(later, 500); }
  };

  // the three ways to reach the agency without the form, wherever they are on a page
  function where(a) {
    if (a.classList.contains('wa')) return 'floating button';
    if (a.closest('footer')) return 'footer';
    if (a.closest('#contact')) return 'contact section';
    if (a.closest('.pj__cta')) return 'end of a project';
    return 'page';
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var name = /^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(a.href) ? 'whatsapp_click' : /^mailto:/i.test(href) ? 'email_click' : /^tel:/i.test(href) ? 'phone_click' : '';
    if (name) window.benCount(name, { where: where(a) });
  }, true);
})();
