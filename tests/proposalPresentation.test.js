import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const experience = await readFile(
  new URL('../src/proposals/ProposalExperience.jsx', import.meta.url),
  'utf8',
)
const styles = await readFile(
  new URL('../src/proposals/proposal.css', import.meta.url),
  'utf8',
)
const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const chat = await readFile(
  new URL('../src/components/ChatApp.jsx', import.meta.url),
  'utf8',
)

test('proposal presentation uses extracted approved content for analytics and takeaways', () => {
  assert.match(experience, /readPresentationData\(entry\.html\)/)
  assert.match(experience, /ProposalImpactVisual/)
  assert.match(experience, /ProcessComparison/)
  assert.match(experience, /SectionTakeaways/)
  assert.doesNotMatch(experience, /12,600\+ Hours/)
  assert.doesNotMatch(experience, /₹16,00,000/)
})

test('approved automated workflow paths retain their original filtering behaviour', () => {
  for (const path of [
    'path-skip',
    'path-match',
    'path-exception',
    'path-stockout',
    'path-t1',
    'path-t2',
    'path-sub',
  ]) {
    assert.match(experience, new RegExp(`['"]${path}['"]`))
  }
  assert.match(experience, /element\.classList\.contains\(activePath\)/)
  assert.match(experience, /aria-pressed/)
})

test('proposal navigation, diagrams, motion and responsive states extend the site design system', () => {
  assert.match(styles, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(styles, /proposal-comparison-scene/)
  assert.match(styles, /content-visibility:\s*auto/)
  assert.match(styles, /@media \(max-width:\s*900px\)/)
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/)
  assert.match(styles, /focus-visible/)
})

test('proposal chat is a state-preserving accessible drawer', () => {
  assert.match(app, /useState\(false\)/)
  assert.match(app, /setProposalChatOpen\(\(current\) => !current\)/)
  assert.match(app, /event\.key === 'Escape'/)
  assert.match(app, /proposalChatToggleRef\.current\?\.focus\(\)/)
  assert.match(app, /textarea\[aria-label="Message"\]/)
  assert.match(app, /aria-hidden=\{proposal && !proposalChatOpen/)
  assert.match(app, /inert=\{proposal && !proposalChatOpen/)
  assert.match(chat, /id="proposal-chat-title"/)
  assert.match(styles, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*0/)
  assert.match(styles, /proposal-chat-open[\s\S]*clamp\(360px,\s*31vw,\s*440px\)/)
  assert.match(styles, /transform:\s*translateX\(100%\)/)
})

test('proposal navigation and toolbar remain in normal measured flow without chapter copy', () => {
  assert.doesNotMatch(experience, />Chapter\s/i)
  assert.doesNotMatch(experience, /Current chapter/)
  assert.doesNotMatch(experience, /`Chapter \$\{/)
  assert.doesNotMatch(
    styles,
    /\.proposal-section-navigation\s*\{[^}]*position:\s*absolute/s,
  )
  assert.match(styles, /\.proposal-content-toolbar\s*\{[\s\S]*background:\s*#06182b/)
  assert.match(experience, /aria-label="Reset zoom to fit"/)
})

test('semantic proposal colours and workflow labels meet the explicit contrast contract', () => {
  for (const token of [
    '--proposal-positive',
    '--proposal-negative',
    '--proposal-neutral',
    '--proposal-warning',
    '--proposal-text-primary',
    '--proposal-text-secondary',
    '--proposal-surface',
    '--proposal-border',
  ]) {
    assert.match(styles, new RegExp(token))
  }
  assert.match(styles, /proposal-approved-automated[\s\S]*proposal-positive-surface/)
  assert.match(styles, /proposal-approved-manual[\s\S]*proposal-negative-surface/)
  assert.match(styles, /\.svg-node-text\s*\{[\s\S]*fill:\s*#14283e\s*!important/)
  assert.match(styles, /\.svg-sub-text\s*\{[\s\S]*fill:\s*#41566d\s*!important/)
  assert.match(styles, /svg text\[fill="white"\][\s\S]*opacity:\s*1\s*!important/)
})
