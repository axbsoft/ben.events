/* benevents agency — what each service page says.
   One entry per card of "What we create", in the same order. The title, the introduction and the
   photo of a service come from its card; this file adds what opens when the card is clicked.

   id    : short name used in the page address (#service/<id>), lowercase with dashes
   does  : what the agency takes care of, a few short lines
   ideas : ideas for the client, each one seen in a project of the portfolio
           title, text : in both languages
           project     : the id of that project in projects.js; the idea then shows its photo and opens it */
(function () {
  'use strict';

  window.BEN_SERVICES = [
    {
      id: 'conferences',
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
