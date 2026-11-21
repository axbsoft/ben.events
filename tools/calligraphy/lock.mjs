#!/usr/bin/env node
/* benevents agency — calligraphy app: set (or change) the team's code.

   usage:  node tools/calligraphy/lock.mjs --code "<the team's code>"

   Writes assets/calligraphy/app.json, which holds:
     - a few encrypted bytes that only the code can open: the app uses them to tell a right code
       from a wrong one, and finds inside them the pass it shows the server with each contact;
     - the fingerprint of that pass: api/calligraphy.js reads it to recognise the app, and to refuse
       anyone else. A fingerprint does not give the pass back.
   The code itself is written nowhere: not in this file, not in the site.
   The code is not case sensitive: capitals and the spaces around it are ignored.

   Changing the code: run this again with the new one, then publish the site. Devices that had the
   app open must open it again with the new code (their old pass is refused by the server; the
   contacts they hold stay on them and leave once the app is reopened). */
import { createCipheriv, createHash, pbkdf2Sync, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ITERATIONS = 600000;
const CHECK = 'benevents:open';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'calligraphy', 'app.json');

const at = process.argv.indexOf('--code');
const raw = at > -1 ? process.argv[at + 1] : '';
const code = (raw || '').normalize('NFKC').trim().toLowerCase();
if (code.length < 4) { console.error('usage: node tools/calligraphy/lock.mjs --code "<the team\'s code, 4 characters or more>"'); process.exit(1); }

const salt = randomBytes(16);
const key = pbkdf2Sync(Buffer.from(code, 'utf8'), salt, ITERATIONS, 32, 'sha256');
// a locked piece: 12 random bytes, then the encrypted bytes, then the 16-byte seal
function lock(bytes) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, c.update(bytes), c.final(), c.getAuthTag()]).toString('base64');
}
const pass = randomBytes(24).toString('base64url');
const manifest = {
  v: 1,
  rev: randomBytes(4).toString('hex'),
  kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: salt.toString('base64') },
  check: lock(Buffer.from(CHECK, 'utf8')),
  box: lock(Buffer.from(JSON.stringify({ pass }), 'utf8')),
  pass: createHash('sha256').update(pass).digest('hex')
};
writeFileSync(OUT, JSON.stringify(manifest, null, 1) + '\n');
console.log('locked -> assets/calligraphy/app.json (publish the site for the new code to take effect)');
