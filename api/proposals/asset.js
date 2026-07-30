import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { privateHeaders, readSession } from '../_proposal/security.js'

const assetPath = resolve(
  fileURLToPath(new URL('..', import.meta.url)),
  '_proposal/source/image.png',
)

export default async function handler(request, response) {
  privateHeaders(response)
  if (request.method !== 'GET') return response.status(405).end()
  if (!readSession(request)) return response.status(401).end()
  response.setHeader('Content-Type', 'image/png')
  return response.status(200).send(await readFile(assetPath))
}
