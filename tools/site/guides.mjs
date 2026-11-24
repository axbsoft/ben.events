/* benevents agency — the guides: practical answers to what people ask before an event
   (guides/<slug>, fr/guides/<slug>), and the page that lists them (guides, fr/guides). Written by tools/site/build.mjs.

   Advice in our own words, and examples taken only from our real projects. No figure we cannot stand behind.

   id      : short name
   slug    : the end of the page's address, in each language
   date    : the day it was written (and updated, when it is: 'updated')
   image   : the photo at the top, from one of our projects: ['path', width, height]
   title   : the big title, in two parts (the second in italics)
   card    : one sentence for the card that leads to it
   lede    : the sentence under the title
   seo     : the title and the description search engines show
   body    : the sections: [{ h: 'heading', p: ['paragraph', …], list: ['line', …] (optional), after: ['paragraph', …] (optional) }]
   related : the pages it leads to: { events: [ids], services: [ids], cities: [ids] } */

export const GUIDES = [
  {
    id: 'seminar-checklist',
    slug: { en: 'how-to-organise-a-corporate-seminar-in-morocco', fr: 'organiser-un-seminaire-d-entreprise-au-maroc' },
    date: '2026-11-24',
    image: ['assets/img/leo-regional-conference.jpg', 1280, 720],
    title: { en: ['How to organise a corporate seminar', 'in Morocco'], fr: ['Organiser un séminaire d’entreprise', 'au Maroc'] },
    card: {
      en: 'The objective, the city, the venue, the running order, the technical side and the day itself: the steps, in order.',
      fr: 'L’objectif, la ville, le lieu, le déroulé, la technique et le jour J : les étapes, dans l’ordre.'
    },
    lede: {
      en: 'A step-by-step guide, from the first question to ask to the day after, with what we have learnt producing seminars and conventions across Morocco.',
      fr: 'Un guide étape par étape, de la première question à se poser au lendemain de l’événement, avec ce que nous avons appris en produisant séminaires et conventions partout au Maroc.'
    },
    seo: {
      title: { en: 'Organising a Seminar in Morocco: the Checklist | benevents agency', fr: 'Organiser un séminaire au Maroc : la checklist | benevents agency' },
      desc: {
        en: 'Objective, city, venue, running order, technical set-up, guests and rehearsal: a step-by-step checklist to organise a corporate seminar in Morocco.',
        fr: 'Objectif, ville, lieu, déroulé, technique, invités et répétition : la checklist étape par étape pour organiser un séminaire d’entreprise au Maroc.'
      }
    },
    body: {
      en: [
        { h: 'Start with the objective, not the venue', p: [
          'Before choosing a hotel or a city, write down in one sentence what the seminar must achieve: share a strategy, launch a plan for the year, train a team, thank it, or bring two teams together. Everything else follows from that sentence.',
          'An information seminar needs a plenary room where everyone sees and hears. A working seminar needs smaller rooms for workshops. A seminar that rewards a team needs an evening worth remembering. Most seminars mix the three, and the mix decides the programme.'] },
        { h: 'Choose the city for the people who travel', p: [
          'Look at where your guests come from. Casablanca, with Mohammed V International Airport, is the natural choice when people fly in from several countries. Rabat is about an hour from Casablanca by train, which makes a half-day event possible for teams from both cities. Tangier is linked to both by the Al Boraq high-speed train. Marrakech turns a seminar into a stay, with direct flights from many European cities.'],
          after: ['Our {guide to choosing the city|guide:choose-the-city} goes further, city by city.'] },
        { h: 'Check the venue against your programme', p: [
          'Visit with the programme in hand, and with these questions:'],
          list: ['Does the plenary room hold everyone in the layout you need: theatre, classroom or round tables?',
                 'Is the ceiling high enough for a stage, an LED wall and lighting?',
                 'Are there rooms nearby for workshops, and a space for breaks?',
                 'Where does dinner take place? The plenary room can be turned into a dinner room, {as we did for MTA in Tangier|project:mta-cycle-meeting}, but it needs time and a plan.',
                 'When can the technical team get in to set up, and when must the room be empty?',
                 'Is there enough power where the stage will stand?'] },
        { h: 'Fix the date early', p: [
          'The best rooms go first. The last months of the year are the busiest for conventions, and in Marrakech spring and autumn are the most sought-after seasons. Once the date is fixed, the choice of venues is wider and the budget easier to hold.'] },
        { h: 'Write the running order', p: [
          'The running order is the backbone of the seminar: who speaks, when, for how long, with which slides, and what happens between two speakers. Leave room for questions, for breaks that really are breaks, and for moments when people work together rather than listen.',
          'If guests speak different languages, decide early: speeches in one language with slides in the other, or interpretation, which needs booths and headsets.'] },
        { h: 'Plan the technical side around the room', p: [
          'The screen must be readable from the back row, the sound clear in every seat, and the stage lit for the audience and for the cameras. Plan one microphone per speaker, and handheld microphones for the questions. If the seminar is filmed or broadcast, the cameras, the direction and the recording are decided at the same time as the stage.'],
          after: ['Our {guide to the technical set-up|guide:technical-set-up} explains each of these choices.'] },
        { h: 'Think of the guests’ day', p: [
          'Seen from a guest’s seat, a seminar is a journey: the arrival, the welcome desk and the badge, finding the room, the breaks, the meals, the evening, the way back. Signage, transfers and dietary needs are small things that people notice when they are missing.'] },
        { h: 'Rehearse, and plan for what can go wrong', p: [
          'Every speaker should go on stage before the guests arrive, with their slides and their microphone. Keep a spare computer with every presentation on it, spare microphones and batteries, and a plan B for anything outdoors. On the day, one person must be able to make decisions: the producer.'] },
        { h: 'After the seminar', p: [
          'Send the participants the photos, the key slides or a short film while the seminar is still fresh. Ask them what they thought. And write down what worked and what did not: it is the first page of the brief for the next one.'] },
        { h: 'The checklist', p: [], list: [
          'One sentence for the objective',
          'The city, chosen for the people who travel',
          'A venue visited with the programme in hand',
          'The date fixed early',
          'A running order, minute by minute',
          'A technical plan drawn for the room',
          'The guests’ day, from arrival to departure',
          'A rehearsal with every speaker',
          'Photos, film and feedback after the event'] }
      ],
      fr: [
        { h: 'Partir de l’objectif, pas du lieu', p: [
          'Avant de choisir un hôtel ou une ville, écrivez en une phrase ce que le séminaire doit accomplir : partager une stratégie, lancer le plan de l’année, former une équipe, la remercier, ou rapprocher deux équipes. Tout le reste découle de cette phrase.',
          'Un séminaire d’information demande une salle de plénière où chacun voit et entend. Un séminaire de travail demande des salles plus petites pour les ateliers. Un séminaire qui récompense une équipe demande une soirée dont on se souviendra. La plupart mêlent les trois, et ce mélange décide du programme.'] },
        { h: 'Choisir la ville pour ceux qui voyagent', p: [
          'Regardez d’où viennent vos invités. Casablanca, avec l’aéroport international Mohammed V, s’impose quand les participants arrivent de plusieurs pays. Rabat est à environ une heure de Casablanca en train, ce qui permet une demi-journée réunissant les équipes des deux villes. Tanger est reliée aux deux par la ligne à grande vitesse Al Boraq. Marrakech fait du séminaire un séjour, avec des vols directs depuis de nombreuses villes européennes.'],
          after: ['Notre {guide pour choisir la ville|guide:choose-the-city} va plus loin, ville par ville.'] },
        { h: 'Vérifier le lieu avec le programme en main', p: [
          'Visitez avec le programme en main, et avec ces questions :'],
          list: ['La salle de plénière accueille-t-elle tout le monde dans la disposition voulue : théâtre, salle de classe ou tables rondes ?',
                 'La hauteur sous plafond permet-elle une scène, un mur LED et de la lumière ?',
                 'Y a-t-il des salles à proximité pour les ateliers, et un espace pour les pauses ?',
                 'Où a lieu le dîner ? La salle de plénière peut devenir salle de dîner, {comme nous l’avons fait pour MTA à Tanger|project:mta-cycle-meeting}, mais cela demande du temps et un plan.',
                 'Quand l’équipe technique peut-elle entrer pour installer, et quand la salle doit-elle être libérée ?',
                 'Y a-t-il assez de puissance électrique là où sera la scène ?'] },
        { h: 'Fixer la date tôt', p: [
          'Les meilleures salles partent les premières. Les derniers mois de l’année sont les plus chargés en conventions, et à Marrakech le printemps et l’automne sont les saisons les plus demandées. Une fois la date fixée, le choix des lieux est plus large et le budget plus facile à tenir.'] },
        { h: 'Écrire le déroulé', p: [
          'Le déroulé est la colonne vertébrale du séminaire : qui parle, quand, combien de temps, avec quelles slides, et ce qui se passe entre deux intervenants. Laissez de la place pour les questions, pour des pauses qui en sont vraiment, et pour des moments où l’on travaille ensemble plutôt que d’écouter.',
          'Si les invités parlent des langues différentes, décidez tôt : interventions dans une langue avec des slides dans l’autre, ou interprétation, qui demande des cabines et des casques.'] },
        { h: 'Penser la technique autour de la salle', p: [
          'L’écran doit être lisible depuis le dernier rang, le son clair à chaque place, et la scène éclairée pour le public comme pour les caméras. Prévoyez un micro par intervenant, et des micros main pour les questions. Si le séminaire est filmé ou retransmis, les caméras, la réalisation et l’enregistrement se décident en même temps que la scène.'],
          after: ['Notre {guide de la technique|guide:technical-set-up} explique chacun de ces choix.'] },
        { h: 'Penser à la journée des invités', p: [
          'Vu depuis la place d’un invité, un séminaire est un parcours : l’arrivée, l’accueil et le badge, la salle à trouver, les pauses, les repas, la soirée, le retour. Signalétique, transferts et régimes alimentaires sont de petites choses que l’on remarque quand elles manquent.'] },
        { h: 'Répéter, et prévoir ce qui peut mal tourner', p: [
          'Chaque intervenant doit monter sur scène avant l’arrivée des invités, avec ses slides et son micro. Gardez un ordinateur de secours avec toutes les présentations, des micros et des piles de rechange, et un plan B pour tout ce qui se passe en extérieur. Le jour J, une personne doit pouvoir décider : le chef de projet.'] },
        { h: 'Après le séminaire', p: [
          'Envoyez aux participants les photos, les slides clés ou un court film pendant que le séminaire est encore frais. Demandez-leur ce qu’ils en ont pensé. Et notez ce qui a marché et ce qui n’a pas marché : c’est la première page du brief du suivant.'] },
        { h: 'La checklist', p: [], list: [
          'Une phrase pour l’objectif',
          'La ville, choisie pour ceux qui voyagent',
          'Un lieu visité avec le programme en main',
          'La date fixée tôt',
          'Un déroulé, minute par minute',
          'Un plan technique dessiné pour la salle',
          'La journée des invités, de l’arrivée au départ',
          'Une répétition avec chaque intervenant',
          'Photos, film et retours après l’événement'] }
      ]
    },
    related: { events: ['seminar', 'convention'], services: ['conferences'], guides: ['choose-the-city', 'technical-set-up'] }
  },
  {
    id: 'choose-the-city',
    slug: { en: 'casablanca-rabat-marrakech-or-tangier-where-to-hold-your-event', fr: 'casablanca-rabat-marrakech-ou-tanger-ou-organiser-votre-evenement' },
    date: '2026-11-24',
    image: ['assets/img/reception-golden-spheres.jpg', 1280, 720],
    title: { en: ['Casablanca, Rabat, Marrakech or Tangier:', 'where to hold your event'], fr: ['Casablanca, Rabat, Marrakech ou Tanger :', 'où organiser votre événement'] },
    card: {
      en: 'Who travels, what kind of event, which season: how to choose the city for a corporate event in Morocco.',
      fr: 'Qui voyage, quel type d’événement, quelle saison : comment choisir la ville d’un événement d’entreprise au Maroc.'
    },
    lede: {
      en: 'Each city suits some events better than others. Here is how we help clients choose, from the events we produce in Casablanca, Rabat, Marrakech and Tangier.',
      fr: 'Chaque ville convient mieux à certains événements qu’à d’autres. Voici comment nous aidons nos clients à choisir, à partir des événements que nous produisons à Casablanca, Rabat, Marrakech et Tanger.'
    },
    seo: {
      title: { en: 'Casablanca, Rabat, Marrakech, Tangier: Which City? | benevents agency', fr: 'Casablanca, Rabat, Marrakech, Tanger : quelle ville ? | benevents agency' },
      desc: {
        en: 'Choosing the city of a corporate event in Morocco: who travels, the kind of event, the season, and what Casablanca, Rabat, Marrakech and Tangier do best.',
        fr: 'La ville d’un événement d’entreprise au Maroc : qui voyage, le type d’événement, la saison, et ce que Casablanca, Rabat, Marrakech et Tanger font de mieux.'
      }
    },
    body: {
      en: [
        { h: 'Three questions decide the city', p: ['Before comparing hotels, answer three questions:'],
          list: ['Who travels, and from where? The city should be easy for most of your guests.',
                 'What kind of event is it? A working day, an official event and a stay with an evening do not need the same city.',
                 'When? Some seasons suit some cities better, and some months are busier everywhere.'] },
        { h: 'Casablanca: business, flights and big rooms', p: [
          'Casablanca is where most working events with a public side take place: conventions that end with a gala dinner, forums that are filmed, launches that the press and the dealers must both remember. Mohammed V International Airport is the country’s main hub, which makes it the natural choice when guests fly in from several countries.',
          'The city has the rooms for large events, from hotel ballrooms and conference centres to showrooms and industrial halls that can be dressed from floor to ceiling. We produced the {WeXchange forum|project:wexchange-forum} at the Barceló Anfa there, filmed and directed live from our control desk. The last months of the year are the busiest for conventions: the earlier the date is fixed, the wider the choice of rooms.'] },
        { h: 'Rabat: institutions and protocol', p: [
          'In Rabat we mostly produce forums, conferences, masterclasses, closing ceremonies and official receptions. They share senior speakers, several languages in the room, cameras, and a programme that must run to the minute. Institutional events have their own rules, order of precedence, accreditation, several languages, and we plan for them from the first meeting.',
          'Rabat and Casablanca are about an hour apart by train, so guests from both cities can meet for a half-day event. In Rabat we produced the {“Femmes en jeu” masterclass|project:femmes-en-jeu} with CANAL+ University during the Africa Cup of Nations.'] },
        { h: 'Marrakech: a stay, and an evening to remember', p: [
          'An event in Marrakech is usually a stay: plenary sessions by day, an evening that people will talk about, sometimes a dinner outside the city. The settings are the reason to come, from hotel ballrooms and gardens to riads, palaces and the Agafay desert, and each has its own constraints of power, sound and access.',
          'Marrakech has direct flights from many European cities, and Marrakech-Menara airport is a short drive from the centre. Spring and autumn are the most pleasant seasons; in summer, outdoor evenings start late and daytime sessions stay indoors. An outdoor setting needs its own power supply, respect for sound limits and a plan B for wind or rain.'] },
        { h: 'Tangier: between two seas, linked by high-speed train', p: [
          'Tangier is linked to Casablanca and Rabat by the Al Boraq high-speed train, which makes it possible to bring teams from the three cities together. Its hotels can host a seminar of several days, with sessions by day and a gala by night.',
          'We produced {MTA’s cycle meeting|project:mta-cycle-meeting} at the Fairmont Tazi Palace in Tangier: plenary sessions on a stage with a centre LED wall, then a gala dinner in front of a wall of LED artwork in the same room.'] },
        { h: 'In short', p: [], list: [
          'Guests flying in from several countries: Casablanca.',
          'An official event, with protocol and several languages: Rabat.',
          'A stay with an evening to remember: Marrakech.',
          'Teams from the north and from the Casablanca–Rabat axis together: Tangier.'],
          after: ['Wherever you choose, the technical team, the stage and the control desk travel with us: we work all over Morocco.'] }
      ],
      fr: [
        { h: 'Trois questions décident de la ville', p: ['Avant de comparer les hôtels, répondez à trois questions :'],
          list: ['Qui voyage, et d’où ? La ville doit être simple d’accès pour la plupart de vos invités.',
                 'De quel type d’événement s’agit-il ? Une journée de travail, un événement officiel et un séjour avec une soirée ne demandent pas la même ville.',
                 'Quand ? Certaines saisons conviennent mieux à certaines villes, et certains mois sont chargés partout.'] },
        { h: 'Casablanca : les affaires, les vols et les grandes salles', p: [
          'Casablanca accueille la plupart des événements de travail qui ont une dimension publique : conventions qui se terminent par un dîner de gala, forums filmés, lancements dont la presse et les concessionnaires doivent se souvenir. L’aéroport international Mohammed V est la principale porte d’entrée du pays : c’est le choix naturel quand les invités arrivent de plusieurs pays.',
          'La ville a les salles des grands événements, des salles de bal d’hôtel et centres de congrès aux showrooms et halles industrielles que l’on peut habiller du sol au plafond. Nous y avons produit le {forum WeXchange|project:wexchange-forum} au Barceló Anfa, filmé et réalisé en direct depuis notre régie. Les derniers mois de l’année sont les plus chargés en conventions : plus la date est fixée tôt, plus le choix des salles est large.'] },
        { h: 'Rabat : les institutions et le protocole', p: [
          'À Rabat, nous produisons surtout des forums, des conférences, des masterclasses, des cérémonies de clôture et des réceptions officielles. Ils ont en commun des intervenants de haut niveau, plusieurs langues dans la salle, des caméras et un programme qui doit tenir à la minute. Les événements institutionnels ont leurs règles, ordre protocolaire, accréditations, plusieurs langues, et nous les prévoyons dès la première réunion.',
          'Rabat et Casablanca sont à environ une heure de train : les invités des deux villes peuvent se retrouver pour une demi-journée. À Rabat, nous avons produit la {masterclass « Femmes en jeu »|project:femmes-en-jeu} avec CANAL+ University pendant la Coupe d’Afrique des Nations.'] },
        { h: 'Marrakech : un séjour, et une soirée mémorable', p: [
          'Un événement à Marrakech est le plus souvent un séjour : des plénières le jour, une soirée dont on parlera, parfois un dîner hors de la ville. Les lieux sont la raison de venir, des salles de bal et jardins d’hôtel aux riads, palais et au désert d’Agafay, et chacun a ses contraintes d’électricité, de son et d’accès.',
          'Marrakech a des vols directs depuis de nombreuses villes européennes, et l’aéroport de Marrakech-Ménara est à quelques minutes du centre. Le printemps et l’automne sont les saisons les plus agréables ; en été, les soirées en extérieur commencent tard et les sessions de journée restent à l’intérieur. Un lieu en plein air demande sa propre alimentation électrique, le respect des limites sonores et un plan B en cas de vent ou de pluie.'] },
        { h: 'Tanger : entre deux mers, reliée par la grande vitesse', p: [
          'Tanger est reliée à Casablanca et Rabat par la ligne à grande vitesse Al Boraq, ce qui permet de réunir les équipes des trois villes. Ses hôtels peuvent accueillir un séminaire de plusieurs jours, avec des sessions le jour et un gala le soir.',
          'Nous avons produit le {cycle meeting de MTA|project:mta-cycle-meeting} au Fairmont Tazi Palace de Tanger : des plénières sur une scène avec un mur LED central, puis un dîner de gala devant un mur d’œuvres LED dans la même salle.'] },
        { h: 'En bref', p: [], list: [
          'Des invités qui arrivent de plusieurs pays : Casablanca.',
          'Un événement officiel, avec protocole et plusieurs langues : Rabat.',
          'Un séjour avec une soirée mémorable : Marrakech.',
          'Des équipes du Nord et de l’axe Casablanca–Rabat réunies : Tanger.'],
          after: ['Quelle que soit la ville, l’équipe technique, la scène et la régie voyagent avec nous : nous travaillons partout au Maroc.'] }
      ]
    },
    related: { cities: ['casablanca', 'rabat', 'marrakech'], events: ['seminar', 'gala'], guides: ['seminar-checklist'] }
  },
  {
    id: 'technical-set-up',
    slug: { en: 'led-wall-sound-and-lighting-for-a-corporate-event', fr: 'ecran-led-son-et-lumiere-pour-un-evenement-d-entreprise' },
    date: '2026-11-24',
    image: ['assets/img/control-desk-ballroom.jpg', 1280, 960],
    title: { en: ['LED wall, sound and lighting:', 'the technical side, explained'], fr: ['Écran LED, son et lumière :', 'la technique expliquée'] },
    card: {
      en: 'Screen, sound, light, control desk and filming: what each one does, and the questions to ask before you book.',
      fr: 'Écran, son, lumière, régie et captation : à quoi sert chacun, et les questions à poser avant de réserver.'
    },
    lede: {
      en: 'What a corporate event needs on the technical side, in plain words: how to choose a screen, why sound matters most, what light is for, and who runs it all on the day.',
      fr: 'Ce dont un événement d’entreprise a besoin côté technique, en termes simples : comment choisir un écran, pourquoi le son compte le plus, à quoi sert la lumière, et qui mène tout le jour J.'
    },
    seo: {
      title: { en: 'LED Wall, Sound and Lighting for Corporate Events | benevents agency', fr: 'Écran LED, son et lumière pour vos événements | benevents agency' },
      desc: {
        en: 'How to choose an LED wall, plan the sound and the lighting, and run a corporate event from one control desk, with filming and broadcast: a plain-words guide.',
        fr: 'Comment choisir un écran LED, prévoir le son et la lumière, et mener un événement d’entreprise depuis une régie, avec captation et diffusion : le guide en termes simples.'
      }
    },
    body: {
      en: [
        { h: 'Start from the room and the audience', p: [
          'The technical side of an event is not a list of equipment. It starts with two questions: how big is the room, and what must the audience see and hear? A forum where every word counts, a gala where the atmosphere does, and a launch where one product must shine do not need the same set-up, even in the same room.'] },
        { h: 'The screen: LED wall or projector', p: [
          'An LED wall gives its own light: it stays bright in a lit room, it can be any size, and it can take any shape, wide, curved or split into several screens. A projector needs a dark room and a clear line between the lens and the screen. For most corporate events today, the LED wall is the better choice.',
          'Three things to decide:'],
          list: ['The size: the slides must be readable from the back row. In a long room, side screens bring the image closer to the people at the back.',
                 'The shape: a wide wall, a curved wall or three separate screens. We built a wide curved wall for the {“Femmes en jeu” masterclass|project:femmes-en-jeu} in Rabat, and {three screens for LEO’s regional conference|project:leo-regional-conference}.',
                 'The content: a wall wider than a slide needs content made for its shape. Plan it with the speakers, not the night before.'],
          after: ['LED walls are described by their pixel pitch, the distance between two lights in millimetres. The smaller it is, the closer the audience can sit without seeing the dots.'] },
        { h: 'Sound: what the audience remembers least, and notices first', p: [
          'Nobody remembers good sound, and everybody remembers bad sound. For a speech, what matters is that every word is understood in every seat, without echo or feedback. Plan one microphone per speaker, headset or lavalier for those who move, handheld microphones for questions from the room, and someone at the desk to follow every voice.',
          'Music has its own needs: the walk-in, the transitions between speakers, the dinner, the party. Outdoors, check the sound limits of the place and the neighbourhood before choosing the system.'] },
        { h: 'Light: for faces, for cameras, for the mood', p: [
          'Light has three jobs. First, to light the faces on stage, so that the audience and the cameras see the speakers. Second, to dress the room: a wash of colour on the walls, in the brand’s colours if you like, changes a hotel ballroom into your room. Third, to give rhythm: moving heads and effects for a show, an award or the end of the evening.',
          'Haze, which makes light beams visible, is not allowed in every venue because of smoke detectors: ask before you plan it.'] },
        { h: 'The control desk: one place, one team', p: [
          'Sound, light, screens and cameras are run from the control desk, by people who know the running order by heart. Each change, a speaker arriving, a video starting, the light changing for dinner, is a cue written in advance and rehearsed. The fewer teams involved, the fewer things fall between two of them. That is why we run sound, light and video from our own control desk, with our own team.'] },
        { h: 'Filming and broadcast', p: [
          'If the event is filmed, decide it at the same time as the stage: where the cameras stand, how the stage is lit for them, and who directs. Several cameras and a live director give a film that can be shown on the screens in the room, broadcast to people who could not come, and kept for afterwards.'] },
        { h: 'Questions to ask before you book', p: [], list: [
          'Who will be at the control desk on the day, and have they seen the running order?',
          'What happens if a computer, a microphone or a screen fails?',
          'How long does the set-up take, and when can it start?',
          'How much power does the set-up need, and does the venue have it where the stage stands?',
          'Who makes the content for the screens, and when is it ready?',
          'Is a rehearsal planned with the speakers?'] }
      ],
      fr: [
        { h: 'Partir de la salle et du public', p: [
          'La technique d’un événement n’est pas une liste de matériel. Elle commence par deux questions : quelle est la taille de la salle, et que doit voir et entendre le public ? Un forum où chaque mot compte, un gala où l’atmosphère compte, et un lancement où un produit doit briller ne demandent pas le même dispositif, même dans la même salle.'] },
        { h: 'L’écran : mur LED ou vidéoprojecteur', p: [
          'Un mur LED produit sa propre lumière : il reste lumineux dans une salle éclairée, il peut avoir n’importe quelle taille, et prendre n’importe quelle forme, large, incurvé ou divisé en plusieurs écrans. Un vidéoprojecteur demande une salle sombre et un passage libre entre l’objectif et l’écran. Pour la plupart des événements d’entreprise aujourd’hui, le mur LED est le meilleur choix.',
          'Trois choses à décider :'],
          list: ['La taille : les slides doivent être lisibles depuis le dernier rang. Dans une salle longue, des écrans latéraux rapprochent l’image des derniers rangs.',
                 'La forme : un mur large, un mur incurvé ou trois écrans séparés. Nous avons construit un large mur incurvé pour la {masterclass « Femmes en jeu »|project:femmes-en-jeu} à Rabat, et {trois écrans pour la conférence régionale de LEO|project:leo-regional-conference}.',
                 'Le contenu : un mur plus large qu’une slide demande des contenus faits pour sa forme. Prévoyez-les avec les intervenants, pas la veille.'],
          after: ['Les murs LED se décrivent par leur pitch, la distance entre deux points lumineux en millimètres. Plus il est petit, plus le public peut s’asseoir près sans voir les points.'] },
        { h: 'Le son : ce que le public retient le moins, et remarque en premier', p: [
          'Personne ne se souvient d’un bon son, et tout le monde se souvient d’un mauvais. Pour une prise de parole, l’essentiel est que chaque mot soit compris à chaque place, sans écho ni larsen. Prévoyez un micro par intervenant, serre-tête ou cravate pour ceux qui bougent, des micros main pour les questions de la salle, et quelqu’un à la console pour suivre chaque voix.',
          'La musique a ses propres besoins : l’entrée du public, les transitions entre intervenants, le dîner, la fête. En extérieur, vérifiez les limites sonores du lieu et du voisinage avant de choisir le système.'] },
        { h: 'La lumière : pour les visages, pour les caméras, pour l’ambiance', p: [
          'La lumière a trois rôles. D’abord éclairer les visages sur scène, pour que le public et les caméras voient les intervenants. Ensuite habiller la salle : une couleur sur les murs, aux couleurs de la marque si vous le souhaitez, transforme une salle de bal d’hôtel en votre salle. Enfin donner du rythme : projecteurs asservis et effets pour un spectacle, une remise de prix ou la fin de la soirée.',
          'La brume, qui rend les faisceaux visibles, n’est pas autorisée partout à cause des détecteurs de fumée : demandez avant de la prévoir.'] },
        { h: 'La régie : un seul endroit, une seule équipe', p: [
          'Le son, la lumière, les écrans et les caméras se pilotent depuis la régie, par des personnes qui connaissent le déroulé par cœur. Chaque changement, l’arrivée d’un intervenant, le lancement d’une vidéo, la lumière qui change pour le dîner, est un top écrit à l’avance et répété. Moins il y a d’équipes, moins il y a de choses qui tombent entre deux. C’est pourquoi nous menons le son, la lumière et la vidéo depuis notre propre régie, avec notre propre équipe.'] },
        { h: 'La captation et la diffusion', p: [
          'Si l’événement est filmé, décidez-le en même temps que la scène : où se placent les caméras, comment la scène est éclairée pour elles, et qui réalise. Plusieurs caméras et un réalisateur en direct donnent un film que l’on peut montrer sur les écrans de la salle, diffuser à ceux qui n’ont pas pu venir, et garder pour la suite.'] },
        { h: 'Les questions à poser avant de réserver', p: [], list: [
          'Qui sera à la régie le jour J, et a-t-il vu le déroulé ?',
          'Que se passe-t-il si un ordinateur, un micro ou un écran tombe en panne ?',
          'Combien de temps dure l’installation, et quand peut-elle commencer ?',
          'De quelle puissance électrique le dispositif a-t-il besoin, et le lieu l’a-t-il là où sera la scène ?',
          'Qui prépare les contenus des écrans, et quand sont-ils prêts ?',
          'Une répétition est-elle prévue avec les intervenants ?'] }
      ]
    },
    related: { services: ['production', 'conferences'], events: ['convention', 'gala'], guides: ['seminar-checklist'] }
  }
];

// the words of these pages and of the page that lists them
export const GUIDE_WORDS = {
  en: {
    folder: '/guides/', index: '/guides', name: 'Guides', eyebrow: 'Guide', read: n => `${n} min read`, updated: 'Updated', written: 'Published',
    title: ['Guides', 'to organise your event'],
    lede: 'Practical answers to the questions our clients ask before an event in Morocco: the city, the venue, the programme and the technical side.',
    seo: ['Guides to Organise a Corporate Event in Morocco | benevents agency', 'Practical guides to organise a corporate event in Morocco: seminars, the choice of the city, the venue, the programme and the technical set-up.'],
    contents: 'In this guide', next: 'To go further', card: 'Read the guide', by: 'benevents agency',
    endTitle: 'An event in preparation?', endText: 'Tell us the date, the city and the number of guests: we will come back with first ideas.',
    cover: t => `${t}: a guide by benevents agency`
  },
  fr: {
    folder: '/fr/guides/', index: '/fr/guides', name: 'Guides', eyebrow: 'Guide', read: n => `${n} min de lecture`, updated: 'Mis à jour', written: 'Publié',
    title: ['Guides', 'pour organiser votre événement'],
    lede: 'Des réponses pratiques aux questions que nos clients posent avant un événement au Maroc : la ville, le lieu, le programme et la technique.',
    seo: ['Guides pour organiser un événement d’entreprise au Maroc | benevents agency', 'Des guides pratiques pour organiser un événement d’entreprise au Maroc : séminaires, choix de la ville, du lieu, programme et technique.'],
    contents: 'Dans ce guide', next: 'Pour aller plus loin', card: 'Lire le guide', by: 'benevents agency',
    endTitle: 'Un événement en préparation ?', endText: 'Donnez-nous la date, la ville et le nombre d’invités : nous revenons vers vous avec de premières idées.',
    cover: t => `${t} : un guide de benevents agency`
  }
};
