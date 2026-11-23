/* benevents agency — what each service page says.
   One entry per card of "What we create", in the same order. The title, the introduction and the
   photo of a service come from its card; this file adds what opens when the card is clicked.

   id    : short name used in the page address (#service/<id>), lowercase with dashes
   slug  : the end of the address of the service's own page (services/<slug>, fr/services/<slug>)
   image : the photo of the service: ['path', width, height]
   seo   : the title and the description search engines show for that page
   text  : two paragraphs for that page, in both languages
   does  : what the agency takes care of, a few short lines
   more  : one more part of the page, optional: { en: { title, intro, points: [['name', 'sentence'], …] }, fr: { … } }
   faq   : questions and answers shown at the foot of the page, optional: { en: [['question', 'answer'], …], fr: [ … ] }
           Only what is true today: an answer is a promise.
   ideas : ideas for the client, each one seen in a project of the portfolio
           title, text : in both languages
           project     : the id of that project in projects.js; the idea then shows its photo and opens it 

   The pages of the services are written from this file by tools/site/build.mjs: run it after a change. */
(function () {
  'use strict';

  window.BEN_SERVICES = [
    {
      id: 'conferences',
      slug: { en: 'conferences-conventions', fr: 'conferences-conventions' },
      image: ['assets/img/conference-opening.jpg', 2000, 1330],
      seo: {
        title: { en: 'Conference and Convention Organisation in Morocco | benevents agency', fr: 'Organisation de conférences et conventions au Maroc | benevents agency' },
        desc: { en: 'Forums, annual conventions, panels and seminars in Morocco: benevents handles the format, stage, welcome, control desk and filming of your event.',
                fr: 'Forums, conventions annuelles, panels et séminaires au Maroc : benevents agency conçoit le format, la scène, l’accueil, la régie et la captation de votre événement.' }
      },
      text: {
        en: ['A successful convention comes down to a few things, all at once: a clear message, a room where everyone can see and hear, and a running order with no dead time. We take care of the whole, from the format of the day to the last speaker, so that your teams can stay focused on the content.',
             'Stage, LED screen, room dressing, welcome of guests and speakers, sound, light and video control: everything is designed and run by one team. We work all over Morocco, from Casablanca to Rabat, Tangier and Marrakech, for companies, institutions and foundations.'],
        fr: ['Une convention réussie tient à peu de choses, et à toutes à la fois : un message clair, une salle où chacun voit et entend, un déroulé sans temps mort. Nous prenons l’ensemble en charge, du format de la journée à la dernière prise de parole, pour que vos équipes restent concentrées sur le contenu.',
             'Scène, écran LED, habillage de la salle, accueil des participants et des intervenants, régie son, lumière et vidéo : tout est conçu et opéré par une seule équipe. Nous intervenons partout au Maroc, de Casablanca à Rabat, Tanger et Marrakech, pour des entreprises, des institutions et des fondations.']
      },
      does: {
        en: ['Format and running order', 'Stage, LED screen and room dressing', 'Welcome of guests and speakers', 'Sound, light and video control', 'Filming and live direction'],
        fr: ['Format et déroulé de la journée', 'Scène, écran LED et habillage de la salle', 'Accueil des participants et des intervenants', 'Régie son, lumière et vidéo', 'Captation et réalisation en direct']
      },
      faq: {
        en: [
          ['Do you organise conventions outside Casablanca?', 'Yes. We work in Casablanca, Rabat and Marrakech, and wherever in Morocco your event takes place. We have, for example, produced a seminar in Tangier.'],
          ['Can you film the conference and broadcast it?', 'Yes. Multi-camera filming and live direction are handled by our own team, from our control desk, for the room as well as for the broadcast.'],
          ['Who is our contact while the event is being prepared?', 'One dedicated producer, from the first conversation to the day itself. They coordinate the venue, the suppliers, the technical side and the schedule.'],
          ['When do we know the budget?', 'Before anything is booked. The concept, the mood boards and a clear budget are presented to you together.']
        ],
        fr: [
          ['Organisez-vous des conventions en dehors de Casablanca ?', 'Oui. Nous travaillons à Casablanca, Rabat et Marrakech, et partout au Maroc où votre événement a lieu. Nous avons par exemple produit un séminaire à Tanger.'],
          ['Pouvez-vous filmer la conférence et la retransmettre ?', 'Oui. La captation multicaméra et la réalisation en direct sont assurées par notre propre équipe, depuis notre régie, pour la salle comme pour la diffusion.'],
          ['Qui est notre interlocuteur pendant la préparation ?', 'Un chef de projet dédié, de la première conversation au jour J. Il coordonne le lieu, les prestataires, la technique et le planning.'],
          ['À quel moment connaît-on le budget ?', 'Avant toute réservation. Le concept, les planches d’ambiance et un budget clair vous sont présentés ensemble.']
        ]
      },
      ideas: [
        { project: 'rma-convention',
          title: { en: 'A stage in the middle of the room', fr: 'Une scène au centre de la salle' },
          text: { en: 'The audience all around, a walkway to the LED wall, and speakers close to everyone.', fr: 'Le public tout autour, une passerelle jusqu’au mur LED, et des intervenants proches de chacun.' } },
        { project: 'wexchange-forum',
          title: { en: 'Round tables, filmed live', fr: 'Des tables rondes filmées en direct' },
          text: { en: 'Panels on stage, captured and directed from our own control desk.', fr: 'Des échanges sur scène, captés et réalisés depuis notre régie.' } },
        { project: 'gsk-day',
          title: { en: 'A room in your colours', fr: 'Une salle à vos couleurs' },
          text: { en: 'The plenary dressed in the brand, from the LED stage to the chair covers.', fr: 'Une plénière habillée aux couleurs de la marque, de la scène LED aux housses de chaises.' } },
        { project: 'mta-cycle-meeting',
          title: { en: 'Work by day, gala by night', fr: 'Travail le jour, gala le soir' },
          text: { en: 'Plenary sessions on stage, then dinner in front of an LED wall of artistic visuals.', fr: 'Des plénières sur scène, puis un dîner devant un mur LED aux visuels artistiques.' } }
      ]
    },
    {
      id: 'ceremonies',
      slug: { en: 'ceremonies-gala-evenings', fr: 'ceremonies-soirees-de-gala' },
      image: ['assets/img/graduation-ceremony.jpg', 2000, 1330],
      seo: {
        title: { en: 'Ceremony and Gala Evening Organisation in Morocco | benevents agency', fr: 'Organisation de cérémonies et soirées de gala au Maroc | benevents agency' },
        desc: { en: 'Award and graduation ceremonies, gala dinners and anniversary evenings in Morocco: benevents stages your ceremony, from storyline to show control on the day.',
                fr: 'Remises de prix et de diplômes, dîners de gala et soirées anniversaires au Maroc : benevents met en scène votre cérémonie, du fil conducteur à la régie du jour J.' }
      },
      text: {
        en: ['A ceremony happens only once. Awards, graduation, gala dinner or anniversary evening: we write the storyline, set every entrance on stage and hold show control, so that the emotion arrives at the right moment.',
             'Décor, lighting, seating plan, host, artists and entertainment come together under one show direction. On the day, our team coordinates every sequence, from the welcome of the guests to the last toast.'],
        fr: ['Une cérémonie ne se joue qu’une fois. Remise de prix, remise de diplômes, dîner de gala ou soirée anniversaire : nous écrivons le fil conducteur, réglons chaque entrée en scène et tenons la régie, pour que l’émotion arrive au bon moment.',
             'Décor, lumière, plan de salle, maître de cérémonie, artistes et animations sont réunis sous une même direction de spectacle. Le jour J, notre équipe coordonne chaque séquence, de l’accueil des invités au dernier toast.']
      },
      does: {
        en: ['Storyline and running order', 'Staging of awards and diplomas', 'Décor, lighting and seating plan', 'Host, artists and entertainment', 'Show control and coordination on the day'],
        fr: ['Fil conducteur et déroulé de la soirée', 'Mise en scène des remises de prix et de diplômes', 'Décor, lumière et plan de salle', 'Maître de cérémonie, artistes et animations', 'Régie et coordination le jour J']
      },
      faq: {
        en: [
          ['Do you write the running order of the ceremony?', 'Yes. We write the storyline, set every entrance on stage and hold show control on the day, so that each sequence arrives at the right moment.'],
          ['Do you take care of the host and the artists?', 'Yes. Host, artists and entertainment come together under one show direction.'],
          ['Can one room hold the plenary and then the gala dinner?', 'Yes. We did it in Tangier: plenary sessions on stage by day, then the gala dinner in the same room in the evening, in front of a wall of LED artwork.'],
          ['Do you also work for institutions and foundations?', 'Yes. Companies, institutions and foundations trust us with their ceremonies: graduations, closing ceremonies, awards.']
        ],
        fr: [
          ['Écrivez-vous le déroulé de la cérémonie ?', 'Oui. Nous écrivons le fil conducteur, réglons chaque entrée en scène et tenons la régie le jour J, pour que chaque séquence arrive au bon moment.'],
          ['Vous chargez-vous de l’animation et des artistes ?', 'Oui. Maître de cérémonie, artistes et animations sont réunis sous une même direction de spectacle.'],
          ['Une même salle peut-elle accueillir la plénière puis le dîner de gala ?', 'Oui. Nous l’avons fait à Tanger : plénières sur scène en journée, puis dîner de gala le soir dans la même salle, devant un mur LED aux visuels artistiques.'],
          ['Travaillez-vous aussi pour les institutions et les fondations ?', 'Oui. Entreprises, institutions et fondations nous confient leurs cérémonies : remises de diplômes, cérémonies de clôture, remises de prix.']
        ]
      },
      ideas: [
        { project: 'a-chance-to-reset',
          title: { en: 'Let the laureates speak', fr: 'La parole aux lauréats' },
          text: { en: 'Opening words, round tables and laureates’ stories before the diplomas are handed over on stage.', fr: 'Mot d’ouverture, tables rondes et témoignages avant la remise des diplômes sur scène.' } },
        { project: 'sustainable-innovation-fest',
          title: { en: 'A three-screen stage', fr: 'Une scène à trois écrans' },
          text: { en: 'A competition final and its closing ceremony, directed live.', fr: 'Une finale de compétition et sa cérémonie de clôture, réalisées en direct.' } },
        { project: 'mta-cycle-meeting',
          title: { en: 'Dinner in front of a living backdrop', fr: 'Un dîner devant un décor vivant' },
          text: { en: 'A gala dinner facing an LED wall of artistic visuals.', fr: 'Un dîner de gala face à un mur LED aux visuels artistiques.' } },
        { project: 'rma-convention',
          title: { en: 'Tables all around the stage', fr: 'Des tables tout autour de la scène' },
          text: { en: 'A circular central stage, with the dinner tables set around it.', fr: 'Une scène centrale circulaire, et les tables du dîner disposées tout autour.' } }
      ]
    },
    {
      id: 'receptions',
      slug: { en: 'brand-corporate-receptions', fr: 'receptions-evenements-de-marque' },
      image: ['assets/img/reception-golden-spheres.jpg', 1280, 720],
      seo: {
        title: { en: 'Product Launches and Corporate Receptions in Morocco | benevents agency', fr: 'Lancement de produit et réceptions d’entreprise au Maroc | benevents agency' },
        desc: { en: 'Product launches, inaugurations, open days and receptions in Morocco: a concept, a set in the colours of your brand and a journey for your guests.',
                fr: 'Lancements de produit, inaugurations, portes ouvertes et réceptions au Maroc : un concept, une scénographie à vos couleurs et un parcours pour vos invités.' }
      },
      text: {
        en: ['A launch, an inauguration or an open day is a brand receiving guests at home. We start from your world to imagine a concept, a set in your colours and a journey that takes each guest from the welcome to the last conversation.',
             'Industrial hall, showroom, reception room or fan zone: we fit the place to the event, with the furniture, the lighting, the screens, the DJ and the entertainment that give it its atmosphere.'],
        fr: ['Un lancement, une inauguration ou une journée portes ouvertes, c’est une marque qui reçoit chez elle. Nous partons de votre univers pour imaginer un concept, une scénographie à vos couleurs et un parcours qui mène chaque invité de l’accueil au dernier échange.',
             'Halle industrielle, showroom, salle de réception ou fan zone : nous adaptons le lieu à l’événement, avec le mobilier, la lumière, les écrans, le DJ et les animations qui lui donnent son ambiance.']
      },
      does: {
        en: ['Concept and theme of the evening', 'Set design in the brand’s colours', 'The guests’ journey, from welcome to goodbye', 'DJ, entertainment and games', 'Furniture, lighting and screens'],
        fr: ['Concept et thème de la soirée', 'Scénographie aux couleurs de la marque', 'Parcours des invités, de l’accueil au départ', 'DJ, animations et jeux', 'Mobilier, lumière et écrans']
      },
      faq: {
        en: [
          ['Do you organise open days in showrooms and dealerships?', 'Yes. For CUPRA, we dressed the showroom from morning to evening: the car on a lit stage, totems in the brand’s colours, a welcome bar, a DJ, the lighting of the evening and a game for the visitors.'],
          ['Can you organise a launch in our own showroom?', 'Yes. Showroom, industrial hall, reception room or fan zone: we fit the place to the event, with the furniture, the lighting, the screens and the entertainment that give it its atmosphere.'],
          ['Will the set carry our brand identity?', 'Yes. We start from your world to imagine a concept and a set in your colours, down to the furniture.'],
          ['Who takes care of the DJ and the entertainment?', 'We do. DJ, entertainment and games are part of what we take care of, like the journey of your guests from the welcome to the last conversation.']
        ],
        fr: [
          ['Organisez-vous des journées portes ouvertes en showroom ou en concession ?', 'Oui. Pour CUPRA, nous avons habillé le showroom du matin jusqu’au soir : le véhicule sur un podium lumineux, des totems aux couleurs de la marque, un bar d’accueil, un DJ, la mise en lumière de la soirée et un jeu pour les visiteurs.'],
          ['Pouvez-vous organiser un lancement dans notre showroom ?', 'Oui. Showroom, halle industrielle, salle de réception ou fan zone : nous adaptons le lieu à l’événement, avec le mobilier, la lumière, les écrans et l’animation qui lui donnent son ambiance.'],
          ['Le décor reprendra-t-il notre identité de marque ?', 'Oui. Nous partons de votre univers pour imaginer un concept et une scénographie à vos couleurs, jusqu’au mobilier.'],
          ['Qui s’occupe du DJ et de l’animation ?', 'Nous. DJ, animations et jeux font partie de ce que nous prenons en charge, comme le parcours de vos invités, de l’accueil au dernier échange.']
        ]
      },
      ideas: [
        { project: 'cupra-open-day',
          title: { en: 'An open day in the showroom', fr: 'Une journée portes ouvertes en showroom' },
          text: { en: 'The car on a lit stage, a DJ, a welcome bar and a game for visitors, from morning to evening.', fr: 'Le véhicule sur un podium lumineux, un DJ, un bar d’accueil et un jeu pour les visiteurs, du matin au soir.' } },
        { project: 'volvo-built-on-trust',
          title: { en: 'An unexpected venue', fr: 'Un lieu inattendu' },
          text: { en: 'An industrial hall turned into a brand evening, with LED screen and high tables in its colours.', fr: 'Une halle industrielle transformée en soirée de marque, avec écran LED et mange-debout à ses couleurs.' } },
        { project: 'marrakech-cocktail',
          title: { en: 'An evening under the lanterns', fr: 'Une soirée sous les lanternes' },
          text: { en: 'A cocktail under a cloud of golden lanterns, with a live DJ set and amber light.', fr: 'Un cocktail sous une nuée de lanternes dorées, avec DJ set en direct et lumière ambrée.' } },
        { project: 'gillette-watch-party',
          title: { en: 'Match night with your brand', fr: 'Un soir de match avec votre marque' },
          text: { en: 'Giant screen, beanbags, a prize draw and a control desk for the live broadcast.', fr: 'Écran géant, poufs, tombola et régie pour la retransmission en direct.' } },
        { project: 'fanzone-can-2025',
          title: { en: 'A fan zone in your colours', fr: 'Une fan zone à vos couleurs' },
          text: { en: 'Giant LED screen, flags overhead and lounges for match days.', fr: 'Écran LED géant, drapeaux au plafond et salons pour les jours de match.' } }
      ]
    },
    {
      id: 'production',
      slug: { en: 'stage-audiovisual-production', fr: 'scene-production-audiovisuelle' },
      image: ['assets/img/production-desk.jpg', 2000, 1125],
      seo: {
        title: { en: 'Event Audiovisual Production in Morocco | benevents agency', fr: 'Production audiovisuelle événementielle au Maroc | benevents agency' },
        desc: { en: 'Stage design, LED walls, sound, lighting, multi-camera filming and show control for your events in Morocco, run by our own technical team.',
                fr: 'Scénographie, murs LED, sonorisation, éclairage, captation multicaméra et régie technique pour vos événements au Maroc, assurés par notre propre équipe.' }
      },
      text: {
        en: ['The technical side should not be seen: it should carry the message. Stage design and technical plans, LED walls and screen content, lighting and sound: we draw the set-up together with the concept, not after it.',
             'On the day, our own technical team holds the control desk: multi-camera filming and live direction, for the room as well as for the broadcast. One team, from the first sketch to the last cue.'],
        fr: ['La technique ne doit pas se voir : elle doit porter le message. Conception de la scène et plans techniques, murs LED et contenus d’écran, lumière et sonorisation : nous dessinons le dispositif avec le concept, pas après lui.',
             'Le jour J, notre propre équipe technique tient la régie : captation multicaméra et réalisation en direct, pour la salle comme pour la diffusion. Une seule équipe, de la première esquisse au dernier top.']
      },
      does: {
        en: ['Stage design and technical plans', 'LED walls and screen content', 'Lighting and sound', 'Multi-camera filming', 'Live direction from our own control desk'],
        fr: ['Conception de la scène et plans techniques', 'Murs LED et contenus d’écran', 'Lumière et sonorisation', 'Captation multicaméra', 'Réalisation en direct depuis notre régie']
      },
      more: {
        en: {
          title: 'Renting equipment, or handing over a production',
          intro: 'An LED screen, a console and speakers can be rented anywhere. What changes on the day is everything that was decided before they were switched on.',
          points: [
            ['Plans before equipment', 'Where the stage, the screens, the lighting and the sound go is drawn with the concept and the scenography, not after them.'],
            ['Content made for the screen', 'Visuals are prepared for the LED walls that show them, at the same time as the stage.'],
            ['One control desk', 'Sound, lighting and video are run together by our own team, from a single technical desk.'],
            ['A written running order', 'Every sequence is planned: who comes on, when, with which image and which light.'],
            ['Filming designed with the room', 'Cameras and live direction serve the room as well as the broadcast.']
          ]
        },
        fr: {
          title: 'Louer du matériel, ou confier une production',
          intro: 'Un écran LED, une console et des enceintes se louent partout. Ce qui change le jour J, c’est tout ce qui a été décidé avant de les allumer.',
          points: [
            ['Des plans avant le matériel', 'L’implantation de la scène, des écrans, de l’éclairage et de la sonorisation est dessinée avec le concept et la scénographie, pas après.'],
            ['Des contenus faits pour l’écran', 'Les visuels sont préparés pour les murs LED qui les diffusent, en même temps que la scène.'],
            ['Une seule régie technique', 'Sonorisation, éclairage et vidéo sont pilotés ensemble par notre propre équipe, depuis une même régie.'],
            ['Un déroulé écrit', 'Chaque séquence est prévue : qui entre, à quel moment, avec quelle image et quelle lumière.'],
            ['La captation pensée avec la salle', 'Les caméras et la réalisation en direct servent la salle comme la diffusion.']
          ]
        }
      },
      faq: {
        en: [
          ['Do you have your own technical team?', 'Yes. Sound, light and video are run by our own team, from our control desk, from the first sketch to the last cue.'],
          ['Do you prepare what is shown on the screens?', 'Yes. The LED walls and their content are designed together, at the same time as the stage.'],
          ['Can you film the event and broadcast it live?', 'Yes: multi-camera filming and live direction, for the room as well as for the broadcast.']
        ],
        fr: [
          ['Avez-vous votre propre équipe technique ?', 'Oui. Le son, la lumière et la vidéo sont pilotés par notre propre équipe, depuis notre régie, du premier croquis au dernier top.'],
          ['Préparez-vous les contenus diffusés sur les écrans ?', 'Oui. Les murs LED et leurs contenus sont pensés ensemble, en même temps que la scène.'],
          ['Pouvez-vous filmer l’événement et le diffuser en direct ?', 'Oui : captation multicaméra et réalisation en direct, pour la salle comme pour la diffusion.']
        ]
      },
      ideas: [
        { project: 'femmes-en-jeu',
          title: { en: 'A curved LED wall', fr: 'Un mur LED incurvé' },
          text: { en: 'A backdrop that wraps around keynotes and panel discussions.', fr: 'Un fond de scène qui enveloppe keynotes et tables rondes.' } },
        { project: 'tech-fest-maroc',
          title: { en: 'A room bathed in one colour', fr: 'Une salle baignée de couleur' },
          text: { en: 'Stage, LED wall and a whole room lit in the colour of the event.', fr: 'Scène, mur LED et toute une salle éclairée à la couleur de l’événement.' } },
        { project: 'onco-days',
          title: { en: 'A full-width screen', fr: 'Un écran pleine largeur' },
          text: { en: 'An LED stage across the whole room, with lectern, lounge and dressed tables.', fr: 'Une scène LED sur toute la largeur, avec pupitre, salon et tables habillées.' } },
        { project: 'sustainable-innovation-fest',
          title: { en: 'Directed like a broadcast', fr: 'Réalisé comme une émission' },
          text: { en: 'Three screens on stage and a live direction that follows every moment.', fr: 'Trois écrans sur scène et une réalisation en direct qui suit chaque temps fort.' } }
      ]
    }
  ];
})();
