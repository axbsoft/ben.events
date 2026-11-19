/* benevents agency — "Your first name in Chinese calligraphy": the slide of the presentation
   where the showroom activity can be tried. Vanilla JS, no dependencies.

   1. A visitor types a first name. The name is looked up in a list of established Chinese
      forms; a name that is not listed is written syllable by syllable (always the sound of
      the name, never a meaning) and shown as a proposal to check.
   2. The visitor leaves an e-mail address to receive the calligraphy: this is how the
      activity collects contacts, each with or without the visitor's consent to be contacted.
   3. The bookmark is printed. The characters are drawn from outlines of a brush typeface,
      the same outlines on screen and in the PDF, so the print cannot differ from what was
      shown and does not depend on installed fonts.

   Data: assets/calligraphy/data.json (built by tools/calligraphy/build.py)
   Bookmark: assets/calligraphy/templates/ (a picture, printed as the background) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SETTINGS
     ------------------------------------------------------------------ */
  var BASE = 'assets/calligraphy/';
  var EXAMPLE = 'Yassine';          // shown before the visitor types anything
  var MAX_LENGTH = 24;
  // The bookmark, in mm from its top left corner: size (w, h); han: the centre of the characters
  // and box: the room around it (width, height); line: the rule the visitor's name sits on (its
  // height, the gap between its two dashes, the smallest size before the name moves under the
  // rule); edge: the paper colour, used for the bleed.
  var BOOKMARK = { image: 'templates/exeed-bookmark_60x180mm.jpg', w: 60, h: 180, han: [30, 72], box: [30, 56],
    name: 5.6, nameMax: 40, line: { y: 107.55, gap: [20.6, 39.7], min: 4.3, below: 113.9 }, edge: [249, 224, 187] };
  var INK = [24, 21, 19];
  var BLEED = 3, MARKS = 6;         // mm, print-shop version
  var SHOWN = 4;                    // contacts listed on the slide (the newest first)
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
      failed: 'La démonstration n’a pas pu être chargée. Vérifiez votre connexion et réessayez.',
      usage: 'Forme d’usage',
      usageNote: 'Transcription phonétique couramment utilisée pour ce prénom.',
      proposal: 'Proposition phonétique',
      proposalNote: 'Transcription automatique, syllabe par syllabe. Sur l’événement, elle est validée par l’équipe avant impression.',
      alts: 'Autre graphie',
      spoken: '{han}, prononcé {pinyin}',
      paper: 'Marque-page de {name} : {han}',
      specs: 'Marque-page {w} × {h} mm',
      specsBleed: '{w} × {h} mm + fond perdu {b} mm, traits de coupe',
      mailFirst: 'Révélez d’abord un prénom.',
      mailEmpty: 'Saisissez une adresse e-mail.',
      mailBad: 'Cette adresse e-mail ne semble pas valide.',
      mailDemo: 'Sur l’événement, {email} reçoit sa calligraphie dans la minute. Ici, rien n’est envoyé : c’est une démonstration.',
      mailSent: 'E-mail envoyé à {email}.',
      mailFailed: 'L’e-mail n’a pas pu être envoyé. Vérifiez la connexion et réessayez.',
      printLocked: 'L’impression se débloque après l’étape e-mail.',
      printReady: 'Le marque-page peut maintenant être imprimé.',
      printOpen: 'Le PDF s’ouvre dans un nouvel onglet : imprimez-le à 100 %.',
      ready: 'Le PDF est prêt.',
      agree: 'Accord',
      noagree: 'Sans accord',
      csv: ['Prénom', 'Caractères', 'Pinyin', 'E-mail', 'Accord pour être recontacté', 'Date'],
      yes: 'oui',
      no: 'non'
    },
    en: {
      empty: 'Enter a first name.',
      letters: 'Use Latin letters, spaces and hyphens only.',
      refused: 'This name cannot be handled here. Please ask the team.',
      loading: 'Preparing the ink…',
      failed: 'The demonstration could not be loaded. Check your connection and try again.',
      usage: 'Established form',
      usageNote: 'The phonetic transcription commonly used for this name.',
      proposal: 'Phonetic proposal',
      proposalNote: 'Automatic transcription, syllable by syllable. At the event it is checked by the team before printing.',
      alts: 'Other spelling',
      spoken: '{han}, pronounced {pinyin}',
      paper: 'Bookmark for {name}: {han}',
      specs: 'Bookmark {w} × {h} mm',
      specsBleed: '{w} × {h} mm + {b} mm bleed, crop marks',
      mailFirst: 'Reveal a first name first.',
      mailEmpty: 'Enter an email address.',
      mailBad: 'This email address does not look valid.',
      mailDemo: 'At the event, {email} receives the calligraphy within a minute. Here nothing is sent: this is a demonstration.',
      mailSent: 'Email sent to {email}.',
      mailFailed: 'The email could not be sent. Check the connection and try again.',
      printLocked: 'Printing unlocks after the email step.',
      printReady: 'The bookmark can now be printed.',
      printOpen: 'The PDF opens in a new tab: print it at 100%.',
      ready: 'The PDF is ready.',
      agree: 'Consent',
      noagree: 'No consent',
      csv: ['First name', 'Characters', 'Pinyin', 'Email', 'Agrees to be contacted', 'Date'],
      yes: 'yes',
      no: 'no'
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
    var s = (raw || '').normalize('NFC').replace(/[’ʼ`]/g, '\'').replace(/[\s ]+/g, ' ').replace(/\s*-\s*/g, '-').trim();
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

  // the whole name: { name, forms: [[han, …], …], known } or { error }
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
     2. DRAWING: outlines, the bookmark, the page
     ================================================================== */
  // an outline as build.py writes it (M, L, Q, C, Z with absolute numbers) as a list of segments
  function parsePath(d) {
    var out = [], re = /([MLQCZ])([^MLQCZ]*)/g, r;
    while ((r = re.exec(d))) out.push([r[1]].concat(r[2].trim() ? r[2].trim().split(/\s+/).map(Number) : []));
    return out;
  }
  // m: [scale x, 0, 0, scale y, shift x, shift y]
  function move(segs, m) {
    return segs.map(function (s) {
      var o = [s[0]];
      for (var i = 1; i < s.length; i += 2) o.push(m[0] * s[i] + m[4], m[3] * s[i + 1] + m[5]);
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

  // a line of Latin letters as outlines; returns { list: [...], width }
  function letters(str, size) {
    var font = D.la, s = size / font.upm, x = 0, list = [], prev = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i), g = font.glyphs[ch] || font.glyphs[strip(ch)];
      if (!g) continue;
      if (prev && font.kern[prev + ch]) x += font.kern[prev + ch] * s;
      if (g[1]) list.push(move(parsePath(g[1]), [s, 0, 0, s, x, -font.top * s]));
      x += g[0] * s;
      prev = ch;
    }
    return { list: list, width: x };
  }
  var cache = {};
  function han(ch) { return cache[ch] || (cache[ch] = parsePath(D.zh.glyphs[ch] || '')); }

  // the size of a character, in mm, for these columns of characters
  function size(lines) {
    var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    return Math.min(BOOKMARK.box[1] / (longest * .98), BOOKMARK.box[0] / (1 + (lines.length - 1) * 1.06));
  }

  // ---- the bookmark: what is drawn on the picture, in mm
  function compose(res, form) {
    var tp = BOOKMARK, lines = res.forms[form], total = lines.join('');
    // one column, or two when that lets the characters be larger
    if (lines.length === 1 && total.length > 3) {
      var half = Math.ceil(total.length / 2), two = [total.slice(0, half), total.slice(half)];
      if (size(two) > size(lines) * 1.12) lines = two;
    }
    var em = size(lines), s = em / D.zh.upm, gap = em * 1.06, ink = [];
    lines.forEach(function (line, li) {                      // upright columns, read from right to left
      for (var i = 0; i < line.length; i++) {
        var x = -(li - (lines.length - 1) / 2) * gap, y = (i - (line.length - 1) / 2) * em * .98;
        ink.push(move(han(line.charAt(i)), [s, 0, 0, s, x - em / 2, y - em / 2]));
      }
    });
    var b = bounds(ink), dx = tp.han[0] - (b[0] + b[2]) / 2, dy = tp.han[1] - (b[1] + b[3]) / 2;
    var shapes = ink.map(function (g) { return { segs: move(g, [1, 0, 0, 1, dx, dy]), ink: true }; });
    // the visitor's own name: between the two dashes of the rule, or under it when it is too long
    var fs = tp.name, run = letters(res.name, fs), room = tp.line.gap[1] - tp.line.gap[0] - 2.2;
    if (run.width > room) { fs = Math.max(tp.line.min, fs * room / run.width); run = letters(res.name, fs); }
    var nx = (tp.line.gap[0] + tp.line.gap[1]) / 2, ny = tp.line.y + fs * .2;
    if (run.width > room + .05) { fs = tp.name; run = letters(res.name, fs); nx = tp.w / 2; ny = tp.line.below; }
    if (run.width > tp.nameMax) { fs *= tp.nameMax / run.width; run = letters(res.name, fs); }
    run.list.forEach(function (g) { shapes.push({ segs: move(g, [1, 0, 0, 1, nx - run.width / 2, ny]) }); });
    return { w: tp.w, h: tp.h, shapes: shapes, paper: tp.edge, pic: tp.pic };
  }

  // ---- the page as SVG (what is shown) and as PDF (what is printed): the same shapes
  var f3 = function (v) { return (Math.round(v * 1000) / 1000).toString(); };
  function svgOf(page) {
    var ink = 'rgb(' + INK.join(',') + ')';
    var body = page.shapes.map(function (sh) {
      return '<path' + (sh.ink ? ' class="ink"' : '') + ' fill="' + ink + '" d="' + sh.segs.map(function (s) { return s[0] + s.slice(1).map(f3).join(' '); }).join('') + '"/>';
    }).join('');
    return '<svg class="calli__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + page.w + ' ' + page.h + '" role="img">' +
      '<image href="' + page.pic.url + '" x="0" y="0" width="' + page.w + '" height="' + page.h + '" preserveAspectRatio="none"/>' + body + '</svg>';
  }

  var MM = 72 / 25.4;
  function pdfOf(page, title, shop) {
    var pad = shop ? BLEED + MARKS : 0, W = (page.w + 2 * pad) * MM, H = (page.h + 2 * pad) * MM, c = [], n = f3;
    var rgb = function (col) { return col.map(function (v) { return n(v / 255); }).join(' '); };
    // work in millimetres, y pointing down, origin at the top left corner of the finished size
    c.push('q ' + n(MM) + ' 0 0 ' + n(-MM) + ' ' + n(pad * MM) + ' ' + n(H - pad * MM) + ' cm');
    // the picture, at the finished size; its paper colour fills the bleed
    if (shop) c.push(rgb(page.paper) + ' rg ' + [-BLEED, -BLEED, page.w + 2 * BLEED, page.h + 2 * BLEED].map(n).join(' ') + ' re f');
    c.push('q ' + n(page.w) + ' 0 0 ' + n(-page.h) + ' 0 ' + n(page.h) + ' cm /Im0 Do Q');
    c.push(rgb(INK) + ' rg');
    page.shapes.forEach(function (sh) {
      var ops = [], x = 0, y = 0;
      sh.segs.forEach(function (s) {
        if (s[0] === 'M') { ops.push(n(s[1]) + ' ' + n(s[2]) + ' m'); x = s[1]; y = s[2]; }
        else if (s[0] === 'L') { ops.push(n(s[1]) + ' ' + n(s[2]) + ' l'); x = s[1]; y = s[2]; }
        else if (s[0] === 'C') { ops.push(s.slice(1).map(n).join(' ') + ' c'); x = s[5]; y = s[6]; }
        else if (s[0] === 'Q') {      // a quadratic curve, written as the cubic curve it equals
          ops.push([x + 2 / 3 * (s[1] - x), y + 2 / 3 * (s[2] - y), s[3] + 2 / 3 * (s[1] - s[3]), s[4] + 2 / 3 * (s[2] - s[4]), s[3], s[4]].map(n).join(' ') + ' c');
          x = s[3]; y = s[4];
        } else ops.push('h');
      });
      c.push(ops.join(' ') + ' f');
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
    var pic = page.pic, objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + n(W) + ' ' + n(H) + '] /TrimBox ' + boxOf(pad) + ' /BleedBox ' + boxOf(shop ? MARKS : 0) + ' /Resources << /XObject << /Im0 6 0 R >> >> /Contents 4 0 R >>',
      '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
      '<< /Title ' + hex(title) + ' /Creator (benevents agency) /Producer (benevents calligraphy) /CreationDate (' + stamp + ') >>',
      ['<< /Type /XObject /Subtype /Image /Width ' + pic.px[0] + ' /Height ' + pic.px[1] + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + pic.bytes.length + ' >>\nstream\n', pic.bytes, '\nendstream']
    ];
    // the file, byte by byte (the picture is binary)
    var parts = [], total = 0, at = [];
    var put = function (x) {
      if (typeof x === 'string') { var u = new Uint8Array(x.length); for (var i = 0; i < x.length; i++) u[i] = x.charCodeAt(i) & 255; x = u; }
      parts.push(x); total += x.length;
    };
    put('%PDF-1.4\n%âãÏÓ\n');
    objs.forEach(function (o, i) { at.push(total); put((i + 1) + ' 0 obj\n'); [].concat(o).forEach(put); put('\nendobj\n'); });
    var xref = total;
    put('xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + at.map(function (a) { return ('0000000000' + a).slice(-10) + ' 00000 n \n'; }).join(''));
    put('trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info 5 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    var bytes = new Uint8Array(total), pos = 0;
    parts.forEach(function (u) { bytes.set(u, pos); pos += u.length; });
    return bytes;
  }

  // width and height of a JPEG picture, read from its header
  function jpegSize(u) {
    var i = 2;
    while (i + 9 < u.length) {
      if (u[i] !== 255) { i++; continue; }
      var m = u[i + 1];
      if (m >= 192 && m <= 207 && m !== 196 && m !== 200 && m !== 204) return [(u[i + 7] << 8) | u[i + 8], (u[i + 5] << 8) | u[i + 6]];
      i += 2 + ((u[i + 2] << 8) | u[i + 3]);
    }
    return null;
  }

  /* ==================================================================
     3. THE E-MAIL
     This page is a demonstration: nothing is sent and nothing is stored. A contact lives in
     the page's memory, to show the organiser's list, and is gone when the page is closed.
     For the event, deliver() is the one function to connect to the mail service: it receives
     the contact { name, han, pinyin, email, consent, at } (makePdf() gives the bookmark to
     attach) and must return a promise that resolves once the e-mail has left.
     ================================================================== */
  function deliver(contact) {
    return Promise.resolve({ demo: true, contact: contact });
  }

  /* ==================================================================
     4. THE SLIDE
     ================================================================== */
  var form = $('.calli__form', root), input = form.elements.name, note = $('.calli__note', root);
  var result = $('.calli__result', root), hanBox = $('.calli__han', root), pinyinBox = $('.calli__pinyin', root);
  var chip = $('.calli__chip', root), chipNote = $('.calli__chipnote', root), altBox = $('.calli__alts', root);
  var paper = $('.calli__paper', root), specs = $('.calli__specs', root);
  var mail = $('.calli__mail', root), email = mail.elements.email, agree = $('.calli__consent input', root), mnote = $('.calli__mnote', root);
  var last = $('.calli__step[data-step="3"]', root), shop = $('.calli__shop input', root), anote = $('.calli__anote', root);
  var rows = $('.calli__rows', root), none = $('.calli__none', root), count = $('.calli__count', root);
  var state = { res: null, form: 0, loading: null, sent: '', leads: [] };

  // a status line; it is kept so that it can be said again in the other language
  function say(el, key, vars, kind) {
    el._said = key ? { key: key, vars: vars, kind: kind } : null;
    el.textContent = key ? t(key, vars) : '';
    el.classList.toggle('is-error', kind === 'error');
    el.classList.toggle('is-done', kind === 'done');
  }
  function sayAgain(el) { if (el._said) say(el, el._said.key, el._said.vars, el._said.kind); }

  function load() {
    if (state.loading) return state.loading;
    say(note, 'loading');
    var get = function (u, json) { return fetch(BASE + u).then(function (r) { if (!r.ok) throw new Error(u); return json ? r.json() : r.arrayBuffer(); }); };
    state.loading = Promise.all([get('data.json', true), get(BOOKMARK.image)]).then(function (got) {
      var bytes = new Uint8Array(got[1]), px = jpegSize(bytes);
      if (!px) throw new Error(BOOKMARK.image);
      D = got[0];
      BOOKMARK.pic = { bytes: bytes, px: px, url: URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' })) };
      say(note, '');
    });
    state.loading.catch(function () { state.loading = null; say(note, 'failed', null, 'error'); });
    return state.loading;
  }

  // a character drawn from its outline, for the page itself (no system font involved)
  function tile(ch, pad) {
    var b = bounds([han(ch)]);
    return '<svg viewBox="' + (b[0] - pad) + ' 0 ' + (b[2] - b[0] + 2 * pad) + ' ' + D.zh.upm + '" aria-hidden="true"><path d="' + D.zh.glyphs[ch] + '"/></svg>';
  }

  function showHan(still) {
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
    hanBox.style.setProperty('--rows', lines.length);
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
    result.classList.remove('is-in', 'is-still');
    void result.offsetWidth;
    result.classList.add(still ? 'is-still' : 'is-in');
  }

  function showPaper() {
    var pg = compose(state.res, state.form);
    paper.innerHTML = svgOf(pg);
    paper.firstChild.setAttribute('aria-label', t('paper', { name: state.res.name, han: state.res.forms[state.form].join('') }));
    specs.textContent = t(shop.checked ? 'specsBleed' : 'specs', { w: pg.w, h: pg.h, b: BLEED });
  }

  // printing waits for the e-mail step
  function unlock(to) {
    state.sent = to || '';
    last.classList.toggle('is-off', !state.sent);
    $$('[data-calli="print"], [data-calli="pdf"]', root).forEach(function (b) { b.disabled = !state.sent; });
    say(anote, state.sent ? 'printReady' : 'printLocked', null, state.sent ? 'done' : '');
  }

  function reveal(raw, quiet) {
    return load().then(function () {
      var res = transliterate(raw);
      if (res.error) { if (!quiet) say(note, res.error, null, 'error'); return false; }
      say(note, '');
      state.res = res; state.form = 0;
      if (state.sent) { say(mnote, ''); unlock(''); }       // another first name: the e-mail step starts again
      showHan();
      showPaper();
      return true;
    });
  }

  function fileName() { return 'EXEED-' + strip(state.res.name).replace(/[^A-Za-z]+/g, '-') + '-bookmark' + (shop.checked ? '-print' : '') + '.pdf'; }
  function makePdf() {
    return new Blob([pdfOf(compose(state.res, state.form), state.res.name + ' ' + state.res.forms[state.form].join(''), shop.checked)], { type: 'application/pdf' });
  }
  function save(blob, name) {
    var url = URL.createObjectURL(blob), a = doc.createElement('a');
    a.href = url; a.download = name;
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }

  /* the contacts the activity has collected (here: in this page only) */
  function showLeads(fresh) {
    rows.textContent = '';
    state.leads.slice(0, SHOWN).forEach(function (c, i) {
      var li = doc.createElement('li'), who = doc.createElement('b'), where = doc.createElement('span'), tag = doc.createElement('i');
      who.textContent = c.name;
      who.insertAdjacentHTML('beforeend', c.han.split('').map(function (ch) { return tile(ch, 20); }).join(''));
      where.textContent = c.email;
      tag.textContent = t(c.consent ? 'agree' : 'noagree');
      if (!c.consent) tag.className = 'is-no';
      if (i || !fresh) li.style.animation = 'none';
      li.appendChild(who); li.appendChild(where); li.appendChild(tag);
      rows.appendChild(li);
    });
    none.hidden = state.leads.length > 0;
    count.textContent = state.leads.length;
    $('[data-calli="csv"]', root).disabled = !state.leads.length;
  }
  function keep(contact) {                             // one line per e-mail address
    state.leads = state.leads.filter(function (c) { return c.email.toLowerCase() !== contact.email.toLowerCase(); });
    state.leads.unshift(contact);
    showLeads(true);
  }
  function csvOf() {
    var z = function (v) { return (v < 10 ? '0' : '') + v; };
    var when = function (d) { return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
    // a spreadsheet must read every cell as text, never as a formula
    var cell = function (v) { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = '\'' + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var lines = [TEXT[lang].csv].concat(state.leads.slice().reverse().map(function (c) {
      return [c.name, c.han, c.pinyin, c.email, t(c.consent ? 'yes' : 'no'), when(c.at)];
    }));
    return '﻿' + lines.map(function (l) { return l.map(cell).join(';'); }).join('\r\n') + '\r\n';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!tidy(input.value)) { say(note, 'empty', null, 'error'); input.focus(); return; }
    reveal(input.value);
  });
  input.addEventListener('input', function () { if (note.classList.contains('is-error')) say(note, ''); });

  mail.addEventListener('submit', function (e) {
    e.preventDefault();
    if (mail.classList.contains('is-busy')) return;
    var to = email.value.trim();
    if (!state.res) { say(mnote, 'mailFirst', null, 'error'); input.focus(); return; }
    if (!to) { say(mnote, 'mailEmpty', null, 'error'); email.focus(); return; }
    if (to.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) { say(mnote, 'mailBad', null, 'error'); email.focus(); return; }
    var lines = state.res.forms[state.form];
    var contact = { name: state.res.name, han: lines.join(''), pinyin: lines.map(pinyinOf).join(' '), email: to, consent: agree.checked, at: new Date() };
    mail.classList.add('is-busy');
    deliver(contact).then(function (out) {
      keep(contact);
      say(mnote, out && out.demo ? 'mailDemo' : 'mailSent', { email: to }, 'done');
      unlock(to);
    }, function () {
      say(mnote, 'mailFailed', null, 'error');
    }).then(function () { mail.classList.remove('is-busy'); });
  });
  email.addEventListener('input', function () { if (mnote.classList.contains('is-error')) say(mnote, ''); });

  shop.addEventListener('change', function () { if (state.res) showPaper(); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-calli]') : null;
    if (!b || b.disabled) return;
    var what = b.getAttribute('data-calli');
    if (what === 'csv') { save(new Blob([csvOf()], { type: 'text/csv;charset=utf-8' }), 'EXEED-contacts-demonstration.csv'); return; }
    if (!state.res || !state.sent) return;
    var blob = makePdf();
    if (what === 'print') {                            // the browser's PDF viewer prints at true size
      var url = URL.createObjectURL(blob), w = window.open(url, '_blank');
      if (w) { setTimeout(function () { URL.revokeObjectURL(url); }, 120000); say(anote, 'printOpen', null, 'done'); return; }
      URL.revokeObjectURL(url);
    }
    save(blob, fileName());
    say(anote, 'ready', null, 'done');
  });
  // Escape gives the keyboard back to the presentation
  root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && /^(input)$/i.test(e.target.tagName)) e.target.blur(); });

  doc.addEventListener('ben:lang', function (e) {
    lang = e.detail === 'en' ? 'en' : 'fr';
    [note, mnote, anote].forEach(sayAgain);
    if (state.res) { showHan(true); showPaper(); }
    if (D) showLeads(false);
  });

  // the data is fetched when the presentation comes near this slide
  var started = false;
  function start() {
    if (started) return;
    started = true;
    load().then(function () { if (!state.res) return reveal(EXAMPLE, true); }).catch(function () { started = false; });
  }
  doc.addEventListener('ben:live', function (e) { if (e.detail && (e.detail.on || e.detail.near)) start(); });
  unlock('');
  if (!root.hidden) start();

  // for the automated checks
  window.BEN_CALLI = {
    ready: function () { return load().then(function () { return true; }); },
    transliterate: function (s) { return transliterate(s); },
    sounds: sounds,
    spell: function (w) { return write(sounds(w)); },
    pinyin: function (h) { return pinyinOf(h); },
    bookmark: BOOKMARK,
    pdf: function (name, withBleed, formIndex) { var res = transliterate(name); return pdfOf(compose(res, formIndex || 0), res.name, !!withBleed); },
    svg: function (name, formIndex) { return svgOf(compose(transliterate(name), formIndex || 0)); },
    glyph: function (ch) { return D.zh.glyphs[ch]; },
    chars: function () { return Object.keys(D.zh.glyphs); },
    names: function () { return D.names; },
    contacts: function () { return state.leads.slice(); },
    csv: csvOf
  };
})();
