const questions = {
  company: ['Our Services', 'Learn about AI', 'Why Choose DEKODE'],
  services: ['Learn about AI', 'Industries', 'Development Process'],
  ai: ['Our Services', 'Technology Stack', 'Why Choose DEKODE'],
  industries: ['Our Services', 'Why Choose DEKODE', 'Development Process'],
  technologies: ['Learn about AI', 'Our Services', 'Development Process'],
  process: ['Our Services', 'Why Choose DEKODE', 'Industries'],
  why: ['Our Services', 'Industries', 'Development Process'],
  contact: ['Our Services', 'Why Choose DEKODE', 'Development Process'],
};

const promptByLabel = {
  'Our Services': 'What services do you provide?',
  'Learn about AI': 'Tell me about your AI services',
  Industries: 'What industries do you work in?',
  'Technology Stack': 'What technologies do you use?',
  'Development Process': 'What is your development process?',
  'Why Choose DEKODE': 'Why should I choose DEKODE?',
};

export function getSuggestedQuestions(topic) {
  return (questions[topic] || questions.company).map((label) => ({
    label,
    prompt: promptByLabel[label],
  }));
}
