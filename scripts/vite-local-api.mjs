import accessProposal from '../api/proposals/access.js'
import getProposalAsset from '../api/proposals/asset.js'
import getProposalContent from '../api/proposals/content.js'
import logoutProposal from '../api/proposals/logout.js'
import queryProposal from '../api/proposals/query.js'
import submitLead from '../api/leads.js'

const MAX_LOCAL_BODY_BYTES = 64_000

const handlers = new Map([
  ['/api/leads', submitLead],
  ['/api/proposals/access', accessProposal],
  ['/api/proposals/asset', getProposalAsset],
  ['/api/proposals/content', getProposalContent],
  ['/api/proposals/logout', logoutProposal],
  ['/api/proposals/query', queryProposal],
])

const readRequestBody = async (request) => {
  if (!['POST', 'PUT', 'PATCH'].includes(request.method)) return undefined

  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_LOCAL_BODY_BYTES) {
      const error = new Error('Request is too large.')
      error.statusCode = 413
      throw error
    }
    chunks.push(chunk)
  }
  if (!chunks.length) return {}

  const rawBody = Buffer.concat(chunks).toString('utf8')
  if (!(request.headers['content-type'] || '').includes('application/json')) {
    return rawBody
  }
  try {
    return JSON.parse(rawBody)
  } catch {
    const error = new Error('Invalid JSON.')
    error.statusCode = 400
    throw error
  }
}

const createResponseAdapter = (nodeResponse) => {
  const response = {
    setHeader(name, value) {
      nodeResponse.setHeader(name, value)
      return response
    },
    status(statusCode) {
      nodeResponse.statusCode = statusCode
      return response
    },
    json(body) {
      if (!nodeResponse.hasHeader('Content-Type')) {
        nodeResponse.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      nodeResponse.end(JSON.stringify(body))
      return response
    },
    send(body) {
      nodeResponse.end(body)
      return response
    },
    end(body) {
      nodeResponse.end(body)
      return response
    },
  }
  return response
}

export function localApiPlugin() {
  return {
    name: 'dekode-local-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = new URL(request.url, 'http://localhost').pathname
        const handler = handlers.get(pathname)
        if (!handler) {
          next()
          return
        }

        try {
          request.body = await readRequestBody(request)
          await handler(request, createResponseAdapter(response))
        } catch (error) {
          server.ssrFixStacktrace(error)
          if (response.headersSent) {
            response.end()
            return
          }
          response.statusCode = error.statusCode || 500
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Cache-Control', 'private, no-store, max-age=0')
          response.end(JSON.stringify({
            ok: false,
            error:
              error.statusCode && error.statusCode < 500
                ? error.message
                : 'The local API could not process this request.',
          }))
        }
      })
    },
  }
}
