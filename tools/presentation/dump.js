// Everything the agency presentation is built from, read from the site itself:
// its words in both languages, its projects, its services and its clients.
// Step 1 of tools/presentation/build.sh. Needs Playwright.
// usage: node dump.js OUT_JSON
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const [out] = process.argv.slice(2);
const BOOK = 'https://www.ben.events/book';          // the short link to book a call, printed as a QR code on the last slide
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// the site, served from this folder for the time of the reading
const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
  if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end('not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const data = { text: {} };
  try {
    for (const lang of ['fr', 'en']) {
      const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
      await page.route(u => !u.href.startsWith(base), r => r.abort());       // the site's own files only
      await page.goto(base + '/index.html?lang=' + lang, { waitUntil: 'load' });
      await page.waitForTimeout(1500);
      data.text[lang] = await page.evaluate(() => { const o = {}; document.querySelectorAll('[data-i18n]').forEach(n => { o[n.getAttribute('data-i18n')] = n.textContent.replace(/\s+/g, ' ').trim(); }); return o; });
      if (lang === 'fr') {
        data.projects = await page.evaluate(() => window.BEN_PROJECTS);
        data.services = await page.evaluate(() => window.BEN_SERVICES);
        data.clients = await page.evaluate(() => [...document.querySelectorAll('.clients__group:not([aria-hidden]) img')].map(i => ({ src: i.getAttribute('src'), name: i.alt })));
      }
    }
    // the QR code of the last slide: the short link to the calendar for booking a call (vercel.json sends /book on to it)
    const qrcode = require(path.join(ROOT, 'assets', 'js', 'qrcode.js'));
    const qr = qrcode(0, 'M');
    qr.addData(BOOK);
    qr.make();
    const size = qr.getModuleCount(), rows = [];
    for (let r = 0; r < size; r++) { let row = ''; for (let c = 0; c < size; c++) row += qr.isDark(r, c) ? '1' : '0'; rows.push(row); }
    data.book = { url: BOOK, qr: rows };
    fs.writeFileSync(out, JSON.stringify(data, null, 1));
    console.log('read from the site:', Object.keys(data.text.fr).length, 'texts,', data.projects.length, 'projects,', data.services.length, 'services,', data.clients.length, 'clients');
  } finally {
    await browser.close();
    server.close();
  }
});
