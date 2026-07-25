const PANEL_BY_TOPIC = {
  company: 'overview',
  services: 'services',
  ai: 'ai',
  industries: 'industries',
  technologies: 'technologies',
  process: 'process',
  why: 'why',
  contact: 'overview',
};

export function getPanelForTopic(topic) {
  return PANEL_BY_TOPIC[topic] || 'overview';
}
