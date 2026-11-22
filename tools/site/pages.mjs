/* benevents agency — the words of the pages that tools/site/build.mjs writes about the agency itself:
   the page "The agency" and one page per city where we work.

   CITIES   one entry per city. Its page is /event-agency-<id> in English and /fr/agence-evenementielle-<id>
            in French; the projects shown on it are those whose "city" (assets/js/projects.js) is this id.
            To add a city: copy an entry, change its id, its words and its photo, then run the tool again.
   AGENCY   the words of the page "The agency" (/agency, /fr/agence).
   TEAM     the people shown on that page; empty: the part stays out of the page.
              { name: 'First name Last name', role: { en: '…', fr: '…' }, photo: ['assets/img/team/….jpg', width, height] }   (photo optional)
   COMPANY  where the agency is, for visitors and for search engines; what is left empty is left out.
              address: street and number · postalCode · city: where the office is · legalName: the name of the company

   After a change: node tools/site/build.mjs */

export const CITIES = [
  {
    id: 'casablanca',
    name: { en: 'Casablanca', fr: 'Casablanca' },
    image: ['assets/img/forum-panel.jpg', 2000, 1330],
    card: { en: 'Conventions, launches and gala dinners in the business capital.', fr: 'Conventions, lancements et dîners de gala dans la capitale économique.' },
    seo: {
      title: { en: 'Event Agency in Casablanca, Morocco | benevents agency', fr: 'Agence événementielle à Casablanca | benevents agency' },
      desc: {
        en: 'Event agency in Casablanca: benevents designs and produces conventions, conferences, product launches and gala evenings, with its own stage and audiovisual team.',
        fr: 'Agence événementielle à Casablanca : conventions, conférences, lancements et soirées de gala conçus et produits par benevents, avec sa propre équipe technique.'
      }
    },
    lede: {
      en: 'Casablanca is where Morocco does business: head offices, banks, brands and their annual meetings. We design and produce the events that mark those moments, from the first sketch to the last light cue.',
      fr: 'Casablanca est la ville où le Maroc fait des affaires : sièges, banques, marques et leurs grands rendez-vous annuels. Nous concevons et produisons les événements qui marquent ces moments, du premier croquis au dernier top lumière.'
    },
    text: {
      en: [
        'Most of the events we are asked for here are working events with a public side: a convention that ends with a gala dinner, a forum that is filmed, a launch that the press and the dealers must both remember. The city has the rooms for them, from hotel ballrooms and conference centres to showrooms and industrial halls that can be dressed from floor to ceiling.',
        'What we add is one team for everything the guests will see and hear. The concept, the stage, the screens, the light, the sound and the screen content are drawn together and run from our own control desk on the day. You deal with one producer and one timeline.',
        'Corporate calendars are tight: a room that is free only the night before, speakers who arrive between two meetings. We plan for that, with a running order and rehearsals that leave nothing to improvise.'
      ],
      fr: [
        'La plupart des événements qu’on nous confie ici sont des événements de travail avec une part de spectacle : une convention qui se termine par un dîner de gala, un forum filmé, un lancement dont la presse et le réseau doivent se souvenir. La ville a les lieux pour cela, des salons d’hôtel et centres de conférences aux showrooms et aux halles industrielles que l’on habille du sol au plafond.',
        'Nous y ajoutons une seule équipe pour tout ce que vos invités verront et entendront. Le concept, la scène, les écrans, la lumière, le son et les contenus sont dessinés ensemble, puis pilotés depuis notre propre régie le jour J. Vous avez un seul chef de projet et un seul planning.',
        'Les agendas d’entreprise sont serrés : une salle libre seulement la veille, des intervenants qui arrivent entre deux réunions. Nous préparons l’événement en conséquence, avec un conducteur et des répétitions qui ne laissent rien à l’improvisation.'
      ]
    },
    // what we produce there: the words, and the service whose page they lead to
    kinds: [
      ['conferences', { en: 'Conventions and annual meetings', fr: 'Conventions et réunions annuelles' }],
      ['conferences', { en: 'Conferences, forums and seminars', fr: 'Conférences, forums et séminaires' }],
      ['ceremonies', { en: 'Award ceremonies and gala dinners', fr: 'Remises de prix et dîners de gala' }],
      ['receptions', { en: 'Product launches and showroom openings', fr: 'Lancements de produit et inaugurations de showroom' }],
      ['receptions', { en: 'Corporate receptions and brand evenings', fr: 'Réceptions d’entreprise et soirées de marque' }],
      ['production', { en: 'Stage, LED walls, filming and live direction', fr: 'Scène, murs LED, captation et réalisation en direct' }]
    ],
    good: {
      en: [
        'Mohammed V International Airport is the country’s main hub: Casablanca is the natural choice when guests fly in from several countries.',
        'The Al Boraq high-speed train links Casablanca with Rabat and Tangier, so one event can bring together teams from the three cities.',
        'The last months of the year are the busiest for conventions: the earlier the date is fixed, the wider the choice of rooms.'
      ],
      fr: [
        'L’aéroport international Mohammed V est le principal hub du pays : Casablanca s’impose quand les invités arrivent de plusieurs pays.',
        'Le train à grande vitesse Al Boraq relie Casablanca à Rabat et Tanger : un même événement peut réunir les équipes des trois villes.',
        'Les derniers mois de l’année sont les plus demandés pour les conventions : plus la date est fixée tôt, plus le choix de salles est large.'
      ]
    }
  },
  {
    id: 'rabat',
    name: { en: 'Rabat', fr: 'Rabat' },
    image: ['assets/img/projects/femmes-en-jeu/02.webp', 1280, 960],
    card: { en: 'Forums, ceremonies and official receptions in the capital.', fr: 'Forums, cérémonies et réceptions officielles dans la capitale.' },
    seo: {
      title: { en: 'Event Agency in Rabat, Morocco | benevents agency', fr: 'Agence événementielle à Rabat | benevents agency' },
      desc: {
        en: 'Event agency in Rabat: benevents designs and produces institutional forums, conferences, ceremonies and official receptions, with its own stage and audiovisual team.',
        fr: 'Agence événementielle à Rabat : forums institutionnels, conférences, cérémonies et réceptions officielles conçus et produits par benevents, technique incluse.'
      }
    },
    lede: {
      en: 'Rabat is the capital: ministries, embassies, foundations and international organisations meet here. Their events call for precision, a sense of protocol and a stage that serves the message.',
      fr: 'Rabat est la capitale : ministères, ambassades, fondations et organisations internationales s’y retrouvent. Leurs événements demandent de la précision, le sens du protocole et une scène au service du message.'
    },
    text: {
      en: [
        'In Rabat we mostly produce forums, conferences, masterclasses, closing ceremonies and official receptions. They have a lot in common: senior speakers, several languages in the room, cameras, and a programme that must run to the minute.',
        'Our work starts with the order of the day. Who speaks and when, where each guest sits, what appears on the screens: once that is settled, we draw the stage, the light and the screen content around it, and we rehearse. On the day, our own team runs sound, light, video and live direction from one control desk.',
        'Discretion is part of the job. We fit in with your protocol, we stay in the wings, and the event is remembered for what was said on stage.'
      ],
      fr: [
        'À Rabat, nous produisons surtout des forums, des conférences, des masterclass, des cérémonies de clôture et des réceptions officielles. Ils ont beaucoup en commun : des intervenants de haut rang, plusieurs langues dans la salle, des caméras et un programme qui doit se dérouler à la minute.',
        'Notre travail commence par l’ordre du jour. Qui parle et quand, où chaque invité prend place, ce qui s’affiche à l’écran : une fois cela arrêté, nous dessinons la scène, la lumière et les contenus autour, puis nous répétons. Le jour J, notre propre équipe assure le son, la lumière, la vidéo et la réalisation en direct depuis une seule régie.',
        'La discrétion fait partie du métier. Nous nous adaptons à votre protocole, nous restons en coulisses, et l’on se souvient de ce qui s’est dit sur scène.'
      ]
    },
    kinds: [
      ['conferences', { en: 'Institutional forums and conferences', fr: 'Forums et conférences institutionnels' }],
      ['conferences', { en: 'Masterclasses and panel discussions', fr: 'Masterclass et tables rondes' }],
      ['ceremonies', { en: 'Opening and closing ceremonies', fr: 'Cérémonies d’ouverture et de clôture' }],
      ['ceremonies', { en: 'Award and graduation ceremonies', fr: 'Remises de prix et de diplômes' }],
      ['receptions', { en: 'Official receptions and dinners', fr: 'Réceptions et dîners officiels' }],
      ['production', { en: 'Stage, LED walls, filming and live direction', fr: 'Scène, murs LED, captation et réalisation en direct' }]
    ],
    good: {
      en: [
        'Rabat and Casablanca are about an hour apart by train: guests from both cities can meet for a half-day event.',
        'Institutional events have their own rules: order of precedence, accreditation, several languages. We plan for them from the first meeting.',
        'The rooms best suited to official events are in demand: we check availability before we draw anything.'
      ],
      fr: [
        'Rabat et Casablanca sont à environ une heure de train : les invités des deux villes peuvent se retrouver pour un événement d’une demi-journée.',
        'Les événements institutionnels ont leurs règles : ordre protocolaire, accréditations, plusieurs langues. Nous les intégrons dès la première réunion.',
        'Les salles les mieux adaptées aux événements officiels sont très demandées : nous vérifions les disponibilités avant de dessiner quoi que ce soit.'
      ]
    }
  },
  {
    id: 'marrakech',
    name: { en: 'Marrakech', fr: 'Marrakech' },
    image: ['assets/img/reception-golden-spheres.jpg', 1280, 720],
    card: { en: 'Seminars, gala evenings and receptions in the red city.', fr: 'Séminaires, soirées de gala et réceptions dans la ville ocre.' },
    seo: {
      title: { en: 'Event Agency in Marrakech, Morocco | benevents agency', fr: 'Agence événementielle à Marrakech | benevents agency' },
      desc: {
        en: 'Event agency in Marrakech (Marrakesh): benevents designs and produces seminars, gala dinners, cocktails and brand receptions, with its own technical team.',
        fr: 'Agence événementielle à Marrakech : séminaires, dîners de gala, cocktails et réceptions de marque conçus et produits par benevents et son équipe technique.'
      }
    },
    lede: {
      en: 'Marrakech is where companies take their teams and their clients to mark an occasion: a seminar, a gala dinner, a reception under the lanterns. We design these events and produce them on site, with our own team.',
      fr: 'Marrakech est la ville où les entreprises emmènent leurs équipes et leurs clients pour marquer le coup : un séminaire, un dîner de gala, une réception sous les lanternes. Nous concevons ces événements et les produisons sur place, avec notre propre équipe.'
    },
    text: {
      en: [
        'An event in Marrakech is usually a stay: plenary sessions by day, an evening that people will talk about, sometimes a dinner outside the city. The settings are the reason to come, from hotel ballrooms and gardens to riads, palaces and the Agafay desert, and each has its own constraints of power, sound and access.',
        'That is where a production agency makes the difference. We bring the stage, the light, the sound and the screens to places that were not built for them, and we design each evening around its setting: a cocktail under a canopy of golden lanterns, a live DJ set, amber light on the tables.',
        'Marrakech, also written Marrakesh, has direct flights from many European cities, which makes it a favourite for seminars and incentive trips with guests from abroad. We work in French and in English, with one producer from the first brief to the last cue.'
      ],
      fr: [
        'Un événement à Marrakech est le plus souvent un séjour : des plénières en journée, une soirée dont on reparlera, parfois un dîner hors de la ville. Les lieux sont la raison de venir, des salons et jardins d’hôtel aux riads, aux palais et au désert d’Agafay, et chacun a ses contraintes d’alimentation électrique, de son et d’accès.',
        'C’est là qu’une agence de production fait la différence. Nous amenons la scène, la lumière, le son et les écrans dans des lieux qui n’ont pas été construits pour cela, et nous dessinons chaque soirée autour de son décor : un cocktail sous une nuée de lanternes dorées, un DJ set en direct, une lumière ambrée sur les tables.',
        'Marrakech est reliée par des vols directs à de nombreuses villes européennes, ce qui en fait une destination de choix pour les séminaires et les voyages de motivation avec des invités venus de l’étranger. Nous travaillons en français et en anglais, avec un seul chef de projet du premier brief au dernier top.'
      ]
    },
    kinds: [
      ['conferences', { en: 'Seminars and conventions', fr: 'Séminaires et conventions' }],
      ['ceremonies', { en: 'Gala dinners and themed evenings', fr: 'Dîners de gala et soirées à thème' }],
      ['ceremonies', { en: 'Award ceremonies', fr: 'Remises de prix' }],
      ['receptions', { en: 'Cocktails and brand receptions', fr: 'Cocktails et réceptions de marque' }],
      ['receptions', { en: 'Product launches', fr: 'Lancements de produit' }],
      ['production', { en: 'Stage, light, sound and screens, indoors and outdoors', fr: 'Scène, lumière, son et écrans, en intérieur comme en extérieur' }]
    ],
    good: {
      en: [
        'Spring and autumn are the most pleasant seasons. In summer, outdoor evenings start late and daytime sessions stay indoors.',
        'An outdoor setting needs its own power supply, respect for sound limits and a plan B for wind or rain: we plan all three from the start.',
        'Marrakech-Menara airport is a short drive from the city centre, which keeps transfers short for guests who fly in.'
      ],
      fr: [
        'Le printemps et l’automne sont les saisons les plus agréables. En été, les soirées en extérieur commencent tard et les sessions de journée restent en intérieur.',
        'Un décor en extérieur demande sa propre alimentation électrique, le respect des limites sonores et un plan B en cas de vent ou de pluie : nous prévoyons les trois dès le départ.',
        'L’aéroport de Marrakech-Ménara est à quelques minutes du centre : les transferts restent courts pour les invités qui arrivent en avion.'
      ]
    }
  }
];

// the words shared by the pages of the cities
export const CITY_WORDS = {
  en: {
    slug: 'event-agency-', eyebrow: 'Where we work', title: n => ['Event agency', 'in ' + n], organise: n => 'Organising an event in ' + n, kinds: n => 'What we produce in ' + n,
    done: n => 'Produced in ' + n, good: 'Good to know', also: 'We also work in', service: n => 'Event design and production in ' + n,
    endTitle: n => 'An event in ' + n + ' in mind?', cover: n => 'An event produced by benevents agency in ' + n, allWork: 'See all our projects'
  },
  fr: {
    slug: 'agence-evenementielle-', eyebrow: 'Où nous travaillons', title: n => ['Agence événementielle', 'à ' + n], organise: n => 'Organiser un événement à ' + n, kinds: n => 'Ce que nous produisons à ' + n,
    done: n => 'Réalisé à ' + n, good: 'Bon à savoir', also: 'Nous travaillons aussi à', service: n => 'Conception et production d’événements à ' + n,
    endTitle: n => 'Un événement à ' + n + ' en préparation ?', cover: n => 'Un événement produit par benevents agency à ' + n, allWork: 'Voir toutes nos réalisations'
  }
};

export const AGENCY = {
  en: {
    slug: 'agency', name: 'The agency',
    seo: ['About benevents agency | Event Design and Production in Morocco', 'benevents agency designs and produces corporate events in Casablanca, Rabat, Marrakech and across Morocco: one team for concept, stage and audiovisual.'],
    title: ['The agency that designs your event', 'and builds it.'],
    lede: 'benevents agency is an event design and production agency. We bring concept, scenography and audiovisual production together under one roof, so that every element, from the stage to the screen content, speaks with a single voice.',
    intro: 'Companies, institutions and foundations trust us with the moments that matter to them. Our promise is simple: an event that looks effortless on the day, because nothing was left to chance beforehand.',
    principles: [
      ['Those who draw it build it', 'Stage, light, sound and screen content stay in the same hands, from the sketch to the control desk.'],
      ['You approve before we book', 'The concept and the budget are yours to approve before anything is reserved.'],
      ['One contact', 'A dedicated producer, from the first conversation to the final toast.'],
      ['Nothing is improvised', 'Every sequence is written down, and our own team runs the show on the day.']
    ],
    oneTeam: 'Why one team',
    text: [
      'Design and production are often two jobs, given to two companies. We keep them in the same hands. The team that draws your stage is the one that lights it, fills its screens and runs it from the control desk on the day: fewer go-betweens, faster decisions, and no gap between the sketch and the room.',
      'Each project has one dedicated producer, your contact from the first conversation to the final toast.'
    ],
    values: 'How we work', where: 'Where we work',
    whereText: 'We work in Casablanca, Rabat and Marrakech, and wherever in Morocco your event takes place: we have also produced in Tangier.',
    office: 'Our office:',
    city: n => 'Event agency in ' + n, crafts: 'What we create', clients: 'They trust us', figures: 'In figures', quotes: 'In their words', team: 'The team',
    film: 'See the team at work: the film', work: 'See our projects', endTitle: 'An event in preparation?', logo: n => n + ', a client of benevents agency', cover: 'A convention stage designed and produced by benevents agency'
  },
  fr: {
    slug: 'agence', name: 'L’agence',
    seo: ['L’agence benevents : conception et production d’événements au Maroc', 'benevents agency conçoit et produit vos événements d’entreprise à Casablanca, Rabat, Marrakech et au Maroc : concept, scène et audiovisuel, une seule équipe.'],
    title: ['L’agence qui conçoit votre événement', 'et le produit.'],
    lede: 'benevents agency est une agence de conception et de production événementielle. Concept, scénographie et production audiovisuelle sont réunis sous un même toit, pour que chaque élément, de la scène aux contenus d’écran, parle d’une seule voix.',
    intro: 'Entreprises, institutions et fondations nous confient les moments qui comptent pour elles. Notre promesse est simple : un événement qui paraît évident le jour J, parce que rien n’a été laissé au hasard en amont.',
    principles: [
      ['Ceux qui dessinent produisent', 'La scène, la lumière, le son et les contenus restent entre les mêmes mains, du croquis à la régie.'],
      ['Vous validez avant toute réservation', 'Le concept et le budget vous sont soumis avant que quoi que ce soit ne soit réservé.'],
      ['Un seul interlocuteur', 'Un chef de projet dédié, de la première conversation au dernier toast.'],
      ['Rien ne s’improvise', 'Chaque séquence est écrite, et notre propre équipe tient la régie le jour J.']
    ],
    oneTeam: 'Pourquoi une seule équipe',
    text: [
      'La conception et la production sont souvent deux métiers, confiés à deux sociétés. Chez nous, ils restent entre les mêmes mains. L’équipe qui dessine votre scène est celle qui l’éclaire, qui prépare ses contenus et qui la pilote depuis la régie le jour J : moins d’intermédiaires, des décisions plus rapides, et aucun écart entre le croquis et la salle.',
      'Chaque projet a un chef de projet dédié, votre interlocuteur de la première conversation au dernier toast.'
    ],
    values: 'Notre façon de travailler', where: 'Où nous travaillons',
    whereText: 'Nous travaillons à Casablanca, Rabat et Marrakech, et partout au Maroc où votre événement a lieu : nous avons aussi produit à Tanger.',
    office: 'Notre bureau :',
    city: n => 'Agence événementielle à ' + n, crafts: 'Ce que nous créons', clients: 'Ils nous font confiance', figures: 'En chiffres', quotes: 'Ils en parlent', team: 'L’équipe',
    film: 'Voir l’équipe à l’œuvre : le film', work: 'Voir nos réalisations', endTitle: 'Un événement en préparation ?', logo: n => n + ', client de benevents agency', cover: 'Une scène de convention conçue et produite par benevents agency'
  }
};

export const TEAM = [];

export const COMPANY = { legalName: '', address: '', postalCode: '', city: '' };
