/* benevents agency — "Your first name in Chinese calligraphy": a working demonstration
   of the showroom activity. Vanilla JS, no dependencies.

   A visitor types a first name. The name is looked up in a list of established Chinese
   forms; a name that is not listed is written syllable by syllable (always the sound of
   the name, never a meaning) and shown as a proposal to check. The characters are drawn
   from outlines of a brush typeface, the same outlines on screen and in the PDF, so the
   print cannot differ from what was approved and does not depend on installed fonts.

   Data: assets/calligraphy/data.json (built by tools/calligraphy/build.py)
   Templates: the three SVG files in assets/calligraphy/templates/, used as supplied. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SETTINGS
     ------------------------------------------------------------------ */
  var BASE = 'assets/calligraphy/';
  var BRAND = 'EXEED';              // plain capitals shown in the logo area until LOGO is set
  var LOGO = '';                    // e.g. 'assets/calligraphy/logo.svg' : the official logo file
  var EXAMPLE = 'Yassine';          // shown before the visitor types anything
  var MAX_LENGTH = 24;
  // box: the room for the characters, in mm (width, height), around the centre given in the file
  var TEMPLATES = [
    { id: 'bookmark', file: 'templates/bookmark_60x180mm.svg', flow: 'v', box: [34, 62], name: 8, nameMax: 42, logo: [14.5, 2.5] },   // narrow: the branch reaches x = 22
    { id: 'card', file: 'templates/calligraphy_card_A6_105x148mm.svg', flow: 'h', box: [78, 42], name: 9.5, nameMax: 76, logo: [34, 4.2] },
    { id: 'charm', file: 'templates/lucky_charm_70x120mm.svg', flow: 'v', box: [44, 38], name: 7.5, nameMax: 48, logo: [25, 3.2] }
  ];
  var INK = [24, 21, 19], SEAL = [167, 53, 50], GOLD = [122, 92, 46];
  var BLEED = 3, MARKS = 6;         // mm, print-shop version
  /* ------------------------------------------------------------------ */

  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var root = $('.calli');
  if (!root) return;

  var TEXT = {
    fr: {
      empty: 'Saisissez un prénom.',
      letters: 'Utilisez uniquement des lettres latines, des espaces et des traits d’union.',
      refused: 'Ce prénom ne peut pas être traité ici. Adressez-vous à l’équipe.',
      loading: 'Préparation de l’encre…',
      failed: 'La démonstration n’a pas pu être chargée. Vérifiez votre connexion.',
      usage: 'Forme d’usage',
      usageNote: 'Transcription phonétique couramment utilisée pour ce prénom.',
      proposal: 'Proposition phonétique',
      proposalNote: 'Transcription automatique, syllabe par syllabe. Sur l’événement, elle est validée par l’équipe avant impression.',
      alts: 'Autre graphie',
      spoken: '{han}, prononcé {pinyin}',
      specs: '{w} × {h} mm · PDF vectoriel, caractères tracés',
      specsBleed: '{w} × {h} mm + fond perdu {b} mm et traits de coupe',
      ready: 'Le PDF est prêt.',
      names: { bookmark: 'Marque-page', card: 'Carte A6', charm: 'Porte-bonheur' }
    },
    en: {
      empty: 'Enter a first name.',
      letters: 'Use Latin letters, spaces and hyphens only.',
      refused: 'This name cannot be handled here. Please ask the team.',
      loading: 'Preparing the ink…',
      failed: 'The demonstration could not be loaded. Check your connection.',
      usage: 'Established form',
      usageNote: 'The phonetic transcription commonly used for this name.',
      proposal: 'Phonetic proposal',
      proposalNote: 'Automatic transcription, syllable by syllable. At the event it is checked by the team before printing.',
      alts: 'Other spelling',
      spoken: '{han}, pronounced {pinyin}',
      specs: '{w} × {h} mm · vector PDF, outlined characters',
      specsBleed: '{w} × {h} mm + {b} mm bleed and crop marks',
      ready: 'The PDF is ready.',
      names: { bookmark: 'Bookmark', card: 'A6 card', charm: 'Lucky charm' }
    }
  };
  var lang = doc.documentElement.lang === 'en' ? 'en' : 'fr';
  function t(k, vars) {
    var s = TEXT[lang][k] || TEXT.fr[k] || '';
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace('{' + v + '}', vars[v]); });
    return s;
  }

  /* ==================================================================
     1. THE NAME: from Latin letters to Chinese characters
     ================================================================== */
  var D = null;                     // data.json

  function strip(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function keyOf(s) { return strip(s.toLowerCase()).replace(/[^a-z]/g, ''); }

  // what the visitor typed, tidied: letters, single spaces, hyphens, apostrophes
  function tidy(raw) {
    var s = (raw || '').normalize('NFC').replace(/[’ʼ`]/g, '\'').replace(/[\s ]+/g, ' ').replace(/\s*-\s*/g, '-').trim();
    return s.slice(0, MAX_LENGTH);
  }
  function valid(s) { return /^[A-Za-zÀ-ɏ]+(?:[ '\-][A-Za-zÀ-ɏ]+)*$/.test(s); }
  function shown(s) {               // Yassine, Fatima Zahra, Jean-Pierre
    if (s !== s.toLowerCase() && s !== s.toUpperCase()) return s;
    return s.toLowerCase().replace(/(^|[ '\-])([a-zà-ɏ])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }
  // words that must not be printed, whatever they sound like (whole name only)
  var REFUSED = /^(con|conne|connard|connasse|merde|pute|putain|salope|salaud|encule|batard|nique|bite|couille|zebi|zebbi|zamel|qahba|kahba|fuck|fucker|shit|bitch|cunt|dick|asshole|nazi|hitler)$/;

  // ---- letters to sounds. Consonants: b p d t g k v w f z ts s zh sh j ch h m n l r y.
  //      Vowels: a e er i o u ai au. Spelling habits are those of French, and of Arabic
  //      names as they are written in French (ch = sh, ou = u, kh = h, final e silent…).
  var VOWELS = { a: 1, e: 1, er: 1, i: 1, o: 1, u: 1, ai: 1, au: 1 };
  function sounds(word) {
    var s = word.toLowerCase().replace(/[éèêë]/g, 'E').replace(/ï/g, 'I').replace(/ç/g, 'S').replace(/ñ/g, 'ny').replace(/œ/g, 'eu').replace(/æ/g, 'e');
    s = strip(s).replace(/[^a-zEIS]/g, '');
    var out = [], i = 0, n = s.length;
    var isV = function (c) { return c !== '' && 'aeiouyEI'.indexOf(c) > -1; };
    var at = function (k) { return s.charAt(i + k); };
    var last = function () { return out[out.length - 1]; };
    var others = /[aiouyEI]/.test(s.slice(0, -1));          // a vowel besides a final e
    while (i < n) {
      var c = s.charAt(i), c2 = s.substr(i, 2), c3 = s.substr(i, 3);
      if (!isV(c)) {
        if (at(1) === c) { i++; continue; }                 // double consonant
        if (c3 === 'tch') { out.push('ch'); i += 3; continue; }
        if (c3 === 'sch') { out.push('sh'); i += 3; continue; }
        if (c3 === 'chr') { out.push('k'); i += 2; continue; }
        if (c2 === 'ch' || c2 === 'sh') { out.push('sh'); i += 2; continue; }
        if (c2 === 'kh') { out.push('h'); i += 2; continue; }
        if (c2 === 'gh') { out.push('g'); i += 2; continue; }
        if (c2 === 'dj') { out.push('j'); i += 2; continue; }
        if (c2 === 'dh') { out.push('d'); i += 2; continue; }
        if (c2 === 'th') { out.push('t'); i += 2; continue; }
        if (c2 === 'ph') { out.push('f'); i += 2; continue; }
        if (c2 === 'ck' || c2 === 'cq') { out.push('k'); i += 2; continue; }
        if (c2 === 'qu' && isV(at(2))) { out.push('k'); i += 2; continue; }
        if (c2 === 'gu' && 'eiyE'.indexOf(at(2)) > -1 && at(2) !== '') { out.push('g'); i += 2; continue; }
        if (c2 === 'gn' && isV(at(2))) { out.push('n', 'i', 'y'); i += 2; continue; }
        if (c === 'c') { out.push(at(1) !== '' && 'eiyEI'.indexOf(at(1)) > -1 ? 's' : 'k'); i++; continue; }
        if (c === 'g') { out.push(at(1) !== '' && 'eiyE'.indexOf(at(1)) > -1 ? 'zh' : 'g'); i++; continue; }
        if (c === 'x') { out.push('k', 's'); i++; continue; }
        if (c === 'q') { out.push('k'); i++; continue; }
        if (c === 'S') { out.push('s'); i++; continue; }
        if (c === 'h') { if (isV(at(1)) || i < n - 1) out.push('h'); i++; continue; }   // silent at the end
        if ((c === 'd' || c === 't') && i === n - 1 && /(?:r|[aeo]n)$/.test(s.slice(0, i))) { i++; continue; }   // Gérard, Laurent, Armand
        out.push(c); i++;
        continue;
      }
      // ---- vowels
      if (c === 'y') {
        if (isV(at(1))) {                                   // a glide: Yanis, Rayan, Dounya
          if (i > 0 && !VOWELS[last()]) out.push('i');
          out.push('y'); i++; continue;
        }
        out.push('i'); i++; continue;
      }
      if ((c3 === 'aou' && !isV(at(3)) && at(3) !== '') || (c2 === 'aw' && !isV(at(2)) && at(2) !== '')) { out.push('au'); i += c3 === 'aou' ? 3 : 2; continue; }
      if (c3 === 'eau') { out.push('o'); i += 3; continue; }
      if (c3 === 'oeu') { out.push('er'); i += 3; continue; }
      if (c2 === 'ou') { out.push(isV(at(2)) ? 'w' : 'u'); i += 2; continue; }
      if (c2 === 'oo') { out.push('u'); i += 2; continue; }
      if (c2 === 'ee') { out.push('i'); i += 2; continue; }
      if (c2 === 'aa') { out.push('a'); i += 2; continue; }
      if (c2 === 'oi' || (c2 === 'oy' && !isV(at(2)))) {
        if (out.length && !VOWELS[last()]) out.push('u');
        out.push('w', 'a'); i += 2; continue;
      }
      if (c2 === 'au') { out.push('o'); i += 2; continue; }
      if (c2 === 'ai' || (c2 === 'ay' && !isV(at(2)))) { out.push('ai'); i += 2; continue; }
      if (c2 === 'ei' || (c2 === 'ey' && !isV(at(2)))) { out.push('e'); i += 2; continue; }
      if (c2 === 'eu') { out.push('er'); i += 2; continue; }
      if (c === 'e' && i === n - 1 && others) {             // a final e is silent, except after o (Zoe)
        if (s.charAt(i - 1) === 'o') out.push('e');
        i++; continue;
      }
      out.push(c === 'E' ? 'e' : c === 'I' ? 'i' : c); i++;
    }
    return out;
  }

  // ---- sounds to characters, one syllable at a time
  var NASAL = { a: 'an', e: 'en', er: 'en', i: 'in', o: 'ong', u: 'un' };
  function write(tok) {
    var T = D.table, out = '', i = 0, n = tok.length, before = '';
    while (i < n) {
      var c = '_', v = null;
      if (!VOWELS[tok[i]]) { c = tok[i]; i++; }
      if (i < n && VOWELS[tok[i]]) {
        v = tok[i]; i++;
        var nx = tok[i], af = tok[i + 1];
        // a nasal vowel: n (or m before b, p), then a consonant or the end of the name
        if (NASAL[v] && ((nx === 'n' && (af === undefined || !VOWELS[af])) || (nx === 'm' && (af === 'b' || af === 'p')))) { v = NASAL[v]; i++; }
      }
      if (v === null) {
        if (!T._[c]) return '';
        out += (c === 'l' && i >= n) ? D.finalL : T._[c];
        before = '';
      } else {
        if (c === '_' && (v === 'a' || v === 'an') && (before === 'i' || before === 'e')) c = 'y';   // Nadia, Sofiane
        if (!T[v] || !T[v][c]) return '';
        out += T[v][c];
        before = v;
      }
    }
    return out;
  }

  function pinyinOf(han) {
    var s = '';
    for (var i = 0; i < han.length; i++) {
      var p = D.pinyin[han.charAt(i)] || '';
      if (s && /^[aāáǎàoōóǒòeēéěè]/.test(p)) s += '’';
      s += p;
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // "servant of …": Abd, then the article (el, or its last letter taken by the next sound), then the name
  function abd(k) {
    var m = /^abd(?:e|ou|u|a|o)?(l|r|s|n|d|t|z)?(.*)$/.exec(k);
    if (!m) return '';
    var rest = m[2];
    if (m[1] === 'l') { if (rest.length < 2) return ''; return D.names.abdelkader[0].slice(0, 4) + write(sounds(rest)); }
    if (m[1]) rest = rest.charAt(0) === m[1] ? rest : m[1] + rest;
    if (rest && rest.length < 3) return '';
    return D.names.abdelkader[0].slice(0, 3) + (rest ? write(sounds(rest)) : '');
  }

  // one word of the name
  function word(w) {
    var hit = D.names[keyOf(w)];
    if (hit) return { forms: hit.slice(), known: true };
    var han = (/^abd/.test(keyOf(w)) && abd(keyOf(w))) || write(sounds(w));
    if (!han) return null;
    var fem = han.split('').map(function (c) { return D.feminine[c] || c; }).join('');
    return { forms: fem !== han ? [han, fem] : [han], known: false };
  }

  // the whole name: { name, parts: [han, …], forms: [[han, …], …], known }
  function transliterate(raw) {
    var name = tidy(raw);
    if (!name) return { error: 'empty' };
    if (!valid(name)) return { error: 'letters' };
    if (REFUSED.test(keyOf(name))) return { error: 'refused' };
    if (keyOf(name).length < 2) return { error: 'empty' };
    // the Arabic article between two names is not written (Nour El Houda)
    var whole = D.names[keyOf(name)], words = name.split(/[ \-]/).filter(function (w, i, all) { return !(all.length > 2 && i > 0 && i < all.length - 1 && /^(el|al)$/i.test(w)); }), res;
    if (whole) res = { known: true, forms: whole.map(function (f) { return [f]; }) };
    else {
      var each = words.map(word);
      if (each.some(function (e) { return !e; })) return { error: 'refused' };
      res = { known: each.every(function (e) { return e.known; }), forms: [each.map(function (e) { return e.forms[0]; })] };
      if (each.length === 1) res.forms = each[0].forms.map(function (f) { return [f]; });
    }
    res.name = shown(name);
    res.forms = res.forms.filter(function (f) { return f.join('').length <= 12; });
    if (!res.forms.length) return { error: 'refused' };
    return res;
  }

  /* ==================================================================
     2. DRAWING: paths, the templates, the page
     ================================================================== */
  var IDENT = [1, 0, 0, 1, 0, 0];
  function mul(m, k) { return [m[0] * k[0] + m[2] * k[1], m[1] * k[0] + m[3] * k[1], m[0] * k[2] + m[2] * k[3], m[1] * k[2] + m[3] * k[3], m[0] * k[4] + m[2] * k[5] + m[4], m[1] * k[4] + m[3] * k[5] + m[5]]; }
  function pt(m, x, y) { return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  function transformOf(str) {
    var m = IDENT, re = /(matrix|translate|scale|rotate)\s*\(([^)]*)\)/g, r;
    while ((r = re.exec(str || ''))) {
      var a = r[2].trim().split(/[\s,]+/).map(Number), k = IDENT;
      if (r[1] === 'matrix') k = a;
      else if (r[1] === 'translate') k = [1, 0, 0, 1, a[0], a[1] || 0];
      else if (r[1] === 'scale') k = [a[0], 0, 0, a.length > 1 ? a[1] : a[0], 0, 0];
      else {
        var q = a[0] * Math.PI / 180, cs = Math.cos(q), sn = Math.sin(q);
        k = [cs, sn, -sn, cs, 0, 0];
        if (a.length > 2) k = mul(mul([1, 0, 0, 1, a[1], a[2]], k), [1, 0, 0, 1, -a[1], -a[2]]);
      }
      m = mul(m, k);
    }
    return m;
  }

  // an arc of an ellipse as cubic curves (SVG "A")
  function arc(x1, y1, rx, ry, phi, large, sweep, x2, y2) {
    if (!rx || !ry) return [['L', x2, y2]];
    var sp = Math.sin(phi), cp = Math.cos(phi), dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    var xp = cp * dx + sp * dy, yp = -sp * dx + cp * dy;
    rx = Math.abs(rx); ry = Math.abs(ry);
    var l = xp * xp / (rx * rx) + yp * yp / (ry * ry);
    if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
    var num = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp, den = rx * rx * yp * yp + ry * ry * xp * xp;
    var co = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den));
    var cxp = co * rx * yp / ry, cyp = -co * ry * xp / rx;
    var cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
    var ang = function (ux, uy, vx, vy) { var a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
    var t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry), dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
    if (!sweep && dt > 0) dt -= 2 * Math.PI; else if (sweep && dt < 0) dt += 2 * Math.PI;
    var n = Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9), out = [], d = dt / n, k = 4 / 3 * Math.tan(d / 4);
    for (var i = 0; i < n; i++) {
      var a = t1 + i * d, b = a + d;
      var e = function (th, tx, ty) { var x = rx * Math.cos(th) + tx * rx * -Math.sin(th), y = ry * Math.sin(th) + ty * ry * Math.cos(th); return [cp * x - sp * y + cx, sp * x + cp * y + cy]; };
      var p1 = e(a, k, k), p2 = e(b, -k, -k), p3 = e(b, 0, 0);
      out.push(['C', p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]]);
    }
    return out;
  }

  // path data as absolute M, L, C, Q, Z segments
  function parsePath(d) {
    var re = /([MmLlHhVvCcSsQqTtAaZz])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/g, r, cmd = '', nums = [], out = [];
    var x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = '';
    var need = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
    function run() {
      var up = cmd.toUpperCase(), rel = cmd !== up, k = need[up];
      if (up === 'Z') { out.push(['Z']); x = sx; y = sy; prev = 'Z'; return; }
      while (nums.length >= k && k) {
        var a = nums.splice(0, k), ox = rel ? x : 0, oy = rel ? y : 0;
        if (up === 'M') { x = a[0] + ox; y = a[1] + oy; sx = x; sy = y; out.push(['M', x, y]); cmd = rel ? 'l' : 'L'; up = 'L'; k = 2; prev = 'M'; continue; }
        if (up === 'L') { x = a[0] + ox; y = a[1] + oy; out.push(['L', x, y]); }
        else if (up === 'H') { x = a[0] + ox; out.push(['L', x, y]); }
        else if (up === 'V') { y = a[0] + oy; out.push(['L', x, y]); }
        else if (up === 'C') { out.push(['C', a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy, a[4] + ox, a[5] + oy]); px = a[2] + ox; py = a[3] + oy; x = a[4] + ox; y = a[5] + oy; }
        else if (up === 'S') { var c1x = prev === 'C' ? 2 * x - px : x, c1y = prev === 'C' ? 2 * y - py : y; out.push(['C', c1x, c1y, a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy]); px = a[0] + ox; py = a[1] + oy; x = a[2] + ox; y = a[3] + oy; up = 'C'; }
        else if (up === 'Q') { out.push(['Q', a[0] + ox, a[1] + oy, a[2] + ox, a[3] + oy]); px = a[0] + ox; py = a[1] + oy; x = a[2] + ox; y = a[3] + oy; }
        else if (up === 'T') { var qx = prev === 'Q' ? 2 * x - px : x, qy = prev === 'Q' ? 2 * y - py : y; out.push(['Q', qx, qy, a[0] + ox, a[1] + oy]); px = qx; py = qy; x = a[0] + ox; y = a[1] + oy; up = 'Q'; }
        else if (up === 'A') { out = out.concat(arc(x, y, a[0], a[1], a[2] * Math.PI / 180, !!a[3], !!a[4], a[5] + ox, a[6] + oy)); x = a[5] + ox; y = a[6] + oy; }
        prev = up;
        up = cmd.toUpperCase();
      }
    }
    while ((r = re.exec(d))) {
      if (r[1]) { if (cmd) run(); cmd = r[1]; nums = []; if (cmd === 'Z' || cmd === 'z') { run(); cmd = ''; } }
      else nums.push(parseFloat(r[2]));
    }
    if (cmd) run();
    return out;
  }
  function move(segs, m) {
    return segs.map(function (s) {
      var o = [s[0]];
      for (var i = 1; i < s.length; i += 2) { var p = pt(m, s[i], s[i + 1]); o.push(p[0], p[1]); }
      return o;
    });
  }
  function bounds(list) {
    var b = [1e9, 1e9, -1e9, -1e9];
    list.forEach(function (segs) {
      segs.forEach(function (s) {
        for (var i = 1; i < s.length; i += 2) { b[0] = Math.min(b[0], s[i]); b[1] = Math.min(b[1], s[i + 1]); b[2] = Math.max(b[2], s[i]); b[3] = Math.max(b[3], s[i + 1]); }
      });
    });
    return b;
  }
  var KAPPA = 0.5522847498;
  function ellipse(cx, cy, rx, ry) {
    return [['M', cx + rx, cy], ['C', cx + rx, cy + ry * KAPPA, cx + rx * KAPPA, cy + ry, cx, cy + ry], ['C', cx - rx * KAPPA, cy + ry, cx - rx, cy + ry * KAPPA, cx - rx, cy],
      ['C', cx - rx, cy - ry * KAPPA, cx - rx * KAPPA, cy - ry, cx, cy - ry], ['C', cx + rx * KAPPA, cy - ry, cx + rx, cy - ry * KAPPA, cx + rx, cy], ['Z']];
  }
  function box(x, y, w, h, r) {
    if (!r) return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
    var k = r * (1 - KAPPA);
    return [['M', x + r, y], ['L', x + w - r, y], ['C', x + w - k, y, x + w, y + k, x + w, y + r], ['L', x + w, y + h - r], ['C', x + w, y + h - k, x + w - k, y + h, x + w - r, y + h],
      ['L', x + r, y + h], ['C', x + k, y + h, x, y + h - k, x, y + h - r], ['L', x, y + r], ['C', x, y + k, x + k, y, x + r, y], ['Z']];
  }

  function colour(v) {
    v = (v || '').trim().toLowerCase();
    if (!v || v === 'none' || v === 'transparent') return null;
    var m = /^#([0-9a-f]{3})$/.exec(v);
    if (m) return m[1].split('').map(function (h) { return parseInt(h + h, 16); });
    m = /^#([0-9a-f]{6})/.exec(v);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(v);
    if (m) return [+m[1], +m[2], +m[3]];
    return v === 'white' ? [255, 255, 255] : [0, 0, 0];
  }

  // an SVG file as a list of shapes: { segs, fill, stroke, sw, rule, cap, join }.
  // Handles what artwork files use: g, rect, circle, ellipse, line, polyline, polygon, path,
  // transforms, fills, strokes, opacity (flattened against the page colour), simple class styles.
  function readSvg(text) {
    var svg = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    var vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    var out = { w: vb[2], h: vb[3], shapes: [], paper: null, notes: {} };
    var css = {}, re = /\.([\w-]+)(?:\s*,\s*\.[\w-]+)*\s*\{([^}]*)\}/g, r;
    $$('style', svg).forEach(function (st) {
      var txt = st.textContent, rule = /([^{}]+)\{([^}]*)\}/g, q;
      while ((q = rule.exec(txt))) {
        q[1].split(',').forEach(function (sel) {
          var name = /^\s*\.([\w-]+)\s*$/.exec(sel);
          if (name) css[name[1]] = (css[name[1]] || '') + ';' + q[2];
        });
      }
    });
    function props(el, inherited) {
      var p = { fill: inherited.fill, stroke: inherited.stroke, sw: inherited.sw, op: inherited.op, fo: inherited.fo, so: inherited.so, rule: inherited.rule, cap: inherited.cap, join: inherited.join };
      var set = function (k, v) {
        v = v.trim();
        if (k === 'fill') p.fill = v; else if (k === 'stroke') p.stroke = v; else if (k === 'stroke-width') p.sw = parseFloat(v);
        else if (k === 'opacity') p.op = inherited.op * parseFloat(v); else if (k === 'fill-opacity') p.fo = parseFloat(v); else if (k === 'stroke-opacity') p.so = parseFloat(v);
        else if (k === 'fill-rule') p.rule = v; else if (k === 'stroke-linecap') p.cap = v; else if (k === 'stroke-linejoin') p.join = v;
      };
      var decl = ((el.getAttribute('class') || '').split(/\s+/).map(function (c) { return css[c] || ''; }).join(';')) + ';' + (el.getAttribute('style') || '');
      ['fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity', 'fill-rule', 'stroke-linecap', 'stroke-linejoin'].forEach(function (k) {
        if (el.hasAttribute(k)) set(k, el.getAttribute(k));
      });
      decl.split(';').forEach(function (d) { var kv = d.split(':'); if (kv.length === 2) set(kv[0].trim(), kv[1]); });
      return p;
    }
    function flat(c, a) {             // a see-through colour over the paper, as a solid colour
      if (!c || a >= 1 || !out.paper) return c;
      return c.map(function (v, i) { return Math.round(v * a + out.paper[i] * (1 - a)); });
    }
    function walk(el, m, inh) {
      var tag = el.tagName.toLowerCase();
      if (tag === 'defs' || tag === 'style' || tag === 'title' || tag === 'desc' || tag === 'metadata' || tag === 'text') return;
      var p = props(el, inh), k = el.hasAttribute('transform') ? mul(m, transformOf(el.getAttribute('transform'))) : m;
      var n = function (a) { return parseFloat(el.getAttribute(a)) || 0; }, segs = null;
      if (tag === 'g' || tag === 'svg') { Array.prototype.forEach.call(el.children, function (ch) { walk(ch, k, p); }); return; }
      if (tag === 'rect') segs = box(n('x'), n('y'), n('width'), n('height'), Math.min(n('rx') || n('ry'), n('width') / 2, n('height') / 2));
      else if (tag === 'circle') segs = ellipse(n('cx'), n('cy'), n('r'), n('r'));
      else if (tag === 'ellipse') segs = ellipse(n('cx'), n('cy'), n('rx'), n('ry'));
      else if (tag === 'line') segs = [['M', n('x1'), n('y1')], ['L', n('x2'), n('y2')]];
      else if (tag === 'polyline' || tag === 'polygon') {
        var v = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
        segs = [];
        for (var i = 0; i + 1 < v.length; i += 2) segs.push([i ? 'L' : 'M', v[i], v[i + 1]]);
        if (tag === 'polygon') segs.push(['Z']);
      } else if (tag === 'path') segs = parsePath(el.getAttribute('d') || '');
      if (!segs || !segs.length) return;
      var fill = colour(p.fill), stroke = colour(p.stroke);
      // the first shape that covers the whole page is the paper
      if (!out.paper && tag === 'rect' && fill && k === m && n('width') >= out.w && n('height') >= out.h) { out.paper = fill; out.shapes.push({ segs: move(segs, k), fill: fill, paper: true }); return; }
      var scale = Math.sqrt(Math.abs(k[0] * k[3] - k[1] * k[2]));
      out.shapes.push({ segs: move(segs, k), fill: flat(fill, p.op * p.fo), stroke: flat(stroke, p.op * p.so), sw: p.sw * scale, rule: p.rule, cap: p.cap, join: p.join });
    }
    walk(svg, IDENT, { fill: '#000', stroke: 'none', sw: 1, op: 1, fo: 1, so: 1, rule: 'nonzero', cap: 'butt', join: 'miter' });
    // where the designer says the name and the logo go (written in the file's comments)
    var num = '(\\d+(?:\\.\\d+)?)';
    var a = new RegExp('centered at x=' + num + ',\\s*y=' + num + ';\\s*Latin name at y=' + num).exec(text), b = new RegExp('LOGO AREA[^>]*?centered at x=' + num + ',\\s*y=' + num).exec(text);
    out.notes = { han: a ? [+a[1], +a[2]] : [out.w / 2, out.h * .48], name: a ? +a[3] : out.h * .72, logo: b ? [+b[1], +b[2]] : [out.w / 2, out.h * .12] };
    return out;
  }

  // ---- text as shapes
  function glyphs(font, str, size, tracking) {          // a line of letters; returns { segs: [...], width }
    var s = size / font.upm, x = 0, list = [], prev = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i), g = font.glyphs[ch] || font.glyphs[strip(ch)];
      if (!g) continue;
      if (prev && font.kern && font.kern[prev + ch]) x += font.kern[prev + ch] * s;
      if (g[1]) list.push(move(parsePath(g[1]), [s, 0, 0, s, x, -font.top * s]));
      x += g[0] * s + (tracking || 0) * size;
      prev = ch;
    }
    return { list: list, width: x - (tracking || 0) * size };
  }
  var cache = {};
  function han(ch) { return cache[ch] || (cache[ch] = parsePath(D.zh.glyphs[ch] || '')); }

  // ---- the souvenir: every shape of the page, in mm
  function compose(tpl, res, form) {
    var art = tpl.art, shapes = art.shapes.slice(), lines = res.forms[form], total = lines.join('');
    // one line, or two when that lets the characters be larger
    if (lines.length === 1 && total.length > 3) {
      var half = Math.ceil(total.length / 2), two = [total.slice(0, half), total.slice(half)];
      if (size(tpl, two) > size(tpl, lines) * 1.12) lines = two;
    }
    var em = size(tpl, lines), s = em / D.zh.upm, gap = em * 1.06, ink = [];
    lines.forEach(function (line, li) {
      for (var i = 0; i < line.length; i++) {
        var along = (i - (line.length - 1) / 2) * em * .98, across = (li - (lines.length - 1) / 2) * gap;
        var x = tpl.flow === 'h' ? along : -across, y = tpl.flow === 'h' ? across : along;      // upright lines run right to left
        ink.push(move(han(line.charAt(i)), [s, 0, 0, s, x - em / 2, y - em / 2]));
      }
    });
    var b = bounds(ink), dx = art.notes.han[0] - (b[0] + b[2]) / 2, dy = art.notes.han[1] - (b[1] + b[3]) / 2;
    ink = ink.map(function (g) { return move(g, [1, 0, 0, 1, dx, dy]); });
    ink.forEach(function (g) { shapes.push({ segs: g, fill: INK, ink: true }); });
    b = [b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy];
    // a small red seal with the last character, lower right of the name
    var side = Math.max(4.4, Math.min(7.5, em * .26)), sx = Math.min(b[2] + 1.4, art.w - 6.6 - side), sy = b[3] - side - em * .04;
    shapes.push({ segs: box(sx, sy, side, side, side * .14), fill: SEAL });
    var last = total.charAt(total.length - 1), k = side * .78 / D.zh.upm, lb = bounds([han(last)]);
    shapes.push({ segs: move(han(last), [k, 0, 0, k, sx + side / 2 - (lb[0] + lb[2]) / 2 * k, sy + side / 2 - (lb[1] + lb[3]) / 2 * k]), fill: art.paper || [255, 255, 255] });
    // the visitor's own name
    var fs = tpl.name, run = glyphs(D.la, res.name, fs, 0);
    if (run.width > tpl.nameMax) { fs *= tpl.nameMax / run.width; run = glyphs(D.la, res.name, fs, 0); }
    run.list.forEach(function (g) { shapes.push({ segs: move(g, [1, 0, 0, 1, art.w / 2 - run.width / 2, art.notes.name]), fill: INK }); });
    // the logo area
    if (tpl.mark) {
      var mb = tpl.mark.box, ms = Math.min(tpl.logo[0] / (mb[2] - mb[0]), tpl.logo[1] * 1.6 / (mb[3] - mb[1]));
      tpl.mark.shapes.forEach(function (sh) {
        var o = {}; for (var key in sh) o[key] = sh[key];
        o.segs = move(sh.segs, [ms, 0, 0, ms, art.notes.logo[0] - (mb[0] + mb[2]) / 2 * ms, art.notes.logo[1] - (mb[1] + mb[3]) / 2 * ms]);
        if (o.sw) o.sw *= ms;
        shapes.push(o);
      });
    } else if (BRAND) {
      var cap = tpl.logo[1] / .72, br = glyphs(D.caps, BRAND, cap, .2);
      if (br.width > tpl.logo[0]) { cap *= tpl.logo[0] / br.width; br = glyphs(D.caps, BRAND, cap, .2); }
      br.list.forEach(function (g) { shapes.push({ segs: move(g, [1, 0, 0, 1, art.notes.logo[0] - br.width / 2, art.notes.logo[1] + cap * .36]), fill: GOLD }); });
    }
    return { w: art.w, h: art.h, shapes: shapes, paper: art.paper };
  }
  function size(tpl, lines) {
    var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    var along = tpl.flow === 'h' ? tpl.box[0] : tpl.box[1], across = tpl.flow === 'h' ? tpl.box[1] : tpl.box[0];
    return Math.min(along / (longest * .98), across / (1 + (lines.length - 1) * 1.06));
  }

  // ---- the page as SVG (what is shown) and as PDF (what is printed): the same shapes
  var f2 = function (v) { return (Math.round(v * 1000) / 1000).toString(); };
  function dOf(segs) { return segs.map(function (s) { return s[0] + s.slice(1).map(f2).join(' '); }).join(''); }
  function svgOf(page, cls) {
    var body = page.shapes.map(function (sh) {
      var a = ' fill="' + (sh.fill ? 'rgb(' + sh.fill.join(',') + ')' : 'none') + '"';
      if (sh.stroke) a += ' stroke="rgb(' + sh.stroke.join(',') + ')" stroke-width="' + f2(sh.sw) + '"' + (sh.cap && sh.cap !== 'butt' ? ' stroke-linecap="' + sh.cap + '"' : '') + (sh.join && sh.join !== 'miter' ? ' stroke-linejoin="' + sh.join + '"' : '');
      if (sh.rule === 'evenodd') a += ' fill-rule="evenodd"';
      return '<path' + (sh.ink ? ' class="ink"' : '') + a + ' d="' + dOf(sh.segs) + '"/>';
    }).join('');
    return '<svg class="' + cls + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + page.w + ' ' + page.h + '" role="img">' + body + '</svg>';
  }

  var MM = 72 / 25.4;
  function pdfOf(page, title, shop) {
    var pad = shop ? BLEED + MARKS : 0, W = (page.w + 2 * pad) * MM, H = (page.h + 2 * pad) * MM, c = [];
    var n = function (v) { return (Math.round(v * 1000) / 1000).toString(); };
    var rgb = function (col) { return col.map(function (v) { return n(v / 255); }).join(' '); };
    // work in millimetres, y pointing down, origin at the top left corner of the finished size
    c.push('q ' + n(MM) + ' 0 0 ' + n(-MM) + ' ' + n(pad * MM) + ' ' + n(H - pad * MM) + ' cm 4 M');
    page.shapes.forEach(function (sh) {
      var segs = sh.segs, ops = [], x = 0, y = 0;
      if (sh.paper && shop) segs = box(-BLEED, -BLEED, page.w + 2 * BLEED, page.h + 2 * BLEED, 0);   // the paper colour runs into the bleed
      segs.forEach(function (s) {
        if (s[0] === 'M') { ops.push(n(s[1]) + ' ' + n(s[2]) + ' m'); x = s[1]; y = s[2]; }
        else if (s[0] === 'L') { ops.push(n(s[1]) + ' ' + n(s[2]) + ' l'); x = s[1]; y = s[2]; }
        else if (s[0] === 'C') { ops.push(s.slice(1).map(n).join(' ') + ' c'); x = s[5]; y = s[6]; }
        else if (s[0] === 'Q') {      // a quadratic curve, written as the cubic curve it equals
          ops.push([x + 2 / 3 * (s[1] - x), y + 2 / 3 * (s[2] - y), s[3] + 2 / 3 * (s[1] - s[3]), s[4] + 2 / 3 * (s[2] - s[4]), s[3], s[4]].map(n).join(' ') + ' c');
          x = s[3]; y = s[4];
        } else ops.push('h');
      });
      var paint = sh.fill && sh.stroke ? (sh.rule === 'evenodd' ? 'B*' : 'B') : sh.fill ? (sh.rule === 'evenodd' ? 'f*' : 'f') : 'S';
      if (!sh.fill && !sh.stroke) return;
      if (sh.fill) c.push(rgb(sh.fill) + ' rg');
      if (sh.stroke) c.push(rgb(sh.stroke) + ' RG ' + n(sh.sw) + ' w ' + ({ round: 1, square: 2 }[sh.cap] || 0) + ' J ' + ({ round: 1, bevel: 2 }[sh.join] || 0) + ' j');
      c.push(ops.join(' ') + ' ' + paint);
    });
    if (shop) {                       // crop marks, outside the bleed
      c.push('0 0 0 RG ' + n(.09) + ' w 0 J');
      var a = BLEED + 1, b = BLEED + MARKS - .5;
      [[0, 0, -1, -1], [page.w, 0, 1, -1], [0, page.h, -1, 1], [page.w, page.h, 1, 1]].forEach(function (k) {
        c.push(n(k[0] + k[2] * a) + ' ' + n(k[1]) + ' m ' + n(k[0] + k[2] * b) + ' ' + n(k[1]) + ' l S');
        c.push(n(k[0]) + ' ' + n(k[1] + k[3] * a) + ' m ' + n(k[0]) + ' ' + n(k[1] + k[3] * b) + ' l S');
      });
    }
    c.push('Q');
    var stream = c.join('\n');
    var hex = function (s) { var o = 'FEFF'; for (var i = 0; i < s.length; i++) o += ('000' + s.charCodeAt(i).toString(16)).slice(-4); return '<' + o.toUpperCase() + '>'; };
    var boxOf = function (m) { return '[' + [m * MM, m * MM, W - m * MM, H - m * MM].map(n).join(' ') + ']'; };
    var now = new Date(), z = function (v) { return (v < 10 ? '0' : '') + v; };
    var stamp = 'D:' + now.getUTCFullYear() + z(now.getUTCMonth() + 1) + z(now.getUTCDate()) + z(now.getUTCHours()) + z(now.getUTCMinutes()) + z(now.getUTCSeconds()) + 'Z';
    var objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + n(W) + ' ' + n(H) + '] /TrimBox ' + boxOf(pad) + ' /BleedBox ' + boxOf(shop ? MARKS : 0) + ' /Resources << >> /Contents 4 0 R >>',
      '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
      '<< /Title ' + hex(title) + ' /Creator (benevents agency) /Producer (benevents calligraphy) /CreationDate (' + stamp + ') >>'
    ];
    var out = '%PDF-1.4\n%âãÏÓ\n', at = [];
    objs.forEach(function (o, i) { at.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
    var xref = out.length;
    out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + at.map(function (a) { return ('0000000000' + a).slice(-10) + ' 00000 n \n'; }).join('');
    out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info 5 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
    var bytes = new Uint8Array(out.length);
    for (var i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
    return bytes;
  }

  /* ==================================================================
     3. THE PAGE
     ================================================================== */
  var form = $('.calli__form', root), input = form.elements.name, note = $('.calli__note', root);
  var result = $('.calli__result', root), hanBox = $('.calli__han', root), pinyinBox = $('.calli__pinyin', root);
  var chip = $('.calli__chip', root), chipNote = $('.calli__chipnote', root), altBox = $('.calli__alts', root);
  var tabs = $('.calli__tabs', root), stage = $('.calli__paper', root), specs = $('.calli__specs', root);
  var shop = $('.calli__shop input', root), act = $('.calli__actions', root), anote = $('.calli__anote', root);
  var state = { res: null, form: 0, tpl: 0, ready: false, loading: null };

  function say(msg, bad) { note.textContent = msg || ''; note.classList.toggle('is-error', !!bad); }

  function load() {
    if (state.loading) return state.loading;
    say(t('loading'));
    var get = function (u, as) { return fetch(BASE + u).then(function (r) { if (!r.ok) throw new Error(u); return as === 'json' ? r.json() : r.text(); }); };
    var jobs = [get('data.json', 'json')].concat(TEMPLATES.map(function (tp) { return get(tp.file); }));
    if (LOGO) jobs.push(fetch(LOGO).then(function (r) { return r.ok ? r.text() : ''; }, function () { return ''; }));
    state.loading = Promise.all(jobs).then(function (got) {
      D = got[0];
      TEMPLATES.forEach(function (tp, i) { tp.art = readSvg(got[i + 1]); });
      if (LOGO && got[TEMPLATES.length + 1]) {
        var mark = readSvg(got[TEMPLATES.length + 1]);
        mark.shapes = mark.shapes.filter(function (s) { return !s.paper; });
        mark.box = bounds(mark.shapes.map(function (s) { return s.segs; }));
        TEMPLATES.forEach(function (tp) { tp.mark = mark; });
      }
      state.ready = true;
      say('');
    });
    state.loading.catch(function () { state.loading = null; say(t('failed'), true); });
    return state.loading;
  }

  // characters drawn from the same outlines, for the small buttons too (no system font involved)
  function tile(ch, pad) {
    var b = bounds([han(ch)]);
    return '<svg viewBox="' + (b[0] - pad) + ' 0 ' + (b[2] - b[0] + 2 * pad) + ' ' + D.zh.upm + '" aria-hidden="true"><path d="' + D.zh.glyphs[ch] + '"/></svg>';
  }

  function showHan() {
    var res = state.res, lines = res.forms[state.form], text = lines.join(lines.length > 1 ? '·' : '');
    hanBox.textContent = '';
    var k = 0, longest = 2;
    lines.forEach(function (line) {                    // one row for each part of the name
      var row = doc.createElement('div');
      row.className = 'calli__line';
      longest = Math.max(longest, line.length);
      line.split('').forEach(function (ch) {
        var holder = doc.createElement('span');
        holder.className = 'calli__char';
        holder.style.setProperty('--i', k++);
        holder.innerHTML = tile(ch, 40);
        row.appendChild(holder);
      });
      hanBox.appendChild(row);
    });
    hanBox.style.setProperty('--n', longest);
    hanBox.classList.toggle('is-multi', lines.length > 1);
    var py = lines.map(pinyinOf).join(' ');
    hanBox.setAttribute('aria-label', t('spoken', { han: text, pinyin: py }));
    pinyinBox.textContent = py;
    chip.textContent = t(res.known ? 'usage' : 'proposal');
    chip.classList.toggle('is-proposal', !res.known);
    chipNote.textContent = t(res.known ? 'usageNote' : 'proposalNote');
    altBox.textContent = '';
    if (res.forms.length > 1) {
      var lab = doc.createElement('span');
      lab.textContent = t('alts');
      altBox.appendChild(lab);
      res.forms.forEach(function (f, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.innerHTML = f.join('').split('').map(function (ch) { return tile(ch, 20); }).join('');
        b.setAttribute('aria-label', f.map(pinyinOf).join(' '));
        b.setAttribute('aria-pressed', String(i === state.form));
        b.addEventListener('click', function () { if (state.form !== i) { state.form = i; showHan(); showPaper(); } });
        altBox.appendChild(b);
      });
    }
    result.hidden = false;
    result.classList.remove('is-in');
    void result.offsetWidth;
    result.classList.add('is-in');
  }

  function page() { return compose(TEMPLATES[state.tpl], state.res, state.form); }
  function showPaper() {
    var tp = TEMPLATES[state.tpl], pg = page();
    stage.innerHTML = svgOf(pg, 'calli__svg');
    stage.firstChild.setAttribute('aria-label', TEXT[lang].names[tp.id] + ' — ' + state.res.name + ', ' + state.res.forms[state.form].join(''));
    stage.style.setProperty('--ratio', (pg.w / pg.h).toFixed(4));
    stage.setAttribute('data-tpl', tp.id);
    $$('button', tabs).forEach(function (b, i) { b.setAttribute('aria-selected', String(i === state.tpl)); b.tabIndex = i === state.tpl ? 0 : -1; });
    specs.textContent = t(shop.checked ? 'specsBleed' : 'specs', { w: pg.w, h: pg.h, b: BLEED });
    act.hidden = false;
    anote.textContent = '';
  }
  function labels() {
    $$('button', tabs).forEach(function (b, i) { $('b', b).textContent = TEXT[lang].names[TEMPLATES[i].id]; });
  }

  function reveal(raw, quiet) {
    return load().then(function () {
      var res = transliterate(raw);
      if (res.error) { if (!quiet) say(t(res.error), true); return false; }
      say('');
      state.res = res; state.form = 0;
      showHan();
      showPaper();
      return true;
    });
  }

  function fileName() {
    var tp = TEMPLATES[state.tpl];
    return 'EXEED-' + strip(state.res.name).replace(/[^A-Za-z]+/g, '-') + '-' + tp.id + (shop.checked ? '-print' : '') + '.pdf';
  }
  function makePdf() {
    var tp = TEMPLATES[state.tpl];
    return new Blob([pdfOf(page(), state.res.name + ' ' + state.res.forms[state.form].join('') + ' — ' + TEXT[lang].names[tp.id], shop.checked)], { type: 'application/pdf' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!tidy(input.value)) { say(t('empty'), true); input.focus(); return; }
    reveal(input.value).then(function (ok) { if (ok && window.matchMedia('(max-width: 900px)').matches) result.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  });
  input.addEventListener('input', function () { if (note.classList.contains('is-error')) say(''); });
  TEMPLATES.forEach(function (tp, i) {
    var b = doc.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.innerHTML = '<b></b><span></span>';
    b.addEventListener('click', function () { state.tpl = i; if (state.res) showPaper(); });
    tabs.appendChild(b);
  });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var n = TEMPLATES.length, i = (state.tpl + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
    state.tpl = i;
    if (state.res) showPaper();
    $$('button', tabs)[i].focus();
  });
  shop.addEventListener('change', function () { if (state.res) showPaper(); });
  act.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-calli]') : null;
    if (!b || !state.res) return;
    var url = URL.createObjectURL(makePdf());
    if (b.getAttribute('data-calli') === 'print') {
      var w = window.open(url, '_blank');             // the browser's PDF viewer prints at true size
      if (w) { setTimeout(function () { URL.revokeObjectURL(url); }, 120000); return; }
    }
    var a = doc.createElement('a');
    a.href = url; a.download = fileName();
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
    anote.textContent = t('ready');
  });

  // sizes of the three formats, once the files are read
  function sizes() { $$('button', tabs).forEach(function (b, i) { var a = TEMPLATES[i].art; if (a) $('span', b).textContent = a.w + ' × ' + a.h + ' mm'; }); }

  doc.addEventListener('ben:lang', function (e) {
    lang = e.detail === 'en' ? 'en' : 'fr';
    labels();
    if (state.res) { showHanQuiet(); showPaper(); }
  });
  function showHanQuiet() { showHan(); result.classList.add('is-still'); }

  // start when the section comes near the screen
  var started = false;
  function start() {
    if (started) return;
    started = true;
    labels();
    load().then(function () { sizes(); return reveal(EXAMPLE, true); });
  }
  function watch() {
    if (!('IntersectionObserver' in window)) return start();
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '500px 0px' });
    io.observe(root);
  }
  doc.addEventListener('ben:open', watch);
  if (doc.body.classList.contains('is-open')) watch();

  // for the automated checks
  window.BEN_CALLI = {
    ready: function () { return load().then(function () { return true; }); },
    transliterate: function (s) { return transliterate(s); },
    sounds: sounds,
    spell: function (w) { return write(sounds(w)); },
    pinyin: function (h) { return pinyinOf(h); },
    templates: TEMPLATES,
    pdf: function (name, tpl, withBleed, formIndex) {
      var res = transliterate(name);
      return pdfOf(compose(TEMPLATES[tpl], res, formIndex || 0), res.name, !!withBleed);
    },
    svg: function (name, tpl, formIndex) { var res = transliterate(name); return svgOf(compose(TEMPLATES[tpl], res, formIndex || 0), 'calli__svg'); },
    glyph: function (ch) { return D.zh.glyphs[ch]; },
    chars: function () { return Object.keys(D.zh.glyphs); },
    names: function () { return D.names; }
  };
})();
