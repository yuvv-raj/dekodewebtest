import {
  canAttemptAccess,
  createSessionCookie,
  genericAccessError,
  privateHeaders,
  PROPOSAL_ID,
  PROPOSAL_VERSION,
  verifyCredentials,
} from '../_proposal/security.js'

export default async function handler(request, response) {
  privateHeaders(response)
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed.' })
  }
  if (!canAttemptAccess(request)) {
    return response.status(429).json({ ok: false, error: genericAccessError })
  }

  const { password } = request.body || {}
  if (!verifyCredentials(password)) {
    return response.status(401).json({ ok: false, error: genericAccessError })
  }

  response.setHeader('Set-Cookie', createSessionCookie(request))
  console.info('[Proposal audit] Access granted.', {
    proposalId: PROPOSAL_ID,
    version: PROPOSAL_VERSION,
    at: new Date().toISOString(),
  })
  return response.status(200).json({
    ok: true,
    route: '/proposals/client',
    proposal: {
      title: 'Centre For Sight',
      subtitle: 'Inventory & Distribution System',
      sectionCount: 5,
      version: PROPOSAL_VERSION,
    },
  })
}
