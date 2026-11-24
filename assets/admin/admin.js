/* benevents agency — the admin (/admin): the team adds and edits the projects, the blog and the client quotes.

   Everything happens in this page, then goes to api/admin.js, which writes it to the site's repository: Vercel then
   builds the site again and puts it online, about a minute later. This page watches the site and says when the
   change is online (assets/admin/site.json, written by tools/site/build.mjs, holds the time of each saved change).

   Photos are prepared here, in the browser, before they leave: turned the right way up, made at most 1600 pixels
   wide or high, saved as WebP (JPEG where the browser cannot write WebP), with their lighter copies (480 and 960
   pixels) and, for the first photo, the picture of the link preview (1200 x 630). */
(function () {
  'use strict';
  var API = '/api/admin';
  var app = document.getElementById('app');
  var toastEl = document.querySelector('.toast');
  var S = { user: null, content: null, blog: [], voices: null, site: null, order: null, pending: { projects: {}, blog: {}, voices: '' }, dirty: false };

  /* ---------- small tools ---------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked') el.checked = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { add(el, k); }); return; }
    el.appendChild(typeof kid === 'string' || typeof kid === 'number' ? document.createTextNode(String(kid)) : kid);
  }
  var tr = function (v, l) { return v == null ? '' : typeof v === 'string' || typeof v === 'number' ? String(v) : (v[l] || v.en || ''); };
  var two = function (v) { return { en: tr(v, 'en'), fr: tr(v, 'fr') }; };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var slugify = function (s, n) {
    s = String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    n = n || 80;
    if (s.length > n) s = s.slice(0, n).replace(/-[^-]*$/, '');
    return s;
  };
  var today = function () { return new Date().toISOString().slice(0, 10); };
  var linesOf = function (t) { return String(t || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
  var parasOf = function (t) { return String(t || '').split(/\n\s*\n/).map(function (x) { return x.replace(/\s*\n\s*/g, ' ').trim(); }).filter(Boolean); };
  function toast(msg, bad) {
    toastEl.textContent = msg;
    toastEl.classList.toggle('is-bad', !!bad);
    toastEl.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.hidden = true; }, bad ? 9000 : 6000);
  }
  function call(action, data) {
    return fetch(API, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ action: action }, data || {})) })
      .then(function (r) {
        return r.json().catch(function () { return { ok: false, error: 'The server did not answer (' + r.status + ').' }; }).then(function (j) {
          if (r.status === 401 && action !== 'login') { S.user = null; signin('Please sign in again.'); }
          if (!j.ok) throw new Error(j.error || 'Something went wrong.');
          return j;
        });
      });
  }

  /* ---------- photos, prepared in the browser ---------- */
  function decode(src) {
    if (src instanceof Blob && window.createImageBitmap) return createImageBitmap(src, { imageOrientation: 'from-image' }).catch(function () { return viaImg(src); });
    return viaImg(src);
  }
  function viaImg(src) {
    return new Promise(function (ok, no) {
      var img = new Image(), url = src instanceof Blob ? URL.createObjectURL(src) : src;
      img.onload = function () { ok(img); };
      img.onerror = function () { no(new Error('This photo cannot be read here. Save it as JPEG and try again.')); };
      img.crossOrigin = 'anonymous';
      img.src = url;
    });
  }
  function canvasOf(src, w, hh, crop) {
    var c = document.createElement('canvas');
    c.width = w; c.height = hh;
    var g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    if (crop) g.drawImage(src, crop[0], crop[1], crop[2], crop[3], 0, 0, w, hh); else g.drawImage(src, 0, 0, w, hh);
    return c;
  }
  function blobOf(c, type, q) { return new Promise(function (ok) { c.toBlob(ok, type, q); }); }
  function encode(c, q) {
    return blobOf(c, 'image/webp', q).then(function (b) {
      if (b && b.type === 'image/webp') return { blob: b, ext: 'webp' };
      return blobOf(c, 'image/jpeg', q).then(function (j) { return { blob: j, ext: 'jpg' }; });
    });
  }
  // the photo at most 1600 pixels across, and its lighter copies: base is its path without extension (assets/img/…)
  function makePhoto(src, base) {
    var sw = src.width, sh = src.height, k = Math.min(1, 1600 / Math.max(sw, sh));
    var w = Math.round(sw * k), hh = Math.round(sh * k);
    var out = { w: w, h: hh, files: [] };
    return encode(canvasOf(src, w, hh), 0.84).then(function (main) {
      out.path = base + '.' + main.ext;
      out.files.push({ path: out.path, blob: main.blob });
      if (main.ext !== 'webp') return out;
      var rest = base.slice('assets/img/'.length);
      return [480, 960].reduce(function (p, W) {
        return p.then(function () {
          if (w < W * 1.25) return;
          return blobOf(canvasOf(src, W, Math.round(hh * W / w)), 'image/webp', 0.76).then(function (b) { out.files.push({ path: 'assets/img/_w/' + W + '/' + rest + '.webp', blob: b }); });
        });
      }, Promise.resolve()).then(function () { return out; });
    });
  }
  var previewName = function (path) { return 'assets/img/og/' + path.replace(/^assets\/img\//, '').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.jpg'; };
  // the picture of a link preview, 1200 x 630, cut around the height chosen (0 top, 1 bottom)
  function makePreview(src, path, focus) {
    var sw = src.width, sh = src.height, R = 1200 / 630, cw, ch, x, y;
    if (sw / sh > R) { ch = sh; cw = sh * R; x = (sw - cw) / 2; y = 0; } else { cw = sw; ch = sw / R; x = 0; y = Math.max(0, Math.min(sh - ch, sh * focus - ch / 2)); }
    var c = canvasOf(src, 1200, 630, [x, y, cw, ch]);
    return blobOf(c, 'image/jpeg', 0.82).then(function (b) {
      return b.size > 240 * 1024 ? blobOf(c, 'image/jpeg', 0.68) : b;
    }).then(function (b) { return { path: previewName(path), blob: b }; });
  }
  function base64(blob) {
    return blob.arrayBuffer().then(function (buf) {
      var bytes = new Uint8Array(buf), s = '';
      for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return btoa(s);
    });
  }
  function upload(files, say) {
    var done = [];
    return files.reduce(function (p, f, i) {
      return p.then(function () {
        say('Sending the photos: ' + (i + 1) + ' of ' + files.length + '…');
        return base64(f.blob).then(function (data) { return call('upload', { path: f.path, data: data }); }).then(function (r) { done.push({ path: r.path, sha: r.sha }); });
      });
    }, Promise.resolve()).then(function () { return done; });
  }
  var FOCUS = [['', 'Middle', 0.45], ['center 15%', 'Top', 0.15], ['center 30%', 'Upper part', 0.3], ['center 70%', 'Lower part', 0.7], ['center 85%', 'Bottom', 0.85]];
  var focusOf = function (cover) { var f = FOCUS.find(function (x) { return x[0] === (cover || ''); }); return f ? f[2] : 0.45; };

  /* ---------- form fields ---------- */
  function field(label, input, note) { return h('label', { class: 'field' }, h('span', null, label, note ? [' ', h('em', { text: note })] : null), input); }
  function counted(input, max) {
    var c = h('span', { class: 'count' });
    var upd = function () { var n = input.value.length; c.textContent = n + ' / ' + max; c.classList.toggle('over', n > max); };
    input.addEventListener('input', upd); upd();
    return [input, c];
  }
  var lang = function (l) { return h('span', { class: 'lang', text: l.toUpperCase() }); };
  function textIn(v, ph) { return h('input', { type: 'text', value: v || '', placeholder: ph || '' }); }
  function area(v, cls) { return h('textarea', { class: cls || null, value: v || '' }); }
  // a pair of inputs, English and French; get() gives { en, fr }
  function pair(label, v, opts) {
    opts = opts || {};
    var o = two(v), ins = {};
    var cells = ['en', 'fr'].map(function (l) {
      var i = opts.area ? area(o[l], opts.cls) : textIn(o[l], opts.ph && opts.ph[l]);
      ins[l] = i;
      return h('label', { class: 'field' }, h('span', null, lang(l), label, opts.note ? [' ', h('em', { text: opts.note })] : null), opts.max ? counted(i, opts.max) : i);
    });
    return { el: cells, get: function () { return { en: ins.en.value.trim(), fr: ins.fr.value.trim() }; }, ins: ins };
  }

  /* ---------- the page ---------- */
  var tabs = document.querySelector('.top__tabs'), userEl = document.querySelector('.top__user'), outBtn = document.querySelector('.top__out');
  outBtn.addEventListener('click', function () { call('logout').then(function () { S.user = null; signin(); }); });
  function chrome(on) {
    tabs.hidden = userEl.hidden = outBtn.hidden = !on;
    if (on) userEl.textContent = S.user;
    var tab = (location.hash.slice(1).split('/')[0]) || 'projects';
    if (tab === 'project') tab = 'projects';
    if (tab === 'article') tab = 'blog';
    [].forEach.call(tabs.querySelectorAll('a'), function (a) { if (a.getAttribute('data-tab') === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  function screen() { app.textContent = ''; for (var i = 0; i < arguments.length; i++) add(app, arguments[i]); window.scrollTo(0, 0); }

  function start() {
    call('me').then(function (r) {
      if (r.missing && r.missing.length) return setupScreen(r.missing);
      if (!r.user) return signin();
      S.user = r.user;
      load().then(route);
    }).catch(function (e) { screen(h('p', { class: 'wait', text: e.message })); });
  }
  function setupScreen(missing) {
    chrome(false);
    screen(h('div', { class: 'setup' },
      h('h1', { text: 'The admin is almost ready' }),
      h('p', { class: 'lead', text: 'It needs two settings in the Vercel project of the site (Project → Settings → Environment Variables), then a new deployment:' }),
      h('ul', null,
        h('li', null, h('code', { text: 'ADMIN_USERS' }), ': who may sign in, one person per line: ', h('code', { text: 'Name:password' }), ' (a password of at least 12 characters each).'),
        h('li', null, h('code', { text: 'GITHUB_TOKEN' }), ': a GitHub fine-grained token for the repository of the site, with “Contents: Read and write”.')),
      h('p', { class: 'hint', text: 'Missing now: ' + missing.join(', ') + '.' })));
  }
  function signin(msg) {
    chrome(false);
    var name = textIn('', ''), pass = h('input', { type: 'password', autocomplete: 'current-password' }), err = h('p', { class: 'error', text: msg || '' }), btn = h('button', { class: 'btn', type: 'submit', text: 'Sign in' });
    name.setAttribute('autocomplete', 'username');
    var form = h('form', { class: 'signin', onsubmit: function (e) {
      e.preventDefault();
      btn.disabled = true; err.textContent = '';
      call('login', { name: name.value, password: pass.value }).then(function (r) { S.user = r.user; return load(); }).then(route).catch(function (e2) { err.textContent = e2.message; btn.disabled = false; });
    } }, h('h1', { text: 'Sign in' }), field('Your name', name), field('Password', pass), err, btn);
    screen(form);
    name.focus();
  }
  function load() {
    return Promise.all([call('load'), fetch('/assets/admin/site.json?t=' + Date.now()).then(function (r) { return r.json(); }).catch(function () { return null; })]).then(function (x) {
      S.content = x[0].content; S.voices = x[0].voices; S.blog = x[0].blog; S.site = x[1] || { events: [], services: [], cities: [], published: { projects: {}, blog: {} } };
      S.order = null;
    });
  }
  function route() {
    if (!S.user) return;
    var parts = location.hash.slice(1).split('/'), what = parts[0] || 'projects', id = decodeURIComponent(parts[1] || '');
    S.dirty = false;
    chrome(true);
    if (what === 'project') return editProject(id === 'new' ? null : S.content.projects.find(function (p) { return p.id === id; }));
    if (what === 'article') return editArticle(id === 'new' ? null : S.blog.find(function (g) { return g.id === id; }));
    if (what === 'blog') return blogList();
    if (what === 'voices') return voicesEditor();
    return projectList();
  }
  window.addEventListener('hashchange', function () {
    if (S.dirty && !confirm('Leave without saving your changes?')) { history.back(); return; }
    route();
  });
  window.addEventListener('beforeunload', function (e) { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });
  var go = function (hash) { S.dirty = false; if (location.hash === hash) route(); else location.hash = hash; };
  var watchDirty = function (el) { el.addEventListener('input', function () { S.dirty = true; }); el.addEventListener('change', function () { S.dirty = true; }); };

  /* ---------- online yet? ---------- */
  function badge(kind, id, draft) {
    if (draft) return h('span', { class: 'badge badge--draft', text: 'Draft' });
    var pend = kind === 'voices' ? S.pending.voices : S.pending[kind][id];
    if (pend) return h('span', { class: 'badge badge--wait', text: 'Going online…' });
    var pub = S.site && S.site.published && S.site.published[kind];
    return pub && pub[id] !== undefined ? h('span', { class: 'badge badge--live', text: 'Online' }) : h('span', { class: 'badge badge--wait', text: 'Not online yet' });
  }
  var watching = null, watchStart = 0;
  function watch() {
    if (watching) return;
    watchStart = Date.now();
    watching = setInterval(function () {
      fetch('/assets/admin/site.json?t=' + Date.now()).then(function (r) { return r.json(); }).then(function (site) {
        S.site = site;
        var pub = site.published || {}, changed = false;
        Object.keys(S.pending.projects).forEach(function (id) { if ((pub.projects || {})[id] === S.pending.projects[id]) { delete S.pending.projects[id]; changed = true; toast('The project is now online.'); } });
        Object.keys(S.pending.blog).forEach(function (id) { if ((pub.blog || {})[id] === S.pending.blog[id]) { delete S.pending.blog[id]; changed = true; toast('The article is now online.'); } });
        if (S.pending.voices && pub.voices === S.pending.voices) { S.pending.voices = ''; changed = true; toast('The quotes and figures are now online.'); }
        var left = Object.keys(S.pending.projects).length + Object.keys(S.pending.blog).length + (S.pending.voices ? 1 : 0);
        if (!left || Date.now() - watchStart > 8 * 60e3) {
          clearInterval(watching); watching = null;
          if (left) toast('Your change is saved, but the site has not shown it yet. Check the deployments in Vercel.', true);
        }
        if (changed && !S.dirty && /^(#projects|#blog|#voices|)$/.test(location.hash)) route();
      }).catch(function () {});
    }, 10000);
  }

  /* ---------- projects ---------- */
  function projectList() {
    var list = S.order || S.content.projects.slice();
    var kinds = S.content.kinds, places = S.content.places;
    var orderBar = S.order ? h('div', { class: 'box bar' }, h('span', { text: 'The order has changed.' }), h('span', null,
      h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: 'Undo', onclick: function () { S.order = null; route(); } }), ' ',
      h('button', { class: 'btn btn--sm', type: 'button', text: 'Save the new order', onclick: function (e) {
        e.target.disabled = true;
        call('orderProjects', { order: S.order.map(function (p) { return p.id; }) }).then(function () { toast('Order saved. The site updates in about a minute.'); return load(); }).then(route).catch(function (err) { e.target.disabled = false; toast(err.message, true); });
      } }))) : null;
    var move = function (i, d) { var a = (S.order || S.content.projects).slice(), j = i + d; if (j < 0 || j >= a.length) return; var t = a[i]; a[i] = a[j]; a[j] = t; S.order = a; route(); };
    screen(
      h('div', { class: 'bar' }, h('div', null, h('h1', { text: 'Projects' }), h('p', { class: 'lead', text: 'The portfolio of the site, in the order it is shown: the first one opens it. A draft stays off the site until you untick “Draft”.' })),
        h('button', { class: 'btn', type: 'button', text: '+ New project', onclick: function () { go('#project/new'); } })),
      orderBar,
      list.length ? h('div', { class: 'list' }, list.map(function (p, i) {
        var img = h('img', { class: 'row__ph', src: '/' + p.photos[0][0], alt: '', loading: 'lazy' });
        img.onerror = function () { img.removeAttribute('src'); };
        return h('div', { class: 'row' }, img,
          h('div', null, h('div', { class: 'row__t' }, tr(p.title, 'en'), badge('projects', p.id, p.draft)),
            h('div', { class: 'row__m', text: [tr(kinds[p.kind], 'en'), p.city && places[p.city] ? tr(places[p.city], 'en') : '', tr(p.date, 'en'), p.photos.length + ' photo' + (p.photos.length > 1 ? 's' : '')].filter(Boolean).join(' · ') })),
          h('div', { class: 'row__a' },
            h('button', { class: 'btn btn--ghost btn--sm', type: 'button', title: 'Move up', 'aria-label': 'Move up', text: '↑', disabled: i === 0, onclick: function () { move(i, -1); } }),
            h('button', { class: 'btn btn--ghost btn--sm', type: 'button', title: 'Move down', 'aria-label': 'Move down', text: '↓', disabled: i === list.length - 1, onclick: function () { move(i, 1); } }),
            !p.draft ? h('a', { class: 'btn btn--ghost btn--sm', href: '/projects/' + p.id, target: '_blank', rel: 'noopener', text: 'View' }) : null,
            h('button', { class: 'btn btn--sm', type: 'button', text: 'Edit', onclick: function () { go('#project/' + encodeURIComponent(p.id)); } })));
      })) : h('p', { class: 'empty', text: 'No project yet.' }));
  }

  function editProject(p) {
    var isNew = !p;
    p = p ? clone(p) : { id: '', title: { en: '', fr: '' }, kind: '', intro: { en: '', fr: '' }, photos: [], draft: true };
    var kinds = S.content.kinds, places = S.content.places;
    var title = pair('Title', p.title, { ph: { en: 'CUPRA Open Day', fr: 'Journée portes ouvertes CUPRA' } });
    var id = textIn(p.id, 'cupra-open-day');
    if (!isNew) id.disabled = true;
    var idTouched = !isNew;
    id.addEventListener('input', function () { idTouched = true; });
    title.ins.en.addEventListener('input', function () { if (!idTouched) id.value = slugify(title.ins.en.value, 60); });
    var kind = h('select', null, h('option', { value: '', text: 'Choose…' }), Object.keys(kinds).map(function (k) { return h('option', { value: k, text: kinds[k].en + ' / ' + kinds[k].fr }); }), h('option', { value: '+', text: '+ A new kind…' }));
    kind.value = p.kind || '';
    var newKind = pair('New kind', { en: '', fr: '' }, { ph: { en: 'Gala dinner', fr: 'Dîner de gala' } });
    var newKindBox = h('div', { class: 'grid full', hidden: true }, newKind.el);
    kind.addEventListener('change', function () { newKindBox.hidden = kind.value !== '+'; });
    var draft = h('input', { type: 'checkbox', checked: !!p.draft });
    var client = textIn(tr(p.client, 'en'), 'CUPRA');
    var city = h('select', null, h('option', { value: '', text: '—' }), Object.keys(places).map(function (k) { return h('option', { value: k, text: tr(places[k], 'en') }); }));
    city.value = p.city || '';
    var venue = textIn(p.venue, 'Fairmont Tazi Palace');
    var date = pair('Date', p.date, { ph: { en: 'November 2026', fr: 'Novembre 2026' } });
    var guests = textIn(p.guests == null ? '' : String(p.guests), '300');
    var intro = pair('Introduction', p.intro, { area: true, max: 320, note: 'one or two sentences, shown at the top' });
    var did = pair('What we delivered', { en: (p.did && p.did.en || []).join('\n'), fr: (p.did && p.did.fr || []).join('\n') }, { area: true, cls: 'tall', note: 'one line each' });
    var story = pair('The project', { en: (p.story && p.story.en || []).join('\n\n'), fr: (p.story && p.story.fr || []).join('\n\n') }, { area: true, cls: 'tall', note: 'optional; an empty line between paragraphs' });
    var result = pair('The result', p.result, { area: true, note: 'optional, one sentence' });
    var q = p.quote || {};
    var qText = pair('What the client said', q.text, { area: true, note: 'optional, with their agreement' });
    var qName = textIn(q.name, 'First name Last name'), qRole = pair('Their role', q.role), qCompany = textIn(q.company);
    var cover = h('select', null, FOCUS.map(function (f) { return h('option', { value: f[0], text: f[1] }); }));
    cover.value = p.cover || '';

    // the photos: those already on the site, and those added now
    var photos = p.photos.map(function (x) { return { path: x[0], w: x[1], h: x[2], src: '/' + x[0] }; });
    var firstBefore = photos[0] && photos[0].path;
    var grid = h('div', { class: 'photos' });
    var drawPhotos = function () {
      grid.textContent = '';
      photos.forEach(function (ph, i) {
        var img = h('img', { src: ph.src, alt: '' });
        grid.appendChild(h('div', { class: 'ph' }, img, i === 0 ? h('span', { class: 'ph__tag', text: 'Cover' }) : null, ph.file ? h('span', { class: 'ph__tag ph__tag--new', text: 'New' }) : null,
          h('div', { class: 'ph__a' },
            h('button', { type: 'button', title: 'Earlier', 'aria-label': 'Earlier', text: '←', disabled: i === 0, onclick: function () { photos.splice(i - 1, 0, photos.splice(i, 1)[0]); S.dirty = true; drawPhotos(); } }),
            h('button', { type: 'button', title: 'Later', 'aria-label': 'Later', text: '→', disabled: i === photos.length - 1, onclick: function () { photos.splice(i + 1, 0, photos.splice(i, 1)[0]); S.dirty = true; drawPhotos(); } }),
            h('button', { type: 'button', title: 'Remove', 'aria-label': 'Remove', text: '✕', onclick: function () { photos.splice(i, 1); S.dirty = true; drawPhotos(); } }))));
      });
    };
    var addFiles = function (files) {
      [].forEach.call(files, function (f) { if (/^image\//.test(f.type) || /\.(jpe?g|png|webp|heic)$/i.test(f.name)) photos.push({ file: f, src: URL.createObjectURL(f) }); });
      S.dirty = true; drawPhotos();
    };
    drawPhotos();

    var msg = h('span', { class: 'save__msg' });
    var saveBtn = h('button', { class: 'btn', type: 'button', text: isNew ? 'Save the project' : 'Save the changes' });
    var form = h('div', { class: 'form' },
      h('div', { class: 'bar' }, h('div', null, h('h1', { text: isNew ? 'New project' : tr(p.title, 'en') }), h('p', { class: 'lead', text: 'English and French side by side. Fields marked * are needed; the others appear on the page only when filled in.' }))),
      h('section', { class: 'box' }, h('h2', { text: 'The project' }),
        h('div', { class: 'grid' }, title.el,
          field('Address of its page *', id, isNew ? 'ben.events/projects/… — letters, digits and dashes; it cannot change later' : 'cannot change'),
          field('Kind of event *', kind), newKindBox,
          h('label', { class: 'check full' }, draft, 'Draft — keep it off the site for now'))),
      h('section', { class: 'box' }, h('h2', { text: 'Photos *' }), h('p', { class: 'hint', text: 'The first one is the cover. Photos are resized and compressed here before they are sent.' }),
        h('label', { class: 'drop', ondragover: function (e) { e.preventDefault(); e.currentTarget.classList.add('is-over'); }, ondragleave: function (e) { e.currentTarget.classList.remove('is-over'); }, ondrop: function (e) { e.preventDefault(); e.currentTarget.classList.remove('is-over'); addFiles(e.dataTransfer.files); } },
          h('b', { text: 'Add photos' }), h('span', { text: 'Click to choose them, or drop them here' }),
          h('input', { type: 'file', accept: 'image/*', multiple: true, hidden: true, onchange: function (e) { addFiles(e.target.files); e.target.value = ''; } })),
        grid,
        h('div', { class: 'grid', style: 'margin-top:14px' }, field('Part of the cover kept in view on the cards', cover))),
      h('section', { class: 'box' }, h('h2', { text: 'Facts' }), h('p', { class: 'hint', text: 'Only what the client agrees to show.' }),
        h('div', { class: 'grid' }, field('Client', client, 'as they agree to be named'), field('City', city), field('Venue', venue), field('Guests', guests), date.el)),
      h('section', { class: 'box' }, h('h2', { text: 'Text' }), h('div', { class: 'grid' }, intro.el, did.el, story.el, result.el)),
      h('section', { class: 'box' }, h('h2', { text: 'Quote' }), h('div', { class: 'grid' }, qText.el, field('Name', qName), field('Company', qCompany), qRole.el)),
      !isNew ? h('section', { class: 'box' }, h('h2', { text: 'Remove' }), h('p', { class: 'hint', text: 'Takes the project off the site, with the photos that belong only to it.' }),
        h('button', { class: 'btn btn--danger', type: 'button', text: 'Remove this project', onclick: function (e) {
          if (!confirm('Remove “' + tr(p.title, 'en') + '” from the site?')) return;
          e.target.disabled = true;
          call('deleteProject', { id: p.id }).then(function () { toast('Removed. The site updates in about a minute.'); S.dirty = false; return load(); }).then(function () { go('#projects'); }).catch(function (err) { e.target.disabled = false; toast(err.message, true); });
        } })) : null);
    watchDirty(form);
    screen(form, h('div', { class: 'save' }, msg, h('button', { class: 'btn btn--ghost', type: 'button', text: 'Back', onclick: function () { go('#projects'); } }), saveBtn));
    if (isNew) title.ins.en.focus();

    saveBtn.addEventListener('click', function () {
      var say = function (t, cls) { msg.textContent = t; msg.className = 'save__msg' + (cls ? ' ' + cls : ''); };
      var pid = id.value.trim(), t = title.get(), it = intro.get();
      var problem = !t.en || !t.fr ? 'The title is needed in English and in French.' : !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(pid) ? 'The address may only use lowercase letters, digits and dashes.'
        : !kind.value || (kind.value === '+' && (!newKind.get().en || !newKind.get().fr)) ? 'Choose the kind of event (or name the new one in both languages).'
        : !it.en || !it.fr ? 'The introduction is needed in English and in French.' : !photos.length ? 'Add at least one photo.' : '';
      if (problem) return say(problem, 'is-bad');
      saveBtn.disabled = true;
      var folder = 'assets/img/projects/' + pid + '/';
      var used = photos.filter(function (x) { return x.path && x.path.indexOf(folder) === 0; }).map(function (x) { return parseInt(x.path.slice(folder.length), 10) || 0; });
      var next = Math.max.apply(null, [0].concat(used)) + 1;
      var files = [], focus = focusOf(cover.value);
      say('Preparing the photos…');
      photos.reduce(function (pr, ph, i) {
        return pr.then(function () {
          if (ph.file) {
            var src;
            return decode(ph.file).then(function (s) { src = s; return makePhoto(src, folder + String(next++).padStart(2, '0')); }).then(function (made) {
              ph.path = made.path; ph.w = made.w; ph.h = made.h; files = files.concat(made.files);
              if (i === 0) return makePreview(src, made.path, focus).then(function (pv) { files.push(pv); });
            });
          }
          // a cover chosen among the photos already there: its link preview is made if it has none
          if (i === 0 && (ph.path !== firstBefore || isNew)) {
            return fetch('/' + previewName(ph.path), { method: 'HEAD' }).then(function (r) {
              if (r.ok) return;
              return decode(ph.src).then(function (src) { return makePreview(src, ph.path, focus); }).then(function (pv) { files.push(pv); });
            }).catch(function () {});
          }
        });
      }, Promise.resolve()).then(function () {
        return upload(files, say);
      }).then(function (sent) {
        say('Saving…');
        var kid = kind.value, nk = null;
        if (kid === '+') { nk = newKind.get(); kid = slugify(nk.en, 40); nk.id = kid; }
        var lines2 = function (pr) { var v = pr.get(); return { en: linesOf(v.en), fr: linesOf(v.fr) }; };
        var paras2 = function (pr) { var v = story.get(); return { en: parasOf(v.en), fr: parasOf(v.fr) }; };
        var project = {
          id: pid, title: t, kind: kid, client: client.value.trim(), city: city.value, venue: venue.value.trim(), date: date.get(), guests: guests.value.trim(),
          did: lines2(did), story: paras2(story), result: result.get(), intro: it, cover: cover.value, draft: draft.checked,
          quote: { text: qText.get(), name: qName.value.trim(), role: qRole.get(), company: qCompany.value.trim() },
          photos: photos.map(function (x) { return [x.path, x.w, x.h]; })
        };
        return call('saveProject', { project: project, files: sent, isNew: isNew, newKind: nk });
      }).then(function (r) {
        S.dirty = false;
        if (!draft.checked) { S.pending.projects[r.id] = r.saved; watch(); }
        toast(draft.checked ? 'Saved as a draft: it stays off the site.' : 'Saved. The site updates in about a minute; this page will say when it is online.');
        return load().then(function () { go('#projects'); });
      }).catch(function (err) { saveBtn.disabled = false; say(err.message, 'is-bad'); });
    });
  }

  /* ---------- the blog ---------- */
  function blogList() {
    var list = S.blog.slice().sort(function (a, b) { return (b.updated || b.date).localeCompare(a.updated || a.date) || (a.order || 0) - (b.order || 0); });
    screen(
      h('div', { class: 'bar' }, h('div', null, h('h1', { text: 'Blog' }), h('p', { class: 'lead', text: 'Articles that answer what clients ask before an event. The newest is shown first on the site.' })),
        h('button', { class: 'btn', type: 'button', text: '+ New article', onclick: function () { go('#article/new'); } })),
      list.length ? h('div', { class: 'list' }, list.map(function (g) {
        var img = h('img', { class: 'row__ph', src: '/' + g.image[0], alt: '', loading: 'lazy' });
        img.onerror = function () { img.removeAttribute('src'); };
        return h('div', { class: 'row' }, img,
          h('div', null, h('div', { class: 'row__t' }, g.title.en.join(' '), badge('blog', g.id, g.draft)), h('div', { class: 'row__m', text: (g.updated || g.date) + ' · ' + g.body.en.length + ' parts' })),
          h('div', { class: 'row__a' },
            !g.draft ? h('a', { class: 'btn btn--ghost btn--sm', href: '/blog/' + g.slug.en, target: '_blank', rel: 'noopener', text: 'View' }) : null,
            h('button', { class: 'btn btn--sm', type: 'button', text: 'Edit', onclick: function () { go('#article/' + encodeURIComponent(g.id)); } })));
      })) : h('p', { class: 'empty', text: 'No article yet.' }));
  }

  function partsEditor(list) {
    var box = h('div', { class: 'parts' }), parts = list.map(function (s) { return { h: s.h, p: (s.p || []).join('\n\n'), list: (s.list || []).join('\n'), after: (s.after || []).join('\n\n') }; });
    if (!parts.length) parts.push({ h: '', p: '', list: '', after: '' });
    var draw = function () {
      box.textContent = '';
      parts.forEach(function (s, i) {
        var hh = textIn(s.h), p = area(s.p, 'tall'), li = area(s.list), af = area(s.after);
        hh.addEventListener('input', function () { s.h = hh.value; }); p.addEventListener('input', function () { s.p = p.value; });
        li.addEventListener('input', function () { s.list = li.value; }); af.addEventListener('input', function () { s.after = af.value; });
        box.appendChild(h('div', { class: 'part' },
          h('div', { class: 'part__top' }, h('b', { text: 'Part ' + (i + 1) }),
            h('button', { type: 'button', text: '↑', 'aria-label': 'Move up', disabled: i === 0, onclick: function () { parts.splice(i - 1, 0, parts.splice(i, 1)[0]); draw(); } }),
            h('button', { type: 'button', text: '↓', 'aria-label': 'Move down', disabled: i === parts.length - 1, onclick: function () { parts.splice(i + 1, 0, parts.splice(i, 1)[0]); draw(); } }),
            h('button', { type: 'button', text: 'Remove', onclick: function () { if (parts.length > 1 && confirm('Remove this part?')) { parts.splice(i, 1); draw(); } } })),
          field('Heading', hh), field('Text', p, 'an empty line between paragraphs'), field('List', li, 'optional, one line each'), field('Text after the list', af, 'optional')));
      });
      box.appendChild(h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '+ Add a part', onclick: function () { parts.push({ h: '', p: '', list: '', after: '' }); draw(); } }));
    };
    draw();
    return { el: box, get: function () { return parts.map(function (s) { return { h: s.h.trim(), p: parasOf(s.p), list: linesOf(s.list), after: parasOf(s.after) }; }).filter(function (s) { return s.h && (s.p.length || s.list.length); }); } };
  }

  function editArticle(g) {
    var isNew = !g;
    g = g ? clone(g) : { id: '', slug: { en: '', fr: '' }, date: today(), title: { en: ['', ''], fr: ['', ''] }, short: { en: '', fr: '' }, card: { en: '', fr: '' }, lede: { en: '', fr: '' }, seo: { title: { en: '', fr: '' }, desc: { en: '', fr: '' } }, body: { en: [], fr: [] }, related: {}, draft: true };
    var t1 = pair('Title, first part', { en: g.title.en[0], fr: g.title.fr[0] }, { ph: { en: 'How to organise a corporate seminar', fr: 'Organiser un séminaire d’entreprise' } });
    var t2 = pair('Title, second part (in italics)', { en: g.title.en[1], fr: g.title.fr[1] }, { ph: { en: 'in Morocco', fr: 'au Maroc' } });
    var slugEn = textIn(g.slug.en), slugFr = textIn(g.slug.fr), touched = { en: !isNew, fr: !isNew };
    slugEn.addEventListener('input', function () { touched.en = true; }); slugFr.addEventListener('input', function () { touched.fr = true; });
    var auto = function () {
      if (!touched.en) slugEn.value = slugify(t1.ins.en.value + ' ' + t2.ins.en.value, 90);
      if (!touched.fr) slugFr.value = slugify(t1.ins.fr.value + ' ' + t2.ins.fr.value, 90);
    };
    [t1, t2].forEach(function (x) { x.ins.en.addEventListener('input', auto); x.ins.fr.addEventListener('input', auto); });
    var date = h('input', { type: 'date', value: g.date }), updated = h('input', { type: 'date', value: g.updated || '' });
    var draft = h('input', { type: 'checkbox', checked: !!g.draft });
    var short = pair('Short name for menus', g.short, { max: 32 }), card = pair('Card sentence', g.card, { area: true, max: 160 }), lede = pair('Introduction', g.lede, { area: true, max: 260 });
    var seoT = pair('Title in Google', g.seo.title, { max: 65, note: 'empty: made from the title' }), seoD = pair('Description in Google', g.seo.desc, { area: true, max: 160, note: 'empty: made from the introduction' });
    var bodies = { en: partsEditor(g.body.en), fr: partsEditor(g.body.fr) }, shown = 'en';
    var bodyBox = h('div');
    var langBtns = ['en', 'fr'].map(function (l) { return h('button', { type: 'button', 'aria-pressed': String(l === shown), text: l === 'en' ? 'English' : 'Français', onclick: function () { shown = l; langBtns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(['en', 'fr'][k] === l)); }); bodyBox.textContent = ''; bodyBox.appendChild(bodies[l].el); } }); });
    bodyBox.appendChild(bodies.en.el);
    var chips = function (key, items, name) {
      var sel = (g.related[key] || []).slice();
      return { el: h('div', { class: 'field full' }, h('span', { text: name }), h('div', { class: 'chips' }, items.map(function (x) {
        var c = h('input', { type: 'checkbox', checked: sel.indexOf(x.id) >= 0, onchange: function () { var k = sel.indexOf(x.id); if (c.checked && k < 0) sel.push(x.id); if (!c.checked && k >= 0) sel.splice(k, 1); } });
        return h('label', null, c, x.name);
      }))), get: function () { return sel; } };
    };
    var site = S.site || {};
    var rEvents = chips('events', (site.events || []).map(function (e) { return { id: e.id, name: tr(e.name, 'en') }; }), 'Event pages');
    var rServices = chips('services', (site.services || []).map(function (s) { return { id: s.id, name: tr(s.name, 'en') }; }), 'Services');
    var rCities = chips('cities', (site.cities || []).map(function (c) { return { id: c.id, name: tr(c.name, 'en') }; }), 'Cities');
    var rGuides = chips('guides', S.blog.filter(function (x) { return x.id !== g.id; }).map(function (x) { return { id: x.id, name: x.title.en.join(' ') }; }), 'Other articles');

    var image = g.image ? { path: g.image[0], w: g.image[1], h: g.image[2], src: '/' + g.image[0] } : null;
    var imgBox = h('div', { class: 'photos' });
    var drawImg = function () { imgBox.textContent = ''; if (image) imgBox.appendChild(h('div', { class: 'ph' }, h('img', { src: image.src, alt: '' }), image.file ? h('span', { class: 'ph__tag ph__tag--new', text: 'New' }) : null)); };
    drawImg();

    var msg = h('span', { class: 'save__msg' }), saveBtn = h('button', { class: 'btn', type: 'button', text: isNew ? 'Save the article' : 'Save the changes' });
    var form = h('div', { class: 'form' },
      h('div', { class: 'bar' }, h('div', null, h('h1', { text: isNew ? 'New article' : g.title.en.join(' ') }), h('p', { class: 'lead', text: 'Write it in English and in French. Advice in our own words; examples only from our real projects.' }))),
      h('section', { class: 'box' }, h('h2', { text: 'Title and address' }), h('div', { class: 'grid' }, t1.el, t2.el,
        field('Address in English *', slugEn, 'ben.events/blog/…'), field('Address in French *', slugFr, 'ben.events/fr/blog/…'),
        field('Published on', date), field('Updated on', updated, 'optional'),
        h('label', { class: 'check full' }, draft, 'Draft — keep it off the site for now'))),
      h('section', { class: 'box' }, h('h2', { text: 'Photo *' }), h('p', { class: 'hint', text: 'A real photo of one of our events. It is resized and compressed here before it is sent.' }),
        h('label', { class: 'drop' }, h('b', { text: image ? 'Replace the photo' : 'Choose a photo' }),
          h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: function (e) { var f = e.target.files[0]; if (f) { image = { file: f, src: URL.createObjectURL(f) }; S.dirty = true; drawImg(); } } })),
        imgBox),
      h('section', { class: 'box' }, h('h2', { text: 'Summary' }), h('div', { class: 'grid' }, short.el, card.el, lede.el)),
      h('section', { class: 'box' }, h('h2', { text: 'The article' }),
        h('p', { class: 'hint' }, 'To link to a page of the site, write {words|kind:name}, for example {our CUPRA open day|project:cupra-open-day} or {gala evenings|event:gala}. Kinds: project, event, service, city, guide.'),
        h('div', { class: 'tabs2' }, langBtns), bodyBox),
      h('section', { class: 'box' }, h('h2', { text: 'In Google' }), h('div', { class: 'grid' }, seoT.el, seoD.el)),
      h('section', { class: 'box' }, h('h2', { text: 'To go further' }), h('p', { class: 'hint', text: 'The pages shown at the end of the article.' }), h('div', { class: 'grid' }, rEvents.el, rServices.el, rCities.el, rGuides.el)),
      !isNew ? h('section', { class: 'box' }, h('h2', { text: 'Remove' }),
        h('button', { class: 'btn btn--danger', type: 'button', text: 'Remove this article', onclick: function (e) {
          if (!confirm('Remove “' + g.title.en.join(' ') + '” from the site?')) return;
          e.target.disabled = true;
          call('deleteArticle', { id: g.id }).then(function () { toast('Removed. The site updates in about a minute.'); S.dirty = false; return load(); }).then(function () { go('#blog'); }).catch(function (err) { e.target.disabled = false; toast(err.message, true); });
        } })) : null);
    watchDirty(form);
    screen(form, h('div', { class: 'save' }, msg, h('button', { class: 'btn btn--ghost', type: 'button', text: 'Back', onclick: function () { go('#blog'); } }), saveBtn));
    if (isNew) t1.ins.en.focus();

    saveBtn.addEventListener('click', function () {
      var say = function (t, cls) { msg.textContent = t; msg.className = 'save__msg' + (cls ? ' ' + cls : ''); };
      var a = t1.get(), b = t2.get(), body = { en: bodies.en.get(), fr: bodies.fr.get() };
      var id = isNew ? slugify(a.en, 50) : g.id;
      var problem = !a.en || !a.fr || !b.en || !b.fr ? 'The title needs its two parts in English and in French.' : !slugEn.value || !slugFr.value ? 'The addresses are needed.'
        : !image ? 'Choose a photo.' : !body.en.length || !body.fr.length ? 'Write at least one part, with a heading and some text, in each language.'
        : !card.get().en || !card.get().fr || !lede.get().en || !lede.get().fr ? 'The card sentence and the introduction are needed in both languages.' : !id ? 'The title is needed.' : '';
      if (problem) return say(problem, 'is-bad');
      saveBtn.disabled = true;
      var files = [];
      var ready = Promise.resolve();
      if (image.file) {
        say('Preparing the photo…');
        var base = 'assets/img/blog/' + id + '-' + Date.now().toString(36), src;
        ready = decode(image.file).then(function (s) { src = s; return makePhoto(src, base); }).then(function (made) {
          image.path = made.path; image.w = made.w; image.h = made.h; files = files.concat(made.files);
          return makePreview(src, made.path, 0.45);
        }).then(function (pv) { files.push(pv); return upload(files, say); });
      } else ready = Promise.resolve([]);
      ready.then(function (sent) {
        say('Saving…');
        var st = seoT.get(), sd = seoD.get(), ld = lede.get();
        var cut = function (s, n) { return s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[\s,;:.]+$/, '') + '…'; };
        var article = {
          id: id, draft: draft.checked, slug: { en: slugEn.value.trim(), fr: slugFr.value.trim() }, date: date.value || today(), updated: updated.value || '',
          image: [image.path, image.w, image.h], title: { en: [a.en, b.en], fr: [a.fr, b.fr] }, short: short.get(), card: card.get(), lede: ld,
          seo: { title: { en: st.en || (a.en + ' ' + b.en + ' | benevents agency'), fr: st.fr || (a.fr + ' ' + b.fr + ' | benevents agency') }, desc: { en: sd.en || cut(ld.en, 158), fr: sd.fr || cut(ld.fr, 158) } },
          body: body, related: { events: rEvents.get(), services: rServices.get(), cities: rCities.get(), guides: rGuides.get() }
        };
        return call('saveArticle', { article: article, files: sent, isNew: isNew });
      }).then(function (r) {
        S.dirty = false;
        if (!draft.checked) { S.pending.blog[r.id] = r.saved; watch(); }
        toast(draft.checked ? 'Saved as a draft: it stays off the site.' : 'Saved. The site updates in about a minute; this page will say when it is online.');
        return load().then(function () { go('#blog'); });
      }).catch(function (err) { saveBtn.disabled = false; say(err.message, 'is-bad'); });
    });
  }

  /* ---------- client quotes and key figures ---------- */
  function voicesEditor() {
    var v = clone(S.voices || { figures: [], quotes: [] });
    var figs = [0, 1, 2, 3].map(function (i) {
      var f = v.figures[i] || {};
      var value = h('input', { type: 'number', min: '0', value: f.value == null ? '' : String(f.value) }), before = textIn(f.before, '+'), after = textIn(f.after, '+'), label = pair('What it counts', f.label, { ph: { en: 'events delivered', fr: 'événements réalisés' } });
      return { el: h('div', { class: 'part' }, h('div', { class: 'part__top' }, h('b', { text: 'Figure ' + (i + 1) })), h('div', { class: 'grid grid--3' }, field('Number', value), field('Before it', before, 'optional'), field('After it', after, 'optional')), h('div', { class: 'grid' }, label.el)),
        get: function () { return value.value === '' ? null : { value: Number(value.value), before: before.value.trim(), after: after.value.trim(), label: label.get() }; } };
    });
    var quotes = (v.quotes || []).map(function (q) { return q; });
    var qBox = h('div', { class: 'parts' }), qEls = [];
    var drawQ = function () {
      qBox.textContent = ''; qEls = [];
      quotes.forEach(function (q, i) {
        var t = pair('What they said', q.text, { area: true }), name = textIn(q.name), role = pair('Their role', q.role), company = textIn(q.company);
        qEls.push(function () { return { text: t.get(), name: name.value.trim(), role: role.get(), company: company.value.trim() }; });
        qBox.appendChild(h('div', { class: 'part' }, h('div', { class: 'part__top' }, h('b', { text: 'Quote ' + (i + 1) }), h('button', { type: 'button', text: 'Remove', onclick: function () { quotes = qEls.map(function (g2) { return g2(); }); quotes.splice(i, 1); drawQ(); } })),
          h('div', { class: 'grid' }, t.el, field('Name', name), field('Company', company), role.el)));
      });
      qBox.appendChild(h('button', { class: 'btn btn--ghost btn--sm', type: 'button', text: '+ Add a quote', onclick: function () { quotes = qEls.map(function (g2) { return g2(); }); quotes.push({}); drawQ(); } }));
    };
    drawQ();
    var msg = h('span', { class: 'save__msg' }), saveBtn = h('button', { class: 'btn', type: 'button', text: 'Save' });
    var form = h('div', { class: 'form' },
      h('div', { class: 'bar' }, h('div', null, h('h1', { text: 'Quotes & figures' }, badge('voices', '', false)), h('p', { class: 'lead', text: 'Shown on the home page under the client logos, and on the agency page. Only true numbers, and only quotes the clients agreed to, signed with their name.' }))),
      h('section', { class: 'box' }, h('h2', { text: 'Key figures' }), h('p', { class: 'hint', text: 'Up to four. Leave the number empty to leave one out.' }), h('div', { class: 'parts' }, figs.map(function (f) { return f.el; }))),
      h('section', { class: 'box' }, h('h2', { text: 'Client quotes' }), qBox));
    watchDirty(form);
    screen(form, h('div', { class: 'save' }, msg, saveBtn));
    saveBtn.addEventListener('click', function () {
      saveBtn.disabled = true;
      msg.textContent = 'Saving…'; msg.className = 'save__msg';
      var data = { figures: figs.map(function (f) { return f.get(); }).filter(Boolean), quotes: qEls.map(function (g2) { return g2(); }) };
      call('saveVoices', { voices: data }).then(function (r) {
        S.dirty = false; S.pending.voices = r.saved; watch();
        toast('Saved. The site updates in about a minute; this page will say when it is online.');
        return load().then(route);
      }).catch(function (err) { saveBtn.disabled = false; msg.textContent = err.message; msg.className = 'save__msg is-bad'; });
    });
  }

  start();
})();
