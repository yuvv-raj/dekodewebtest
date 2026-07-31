import { loadCompanyKnowledge } from './companyKnowledgeLoader.js';

const normalise = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s&+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const knowledge = loadCompanyKnowledge();

const findSolutionArea = (message) => {
  const input = normalise(message);
  return knowledge.solutionAreas.find((area) => {
    const terms = [area.name, ...(area.aliases || [])].map(normalise);
    return terms.some((term) => term.length > 3 && input.includes(term));
  });
};

const topicTerms = Object.fromEntries(
  Object.entries(knowledge.aliases).map(([topic, aliases]) => [
    topic,
    [topic, ...aliases].map(normalise),
  ]),
);

export function findTopic(message) {
  const input = normalise(message);
  let best = { topic: null, score: 0 };

  for (const [topic, terms] of Object.entries(topicTerms)) {
    const score = terms.reduce((total, term) => total + (input.includes(term) ? term.split(' ').length : 0), 0);
    if (score > best.score) best = { topic, score };
  }

  const service = knowledge.services.find((item) => {
    const terms = [item.name, ...item.capabilities].map(normalise);
    return terms.some((term) => term.length > 3 && input.includes(term));
  });
  const solutionArea = findSolutionArea(message);

  if ((service || solutionArea) && (!best.topic || best.score <= 1)) {
    return { topic: 'services', service, solutionArea };
  }
  return { ...best, service, solutionArea };
}

export function findNamedOffering(message) {
  const input = normalise(message);
  return knowledge.services.find((service) => {
    const significantWords = normalise(service.name)
      .split(' ')
      .filter((word) => word.length > 3 && !['development', 'consulting'].includes(word));
    return significantWords.some((word) => input.includes(word));
  });
}

export { findSolutionArea };
