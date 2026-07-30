import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleGauge,
  LogOut,
  Maximize2,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react'

const PATH_BY_LABEL = {
  'Show Full Workflow': 'all',
  'Path 1: Stock Adequate': 'path-skip',
  'Path 2: Auto-Allocate': 'path-match',
  'Path 3: Substitute Match': 'path-exception',
  'Path 4: Total Stockout': 'path-stockout',
  'Target Met (No Deficit)': 'path-skip',
  'T1 Auto-Allocate': 'path-t1',
  'T2 Auto-Allocate': 'path-t2',
  'T3 Substitute Match': 'path-sub',
}

const normaliseText = (value = '') => value.replace(/\s+/g, ' ').trim()
const READING_MODE_SCROLL_THRESHOLD = 96

function readPresentationData(html) {
  if (typeof document === 'undefined') {
    return { title: '', paragraphs: [], metrics: [], impact: [] }
  }

  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const content = parsed.querySelector('.proposal-main-content') || parsed.body
  const title = normaliseText(content.querySelector('.header-section h1, .prototype-view-container h2')?.textContent)
  const paragraphs = [...content.querySelectorAll('.header-section p, .prototype-view-container p, .workflow-description li')]
    .map((entry) => normaliseText(entry.textContent))
    .filter((entry) => entry.length > 28)
  const metrics = [...content.querySelectorAll('#manual-view ul li')]
    .map((entry) => {
      const label = normaliseText(entry.querySelector('strong')?.textContent)
      const text = normaliseText(entry.textContent).replace(/^•\s*/, '')
      const runs = Number(text.match(/=\s*([\d,.]+)\s*runs\/mo/i)?.[1]?.replace(/,/g, '') || 0)
      return { label, text, runs }
    })
    .filter((entry) => entry.text)
  const impact = [...content.querySelectorAll('#manual-view .header-section > div > div p')]
    .map((entry) => normaliseText(entry.textContent))
    .filter(Boolean)
  return { title, paragraphs, metrics, impact }
}

function ProposalImpactVisual({ data, reducedMotion }) {
  if (!data.metrics.length || !data.impact.length) return null
  const maxRuns = Math.max(...data.metrics.map((entry) => entry.runs), 1)

  return (
    <section className="proposal-impact-visual" aria-labelledby="proposal-impact-title">
      <div className="proposal-visual-heading">
        <span><BarChart3 size={15} /> Network Manual Overhead</span>
        <h3 id="proposal-impact-title">{data.impact[0]}</h3>
        {data.impact[1] && <p>{data.impact[1]}</p>}
      </div>
      <div className="proposal-metric-grid">
        {data.metrics.map((metric, index) => (
          <motion.article
            key={metric.text}
            className="proposal-metric-card"
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: index * 0.08, duration: 0.45 }}
          >
            <span className="proposal-metric-index">0{index + 1}</span>
            <strong>{metric.label}</strong>
            <p>{metric.text.replace(metric.label, '').trim()}</p>
            <div className="proposal-metric-track" aria-hidden="true">
              <motion.span
                initial={reducedMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: metric.runs / maxRuns }}
                viewport={{ once: true }}
                transition={{ duration: 0.75, delay: 0.12 + index * 0.08 }}
              />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function ProcessComparison({ manual, automated, reducedMotion }) {
  const [selected, setSelected] = useState('automated')
  const views = { manual, automated }
  const current = views[selected]

  return (
    <section className="proposal-comparison" aria-labelledby="proposal-comparison-title">
      <div className="proposal-visual-heading">
        <span><CircleGauge size={15} /> Current Process vs Proposed Process</span>
        <h3 id="proposal-comparison-title">{current.title}</h3>
      </div>
      <div className="proposal-comparison-switch" role="tablist" aria-label="Compare proposal processes">
        {[
          ['manual', 'Current Process: Manual'],
          ['automated', 'Proposed Process: OptiFlow'],
        ].map(([id, label]) => (
          <button
            type="button"
            role="tab"
            key={id}
            aria-selected={selected === id}
            className={selected === id ? 'is-active' : ''}
            onClick={() => setSelected(id)}
          >
            <span aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          className={`proposal-comparison-scene is-${selected}`}
          initial={reducedMotion ? false : { opacity: 0, x: selected === 'manual' ? -14 : 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="proposal-comparison-orb" aria-hidden="true"><Sparkles size={18} /></div>
          <div>
            <span className="proposal-metric-index">{selected === 'manual' ? '01' : '02'}</span>
            {current.paragraphs.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

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
  isChatOpen,
  onToggleChat,
  chatToggleRef,
  onExit,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [fullScreenDiagram, setFullScreenDiagram] = useState(false)
  const [activePath, setActivePath] = useState('all')
  const [isReadingMode, setIsReadingMode] = useState(false)
  const experienceRef = useRef(null)
  const contentScrollRef = useRef(null)
  const contentRef = useRef(null)
  const preserveReadingModeRef = useRef(false)
  const preserveReadingModeUntilRef = useRef(0)
  const shouldReduceMotion = useReducedMotion()

  const section = proposal.sections[activeIndex]
  const progress = Math.round(((activeIndex + 1) / proposal.sections.length) * 100)
  const presentationData = useMemo(
    () => proposal.sections.map((entry) => readPresentationData(entry.html)),
    [proposal.sections],
  )
  const sectionPresentation = presentationData[activeIndex]

  const selectSection = (index) => {
    preserveReadingModeRef.current = isReadingMode
    preserveReadingModeUntilRef.current = isReadingMode ? Date.now() + 500 : 0
    if (document.activeElement?.closest('.proposal-section-footer')) {
      document.activeElement.blur()
    }
    const resetScroll = () => {
      experienceRef.current?.scrollTo({ top: 0, behavior: 'auto' })
      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    }
    resetScroll()
    setCompleted((current) => new Set([...current, section.id]))
    setActiveIndex(index)
    setNavigationOpen(false)
    setZoom(1)
    setActivePath('all')
    window.requestAnimationFrame(resetScroll)
    window.setTimeout(resetScroll, 0)
  }

  useEffect(() => {
    if (!requestedSection) return
    const index = proposal.sections.findIndex((entry) => entry.id === requestedSection)
    if (index >= 0) selectSection(index)
  // selectSection intentionally tracks the current section for completion.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedSection])

  useEffect(() => {
    const scroller = contentScrollRef.current
    if (!scroller) return undefined

    const wideLayout = window.matchMedia('(min-width: 901px)')
    let animationFrame = 0
    const updateReadingMode = () => {
      animationFrame = 0
      if (!wideLayout.matches) preserveReadingModeRef.current = false
      if (preserveReadingModeRef.current) {
        if (Date.now() < preserveReadingModeUntilRef.current) {
          setIsReadingMode(true)
          return
        }
        if (scroller.scrollTop > READING_MODE_SCROLL_THRESHOLD) {
          preserveReadingModeRef.current = false
        } else {
          setIsReadingMode(true)
          return
        }
      }
      const nextReadingMode =
        wideLayout.matches && scroller.scrollTop > READING_MODE_SCROLL_THRESHOLD
      setIsReadingMode((current) =>
        current === nextReadingMode ? current : nextReadingMode,
      )
    }
    const scheduleUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateReadingMode)
      }
    }

    scroller.addEventListener('scroll', scheduleUpdate, { passive: true })
    wideLayout.addEventListener('change', scheduleUpdate)
    updateReadingMode()

    return () => {
      scroller.removeEventListener('scroll', scheduleUpdate)
      wideLayout.removeEventListener('change', scheduleUpdate)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  useEffect(() => {
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex,nofollow,noarchive'
    document.head.appendChild(robots)
    return () => robots.remove()
  }, [])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    content.querySelectorAll('svg').forEach((diagram) => {
      diagram.setAttribute('role', 'img')
      diagram.setAttribute('aria-label', `${section.navigationLabel} diagram`)
    })

    content.querySelectorAll('.filter-btn').forEach((button) => {
      const path = PATH_BY_LABEL[normaliseText(button.textContent)]
      const isActive = path === activePath
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-pressed', String(isActive))
    })
    content.querySelectorAll('.flow-element').forEach((element) => {
      element.classList.toggle(
        'dimmed',
        activePath !== 'all' && !element.classList.contains(activePath),
      )
    })
  }, [activeIndex, activePath, section.navigationLabel])

  useEffect(() => {
    if (!fullScreenDiagram) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFullScreenDiagram(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [fullScreenDiagram])

  const contentStyle = useMemo(
    () => ({ transform: `scale(${zoom})`, transformOrigin: 'top center' }),
    [zoom],
  )

  const handleApprovedContentClick = (event) => {
    const filterButton = event.target.closest('.filter-btn')
    if (!filterButton || !contentRef.current?.contains(filterButton)) return
    const path = PATH_BY_LABEL[normaliseText(filterButton.textContent)]
    if (path) setActivePath(path)
  }

  return (
    <main
      ref={experienceRef}
      className={`proposal-experience ${isReadingMode ? 'is-reading-mode' : ''}`}
      data-reading-mode={isReadingMode ? 'active' : 'normal'}
    >
      <div className="proposal-ambient proposal-ambient-one" aria-hidden="true" />
      <div className="proposal-ambient proposal-ambient-two" aria-hidden="true" />
      <header className="proposal-experience-header">
        <div className="proposal-header-identity">
          <span className="proposal-private-indicator"><span /> Private proposal</span>
          <div className="proposal-title-lockup">
            <div>
              <small>Client</small>
              <h1>{proposal.title}</h1>
            </div>
            <span aria-hidden="true" />
            <div>
              <small>Proposal</small>
              <p>{proposal.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="proposal-header-actions">
          <button
            type="button"
            ref={chatToggleRef}
            onClick={onToggleChat}
            aria-expanded={isChatOpen}
            aria-controls="dekode-chat"
          >
            <MessageCircle size={17} /> {isChatOpen ? 'Close chat' : 'Ask proposal'}
          </button>
          <button type="button" onClick={onExit}><LogOut size={17} /> Exit proposal</button>
        </div>
      </header>

      <div className="proposal-progress-shell">
        <div className="proposal-progress-row" aria-label={`Proposal progress: ${progress}%`}>
          <div className="proposal-progress-copy">
            <span>Section {activeIndex + 1} of {proposal.sections.length}</span>
            <strong>{progress}% reviewed</strong>
          </div>
          <div className="proposal-progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>

        <button
          type="button"
          className="proposal-mobile-section-picker"
          onClick={() => setNavigationOpen((value) => !value)}
          aria-expanded={navigationOpen}
          aria-controls="proposal-chapter-rail"
        >
          <span><small>Current section</small>{section.navigationLabel}</span><ChevronDown size={18} />
        </button>

        <nav
          id="proposal-chapter-rail"
          className={`proposal-section-navigation ${navigationOpen ? 'is-open' : ''}`}
          aria-label="Proposal sections"
        >
          {proposal.sections.map((entry, index) => (
            <button
              type="button"
              key={entry.id}
              className={[
                index === activeIndex ? 'active' : '',
                completed.has(entry.id) ? 'is-completed' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => selectSection(index)}
              aria-current={index === activeIndex ? 'step' : undefined}
              aria-label={`${entry.navigationLabel}, ${
                index === activeIndex
                  ? 'current section'
                  : completed.has(entry.id)
                    ? 'completed'
                    : 'upcoming'
              }`}
            >
              <span className="proposal-chapter-number">
                {completed.has(entry.id) ? <Check size={13} /> : index + 1}
              </span>
              <span className="proposal-chapter-copy">
                <strong>{entry.navigationLabel}</strong>
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="proposal-workspace">
        <section
          ref={contentScrollRef}
          className="proposal-content-scroll"
          aria-labelledby="proposal-current-section"
        >
          <div className="proposal-content-toolbar">
            <div>
              <h2 id="proposal-current-section">{section.navigationLabel}</h2>
            </div>
            <div aria-label="Content zoom">
              <button type="button" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))} aria-label="Zoom out"><Minus size={16} /></button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.5, value + 0.1))} aria-label="Zoom in"><Plus size={16} /></button>
              <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom to fit"><RotateCcw size={15} /></button>
              {section.id === 'logic' && (
                <button type="button" onClick={() => setFullScreenDiagram(true)} aria-label="Open diagram full screen"><Maximize2 size={16} /></button>
              )}
            </div>
          </div>
          <div className="proposal-section-announcement" aria-live="polite">
            Now viewing {section.navigationLabel}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={section.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {section.id === 'manual' && (
                <ProposalImpactVisual data={sectionPresentation} reducedMotion={shouldReduceMotion} />
              )}
              {section.id === 'automated' && (
                <ProcessComparison
                  manual={presentationData[0]}
                  automated={presentationData[1]}
                  reducedMotion={shouldReduceMotion}
                />
              )}
              <article
                ref={contentRef}
                className={`proposal-approved-content proposal-approved-${section.id}`}
                style={contentStyle}
                onClick={handleApprovedContentClick}
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </motion.div>
          </AnimatePresence>

          <footer className="proposal-section-footer">
            <button type="button" onClick={() => selectSection(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>
              <ArrowLeft size={17} /> Previous
            </button>
            <button type="button" className="proposal-next-button" onClick={() => selectSection(Math.min(proposal.sections.length - 1, activeIndex + 1))} disabled={activeIndex === proposal.sections.length - 1}>
              Next section <ArrowRight size={17} />
            </button>
            <div className="proposal-version">
              <span>Version {proposal.proposalVersion}</span>
              <span>Approved {proposal.approvedAt}</span>
            </div>
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
