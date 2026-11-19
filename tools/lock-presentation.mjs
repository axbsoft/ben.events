#!/usr/bin/env node
/* benevents agency — lock a client presentation behind an access code.

   The slides and the PDF are encrypted here, on your computer. Only the encrypted
   files go into the website; a visitor's browser can open them only with the code.
   The code itself is never written anywhere in the site.

   usage:
     node tools/lock-presentation.mjs --slides <folder of 01.webp, 02.webp …> \
          --thumbs <thumbs.webp> --pdf <file.pdf> --pdf-name "Name.pdf" \
          --out assets/m-automotive --code "<access code>"

   --thumbs  one image holding every slide as a small tile, 6 per row, in order.
   The code is not case sensitive: capitals and the spaces around it are ignored. */
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ITERATIONS = 600000;
const CHECK = 'benevents:open';

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
for (const k of ['slides', 'thumbs', 'pdf', 'out', 'code']) {
  if (!args[k]) { console.error('missing --' + k + ' (see the top of this file)'); process.exit(1); }
}

const code = args.code.normalize('NFKC').trim().toLowerCase();
const salt = randomBytes(16);
const key = pbkdf2Sync(Buffer.from(code, 'utf8'), salt, ITERATIONS, 32, 'sha256');

// every file: 12 random bytes, then the encrypted bytes, then the 16-byte seal
function lock(bytes) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, c.update(bytes), c.final(), c.getAuthTag()]);
}

mkdirSync(args.out, { recursive: true });
for (const f of readdirSync(args.out)) if (/\.(bin|json)$/.test(f)) rmSync(join(args.out, f));

const slides = readdirSync(args.slides).filter(f => /^\d+\.(webp|jpe?g|png)$/i.test(f)).sort();
if (!slides.length) { console.error('no slides found in ' + args.slides); process.exit(1); }
const type = { webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
let total = 0;
slides.forEach((f, i) => {
  const out = lock(readFileSync(join(args.slides, f)));
  total += out.length;
  writeFileSync(join(args.out, String(i + 1).padStart(2, '0') + '.bin'), out);
});
const thumbs = lock(readFileSync(args.thumbs));
writeFileSync(join(args.out, 'thumbs.bin'), thumbs);
const pdfBytes = readFileSync(args.pdf);
const pdf = lock(pdfBytes);
writeFileSync(join(args.out, 'deck.bin'), pdf);

const manifest = {
  v: 1,
  rev: randomBytes(4).toString('hex'),
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: salt.toString('base64') },
  check: lock(Buffer.from(CHECK, 'utf8')).toString('base64'),
  slides: { count: slides.length, type: type[slides[0].split('.').pop().toLowerCase()], width: 16, height: 9 },
  thumbs: { type: type[args.thumbs.split('.').pop().toLowerCase()], columns: 6 },
  pdf: { name: args['pdf-name'] || 'presentation.pdf', bytes: pdfBytes.length }
};
writeFileSync(join(args.out, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(slides.length + ' slides (' + (total / 1048576).toFixed(2) + ' MB), thumbnails ' + Math.round(thumbs.length / 1024) + ' KB, PDF ' +
  (pdf.length / 1048576).toFixed(2) + ' MB -> ' + args.out);
