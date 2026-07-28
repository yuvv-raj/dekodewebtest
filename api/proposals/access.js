import {
  canAttemptAccess,
  createSessionCookie,
  genericAccessError,
  privateHeaders,
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

  const { accessCode, password } = request.body || {}
  if (!verifyCredentials(accessCode, password)) {
    return response.status(401).json({ ok: false, error: genericAccessError })
  }

  response.setHeader('Set-Cookie', createSessionCookie(request))
  console.info('[Proposal audit] Access granted.', {
    proposalId: 'cfs-2026-optiflow',
    version: '1.0.0',
    at: new Date().toISOString(),
  })
  return response.status(200).json({
    ok: true,
    route: '/proposals/client',
    proposal: {
      title: 'Centre For Sight',
      subtitle: 'Inventory & Distribution System',
      sectionCount: 4,
      version: '1.0.0',
    },
  })
}
