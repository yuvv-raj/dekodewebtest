import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findProjectOption,
  PROJECT_OPTIONS,
} from '../src/config/projectOptions.js';
import { generateAudienceResponse } from '../src/utils/chatIntelligence.js';

const EXPECTED_LABELS = [
  'AI Strategy & Consulting',
  'Generative AI',
  'Agentic AI',
  'Predictive AI',
  'Analytical AI',
  'Mobile App',
  'Web App',
  'Cloud Solutions',
  'Process Automation',
  'Systems Integration',
  'E-commerce',
];

test('uses the approved project labels exactly once', () => {
  const labels = PROJECT_OPTIONS.map((option) => option.label);
  assert.deepEqual(labels, EXPECTED_LABELS);
  assert.equal(new Set(labels).size, labels.length);
  assert.ok(PROJECT_OPTIONS.every((option) => option.openingQuestion.length > 40));
});

test('maps common wording to the right project category', () => {
  assert.equal(findProjectOption('I need a GenAI copilot')?.label, 'Generative AI');
  assert.equal(findProjectOption('Build an AI agent for sales')?.label, 'Agentic AI');
  assert.equal(findProjectOption('Move our systems to the cloud')?.label, 'Cloud Solutions');
  assert.equal(findProjectOption('Connect our CRM through an API integration')?.label, 'Systems Integration');
  assert.equal(findProjectOption('A web application for customers')?.label, 'Web App');
});

test('asks category-specific follow-up questions', () => {
  assert.match(
    generateAudienceResponse('operations team', { projectType: 'Agentic AI' }),
    /tools or systems.*review or approve/i,
  );
  assert.match(
    generateAudienceResponse('finance team', { projectType: 'Predictive AI' }),
    /historical data.*forecast or decision/i,
  );
  assert.match(
    generateAudienceResponse('support team', { projectType: 'Process Automation' }),
    /steps, approvals, and exceptions/i,
  );
});
