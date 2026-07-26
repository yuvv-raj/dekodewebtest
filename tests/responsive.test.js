import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const indexCss = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
const voiceCss = await readFile(new URL('../src/components/voice/voice.css', import.meta.url), 'utf8');
const chatApp = await readFile(new URL('../src/components/ChatApp.jsx', import.meta.url), 'utf8');

test('uses dynamic viewport units and safe-area spacing for app and voice surfaces', () => {
  assert.match(indexCss, /height:\s*100dvh/);
  assert.match(indexCss, /env\(safe-area-inset-bottom\)/);
  assert.match(voiceCss, /100dvh/);
  assert.match(voiceCss, /env\(safe-area-inset-bottom\)/);
});

test('keeps one responsive visual panel and removes the fixed 600px mobile frame', () => {
  assert.equal((chatApp.match(/renderAnimationCard\('responsive-visual-panel'\)/g) || []).length, 1);
  assert.doesNotMatch(chatApp, /renderAnimationCard\('mobile-only'\)/);
  assert.doesNotMatch(indexCss, /width:\s*600px\s*!important/);
  assert.doesNotMatch(indexCss, /\bzoom\s*:/);
});

test('provides content-driven breakpoints, touch targets, and reduced motion', () => {
  assert.match(indexCss, /@media \(max-width:\s*1180px\)/);
  assert.match(indexCss, /@media \(max-width:\s*767px\)/);
  assert.match(indexCss, /@media \(max-width:\s*380px\)/);
  assert.match(indexCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(voiceCss, /min-height:\s*44px/);
  assert.match(voiceCss, /@media \(max-height:\s*640px\) and \(orientation:\s*landscape\)/);
});

test('uses multiline keyboard-aware composers and an accessible visual-panel control', () => {
  assert.match(chatApp, /<textarea/);
  assert.match(chatApp, /requestSubmit\(\)/);
  assert.match(chatApp, /aria-label=\{isVisualPanelExpanded/);
  assert.match(chatApp, /max-height:\s*640px/);
});
