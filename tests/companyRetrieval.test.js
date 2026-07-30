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
