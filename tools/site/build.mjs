#!/usr/bin/env node
/* benevents agency — the pages search engines read.

   The home page is written once, in English, in index.html; its French words are in assets/js/i18n.js.
   This tool turns that into what a search engine (or a visitor arriving from one) is served:

     fr.html                                the home page in French                      -> /fr
     services/<slug>.html                   one page per service, in English             -> /services/<slug>
     fr/services/<slug>.html                the same in French                           -> /fr/services/<slug>
     projects.html, projects/<id>.html      the list of projects and one page each       -> /projects, /projects/<id>
     fr/realisations.html, fr/realisations/<id>.html   the same in French                -> /fr/realisations, …
     agency.html, fr/agence.html            the page about the agency                    -> /agency, /fr/agence
     event-agency-<city>.html               one page per city where we work              -> /event-agency-<city>
     fr/agence-evenementielle-<city>.html   the same in French                           -> /fr/agence-evenementielle-<city>
     events.html, events/<slug>.html        the kinds of events we produce, one page each -> /events, /events/<slug>
     fr/evenements.html, fr/evenements/<slug>.html     the same in French                 -> /fr/evenements, …
     blog.html, blog/<slug>.html            the blog (its articles are the guides of guides.mjs) -> /blog, /blog/<slug>
     fr/blog.html, fr/blog/<slug>.html      the same in French                           -> /fr/blog, …
     404.html                               what a visitor sees when an address does not exist
     sitemap.xml                            the list of all of them, with the day each last changed and its pictures

   It also rewrites, in index.html, the lines between "head:seo" and "/head:seo" (title, description,
   addresses of the two languages, data for search engines), from assets/js/i18n.js (meta).

   The words of the kinds of events are in tools/site/events.mjs, those of the blog in tools/site/guides.mjs.
   The words of the agency page and of the cities are in tools/site/pages.mjs; the key figures and the
   quotes of clients (assets/js/voices.js) are shown on the agency page too.

   Run it from the root of the site after changing index.html, assets/js/i18n.js, projects.js, services.js,
   voices.js or tools/site/pages.mjs:

       node tools/site/build.mjs

   Nothing else is needed: no dependency, plain Node.

   The picture of a link preview (what WhatsApp, LinkedIn or a message shows under a shared link) is the page's
   own picture cut to 1200 x 630, in assets/img/og/. When a page gets a new picture, make its preview, then
   build again (until then the page shows the agency's picture, and this tool says which previews are missing):

       python3 tools/site/previews.py && node tools/site/build.mjs

   "node tools/site/build.mjs --previews" only lists the pictures and their previews, and writes nothing. */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { CITIES, CITY_WORDS, AGENCY, TEAM, COMPANY } from './pages.mjs';
import { EVENTS, EVENT_WORDS } from './events.mjs';
import { GUIDE_WORDS } from './guides.mjs';
import { PRODUCTION, STAGE_OFFER, PRODUCTION_WORDS } from './production.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://www.ben.events';
const MAIL = 'contact@ben.events';
const PHONE = '+212 661 11 85 90';
const WA = 'https://wa.me/' + PHONE.replace(/\D/g, '');
const SOCIAL = { instagram: 'https://www.instagram.com/benevents.agency', linkedin: 'https://www.linkedin.com/company/benevents/' };
// audience measurement (Rybbit, without cookies): the same line is in index.html, presentation.html and tools/legal/build.py
const STATS = '<script src="https://app.rybbit.io/api/script.js?siteId=5ad12948434d" defer></script>';
// the Google tag (Google Tag Manager), first in the head of every page that is measured, with the cookie choice (assets/js/consent.js)
const GTAG = '<!-- Google tag (Google Tag Manager, container GTM-PS4HGTDH): one per page, first in the head.\n     Google\'s consent mode starts at "denied" (or at the visitor\'s choice of the last six months): nothing is stored\n     by Google\'s tools until the visitor accepts cookies in the banner of assets/js/consent.js. -->\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  (function () { var c = null; try { c = JSON.parse(localStorage.getItem(\'ben-consent\')); } catch (e) {}\n    var v = c && c.v === \'granted\' && Date.now() - c.t < 15724800000 ? \'granted\' : \'denied\';\n    gtag(\'consent\', \'default\', { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v, wait_for_update: 500 }); })();\n  gtag(\'js\', new Date());\n</script>\n<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-PS4HGTDH"></script>\n<script src="/assets/js/consent.js" defer></script>';
const LANGS = ['en', 'fr'];

const read = f => readFileSync(join(ROOT, f), 'utf8');
const LIST = process.argv.includes('--previews');        // only say which preview pictures the pages need
const CHANGED = new Set();      // the files this run writes differently from what was there
const write = (f, s) => {
  if (LIST) return;
  let before = null;
  try { before = readFileSync(join(ROOT, f), 'utf8'); } catch (e) {}
  if (before === s) return;
  CHANGED.add(f);
  mkdirSync(dirname(join(ROOT, f)), { recursive: true });
  writeFileSync(join(ROOT, f), s);
};
// the dates the sitemap gave each address before this run: what Vercel's build has, without the history of the site
const BEFORE = (() => { try { return new Map([...readFileSync(join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map(m => [m[1], m[2]])); } catch (e) { return new Map(); } })();

/* ---------- what the site says ---------- */
const box = { window: {} };
vm.createContext(box);
for (const f of ['i18n.js', 'services.js']) vm.runInContext(read('assets/js/' + f), box, { filename: f });
const I18N = box.window.BEN_I18N, SERVICES = box.window.BEN_SERVICES;
// the projects, the quotes and the blog are data in content/, edited on the admin page (/admin, api/admin.js);
// what is marked "draft" there stays off the site
const json = f => JSON.parse(read(f));
const CONTENT = json('content/projects.json'), VOICES = json('content/voices.json'), PLACES = CONTENT.places;
const WARN = [];        // what the team wrote that could not be used: left out, and said at the end of the run
const seen = new Set();
const PROJECTS = CONTENT.projects.filter(p => {
  const why = p.draft ? '' : !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id || '') ? 'its id is not valid' : seen.has(p.id) ? 'its id is used twice'
    : !CONTENT.kinds[p.kind] ? `its kind "${p.kind}" is not in the list` : !(p.photos && p.photos.length) ? 'it has no photo' : p.city && !PLACES[p.city] ? `its city "${p.city}" is not in the list` : '';
  if (why) WARN.push(`content/projects.json: "${p.id}" left out: ${why}`);
  seen.add(p.id);
  return !p.draft && !why;
}).map(p => { const o = Object.assign({}, p, { kind: CONTENT.kinds[p.kind] }); delete o.draft; delete o.saved; return o; });
const FIGURES = (VOICES.figures || []).slice(0, 4), QUOTES = VOICES.quotes || [];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const GUIDES = readdirSync(join(ROOT, 'content/blog')).filter(f => f.endsWith('.json')).map(f => {
  try { return json('content/blog/' + f); } catch (e) { WARN.push(`content/blog/${f} left out: it cannot be read (${e.message})`); return null; }
}).filter(g => {
  if (!g || g.draft) return false;
  const why = !SLUG.test(g.id || '') ? 'its id is not valid' : !['en', 'fr'].every(l => g.slug && SLUG.test(g.slug[l] || '')) ? 'its address is not valid'
    : !/^\d{4}-\d{2}-\d{2}$/.test(g.date || '') ? 'its date is not valid' : !(g.image && g.title && g.body && ['en', 'fr'].every(l => g.title[l] && g.body[l] && g.body[l].length)) ? 'its picture, title or text is missing' : '';
  if (why) WARN.push(`content/blog/${g.id}.json left out: ${why}`);
  return !why;
}).sort((a, b) => (a.order || 0) - (b.order || 0) || a.id.localeCompare(b.id));
for (const g of GUIDES) g.related = g.related || {};
for (const pr of PROJECTS) if (pr.city && !PLACES[pr.city]) throw new Error(`projects.js: the city "${pr.city}" of "${pr.id}" is not in the list of places`);
// the cities that have a page are the same on both sides: PLACES (projects.js, "page: true") and CITIES (pages.mjs)
for (const c of CITIES) if (!PLACES[c.id] || !PLACES[c.id].page) throw new Error(`the city "${c.id}" has a page (tools/site/pages.mjs) but is not marked "page: true" in the places of projects.js`);
for (const k of Object.keys(PLACES)) if (PLACES[k].page && !CITIES.some(c => c.id === k)) throw new Error(`projects.js marks the place "${k}" as having a page, but tools/site/pages.mjs has no city of that name`);
// the pages of the kinds of events and the guides only point to what exists
for (const e of EVENTS) {
  if (!SERVICES.some(s => s.id === e.service)) throw new Error(`events.mjs: "${e.id}" belongs to the service "${e.service}", which services.js does not have`);
  // a project shown as an idea may have been taken off the portfolio (or be a draft): its card is left out
  e.ideas = e.ideas.filter(i => PROJECTS.some(p => p.id === i.project) || (WARN.push(`events.mjs: the page "${e.id}" no longer shows the project "${i.project}", which is not on the site`), false));
}
for (const g of GUIDES) {
  const r = g.related, keep = (key, list, what) => { r[key] = (r[key] || []).filter(id => list.some(x => x.id === id) || (WARN.push(`content/blog/${g.id}.json: the ${what} "${id}" it leads to does not exist`), false)); };
  keep('events', EVENTS, 'event'); keep('services', SERVICES, 'service'); keep('cities', CITIES, 'city'); keep('guides', GUIDES, 'article');
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const att = s => esc(s).replace(/"/g, '&quot;');
const unesc = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');

{
  const note = what => `/* benevents agency — ${what}, for the home page.
   Written by tools/site/build.mjs from content/ (edited on the admin page, /admin): do not change it here. */\n`;
  const list = a => '[\n' + a.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]';
  write('assets/js/projects.js', note('the portfolio and the places it names') + 'window.BEN_PLACES = ' + JSON.stringify(PLACES) + ';\nwindow.BEN_PROJECTS = ' + list(PROJECTS) + ';\n');
  write('assets/js/voices.js', note('key figures and client quotes') + 'window.BEN_FIGURES = ' + list(FIGURES) + ';\nwindow.BEN_QUOTES = ' + list(QUOTES) + ';\n');
}

let home = read('index.html');
// the English words of the home page: its own text
const TEXT = /(<([a-zA-Z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g;
const EN = { text: {}, ph: {}, aria: {}, alt: {} };
for (const m of home.matchAll(TEXT)) if (!(m[3] in EN.text)) EN.text[m[3]] = unesc(m[4]);
const ATTR = [['ph', 'data-i18n-ph', 'placeholder'], ['aria', 'data-i18n-aria', 'aria-label'], ['alt', 'data-i18n-alt', 'alt']];
for (const [kind, mark, name] of ATTR) {
  for (const m of home.matchAll(new RegExp('<[^>]*\\s' + mark + '="([^"]+)"[^>]*>', 'g'))) {
    const v = new RegExp('\\s' + name + '="([^"]*)"').exec(m[0]);
    if (v) EN[kind][m[1]] = unesc(v[1]);
  }
}
const T = { en: EN.text, fr: Object.assign({}, EN.text, I18N.fr) };
const tr = (v, l) => typeof v === 'string' ? v : (v[l] || v.en);

/* ---------- addresses ---------- */
const U = {
  home: l => l === 'fr' ? '/fr' : '/',
  at: (l, hash) => (l === 'fr' ? '/fr' : '/') + hash,
  service: (l, s) => (l === 'fr' ? '/fr/services/' : '/services/') + s.slug[l],
  project: (l, p) => (l === 'fr' ? '/fr/realisations/' : '/projects/') + p.id,
  projects: l => l === 'fr' ? '/fr/realisations' : '/projects',
  agency: l => (l === 'fr' ? '/fr/' : '/') + AGENCY[l].slug,
  city: (l, c) => (l === 'fr' ? '/fr/' : '/') + CITY_WORDS[l].slug + c.id,
  legal: (l, k) => '/' + k + '?lang=' + l,
  event: (l, e) => EVENT_WORDS[l].folder + e.slug[l],
  events: l => EVENT_WORDS[l].index,
  guide: (l, g) => GUIDE_WORDS[l].folder + g.slug[l],
  guides: l => GUIDE_WORDS[l].index
};
const fileOf = path => (path === '/' ? 'index' : path.slice(1)) + '.html';

/* ---------- words these pages add ---------- */
const W = {
  en: {
    tag: 'Corporate event design and production.', cookies: 'Cookie settings',
    skip: 'Skip to content', nav: 'Primary', language: 'Language', crumbs: 'You are here', homeName: 'Home', cta: 'Start a project',
    talk: 'Talk to us about your event', craft: 'What we create', does: 'What we take care of', ideas: 'Ideas, seen in our projects', see: 'See the project:',
    more: 'More events of this kind', others: 'Our other services', work: 'Portfolio', allWork: 'All projects',
    workTitle: ['Events produced', 'in Morocco'], workLede: 'Conventions, forums, ceremonies, gala evenings and brand events designed and produced by benevents agency in Morocco.',
    workSeo: ['Corporate Events Produced in Morocco: Our Projects | benevents agency', 'Conventions, forums, ceremonies, gala evenings and brand events designed and produced by benevents in Casablanca, Rabat, Tangier, Marrakech and across Morocco.'],
    project: 'project by benevents agency', crafts: 'Services involved', photos: (t, i, n) => `${t}: photo ${i} of ${n}`, prev: 'Previous project', next: 'Next project',
    endTitle: 'An event like this in mind?', endText: 'Give us the date, the place and the number of guests: we will come back with first ideas.',
    pjEndTitle: 'Planning something similar?', pjEndText: 'Tell us about your event. We will take this project as the starting point and come back to you with first ideas.',
    fServices: 'Services', fAgency: 'The agency', fContact: 'Contact', approach: 'Our approach', contact: 'Contact', rights: 'All rights reserved.',
    privacy: 'Privacy policy', terms: 'Terms of use', deck: 'Our presentation', whatsapp: 'WhatsApp', onInstagram: 'benevents agency on Instagram', onLinkedin: 'benevents agency on LinkedIn',
    photoOf: t => `Photo of the event: ${t}`, serviceImg: t => `${t}: an event produced by benevents agency`,
    faq: 'Frequent questions', quick: 'Quick contact', call: 'Call', cities: 'Where we work', fEvents: 'Events we produce', guides: 'Blog', dServices: 'Our services', allEvents: 'All events', allGuides: 'All articles', fFor: 'For', fWhere: 'Where', fWhen: 'When', fGuests: 'Guests', did: 'What we delivered', story: 'The project', result: 'The result:', inCity: n => 'in ' + n
  },
  fr: {
    tag: 'Conception et production d’événements d’entreprise.', cookies: 'Gérer les cookies',
    skip: 'Aller au contenu', nav: 'Principal', language: 'Langue', crumbs: 'Vous êtes ici', homeName: 'Accueil', cta: 'Démarrer un projet',
    talk: 'Parlons de votre événement', craft: 'Ce que nous créons', does: 'Ce que nous prenons en charge', ideas: 'Des idées, vues dans nos réalisations', see: 'Voir le projet :',
    more: 'D’autres événements de ce type', others: 'Nos autres savoir-faire', work: 'Réalisations', allWork: 'Toutes les réalisations',
    workTitle: ['Événements réalisés', 'au Maroc'], workLede: 'Conventions, forums, cérémonies, soirées de gala et événements de marque conçus et produits par benevents agency au Maroc.',
    workSeo: ['Événements d’entreprise réalisés au Maroc : nos réalisations | benevents agency', 'Conventions, forums, cérémonies, soirées de gala et événements de marque conçus et produits par benevents agency à Casablanca, Rabat, Tanger, Marrakech et au Maroc.'],
    project: 'réalisation benevents agency', crafts: 'Savoir-faire mobilisés', photos: (t, i, n) => `${t} : photo ${i} sur ${n}`, prev: 'Réalisation précédente', next: 'Réalisation suivante',
    endTitle: 'Un événement de ce type en tête ?', endText: 'Donnez-nous la date, le lieu et le nombre d’invités : nous revenons vers vous avec de premières idées.',
    pjEndTitle: 'Un projet similaire en préparation ?', pjEndText: 'Parlez-nous de votre événement. Nous partirons de cette réalisation pour revenir vers vous avec de premières idées.',
    fServices: 'Savoir-faire', fAgency: 'L’agence', fContact: 'Contact', approach: 'Notre approche', contact: 'Contact', rights: 'Tous droits réservés.',
    privacy: 'Politique de confidentialité', terms: 'Conditions d’utilisation', deck: 'Notre présentation', whatsapp: 'WhatsApp', onInstagram: 'benevents agency sur Instagram', onLinkedin: 'benevents agency sur LinkedIn',
    photoOf: t => `Photo de l’événement : ${t}`, serviceImg: t => `${t} : un événement produit par benevents agency`,
    faq: 'Questions fréquentes', quick: 'Contact rapide', call: 'Appeler', cities: 'Nos villes', fEvents: 'Nos événements', guides: 'Blog', dServices: 'Nos savoir-faire', allEvents: 'Tous les événements', allGuides: 'Tous les articles', fFor: 'Pour', fWhere: 'Lieu', fWhen: 'Date', fGuests: 'Invités', did: 'Ce que nous avons réalisé', story: 'Le projet', result: 'Le résultat :', inCity: n => 'à ' + n
  }
};

// which services a project shows: those that name it among their ideas, and the one its kind belongs to
const KIND = {
  conferences: ['Masterclass', 'Tech event', 'Seminar', 'Convention', 'Institutional forum', 'Conference', 'Forum', 'Scientific meeting'],
  ceremonies: ['Closing ceremony', 'Competition final'],
  receptions: ['Reception', 'Fan zone', 'Brand experience', 'Brand event', 'Corporate reception', 'Open day']
};
const servicesOf = p => SERVICES.filter(s => (KIND[s.id] || []).includes(p.kind.en) || s.ideas.some(i => i.project === p.id));
const projectsOf = s => PROJECTS.filter(p => servicesOf(p).includes(s));
const byId = Object.fromEntries(PROJECTS.map(p => [p.id, p]));
const cityOf = p => CITIES.find(c => c.id === p.city);
const photoOf = ({ project, photo }) => (byId[project] && byId[project].photos[photo || 0]) || null;
for (const pr of PRODUCTION) {
  pr.ideas = pr.ideas.filter(i => photoOf(i) || (WARN.push(`production.mjs: the page "${pr.id}" no longer shows the project "${i.project}" (photo ${i.photo}), which is not on the site`), false));
  pr.photo = photoOf(pr.cover);
  if (!pr.photo) {                       // its cover is gone: the first photo of its ideas takes its place
    const i = pr.ideas[0];
    if (!i) throw new Error(`production.mjs: the page "${pr.id}" has no photo left (cover and ideas are not on the site)`);
    WARN.push(`production.mjs: the cover of "${pr.id}" (${pr.cover.project}) is not on the site; the photo of "${i.project}" is used instead`);
    pr.cover = { project: i.project, photo: i.photo, caption: i.title };
    pr.photo = photoOf(i);
  }
}
const FEATURED = ['cupra-open-day', 'femmes-en-jeu', 'mta-cycle-meeting'].filter(id => byId[id]);     // the projects shown in the Services menu        // the city of a project, when it has a page
const short = (s, n = 158) => s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)).replace(/[\s,;:.–—-]+$/, '') + '…';
const titleParts = t => { const k = t.indexOf(' · '); return k < 0 ? [t, ''] : [t.slice(0, k), t.slice(k + 3)]; };

/* ---------- data for search engines ---------- */
const ORG = SITE + '/#agency';
const ld = o => '<script type="application/ld+json">\n' + JSON.stringify(o, null, 1) + '\n</script>';
const crumbs = (l, items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => Object.assign({ '@type': 'ListItem', position: i + 1, name }, path ? { item: SITE + path } : {})) });
const agency = l => ({
  '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/', logo: SITE + '/assets/img/logo.png', image: SITE + '/assets/img/og.jpg',
  description: I18N.meta[l].desc, email: MAIL, telephone: PHONE.replace(/\s/g, ''),
  ...(COMPANY.legalName ? { legalName: COMPANY.legalName } : {}),
  address: Object.assign({ '@type': 'PostalAddress', addressCountry: 'MA' }, COMPANY.address ? { streetAddress: COMPANY.address } : {}, COMPANY.postalCode ? { postalCode: COMPANY.postalCode } : {}, COMPANY.city ? { addressLocality: COMPANY.city } : {}),
  areaServed: [...CITIES.map(c => ({ '@type': 'City', name: tr(c.name, l) })), { '@type': 'Country', name: l === 'fr' ? 'Maroc' : 'Morocco' }],
  contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: MAIL, telephone: PHONE.replace(/\s/g, ''), areaServed: 'MA', availableLanguage: ['fr', 'en'] },
  knowsAbout: SERVICES.map((s, i) => T[l]['srv.' + (i + 1) + '.t']), sameAs: [SOCIAL.instagram, SOCIAL.linkedin],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: T[l]['srv.eyebrow'], itemListElement: [...SERVICES.map((s, i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: T[l]['srv.' + (i + 1) + '.t'], description: T[l]['srv.' + (i + 1) + '.d'], url: SITE + U.service(l, s) } })),
    ...PRODUCTION.map(pr => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: tr(pr.name, l), description: pr.seo.desc[l], url: SITE + U.service(l, pr) } }))] }
});

/* ---------- the head lines that change with the page and its language ---------- */
// alt: the address of the page in each language · xdef: the one shown to other languages
// the picture of a link preview: the page's picture, cut to 1200 x 630 by tools/site/previews.py
const PREVIEWS = new Map(), NO_PREVIEW = new Set();
const previewOf = image => {
  const out = '/assets/img/og/' + image.replace(/^\/assets\/img\//, '').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.jpg';
  PREVIEWS.set(image, out);
  if (existsSync(join(ROOT, out))) return out;
  NO_PREVIEW.add(image);
  return null;
};
// a title longer than about 65 characters is cut in a result of Google: the words that say what the page is come
// first, and the name of the agency at the end is shortened, then left out, until the title fits
const fitTitle = t => {
  if (t.length <= 65) return t;
  const m = / \| benevents agency(, (Morocco|Maroc))?$/.exec(t);
  if (!m) return t;
  const base = t.slice(0, m.index);
  return [base + ' | benevents agency', base + ' | benevents'].find(x => x.length <= 65) || base;
};
function seoHead({ l, title: full, desc, alt, xdef, image, imageAlt, data }) {
  const title = fitTitle(full);
  const img = SITE + ((image && previewOf(image)) || '/assets/img/og.jpg');
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${att(desc)}">`,
    '<meta name="robots" content="index, follow, max-image-preview:large">',
    `<link rel="canonical" href="${SITE + alt[l]}">`,
    '<!-- the two languages of the page, for search engines -->',
    ...LANGS.map(k => `<link rel="alternate" hreflang="${k}" href="${SITE + alt[k]}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE + xdef}">`,
    '<!-- what shows when a link to the page is shared -->',
    `<meta property="og:title" content="${att(title)}">`,
    `<meta property="og:description" content="${att(desc)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="benevents agency">',
    `<meta property="og:url" content="${SITE + alt[l]}">`,
    `<meta property="og:locale" content="${l === 'fr' ? 'fr_FR' : 'en_US'}">`,
    `<meta property="og:locale:alternate" content="${l === 'fr' ? 'en_US' : 'fr_FR'}">`,
    `<meta property="og:image" content="${img}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${att(imageAlt || (l === 'fr' ? 'benevents agency : conception et production d’événements d’entreprise' : 'benevents agency: corporate event design and production'))}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${att(title)}">`,
    `<meta name="twitter:description" content="${att(desc)}">`,
    `<meta name="twitter:image" content="${img}">`,
    '<!-- who we are and what the page is, in the form search engines read -->',
    ld({ '@context': 'https://schema.org', '@graph': data })
  ].join('\n');
}
const site = l => ({ '@type': 'WebSite', '@id': SITE + '/#site', name: 'benevents agency', url: SITE + '/', inLanguage: LANGS, publisher: { '@id': ORG } });
const homeHead = l => seoHead({ l, title: I18N.meta[l].title, desc: I18N.meta[l].desc, alt: { en: '/', fr: '/fr' }, xdef: '/', data: [agency(l), site(l)] });

/* ---------- the Services menu of the header (services and events), and the events of the phone menu ---------- */
// home: the home page switches language in place, so each link carries its address and its words in both languages
function dropMenu(l, home) {
  // on the home page, every link carries its words in both languages (main.js switches them in place), and the address
  // of each language when main.js cannot work it out (the events, the guides, the production pages, the anchors)
  const pw = PRODUCTION_WORDS;
  const texts = f => home ? LANGS.map(k => ` data-text-${k}="${att(f(k))}"`).join('') : '';
  const alts = page => /^(event|guide|production)s?(:|$)/.test(page) || page.includes('#') ? LANGS.map(k => ` data-alt-${k}="${pageHref(k, page)}"`).join('') : '';
  const link = (page, name, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${home ? pageHref(l, page).slice(1) : pageHref(l, page)}"${home ? ` data-page="${page}"${alts(page)}` : ''}${texts(name)}>${esc(name(l))}</a>`;
  const col = (n, head, items) => `<div class="drop__col drop__col--${n}">
          ${link(head[0], head[1], 'drop__h')}
          ${items.map(([page, name]) => link(page, name)).join('\n          ')}
        </div>`;
  const srv = i => k => T[k]['srv.' + i + '.t'];
  const ev = id => [`event:${id}`, k => (pw[k].kinds && pw[k].kinds[id]) || tr(EVENTS.find(e => e.id === id).name, k)];
  const thumb = ph => {
    const copy = ph[0].replace(/^assets\/img\//, '').replace(/\.\w+$/, '.webp');
    const small = existsSync(join(ROOT, 'assets/img/_w/480', copy)) ? '/assets/img/_w/480/' + copy : '/' + ph[0];
    return small;                                                                         // shown when the menu first opens (menu.js)
  };
  const featured = FEATURED.map(id => {
    const p = byId[id], client = tr(p.client, l).split(' · ')[0];
    return `<a class="drop__pj" href="${home ? pageHref(l, 'project:' + id).slice(1) : pageHref(l, 'project:' + id)}"${home ? ` data-page="project:${id}"` : ''}>
            <span class="drop__pjimg" data-bg="${thumb(p.photos[0])}" aria-hidden="true"></span>
            <span class="drop__pjtx"><b>${esc(client)}</b><span${texts(k => tr(p.kind, k))}>${esc(tr(p.kind, l))}</span><small${texts(k => pw[k].seeProject)}>${esc(pw[l].seeProject)}</small></span>
          </a>`;
  }).join('\n          ');
  return `<div class="drop">
      <a class="drop__btn" href="${home ? '#services' : U.at(l, '#services')}"${home ? ' data-i18n="nav.services"' : ''} aria-haspopup="true" aria-expanded="false" aria-controls="drop-panel">${esc(T[l]['nav.services'])}</a>
      <div class="drop__panel" id="drop-panel">
        <div class="drop__top">
          <p class="drop__eyebrow"${texts(k => pw[k].menuEyebrow)}>${esc(pw[l].menuEyebrow)}</p>
          <p class="drop__title"${texts(k => pw[k].menuTitle)}>${esc(pw[l].menuTitle)}</p>
        </div>
        ${col(1, ['events', k => pw[k].events], [['service:conferences', srv(1)], ['service:ceremonies', srv(2)], ['service:receptions', srv(3)], ev('seminar'), ev('launch'), ev('openday'), ev('teambuilding')])}
        ${col(2, ['service:production', k => pw[k].stage], STAGE_OFFER.map(o => ['service:production#' + o.id, k => tr(o.name, k)]))}
        ${PRODUCTION.map((pr, i) => col(3 + i, ['production:' + pr.id, k => tr(pr.name, k)], pr.offer.map(o => [`production:${pr.id}#${o.id}`, k => tr(o.name, k)]))).join('\n        ')}
        <div class="drop__pjs">
          <p class="drop__eyebrow"${texts(k => pw[k].featured)}>${esc(pw[l].featured)}</p>
          ${featured}
        </div>
        <div class="drop__foot">
          <p class="drop__cities">${CITIES.map(c => link('city:' + c.id, k => tr(c.name, k))).join('<i>·</i>')}<i>·</i><span${texts(k => pw[k].allMorocco)}>${esc(pw[l].allMorocco)}</span></p>
          <a class="drop__tel" href="tel:${PHONE.replace(/\s/g, '')}">${esc(PHONE)}</a>
          ${link('projects', k => W[k].allWork, 'drop__all')}
        </div>
      </div>
    </div>`;
}
function menuMore(l) {
  const both = (page, words) => `data-page="${page}"${LANGS.map(k => ` data-alt-${k}="${pageHref(k, page)}"`).join('')}${LANGS.map(k => ` data-text-${k}="${att(words(k))}"`).join('')}`;
  const pages = [...SERVICES.map((sv, i) => ['service:' + sv.id, k => T[k]['srv.' + (i + 1) + '.t']]), ...PRODUCTION.map(pr => ['production:' + pr.id, k => tr(pr.name, k)])];
  return `<div class="menu__more">
    <p data-i18n="nav.services">${esc(T[l]['nav.services'])}</p>
    ${pages.map(([page, name]) => `<a href="${pageHref(l, page).slice(1)}" ${both(page, name)}>${esc(name(l))}</a>`).join('\n    ')}
    <p data-i18n="ft.events">${esc(W[l].fEvents)}</p>
    ${EVENTS.map(e => `<a href="${pageHref(l, 'event:' + e.id)}" ${both('event:' + e.id, k => tr(e.name, k))}>${esc(tr(e.name, l))}</a>`).join('\n    ')}
  </div>`;
}
const DROP_BLOCK = /(<!-- nav:drop -->\n)[\s\S]*?(\n *<!-- \/nav:drop -->)/, MORE_BLOCK = /(<!-- menu:more -->\n)[\s\S]*?(\n *<!-- \/menu:more -->)/;
if (!DROP_BLOCK.test(home) || !MORE_BLOCK.test(home)) throw new Error('index.html: the lines "nav:drop" … "/nav:drop" or "menu:more" … "/menu:more" are missing');
home = home.replace(DROP_BLOCK, (m, a, b) => a + '    ' + dropMenu('en', true) + b).replace(MORE_BLOCK, (m, a, b) => a + '  ' + menuMore('en') + b);
// under the four crafts of the home page: what we produce around the event, each with its page
const ALSO_BLOCK = /(<!-- srv:also -->\n)[\s\S]*?(\n *<!-- \/srv:also -->)/;
if (!ALSO_BLOCK.test(home)) throw new Error('index.html: the lines "srv:also" … "/srv:also" are missing');
const srvAlso = l => `    <div class="srv__also" data-reveal>
      <p${LANGS.map(k => ` data-text-${k}="${att(PRODUCTION_WORDS[k].also)}"`).join('')}>${esc(PRODUCTION_WORDS[l].also)}</p>
      ${[['service:production', k => PRODUCTION_WORDS[k].stage], ...PRODUCTION.map(pr => ['production:' + pr.id, k => tr(pr.name, k)])].map(([page, name]) =>
        `<a href="${pageHref(l, page).slice(1)}" data-page="${page}"${/^production:/.test(page) ? LANGS.map(k => ` data-alt-${k}="${pageHref(k, page)}"`).join('') : ''}${LANGS.map(k => ` data-text-${k}="${att(name(k))}"`).join('')}>${esc(name(l))}</a>`).join('\n      ')}
    </div>`;
home = home.replace(ALSO_BLOCK, (m, a, b) => a + srvAlso('en') + b);

/* ---------- 1. the home page: its head in English, and the whole page in French ---------- */
const BLOCK = /(<!-- head:seo[^>]*-->\n)[\s\S]*?(\n<!-- \/head:seo -->)/;
if (!BLOCK.test(home)) throw new Error('index.html: the lines "head:seo" … "/head:seo" are missing from the head');
// a function, so that a "$" in a text is not read as a group of the pattern
home = home.replace(BLOCK, (m, a, b) => a + homeHead('en') + b);
// the links to a service or a project page follow the addresses decided here
const PAGE_LINK = /(<a\b[^>]*?\shref=")[^"]*("[^>]*\sdata-page="([^"]+)")/g;
home = home.replace(PAGE_LINK, (m, a, b, page) => a + pageHref('en', page).slice(1) + b);
// a link to a kind of event or to a guide carries its address in both languages: the page switches language in place
const ALT_LINK = /<a\b[^>]*\sdata-page="((?:event|guide)s?(?::[^"]*)?)"[^>]*>/g;
home = home.replace(ALT_LINK, (tag, page) => tag.replace(/\sdata-alt-(en|fr)="[^"]*"/g, '').replace(/>$/, ` data-alt-en="${pageHref('en', page)}" data-alt-fr="${pageHref('fr', page)}">`));
write('index.html', home);

function french(page) {
  let s = page.replace('<html lang="en">', '<html lang="fr">');
  s = s.replace(DROP_BLOCK, (m, a, b) => a + '    ' + dropMenu('fr', true) + b).replace(MORE_BLOCK, (m, a, b) => a + '  ' + menuMore('fr') + b).replace(ALSO_BLOCK, (m, a, b) => a + srvAlso('fr') + b);
  s = s.replace(BLOCK, (m, a, b) => a + homeHead('fr') + b);
  s = s.replace(TEXT, (m, open, tag, key, text, close) => open + (I18N.fr[key] != null ? esc(I18N.fr[key]) : text) + close);
  for (const [kind, mark, name] of ATTR) {
    s = s.replace(new RegExp('<[^>]*\\s' + mark + '="([^"]+)"[^>]*>', 'g'), (tag, key) =>
      I18N.fr[key] == null ? tag : tag.replace(new RegExp('(\\s' + name + '=")[^"]*(")'), (m, a, b) => a + att(I18N.fr[key]) + b));
  }
  // the language buttons, and the links that lead to a page in the language on screen
  s = s.replace(/(<button type="button" data-lang="(en|fr)" aria-pressed=")(true|false)(")/g, (m, a, k, v, b) => a + (k === 'fr') + b);
  s = s.replace(PAGE_LINK, (m, a, b, page) => a + pageHref('fr', page).slice(1) + b);
  s = s.replace(/(<a\b[^>]*?\shref=")[^"]*("[^>]*\sdata-legal="([^"]+)")/g, (m, a, b, k) => a + k + '?lang=fr' + b);
  // the English words travel with the French page, so that it can still switch language in place
  const words = '<script>window.BEN_EN = ' + JSON.stringify(EN).replace(/</g, '\\u003c') + ';</script>\n';
  if (!s.includes('<script src="assets/js/i18n.js"></script>')) throw new Error('index.html: the i18n script line was not found');
  s = s.replace('<script src="assets/js/i18n.js"></script>', words + '<script src="assets/js/i18n.js"></script>');
  return s.replace('<!doctype html>\n', '<!doctype html>\n<!-- Written by tools/site/build.mjs from index.html and assets/js/i18n.js: change those, then run it again. -->\n');
}
function pageHref(l, page) {
  const at = page.indexOf('#');
  if (at > 0) return pageHref(l, page.slice(0, at)) + page.slice(at);
  const [kind, id] = page.split(':');
  if (kind === 'production') { const pr = PRODUCTION.find(x => x.id === id); if (!pr) throw new Error('unknown production page: ' + id); return U.service(l, pr); }
  if (kind === 'service') return U.service(l, SERVICES.find(s => s.id === id));
  if (kind === 'project') return U.project(l, byId[id]);
  if (kind === 'projects') return U.projects(l);
  if (kind === 'agency') return U.agency(l);
  if (kind === 'city') return U.city(l, CITIES.find(c => c.id === id));
  if (kind === 'event') { const e = EVENTS.find(x => x.id === id); if (!e) throw new Error('unknown event: ' + id); return U.event(l, e); }
  if (kind === 'events') return U.events(l);
  if (kind === 'guide') { const g = GUIDES.find(x => x.id === id); if (!g) throw new Error('unknown guide: ' + id); return U.guide(l, g); }
  if (kind === 'guides') return U.guides(l);
  throw new Error('unknown page: ' + page);
}
write('fr.html', french(home));

/* ---------- 2. the pages of the services and of the projects ---------- */
const BRAND = '<span class="brand"><span class="brand__w"><b>ben</b>events</span><span class="brand__bar"><i></i><i></i><i></i><i></i></span><span class="brand__a">agency</span></span>';
const ICON = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="is-dot" cx="17.1" cy="6.9" r="1"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="is-dot" cx="6.6" cy="6.6" r="1.25"/><path d="M6.6 10.4v7.4M11.2 17.8v-7.4M11.2 14.1c0-2.3 1.2-3.8 3.1-3.8s3 1.4 3 3.8v3.7"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="wa-ring" d="M12 3a9 9 0 0 0-7.75 13.58L3 21l4.56-1.2A9 9 0 1 0 12 3z"/><path class="wa-phone" d="M9.3 7.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.300s1 2.700 1.100 2.900c.1.200 1.900 3 4.700 4.100 2.300.9 2.800.7 3.300.7s1.600-.7 1.800-1.300c.2-.6.2-1.200.2-1.300-.1-.1-.3-.2-.5-.3l-1.900-.9c-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.100-.4-2.100-1.300-.8-.7-1.300-1.600-1.500-1.800-.1-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.5l-.8-1.900z"/></svg>',
  phone: '<svg class="mbar__tel" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 3.6h2.9l1.5 4.1-2.1 1.5a12.4 12.4 0 0 0 6.1 6.1l1.5-2.1 4.1 1.5v2.9a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.4 5.8a2 2 0 0 1 2-2.2z"/></svg>'
};
// a photo, with its lighter copies when tools/site/images.py has made them: the browser takes the one that fits
const COPIES = [480, 960];
const SIZES = { cover: '(max-width: 900px) 100vw, 46vw', card: '(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 25vw', wide: '(max-width: 900px) 100vw, 50vw', photo: '(max-width: 700px) 100vw, 34vw' };
function img([src, w, h], alt, more = '', sizes = 'card') {
  const copy = src.replace(/^assets\/img\//, '').replace(/\.\w+$/, '.webp');
  const set = COPIES.filter(v => existsSync(join(ROOT, 'assets/img/_w', String(v), copy))).map(v => `/assets/img/_w/${v}/${copy} ${v}w`);
  if (!COPIES.includes(w) || !set.some(c => c.endsWith(' ' + w + 'w'))) set.push(`/${src} ${w}w`);      // the photo itself, unless a lighter copy has its width
  const offer = set.length > 1 ? ` srcset="${set.join(', ')}" sizes="${SIZES[sizes]}"` : '';
  return `<img src="/${src}"${offer} width="${w}" height="${h}" alt="${att(alt)}"${more}>`;
}

// the size of a logo, read from its file: a PNG says it in its first bytes, an SVG in its viewBox
function sizeOf(src) {
  const file = readFileSync(join(ROOT, src));
  if (/\.png$/i.test(src)) return [file.readUInt32BE(16), file.readUInt32BE(20)];
  const box = /viewBox="([^"]+)"/.exec(file.toString('utf8'));
  if (!box) throw new Error('no size found for ' + src);
  const v = box[1].trim().split(/[\s,]+/).map(Number);
  return [Math.round(v[2]), Math.round(v[3])];
}

function shell({ l, head, alt, main }) {
  const w = W[l], t = T[l], other = l === 'fr' ? 'en' : 'fr';
  return `<!doctype html>
<!-- Written by tools/site/build.mjs from assets/js/services.js, projects.js and i18n.js: change those, then run it again. -->
<html lang="${l}">
<head>
<meta charset="utf-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1">
${head}
<meta name="theme-color" content="#08080a">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Open+Sans:wght@300;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="stylesheet" href="/assets/css/pages.css">
${STATS}
</head>
<body class="page">

<a class="skip" href="#main">${esc(w.skip)}</a>
<div class="grain" aria-hidden="true"></div>

<header class="nav">
  <a class="logo" href="${U.home(l)}" aria-label="benevents agency"><span class="logo__text">${BRAND}</span></a>
  <nav class="nav__links" aria-label="${att(w.nav)}">
    <a href="${U.agency(l)}">${esc(t['nav.about'])}</a>
    ${dropMenu(l, false)}
    <a href="${U.projects(l)}">${esc(t['nav.gallery'])}</a>
    <a href="${U.guides(l)}">${esc(w.guides)}</a>
    <a href="${U.at(l, '#contact')}">${esc(t['nav.contact'])}</a>
  </nav>
  <div class="nav__side">
    <div class="lang" role="group" aria-label="${att(w.language)}">
      ${LANGS.map(k => k === l ? `<a href="${alt[k]}" aria-current="true" lang="${k}">${k.toUpperCase()}</a>` : `<a href="${alt[k]}" hreflang="${k}" lang="${k}">${k.toUpperCase()}</a>`).join('\n      <span>·</span>\n      ')}
    </div>
    <button class="btn btn--sm btn--ghost btn--book btn--icon" type="button" data-book aria-haspopup="dialog" aria-label="${att(t['book.cta'])}" title="${att(t['book.cta'])}"><span></span></button>
    <button class="btn btn--sm btn--ghost btn--icon btn--agent" type="button" data-agent aria-haspopup="dialog" aria-expanded="false" aria-controls="agent" aria-label="${att(t['agent.cta'] || EN.aria['agent.cta'])}" title="${att(t['agent.cta'] || EN.aria['agent.cta'])}"><span></span></button>
    <a class="btn btn--sm" href="${U.at(l, '#contact')}"><span>${esc(w.cta)}</span></a>
  </div>
</header>

<main id="main" class="pg">
<div class="wrap">
${main}
</div>
</main>

<footer class="pfoot">
  <div class="wrap pfoot__in">
    <div class="pfoot__lead">
      <a class="logo logo--footer" href="${U.home(l)}" aria-label="benevents agency"><span class="logo__text">${BRAND}</span></a>
      <p>${esc(w.tag)}</p>
      <a class="link-arrow" href="${U.at(l, '#contact')}">${esc(w.talk)}</a>
    </div>
    <nav class="pfoot__col" aria-label="${att(w.fServices)}">
      <h2>${esc(w.fServices)}</h2>
      ${SERVICES.map((s, i) => `<a href="${U.service(l, s)}">${esc(t['srv.' + (i + 1) + '.t'])}</a>`).join('\n      ')}
      ${PRODUCTION.map(pr => `<a href="${U.service(l, pr)}">${esc(tr(pr.name, l))}</a>`).join('\n      ')}
    </nav>
    <nav class="pfoot__col" aria-label="${att(w.fEvents)}">
      <h2>${esc(w.fEvents)}</h2>
      ${EVENTS.map(e => `<a href="${U.event(l, e)}">${esc(tr(e.name, l))}</a>`).join('\n      ')}
    </nav>
    <nav class="pfoot__col" aria-label="${att(w.fAgency)}">
      <h2>${esc(w.fAgency)}</h2>
      <a href="${U.home(l)}">${esc(w.homeName)}</a>
      <a href="${U.agency(l)}">${esc(AGENCY[l].name)}</a>
      <a href="${U.projects(l)}">${esc(w.work)}</a>
      <a href="${U.guides(l)}">${esc(w.guides)}</a>
      <a href="${U.at(l, '#process')}">${esc(w.approach)}</a>
      <a href="/presentation?lang=${l}">${esc(w.deck)}</a>
    </nav>
    <nav class="pfoot__col" aria-label="${att(w.cities)}">
      <h2>${esc(w.cities)}</h2>
      ${CITIES.map(c => `<a href="${U.city(l, c)}">${esc(tr(c.name, l))}</a>`).join('\n      ')}
    </nav>
    <div class="pfoot__col">
      <h2>${esc(w.fContact)}</h2>
      <a href="mailto:${MAIL}">${MAIL}</a>
      <a href="${WA}" target="_blank" rel="noopener">${esc(w.whatsapp)} · <span class="pfoot__tel">${PHONE}</span></a>
      <button class="pfoot__book" type="button" data-book aria-haspopup="dialog">${esc(t['book.cta'])}</button>
      <div class="footer__social">
        <a href="${SOCIAL.instagram}" target="_blank" rel="noopener" aria-label="${att(w.onInstagram)}">${ICON.instagram}</a>
        <a href="${SOCIAL.linkedin}" target="_blank" rel="noopener" aria-label="${att(w.onLinkedin)}">${ICON.linkedin}</a>
      </div>
    </div>
  </div>
  <div class="wrap pfoot__base">
    <span>© <span data-year>${new Date().getFullYear()}</span> benevents agency. ${esc(w.rights)}</span>
    <p class="pfoot__cities">${CITIES.map(c => `<a href="${U.city(l, c)}">${esc(tr(c.name, l))}</a>`).join('<i>·</i>')}<i>·</i><span>${esc(PRODUCTION_WORDS[l].allMorocco)}</span></p>
    <nav aria-label="Legal"><a href="${U.legal(l, 'privacy')}">${esc(w.privacy)}</a><a href="${U.legal(l, 'terms')}">${esc(w.terms)}</a><button type="button" data-consent-open>${esc(w.cookies)}</button></nav>
  </div>
</footer>
<!-- on phones: WhatsApp and a call, fixed at the bottom of the screen -->
<nav class="mbar" aria-label="${att(w.quick)}">
  <a class="mbar__wa" href="${WA}" target="_blank" rel="noopener">${ICON.whatsapp}<span>WhatsApp</span></a>
  <a class="mbar__call" href="tel:${PHONE.replace(/\s/g, '')}">${ICON.phone}<span>${esc(w.call)}</span></a>
</nav>
<script src="/assets/js/stats.js"></script>
<script src="/assets/js/booking.js"></script>
<script src="/assets/js/agent.js"></script>
<script src="/assets/js/menu.js"></script>
<script src="/assets/js/logo.js"></script>
<script>document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });</script>
</body>
</html>
`;
}

const crumbNav = (l, items) => `<nav class="crumbs" aria-label="${att(W[l].crumbs)}"><ol>${items.map(([name, path]) => path ? `<li><a href="${path}">${esc(name)}</a></li>` : `<li aria-current="page">${esc(name)}</li>`).join('')}</ol></nav>`;
const offerSection = (l, offer) => `<section class="pg__sec">
  <h2 class="pg__h2">${esc(PRODUCTION_WORDS[l].offer)}</h2>
  <div class="offer offer--n${offer.length}">
    ${offer.map((o, i) => `<article class="offer__item" id="${o.id}"><span class="offer__n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(tr(o.name, l))}</h3><p>${esc(tr(o.text, l))}</p></article>`).join('\n    ')}
  </div>
</section>`;
const cta = (l, title, text) => `<section class="pj__cta pg__cta">
  <div class="pj__cta-in">
    <div class="pj__cta-main">
      <h2 class="pj__cta-title">${esc(title)}</h2>
      <p class="pj__cta-text">${esc(text)}</p>
    </div>
    <div class="pj__cta-side">
      <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(W[l].talk)}</span></a>
      <button class="btn btn--ghost btn--book" type="button" data-book aria-haspopup="dialog"><span>${esc(T[l]['book.cta'])}</span></button>
      <a class="pj__mail" href="mailto:${MAIL}">${MAIL}</a>
    </div>
  </div>
</section>`;
const quoteBlock = (l, q) => `<figure class="pg__quote"><blockquote>${esc(tr(q.text, l))}</blockquote><figcaption><b>${esc(q.name || '')}</b><span>${esc([tr(q.role || '', l), q.company].filter(Boolean).join(' · '))}</span></figcaption></figure>`;
const projectCard = (l, p, text, photo = 0) => {
  const title = tr(p.title, l);
  return `<a class="pcard" href="${U.project(l, p)}">
      <span class="pcard__ph">${img(p.photos[photo] || p.photos[0], W[l].photoOf(title), ' loading="lazy"', text ? 'wide' : 'card')}</span>
      <span class="pcard__in">${text ? `<b>${esc(text[0])}</b><span>${esc(text[1])}</span><small>${esc(W[l].see)} ${esc(titleParts(title)[0])}</small>` : `<b>${esc(title)}</b><small>${esc(tr(p.kind, l))}</small>`}</span>
    </a>`;
};

const eventCard = (l, e) => `<a class="pcard" href="${U.event(l, e)}">
      <span class="pcard__ph">${img(e.image, e.caption ? tr(e.caption.text, l) : EVENT_WORDS[l].cover(tr(e.name, l)), ' loading="lazy"', 'card')}</span>
      <span class="pcard__in"><b>${esc(tr(e.name, l))}</b><span>${esc(tr(e.lede, l))}</span><small>${esc(EVENT_WORDS[l].card)}</small></span>
    </a>`;
const guideCard = (l, g) => `<a class="pcard" href="${U.guide(l, g)}">
      <span class="pcard__ph">${img(g.image, GUIDE_WORDS[l].cover(g.title[l].join(' ')), ' loading="lazy"', 'card')}</span>
      <span class="pcard__in"><b>${esc(g.title[l].join(' '))}</b><span>${esc(tr(g.card, l))}</span><small><time datetime="${g.updated || g.date}">${esc(new Date((g.updated || g.date) + 'T12:00:00Z').toLocaleDateString(l === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }))}</time> · ${esc(GUIDE_WORDS[l].card)}</small></span>
    </a>`;

const pages = [];        // every page written: { alt: {en, fr}, images: its pictures, for the list of pages }
for (const s of SERVICES) {
  const n = SERVICES.indexOf(s) + 1, alt = Object.fromEntries(LANGS.map(l => [l, U.service(l, s)]));
  pages.push({ alt, xdef: alt.fr, images: [s.image[0]] });
  for (const l of LANGS) {
    const w = W[l], t = T[l], name = t['srv.' + n + '.t'], parts = name.split(' & '), lede = t['srv.' + n + '.d'];
    const mine = projectsOf(s).filter(p => !s.ideas.some(i => i.project === p.id));
    const head = seoHead({
      l, title: s.seo.title[l], desc: s.seo.desc[l], alt, xdef: alt.fr, image: '/' + s.image[0], imageAlt: w.serviceImg(name),
      data: [{ '@type': 'Service', '@id': SITE + alt[l] + '#service', name, serviceType: name, description: s.seo.desc[l], url: SITE + alt[l], image: SITE + '/' + s.image[0], provider: { '@id': ORG }, areaServed: { '@type': 'Country', name: l === 'fr' ? 'Maroc' : 'Morocco' } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, [[w.homeName, U.home(l)], [t['nav.services'], U.at(l, '#services')], [name]]),
        ...(s.faq ? [{ '@type': 'FAQPage', '@id': SITE + alt[l] + '#faq', inLanguage: l, mainEntity: s.faq[l].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] : [])]
    });
    const main = `${crumbNav(l, [[w.homeName, U.home(l)], [t['nav.services'], U.at(l, '#services')], [name]])}
<header class="pg__head">
  <div>
    <p class="eyebrow"><i></i><span>${esc(w.craft)} · ${String(n).padStart(2, '0')}</span></p>
    <h1 class="pg__title">${esc(parts[0])}${parts.length > 1 ? ` <em>&amp; ${esc(parts.slice(1).join(' & '))}</em>` : ''}</h1>
    <p class="pg__lede">${esc(lede)}</p>
    <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(w.talk)}</span></a>
  </div>
  <figure class="pg__cover">${img(s.image, w.serviceImg(name), ' fetchpriority="high"', 'cover')}</figure>
</header>
<section class="pg__cols">
  <div class="pg__text">
    ${s.text[l].map(p => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  <div class="pg__does">
    <h2 class="pg__h">${esc(w.does)}</h2>
    <ul>
      ${s.does[l].map(d => `<li>${esc(d)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>
${s.id === 'production' ? offerSection(l, STAGE_OFFER) + '\n' : ''}${s.more ? `<section class="pg__sec">
  <h2 class="pg__h2">${esc(s.more[l].title)}</h2>
  <p class="pg__lede pg__lede--wide">${esc(s.more[l].intro)}</p>
  <ul class="pg__notes pg__notes--named pg__notes--n${s.more[l].points.length}">
    ${s.more[l].points.map(([k, v]) => `<li><b>${esc(k)}</b>${esc(v)}</li>`).join('\n    ')}
  </ul>
</section>
` : ''}<section class="pg__sec">
  <h2 class="pg__h2">${esc(w.ideas)}</h2>
  <div class="pcards pcards--two">
    ${s.ideas.filter(i => byId[i.project]).map(i => projectCard(l, byId[i.project], [tr(i.title, l), tr(i.text, l)])).join('\n    ')}
  </div>
</section>${mine.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(w.more)}</h2>
  <div class="pcards">
    ${mine.map(p => projectCard(l, p)).join('\n    ')}
  </div>
</section>` : ''}${EVENTS.some(e => e.service === s.id) ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(EVENT_WORDS[l].ofKind)}</h2>
  <div class="pcards${EVENTS.filter(e => e.service === s.id).length < 3 ? ' pcards--few' : ''}">
    ${EVENTS.filter(e => e.service === s.id).map(e => eventCard(l, e)).join('\n    ')}
  </div>
</section>` : ''}${s.faq ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(w.faq)}</h2>
  <div class="pg__faq">
    ${s.faq[l].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}
  </div>
</section>` : ''}
${cta(l, w.endTitle, w.endText)}
<nav class="pg__others" aria-label="${att(w.others)}">
  <h2 class="pg__h">${esc(w.others)}</h2>
  ${SERVICES.filter(o => o !== s).map(o => `<a href="${U.service(l, o)}">${esc(t['srv.' + (SERVICES.indexOf(o) + 1) + '.t'])}</a>`).join('\n  ')}
  ${PRODUCTION.map(pr => `<a href="${U.service(l, pr)}">${esc(tr(pr.name, l))}</a>`).join('\n  ')}
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

for (const pr of PRODUCTION) {
  const alt = Object.fromEntries(LANGS.map(l => [l, U.service(l, pr)]));
  pages.push({ alt, xdef: alt.fr, kind: 'production', images: [pr.photo[0], ...pr.ideas.map(i => photoOf(i)[0])] });
  for (const l of LANGS) {
    const w = W[l], t = T[l], pw = PRODUCTION_WORDS[l], name = tr(pr.name, l), title = pr.title[l], steps = pr.steps[l], caption = tr(pr.cover.caption, l);
    const trail = [[w.homeName, U.home(l)], [t['nav.services'], U.at(l, '#services')], [name]];
    const head = seoHead({
      l, title: pr.seo.title[l], desc: pr.seo.desc[l], alt, xdef: alt.fr, image: '/' + pr.photo[0], imageAlt: caption,
      data: [{ '@type': 'Service', '@id': SITE + alt[l] + '#service', name: title.join(' '), serviceType: name, description: pr.seo.desc[l], url: SITE + alt[l], image: SITE + '/' + pr.photo[0],
        provider: { '@id': ORG }, areaServed: { '@type': 'Country', name: l === 'fr' ? 'Maroc' : 'Morocco' },
        hasOfferCatalog: { '@type': 'OfferCatalog', name: pw.offer, itemListElement: pr.offer.map(o => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: tr(o.name, l), description: tr(o.text, l), url: SITE + alt[l] + '#' + o.id } })) } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__head${pr.photo[1] < pr.photo[2] ? ' pg__head--tall' : ''}">
  <div>
    <p class="eyebrow"><i></i><span>${esc(pw.eyebrow)} · ${esc(name)}</span></p>
    <h1 class="pg__title">${esc(title[0])} <em>${esc(title[1])}</em></h1>
    <p class="pg__lede">${esc(tr(pr.lede, l))}</p>
    <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(w.talk)}</span></a>
  </div>
  <figure class="pg__cover">${img(pr.photo, caption, ' fetchpriority="high"', 'cover')}<figcaption><a href="${U.project(l, byId[pr.cover.project])}">${esc(caption)}</a></figcaption></figure>
</header>
<section class="pg__cols">
  <div class="pg__text">
    ${pr.text[l].map(x => `<p>${esc(x)}</p>`).join('\n    ')}
  </div>
  <div class="pg__does">
    <h2 class="pg__h">${esc(w.does)}</h2>
    <ul>
      ${pr.offer.map(o => `<li><a href="#${o.id}">${esc(tr(o.name, l))}</a></li>`).join('\n      ')}
    </ul>
  </div>
</section>
${offerSection(l, pr.offer)}
<section class="pg__sec">
  <h2 class="pg__h2">${esc(steps.title)}</h2>
  <p class="pg__lede pg__lede--wide">${esc(steps.intro)}</p>
  <ul class="pg__notes pg__notes--named pg__notes--n${steps.points.length}">
    ${steps.points.map(([k, v]) => `<li><b>${esc(k)}</b>${esc(v)}</li>`).join('\n    ')}
  </ul>
</section>${pr.ideas.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(w.ideas)}</h2>
  <div class="pcards pcards--two">
    ${pr.ideas.map(i => projectCard(l, byId[i.project], [tr(i.title, l), tr(i.text, l)], i.photo)).join('\n    ')}
  </div>
</section>` : ''}
${cta(l, w.endTitle, w.endText)}
<nav class="pg__others" aria-label="${att(pw.others)}">
  <h2 class="pg__h">${esc(pw.others)}</h2>
  ${PRODUCTION.filter(o => o !== pr).map(o => `<a href="${U.service(l, o)}">${esc(tr(o.name, l))}</a>`).join('\n  ')}
  ${SERVICES.map((o, i) => `<a href="${U.service(l, o)}">${esc(t['srv.' + (i + 1) + '.t'])}</a>`).join('\n  ')}
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

PROJECTS.forEach((p, i) => {
  const alt = Object.fromEntries(LANGS.map(l => [l, U.project(l, p)]));
  pages.push({ alt, xdef: alt.fr, images: p.photos.map(ph => ph[0]) });
  for (const l of LANGS) {
    const w = W[l], title = tr(p.title, l), kind = tr(p.kind, l), intro = tr(p.intro, l), parts = titleParts(title), n = p.photos.length;
    const prev = PROJECTS[(i + PROJECTS.length - 1) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
    const trail = [[w.homeName, U.home(l)], [w.work, U.projects(l)], [title]];
    // the facts of the case, each shown only when projects.js gives it
    const place = p.city ? tr(PLACES[p.city], l) : '', city = cityOf(p);
    const facts = [
      p.client && [w.fFor, esc(tr(p.client, l))],
      (place || p.venue) && [w.fWhere, [p.venue && esc(p.venue), place && (city ? `<a href="${U.city(l, city)}">${esc(place)}</a>` : esc(place))].filter(Boolean).join(', ')],
      p.date && [w.fWhen, esc(tr(p.date, l))],
      p.guests && [w.fGuests, esc(String(p.guests))]
    ].filter(Boolean);
    const did = p.did && p.did[l], story = p.story && p.story[l];
    const named = place && !title.includes(place) ? ' ' + w.inCity(place) : '';
    const head = seoHead({
      l, title: `${title}${title.toLowerCase().includes(kind.toLowerCase()) ? '' : ' — ' + kind}${named} | benevents agency${named ? '' : ', ' + (l === 'fr' ? 'Maroc' : 'Morocco')}`, desc: short(intro), alt, xdef: alt.fr, image: '/' + p.photos[0][0], imageAlt: w.photoOf(title),
      data: [Object.assign({ '@type': 'WebPage', '@id': SITE + alt[l] + '#page', name: title, description: intro, url: SITE + alt[l], inLanguage: l, isPartOf: { '@id': SITE + '/#site' }, about: { '@id': ORG },
        primaryImageOfPage: { '@type': 'ImageObject', url: SITE + '/' + p.photos[0][0], width: p.photos[0][1], height: p.photos[0][2] }, image: p.photos.map(ph => SITE + '/' + ph[0]) },
      place ? { contentLocation: { '@type': 'Place', name: p.venue || place, address: { '@type': 'PostalAddress', addressLocality: place, addressCountry: 'MA' } } } : {}),
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__head${p.photos[0][1] < p.photos[0][2] ? ' pg__head--tall' : ''}">
  <div>
    <p class="eyebrow"><i></i><span>${esc(kind)}</span></p>
    <h1 class="pg__title">${esc(parts[0])}${parts[1] ? ` <em>${esc(parts[1])}</em>` : ''}</h1>
    <p class="pg__lede">${esc(intro)}</p>${facts.length ? `
    <dl class="pg__facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
    <p class="pg__tags"><span>${esc(w.crafts)}</span>${servicesOf(p).map(s => `<a href="${U.service(l, s)}">${esc(T[l]['srv.' + (SERVICES.indexOf(s) + 1) + '.t'])}</a>`).join('')}</p>
    <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(w.talk)}</span></a>
  </div>
  <figure class="pg__cover">${img(p.photos[0], w.photos(title, 1, n), ' fetchpriority="high"', 'cover')}</figure>
</header>${story ? `
<section class="pg__cols">
  <div class="pg__text">
    <h2 class="pg__h2">${esc(w.story)}</h2>
    ${story.map(s => `<p>${esc(s)}</p>`).join('\n    ')}${p.result ? `
    <p class="pg__result"><b>${esc(w.result)}</b> ${esc(tr(p.result, l))}</p>` : ''}
  </div>${did ? `
  <div class="pg__does">
    <h2 class="pg__h">${esc(w.did)}</h2>
    <ul>
      ${did.map(d => `<li>${esc(d)}</li>`).join('\n      ')}
    </ul>
  </div>` : ''}
</section>` : did ? `
<section class="pg__sec pg__does pg__does--wide">
  <h2 class="pg__h">${esc(w.did)}</h2>
  <ul>
    ${did.map(d => `<li>${esc(d)}</li>`).join('\n    ')}
  </ul>
</section>` : ''}${n > 1 ? `
<section class="pg__photos" aria-label="${att(title)}">
  ${p.photos.slice(1).map((ph, k) => `<figure style="--r:${(ph[1] / ph[2]).toFixed(4)}">${img(ph, w.photos(title, k + 2, n), ' loading="lazy"', 'photo')}</figure>`).join('\n  ')}
</section>` : ''}${p.quote ? `
<section class="pg__sec">
  ${quoteBlock(l, p.quote)}
</section>` : ''}
${cta(l, w.pjEndTitle, w.pjEndText)}
<nav class="pg__pn" aria-label="${att(w.work)}">
  <a rel="prev" href="${U.project(l, prev)}"><small>${esc(w.prev)}</small><b>${esc(tr(prev.title, l))}</b></a>
  <a class="pg__all" href="${U.projects(l)}">${esc(w.allWork)}</a>
  <a rel="next" href="${U.project(l, next)}"><small>${esc(w.next)}</small><b>${esc(tr(next.title, l))}</b></a>
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
});

{
  const alt = Object.fromEntries(LANGS.map(l => [l, U.projects(l)]));
  pages.push({ alt, xdef: alt.fr, images: PROJECTS.map(p => p.photos[0][0]) });
  for (const l of LANGS) {
    const w = W[l], trail = [[w.homeName, U.home(l)], [w.work]];
    const head = seoHead({
      l, title: w.workSeo[0], desc: w.workSeo[1], alt, xdef: alt.fr,
      data: [{ '@type': 'CollectionPage', '@id': SITE + alt[l] + '#page', name: w.workTitle.join(' '), description: w.workSeo[1], url: SITE + alt[l], inLanguage: l, isPartOf: { '@id': SITE + '/#site' }, about: { '@id': ORG },
        mainEntity: { '@type': 'ItemList', itemListElement: PROJECTS.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: tr(p.title, l), url: SITE + U.project(l, p) })) } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__top">
  <p class="eyebrow"><i></i><span>${esc(w.work)}</span></p>
  <h1 class="pg__title">${esc(w.workTitle[0])} <em>${esc(w.workTitle[1])}</em></h1>
  <p class="pg__lede">${esc(w.workLede)}</p>
</header>
<section class="pg__sec">
  <div class="pcards">
    ${PROJECTS.map((p, i) => i < 4 ? projectCard(l, p).replace(' loading="lazy"', i ? '' : ' fetchpriority="high"') : projectCard(l, p)).join('\n    ')}
  </div>
</section>
${cta(l, w.endTitle, w.endText)}`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

/* ---------- 3. the agency and the cities where it works (their words are in tools/site/pages.mjs) ---------- */
const cityCard = (l, c) => `<a class="pcard" href="${U.city(l, c)}">
      <span class="pcard__ph">${img(c.image, CITY_WORDS[l].cover(tr(c.name, l)), ' loading="lazy"', 'card')}</span>
      <span class="pcard__in"><b>${esc(tr(c.name, l))}</b><span>${esc(tr(c.card, l))}</span><small>${esc(AGENCY[l].city(tr(c.name, l)))}</small></span>
    </a>`;
const serviceLinks = l => SERVICES.map((s, i) => `<a href="${U.service(l, s)}">${esc(T[l]['srv.' + (i + 1) + '.t'])}</a>`).join('\n  ');

for (const c of CITIES) {
  const alt = Object.fromEntries(LANGS.map(l => [l, U.city(l, c)]));
  pages.push({ alt, xdef: alt.fr, kind: 'city', images: [c.image[0]] });
  for (const l of LANGS) {
    const w = W[l], cw = CITY_WORDS[l], name = tr(c.name, l), title = cw.title(name);
    const trail = [[w.homeName, U.home(l)], [AGENCY[l].name, U.agency(l)], [name]];
    const here = PROJECTS.filter(p => p.city === c.id);
    const head = seoHead({
      l, title: c.seo.title[l], desc: c.seo.desc[l], alt, xdef: alt.fr, image: '/' + c.image[0], imageAlt: cw.cover(name),
      data: [{ '@type': 'Service', '@id': SITE + alt[l] + '#service', name: cw.service(name), serviceType: l === 'fr' ? 'Agence événementielle' : 'Event agency', description: c.seo.desc[l], url: SITE + alt[l],
        image: SITE + '/' + c.image[0], provider: { '@id': ORG }, areaServed: { '@type': 'City', name, containedInPlace: { '@type': 'Country', name: l === 'fr' ? 'Maroc' : 'Morocco' } } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__head">
  <div>
    <p class="eyebrow"><i></i><span>${esc(cw.eyebrow)} · ${esc(name)}</span></p>
    <h1 class="pg__title">${esc(title[0])} <em>${esc(title[1])}</em></h1>
    <p class="pg__lede">${esc(tr(c.lede, l))}</p>
    <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(w.talk)}</span></a>
  </div>
  <figure class="pg__cover">${img(c.image, cw.cover(name), ' fetchpriority="high"', 'cover')}</figure>
</header>
<section class="pg__cols">
  <div class="pg__text">
    <h2 class="pg__h2">${esc(cw.organise(name))}</h2>
    ${c.text[l].map(p => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  <div class="pg__does">
    <h2 class="pg__h">${esc(cw.kinds(name))}</h2>
    <ul>
      ${c.kinds.map(([id, words]) => `<li><a href="${U.service(l, SERVICES.find(s => s.id === id))}">${esc(tr(words, l))}</a></li>`).join('\n      ')}
    </ul>
  </div>
</section>${here.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(cw.done(name))}</h2>
  <div class="pcards${here.length < 3 ? ' pcards--few' : ''}">
    ${here.map(p => projectCard(l, p)).join('\n    ')}
  </div>
  <p class="pg__more"><a class="link-arrow" href="${U.projects(l)}">${esc(cw.allWork)}</a></p>
</section>` : ''}
<section class="pg__sec">
  <h2 class="pg__h2">${esc(cw.good)}</h2>
  <ul class="pg__notes">
    ${c.good[l].map(g => `<li>${esc(g)}</li>`).join('\n    ')}
  </ul>
</section>
${cta(l, cw.endTitle(name), w.endText)}
<nav class="pg__others" aria-label="${att(cw.also)}">
  <h2 class="pg__h">${esc(cw.also)}</h2>
  ${CITIES.filter(o => o !== c).map(o => `<a href="${U.city(l, o)}">${esc(tr(o.name, l))}</a>`).join('\n  ')}
  <a href="${U.agency(l)}">${esc(AGENCY[l].name)}</a>
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

{
  const alt = Object.fromEntries(LANGS.map(l => [l, U.agency(l)]));
  pages.push({ alt, xdef: alt.fr, kind: 'agency' });
  // the logos of the home page, in its order
  const logos = [...new Map([...home.matchAll(/<div class="client"><img src="(assets\/img\/clients\/[^"]+)" alt="([^"]+)"/g)].map(m => [m[1], unesc(m[2])])).entries()];
  const cover = ['assets/img/stage-runway.jpg', 960, 1280];
  pages[pages.length - 1].images = [cover[0]];
  for (const l of LANGS) {
    const w = W[l], t = T[l], a = AGENCY[l], trail = [[w.homeName, U.home(l)], [a.name]];
    const office = [COMPANY.address, [COMPANY.postalCode, COMPANY.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const head = seoHead({
      l, title: a.seo[0], desc: a.seo[1], alt, xdef: alt.fr, image: '/' + cover[0], imageAlt: a.cover,
      data: [{ '@type': 'AboutPage', '@id': SITE + alt[l] + '#page', name: a.name, description: a.seo[1], url: SITE + alt[l], inLanguage: l, isPartOf: { '@id': SITE + '/#site' }, mainEntity: { '@id': ORG } },
        agency(l), crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__head pg__head--tall">
  <div>
    <p class="eyebrow"><i></i><span>${esc(a.name)}</span></p>
    <h1 class="pg__title">${esc(a.title[0])} <em>${esc(a.title[1])}</em></h1>
    <p class="pg__lede">${esc(a.lede)}</p>
    <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(w.talk)}</span></a>
  </div>
  <figure class="pg__cover">${img(cover, a.cover, ' fetchpriority="high"', 'cover')}</figure>
</header>
<section class="pg__cols">
  <div class="pg__text">
    <h2 class="pg__h2">${esc(a.oneTeam)}</h2>
    <p>${esc(a.intro)}</p>
    ${a.text.map(p => `<p>${esc(p)}</p>`).join('\n    ')}
    <p class="pg__more"><a class="link-arrow" href="${U.at(l, '#process')}">${esc(a.film)}</a></p>
  </div>
  <div class="pg__does pg__does--said">
    <h2 class="pg__h">${esc(a.values)}</h2>
    <ul>
      ${a.principles.map(([k, v]) => `<li><span><b>${esc(k)}</b>${esc(v)}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>${FIGURES.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(a.figures)}</h2>
  <ul class="pg__figures">
    ${FIGURES.map(f => `<li><b>${esc((f.before || '') + Number(f.value).toLocaleString(l === 'fr' ? 'fr-FR' : 'en-US') + (f.after || ''))}</b><span>${esc(tr(f.label, l))}</span></li>`).join('\n    ')}
  </ul>
</section>` : ''}
<section class="pg__sec">
  <h2 class="pg__h2">${esc(a.where)}</h2>
  <p class="pg__lede pg__lede--wide">${esc(a.whereText)}${office ? ' ' + esc(a.office) + ' ' + esc(office) + '.' : ''}</p>
  <div class="pcards pcards--three">
    ${CITIES.map(c => cityCard(l, c)).join('\n    ')}
  </div>
</section>${TEAM.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(a.team)}</h2>
  <ul class="pg__team">
    ${TEAM.map(m => `<li>${m.photo ? img(m.photo, m.name, ' loading="lazy"', 'card') : `<span class="pg__team-ph" aria-hidden="true">${esc(m.name.split(/\s+/).slice(0, 2).map(x => x[0]).join(''))}</span>`}<b>${esc(m.name)}</b><span>${esc(tr(m.role || '', l))}</span></li>`).join('\n    ')}
  </ul>
</section>` : ''}
<section class="pg__sec">
  <h2 class="pg__h2">${esc(a.clients)}</h2>
  <ul class="pg__logos">
    ${logos.map(([src, name]) => `<li><img src="/${src}" alt="${att(a.logo(name))}" width="${sizeOf(src)[0]}" height="${sizeOf(src)[1]}" loading="lazy"></li>`).join('\n    ')}
  </ul>
</section>${QUOTES.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(a.quotes)}</h2>
  <div class="pg__quotes">
    ${QUOTES.map(q => quoteBlock(l, q)).join('\n    ')}
  </div>
</section>` : ''}
${cta(l, a.endTitle, w.endText)}
<nav class="pg__others" aria-label="${att(a.crafts)}">
  <h2 class="pg__h">${esc(a.crafts)}</h2>
  ${serviceLinks(l)}
  <a href="${U.projects(l)}">${esc(a.work)}</a>
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

/* ---------- 3b. the kinds of events we produce, and the guides (their words are in tools/site/events.mjs and guides.mjs) ---------- */
const serviceName = (l, s) => T[l]['srv.' + (SERVICES.indexOf(s) + 1) + '.t'];
// in a guide, {words|kind:id} is a link to a page of the site: kind is guide, event, service, city or project
const LINK_IN = /\{([^|{}]+)\|(guide|event|service|city|project):([a-z0-9-]+)\}/g;
const linkTo = (l, kind, id) => {
  const page = kind === 'guide' ? GUIDES.find(x => x.id === id) : kind === 'event' ? EVENTS.find(x => x.id === id)
    : kind === 'service' ? SERVICES.find(x => x.id === id) : kind === 'city' ? CITIES.find(x => x.id === id) : byId[id];
  if (!page) { WARN.push(`a link to the ${kind} "${id}", which does not exist: left as plain words`); return null; }
  return U[kind](l, page);
};
const rich = (l, s) => esc(s).replace(LINK_IN, (m, words, kind, id) => { const href = linkTo(l, kind, id); return href ? `<a href="${href}">${words}</a>` : words; });
const plain = s => s.replace(LINK_IN, (m, words) => words);
const words = list => list.join(' ').split(/\s+/).filter(Boolean).length;
const longDate = (l, d) => new Date(d + 'T12:00:00Z').toLocaleDateString(l === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

for (const e of EVENTS) {
  const alt = Object.fromEntries(LANGS.map(l => [l, U.event(l, e)]));
  pages.push({ alt, xdef: alt.fr, kind: 'event', images: [e.image[0], ...e.ideas.map(i => (byId[i.project].photos[i.photo || 0] || byId[i.project].photos[0])[0])] });
  const s = SERVICES.find(x => x.id === e.service);
  for (const l of LANGS) {
    const w = W[l], ew = EVENT_WORDS[l], name = tr(e.name, l), title = e.title[l], steps = e.steps && e.steps[l];
    const trail = [[w.homeName, U.home(l)], [ew.name, U.events(l)], [name]];
    const reading = GUIDES.filter(g => (g.related.events || []).includes(e.id));
    const head = seoHead({
      l, title: e.seo.title[l], desc: e.seo.desc[l], alt, xdef: alt.fr, image: '/' + e.image[0], imageAlt: e.caption ? tr(e.caption.text, l) : ew.cover(name),
      data: [{ '@type': 'Service', '@id': SITE + alt[l] + '#service', name: title.join(' '), serviceType: name, description: e.seo.desc[l], url: SITE + alt[l], image: SITE + '/' + e.image[0],
        provider: { '@id': ORG }, areaServed: { '@type': 'Country', name: l === 'fr' ? 'Maroc' : 'Morocco' }, isRelatedTo: { '@type': 'Service', name: serviceName(l, s), url: SITE + U.service(l, s) } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail),
        { '@type': 'FAQPage', '@id': SITE + alt[l] + '#faq', inLanguage: l, mainEntity: e.faq[l].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__head${e.image[1] < e.image[2] ? ' pg__head--tall' : ''}">
  <div>
    <p class="eyebrow"><i></i><span>${esc(ew.eyebrow)} · ${esc(name)}</span></p>
    <h1 class="pg__title">${esc(title[0])} <em>${esc(title[1])}</em></h1>
    <p class="pg__lede">${esc(tr(e.lede, l))}</p>
    <p class="pg__tags"><span>${esc(ew.service)}</span><a href="${U.service(l, s)}">${esc(serviceName(l, s))}</a></p>
    <a class="btn" href="${U.at(l, '#contact')}"><span>${esc(w.talk)}</span></a>
  </div>
  <figure class="pg__cover">${img(e.image, e.caption ? tr(e.caption.text, l) : ew.cover(name), ' fetchpriority="high"', 'cover')}${e.caption && byId[e.caption.project] ? `<figcaption><a href="${U.project(l, byId[e.caption.project])}">${esc(tr(e.caption.text, l))}</a></figcaption>` : ''}</figure>
</header>
<section class="pg__cols">
  <div class="pg__text">
    ${e.text[l].map(p => `<p>${esc(p)}</p>`).join('\n    ')}
  </div>
  <div class="pg__does">
    <h2 class="pg__h">${esc(w.does)}</h2>
    <ul>
      ${e.does[l].map(d => `<li>${esc(d)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>${steps ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(steps.title)}</h2>
  <p class="pg__lede pg__lede--wide">${esc(steps.intro)}</p>
  <ul class="pg__notes pg__notes--named pg__notes--n${steps.points.length}">
    ${steps.points.map(([k, v]) => `<li><b>${esc(k)}</b>${esc(v)}</li>`).join('\n    ')}
  </ul>
</section>` : ''}
<section class="pg__sec">
  <h2 class="pg__h2">${esc(w.ideas)}</h2>
  <div class="pcards pcards--two">
    ${e.ideas.map(i => projectCard(l, byId[i.project], [tr(i.title, l), tr(i.text, l)], i.photo)).join('\n    ')}
  </div>
</section>
<section class="pg__sec">
  <h2 class="pg__h2">${esc(w.faq)}</h2>
  <div class="pg__faq">
    ${e.faq[l].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}
  </div>
</section>${reading.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(GUIDE_WORDS[l].next)}</h2>
  <div class="pcards pcards--few">
    ${reading.map(g => guideCard(l, g)).join('\n    ')}
  </div>
</section>` : ''}
${cta(l, w.endTitle, w.endText)}
<nav class="pg__others" aria-label="${att(ew.others)}">
  <h2 class="pg__h">${esc(ew.others)}</h2>
  ${EVENTS.filter(o => o !== e).map(o => `<a href="${U.event(l, o)}">${esc(tr(o.name, l))}</a>`).join('\n  ')}
  <a href="${U.guides(l)}">${esc(w.guides)}</a>
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

{
  const alt = Object.fromEntries(LANGS.map(l => [l, U.events(l)]));
  pages.push({ alt, xdef: alt.fr, kind: 'events', images: EVENTS.map(e => e.image[0]) });
  for (const l of LANGS) {
    const w = W[l], ew = EVENT_WORDS[l], trail = [[w.homeName, U.home(l)], [ew.name]];
    const head = seoHead({
      l, title: ew.seo[0], desc: ew.seo[1], alt, xdef: alt.fr, image: '/' + EVENTS[0].image[0], imageAlt: ew.cover(tr(EVENTS[0].name, l)),
      data: [{ '@type': 'CollectionPage', '@id': SITE + alt[l] + '#page', name: ew.title.join(' '), description: ew.seo[1], url: SITE + alt[l], inLanguage: l, isPartOf: { '@id': SITE + '/#site' }, about: { '@id': ORG },
        mainEntity: { '@type': 'ItemList', itemListElement: EVENTS.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: tr(e.name, l), url: SITE + U.event(l, e) })) } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__top">
  <p class="eyebrow"><i></i><span>${esc(ew.eyebrow)}</span></p>
  <h1 class="pg__title">${esc(ew.title[0])} <em>${esc(ew.title[1])}</em></h1>
  <p class="pg__lede">${esc(ew.lede)}</p>
</header>
<section class="pg__sec">
  <div class="pcards">
    ${EVENTS.map((e, i) => i < 4 ? eventCard(l, e).replace(' loading="lazy"', '') : eventCard(l, e)).join('\n    ')}
  </div>
</section>
<section class="pg__sec">
  <h2 class="pg__h2">${esc(GUIDE_WORDS[l].name)}</h2>
  <div class="pcards">
    ${GUIDES.map(g => guideCard(l, g)).join('\n    ')}
  </div>
</section>
${cta(l, w.endTitle, w.endText)}
<nav class="pg__others" aria-label="${att(w.others)}">
  <h2 class="pg__h">${esc(w.others)}</h2>
  ${serviceLinks(l)}
  <a href="${U.projects(l)}">${esc(w.allWork)}</a>
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

for (const g of GUIDES) {
  const alt = Object.fromEntries(LANGS.map(l => [l, U.guide(l, g)]));
  pages.push({ alt, xdef: alt.fr, kind: 'guide', images: [g.image[0]] });
  for (const l of LANGS) {
    const w = W[l], gw = GUIDE_WORDS[l], title = g.title[l], body = g.body[l], full = title.join(' ');
    const trail = [[w.homeName, U.home(l)], [gw.name, U.guides(l)], [full]];
    const all = body.flatMap(b => [b.h, ...b.p, ...(b.list || []), ...(b.after || [])]).map(plain);
    const minutes = Math.max(2, Math.round(words(all) / 220));
    const anchor = (b, i) => 'g' + (i + 1);
    const r = g.related || {};
    const leads = [...(r.events || []).map(id => eventCard(l, EVENTS.find(e => e.id === id))),
      ...(r.guides || []).map(id => guideCard(l, GUIDES.find(x => x.id === id))),
      ...(r.cities || []).map(id => cityCard(l, CITIES.find(c => c.id === id)))];
    const head = seoHead({
      l, title: g.seo.title[l], desc: g.seo.desc[l], alt, xdef: alt.fr, image: '/' + g.image[0], imageAlt: gw.cover(full),
      data: [{ '@type': 'BlogPosting', '@id': SITE + alt[l] + '#article', headline: full, description: g.seo.desc[l], url: SITE + alt[l], mainEntityOfPage: SITE + alt[l], inLanguage: l,
        image: { '@type': 'ImageObject', url: SITE + '/' + g.image[0], width: g.image[1], height: g.image[2] }, datePublished: g.date, dateModified: g.updated || g.date,
        wordCount: words(all), author: { '@id': ORG }, publisher: { '@id': ORG }, isPartOf: { '@id': SITE + U.guides(l) + '#blog' } },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/', logo: SITE + '/assets/img/logo.png' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__head">
  <div>
    <p class="eyebrow"><i></i><span>${esc(gw.eyebrow)} · ${esc(gw.read(minutes))}</span></p>
    <h1 class="pg__title pg__title--long">${esc(title[0])} <em>${esc(title[1])}</em></h1>
    <p class="pg__lede">${esc(g.lede[l])}</p>
    <p class="pg__meta">${esc(gw.by)} · ${g.updated ? esc(gw.updated) + ' ' + esc(longDate(l, g.updated)) : esc(gw.written) + ' ' + esc(longDate(l, g.date))}</p>
  </div>
  <figure class="pg__cover">${img(g.image, gw.cover(full), ' fetchpriority="high"', 'cover')}</figure>
</header>
<div class="gd">
  <nav class="gd__toc" aria-label="${att(gw.contents)}">
    <h2 class="pg__h">${esc(gw.contents)}</h2>
    <ol>
      ${body.map((b, i) => `<li><a href="#${anchor(b, i)}">${esc(plain(b.h))}</a></li>`).join('\n      ')}
    </ol>
  </nav>
  <article class="gd__body">
    ${body.map((b, i) => `<section id="${anchor(b, i)}">
      <h2>${rich(l, b.h)}</h2>${b.p.map(p => `\n      <p>${rich(l, p)}</p>`).join('')}${b.list ? `\n      <ul>\n        ${b.list.map(x => `<li>${rich(l, x)}</li>`).join('\n        ')}\n      </ul>` : ''}${(b.after || []).map(p => `\n      <p>${rich(l, p)}</p>`).join('')}
    </section>`).join('\n    ')}
  </article>
</div>${leads.length ? `
<section class="pg__sec">
  <h2 class="pg__h2">${esc(gw.next)}</h2>
  <div class="pcards">
    ${leads.join('\n    ')}
  </div>
</section>` : ''}
${cta(l, gw.endTitle, gw.endText)}
<nav class="pg__others" aria-label="${att(gw.name)}">
  <h2 class="pg__h">${esc(gw.name)}</h2>
  ${GUIDES.filter(o => o !== g).map(o => `<a href="${U.guide(l, o)}">${esc(o.title[l].join(' '))}</a>`).join('\n  ')}
  <a href="${U.guides(l)}">${esc(gw.title.join(' '))}</a>
</nav>`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

{
  const alt = Object.fromEntries(LANGS.map(l => [l, U.guides(l)]));
  const NEWEST = [...GUIDES].sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date) || GUIDES.indexOf(a) - GUIDES.indexOf(b));
  pages.push({ alt, xdef: alt.fr, kind: 'guides', images: NEWEST.map(g => g.image[0]) });
  for (const l of LANGS) {
    const w = W[l], gw = GUIDE_WORDS[l], trail = [[w.homeName, U.home(l)], [gw.name]];
    const head = seoHead({
      l, title: gw.seo[0], desc: gw.seo[1], alt, xdef: alt.fr, image: '/' + GUIDES[0].image[0], imageAlt: gw.cover(GUIDES[0].title[l].join(' ')),
      data: [{ '@type': 'Blog', '@id': SITE + alt[l] + '#blog', name: 'benevents agency — ' + gw.title.join(' : '), description: gw.seo[1], url: SITE + alt[l], inLanguage: l, isPartOf: { '@id': SITE + '/#site' }, publisher: { '@id': ORG },
        blogPost: NEWEST.map(g => ({ '@type': 'BlogPosting', headline: g.title[l].join(' '), url: SITE + U.guide(l, g), datePublished: g.date, dateModified: g.updated || g.date })) },
        { '@type': 'Organization', '@id': ORG, name: 'benevents agency', url: SITE + '/' }, crumbs(l, trail)]
    });
    const main = `${crumbNav(l, trail)}
<header class="pg__top">
  <p class="eyebrow"><i></i><span>${esc(gw.name)}</span></p>
  <h1 class="pg__title">${esc(gw.title[0])} <em>${esc(gw.title[1])}</em></h1>
  <p class="pg__lede">${esc(gw.lede)}</p>
</header>
<section class="pg__sec">
  <div class="pcards">
    ${NEWEST.map(g => guideCard(l, g).replace(' loading="lazy"', '')).join('\n    ')}
  </div>
</section>
<section class="pg__sec">
  <h2 class="pg__h2">${esc(EVENT_WORDS[l].name)}</h2>
  <div class="pcards">
    ${EVENTS.map(e => eventCard(l, e)).join('\n    ')}
  </div>
</section>
${cta(l, gw.endTitle, gw.endText)}`;
    write(fileOf(alt[l]), shell({ l, head, alt, main }));
  }
}

/* ---------- 3c. what the admin page (/admin) needs to know about the site as published ----------
   The names it offers in its lists, and when each project, article and the quotes were last saved: once the
   site in place shows that time, the admin page tells its user that the change is online. */
write('assets/admin/site.json', JSON.stringify({
  kinds: CONTENT.kinds, places: PLACES,
  events: EVENTS.map(e => ({ id: e.id, name: e.name })),
  services: SERVICES.map((s, i) => ({ id: s.id, name: { en: T.en['srv.' + (i + 1) + '.t'], fr: T.fr['srv.' + (i + 1) + '.t'] } })),
  cities: CITIES.map(c => ({ id: c.id, name: { en: tr(c.name, 'en'), fr: tr(c.name, 'fr') } })),
  published: {
    projects: Object.fromEntries(PROJECTS.map(p => [p.id, (CONTENT.projects.find(x => x.id === p.id) || {}).saved || ''])),
    blog: Object.fromEntries(GUIDES.map(g => [g.id, g.saved || ''])),
    voices: VOICES.saved || ''
  }
}, null, 1) + '\n');

/* ---------- 4. the page shown when an address does not exist ----------
   One file for both languages (the hosting serves 404.html for every unknown address): a few lines of script
   show the French words when the address or the visitor's language says so. */
{
  const L = {
    en: { doc: 'Page not found | benevents agency', title: ['This page', 'is not on the programme.'], text: 'The address may have changed, or the link was mistyped. Here is where to go next.', home: 'Back to the home page', work: 'See our projects' },
    fr: { doc: 'Page introuvable | benevents agency', title: ['Cette page', 'n’est pas au programme.'], text: 'L’adresse a peut-être changé, ou le lien contient une erreur. Voici où aller ensuite.', home: 'Retour à l’accueil', work: 'Voir nos réalisations' }
  };
  const block = l => `<div lang="${l}" data-lost="${l}"${l === 'fr' ? ' hidden' : ''}>
    <h1 class="pg__title">${esc(L[l].title[0])} <em>${esc(L[l].title[1])}</em></h1>
    <p class="pg__lede">${esc(L[l].text)}</p>
    <p class="lost__links"><a class="btn" href="${U.home(l)}"><span>${esc(L[l].home)}</span></a><a class="link-arrow" href="${U.projects(l)}">${esc(L[l].work)}</a><a class="link-arrow" href="${U.at(l, '#contact')}">${esc(W[l].talk)}</a></p>
  </div>`;
  write('404.html', `<!doctype html>
<!-- Written by tools/site/build.mjs: change it there, then run it again. -->
<html lang="en">
<head>
<meta charset="utf-8">
${GTAG}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(L.en.doc)}</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#08080a">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Open+Sans:wght@300;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css">
<link rel="stylesheet" href="/assets/css/pages.css">
${STATS}
</head>
<body class="page">
<div class="grain" aria-hidden="true"></div>
<header class="nav">
  <a class="logo" href="/" data-lost-home aria-label="benevents agency"><span class="logo__text">${BRAND}</span></a>
</header>
<main id="main" class="pg lost">
<div class="wrap">
  <p class="eyebrow"><i></i><span>404</span></p>
  ${LANGS.map(block).join('\n  ')}
</div>
</main>
<script src="/assets/js/stats.js"></script>
<script src="/assets/js/logo.js"></script>
<script>
(function () {
  var stored = null;
  try { stored = localStorage.getItem('ben-lang'); } catch (e) {}
  var fr = /^\\/fr(\\/|$)/.test(location.pathname) || (!/^\\/(services|projects)(\\/|$)/.test(location.pathname) && stored === 'fr');   // English unless the address or the visitor's own choice says French
  if (!fr) return;
  document.documentElement.lang = 'fr';
  document.title = ${JSON.stringify(L.fr.doc)};
  document.querySelector('[data-lost-home]').setAttribute('href', '/fr');
  [].forEach.call(document.querySelectorAll('[data-lost]'), function (n) { n.hidden = n.getAttribute('data-lost') !== 'fr'; });
})();
</script>
</body>
</html>
`);
}

if (LIST) { for (const [src, out] of PREVIEWS) console.log(src.slice(1) + '\t' + out.slice(1)); process.exit(0); }

/* ---------- 5. the list of pages, for search engines ---------- */
// The day a page last changed: today when this run writes it differently, or when it has changed since the
// last commit; else the day of its last change in the history of the site (git); where there is no history
// (Vercel builds without it), the day the sitemap already gave it.
const quiet = { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] };
const changedNow = (() => {
  try { return new Set(execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], quiet).split('\n').filter(Boolean).map(x => x.slice(3).replace(/^"|"$/g, ''))); } catch (e) { return null; }
})();
const today = new Date().toISOString().slice(0, 10);
const lastmod = (file, loc) => {
  if (CHANGED.has(file) || (changedNow && changedNow.has(file))) return today;
  if (changedNow) { try { const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], quiet).trim(); if (d) return d; } catch (e) {} }
  return BEFORE.get(SITE + loc) || '';
};
const entry = (loc, links, images = [], file = fileOf(loc)) => {
  const day = lastmod(file, loc);
  return `  <url>\n    <loc>${SITE + loc}</loc>\n${day ? `    <lastmod>${day}</lastmod>\n` : ''}${links.map(([k, href]) => `    <xhtml:link rel="alternate" hreflang="${k}" href="${SITE + href}"/>`).join('\n')}${[...new Set(images)].slice(0, 30).map(src => `\n    <image:image><image:loc>${SITE}/${src}</image:loc></image:image>`).join('')}\n  </url>`;
};
const urls = [];
for (const l of LANGS) urls.push(entry(U.home(l), [['en', '/'], ['fr', '/fr'], ['x-default', '/']]));
for (const pg of pages) for (const l of LANGS) urls.push(entry(pg.alt[l], [...LANGS.map(k => [k, pg.alt[k]]), ['x-default', pg.xdef]], pg.images));
for (const k of ['privacy', 'terms']) urls.push(entry('/' + k, [['en', '/' + k + '?lang=en'], ['fr', '/' + k + '?lang=fr'], ['x-default', '/' + k]]));
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Written by tools/site/build.mjs -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`);

// pages of a project or service that no longer exists are removed
const kept = new Set(pages.flatMap(pg => LANGS.map(l => fileOf(pg.alt[l]))));
for (const dir of ['services', 'projects', 'fr/services', 'fr/realisations', 'events', 'fr/evenements', 'blog', 'fr/blog', 'guides', 'fr/guides']) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const f of readdirSync(join(ROOT, dir))) if (f.endsWith('.html') && !kept.has(dir + '/' + f)) { rmSync(join(ROOT, dir, f)); console.log('removed', dir + '/' + f); }
}
// the same for the page of a city that is no longer in tools/site/pages.mjs
for (const [dir, start] of [['', CITY_WORDS.en.slug], ['fr/', CITY_WORDS.fr.slug]]) {
  for (const f of readdirSync(join(ROOT, dir))) if (f.startsWith(start) && f.endsWith('.html') && !kept.has(dir + f)) { rmSync(join(ROOT, dir, f)); console.log('removed', dir + f); }
}
console.log(`written: fr.html, 404.html, ${pages.length * 2} pages (${SERVICES.length} services, ${PRODUCTION.length} production pages, ${PROJECTS.length} projects and their list, the agency, ${CITIES.length} cities, ${EVENTS.length} kinds of events and their list, ${GUIDES.length} blog articles and their list, in ${LANGS.length} languages), sitemap.xml with ${urls.length} addresses`);
if (WARN.length) console.log(`\n${WARN.length} thing(s) left out of the pages:\n  ${[...new Set(WARN)].join('\n  ')}`);
if (NO_PREVIEW.size) console.log(`\n${NO_PREVIEW.size} picture(s) have no preview yet (their pages show the agency's picture in a shared link):\n  ${[...NO_PREVIEW].join('\n  ')}\nMake them: python3 tools/site/previews.py && node tools/site/build.mjs`);
