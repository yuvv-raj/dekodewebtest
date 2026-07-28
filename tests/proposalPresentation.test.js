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
