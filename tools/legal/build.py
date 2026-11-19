"""Writes the two legal pages of the site, privacy.html and terms.html, each in English and in French.
Their text lives here. After changing it, run:  python3 tools/legal/build.py"""
import html
import os

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '')
SITE = 'https://www.ben.events/'
MAIL = 'contact@ben.events'
PHONE = '+212 661 11 85 90'
UPDATED = {'en': '19 November 2026', 'fr': '19 novembre 2026'}
M = '<a href="mailto:%s">%s</a>' % (MAIL, MAIL)

BRAND = '<span class="brand"><span class="brand__w"><b>ben</b>events</span><span class="brand__bar"><i></i><i></i><i></i><i></i></span><span class="brand__a">agency</span></span>'

PAGES = {
    'privacy': {
        'title': {'en': 'Privacy policy', 'fr': 'Politique de confidentialité'},
        'desc': {'en': 'What the benevents agency website collects, why, and what you can ask us.',
                 'fr': 'Ce que le site de benevents agency recueille, pourquoi, et ce que vous pouvez nous demander.'},
        'lede': {'en': 'This page explains what the ben.events website collects, why, and what you can ask us. In short: we only collect what you write to us, in order to answer you.',
                 'fr': 'Cette page explique ce que le site ben.events recueille, pourquoi, et ce que vous pouvez nous demander. En bref : nous ne recueillons que ce que vous nous écrivez, pour vous répondre.'},
        'en': [
            ('Who is responsible for your data', [
                'benevents agency, an event design and production agency based in Morocco, is responsible for the data collected on this website. For any question, write to ' + M + '.']),
            ('What we collect', [
                ['<b>When you write to us through the contact form:</b> your name, your email address, your phone number if you give it, the type of event, the date you have in mind, the number of guests, the city of the event and the budget range if you give them, and your message. With them come the language of the site, the page the enquiry was sent from, the project it refers to if any, and the date and time it was sent.',
                 '<b>When you contact us by email, by phone or on WhatsApp:</b> the information you choose to give us.',
                 '<b>When you browse the site:</b> like any website, our hosting provider records technical data (IP address, type of browser, pages requested, date and time) needed to deliver the pages and keep them secure.'],
                'We ask for no sensitive data, and the site is not intended for minors.']),
            ('What we use it for', [
                'Only to answer your enquiry, prepare a proposal or a quote, and follow our relationship if a project goes ahead. We do not sell or rent your data, and we do not use it to send you advertising without your agreement.',
                'This rests on your own request: you are the one getting in touch with us.']),
            ('Who has access to it', [
                'The people at the agency who handle your enquiry, and our technical providers: the hosting provider of the site (Vercel Inc.), through which the form passes, and the tools we use to receive and follow enquiries (email, contact management). If preparing your event means passing some information on to a partner (a venue, a caterer, a technical crew), we do so for that purpose only.',
                'Some of these providers are based outside Morocco, in the United States in particular: your data may therefore be processed there.']),
            ('How long we keep it', [
                'For as long as it takes to handle your enquiry and follow our exchanges, then for the length of our relationship if we work together, and beyond that where the law requires it (accounting records, for example). You can ask us to delete it at any time.']),
            ('Cookies and outside services', [
                'The site uses no advertising cookie and no advertising tracker. It keeps a single piece of information in your browser: the language you chose. The private presentations we share with our clients by means of a code keep the access open for the length of your session; the code is checked in your browser and is not sent to us.',
                'We measure how the site is used with Rybbit, an audience measurement tool that works without cookies. It records the pages viewed, where the visit comes from, the type of device and browser and an approximate location. It also counts a few actions, such as sending the contact form (with the type of event, the city and the budget range, never your name, your contact details or your message) or opening WhatsApp from the site. To tell one visitor from another, it works out an identifier from the IP address and the browser.',
                'A few elements come from other services, which then receive your IP address and apply their own rules:',
                ['audience measurement is provided by Rybbit (rybbit.io);',
                 'the typefaces are supplied by Google Fonts;',
                 'the film is only loaded from its video host (livid.com) if you press play;',
                 'the WhatsApp, Instagram and LinkedIn links only take you there if you click them.']]),
            ('Photos and videos of our events', [
                'The site shows images of events we have produced. If you recognise yourself in one of them and would like it removed, write to us and we will take it down.']),
            ('Your rights', [
                'Under Moroccan law no. 09-08 on the protection of individuals with regard to the processing of personal data, you have the right to access the data concerning you, to have it corrected and to object to its processing. You can also ask for it to be deleted. To exercise these rights, write to ' + M + ': we will answer as soon as we can.',
                'If you believe your rights are not being respected, you can refer the matter to the Commission nationale de contrôle de la protection des données à caractère personnel (CNDP): <a href="https://www.cndp.ma" target="_blank" rel="noopener">www.cndp.ma</a>.']),
            ('Security', [
                'The site is served over an encrypted connection (HTTPS) and the form is protected against automated submissions. As no system is infallible, please do not send us confidential information through the form.']),
            ('Changes', [
                'This policy may change, for instance when the site does. The date of the last update is shown at the top of the page.']),
        ],
        'fr': [
            ('Qui est responsable de vos données', [
                'benevents agency, agence de conception et de production d’événements établie au Maroc, est responsable des données recueillies sur ce site. Pour toute question, écrivez à ' + M + '.']),
            ('Ce que nous recueillons', [
                ['<b>Quand vous nous écrivez par le formulaire de contact :</b> votre nom, votre adresse e-mail, votre téléphone si vous l’indiquez, le type d’événement, la date envisagée, le nombre d’invités, la ville de l’événement et le budget envisagé si vous les indiquez, et votre message. S’y ajoutent la langue du site, la page d’où la demande est partie, la réalisation à laquelle elle se rapporte le cas échéant, ainsi que la date et l’heure d’envoi.',
                 '<b>Quand vous nous contactez par e-mail, par téléphone ou sur WhatsApp :</b> les informations que vous choisissez de nous donner.',
                 '<b>Quand vous consultez le site :</b> comme pour tout site, notre hébergeur enregistre des données techniques (adresse IP, type de navigateur, pages demandées, date et heure) nécessaires à l’affichage des pages et à leur sécurité.'],
                'Nous ne demandons aucune donnée sensible, et le site ne s’adresse pas aux mineurs.']),
            ('À quoi cela nous sert', [
                'Uniquement à répondre à votre demande, à préparer une proposition ou un devis, puis à suivre notre relation si un projet se concrétise. Nous ne vendons ni ne louons vos données, et nous ne les utilisons pas pour vous adresser de la publicité sans votre accord.',
                'Ce traitement repose sur votre propre demande : c’est vous qui prenez contact avec nous.']),
            ('Qui y a accès', [
                'Les personnes de l’agence qui traitent votre demande, et nos prestataires techniques : l’hébergeur du site (Vercel Inc.), par lequel transite le formulaire, et les outils que nous utilisons pour recevoir et suivre les demandes (messagerie, gestion des contacts). Si la préparation de votre événement demande de transmettre certaines informations à un partenaire (un lieu, un traiteur, une équipe technique), nous le faisons dans ce seul but.',
                'Certains de ces prestataires sont établis hors du Maroc, notamment aux États-Unis : vos données peuvent donc y être traitées.']),
            ('Combien de temps nous les gardons', [
                'Le temps de traiter votre demande et de suivre nos échanges, puis pendant la durée de notre relation si nous travaillons ensemble, et au-delà lorsque la loi l’impose (pièces comptables, par exemple). Vous pouvez nous demander de les supprimer à tout moment.']),
            ('Cookies et services extérieurs', [
                'Le site n’utilise ni cookie publicitaire ni traceur publicitaire. Il garde une seule information dans votre navigateur : la langue que vous avez choisie. Les présentations privées que nous partageons avec nos clients au moyen d’un code gardent l’accès ouvert le temps de votre session ; le code est vérifié dans votre navigateur et ne nous est pas transmis.',
                'Nous mesurons la fréquentation du site avec Rybbit, un outil de mesure d’audience qui fonctionne sans cookie. Il enregistre les pages consultées, la provenance de la visite, le type d’appareil et de navigateur et une localisation approximative. Il compte aussi quelques actions, comme l’envoi du formulaire de contact (avec le type d’événement, la ville et la fourchette de budget, jamais votre nom, vos coordonnées ni votre message) ou l’ouverture de WhatsApp depuis le site. Pour distinguer un visiteur d’un autre, il calcule un identifiant à partir de l’adresse IP et du navigateur.',
                'Quelques éléments viennent d’autres services, qui reçoivent alors votre adresse IP et appliquent leurs propres règles :',
                ['la mesure d’audience est assurée par Rybbit (rybbit.io) ;',
                 'les polices de caractères sont fournies par Google Fonts ;',
                 'le film n’est chargé depuis son hébergeur vidéo (livid.com) que si vous appuyez sur lecture ;',
                 'les liens WhatsApp, Instagram et LinkedIn ne vous y conduisent que si vous cliquez dessus.']]),
            ('Photos et vidéos de nos événements', [
                'Le site montre des images d’événements que nous avons produits. Si vous vous reconnaissez sur l’une d’elles et souhaitez son retrait, écrivez-nous : nous la retirerons.']),
            ('Vos droits', [
                'Conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l’égard du traitement des données à caractère personnel, vous disposez d’un droit d’accès, de rectification et d’opposition sur les données qui vous concernent. Vous pouvez aussi demander leur suppression. Pour exercer ces droits, écrivez à ' + M + ' : nous vous répondrons dans les meilleurs délais.',
                'Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir la Commission nationale de contrôle de la protection des données à caractère personnel (CNDP) : <a href="https://www.cndp.ma" target="_blank" rel="noopener">www.cndp.ma</a>.']),
            ('Sécurité', [
                'Le site est servi en connexion chiffrée (HTTPS) et le formulaire est protégé contre les envois automatisés. Aucun système n’étant infaillible, merci de ne pas nous transmettre d’informations confidentielles par le formulaire.']),
            ('Modifications', [
                'Cette politique peut évoluer, par exemple si le site change. La date de la dernière mise à jour figure en haut de la page.']),
        ],
    },
    'terms': {
        'title': {'en': 'Terms of use', 'fr': 'Conditions d’utilisation'},
        'desc': {'en': 'The terms that apply to the use of the benevents agency website.',
                 'fr': 'Les conditions qui s’appliquent à l’utilisation du site de benevents agency.'},
        'lede': {'en': 'These terms govern the use of the ben.events website. By browsing it, you accept them.',
                 'fr': 'Ces conditions encadrent l’utilisation du site ben.events. En le consultant, vous les acceptez.'},
        'en': [
            ('Publisher and hosting', [
                'The ben.events website is published by benevents agency, an event design and production agency based in Morocco. Contact: ' + M + ' · ' + PHONE + '.',
                'It is hosted by Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States (vercel.com).']),
            ('Purpose of the site', [
                'The site presents the agency, its services and a selection of its work. The information it contains is given for guidance and has no contractual value. Sending an enquiry through the form commits neither you nor the agency: every service is covered by a separate quote and contract.']),
            ('Intellectual property', [
                'The texts, photographs, videos, graphic elements and the benevents agency logo belong to the agency or are used with the agreement of their owners. The brands, logos and creations of our clients and partners that appear in our work remain the property of their owners; they are shown as references.',
                'Any reproduction or reuse, even partial, requires our prior written agreement.']),
            ('Using the site', [
                'You agree to use the site fairly: not to disrupt the way it works, not to try to reach protected areas, not to extract its content by automated means, and not to use the form for unsolicited messages.']),
            ('Private presentations', [
                'Some pages are reserved for our clients and protected by a code. Their content is confidential: it is intended only for the people the code was given to, and must not be shared or published without our agreement.']),
            ('Links to other sites', [
                'The site links to outside services (WhatsApp, Instagram, LinkedIn, a video host). We control neither their content nor their rules, and cannot be held responsible for them.']),
            ('Liability', [
                'We take care that the information published is accurate and that the site is available, without being able to guarantee it. Within the limits allowed by law, the agency cannot be held liable for an error, an interruption or any damage resulting from the use of the site.']),
            ('Personal data', [
                'The way we handle your data is described in our <a href="privacy" data-href="privacy">privacy policy</a>.']),
            ('Governing law', [
                'These terms are governed by Moroccan law. Failing an amicable solution, any dispute falls within the jurisdiction of the competent Moroccan courts.']),
            ('Changes and contact', [
                'We may change these terms; the version online is the one that applies. A question? Write to ' + M + '.']),
        ],
        'fr': [
            ('Éditeur et hébergement', [
                'Le site ben.events est édité par benevents agency, agence de conception et de production d’événements établie au Maroc. Contact : ' + M + ' · ' + PHONE + '.',
                'Il est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (vercel.com).']),
            ('Objet du site', [
                'Le site présente l’agence, ses savoir-faire et une sélection de ses réalisations. Les informations qu’il contient sont données à titre indicatif et n’ont pas de valeur contractuelle. L’envoi d’une demande par le formulaire n’engage ni vous ni l’agence : toute prestation fait l’objet d’un devis et d’un contrat distincts.']),
            ('Propriété intellectuelle', [
                'Les textes, photographies, vidéos, éléments graphiques et le logo benevents agency appartiennent à l’agence ou sont utilisés avec l’accord de leurs titulaires. Les marques, logos et créations de nos clients et partenaires qui apparaissent dans nos réalisations restent la propriété de leurs titulaires ; ils sont présentés à titre de références.',
                'Toute reproduction ou réutilisation, même partielle, demande notre accord écrit préalable.']),
            ('Utilisation du site', [
                'Vous vous engagez à utiliser le site de façon loyale : ne pas en perturber le fonctionnement, ne pas chercher à accéder aux espaces protégés, ne pas en extraire le contenu par des moyens automatisés, et ne pas utiliser le formulaire pour des envois non sollicités.']),
            ('Présentations privées', [
                'Certaines pages sont réservées à nos clients et protégées par un code. Leur contenu est confidentiel : il est destiné aux seules personnes à qui le code a été remis, et ne doit être ni partagé ni diffusé sans notre accord.']),
            ('Liens vers d’autres sites', [
                'Le site renvoie vers des services extérieurs (WhatsApp, Instagram, LinkedIn, un hébergeur vidéo). Nous n’en maîtrisons ni le contenu ni les règles, et ne pouvons en être tenus responsables.']),
            ('Responsabilité', [
                'Nous veillons à l’exactitude des informations publiées et à la disponibilité du site, sans pouvoir les garantir. Dans les limites permises par la loi, l’agence ne peut être tenue responsable d’une erreur, d’une interruption ou d’un dommage résultant de l’utilisation du site.']),
            ('Données personnelles', [
                'La manière dont nous traitons vos données est décrite dans notre <a href="privacy" data-href="privacy">politique de confidentialité</a>.']),
            ('Droit applicable', [
                'Ces conditions sont régies par le droit marocain. À défaut de solution amiable, tout litige relève des tribunaux marocains compétents.']),
            ('Modifications et contact', [
                'Nous pouvons modifier ces conditions ; la version en ligne est celle qui s’applique. Une question ? Écrivez à ' + M + '.']),
        ],
    },
}
NAMES = {'privacy': {'en': 'Privacy policy', 'fr': 'Politique de confidentialité'}, 'terms': {'en': 'Terms of use', 'fr': 'Conditions d’utilisation'}}


def both(en, fr):
    return '<span lang="en">%s</span><span lang="fr">%s</span>' % (en, fr)


def text(sections):
    out = []
    for head, parts in sections:
        out.append('      <h2>%s</h2>' % head)
        for part in parts:
            if isinstance(part, list):
                out.append('      <ul>\n' + '\n'.join('        <li>%s</li>' % li for li in part) + '\n      </ul>')
            else:
                out.append('      <p>%s</p>' % part)
    return '\n'.join(out)


def page(key):
    p = PAGES[key]
    full = {l: p['title'][l] + ' — benevents agency' for l in ('en', 'fr')}
    a = lambda s: html.escape(s, quote=True)
    foot = '\n'.join('        <a href="%s" data-href="%s"%s>%s</a>' % (k, k, ' aria-current="page"' if k == key else '', both(NAMES[k]['en'], NAMES[k]['fr'])) for k in ('privacy', 'terms'))
    return '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title_en}</title>
<meta name="description" content="{desc_en}">
<meta name="theme-color" content="#08080a">
<link rel="canonical" href="{site}{key}">
<link rel="alternate" hreflang="en" href="{site}{key}?lang=en">
<link rel="alternate" hreflang="fr" href="{site}{key}?lang=fr">
<link rel="alternate" hreflang="x-default" href="{site}{key}">
<meta property="og:title" content="{title_en}">
<meta property="og:description" content="{desc_en}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="benevents agency">
<meta property="og:url" content="{site}{key}">
<meta property="og:image" content="{site}assets/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Open+Sans:wght@300;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/legal.css">
<!-- the page holds its text in English and in French; this shows the right one -->
<script src="assets/js/legal.js"></script>
<!-- audience measurement (Rybbit), without cookies -->
<script src="https://app.rybbit.io/api/script.js?siteId=5ad12948434d" defer></script>
<script src="assets/js/stats.js"></script>
</head>
<!-- This page is written by tools/legal/build.py, which holds its text in both languages: change the text there, then run it again. -->
<body class="legal-page" data-title-en="{title_en}" data-title-fr="{title_fr}" data-desc-en="{desc_en}" data-desc-fr="{desc_fr}">

<a class="skip" href="#main">{skip}</a>
<div class="grain" aria-hidden="true"></div>

<header class="nav">
  <a class="logo" href="./" data-href="./" aria-label="benevents agency"><span class="logo__text">{brand}</span></a>
  <div class="nav__side">
    <div class="lang" role="group" aria-label="Language">
      <button type="button" data-lang="en" aria-pressed="true">EN</button>
      <span>·</span>
      <button type="button" data-lang="fr" aria-pressed="false">FR</button>
    </div>
  </div>
</header>

<main id="main" class="legal">
  <div class="wrap">
    <div class="legal__in">
      <a class="legal__back" href="./" data-href="./">{back}</a>
      <h1 class="legal__title">{h1}</h1>
      <p class="legal__date">{date}</p>
      <p class="legal__lede">{lede}</p>

      <div class="legal__text" lang="en">
{text_en}
      </div>

      <div class="legal__text" lang="fr">
{text_fr}
      </div>
    </div>
  </div>
</main>

<footer class="legal__foot">
  <div class="wrap">
    <span>© <span data-year>2026</span> benevents agency. {rights}</span>
    <nav aria-label="Legal">
{foot}
    </nav>
  </div>
</footer>

</body>
</html>
'''.format(site=SITE, key=key, title_en=a(full['en']), title_fr=a(full['fr']), desc_en=a(p['desc']['en']), desc_fr=a(p['desc']['fr']), brand=BRAND,
           skip=both('Skip to content', 'Aller au contenu'), back=both('Back to the site', 'Retour au site'), h1=both(p['title']['en'], p['title']['fr']),
           date=both('Last updated: ' + UPDATED['en'], 'Dernière mise à jour : ' + UPDATED['fr']), lede=both(p['lede']['en'], p['lede']['fr']),
           text_en=text(p['en']).replace('      ', '        ', 0), text_fr=text(p['fr']), rights=both('All rights reserved.', 'Tous droits réservés.'), foot=foot)


for key in PAGES:
    assert len(PAGES[key]['en']) == len(PAGES[key]['fr']), key
    open(R + key + '.html', 'w', encoding='utf-8').write(page(key))
    print('wrote', key + '.html', len(PAGES[key]['en']), 'sections')
