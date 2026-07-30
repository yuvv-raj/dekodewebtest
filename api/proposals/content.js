import { proposal } from '../_proposal/generatedContent.js'
import { privateHeaders, readSession } from '../_proposal/security.js'

export default async function handler(request, response) {
  privateHeaders(response)
  if (request.method !== 'GET') {
    return response.status(405).json({ ok: false, error: 'Method not allowed.' })
  }
  if (!readSession(request)) {
    return response.status(401).json({ ok: false, error: 'Proposal access is required.' })
  }
  return response.status(200).json({ ok: true, proposal })
}
