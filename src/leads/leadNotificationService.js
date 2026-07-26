const sanitize = (value) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, 4000);

export function prepareLeadPayload(form, sourcePage = globalThis.location?.pathname || '/') {
  return {
    visitorName: sanitize(form.name),
    visitorEmail: sanitize(form.email),
    company: sanitize(form.company),
    projectSummary: sanitize(form.projectSummary),
    services: (form.interestedServices || []).map(sanitize).slice(0, 10),
    timeline: sanitize(form.timeline),
    budgetRange: sanitize(form.budgetRange),
    selectedMeetingPreference: sanitize(form.preferredMeetingTime),
    timezone: sanitize(form.timezone),
    conversationSummary: sanitize(form.projectSummary),
    sourcePage: sanitize(sourcePage),
    submittedAt: new Date().toISOString(),
  };
}

export class LeadNotificationService {
  constructor({ mode = 'mock', endpoint = '/api/leads' } = {}) {
    this.mode = mode;
    this.endpoint = endpoint;
  }

  async submit(form, consent) {
    if (!consent) throw new Error('Explicit consent is required.');
    const payload = prepareLeadPayload(form);
    if (this.mode === 'mock') {
      console.info('[DEKODE Voice] Mock lead request prepared.', { submittedAt: payload.submittedAt });
      return { ok: true, delivered: false, mode: 'mock', reference: `mock-${Date.now()}` };
    }
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('The enquiry could not be submitted. Please try again.');
    return response.json();
  }
}
