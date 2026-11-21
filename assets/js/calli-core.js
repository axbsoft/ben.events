/* benevents agency — calligraphy, the engine: a first name written in Chinese characters, in
   Japanese or in Korean script, and laid out on a printed model (a bookmark). Vanilla JS, no dependencies.

   Used by the calligraphy app (calligraphy.html, assets/js/calli-app.js) and by the page a visitor
   opens from the e-mail they receive (calligraphy/card.html, assets/js/calli-card.js).
   The slide of the M-Automotiv presentation has its own, older copy (assets/js/calligraphy.js).

   1. The name. It is looked up in a list of established forms; a name that is not listed is
      written from its sounds (always the sound of the name, never a meaning).
   2. The page. The characters are drawn from the outlines of a brush typeface, the same outlines
      on screen, in the PDF and on paper: what is printed never depends on installed fonts.

   Data: assets/calligraphy/ (built by tools/calligraphy/build_app.py)
     zh.json, ja.json, ko.json   the names, the tables and how many files hold the outlines
     zh-0.json … ja-0.json … ko-0.json …   the outlines, a few characters per file, fetched when needed
     latin.json           the letters of the visitor's own name
     models.json          the printed models (tools/calligraphy/add_model.mjs adds one)
     templates/           their pictures, printed as the background
     offers.json          the brand offers a QR code can lead to (tools/calligraphy/add_offer.mjs)
   A QR code is drawn by assets/js/qrcode.js (MIT, see assets/calligraphy/NOTICE.txt). */
(function (root) {
  'use strict';

  /* ------------------------------------------------------------------
     THE PRINTED MODELS (assets/calligraphy/models.json: a client's artwork is added there, with
     tools/calligraphy/add_model.mjs, without touching this file)
     In mm from the top left corner: size (w, h); han: the centre of the characters and box: the
     room around it (width, height); name: the size of the visitor's own name and nameMax its
     longest width; line: the rule the name sits on (its height, the gap between its two dashes,
     the smallest size before the name moves under the rule); edge: the paper colour (the bleed);
     ink: the colour of everything drawn on it. brand: who the visitor agrees to hear from, when
     the event has not said otherwise.
     qr (optional): where a QR code can be printed: x, y the centre of its plate and plate its side
     (border and paper colour the plate when the picture needs it). offer (optional): the QR code
     the model starts with (assets/calligraphy/offers.json).
     ------------------------------------------------------------------ */
  var TEMPLATES = {};
  var OFFERS = {};
  // where the short link of a QR code lives: it is printed, so it never follows the host this page is served from
  var SITE = 'https://www.ben.events';
  // the languages a name can be written in, in the order they are offered
  var SCRIPTS = {
    zh: { label: { fr: 'Chinois', en: 'Chinese' }, of: { fr: 'calligraphie chinoise', en: 'Chinese calligraphy' }, into: { fr: 'en caractères chinois', en: 'in Chinese characters' }, own: '中文' },
    ja: { label: { fr: 'Japonais', en: 'Japanese' }, of: { fr: 'calligraphie japonaise', en: 'Japanese calligraphy' }, into: { fr: 'en japonais', en: 'in Japanese' }, own: '日本語' },
    ko: { label: { fr: 'Coréen', en: 'Korean' }, of: { fr: 'calligraphie coréenne', en: 'Korean calligraphy' }, into: { fr: 'en coréen', en: 'in Korean' }, own: '한국어' }
  };
  var MAX_LENGTH = 24, MAX_CHARS = 12;
  var BLEED = 3, MARKS = 6;         // mm, print-shop version
  /* ------------------------------------------------------------------ */

  var BASE = '/assets/calligraphy/';
  var D = {}, LA = null, G = { zh: {}, ja: {}, ko: {} }, got = {}, pics = {};

  /* ==================================================================
     1. THE NAME, TIDIED
     ================================================================== */
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

  /* ==================================================================
     2. LETTERS TO SOUNDS
     Consonants: b p d t g k v w f z ts s zh sh j ch h m n l r y. Vowels: a e er i o u ai au.
     Spelling habits are those of French, and of Arabic names as they are written in French
     (ch = sh, ou = u, final e silent…). mode 'ko' or 'ja': the few habits that differ when
     the sounds are to be written in Korean or in Japanese (ei is heard as e-i, ou before a vowel
     stays a vowel; in Korean kh is heard as k).
     ================================================================== */
  var VOWELS = { a: 1, e: 1, er: 1, i: 1, o: 1, u: 1, ai: 1, au: 1 };
  function sounds(word, mode) {
    var ko = mode === 'ko' || mode === 'ja';
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
        if (c3 === 'chr' && i === 0 && /^[iy]/.test(s.slice(3))) { out.push('k'); i += 2; continue; }     // Christine; but Achraf, Bouchra
        if (c2 === 'ch' || c2 === 'sh') { out.push('sh'); i += 2; continue; }
        if (c2 === 'kh') { out.push(mode === 'ko' ? 'kh' : 'h'); i += 2; continue; }
        if (c2 === 'gh') { out.push('g'); i += 2; continue; }
        if (c2 === 'dj') { out.push('j'); i += 2; continue; }
        if (c2 === 'dh') { out.push('d'); i += 2; continue; }
        if (c2 === 'th') { out.push('t'); i += 2; continue; }
        if (c2 === 'ph') { out.push('f'); i += 2; continue; }
        if (c2 === 'ck' || c2 === 'cq') { out.push('k'); i += 2; continue; }
        if (c2 === 'qu' && isV(at(2))) { out.push('k'); i += 2; continue; }
        if (c2 === 'gu' && 'eiyE'.indexOf(at(2)) > -1 && at(2) !== '') { out.push('g'); i += 2; continue; }
        if (c2 === 'gn' && isV(at(2))) { out.push('n', 'i', 'y'); i += 2; continue; }
        if (mode === 'ko' && c2 === 'ng' && i === n - 2) { out.push('ng'); i += 2; continue; }
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
      if (c2 === 'ou') { out.push(isV(at(2)) && !ko ? 'w' : 'u'); i += 2; continue; }
      if (c2 === 'oo') { out.push('u'); i += 2; continue; }
      if (c2 === 'ee') { out.push('i'); i += 2; continue; }
      if (c2 === 'aa') { out.push('a'); i += 2; continue; }
      if (c2 === 'oi' || (c2 === 'oy' && !isV(at(2)))) {
        if (ko) { out.push(out.length && !VOWELS[last()] ? 'u' : 'w', 'a'); i += 2; continue; }
        if (out.length && !VOWELS[last()]) out.push('u');
        out.push('w', 'a'); i += 2; continue;
      }
      if (c2 === 'au') { out.push('o'); i += 2; continue; }
      if (c2 === 'ai' || (c2 === 'ay' && !isV(at(2)))) { out.push('ai'); i += 2; continue; }
      if (c2 === 'ei' || (c2 === 'ey' && !isV(at(2)))) { if (ko) out.push('e', 'i'); else out.push('e'); i += 2; continue; }
      if (c2 === 'eu') { out.push('er'); i += 2; continue; }
      if (c === 'e' && i === n - 1 && others) {             // a final e is silent, except after o (Zoe)
        if (s.charAt(i - 1) === 'o') out.push('e');
        i++; continue;
      }
      out.push(c === 'E' ? 'e' : c === 'I' ? 'i' : c); i++;
    }
    return out;
  }

  /* ==================================================================
     3. CHINESE: sounds to characters, one syllable at a time
     ================================================================== */
  var NASAL = { a: 'an', e: 'en', er: 'en', i: 'in', o: 'ong', u: 'un' };
  function writeZh(tok) {
    var Z = D.zh, T = Z.table, out = '', i = 0, n = tok.length, before = '';
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
        out += (c === 'l' && i >= n) ? Z.finalL : T._[c];
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
      var p = D.zh.pinyin[han.charAt(i)] || '';
      if (s && /^[aāáǎàoōóǒòeēéěè]/.test(p)) s += '’';
      s += p;
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  // "servant of …": Abd, then the article (el, or its last letter taken by the next sound), then the name
  function abdZh(k) {
    var m = /^abd(?:e|ou|u|a|o)?(l|r|s|n|d|t|z)?(.*)$/.exec(k);
    if (!m) return '';
    var rest = m[2], first = D.zh.names.abdelkader[0];
    if (m[1] === 'l') { if (rest.length < 2) return ''; return first.slice(0, 4) + writeZh(sounds(rest)); }
    if (m[1]) rest = rest.charAt(0) === m[1] ? rest : m[1] + rest;
    if (rest && rest.length < 3) return '';
    return first.slice(0, 3) + (rest ? writeZh(sounds(rest)) : '');
  }
  function wordZh(w) {
    var Z = D.zh, hit = Z.names[keyOf(w)];
    if (hit) return { forms: hit.slice(), known: true };
    var han = (/^abd/.test(keyOf(w)) && abdZh(keyOf(w))) || writeZh(sounds(w));
    if (!han) return null;
    var fem = han.split('').map(function (c) { return Z.feminine[c] || c; }).join('');
    return { forms: fem !== han ? [han, fem] : [han], known: false };
  }

  /* ==================================================================
     4. KOREAN: sounds to syllable blocks
     Korean script is an alphabet: each block holds a consonant, a vowel and, sometimes, a closing
     consonant. A consonant with no vowel after it takes the neutral vowel (Omar: 오마르) or closes
     the block before it (Hassan: 하산, Karim: 카림, Bilal: 빌랄). The habits are those of Korean
     newspapers for French and Arabic names (National Institute of Korean Language).
     ================================================================== */
  //            ㄱ0 ㄴ2 ㄷ3 ㄹ5 ㅁ6 ㅂ7 ㅅ9 ㅇ11 ㅈ12 ㅊ14 ㅋ15 ㅌ16 ㅍ17 ㅎ18
  var KL = { '': 11, b: 7, p: 17, d: 3, t: 16, g: 0, k: 15, kh: 15, v: 7, f: 17, z: 12, ts: 14, s: 9, zh: 12, sh: 9, j: 12, ch: 14, h: 18, m: 6, n: 2, l: 5, r: 5 };
  var KV = { a: 0, e: 5, er: 11, i: 20, o: 8, u: 13 };            // 아 에 외 이 오 우
  var KY = { a: 2, e: 7, er: 6, i: 20, o: 12, u: 17 };            // 야 예 여 이 요 유 (after y, and after sh: 샤 셰 쇼 슈)
  var KW = { a: 9, e: 15, er: 14, i: 16, o: 14, u: 13 };          // 와 웨 워 위 워 우
  var EU = 18, KT = { k: 1, n: 4, l: 8, m: 16, p: 17, b: 17, ng: 21 };
  var PLAIN = { 2: 0, 7: 5, 6: 4, 12: 8, 17: 13, 9: 0, 15: 5, 14: 8, 16: 20, 11: 5 };    // a simpler vowel, when a block does not exist in the typeface
  var haveKo = null;
  function block(l, v, t) { return String.fromCharCode(0xAC00 + (l * 21 + v) * 28 + (t || 0)); }
  function drawable(ch) {
    if (!D.ko || !D.ko.have) return true;
    if (!haveKo) { haveKo = {}; for (var i = 0; i < D.ko.have.length; i++) haveKo[D.ko.have.charAt(i)] = 1; }
    return !!haveKo[ch];
  }
  var CLOSER = { 1: 15, 4: 2, 8: 5, 16: 6, 17: 17, 21: 0 };       // a closing consonant written apart: its own block, with the neutral vowel
  function writeKo(tok) {
    var out = [], i = 0, n = tok.length;
    var push = function (l, v, soft) { out.push({ l: l, v: v, t: 0, soft: !!soft }); };
    var prev = function () { return out[out.length - 1]; };
    var open = function () { return out.length > 0 && prev().t === 0; };
    var vowel = function (c, glide, v) {
      var med = function (x) { return glide === 'y' || c === 'sh' ? KY[x] : glide === 'w' ? KW[x] : KV[x]; };
      // after "ou", the glide of "oi" is already written: Benoît, François
      if (glide === 'w' && open() && prev().v === 13 && !prev().soft) glide = '';
      if (v === 'ai') { push(KL[c], med('a')); push(11, 20); return; }      // 아이
      if (v === 'au') { push(KL[c], med('a')); push(11, 13); return; }      // 아우
      push(KL[c], med(v));
    };
    while (i < n) {
      var c = tok[i], nx = tok[i + 1];
      if (VOWELS[c]) { vowel('', '', c); i++; continue; }
      if (c === 'y' || c === 'w') {
        if (nx !== undefined && VOWELS[nx]) { vowel('', c, nx); i += 2; }
        else { push(11, c === 'y' ? 20 : 13); i++; }
        continue;
      }
      if (KL[c] === undefined && c !== 'ng') return '';
      if (c !== 'ng' && nx !== undefined && VOWELS[nx]) {
        if (c === 'l' && open()) prev().t = 8;               // l between two vowels is written twice: Ali 알리, Bilal 빌랄
        vowel(c, '', nx); i += 2; continue;
      }
      // a consonant on its own: before another consonant, or at the end of the name
      var end = i === n - 1, firm = open() && !prev().soft;
      if (c === 'ng') { if (firm) prev().t = 21; else push(0, EU, true); }
      else if (c === 'n' || c === 'm') {
        if (open()) prev().t = KT[c];
        else if (!out.length) { push(11, EU, true); prev().t = KT[c]; }      // Mbarek 음바레크
        else push(KL[c], EU, true);
      }
      else if (c === 'l') { if (open()) prev().t = 8; else push(5, EU, true); }
      else if ((c === 'k' || c === 'p') && !end && firm && !/^(l|r|m|n|w|y|h)$/.test(nx)) prev().t = KT[c];   // Victor 빅토르, Maxime 막심
      else if (c === 'b' && !end && firm && nx === 'd') prev().t = 17;       // Abdel 압델
      else if (c === 'sh') push(9, 17, true);                               // Achraf 아슈라프
      else if (c === 'zh') push(12, end ? 13 : EU, true);                   // Serge 세르주
      else if (c === 'j') push(12, end ? 20 : EU, true);
      else if (c === 'ch') push(14, 20, true);
      else push(KL[c], EU, true);
      i++;
    }
    // a block the typeface does not hold: a simpler vowel, or its closing consonant written apart
    var text = '';
    for (var k = 0; k < out.length; k++) {
      var b = out[k], ch = block(b.l, b.v, b.t);
      if (!drawable(ch) && PLAIN[b.v] !== undefined && drawable(block(b.l, PLAIN[b.v], b.t))) ch = block(b.l, PLAIN[b.v], b.t);
      if (!drawable(ch) && b.t) {
        ch = block(b.l, b.v, 0);
        if (!drawable(ch) && PLAIN[b.v] !== undefined) ch = block(b.l, PLAIN[b.v], 0);
        ch += block(CLOSER[b.t], EU, 0);
      }
      for (var q = 0; q < ch.length; q++) if (!drawable(ch.charAt(q))) return '';
      text += ch;
    }
    return text;
  }
  // how a name written in Korean is said, block by block (Revised Romanization)
  var RL = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
  var RV = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
  var RT = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
  function romanOf(text) {
    var parts = [];
    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i) - 0xAC00;
      if (code < 0 || code > 11171) continue;
      var l = Math.floor(code / 588), v = Math.floor((code % 588) / 28), t = code % 28, s = RL[l] + RV[v] + RT[t];
      if (l === 5 && parts.length && /l$/.test(parts[parts.length - 1])) s = 'l' + s.slice(1);     // 알리: al-li
      parts.push(s);
    }
    return parts.join('-');
  }
  function wordKo(w) {
    var hit = D.ko.names[keyOf(w)];
    if (hit) return { forms: hit.slice(), known: true };
    var text = writeKo(sounds(w, 'ko'));
    if (!text) return null;
    return { forms: [text], known: false };
  }

  /* ==================================================================
     4b. JAPANESE: sounds to katakana
     Foreign names are written in katakana, one sign per syllable. A consonant with no vowel after
     it takes the sign of its u-row (Omar: オマル, Achraf: アシュラフ; t and d take o: モハメド),
     n closes a syllable as ン (Yassine: ヤシン). Long vowels are not guessed: the names that
     need one are listed (Paul: ポール).
     ================================================================== */
  var JR = {                        // a i u e o
    '': ['ア', 'イ', 'ウ', 'エ', 'オ'], k: ['カ', 'キ', 'ク', 'ケ', 'コ'], g: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'], s: ['サ', 'シ', 'ス', 'セ', 'ソ'],
    z: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'], t: ['タ', 'ティ', 'トゥ', 'テ', 'ト'], d: ['ダ', 'ディ', 'ドゥ', 'デ', 'ド'], n: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    h: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'], b: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'], p: ['パ', 'ピ', 'プ', 'ペ', 'ポ'], m: ['マ', 'ミ', 'ム', 'メ', 'モ'],
    r: ['ラ', 'リ', 'ル', 'レ', 'ロ'], f: ['ファ', 'フィ', 'フ', 'フェ', 'フォ'], v: ['ヴァ', 'ヴィ', 'ヴ', 'ヴェ', 'ヴォ'],
    sh: ['シャ', 'シ', 'シュ', 'シェ', 'ショ'], zh: ['ジャ', 'ジ', 'ジュ', 'ジェ', 'ジョ'], ch: ['チャ', 'チ', 'チュ', 'チェ', 'チョ'],
    ts: ['ツァ', 'ツィ', 'ツ', 'ツェ', 'ツォ'], y: ['ヤ', 'イ', 'ユ', 'イェ', 'ヨ'], w: ['ワ', 'ウィ', 'ウ', 'ウェ', 'ウォ']
  };
  JR.l = JR.r; JR.j = JR.zh;
  var JA_ALONE = { k: 'ク', g: 'グ', s: 'ス', z: 'ズ', t: 'ト', d: 'ド', h: 'フ', b: 'ブ', p: 'プ', r: 'ル', l: 'ル', f: 'フ', v: 'ヴ', sh: 'シュ', zh: 'ジュ', j: 'ジュ', ch: 'チ', ts: 'ツ' };
  var JV = { a: 0, i: 1, u: 2, e: 3, o: 4, er: 2 };
  function writeJa(tok) {
    var out = '', i = 0, n = tok.length;
    var kana = function (c, v) {
      if (v === 'ai') return JR[c][0] + 'イ';
      if (v === 'au') return JR[c][0] + 'ウ';
      return JR[c][JV[v]];
    };
    while (i < n) {
      var c = tok[i], nx = tok[i + 1], hasV = nx !== undefined && VOWELS[nx];
      if (VOWELS[c]) { out += kana('', c); i++; continue; }
      if (c === 'y' || c === 'w') {
        if (hasV) { out += c === 'y' && nx === 'e' && tok[i - 1] === 'i' ? 'エ' : kana(c, nx); i += 2; }     // Meryem メリエム
        else { out += c === 'y' ? 'イ' : 'ウ'; i++; }
        continue;
      }
      if (!JR[c]) return '';
      if (hasV) { out += kana(c, nx); i += 2; continue; }
      // a consonant on its own
      if (c === 'n') out += 'ン';
      else if (c === 'm') out += out && (nx === 'b' || nx === 'p' || nx === 'm') ? 'ン' : 'ム';
      else out += JA_ALONE[c];
      i++;
    }
    for (var q = 0; q < out.length; q++) if (D.ja && D.ja.have && D.ja.have.indexOf(out.charAt(q)) < 0) return '';
    return out;
  }
  // how a name written in katakana is said (Hepburn)
  var JK = { ア: 'a', イ: 'i', ウ: 'u', エ: 'e', オ: 'o', カ: 'ka', キ: 'ki', ク: 'ku', ケ: 'ke', コ: 'ko', ガ: 'ga', ギ: 'gi', グ: 'gu', ゲ: 'ge', ゴ: 'go',
    サ: 'sa', シ: 'shi', ス: 'su', セ: 'se', ソ: 'so', ザ: 'za', ジ: 'ji', ズ: 'zu', ゼ: 'ze', ゾ: 'zo', タ: 'ta', チ: 'chi', ツ: 'tsu', テ: 'te', ト: 'to',
    ダ: 'da', ヂ: 'ji', ヅ: 'zu', デ: 'de', ド: 'do', ナ: 'na', ニ: 'ni', ヌ: 'nu', ネ: 'ne', ノ: 'no', ハ: 'ha', ヒ: 'hi', フ: 'fu', ヘ: 'he', ホ: 'ho',
    バ: 'ba', ビ: 'bi', ブ: 'bu', ベ: 'be', ボ: 'bo', パ: 'pa', ピ: 'pi', プ: 'pu', ペ: 'pe', ポ: 'po', マ: 'ma', ミ: 'mi', ム: 'mu', メ: 'me', モ: 'mo',
    ヤ: 'ya', ユ: 'yu', ヨ: 'yo', ラ: 'ra', リ: 'ri', ル: 'ru', レ: 're', ロ: 'ro', ワ: 'wa', ヲ: 'o', ン: 'n', ヴ: 'vu' };
  var JSMALL = { ァ: 'a', ィ: 'i', ゥ: 'u', ェ: 'e', ォ: 'o', ャ: 'ya', ュ: 'yu', ョ: 'yo' };
  var LONG = { a: 'ā', i: 'ī', u: 'ū', e: 'ē', o: 'ō' };
  function romajiOf(text) {
    var s = '', twice = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i), nx = text.charAt(i + 1), r;
      if (ch === 'ッ') { twice = true; continue; }
      if (ch === 'ー') { var lastV = s.slice(-1); if (LONG[lastV]) s = s.slice(0, -1) + LONG[lastV]; continue; }
      r = JK[ch];
      if (!r) continue;
      if (JSMALL[nx]) {             // a sign and its small companion: シャ sha, ティ ti, ファ fa, ウィ wi, リュ ryu
        var sm = JSMALL[nx], head = r.slice(0, -1);
        if (sm.length === 2) r = (/^(sh|j|ch)$/.test(head) ? head : head + 'y') + sm.slice(1);
        else r = (ch === 'フ' ? 'f' : ch === 'ウ' ? 'w' : ch === 'イ' ? 'y' : ch === 'ツ' ? 'ts' : ch === 'ヴ' ? 'v' : ch === 'ク' ? 'kw' : ch === 'グ' ? 'gw' : head) + sm;
        i++;
      }
      if (twice) { r = r.charAt(0) + r; twice = false; }
      s += r;
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function wordJa(w) {
    var hit = D.ja.names[keyOf(w)];
    if (hit) return { forms: hit.slice(), known: true };
    var text = writeJa(sounds(w, 'ja'));
    if (!text) return null;
    return { forms: [text], known: false };
  }

  /* ==================================================================
     5. THE WHOLE NAME: { name, script, forms: [[line, …], …], known } or { error }
     ================================================================== */
  function transliterate(script, raw) {
    var S = D[script];
    if (!S) return { error: 'failed' };
    var name = tidy(raw);
    if (!name) return { error: 'empty' };
    if (!valid(name)) return { error: 'letters' };
    if (REFUSED.test(keyOf(name))) return { error: 'refused' };
    if (keyOf(name).length < 2) return { error: 'empty' };
    var word = script === 'ko' ? wordKo : script === 'ja' ? wordJa : wordZh;
    // the Arabic article between two names is not written (Nour El Houda)
    var whole = S.names[keyOf(name)], words = name.split(/[ \-]/).filter(function (w, i, all) { return !(all.length > 2 && i > 0 && i < all.length - 1 && /^(el|al)$/i.test(w)); }), res;
    if (whole) res = { known: true, forms: whole.map(function (f) { return [f]; }) };
    else {
      var each = words.map(word);
      if (each.some(function (e) { return !e; })) return { error: 'refused' };
      res = { known: each.every(function (e) { return e.known; }), forms: [each.map(function (e) { return e.forms[0]; })] };
      if (each.length === 1) res.forms = each[0].forms.map(function (f) { return [f]; });
    }
    res.name = shown(name);
    res.script = script;
    res.forms = res.forms.filter(function (f) { return f.join('').length <= MAX_CHARS; });
    if (!res.forms.length) return { error: 'refused' };
    return res;
  }
  // how the characters are said: pinyin, or the Japanese signs or Korean blocks in Latin letters
  function reading(script, lines) {
    return lines.map(script === 'ko' ? romanOf : script === 'ja' ? romajiOf : pinyinOf).join(' ');
  }
  // a name and its characters as they came back from a link: only characters this engine can draw
  function fromChars(script, name, chars) {
    name = tidy(name);
    if (!D[script] || !name || !valid(name) || REFUSED.test(keyOf(name))) return null;
    var lines = String(chars || '').split(/[\s·.]+/).filter(Boolean);
    var ok = script === 'ko' ? /^[가-힣]+$/ : script === 'ja' ? /^[ァ-ヴー]+$/ : /^[一-鿿]+$/;
    if (!lines.length || lines.length > 3 || lines.join('').length > MAX_CHARS || !lines.every(function (l) { return ok.test(l); })) return null;
    return { name: shown(name), script: script, forms: [lines], known: true };
  }

  /* ==================================================================
     6. THE FILES
     ================================================================== */
  function get(file, binary) {
    return fetch(BASE + file).then(function (r) { if (!r.ok) throw new Error(file); return binary ? r.arrayBuffer() : r.json(); });
  }
  // the registry of printed models (filled in place: TEMPLATES stays the same object)
  function models() {
    if (!got.models) {
      got.models = get('models.json').then(function (j) {
        Object.keys(j.models || {}).forEach(function (id) { TEMPLATES[id] = j.models[id]; });
        return TEMPLATES;
      });
      got.models.catch(function () { delete got.models; });
    }
    return got.models;
  }
  // the brand offers a QR code can lead to; without them a QR code is simply not offered
  function offers() {
    if (!got.offers) {
      got.offers = get('offers.json').then(function (j) { OFFERS = j.offers || {}; return OFFERS; }, function () { delete got.offers; return OFFERS; });
    }
    return got.offers;
  }
  // what a QR code carries for an offer: our short link (it counts the scan), and the words printed under it
  function qrOf(slug) {
    var o = slug && OFFERS[slug];
    if (!o) return null;
    return { slug: slug, url: SITE + '/o/' + slug, caption: [o.label && o.label.fr, o.label && o.label.en].filter(Boolean).slice(0, 2) };
  }
  // the names and tables of a script, and the Latin letters
  function load(script) {
    var key = 'meta:' + script;
    if (!got[key]) {
      got[key] = Promise.all([D[script] ? null : get(script + '.json'), LA ? null : get('latin.json'), models()]).then(function (r) {
        if (r[0]) D[script] = r[0];
        if (r[1]) LA = r[1];
        return true;
      });
      got[key].catch(function () { delete got[key]; });
    }
    return got[key];
  }
  // the file that holds a character: a sum that spreads neighbours over the files (the same as in build_app.py)
  function part(script, ch) { return ((Math.imul(ch.charCodeAt(0), 0x9E3779B1) >>> 0) >>> 16) % D[script].parts; }
  function fetchPart(script, k) {
    var key = script + ':' + k;
    if (!got[key]) {
      got[key] = get(script + '-' + k + '.json?v=' + D[script].v).then(function (set) {
        Object.keys(set).forEach(function (ch) { G[script][ch] = set[ch]; });
        return true;
      });
      got[key].catch(function () { delete got[key]; });
    }
    return got[key];
  }
  // the outlines of these characters, ready to draw
  function need(script, text) {
    return load(script).then(function () {
      var parts = {};
      for (var i = 0; i < text.length; i++) if (!G[script][text.charAt(i)]) parts[part(script, text.charAt(i))] = 1;
      return Promise.all(Object.keys(parts).map(function (k) { return fetchPart(script, +k); }));
    }).then(function () { return true; });
  }
  // every outline of a script, for a day without a network; done(part number, of how many) after each file
  function warm(script, done) {
    return load(script).then(function () {
      var n = D[script].parts, at = 0, all = [];
      for (var k = 0; k < n; k++) all.push(fetchPart(script, k).then(function () { at++; if (done) done(at, n); }));
      return Promise.all(all);
    }).then(function () { return true; });
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
  // the picture of a printed model
  function picture(id) {
    return models().then(function () {
      var tp = TEMPLATES[id];
      if (!tp) throw new Error('template');
      if (!pics[id]) {
        pics[id] = get(tp.image, true).then(function (buf) {
          var bytes = new Uint8Array(buf), px = jpegSize(bytes);
          if (!px) throw new Error(tp.image);
          tp.pic = { bytes: bytes, px: px, url: URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' })) };
          return tp.pic;
        });
        pics[id].catch(function () { delete pics[id]; });
      }
      return pics[id];
    });
  }

  /* ==================================================================
     7. DRAWING: outlines, the model, the page
     ================================================================== */
  // an outline as the build writes it (M, L, Q, C, Z with absolute numbers) as a list of segments
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
    var s = size / LA.upm, x = 0, list = [], prev = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i), g = LA.glyphs[ch] || LA.glyphs[strip(ch)];
      if (!g) continue;
      if (prev && LA.kern[prev + ch]) x += LA.kern[prev + ch] * s;
      if (g[1]) list.push(move(parsePath(g[1]), [s, 0, 0, s, x, -LA.top * s]));
      x += g[0] * s;
      prev = ch;
    }
    return { list: list, width: x };
  }
  var parsed = { zh: {}, ja: {}, ko: {} };
  function glyph(script, ch) { return parsed[script][ch] || (parsed[script][ch] = parsePath(G[script][ch] || '')); }

  // a rectangle with round corners, as segments
  function rrect(x, y, w, h, r) {
    return [['M', x + r, y], ['L', x + w - r, y], ['Q', x + w, y, x + w, y + r], ['L', x + w, y + h - r], ['Q', x + w, y + h, x + w - r, y + h],
      ['L', x + r, y + h], ['Q', x, y + h, x, y + h - r], ['L', x, y + r], ['Q', x, y, x + r, y], ['Z']];
  }
  // A QR code on a card of paper, with the words of the offer under it (one line for each language), so that
  // they stay readable on any picture. The modules are one path of rectangles, a little overlapped so that no
  // hairline shows between two of them. The square the code sits in holds the quiet zone of four modules the
  // scanners ask for; z.plate is its side, and the card is as wide as the words need, at least as wide as the square.
  function qrShapes(tp, q) {
    var z = tp.qr;
    if (!z || !q || !q.url || !root.qrcode) return null;
    var code = root.qrcode(0, 'M');
    code.addData(q.url);
    code.make();
    var n = code.getModuleCount(), quiet = 4, side = z.plate, m = side / (n + 2 * quiet), x0 = z.x - side / 2, y0 = z.y - side / 2, e = .012, ring = .35;
    // the words first: how wide and how tall the card must be
    var room = z.captionWidth || 44, words = (q.caption || []).slice(0, 2).map(function (text) {
      var fs = 2.4, run = letters(text, fs);
      if (run.width > room) { fs *= room / run.width; run = letters(text, fs); }
      return run;
    });
    var cardW = Math.max(side, words.reduce(function (w, run) { return Math.max(w, run.width); }, 0) + 4.4), cardH = side + (words.length ? 1.6 + words.length * 3.2 : 0);
    var shapes = [{ segs: rrect(z.x - cardW / 2 - ring, y0 - ring, cardW + 2 * ring, cardH + 2 * ring, 1.6), fill: z.border || [185, 137, 47] },
      { segs: rrect(z.x - cardW / 2, y0, cardW, cardH, 1.25), fill: z.paper || [253, 250, 244] }];
    var runs = [];
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (!code.isDark(r, c)) continue;
        var from = c;
        while (c + 1 < n && code.isDark(r, c + 1)) c++;
        var xa = x0 + (quiet + from) * m - e, xb = x0 + (quiet + c + 1) * m + e, ya = y0 + (quiet + r) * m - e, yb = y0 + (quiet + r + 1) * m + e;
        runs.push(['M', xa, ya], ['L', xb, ya], ['L', xb, yb], ['L', xa, yb], ['Z']);
      }
    }
    shapes.push({ segs: runs });
    words.forEach(function (run, i) {
      var base = y0 + side + 1.2 + (i + 1) * 3.2 - 1.2;
      run.list.forEach(function (g) { shapes.push({ segs: move(g, [1, 0, 0, 1, z.x - run.width / 2, base]) }); });
    });
    return { shapes: shapes, box: [z.x - cardW / 2 - ring, y0 - ring, z.x + cardW / 2 + ring, y0 + cardH + ring], modules: n, module: m };
  }

  // ---- the model: what is drawn on its picture, in mm; opts.qr: { url, caption } for a QR code
  function compose(id, res, form, opts) {
    var tp = TEMPLATES[id], script = res.script, upm = D[script].upm, lines = res.forms[form || 0], total = lines.join('');
    // the size of a character, in mm, for these columns of characters
    var size = function (ls) {
      var longest = Math.max.apply(null, ls.map(function (l) { return l.length; }));
      return Math.min(tp.box[1] / (longest * .98), tp.box[0] / (1 + (ls.length - 1) * 1.06));
    };
    // one column, or two when that lets the characters be larger
    if (lines.length === 1 && total.length > 3) {
      var half = Math.ceil(total.length / 2), small = /^[ァィゥェォャュョッー]/;
      if (script === 'ja' && small.test(total.slice(half))) half += half + 1 < total.length ? 1 : -1;       // a column never starts with a small sign
      var two = [total.slice(0, half), total.slice(half)];
      if (size(two) > size(lines) * 1.12 && !(script === 'ja' && small.test(two[1]))) lines = two;
    }
    var em = size(lines), s = em / upm, gap = em * 1.06, ink = [];
    lines.forEach(function (line, li) {                      // upright columns, read from right to left
      for (var i = 0; i < line.length; i++) {
        var x = -(li - (lines.length - 1) / 2) * gap, y = (i - (line.length - 1) / 2) * em * .98;
        ink.push(move(glyph(script, line.charAt(i)), [s, 0, 0, s, x - em / 2, y - em / 2]));
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
    var qr = qrShapes(tp, opts && opts.qr);
    if (qr) qr.shapes.forEach(function (sh) { shapes.push(sh); });
    return { w: tp.w, h: tp.h, shapes: shapes, paper: tp.edge, ink: tp.ink, pic: tp.pic, qr: qr ? { url: opts.qr.url, box: qr.box, modules: qr.modules, module: qr.module } : null };
  }

  // ---- the page as SVG (what is shown) and as PDF (what is printed): the same shapes
  var f3 = function (v) { return (Math.round(v * 1000) / 1000).toString(); };
  function pathOf(segs) { return segs.map(function (s) { return s[0] + s.slice(1).map(f3).join(' '); }).join(''); }
  var colour = function (col) { return 'rgb(' + col.join(',') + ')'; };
  function svgOf(page, cls) {
    var body = page.shapes.map(function (sh, i) {
      return '<path' + (sh.ink ? ' class="ink" style="--i:' + i + '"' : '') + ' fill="' + colour(sh.fill || page.ink) + '" d="' + pathOf(sh.segs) + '"/>';
    }).join('');
    return '<svg class="' + (cls || 'calli-page') + '" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + page.w + ' ' + page.h + '" role="img">' +
      '<image href="' + page.pic.url + '" x="0" y="0" width="' + page.w + '" height="' + page.h + '" preserveAspectRatio="none"/>' + body + '</svg>';
  }
  // one character drawn from its outline, for the screen (no system font involved)
  function tile(script, ch, pad) {
    var b = bounds([glyph(script, ch)]), upm = D[script].upm;
    if (b[0] > b[2]) return '';
    return '<svg viewBox="' + (b[0] - pad) + ' 0 ' + (b[2] - b[0] + 2 * pad) + ' ' + upm + '" aria-hidden="true"><path d="' + G[script][ch] + '"/></svg>';
  }
  // the page as a picture, for a phone to keep: resolves with a canvas
  function canvasOf(page, pxPerMm) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas'), k = pxPerMm || 12;
        cv.width = Math.round(page.w * k); cv.height = Math.round(page.h * k);
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
        ctx.setTransform(k, 0, 0, k, 0, 0);
        page.shapes.forEach(function (sh) { ctx.fillStyle = colour(sh.fill || page.ink); ctx.fill(new Path2D(pathOf(sh.segs))); });
        resolve(cv);
      };
      img.onerror = function () { reject(new Error('picture')); };
      img.src = page.pic.url;
    });
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
    var now = rgb(page.ink);
    c.push(now + ' rg');
    page.shapes.forEach(function (sh) {
      var ops = [], x = 0, y = 0, want = rgb(sh.fill || page.ink);
      if (want !== now) { c.push(want + ' rg'); now = want; }
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
    var when = new Date(), z = function (v) { return (v < 10 ? '0' : '') + v; };
    var stamp = 'D:' + when.getUTCFullYear() + z(when.getUTCMonth() + 1) + z(when.getUTCDate()) + z(when.getUTCHours()) + z(when.getUTCMinutes()) + z(when.getUTCSeconds()) + 'Z';
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

  // everything a name needs to be drawn on a model: its outlines and the picture of the model (opts.qr: see compose)
  function ready(id, res, form, opts) {
    var lines = res.forms[form || 0];
    return Promise.all([need(res.script, lines.join('')), picture(id)]).then(function () { return compose(id, res, form, opts); });
  }
  // the models of a script, in the order they are offered
  function modelsOf(script) { return Object.keys(TEMPLATES).filter(function (id) { return TEMPLATES[id].script === script; }); }

  root.BEN_CALLI_CORE = {
    BASE: BASE, SITE: SITE, TEMPLATES: TEMPLATES, SCRIPTS: SCRIPTS, BLEED: BLEED, MAX_LENGTH: MAX_LENGTH,
    load: load, models: models, offers: offers, qrOf: qrOf, need: need, warm: warm, picture: picture, ready: ready, modelsOf: modelsOf,
    tidy: tidy, strip: strip, transliterate: transliterate, fromChars: fromChars, reading: reading,
    compose: compose, svgOf: svgOf, pdfOf: pdfOf, canvasOf: canvasOf, tile: tile,
    // for the automated checks, and for the build to try the engine without a browser
    _: { sounds: sounds, writeKo: writeKo, writeJa: writeJa, writeZh: writeZh, romanOf: romanOf, romajiOf: romajiOf, keyOf: keyOf, data: D, set: function (script, data, latin) { D[script] = data; if (latin) LA = latin; haveKo = null; }, glyphs: G }
  };
})(typeof window !== 'undefined' ? window : globalThis);
