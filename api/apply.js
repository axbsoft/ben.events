/* benevents agency — applications: a position of the careers pages, a spontaneous application, or "Work with us"
   (hostesses, technicians, crew…). Each one is passed on, as JSON, like the enquiries of the contact form:

     to CAREERS_WEBHOOK_URL if that environment variable is set in the Vercel project, otherwise to the same
     address as the contact form (CONTACT_WEBHOOK_URL). The address is never sent to the visitor's browser.

   What the webhook receives has the same fields as an enquiry (name, email, phone, type, city, message, lang, page,
   sent_at, source), so that whatever already turns enquiries into e-mails shows applications too: "type" says what
   it is ("Application — <position>", "Work with us — <roles>") and "message" holds every answer, one per line.
   It also has the answers one by one, for a sheet or a CRM: kind ("position", "spontaneous" or "pool"), position,
   roles, languages, links, experience, availability.

   Until a webhook is set this answers 503, and the page opens the visitor's mail app with everything filled in. */

const LIMITS = { name: 120, email: 160, phone: 40, city: 80, position: 160, roles: 400, languages: 200, links: 400, experience: 3000, availability: 300, message: 3000, lang: 2, page: 300 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KINDS = ['position', 'spontaneous', 'pool'];

function clean(body, key) {
  const v = Array.isArray(body[key]) ? body[key].join(', ') : body[key];
  if (typeof v !== 'string' && typeof v !== 'number') return '';
  return String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, LIMITS[key]);
}
function sameSite(req) {
  const host = req.headers.host || '', origin = req.headers.origin || '';
  if (origin) { try { return new URL(origin).host === host; } catch (e) { return false; } }
  return req.headers['sec-fetch-site'] === 'same-origin';
}

// the answers as one readable message, in the visitor's language
const LABELS = {
  en: { position: 'Position', roles: 'Roles', languages: 'Languages', city: 'City', phone: 'Phone', links: 'CV / portfolio', experience: 'Experience', availability: 'Availability', message: 'Message' },
  fr: { position: 'Poste', roles: 'Métiers', languages: 'Langues', city: 'Ville', phone: 'Téléphone', links: 'CV / portfolio', experience: 'Expérience', availability: 'Disponibilités', message: 'Message' }
};
function summary(a) {
  const L = LABELS[a.lang];
  return ['position', 'roles', 'languages', 'city', 'phone', 'links', 'availability', 'experience', 'message']
    .filter(k => a[k]).map(k => L[k] + ': ' + a[k]).join('\n');
}

function build(body) {
  const a = {};
  for (const key of Object.keys(LIMITS)) a[key] = clean(body, key);
  a.kind = KINDS.includes(body.kind) ? body.kind : 'spontaneous';
  a.lang = a.lang === 'fr' ? 'fr' : 'en';
  if (!a.name || !EMAIL.test(a.email) || body.consent !== true) return null;
  if (a.kind === 'pool' && !a.roles) return null;
  const fr = a.lang === 'fr';
  const type = a.kind === 'pool' ? (fr ? 'Travailler avec nous — ' : 'Work with us — ') + a.roles
    : a.kind === 'position' && a.position ? (fr ? 'Candidature — ' : 'Application — ') + a.position
      : (fr ? 'Candidature spontanée' : 'Spontaneous application');
  return {
    name: a.name, email: a.email, phone: a.phone, type, city: a.city, message: summary(a),
    kind: a.kind, position: a.position, roles: a.roles, languages: a.languages, links: a.links, experience: a.experience, availability: a.availability,
    lang: a.lang, page: a.page, sent_at: new Date().toISOString(), source: 'ben.events'
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }
  const hook = process.env.CAREERS_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL;
  if (!hook) return res.status(503).json({ ok: false, error: 'not-configured' });
  if (!sameSite(req)) return res.status(403).json({ ok: false, error: 'origin' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'invalid' });
  if (body.hp) return res.status(200).json({ ok: true });        // the field no person sees: a robot filled it

  const application = build(body);
  if (!application) return res.status(400).json({ ok: false, error: 'invalid' });
  try {
    const sent = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(application), signal: AbortSignal.timeout(8000) });
    if (!sent.ok) throw new Error('the webhook answered ' + sent.status);
  } catch (e) {
    console.error('apply: the application could not be passed on (' + (e && e.message) + ')');     // no personal data in the logs
    return res.status(502).json({ ok: false, error: 'delivery' });
  }
  return res.status(200).json({ ok: true });
};
module.exports.build = build;     // for the tests
