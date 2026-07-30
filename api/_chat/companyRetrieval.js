import companyKnowledge from '../../src/knowledge/companyKnowledge.json' with { type: 'json' };

const STOP_WORDS = new Set([
  'about', 'also', 'and', 'are', 'can', 'could', 'does', 'for', 'from', 'have',
  'how', 'into', 'our', 'that', 'the', 'their', 'this', 'what', 'when', 'where',
  'which', 'with', 'would', 'your', 'you', 'dekode',
]);

const normalise = (value) => String(value ?? '')
  .replace(/â€™/g, "'")
  .replace(/â€”/g, '-')
  .toLowerCase()
  .replace(/[^a-z0-9\s+-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenize = (value) => [...new Set(normalise(value).match(/[a-z0-9+-]{3,}/g) || [])]
  .filter((token) => !STOP_WORDS.has(token));

const joinItems = (items) => items.join(', ');

function makeDocuments() {
  const documents = [
    {
      id: 'company-overview',
      label: 'About DEKODE',
      text: `${companyKnowledge.company.about}\nMission: ${companyKnowledge.company.mission}\nWhy DEKODE exists: ${companyKnowledge.company.origin}\nVision: ${companyKnowledge.company.vision}\nBelief: ${companyKnowledge.company.belief}`,
    },
    {
      id: 'service-catalogue',
      label: 'DEKODE services',
      text: `DEKODE services and offerings:\n${companyKnowledge.services
        .map((service) => `${service.name}: ${service.summary}`)
        .join('\n')}`,
    },
    ...companyKnowledge.services.map((service) => ({
      id: `service-${service.id}`,
      label: service.name,
      text: `${service.name}: ${service.summary}\nCapabilities: ${joinItems(service.capabilities)}\nBest for: ${service.audience}`,
    })),
    {
      id: 'industries',
      label: 'Industries',
      text: `DEKODE works with small and medium businesses in: ${joinItems(companyKnowledge.industries)}.`,
    },
    {
      id: 'technology',
      label: 'Technology foundations',
      text: `Publicly named cloud platforms: ${joinItems(companyKnowledge.technologies)}. DEKODE selects technology around reliability, security, and maintainability.`,
    },
    {
      id: 'delivery-process',
      label: 'Delivery process',
      text: companyKnowledge.developmentProcess
        .map((step) => `${step.name}: ${step.description}`)
        .join('\n'),
    },
    {
      id: 'values',
      label: 'How DEKODE works',
      text: companyKnowledge.values
        .map((value) => `${value.name}: ${value.description}`)
        .join('\n'),
    },
    {
      id: 'contact',
      label: 'Contact',
      text: `Email: ${companyKnowledge.contact.email}. Phone: ${companyKnowledge.contact.phone}.`,
    },
    ...companyKnowledge.faqs.map((faq, index) => ({
      id: `faq-${index + 1}`,
      label: 'FAQ',
      text: `Question: ${faq.question}\nAnswer: ${faq.answer}`,
    })),
  ];

  return documents.map((document) => ({ ...document, terms: tokenize(document.text) }));
}

const documents = makeDocuments();

export function retrieveCompanyKnowledge(question, limit = 5) {
  const queryTerms = tokenize(question);
  const query = normalise(question);

  const ranked = documents
    .map((document) => {
      const overlap = queryTerms.filter((term) => document.terms.includes(term)).length;
      const nameBonus = query.includes(normalise(document.label)) ? 3 : 0;
      return { ...document, score: overlap + nameBonus };
    })
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score || left.text.length - right.text.length)
    .slice(0, limit);

  return ranked.map(({ id, label, text }) => ({ id, label, text }));
}

export function formatKnowledgeContext(question) {
  const matches = retrieveCompanyKnowledge(question);
  if (!matches.length) return { matches, context: 'No directly relevant public DEKODE knowledge was found.' };

  const context = matches
    .map((match) => `[${match.label}]\n${match.text}`)
    .join('\n\n')
    .slice(0, 7000);
  return { matches, context };
}
