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
     404.html                               what a visitor sees when an address does not exist
     sitemap.xml                            the list of all of them, with the day each last changed and its pictures

   It also rewrites, in index.html, the lines between "head:seo" and "/head:seo" (title, description,
   addresses of the two languages, data for search engines), from assets/js/i18n.js (meta).

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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://www.ben.events';
const MAIL = 'contact@ben.events';
const PHONE = '+212 661 11 85 90';
const WA = 'https://wa.me/' + PHONE.replace(/\D/g, '');
const SOCIAL = { instagram: 'https://www.instagram.com/benevents.agency', linkedin: 'https://www.linkedin.com/company/benevents/' };
// audience measurement (Rybbit, without cookies): the same line is in index.html, presentation.html and tools/legal/build.py
const STATS = '<script src="https://app.rybbit.io/api/script.js?siteId=5ad12948434d" defer></script>';
const LANGS = ['en', 'fr'];

const read = f => readFileSync(join(ROOT, f), 'utf8');
const LIST = process.argv.includes('--previews');        // only say which preview pictures the pages need
const write = (f, s) => { if (LIST) return; mkdirSync(dirname(join(ROOT, f)), { recursive: true }); writeFileSync(join(ROOT, f), s); };

/* ---------- what the site says ---------- */
const box = { window: {} };
vm.createContext(box);
for (const f of ['i18n.js', 'projects.js', 'services.js', 'voices.js']) vm.runInContext(read('assets/js/' + f), box, { filename: f });
const I18N = box.window.BEN_I18N, PROJECTS = box.window.BEN_PROJECTS, SERVICES = box.window.BEN_SERVICES, PLACES = box.window.BEN_PLACES || {};
const FIGURES = (box.window.BEN_FIGURES || []).slice(0, 4), QUOTES = box.window.BEN_QUOTES || [];
for (const pr of PROJECTS) if (pr.city && !PLACES[pr.city]) throw new Error(`projects.js: the city "${pr.city}" of "${pr.id}" is not in the list of places`);
// the cities that have a page are the same on both sides: PLACES (projects.js, "page: true") and CITIES (pages.mjs)
for (const c of CITIES) if (!PLACES[c.id] || !PLACES[c.id].page) throw new Error(`the city "${c.id}" has a page (tools/site/pages.mjs) but is not marked "page: true" in the places of projects.js`);
for (const k of Object.keys(PLACES)) if (PLACES[k].page && !CITIES.some(c => c.id === k)) throw new Error(`projects.js marks the place "${k}" as having a page, but tools/site/pages.mjs has no city of that name`);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const att = s => esc(s).replace(/"/g, '&quot;');
const unesc = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&');

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
  legal: (l, k) => '/' + k + '?lang=' + l
};
const fileOf = path => (path === '/' ? 'index' : path.slice(1)) + '.html';

/* ---------- words these pages add ---------- */
const W = {
  en: {
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
    faq: 'Frequent questions', quick: 'Quick contact', call: 'Call', cities: 'Where we work', fFor: 'For', fWhere: 'Where', fWhen: 'When', fGuests: 'Guests', did: 'What we delivered', story: 'The project', result: 'The result:', inCity: n => 'in ' + n
  },
  fr: {
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
    faq: 'Questions fréquentes', quick: 'Contact rapide', call: 'Appeler', cities: 'Nos villes', fFor: 'Pour', fWhere: 'Lieu', fWhen: 'Date', fGuests: 'Invités', did: 'Ce que nous avons réalisé', story: 'Le projet', result: 'Le résultat :', inCity: n => 'à ' + n
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
const cityOf = p => CITIES.find(c => c.id === p.city);        // the city of a project, when it has a page
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
  hasOfferCatalog: { '@type': 'OfferCatalog', name: T[l]['srv.eyebrow'], itemListElement: SERVICES.map((s, i) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: T[l]['srv.' + (i + 1) + '.t'], description: T[l]['srv.' + (i + 1) + '.d'], url: SITE + U.service(l, s) } })) }
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

/* ---------- 1. the home page: its head in English, and the whole page in French ---------- */
const BLOCK = /(<!-- head:seo[^>]*-->\n)[\s\S]*?(\n<!-- \/head:seo -->)/;
if (!BLOCK.test(home)) throw new Error('index.html: the lines "head:seo" … "/head:seo" are missing from the head');
// a function, so that a "$" in a text is not read as a group of the pattern
home = home.replace(BLOCK, (m, a, b) => a + homeHead('en') + b);
// the links to a service or a project page follow the addresses decided here
const PAGE_LINK = /(<a\b[^>]*?\shref=")[^"]*("[^>]*\sdata-page="([^"]+)")/g;
home = home.replace(PAGE_LINK, (m, a, b, page) => a + pageHref('en', page).slice(1) + b);
write('index.html', home);

function french(page) {
  let s = page.replace('<html lang="en">', '<html lang="fr">');
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
  const [kind, id] = page.split(':');
  if (kind === 'service') return U.service(l, SERVICES.find(s => s.id === id));
  if (kind === 'project') return U.project(l, byId[id]);
  if (kind === 'projects') return U.projects(l);
  if (kind === 'agency') return U.agency(l);
  if (kind === 'city') return U.city(l, CITIES.find(c => c.id === id));
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
    <a href="${U.at(l, '#services')}">${esc(t['nav.services'])}</a>
    <a href="${U.projects(l)}">${esc(t['nav.gallery'])}</a>
    <a href="${U.at(l, '#process')}">${esc(t['nav.process'])}</a>
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
      <p>${esc(t['ft.tag'])}</p>
      <a class="link-arrow" href="${U.at(l, '#contact')}">${esc(w.talk)}</a>
    </div>
    <nav class="pfoot__col" aria-label="${att(w.fServices)}">
      <h2>${esc(w.fServices)}</h2>
      ${SERVICES.map((s, i) => `<a href="${U.service(l, s)}">${esc(t['srv.' + (i + 1) + '.t'])}</a>`).join('\n      ')}
    </nav>
    <nav class="pfoot__col" aria-label="${att(w.fAgency)}">
      <h2>${esc(w.fAgency)}</h2>
      <a href="${U.home(l)}">${esc(w.homeName)}</a>
      <a href="${U.agency(l)}">${esc(AGENCY[l].name)}</a>
      <a href="${U.projects(l)}">${esc(w.work)}</a>
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
    <nav aria-label="Legal"><a href="${U.legal(l, 'privacy')}">${esc(w.privacy)}</a><a href="${U.legal(l, 'terms')}">${esc(w.terms)}</a></nav>
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
<script>document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });</script>
</body>
</html>
`;
}

const crumbNav = (l, items) => `<nav class="crumbs" aria-label="${att(W[l].crumbs)}"><ol>${items.map(([name, path]) => path ? `<li><a href="${path}">${esc(name)}</a></li>` : `<li aria-current="page">${esc(name)}</li>`).join('')}</ol></nav>`;
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
const projectCard = (l, p, text) => {
  const title = tr(p.title, l);
  return `<a class="pcard" href="${U.project(l, p)}">
      <span class="pcard__ph">${img(p.photos[0], W[l].photoOf(title), ' loading="lazy"', text ? 'wide' : 'card')}</span>
      <span class="pcard__in">${text ? `<b>${esc(text[0])}</b><span>${esc(text[1])}</span><small>${esc(W[l].see)} ${esc(titleParts(title)[0])}</small>` : `<b>${esc(title)}</b><small>${esc(tr(p.kind, l))}</small>`}</span>
    </a>`;
};

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
${s.more ? `<section class="pg__sec">
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
// The day a page last changed: today when this run has just written it differently, else the day of its last
// change in the history of the site (git). Left out when git cannot say.
const changedNow = (() => {
  try { return new Set(execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean).map(x => x.slice(3).replace(/^"|"$/g, ''))); } catch (e) { return null; }
})();
const today = new Date().toISOString().slice(0, 10);
const lastmod = file => {
  if (!changedNow) return '';
  if (changedNow.has(file)) return today;
  try { return execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) { return ''; }
};
const entry = (loc, links, images = [], file = fileOf(loc)) => {
  const day = lastmod(file);
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
for (const dir of ['services', 'projects', 'fr/services', 'fr/realisations']) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const f of readdirSync(join(ROOT, dir))) if (f.endsWith('.html') && !kept.has(dir + '/' + f)) { rmSync(join(ROOT, dir, f)); console.log('removed', dir + '/' + f); }
}
// the same for the page of a city that is no longer in tools/site/pages.mjs
for (const [dir, start] of [['', CITY_WORDS.en.slug], ['fr/', CITY_WORDS.fr.slug]]) {
  for (const f of readdirSync(join(ROOT, dir))) if (f.startsWith(start) && f.endsWith('.html') && !kept.has(dir + f)) { rmSync(join(ROOT, dir, f)); console.log('removed', dir + f); }
}
console.log(`written: fr.html, 404.html, ${pages.length * 2} pages (${SERVICES.length} services, ${PROJECTS.length} projects and their list, the agency, ${CITIES.length} cities, in ${LANGS.length} languages), sitemap.xml with ${urls.length} addresses`);
if (NO_PREVIEW.size) console.log(`\n${NO_PREVIEW.size} picture(s) have no preview yet (their pages show the agency's picture in a shared link):\n  ${[...NO_PREVIEW].join('\n  ')}\nMake them: python3 tools/site/previews.py && node tools/site/build.mjs`);
