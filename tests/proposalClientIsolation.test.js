import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

test('approved proposal text is absent from the client source tree', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const chat = await readFile(new URL('../src/components/ChatApp.jsx', import.meta.url), 'utf8')
  const renderer = await readFile(new URL('../src/proposals/ProposalExperience.jsx', import.meta.url), 'utf8')
  const clientSource = `${app}\n${chat}\n${renderer}`
  assert.doesNotMatch(clientSource, /Legacy Process: Manual Distribution/)
  assert.doesNotMatch(clientSource, /Tier 3: Substitute Cascade/)
  assert.doesNotMatch(clientSource, /OCTX2026TV/)
})

test('proposal feature flags default on and remain independently disableable', async () => {
  const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /VITE_CLIENT_PROPOSALS_ENABLED/)
  assert.match(app, /VITE_PROPOSAL_CHAT_ENABLED/)
})
