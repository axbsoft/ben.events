#!/usr/bin/env node
/* benevents agency — calligraphy app: draw the plain bookmarks (60 × 180 mm), one per language,
   used until a client supplies its own artwork. Each is a sheet of pale paper with a gold frame,
   a red seal, the rule the visitor's name sits on, and a landscape in ink wash:
     China   hanzi-bookmark   a pale moon over tall, narrow peaks, the seal 福 (good fortune)
     Japan   kana-bookmark    the red sun over a snow-capped volcano, the seal 福
     Korea   hangul-bookmark  the red and blue circle (taegeuk) over rolling hills, the seal 복
   (The red disc belongs to Japan only: never on the Korean or the Chinese model.)

   usage:  node tools/calligraphy/make_template.js <Korean brush font> <Japanese brush font> [out folder]
           (.ttf or .woff2: the fonts only draw the seals)

   One bookmark in a client's colours, with its logo where the emblem is (add_model.mjs runs this):
           node tools/calligraphy/make_template.js <Korean font> <Japanese font> --kind ko --out file.jpg \
                --logo logo.svg|png|jpg [--logo-plate "#0c0c0f"] [--accent "#b9892f"] [--paper "#f7f0e3"] \
                [--no-seal] [--no-landscape]
           --kind: the language the bookmark is for (zh, ja, ko): its landscape and its seal
           --logo-plate: a colour behind the logo, for a logo that is white or does not read on paper
           --accent: the colour of the frame and of the rule · --paper: the colour of the paper
           With --no-seal the two fonts are not read at all.
   needs:  playwright (it draws the pictures with a browser)
   The places of the name and of the rule are in assets/js/calli-core.js (PLAIN_MODEL, copied into models.json). */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pos = [], opts = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (!a.startsWith('--')) { pos.push(a); continue; }
  const next = process.argv[i + 1];
  opts[a.slice(2)] = next !== undefined && !next.startsWith('--') ? process.argv[++i] : true;
}
const [korean, japanese] = pos;
const single = !!opts.kind;
const outDir = single ? path.dirname(path.resolve(opts.out || '.')) : pos[2] || path.join(__dirname, '..', '..', 'assets', 'calligraphy', 'templates');
if ((!korean || !japanese) && !opts['no-seal']) { console.error('usage: node make_template.js <Korean font> <Japanese font> [out folder]   (or --no-seal: no fonts needed)'); process.exit(1); }
if (single && (!['zh', 'ja', 'ko'].includes(opts.kind) || !opts.out)) { console.error('--kind zh|ja|ko needs --out file.jpg'); process.exit(1); }
const HEX = /^#[0-9a-fA-F]{6}$/;
for (const k of ['accent', 'paper', 'logo-plate']) if (opts[k] !== undefined && !HEX.test(opts[k])) { console.error('--' + k + ' must be a colour like "#b9892f"'); process.exit(1); }
const W = 60, H = 180, PX = 2000 / H;                      // the same number of dots as the client's model: 667 × 2000

// the same landscapes every time: numbers drawn from a fixed seed
let seed = 1;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const f2 = v => v.toFixed(2);
// a line of hills from left to right: y at its lowest, how high it climbs, how rough it is, where its tops are
function ridge(base, climb, rough, tops) {
  let pts = [[-2, base - climb * (.2 + rnd() * .3)], [W + 2, base - climb * (.2 + rnd() * .3)]];
  for (const p of tops) pts.push([p[0], base - climb * p[1]]);
  pts.sort((a, b) => a[0] - b[0]);
  for (let pass = 0, amp = rough; pass < 5; pass++, amp *= .55) {
    const next = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      next.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + (rnd() - .5) * amp], b);
    }
    pts = next;
  }
  return 'M' + pts.map(p => f2(p[0]) + ' ' + f2(p[1])).join('L') + `L${W + 2} ${H + 2}L-2 ${H + 2}Z`;
}
// tall, narrow peaks standing side by side: [centre, width, height] each
function peaks(base, list) {
  return list.map(([x, w, h]) => {
    const lean = (rnd() - .5) * w * .3, top = base - h;
    return `M${f2(x - w / 2)} ${H + 2}L${f2(x - w / 2)} ${f2(base)}C${f2(x - w * .46)} ${f2(base - h * .62)} ${f2(x - w * .3 + lean)} ${f2(top + h * .04)} ${f2(x + lean)} ${f2(top)}` +
      `C${f2(x + w * .3 + lean)} ${f2(top + h * .05)} ${f2(x + w * .47)} ${f2(base - h * .58)} ${f2(x + w / 2)} ${f2(base)}L${f2(x + w / 2)} ${H + 2}Z`;
  }).join('');
}

// three tones of paper round one colour: a little lighter on top, a little darker at the foot
const rgbOf = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const hexOf = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixWith = (hex, to, k) => hexOf(rgbOf(hex).map(v => v + (to - v) * k));
const paperStops = hex => hex === '#f7f0e3'          // the paper of the plain bookmarks, as it was first drawn
  ? '<stop offset="0" stop-color="#f8f2e6"/><stop offset=".55" stop-color="#f7f0e3"/><stop offset="1" stop-color="#f3ead9"/>'
  : `<stop offset="0" stop-color="${mixWith(hex, 255, .22)}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${mixWith(hex, 0, .035)}"/>`;
const wash = (id, y0, y1, a, b, c) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">` +
  `<stop offset="0" stop-color="${a[0]}" stop-opacity="${a[1]}"/><stop offset=".6" stop-color="${b[0]}" stop-opacity="${b[1]}"/><stop offset="1" stop-color="${c[0]}" stop-opacity="${c[1]}"/></linearGradient>`;
const mist = (y, h) => `<rect x="-2" y="${y}" width="${W + 4}" height="${h}" fill="url(#mist)"/>`;

function landscape(kind) {
  if (kind === 'ko') {              // rolling hills
    seed = 20261121;
    const far = ridge(153, 21, 4.4, [[15, 1], [38, .5], [53, .72]]), mid = ridge(163, 17, 4.6, [[46, 1], [9, .5], [27, .3]]), near = ridge(174, 12, 3.4, [[19, .9], [57, .55]]);
    return `<defs>${wash('inkFar', 130, 162, ['#5f6f84', .46], ['#8793a3', .16], ['#f4ecdc', 0])}${wash('inkMid', 144, 172, ['#3e4756', .66], ['#6b7584', .22], ['#f4ecdc', 0])}${wash('inkNear', 160, 182, ['#22262e', .84], ['#3b414c', .5], ['#565c66', .3])}</defs>
      <path d="${far}" fill="url(#inkFar)" filter="url(#softer)"/>${mist(148, 14)}
      <path d="${mid}" fill="url(#inkMid)" filter="url(#soft)"/>${mist(160, 12)}
      <path d="${near}" fill="url(#inkNear)" filter="url(#rough)"/>`;
  }
  if (kind === 'ja') {              // a volcano with snow on its top, low hills before it
    seed = 77;
    const near = ridge(175, 9, 2.6, [[12, .9], [50, .6]]), low = ridge(168, 8, 2.4, [[44, 1], [6, .4]]);
    const cone = 'M-2 172C12 166 21.5 150 26.6 134.2L28.3 133.2L29.8 134L31.4 133L33.3 134.3C38.6 150 48 166 62 172L62 182L-2 182Z';
    const snow = 'M26.6 134.2L28.3 133.2L29.8 134L31.4 133L33.3 134.3L37.9 146.4L35.6 143.6L34 147.6L32 143.4L30.2 148.4L28.2 143.8L26.4 147.2L24.8 143.6L22.2 146.2Z';
    return `<defs>${wash('inkFar', 132, 176, ['#4c5a70', .62], ['#7f8b9c', .3], ['#f4ecdc', 0])}${wash('inkMid', 160, 178, ['#3e4756', .6], ['#6b7584', .22], ['#f4ecdc', 0])}${wash('inkNear', 166, 182, ['#22262e', .84], ['#3b414c', .5], ['#565c66', .3])}</defs>
      <path d="${cone}" fill="url(#inkFar)" filter="url(#soft)"/>
      <path d="${snow}" fill="#f8f3e9" filter="url(#rough)"/>${mist(154, 14)}
      <path d="${low}" fill="url(#inkMid)" filter="url(#soft)"/>${mist(164, 10)}
      <path d="${near}" fill="url(#inkNear)" filter="url(#rough)"/>`;
  }
  seed = 4242;                      // zh: tall, narrow peaks
  const far = peaks(160, [[9, 13, 30], [24, 10, 20], [41, 12, 34], [54, 11, 22]]), mid = peaks(168, [[3, 12, 20], [18, 11, 31], [33, 9, 16], [49, 13, 27]]);
  const near = ridge(176, 8, 2.4, [[30, .9], [8, .5]]);
  return `<defs>${wash('inkFar', 124, 164, ['#5f6f84', .42], ['#8793a3', .2], ['#f4ecdc', 0])}${wash('inkMid', 136, 174, ['#3e4756', .64], ['#6b7584', .28], ['#f4ecdc', 0])}${wash('inkNear', 166, 182, ['#22262e', .84], ['#3b414c', .5], ['#565c66', .3])}</defs>
      <path d="${far}" fill="url(#inkFar)" filter="url(#softer)"/>${mist(150, 14)}
      <path d="${mid}" fill="url(#inkMid)" filter="url(#soft)"/>${mist(162, 12)}
      <path d="${near}" fill="url(#inkNear)" filter="url(#rough)"/>`;
}

function emblem(kind, m) {
  if (m && m.logo) return `<!-- the brand's logo, where the emblem is -->
    ${m.logoPlate ? `<rect x="9.2" y="9" width="41.6" height="25" rx="2.6" fill="${m.logoPlate}"/>` : ''}
    <image href="${m.logo}" x="11.5" y="11" width="37" height="21" preserveAspectRatio="xMidYMid meet"/>`;
  if (kind === 'ko') return `<!-- the circle of Korea: red above, blue below, turned as on the flag -->
    <g transform="translate(30 21.5) rotate(33.69)" filter="url(#rough)">
      <path d="M-8 0A8 8 0 0 1 8 0Z" fill="#c8322f"/><path d="M-8 0A8 8 0 0 0 8 0Z" fill="#1f4a8f"/>
      <circle cx="-4" cy="0" r="4" fill="#c8322f"/><circle cx="4" cy="0" r="4" fill="#1f4a8f"/>
    </g>`;
  if (kind === 'ja') return `<!-- the sun -->
    <circle cx="30" cy="21.5" r="8.4" fill="url(#sun)" filter="url(#rough)"/>`;
  return `<!-- the moon, pale gold, and a wisp of cloud across it -->
    <circle cx="30" cy="21.5" r="8.4" fill="#e9c98a" opacity=".85" filter="url(#rough)"/>
    <circle cx="30" cy="21.5" r="8.4" fill="none" stroke="#b9892f" stroke-opacity=".5" stroke-width=".2"/>
    <g filter="url(#softer)" fill="#f7f1e5"><ellipse cx="23" cy="26.6" rx="12" ry="1.3" opacity=".9"/><ellipse cx="39" cy="24.4" rx="8" ry=".9" opacity=".75"/></g>`;
}

const data = file => 'data:font/' + (file.endsWith('.woff2') ? 'woff2' : 'ttf') + ';base64,' + fs.readFileSync(file).toString('base64');
const IMAGE = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', webp: 'image/webp' };
const logoData = file => {
  const type = IMAGE[path.extname(file).slice(1).toLowerCase()];
  if (!type) { console.error('--logo: a .svg, .png, .jpg or .webp picture'); process.exit(1); }
  return `data:${type};base64,` + fs.readFileSync(file).toString('base64');
};
const SEAL = { zh: ['福', 'ja'], ja: ['福', 'ja'], ko: ['복', 'ko'] };
const MODELS = single ? [{
  kind: opts.kind, file: path.basename(opts.out), seal: opts['no-seal'] ? '' : SEAL[opts.kind][0], font: SEAL[opts.kind][1],
  logo: opts.logo ? logoData(opts.logo) : '', logoPlate: opts['logo-plate'] || '', accent: opts.accent || '#b9892f', paper: opts.paper || '#f7f0e3', landscape: !opts['no-landscape']
}] : [
  { kind: 'zh', file: 'hanzi-bookmark_60x180mm.jpg', seal: '福', font: 'ja' },
  { kind: 'ja', file: 'kana-bookmark_60x180mm.jpg', seal: '福', font: 'ja' },
  { kind: 'ko', file: 'hangul-bookmark_60x180mm.jpg', seal: '복', font: 'ko' }
].map(m => Object.assign({ logo: '', logoPlate: '', accent: '#b9892f', paper: '#f7f0e3', landscape: true }, m));
const page = m => `<!doctype html><meta charset="utf-8"><style>
${m.seal ? `@font-face { font-family: ko; src: url(${data(korean)}); }
@font-face { font-family: ja; src: url(${data(japanese)}); }` : ''}
html, body { margin: 0; background: #f7f1e5; }
svg { display: block; width: ${W * PX}px; height: ${H * PX}px; }
</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .42  0 0 0 0 .33  0 0 0 0 .2  0 0 0 -1.5 .98"/></filter>
    <filter id="cloud" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .02" numOctaves="3" seed="3" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .62  0 0 0 0 .5  0 0 0 0 .3  0 0 0 -.9 .52"/></filter>
    <filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .05" numOctaves="2" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .26  0 0 0 -2.2 1.12"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation=".45"/></filter>
    <filter id="softer"><feGaussianBlur stdDeviation=".9"/></filter>
    <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale=".55"/></filter>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">${paperStops(m.paper)}</linearGradient>
    <radialGradient id="sun" cx=".42" cy=".4" r=".7"><stop offset="0" stop-color="#d9463c"/><stop offset=".7" stop-color="#c8322f"/><stop offset="1" stop-color="#b52a2a"/></radialGradient>
    <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe1" stop-opacity="0"/><stop offset=".5" stop-color="#f6efe1" stop-opacity=".75"/><stop offset="1" stop-color="#f6efe1" stop-opacity="0"/></linearGradient>
    <clipPath id="sheet"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <g clip-path="url(#sheet)">
    <rect width="${W}" height="${H}" fill="url(#paper)"/>
    <rect width="${W}" height="${H}" filter="url(#cloud)" opacity=".42"/>
    <rect width="${W}" height="${H}" filter="url(#fibre)" opacity=".2"/>
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".3"/>
    ${emblem(m.kind, m)}
    <!-- the landscape in ink wash, the farthest first, mist between -->
    ${m.landscape ? landscape(m.kind) : ''}
    <!-- the rule the visitor's name sits on: two dashes, the name between them -->
    <g stroke="${m.accent}" stroke-width=".42" stroke-linecap="round"><path d="M10.4 112.4H20.6"/><path d="M39.4 112.4H49.6"/></g>
    <!-- the seal -->
    ${m.seal ? `<g transform="translate(45.2 93.6) rotate(-3)" filter="url(#rough)">
      <rect x="-3.5" y="-3.7" width="7" height="7.4" rx="1.1" fill="#c8322f"/>
      <text x="0" y="${m.font === 'ko' ? 2.35 : 2.2}" text-anchor="middle" font-family="${m.font}" font-size="${m.font === 'ko' ? 6.6 : 5.6}" fill="#f8f0e2">${m.seal}</text>
    </g>` : ''}
    <!-- the frame: a fine double line, knotted at the corners -->
    <g fill="none" stroke="${m.accent}">
      <rect x="2.3" y="2.3" width="${W - 4.6}" height="${H - 4.6}" stroke-width=".42"/>
      <rect x="3.5" y="3.5" width="${W - 7}" height="${H - 7}" stroke-width=".14" stroke-opacity=".8"/>
      ${[[2.3, 2.3, 1, 1], [W - 2.3, 2.3, -1, 1], [2.3, H - 2.3, 1, -1], [W - 2.3, H - 2.3, -1, -1]].map(c =>
        `<path stroke-width=".3" d="M${c[0] + c[2] * 2.6} ${c[1]}v${c[3] * 5.2}h${c[2] * 2.6}v${-c[3] * 2.6}h${-c[2] * 5.2}"/>`).join('')}
    </g>
  </g>
</svg>`;

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(outDir, { recursive: true });
  for (const m of MODELS) {
    const tab = await browser.newPage({ viewport: { width: Math.round(W * PX), height: Math.round(H * PX) }, deviceScaleFactor: 1 });
    await tab.setContent(page(m));
    await tab.evaluate(() => document.fonts.ready);
    await tab.evaluate(() => Promise.all([...document.images].map(i => i.decode && i.decode().catch(() => {}))));
    await tab.waitForFunction(() => [...document.querySelectorAll('image')].every(i => i.getAttribute('href')), null, { timeout: 5000 }).catch(() => {});
    await tab.waitForTimeout(300);
    const out = path.join(outDir, m.file);
    await tab.screenshot({ path: out, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: Math.round(W * PX), height: Math.round(H * PX) } });
    await tab.close();
    console.log(out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
