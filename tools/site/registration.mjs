/* benevents agency — the registration demo (/registration-demo, /fr/demo-inscriptions): a working sample of the online
   registration, badges and check-in we set up for our clients' events (service "Hostesses & registration").
   An imaginary event; everything a visitor types stays in their own browser (assets/js/regdemo.js), nothing is sent. */
export const REG_WORDS = {
  en: {
    path: '/registration-demo', name: 'Registration demo', eyebrow: 'Registration · live demo',
    title: ['Guests register online,', 'and are welcomed by name.'],
    lede: 'This is a working sample of the registration we set up for our clients’ events: the guest registers, receives a badge with a QR code, and is checked in at the door in a second. Try the three steps.',
    privacy: 'A demo with an imaginary event: what you type stays in this browser and is sent nowhere.',
    seo: ['Event Registration & Check-in, Live Demo | benevents agency', 'Online registration, QR badges and check-in at the door for corporate events in Morocco: try the demo of what benevents agency sets up for your guests.'],
    steps: ['Register', 'The badge', 'Check-in at the door'],
    event: { name: 'Annual Convention', tag: 'Imaginary event', when: 'Thursday 11 March 2027 · 9:00', where: 'Casablanca' },
    form: { first: 'First name', last: 'Last name', company: 'Company', role: 'Job title', email: 'Email', gala: 'I will attend the gala dinner', send: 'Register', missing: 'Please fill in your first name, last name and a valid email.' },
    badge: { guest: 'Guest', mail: 'In a real event, this badge is sent to the guest by email, with the programme and the way to the venue.', print: 'Print the badge', another: 'Register another guest', next: 'Go to the check-in', none: 'Register a guest first: the badge appears here.', gala: 'Gala dinner' },
    door: { registered: 'Registered', arrived: 'Arrived', search: 'Search a name, a company or a code', scan: 'Scan a badge', noScan: 'Scanning needs a phone or browser that reads QR codes: search the name instead.', checkIn: 'Check in', arrivedAt: 'Arrived at', samples: 'Add sample guests', csv: 'Download the list (CSV)', reset: 'Start the demo again', empty: 'No guest yet: register one, or add sample guests.', welcome: 'Welcome', unknown: 'This badge is not on the list.', already: 'already checked in at', close: 'Close', camera: 'Point the camera at a badge’s QR code.' },
    whatTitle: 'What we set up for your event',
    what: ['A registration page in your colours and languages, with the questions your event needs.', 'A confirmation for each guest, with their badge and the practical details.', 'The list of who is coming, up to date at any time.', 'Badges printed in advance or on site, a colour for each type of guest.', 'Check-in at the door by our hostesses, and access to each room or area controlled.', 'The attendance list, sent to you after the event.'],
    endTitle: 'Want this for your event?', endText: 'Tell us about your guests and your programme: we set up the registration, the badges and the team at the door.',
    service: 'Hostesses & registration', try: 'Try the registration demo'
  },
  fr: {
    path: '/fr/demo-inscriptions', name: 'Démo d’inscriptions', eyebrow: 'Inscriptions · démo en direct',
    title: ['Vos invités s’inscrivent en ligne,', 'et sont accueillis par leur nom.'],
    lede: 'Voici un exemple fonctionnel des inscriptions que nous mettons en place pour les événements de nos clients : l’invité s’inscrit, reçoit un badge avec un QR code, et il est enregistré à l’entrée en une seconde. Essayez les trois étapes.',
    privacy: 'Une démo avec un événement imaginaire : ce que vous saisissez reste dans ce navigateur et n’est envoyé nulle part.',
    seo: ['Inscriptions et badges événement : démo | benevents agency', 'Inscriptions en ligne, badges à QR code et accueil à l’entrée pour vos événements d’entreprise au Maroc : essayez la démo de ce que nous mettons en place.'],
    steps: ['Inscription', 'Le badge', 'Accueil à l’entrée'],
    event: { name: 'Convention annuelle', tag: 'Événement imaginaire', when: 'Jeudi 11 mars 2027 · 9 h', where: 'Casablanca' },
    form: { first: 'Prénom', last: 'Nom', company: 'Société', role: 'Fonction', email: 'E-mail', gala: 'Je serai présent au dîner de gala', send: 'S’inscrire', missing: 'Merci d’indiquer votre prénom, votre nom et un e-mail valide.' },
    badge: { guest: 'Invité', mail: 'Pour un vrai événement, ce badge est envoyé à l’invité par e-mail, avec le programme et l’accès au lieu.', print: 'Imprimer le badge', another: 'Inscrire un autre invité', next: 'Passer à l’accueil', none: 'Inscrivez d’abord un invité : son badge apparaît ici.', gala: 'Dîner de gala' },
    door: { registered: 'Inscrits', arrived: 'Arrivés', search: 'Chercher un nom, une société ou un code', scan: 'Scanner un badge', noScan: 'Le scan demande un téléphone ou un navigateur qui lit les QR codes : cherchez plutôt le nom.', checkIn: 'Enregistrer', arrivedAt: 'Arrivé à', samples: 'Ajouter des invités d’exemple', csv: 'Télécharger la liste (CSV)', reset: 'Recommencer la démo', empty: 'Aucun invité pour l’instant : inscrivez-en un, ou ajoutez des invités d’exemple.', welcome: 'Bienvenue', unknown: 'Ce badge n’est pas sur la liste.', already: 'déjà enregistré à', close: 'Fermer', camera: 'Placez le QR code d’un badge devant la caméra.' },
    whatTitle: 'Ce que nous mettons en place pour votre événement',
    what: ['Une page d’inscription à vos couleurs et dans vos langues, avec les questions dont votre événement a besoin.', 'Une confirmation pour chaque invité, avec son badge et les informations pratiques.', 'La liste des participants, à jour à tout moment.', 'Des badges imprimés à l’avance ou sur place, une couleur par type d’invité.', 'L’accueil à l’entrée par nos hôtesses, et l’accès à chaque salle ou espace contrôlé.', 'La liste des présents, envoyée après l’événement.'],
    endTitle: 'Vous voulez cela pour votre événement ?', endText: 'Parlez-nous de vos invités et de votre programme : nous mettons en place les inscriptions, les badges et l’équipe à l’entrée.',
    service: 'Hôtesses & inscriptions', try: 'Essayer la démo d’inscriptions'
  }
};
// imaginary guests, to see the check-in with a few names on the list
export const SAMPLE_GUESTS = [
  { first: 'Amina', last: 'Bennani', company: 'Example Group', role: 'Marketing Director', gala: true },
  { first: 'Youssef', last: 'Alaoui', company: 'Sample Industries', role: 'Sales Manager', gala: false },
  { first: 'Claire', last: 'Martin', company: 'Demo Partners', role: 'Head of Events', gala: true },
  { first: 'Omar', last: 'Tazi', company: 'Example Group', role: 'Engineer', gala: true }
];
