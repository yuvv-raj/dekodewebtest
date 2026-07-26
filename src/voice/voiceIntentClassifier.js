import { classifyCompanyIntent } from '../knowledge/index.js';

const PROJECT_PATTERNS = /\b(project|build|develop|design|moderni[sz]e|platform|app|website|workflow|automate|customers?|users?)\b/i;

export function classifyVoiceIntent(message, context = {}) {
  const companyIntent = classifyCompanyIntent(message, context.companyContext || {});
  if (companyIntent.isCompanyRelated) return { ...companyIntent, intent: companyIntent.topic === 'contact' ? 'contact_request' : 'company_overview' };
  if (/\b(price|pricing|budget|cost)\b/i.test(message)) return { intent: 'pricing_interest', topic: 'project' };
  if (/\b(timeline|deadline|how long|launch)\b/i.test(message)) return { intent: 'timeline_interest', topic: 'project' };
  if (/\b(meet|meeting|call|talk to (a|the) (team|person|human))\b/i.test(message)) return { intent: 'meeting_interest', topic: 'meeting' };
  if (PROJECT_PATTERNS.test(message)) return { intent: 'project_discussion', topic: 'project' };
  if (/^(hi|hello|hey|good morning|good afternoon)\b/i.test(message)) return { intent: 'greeting', topic: 'company' };
  return { intent: 'unrelated_question', topic: context.lastTopic || 'company' };
}
