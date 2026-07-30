import assert from 'node:assert/strict'
import { test } from 'node:test'
import accessHandler from '../api/proposals/access.js'
import contentHandler from '../api/proposals/content.js'
import logoutHandler from '../api/proposals/logout.js'
import queryHandler from '../api/proposals/query.js'

process.env.NODE_ENV = 'test'
process.env.PROPOSAL_SESSION_SECRET = 'test-only-secret-with-more-than-thirty-two-characters'

function responseHarness() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    send(body) { this.body = body; return this },
    end() { return this },
  }
}

const request = (method, body = {}, cookie = '') => ({
  method,
  body,
  headers: { cookie, 'x-forwarded-for': `127.0.0.${Math.floor(Math.random() * 200) + 1}` },
  socket: {},
})

test('invalid access is generic and never sets a session', async () => {
  const response = responseHarness()
  await accessHandler(
    request('POST', { password: 'wrong-password' }),
    response,
  )
  assert.equal(response.statusCode, 401)
  assert.match(response.body.error, /could not verify/)
  assert.equal(response.headers['Set-Cookie'], undefined)
})

test('valid access creates an HttpOnly proposal-scoped session', async () => {
  const response = responseHarness()
  await accessHandler(
    request('POST', { password: 'OCTX2026TV' }),
    response,
  )
  assert.equal(response.statusCode, 200)
  assert.match(response.headers['Set-Cookie'], /HttpOnly/)
  assert.match(response.headers['Set-Cookie'], /SameSite=Strict/)
  assert.doesNotMatch(JSON.stringify(response.body), /manual distribution/i)
})

test('content and proposal chat reject unauthorised requests', async () => {
  const contentResponse = responseHarness()
  await contentHandler(request('GET'), contentResponse)
  assert.equal(contentResponse.statusCode, 401)

  const queryResponse = responseHarness()
  await queryHandler(request('POST', { question: 'What is the workflow?' }), queryResponse)
  assert.equal(queryResponse.statusCode, 401)
})

test('authorised content is isolated and query answers only from proposal', async () => {
  const accessResponse = responseHarness()
  await accessHandler(
    request('POST', { password: 'OCTX2026TV' }),
    accessResponse,
  )
  const cookie = accessResponse.headers['Set-Cookie'].split(';')[0]

  const contentResponse = responseHarness()
  await contentHandler(request('GET', {}, cookie), contentResponse)
  assert.equal(contentResponse.statusCode, 200)
  assert.equal(contentResponse.body.proposal.id, 'cfs-2026-optiflow')
  assert.equal(contentResponse.headers['Cache-Control'], 'private, no-store, max-age=0')
  assert.match(contentResponse.headers['X-Robots-Tag'], /noarchive/)

  const queryResponse = responseHarness()
  await queryHandler(request('POST', { question: 'What is the FIFO batch rule?' }, cookie), queryResponse)
  assert.equal(queryResponse.statusCode, 200)
  assert.match(queryResponse.body.answer, /FIFO/)
  assert.ok(queryResponse.body.source)
})

test('unsupported answers use the contact fallback', async () => {
  const accessResponse = responseHarness()
  await accessHandler(
    request('POST', { password: 'OCTX2026TV' }),
    accessResponse,
  )
  const cookie = accessResponse.headers['Set-Cookie'].split(';')[0]
  const response = responseHarness()
  await queryHandler(
    request('POST', { question: 'Is there a warranty for twelve years?' }, cookie),
    response,
  )
  assert.equal(response.body.category, 'proposal_question_not_covered')
  assert.equal(response.body.canRequestClarification, true)
  assert.match(response.body.answer, /not included/)
})

test('logout invalidates the browser cookie', async () => {
  const response = responseHarness()
  await logoutHandler(request('POST'), response)
  assert.equal(response.statusCode, 200)
  assert.match(response.headers['Set-Cookie'], /Max-Age=0/)
})
