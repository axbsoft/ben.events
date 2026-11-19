/* benevents agency — what each service page says.
   One entry per card of "What we create", in the same order. The title, the introduction and the
   photo of a service come from its card; this file adds what opens when the card is clicked.

   id    : short name used in the page address (#service/<id>), lowercase with dashes
   slug  : the end of the address of the service's own page (services/<slug>, fr/services/<slug>)
   image : the photo of the service: ['path', width, height]
   seo   : the title and the description search engines show for that page
   text  : two paragraphs for that page, in both languages
   does  : what the agency takes care of, a few short lines
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
        desc: { en: 'Forums, annual conventions, panels and seminars in Morocco: benevents agency handles the format, the stage, the welcome, the control desk and the filming of your event.',
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
        desc: { en: 'Award and graduation ceremonies, gala dinners and anniversary evenings in Morocco: benevents agency stages your ceremony, from the storyline to show control on the day.',
                fr: 'Remises de prix et de diplômes, dîners de gala et soirées anniversaires au Maroc : benevents agency met en scène votre cérémonie, du fil conducteur à la régie du jour J.' }
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
        title: { en: 'Brand Events and Corporate Receptions in Morocco | benevents agency', fr: 'Réceptions d’entreprise et événements de marque au Maroc | benevents agency' },
        desc: { en: 'Product launches, inaugurations, press events and networking receptions in Morocco: a concept, a set in the colours of your brand and a journey for your guests.',
                fr: 'Lancements de produit, inaugurations, événements presse et réceptions au Maroc : un concept, une scénographie aux couleurs de votre marque et un parcours pour vos invités.' }
      },
      text: {
        en: ['A launch or an inauguration is a brand receiving guests at home. We start from your world to imagine a concept, a set in your colours and a journey that takes each guest from the welcome to the last conversation.',
             'Industrial hall, showroom, reception room or fan zone: we fit the place to the event, with the furniture, the lighting, the screens, the DJ and the entertainment that give it its atmosphere.'],
        fr: ['Un lancement ou une inauguration, c’est une marque qui reçoit chez elle. Nous partons de votre univers pour imaginer un concept, une scénographie à vos couleurs et un parcours qui mène chaque invité de l’accueil au dernier échange.',
             'Halle industrielle, showroom, salle de réception ou fan zone : nous adaptons le lieu à l’événement, avec le mobilier, la lumière, les écrans, le DJ et les animations qui lui donnent son ambiance.']
      },
      does: {
        en: ['Concept and theme of the evening', 'Set design in the brand’s colours', 'The guests’ journey, from welcome to goodbye', 'DJ, entertainment and games', 'Furniture, lighting and screens'],
        fr: ['Concept et thème de la soirée', 'Scénographie aux couleurs de la marque', 'Parcours des invités, de l’accueil au départ', 'DJ, animations et jeux', 'Mobilier, lumière et écrans']
      },
      ideas: [
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
        title: { en: 'Stage, LED Screens and Audiovisual Production in Morocco | benevents agency', fr: 'Scène, écrans LED et production audiovisuelle au Maroc | benevents agency' },
        desc: { en: 'LED walls, stage design, lighting, sound, multi-camera filming and live direction for your events in Morocco, run by our own technical team.',
                fr: 'Murs LED, scénographie, lumière, son, captation multicaméra et réalisation en direct pour vos événements au Maroc, assurés par notre propre équipe technique.' }
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
