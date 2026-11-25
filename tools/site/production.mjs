/* benevents agency — what we produce around the event: the stands, the printing and signage, the rental and fit-out.
   One page each (services/<slug>, fr/services/<slug>), written by tools/site/build.mjs, next to the four services of
   the home page (assets/js/services.js). The Services menu of the header shows them, each offer with its own link.

   Only what is true today: an answer is a promise. The photos are from our own projects, and their captions say
   which project and what it shows.

   id     : short name, used in data-page="production:<id>" and in the menu
   slug   : the end of the page's address, in each language
   name   : what it is called, short (menu, footer, links)
   title  : the two lines of the big title
   lede   : the sentence under it
   seo    : the title and the description search engines show
   cover  : the photo at the top of the page: { project: '<id in content/projects.json>', photo: <its number, from 0>, caption }
   text   : two paragraphs
   offer  : what we provide, each with its own link from the menu (#<id>): { id, name, text }
   steps  : how we run it: { en: { title, intro, points: [['name', 'sentence'], …] }, fr: { … } }
   ideas  : photos of our projects that show it: { project, photo, title, text } */

export const PRODUCTION = [
  {
    id: 'stands',
    slug: { en: 'exhibition-stands-morocco', fr: 'stands-exposition-maroc' },
    name: { en: 'Exhibition stands', fr: 'Stands d’exposition' },
    title: { en: ['Exhibition stands,', 'designed and built'], fr: ['Stands d’exposition,', 'conçus et construits'] },
    lede: {
      en: 'Trade fairs, showrooms and brand activations: a stand designed around your brand, then built, installed and taken down by one team.',
      fr: 'Salons, showrooms et activations de marque : un stand pensé pour votre marque, puis fabriqué, installé et démonté par une seule équipe.'
    },
    seo: {
      title: { en: 'Exhibition Stand Design and Build in Morocco | benevents agency', fr: 'Conception et fabrication de stands au Maroc | benevents agency' },
      desc: {
        en: 'Trade fair stands, showroom spaces and brand activations in Morocco: design, construction, printing, lighting, furniture, installation and dismantling.',
        fr: 'Stands de salon, espaces showroom et activations de marque au Maroc : conception, fabrication, impression, éclairage, mobilier, montage et démontage.'
      }
    },
    cover: { project: 'cupra-open-day', photo: 7, caption: { en: 'CUPRA open day: a lit bar in the colours of the brand.', fr: 'Portes ouvertes CUPRA : un bar lumineux aux couleurs de la marque.' } },
    text: {
      en: ['A stand has a few seconds to stop a visitor walking down an aisle. It has to say who you are from a distance, welcome people comfortably up close, and look as good on the last day of the fair as on the first. We design it around those three moments.',
           'We take care of the design, the construction, the printed surfaces, the lighting, the furniture and the screens, then the installation before the doors open and the dismantling after the last day. One producer follows your stand from the first drawing to the end of the fair.'],
      fr: ['Un stand a quelques secondes pour arrêter un visiteur qui passe dans l’allée. Il doit dire qui vous êtes de loin, accueillir confortablement de près, et rester aussi beau le dernier jour du salon que le premier. Nous le concevons autour de ces trois moments.',
           'Nous prenons en charge la conception, la fabrication, les surfaces imprimées, l’éclairage, le mobilier et les écrans, puis le montage avant l’ouverture et le démontage après le dernier jour. Un seul chef de projet suit votre stand, du premier dessin à la fin du salon.']
    },
    offer: [
      { id: 'design-build', name: { en: 'Design and construction', fr: 'Conception et construction' },
        text: { en: 'Stands made to measure for your brand and for the plan of the hall, from a single counter to an island stand.', fr: 'Des stands sur mesure, à votre marque et au plan du hall, du simple comptoir au stand en îlot.' } },
      { id: 'textile', name: { en: 'Textile and modular stands', fr: 'Stands textiles et modulaires' },
        text: { en: 'Tension-fabric (SEG) walls and modular structures: light, quick to set up, and reusable from one fair to the next.', fr: 'Murs en textile tendu (SEG) et structures modulaires : légers, rapides à monter et réutilisables d’un salon à l’autre.' } },
      { id: 'backlit', name: { en: 'Backlit walls and light boxes', fr: 'Murs rétroéclairés et caissons lumineux' },
        text: { en: 'Printed fabric lit from behind, for walls and displays that stay bright under the lights of the hall.', fr: 'Du textile imprimé éclairé par l’arrière, pour des murs et des présentoirs qui restent lumineux sous l’éclairage du hall.' } },
      { id: 'counters', name: { en: 'Counters, furniture and screens', fr: 'Comptoirs, mobilier et écrans' },
        text: { en: 'Counters in your colours, high tables, seating, product displays and screens, chosen to fit the stand.', fr: 'Comptoirs à vos couleurs, mange-debout, assises, présentoirs produits et écrans, choisis pour le stand.' } },
      { id: 'install', name: { en: 'Installation and dismantling', fr: 'Montage et démontage' },
        text: { en: 'Delivery, set-up before the doors open, and dismantling after the last day, anywhere in Morocco.', fr: 'Livraison, montage avant l’ouverture et démontage après le dernier jour, partout au Maroc.' } }
    ],
    steps: {
      en: { title: 'How a stand comes together', intro: 'Four steps, with the same producer from start to finish.', points: [
        ['Brief', 'The fair, the plan of your space, your products, and what visitors should do on the stand.'],
        ['Design', 'Layout, materials and visuals, with a clear budget, approved before anything is made.'],
        ['Make', 'Structure, printing, lighting and furniture prepared and checked before they leave for the venue.'],
        ['Set up', 'Installed and lit before the opening, then taken down after the last day.']] },
      fr: { title: 'Comment naît un stand', intro: 'Quatre étapes, avec le même chef de projet du début à la fin.', points: [
        ['Brief', 'Le salon, le plan de votre espace, vos produits, et ce que les visiteurs doivent faire sur le stand.'],
        ['Conception', 'Implantation, matériaux et visuels, avec un budget clair, validés avant toute fabrication.'],
        ['Fabrication', 'Structure, impression, éclairage et mobilier préparés et vérifiés avant de partir sur le lieu.'],
        ['Montage', 'Installé et éclairé avant l’ouverture, puis démonté après le dernier jour.']] }
    },
    ideas: [
      { project: 'cupra-open-day', photo: 9,
        title: { en: 'A game in the colours of the brand', fr: 'Un jeu aux couleurs de la marque' },
        text: { en: 'A precision challenge under a neon CUPRA logo, built for the open day.', fr: 'Un défi de précision sous un logo CUPRA en néon, construit pour les portes ouvertes.' } },
      { project: 'cupra-open-day', photo: 10,
        title: { en: 'A brand space on the showroom floor', fr: 'Un espace de marque dans le showroom' },
        text: { en: 'A branded bar and dressed high tables, set between the cars.', fr: 'Un bar à la marque et des mange-debout habillés, installés entre les voitures.' } }
    ]
  },
  {
    id: 'printing',
    slug: { en: 'printing-signage-morocco', fr: 'impression-signaletique-maroc' },
    name: { en: 'Printing & signage', fr: 'Impression & signalétique' },
    title: { en: ['Printing and signage', 'for your events'], fr: ['Impression et signalétique', 'pour vos événements'] },
    lede: {
      en: 'Backdrops, banners, fabric walls and signs: everything printed for your event, made to the right size and installed on site.',
      fr: 'Photocalls, bâches, murs textiles et signalétique : tout ce qui s’imprime pour votre événement, au bon format et posé sur place.'
    },
    seo: {
      title: { en: 'Event Printing and Signage in Morocco | benevents agency', fr: 'Impression et signalétique au Maroc | benevents agency' },
      desc: {
        en: 'Large-format printing, fabric (SEG) prints, vinyl, banners and mesh, photocalls and signage for events in Morocco, produced and installed by benevents.',
        fr: 'Impression grand format, textile (SEG), vinyle, bâches et mesh, photocalls et signalétique pour vos événements au Maroc, produits et posés par benevents.'
      }
    },
    cover: { project: 'femmes-en-jeu', photo: 2, caption: { en: 'Femmes en jeu, CANAL+ University: a printed wall behind the stage.', fr: 'Femmes en jeu, CANAL+ University : un mur imprimé derrière la scène.' } },
    text: {
      en: ['Printed surfaces are what guests see first and photograph most: the backdrop behind the speakers, the photocall at the entrance, the signs that take them to the right room. When they are the right size, the right colour and well stretched, the whole event looks finished.',
           'We prepare the files with you or with your designers, print on the material each place needs, and install everything on site, so that the printing is ready at the same time as the stage and the light.'],
      fr: ['Les surfaces imprimées sont ce que vos invités voient en premier et photographient le plus : le fond de scène derrière les intervenants, le photocall à l’entrée, la signalétique qui les mène à la bonne salle. Au bon format, à la bonne couleur et bien tendues, elles donnent à tout l’événement son air fini.',
           'Nous préparons les fichiers avec vous ou avec vos graphistes, imprimons sur le support que chaque endroit demande, et posons tout sur place, pour que l’impression soit prête en même temps que la scène et la lumière.']
    },
    offer: [
      { id: 'large-format', name: { en: 'Large-format printing', fr: 'Impression grand format' },
        text: { en: 'Backdrops, stage walls and room dressing, printed to the exact size of the set.', fr: 'Fonds de scène, murs et habillage de salle, imprimés aux dimensions exactes du décor.' } },
      { id: 'fabric', name: { en: 'Fabric printing (SEG)', fr: 'Impression textile (SEG)' },
        text: { en: 'Printed fabric stretched in aluminium frames: no creases, and colours that stay deep under stage light.', fr: 'Du textile imprimé tendu dans des cadres aluminium : sans plis, avec des couleurs qui restent profondes sous la lumière de scène.' } },
      { id: 'vinyl', name: { en: 'Vinyl and stickers', fr: 'Vinyle et adhésifs' },
        text: { en: 'Floor and window graphics, stickers on counters and walls, and cut lettering.', fr: 'Adhésifs au sol et sur vitrines, habillage de comptoirs et de murs, lettrage découpé.' } },
      { id: 'banners', name: { en: 'Banners, tarpaulins and mesh', fr: 'Bâches, banderoles et mesh' },
        text: { en: 'For outdoor events and façades: large prints that hold in the wind and read from far away.', fr: 'Pour les événements en extérieur et les façades : de grands formats qui tiennent au vent et se lisent de loin.' } },
      { id: 'photocalls', name: { en: 'Photocalls and backdrops', fr: 'Photocalls et backdrops' },
        text: { en: 'The wall your guests pose in front of, with your logos repeated so that they show in every photo.', fr: 'Le mur devant lequel vos invités posent, avec vos logos répétés pour qu’ils apparaissent sur chaque photo.' } },
      { id: 'signage', name: { en: 'Signage and wayfinding', fr: 'Signalétique et orientation' },
        text: { en: 'Roll-ups, totems, room signs and arrows that take guests from the entrance to their seat.', fr: 'Roll-ups, totems, panneaux de salle et fléchage qui mènent vos invités de l’entrée à leur place.' } }
    ],
    steps: {
      en: { title: 'From the file to the wall', intro: 'Four steps, checked at each one.', points: [
        ['Files', 'Sizes and formats for each surface, from your files or designed by us.'],
        ['Proof', 'A proof of every visual, approved by you before anything is printed.'],
        ['Print', 'On the material each place needs: fabric, vinyl, tarpaulin or rigid board.'],
        ['Install', 'Delivered, installed and taken down on site with the rest of the set.']] },
      fr: { title: 'Du fichier au mur', intro: 'Quatre étapes, vérifiées à chacune.', points: [
        ['Fichiers', 'Dimensions et formats de chaque surface, à partir de vos fichiers ou conçus par nous.'],
        ['BAT', 'Un bon à tirer pour chaque visuel, validé par vous avant toute impression.'],
        ['Impression', 'Sur le support que chaque endroit demande : textile, vinyle, bâche ou panneau rigide.'],
        ['Pose', 'Livré, posé et retiré sur place avec le reste du décor.']] }
    },
    ideas: [
      { project: 'a-chance-to-reset', photo: 0,
        title: { en: 'A backdrop that tells the story', fr: 'Un fond de scène qui raconte' },
        text: { en: 'The results of the programme printed on the wall behind the graduates.', fr: 'Les résultats du programme imprimés sur le mur, derrière les diplômés.' } },
      { project: 'sustainable-innovation-fest', photo: 0,
        title: { en: 'A name in large letters', fr: 'Un nom en grandes lettres' },
        text: { en: 'Enactus in 3D letters at the front of the stage, and the sponsors printed on the side wall.', fr: 'Enactus en lettres 3D devant la scène, et les partenaires imprimés sur le mur latéral.' } },
      { project: 'femmes-en-jeu', photo: 1,
        title: { en: 'A set in the colours of the event', fr: 'Un décor aux couleurs de l’événement' },
        text: { en: 'A panel stage dressed in red, with the portraits of the speakers printed above them.', fr: 'Une scène de panel habillée de rouge, avec les portraits des intervenantes imprimés au-dessus d’elles.' } },
      { project: 'cupra-open-day', photo: 6,
        title: { en: 'A sign beside each car', fr: 'Un totem à côté de chaque voiture' },
        text: { en: 'Printed totems presenting each model on the showroom floor.', fr: 'Des totems imprimés qui présentent chaque modèle dans le showroom.' } }
    ]
  },
  {
    id: 'rental',
    slug: { en: 'event-rental-fit-out-morocco', fr: 'location-materiel-evenementiel-maroc' },
    name: { en: 'Rental & fit-out', fr: 'Location & aménagement' },
    title: { en: ['Event rental', 'and fit-out'], fr: ['Location de matériel', 'et aménagement'] },
    lede: {
      en: 'Furniture, tents, equipment, computers and decoration: everything a venue needs to be ready, delivered, set up and collected.',
      fr: 'Mobilier, tentes, matériel, informatique et décoration : tout ce qu’un lieu demande pour être prêt, livré, installé et repris.'
    },
    seo: {
      title: { en: 'Event Furniture and Equipment Rental in Morocco | benevents agency', fr: 'Location de matériel événementiel au Maroc | benevents agency' },
      desc: {
        en: 'Furniture and lounges, tents and marquees, event equipment, computers and decoration for events in Morocco: delivered, installed and collected by benevents.',
        fr: 'Mobilier et salons, tentes et chapiteaux, matériel, informatique et décoration pour vos événements au Maroc : livrés, installés et repris par benevents.'
      }
    },
    cover: { project: 'marrakech-cocktail', photo: 0, caption: { en: 'A cocktail evening in Marrakech: suspended décor and high tables.', fr: 'Une soirée cocktail à Marrakech : décor suspendu et mange-debout.' } },
    text: {
      en: ['An empty hall, a garden or a showroom becomes an event venue with the right furniture, a roof when the weather calls for one, power, screens, and the details that make guests feel looked after. We bring all of it, so that you deal with one supplier instead of five.',
           'Everything is chosen to match the look of the event, delivered and set up before your guests arrive, and collected afterwards. On the day, the same team that fitted out the venue is there to run it.'],
      fr: ['Une salle vide, un jardin ou un showroom devient un lieu d’événement avec le bon mobilier, un toit quand la météo le demande, de l’électricité, des écrans, et les détails qui font que vos invités se sentent attendus. Nous apportons le tout, pour que vous traitiez avec un seul prestataire au lieu de cinq.',
           'Tout est choisi pour s’accorder à l’esprit de l’événement, livré et installé avant l’arrivée des invités, puis repris après. Le jour J, l’équipe qui a aménagé le lieu est là pour le faire vivre.']
    },
    offer: [
      { id: 'equipment', name: { en: 'Event equipment', fr: 'Matériel événementiel' },
        text: { en: 'Lecterns, barriers, cloakrooms, generators and the practical kit an event runs on.', fr: 'Pupitres, barrières, vestiaires, groupes électrogènes et tout le matériel pratique d’un événement.' } },
      { id: 'furniture', name: { en: 'Furniture and lounges', fr: 'Mobilier et salons' },
        text: { en: 'Conference seating, high tables, lounges and bean bags, gala tables and chairs, dressed to match.', fr: 'Chaises de conférence, mange-debout, salons et poufs, tables et chaises de gala, habillés à l’unisson.' } },
      { id: 'tents', name: { en: 'Tents and marquees', fr: 'Tentes et chapiteaux' },
        text: { en: 'Covered space for outdoor receptions, fan zones and open days, with flooring and lighting.', fr: 'Des espaces couverts pour les réceptions en extérieur, les fan zones et les portes ouvertes, avec plancher et éclairage.' } },
      { id: 'it', name: { en: 'Computers and IT', fr: 'Ordinateurs et informatique' },
        text: { en: 'Laptops, registration tablets, badge printers and screens for the teams on site.', fr: 'Ordinateurs portables, tablettes d’inscription, imprimantes à badges et écrans pour les équipes sur place.' } },
      { id: 'decoration', name: { en: 'Decoration and fit-out', fr: 'Décoration et aménagement' },
        text: { en: 'Flowers, drapes, suspended décor, carpet and the finishing touches that give a venue its mood.', fr: 'Fleurs, drapés, décors suspendus, moquette et finitions qui donnent son ambiance à un lieu.' } }
    ],
    steps: {
      en: { title: 'How we fit out a venue', intro: 'Four steps, with one team from the visit to the collection.', points: [
        ['Visit', 'We see the venue, or work from its plans: access, power, sizes and timing.'],
        ['Choose', 'Furniture, décor and equipment proposed together, in the look of the event, with a clear budget.'],
        ['Set up', 'Delivered and installed before the guests arrive, and checked with you on site.'],
        ['Collect', 'Taken down and collected after the event, leaving the venue as we found it.']] },
      fr: { title: 'Comment nous aménageons un lieu', intro: 'Quatre étapes, avec une seule équipe de la visite à la reprise.', points: [
        ['Visite', 'Nous voyons le lieu, ou travaillons sur ses plans : accès, électricité, dimensions et horaires.'],
        ['Choix', 'Mobilier, décor et matériel proposés ensemble, dans l’esprit de l’événement, avec un budget clair.'],
        ['Installation', 'Livré et installé avant l’arrivée des invités, et vérifié avec vous sur place.'],
        ['Reprise', 'Démonté et repris après l’événement, en laissant le lieu comme nous l’avons trouvé.']] }
    },
    ideas: [
      { project: 'gillette-watch-party', photo: 0,
        title: { en: 'A lounge for a match', fr: 'Un salon pour un match' },
        text: { en: 'Rows of bean bags facing a giant screen, for a watch party.', fr: 'Des rangées de poufs face à un écran géant, pour une soirée match.' } },
      { project: 'leo-regional-conference', photo: 0,
        title: { en: 'A hall set for a day of work', fr: 'Une salle prête pour une journée de travail' },
        text: { en: 'Rows of desks and chairs facing the stage, for a full day of sessions.', fr: 'Des rangées de tables et de chaises face à la scène, pour une journée entière de sessions.' } },
      { project: 'cupra-open-day', photo: 10,
        title: { en: 'High tables between the cars', fr: 'Des mange-debout entre les voitures' },
        text: { en: 'Covered high tables around a branded bar, on the showroom floor.', fr: 'Des mange-debout habillés autour d’un bar à la marque, dans le showroom.' } },
      { project: 'mta-cycle-meeting', photo: 1,
        title: { en: 'A room set for a gala dinner', fr: 'Une salle dressée pour un dîner de gala' },
        text: { en: 'Round tables laid for dinner, in front of the LED wall.', fr: 'Des tables rondes dressées pour le dîner, devant le mur LED.' } }
    ]
  }
];

/* The offers of the stage service (assets/js/services.js, id "production"), each with its own link from the menu. */
export const STAGE_OFFER = [
  { id: 'stages', name: { en: 'Stages and podiums', fr: 'Scènes et podiums' },
    text: { en: 'Stages, runways and podiums built for the room and the show, with steps, skirting and a clean finish.', fr: 'Scènes, passerelles et podiums construits pour la salle et le spectacle, avec marches, jupes de scène et finitions soignées.' } },
  { id: 'led', name: { en: 'LED screens and video', fr: 'Écrans LED et vidéo' },
    text: { en: 'LED walls of every size, projection and screens, with the content prepared for them.', fr: 'Murs LED de toutes tailles, projection et écrans, avec les contenus préparés pour eux.' } },
  { id: 'sound', name: { en: 'Sound', fr: 'Sonorisation' },
    text: { en: 'Speakers, microphones and mixing, so that every seat in the room hears clearly.', fr: 'Enceintes, micros et mixage, pour que chaque place de la salle entende clairement.' } },
  { id: 'lighting', name: { en: 'Lighting and power', fr: 'Éclairage et électricité' },
    text: { en: 'Stage and room lighting, effects, and the power to run them safely.', fr: 'Éclairage de scène et de salle, effets, et l’électricité pour les faire fonctionner en sécurité.' } },
  { id: 'filming', name: { en: 'Filming and live direction', fr: 'Captation et réalisation en direct' },
    text: { en: 'Multi-camera filming and live direction from our own control desk, for the room and for broadcast.', fr: 'Captation multicaméra et réalisation en direct depuis notre régie, pour la salle comme pour la diffusion.' } }
];

export const PRODUCTION_WORDS = {
  en: { eyebrow: 'What we produce', offer: 'What we provide', others: 'Everything around the event', cover: n => `${n}: a project by benevents agency`,
        menuTitle: 'Everything an event needs, one team.', menuEyebrow: 'Our services', events: 'Events', stage: 'Stage & technical', allOf: 'See the page',
        featured: 'Recent projects', seeProject: 'See the project', cities: 'Casablanca · Rabat · Marrakech · Tangier · all of Morocco',
        kinds: { seminar: 'Seminars', launch: 'Product launches', openday: 'Open days' }, also: 'Around the event, by the same team' },
  fr: { eyebrow: 'Ce que nous produisons', offer: 'Ce que nous fournissons', others: 'Tout autour de l’événement', cover: n => `${n} : une réalisation de benevents agency`,
        menuTitle: 'Tout ce qu’un événement demande, une seule équipe.', menuEyebrow: 'Nos services', events: 'Événements', stage: 'Scène & technique', allOf: 'Voir la page',
        featured: 'Réalisations récentes', seeProject: 'Voir la réalisation', cities: 'Casablanca · Rabat · Marrakech · Tanger · tout le Maroc',
        kinds: { seminar: 'Séminaires', launch: 'Lancements de produit', openday: 'Journées portes ouvertes' }, also: 'Autour de l’événement, par la même équipe' }
};
