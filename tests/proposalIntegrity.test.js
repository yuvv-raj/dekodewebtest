import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { proposal } from '../api/_proposal/generatedContent.js'

const sourcePath = new URL('../api/_proposal/source/ProposalCFS.jsx', import.meta.url)
const imagePath = new URL('../api/_proposal/source/image.png', import.meta.url)

test('approved proposal source is byte-for-byte unchanged', async () => {
  const source = await readFile(sourcePath)
  const hash = createHash('sha256').update(source).digest('hex')
  assert.equal(
    hash,
    'a0288f271f146b91c7864416f6a2c923ddff85368720c8ccd2453d0994927f34',
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
    ],
  )
  assert.equal(proposal.proposalVersion, '1.0.0')
  assert.equal(proposal.approvedAt, '2026-07-28')
})

test('generated content and diagram structure match their snapshots', () => {
  assert.equal(
    proposal.contentChecksum,
    '53ff0b5997f2ad177830baf14584b4015ef40bc85d9f4e4aa4c1ce9aff2fa826',
  )
  assert.equal(
    proposal.diagramStructureHash,
    '847b04b50675dcd468357e7f8802f0c74a3bb374b143cbf91428cbe561f76f8a',
  )
  assert.match(proposal.sections[3].html, /Tier 3: Substitute Cascade/)
  assert.match(proposal.sections[3].html, /Min 85% Brand Uniqueness/)
})
