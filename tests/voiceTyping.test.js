import test from 'node:test';
import assert from 'node:assert/strict';
import { BrowserSpeechToTextProvider } from '../src/voice/providers/browserSpeechToTextProvider.js';

test('voice typing reports unsupported browsers without affecting manual input', () => {
  globalThis.window = {};
  const provider = new BrowserSpeechToTextProvider();

  assert.equal(provider.isSupported(), false);
  assert.throws(() => provider.start({}), /unavailable/i);
});

test('voice typing requests permission and returns interim and final editable transcripts', async () => {
  let trackStopped = false;
  class FakeRecognition {
    start() {
      this.started = true;
    }

    stop() {
      this.stopped = true;
    }
  }

  globalThis.window = { SpeechRecognition: FakeRecognition };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      language: 'en-AU',
      mediaDevices: {
        getUserMedia: async () => ({
          getTracks: () => [{ stop: () => { trackStopped = true; } }],
        }),
      },
    },
  });

  const provider = new BrowserSpeechToTextProvider();
  await provider.requestPermission();
  let interim = '';
  let final = '';
  provider.start({
    onInterim: (value) => { interim = value; },
    onFinal: (value) => { final = value; },
  });
  provider.recognition.onresult({
    resultIndex: 0,
    results: [
      Object.assign([{ transcript: 'build me' }], { isFinal: false }),
      Object.assign([{ transcript: 'an app' }], { isFinal: true }),
    ],
  });

  assert.equal(trackStopped, true);
  assert.equal(provider.recognition.started, true);
  assert.equal(interim, 'build me');
  assert.equal(final, 'an app');
});

test('voice typing surfaces permission denial and recognition errors safely', async () => {
  class FakeRecognition {
    start() {}
    stop() {}
  }

  globalThis.window = { webkitSpeechRecognition: FakeRecognition };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      language: 'en-AU',
      mediaDevices: {
        getUserMedia: async () => { throw new Error('Permission denied'); },
      },
    },
  });

  const provider = new BrowserSpeechToTextProvider();
  await assert.rejects(() => provider.requestPermission(), /permission denied/i);

  let recognitionError = '';
  provider.start({
    onError: (error) => { recognitionError = error.message; },
  });
  provider.recognition.onerror({ error: 'no-speech' });
  assert.equal(recognitionError, 'no-speech');
});
