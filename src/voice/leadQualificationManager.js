import { loadCompanyKnowledge } from '../knowledge/companyKnowledgeLoader.js';

const knowledge = loadCompanyKnowledge();

export const emptyLeadProfile = () => ({
  name: '',
  email: '',
  company: '',
  projectType: '',
  projectSummary: '',
  businessProblem: '',
  recommendedServices: [],
  timeline: '',
  budgetRange: '',
  meetingInterest: false,
  transcriptSummary: '',
  consentStatus: false,
});

export function extractLeadProfile(message, current = emptyLeadProfile()) {
  const next = { ...current };
  const email = message.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0];
  if (email) next.email = email;
  const name = message.match(/\b(?:my name is|i am|i'm)\s+([a-z][a-z '-]{1,40}?)(?=\s+(?:and|at|from|with|my email)\b|[,.]|$)/i)?.[1];
  if (name) next.name = name.trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
  const company = message.match(/\b(?:at|from|company is|work for)\s+([A-Z][\w&.' -]{1,50})/i)?.[1];
  if (company) next.company = company.trim();
  if (/\b(meet|meeting|call|discovery)\b/i.test(message)) next.meetingInterest = true;
  const timeline = message.match(/\b(?:within|in|by)\s+(\d+\s*(?:days?|weeks?|months?)|q[1-4]|[A-Z][a-z]+ \d{4})\b/i)?.[1];
  if (timeline) next.timeline = timeline;
  const budget = message.match(/(?:budget|spend|around|up to)\s*(?:is|of)?\s*([$£€]?\s?[\d,.]+\s*(?:k|m)?(?:\s*[-–]\s*[$£€]?\s?[\d,.]+\s*(?:k|m)?)?)/i)?.[1];
  if (budget) next.budgetRange = budget.trim();

  const matchedServices = knowledge.services.filter((service) => {
    const haystack = `${service.name} ${service.summary} ${service.capabilities.join(' ')}`.toLowerCase();
    const words = message.toLowerCase().match(/[a-z]{4,}/g) || [];
    return words.some((word) => haystack.includes(word));
  }).map((service) => service.name);
  next.recommendedServices = [...new Set([...next.recommendedServices, ...matchedServices])].slice(0, 4);

  if (/\b(ai|app|application|platform|website|e-commerce|ecommerce|automation|cloud|integration)\b/i.test(message)) {
    next.projectSummary = next.projectSummary ? `${next.projectSummary} ${message}` : message;
    next.businessProblem ||= message;
    next.projectType ||= message.match(/\b(AI|mobile app|web application|platform|website|e-commerce|automation|cloud|integration)\b/i)?.[0] || 'Digital project';
  }
  return next;
}

export function getNextQualificationQuestion(profile) {
  if (!profile.businessProblem) return 'What business problem would you most like this project to solve?';
  if (!profile.timeline) return 'Do you have a target timeline or launch window in mind?';
  return 'Who are the main users, and what should become easier for them?';
}

export function reuseAuthenticatedProfile(profile, authenticatedUser, hasConsent) {
  if (!hasConsent || !authenticatedUser) return profile;
  return {
    ...profile,
    name: profile.name || authenticatedUser.name || '',
    email: profile.email || authenticatedUser.email || '',
    company: profile.company || authenticatedUser.company || '',
  };
}
