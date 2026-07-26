const ALLOWED_EVENTS = new Set([
  'dekode_voice_opened',
  'microphone_permission_granted',
  'microphone_permission_denied',
  'voice_session_started',
  'voice_question_completed',
  'voice_interrupted',
  'voice_switched_to_text',
  'service_recommendation_viewed',
  'meeting_offer_shown',
  'meeting_slot_selected',
  'lead_form_generated',
  'lead_form_submitted',
  'voice_session_ended',
  'voice_error',
]);

export function trackVoiceEvent(name, metadata = {}) {
  if (!ALLOWED_EVENTS.has(name)) return;
  const safeMetadata = Object.fromEntries(
    Object.entries(metadata).filter(([key, value]) =>
      ['state', 'reason', 'provider', 'topic', 'supported'].includes(key) &&
      ['string', 'boolean', 'number'].includes(typeof value)),
  );
  window.dispatchEvent(new CustomEvent('dekode:analytics', { detail: { name, metadata: safeMetadata } }));
}
