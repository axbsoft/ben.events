/* benevents agency — calligraphy app: passes each contact collected at an event on to the webhook
   of your choice.

   The app (calligraphy.html) posts here, one contact at a time; this function checks it and
   forwards it, as JSON, to the address held in the environment variable CALLIGRAPHY_WEBHOOK_URL of
   the Vercel project (Project → Settings → Environment Variables). That address is the "catch
   hook" of an automation (Integrately, Zapier, Make…) that adds a row to a sheet and sends the
   visitor the e-mail with the link to their calligraphy. It is never sent to a browser.

   Only the app can post here: it shows a pass that it finds once the team's code has opened it
   (tools/calligraphy/lock.mjs); this function holds only the fingerprint of that pass.

   What the webhook receives:
     { "type": "calligraphy",
       "event"       the name the team gave the event: one event, one count,
       "brand"       the brand named in the consent, when there is one,
       "name"        the first name as the visitor typed it, "email",
       "consent"     "yes" or "no": did the visitor agree to be contacted by the brand,
       "language"    "Chinese", "Japanese" or "Korean", "characters" the name as written, "reading",
       "link"        the page where the visitor finds their calligraphy: this goes in the e-mail,
       "model"       the printed model, "lang" the language the visitor was reading ("fr" or "en"),
       "created_at"  when the visitor took part (ISO 8601), "received_at" when it reached this function,
       "id"          one per participation (an entry sent twice keeps its id), "device", "source" }

   Until the variable is set this function answers 503: the app keeps the contacts on the device,
   tries again later, and the team can export them. */
const crypto = require('crypto');

let LOCK = null;
try { LOCK = require('../assets/calligraphy/app.json'); } catch (e) { LOCK = null; }

const LIMITS = { id: 40, at: 40, event: 80, brand: 60, model: 40, model_name: 80, script: 2, name: 24, chars: 40, reading: 120, email: 160, lang: 2, device: 12 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME = /^[A-Za-zÀ-ɏ]+(?:[ '\-][A-Za-zÀ-ɏ]+)*$/;
const CHARS = { zh: /^[一-鿿]+(?:·[一-鿿]+){0,2}$/, ja: /^[ァ-ー]+(?:·[ァ-ー]+){0,2}$/, ko: /^[가-힣]+(?:·[가-힣]+){0,2}$/ };
const LANGUAGE = { zh: 'Chinese', ja: 'Japanese', ko: 'Korean' };
const SITE = 'https://www.ben.events';

// one field of the contact as plain text of a reasonable length
function clean(body, key) {
  const v = body[key];
  if (typeof v !== 'string' && typeof v !== 'number') return '';
  return String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, LIMITS[key]);
}
// is this the pass of the app? (compared without giving away how much of it is right)
function known(pass) {
  if (!LOCK || typeof LOCK.pass !== 'string' || typeof pass !== 'string' || !pass || pass.length > 200) return false;
  const a = Buffer.from(crypto.createHash('sha256').update(pass).digest('hex')), b = Buffer.from(LOCK.pass);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid' });
  if (!known(body.pass)) return res.status(403).json({ ok: false, error: 'pass' });
  const hook = process.env.CALLIGRAPHY_WEBHOOK_URL;
  if (!hook) return res.status(503).json({ ok: false, error: 'not-configured' });

  const c = {};
  for (const key of Object.keys(LIMITS)) c[key] = clean(body, key);
  const when = new Date(c.at);
  if (!CHARS[c.script] || !CHARS[c.script].test(c.chars) || !NAME.test(c.name) || !EMAIL.test(c.email) || !/^[a-z0-9-]+$/.test(c.model) || isNaN(when)) {
    return res.status(400).json({ ok: false, error: 'invalid' });
  }
  const lang = c.lang === 'en' ? 'en' : 'fr';
  // the page where the visitor finds their calligraphy: built here, never taken from the request
  const link = SITE + '/calligraphy/card?' + new URLSearchParams({ s: c.script, m: c.model, n: c.name, c: c.chars, l: lang }).toString();
  const contact = {
    type: 'calligraphy',
    event: c.event,
    brand: c.brand,
    name: c.name,
    email: c.email,
    consent: body.consent === true ? 'yes' : 'no',
    language: LANGUAGE[c.script],
    characters: c.chars.replace(/·/g, ' '),
    reading: c.reading,
    link,
    model: c.model_name || c.model,
    lang,
    created_at: when.toISOString(),
    received_at: new Date().toISOString(),
    id: c.id,
    device: c.device,
    source: 'ben.events/calligraphy'
  };

  try {
    const sent = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
      signal: AbortSignal.timeout(8000)
    });
    if (!sent.ok) throw new Error('the webhook answered ' + sent.status);
  } catch (e) {
    console.error('calligraphy: a contact could not be passed on (' + (e && e.message) + ')');     // no personal data in the logs
    return res.status(502).json({ ok: false, error: 'delivery' });
  }
  return res.status(200).json({ ok: true });
};
