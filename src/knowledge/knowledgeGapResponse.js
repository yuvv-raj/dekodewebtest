import { loadCompanyKnowledge } from './companyKnowledgeLoader.js';

const knowledge = loadCompanyKnowledge();

const FOUNDING_DATE_PATTERNS = [
  /\b(when|what year|how long ago|how old)\b.{0,40}\b(start|started|found|founded|establish|established|launch|launched)\b/i,
  /\b(start|started|found|founded|establish|established|launch|launched)\b.{0,40}\b(yesterday|today|when|what year|how long ago)\b/i,
];

const LEADERSHIP_PATTERNS = [
  /\b(who|name).{0,24}\b(founder|founded|owner|ceo|director|leadership)\b/i,
  /\b(founder|owner|ceo|director|leadership team)\b/i,
];

const LOCATION_PATTERNS = [
  /\b(where|what address).{0,30}\b(based|located|office|headquarters|hq)\b/i,
  /\b(office address|headquarters|hq)\b/i,
];

const PRICING_PATTERNS = [
  /\b(how much|exact price|pricing|price list|hourly rate|day rate)\b/i,
  /\bwhat.{0,20}\b(cost|charge)\b/i,
];

export function getKnowledgeGapResponse(message) {
  const text = String(message ?? '').trim();

  if (FOUNDING_DATE_PATTERNS.some((pattern) => pattern.test(text))) {
    return `DEKODE's public company information does not list an exact founding date, so I can't confirm whether it started yesterday.\n\nWhat it does explain is why DEKODE was created: ${knowledge.company.origin}`;
  }

  if (LEADERSHIP_PATTERNS.some((pattern) => pattern.test(text))) {
    return "DEKODE's public company information does not name its founders, owner, CEO, or leadership team, so I don't want to guess. The DEKODE team can confirm those details directly.";
  }

  if (LOCATION_PATTERNS.some((pattern) => pattern.test(text))) {
    return `DEKODE's public company information does not publish an office or headquarters address. You can contact the team at ${knowledge.contact.email} for the correct location details.`;
  }

  if (PRICING_PATTERNS.some((pattern) => pattern.test(text))) {
    return `DEKODE does not publish fixed pricing because scope depends on the problem, product, integrations, security, and support required. For an accurate estimate, contact ${knowledge.contact.email} with a short description of what you want to build.`;
  }

  return null;
}
