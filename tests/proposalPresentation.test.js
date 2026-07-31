import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
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
const sourceStyles = await readFile(
  new URL('../src/proposals/sourceStyles.css', import.meta.url),
  'utf8',
)
const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('proposal renders the approved old DEKODE presentation directly', () => {
  assert.match(experience, /dangerouslySetInnerHTML=\{\{ __html: section\.html \}\}/)
  assert.match(experience, /className="proposal-original-content"/)
  assert.match(styles, /@import '\.\/sourceStyles\.css'/)
  assert.equal(
    createHash('sha256').update(sourceStyles).digest('hex'),
    'f0248856e15d32ff00e0870cb3ec48ccf6cf91b7213ab065e3b44f3fbee53acf',
  )
  assert.doesNotMatch(experience, /ProposalImpactVisual|ProcessComparison|readPresentationData/)
  assert.doesNotMatch(experience, /12,600\+ Hours|Legacy Process: Manual Distribution/)
})

test('original sidebar navigation switches all five protected sections', () => {
  assert.match(experience, /querySelectorAll\('\.sidebar-nav-btn'\)/)
  assert.match(experience, /selectSection\(buttons\.indexOf\(navigationButton\)\)/)
  assert.match(experience, /aria-current/)
  assert.match(styles, /\.proposal-original-content \.proposal-sidebar/)
  assert.doesNotMatch(
    styles,
    /\.proposal-original-content \.proposal-sidebar\s*\{[^}]*display:\s*none/s,
  )
  assert.match(experience, /proposal\.sections\.length/)
  assert.match(sourceStyles, /\.architecture-view-container/)
  assert.match(sourceStyles, /\.architecture-image/)
})

test('approved workflow filters retain the original interactive paths', () => {
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

test('proposal chrome is confidential and contains no client chat controls', () => {
  assert.match(experience, />\s*Confidential\s*</)
  assert.doesNotMatch(experience, /Private proposal/i)
  assert.doesNotMatch(experience, />\s*Client\s*</i)
  assert.doesNotMatch(experience, /Ask proposal|Proposal chat|Close chat/)
  assert.doesNotMatch(app, /proposalChatOpen|onToggleChat|onProposalClarification/)
  assert.match(styles, /\.app-container\.proposal-mode \.chat-viewport[\s\S]*display:\s*none/)
})

test('restored proposal remains responsive, keyboard-visible, and motion-safe', () => {
  assert.match(styles, /@media \(max-width:\s*900px\)/)
  assert.match(styles, /@media \(max-width:\s*560px\)/)
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/)
  assert.match(styles, /focus-visible/)
  assert.match(styles, /grid-template-columns:\s*repeat\(5,\s*minmax\(170px,\s*1fr\)\)/)
})
