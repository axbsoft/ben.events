#!/usr/bin/env node
/* benevents agency — calligraphy app: add (or change, or remove) a brand offer a QR code can lead to.

   usage:  node tools/calligraphy/add_offer.mjs --slug kgm-essai --brand "KGM" \
               --url https://www.example.com/essai --fr "Réservez votre essai" --en "Book a test drive"
           add --replace to change an offer that exists · --remove --slug kgm-essai to take one away
           --root <folder> to work on another copy of the site (the default is this repository)

   A QR code printed on a bookmark never holds the brand's address itself. It holds a short link of
   ours, https://www.ben.events/o/<slug>, which counts the scan and takes the visitor to the address
   listed here (offer.html). Three things follow:
     - the QR code stays small and easy to scan, whatever the brand's address looks like;
     - the address can be corrected after the bookmarks are printed: change it here, publish the site;
     - the scans are counted: the page /o/<slug> and the event qr_scan, in the audience measurement.
   Only an https address is accepted, and the page leads nowhere that is not listed in this file.

   The words (fr, en) are printed under the QR code, so they are short and use only the letters the
   typeface of the bookmark can draw (letters with their accents, spaces, hyphens, apostrophes, full
   stops: no "?" or "!" or ":"). They say what the visitor will find: "Réservez votre essai". */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) { fail('unexpected "' + a + '" (every option starts with --)'); }
  const next = process.argv[i + 1];
  args[a.slice(2)] = next !== undefined && !next.startsWith('--') ? process.argv[++i] : true;
}
function fail(message) { console.error('error: ' + message); process.exit(1); }

const root = resolve(args.root || join(HERE, '..', '..'));
const cal = join(root, 'assets', 'calligraphy');
const offersFile = join(cal, 'offers.json'), modelsFile = join(cal, 'models.json');
if (!existsSync(offersFile)) fail('no offers.json in ' + cal);
const reg = JSON.parse(readFileSync(offersFile, 'utf8'));
reg.offers = reg.offers || {};
const slug = args.slug;
if (!/^[a-z0-9][a-z0-9-]{1,23}$/.test(slug || '')) fail('--slug: 2 to 24 letters (lower case), digits and hyphens, starting with a letter or a digit, like "kgm-essai"');
const save = () => writeFileSync(offersFile, JSON.stringify(reg, null, 1) + '\n');

if (args.remove) {
  if (!reg.offers[slug]) fail('"' + slug + '" is not listed');
  const used = Object.entries(JSON.parse(readFileSync(modelsFile, 'utf8')).models).filter(([, m]) => m.offer === slug).map(([id]) => id);
  if (used.length) fail('"' + slug + '" is the starting offer of ' + used.join(', ') + ': change that first');
  delete reg.offers[slug];
  save();
  console.log('removed "' + slug + '". QR codes already printed with it will say the offer does not exist any more.');
  process.exit(0);
}

const brand = typeof args.brand === 'string' ? args.brand.trim() : '';
if (!brand || brand.length > 40) fail('--brand: the name of the brand, 40 characters at most');
let url;
try {
  url = new URL(args.url);
  if (url.protocol !== 'https:' || !url.hostname.includes('.') || url.username || url.password) throw new Error();
} catch (e) { fail('--url: a full https address, like https://www.example.com/essai'); }
if (url.href.length > 300) fail('--url: 300 characters at most');
const latin = JSON.parse(readFileSync(join(cal, 'latin.json'), 'utf8')).glyphs;
const label = {};
for (const lang of ['fr', 'en']) {
  const text = typeof args[lang] === 'string' ? args[lang].trim() : '';
  if (!text || text.length > 34) fail('--' + lang + ': the words printed under the QR code, 34 characters at most');
  const odd = [...new Set([...text].filter(c => !latin[c]))];
  if (odd.length) fail('--' + lang + ': the typeface of the bookmark cannot draw ' + odd.map(c => '"' + c + '"').join(' ') + ' (use letters, spaces, hyphens, apostrophes and full stops)');
  label[lang] = text;
}
if (reg.offers[slug] && !args.replace) fail('"' + slug + '" is already listed: add --replace to change it');

reg.offers[slug] = { brand, url: url.href, label };
save();

// how big the modules of its QR code will be on the plate of a model
const qrcode = createRequire(import.meta.url)(join(root, 'assets', 'js', 'qrcode.js'));
const code = qrcode(0, 'M');
code.addData('https://www.ben.events/o/' + slug);
code.make();
const n = code.getModuleCount();
const plate = 21;
console.log(`${reg.offers[slug] === undefined ? '' : 'saved'} "${slug}" → ${url.href}`);
console.log(`  words: ${label.fr} / ${label.en}`);
console.log(`  the QR code holds https://www.ben.events/o/${slug}: ${n} × ${n} modules, ${(plate / (n + 8)).toFixed(2)} mm each on a plate of ${plate} mm (0.5 mm and more scans well)`);
console.log('  publish the site for it to be used; the scans appear in the audience measurement as the page /o/' + slug);
