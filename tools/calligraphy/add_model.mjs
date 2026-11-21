#!/usr/bin/env node
/* benevents agency — calligraphy app: add a client's own bookmark to the models the team can choose.

   A bookmark has two sides. The FRONT carries the visitor's name and the client's artwork, nothing else.
   The BACK carries the QR code that leads to the brand's offer; it is the same for every visitor, so
   it can be printed in advance, in numbers. The app draws the QR code card on the picture of the back.

   Two ways to give the front a picture:

   1. The client's finished artwork (a designer's file), at the proportions of the bookmark, 1 : 3:
        node tools/calligraphy/add_model.mjs --id kgm-bookmark --script ko --brand "KGM" \
            --label-fr "KGM · marque-page" --label-en "KGM · bookmark" --artwork artwork.jpg \
            --han 30,72 --box 30,56 --line 107.5 --gap 20.6,39.7
      The artwork must leave room, in the middle, for the name in characters (--han: the centre in mm
      from the top left corner of the 60 × 180 mm sheet, --box: the room it may take, width and height)
      and, under it, for the rule the visitor's own name sits on (--line: its height, --gap: where its
      two dashes end and begin). Look at the preview (--preview) and move them until it is right.

   2. A logo, composed on a plain bookmark of the language (the landscape, the seal and a frame stay;
      the logo takes the place of the national emblem):
        node tools/calligraphy/add_model.mjs --id kgm-bookmark --script ko --brand "KGM" \
            --label-fr "KGM · marque-page" --label-en "KGM · bookmark" --logo kgm-logo.svg \
            [--logo-plate "#0c0c0f"] [--accent "#b9892f"] [--paper "#f7f0e3"] [--ink "#1a181c"] \
            --korean <Korean brush font> --japanese <Japanese brush font>
      --no-seal draws no seal (and needs no fonts), --no-landscape leaves the foot of the bookmark bare.

   The back, in both cases, is drawn for you unless the client sends one:
     - with a logo: the same paper, frame, logo and landscape as the front, the middle left bare;
     - with artwork: a sheet of the colour of the artwork's edge, in a frame (--accent), with the middle
       left bare (and --back-logo, a logo at the top, if you want one);
     - --back-artwork back.jpg: the client's own back, 1 : 3 like the front. Leave the middle bare.
   --qr x,y,side[,words] says where the QR code card goes on the back, in mm (the centre of the square the
   code sits in, its side, and the size of the words under it); the default is 30,84,36,3.1. --no-qr gives
   the model no back and no QR code.

   Options for both:
     --offer <slug>      the offer the QR code starts with (assets/calligraphy/offers.json, add_offer.mjs)
     --preview out.png   a picture of the front with a few names and of the back, drawn by the real engine
     --names "A,B,C"     the names of the preview (default: Yassine, Fatima Zahra, Abderrahmane)
     --paper "#f7f0e3"   the colour of the paper: it fills the edge of the print-shop version
                         (for artwork it is read from the artwork's edge when left out)
     --ink "#1a181c"     the colour of the characters and of the visitor's name
     --replace           change a model that exists · --remove --id <id> takes one away
     --root <folder>     work on another copy of the site (the default is this repository)
   needs: playwright (it reads and draws the pictures with a browser). Afterwards publish the site. */
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) fail('unexpected "' + a + '" (every option starts with --)');
  const next = process.argv[i + 1];
  args[a.slice(2)] = next !== undefined && !next.startsWith('--') ? process.argv[++i] : true;
}
const wrote = [];
function fail(message) { for (const f of wrote) { try { rmSync(f); } catch (e) {} } console.error('error: ' + message); process.exit(1); }
const num = (v, what) => { if (v === undefined) return undefined; const n = Number(v); if (!Number.isFinite(n)) fail(what + ': a number'); return n; };
const list = (v, counts, what) => { if (v === undefined) return undefined; const p = String(v).split(',').map(Number); if (!counts.includes(p.length) || p.some(x => !Number.isFinite(x))) fail(what + ': ' + counts.join(' or ') + ' numbers separated by commas'); return p; };
const HEX = /^#[0-9a-fA-F]{6}$/;
const rgb = (hex, what) => { if (hex === undefined) return undefined; if (!HEX.test(hex)) fail(what + ': a colour like "#b9892f"'); return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); };
const hexOf = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

const root = resolve(args.root || join(HERE, '..', '..'));
const cal = join(root, 'assets', 'calligraphy');
const modelsFile = join(cal, 'models.json');
if (!existsSync(modelsFile)) fail('no models.json in ' + cal);
const reg = JSON.parse(readFileSync(modelsFile, 'utf8'));
const offers = existsSync(join(cal, 'offers.json')) ? JSON.parse(readFileSync(join(cal, 'offers.json'), 'utf8')).offers || {} : {};
const id = args.id;
if (!/^[a-z0-9][a-z0-9-]{2,38}[a-z0-9]$/.test(id || '')) fail('--id: 4 to 40 letters (lower case), digits and hyphens, like "kgm-bookmark"');
const save = () => writeFileSync(modelsFile, JSON.stringify(reg, null, 1) + '\n');
const frontFile = join(cal, 'templates', id + '_60x180mm.jpg'), backFile = join(cal, 'templates', id + '-back_60x180mm.jpg');
// the pictures are drawn aside and only put in place once the whole model is sound: a model that fails leaves nothing behind,
// and a model that is replaced keeps its old pictures until then
const frontNew = frontFile + '.new', backNew = backFile + '.new';
// a picture is removed only when it is the one this tool names after the model
const drop = (m, key) => { const rel = key === 'back' ? m.back && m.back.image : m.image, file = rel && join(cal, rel); if (file && [basename(frontFile), basename(backFile)].includes(basename(file)) && existsSync(file)) rmSync(file); };

if (args.remove) {
  const m = reg.models[id];
  if (!m) fail('"' + id + '" is not listed');
  if (['hanzi-bookmark', 'kana-bookmark', 'hangul-bookmark'].includes(id)) fail('"' + id + '" is one of the three plain bookmarks: it stays');
  delete reg.models[id];
  save();
  drop(m, 'front'); drop(m, 'back');
  console.log('removed "' + id + '" and its pictures. Contacts already sent keep their link: it will say the model does not exist.');
  process.exit(0);
}

// ---- what is asked
const script = args.script;
if (!['zh', 'ja', 'ko'].includes(script)) fail('--script: zh (Chinese), ja (Japanese) or ko (Korean)');
const label = {};
for (const lang of ['fr', 'en']) {
  const text = typeof args['label-' + lang] === 'string' ? args['label-' + lang].trim() : '';
  if (!text || text.length > 40) fail('--label-' + lang + ': the name of the model as the team reads it, 40 characters at most');
  label[lang] = text;
}
const brand = typeof args.brand === 'string' ? args.brand.trim().slice(0, 60) : '';
if (!args.artwork === !args.logo) fail('give either --artwork (the client\'s finished front) or --logo (to compose one), not both and not neither');
if (args['back-artwork'] && args['no-qr']) fail('--back-artwork and --no-qr do not go together: a back is there to carry the QR code');
if (args['no-qr'] && args.offer !== undefined) fail('--offer: --no-qr gives the model no back, so no QR code');
if (reg.models[id] && !args.replace) fail('"' + id + '" is already listed: add --replace to change it');
if (args.offer !== undefined && !offers[args.offer]) fail('--offer: "' + args.offer + '" is not in offers.json (add_offer.mjs adds one)');
const W = 60, H = 180;
// the places on the sheet are checked first, so that a model that is refused leaves nothing behind
const han = list(args.han, [2], '--han') || [30, 74], box = list(args.box, [2], '--box') || [30, 58];
const lineY = num(args.line, '--line') || 112.4, gap = list(args.gap, [2], '--gap') || [20.6, 39.4], below = num(args.below, '--below') || +(lineY + 6.2).toFixed(2);
if (han[0] - box[0] / 2 < 4 || han[0] + box[0] / 2 > W - 4 || han[1] - box[1] / 2 < 4 || han[1] + box[1] / 2 > lineY - 2) fail('--han / --box: the room for the characters must stay inside the frame (4 mm in) and at least 2 mm above the rule');
if (gap[0] < 4 || gap[1] > W - 4 || gap[1] - gap[0] < 12 || lineY + 8 > H - 4) fail('--line / --gap: the rule and the name under it must stay inside the frame, with 12 mm between the dashes at least');
const zone = list(args.qr, [3, 4], '--qr') || [30, 84, 36, 3.1], hasBack = !args['no-qr'];
if (hasBack) {
  const [x, y, plate, words = 3.1] = zone;
  // the card is the square of the code and, under it, the two lines of words (3.34 times their size)
  if (plate < 24 || x - plate / 2 < 8 || x + plate / 2 > W - 8 || y - plate / 2 < 8 || y + plate / 2 + 3.34 * words > H - 8) {
    fail('--qr: the card (the square of the code, 24 mm at least, and the two lines of words under it) must sit inside the frame, 8 mm in from every edge');
  }
}
mkdirSync(dirname(frontFile), { recursive: true });
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();

// a finished picture from the client: read, checked at 1 : 3, kept at most 1000 pixels wide; its edge colour is returned
async function fromArtwork(file, target, what) {
  if (!existsSync(file)) fail('--' + what + ': no such file');
  const type = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }[extname(file).slice(1).toLowerCase()];
  if (!type) fail('--' + what + ': a .jpg, .png or .webp picture');
  const tab = await browser.newPage();
  const got = await tab.evaluate(async ({ url }) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const w = img.naturalWidth, h = img.naturalHeight;
    if (Math.abs(w / h - 1 / 3) > .012) return { w, h, error: 'proportions' };
    const tw = Math.min(w, 1000), th = tw * 3, cv = document.createElement('canvas');
    cv.width = tw; cv.height = th;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, tw, th);
    // the colour of the edge of the sheet (for the bleed of the print-shop version)
    const ring = [];
    for (const d of [ctx.getImageData(0, 0, tw, 3), ctx.getImageData(0, th - 3, tw, 3), ctx.getImageData(0, 0, 3, th), ctx.getImageData(tw - 3, 0, 3, th)]) {
      for (let i = 0; i < d.data.length; i += 4) ring.push([d.data[i], d.data[i + 1], d.data[i + 2]]);
    }
    const mean = [0, 1, 2].map(c => Math.round(ring.reduce((s, p) => s + p[c], 0) / ring.length));
    return { w, h, tw, th, edge: mean, jpeg: cv.toDataURL('image/jpeg', .92).split(',')[1] };
  }, { url: `data:${type};base64,` + readFileSync(file).toString('base64') });
  await tab.close();
  if (got.error) fail(`--${what} is ${got.w} × ${got.h} pixels: its proportions must be 1 : 3 (width : height), like 60 × 180 mm. Crop or extend it to ${got.w} × ${got.w * 3}.`);
  wrote.push(target);
  writeFileSync(target, Buffer.from(got.jpeg, 'base64'));
  if (got.w < 600) console.warn(`warning: --${what}: ${got.w} pixels across 60 mm is ${Math.round(got.w / 60 * 25.4)} dpi: it will print soft. Ask the client for a file at least 709 pixels wide (300 dpi).`);
  console.log(`${what === 'artwork' ? 'front' : 'back'}: ${got.w} × ${got.h} → ${got.tw} × ${got.th} pixels, ${(statSync(target).size / 1024).toFixed(0)} KB`);
  return got.edge;
}
// a bookmark composed by make_template.js
function compose(target, extra) {
  wrote.push(target);
  const run = spawnSync(process.execPath, [join(HERE, 'make_template.js'), ...(args.korean && args.japanese ? [args.korean, args.japanese] : []), '--kind', script, '--out', target, ...extra], { stdio: 'inherit' });
  if (run.status !== 0) fail('a bookmark could not be drawn');
}
const colours = ['logo-plate', 'accent', 'paper'].flatMap(k => args[k] ? ['--' + k, args[k]] : []);
rgb(args.paper, '--paper'); rgb(args.accent, '--accent'); rgb(args['logo-plate'], '--logo-plate');

// ---- 1. the front
let edge = rgb(args.paper, '--paper');
if (args.artwork) edge = edge || await fromArtwork(args.artwork, frontNew, 'artwork');
else {
  if (!args['no-seal'] && (!args.korean || !args.japanese)) fail('the seal is drawn with two brush typefaces: give --korean and --japanese (the files build_app.py names), or --no-seal');
  compose(frontNew, ['--logo', args.logo, ...colours, ...['no-seal', 'no-landscape'].filter(k => args[k]).map(k => '--' + k)]);
  edge = edge || rgb('#f7f0e3');
}

// ---- 2. the back, where there is a QR code to carry
if (hasBack) {
  if (args['back-artwork']) await fromArtwork(args['back-artwork'], backNew, 'back-artwork');
  else if (args.logo) compose(backNew, ['--back', '--logo', args.logo, ...colours, ...(args['no-landscape'] ? ['--no-landscape'] : [])]);
  else compose(backNew, ['--back', '--no-emblem', '--no-landscape', '--paper', hexOf(edge), '--accent', args.accent || '#b9892f', ...(args['back-logo'] ? ['--logo', args['back-logo'], ...(args['logo-plate'] ? ['--logo-plate', args['logo-plate']] : [])] : [])]);
}
await browser.close();

// ---- 3. its place in the registry
const entry = {
  script, image: 'templates/' + id + '_60x180mm.jpg', label, brand, w: W, h: H, han, box, name: 5.6, nameMax: 40,
  line: { y: lineY, gap, min: 4.3, below }, edge, ink: rgb(args.ink, '--ink') || [26, 24, 28]
};
if (hasBack) {
  const [x, y, plate, words = 3.1] = zone;
  entry.back = { image: 'templates/' + id + '-back_60x180mm.jpg', qr: { x, y, plate, words } };
  if (args.accent) entry.back.qr.border = rgb(args.accent, '--accent');
}
if (args.offer !== undefined) entry.offer = args.offer;
const before = reg.models[id];
reg.models[id] = entry;
renameSync(frontNew, frontFile);
if (hasBack) renameSync(backNew, backFile);
wrote.length = 0;
if (before && before.back && !hasBack) drop(before, 'back');       // a replaced model that has no back any more leaves none behind
save();
console.log(`model "${id}" → ${basename(modelsFile)} (${script}, ${label.fr}${hasBack ? ', with a back for the QR code' : ', no back'})`);

// ---- 4. a look at it, drawn by the real engine
if (args.preview) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };
  const server = createServer((req, res) => {
    const file = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\/+$/, '') || '/privacy.html');
    const real = existsSync(file) && statSync(file).isFile() ? file : existsSync(file + '.html') ? file + '.html' : null;
    if (!real || !real.startsWith(root)) { res.statusCode = 404; return res.end('no'); }
    res.setHeader('Content-Type', types[extname(real)] || 'application/octet-stream');
    res.end(readFileSync(real));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const shots = await chromium.launch();
  const tab = await shots.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  await tab.goto(origin + '/privacy.html');
  await tab.addScriptTag({ url: origin + '/assets/js/qrcode.js' });
  await tab.addScriptTag({ url: origin + '/assets/js/calli-core.js' });
  const names = String(args.names || 'Yassine,Fatima Zahra,Abderrahmane').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
  const slug = args.offer || Object.keys(offers)[0];
  const info = await tab.evaluate(async ({ id, script, names, slug }) => {
    const C = window.BEN_CALLI_CORE;
    await C.load(script); await C.offers();
    const cards = [], notes = [];
    for (const n of names) {
      const r = C.transliterate(script, n);
      if (r.error) { notes.push(n + ': ' + r.error); continue; }
      cards.push(C.svgOf(await C.ready(id, r, 0), 'p'));
    }
    const back = await C.readyBack(id, { qr: slug ? C.qrOf(slug) : null });
    if (back) {
      cards.push(C.svgOf(back, 'p'));
      notes.push(back.qr ? 'QR code on the back: ' + back.qr.modules + ' modules of ' + back.qr.module.toFixed(2) + ' mm' : 'the back has no QR code (no offer in offers.json)');
    } else notes.push('no back');
    document.body.innerHTML = '<div id="sheet" style="display:flex;gap:22px;padding:22px;background:#26262c;width:max-content">' + cards.map((c, i) => '<div style="width:250px;' + (back && i === cards.length - 1 ? 'margin-left:26px' : '') + '">' + c.replace('<svg ', '<svg style="display:block;width:100%;height:auto" ') + '</div>').join('') + '</div>';
    await new Promise(r => setTimeout(r, 400));
    return notes;
  }, { id, script, names, slug });
  await tab.locator('#sheet').screenshot({ path: resolve(args.preview) });
  await shots.close();
  server.close();
  console.log('preview → ' + resolve(args.preview) + (info.length ? '\n  ' + [...new Set(info)].join('\n  ') : ''));
}
console.log('publish the site for the model to appear in the set-up of the app');
