const MAX_BODY_BYTES = 32_000;

const sanitize = (value, limit = 4000) =>
  [...String(value ?? '')]
    .map((character) => character.charCodeAt(0) < 32 ? ' ' : character)
    .join('')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, limit);

function validate(payload) {
  const errors = [];
  if (!payload.visitorName || sanitize(payload.visitorName, 120).length < 2) errors.push('A valid name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitize(payload.visitorEmail, 254))) errors.push('A valid email is required.');
  if (!payload.projectSummary || sanitize(payload.projectSummary).length < 4) errors.push('A project summary is required.');
  return errors;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ ok: false, error: 'Method not allowed.' });
  const rawLength = Number(request.headers['content-length'] || 0);
  if (rawLength > MAX_BODY_BYTES) return response.status(413).json({ ok: false, error: 'Request is too large.' });

  const payload = request.body || {};
  const errors = validate(payload);
  if (errors.length) return response.status(400).json({ ok: false, errors });

  const safePayload = {
    visitorName: sanitize(payload.visitorName, 120),
    visitorEmail: sanitize(payload.visitorEmail, 254),
    company: sanitize(payload.company, 160),
    projectSummary: sanitize(payload.projectSummary),
    services: Array.isArray(payload.services) ? payload.services.slice(0, 10).map((item) => sanitize(item, 120)) : [],
    timeline: sanitize(payload.timeline, 160),
    budgetRange: sanitize(payload.budgetRange, 160),
    selectedMeetingPreference: sanitize(payload.selectedMeetingPreference, 240),
    timezone: sanitize(payload.timezone, 100),
    conversationSummary: sanitize(payload.conversationSummary),
    sourcePage: sanitize(payload.sourcePage, 500),
    submittedAt: new Date().toISOString(),
  };

  // Development delivery only. Connect mail/CRM credentials here on the server.
  console.info('[DEKODE Voice] Validated mock lead request.', {
    submittedAt: safePayload.submittedAt,
    hasMeetingPreference: Boolean(safePayload.selectedMeetingPreference),
  });
  return response.status(202).json({
    ok: true,
    delivered: false,
    mode: 'mock',
    message: 'The request was validated but no email or booking was sent.',
  });
}
