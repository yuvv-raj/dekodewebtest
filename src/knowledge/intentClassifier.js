import { findTopic } from './knowledgeIndex.js';

const GENERAL_ONLY_PATTERNS = [
  /\b(tell|write|make).{0,12}\b(joke|poem|story|code)\b/i,
  /\b(explain|teach me)\s+(react|javascript|python|history|science)\b/i,
  /\b(who won|weather|news|time|translate)\b/i,
  /^(hello|hi|hey|thanks|thank you)\b/i,
];

const PROJECT_REQUEST_PATTERNS = [
  /\b(i|we)\s+(want|need|would like|are looking)\b/i,
  /\b(build|create|develop|design)\s+(me|us|my|our)\b/i,
  /\bhelp\s+(me|us)\s+(build|create|develop|design)\b/i,
  /\bmy\s+(app|application|website|platform|project|idea)\b/i,
];

const COMPANY_CUES = [
  /\bdekode\b/i,
  /\b(your|the)\s+(company|business|services?|capabilities|team|culture|values?|technolog(?:y|ies)|stack|process|clients?|industr(?:y|ies))\b/i,
  /\b(who are you|what do you do|why (?:should i )?choose you|how do you work)\b/i,
  /\b(do|can)\s+you\s+(build|provide|offer|support|work|help|develop|design)\b/i,
  /\bwhat\s+(?:services?|solutions?|industries|technologies)\s+do\s+you\b/i,
];

export function classifyCompanyIntent(message, context = {}) {
  const text = message.trim();
  if (
    !text ||
    GENERAL_ONLY_PATTERNS.some((pattern) => pattern.test(text)) ||
    PROJECT_REQUEST_PATTERNS.some((pattern) => pattern.test(text))
  ) {
    return { isCompanyRelated: false, topic: null };
  }

  const match = findTopic(text);
  const hasCompanyCue = COMPANY_CUES.some((pattern) => pattern.test(text));
  const contextualFollowUp =
    context.isCompanyConversation &&
    (match.score > 0 || /^(what about|how about|and|also|tell me more|why|how|which|do you|can you)\b/i.test(text));

  return {
    isCompanyRelated: hasCompanyCue || contextualFollowUp,
    topic: match.topic || (contextualFollowUp ? context.lastTopic : null) || 'company',
    service: match.service,
  };
}
