import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyCompanyIntent,
  createCompanyConversationContext,
  generateCompanyResponse,
  rememberCompanyTurn,
} from '../src/knowledge/index.js';
import { getPanelForTopic } from '../src/knowledge/visualPanelMapper.js';
import { loadCompanyKnowledge } from '../src/knowledge/companyKnowledgeLoader.js';

test('classifies representative company questions without capturing general chat', () => {
  const companyQuestions = [
    'Tell me about Dekode',
    'What services do you provide?',
    'What industries do you work in?',
    'What technologies do you use?',
    'Do you build AI agents?',
    'Why should I choose Dekode?',
  ];
  const generalQuestions = [
    'Hello',
    'Tell me a joke',
    'Write code',
    'Explain React',
    'Who won yesterday?',
    'Can you build me a mobile app?',
    'I want to create an AI agent for my team',
  ];

  for (const question of companyQuestions) {
    assert.equal(classifyCompanyIntent(question).isCompanyRelated, true, question);
  }
  for (const question of generalQuestions) {
    assert.equal(classifyCompanyIntent(question).isCompanyRelated, false, question);
  }
});

test('maintains company context for short follow-ups but permits explicit general requests', () => {
  const initial = rememberCompanyTurn(createCompanyConversationContext(), 'services');
  const followUp = classifyCompanyIntent('What about AI?', initial);

  assert.equal(followUp.isCompanyRelated, true);
  assert.equal(followUp.topic, 'ai');
  assert.equal(classifyCompanyIntent('Tell me a joke', initial).isCompanyRelated, false);
});

test('maps each knowledge topic to its intended visual panel', () => {
  assert.equal(getPanelForTopic('company'), 'overview');
  assert.equal(getPanelForTopic('services'), 'services');
  assert.equal(getPanelForTopic('industries'), 'industries');
  assert.equal(getPanelForTopic('technologies'), 'technologies');
  assert.equal(getPanelForTopic('process'), 'process');
  assert.equal(getPanelForTopic('why'), 'why');
  assert.equal(getPanelForTopic('ai'), 'ai');
});

test('generates evidence-bound responses and suggestions from loaded knowledge', () => {
  const intent = classifyCompanyIntent('What technologies do you use?');
  const response = generateCompanyResponse('What technologies do you use?', intent);

  assert.match(response.text, /AWS/);
  assert.match(response.text, /Azure/);
  assert.match(response.text, /Google Cloud Platform/);
  assert.match(response.text, /doesn’t list a more detailed/);
  assert.ok(response.suggestions.length >= 3);
});

test('loads the generated knowledge object once', () => {
  assert.strictEqual(loadCompanyKnowledge(), loadCompanyKnowledge());
});

test('does not invent a SaaS offering absent from the company profile', () => {
  const intent = classifyCompanyIntent('Do you build SaaS?');
  const response = generateCompanyResponse('Do you build SaaS?', intent);
  assert.match(response.text, /doesn’t specifically name SaaS/);
});
