/* benevents agency — portfolio projects.
   One entry per project, in the order shown on the site. To add a project, copy an
   entry, put its photos in assets/img/projects/<id>/ and list them here.

   id     : short name used in the page address (#project/<id>), lowercase with dashes
   title  : project name; use { en: '…', fr: '…' } when it needs translating
   kind   : type of event, shown as a label
   intro  : one or two sentences shown at the top of the project page
   cover  : which part of the first photo stays in view on the portfolio card
            (any CSS background-position, optional)
   photos : every photo of the project, the first one is the cover: ['path', width, height] */
(function () {
  'use strict';

  var KIND = {
    masterclass: { en: 'Masterclass', fr: 'Masterclass' },
    tech: { en: 'Tech event', fr: 'Événement tech' },
    reception: { en: 'Reception', fr: 'Réception' },
    seminar: { en: 'Seminar', fr: 'Séminaire' },
    ceremony: { en: 'Closing ceremony', fr: 'Cérémonie de clôture' },
    convention: { en: 'Convention', fr: 'Convention' },
    institutional: { en: 'Institutional forum', fr: 'Forum institutionnel' },
    conference: { en: 'Conference', fr: 'Conférence' },
    final: { en: 'Competition final', fr: 'Finale de compétition' },
    fanzone: { en: 'Fan zone', fr: 'Fan zone' },
    experience: { en: 'Brand experience', fr: 'Expérience de marque' },
    forum: { en: 'Forum', fr: 'Forum' },
    brand: { en: 'Brand event', fr: 'Événement de marque' },
    corporate: { en: 'Corporate reception', fr: 'Réception d’entreprise' },
    science: { en: 'Scientific meeting', fr: 'Rencontre scientifique' }
  };

  window.BEN_PROJECTS = [
    {
      id: 'femmes-en-jeu',
      title: 'Femmes en jeu · Canal+ University',
      kind: KIND.masterclass,
      intro: {
        en: 'A masterclass on the impact of women in football, held in Rabat during the Africa Cup of Nations with CANAL+ University and Fondation CANAL+. Curved LED wall, keynotes and panel discussions.',
        fr: 'Une masterclass sur l’impact des femmes dans le football, organisée à Rabat pendant la Coupe d’Afrique des Nations avec CANAL+ University et la Fondation CANAL+. Mur LED incurvé, keynotes et tables rondes.'
      },
      photos: [
        ['assets/img/led-stage-set.jpg', 1200, 1600],
        ['assets/img/projects/femmes-en-jeu/01.webp', 1200, 1600],
        ['assets/img/projects/femmes-en-jeu/02.webp', 1280, 960],
        ['assets/img/projects/femmes-en-jeu/03.webp', 960, 1280],
        ['assets/img/projects/femmes-en-jeu/04.webp', 960, 1280],
        ['assets/img/projects/femmes-en-jeu/05.webp', 1200, 1600],
        ['assets/img/projects/femmes-en-jeu/06.webp', 960, 1280],
        ['assets/img/projects/femmes-en-jeu/07.webp', 720, 1280]
      ]
    },
    {
      id: 'tech-fest-maroc',
      title: 'Tech Fest Maroc · OneCloud',
      kind: KIND.tech,
      intro: {
        en: 'The first edition of OneCloud’s Tech Fest Maroc, dedicated to AI, cloud and cybersecurity: stage, LED wall and a room bathed in blue.',
        fr: 'Première édition du Tech Fest Maroc de OneCloud, consacrée à l’IA, au cloud et à la cybersécurité : scène, mur LED et salle baignée de bleu.'
      },
      photos: [
        ['assets/img/tech-fest-maroc.jpg', 1280, 960],
        ['assets/img/wall/conference-stage-armchairs.jpg', 960, 1280],
        ['assets/img/projects/tech-fest-maroc/01.webp', 960, 1280]
      ]
    },
    {
      id: 'marrakech-cocktail',
      title: { en: 'Cocktail Evening · Marrakech', fr: 'Soirée cocktail · Marrakech' },
      kind: KIND.reception,
      intro: {
        en: 'A cocktail evening under a canopy of golden lanterns in Marrakech, with a live DJ set and warm amber lighting.',
        fr: 'Une soirée cocktail sous une nuée de lanternes dorées à Marrakech, avec DJ set en direct et lumière ambrée.'
      },
      photos: [
        ['assets/img/reception-golden-spheres.jpg', 1280, 720],
        ['assets/img/wall/dj-decks-golden-spheres.jpg', 720, 1280],
        ['assets/img/projects/marrakech-cocktail/01.webp', 720, 1280],
        ['assets/img/projects/marrakech-cocktail/02.webp', 960, 1280],
        ['assets/img/projects/marrakech-cocktail/03.webp', 720, 1280]
      ]
    },
    {
      id: 'mta-cycle-meeting',
      title: 'MTA Cycle Meeting',
      kind: KIND.seminar,
      cover: 'center 30%',
      intro: {
        en: 'A cycle meeting at the Fairmont Tazi Palace in Tangier: plenary sessions on stage by day, gala dinner in front of a wall of LED artwork by night.',
        fr: 'Un cycle meeting au Fairmont Tazi Palace de Tanger : plénières sur scène en journée, dîner de gala devant un mur LED aux visuels artistiques en soirée.'
      },
      photos: [
        ['assets/img/mta-cycle-meeting.jpg', 960, 1280],
        ['assets/img/wall/ballroom-purple.jpg', 960, 1280],
        ['assets/img/wall/gala-tables-led-art.jpg', 1280, 1280],
        ['assets/img/wall/lighting-desk.jpg', 1280, 1280]
      ]
    },
    {
      id: 'a-chance-to-reset',
      title: 'A Chance to Reset · EFE Maroc',
      kind: KIND.ceremony,
      intro: {
        en: 'The closing ceremony of EFE Maroc’s “A Chance to Reset” project: opening address, panel discussions, laureates’ testimonies and a graduation on stage.',
        fr: 'La cérémonie de clôture du projet « A Chance to Reset » d’EFE Maroc : mot d’ouverture, tables rondes, paroles de lauréats et remise de diplômes sur scène.'
      },
      photos: [
        ['assets/img/graduation-ceremony.jpg', 2000, 1330],
        ['assets/img/conference-opening.jpg', 2000, 1330],
        ['assets/img/wall/closing-ceremony-screen.jpg', 960, 1280],
        ['assets/img/projects/a-chance-to-reset/01.webp', 960, 1280],
        ['assets/img/projects/a-chance-to-reset/02.webp', 960, 1280],
        ['assets/img/projects/a-chance-to-reset/03.webp', 1280, 960],
        ['assets/img/projects/a-chance-to-reset/04.webp', 960, 1280]
      ]
    },
    {
      id: 'rma-convention',
      title: { en: 'RMA Convention', fr: 'Convention RMA' },
      kind: KIND.convention,
      cover: 'center 45%',
      intro: {
        en: 'A convention for RMA under the banner “Ensemble, construisons l’avenir”: a circular centre stage, a runway to the LED wall and dinner tables all around.',
        fr: 'Une convention RMA sous le signe « Ensemble, construisons l’avenir » : scène centrale circulaire, passerelle jusqu’au mur LED et tables de dîner tout autour.'
      },
      photos: [
        ['assets/img/stage-runway.jpg', 960, 1280],
        ['assets/img/projects/rma-convention/01.webp', 960, 1280],
        ['assets/img/control-desk-ballroom.jpg', 1280, 960]
      ]
    },
    {
      id: 'uae-morocco-forum',
      title: 'UAE–Morocco Forum for Economic Partnership',
      kind: KIND.institutional,
      intro: {
        en: 'A forum on business and investment opportunities between the United Arab Emirates and Morocco, with a curved LED backdrop, stage and round-table seating.',
        fr: 'Un forum consacré aux opportunités d’affaires et d’investissement entre les Émirats arabes unis et le Maroc, avec fond de scène LED incurvé, scène et tables rondes.'
      },
      photos: [
        ['assets/img/uae-morocco-forum.jpg', 960, 1280]
      ]
    },
    {
      id: 'gsk-day',
      title: 'GSK Day',
      kind: KIND.conference,
      intro: {
        en: 'GSK Day, “Pour un avenir en santé”: a plenary room dressed in the brand’s colours, from the LED stage to the chair covers.',
        fr: 'GSK Day, « Pour un avenir en santé » : une plénière habillée aux couleurs de la marque, de la scène LED aux housses de chaises.'
      },
      photos: [
        ['assets/img/gsk-day.jpg', 960, 1280],
        ['assets/img/projects/gsk-day/01.webp', 1280, 960]
      ]
    },
    {
      id: 'sustainable-innovation-fest',
      title: 'Sustainable Innovation Fest · Enactus',
      kind: KIND.final,
      intro: {
        en: 'The national competition final and closing ceremony of Enactus Morocco’s Sustainable Innovation Fest, with a triple-screen stage and live direction.',
        fr: 'Finale de la compétition nationale et cérémonie de clôture du Sustainable Innovation Fest d’Enactus Morocco, avec scène à trois écrans et réalisation en direct.'
      },
      photos: [
        ['assets/img/awards-celebration.jpg', 1440, 1152],
        ['assets/img/projects/sustainable-innovation-fest/01.webp', 900, 672],
        ['assets/img/wall/production-desk-finale.jpg', 960, 1280]
      ]
    },
    {
      id: 'fanzone-can-2025',
      title: 'Fanzone CAN 2025',
      kind: KIND.fanzone,
      cover: 'center 30%',
      intro: {
        en: 'A fan zone in the colours of the Africa Cup of Nations: giant LED screen, flags overhead and lounge seating for match days.',
        fr: 'Une fan zone aux couleurs de la Coupe d’Afrique des Nations : écran LED géant, drapeaux au plafond et salons pour les jours de match.'
      },
      photos: [
        ['assets/img/fanzone-can-2025.jpg', 960, 1280]
      ]
    },
    {
      id: 'gillette-watch-party',
      title: 'Gillette Watch Party',
      kind: KIND.experience,
      cover: 'center 60%',
      intro: {
        en: 'A match-day watch party for Gillette: giant screen, bean-bag seating, a tombola and live control of the broadcast.',
        fr: 'Une watch party Gillette les jours de match : écran géant, poufs, tombola et régie pour la retransmission en direct.'
      },
      photos: [
        ['assets/img/wall/watch-party-bean-bags.jpg', 960, 1280],
        ['assets/img/projects/gillette-watch-party/01.webp', 960, 1280],
        ['assets/img/wall/control-room-match.jpg', 960, 1280]
      ]
    },
    {
      id: 'leo-regional-conference',
      title: 'LEO Distributor Regional Conference',
      kind: KIND.conference,
      intro: {
        en: '“Empowering Future, Sharing New Journey”: LEO’s regional distributor conference for the Middle East and Africa, in classroom layout facing a triple LED screen.',
        fr: '« Empowering Future, Sharing New Journey » : la conférence régionale des distributeurs LEO pour le Moyen-Orient et l’Afrique, en disposition classe face à un triple écran LED.'
      },
      photos: [
        ['assets/img/leo-regional-conference.jpg', 1280, 720],
        ['assets/img/projects/leo-regional-conference/01.webp', 720, 1280],
        ['assets/img/projects/leo-regional-conference/02.webp', 720, 1280]
      ]
    },
    {
      id: 'wexchange-forum',
      title: 'WeXchange Forum',
      kind: KIND.forum,
      intro: {
        en: 'A forum on social innovation at the Barceló Anfa Casablanca: panel discussions on stage, filmed and directed live from our control desk.',
        fr: 'Un forum sur l’innovation sociale au Barceló Anfa Casablanca : tables rondes sur scène, captées et réalisées en direct depuis notre régie.'
      },
      photos: [
        ['assets/img/forum-panel.jpg', 2000, 1330],
        ['assets/img/production-desk.jpg', 2000, 1125]
      ]
    },
    {
      id: 'volvo-built-on-trust',
      title: 'Volvo · Built on Trust',
      kind: KIND.brand,
      cover: 'center 25%',
      intro: {
        en: 'An evening for Volvo under the theme “Built on Trust. Driving Morocco Forward.”, in an industrial hall with LED screen and branded cocktail tables.',
        fr: 'Une soirée Volvo sur le thème « Built on Trust. Driving Morocco Forward. », dans une halle industrielle avec écran LED et mange-debout aux couleurs de la marque.'
      },
      photos: [
        ['assets/img/volvo-built-on-trust.jpg', 960, 1280],
        ['assets/img/projects/volvo-built-on-trust/01.webp', 960, 1280]
      ]
    },
    {
      id: 'centrale-automobile-cherifienne',
      title: 'Centrale Automobile Chérifienne',
      kind: KIND.corporate,
      intro: {
        en: 'A corporate reception at the Centrale Automobile Chérifienne showroom, around the presentation “Une vision orientée clients”.',
        fr: 'Une réception d’entreprise au showroom de la Centrale Automobile Chérifienne, autour de la présentation « Une vision orientée clients ».'
      },
      photos: [
        ['assets/img/showroom-reception.jpg', 2000, 1334]
      ]
    },
    {
      id: 'onco-days',
      title: 'Onco-Days · H&N Session',
      kind: KIND.science,
      cover: 'center 30%',
      intro: {
        en: 'The H&N Session of Onco-Days: a scientific meeting with a full-width LED stage, lectern, lounge set and branded dinner tables.',
        fr: 'La H&N Session des Onco-Days : une rencontre scientifique avec scène LED pleine largeur, pupitre, salon et tables habillées.'
      },
      photos: [
        ['assets/img/onco-days.jpg', 960, 1280]
      ]
    }
  ];
})();
