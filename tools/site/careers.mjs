/* benevents agency — the words of the careers pages and of "Work with us", in English and in French.

   The positions themselves are data, in content/careers.json, edited by the team on the admin page (/admin, "Careers"):
   each open position gets its own page (/careers/<id>, /fr/carrieres/<id>) with its job posting for Google, and a list
   on /careers. "Work with us" (/work-with-us, /fr/travailler-avec-nous) gathers the people who work on events with us
   from time to time: hostesses and hosts, technicians, crew, photographers and designers.
   Both forms send to api/apply.js, which passes the application on like the contact form (see that file). */

// the kinds of contract a position can have, and their name for Google's job postings
export const CONTRACTS = {
  'full-time': { en: 'Full-time', fr: 'CDI · temps plein', google: 'FULL_TIME' },
  'part-time': { en: 'Part-time', fr: 'Temps partiel', google: 'PART_TIME' },
  'fixed-term': { en: 'Fixed-term contract', fr: 'CDD', google: 'TEMPORARY' },
  'freelance': { en: 'Freelance', fr: 'Freelance', google: 'CONTRACTOR' },
  'internship': { en: 'Internship', fr: 'Stage', google: 'INTERN' }
};

// the people who join our events from time to time (the choices of the "Work with us" form)
export const ROLES = [
  { id: 'hostess', en: 'Hostess or host', fr: 'Hôtesse ou hôte d’accueil' },
  { id: 'sound', en: 'Sound technician', fr: 'Technicien son' },
  { id: 'lighting', en: 'Lighting technician', fr: 'Technicien lumière' },
  { id: 'video', en: 'Video and LED technician', fr: 'Technicien vidéo et LED' },
  { id: 'crew', en: 'Stage crew and set-up', fr: 'Machiniste, montage' },
  { id: 'camera', en: 'Photographer or camera operator', fr: 'Photographe ou cadreur' },
  { id: 'design', en: 'Graphic or 3D designer', fr: 'Graphiste ou designer 3D' },
  { id: 'other', en: 'Something else', fr: 'Autre' }
];
export const LANGUAGES = [
  { id: 'ar', en: 'Arabic', fr: 'Arabe' },
  { id: 'fr', en: 'French', fr: 'Français' },
  { id: 'en', en: 'English', fr: 'Anglais' },
  { id: 'es', en: 'Spanish', fr: 'Espagnol' },
  { id: 'amz', en: 'Amazigh', fr: 'Amazigh' }
];

export const CAREER_WORDS = {
  en: {
    folder: '/careers', name: 'Careers', eyebrow: 'Careers',
    title: ['Build events', 'with us.'],
    lede: 'We design and produce corporate events across Morocco: stages, light, sound, video, printing and the welcome of the guests. When we look for someone to join the team, it is posted here.',
    coverAlt: 'Our control desk during a live event',
    seo: ['Event Production Jobs in Morocco | benevents agency', 'Open positions at benevents agency, event design and production in Morocco: jobs in event production, technical teams and design. Apply online.'],
    open: 'Open positions', none: 'No position is open right now. You can still write to us: we keep every application in mind for the next one.',
    posted: 'Posted', city: 'Place', contract: 'Contract', see: 'See the position',
    poolTitle: 'Hostesses, technicians, crew', poolText: 'Many people work on our events from time to time: hostesses and hosts, sound, light and video technicians, stage crew, photographers, designers. Join them in a few minutes.',
    poolLink: 'Work with us',
    spontTitle: 'A spontaneous application', spontText: 'Tell us who you are and what you would like to do with us.',
    missions: 'What you will do', profile: 'Who we are looking for', offer: 'What we offer', until: 'Applications until',
    applyTitle: 'Apply for this position', applyText: 'We read every application and answer each one.',
    back: 'All positions', anyCity: 'Morocco'
  },
  fr: {
    folder: '/fr/carrieres', name: 'Carrières', eyebrow: 'Carrières',
    title: ['Faites des événements', 'avec nous.'],
    lede: 'Nous concevons et produisons des événements d’entreprise partout au Maroc : scènes, lumière, son, vidéo, impression et accueil des invités. Quand nous cherchons quelqu’un pour rejoindre l’équipe, c’est ici que nous l’annonçons.',
    coverAlt: 'Notre régie pendant un événement en direct',
    seo: ['Emploi dans l’événementiel au Maroc | benevents agency', 'Offres d’emploi de benevents agency, agence événementielle au Maroc : production d’événements, équipes techniques et design. Postulez en ligne.'],
    open: 'Postes ouverts', none: 'Aucun poste n’est ouvert pour le moment. Vous pouvez tout de même nous écrire : nous gardons chaque candidature en tête pour le prochain.',
    posted: 'Publié le', city: 'Lieu', contract: 'Contrat', see: 'Voir le poste',
    poolTitle: 'Hôtesses, techniciens, équipes', poolText: 'Beaucoup de personnes travaillent sur nos événements de temps en temps : hôtesses et hôtes d’accueil, techniciens son, lumière et vidéo, machinistes, photographes, graphistes. Rejoignez-les en quelques minutes.',
    poolLink: 'Travailler avec nous',
    spontTitle: 'Une candidature spontanée', spontText: 'Dites-nous qui vous êtes et ce que vous aimeriez faire avec nous.',
    missions: 'Vos missions', profile: 'Le profil que nous cherchons', offer: 'Ce que nous offrons', until: 'Candidatures jusqu’au',
    applyTitle: 'Postuler à ce poste', applyText: 'Nous lisons chaque candidature et répondons à chacune.',
    back: 'Tous les postes', anyCity: 'Maroc'
  }
};

export const WORK_WORDS = {
  en: {
    path: '/work-with-us', name: 'Work with us', eyebrow: 'Work with us',
    title: ['Work on our events,', 'from time to time.'],
    lede: 'Hostesses and hosts, technicians, stage crew, photographers, designers: we call on people we know for each event, in Casablanca, Rabat, Marrakech and the rest of Morocco. Tell us what you do, and we will call you when an event needs you.',
    coverAlt: 'Sound desk overlooking a gala dinner',
    seo: ['Hostess & Event Technician Jobs, Morocco | benevents agency', 'Hostesses, hosts, sound, light and video technicians, stage crew, photographers: join the people who work on benevents agency’s events in Morocco.'],
    howTitle: 'How it works',
    how: ['You fill in the form below: it takes a few minutes.', 'We keep your details in our list of people for events, by role and by city.', 'When an event needs your role, we call you with the date, the place, the hours and the pay, before you say yes.'],
    formTitle: 'Your details', formText: 'Everything stays between you and the agency.',
    careers: 'Looking for a permanent position? See our open positions.',
    join: 'Hostess, host or technician? Work with us'
  },
  fr: {
    path: '/fr/travailler-avec-nous', name: 'Travailler avec nous', eyebrow: 'Travailler avec nous',
    title: ['Travaillez sur nos événements,', 'de temps en temps.'],
    lede: 'Hôtesses et hôtes d’accueil, techniciens, machinistes, photographes, graphistes : pour chaque événement, nous faisons appel à des personnes que nous connaissons, à Casablanca, Rabat, Marrakech et dans le reste du Maroc. Dites-nous ce que vous faites, nous vous appellerons quand un événement aura besoin de vous.',
    coverAlt: 'Régie son face à un dîner de gala',
    seo: ['Hôtesses, techniciens événementiels Maroc | benevents agency', 'Hôtesses et hôtes d’accueil, techniciens son, lumière et vidéo, machinistes, photographes : rejoignez les équipes de nos événements au Maroc.'],
    howTitle: 'Comment ça marche',
    how: ['Vous remplissez le formulaire ci-dessous : cela prend quelques minutes.', 'Nous gardons vos coordonnées dans notre liste de personnes pour les événements, par métier et par ville.', 'Quand un événement a besoin de votre métier, nous vous appelons avec la date, le lieu, les horaires et la rémunération, avant que vous ne disiez oui.'],
    formTitle: 'Vos coordonnées', formText: 'Tout reste entre vous et l’agence.',
    careers: 'Vous cherchez un poste permanent ? Voyez nos postes ouverts.',
    join: 'Hôtesse, hôte ou technicien ? Travaillez avec nous'
  }
};

// the words of the forms (assets/js/apply.js reads what it says from the page itself)
export const FORM_WORDS = {
  en: {
    name: 'Your name', email: 'Email', phone: 'Phone', city: 'City you live in', cityPh: 'e.g. Casablanca',
    roles: 'What you do', languages: 'Languages you speak', links: 'Link to your CV, portfolio or LinkedIn', linksPh: 'https://',
    experience: 'Your experience', experiencePh: 'The events you have worked on, your role, the years…',
    availability: 'When you are available', availabilityPh: 'e.g. weekends, evenings, any day with notice',
    message: 'A few words about you', messagePh: 'What you have done, what you would like to do with us',
    consent: 'I agree that benevents agency keeps these details to consider my application and contact me about it.',
    privacy: 'Privacy policy', send: 'Send', sending: 'Sending…',
    sent: 'Thank you, it is sent. We will be in touch.', missing: 'Please fill in your name, a valid email and tick the box.',
    failed: 'It could not be sent from here. Your email app is opening with everything filled in: just press send.'
  },
  fr: {
    name: 'Votre nom', email: 'E-mail', phone: 'Téléphone', city: 'Votre ville', cityPh: 'ex. Casablanca',
    roles: 'Ce que vous faites', languages: 'Les langues que vous parlez', links: 'Lien vers votre CV, portfolio ou LinkedIn', linksPh: 'https://',
    experience: 'Votre expérience', experiencePh: 'Les événements sur lesquels vous avez travaillé, votre rôle, les années…',
    availability: 'Vos disponibilités', availabilityPh: 'ex. week-ends, soirées, tous les jours avec un préavis',
    message: 'Quelques mots sur vous', messagePh: 'Ce que vous avez fait, ce que vous aimeriez faire avec nous',
    consent: 'J’accepte que benevents agency conserve ces informations pour étudier ma candidature et me recontacter à ce sujet.',
    privacy: 'Politique de confidentialité', send: 'Envoyer', sending: 'Envoi…',
    sent: 'Merci, c’est envoyé. Nous reviendrons vers vous.', missing: 'Merci d’indiquer votre nom, un e-mail valide et de cocher la case.',
    failed: 'L’envoi n’a pas pu se faire d’ici. Votre messagerie s’ouvre avec tout déjà rempli : il suffit d’envoyer.'
  }
};
