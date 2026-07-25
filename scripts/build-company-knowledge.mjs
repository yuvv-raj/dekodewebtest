import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(projectRoot, '..', 'Dekode');
const outputFile = resolve(projectRoot, 'src', 'knowledge', 'companyKnowledge.json');

const sourceFiles = {
  about: resolve(sourceRoot, 'src', 'pages', 'About.jsx'),
  services: resolve(sourceRoot, 'src', 'pages', 'Services.jsx'),
  home: resolve(sourceRoot, 'src', 'pages', 'Home.jsx'),
  delivery: resolve(sourceRoot, 'src', 'components', 'DeliveryFlow.jsx'),
  contact: resolve(sourceRoot, 'src', 'pages', 'Contact.jsx'),
};

const entries = Object.fromEntries(
  await Promise.all(
    Object.entries(sourceFiles).map(async ([key, path]) => [key, await readFile(path, 'utf8')]),
  ),
);

const clean = (value = '') =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{['"]\s*['"]\}/g, ' ')
    .replace(/\u00e2\u20ac\u2122/g, '’')
    .replace(/\u00e2\u20ac(?:\u0153|\u009d)/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const matchOne = (source, pattern, label) => {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not extract ${label}`);
  return clean(match[1]);
};

const extractServices = () => {
  const cards = [...entries.services.matchAll(
    /<div id="([^"]+)" className="service-detail-card"[\s\S]*?<h2 className="service-title">([\s\S]*?)<\/h2>[\s\S]*?<p className="service-lead">([\s\S]*?)<\/p>[\s\S]*?<div className="service-includes">([\s\S]*?)<\/div>[\s\S]*?<div className="service-for">[\s\S]*?<p>([\s\S]*?)<\/p>/g,
  )];

  if (cards.length !== 6) throw new Error(`Expected 6 services, found ${cards.length}`);

  return cards.map(([, id, name, summary, includes, audience]) => ({
    id,
    name: clean(name),
    summary: clean(summary),
    capabilities: [...includes.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => clean(match[1])),
    audience: clean(audience),
  }));
};

const extractProcess = () => {
  const block = matchOne(entries.delivery, /const steps = \[([\s\S]*?)\];/, 'delivery process');
  const steps = [...block.matchAll(
    /title:\s*'([^']+)'[\s\S]*?desc:\s*'([^']+)'/g,
  )].map(([, name, description]) => ({ name: clean(name), description: clean(description) }));
  if (steps.length !== 5) throw new Error(`Expected 5 delivery steps, found ${steps.length}`);
  return steps;
};

const extractDifferences = () => {
  const section = matchOne(
    entries.about,
    /<section className="about-different-section"[\s\S]*?<div className="differences-grid">([\s\S]*?)<\/section>/,
    'company differentiators',
  );
  return [...section.matchAll(
    /<div className="difference-card"[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g,
  )].map(([, name, description]) => ({ name: clean(name), description: clean(description) }));
};

const extractPrinciples = () => {
  const section = matchOne(entries.home, /<div className="principles-grid container">([\s\S]*?)\.map\(/, 'principles');
  return [...section.matchAll(
    /\{\s*title:\s*"([^"]+)",\s*desc:\s*"([^"]+)"\s*\}/g,
  )].map(([, name, description]) => ({ name: clean(name), description: clean(description) }));
};

const industriesSentence = matchOne(
  entries.about,
  /We partner with small and medium businesses across([\s\S]*?)<\/p>/,
  'industries',
);
const industries = industriesSentence
  .replace(/^ /, '')
  .split('.')[0]
  .replace(', and ', ', ')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const services = extractServices();
const developmentProcess = extractProcess();
const whyChooseUs = extractDifferences();
const values = extractPrinciples();

const knowledge = {
  schemaVersion: 1,
  source: {
    repository: 'website/DEKODE',
    files: Object.values(sourceFiles).map((path) => path.slice(sourceRoot.length + 1).replaceAll('\\', '/')),
    generatedAt: new Date().toISOString(),
  },
  company: {
    name: 'DEKODE',
    about: matchOne(entries.about, /<p className="about-lead">([\s\S]*?)<\/p>/, 'about statement'),
    mission: matchOne(entries.about, /<h2 className="about-subheadline">([\s\S]*?)<\/h2>/, 'mission'),
    vision: matchOne(
      entries.about,
      /DEKODE is building toward becoming([\s\S]*?)<\/p>/,
      'vision',
    ).replace(/^/, 'DEKODE is building toward becoming '),
    belief: matchOne(entries.about, /<p className="about-accent-text">([\s\S]*?)<\/p>/, 'company belief'),
  },
  services,
  industries,
  technologies: ['AWS', 'Azure', 'Google Cloud Platform'],
  capabilities: [...new Set(services.flatMap((service) => service.capabilities))],
  whyChooseUs,
  values,
  developmentProcess,
  contact: {
    email: entries.contact.match(/mailto:([^"]+)/)?.[1] || null,
    phone: entries.contact.match(/tel:([^"]+)/)?.[1] || null,
  },
  faqs: [
    {
      question: 'What does DEKODE do?',
      answer: 'DEKODE combines AI consultancy, solution development, infrastructure, security, and long-term support to deliver practical systems teams can adopt.',
    },
    {
      question: 'Who does DEKODE work with?',
      answer: `DEKODE partners with small and medium businesses across ${industries.join(', ')}.`,
    },
    {
      question: 'How does DEKODE deliver projects?',
      answer: `DEKODE follows five stages: ${developmentProcess.map((step) => step.name).join(', ')}.`,
    },
  ],
  aliases: {
    ai: ['artificial intelligence', 'machine learning', 'ml', 'generative ai', 'genai', 'llm', 'copilot', 'agent', 'agents'],
    services: ['service', 'offer', 'offering', 'solutions', 'build', 'capabilities'],
    industries: ['industry', 'industries', 'sector', 'sectors', 'clients', 'customers', 'work with'],
    technologies: ['technology', 'technologies', 'tech', 'tech stack', 'stack', 'platforms', 'tools'],
    process: ['process', 'method', 'methodology', 'workflow', 'delivery', 'how you work', 'approach'],
    why: ['why choose', 'different', 'difference', 'values', 'culture', 'principles'],
    company: ['dekode', 'company', 'business', 'who are you', 'about you', 'what do you do'],
    contact: ['contact', 'email', 'phone', 'get in touch', 'reach you'],
  },
};

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(knowledge, null, 2)}\n`, 'utf8');
console.log(`Generated ${outputFile} from ${knowledge.source.files.length} DEKODE source files.`);
