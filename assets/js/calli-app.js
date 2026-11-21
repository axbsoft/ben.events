/* benevents agency — the calligraphy app (calligraphy.html). Vanilla JS, no dependencies.

   1. THE CODE. The team opens the app with its code. The code is not written anywhere in the
      site: assets/calligraphy/app.json holds a few bytes that only the code can open
      (tools/calligraphy/lock.mjs writes it), and inside them the pass the app shows the server
      when it hands over a contact. The same code leaves the visitors' screen.
   2. THE SET-UP. Language, printed model, event.
   3. THE VISITORS' SCREEN. A first name, the name written with a brush, an e-mail address,
      the printed bookmark; then the next visitor.

   Contacts are kept on this device (so that an event without a network loses nothing) and handed
   to /api/calligraphy one by one as soon as the network allows; that function passes them on to
   the team's sheet and has the visitor's e-mail sent. The team's corner shows the counts and
   exports the list. Engine: assets/js/calli-core.js. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     SETTINGS
     ------------------------------------------------------------------ */
  var APP = 'assets/calligraphy/app.json';   // what the code opens
  var API = '/api/calligraphy';              // where contacts are handed over
  var IDLE = 75000;                          // ms without a touch before the screen returns to its start
  var NEXT = 9000;                           // ms the thank-you stays before the next visitor
  var HOLD = 1300;                           // ms the logo must be held to reach the team's corner
  var SAMPLE = 'Yassine';                    // the name written on the language cards
  var FLOAT = ['Salma', 'Karim', 'Lina', 'Omar', 'Nour', 'Adam'];   // names whose first character drifts behind the first screen
  /* ------------------------------------------------------------------ */

  var doc = document, root = doc.documentElement, body = doc.body, C = window.BEN_CALLI_CORE;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(pointer: coarse)').matches;
  var subtle = window.crypto && window.crypto.subtle;
  var CHECK = 'benevents:open', KEEP = 'ben-calli-open', SET = 'ben-calli-settings', LOG = 'ben-calli-log';
  if (!C || !$('.ca-gate')) return;

  /* ---------- Words ---------- */
  var TEXT = {
    fr: {
      'gate.eyebrow': 'Animation · Accès équipe', 'gate.title1': 'Votre prénom', 'gate.title2': 'au pinceau',
      'gate.text': 'L’animation qui écrit le prénom de vos invités en chinois, en japonais ou en coréen, l’imprime et recueille leur e-mail.',
      'gate.label': 'Code de l’équipe', 'gate.open': 'Ouvrir', 'gate.empty': 'Saisissez le code de l’équipe.', 'gate.checking': 'Vérification…',
      'gate.wrong': 'Ce code n’est pas le bon. Vérifiez-le et réessayez.', 'gate.unsupported': 'Ce navigateur ne peut pas ouvrir l’application. Essayez avec une version récente de Chrome, Safari ou Edge.',
      'gate.offline': 'L’application n’a pas pu être chargée. Vérifiez la connexion et rechargez la page.', 'gate.unset': 'L’application n’a pas encore de code. Demandez à benevents de la verrouiller.',
      'setup.title': 'Préparer l’animation', 'setup.steps': 'Étapes', 'setup.s1': 'Langue', 'setup.s2': 'Modèle', 'setup.s3': 'Événement', 'setup.lock': 'Verrouiller',
      'setup.k1': 'Étape 1 sur 3', 'setup.k2': 'Étape 2 sur 3', 'setup.k3': 'Étape 3 sur 3',
      'setup.q1': 'Dans quelle langue écrit-on les prénoms ?', 'setup.q2': 'Quel modèle imprime-t-on ?', 'setup.q3': 'Derniers réglages',
      'setup.zh': 'Des caractères chinois, tracés au pinceau de haut en bas.', 'setup.ja': 'En katakana, l’écriture des prénoms étrangers au Japon.', 'setup.ko': 'En hangeul, l’alphabet coréen, syllabe par syllabe.',
      'setup.size': '{w} × {h} mm', 'setup.neutral': 'Modèle neutre, sans marque.', 'setup.branded': 'Aux couleurs de {brand}.',
      'setup.modelhint': 'Un modèle aux couleurs de votre client ? Envoyez son visuel à benevents : il s’ajoute ici.',
      'setup.event': 'Nom de l’événement', 'setup.eventph': 'Portes ouvertes, Casablanca', 'setup.eventhint': 'Il range les contacts dans votre tableau et sert au décompte.', 'setup.eventdefault': 'Animation du {date}',
      'setup.brand': 'Marque citée dans l’accord', 'setup.brandph': 'Nom de la marque', 'setup.brandhint': '« J’accepte d’être recontacté(e) par … ». Laissez vide pour ne pas proposer la case.',
      'setup.mail': 'E-mail du visiteur', 'setup.mail.required': 'Obligatoire', 'setup.mail.optional': 'Facultatif', 'setup.mail.none': 'Ne pas demander',
      'setup.print': 'Impression', 'setup.print.exact': 'Au format du modèle', 'setup.print.a4': 'Sur A4, traits de coupe', 'setup.print.none': 'Sans impression',
      'setup.qr': 'Code QR sur le marque-page', 'setup.qrhint': 'Il mène à l’offre de la marque par un lien benevents, qui compte les scans. Le visiteur retrouve l’offre dans son e-mail.', 'setup.qr.none': 'Pas de code QR',
      'setup.exithint': 'Pour quitter l’animation : maintenez le logo en haut à gauche, puis saisissez le code.',
      'setup.back': 'Retour', 'setup.next': 'Continuer', 'setup.start': 'Lancer l’animation', 'setup.loading': 'Préparation de l’encre… {done} / {all}', 'setup.failed': 'Les caractères n’ont pas pu être chargés. Vérifiez la connexion et réessayez.',
      'kiosk.label': 'Animation', 'kiosk.mark': 'Espace équipe : maintenez appuyé', 'kiosk.title1': 'Votre prénom', 'kiosk.title2': 'au pinceau',
      'kiosk.sub': 'Écrivez votre prénom : nous le traçons {into}.', 'kiosk.name': 'Votre prénom', 'kiosk.reveal': 'Révéler',
      'kiosk.who': '{name}, {into}', 'kiosk.said': 'Se prononce', 'kiosk.usage': 'Forme d’usage', 'kiosk.phonetic': 'Transcription phonétique', 'kiosk.alts': 'Autre graphie',
      'kiosk.yes': 'C’est mon prénom', 'kiosk.again': 'Corriger', 'kiosk.spoken': '{chars}, prononcé {reading}',
      'kiosk.mail1': 'Où envoyer', 'kiosk.mail2': 'votre calligraphie ?', 'kiosk.email': 'Votre e-mail', 'kiosk.domains': 'Terminaisons courantes',
      'kiosk.mailsub.print': 'Vous la recevez par e-mail, et votre marque-page s’imprime.', 'kiosk.mailsub': 'Vous la recevez par e-mail dans la minute.',
      'kiosk.go.print': 'Recevoir et imprimer', 'kiosk.go': 'Recevoir', 'kiosk.skip.print': 'Imprimer sans e-mail', 'kiosk.skip': 'Continuer sans e-mail',
      'kiosk.consent': 'J’accepte d’être recontacté(e) par {brand}.', 'kiosk.privacy': 'Votre adresse sert à vous envoyer votre calligraphie.', 'kiosk.privacy.brand': 'Votre adresse sert à vous envoyer votre calligraphie ; {brand} ne vous écrira que si vous cochez la case.',
      'kiosk.thanks': 'Merci, {name} !', 'kiosk.printing': 'Votre marque-page s’imprime.', 'kiosk.mailing': 'Votre calligraphie arrive dans votre boîte e-mail.', 'kiosk.kept': 'Gardez-en un beau souvenir.', 'kiosk.nextone': 'Au suivant',
      'err.empty': 'Écrivez votre prénom.', 'err.letters': 'Utilisez uniquement des lettres, des espaces et des traits d’union.', 'err.refused': 'Ce prénom ne peut pas être tracé ici. Demandez à l’équipe.',
      'err.failed': 'Les caractères n’ont pas pu être chargés. Demandez à l’équipe.', 'err.mailEmpty': 'Écrivez votre adresse e-mail.', 'err.mailBad': 'Cette adresse e-mail ne semble pas complète.',
      'staff.title': 'Espace équipe', 'staff.codetext': 'Saisissez le code de l’équipe pour ouvrir les réglages ou quitter l’animation.', 'staff.enter': 'Entrer', 'staff.resume': 'Reprendre l’animation',
      'staff.names': 'Prénoms', 'staff.emails': 'E-mails', 'staff.consents': 'Accords', 'staff.prints': 'Impressions', 'staff.waiting': 'En attente d’envoi',
      'staff.reprint': 'Réimprimer le dernier', 'staff.csv': 'Exporter les contacts (CSV)', 'staff.setup': 'Changer de modèle', 'staff.full': 'Plein écran', 'staff.lock': 'Verrouiller et quitter',
      'staff.clear': 'Effacer les contacts de cet appareil', 'staff.clearyes': 'Effacer', 'staff.clearno': 'Annuler',
      'staff.clearask': 'Effacer les {n} participations enregistrées sur cet appareil ? Exportez-les d’abord : cette action est définitive.',
      'staff.event': '{event} · {model}',
      'staff.send.ok': 'Les contacts partent vers votre tableau au fil de l’eau.', 'staff.send.idle': 'Les contacts partiront vers votre tableau dès le premier e-mail.',
      'staff.send.off': 'L’envoi vers votre tableau n’est pas encore branché : les contacts restent sur cet appareil. Exportez-les ci-dessous.',
      'staff.send.offline': 'Hors connexion : les contacts attendent sur cet appareil et partiront dès le retour du réseau.',
      'staff.send.refused': 'L’envoi est refusé par le serveur (code changé depuis l’ouverture ?). Verrouillez puis rouvrez l’application ; les contacts restent sur cet appareil.',
      'staff.none': 'Aucune participation à réimprimer pour cet événement.', 'staff.exported': 'Liste exportée : {n} lignes.', 'staff.cleared': 'Les contacts de cet appareil sont effacés.',
      'csv': ['Date', 'Événement', 'Modèle', 'Langue', 'Prénom', 'Caractères', 'Lecture', 'E-mail', 'Accord pour être recontacté', 'Imprimé', 'Transmis', 'Offre QR'], 'yes': 'oui', 'no': 'non'
    },
    en: {
      'gate.eyebrow': 'Activity · Team access', 'gate.title1': 'Your first name', 'gate.title2': 'by brush',
      'gate.text': 'The activity that writes your guests’ first names in Chinese, Japanese or Korean, prints them and collects their email.',
      'gate.label': 'Team code', 'gate.open': 'Open', 'gate.empty': 'Enter the team code.', 'gate.checking': 'Checking…',
      'gate.wrong': 'That code isn’t right. Check it and try again.', 'gate.unsupported': 'This browser cannot open the app. Try a recent version of Chrome, Safari or Edge.',
      'gate.offline': 'The app could not be loaded. Check the connection and reload the page.', 'gate.unset': 'The app has no code yet. Ask benevents to lock it.',
      'setup.title': 'Set up the activity', 'setup.steps': 'Steps', 'setup.s1': 'Language', 'setup.s2': 'Model', 'setup.s3': 'Event', 'setup.lock': 'Lock',
      'setup.k1': 'Step 1 of 3', 'setup.k2': 'Step 2 of 3', 'setup.k3': 'Step 3 of 3',
      'setup.q1': 'Which language are the names written in?', 'setup.q2': 'Which model is printed?', 'setup.q3': 'Last settings',
      'setup.zh': 'Chinese characters, written with a brush from top to bottom.', 'setup.ja': 'In katakana, the script Japan uses for foreign names.', 'setup.ko': 'In hangul, the Korean alphabet, syllable by syllable.',
      'setup.size': '{w} × {h} mm', 'setup.neutral': 'Plain model, no brand.', 'setup.branded': 'In the colours of {brand}.',
      'setup.modelhint': 'A model in your client’s colours? Send their artwork to benevents: it is added here.',
      'setup.event': 'Name of the event', 'setup.eventph': 'Open day, Casablanca', 'setup.eventhint': 'It files the contacts in your sheet and is used for the count.', 'setup.eventdefault': 'Activity of {date}',
      'setup.brand': 'Brand named in the consent', 'setup.brandph': 'Name of the brand', 'setup.brandhint': '“I agree to be contacted by …”. Leave empty to leave the box out.',
      'setup.mail': 'Visitor’s email', 'setup.mail.required': 'Required', 'setup.mail.optional': 'Optional', 'setup.mail.none': 'Do not ask',
      'setup.print': 'Printing', 'setup.print.exact': 'At the size of the model', 'setup.print.a4': 'On A4, with crop marks', 'setup.print.none': 'No printing',
      'setup.qr': 'QR code on the bookmark', 'setup.qrhint': 'It leads to the brand’s offer through a benevents link, which counts the scans. The visitor finds the offer in their email too.', 'setup.qr.none': 'No QR code',
      'setup.exithint': 'To leave the activity: hold the logo at the top left, then enter the code.',
      'setup.back': 'Back', 'setup.next': 'Continue', 'setup.start': 'Start the activity', 'setup.loading': 'Preparing the ink… {done} / {all}', 'setup.failed': 'The characters could not be loaded. Check the connection and try again.',
      'kiosk.label': 'Activity', 'kiosk.mark': 'Team corner: press and hold', 'kiosk.title1': 'Your first name', 'kiosk.title2': 'by brush',
      'kiosk.sub': 'Type your first name: we write it {into}.', 'kiosk.name': 'Your first name', 'kiosk.reveal': 'Reveal',
      'kiosk.who': '{name}, {into}', 'kiosk.said': 'Pronounced', 'kiosk.usage': 'Established form', 'kiosk.phonetic': 'Phonetic transcription', 'kiosk.alts': 'Other spelling',
      'kiosk.yes': 'That’s my name', 'kiosk.again': 'Change', 'kiosk.spoken': '{chars}, pronounced {reading}',
      'kiosk.mail1': 'Where shall we send', 'kiosk.mail2': 'your calligraphy?', 'kiosk.email': 'Your email', 'kiosk.domains': 'Common endings',
      'kiosk.mailsub.print': 'You receive it by email, and your bookmark is printed.', 'kiosk.mailsub': 'You receive it by email within a minute.',
      'kiosk.go.print': 'Receive and print', 'kiosk.go': 'Receive', 'kiosk.skip.print': 'Print without email', 'kiosk.skip': 'Continue without email',
      'kiosk.consent': 'I agree to be contacted by {brand}.', 'kiosk.privacy': 'Your address is used to send you your calligraphy.', 'kiosk.privacy.brand': 'Your address is used to send you your calligraphy; {brand} will write to you only if you tick the box.',
      'kiosk.thanks': 'Thank you, {name}!', 'kiosk.printing': 'Your bookmark is printing.', 'kiosk.mailing': 'Your calligraphy is on its way to your inbox.', 'kiosk.kept': 'Keep it as a souvenir.', 'kiosk.nextone': 'Next visitor',
      'err.empty': 'Type your first name.', 'err.letters': 'Use letters, spaces and hyphens only.', 'err.refused': 'This name cannot be written here. Please ask the team.',
      'err.failed': 'The characters could not be loaded. Please ask the team.', 'err.mailEmpty': 'Type your email address.', 'err.mailBad': 'This email address does not look complete.',
      'staff.title': 'Team corner', 'staff.codetext': 'Enter the team code to open the settings or leave the activity.', 'staff.enter': 'Enter', 'staff.resume': 'Back to the activity',
      'staff.names': 'First names', 'staff.emails': 'Emails', 'staff.consents': 'Consents', 'staff.prints': 'Prints', 'staff.waiting': 'Waiting to be sent',
      'staff.reprint': 'Print the last one again', 'staff.csv': 'Export the contacts (CSV)', 'staff.setup': 'Change the model', 'staff.full': 'Full screen', 'staff.lock': 'Lock and leave',
      'staff.clear': 'Erase the contacts on this device', 'staff.clearyes': 'Erase', 'staff.clearno': 'Cancel',
      'staff.clearask': 'Erase the {n} participations kept on this device? Export them first: this cannot be undone.',
      'staff.event': '{event} · {model}',
      'staff.send.ok': 'Contacts are passed on to your sheet as they come.', 'staff.send.idle': 'Contacts will be passed on to your sheet from the first email.',
      'staff.send.off': 'Passing contacts on to your sheet is not connected yet: they stay on this device. Export them below.',
      'staff.send.offline': 'Offline: contacts wait on this device and leave as soon as the network is back.',
      'staff.send.refused': 'The server refuses the contacts (code changed since the app was opened?). Lock the app and open it again; the contacts stay on this device.',
      'staff.none': 'No participation to print again for this event.', 'staff.exported': 'List exported: {n} rows.', 'staff.cleared': 'The contacts on this device are erased.',
      'csv': ['Date', 'Event', 'Model', 'Language', 'First name', 'Characters', 'Reading', 'Email', 'Agrees to be contacted', 'Printed', 'Passed on', 'QR offer'], 'yes': 'yes', 'no': 'no'
    }
  };
  var lang = 'fr';
  function t(key, vars) {
    var s = (TEXT[lang] && TEXT[lang][key]) || TEXT.fr[key] || '';
    if (vars && typeof s === 'string') Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }
  function setLang(next, save) {
    lang = next === 'en' ? 'en' : 'fr';
    $$('[data-t]').forEach(function (n) { n.textContent = t(n.getAttribute('data-t')); });
    $$('[data-t-ph]').forEach(function (n) { n.setAttribute('placeholder', t(n.getAttribute('data-t-ph'))); });
    $$('[data-t-aria]').forEach(function (n) { n.setAttribute('aria-label', t(n.getAttribute('data-t-aria'))); });
    root.lang = lang;
    doc.title = body.getAttribute('data-title-' + lang) || doc.title;
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    if (save) store('ben-lang', lang, true);
    words();
  }

  /* ---------- What this device keeps ---------- */
  function read(key, session) {
    try { return JSON.parse((session ? sessionStorage : localStorage).getItem(key) || 'null'); } catch (e) { return null; }
  }
  function store(key, value, plainText) {
    try { localStorage.setItem(key, plainText ? value : JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  var S = read(SET) || {};                   // language, model, event, brand, e-mail, paper, qr (an offer), running
  var offers = {};                           // the brand offers a QR code can lead to (offers.json)
  var log = read(LOG) || [];                 // every participation on this device
  if (!Array.isArray(log)) log = [];
  var keepSettings = function () { store(SET, S); };
  var keepLog = function () { store(LOG, log); };
  var device = '';
  try { device = localStorage.getItem('ben-calli-device') || ''; } catch (e) {}
  if (!device) { device = 'K' + Math.random().toString(36).slice(2, 6).toUpperCase(); store('ben-calli-device', device, true); }

  /* ---------- The code ---------- */
  function bytesOf(b64) { var bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function b64Of(u) { var s = ''; for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); }
  // capitals and the spaces around the code do not matter
  function plain(code) { return (code.normalize ? code.normalize('NFKC') : code).trim().toLowerCase(); }
  function keyFrom(code, kdf) {
    return subtle.importKey('raw', new TextEncoder().encode(plain(code)), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return subtle.deriveKey({ name: 'PBKDF2', salt: bytesOf(kdf.salt), iterations: kdf.iterations, hash: kdf.hash }, base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
    });
  }
  // a locked piece: 12 bytes, then the encrypted content
  function unseal(key, u) { return subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, key, u.subarray(12)); }
  function opens(key, m) {
    return unseal(key, bytesOf(m.check)).then(function (buf) { return new TextDecoder().decode(buf) === CHECK; }, function () { return false; });
  }
  var M = null, KEY = null, BOX = null;
  var manifest = fetch(APP, { cache: 'no-cache' }).then(function (r) {
    if (r.status === 404) throw new Error('unset');
    if (!r.ok) throw new Error('offline');
    return r.json();
  });
  manifest.catch(function () {});              // reported when the team asks to open
  // the code is right when it opens the manifest; what is inside is kept for this tab only
  function enter(key, m) {
    return opens(key, m).then(function (ok) {
      if (!ok) return false;
      return unseal(key, bytesOf(m.box)).then(function (buf) {
        KEY = key; M = m; BOX = JSON.parse(new TextDecoder().decode(buf));
        return true;
      });
    });
  }
  function unlock(code) {
    return manifest.then(function (m) {
      return keyFrom(code, m.kdf).then(function (key) {
        return enter(key, m).then(function (ok) {
          if (!ok) return false;
          return subtle.exportKey('raw', key).then(function (raw) {
            try { sessionStorage.setItem(KEEP, JSON.stringify({ rev: m.rev, k: b64Of(new Uint8Array(raw)) })); } catch (e) {}
            return true;
          }, function () { return true; });
        });
      });
    });
  }
  // is this the team's code? (asked again to leave the visitors' screen)
  function verify(code) {
    return manifest.then(function (m) { return keyFrom(code, m.kdf).then(function (key) { return opens(key, m); }); });
  }
  function restore() {
    var saved = read(KEEP, true);
    if (!saved || !saved.k || !subtle) return Promise.resolve(false);
    return manifest.then(function (m) {
      if (saved.rev !== m.rev) return false;
      return subtle.importKey('raw', bytesOf(saved.k), { name: 'AES-GCM' }, true, ['decrypt']).then(function (key) { return enter(key, m); });
    }).then(function (ok) { return ok; }, function () { return false; });
  }

  /* ---------- The pieces of the page ---------- */
  var gate = $('.ca-gate'), gform = $('.ca-gate__form'), gnote = $('.ca-gate__note');
  var setup = $('.ca-setup'), snote = $('.ca-setup__note'), nextBtn = $('.ca-next'), backBtn = $('.ca-back'), sform = $('.ca-form');
  var kiosk = $('.ca-kiosk'), stage = $('.ca-stage'), wipe = $('.ca-wipe'), floaters = $('.ca-float');
  var nameForm = $('.ca-name'), nameNote = $('.ca-name-note'), mailForm = $('.ca-mail'), mailNote = $('.ca-mail-note');
  var hanBox = $('.ca-han'), paper = $('.ca-paper'), consentBox = $('.ca-consent'), agree = $('.ca-consent input'), skipBtn = $('.ca-skip');
  var staff = $('.ca-staff'), scode = $('.ca-staff__code'), spanel = $('.ca-staff__panel'), pnote = $('.ca-staff__pnote');
  var printBox = $('.ca-print');
  var state = { step: 1, running: false, screen: 'name', res: null, form: 0, page: null };

  function say(el, key, vars, bad) {
    el._said = key ? { key: key, vars: vars, bad: bad } : null;
    el.textContent = key ? t(key, vars) : '';
    el.classList.toggle('is-error', !!bad);
  }
  function sayAgain(el) { if (el._said) say(el, el._said.key, el._said.vars, el._said.bad); }
  function shake(el) { el.classList.remove('is-wrong'); void el.offsetWidth; el.classList.add('is-wrong'); }
  function scriptOf() { return C.SCRIPTS[S.script] ? S.script : ''; }
  function modelOf() { var m = C.TEMPLATES[S.model]; return m && m.script === S.script ? m : null; }
  // the QR code to print on a model for an offer: only where the model has a place for it
  function qrOpts(id, slug) { var m = C.TEMPLATES[id]; return m && m.qr && slug && slug !== 'none' ? C.qrOf(slug) : null; }

  /* ---------- 1. The gate ---------- */
  gform.addEventListener('submit', function (e) {
    e.preventDefault();
    if (gform.classList.contains('is-busy')) return;
    var input = gform.elements.code, code = input.value;
    gform.classList.remove('is-wrong');
    if (!plain(code)) { say(gnote, 'gate.empty', null, true); input.focus(); return; }
    if (!subtle || !window.TextEncoder) { say(gnote, 'gate.unsupported', null, true); return; }
    gform.classList.add('is-busy');
    say(gnote, 'gate.checking');
    unlock(code).then(function (ok) {
      gform.classList.remove('is-busy');
      if (!ok) { say(gnote, 'gate.wrong', null, true); shake(gform); input.select(); return; }
      input.value = '';
      say(gnote, '');
      openSetup();
    }, function (err) {
      gform.classList.remove('is-busy');
      say(gnote, err && err.message === 'unset' ? 'gate.unset' : 'gate.offline', null, true);
    });
  });
  gform.elements.code.addEventListener('input', function () { gform.classList.remove('is-wrong'); if (gnote.classList.contains('is-error')) say(gnote, ''); });

  function showOnly(which) {
    gate.hidden = which !== gate;
    setup.hidden = which !== setup;
    kiosk.hidden = which !== kiosk;
    body.classList.toggle('is-kiosk', which === kiosk);
    if (which !== kiosk) window.scrollTo(0, 0);
  }
  function lockApp() {
    stopKiosk();
    KEY = null; BOX = null;
    try { sessionStorage.removeItem(KEEP); } catch (e) {}
    staff.hidden = true;
    body.removeAttribute('data-script');
    showOnly(gate);
    if (!touch) gform.elements.code.focus();
  }

  /* ---------- 2. The set-up ---------- */
  var scriptBox = $('.ca-choices--script'), modelBox = $('.ca-choices--model');
  function choice(cls, id, checked) {
    var b = doc.createElement('button');
    b.type = 'button';
    b.className = 'ca-choice ' + cls;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(checked));
    b.setAttribute('data-id', id);
    return b;
  }
  function drawScripts() {
    scriptBox.textContent = '';
    Object.keys(C.SCRIPTS).forEach(function (id) {
      var sc = C.SCRIPTS[id], b = choice('ca-choice--script', id, S.script === id);
      b.innerHTML = '<span class="ca-choice__sample" aria-hidden="true"></span><span class="ca-choice__own" lang="' + id + '"></span><span class="ca-choice__name"></span><span class="ca-choice__text"></span>';
      $('.ca-choice__own', b).textContent = sc.own;
      $('.ca-choice__name', b).textContent = sc.label[lang];
      $('.ca-choice__text', b).textContent = t('setup.' + id);
      scriptBox.appendChild(b);
      // the sample name, drawn from the outlines themselves
      C.load(id).then(function () {
        var res = C.transliterate(id, SAMPLE);
        if (res.error) return;
        var text = res.forms[0].join('');
        return C.need(id, text).then(function () {
          $('.ca-choice__sample', b).innerHTML = text.split('').map(function (ch) { return C.tile(id, ch, 30); }).join('');
        });
      }).catch(function () {});
    });
  }
  function drawModels() {
    modelBox.textContent = '';
    var ids = C.modelsOf(S.script);
    if (ids.indexOf(S.model) < 0) S.model = ids.length === 1 ? ids[0] : '';
    ids.forEach(function (id) {
      var m = C.TEMPLATES[id], b = choice('ca-choice--model', id, S.model === id);
      b.innerHTML = '<img class="ca-choice__pic" alt="" loading="lazy"><span><span class="ca-choice__name"></span><span class="ca-choice__own"></span><span class="ca-choice__text"></span></span>';
      $('img', b).src = C.BASE + m.image;
      $('.ca-choice__name', b).textContent = m.label[lang];
      $('.ca-choice__own', b).textContent = t('setup.size', { w: m.w, h: m.h });
      $('.ca-choice__text', b).textContent = m.brand ? t('setup.branded', { brand: m.brand }) : t('setup.neutral');
      modelBox.appendChild(b);
    });
  }
  function pick(box, id) { $$('.ca-choice', box).forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-id') === id)); }); }
  scriptBox.addEventListener('click', function (e) {
    var b = e.target.closest('.ca-choice');
    if (!b) return;
    if (S.script !== b.getAttribute('data-id')) { S.script = b.getAttribute('data-id'); S.model = ''; S.brand = undefined; S.qr = undefined; }
    pick(scriptBox, S.script);
    body.setAttribute('data-script', S.script);
    keepSettings();
    stepState();
  });
  modelBox.addEventListener('click', function (e) {
    var b = e.target.closest('.ca-choice');
    if (!b) return;
    if (S.model !== b.getAttribute('data-id')) { S.brand = undefined; S.qr = undefined; }
    S.model = b.getAttribute('data-id');
    pick(modelBox, S.model);
    keepSettings();
    stepState();
  });
  $$('.ca-seg').forEach(function (seg) {
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      S[seg.getAttribute('data-set')] = b.getAttribute('data-v');
      keepSettings();
      segState();
    });
  });
  // the QR code of the bookmark: offered only where the model has a place for one and there is an offer to lead to
  function drawQr() {
    var m = modelOf(), row = $('.ca-row--qr'), seg = $('.ca-seg', row), slugs = Object.keys(offers);
    row.hidden = !(m && m.qr && slugs.length);
    if (row.hidden) { S.qr = 'none'; return; }
    if (S.qr === undefined || (S.qr !== 'none' && !offers[S.qr])) S.qr = m.offer && offers[m.offer] ? m.offer : 'none';
    seg.textContent = '';
    slugs.concat('none').forEach(function (slug) {
      var b = doc.createElement('button'), o = offers[slug];
      b.type = 'button';
      b.setAttribute('data-v', slug);
      b.textContent = slug === 'none' ? t('setup.qr.none') : [o.brand, (o.label && (o.label[lang] || o.label.fr)) || slug].filter(Boolean).join(' · ');
      seg.appendChild(b);
    });
  }
  function segState() {
    if (['required', 'optional', 'none'].indexOf(S.email) < 0) S.email = 'required';
    if (['exact', 'a4', 'none'].indexOf(S.paper) < 0) S.paper = 'exact';
    $$('.ca-seg').forEach(function (seg) {
      var v = S[seg.getAttribute('data-set')];
      $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); });
    });
  }
  sform.addEventListener('input', function () {
    S.event = sform.elements.event.value.trim().slice(0, 80);
    S.brand = sform.elements.brand.value.trim().slice(0, 60);
    keepSettings();
  });
  sform.addEventListener('submit', function (e) { e.preventDefault(); });
  function stepState() {
    $$('.ca-step').forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== state.step; });
    $$('.ca-steps li').forEach(function (li) {
      var at = +li.getAttribute('data-at');
      li.classList.toggle('is-now', at === state.step);
      li.classList.toggle('is-done', at < state.step);
    });
    backBtn.hidden = state.step === 1;
    nextBtn.disabled = (state.step === 1 && !scriptOf()) || (state.step === 2 && !modelOf());
    $('span', nextBtn).textContent = t(state.step === 3 ? 'setup.start' : 'setup.next');
    say(snote, '');
  }
  function goStep(n) {
    state.step = n;
    if (n === 2) C.models().then(drawModels, function () { say(snote, 'setup.failed', null, true); });
    if (n === 3) {
      var m = modelOf();
      if (S.brand === undefined) S.brand = m ? m.brand : '';
      sform.elements.event.value = S.event || '';
      sform.elements.brand.value = S.brand || '';
      drawQr();
      segState();
    }
    stepState();
    window.scrollTo(0, 0);
  }
  function openSetup() {
    stopKiosk();
    S.qr = undefined;                          // a new event chooses its QR code again: an offer is never carried over from the last one
    showOnly(setup);
    if (scriptOf()) body.setAttribute('data-script', S.script);
    drawScripts();
    goStep(1);
  }
  backBtn.addEventListener('click', function () { if (state.step > 1) goStep(state.step - 1); });
  nextBtn.addEventListener('click', function () {
    if (nextBtn.disabled || nextBtn.classList.contains('is-busy')) return;
    if (state.step < 3) { goStep(state.step + 1); return; }
    // launch: everything the day needs is fetched now, while the network is there
    if (!S.event) { var d = new Date(); S.event = t('setup.eventdefault', { date: d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB') }); }
    keepSettings();
    nextBtn.classList.add('is-busy');
    say(snote, 'setup.loading', { done: 0, all: '…' });
    full(true);
    Promise.all([C.picture(S.model), C.offers(), C.warm(S.script, function (done, all) { say(snote, 'setup.loading', { done: done, all: all }); })]).then(function () {
      nextBtn.classList.remove('is-busy');
      say(snote, '');
      startKiosk();
    }, function () {
      nextBtn.classList.remove('is-busy');
      say(snote, 'setup.failed', null, true);
    });
  });

  /* ---------- 3. The visitors' screen ---------- */
  var screens = $$('.ca-screen'), dots = $$('.ca-dots li');
  var STEP_OF = { name: 0, reveal: 0, mail: 1, done: 2 };
  function show(name, from) {
    var swap = function () {
      screens.forEach(function (s) {
        var on = s.getAttribute('data-screen') === name;
        s.hidden = !on;
        s.classList.toggle('is-on', on);
      });
      state.screen = name;
      kiosk.setAttribute('data-screen', name);
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === STEP_OF[name]); d.classList.toggle('is-done', i < STEP_OF[name]); });
      if (!touch) { var f = name === 'name' ? nameForm.elements.name : name === 'mail' ? mailForm.elements.email : null; if (f) f.focus({ preventScroll: true }); }
    };
    if (doc.activeElement && doc.activeElement.blur && /^(input)$/i.test(doc.activeElement.tagName)) doc.activeElement.blur();
    if (!from || reduced) { swap(); return; }
    var r = from.getBoundingClientRect(), k = kiosk.getBoundingClientRect();
    wipe.style.setProperty('--x', (r.left + r.width / 2 - k.left) + 'px');
    wipe.style.setProperty('--y', (r.top + r.height / 2 - k.top) + 'px');
    wipe.classList.remove('is-go');
    void wipe.offsetWidth;
    wipe.classList.add('is-go');
    setTimeout(swap, 420);
    setTimeout(function () { wipe.classList.remove('is-go'); }, 940);
  }
  // the words of the visitors' screen that depend on the set-up
  function words() {
    var sc = C.SCRIPTS[scriptOf()], printing = S.paper && S.paper !== 'none';
    if (!setup.hidden) {
      $$('.ca-choice--script', scriptBox).forEach(function (b) {
        var id = b.getAttribute('data-id');
        $('.ca-choice__name', b).textContent = C.SCRIPTS[id].label[lang];
        $('.ca-choice__text', b).textContent = t('setup.' + id);
      });
      if (state.step === 2) drawModels();
      if (state.step === 3) { drawQr(); segState(); }
      stepState();
    }
    [gnote, snote, nameNote, mailNote, pnote].forEach(sayAgain);
    if (!sc) return;
    $('.ca-script-of').textContent = sc.of[lang].charAt(0).toUpperCase() + sc.of[lang].slice(1);
    $('.ca-name-sub').textContent = t('kiosk.sub', { into: sc.into[lang] });
    $('.ca-mail-sub').textContent = t(printing ? 'kiosk.mailsub.print' : 'kiosk.mailsub');
    $('.ca-mail-go').textContent = t(printing ? 'kiosk.go.print' : 'kiosk.go');
    consentBox.hidden = !S.brand;
    $('span', consentBox).textContent = t('kiosk.consent', { brand: S.brand });
    $('.ca-privacy').textContent = S.brand ? t('kiosk.privacy.brand', { brand: S.brand }) : t('kiosk.privacy');
    skipBtn.hidden = S.email !== 'optional';
    skipBtn.textContent = t(printing ? 'kiosk.skip.print' : 'kiosk.skip');
    if (state.res && state.screen !== 'name') drawName(true);
    if (!staff.hidden && !spanel.hidden) drawPanel();
  }
  function drawFloaters() {
    var script = S.script, spots = [[3, 6, 30], [72, 0, 26], [80, 48, 34], [0, 58, 27], [38, 66, 22], [50, 4, 18]];
    var chars = FLOAT.map(function (n) { var r = C.transliterate(script, n); return r.error ? '' : r.forms[0].join('').charAt(0); }).filter(Boolean);
    C.need(script, chars.join('')).then(function () {
      if (S.script !== script) return;
      floaters.innerHTML = chars.map(function (ch, i) {
        var p = spots[i % spots.length];
        return C.tile(script, ch, 30).replace('<svg ', '<svg style="left:' + p[0] + '%;top:' + p[1] + '%;height:' + p[2] + 'vh;animation-delay:' + (-i * 3.7) + 's" ');
      }).join('');
    }).catch(function () {});
  }
  function startKiosk() {
    if (!scriptOf() || !modelOf()) { openSetup(); return; }
    state.running = true;
    S.running = true;
    keepSettings();
    body.setAttribute('data-script', S.script);
    staff.hidden = true;
    showOnly(kiosk);
    fit();
    clearVisitor();
    words();
    show('name');
    C.load(S.script).then(function () { drawFloaters(); return C.picture(S.model); }).catch(function () { say(nameNote, 'err.failed', null, true); });
    C.warm(S.script).catch(function () {});
    awake();
    try { history.pushState({ ca: 1 }, ''); } catch (e) {}
    arm();
    flush();
  }
  function stopKiosk() {
    if (!state.running) return;
    state.running = false;
    S.running = false;
    keepSettings();
    clearTimeout(idleTimer); clearTimeout(nextTimer);
    if (wake && wake.release) { wake.release().catch(function () {}); wake = null; }
  }
  function clearVisitor() {
    state.res = null; state.form = 0; state.page = null;
    nameForm.elements.name.value = '';
    mailForm.elements.email.value = '';
    agree.checked = false;
    nameForm.classList.remove('is-busy', 'is-wrong'); mailForm.classList.remove('is-wrong');
    say(nameNote, ''); say(mailNote, '');
    clearTimeout(nextTimer);
    $('.ca-next-one').classList.remove('is-counting');
    $('.ca-petals').textContent = '';
  }
  function reset() { clearVisitor(); show('name'); }

  // a. the first name
  nameForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (nameForm.classList.contains('is-busy')) return;
    var input = nameForm.elements.name, script = S.script;
    if (!C.tidy(input.value)) { say(nameNote, 'err.empty', null, true); shake(nameForm); return; }
    nameForm.classList.add('is-busy');
    C.load(script).then(function () {
      var res = C.transliterate(script, input.value);
      if (res.error) { say(nameNote, 'err.' + res.error, null, true); shake(nameForm); return null; }
      return C.ready(S.model, res, 0, { qr: qrOpts(S.model, S.qr) }).then(function (page) {
        state.res = res; state.form = 0; state.page = page;
        say(nameNote, '');
        drawName(false);
        show('reveal', $('.btn', nameForm));
      });
    }).catch(function () { say(nameNote, 'err.failed', null, true); }).then(function () { nameForm.classList.remove('is-busy'); });
  });
  nameForm.elements.name.addEventListener('input', function () { nameForm.classList.remove('is-wrong'); if (nameNote.classList.contains('is-error')) say(nameNote, ''); });

  // b. the name, written
  function drawName(still) {
    var res = state.res, script = res.script, lines = res.forms[state.form], sc = C.SCRIPTS[script], k = 0, longest = 1;
    $('.ca-reveal__who').textContent = t('kiosk.who', { name: res.name, into: sc.into[lang] });
    hanBox.textContent = '';
    lines.forEach(function (line) {                    // one row for each part of the name
      var row = doc.createElement('div');
      row.className = 'ca-han__line';
      longest = Math.max(longest, line.length);
      line.split('').forEach(function (ch) {
        var holder = doc.createElement('span');
        holder.className = 'ca-han__char';
        holder.style.setProperty('--i', k++);
        holder.innerHTML = C.tile(script, ch, 40);
        row.appendChild(holder);
      });
      hanBox.appendChild(row);
    });
    hanBox.style.setProperty('--n', Math.max(2, longest));
    hanBox.style.setProperty('--rows', lines.length);
    $('.ca-screen[data-screen="reveal"]').style.setProperty('--chars', still ? 0 : k);
    var said = C.reading(script, lines);
    hanBox.setAttribute('aria-label', t('kiosk.spoken', { chars: lines.join(' '), reading: said }));
    $('.ca-read b').textContent = said;
    var chip = $('.ca-chip');
    chip.textContent = t(res.known ? 'kiosk.usage' : 'kiosk.phonetic');
    chip.classList.toggle('is-proposal', !res.known && script === 'zh');
    var alts = $('.ca-alts');
    alts.textContent = '';
    if (res.forms.length > 1) {
      var lab = doc.createElement('span');
      lab.textContent = t('kiosk.alts');
      alts.appendChild(lab);
      res.forms.forEach(function (f, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.setAttribute('data-form', i);
        b.setAttribute('aria-pressed', String(i === state.form));
        b.setAttribute('aria-label', C.reading(script, f));
        b._text = f.join('');
        alts.appendChild(b);
      });
      // the other spellings are drawn once their outlines are here
      C.need(script, res.forms.map(function (f) { return f.join(''); }).join('')).then(function () {
        $$('button', alts).forEach(function (b) { b.innerHTML = b._text.split('').map(function (ch) { return C.tile(script, ch, 20); }).join(''); });
      }).catch(function () {});
    }
    paper.innerHTML = C.svgOf(state.page);
    hanBox.classList.remove('is-in');
    if (!still) { void hanBox.offsetWidth; hanBox.classList.add('is-in'); }
  }
  $('.ca-alts').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || !state.res) return;
    var i = +b.getAttribute('data-form');
    if (i === state.form) return;
    C.ready(S.model, state.res, i, { qr: qrOpts(S.model, S.qr) }).then(function (page) { state.form = i; state.page = page; drawName(false); }).catch(function () {});
  });

  // c. the e-mail address
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  $('.ca-domains').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var input = mailForm.elements.email;
    input.value = input.value.split('@')[0].trim() + b.textContent;
    say(mailNote, '');
    if (!touch) input.focus();
  });
  mailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = mailForm.elements.email, to = input.value.trim();
    if (!state.res) { reset(); return; }
    if (!to) { say(mailNote, 'err.mailEmpty', null, true); shake(mailForm); return; }
    if (to.length > 120 || !EMAIL.test(to)) { say(mailNote, 'err.mailBad', null, true); shake(mailForm); return; }
    finish(to, agree.checked && !!S.brand, $('.btn', mailForm));
  });
  mailForm.elements.email.addEventListener('input', function () { mailForm.classList.remove('is-wrong'); if (mailNote.classList.contains('is-error')) say(mailNote, ''); });

  // d. thank you: the participation is kept, the bookmark printed, the contact handed over
  var nextTimer = 0;
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function finish(email, consent, from) {
    var res = state.res, lines = res.forms[state.form], printing = S.paper !== 'none', page = state.page;
    var entry = { id: uid(), at: new Date().toISOString(), event: S.event, brand: S.brand || '', model: S.model, script: res.script, name: res.name,
      chars: lines.join('·'), reading: C.reading(res.script, lines), email: email, consent: !!consent, lang: lang, printed: printing, offer: qrOpts(S.model, S.qr) ? S.qr : '', sent: 0 };
    log.push(entry);
    keepLog();
    $('.ca-done__title').textContent = t('kiosk.thanks', { name: res.name });
    $('.ca-done__lines').textContent = [printing ? t('kiosk.printing') : '', email ? t('kiosk.mailing') : '', !printing && !email ? t('kiosk.kept') : ''].filter(Boolean).join(' ');
    $('.ca-out__paper').innerHTML = C.svgOf(page);
    var petals = '';
    for (var i = 0; i < 22; i++) petals += '<i style="left:' + Math.round(Math.random() * 100) + '%;--t:' + (3.2 + Math.random() * 2.6).toFixed(2) + 's;--d:' + (Math.random() * 1.6).toFixed(2) + 's;--x:' + Math.round(Math.random() * 16 - 8) + 'vw;--r:' + Math.round(360 + Math.random() * 540) + 'deg"></i>';
    $('.ca-petals').innerHTML = reduced ? '' : petals;
    show('done', from);
    var count = function () {
      var b = $('.ca-next-one');
      b.style.setProperty('--wait', NEXT + 'ms');
      b.classList.remove('is-counting'); void b.offsetWidth; b.classList.add('is-counting');
      clearTimeout(nextTimer);
      nextTimer = setTimeout(function () { if (state.running && state.screen === 'done') reset(); }, NEXT);
    };
    setTimeout(function () { if (printing) print(page).then(count); else count(); }, reduced ? 50 : 1100);
    flush();
  }
  kiosk.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'yes' && state.res) { if (S.email === 'none') finish('', false, b); else show('mail', b); }
    else if (act === 'again') { show('name'); if (!touch) nameForm.elements.name.select(); }
    else if (act === 'skip' && state.res && S.email === 'optional') finish('', false, b);
    else if (act === 'next-one') reset();
  });

  /* nobody for a while: the screen returns to its start, and what was typed is gone */
  var idleTimer = 0;
  function arm() {
    clearTimeout(idleTimer);
    if (!state.running) return;
    idleTimer = setTimeout(function () {
      if (!state.running) return;
      if (!staff.hidden) { if (!spanel.hidden) { arm(); return; } staff.hidden = true; }
      if (state.screen !== 'name' || nameForm.elements.name.value) reset();
      arm();
    }, IDLE);
  }
  ['pointerdown', 'keydown', 'input'].forEach(function (ev) { doc.addEventListener(ev, arm, true); });

  /* the keyboard of a tablet: the screen is as tall as what remains above it */
  var vv = window.visualViewport;
  function fit() {
    var h = vv ? vv.height : window.innerHeight;
    body.style.setProperty('--vvh', Math.round(h) + 'px');
    kiosk.classList.toggle('is-short', h < 520);
    if (state.running) window.scrollTo(0, 0);
  }
  if (vv) vv.addEventListener('resize', fit);
  window.addEventListener('resize', fit);
  kiosk.addEventListener('focusin', function (e) { if (touch && /^input$/i.test(e.target.tagName) && e.target.type !== 'checkbox') kiosk.classList.add('is-typing'); });
  kiosk.addEventListener('focusout', function () { kiosk.classList.remove('is-typing'); });

  /* a screen that stays put: awake, full, with no way out but the team's */
  var wake = null;
  function awake() {
    if (!navigator.wakeLock || !state.running) return;
    navigator.wakeLock.request('screen').then(function (l) { wake = l; }, function () {});
  }
  doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'visible') { awake(); flush(); } });
  function fullEl() { return doc.fullscreenElement || doc.webkitFullscreenElement || null; }
  function full(on) {
    try {
      if (on && !fullEl()) { var ask = root.requestFullscreen || root.webkitRequestFullscreen; if (ask) { var p = ask.call(root, { navigationUI: 'hide' }); if (p && p.catch) p.catch(function () {}); } }
      else if (!on && fullEl()) (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
    } catch (e) {}
  }
  window.addEventListener('popstate', function () { if (state.running) { try { history.pushState({ ca: 1 }, ''); } catch (e) {} openStaff(); } });
  window.addEventListener('beforeunload', function (e) { if (state.running) { e.preventDefault(); e.returnValue = ''; } });
  doc.addEventListener('contextmenu', function (e) { if (state.running) e.preventDefault(); });
  doc.addEventListener('gesturestart', function (e) { if (state.running) e.preventDefault(); });

  /* ---------- The team's corner ---------- */
  var mark = $('.ca-mark'), holdTimer = 0;
  function release() { clearTimeout(holdTimer); mark.classList.remove('is-held'); }
  mark.addEventListener('pointerdown', function () {
    release();
    mark.classList.add('is-held');
    holdTimer = setTimeout(function () { release(); openStaff(); }, HOLD);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { mark.addEventListener(ev, release); });
  mark.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openStaff(); } });
  function openStaff() {
    staff.hidden = false;
    scode.hidden = false; spanel.hidden = true;
    scode.elements.code.value = '';
    say($('.ca-staff__note'), '');
    $('.ca-confirm').hidden = true;
    if (!touch) scode.elements.code.focus();
  }
  function closeStaff() { staff.hidden = true; if (state.running) { arm(); awake(); } }
  scode.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = scode.elements.code, note = $('.ca-staff__note');
    if (scode.classList.contains('is-busy')) return;
    if (!plain(input.value)) { say(note, 'gate.empty', null, true); return; }
    scode.classList.add('is-busy');
    say(note, 'gate.checking');
    verify(input.value).then(function (ok) {
      scode.classList.remove('is-busy');
      input.value = '';
      if (!ok) { say(note, 'gate.wrong', null, true); shake(scode); return; }
      say(note, '');
      scode.hidden = true; spanel.hidden = false;
      say(pnote, '');
      drawPanel();
      flush();
    }, function () { scode.classList.remove('is-busy'); say(note, 'gate.offline', null, true); });
  });
  function mine() { return log.filter(function (e) { return e.event === S.event; }); }
  function drawPanel() {
    var list = mine(), n = function (f) { return list.filter(f).length; }, m = modelOf();
    $('.ca-staff__event').textContent = t('staff.event', { event: S.event || '—', model: m ? m.label[lang] : '—' });
    $('[data-n="names"]').textContent = list.length;
    $('[data-n="emails"]').textContent = n(function (e) { return !!e.email; });
    $('[data-n="consents"]').textContent = n(function (e) { return e.email && e.consent; });
    $('[data-n="prints"]').textContent = n(function (e) { return e.printed; });
    $('[data-n="waiting"]').textContent = log.filter(function (e) { return e.email && !e.sent; }).length;
    var line = $('.ca-staff__send');
    line.textContent = t('staff.send.' + sendState);
    line.classList.toggle('is-warn', sendState !== 'ok' && sendState !== 'idle');
  }
  staff.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'resume') { closeStaff(); return; }
    if (scode.hidden === false) return;            // everything else is behind the code
    if (act === 'reprint') {
      var last = mine().pop();
      if (!last) { say(pnote, 'staff.none', null, true); return; }
      C.load(last.script).then(function () {
        var res = C.fromChars(last.script, last.name, last.chars);
        if (!res) throw new Error('entry');
        return C.ready(last.model, res, 0, { qr: qrOpts(last.model, last.offer) });
      }).then(function (page) { staff.hidden = true; return print(page); }).then(function () { staff.hidden = false; }, function () { staff.hidden = false; say(pnote, 'err.failed', null, true); });
    } else if (act === 'csv') {
      save(new Blob([csvOf()], { type: 'text/csv;charset=utf-8' }), 'calligraphie-contacts-' + new Date().toISOString().slice(0, 10) + '.csv');
      say(pnote, 'staff.exported', { n: log.length });
    } else if (act === 'setup') { staff.hidden = true; openSetup(); }
    else if (act === 'full') full(!fullEl());
    else if (act === 'lock') { full(false); lockApp(); }
    else if (act === 'clear') { $('.ca-confirm').hidden = false; $('.ca-confirm p').textContent = t('staff.clearask', { n: log.length }); }
    else if (act === 'clear-no') $('.ca-confirm').hidden = true;
    else if (act === 'clear-yes') { log = []; keepLog(); $('.ca-confirm').hidden = true; drawPanel(); say(pnote, 'staff.cleared'); }
  });
  $('[data-act="lock"]', setup).addEventListener('click', lockApp);

  function csvOf() {
    var z = function (v) { return (v < 10 ? '0' : '') + v; };
    var when = function (iso) { var d = new Date(iso); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
    // a spreadsheet must read every cell as text, never as a formula
    var cell = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(v)) v = '\'' + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var yn = function (v) { return t(v ? 'yes' : 'no'); };
    var lines = [TEXT[lang].csv].concat(log.map(function (e) {
      var m = C.TEMPLATES[e.model], sc = C.SCRIPTS[e.script];
      return [when(e.at), e.event, m ? m.label[lang] : e.model, sc ? sc.label[lang] : e.script, e.name, e.chars, e.reading, e.email, e.email ? yn(e.consent) : '', yn(e.printed), e.email ? yn(e.sent === 1) : '', e.offer || ''];
    }));
    return '﻿' + lines.map(function (l) { return l.map(cell).join(';'); }).join('\r\n') + '\r\n';
  }
  function save(blob, name) {
    var url = URL.createObjectURL(blob), a = doc.createElement('a');
    a.href = url; a.download = name;
    body.appendChild(a); a.click(); body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
  }

  /* ---------- Printing: the model at its true size, alone on the page ---------- */
  function print(page) {
    var a4 = S.paper === 'a4', holder = doc.createElement('div'), ox = 20, oy = 20, w = page.w, h = page.h;
    holder.innerHTML = C.svgOf(page);
    var svg = holder.firstChild, inner = svg.innerHTML, NS = 'xmlns="http://www.w3.org/2000/svg"';
    if (a4) {                                        // on a sheet of A4, with the marks to cut along
      var marks = [[0, 0, -1, -1], [w, 0, 1, -1], [0, h, -1, 1], [w, h, 1, 1]].map(function (k) {
        return '<path d="M' + (ox + k[0] + k[2] * 2) + ' ' + (oy + k[1]) + 'h' + (k[2] * 6) + 'M' + (ox + k[0]) + ' ' + (oy + k[1] + k[3] * 2) + 'v' + (k[3] * 6) + '"/>';
      }).join('');
      printBox.innerHTML = '<svg ' + NS + ' width="210mm" height="297mm" viewBox="0 0 210 297"><g transform="translate(' + ox + ' ' + oy + ')">' + inner + '</g><g fill="none" stroke="#000" stroke-width=".12">' + marks + '</g></svg>';
    } else printBox.innerHTML = '<svg ' + NS + ' width="' + w + 'mm" height="' + h + 'mm" viewBox="0 0 ' + w + ' ' + h + '">' + inner + '</svg>';
    var rule = $('#ca-page') || doc.head.appendChild(doc.createElement('style'));
    rule.id = 'ca-page';
    rule.textContent = '@page { size: ' + (a4 ? 'A4 portrait' : w + 'mm ' + h + 'mm') + '; margin: 0; }';
    return new Promise(function (resolve) {
      var over = false, end = function () { if (over) return; over = true; window.removeEventListener('afterprint', end); resolve(); };
      window.addEventListener('afterprint', end);
      setTimeout(function () {
        try { window.print(); } catch (e) {}
        setTimeout(end, 900);                        // where printing does not hold the page, or says nothing when it is over
      }, 60);
    });
  }

  /* ---------- Handing the contacts over ---------- */
  var sending = false, sendState = 'idle', sendTimer = 0;
  function flush() {
    clearTimeout(sendTimer);
    if (sending || !BOX) return;
    var next = null;
    for (var i = 0; i < log.length; i++) if (log[i].email && !log[i].sent) { next = log[i]; break; }
    if (!next) return;
    if (navigator.onLine === false) { sendState = 'offline'; sendTimer = setTimeout(flush, 20000); return; }
    sending = true;
    var m = C.TEMPLATES[next.model];
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      pass: BOX.pass, id: next.id, at: next.at, event: next.event, brand: next.brand, model: next.model, model_name: m ? m.label.fr : next.model,
      script: next.script, name: next.name, chars: next.chars, reading: next.reading, email: next.email, consent: next.consent, lang: next.lang, offer: next.offer || '', device: device
    }) }).then(function (r) {
      if (r.ok) { next.sent = 1; sendState = 'ok'; }
      else if (r.status === 400) { next.sent = 2; sendState = 'ok'; }                 // an entry the server will never take: it stays in the export
      else sendState = r.status === 503 ? 'off' : r.status === 403 ? 'refused' : 'offline';
    }, function () { sendState = 'offline'; }).then(function () {
      sending = false;
      keepLog();
      if (!staff.hidden && !spanel.hidden) drawPanel();
      if (sendState === 'ok') flush();
      else sendTimer = setTimeout(flush, sendState === 'offline' ? 20000 : 120000);
    });
  }
  window.addEventListener('online', flush);

  /* ---------- Go ---------- */
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); }); });
  var asked = /[?&]lang=(en|fr)\b/.exec(location.search), kept = null;
  try { kept = localStorage.getItem('ben-lang'); } catch (e) {}
  setLang((asked && asked[1]) || (kept === 'en' ? 'en' : 'fr'), false);
  segState();
  fit();
  // the printed models and the offers a QR code can lead to: asked now, so that they are there when needed
  C.models().catch(function () {});
  C.offers().then(function (o) { offers = o; if (!setup.hidden && state.step === 3) { drawQr(); segState(); } });
  // this tab already opened the app: straight back to where the team left it
  restore().then(function (ok) {
    if (!ok) { if (!touch) gform.elements.code.focus({ preventScroll: true }); return; }
    return Promise.all([C.models().catch(function () {}), C.offers()]).then(function (got) {
      offers = got[1];
      if (S.running && scriptOf() && modelOf()) startKiosk(); else openSetup();
    });
  });
  // the app keeps working when the network of the venue drops (calligraphy-sw.js)
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/calligraphy-sw.js', { scope: '/calligraphy' }).catch(function () {});

  // for the automated checks
  window.BEN_CALLI_APP = {
    state: function () { return { step: state.step, running: state.running, screen: state.screen, settings: S, entries: log.length, send: sendState, open: !!BOX }; },
    entries: function () { return log.slice(); },
    csv: csvOf,
    flush: flush
  };
})();
