/* benevents agency — the application forms: a position (/careers/<id>), a spontaneous application (/careers) and
   "Work with us" (/work-with-us). Each <form data-apply data-kind="position|spontaneous|pool"> is sent to
   /api/apply, which passes it on to the agency (see api/apply.js). Where that cannot be done, the visitor's mail app
   opens with everything filled in. What the form says comes from its own data-* attributes, in the page's language.
   Counted, without anything personal: application_sent (kind) in the site's audience measurement (stats.js). */
(function () {
  'use strict';
  var MAIL = 'contact@ben.events';
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function values(form, name) {
    return [].map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.getAttribute('data-label') || i.value; });
  }
  function field(form, name) { var n = form.elements[name]; return n && n.value ? String(n.value).trim() : ''; }

  function collect(form) {
    var d = {
      kind: form.getAttribute('data-kind') || 'spontaneous', position: form.getAttribute('data-position') || '',
      name: field(form, 'name'), email: field(form, 'email'), phone: field(form, 'phone'), city: field(form, 'city'),
      links: field(form, 'links'), experience: field(form, 'experience'), availability: field(form, 'availability'), message: field(form, 'message'),
      roles: values(form, 'roles'), languages: values(form, 'languages'),
      consent: !!(form.elements.consent && form.elements.consent.checked), hp: field(form, 'hp'),
      lang: /^fr/.test(document.documentElement.lang) ? 'fr' : 'en', page: location.pathname
    };
    return d;
  }
  function ok(d) { return d.name && EMAIL.test(d.email) && d.consent && (d.kind !== 'pool' || d.roles.length); }

  // the mail app, as a last resort: the same answers, one per line
  function mail(form, d) {
    var lines = [['position', d.position], ['roles', d.roles.join(', ')], ['languages', d.languages.join(', ')], ['city', d.city], ['phone', d.phone],
      ['links', d.links], ['availability', d.availability], ['experience', d.experience], ['message', d.message]]
      .filter(function (x) { return x[1]; }).map(function (x) { return (form.getAttribute('data-l-' + x[0]) || x[0]) + ': ' + x[1]; });
    var subject = (form.getAttribute('data-subject') || 'Application') + (d.position ? ' — ' + d.position : '') + ' — ' + d.name;
    location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n') + '\n\n' + d.name + '\n' + d.email);
  }

  function say(form, text, bad) {
    var note = form.querySelector('.form__note');
    if (!note) return;
    note.textContent = text;
    note.classList.toggle('is-error', !!bad);
  }

  [].forEach.call(document.querySelectorAll('form[data-apply]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = collect(form);
      if (!ok(d)) { say(form, form.getAttribute('data-missing'), true); return; }
      form.classList.add('is-sending');
      say(form, form.getAttribute('data-sending'));
      var sent = function () {
        form.classList.remove('is-sending');
        form.reset();
        say(form, form.getAttribute('data-sent'));
        if (window.benCount) window.benCount('application_sent', { kind: d.kind });
      };
      var fallback = function () {
        form.classList.remove('is-sending');
        say(form, form.getAttribute('data-failed'), true);
        mail(form, d);
      };
      if (!window.fetch) return fallback();
      fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) { if (r.ok) sent(); else fallback(); })
        .catch(fallback);
    });
  });
})();
