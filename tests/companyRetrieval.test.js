import test from 'node:test';
import assert from 'node:assert/strict';
import { formatKnowledgeContext, retrieveCompanyKnowledge } from '../api/_chat/companyRetrieval.js';

test('retrieves the most relevant service knowledge instead of the whole website', () => {
  const matches = retrieveCompanyKnowledge('Can DEKODE build an internal AI copilot for our support team?');
  assert.ok(matches.some((match) => match.id === 'service-custom-ai'));
  assert.ok(matches.length <= 5);
  assert.ok(matches.every((match) => match.text.length > 0));
});

test('grounds broad service questions in the DEKODE service catalogue', () => {
  const matches = retrieveCompanyKnowledge('What services does DEKODE offer?');
  assert.ok(matches.some((match) => match.id === 'service-catalogue'));
});

test('builds a bounded context from relevant public knowledge', () => {
  const { context, matches } = formatKnowledgeContext('Which cloud platforms do you support?');
  assert.ok(matches.some((match) => match.id === 'technology'));
  assert.match(context, /AWS/);
  assert.ok(context.length <= 7000);
});

test('includes the old website origin story in company context', () => {
  const { context } = formatKnowledgeContext('Why was DEKODE started?');
  assert.match(context, /businesses that knew they needed to evolve/i);
});

test('retrieves focused knowledge for the new solution labels', () => {
  const cases = [
    ['How can agentic AI automate our workflow?', 'solution-agentic-ai'],
    ['We need demand forecasting with predictive AI', 'solution-predictive-ai'],
    ['Can you help with systems integration?', 'solution-systems-integration'],
    ['Help with process automation for invoice approvals', 'solution-process-automation'],
  ];

  for (const [question, expectedId] of cases) {
    const matches = retrieveCompanyKnowledge(question);
    assert.ok(matches.some((match) => match.id === expectedId), question);
    assert.ok(matches.length <= 5);
  }
});
