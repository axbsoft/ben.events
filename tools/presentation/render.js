// Draw the agency presentation (build.py) with plain Chromium: one picture per slide, or a PDF.
// Step 3 of tools/presentation/build.sh. Needs Playwright.
// usage: node render.js DECK_HTML DECK_DIR OUT_DIR png|pdf [pdf name]
//   DECK_DIR holds img/ (the pictures cut by build.py); the fonts are in tools/presentation/fonts/
// env:   DECK_META=<file>   also write what each slide says and where its links are
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [file, dir, out, mode, pdfName] = process.argv.slice(2);
const SITE = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(file, 'utf8');
const TYPES = { '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ttf': 'font/ttf' };

// In a PDF, Chromium turns background-clip:text into a bitmap. Redraw those words as
// SVG text filled with the same gradient, at the same place, so they stay sharp at any zoom.
function vectorGradientText() {
  const split = s => { const o = []; let d = 0, c = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { o.push(c.trim()); c = ''; } else c += ch; } o.push(c.trim()); return o; };
  const NS = 'http://www.w3.org/2000/svg';
  let count = 0;
  for (const section of document.querySelectorAll('body > section')) {
    const sr = section.getBoundingClientRect();
    let svg = null;
    for (const el of section.querySelectorAll('.g')) {
      const cs = getComputedStyle(el);
      const m = cs.backgroundImage.match(/^linear-gradient\((.*)\)$/);
      if (!m) continue;
      const parts = split(m[1]);
      let angle = 180;
      if (/deg$/.test(parts[0])) angle = parseFloat(parts.shift());
      const stops = parts.map(p => { const k = p.lastIndexOf(' '); return [p.slice(0, k), p.slice(k + 1)]; });
      const b = el.getBoundingClientRect();
      const t = angle * Math.PI / 180, dx = Math.sin(t), dy = -Math.cos(t);
      const L = Math.abs(b.width * dx) + Math.abs(b.height * dy);
      const cx = b.left - sr.left + b.width / 2, cy = b.top - sr.top + b.height / 2;
      if (!svg) {
        svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('width', '1920'); svg.setAttribute('height', '1080');
        svg.setAttribute('viewBox', '0 0 1920 1080');
        svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
        svg.appendChild(document.createElementNS(NS, 'defs'));
        section.appendChild(svg);
      }
      const gid = 'g' + (++count);
      const g = document.createElementNS(NS, 'linearGradient');
      g.setAttribute('id', gid); g.setAttribute('gradientUnits', 'userSpaceOnUse');
      g.setAttribute('x1', cx - dx * L / 2); g.setAttribute('y1', cy - dy * L / 2);
      g.setAttribute('x2', cx + dx * L / 2); g.setAttribute('y2', cy + dy * L / 2);
      for (const [col, off] of stops) { const s = document.createElementNS(NS, 'stop'); s.setAttribute('offset', off); s.setAttribute('stop-color', col); g.appendChild(s); }
      svg.firstChild.appendChild(g);
      const cv = document.createElement('canvas').getContext('2d');
      cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const ascent = cv.measureText('Hg').fontBoundingBoxAscent, descent = cv.measureText('Hg').fontBoundingBoxDescent;
      // one <text> per line of each text node
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        let line = null;
        const flush = () => {
          if (!line || !line.text.trim()) return;
          const tx = document.createElementNS(NS, 'text');
          // the glyph box of a line is centred in its line box: the baseline sits half the leading under its top
          tx.setAttribute('x', line.left - sr.left); tx.setAttribute('y', line.top - sr.top + (line.height - (ascent + descent)) / 2 + ascent);
          tx.setAttribute('fill', `url(#${gid})`);
          tx.setAttribute('xml:space', 'preserve');
          tx.style.cssText = `font-family:${cs.fontFamily};font-size:${cs.fontSize};font-style:${cs.fontStyle};font-weight:${cs.fontWeight};letter-spacing:${cs.letterSpacing};font-kerning:${cs.fontKerning};white-space:pre`;
          tx.textContent = line.text.replace(/\s+$/, '');
          svg.appendChild(tx);
        };
        for (let i = 0; i < node.length; i++) {
          range.setStart(node, i); range.setEnd(node, i + 1);
          const r = range.getClientRects()[0];
          if (!r) continue;
          if (!line || Math.abs(r.top - line.top) > 2) { flush(); line = { text: '', left: r.left, top: r.top, height: r.height }; }
          line.text += node.data[i];
        }
        flush();
      }
      el.style.visibility = 'hidden';       // keep the box, do not paint the original
    }
  }
  return count;
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: mode === 'png' ? 4 / 3 : 1 });
  const page = await ctx.newPage();
  const problems = [];
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'deck.local') { problems.push('blocked ' + url.href); return route.abort('aborted'); }
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    let m = url.pathname.match(/^\/_(img|font)\/([A-Za-z0-9_.-]+)$/), f = null;
    if (m) f = m[1] === 'img' ? path.join(dir, 'img', m[2]) : path.join(__dirname, 'fonts', m[2]);
    else if ((m = url.pathname.match(/^\/_site\/(assets\/img\/[A-Za-z0-9_.\/-]+)$/)) && !m[1].includes('..')) f = path.join(SITE, m[1]);
    if (f && fs.existsSync(f)) return route.fulfill({ path: f, contentType: TYPES[path.extname(f)] || 'application/octet-stream' });
    problems.push('missing ' + url.pathname);
    return route.abort('aborted');
  });
  page.on('pageerror', e => problems.push('pageerror ' + e.message));
  await page.emulateMedia({ media: 'screen' });
  await page.goto('http://deck.local/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => null))); await document.fonts.ready; });
  const info = await page.evaluate(() => ({
    fonts: [...document.fonts].map(f => f.family + ' ' + f.style + ' ' + f.weight + ' ' + f.status),
    notes: [...document.querySelectorAll('body > section')].map(s => {
      const r = s.getBoundingClientRect(), bad = [];
      const boxes = [...s.querySelectorAll('h1,h2,h3,p,li')].filter(el => el.getBoundingClientRect().width > 0 && !el.closest('.cap'));
      for (const el of boxes) {
        const b = el.getBoundingClientRect();
        if (b.right > r.right - 60 || b.bottom > r.bottom - 40 || b.left < r.left + 60 || b.top < r.top + 40) bad.push('edge: ' + el.textContent.slice(0, 28));
        if (el.scrollWidth > el.clientWidth + 1) bad.push('overflow: ' + el.textContent.slice(0, 28));
      }
      // a block that runs past the bottom of the box it sits in
      for (const box of s.querySelectorAll('.step, .craft, .film, .reach, .col, .cover__in, .contact__in, .say__in, .ph')) {
        const b = box.getBoundingClientRect();
        for (const el of box.querySelectorAll('h1,h2,h3,p,li')) { const c = el.getBoundingClientRect(); if (c.bottom > b.bottom + 1 || c.right > b.right + 1) bad.push('spills ' + box.className.split(' ')[0] + ': ' + el.textContent.slice(0, 24)); }
      }
      return s.id + (bad.length ? ' !! ' + bad.join(' | ') : '');
    }),
  }));
  const notLoaded = info.fonts.filter(f => !/loaded/.test(f));
  console.log('fonts:', info.fonts.length, 'faces,', notLoaded.length ? 'NOT LOADED: ' + notLoaded.join('; ') : 'all loaded');
  const flagged = info.notes.filter(o => o.includes('!!'));
  console.log(flagged.length ? 'check:\n   ' + flagged.join('\n   ') : 'layout: nothing flagged');
  if (process.env.DECK_META) {
    const meta = await page.evaluate(() => [...document.querySelectorAll('body > section')].map(s => {
      const st = s.querySelector('.stage').getBoundingClientRect();
      const rel = el => { const b = el.getBoundingClientRect(); return [(b.left - st.left) / st.width, (b.top - st.top) / st.height, b.width / st.width, b.height / st.height].map(v => +(v * 100).toFixed(2)); };
      const links = [...s.querySelectorAll('[data-href]')].map(el => ({ href: el.getAttribute('data-href'), label: el.getAttribute('data-label') || el.textContent.replace(/\s+/g, ' ').trim(), box: rel(el) }));
      const text = [...s.querySelectorAll('h1,h2,h3,p,li,.tags span')].filter(n => !n.matches('.pager, .tags') && !n.closest('.brand')).map(n => n.innerText.replace(/\s+/g, ' ').trim()).concat([...s.querySelectorAll('.logo img')].map(i => i.alt)).filter(Boolean).join(' · ');
      return { id: s.id, text, links };
    }));
    fs.writeFileSync(process.env.DECK_META, JSON.stringify(meta, null, 1));
    console.log('meta', process.env.DECK_META);
  }
  if (mode === 'pdf') {
    // links that work in the PDF: a clickable area over each of them
    const n = await page.evaluate(() => {
      let k = 0;
      for (const s of document.querySelectorAll('body > section')) {
        const sr = s.getBoundingClientRect();
        for (const el of s.querySelectorAll('[data-href]')) {
          const b = el.getBoundingClientRect(), a = document.createElement('a');
          a.href = el.getAttribute('data-href');
          a.style.cssText = `position:absolute;left:${b.left - sr.left}px;top:${b.top - sr.top}px;width:${b.width}px;height:${b.height}px;z-index:5`;
          s.appendChild(a); k++;
        }
      }
      return k;
    });
    console.log('links:', n, '· gradient words redrawn as text:', await page.evaluate(vectorGradientText));
    const f = path.join(out, pdfName || 'deck.pdf');
    await page.pdf({ path: f, width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
    console.log('pdf', f, (fs.statSync(f).size / 1048576).toFixed(2) + ' MB');
  } else {
    const ids = await page.evaluate(() => [...document.querySelectorAll('body > section')].map(s => s.id));
    for (const id of ids) {
      const el = await page.$('#' + id);
      await el.scrollIntoViewIfNeeded();
      await el.screenshot({ path: path.join(out, id + '.png'), animations: 'disabled' });
    }
    console.log('png', ids.length, 'slides ->', out);
  }
  if (problems.length) console.log('problems:\n   ' + [...new Set(problems)].join('\n   '));
  await browser.close();
})().catch(e => { console.error('CRASHED', e); process.exit(2); });
