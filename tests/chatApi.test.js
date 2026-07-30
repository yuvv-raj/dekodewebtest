import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';

function makeResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('answers known knowledge gaps without calling Gemini', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    throw new Error('Gemini should not be called');
  };
  process.env.GEMINI_API_KEY = 'test-key';

  try {
    const response = makeResponse();
    await handler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': 'gap-test' },
        body: { question: 'Did DEKODE start yesterday?' },
      },
      response,
    );
    assert.equal(response.statusCode, 200);
    assert.match(response.body.answer, /does not list an exact founding date/i);
    assert.equal(fetchCalls, 0);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('retries a transient Gemini failure and returns the recovered answer', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls += 1;
    if (fetchCalls === 1) {
      return {
        ok: false,
        status: 503,
        json: async () => ({
          error: { status: 'UNAVAILABLE', message: 'High demand' },
        }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Recovered answer.' }] } }],
      }),
    };
  };
  process.env.GEMINI_API_KEY = 'test-key';

  try {
    const response = makeResponse();
    await handler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': 'retry-test' },
        body: { question: 'What services does DEKODE offer?' },
      },
      response,
    );
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.answer, 'Recovered answer.');
    assert.equal(fetchCalls, 2);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});

test('switches to the fallback model after repeated capacity errors', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;
  const originalFallbackModel = process.env.GEMINI_FALLBACK_MODEL;
  const requestedUrls = [];
  global.fetch = async (url) => {
    requestedUrls.push(url);
    if (requestedUrls.length < 3) {
      return {
        ok: false,
        status: 503,
        json: async () => ({
          error: { status: 'UNAVAILABLE', message: 'High demand' },
        }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Fallback model answer.' }] } }],
      }),
    };
  };
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GEMINI_MODEL = 'primary-model';
  process.env.GEMINI_FALLBACK_MODEL = 'fallback-model';

  try {
    const response = makeResponse();
    await handler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': 'fallback-model-test' },
        body: { question: 'How does DEKODE deliver projects?' },
      },
      response,
    );
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.answer, 'Fallback model answer.');
    assert.equal(requestedUrls.length, 3);
    assert.match(requestedUrls[2], /fallback-model/);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = originalModel;
    if (originalFallbackModel === undefined) delete process.env.GEMINI_FALLBACK_MODEL;
    else process.env.GEMINI_FALLBACK_MODEL = originalFallbackModel;
  }
});
