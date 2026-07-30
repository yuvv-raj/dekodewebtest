import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getIntakeClarification,
  isLikelyGibberish,
} from '../src/utils/messageQuality.js';

test('detects the random inputs from the intake screenshots', () => {
  assert.equal(isLikelyGibberish('fyuhffui'), true);
  assert.equal(isLikelyGibberish('gtdluydf;uyf;fg'), true);
  assert.equal(isLikelyGibberish('ujhgg'), true);
  assert.equal(isLikelyGibberish('fylfuyf;pf'), true);
});

test('keeps short but meaningful project answers', () => {
  assert.equal(isLikelyGibberish('doctors'), false);
  assert.equal(isLikelyGibberish('small retail businesses'), false);
  assert.equal(isLikelyGibberish('payments and user accounts'), false);
  assert.equal(isLikelyGibberish('ASAP'), false);
  assert.equal(isLikelyGibberish('in 3 months'), false);
  assert.equal(isLikelyGibberish('not sure'), false);
});

test('returns a step-specific clarification without changing the flow', () => {
  assert.match(
    getIntakeClarification('gathering_audience', 'fyuhffui'),
    /audience/i,
  );
  assert.match(
    getIntakeClarification('gathering_features', 'gtdluydf;uyf;fg'),
    /feature/i,
  );
  assert.equal(getIntakeClarification('gathering_timeline', 'in 6 weeks'), null);
});
