/* benevents agency — one page per kind of event we produce (events/<slug>, fr/evenements/<slug>),
   and the page that lists them (events, fr/evenements). Written by tools/site/build.mjs.

   Only kinds of events the portfolio shows, and only what is true today: an answer is a promise.

   id      : short name, used by the home page ("Compose your event") and in data-page="event:<id>"
   service : the service (assets/js/services.js) this kind of event belongs to
   slug    : the end of the page's address, in each language
   name    : what the event is called, short (cards, links, the footer)
   title   : the two lines of the big title
   lede    : the sentence under it
   seo     : the title and the description search engines show
   image   : the photo at the top of the page, from one of our projects: ['path', width, height]
   text    : two or three paragraphs
   does    : what we take care of, a few short lines
   steps   : how we run it: { en: { title, intro, points: [['name', 'sentence'], …] }, fr: { … } }
   ideas   : projects of the portfolio that show it: { project: '<id in projects.js>', title, text }
   faq     : questions and answers: { en: [['question', 'answer'], …], fr: [ … ] } */

export const EVENTS = [
  {
    id: 'seminar',
    service: 'conferences',
    slug: { en: 'seminar-organisation-morocco', fr: 'organisation-seminaire-maroc' },
    name: { en: 'Seminar', fr: 'Séminaire' },
    title: { en: ['Corporate seminars', 'in Morocco'], fr: ['Séminaires d’entreprise', 'au Maroc'] },
    lede: {
      en: 'Plenary sessions, workshops and an evening that brings the team together: a seminar designed around what you want your people to take home.',
      fr: 'Plénières, ateliers et une soirée qui rassemble : un séminaire conçu autour de ce que vos équipes doivent en retenir.'
    },
    seo: {
      title: { en: 'Corporate Seminar Organisation in Morocco | benevents agency', fr: 'Organisation de séminaire d’entreprise au Maroc | benevents agency' },
      desc: {
        en: 'Seminars in Casablanca, Rabat, Marrakech or Tangier: format, venue, stage, LED screens, sound and light, and the evening. One producer from brief to last session.',
        fr: 'Séminaire à Casablanca, Rabat, Marrakech ou Tanger : format, lieu, scène, écrans LED, son, lumière et soirée. Un seul chef de projet, du brief à la dernière session.'
      }
    },
    image: ['assets/img/mta-cycle-meeting.jpg', 960, 1280],
    text: {
      en: ['A seminar is a few days that should change how a team works when it is back at the office. Everything we design follows from that: the order of the sessions, the layout of the room, the moments when people talk to each other rather than listen, and the evening that closes the day.',
           'For MTA’s cycle meeting at the Fairmont Tazi Palace in Tangier, the plenary ran on a stage with a centre LED wall by day, and the same room became a gala dinner in front of a wall of LED artwork by night. That is the kind of seminar we like to produce: one place, several moments, no dead time between them.',
           'We take care of the stage, the screens, the sound, the light and the control desk with our own team, and we coordinate the venue and the other suppliers. You deal with one producer, from the first brief to the last session.'],
      fr: ['Un séminaire, ce sont quelques jours qui doivent changer la façon dont une équipe travaille une fois rentrée au bureau. Tout ce que nous concevons en découle : l’ordre des sessions, la disposition de la salle, les moments où l’on échange plutôt que d’écouter, et la soirée qui clôt la journée.',
           'Pour le cycle meeting de MTA au Fairmont Tazi Palace de Tanger, la plénière se tenait le jour sur une scène avec un mur LED central, et la même salle devenait le soir un dîner de gala devant un mur d’œuvres LED. C’est le séminaire que nous aimons produire : un seul lieu, plusieurs temps forts, aucun temps mort entre eux.',
           'Nous prenons en charge la scène, les écrans, le son, la lumière et la régie avec notre propre équipe, et nous coordonnons le lieu et les autres prestataires. Vous avez un seul interlocuteur, du premier brief à la dernière session.']
    },
    does: {
      en: ['Format and running order of the days', 'Choice of the venue and of the rooms', 'Plenary stage, LED screens and room dressing', 'Sound, light and video control', 'The evening: dinner, gala or cocktail', 'Filming and live direction'],
      fr: ['Format et déroulé des journées', 'Choix du lieu et des salles', 'Scène de plénière, écrans LED et habillage', 'Régie son, lumière et vidéo', 'La soirée : dîner, gala ou cocktail', 'Captation et réalisation en direct']
    },
    steps: {
      en: { title: 'How we run a seminar', intro: 'Four steps, with the same producer at each of them.', points: [
        ['Listen', 'Your objective, your teams, the dates and the city: what the seminar must achieve.'],
        ['Design', 'The format, the venue, the stage and a clear budget, presented before anything is booked.'],
        ['Prepare', 'Running order, content for the screens, technical plan and rehearsal with the speakers.'],
        ['Run', 'On the day, our team runs every session and every change of room from the control desk.']] },
      fr: { title: 'Comment nous menons un séminaire', intro: 'Quatre étapes, avec le même chef de projet à chacune.', points: [
        ['Écouter', 'Votre objectif, vos équipes, les dates et la ville : ce que le séminaire doit accomplir.'],
        ['Concevoir', 'Le format, le lieu, la scène et un budget clair, présentés avant toute réservation.'],
        ['Préparer', 'Déroulé, contenus des écrans, plan technique et répétition avec les intervenants.'],
        ['Opérer', 'Le jour J, notre équipe mène chaque session et chaque changement de salle depuis la régie.']] }
    },
    ideas: [
      { project: 'mta-cycle-meeting',
        title: { en: 'Plenary by day, gala by night', fr: 'Plénière le jour, gala le soir' },
        text: { en: 'Four days in Tangier, in one room that changed with the programme.', fr: 'Quatre jours à Tanger, dans une salle qui changeait avec le programme.' } },
      { project: 'leo-regional-conference',
        title: { en: 'A classroom facing three screens', fr: 'Une salle de classe face à trois écrans' },
        text: { en: 'Delegates at tables to take notes, a wide centre screen and two side screens.', fr: 'Des délégués à table pour prendre des notes, un large écran central et deux écrans latéraux.' } },
      { project: 'tech-fest-maroc',
        title: { en: 'Talks in a room bathed in blue', fr: 'Des talks dans une salle baignée de bleu' },
        text: { en: 'Theatre seating, an LED screen and lighting that sets the tone.', fr: 'Une salle en théâtre, un écran LED et une lumière qui donne le ton.' } },
      { project: 'gsk-day',
        title: { en: 'Your colours, from stage to chairs', fr: 'Vos couleurs, de la scène aux chaises' },
        text: { en: 'A plenary dressed in the brand, LED stage and chair covers included.', fr: 'Une plénière habillée aux couleurs de la marque, scène LED et housses de chaises comprises.' } }
    ],
    faq: {
      en: [
        ['In which cities do you organise seminars?', 'In Casablanca, Rabat and Marrakech, and wherever in Morocco your seminar takes place. We produced MTA’s cycle meeting at the Fairmont Tazi Palace in Tangier.'],
        ['Can the same room host the sessions and the dinner?', 'Yes. For MTA, the plenary room was turned into a gala dinner for the evening, in front of a wall of LED artwork.'],
        ['Who is our contact while the seminar is being prepared?', 'One dedicated producer, from the first conversation to the last session. They coordinate the venue, the suppliers, the technical side and the schedule.'],
        ['When do we know the budget?', 'Before anything is booked. The format, the venue and a clear budget are presented to you together.']
      ],
      fr: [
        ['Dans quelles villes organisez-vous des séminaires ?', 'À Casablanca, Rabat et Marrakech, et partout au Maroc où votre séminaire a lieu. Nous avons produit le cycle meeting de MTA au Fairmont Tazi Palace de Tanger.'],
        ['La même salle peut-elle accueillir les sessions et le dîner ?', 'Oui. Pour MTA, la salle de plénière a été transformée en dîner de gala pour la soirée, devant un mur d’œuvres LED.'],
        ['Qui est notre interlocuteur pendant la préparation ?', 'Un chef de projet dédié, de la première conversation à la dernière session. Il coordonne le lieu, les prestataires, la technique et le planning.'],
        ['À quel moment connaît-on le budget ?', 'Avant toute réservation. Le format, le lieu et un budget clair vous sont présentés ensemble.']
      ]
    }
  },
  {
    id: 'convention',
    service: 'conferences',
    slug: { en: 'corporate-convention-morocco', fr: 'organisation-convention-entreprise-maroc' },
    name: { en: 'Convention', fr: 'Convention' },
    title: { en: ['Corporate conventions', 'in Morocco'], fr: ['Conventions d’entreprise', 'au Maroc'] },
    lede: {
      en: 'Your whole network in one room, one message on stage: a convention staged so that every speaker is heard and the evening is remembered.',
      fr: 'Tout votre réseau dans une salle, un seul message sur scène : une convention mise en scène pour que chaque intervenant soit entendu et la soirée mémorable.'
    },
    seo: {
      title: { en: 'Corporate Convention Organisation in Morocco | benevents agency', fr: 'Organisation de convention d’entreprise au Maroc | benevents agency' },
      desc: {
        en: 'Annual conventions, sales and distributor meetings in Morocco: stage design, LED walls, running order, control desk, filming and the gala dinner, by one team.',
        fr: 'Conventions annuelles, réunions commerciales et de distributeurs au Maroc : scénographie, murs LED, déroulé, régie, captation et dîner de gala, par une seule équipe.'
      }
    },
    image: ['assets/img/projects/rma-convention/01.webp', 960, 1280],
    text: {
      en: ['A convention is the day a company speaks to all of its people at once: its sales force, its agents, its distributors. The message has to land in the back row as clearly as in the front, and the day has to move from one speaker to the next without a gap.',
           'For RMA, under the banner “Ensemble, construisons l’avenir”, we built a circular centre stage with a runway to a curved LED wall, and dinner tables all around it, so that the speakers were close to everyone. For LEO’s regional distributor conference, delegates sat in classroom layout facing a triple LED screen. The room follows the message, not the other way round.',
           'Stage, screens, screen content, sound, light, filming and the dinner that ends the day: all of it is designed together and run from our own control desk.'],
      fr: ['Une convention, c’est le jour où une entreprise parle à tous les siens à la fois : sa force de vente, ses agents, ses distributeurs. Le message doit porter au dernier rang aussi clairement qu’au premier, et la journée doit passer d’un intervenant à l’autre sans un blanc.',
           'Pour RMA, sous la bannière « Ensemble, construisons l’avenir », nous avons construit une scène circulaire au centre de la salle, reliée par une passerelle à un mur LED incurvé, avec les tables du dîner tout autour : les intervenants étaient proches de chacun. Pour la conférence régionale des distributeurs de LEO, les délégués étaient installés en salle de classe face à un triple écran LED. La salle suit le message, et non l’inverse.',
           'Scène, écrans, contenus, son, lumière, captation et dîner de clôture : tout est conçu ensemble et opéré depuis notre propre régie.']
    },
    does: {
      en: ['Concept and running order of the day', 'Stage design: centre stage, runway, LED walls', 'Content for the screens and speaker support', 'Sound, light and video control', 'Filming, live direction and broadcast', 'The dinner and the evening programme'],
      fr: ['Concept et déroulé de la journée', 'Scénographie : scène centrale, passerelle, murs LED', 'Contenus des écrans et accompagnement des intervenants', 'Régie son, lumière et vidéo', 'Captation, réalisation en direct et diffusion', 'Le dîner et le programme de la soirée']
    },
    steps: {
      en: { title: 'How we stage a convention', intro: 'The message first, then the room around it.', points: [
        ['The message', 'What the audience must leave with, and who says it, in what order.'],
        ['The room', 'Stage, screens and seating drawn so that everyone sees and hears.'],
        ['The rehearsal', 'Every speaker on stage before the day, with their slides and their microphone.'],
        ['The day', 'One control desk for sound, light and video, and one producer beside you.']] },
      fr: { title: 'Comment nous mettons en scène une convention', intro: 'Le message d’abord, puis la salle autour de lui.', points: [
        ['Le message', 'Ce que le public doit retenir, qui le dit et dans quel ordre.'],
        ['La salle', 'Scène, écrans et placement dessinés pour que chacun voie et entende.'],
        ['La répétition', 'Chaque intervenant sur scène avant le jour J, avec ses slides et son micro.'],
        ['Le jour J', 'Une régie pour le son, la lumière et la vidéo, et un chef de projet à vos côtés.']] }
    },
    ideas: [
      { project: 'rma-convention',
        title: { en: 'A stage in the middle of the room', fr: 'Une scène au centre de la salle' },
        text: { en: 'The audience all around, a runway to the LED wall, dinner tables close to the speakers.', fr: 'Le public tout autour, une passerelle vers le mur LED, les tables du dîner au plus près des intervenants.' } },
      { project: 'leo-regional-conference',
        title: { en: 'A network from two continents', fr: 'Un réseau venu de deux continents' },
        text: { en: 'Distributors from the Middle East and Africa, facing a triple LED screen.', fr: 'Des distributeurs du Moyen-Orient et d’Afrique, face à un triple écran LED.' } },
      { project: 'onco-days',
        title: { en: 'Sessions, then dinner', fr: 'Des sessions, puis le dîner' },
        text: { en: 'A full-width LED stage and dressed round tables for the evening.', fr: 'Une scène LED sur toute la largeur et des tables rondes habillées pour la soirée.' } },
      { project: 'wexchange-forum',
        title: { en: 'Panels filmed live', fr: 'Des panels filmés en direct' },
        text: { en: 'Discussions on stage, captured and directed from our control desk.', fr: 'Des échanges sur scène, captés et réalisés depuis notre régie.' } }
    ],
    faq: {
      en: [
        ['Can the convention be filmed and broadcast?', 'Yes. Multi-camera filming and live direction are handled by our own team, from our control desk, for the room as well as for the broadcast.'],
        ['Can the speakers rehearse on stage?', 'Yes. We plan a rehearsal with each speaker, their slides and their microphone, before the guests arrive.'],
        ['Can the dinner take place in the same room?', 'Yes. At RMA’s convention the dinner tables were set all around the stage, and for MTA we turned the plenary room into a gala dinner for the evening.'],
        ['When do we know the budget?', 'Before anything is booked. The concept, the stage design and a clear budget are presented to you together.']
      ],
      fr: [
        ['La convention peut-elle être filmée et retransmise ?', 'Oui. La captation multicaméra et la réalisation en direct sont assurées par notre propre équipe, depuis notre régie, pour la salle comme pour la diffusion.'],
        ['Les intervenants peuvent-ils répéter sur scène ?', 'Oui. Nous prévoyons une répétition avec chaque intervenant, ses slides et son micro, avant l’arrivée des invités.'],
        ['Le dîner peut-il avoir lieu dans la même salle ?', 'Oui. À la convention RMA, les tables du dîner étaient dressées tout autour de la scène, et pour MTA nous avons transformé la salle de plénière en dîner de gala pour la soirée.'],
        ['À quel moment connaît-on le budget ?', 'Avant toute réservation. Le concept, la scénographie et un budget clair vous sont présentés ensemble.']
      ]
    }
  },
  {
    id: 'gala',
    service: 'ceremonies',
    slug: { en: 'gala-dinner-morocco', fr: 'soiree-de-gala-maroc' },
    name: { en: 'Gala evening', fr: 'Soirée de gala' },
    title: { en: ['Gala evenings', 'in Morocco'], fr: ['Soirées de gala', 'au Maroc'] },
    lede: {
      en: 'Dressed tables, a stage, light that changes with the evening: a gala dinner designed as a show, from the welcome to the last song.',
      fr: 'Des tables habillées, une scène, une lumière qui suit la soirée : un dîner de gala pensé comme un spectacle, de l’accueil à la dernière chanson.'
    },
    seo: {
      title: { en: 'Gala Dinner and Gala Evening Organisation in Morocco | benevents agency', fr: 'Organisation de soirée de gala au Maroc | benevents agency' },
      desc: {
        en: 'Gala dinners and evenings in Casablanca, Marrakech, Rabat or Tangier: scenography, LED walls, table dressing, lighting, sound and the running order of the night.',
        fr: 'Soirée de gala à Casablanca, Marrakech, Rabat ou Tanger : scénographie, murs LED, habillage des tables, lumière, son et déroulé de la soirée.'
      }
    },
    image: ['assets/img/wall/gala-tables-led-art.jpg', 1280, 1280],
    text: {
      en: ['A gala evening is remembered for its atmosphere: the moment guests walk in, the light on the tables, the stage when the speeches start, the music when they end. We design it as a sequence, scene by scene, and we run every change of light and sound from our control desk.',
           'At MTA’s cycle meeting in Tangier, dinner was served in front of a wall of LED artwork, in the room that had hosted the plenary sessions that same day. For RMA, the dinner tables were set all around a circular stage. In Marrakech, a cocktail evening took place under a canopy of golden lanterns, with a live DJ set and warm amber light.',
           'We take care of the stage, the screens, the lighting, the sound, the table dressing and the running order of the night, and we coordinate the venue and its suppliers so that the evening runs without a pause.'],
      fr: ['Une soirée de gala se retient pour son atmosphère : l’arrivée des invités, la lumière sur les tables, la scène quand commencent les discours, la musique quand ils s’achèvent. Nous la concevons comme une suite de tableaux, et nous menons chaque changement de lumière et de son depuis notre régie.',
           'Au cycle meeting de MTA à Tanger, le dîner était servi devant un mur d’œuvres LED, dans la salle qui avait accueilli les plénières le jour même. Pour RMA, les tables du dîner étaient dressées tout autour d’une scène circulaire. À Marrakech, une soirée cocktail s’est tenue sous un ciel de lanternes dorées, avec un DJ set en live et une lumière ambrée.',
           'Nous prenons en charge la scène, les écrans, la lumière, le son, l’habillage des tables et le déroulé de la soirée, et nous coordonnons le lieu et ses prestataires pour que la soirée s’enchaîne sans temps mort.']
    },
    does: {
      en: ['Concept and running order of the evening', 'Stage, LED walls and screen content', 'Lighting design: tables, stage, room', 'Sound for the speeches and the music', 'Table dressing and room layout', 'Artists and live entertainment, coordinated'],
      fr: ['Concept et déroulé de la soirée', 'Scène, murs LED et contenus des écrans', 'Création lumière : tables, scène, salle', 'Son pour les discours et la musique', 'Habillage des tables et plan de salle', 'Artistes et animations, coordonnés']
    },
    steps: {
      en: { title: 'An evening in four scenes', intro: 'Each scene has its light, its sound and its moment in the running order.', points: [
        ['The welcome', 'The entrance, the first drink, the light that tells guests the evening has started.'],
        ['The dinner', 'Dressed tables, soft light and music low enough to talk.'],
        ['The stage', 'Speeches, awards or a show, with the light and the screens behind them.'],
        ['The party', 'The tables cleared, the music up, the light changed for the end of the night.']] },
      fr: { title: 'Une soirée en quatre tableaux', intro: 'Chaque tableau a sa lumière, son son et sa place dans le déroulé.', points: [
        ['L’accueil', 'L’entrée, le premier verre, la lumière qui dit aux invités que la soirée commence.'],
        ['Le dîner', 'Des tables habillées, une lumière douce et une musique assez basse pour se parler.'],
        ['La scène', 'Discours, remises de prix ou spectacle, avec la lumière et les écrans derrière.'],
        ['La fête', 'Les tables libérées, la musique plus forte, la lumière changée pour la fin de soirée.']] }
    },
    ideas: [
      { project: 'mta-cycle-meeting',
        title: { en: 'Dinner in front of LED artwork', fr: 'Un dîner devant des œuvres LED' },
        text: { en: 'The plenary room of the day, turned into a gala dinner for the night.', fr: 'La salle de plénière du jour, transformée en dîner de gala pour la nuit.' } },
      { project: 'rma-convention',
        title: { en: 'Tables around the stage', fr: 'Des tables autour de la scène' },
        text: { en: 'A circular centre stage, with every table close to the show.', fr: 'Une scène circulaire au centre, chaque table au plus près du spectacle.' } },
      { project: 'marrakech-cocktail',
        title: { en: 'Under golden lanterns', fr: 'Sous les lanternes dorées' },
        text: { en: 'A cocktail evening in Marrakech, a live DJ set and amber light.', fr: 'Une soirée cocktail à Marrakech, un DJ set en live et une lumière ambrée.' } },
      { project: 'onco-days',
        title: { en: 'Round tables, dressed for the evening', fr: 'Des tables rondes habillées pour la soirée' },
        text: { en: 'Chair covers, dressed tables and a full-width LED stage.', fr: 'Housses de chaises, tables habillées et scène LED sur toute la largeur.' } }
    ],
    faq: {
      en: [
        ['Can the gala dinner follow a day of sessions in the same room?', 'Yes. For MTA in Tangier, we turned the plenary room into a gala dinner in front of a wall of LED artwork.'],
        ['Do you organise evenings outdoors, in a garden or a riad?', 'Yes. An outdoor setting needs its own power supply, respect for sound limits and a plan B for wind or rain: we plan all three from the start.'],
        ['Who runs the evening on the night?', 'Our team, from our control desk: sound, light and screens follow the running order, scene by scene, with your producer beside you.'],
        ['When do we know the budget?', 'Before anything is booked. The concept, the mood boards and a clear budget are presented to you together.']
      ],
      fr: [
        ['Le dîner de gala peut-il suivre une journée de sessions dans la même salle ?', 'Oui. Pour MTA à Tanger, nous avons transformé la salle de plénière en dîner de gala devant un mur d’œuvres LED.'],
        ['Organisez-vous des soirées en extérieur, dans un jardin ou un riad ?', 'Oui. Un lieu en plein air demande sa propre alimentation électrique, le respect des limites sonores et un plan B en cas de vent ou de pluie : nous prévoyons les trois dès le départ.'],
        ['Qui mène la soirée le soir même ?', 'Notre équipe, depuis notre régie : le son, la lumière et les écrans suivent le déroulé, tableau après tableau, avec votre chef de projet à vos côtés.'],
        ['À quel moment connaît-on le budget ?', 'Avant toute réservation. Le concept, les planches d’ambiance et un budget clair vous sont présentés ensemble.']
      ]
    }
  },
  {
    id: 'launch',
    service: 'receptions',
    slug: { en: 'product-launch-morocco', fr: 'lancement-de-produit-maroc' },
    name: { en: 'Product launch', fr: 'Lancement de produit' },
    title: { en: ['Product launches', 'and brand events'], fr: ['Lancements de produit', 'et événements de marque'] },
    lede: {
      en: 'A product on a lit stage, a set in your colours, guests who leave with one image in mind: launches and brand evenings designed around what you present.',
      fr: 'Un produit sur une scène éclairée, un décor à vos couleurs, des invités qui repartent avec une image en tête : des lancements et soirées de marque conçus autour de ce que vous présentez.'
    },
    seo: {
      title: { en: 'Product Launch Organisation in Morocco | benevents agency', fr: 'Organisation de lancement de produit au Maroc | benevents agency' },
      desc: {
        en: 'Product launches and brand evenings in Morocco: a reveal on a lit stage, a set in your colours, LED screens, lighting and sound, for your clients, partners and the press.',
        fr: 'Lancements de produit et soirées de marque au Maroc : le produit sur une scène éclairée, un décor à vos couleurs, écrans LED, lumière et son.'
      }
    },
    image: ['assets/img/volvo-built-on-trust.jpg', 960, 1280],
    text: {
      en: ['A launch has one job: to make a product, or a brand, the centre of attention for an evening. We start from what you present and from the people you invite, clients, partners, the press, and we build the place around it: where the product stands, how it is lit, what guests see when they walk in.',
           'For Volvo’s 70th anniversary, “Built on Trust. Driving Morocco Forward.”, an industrial hall was dressed with an LED screen and cocktail tables made of oil drums in the brand’s colours. For CUPRA, the Formentor stood on a black stage with a green glow, with totems in the brand’s colours inside the showroom and out on the street.',
           'Stage, screens, set, lighting, sound and the running order of the presentation are designed together and run by our own team.'],
      fr: ['Un lancement n’a qu’une mission : faire d’un produit, ou d’une marque, le centre de l’attention le temps d’une soirée. Nous partons de ce que vous présentez et des personnes que vous invitez, clients, partenaires, presse, et nous construisons le lieu autour : où se tient le produit, comment il est éclairé, ce que voient les invités en entrant.',
           'Pour les 70 ans de Volvo, « Built on Trust. Driving Morocco Forward. », une halle industrielle a été habillée d’un écran LED et de mange-debout en fûts aux couleurs de la marque. Pour CUPRA, le Formentor trônait sur un podium noir éclairé de vert, avec des totems aux couleurs de la marque dans le showroom et sur le trottoir.',
           'Scène, écrans, décor, lumière, son et déroulé de la présentation sont conçus ensemble et opérés par notre propre équipe.']
    },
    does: {
      en: ['Concept of the evening and of the reveal', 'Set and stage in your colours', 'Lighting of the product and of the room', 'LED screens and content', 'Sound, speeches and music', 'Welcome of guests and the press'],
      fr: ['Concept de la soirée et de la présentation', 'Décor et scène à vos couleurs', 'Mise en lumière du produit et de la salle', 'Écrans LED et contenus', 'Son, prises de parole et musique', 'Accueil des invités et de la presse']
    },
    steps: {
      en: { title: 'What makes a launch work', intro: 'Four questions we answer before drawing anything.', points: [
        ['What is shown', 'The product, the brand, or both: the centre of the room and of the evening.'],
        ['Who is invited', 'Clients, partners, dealers, the press: each expects something different.'],
        ['The reveal', 'The moment the product appears: light, sound and screens timed together.'],
        ['What remains', 'Photos, a film, an image that guests share: planned from the start.']] },
      fr: { title: 'Ce qui fait un lancement réussi', intro: 'Quatre questions auxquelles nous répondons avant de dessiner quoi que ce soit.', points: [
        ['Ce qui est montré', 'Le produit, la marque, ou les deux : le centre de la salle et de la soirée.'],
        ['Qui est invité', 'Clients, partenaires, concessionnaires, presse : chacun attend quelque chose de différent.'],
        ['La révélation', 'Le moment où le produit apparaît : lumière, son et écrans synchronisés.'],
        ['Ce qui reste', 'Des photos, un film, une image que les invités partagent : prévus dès le départ.']] }
    },
    ideas: [
      { project: 'volvo-built-on-trust',
        title: { en: 'A brand anniversary in an industrial hall', fr: 'Un anniversaire de marque dans une halle industrielle' },
        text: { en: 'An LED screen, a lectern in the colours of the anniversary and oil-drum cocktail tables.', fr: 'Un écran LED, un pupitre aux couleurs de l’anniversaire et des mange-debout en fûts.' } },
      { project: 'cupra-open-day',
        title: { en: 'The car on a lit stage', fr: 'Le véhicule sur un podium lumineux' },
        text: { en: 'The Formentor on a black stage with a green glow, totems in the brand’s colours.', fr: 'Le Formentor sur un podium noir éclairé de vert, des totems aux couleurs de la marque.' } },
      { project: 'gillette-watch-party',
        title: { en: 'A brand around a big match', fr: 'Une marque autour d’un grand match' },
        text: { en: 'A giant screen, bean bags, a tombola and the broadcast run live.', fr: 'Un écran géant, des poufs, une tombola et la diffusion en direct.' } },
      { project: 'centrale-automobile-cherifienne',
        title: { en: 'A presentation in the showroom', fr: 'Une présentation dans le showroom' },
        text: { en: 'An LED screen, high tables and light accents among the cars.', fr: 'Un écran LED, des mange-debout et des touches de lumière entre les véhicules.' } }
    ],
    faq: {
      en: [
        ['Can you organise a launch in our showroom?', 'Yes. We have dressed showrooms for CUPRA and for the Centrale Automobile Chérifienne: stage or podium, screens, lighting and high tables.'],
        ['Can the set be in our brand colours?', 'Yes. Stage, totems, lighting and screen content are designed in your colours, as for Volvo and CUPRA.'],
        ['Can you film the launch?', 'Yes. Filming and live direction are handled by our own team, from our control desk.'],
        ['When do we know the budget?', 'Before anything is booked. The concept, the set and a clear budget are presented to you together.']
      ],
      fr: [
        ['Pouvez-vous organiser un lancement dans notre showroom ?', 'Oui. Nous avons habillé des showrooms pour CUPRA et pour la Centrale Automobile Chérifienne : scène ou podium, écrans, lumière et mange-debout.'],
        ['Le décor peut-il être à nos couleurs ?', 'Oui. Scène, totems, lumière et contenus des écrans sont conçus à vos couleurs, comme pour Volvo et CUPRA.'],
        ['Pouvez-vous filmer le lancement ?', 'Oui. La captation et la réalisation en direct sont assurées par notre propre équipe, depuis notre régie.'],
        ['À quel moment connaît-on le budget ?', 'Avant toute réservation. Le concept, le décor et un budget clair vous sont présentés ensemble.']
      ]
    }
  },
  {
    id: 'openday',
    service: 'receptions',
    slug: { en: 'open-day-showroom-morocco', fr: 'journee-portes-ouvertes-maroc' },
    name: { en: 'Open day', fr: 'Journée portes ouvertes' },
    title: { en: ['Open days', 'in showrooms and dealerships'], fr: ['Journées portes ouvertes', 'en showroom et concession'] },
    lede: {
      en: 'A showroom dressed from morning to evening: the product on a lit stage, a welcome bar, a DJ and a game, then a different light after dark.',
      fr: 'Un showroom habillé du matin au soir : le produit sur un podium lumineux, un bar d’accueil, un DJ et un jeu, puis une autre lumière à la nuit tombée.'
    },
    seo: {
      title: { en: 'Open Day Organisation for Showrooms in Morocco | benevents agency', fr: 'Organisation de journée portes ouvertes au Maroc | benevents agency' },
      desc: {
        en: 'Open days in showrooms and dealerships in Morocco: the product on a lit stage, totems in your colours, a welcome bar, DJ, games for visitors and lighting for the evening.',
        fr: 'Journée portes ouvertes en showroom au Maroc : le produit sur un podium lumineux, totems à vos couleurs, bar d’accueil, DJ, jeux et lumière du soir.'
      }
    },
    image: ['assets/img/projects/cupra-open-day/01.webp', 900, 1600],
    text: {
      en: ['An open day brings people who were passing by into your showroom, and gives those you invited a reason to stay. It runs for a whole day, so it needs a rhythm: a welcome that catches the eye from the street, something to do once inside, and an evening that feels different from the morning.',
           'For CUPRA, we dressed the showroom from morning to evening. The Formentor stood on a black stage with a green glow, totems in the brand’s colours stood inside and out on the street, and a DJ booth with a backlit logo played through the day. A welcome bar and dressed high tables received the visitors, a “Precision Challenge” game kept them around, and after dark the showroom turned green and blue.',
           'We take care of the set, the stage, the lighting, the sound, the DJ set-up and the games.'],
      fr: ['Une journée portes ouvertes fait entrer dans votre showroom ceux qui passaient devant, et donne à ceux que vous avez invités une raison de rester. Elle dure toute une journée : il lui faut un rythme, un accueil qui attire le regard depuis la rue, de quoi faire une fois à l’intérieur, et une soirée qui ne ressemble pas au matin.',
           'Pour CUPRA, nous avons habillé le showroom du matin jusqu’au soir. Le Formentor trônait sur un podium noir éclairé de vert, des totems aux couleurs de la marque se dressaient à l’intérieur et sur le trottoir, et une cabine DJ au logo rétroéclairé a joué toute la journée. Un bar d’accueil et des mange-debout habillés recevaient les visiteurs, un jeu d’adresse « Precision Challenge » les retenait, et à la nuit tombée le showroom passait au vert et au bleu.',
           'Nous prenons en charge le décor, le podium, la lumière, le son, la cabine DJ et les jeux.']
    },
    does: {
      en: ['The product on a lit stage or podium', 'Totems and signage, inside and on the street', 'DJ booth, sound and moving lights', 'Welcome bar and dressed high tables', 'Games and activities for visitors', 'Evening lighting of the showroom'],
      fr: ['Le produit sur une scène ou un podium lumineux', 'Totems et signalétique, dedans et sur le trottoir', 'Cabine DJ, son et projecteurs asservis', 'Bar d’accueil et mange-debout habillés', 'Jeux et animations pour les visiteurs', 'Mise en lumière du showroom pour la soirée']
    },
    steps: {
      en: { title: 'An open day, hour by hour', intro: 'The same showroom, three moments.', points: [
        ['Morning', 'The street side dressed, the product lit, the welcome bar open for the first visitors.'],
        ['Afternoon', 'The DJ, the game and the sales team at work among the visitors.'],
        ['Evening', 'The light changes, the music rises, invited guests arrive for the last part of the day.']] },
      fr: { title: 'Une journée portes ouvertes, heure par heure', intro: 'Le même showroom, trois moments.', points: [
        ['Le matin', 'La façade habillée, le produit éclairé, le bar d’accueil ouvert pour les premiers visiteurs.'],
        ['L’après-midi', 'Le DJ, le jeu et l’équipe commerciale au travail parmi les visiteurs.'],
        ['Le soir', 'La lumière change, la musique monte, les invités arrivent pour la dernière partie de la journée.']] }
    },
    ideas: [
      { project: 'cupra-open-day',
        title: { en: 'From morning to evening', fr: 'Du matin jusqu’au soir' },
        text: { en: 'The Formentor on a lit stage, a DJ, a welcome bar, a game, and green and blue light after dark.', fr: 'Le Formentor sur un podium lumineux, un DJ, un bar d’accueil, un jeu, puis une lumière verte et bleue à la nuit tombée.' } },
      { project: 'centrale-automobile-cherifienne',
        title: { en: 'A reception among the cars', fr: 'Une réception entre les véhicules' },
        text: { en: 'An LED screen for the presentation, high tables and café seating in the showroom.', fr: 'Un écran LED pour la présentation, des mange-debout et des assises café dans le showroom.' } }
    ],
    faq: {
      en: [
        ['Do you organise open days in showrooms and dealerships?', 'Yes. For CUPRA, we dressed the showroom from morning to evening: the car on a lit stage, totems in the brand’s colours, a welcome bar, a DJ, the lighting of the evening and a game for the visitors.'],
        ['Can you plan something for visitors to do?', 'Yes. For CUPRA, a “Precision Challenge” game kept visitors around the stand, next to the DJ booth and the welcome bar.'],
        ['Can you dress the street side too?', 'Yes. For CUPRA, totems in the brand’s colours stood inside the showroom and out on the street.'],
        ['When do we know the budget?', 'Before anything is booked. The concept and a clear budget are presented to you together.']
      ],
      fr: [
        ['Organisez-vous des journées portes ouvertes en showroom ou en concession ?', 'Oui. Pour CUPRA, nous avons habillé le showroom du matin jusqu’au soir : le véhicule sur un podium lumineux, des totems aux couleurs de la marque, un bar d’accueil, un DJ, la lumière du soir et un jeu pour les visiteurs.'],
        ['Pouvez-vous prévoir une animation pour les visiteurs ?', 'Oui. Pour CUPRA, un jeu d’adresse « Precision Challenge » retenait les visiteurs, à côté de la cabine DJ et du bar d’accueil.'],
        ['Pouvez-vous habiller aussi la façade ?', 'Oui. Pour CUPRA, des totems aux couleurs de la marque étaient installés dans le showroom et sur le trottoir.'],
        ['À quel moment connaît-on le budget ?', 'Avant toute réservation. Le concept et un budget clair vous sont présentés ensemble.']
      ]
    }
  }
];

// the words of these pages and of the page that lists them
export const EVENT_WORDS = {
  en: {
    folder: '/events/', index: '/events', name: 'Events we produce', eyebrow: 'Events', how: 'How we run it',
    title: ['Events we produce', 'in Morocco'],
    lede: 'Seminars, conventions, gala evenings, launches and open days: each kind of event has its own page, with the projects that show how we run it.',
    seo: ['Corporate Events We Organise in Morocco | benevents agency', 'Seminars, conventions, gala evenings, product launches and open days in Morocco, designed and produced by benevents agency, with the projects that show them.'],
    others: 'Other events we produce', card: 'See how we run it', service: 'The service:', ofKind: 'Events of this kind', cover: n => `${n}: an event produced by benevents agency`
  },
  fr: {
    folder: '/fr/evenements/', index: '/fr/evenements', name: 'Les événements que nous produisons', eyebrow: 'Événements', how: 'Comment nous le menons',
    title: ['Les événements', 'que nous produisons'],
    lede: 'Séminaires, conventions, soirées de gala, lancements et journées portes ouvertes : chaque type d’événement a sa page, avec les réalisations qui montrent comment nous le menons.',
    seo: ['Événements d’entreprise organisés au Maroc | benevents agency', 'Séminaires, conventions, soirées de gala, lancements de produit et journées portes ouvertes au Maroc, conçus et produits par benevents agency, avec nos réalisations.'],
    others: 'Les autres événements que nous produisons', card: 'Voir comment nous le menons', service: 'Le savoir-faire :', ofKind: 'Les événements de ce type', cover: n => `${n} : un événement produit par benevents agency`
  }
};
