/* benevents agency — contact form: passes each enquiry on to the webhook of your choice.

   The form of the site posts here; this function checks the enquiry and forwards it, as JSON,
   to the address held in the environment variable CONTACT_WEBHOOK_URL of the Vercel project
   (Project → Settings → Environment Variables). That address is the "catch hook" of whatever
   should receive the enquiries: Zapier, Make, n8n, or a CRM that accepts webhooks. From there
   it can become an e-mail, a row in a sheet, a contact in a CRM… and be changed at any time
   without touching the site. The address is never sent to the visitor's browser.

   What the webhook receives:
     { "name", "email", "phone", "type", "date", "guests", "message",
       "project"   the portfolio project the enquiry refers to, when there is one,
       "lang"      "en" or "fr", the language the visitor was reading,
       "page"      the address of the page, "sent_at" the time (ISO 8601), "source": "ben.events" }

   Until the variable is set this function answers 503 and the form falls back to opening
   the visitor's mail app, as it always did. */

const LIMITS = { name: 120, email: 160, phone: 40, type: 80, date: 80, guests: 40, project: 160, message: 5000, lang: 2, page: 300 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// one field of the enquiry as plain text of a reasonable length
function clean(body, key) {
  const v = body[key];
  if (typeof v !== 'string' && typeof v !== 'number') return '';
  return String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, LIMITS[key]);
}

// the form of this site only: a browser says where a request comes from
function sameSite(req) {
  const host = req.headers.host || '', origin = req.headers.origin || '';
  if (origin) { try { return new URL(origin).host === host; } catch (e) { return false; } }
  return req.headers['sec-fetch-site'] === 'same-origin';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) return res.status(503).json({ ok: false, error: 'not-configured' });
  if (!sameSite(req)) return res.status(403).json({ ok: false, error: 'origin' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid' });
  // a field no person can see: only a robot fills it. It is told all went well, and nothing is sent.
  if (body.hp) return res.status(200).json({ ok: true });

  const enquiry = {};
  for (const key of Object.keys(LIMITS)) enquiry[key] = clean(body, key);
  if (!enquiry.name || !EMAIL.test(enquiry.email) || !enquiry.message) return res.status(400).json({ ok: false, error: 'invalid' });
  enquiry.lang = enquiry.lang === 'fr' ? 'fr' : 'en';
  enquiry.sent_at = new Date().toISOString();
  enquiry.source = 'ben.events';

  try {
    const sent = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
      signal: AbortSignal.timeout(8000)
    });
    if (!sent.ok) throw new Error('the webhook answered ' + sent.status);
  } catch (e) {
    console.error('contact: the enquiry could not be passed on (' + (e && e.message) + ')');     // no personal data in the logs
    return res.status(502).json({ ok: false, error: 'delivery' });
  }
  return res.status(200).json({ ok: true });
};
