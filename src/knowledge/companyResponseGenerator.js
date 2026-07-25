import { loadCompanyKnowledge } from './companyKnowledgeLoader.js';
import { findNamedOffering } from './knowledgeIndex.js';
import { getPanelForTopic } from './visualPanelMapper.js';
import { getSuggestedQuestions } from './suggestedQuestionGenerator.js';

const knowledge = loadCompanyKnowledge();
const bullets = (items) => items.map((item) => `• ${item}`).join('\n');

function responseForTopic(topic, message, detectedService) {
  const service = detectedService || findNamedOffering(message);

  if (/\bsaas\b/i.test(message) && !service) {
    const webService = knowledge.services.find((item) => item.id === 'web-mobile');
    return `DEKODE’s public company profile doesn’t specifically name SaaS as a separate offering, so I don’t want to overstate it.\n\nThe closest confirmed capability is ${webService.name}: ${webService.summary}\n\nThat service covers web applications, dashboards, internal portals, UX/UI design, and production-ready delivery.`;
  }

  if (topic === 'services' && service) {
    return `${service.name} is one of DEKODE’s core services. ${service.summary}\n\nIt includes:\n${bullets(service.capabilities.slice(0, 5))}\n\nIt’s designed for ${service.audience.charAt(0).toLowerCase()}${service.audience.slice(1)}`;
  }

  switch (topic) {
    case 'services':
      return `DEKODE brings strategy, build, infrastructure, security, and ongoing support together in one delivery partner.\n\nOur core services are:\n${bullets(knowledge.services.map((item) => item.name))}\n\nWhich area would you like to explore?`;
    case 'ai': {
      const aiServices = knowledge.services.filter((item) => /AI/i.test(item.name));
      return `Yes. DEKODE helps businesses adopt AI from strategy through production.\n\n${bullets(aiServices.map((item) => `${item.name} — ${item.summary}`))}\n\nThat includes custom machine learning, generative AI, internal copilots, intelligent search, knowledge systems, and AI-powered workflow tools.`;
    }
    case 'industries':
      return `DEKODE partners with small and medium businesses that want technology to solve real problems without creating new ones.\n\nIndustries named in our company profile include:\n${bullets(knowledge.industries)}\n\nOur approach is adapted to each organisation’s workflows, constraints, and goals.`;
    case 'technologies':
      return `DEKODE chooses technology around the problem, with reliability, security, and maintainability in mind.\n\nThe platforms explicitly named in our company profile are:\n${bullets(knowledge.technologies)}\n\nWe also build with AI, machine learning, generative AI, APIs, mobile and web technologies. The public profile doesn’t list a more detailed framework-by-framework stack.`;
    case 'process':
      return `DEKODE uses a simple, risk-reducing delivery flow:\n\n${bullets(knowledge.developmentProcess.map((step) => `${step.name} — ${step.description}`))}\n\nThe aim is clear scope, security from day one, and support after launch.`;
    case 'why':
      return `DEKODE is built around practical delivery, clear communication, and long-term accountability.\n\nWhat makes us different:\n${bullets(knowledge.whyChooseUs.map((item) => `${item.name} — ${item.description}`))}\n\nWe focus on useful outcomes, not technology hype.`;
    case 'contact':
      return knowledge.contact.email
        ? `You can reach DEKODE at ${knowledge.contact.email}. Tell us what you’re exploring and we’ll help recommend a practical next step.`
        : `I couldn’t find a direct contact detail in the company profile, but DEKODE can help with AI, product development, automation, cloud, security, and ongoing support.`;
    case 'company':
    default:
      return `${knowledge.company.about}\n\nIn short, DEKODE combines:\n${bullets(['AI strategy and custom AI', 'Web and mobile products', 'E-commerce, integrations, and automation', 'Cloud, managed IT, and security'])}\n\n${knowledge.company.belief}`;
  }
}

export function generateCompanyResponse(message, intent) {
  const topic = intent.topic || 'company';
  const text = responseForTopic(topic, message, intent.service);
  return {
    text,
    topic,
    panel: getPanelForTopic(topic),
    suggestions: getSuggestedQuestions(topic),
  };
}
