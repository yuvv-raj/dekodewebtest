const DOMAIN_KEYWORDS = {
  healthcare: ['health', 'medical', 'doctor', 'patient', 'clinic', 'hipaa', 'hospital', 'care', 'fitness'],
  fintech: ['finance', 'banking', 'payment', 'fintech', 'crypto', 'wallet', 'money', 'investment', 'trading'],
  saas: ['saas', 'subscription', 'b2b', 'enterprise', 'dashboard', 'analytics', 'software', 'platform'],
  consumer: ['users', 'customers', 'consumer', 'b2c', 'social', 'community', 'social media', 'app'],
  ecommerce: ['ecommerce', 'store', 'shop', 'products', 'selling', 'retail', 'marketplace', 'cart'],
  education: ['education', 'learning', 'students', 'school', 'course', 'training', 'tutor', 'university'],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'automation', 'agent', 'bot', 'gpt']
};

const UNCERTAIN_SIGNALS = [
  'not sure', 'maybe', 'hmm', 'idk', 'unsure', 'probably', 'i think', 'perhaps', "don't know", "not exactly"
];

const ENTHUSIASM_SIGNALS = [
  'love it', 'exactly', 'perfect', 'awesome', 'great', 'definitely', 'absolutely', '100%'
];

const TECHNICAL_SIGNALS = [
  'api', 'database', 'sql', 'react', 'node', 'aws', 'cloud', 'architecture', 'serverless', 'microservices'
];

export function extractDomain(message) {
  const lowerMsg = message.toLowerCase();
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(kw => lowerMsg.includes(kw))) {
      return domain;
    }
  }
  return null;
}

export function detectTone(message) {
  const lowerMsg = message.toLowerCase();
  
  if (UNCERTAIN_SIGNALS.some(sig => lowerMsg.includes(sig))) return 'uncertain';
  if (ENTHUSIASM_SIGNALS.some(sig => lowerMsg.includes(sig))) return 'enthusiastic';
  if (TECHNICAL_SIGNALS.some(sig => lowerMsg.includes(sig))) return 'technical';
  
  return 'neutral';
}

// Simple stopwords list for tag extraction
const STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'i', 'my', 'we', 'our', 'want', 'need', 'build', 'make', 'just', 'like', 'some', 'any', 'all', 'do', 'don\'t', 'im', 'i\'m']);

export function extractTag(message, defaultTag) {
  // If it's a very short response, just use it (capitalized)
  const words = message.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length <= 3) {
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Otherwise try to extract meaningful words
  const meaningfulWords = words
    .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    
  if (meaningfulWords.length >= 2) {
    // Find the 2 longest words (as a heuristic for descriptive nouns)
    const longestWords = [...meaningfulWords].sort((a, b) => b.length - a.length).slice(0, 2);
    // Keep them in their original order
    const finalWords = meaningfulWords.filter(w => longestWords.includes(w));
    
    return finalWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } else if (meaningfulWords.length === 1) {
    return meaningfulWords[0].charAt(0).toUpperCase() + meaningfulWords[0].slice(1);
  }
  
  return defaultTag;
}

export function getTypingDelay(responseText) {
  // Base delay + length-based delay, capped at 2.5s for snappy UX
  return Math.min(600 + responseText.length * 20, 2500);
}

export function generateAudienceResponse(userMessage, context) {
  const domain = context.domain || extractDomain(userMessage);
  const tone = detectTone(userMessage);
  
  if (tone === 'uncertain') {
    return "No worries! Think about who would use this daily — is it for your own team, paying customers, or the general public?";
  }
  
  if (domain === 'healthcare') {
    return "Got it — healthcare is a highly impactful space! HIPAA compliance, role-based access, and robust data privacy will likely be important. What specific features are absolute must-haves for your users?";
  } else if (domain === 'fintech') {
    return "Got it — the fintech space is moving fast! Security, compliance, and smooth payment flows are critical here. Are there specific features (like ledger systems, open banking, or wallets) you absolutely must have?";
  } else if (domain === 'saas') {
    return "Got it — B2B SaaS is a great space! Role-based access control, analytics dashboards, and billing integrations will likely be important. What specific features are absolute must-haves for your core offering?";
  } else if (domain === 'ecommerce') {
    return "Got it! For e-commerce, smooth checkout flows and inventory management are key. Do you need any specific payment gateways, subscription features, or unique product handling?";
  } else if (domain === 'education') {
    return "Got it! EdTech is a wonderful area. Video streaming, progress tracking, and interactive tools are usually vital. What specific features do you absolutely must have?";
  } else if (domain === 'ai') {
    return "Got it! For AI tools, latency and smooth streaming UI are paramount. Does this agent need to connect to any external tools or databases (like Slack, CRM, or a custom API)?";
  }
  
  if (context.projectType?.includes('AI')) {
    return "Got it! Does this agent need to connect to any external tools or databases (like Slack, CRM, or a custom API)?";
  } else if (context.projectType?.includes('E-commerce')) {
    return "Got it! Do you need any specific payment gateways, inventory management, or subscription features?";
  }
  
  return "Got it! Are there any specific features you absolutely must have (like user accounts, payments, or real-time chat)?";
}

export function generateTimelineResponse(userMessage, context) {
  const tone = detectTone(userMessage);
  
  if (tone === 'uncertain') {
    return "That's okay! We usually start with a 4-8 week MVP (Minimum Viable Product) to get something into users' hands quickly. Does that general timeframe work for you?";
  }
  
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes('week') || lowerMsg.includes('asap') || lowerMsg.includes('fast') || lowerMsg.includes('quick')) {
     return "That's a tight timeline, but we love moving fast! We'd recommend a scoped-down MVP approach to hit that target. Let's schedule a brief discovery call with our team to map out the technical details. Please select a time that works for you.";
  } else if (lowerMsg.includes('month') || lowerMsg.includes('year') || lowerMsg.includes('no rush')) {
     return "That gives us great runway to architect this properly from day one! Let's schedule a brief discovery call with our team to map out the technical details. Please select a time that works for you.";
  }
  
  return "Awesome, we've got a solid foundation. Let's schedule a brief discovery call with our team to map out the technical details. Please select a time that works for you.";
}

export function isTooVague(message) {
  // Under 4 words AND no known domain keywords detected
  return message.trim().split(/\s+/).length < 4 && !extractDomain(message);
}

export function detectPlatform(message) {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('web') || lowerMsg.includes('browser') || lowerMsg.includes('site') || lowerMsg.includes('portal')) return 'web';
  if (lowerMsg.includes('mobile') || lowerMsg.includes('ios') || lowerMsg.includes('android') || lowerMsg.includes('app')) return 'mobile';
  if (lowerMsg.includes('backend') || lowerMsg.includes('api') || lowerMsg.includes('server') || lowerMsg.includes('database')) return 'backend';
  if (lowerMsg.includes('desktop') || lowerMsg.includes('mac') || lowerMsg.includes('windows') || lowerMsg.includes('pc')) return 'desktop';
  if (lowerMsg.includes('hardware') || lowerMsg.includes('iot') || lowerMsg.includes('device') || lowerMsg.includes('physical')) return 'hardware';
  return null;
}

export function generateCustomPlatformQuestion(userMessage) {
  const domain = extractDomain(userMessage);
  if (domain) {
    return `Interesting problem in the ${domain} space. Will this primarily be used on the Web, Mobile, Desktop, or is it a backend/hardware system?`;
  }
  return "Interesting problem. Will this primarily be used on the Web, Mobile, Desktop, or is it a backend/hardware system?";
}

export function generateCustomComplexityQuestion(userMessage, context) {
  const platform = context.platform || detectPlatform(userMessage) || 'custom';
  return `Got it. Building a ${platform} system for this brings unique challenges. What do you anticipate being the most technically complex part of building this?`;
}
