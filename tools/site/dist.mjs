#!/usr/bin/env node
/* benevents agency — what Vercel publishes: the site, without what only builds it.

   Vercel runs, on every deployment (vercel.json, "buildCommand"):
       node tools/site/build.mjs && node tools/site/dist.mjs
   The first writes the pages; this one copies the site into dist/, the folder Vercel publishes ("outputDirectory"),
   leaving out the tools, the content data (content/, drafts included), the code of the server (api/, which Vercel
   runs as functions all the same) and the files of the repository. */
import { cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'dist');
const LEAVE = new Set(['dist', 'tools', 'content', 'api', 'node_modules', 'guides', 'vercel.json', 'package.json', 'package-lock.json', 'README.md']);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
const kept = [];
for (const f of readdirSync(ROOT)) {
  if (f.startsWith('.') || LEAVE.has(f)) continue;
  cpSync(join(ROOT, f), join(OUT, f), { recursive: true });
  kept.push(f);
}
console.log(`dist/: ${kept.length} files and folders of the site (${[...LEAVE].filter(x => x !== 'dist').join(', ')} and the hidden files left out)`);
