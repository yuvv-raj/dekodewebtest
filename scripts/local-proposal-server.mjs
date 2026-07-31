import { createServer as createHttpServer } from 'node:http'
import { createServer as createViteServer } from 'vite'
import access from '../api/proposals/access.js'
import asset from '../api/proposals/asset.js'
import content from '../api/proposals/content.js'
import logout from '../api/proposals/logout.js'
import query from '../api/proposals/query.js'
import leads from '../api/leads.js'

process.env.NODE_ENV = 'development'
process.env.PROPOSAL_SESSION_SECRET ||= 'local-browser-test-secret-0123456789abcdef'

const handlers = new Map([
  ['/api/proposals/access', access],
  ['/api/proposals/asset', asset],
  ['/api/proposals/content', content],
  ['/api/proposals/logout', logout],
  ['/api/proposals/query', query],
  ['/api/leads', leads],
])

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
})

const server = createHttpServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  const handler = handlers.get(pathname)
  if (!handler) return vite.middlewares(request, response)

  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  if (chunks.length) {
    try {
      request.body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      request.body = {}
    }
  }

  const adapter = {
    setHeader: response.setHeader.bind(response),
    status(code) {
      response.statusCode = code
      return this
    },
    json(body) {
      response.setHeader('content-type', 'application/json; charset=utf-8')
      response.end(JSON.stringify(body))
      return this
    },
    send(body) {
      response.end(body)
      return this
    },
    end() {
      response.end()
      return this
    },
  }
  await handler(request, adapter)
})

server.listen(4173, '127.0.0.1', () => {
  console.log('Local proposal QA server: http://127.0.0.1:4173/')
})
