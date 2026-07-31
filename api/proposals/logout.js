import {
  clearSessionCookie,
  privateHeaders,
  readSession,
} from '../_proposal/security.js'

export default async function handler(request, response) {
  privateHeaders(response)
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed.' })
  }
  const session = readSession(request)
  response.setHeader('Set-Cookie', clearSessionCookie(request))
  if (session) {
    console.info('[Proposal audit] Session ended.', {
      proposalId: session.proposalId,
      version: session.version,
      at: new Date().toISOString(),
    })
  }
  return response.status(200).json({ ok: true })
}
