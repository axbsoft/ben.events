/* benevents agency — field logistics, shown live on two slides of a client presentation. Vanilla JS, no dependencies.

   1. A day of distribution on a map (class "flow", window.BEN_FLOW): the vans leave the warehouse, serve the
      points of sale of their zone one after the other and come back; the counters follow.
   2. The application the teams would use (class "logi", window.BEN_LOGI): goods received at the warehouse
      (scanned, counted, photographed), handed to the vans, delivered with a photo as proof; where each van is,
      the way it went and how long it stopped; the expenses of the drivers, each with its receipt; the day's report.

   What they show (zones, vans, points of sale, delivery notes, expenses) comes with the presentation itself, in
   the "data" of its descriptions (data.logi), encrypted with it on a client page: window.BEN_DECK_DATA, event
   ben:data. This file only holds the screens and their words, in French and in English.

   The photographs of the demonstration come with the data too (data.logi.photos); where there is none, a drawing
   takes its place.

   A demonstration: every figure is sample data, nothing is sent and nothing is stored. A photo taken with the
   phone's camera stays on the phone. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var flowRoot = $('.flow'), appRoot = $('.logi');
  if (!flowRoot && !appRoot) return;
  var lang = doc.documentElement.lang === 'en' ? 'en' : 'fr';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = null, P = {}, V = {};                       // the data; its points of sale and vans by id
  var SPEED = .07, KM = .031, STOP = 1.55;            // minutes of driving and km for one unit of the map; how long a stop lasts, against its base
  var T0 = 7 * 60 + 30, T1 = 16 * 60 + 45;            // the day shown: 07:30 to 16:45
  var COLOURS = ['#f9b24e', '#e94b5b', '#00adb0', '#5dbea3', '#8f7bf0', '#f48fb1', '#6cb6ff', '#c9d46a', '#ff8a5c', '#4fd1c5', '#b794f4', '#f6e05e', '#68d391', '#fc8181'];

  var TEXT = {
    fr: {
      demo: 'Démonstration · données d’exemple', scheme: 'Carte schématique', ocean: 'Océan Atlantique', port: 'Port', wh: 'Entrepôt',
      fEyebrow: 'Une journée type', fTitle: 'De {city} aux régions', fAway: 'véhicules dans les autres villes', fServed: 'Points de vente servis', fCartons: 'Cartons livrés', fVans: 'Véhicules en tournée', fKm: 'Km parcourus',
      fZones: 'Par zone et par ville', play: 'Lecture', pause: 'Pause', again: 'Rejouer',
      cap1: 'Réception et contrôle à l’entrepôt : chaque carton est scanné et photographié.', cap2: 'Chargement des véhicules 7 places, puis départ par zone ; les équipes des autres villes sont déjà sur l’autoroute.',
      cap3: 'Chaque point de vente est servi, photo à l’appui.', cap4: 'Pause des équipes, puis reprise des tournées.', cap5: 'Derniers points de vente, retour à l’entrepôt.', cap6: 'Tournées terminées : le rapport du jour part automatiquement.',
      app: 'Suivi terrain', tabs: { dash: 'Tableau de bord', recv: 'Réception', disp: 'Dispatch', deliv: 'Livraisons', vans: 'Véhicules', exp: 'Dépenses' },
      role: 'Vue responsable', now: 'Il est', served: 'Points de vente livrés', cartons: 'Cartons livrés', onRoad: 'Véhicules en tournée', stopped: 'sur place', spent: 'Dépenses du jour', toCheck: '{n} à valider',
      byZone: 'Avancement par zone et par ville', todo: 'À traiter', export: 'Exporter le rapport du jour (CSV)', nothing: 'Rien à signaler.',
      aGap: 'Écart à la réception · {id}', aDue: 'Réception attendue · {id}', aHalt: 'Arrêt non planifié · {van} · {min} min', aLate: 'Départ retardé · {van} · {at}', aExp: '{n} justificatif(s) à valider', aRefill: 'Réassort à préparer · {van}',
      see: 'Voir', notes: 'Bons de livraison', from: 'Provenance', expected: 'Attendu', received: 'Reçu', cartonsU: 'cartons', cartonU: 'carton', sOk: 'Conforme', sGap: 'Écart', sDue: 'Attendu', sNew: 'À valider', sNo: 'Refusé', sValid: 'Validé',
      step1: 'Scanner le bon', step2: 'Compter et photographier', step3: 'Valider la réception', scan: 'Scanner', scanning: 'Lecture du code…', scanned: 'Code lu', photo: 'Prendre la photo', camera: 'Avec l’appareil photo', retake: 'Reprendre',
      validate: 'Valider', checkedBy: 'Contrôlé par {who}', stock: 'Stock à l’entrepôt', famGoodies: 'Goodies et PLV', famProduct: 'Produits', inStock: 'en stock', loads: 'Chargements du jour', loaded: 'Chargé', left: 'Parti à {at}', team: '1 SPV + {n} CE',
      refill: 'Réassort', refillFor: 'Réassort demandé par {van}', prepare: 'Préparer et scanner', handed: 'Remis à {van} à {at}', round: 'Tournée', stopN: 'Arrêt', pDone: 'Livré', pNow: 'Sur place', pNext: 'À livrer',
      deliver: 'Valider la livraison', proof: 'Preuve de livraison', proofNone: 'La photo apparaîtra ici une fois la livraison validée.', receivedBy: 'Réceptionné par', manager: 'le gérant', gps: 'Position confirmée', at: 'à',
      vDepot: 'À l’entrepôt', vDrive: 'En route', vStop: 'Au point de vente · {min} min', vHalt: 'Arrêt non planifié · {min} min', vBreak: 'Pause · {min} min', vBack: 'Rentré', journey: 'Journée de {van}', driven: 'Conduite', halted: 'Arrêts', dist: 'Distance',
      lDepart: 'Départ de l’entrepôt', lLeave: 'Départ de Casablanca, par l’autoroute', vCountry: 'Maroc', lBreak: 'Pause', lHalt: 'Arrêt non planifié', lReturn: 'Retour à l’entrepôt', sDepot: 'Entrepôt', sDrive: 'En route', sStop: 'Sur place · {min} min', sHalt: 'Arrêt · {min} min', sBreak: 'Pause · {min} min', sBack: 'Rentré', pick: 'Choisissez un véhicule pour suivre sa journée : son trajet, ses arrêts et leur durée.', minU: 'min', expenses: 'Justificatifs', today: 'Aujourd’hui', week: 'Cette semaine', pending: 'À valider',
      kinds: { fuel: 'Carburant', parking: 'Parking', toll: 'Péage', wash: 'Lavage', repair: 'Entretien' }, add: 'Nouveau justificatif', amount: 'Montant (DH)', kind: 'Nature', van: 'Véhicule', receipt: 'Photo du ticket', save: 'Envoyer',
      guide: 'Aide', tips: {
        tab_dash: 'La journée en un coup d’œil : avancement, alertes, rapport.', tab_recv: 'L’entrepôt : chaque livraison fournisseur est scannée, comptée et photographiée.', tab_disp: 'Le stock et ce qui part dans chaque véhicule.',
        tab_deliv: 'Les tournées : chaque point de vente servi, photo à l’appui.', tab_vans: 'Où est chaque véhicule, par où il est passé, combien de temps il s’est arrêté.', tab_exp: 'Carburant, parking, péage : chaque dépense avec la photo de son ticket.',
        hClock: 'L’heure de la démonstration. Sur l’écran Véhicules, le curseur permet de la faire avancer.', hRole: 'Ici, la vue du responsable. Sur le terrain, chaque équipe ne voit que sa tournée, ses livraisons et ses dépenses.',
        dServed: 'Mis à jour dès qu’une livraison est validée sur place. Le total est celui des tournées du jour.', dCartons: 'Les cartons remis aux points de vente, sur ceux chargés ce matin.',
        dRoad: 'Position transmise par le boîtier GPS de chaque véhicule. « Sur place » : à l’arrêt chez un point de vente.', dSpent: 'La somme des justificatifs envoyés aujourd’hui ; ceux « à valider » attendent le responsable.',
        dZones: 'Une zone ou une ville, une équipe, un véhicule. La barre avance à chaque point de vente servi.', dTodo: 'Tout ce qui demande une décision : écart à la réception, arrêt non planifié, justificatif à valider. Un clic ouvre l’écran concerné.',
        dExport: 'Le rapport du jour, prêt à être transmis : une ligne par point de vente, avec l’heure de livraison.',
        rList: 'Chaque livraison fournisseur arrive avec un bon. « Attendu » : pas encore contrôlé. « Écart » : il manquait des cartons.', rSteps: 'Trois gestes, toujours dans le même ordre : scanner le bon, compter et photographier, valider.',
        rScan: 'Sur le terrain, l’appareil photo du téléphone lit le code-barres du bon. Essayez.', rPhoto: 'Comptez avec + et −, puis prenez la photo : elle est horodatée et rattachée au bon.',
        rConfirm: 'Si le compte est inférieur à l’attendu, la réception passe en « Écart » et le responsable est alerté.', rProof: 'La preuve conservée : la photo, l’heure, la personne qui a contrôlé, ligne par ligne.',
        sStock: 'Goodies et produits suivent le même circuit. Le stock se calcule tout seul : réceptions validées, moins ce qui est parti.', sLoads: 'Chaque véhicule est chargé pour sa tournée et scanné avant le départ ; l’heure de départ est enregistrée.',
        sRefill: 'Une équipe à court de goodies demande un réassort depuis son téléphone ; l’entrepôt le prépare et le scanne.',
        lVans: 'Une tournée par véhicule. Le compteur montre les points de vente déjà servis.', lRoute: 'L’ordre de passage de la tournée. Cliquez sur un point de vente livré pour revoir sa preuve.',
        lDeliver: 'Le SPV valide la livraison sur place : la photo est obligatoire. Essayez.', lProof: 'Ce qui est conservé : la photo, l’heure, la position et la personne qui a réceptionné.',
        vMap: 'Trait plein : le chemin parcouru. Pointillé : la suite prévue. Point plein : point de vente servi. Anneau rouge : arrêt non planifié.', vTime: 'Rejouez la journée : faites glisser le curseur ou lancez la lecture.', vView: 'La ville en détail, ou le pays : les véhicules envoyés à Rabat, Marrakech, Fès ou Tanger.',
        vFleet: 'Les 14 véhicules. Cliquez sur l’un d’eux pour ne suivre que lui ; ceux des autres villes ouvrent la carte du pays.', vJourney: 'Chaque arrêt, son heure et sa durée. En rouge : un arrêt hors point de vente, signalé au responsable.',
        eTotals: 'Les totaux du jour, de la semaine et par nature, sans les justificatifs refusés.', eList: 'Chaque dépense est rattachée à un véhicule et à la personne qui l’a envoyée.',
        eNew: 'Le conducteur photographie son ticket depuis son téléphone : nature, montant, photo. Essayez.', eDetail: 'Le responsable valide ou refuse. Un ticket illisible repart avec une demande de nouvelle photo.',
        eForm: 'Trois champs et une photo : sans photo du ticket, la dépense n’est pas envoyée.'
      },
      refuse: 'Refuser', sentBy: 'Envoyé par {who}', litres: '{n} L', badAmount: 'Saisissez un montant.', needPhoto: 'Ajoutez la photo du ticket.', file: 'rapport-du-jour',
      head: ['Véhicule', 'Point de vente', 'Zone', 'Cartons', 'État', 'Heure'], nearby: 'Station-service', total: 'TOTAL', thanks: 'MERCI DE VOTRE VISITE'
    },
    en: {
      demo: 'Demonstration · sample data', scheme: 'Schematic map', ocean: 'Atlantic Ocean', port: 'Port', wh: 'Warehouse',
      fEyebrow: 'A typical day', fTitle: 'From {city} to the regions', fAway: 'vans in other cities', fServed: 'Points of sale served', fCartons: 'Cartons delivered', fVans: 'Vans on their round', fKm: 'Km driven',
      fZones: 'By zone and by city', play: 'Play', pause: 'Pause', again: 'Replay',
      cap1: 'Goods received and checked at the warehouse: every carton is scanned and photographed.', cap2: 'The 7-seat vans are loaded, then leave for their zone; the teams for other cities are already on the motorway.',
      cap3: 'Each point of sale is served, with a photo as proof.', cap4: 'The teams take their break, then the rounds resume.', cap5: 'Last points of sale, back to the warehouse.', cap6: 'Rounds complete: the day’s report goes out on its own.',
      app: 'Field tracker', tabs: { dash: 'Dashboard', recv: 'Receiving', disp: 'Dispatch', deliv: 'Deliveries', vans: 'Vehicles', exp: 'Expenses' },
      role: 'Manager view', now: 'It is', served: 'Points of sale delivered', cartons: 'Cartons delivered', onRoad: 'Vans on their round', stopped: 'on site', spent: 'Expenses today', toCheck: '{n} to approve',
      byZone: 'Progress by zone and by city', todo: 'To handle', export: 'Export the day’s report (CSV)', nothing: 'Nothing to report.',
      aGap: 'Shortage on receipt · {id}', aDue: 'Delivery expected · {id}', aHalt: 'Unplanned stop · {van} · {min} min', aLate: 'Late departure · {van} · {at}', aExp: '{n} receipt(s) to approve', aRefill: 'Refill to prepare · {van}',
      see: 'View', notes: 'Delivery notes', from: 'From', expected: 'Expected', received: 'Received', cartonsU: 'cartons', cartonU: 'carton', sOk: 'Complete', sGap: 'Shortage', sDue: 'Expected', sNew: 'To approve', sNo: 'Refused', sValid: 'Approved',
      step1: 'Scan the note', step2: 'Count and photograph', step3: 'Confirm receipt', scan: 'Scan', scanning: 'Reading the code…', scanned: 'Code read', photo: 'Take the photo', camera: 'With the camera', retake: 'Retake',
      validate: 'Confirm', checkedBy: 'Checked by {who}', stock: 'Warehouse stock', famGoodies: 'Goodies and displays', famProduct: 'Products', inStock: 'in stock', loads: 'Today’s loads', loaded: 'Loaded', left: 'Left at {at}', team: '1 SPV + {n} CE',
      refill: 'Refill', refillFor: 'Refill requested by {van}', prepare: 'Prepare and scan', handed: 'Handed to {van} at {at}', round: 'Round', stopN: 'Stop', pDone: 'Delivered', pNow: 'On site', pNext: 'To deliver',
      deliver: 'Confirm delivery', proof: 'Proof of delivery', proofNone: 'The photo will appear here once the delivery is confirmed.', receivedBy: 'Received by', manager: 'the manager', gps: 'Position confirmed', at: 'at',
      vDepot: 'At the warehouse', vDrive: 'On the road', vStop: 'At the point of sale · {min} min', vHalt: 'Unplanned stop · {min} min', vBreak: 'Break · {min} min', vBack: 'Back', journey: '{van}’s day', driven: 'Driving', halted: 'Stops', dist: 'Distance',
      lDepart: 'Left the warehouse', lLeave: 'Left Casablanca, by the motorway', vCountry: 'Morocco', lBreak: 'Break', lHalt: 'Unplanned stop', lReturn: 'Back at the warehouse', sDepot: 'Warehouse', sDrive: 'On the road', sStop: 'On site · {min} min', sHalt: 'Stopped · {min} min', sBreak: 'Break · {min} min', sBack: 'Back', pick: 'Choose a van to follow its day: the way it went, where it stopped and for how long.', minU: 'min', expenses: 'Receipts', today: 'Today', week: 'This week', pending: 'To approve',
      kinds: { fuel: 'Fuel', parking: 'Parking', toll: 'Toll', wash: 'Car wash', repair: 'Maintenance' }, add: 'New receipt', amount: 'Amount (MAD)', kind: 'Type', van: 'Vehicle', receipt: 'Photo of the receipt', save: 'Send',
      guide: 'Help', tips: {
        tab_dash: 'The day at a glance: progress, alerts, report.', tab_recv: 'The warehouse: every supplier delivery is scanned, counted and photographed.', tab_disp: 'The stock, and what leaves in each van.',
        tab_deliv: 'The rounds: every point of sale served, with a photo as proof.', tab_vans: 'Where each van is, the way it went, how long it stopped.', tab_exp: 'Fuel, parking, tolls: every expense with the photo of its receipt.',
        hClock: 'The time of the demonstration. On the Vehicles screen, the slider moves it forward.', hRole: 'This is the manager’s view. In the field, each team only sees its round, its deliveries and its expenses.',
        dServed: 'Updated as soon as a delivery is confirmed on site. The total is that of today’s rounds.', dCartons: 'Cartons handed to points of sale, out of those loaded this morning.',
        dRoad: 'Position sent by the GPS unit of each van. “On site”: stopped at a point of sale.', dSpent: 'The sum of the receipts sent today; those “to approve” are waiting for the manager.',
        dZones: 'One zone or one city, one team, one van. The bar moves with every point of sale served.', dTodo: 'Everything that needs a decision: a shortage on receipt, an unplanned stop, a receipt to approve. A click opens the screen concerned.',
        dExport: 'The day’s report, ready to be passed on: one line per point of sale, with the time of delivery.',
        rList: 'Every supplier delivery comes with a note. “Expected”: not checked yet. “Shortage”: cartons were missing.', rSteps: 'Three steps, always in the same order: scan the note, count and photograph, confirm.',
        rScan: 'In the field, the phone’s camera reads the barcode of the note. Try it.', rPhoto: 'Count with + and −, then take the photo: it is time-stamped and attached to the note.',
        rConfirm: 'If the count is below what was expected, the delivery is marked “Shortage” and the manager is alerted.', rProof: 'The proof that is kept: the photo, the time, who checked, line by line.',
        sStock: 'Goodies and products follow the same circuit. The stock works itself out: deliveries confirmed, minus what has left.', sLoads: 'Each van is loaded for its round and scanned before it leaves; the time it left is recorded.',
        sRefill: 'A team running short of goodies asks for a refill from its phone; the warehouse prepares and scans it.',
        lVans: 'One round per van. The counter shows the points of sale already served.', lRoute: 'The order of the round. Click a delivered point of sale to see its proof again.',
        lDeliver: 'The SPV confirms the delivery on site: the photo is compulsory. Try it.', lProof: 'What is kept: the photo, the time, the position and who received the goods.',
        vMap: 'Solid line: the way already driven. Dotted: what is planned next. Filled dot: point of sale served. Red ring: unplanned stop.', vTime: 'Replay the day: drag the slider or press play.', vView: 'The city in detail, or the country: the vans sent to Rabat, Marrakech, Fez or Tangier.',
        vFleet: 'The 14 vans. Click one to follow it alone; those in other cities open the map of the country.', vJourney: 'Every stop, its time and its length. In red: a stop away from a point of sale, reported to the manager.',
        eTotals: 'Totals for the day, the week and by type, without the receipts refused.', eList: 'Every expense is tied to a van and to the person who sent it.',
        eNew: 'The driver photographs the receipt from the phone: type, amount, photo. Try it.', eDetail: 'The manager approves or refuses. An unreadable receipt goes back with a request for a new photo.',
        eForm: 'Three fields and a photo: without the photo of the receipt, the expense is not sent.'
      },
      refuse: 'Refuse', sentBy: 'Sent by {who}', litres: '{n} L', badAmount: 'Enter an amount.', needPhoto: 'Add the photo of the receipt.', file: 'daily-report',
      head: ['Vehicle', 'Point of sale', 'Zone', 'Cartons', 'Status', 'Time'], nearby: 'Service station', total: 'TOTAL', thanks: 'THANK YOU'
    }
  };
  function t(k, vars) {
    var s = TEXT[lang][k];
    if (s == null) s = TEXT.fr[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  function tr(o) { return o && typeof o === 'object' ? (o[lang] || o.fr || '') : (o == null ? '' : String(o)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function hm(m) { m = Math.round(m); return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
  function dur(m) { m = Math.round(m); return m < 60 ? m + ' ' + t('minU') : Math.floor(m / 60) + ' h ' + ('0' + (m % 60)).slice(-2); }
  function num(n, d) { return Number(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function money(n) { return num(n, n % 1 ? 2 : 0) + (lang === 'fr' ? ' DH' : ' MAD'); }
  function seed(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }

  /* ---------- the day, van by van: what each one does from the minute it leaves ---------- */
  function plan() {
    D.pos.forEach(function (p) { P[p.id] = p; p.map = p.map || 'city'; });
    D.vans.forEach(function (v, k) {
      var away = v.map === 'country', W = away ? D.country.hub : D.warehouse, pace = away ? D.country.speed : SPEED;
      v.map = v.map || 'city'; v.home = W; v.kmf = away ? D.country.km : KM;
      var x = W.x, y = W.y, at = v.depart, legs = [], pts = [[x, y]], paused = false;
      function drive(nx, ny) {
        var d = Math.hypot(nx - x, ny - y), m = Math.max(3, Math.round(d * pace));
        legs.push({ type: 'drive', t0: at, t1: at + m, a: [x, y], b: [nx, ny], d: d });
        at += m; x = nx; y = ny; pts.push([x, y]);
      }
      function stay(type, m, pos) { legs.push({ type: type, t0: at, t1: at + m, at: [x, y], pos: pos || null }); at += m; }
      v.colour = COLOURS[k % COLOURS.length];
      (v.via || []).forEach(function (q) { drive(q[0], q[1]); });                      // by the main roads to its zone
      v.route.forEach(function (id, i) {
        var p = P[id];
        drive(p.x, p.y);
        p.van = v.id; p.n = i + 1; p.arrive = at;
        stay('stop', Math.round(p.stop * STOP), p);
        p.leave = at;
        if (v.halt && v.halt.after === i + 1) { drive(x + v.halt.x_off, y + v.halt.y_off); stay('halt', v.halt.min); }
        if (!paused && at >= 12 * 60 + 25) { paused = true; stay('break', 40); }
      });
      (v.via || []).slice().reverse().forEach(function (q) { drive(q[0], q[1]); });   // and back the same way
      drive(W.x, W.y);
      v.legs = legs; v.pts = pts; v.end = at;
      v.total = legs.reduce(function (s, l) { return s + (l.d || 0); }, 0);
      v.cartons = v.route.reduce(function (s, id) { return s + P[id].cartons; }, 0);
      V[v.id] = v;
    });
  }
  // where a van is at minute m, what it is doing, since when, and how far it has driven (units of the map)
  function where(v, m) {
    var W = v.home, done = 0;
    if (m < v.depart) return { x: W.x, y: W.y, state: 'depot', d: 0, since: 0 };
    for (var i = 0; i < v.legs.length; i++) {
      var l = v.legs[i];
      if (m < l.t1) {
        if (l.type === 'drive') { var f = (m - l.t0) / (l.t1 - l.t0); return { x: l.a[0] + (l.b[0] - l.a[0]) * f, y: l.a[1] + (l.b[1] - l.a[1]) * f, state: 'drive', d: done + l.d * f, since: m - l.t0, leg: l }; }
        return { x: l.at[0], y: l.at[1], state: l.type, d: done, since: m - l.t0, leg: l };
      }
      done += l.d || 0;
    }
    return { x: W.x, y: W.y, state: 'back', d: done, since: m - v.end };
  }
  function isDone(p, m) { return !!p.proof || m >= p.leave; }
  function isNow(p, m) { return !isDone(p, m) && m >= p.arrive; }
  function doneAt(p) { return p.proof ? p.proof.at : hm(p.leave - 1); }
  function totals(m) {
    var o = { served: 0, cartons: 0, all: D.pos.length, allCartons: 0, road: 0, stopped: 0, km: 0, zones: {} };
    D.zones.forEach(function (z) { o.zones[z.id] = { done: 0, all: 0 }; });
    D.pos.forEach(function (p) { o.allCartons += p.cartons; o.zones[p.zone].all++; if (isDone(p, m)) { o.served++; o.cartons += p.cartons; o.zones[p.zone].done++; } });
    D.vans.forEach(function (v) { var w = where(v, m); o.km += w.d * v.kmf; if (w.state !== 'depot' && w.state !== 'back') { o.road++; if (w.state !== 'drive') o.stopped++; } });
    return o;
  }

  /* ---------- the map (schematic: the coast, the main roads, the zones) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  // kind 'city': the city in detail (coast, main roads, zones). kind 'country': the country, for the vans sent to other cities.
  function mapOf(host, opts) {
    var kind = opts.kind || 'city', away = kind === 'country', C = away ? D.country : D.map, vb = opts.view || C.view || [0, 0, C.w, C.h], id = opts.id;
    var vans = D.vans.filter(function (v) { return v.map === kind; }), poss = D.pos.filter(function (p) { return p.map === kind; });
    var line = function (pts) { return pts.map(function (q) { return q[0] + ' ' + q[1]; }).join('L'); };
    var Z = away ? { pos: 2.5, van: 8.4, ring: 12, font: 8.6 } : { pos: 4.2, van: 10.5, ring: 15, font: 11 }, base;
    if (away) {
      var up = C.atl.slice().reverse(), hub = C.hub;
      base = '<path class="lmap__land" d="M' + line(up) + 'L' + line(C.med.slice(1)) + 'L' + C.w + ' ' + C.h + 'Z"/><path class="lmap__coast" d="M' + line(up) + 'L' + line(C.med.slice(1)) + '"/>' +
        C.roads.map(function (r) { return '<path class="lmap__road is-main" d="M' + line(r) + '"/>'; }).join('') +
        C.cities.map(function (c) { return '<g class="lmap__city"><circle cx="' + c.x + '" cy="' + c.y + '" r="3.2"/><text x="' + (c.x + 9) + '" y="' + (c.y - 8) + '">' + esc(c.name) + '</text></g>'; }).join('') +
        '<g class="lmap__wh lmap__wh--hub" transform="translate(' + hub.x + ' ' + hub.y + ')"><circle class="lmap__pulse" r="12"/><rect x="-7.500" y="-6" width="15" height="12" rx="2"/><path d="M-7.500 -6 0 -11.500 7.500 -6"/><text x="-12" y="4" text-anchor="end">' + esc(hub.name) + '</text></g>';
    } else {
      var c = C.coast, wh = D.warehouse;
      var roads = ['M40 505C150 420 250 330 330 240S470 160 560 150S720 120 820 100S940 70 1000 55',                     // the coast road
        'M60 600C200 520 340 500 470 500S690 470 790 380S930 230 1000 190',                                                  // the motorway round the city
        'M566 150C540 250 520 340 520 500', 'M566 150C640 230 700 300 790 380', 'M566 150C470 230 400 330 330 460', 'M330 240C420 300 560 330 720 350', 'M566 150C680 170 760 185 870 150'];
      base = '<path class="lmap__land" d="M' + line(c) + 'L' + C.w + ' ' + C.h + 'L0 ' + C.h + 'Z"/><path class="lmap__coast" d="M' + line(c) + '"/>' +
        roads.map(function (d, i) { return '<path class="lmap__road' + (i === 1 ? ' is-main' : '') + '" d="' + d + '"/>'; }).join('') +
        '<text class="lmap__sea" x="' + (vb[0] + 46) + '" y="' + (vb[1] + 118) + '" transform="rotate(-33 ' + (vb[0] + 46) + ' ' + (vb[1] + 118) + ')" data-w="ocean"></text>' +
        '<text class="lmap__note" x="' + (vb[0] + 14) + '" y="' + (vb[1] + vb[3] - 12) + '" data-w="scheme"></text>' +
        '<g class="lmap__port"><circle cx="586" cy="108" r="5"/><text x="598" y="103" data-w="port"></text></g>' +
        D.zones.filter(function (z) { return z.map === 'city'; }).map(function (z) { return '<text class="lmap__zone" x="' + z.x + '" y="' + (z.y - 62) + '" text-anchor="middle">' + esc(z.name) + '</text>'; }).join('') +
        '<g class="lmap__wh" transform="translate(' + wh.x + ' ' + wh.y + ')"><circle class="lmap__pulse" r="16"/><rect x="-11" y="-9" width="22" height="18" rx="3"/><path d="M-11 -9 0 -17 11 -9"/><text y="34" text-anchor="middle" data-w="wh"></text></g>';
    }
    var path = function (v) { return 'M' + v.pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L'); };
    host.innerHTML = '<svg class="lmap lmap--' + kind + '" viewBox="' + vb.join(' ') + '" role="img" aria-label="' + esc(away ? C.hub.name : D.city) + '" preserveAspectRatio="xMidYMid meet">' +
      '<defs><linearGradient id="lm-sea' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d2a3d"/><stop offset="1" stop-color="#0a1b29"/></linearGradient></defs>' +
      '<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" fill="url(#lm-sea' + id + ')"/>' + base +
      vans.map(function (v) { return '<path class="lmap__plan" data-van="' + v.id + '" d="' + path(v) + '"/>'; }).join('') +
      vans.map(function (v) { return '<path class="lmap__trail" data-van="' + v.id + '" stroke="' + v.colour + '" stroke-dasharray="' + v.total.toFixed(1) + '" stroke-dashoffset="' + v.total.toFixed(1) + '" d="' + path(v) + '"/>'; }).join('') +
      poss.map(function (q) { return '<circle class="lmap__pos" data-pos="' + q.id + '" cx="' + q.x + '" cy="' + q.y + '" r="' + Z.pos + '" style="--c:' + V[q.van].colour + '"/>'; }).join('') +
      vans.map(function (v) { return '<g class="lmap__van" data-van="' + v.id + '" style="--c:' + v.colour + '"><circle class="lmap__ring" r="' + Z.ring + '"/><circle r="' + Z.van + '"/><text y="' + (Z.font * .36).toFixed(1) + '" text-anchor="middle" style="font-size:' + Z.font + 'px">' + v.id.slice(1) + '</text></g>'; }).join('') +
      '</svg>';
    var m = { svg: host.firstChild, kind: kind, list: vans, poss: poss, vans: {}, trails: {}, plans: {}, pos: {}, last: {} };
    $$('.lmap__van', host).forEach(function (g) { m.vans[g.getAttribute('data-van')] = g; });
    $$('.lmap__trail', host).forEach(function (g) { m.trails[g.getAttribute('data-van')] = g; });
    $$('.lmap__plan', host).forEach(function (g) { m.plans[g.getAttribute('data-van')] = g; });
    $$('.lmap__pos', host).forEach(function (g) { m.pos[g.getAttribute('data-pos')] = g; });
    mapWords(m);
    return m;
  }
  function mapWords(m) { $$('[data-w]', m.svg).forEach(function (el) { el.textContent = t(el.getAttribute('data-w')); }); }
  // the map at minute t; sel: the van looked at (the others of its map fade), or ''
  function mapAt(m, tm, sel) {
    sel = sel && V[sel] && V[sel].map === m.kind ? sel : '';
    m.list.forEach(function (v) {
      var w = where(v, tm), g = m.vans[v.id], cls = 'lmap__van is-' + w.state + (sel && sel !== v.id ? ' is-off' : '') + (sel === v.id ? ' is-sel' : '');
      g.setAttribute('transform', 'translate(' + w.x.toFixed(1) + ' ' + w.y.toFixed(1) + ')');
      if (m.last[v.id] !== cls) { g.setAttribute('class', cls); m.last[v.id] = cls; }
      m.trails[v.id].setAttribute('stroke-dashoffset', (v.total - w.d).toFixed(1));
      m.trails[v.id].style.opacity = sel && sel !== v.id ? .12 : '';
      m.plans[v.id].style.opacity = sel ? (sel === v.id ? .55 : .05) : '';
    });
    m.poss.forEach(function (q) {
      var cls = 'lmap__pos' + (isDone(q, tm) ? ' is-done' : isNow(q, tm) ? ' is-now' : '') + (sel && sel !== q.van ? ' is-off' : ''), g = m.pos[q.id];
      if (m.last[q.id] !== cls) { g.setAttribute('class', cls); m.last[q.id] = cls; }
    });
  }

  /* ---------- 1. the day on the map ---------- */
  var flow = { t: T0, on: false, raf: 0, last: 0, map: null, parts: {}, held: 0 };
  var LOOP = 34000;                                     // ms for the whole day
  function flowBuild() {
    var c = $('.flow__main', flowRoot);
    var awayN = D.vans.filter(function (v) { return v.map === 'country'; }).length;
    c.innerHTML = '<div class="flow__maps"><div class="flow__map"></div>' + (awayN ? '<div class="flow__inset"><div class="flow__away"></div><p><b>' + awayN + '</b><span data-w="fAway"></span></p></div>' : '') + '</div><div class="flow__panel">' +
      '<p class="lg-eyebrow"><i></i><span data-w="fEyebrow"></span></p><h2 class="flow__title"></h2>' +
      '<p class="flow__clock"><b></b><span></span></p>' +
      '<div class="flow__stats"><p><b data-k="served"></b><span data-w="fServed"></span></p><p><b data-k="cartons"></b><span data-w="fCartons"></span></p><p><b data-k="road"></b><span data-w="fVans"></span></p><p><b data-k="km"></b><span data-w="fKm"></span></p></div>' +
      '<p class="flow__sub" data-w="fZones"></p><ul class="flow__zones">' + D.zones.map(function (z, i) { return '<li data-zone="' + z.id + '"><span>' + esc(z.name.split(' · ')[0]) + '</span><i><b style="background:' + COLOURS[i % COLOURS.length] + '"></b></i><em></em></li>'; }).join('') + '</ul>' +
      '<div class="flow__ctl"><button type="button" class="lg-btn" data-act="flow-toggle"></button><button type="button" class="lg-btn lg-btn--ghost" data-act="flow-again"></button><span class="flow__demo" data-w="demo"></span></div></div>' +
      '<p class="flow__cap"></p>';
    flow.map = mapOf($('.flow__map', c), { id: 'f' });
    flow.far = awayN ? mapOf($('.flow__away', c), { id: 'g', kind: 'country', view: D.country.inset }) : null;
    flow.parts = { title: $('.flow__title', c), clock: $('.flow__clock b', c), day: $('.flow__clock span', c), cap: $('.flow__cap', c), toggle: $('[data-act="flow-toggle"]', c), again: $('[data-act="flow-again"]', c), stats: {}, zones: {} };
    $$('[data-k]', c).forEach(function (b) { flow.parts.stats[b.getAttribute('data-k')] = b; });
    $$('.flow__zones li', c).forEach(function (li) { flow.parts.zones[li.getAttribute('data-zone')] = li; });
    c.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      if (b.getAttribute('data-act') === 'flow-toggle') { if (flow.on) flowStop(); else { if (flow.t >= T1) flow.t = T0; flowPlay(); } }
      else { flow.t = T0; flow.held = 0; flowPlay(); }
    });
    flowWords();
    flowDraw();
  }
  function flowWords() {
    if (!flow.map) return;
    $$('[data-w]', flowRoot).forEach(function (el) { el.textContent = t(el.getAttribute('data-w')); });
    flow.parts.title.textContent = t('fTitle', { city: D.city });
    flow.parts.day.textContent = tr(D.day);
    flow.parts.again.textContent = t('again');
    flowDraw();
  }
  function flowDraw() {
    var m = flow.t, o = totals(m), p = flow.parts;
    mapAt(flow.map, m, '');
    if (flow.far) mapAt(flow.far, m, '');
    p.clock.textContent = hm(m);
    p.stats.served.textContent = o.served + ' / ' + o.all;
    p.stats.cartons.textContent = o.cartons;
    p.stats.road.textContent = o.road + ' / ' + D.vans.length;
    p.stats.km.textContent = num(o.km);
    D.zones.forEach(function (z) { var li = p.zones[z.id], q = o.zones[z.id]; li.querySelector('b').style.width = (100 * q.done / q.all) + '%'; li.querySelector('em').textContent = q.done + '/' + q.all; });
    var cap = m < 8 * 60 ? 'cap1' : m < 8 * 60 + 40 ? 'cap2' : m < 12 * 60 + 30 ? 'cap3' : m < 13 * 60 + 20 ? 'cap4' : o.road > 0 ? 'cap5' : 'cap6';
    if (p.capKey !== cap + lang) { p.capKey = cap + lang; p.cap.textContent = t(cap); p.cap.classList.remove('is-in'); void p.cap.offsetWidth; p.cap.classList.add('is-in'); }
    p.toggle.textContent = flow.on ? t('pause') : t('play');
  }
  function flowStep(now) {
    if (!flow.on) return;
    var dt = Math.min(80, now - (flow.last || now));
    flow.last = now;
    if (flow.t >= T1) { flow.held += dt; if (flow.held > 3200) { flow.held = 0; flow.t = T0; } }
    else flow.t = Math.min(T1, flow.t + dt * (T1 - T0) / LOOP);
    flowDraw();
    flow.raf = requestAnimationFrame(flowStep);
  }
  function flowPlay() { if (flow.on || !flow.map) return; flow.on = true; flow.last = 0; flow.raf = requestAnimationFrame(flowStep); flowDraw(); }
  function flowStop() { flow.on = false; cancelAnimationFrame(flow.raf); if (flow.map) flowDraw(); }

  /* ---------- sample "photos": drawn, so that the demonstration needs no picture of anyone's shop or receipt ---------- */
  var shots = {};                                       // a real photo taken during the demonstration, by what it shows (it never leaves the device)
  // a photograph that comes with the data (always the same one for the same thing), or '' when there is none of that kind
  function pick(kind, key) { var a = D.photos && D.photos[kind]; return a && a.length ? a[Math.floor(seed(kind + key)() * a.length) % a.length] : ''; }
  function frame(key, inner, stamp, photo) {
    if (shots[key] || photo) return '<figure class="lpic"><img src="' + (shots[key] || photo) + '" alt=""><figcaption>' + esc(stamp) + '</figcaption></figure>';
    return '<figure class="lpic"><svg viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + inner + '</svg><figcaption>' + esc(stamp) + '</figcaption></figure>';
  }
  function picBoxes(key, label, stamp, missing) {
    var ph = pick('boxes', key);
    if (ph) return frame(key, '', stamp, ph);
    var r = seed(key), s = '<rect width="320" height="220" fill="#23262c"/><rect y="150" width="320" height="70" fill="#34373d"/><path d="M0 150H320" stroke="#4a4e56"/>' +
      '<path d="M20 20V150M110 20V150M210 20V150M300 20V150M20 60H300M20 105H300" stroke="#3a3e46" stroke-width="3"/><rect x="52" y="178" width="216" height="12" rx="2" fill="#7b5a36"/><path d="M66 190v10M160 190v10M254 190v10" stroke="#5e4428" stroke-width="10"/>';
    for (var row = 0; row < 3; row++) for (var col = 0; col < 3; col++) {
      if (row === 2 && col === 2 && missing) continue;
      if (row === 2 && r() < .3 && !missing) continue;
      var x = 58 + col * 69 + (r() - .5) * 5, y = 132 - row * 47, c = ['#c79a5b', '#b98a4a', '#d0a566'][Math.floor(r() * 3)];
      s += '<rect x="' + x.toFixed(1) + '" y="' + y + '" width="64" height="45" rx="2" fill="' + c + '"/><rect x="' + (x + 28).toFixed(1) + '" y="' + y + '" width="8" height="45" fill="#e6cf9f" opacity=".7"/>' +
        '<rect x="' + (x + 5).toFixed(1) + '" y="' + (y + 22) + '" width="22" height="16" fill="#f4f1e8"/><path d="M' + (x + 8).toFixed(1) + ' ' + (y + 26) + 'v8m3-8v8m2-8v8m4-8v8m2-8v8" stroke="#222" stroke-width="1.2"/>';
    }
    return frame(key, s, stamp);
  }
  function picShop(key, stamp) {
    var ph = pick('shop', key);
    if (ph) return frame(key, '', stamp, ph);
    var r = seed(key), s = '<rect width="320" height="220" fill="#2b2622"/><rect y="150" width="320" height="70" fill="#5b4632"/><rect y="146" width="320" height="8" fill="#7a5f43"/>';
    for (var row = 0; row < 3; row++) {
      s += '<rect x="14" y="' + (22 + row * 40) + '" width="292" height="3" fill="#4a3f36"/>';
      for (var i = 0; i < 17; i++) s += '<rect x="' + (18 + i * 17) + '" y="' + (row * 40 + 2 + Math.floor(r() * 5)) + '" width="13" height="' + (20 - Math.floor(r() * 4)) + '" rx="1.5" fill="' + ['#8a8f99', '#6f7782', '#a39b8d', '#7d8894', '#93877a'][Math.floor(r() * 5)] + '" opacity=".75"/>';
    }
    s += '<path d="M118 150l10-64h64l10 64z" fill="#f4f1e8"/><rect x="132" y="96" width="56" height="7" rx="3.5" fill="#f9b24e"/><rect x="132" y="108" width="56" height="7" rx="3.5" fill="#e94b5b"/><rect x="132" y="120" width="56" height="7" rx="3.5" fill="#00adb0"/><rect x="140" y="134" width="40" height="5" rx="2.5" fill="#c9c4b8"/>' +
      '<rect x="226" y="118" width="60" height="34" rx="2" fill="#c79a5b"/><path d="M226 118l12-12h60l-12 12z" fill="#d7ad70"/><rect x="250" y="118" width="8" height="34" fill="#e6cf9f" opacity=".7"/>' +
      '<rect x="30" y="126" width="46" height="26" rx="3" fill="#1c1c1f"/><rect x="34" y="130" width="38" height="14" rx="2" fill="#2f6f73"/>';
    return frame(key, s, stamp);
  }
  function picTicket(e, big) {
    var key = e.id, lines = [t('kinds')[e.kind].toUpperCase(), tr(e.day) + '  ' + e.at, e.van + ' · ' + e.who];
    if (e.litres) lines.push('GASOIL  ' + num(e.litres, 1) + ' L');
    var s = '<rect width="320" height="220" fill="#1d1a17"/><g transform="rotate(-4 160 110)"><rect x="92" y="10" width="136" height="204" rx="3" fill="#f6f3ea"/>' +
      '<text x="160" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="#222" font-family="monospace">' + esc(t('nearby').toUpperCase()) + '</text><path d="M102 42H218" stroke="#999" stroke-dasharray="3 3"/>' +
      lines.map(function (l, i) { return '<text x="104" y="' + (60 + i * 16) + '" font-size="9" fill="#333" font-family="monospace">' + esc(l) + '</text>'; }).join('') +
      '<path d="M102 132H218" stroke="#999" stroke-dasharray="3 3"/><text x="104" y="152" font-size="11" font-weight="700" fill="#111" font-family="monospace">' + esc(t('total')) + '</text><text x="216" y="152" text-anchor="end" font-size="11" font-weight="700" fill="#111" font-family="monospace">' + esc(num(e.amount, 2)) + '</text>' +
      '<path d="M108 168v22m4-22v22m3-22v22m5-22v22m3-22v22m6-22v22m3-22v22m4-22v22m6-22v22m3-22v22m5-22v22m3-22v22m6-22v22m4-22v22m3-22v22m6-22v22m4-22v22m3-22v22m5-22v22m4-22v22m3-22v22m6-22v22m3-22v22m5-22v22" stroke="#222" stroke-width="1.6"/>' +
      '<text x="160" y="205" text-anchor="middle" font-size="7.5" fill="#666" font-family="monospace">' + esc(t('thanks')) + '</text></g>';
    var ph = e.kind === 'fuel' && seed(key)() < .34 ? pick('fuel', key) : pick('receipt', key);
    return frame(key, s, (e.id === 'DEP-NEW' ? '' : e.id + ' · ') + tr(e.day) + ' ' + e.at, ph).replace('class="lpic"', 'class="lpic' + (big ? ' lpic--tall' : '') + (e.status === 'no' ? ' is-blurred' : '') + '"');
  }
  function barcode(code) { var r = seed(code), s = ''; for (var i = 0, x = 6; x < 214; i++) { var w = 1 + Math.floor(r() * 3) * 1.5; s += '<rect x="' + x + '" y="6" width="' + w + '" height="56"/>'; x += w + 1.5 + Math.floor(r() * 2) * 1.5; } return '<svg class="lg-code" viewBox="0 0 220 84" aria-hidden="true">' + s + '<text x="110" y="78" text-anchor="middle">' + esc(code) + '</text></svg>'; }

  /* ---------- 2. the application ---------- */
  var app = { tab: 'dash', now: 0, van: '', pos: '', note: '', exp: '', view: 'city', job: null, form: null, on: false, raf: 0, last: 0, map: null, parts: {}, guide: true };
  var ICON = {
    dash: '<path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-3H4zM14 7h6V4h-6z"/>', recv: '<path d="M3 8l9-5 9 5v9l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/>',
    disp: '<path d="M4 6h16M4 12h10M4 18h7"/><path d="M17 15l3 3-3 3"/>', deliv: '<path d="M5 12l4.5 4.5L19 7"/><rect x="3" y="3" width="18" height="18" rx="4"/>',
    vans: '<path d="M2 7h11v9H2zM13 10h5l4 3v3h-9z"/><circle cx="6.500" cy="17.500" r="1.800"/><circle cx="17.500" cy="17.500" r="1.800"/>', exp: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'
  };
  function cu(n) { return n + ' ' + t(n > 1 ? 'cartonsU' : 'cartonU'); }
  function chip(kind, text) { return '<i class="lg-chip is-' + kind + '">' + esc(text) + '</i>'; }
  function skuName(id) { var s = D.skus.filter(function (k) { return k.id === id; })[0]; return s ? tr(s.name) : id; }
  function noteQty(n, k) { return n.lines.reduce(function (s, l) { return s + l[k]; }, 0); }
  function vanLabel(v) { return v.id + ' · ' + v.plate; }
  function zoneName(id) { return D.zones.filter(function (z) { return z.id === id; })[0].name; }
  function pending() { return D.expenses.filter(function (e) { return e.status === 'new'; }).length; }
  function alerts() {
    var a = [];
    D.receipts.forEach(function (n) { if (n.status === 'gap') a.push({ kind: 'warn', text: t('aGap', { id: n.id }), tab: 'recv', id: n.id }); if (n.status === 'due') a.push({ kind: 'info', text: t('aDue', { id: n.id }), tab: 'recv', id: n.id }); });
    D.vans.forEach(function (v) {
      v.legs.forEach(function (l) { if (l.type === 'halt' && app.now >= l.t0 + 10) a.push({ kind: 'bad', text: t('aHalt', { van: v.id, min: Math.round(Math.min(app.now, l.t1) - l.t0) }), tab: 'vans', id: v.id }); });
      if (v.late) a.push({ kind: 'warn', text: t('aLate', { van: v.id, at: hm(v.depart) }), tab: 'vans', id: v.id });
    });
    if (D.refill && !D.refill.done) a.push({ kind: 'info', text: t('aRefill', { van: D.refill.van }), tab: 'disp', id: '' });
    if (pending()) a.push({ kind: 'info', text: t('aExp', { n: pending() }), tab: 'exp', id: '' });
    return a;
  }

  function vDash() {
    var o = totals(app.now), today = D.expenses.filter(function (e) { return e.status !== 'no' && (e.day.fr === 'Aujourd’hui'); }).reduce(function (s, e) { return s + e.amount; }, 0), al = alerts();
    return '<div class="lg-kpis">' +
      '<div class="lg-kpi" data-tip="dServed"><span>' + t('served') + '</span><b>' + o.served + '<small> / ' + o.all + '</small></b><i class="lg-bar"><b style="width:' + (100 * o.served / o.all) + '%"></b></i></div>' +
      '<div class="lg-kpi" data-tip="dCartons"><span>' + t('cartons') + '</span><b>' + o.cartons + '<small> / ' + o.allCartons + '</small></b><i class="lg-bar"><b style="width:' + (100 * o.cartons / o.allCartons) + '%"></b></i></div>' +
      '<div class="lg-kpi" data-tip="dRoad"><span>' + t('onRoad') + '</span><b>' + o.road + '<small> / ' + D.vans.length + '</small></b><em>' + o.stopped + ' ' + t('stopped') + ' · ' + num(o.km) + ' km</em></div>' +
      '<div class="lg-kpi" data-tip="dSpent"><span>' + t('spent') + '</span><b>' + esc(money(Math.round(today))) + '</b><em>' + t('toCheck', { n: pending() }) + '</em></div></div>' +
      '<div class="lg-cols"><section class="lg-card" data-tip="dZones"><h3>' + t('byZone') + '</h3><ul class="lg-zones">' +
      D.zones.map(function (z, i) { var q = o.zones[z.id]; return '<li><span><i style="background:' + D.vans[i].colour + '"></i>' + esc(z.name) + '</span><i class="lg-bar"><b style="width:' + (100 * q.done / q.all) + '%;background:' + D.vans[i].colour + '"></b></i><em>' + q.done + '/' + q.all + '</em></li>'; }).join('') + '</ul></section>' +
      '<section class="lg-card" data-tip="dTodo"><h3>' + t('todo') + '</h3>' + (al.length ? '<ul class="lg-alerts">' + al.map(function (a) { return '<li class="is-' + a.kind + '"><button type="button" data-act="go" data-tab="' + a.tab + '" data-id="' + a.id + '"><i></i><span>' + esc(a.text) + '</span><em>' + t('see') + '</em></button></li>'; }).join('') + '</ul>' : '<p class="lg-none">' + t('nothing') + '</p>') +
      '<button type="button" class="lg-btn lg-btn--ghost lg-export" data-act="csv" data-tip="dExport">' + t('export') + '</button></section></div>';
  }

  function vRecv() {
    var cur = D.receipts.filter(function (n) { return n.id === app.note; })[0] || D.receipts.filter(function (n) { return n.status === 'due'; })[0] || D.receipts[0];
    app.note = cur.id;
    var list = D.receipts.slice().reverse().map(function (n) {
      return '<li' + (n.id === cur.id ? ' class="is-sel"' : '') + '><button type="button" data-act="note" data-id="' + n.id + '"><b>' + n.id + '</b><span>' + esc(tr(n.from)) + '</span><em>' + esc(tr(n.day)) + (n.at ? ' · ' + n.at : '') + '</em>' +
        chip(n.status, t(n.status === 'ok' ? 'sOk' : n.status === 'gap' ? 'sGap' : 'sDue')) + '</button></li>';
    }).join('');
    var due = cur.status === 'due', j = app.job && app.job.id === cur.id ? app.job : null, counting = due && j && j.scanned;
    var rows = cur.lines.map(function (l, i) {
      var got = due ? (j && j.qty ? j.qty[i] : l[1]) : l[2];
      return '<tr' + (got < l[1] && (!due || counting) ? ' class="is-gap"' : '') + '><td><b>' + l[0] + '</b> ' + esc(skuName(l[0])) + '</td><td>' + l[1] + '</td><td>' +
        (counting ? '<span class="lg-qty"><button type="button" data-act="qty" data-i="' + i + '" data-d="-1" aria-label="−">−</button><b>' + got + '</b><button type="button" data-act="qty" data-i="' + i + '" data-d="1" aria-label="+">+</button></span>' : due ? '—' : got) + '</td></tr>';
    }).join('');
    var table = '<table class="lg-table"><thead><tr><th>' + t('cartonsU') + '</th><th>' + t('expected') + '</th><th>' + t('received') + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
    var right;
    if (!due) {
      right = '<div class="lg-proof">' + picBoxes(cur.id, cur.id + ' · ' + noteQty(cur, 2) + ' ' + t('cartonsU'), cur.id + ' · ' + tr(cur.day) + ' ' + cur.at, cur.status === 'gap') +
        '<div><p class="lg-meta">' + t('checkedBy', { who: esc(cur.by) }) + '</p>' + (cur.note ? '<p class="lg-warn">' + esc(tr(cur.note)) + '</p>' : '') + table + '</div></div>';
    } else {
      var st = !j || !j.scanned ? 1 : !j.shot ? 2 : 3;
      right = '<ol class="lg-steps"><li class="' + (st === 1 ? 'is-on' : 'is-done') + '"><b>1</b>' + t('step1') + '</li><li class="' + (st === 2 ? 'is-on' : st > 2 ? 'is-done' : '') + '"><b>2</b>' + t('step2') + '</li><li class="' + (st === 3 ? 'is-on' : '') + '"><b>3</b>' + t('step3') + '</li></ol>' +
        '<div class="lg-proof">' + (st === 1 ? '<div class="lg-scan' + (j && j.scanning ? ' is-on' : '') + '">' + barcode(cur.id) + '<i></i></div>' : j.shot ? picBoxes(cur.id, cur.id + ' · ' + j.qty.reduce(function (a, b) { return a + b; }, 0) + ' ' + t('cartonsU'), cur.id + ' · ' + tr(D.day) + ' ' + hm(app.now), false) : '<div class="lg-scan is-read">' + barcode(cur.id) + '<em>✓ ' + t('scanned') + '</em></div>') +
        '<div>' + table + '<div class="lg-actions">' +
        (st === 1 ? '<button type="button" class="lg-btn" data-act="scan" data-tip="rScan"' + (j && j.scanning ? ' disabled' : '') + '>' + (j && j.scanning ? t('scanning') : t('scan')) + '</button>' :
          st === 2 ? '<button type="button" class="lg-btn" data-act="shoot" data-tip="rPhoto">' + t('photo') + '</button>' + cam('note:' + cur.id) :
            '<button type="button" class="lg-btn" data-act="confirm-note" data-tip="rConfirm">' + t('step3') + '</button><button type="button" class="lg-btn lg-btn--ghost" data-act="reshoot">' + t('retake') + '</button>') + '</div></div></div>';
    }
    return '<div class="lg-cols lg-cols--side"><section class="lg-card" data-tip="rList"><h3>' + t('notes') + '</h3><ul class="lg-list">' + list + '</ul></section>' +
      '<section class="lg-card" data-tip="' + (due ? 'rSteps' : 'rProof') + '"><h3>' + cur.id + ' <small>' + esc(tr(cur.from)) + '</small></h3>' + right + '</section></div>';
  }
  function cam(key) { return '<label class="lg-btn lg-btn--ghost lg-cam"><input type="file" accept="image/*" capture="environment" data-shot="' + key + '">' + t('camera') + '</label>'; }

  function stockOf() {
    var got = {}, all = 0, out = D.vans.reduce(function (s, v) { return s + v.cartons; }, 0) + (D.refill && D.refill.done ? D.refill.lines.reduce(function (s, l) { return s + l[1]; }, 0) : 0);
    D.skus.forEach(function (k) { got[k.id] = 0; });
    D.receipts.forEach(function (n) { n.lines.forEach(function (l) { got[l[0]] += l[2]; all += l[2]; }); });
    return D.skus.map(function (k) { var here = Math.max(0, got[k.id] - Math.round(out * got[k.id] / (all || 1))); return { id: k.id, name: tr(k.name), here: here, got: got[k.id], fam: k.family || 'goodies' }; });
  }
  function vDisp() {
    var st = stockOf(), most = Math.max.apply(null, st.map(function (s) { return s.got; })) || 1, rf = D.refill, fams = ['goodies', 'product'].filter(function (f) { return st.some(function (s) { return s.fam === f; }); }), j = app.job && app.job.id === 'refill' ? app.job : null;
    var refill = !rf ? '' : '<div class="lg-refill" data-tip="sRefill"><h4>' + t('refillFor', { van: rf.van }) + '</h4><p>' + rf.lines.map(function (l) { return l[1] + ' × ' + esc(skuName(l[0])); }).join(' · ') + '</p>' +
      (rf.done ? '<p class="lg-ok">✓ ' + t('handed', { van: rf.van, at: rf.done }) + '</p>' + picBoxes('refill', rf.van + ' · ' + t('refill'), rf.van + ' · ' + tr(D.day) + ' ' + rf.done, false) :
        '<div class="lg-scan' + (j && j.scanning ? ' is-on' : '') + '">' + barcode(rf.van + '-R01') + '<i></i></div><div class="lg-actions"><button type="button" class="lg-btn" data-act="refill"' + (j && j.scanning ? ' disabled' : '') + '>' + (j && j.scanning ? t('scanning') : t('prepare')) + '</button></div>') + '</div>';
    return '<div class="lg-cols lg-cols--side"><section class="lg-card" data-tip="sStock"><h3>' + t('stock') + '</h3><ul class="lg-stock">' + fams.map(function (f) { return (fams.length > 1 ? '<li class="lg-fam">' + t(f === 'product' ? 'famProduct' : 'famGoodies') + '</li>' : '') + st.filter(function (s) { return s.fam === f; }).map(function (s) { return '<li><span><b>' + s.id + '</b> ' + esc(s.name) + '</span><i class="lg-bar"><b style="width:' + (100 * s.here / most) + '%"></b></i><em>' + s.here + '</em></li>'; }).join(''); }).join('') + '</ul>' + refill + '</section>' +
      '<section class="lg-card" data-tip="sLoads"><h3>' + t('loads') + '</h3><ul class="lg-loads">' + D.vans.map(function (v) {
        var gone = app.now >= v.depart;
        return '<li><i class="lg-dot" style="background:' + v.colour + '">' + v.id.slice(1) + '</i><span><b>' + esc(vanLabel(v)) + '</b><small>' + esc(zoneName(v.zone)) + ' · ' + esc(v.lead) + ' · ' + t('team', { n: v.team }) + '</small></span><em>' + cu(v.cartons) + '</em>' +
          chip(gone ? (v.late ? 'gap' : 'ok') : 'due', gone ? t('left', { at: hm(v.depart) }) : t('loaded')) + '</li>';
      }).join('') + '</ul></section></div>';
  }

  function vDeliv() {
    var v = V[app.van] || D.vans[0];
    app.van = v.id;
    var next = v.route.map(function (id) { return P[id]; }).filter(function (p) { return !isDone(p, app.now); })[0];
    var cur = P[app.pos] && P[app.pos].van === v.id ? P[app.pos] : (v.route.map(function (id) { return P[id]; }).filter(function (p) { return isDone(p, app.now); }).pop() || next);
    app.pos = cur ? cur.id : '';
    var tabs = '<div class="lg-vans" data-tip="lVans">' + D.vans.map(function (x) { var n = x.route.filter(function (id) { return isDone(P[id], app.now); }).length; return '<button type="button" data-act="van" data-id="' + x.id + '"' + (x.id === v.id ? ' class="is-sel"' : '') + '><i style="background:' + x.colour + '"></i>' + x.id + '<small>' + n + '/' + x.route.length + '</small></button>'; }).join('') + '</div>';
    var list = v.route.map(function (id) {
      var p = P[id], done = isDone(p, app.now), here = isNow(p, app.now);
      return '<li class="' + (p.id === app.pos ? 'is-sel' : '') + (done ? '' : ' is-todo') + '"><button type="button" data-act="pos" data-id="' + p.id + '"><b>' + p.n + '</b><span>' + esc(p.name) + '<small>' + p.id + ' · ' + cu(p.cartons) + '</small></span>' +
        chip(done ? 'ok' : here ? 'now' : 'due', done ? t('pDone') + ' ' + doneAt(p) : here ? t('pNow') : t('pNext')) + '</button>' + (next && p.id === next.id ? '<button type="button" class="lg-btn lg-btn--small" data-act="deliver" data-tip="lDeliver" data-id="' + p.id + '">' + t('deliver') + '</button>' : '') + '</li>';
    }).join('');
    var j = app.job && cur && app.job.id === cur.id ? app.job : null, right;
    if (!cur) right = '<p class="lg-none">' + t('proofNone') + '</p>';
    else if (j) right = (j.shot ? picShop(cur.id, cur.id + ' · ' + hm(app.now) + ' · GPS ✓') : '<div class="lg-empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.500"/></svg></div>') +
      '<p class="lg-meta"><b>' + esc(cur.name) + '</b> · ' + cur.id + ' · ' + cu(cur.cartons) + '</p><div class="lg-actions">' +
      (j.shot ? '<button type="button" class="lg-btn" data-act="confirm-pos">' + t('validate') + '</button><button type="button" class="lg-btn lg-btn--ghost" data-act="reshoot">' + t('retake') + '</button>' : '<button type="button" class="lg-btn" data-act="shoot">' + t('photo') + '</button>' + cam('pos:' + cur.id)) + '</div>';
    else if (isDone(cur, app.now)) right = picShop(cur.id, cur.id + ' · ' + doneAt(cur) + ' · GPS ✓') + '<dl class="lg-facts"><dt>' + esc(cur.name) + '</dt><dd>' + cur.id + ' · ' + esc(zoneName(cur.zone)) + '</dd><dt>' + t('pDone') + ' ' + t('at') + ' ' + doneAt(cur) + '</dt><dd>' + cu(cur.cartons) + ' · ' + t('gps') + ' ✓</dd>' +
      '<dt>' + t('receivedBy') + ' ' + t('manager') + '</dt><dd><svg class="lg-sign" viewBox="0 0 120 34" aria-hidden="true"><path d="M4 24c8-14 12-18 15-10s-6 14-2 12 9-16 14-14-2 12 3 10 8-10 13-9 0 9 6 8 10-9 16-9 3 7 10 6 14-6 22-7 9 3 14 2"/></svg></dd></dl>';
    else right = '<p class="lg-none">' + t('proofNone') + '</p>';
    return tabs + '<div class="lg-cols lg-cols--side lg-cols--flip"><section class="lg-card" data-tip="lRoute"><h3>' + t('round') + ' ' + esc(vanLabel(v)) + ' <small>' + esc(zoneName(v.zone)) + '</small></h3><ol class="lg-route">' + list + '</ol></section>' +
      '<section class="lg-card" data-tip="lProof"><h3>' + t('proof') + '</h3><div class="lg-proofbox">' + right + '</div></section></div>';
  }

  function stateText(w) { return w.state === 'depot' ? t('vDepot') : w.state === 'drive' ? t('vDrive') : w.state === 'back' ? t('vBack') : t(w.state === 'stop' ? 'vStop' : w.state === 'halt' ? 'vHalt' : 'vBreak', { min: Math.max(1, Math.round(w.since)) }); }
  function shortState(w) { return w.state === 'depot' ? t('sDepot') : w.state === 'drive' ? t('sDrive') : w.state === 'back' ? t('sBack') : t(w.state === 'stop' ? 'sStop' : w.state === 'halt' ? 'sHalt' : 'sBreak', { min: Math.max(1, Math.round(w.since)) }); }
  function vVans() {
    var n = { city: 0, country: 0 };
    D.vans.forEach(function (v) { n[v.map]++; });
    if (!n[app.view]) app.view = 'city';
    return '<div class="lg-cols lg-cols--map"><section class="lg-card lg-mapcard">' +
      (n.country ? '<div class="lg-views" data-tip="vView"><button type="button" data-act="view" data-id="city"' + (app.view === 'city' ? ' class="is-sel"' : '') + '>' + esc(D.city) + '<small>' + n.city + '</small></button><button type="button" data-act="view" data-id="country"' + (app.view === 'country' ? ' class="is-sel"' : '') + '>' + t('vCountry') + '<small>' + n.country + '</small></button></div>' : '') +
      '<div class="lg-map lg-map--' + app.view + '" data-tip="vMap"></div><div class="lg-time" data-tip="vTime"><button type="button" class="lg-btn lg-btn--small" data-act="play"></button><input type="range" min="' + T0 + '" max="' + T1 + '" step="1" value="' + Math.round(app.now) + '" aria-label="' + t('now') + '"><b></b></div><div class="lg-fleetwrap" data-tip="vFleet"><ul class="lg-fleetlist"></ul></div></section>' +
      '<section class="lg-card lg-fleet" data-tip="vJourney"><div class="lg-journey"></div></section></div>';
  }
  function vansFill(body) {
    app.map = mapOf($('.lg-map', body), { id: 'a', kind: app.view });
    hots(body);
    app.parts = { range: $('.lg-time input', body), clock: $('.lg-time b', body), play: $('[data-act="play"]', body), list: $('.lg-fleetlist', body), journey: $('.lg-journey', body) };
    app.parts.range.addEventListener('input', function () { appStop(); app.now = +this.value; vansDraw(); head(); });
    vansDraw();
  }
  function vansDraw() {
    var p = app.parts, sel = V[app.van] ? app.van : '';
    if (!app.map || !p.list || !p.list.isConnected) return;
    mapAt(app.map, app.now, sel);
    p.range.value = Math.round(app.now);
    p.clock.textContent = hm(app.now);
    p.play.textContent = app.on ? t('pause') : t('play');
    p.list.innerHTML = D.vans.map(function (v) {
      var w = where(v, app.now), n = v.route.filter(function (id) { return isDone(P[id], app.now); }).length;
      return '<li class="' + (v.id === sel ? 'is-sel ' : '') + 'is-' + w.state + (v.map !== app.view ? ' is-far' : '') + '"><button type="button" data-act="van" data-id="' + v.id + '" aria-label="' + esc(v.id + ' · ' + zoneName(v.zone) + ' · ' + stateText(w)) + '"><i class="lg-dot" style="background:' + v.colour + '">' + v.id.slice(1) + '</i><em>' + n + '/' + v.route.length + '</em></button></li>';
    }).join('');
    if (!sel) { p.journey.innerHTML = '<p class="lg-none">' + t('pick') + '</p>'; return; }
    var v = V[sel], w = where(v, app.now), drive = 0, halt = 0, stops = 0;
    var rows = ['<li class="' + (app.now >= v.depart ? '' : 'is-later') + '"><time>' + hm(v.depart) + '</time><span>' + t(v.map === 'country' ? 'lLeave' : 'lDepart') + '</span></li>'];
    v.legs.forEach(function (l) {
      var past = app.now >= l.t0, now = past && app.now < l.t1, m = Math.max(0, Math.min(app.now, l.t1) - l.t0);
      if (l.type === 'drive') { drive += m; return; }
      if (past) { halt += m; stops++; }
      rows.push('<li class="is-' + l.type + (past ? '' : ' is-later') + (now ? ' is-now' : '') + '"><time>' + hm(l.t0) + '</time><span>' + (l.type === 'stop' ? '<b>' + l.pos.n + '</b> ' + esc(l.pos.name) : t(l.type === 'halt' ? 'lHalt' : 'lBreak')) + '</span><em>' + Math.round(l.t1 - l.t0) + ' ' + t('minU') + '</em></li>');
    });
    rows.push('<li class="' + (app.now >= v.end ? '' : 'is-later') + '"><time>' + hm(v.end) + '</time><span>' + t('lReturn') + '</span></li>');
    p.journey.innerHTML = '<h4>' + t('journey', { van: v.id }) + ' <small>' + esc(zoneName(v.zone)) + ' · ' + esc(v.lead) + ' · ' + esc(v.plate) + '</small></h4><p class="lg-state is-' + w.state + '">' + esc(stateText(w)) + '</p>' +
      '<p class="lg-sum"><span>' + t('dist') + ' <b>' + num(w.d * v.kmf, v.map === 'country' ? 0 : 1) + ' km</b></span><span>' + t('driven') + ' <b>' + dur(drive) + '</b></span><span>' + t('halted') + ' <b>' + stops + ' · ' + dur(halt) + '</b></span></p><ol class="lg-legs">' + rows.join('') + '</ol>';
    var cur = $('.is-now', p.journey);
    if (cur && app.on) cur.scrollIntoView({ block: 'nearest' });
  }

  function vExp() {
    var all = D.expenses, ok = all.filter(function (e) { return e.status !== 'no'; }), today = ok.filter(function (e) { return e.day.fr === 'Aujourd’hui'; });
    var sum = function (a) { return a.reduce(function (s, e) { return s + e.amount; }, 0); };
    var cur = all.filter(function (e) { return e.id === app.exp; })[0] || all[0];
    app.exp = cur.id;
    var kinds = {};
    ok.forEach(function (e) { kinds[e.kind] = (kinds[e.kind] || 0) + e.amount; });
    var list = all.map(function (e) {
      return '<li' + (e.id === cur.id && !app.form ? ' class="is-sel"' : '') + '><button type="button" data-act="exp" data-id="' + e.id + '"><i class="lg-kind is-' + e.kind + '"></i><span><b>' + t('kinds')[e.kind] + '</b><small>' + e.van + ' · ' + esc(e.who) + ' · ' + esc(tr(e.day)) + ' ' + e.at + '</small></span><em>' + esc(money(e.amount)) + '</em>' +
        chip(e.status === 'ok' ? 'ok' : e.status === 'no' ? 'bad' : 'due', t(e.status === 'ok' ? 'sValid' : e.status === 'no' ? 'sNo' : 'sNew')) + '</button></li>';
    }).join('');
    var right;
    if (app.form) {
      var f = app.form;
      right = '<h3>' + t('add') + '</h3><div class="lg-form"><label><span>' + t('van') + '</span><select data-f="van">' + D.vans.map(function (v) { return '<option value="' + v.id + '"' + (f.van === v.id ? ' selected' : '') + '>' + esc(vanLabel(v)) + ' · ' + esc(v.lead) + '</option>'; }).join('') + '</select></label>' +
        '<label><span>' + t('kind') + '</span><select data-f="kind">' + Object.keys(t('kinds')).map(function (k) { return '<option value="' + k + '"' + (f.kind === k ? ' selected' : '') + '>' + t('kinds')[k] + '</option>'; }).join('') + '</select></label>' +
        '<label><span>' + t('amount') + '</span><input data-f="amount" inputmode="decimal" autocomplete="off" value="' + esc(f.amount) + '"></label>' +
        '<div class="lg-formpic">' + (f.shot ? picTicket({ id: 'DEP-NEW', kind: f.kind, day: D.day, at: hm(app.now), van: f.van, who: V[f.van].lead, amount: parseFloat(String(f.amount).replace(',', '.')) || 0, status: 'new' }, false) : '<div class="lg-empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg></div>') + '</div>' +
        '<div class="lg-actions"><button type="button" class="lg-btn lg-btn--ghost" data-act="shoot">' + t(f.shot ? 'retake' : 'photo') + '</button>' + cam('exp:new') + '<button type="button" class="lg-btn" data-act="save-exp">' + t('save') + '</button></div><p class="lg-note" role="status">' + esc(f.note || '') + '</p></div>';
    } else {
      right = '<h3>' + cur.id + ' <small>' + t('kinds')[cur.kind] + '</small></h3><div class="lg-proof lg-proof--exp">' + picTicket(cur, true) + '<div><p class="lg-amount">' + esc(money(cur.amount)) + '</p><p class="lg-meta">' + t('sentBy', { who: esc(cur.who) }) + ' · ' + cur.van + '<br>' + esc(tr(cur.day)) + ' ' + t('at') + ' ' + cur.at + (cur.litres ? ' · ' + t('litres', { n: num(cur.litres, 1) }) : '') + '</p>' +
        (cur.note ? '<p class="lg-warn">' + esc(tr(cur.note)) + '</p>' : '') + chip(cur.status === 'ok' ? 'ok' : cur.status === 'no' ? 'bad' : 'due', t(cur.status === 'ok' ? 'sValid' : cur.status === 'no' ? 'sNo' : 'sNew')) +
        (cur.status === 'new' ? '<div class="lg-actions"><button type="button" class="lg-btn" data-act="exp-ok">' + t('validate') + '</button><button type="button" class="lg-btn lg-btn--ghost" data-act="exp-no">' + t('refuse') + '</button></div>' : '') + '</div></div>';
    }
    return '<div class="lg-kpis lg-kpis--exp" data-tip="eTotals"><div class="lg-kpi"><span>' + t('today') + '</span><b>' + esc(money(Math.round(sum(today)))) + '</b></div><div class="lg-kpi"><span>' + t('week') + '</span><b>' + esc(money(Math.round(sum(ok)))) + '</b></div><div class="lg-kpi"><span>' + t('pending') + '</span><b>' + pending() + '</b></div>' +
      '<div class="lg-kpi lg-kpi--kinds">' + Object.keys(kinds).map(function (k) { return '<p><i class="lg-kind is-' + k + '"></i>' + t('kinds')[k] + '<b>' + esc(money(Math.round(kinds[k]))) + '</b></p>'; }).join('') + '</div></div>' +
      '<div class="lg-cols lg-cols--side lg-cols--flip"><section class="lg-card" data-tip="eList"><h3>' + t('expenses') + '<button type="button" class="lg-btn lg-btn--small" data-act="new-exp" data-tip="eNew">+ ' + t('add') + '</button></h3><ul class="lg-list lg-list--exp">' + list + '</ul></section><section class="lg-card" data-tip="' + (app.form ? 'eForm' : 'eDetail') + '">' + right + '</section></div>';
  }

  /* ---------- help: a word of explanation on each important part of a screen ----------
     A part says which word it carries (data-tip). With the help on, it wears a "?" marker: a click or a tap on the
     marker shows the word. On a computer the word also shows when the pointer rests on the part, help on or off. */
  var tip = { el: null, timer: 0, over: null, sticky: false, x: 0, y: 0 };
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function hots(root) {
    if (!root) return;
    $$('[data-tip]:not([data-quiet])', root).forEach(function (el) {
      for (var c = el.lastElementChild; c; c = c.previousElementSibling) if (c.className === 'lg-hot') return;
      var i = doc.createElement('i');
      i.className = 'lg-hot'; i.textContent = '?'; i.tabIndex = 0; i.setAttribute('role', 'button'); i.setAttribute('aria-label', t('guide'));
      el.appendChild(i);
    });
  }
  function tipHide() { clearTimeout(tip.timer); tip.sticky = false; tip.over = null; if (tip.el) tip.el.hidden = true; }
  // the word of a part, shown beside "from" (the marker, or where the pointer is)
  function tipShow(el, from, sticky) {
    var words = t('tips')[el.getAttribute('data-tip')], box = $('.logi__app', appRoot);
    if (!words || !tip.el || !box) return;
    var a = box.getBoundingClientRect(), k = a.width / box.offsetWidth || 1, b = tip.el;
    var r = from && from.getBoundingClientRect ? from.getBoundingClientRect() : { left: tip.x, right: tip.x, top: tip.y - 6, bottom: tip.y + 14 };
    b.textContent = words; b.hidden = false; b.style.left = '0px'; b.style.top = '0px';
    var w = b.offsetWidth, h = b.offsetHeight, cx = ((r.left + r.right) / 2 - a.left) / k, under = (r.bottom - a.top) / k + 10, over = (r.top - a.top) / k - h - 10;
    var x = Math.max(8, Math.min(box.offsetWidth - w - 8, cx - w / 2)), up = under + h > box.offsetHeight - 8 && over > 8;
    b.style.left = x + 'px'; b.style.top = (up ? over : under) + 'px';
    b.classList.toggle('is-up', up);
    b.style.setProperty('--ax', Math.max(14, Math.min(w - 14, cx - x)) + 'px');
    tip.sticky = !!sticky;
  }
  function guide(on) {
    app.guide = !!on;
    var box = $('.logi__app', appRoot);
    if (box) box.classList.toggle('is-guide', app.guide);
    tipHide();
    head();
  }

  var VIEWS = { dash: vDash, recv: vRecv, disp: vDisp, deliv: vDeliv, vans: vVans, exp: vExp };
  function head() {
    var h = $('.logi__head', appRoot);
    if (!h) return;
    h.innerHTML = '<h2>' + t('tabs')[app.tab] + '</h2><p><span>' + esc(tr(D.day)) + '</span><b data-tip="hClock">' + hm(app.now) + '</b><i data-tip="hRole">' + t('role') + '</i>' +
      '<button type="button" class="lg-guide" data-act="guide" aria-pressed="' + (app.guide ? 'true' : 'false') + '"><b>?</b>' + t('guide') + '</button></p>';
    hots(h);
    $$('.logi__nav button', appRoot).forEach(function (b) {
      var k = b.getAttribute('data-tab'), n = k === 'exp' ? pending() : k === 'recv' ? D.receipts.filter(function (x) { return x.status === 'due'; }).length : k === 'dash' ? alerts().length : 0;
      b.classList.toggle('is-sel', k === app.tab);
      b.setAttribute('aria-current', k === app.tab ? 'page' : 'false');
      b.querySelector('span').textContent = t('tabs')[k];
      b.querySelector('em').textContent = n || '';
    });
    $('.logi__name', appRoot).textContent = t('app');
    $('.logi__demo', appRoot).textContent = t('demo');
  }
  function show(keep) {
    var body = $('.logi__body', appRoot), y = keep ? body.scrollTop : 0;
    if (app.tab !== 'vans') appStop();
    body.setAttribute('data-view', app.tab);
    body.innerHTML = VIEWS[app.tab]();
    if (app.tab === 'vans') vansFill(body);
    body.scrollTop = y;
    head();
    tipHide();
    hots(body);
  }
  function go(tab, id) {
    app.tab = VIEWS[tab] ? tab : 'dash'; app.job = null; app.form = null;
    if (id) { if (tab === 'recv') app.note = id; if (tab === 'vans' || tab === 'deliv') app.van = id; }
    if (app.tab === 'vans' && V[app.van]) app.view = V[app.van].map;
    if (app.tab === 'vans' && !V[app.van]) app.van = (D.vans.filter(function (v) { return v.legs.some(function (l) { return l.type === 'halt' && app.now >= l.t0; }); })[0] || D.vans[0]).id;
    show();
  }
  function appStep(now) {
    if (!app.on) return;
    var dt = Math.min(80, now - (app.last || now));
    app.last = now;
    app.now = Math.min(T1, app.now + dt / 55);                       // a minute of the day every 55 ms
    if (app.now >= T1) app.on = false;
    vansDraw(); head();
    if (app.on) app.raf = requestAnimationFrame(appStep);
  }
  function appStop() { if (!app.on) return; app.on = false; cancelAnimationFrame(app.raf); if (app.parts.play && app.parts.play.isConnected) app.parts.play.textContent = t('play'); }
  function scanThen(job, done) { job.scanning = true; show(true); setTimeout(function () { job.scanning = false; done(); show(true); }, reduced ? 200 : 1300); }
  function csv() {
    var rows = [t('head')];
    D.vans.forEach(function (v) { v.route.forEach(function (id) { var p = P[id], d = isDone(p, app.now); rows.push([v.id, p.name + ' (' + p.id + ')', zoneName(p.zone), p.cartons, d ? t('pDone') : isNow(p, app.now) ? t('pNow') : t('pNext'), d ? doneAt(p) : '']); }); });
    return '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
  }
  function save(blob, name) { var url = URL.createObjectURL(blob), a = doc.createElement('a'); a.href = url; a.download = name; doc.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000); }

  function appBuild() {
    var c = $('.logi__main', appRoot);
    c.innerHTML = '<div class="logi__app is-guide"><nav class="logi__nav" aria-label="Application"><p class="logi__name"></p><ul>' + Object.keys(VIEWS).map(function (k) { return '<li><button type="button" data-act="tab" data-tab="' + k + '" data-tip="tab_' + k + '" data-quiet><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg><span></span><em></em></button></li>'; }).join('') + '</ul><p class="logi__demo"></p></nav>' +
      '<div class="logi__screen"><header class="logi__head"></header><div class="logi__body"></div></div><div class="lg-tip" role="tooltip" hidden></div></div>';
    app.now = D.now;
    tip.el = $('.lg-tip', c);
    c.addEventListener('click', function (e) {
      var hot = e.target.closest('.lg-hot');
      if (hot) { e.preventDefault(); if (tip.sticky && tip.over === hot) return tipHide(); tipShow(hot.parentNode, hot, true); tip.over = hot; return; }
      tipHide();
      var b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      var act = b.getAttribute('data-act'), id = b.getAttribute('data-id'), j = app.job;
      if (act === 'guide') guide(!app.guide);
      else if (act === 'tab') go(b.getAttribute('data-tab'));
      else if (act === 'go') go(b.getAttribute('data-tab'), id);
      else if (act === 'csv') save(new Blob([csv()], { type: 'text/csv;charset=utf-8' }), [D.client, t('file'), D.day.iso].join('-') + '.csv');
      else if (act === 'note') { app.note = id; app.job = null; show(); }
      else if (act === 'scan') { var n = D.receipts.filter(function (x) { return x.id === app.note; })[0]; app.job = { id: n.id, qty: n.lines.map(function (l) { return l[1]; }) }; scanThen(app.job, function () { app.job.scanned = true; }); }
      else if (act === 'qty' && j && j.qty) { var i = +b.getAttribute('data-i'), n2 = D.receipts.filter(function (x) { return x.id === j.id; })[0]; j.qty[i] = Math.max(0, Math.min(n2.lines[i][1], j.qty[i] + (+b.getAttribute('data-d')))); show(true); }
      else if (act === 'shoot') { if (app.form) app.form.shot = true; else if (j) j.shot = true; show(true); }
      else if (act === 'reshoot' && j) { j.shot = false; delete shots[(app.tab === 'recv' ? 'note:' : 'pos:') + j.id]; delete shots[j.id]; show(true); }
      else if (act === 'confirm-note' && j) { var n3 = D.receipts.filter(function (x) { return x.id === j.id; })[0]; n3.lines.forEach(function (l, k) { l[2] = j.qty[k]; }); n3.status = noteQty(n3, 2) < noteQty(n3, 1) ? 'gap' : 'ok'; n3.at = hm(app.now); n3.by = D.staff.keeper; app.job = null; show(); }
      else if (act === 'refill') { app.job = { id: 'refill' }; scanThen(app.job, function () { D.refill.done = hm(app.now); app.job = null; }); }
      else if (act === 'van') {
        app.van = app.tab === 'vans' && app.van === id ? '' : id; app.pos = ''; app.job = null;
        if (app.tab !== 'vans') show();
        else if (V[app.van] && V[app.van].map !== app.view) { app.view = V[app.van].map; show(true); }
        else vansDraw();
      }
      else if (act === 'view') { app.view = id; if (V[app.van] && V[app.van].map !== id) app.van = ''; show(true); }
      else if (act === 'pos') { app.pos = id; app.job = null; show(true); }
      else if (act === 'deliver') { app.pos = id; app.job = { id: id }; show(true); }
      else if (act === 'confirm-pos' && j) { P[j.id].proof = { at: hm(app.now) }; app.job = null; show(true); }
      else if (act === 'play') { if (app.on) appStop(); else { if (app.now >= T1) app.now = T0; app.on = true; app.last = 0; app.raf = requestAnimationFrame(appStep); } vansDraw(); }
      else if (act === 'exp') { app.exp = id; app.form = null; show(true); }
      else if (act === 'new-exp') { app.form = { van: D.vans[0].id, kind: 'fuel', amount: '', shot: false, note: '' }; show(true); }
      else if (act === 'exp-ok' || act === 'exp-no') { var x = D.expenses.filter(function (q) { return q.id === app.exp; })[0]; x.status = act === 'exp-ok' ? 'ok' : 'no'; show(true); }
      else if (act === 'save-exp') {
        var f = app.form, amount = parseFloat(String(f.amount).replace(',', '.'));
        if (!(amount > 0)) { f.note = t('badAmount'); return show(true); }
        if (!f.shot) { f.note = t('needPhoto'); return show(true); }
        var ne = { id: 'DEP-' + (4200 + D.expenses.length), day: { fr: 'Aujourd’hui', en: 'Today' }, at: hm(app.now), van: f.van, who: V[f.van].lead, kind: f.kind, amount: Math.round(amount * 100) / 100, status: 'new' };
        if (shots['exp:new']) { shots[ne.id] = shots['exp:new']; delete shots['exp:new']; }
        D.expenses.unshift(ne); app.exp = ne.id; app.form = null; show();
      }
    });
    c.addEventListener('change', function (e) {
      var el = e.target, f = el.getAttribute('data-f'), key = el.getAttribute('data-shot');
      if (f && app.form) { app.form[f] = el.value; app.form.note = ''; if (f !== 'amount') show(true); return; }
      if (!key || !el.files || !el.files[0]) return;
      var url = URL.createObjectURL(el.files[0]);                    // shown from the device's own memory: it goes nowhere
      if (key === 'exp:new') { shots['DEP-NEW'] = shots['exp:new'] = url; app.form.shot = true; }
      else { shots[key.split(':')[1]] = url; if (app.job) app.job.shot = true; }
      show(true);
    });
    c.addEventListener('input', function (e) { var f = e.target.getAttribute('data-f'); if (f === 'amount' && app.form) app.form.amount = e.target.value; });
    c.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.className === 'lg-hot') { e.preventDefault(); e.target.click(); } else if (e.key === 'Escape') tipHide(); });
    if (canHover) {
      c.addEventListener('mousemove', function (e) { tip.x = e.clientX; tip.y = e.clientY; });
      c.addEventListener('mouseover', function (e) {
        if (tip.sticky) return;
        var el = e.target.closest('.lg-hot') ? null : e.target.closest('[data-tip]');
        if (el === tip.over) return;
        clearTimeout(tip.timer); tip.over = el;
        if (tip.el) tip.el.hidden = true;
        if (el) tip.timer = setTimeout(function () { if (tip.over === el && el.isConnected) tipShow(el, null, false); }, 450);
      });
      c.addEventListener('mouseleave', function () { if (!tip.sticky) tipHide(); });
    }
    show();
  }

  /* ---------- the data arrives with the presentation's descriptions ---------- */
  function start(data) {
    if (D || !data || !data.logi || !data.logi.vans) return;
    D = JSON.parse(JSON.stringify(data.logi));
    plan();
    if (flowRoot) { flow.t = reduced ? D.now : T0; flowBuild(); window.BEN_FLOW = { state: function () { var o = totals(flow.t); return { t: hm(flow.t), on: flow.on, served: o.served, all: o.all, road: o.road }; }, play: flowPlay, stop: flowStop, at: function (m) { flowStop(); flow.t = m; flowDraw(); } }; }
    if (appRoot) { appBuild(); window.BEN_LOGI = { state: function () { var o = totals(app.now); return { tab: app.tab, now: hm(app.now), van: app.van, guide: app.guide, served: o.served, all: o.all, pending: pending(), alerts: alerts().length, notes: D.receipts.map(function (n) { return n.id + ':' + n.status; }).join(), expenses: D.expenses.length, playing: app.on }; }, go: go, at: function (m) { appStop(); app.now = m; show(true); }, csv: csv, guide: guide }; }
    doc.dispatchEvent(new CustomEvent('ben:live-ready'));
  }
  doc.addEventListener('ben:data', function (e) { start(e.detail); });
  if (window.BEN_DECK_DATA) start(window.BEN_DECK_DATA);

  // the day plays while its slide is shown, and waits otherwise
  doc.addEventListener('ben:live', function (e) {
    var d = e.detail || {};
    if (!D) return;
    if (flowRoot) { if (d.on && d.el === flowRoot && !reduced) flowPlay(); else flowStop(); }
    if (appRoot && !(d.on && d.el === appRoot)) appStop();
  });
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) { if (flow.on) { flowStop(); flow.wasOn = true; } appStop(); } else if (flow.wasOn) { flow.wasOn = false; if (flowRoot && !flowRoot.hidden) flowPlay(); } });
  doc.addEventListener('ben:lang', function (e) {
    lang = e.detail === 'en' ? 'en' : 'fr';
    if (!D) return;
    if (flow.map) { mapWords(flow.map); if (flow.far) mapWords(flow.far); flow.parts.capKey = ''; flowWords(); }
    if (appRoot && $('.logi__body', appRoot)) show(true);
  });
})();
