import { proposal } from '../_proposal/generatedContent.js'
import { privateHeaders, readSession } from '../_proposal/security.js'

const stripHtml = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n{2,}/g, '\n')
    .trim()

const sectionDocuments = proposal.sections.map((section) => ({
  ...section,
  text: stripHtml(section.html),
  passages: stripHtml(section.html)
    .split('\n')
    .map((value) => value.trim())
    .filter((value) => value.length > 18),
}))

const STOP_WORDS = new Set([
  'about', 'after', 'also', 'and', 'are', 'can', 'could', 'does', 'for',
  'from', 'have', 'how', 'into', 'our', 'that', 'the', 'their', 'this',
  'what', 'when', 'where', 'which', 'with', 'would', 'your',
])

const tokens = (value) =>
  [...new Set(String(value).toLowerCase().match(/[a-z0-9%+-]{3,}/g) || [])]
    .filter((token) => !STOP_WORDS.has(token))

const classify = (question) => {
  const value = question.toLowerCase()
  if (/\b(price|pricing|cost|budget|fee)\b/.test(value)) return 'proposal_pricing'
  if (/\b(time|timeline|date|deadline|week|month|schedule)\b/.test(value)) return 'proposal_timeline'
  if (/\b(architecture|technical|technology|system)\b/.test(value)) return 'proposal_architecture'
  if (/\b(flow|process|workflow|allocation|tier|fifo|deficit)\b/.test(value)) return 'proposal_flow'
  if (/\b(scope|include|cover)\b/.test(value)) return 'proposal_scope'
  if (/\b(deliver|outcome|prototype)\b/.test(value)) return 'proposal_deliverables'
  if (/\b(assumption|depend|constraint|limit)\b/.test(value)) return 'proposal_assumptions'
  if (/\b(dekode|company|team|services|capability)\b/.test(value)) return 'general_company_question'
  return 'proposal_question_not_covered'
}

const rankPassages = (question) => {
  const queryTokens = tokens(question)
  return sectionDocuments
    .flatMap((section) =>
      section.passages.map((passage) => {
        const normalized = passage.toLowerCase()
        const score = queryTokens.reduce(
          (total, token) => total + (normalized.includes(token) ? 1 : 0),
          0,
        )
        return { passage, score, sectionId: section.id, label: section.navigationLabel }
      }),
    )
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.passage.length - b.passage.length)
}

export default async function handler(request, response) {
  privateHeaders(response)
  if (request.method !== 'POST') {
    return response.status(405).json({ ok: false, error: 'Method not allowed.' })
  }
  if (!readSession(request)) {
    return response.status(401).json({ ok: false, error: 'Proposal access is required.' })
  }

  const question = String(request.body?.question || '').trim().slice(0, 1200)
  if (!question) return response.status(400).json({ ok: false, error: 'A question is required.' })

  const category = classify(question)
  if (category === 'general_company_question') {
    return response.status(200).json({
      ok: true,
      category,
      answer:
        'Would you like the general DEKODE capability overview, or should I answer only from your proposal?',
      source: null,
    })
  }

  const matches = rankPassages(question)
  if (!matches.length) {
    return response.status(200).json({
      ok: true,
      category: 'proposal_question_not_covered',
      answer:
        'That detail is not included in the current proposal. The DEKODE team can clarify it with you directly.',
      source: null,
      canRequestClarification: true,
    })
  }

  const best = matches[0]
  const supporting = matches.find(
    (entry) =>
      entry.sectionId === best.sectionId &&
      entry.passage !== best.passage &&
      entry.score >= Math.max(1, best.score - 1),
  )
  return response.status(200).json({
    ok: true,
    category,
    answer: supporting
      ? `${best.passage}\n\n${supporting.passage}`
      : best.passage,
    source: { sectionId: best.sectionId, label: best.label },
  })
}
