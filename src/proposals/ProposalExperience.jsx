import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  LogOut,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  Send,
  X,
} from 'lucide-react'

function ClarificationReview({ request, proposal, section, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [isSending, setIsSending] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setIsSending(true)
    setStatus('')
    const summary = `Client requested clarification regarding "${request.question}" in proposal ${proposal.id}, section ${section.navigationLabel}.`
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          visitorName: name,
          visitorEmail: email,
          projectSummary: summary,
          conversationSummary: request.question,
          sourcePage: window.location.pathname,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || result.errors?.join(' '))
      setStatus(
        result.delivered
          ? 'Your clarification request was sent.'
          : 'Your request was reviewed and validated. Direct delivery is not connected yet, so please contact the DEKODE team.',
      )
    } catch (error) {
      setStatus(error.message || 'The request could not be prepared.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="clarification-backdrop">
      <section className="clarification-review" role="dialog" aria-modal="true" aria-labelledby="clarification-title">
        <button type="button" className="proposal-close-button" onClick={onClose} aria-label="Close clarification review">
          <X size={18} />
        </button>
        <p className="proposal-eyebrow">Review before sending</p>
        <h2 id="clarification-title">Request clarification</h2>
        <dl>
          <div><dt>Proposal</dt><dd>{proposal.title}</dd></div>
          <div><dt>Section</dt><dd>{section.navigationLabel}</dd></div>
          <div><dt>Question</dt><dd>{request.question}</dd></div>
        </dl>
        <form onSubmit={submit}>
          <label htmlFor="clarification-name">Your name</label>
          <input id="clarification-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
          <label htmlFor="clarification-email">Email</label>
          <input id="clarification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <button type="submit" className="proposal-primary-button" disabled={isSending}>
            <Send size={16} /> {isSending ? 'Preparing…' : 'Confirm request'}
          </button>
          <div className="clarification-status" role="status">{status}</div>
        </form>
      </section>
    </div>
  )
}

export default function ProposalExperience({
  proposal,
  requestedSection,
  clarificationRequest,
  onClearClarification,
  onOpenChat,
  onExit,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [fullScreenDiagram, setFullScreenDiagram] = useState(false)

  const section = proposal.sections[activeIndex]
  const progress = Math.round(((activeIndex + 1) / proposal.sections.length) * 100)

  const selectSection = (index) => {
    setCompleted((current) => new Set([...current, section.id]))
    setActiveIndex(index)
    setNavigationOpen(false)
    setZoom(1)
    document.querySelector('.proposal-content-scroll')?.scrollTo({ top: 0, behavior: 'auto' })
  }

  useEffect(() => {
    if (!requestedSection) return
    const index = proposal.sections.findIndex((entry) => entry.id === requestedSection)
    if (index >= 0) selectSection(index)
  // selectSection intentionally tracks the current section for completion.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSection])

  useEffect(() => {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex,nofollow,noarchive'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  const contentStyle = useMemo(
    () => ({ transform: `scale(${zoom})`, transformOrigin: 'top center' }),
    [zoom],
  )

  return (
    <main className="proposal-experience">
      <header className="proposal-experience-header">
        <div>
          <span className="proposal-private-indicator"><span /> Private proposal</span>
          <h1>{proposal.title}</h1>
          <p>{proposal.subtitle}</p>
        </div>
        <div className="proposal-header-actions">
          <button type="button" onClick={onOpenChat}><MessageCircle size={17} /> Ask proposal</button>
          <button type="button" onClick={onExit}><LogOut size={17} /> Exit proposal</button>
        </div>
      </header>

      <div className="proposal-progress-row" aria-label={`Proposal progress: ${progress}%`}>
        <div className="proposal-progress-copy">
          <span>Section {activeIndex + 1} of {proposal.sections.length}</span>
          <strong>{progress}% reviewed</strong>
        </div>
        <div className="proposal-progress-track"><span style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="proposal-mobile-section-picker">
        <button type="button" onClick={() => setNavigationOpen((value) => !value)} aria-expanded={navigationOpen}>
          <span><small>Current section</small>{section.navigationLabel}</span><ChevronDown size={18} />
        </button>
      </div>

      <div className="proposal-workspace">
        <nav className={`proposal-section-navigation ${navigationOpen ? 'is-open' : ''}`} aria-label="Proposal sections">
          <p>Proposal sections</p>
          {proposal.sections.map((entry, index) => (
            <button
              type="button"
              key={entry.id}
              className={index === activeIndex ? 'active' : ''}
              onClick={() => selectSection(index)}
              aria-current={index === activeIndex ? 'step' : undefined}
            >
              <span>{completed.has(entry.id) ? <Check size={13} /> : index + 1}</span>
              {entry.navigationLabel}
            </button>
          ))}
          <div className="proposal-version">
            <span>Version {proposal.proposalVersion}</span>
            <span>Approved {proposal.approvedAt}</span>
          </div>
        </nav>

        <section className="proposal-content-scroll" aria-labelledby="proposal-current-section">
          <div className="proposal-content-toolbar">
            <h2 id="proposal-current-section">{section.navigationLabel}</h2>
            <div aria-label="Content zoom">
              <button type="button" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))} aria-label="Zoom out"><Minus size={16} /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} aria-label="Zoom in"><Plus size={16} /></button>
              {section.id === 'logic' && (
                <button type="button" onClick={() => setFullScreenDiagram(true)} aria-label="Open diagram full screen"><Maximize2 size={16} /></button>
              )}
            </div>
          </div>

          <article
            className="proposal-approved-content"
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: section.html }}
          />

          <footer className="proposal-section-footer">
            <button type="button" onClick={() => selectSection(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>
              <ArrowLeft size={17} /> Previous
            </button>
            <button type="button" className="proposal-next-button" onClick={() => selectSection(Math.min(proposal.sections.length - 1, activeIndex + 1))} disabled={activeIndex === proposal.sections.length - 1}>
              Next section <ArrowRight size={17} />
            </button>
          </footer>
        </section>
      </div>

      {fullScreenDiagram && (
        <div className="proposal-diagram-fullscreen" role="dialog" aria-modal="true" aria-label="Allocation logic flow full screen">
          <button type="button" className="proposal-close-button" onClick={() => setFullScreenDiagram(false)} aria-label="Close full screen diagram"><X size={20} /></button>
          <div className="proposal-approved-content" dangerouslySetInnerHTML={{ __html: section.html }} />
        </div>
      )}

      {clarificationRequest && (
        <ClarificationReview
          request={clarificationRequest}
          proposal={proposal}
          section={section}
          onClose={onClearClarification}
        />
      )}
    </main>
  )
}
