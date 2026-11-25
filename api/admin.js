/* benevents agency — the admin of the site (/admin): the team adds and edits projects, blog articles and client
   quotes, and the site goes online with them.

   Every change is a commit to the site's repository on GitHub, on the branch Vercel publishes: Vercel then builds
   the site again (tools/site/build.mjs) and puts it online, about a minute later. Nothing is stored anywhere else.

   What this needs, in the Vercel project (Project → Settings → Environment Variables), then a new deployment:
     ADMIN_USERS    who may sign in, one person per line or separated by ";":  Name:password
                    e.g.  Sara:a-long-password-of-her-own; Youssef:another-long-password
                    A password needs at least 12 characters. Remove a line to remove a person.
                    Or the names only (Sara; Youssef), with one password for all of them in a variable
                    "Password" (or ADMIN_PASSWORD).
     GITHUB_TOKEN   a GitHub "fine-grained personal access token" for the repository axbsoft/ben.events only,
                    with the permission "Contents: Read and write" (github.com → Settings → Developer settings).
   Optional:
     GITHUB_REPO    owner/name of the repository, when it is not the one Vercel deploys
     GITHUB_BRANCH  the branch to write to, when it is not the one this deployment comes from
   Until both are set, the admin page says what is missing and changes nothing.

   What it accepts, and nothing else: the content files (content/projects.json, content/voices.json,
   content/blog/<id>.json) and photos in the folders of the projects, of the blog and of their previews.
   Each person signs in with their own name and password; their name is written on every change they make. */
'use strict';
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const COOKIE = 'ben_admin';
const SESSION_HOURS = 12;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_PHOTO = 3 * 1024 * 1024;           // bytes of one photo, once decoded (the request itself stays under Vercel's 4.5 MB)

/* ---------- configuration ---------- */
const shared = () => (process.env.ADMIN_PASSWORD || process.env.Password || process.env.PASSWORD || '').trim();
function users() {
  return (process.env.ADMIN_USERS || '').split(/[;\n]/).map(x => x.trim()).filter(Boolean).map(x => {
    const k = x.indexOf(':');
    if (k < 0) return { name: x, password: shared() };             // a name only: the shared password
    return k < 1 ? null : { name: x.slice(0, k).trim(), password: x.slice(k + 1).trim() };
  }).filter(u => u && u.name && u.password.length >= 12);
}
function setup() {
  const local = !process.env.VERCEL && process.env.ADMIN_LOCAL_REPO;        // for the tests only: a folder instead of GitHub
  const repo = process.env.GITHUB_REPO || (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG ? process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG : 'axbsoft/ben.events');
  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';
  const missing = [];
  if (!users().length) missing.push(!(process.env.ADMIN_USERS || '').trim() ? 'ADMIN_USERS'
    : 'ADMIN_USERS (Name:password, or names only with a Password variable): every password needs at least 12 characters');
  if (!local && !process.env.GITHUB_TOKEN) missing.push('GITHUB_TOKEN');
  return { local, repo, branch, missing };
}
// the key that signs sessions: it changes, and everyone is signed out, when the people or the token change
const key = () => crypto.createHash('sha256').update('ben.events admin\n' + (process.env.ADMIN_USERS || '') + '\n' + shared() + '\n' + (process.env.GITHUB_TOKEN || process.env.ADMIN_LOCAL_REPO || '')).digest();

/* ---------- sessions ---------- */
const b64u = b => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const sign = data => b64u(crypto.createHmac('sha256', key()).update(data).digest());
function same(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest(), y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
function readSession(req) {
  const raw = (req.headers.cookie || '').split(/;\s*/).map(c => c.split('=')).find(c => c[0] === COOKIE);
  if (!raw || !raw[1]) return null;
  const [data, mac] = raw[1].split('.');
  if (!data || !mac || !same(sign(data), mac)) return null;
  let s;
  try { s = JSON.parse(Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch (e) { return null; }
  if (!s || typeof s.u !== 'string' || !(s.e > Date.now()) || !users().some(u => u.name === s.u)) return null;
  return s.u;
}
function setSession(res, name) {
  const data = b64u(JSON.stringify({ u: name, e: Date.now() + SESSION_HOURS * 3600e3 }));
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE}=${data}.${sign(data)}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${secure}`);
}
const endSession = res => res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0`);

// a few wrong passwords from one address, and it waits a quarter of an hour
const tries = new Map();
function slowedDown(ip) {
  const t = tries.get(ip);
  return t && t.n >= 8 && Date.now() - t.at < 15 * 60e3;
}
function failed(ip) {
  const t = tries.get(ip);
  tries.set(ip, t && Date.now() - t.at < 15 * 60e3 ? { n: t.n + 1, at: t.at } : { n: 1, at: Date.now() });
}

// this site's own page only: a browser says where a request comes from
function sameSite(req) {
  const host = req.headers.host || '', origin = req.headers.origin || '';
  if (origin) { try { return new URL(origin).host === host; } catch (e) { return false; } }
  return req.headers['sec-fetch-site'] === 'same-origin';
}

/* ---------- where the site is kept: GitHub, or a folder for the tests ---------- */
function github({ repo, branch }) {
  const api = async (method, url, body) => {
    const r = await fetch('https://api.github.com/repos/' + repo + url, {
      method, headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'ben.events-admin', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const j = r.status === 204 ? {} : await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error('GitHub ' + r.status + ': ' + (j.message || r.statusText)); e.status = r.status; throw e; }
    return j;
  };
  const enc = p => p.split('/').map(encodeURIComponent).join('/');
  return {
    where: 'github.com/' + repo + ' (' + branch + ')',
    head: async () => (await api('GET', '/git/ref/heads/' + encodeURIComponent(branch))).object.sha,
    read: async (head, p) => {
      try { const f = await api('GET', '/contents/' + enc(p) + '?ref=' + head); return Buffer.from(f.content, 'base64').toString('utf8'); } catch (e) { if (e.status === 404) return null; throw e; }
    },
    list: async (head, dir) => {
      try { const f = await api('GET', '/contents/' + enc(dir) + '?ref=' + head); return Array.isArray(f) ? f.filter(x => x.type === 'file').map(x => x.path) : []; } catch (e) { if (e.status === 404) return []; throw e; }
    },
    blob: async bytes => (await api('POST', '/git/blobs', { content: bytes.toString('base64'), encoding: 'base64' })).sha,
    // one commit for all the changes; false when the branch moved meanwhile (the caller starts again from the new head)
    commit: async (head, changes, message, author) => {
      const base = await api('GET', '/git/commits/' + head);
      const tree = await api('POST', '/git/trees', { base_tree: base.tree.sha, tree: changes.map(c => c.remove ? { path: c.path, mode: '100644', type: 'blob', sha: null }
        : c.sha ? { path: c.path, mode: '100644', type: 'blob', sha: c.sha } : { path: c.path, mode: '100644', type: 'blob', content: c.text }) });
      const made = await api('POST', '/git/commits', { message, tree: tree.sha, parents: [head], author: { name: author + ' (ben.events admin)', email: 'admin@ben.events', date: new Date().toISOString() } });
      try { await api('PATCH', '/git/refs/heads/' + encodeURIComponent(branch), { sha: made.sha, force: false }); } catch (e) { if (e.status === 422 || e.status === 409) return false; throw e; }
      return made.sha;
    }
  };
}
function folder(root) {
  // the photos sent before a save wait in a folder of their own, as they would on GitHub
  const waiting = path.join(root, '.admin-blobs');
  const blobs = { set: (sha, bytes) => { fs.mkdirSync(waiting, { recursive: true }); fs.writeFileSync(path.join(waiting, sha), bytes); }, get: sha => { try { return fs.readFileSync(path.join(waiting, sha)); } catch (e) { return null; } } };
  const abs = p => { const a = path.resolve(root, p); if (!a.startsWith(path.resolve(root) + path.sep)) throw new Error('outside'); return a; };
  return {
    where: root,
    head: async () => 'local',
    read: async (h, p) => { try { return fs.readFileSync(abs(p), 'utf8'); } catch (e) { return null; } },
    list: async (h, dir) => { try { return fs.readdirSync(abs(dir)).map(f => dir + '/' + f).filter(p => fs.statSync(abs(p)).isFile()); } catch (e) { return []; } },
    blob: async bytes => { const sha = crypto.createHash('sha1').update(bytes).digest('hex'); blobs.set(sha, bytes); return sha; },
    commit: async (h, changes, message, author) => {
      if (changes.some(c => c.sha && !blobs.get(c.sha))) throw new Error('a photo was not received');      // all or nothing
      for (const c of changes) {
        const a = abs(c.path);
        if (c.remove) { try { fs.unlinkSync(a); } catch (e) {} continue; }
        fs.mkdirSync(path.dirname(a), { recursive: true });
        fs.writeFileSync(a, c.sha ? blobs.get(c.sha) : c.text);
      }
      fs.appendFileSync(path.join(root, '.admin-log'), JSON.stringify({ message, author, at: new Date().toISOString() }) + '\n');
      return 'local-' + Date.now();
    }
  };
}
const storeOf = cfg => cfg.local ? folder(cfg.local) : github(cfg);

/* ---------- what may be written ---------- */
const PHOTO_PATH = /^assets\/img\/(?:_w\/(?:480|960)\/)?(?:projects\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9-]+|blog\/[a-z0-9]+(?:-[a-z0-9]+)*)\.(?:webp|jpg)$|^assets\/img\/og\/[a-z0-9-]+\.jpg$/;
const ANY_PHOTO = /^assets\/img\/[a-z0-9_\/.-]+\.(?:jpe?g|webp|png)$/i;
function isImage(bytes, p) {
  if (/\.webp$/.test(p)) return bytes.length > 12 && bytes.toString('latin1', 0, 4) === 'RIFF' && bytes.toString('latin1', 8, 12) === 'WEBP';
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

// text as written by a person: no control characters, a reasonable length
const text = (v, max = 400) => typeof v === 'string' || typeof v === 'number' ? String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max) : '';
const both = (v, max) => { const o = v && typeof v === 'object' ? v : { en: v, fr: v }; return { en: text(o.en, max), fr: text(o.fr, max) }; };
const filled = o => !!(o && (o.en || o.fr));
const lines = (v, max = 400, n = 40) => (Array.isArray(v) ? v : []).map(x => text(x, max)).filter(Boolean).slice(0, n);
const bothLines = (v, max, n) => ({ en: lines(v && v.en, max, n), fr: lines(v && v.fr, max, n) });
const photo = v => Array.isArray(v) && ANY_PHOTO.test(String(v[0])) && !String(v[0]).includes('..') && v[1] > 0 && v[1] <= 10000 && v[2] > 0 && v[2] <= 10000 ? [String(v[0]), Math.round(v[1]), Math.round(v[2])] : null;
const bad = msg => { const e = new Error(msg); e.status = 400; throw e; };

function cleanProject(v, content) {
  const p = {};
  p.id = text(v.id, 80);
  if (!SLUG.test(p.id)) bad('The address of the project may only use lowercase letters, digits and dashes.');
  p.title = both(v.title, 160);
  if (!p.title.en || !p.title.fr) bad('The project needs a title in English and in French.');
  p.kind = text(v.kind, 40);
  if (!content.kinds[p.kind]) bad('Choose the kind of event.');
  for (const [k, max] of [['client', 120], ['venue', 120], ['cover', 40]]) { const t = text(v[k], max); if (t) p[k] = t; }
  const city = text(v.city, 40);
  if (city) { if (!content.places[city]) bad('Choose a city from the list.'); p.city = city; }
  const date = both(v.date, 60);
  if (filled(date)) p.date = date;
  const guests = text(v.guests, 20);
  if (guests) p.guests = /^\d+$/.test(guests) ? Number(guests) : guests;
  const did = bothLines(v.did, 200, 20);
  if (did.en.length || did.fr.length) p.did = did;
  const story = bothLines(v.story, 2000, 12);
  if (story.en.length || story.fr.length) p.story = story;
  const result = both(v.result, 400);
  if (filled(result)) p.result = result;
  if (v.quote && text(v.quote.name, 120) && filled(both(v.quote.text, 800))) {
    p.quote = { text: both(v.quote.text, 800), name: text(v.quote.name, 120) };
    const role = both(v.quote.role, 120), company = text(v.quote.company, 120);
    if (filled(role)) p.quote.role = role;
    if (company) p.quote.company = company;
  }
  p.intro = both(v.intro, 600);
  if (!p.intro.en || !p.intro.fr) bad('The project needs its introduction in English and in French.');
  p.photos = (Array.isArray(v.photos) ? v.photos : []).map(photo).filter(Boolean).slice(0, 40);
  if (!p.photos.length) bad('The project needs at least one photo.');
  if (v.draft) p.draft = true;
  p.saved = new Date().toISOString();
  return p;
}
function cleanArticle(v, ids) {
  const g = { id: text(v.id, 80) };
  if (!SLUG.test(g.id)) bad('The name of the article may only use lowercase letters, digits and dashes.');
  g.order = Number.isFinite(+v.order) ? +v.order : 1;
  if (v.draft) g.draft = true;
  g.short = both(v.short, 60);
  g.slug = { en: text(v.slug && v.slug.en, 120), fr: text(v.slug && v.slug.fr, 120) };
  if (!SLUG.test(g.slug.en) || !SLUG.test(g.slug.fr)) bad('The addresses of the article may only use lowercase letters, digits and dashes.');
  g.date = text(v.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g.date)) bad('The date of the article is not valid.');
  const updated = text(v.updated, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(updated) && updated > g.date) g.updated = updated;
  g.image = photo(v.image);
  if (!g.image) bad('The article needs a photo.');
  g.title = {};
  for (const l of ['en', 'fr']) {
    const t = (v.title && Array.isArray(v.title[l]) ? v.title[l] : []).map(x => text(x, 120));
    if (!t[0] || !t[1]) bad('The title needs its two parts in English and in French.');
    g.title[l] = [t[0], t[1]];
  }
  g.card = both(v.card, 300); g.lede = both(v.lede, 400);
  g.seo = { title: both(v.seo && v.seo.title, 90), desc: both(v.seo && v.seo.desc, 200) };
  for (const l of ['en', 'fr']) {
    if (!g.card[l] || !g.lede[l] || !g.seo.title[l] || !g.seo.desc[l]) bad('The article needs its card, introduction and Google title and description in both languages.');
    if (!g.short[l]) g.short[l] = g.title[l][0].slice(0, 60);
  }
  g.body = {};
  for (const l of ['en', 'fr']) {
    g.body[l] = (v.body && Array.isArray(v.body[l]) ? v.body[l] : []).slice(0, 30).map(s => {
      const o = { h: text(s && s.h, 160), p: lines(s && s.p, 3000, 12) };
      const list = lines(s && s.list, 400, 30), after = lines(s && s.after, 3000, 6);
      if (list.length) o.list = list;
      if (after.length) o.after = after;
      return o;
    }).filter(s => s.h && (s.p.length || s.list));
    if (!g.body[l].length) bad('The article needs at least one part, with a heading and some text, in each language.');
  }
  const r = v.related || {};
  g.related = {};
  for (const k of ['events', 'services', 'cities', 'guides']) { const list = (Array.isArray(r[k]) ? r[k] : []).map(x => text(x, 80)).filter(x => SLUG.test(x) && (k !== 'guides' || (ids.includes(x) && x !== g.id))).slice(0, 8); if (list.length) g.related[k] = list; }
  g.saved = new Date().toISOString();
  return g;
}
function cleanVoices(v) {
  const figures = (Array.isArray(v.figures) ? v.figures : []).slice(0, 4).map(f => {
    const o = { value: Number(f && f.value) };
    if (!Number.isFinite(o.value) || o.value < 0) return null;
    const before = text(f.before, 4), after = text(f.after, 8), label = both(f.label, 80);
    if (before) o.before = before;
    if (after) o.after = after;
    o.label = label;
    return label.en && label.fr ? o : null;
  }).filter(Boolean);
  const quotes = (Array.isArray(v.quotes) ? v.quotes : []).slice(0, 12).map(q => {
    const o = { text: both(q && q.text, 800), name: text(q && q.name, 120) };
    if (!filled(o.text) || !o.name) return null;
    const role = both(q.role, 120), company = text(q.company, 120);
    if (filled(role)) o.role = role;
    if (company) o.company = company;
    return o;
  }).filter(Boolean);
  return { figures, quotes, saved: new Date().toISOString() };
}

// the copies and the preview made from a photo: what goes when the photo goes
function companions(p) {
  const out = [p];
  const m = /^assets\/img\/(projects\/.+|blog\/.+)\.(?:webp|jpg)$/.exec(p);
  if (m) {
    for (const w of [480, 960]) out.push('assets/img/_w/' + w + '/' + m[1] + '.webp');
    out.push('assets/img/og/' + m[1].replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.jpg');
  }
  return out;
}
const own = (p, folder) => p.startsWith(folder + '/');

/* ---------- the actions ---------- */
async function change(store, author, message, make) {
  // the branch may move while this runs (someone else saving): start again from its new head
  for (let attempt = 0; attempt < 4; attempt++) {
    const head = await store.head();
    const changes = await make(head);
    if (!changes.length) return { commit: head };
    const sha = await store.commit(head, changes, message, author);
    if (sha) return { commit: sha };
  }
  const e = new Error('The site was being changed by someone else at the same moment. Save again.');
  e.status = 409;
  throw e;
}
async function existing(store, head, paths) {
  const dirs = [...new Set(paths.map(p => p.slice(0, p.lastIndexOf('/'))))];
  const all = new Set((await Promise.all(dirs.map(d => store.list(head, d)))).flat());
  return paths.filter(p => all.has(p));
}
const json = s => JSON.stringify(s, null, 2) + '\n';

const ACTIONS = {
  async load({ store }) {
    const head = await store.head();
    const [projects, voices, names] = await Promise.all([store.read(head, 'content/projects.json'), store.read(head, 'content/voices.json'), store.list(head, 'content/blog')]);
    const blog = (await Promise.all(names.filter(n => n.endsWith('.json')).map(n => store.read(head, n)))).filter(Boolean).map(s => JSON.parse(s));
    return { content: JSON.parse(projects), voices: JSON.parse(voices || '{"figures":[],"quotes":[]}'), blog };
  },
  async upload({ store, body }) {
    const p = text(body.path, 200), data = typeof body.data === 'string' ? body.data : '';
    if (!PHOTO_PATH.test(p)) bad('This photo cannot be saved there.');
    const bytes = Buffer.from(data, 'base64');
    if (!bytes.length || bytes.length > MAX_PHOTO) bad('The photo is empty or too large.');
    if (!isImage(bytes, p)) bad('This file is not a photo.');
    return { path: p, sha: await store.blob(bytes) };
  },
  async saveProject({ store, body, user }) {
    const files = (Array.isArray(body.files) ? body.files : []).filter(f => f && PHOTO_PATH.test(f.path) && /^[0-9a-f]{40}$/.test(f.sha));
    let isNew = false, id = '', saved = '';
    const out = await change(store, user, '', async head => {
      const content = JSON.parse(await store.read(head, 'content/projects.json'));
      if (body.newKind) {
        const k = { id: text(body.newKind.id, 40), en: text(body.newKind.en, 60), fr: text(body.newKind.fr, 60) };
        if (!SLUG.test(k.id) || !k.en || !k.fr) bad('The new kind of event needs a name in English and in French.');
        if (!content.kinds[k.id]) content.kinds[k.id] = { en: k.en, fr: k.fr };
      }
      const p = cleanProject(body.project || {}, content);
      id = p.id; saved = p.saved;
      const at = content.projects.findIndex(x => x.id === p.id);
      isNew = at < 0;
      if (isNew && body.isNew === false) bad('This project no longer exists.');
      if (!isNew && body.isNew) bad('A project already has this address: choose another one.');
      const before = isNew ? null : content.projects[at];
      if (isNew) content.projects.unshift(p); else content.projects[at] = p;
      // the photos of this project that it no longer shows go, with their copies and previews
      const kept = new Set(p.photos.map(x => x[0]));
      const gone = before ? before.photos.map(x => x[0]).filter(x => !kept.has(x) && own(x, 'assets/img/projects/' + p.id)) : [];
      const remove = await existing(store, head, gone.flatMap(companions));
      return [{ path: 'content/projects.json', text: json(content) }, ...files.map(f => ({ path: f.path, sha: f.sha })), ...remove.map(x => ({ path: x, remove: true }))];
    });
    return Object.assign(out, { id, isNew, saved });
  },
  async deleteProject({ store, body, user }) {
    const id = text(body.id, 80);
    return change(store, user, 'Admin: remove the project ' + id + ' (by ' + user + ')', async head => {
      const content = JSON.parse(await store.read(head, 'content/projects.json'));
      const p = content.projects.find(x => x.id === id);
      if (!p) bad('This project no longer exists.');
      content.projects = content.projects.filter(x => x.id !== id);
      const remove = await existing(store, head, p.photos.map(x => x[0]).filter(x => own(x, 'assets/img/projects/' + id)).flatMap(companions));
      return [{ path: 'content/projects.json', text: json(content) }, ...remove.map(x => ({ path: x, remove: true }))];
    });
  },
  // the order of the portfolio: the projects named, in that order; any other (added meanwhile) keeps its place at the top
  async orderProjects({ store, body, user }) {
    const order = (Array.isArray(body.order) ? body.order : []).map(x => text(x, 80));
    return change(store, user, 'Admin: new order of the projects (by ' + user + ')', async head => {
      const content = JSON.parse(await store.read(head, 'content/projects.json'));
      const rank = id => { const i = order.indexOf(id); return i < 0 ? -1 : i; };
      const others = content.projects.filter(p => rank(p.id) < 0), named = content.projects.filter(p => rank(p.id) >= 0).sort((a, b) => rank(a.id) - rank(b.id));
      content.projects = [...others, ...named];
      return [{ path: 'content/projects.json', text: json(content) }];
    });
  },
  async saveArticle({ store, body, user }) {
    const files = (Array.isArray(body.files) ? body.files : []).filter(f => f && PHOTO_PATH.test(f.path) && /^[0-9a-f]{40}$/.test(f.sha));
    let g;
    const out = await change(store, user, '', async head => {
      const names = (await store.list(head, 'content/blog')).filter(n => n.endsWith('.json'));
      const all = (await Promise.all(names.map(n => store.read(head, n)))).filter(Boolean).map(s => JSON.parse(s));
      const ids = all.map(x => x.id);
      const prev = all.find(x => x.id === (body.article && body.article.id));
      if (prev && body.isNew) bad('An article already has this name: choose another one.');
      if (!prev && body.isNew === false) bad('This article no longer exists.');
      g = cleanArticle(Object.assign({}, body.article, { order: prev ? prev.order : all.reduce((m, x) => Math.max(m, x.order || 0), 0) + 1 }), ids);
      for (const l of ['en', 'fr']) if (all.some(x => x.id !== g.id && x.slug && x.slug[l] === g.slug[l])) bad('Another article already has this address.');
      const remove = prev && prev.image && prev.image[0] !== g.image[0] && own(prev.image[0], 'assets/img/blog') ? await existing(store, head, companions(prev.image[0])) : [];
      return [{ path: 'content/blog/' + g.id + '.json', text: json(g) }, ...files.map(f => ({ path: f.path, sha: f.sha })), ...remove.map(x => ({ path: x, remove: true }))];
    });
    return Object.assign(out, { id: g.id, saved: g.saved });
  },
  async deleteArticle({ store, body, user }) {
    const id = text(body.id, 80);
    if (!SLUG.test(id)) bad('This article does not exist.');
    return change(store, user, 'Admin: remove the article ' + id + ' (by ' + user + ')', async head => {
      const raw = await store.read(head, 'content/blog/' + id + '.json');
      if (!raw) bad('This article no longer exists.');
      const g = JSON.parse(raw);
      const remove = g.image && own(g.image[0], 'assets/img/blog') ? await existing(store, head, companions(g.image[0])) : [];
      return [{ path: 'content/blog/' + id + '.json', remove: true }, ...remove.map(x => ({ path: x, remove: true }))];
    });
  },
  async saveVoices({ store, body, user }) {
    const v = cleanVoices(body.voices || {});
    const out = await change(store, user, 'Admin: key figures and client quotes (by ' + user + ')', async () => [{ path: 'content/voices.json', text: json(v) }]);
    return Object.assign(out, { saved: v.saved });
  }
};
// the message of a change names what changed and who changed it
const MESSAGES = {
  saveProject: (b, u) => 'Admin: ' + (b.isNew ? 'add' : 'update') + ' the project ' + text(b.project && b.project.id, 80) + (b.project && b.project.draft ? ' (draft)' : '') + ' (by ' + u + ')',
  saveArticle: (b, u) => 'Admin: ' + (b.isNew ? 'add' : 'update') + ' the article ' + text(b.article && b.article.id, 80) + (b.article && b.article.draft ? ' (draft)' : '') + ' (by ' + u + ')'
};

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  if (!sameSite(req)) return res.status(403).json({ ok: false, error: 'This page only answers the admin of the site.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid' });

  const cfg = setup();
  const action = String(body.action || '');
  if (action === 'me') {
    const user = cfg.missing.length ? null : readSession(req);
    return res.status(200).json({ ok: true, user, missing: cfg.missing, where: cfg.local ? 'local folder' : cfg.repo + ' (' + cfg.branch + ')' });
  }
  if (cfg.missing.length) return res.status(503).json({ ok: false, error: 'The admin is not set up yet: ' + cfg.missing.join(', ') + ' missing in Vercel.' });
  if (action === 'login') {
    const ip = String(req.headers['x-forwarded-for'] || req.socket && req.socket.remoteAddress || '').split(',')[0].trim();
    if (slowedDown(ip)) return res.status(429).json({ ok: false, error: 'Too many attempts. Try again in a quarter of an hour.' });
    const name = text(body.name, 80).toLowerCase(), pass = typeof body.password === 'string' ? body.password : '';
    const u = users().find(x => same(x.name.toLowerCase(), name) && same(x.password, pass));
    if (!u) { failed(ip); await new Promise(r => setTimeout(r, 400 + Math.random() * 400)); return res.status(401).json({ ok: false, error: 'Wrong name or password.' }); }
    tries.delete(ip);
    setSession(res, u.name);
    return res.status(200).json({ ok: true, user: u.name });
  }
  if (action === 'logout') { endSession(res); return res.status(200).json({ ok: true }); }
  const user = readSession(req);
  if (!user) return res.status(401).json({ ok: false, error: 'Please sign in again.' });
  const run = ACTIONS[action];
  if (!run) return res.status(400).json({ ok: false, error: 'unknown action' });
  try {
    const store = storeOf(cfg);
    if (MESSAGES[action]) {
      const msg = MESSAGES[action](body, user), commit = store.commit;
      store.commit = (h, c, m, a) => commit(h, c, m || msg, a);
    }
    const out = await run({ store, body, user });
    return res.status(200).json(Object.assign({ ok: true }, out));
  } catch (e) {
    const status = e.status === 400 || e.status === 409 ? e.status : 500;
    if (status === 500) console.error('admin', action, e);
    return res.status(status).json({ ok: false, error: status === 500 ? 'Something went wrong on the server (' + String(e.message).slice(0, 160) + ').' : e.message });
  }
};
// for the tests
module.exports.cleanProject = cleanProject;
module.exports.cleanArticle = cleanArticle;
