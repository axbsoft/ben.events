#!/usr/bin/env node
/* benevents agency — prepare the files of a presentation for the website (assets/js/client.js shows them).

   Behind an access code (a client page): the slides and the PDF are encrypted here, on your computer.
   Only the encrypted files go into the website; a visitor's browser can open them only with the code.
   The code itself is never written anywhere in the site.

   usage (one --lang block per language, the first one is the default):
     node tools/lock-presentation.mjs --out assets/m-automotiv --code "<access code>" \
          --lang fr --slides <folder of 01.webp, 02.webp …> --thumbs <thumbs.webp> \
                    --pdf <file.pdf> --pdf-name "Name.pdf" \
          --lang en --slides … --thumbs … --pdf … --pdf-name "Name.pdf" \
          --meta <meta.json> --live 13

   Or open to everyone (a presentation made to be shared, such as presentation.html): --open in place
   of --code. The files are then copied as they are.
     node tools/lock-presentation.mjs --out assets/presentation --open --lang fr … --lang en … --meta <meta.json>

   --thumbs  one image holding every slide as a small tile, 6 per row, in order.
   --meta    optional: { "fr": [ { "text": "words of slide 1", "links": [ { "href": "mailto:…",
             "label": "…", "box": [left, top, width, height] } ] }, … ], "en": [ … ] }
             (box in % of the slide). The text is read out by screen readers; links become
             clickable areas on the slide.
   --live    optional: the numbers of the slides the page brings to life, separated by commas
             (slide 13 is the calligraphy demonstration, assets/js/calligraphy.js). Their picture
             is still needed: it is the thumbnail, and what shows if the demonstration cannot load.
   The code is not case sensitive: capitals and the spaces around it are ignored. */
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const ITERATIONS = 600000;
const CHECK = 'benevents:open';
const TYPE = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

const args = {}, sets = [];
let open = false;
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i].replace(/^--/, '');
  if (k === 'open') { open = true; continue; }
  const v = process.argv[++i];
  if (k === 'lang') sets.push({ lang: v });
  else if (['slides', 'thumbs', 'pdf', 'pdf-name'].includes(k)) {
    if (!sets.length) { console.error('--' + k + ' must come after a --lang'); process.exit(1); }
    sets[sets.length - 1][k] = v;
  } else args[k] = v;
}
if (!args.out || (!args.code && !open) || !sets.length) { console.error('missing --out, --code (or --open) or --lang (see the top of this file)'); process.exit(1); }
if (args.code && open) { console.error('--code and --open do not go together: a presentation is either locked or open'); process.exit(1); }
for (const s of sets) for (const k of ['slides', 'thumbs', 'pdf']) {
  if (!s[k]) { console.error('language ' + s.lang + ': missing --' + k); process.exit(1); }
}

const code = open ? '' : args.code.normalize('NFKC').trim().toLowerCase();
const salt = randomBytes(16);
const key = open ? null : pbkdf2Sync(Buffer.from(code, 'utf8'), salt, ITERATIONS, 32, 'sha256');
const ext = f => f.split('.').pop().toLowerCase();

// every file: 12 random bytes, then the encrypted bytes, then the 16-byte seal
function lock(bytes) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, c.update(bytes), c.final(), c.getAuthTag()]);
}
function clean(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) if (/\.(bin|json|webp|jpe?g|png|pdf)$/i.test(f)) rmSync(join(dir, f));
}

mkdirSync(args.out, { recursive: true });
clean(args.out);
const manifest = open ? { v: 2, rev: randomBytes(4).toString('hex'), open: true, langs: {}, meta: false } : {
  v: 2,
  rev: randomBytes(4).toString('hex'),
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: salt.toString('base64') },
  check: lock(Buffer.from(CHECK, 'utf8')).toString('base64'),
  langs: {},
  meta: false
};
for (const s of sets) {
  const dir = join(args.out, s.lang);
  mkdirSync(dir, { recursive: true });
  clean(dir);
  const slides = readdirSync(s.slides).filter(f => /^\d+\.(webp|jpe?g|png)$/i.test(f)).sort();
  if (!slides.length) { console.error('no slides found in ' + s.slides); process.exit(1); }
  let total = 0;
  if (open && slides.some(f => ext(f) !== ext(slides[0]))) { console.error('language ' + s.lang + ': the slides of an open presentation must all be of one kind (.webp, .jpg or .png)'); process.exit(1); }
  slides.forEach((f, i) => {
    const bytes = readFileSync(join(s.slides, f)), out = open ? bytes : lock(bytes);
    total += out.length;
    writeFileSync(join(dir, String(i + 1).padStart(2, '0') + (open ? '.' + ext(f) : '.bin')), out);
  });
  const pdf = readFileSync(s.pdf), pdfName = s['pdf-name'] || 'presentation-' + s.lang + '.pdf';
  const pdfFile = basename(pdfName).replace(/[^A-Za-z0-9._-]+/g, '-');
  writeFileSync(join(dir, open ? 'thumbs.' + ext(s.thumbs) : 'thumbs.bin'), open ? readFileSync(s.thumbs) : lock(readFileSync(s.thumbs)));
  writeFileSync(join(dir, open ? pdfFile : 'deck.bin'), open ? pdf : lock(pdf));
  manifest.langs[s.lang] = {
    count: slides.length,
    type: TYPE[ext(slides[0])],
    thumbs: { type: TYPE[ext(s.thumbs)], columns: 6 },
    pdf: { name: pdfName }
  };
  if (open) {                                   // where a browser finds each plain file
    manifest.langs[s.lang].ext = ext(slides[0]);
    manifest.langs[s.lang].thumbs.file = 'thumbs.' + ext(s.thumbs);
    manifest.langs[s.lang].pdf.file = pdfFile;
  }
  console.log(s.lang + ': ' + slides.length + ' slides (' + (total / 1048576).toFixed(2) + ' MB), PDF ' + (pdf.length / 1048576).toFixed(2) + ' MB');
}
if (args.meta) {
  writeFileSync(join(args.out, open ? 'meta.json' : 'meta.bin'), open ? readFileSync(args.meta) : lock(readFileSync(args.meta)));
  manifest.meta = true;
}
if (args.live) {
  manifest.live = args.live.split(',').map(n => parseInt(n, 10));
  const most = Math.min(...Object.values(manifest.langs).map(l => l.count));
  if (manifest.live.some(n => !(n >= 1 && n <= most))) { console.error('--live: slide numbers must be between 1 and ' + most); process.exit(1); }
}
writeFileSync(join(args.out, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log((open ? 'open to everyone -> ' : 'locked -> ') + args.out);
