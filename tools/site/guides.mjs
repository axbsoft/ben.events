/* benevents agency — the words of the blog (blog, fr/blog). Written by tools/site/build.mjs.

   The articles themselves are in content/blog/<id>.json, one file each, written on the admin page (/admin)
   or by hand. Advice in our own words, examples taken only from our real projects, no figure we cannot stand behind.

   id      : short name (also the name of the file)
   order   : the place of the article among those of the same day (the blog lists the newest first)
   draft   : true keeps it off the site
   slug    : the end of the page's address, in each language
   date    : the day it was published (and updated, when it is: 'updated')
   image   : the photo at the top, from one of our projects: ['path', width, height]
   short   : a short name, for menus
   title   : the big title, in two parts (the second in italics)
   card    : one sentence for the card that leads to it
   lede    : the sentence under the title
   seo     : the title and the description search engines show
   body    : the sections: [{ h: 'heading', p: ['paragraph', …], list: ['line', …] (optional), after: ['paragraph', …] (optional) }]
             in a text, {words|kind:id} is a link to a page of the site (kind: guide, event, service, city or project)
   related : the pages it leads to: { events: [ids], services: [ids], cities: [ids], guides: [ids] } */

// the words of these pages and of the page that lists them
export const GUIDE_WORDS = {
  en: {
    folder: '/blog/', index: '/blog', name: 'Blog', eyebrow: 'Blog', read: n => `${n} min read`, updated: 'Updated', written: 'Published',
    title: ['Blog', 'ideas and advice for your events'],
    lede: 'Practical answers to the questions our clients ask before an event in Morocco: the city, the venue, the programme and the technical side.',
    seo: ['Blog: Organising Corporate Events in Morocco | benevents agency', 'Practical advice to organise a corporate event in Morocco: seminars, the choice of the city and the venue, the programme and the technical side.'],
    contents: 'In this article', next: 'To go further', card: 'Read the article', by: 'benevents agency',
    endTitle: 'An event in preparation?', endText: 'Tell us the date, the city and the number of guests: we will come back with first ideas.',
    cover: t => `${t}: an article by benevents agency`
  },
  fr: {
    folder: '/fr/blog/', index: '/fr/blog', name: 'Blog', eyebrow: 'Blog', read: n => `${n} min de lecture`, updated: 'Mis à jour', written: 'Publié',
    title: ['Blog', 'idées et conseils pour vos événements'],
    lede: 'Des réponses pratiques aux questions que nos clients posent avant un événement au Maroc : la ville, le lieu, le programme et la technique.',
    seo: ['Blog : organiser un événement d’entreprise au Maroc | benevents agency', 'Des conseils pratiques pour organiser un événement d’entreprise au Maroc : séminaires, choix de la ville et du lieu, programme et technique.'],
    contents: 'Dans cet article', next: 'Pour aller plus loin', card: 'Lire l’article', by: 'benevents agency',
    endTitle: 'Un événement en préparation ?', endText: 'Donnez-nous la date, la ville et le nombre d’invités : nous revenons vers vous avec de premières idées.',
    cover: t => `${t} : un article de benevents agency`
  }
};
