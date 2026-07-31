import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as jsxRuntime from 'react/jsx-runtime'
import { transformWithOxc } from 'vite'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const sourcePath = resolve(projectRoot, 'api/_proposal/source/ProposalCFS.jsx')
const outputPath = resolve(projectRoot, 'api/_proposal/generatedContent.js')
const expectedSourceHash =
  'a72f03e37d39321a6c44f9ab318a5023efadb8c5dc0f882613ed3436088068c4'

const source = await readFile(sourcePath, 'utf8')
const sourceHash = createHash('sha256').update(source).digest('hex')

if (sourceHash !== expectedSourceHash) {
  throw new Error(
    `Protected proposal integrity check failed. Expected ${expectedSourceHash}, received ${sourceHash}. An approved sync is required.`,
  )
}

const diagramStart = source.indexOf('{/* DETAILED LOGIC FLOW VIEW */}')
const diagramEnd = source.indexOf("{view === 'automated'", diagramStart)
const diagramSource = source.slice(diagramStart, diagramEnd)
const diagramStructureHash = createHash('sha256')
  .update(diagramSource)
  .digest('hex')

const serverRenderableSource = source
  .replace("import React, { useState } from 'react';", 'const React = globalThis.__proposalReact; const { useState } = React;')
  .replace("import './ProposalCFS.css';", '')
  .replace("import prototypeImage from './image.png';", "const prototypeImage = '/api/proposals/asset';")
  .replace("import archImage from './arch.png';", "const archImage = '/api/proposals/asset?asset=architecture';")
  .replace('const ProposalCFS = () => {', "const ProposalCFS = ({ initialView = 'manual' }) => {")
  .replace('const [isAuthenticated, setIsAuthenticated] = useState(false);', 'const [isAuthenticated] = useState(true);')
  .replace("const [view, setView] = useState('manual');", 'const [view, setView] = useState(initialView);')

const transformed = await transformWithOxc(
  serverRenderableSource,
  sourcePath,
  { lang: 'jsx' },
)

globalThis.__proposalReact = React
globalThis.__proposalJsxRuntime = jsxRuntime
const selfContainedCode = transformed.code.replace(
  /import\s*\{([^}]+)\}\s*from\s*["']react\/jsx-runtime["'];?/,
  (_, imports) => {
    const declarations = imports
      .split(',')
      .map((entry) => entry.trim().replace(/\s+as\s+/, ': '))
      .join(', ')
    return `const { ${declarations} } = globalThis.__proposalJsxRuntime;`
  },
)
const moduleUrl = `data:text/javascript;base64,${Buffer.from(selfContainedCode).toString('base64')}`
const { default: Proposal } = await import(moduleUrl)

const sectionOrder = ['manual', 'automated', 'prototype', 'logic', 'architecture']
const navigationLabels = {
  manual: 'Current Process: Manual',
  automated: 'Proposed Process: OptiFlow',
  prototype: 'Prototype',
  logic: 'Allocation Logic Flow',
  architecture: 'Architecture Diagram',
}

const sections = sectionOrder.map((id, index) => ({
  id,
  order: index + 1,
  navigationLabel: navigationLabels[id],
  html: renderToStaticMarkup(React.createElement(Proposal, { initialView: id })),
}))

const contentChecksum = createHash('sha256')
  .update(JSON.stringify(sections))
  .digest('hex')

const proposal = {
  id: 'cfs-2026-optiflow',
  clientId: 'cfs',
  title: 'Centre For Sight',
  subtitle: 'Inventory & Distribution System',
  proposalVersion: '1.1.0',
  approvedAt: '2026-07-31',
  sourceCommit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'source-snapshot',
  sourceChecksum: sourceHash,
  contentChecksum,
  diagramStructureHash,
  sections,
}

await writeFile(
  outputPath,
  `// Generated from the immutable approved proposal source. Do not edit.\nexport const proposal = ${JSON.stringify(proposal, null, 2)}\n`,
  'utf8',
)

console.log(`Protected proposal verified and generated (${contentChecksum}).`)
