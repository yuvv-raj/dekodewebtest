import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { proposal } from '../api/_proposal/generatedContent.js'

const sourcePath = new URL('../api/_proposal/source/ProposalCFS.jsx', import.meta.url)
const imagePath = new URL('../api/_proposal/source/image.png', import.meta.url)
const architectureImagePath = new URL('../api/_proposal/source/arch.png', import.meta.url)

test('approved proposal source is byte-for-byte unchanged', async () => {
  const source = await readFile(sourcePath)
  const hash = createHash('sha256').update(source).digest('hex')
  assert.equal(
    hash,
    'a72f03e37d39321a6c44f9ab318a5023efadb8c5dc0f882613ed3436088068c4',
  )
  assert.equal(proposal.sourceChecksum, hash)
})

test('protected proposal image is byte-for-byte unchanged', async () => {
  const image = await readFile(imagePath)
  assert.equal(
    createHash('sha256').update(image).digest('hex'),
    '3ddcd2fc7f3809d0049feb132e979a9f9da744d2e041b86a9f49b6366f9154b5',
  )
})

test('protected architecture diagram is byte-for-byte unchanged', async () => {
  const image = await readFile(architectureImagePath)
  assert.equal(
    createHash('sha256').update(image).digest('hex'),
    '70e06e61dfca226857c4324557fa9a1006db4e782257611281e4893a7ee6a26a',
  )
})

test('section order and approved metadata stay pinned', () => {
  assert.deepEqual(
    proposal.sections.map(({ id, navigationLabel, order }) => ({
      id,
      navigationLabel,
      order,
    })),
    [
      { id: 'manual', navigationLabel: 'Current Process: Manual', order: 1 },
      { id: 'automated', navigationLabel: 'Proposed Process: OptiFlow', order: 2 },
      { id: 'prototype', navigationLabel: 'Prototype', order: 3 },
      { id: 'logic', navigationLabel: 'Allocation Logic Flow', order: 4 },
      { id: 'architecture', navigationLabel: 'Architecture Diagram', order: 5 },
    ],
  )
  assert.equal(proposal.proposalVersion, '1.1.0')
  assert.equal(proposal.approvedAt, '2026-07-31')
})

test('generated content and diagram structure match their snapshots', () => {
  assert.equal(
    proposal.contentChecksum,
    '88e99782c7ff4d96fa75cffa845f755ec7f8901f19b634ff61f66e82b5f92bd4',
  )
  assert.equal(
    proposal.diagramStructureHash,
    '57dc070a5ab909a319ce4f2f78a8261cfea889206a57b04552b67070d4d72e1c',
  )
  assert.match(proposal.sections[3].html, /Tier 3: Substitute Cascade/)
  assert.match(proposal.sections[3].html, /Min 85% Brand Uniqueness/)
  assert.match(proposal.sections[4].html, /OptiFlow Architecture Diagram/)
  assert.match(
    proposal.sections[4].html,
    /\/api\/proposals\/asset\?asset=architecture/,
  )
})
