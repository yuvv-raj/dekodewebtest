import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Vite development serves the existing proposal API without exposing credentials', async () => {
  const [viteConfig, localApi] = await Promise.all([
    readProjectFile('vite.config.js'),
    readProjectFile('scripts/vite-local-api.mjs'),
  ])

  assert.match(viteConfig, /localApiPlugin\(\)/)
  assert.match(localApi, /apply:\s*['"]serve['"]/)
  assert.match(localApi, /api\/proposals\/access/)
  assert.match(localApi, /api\/proposals\/content/)
  assert.match(localApi, /api\/proposals\/logout/)
  assert.match(localApi, /api\/proposals\/query/)
  assert.doesNotMatch(localApi, /OCTX2026TV|DEKODExcfs/)
})
