const CHAT_EVENT = "dekode:content-to-chat";
const VOICE_EVENT = "dekode:open-voice";
const SUMMARY_EVENT = "dekode:session-summary";

let currentSummary = "";

export function sendContentToChat(payload) {
  window.dispatchEvent(
    new CustomEvent(CHAT_EVENT, {
      detail: {
        sourceSection: payload.sourceSection,
        topic: payload.topic,
        intent: payload.intent || "project_exploration",
        displayLabel: payload.displayLabel || payload.topic,
        suggestedPrompt: payload.suggestedPrompt,
        metadata: payload.metadata || {},
      },
    }),
  );
}

export function openDekodeVoice(sourceSection = "start-project") {
  window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail: { sourceSection } }));
}

export function subscribeToContentChat(handler) {
  window.addEventListener(CHAT_EVENT, handler);
  return () => window.removeEventListener(CHAT_EVENT, handler);
}

export function subscribeToVoiceOpen(handler) {
  window.addEventListener(VOICE_EVENT, handler);
  return () => window.removeEventListener(VOICE_EVENT, handler);
}

export function publishSessionSummary(summary) {
  currentSummary = summary;
  window.dispatchEvent(new CustomEvent(SUMMARY_EVENT, { detail: summary }));
}

export function subscribeToSessionSummary(handler) {
  handler(currentSummary);
  const listener = (event) => handler(event.detail);
  window.addEventListener(SUMMARY_EVENT, listener);
  return () => window.removeEventListener(SUMMARY_EVENT, listener);
}

