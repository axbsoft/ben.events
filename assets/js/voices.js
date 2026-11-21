/* benevents agency — key figures and client quotes, shown under the clients' logos.
   Leave a list empty and that part stays out of the page; leave both empty and nothing shows.

   BEN_FIGURES : up to four numbers.
     value  : the number itself (it counts up to it when it comes into view)
     before : written in front of it, optional ('+', '>'…)
     after  : written behind it, optional ('+', ' %', 'k'…)
     label  : what it counts: { en: '…', fr: '…' }
     example: { value: 120, after: '+', label: { en: 'events delivered', fr: 'événements réalisés' } }

   BEN_QUOTES : what clients said, in their own words and with their agreement.
     text    : the quote, as said: '…', or in both languages: { en: '…', fr: '…' }
     name    : who said it
     role    : their position, optional: '…' or { en: '…', fr: '…' }
     company : their organisation, optional
     example: { text: { en: '…', fr: '…' }, name: 'First name Last name', role: { en: 'Marketing Director', fr: 'Directrice marketing' }, company: 'Company' }

   To show a client what their words will look like before any quote is here, open the home page with
   ?apercu=avis at the end of its address (www.ben.events/fr?apercu=avis): three example reviews appear,
   marked as examples. Visitors never see them, and they are gone as soon as a real quote is listed below. */
window.BEN_FIGURES = [];
window.BEN_QUOTES = [];
