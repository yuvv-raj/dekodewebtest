import React, { lazy, Suspense, useState } from 'react'
import ChatApp from './components/ChatApp'
import ProposalAccessGateway from './proposals/ProposalAccessGateway'
import ProposalExperience from './proposals/ProposalExperience'
import './proposals/proposal.css'

const InteractiveContentSections = lazy(
  () => import('./components/InteractiveContentSections'),
)

export const INTERACTIVE_CONTENT_SECTIONS_ENABLED =
  import.meta.env.VITE_INTERACTIVE_CONTENT_SECTIONS_ENABLED !== 'false'
export const CLIENT_PROPOSALS_ENABLED =
  import.meta.env.VITE_CLIENT_PROPOSALS_ENABLED !== 'false'
function App() {
  const [showProposalAccess, setShowProposalAccess] = useState(
    () => CLIENT_PROPOSALS_ENABLED && window.location.pathname.startsWith('/proposals/'),
  )
  const [proposal, setProposal] = useState(null)

  const activateProposal = async (accessResult) => {
    const response = await fetch('/api/proposals/content', {
      credentials: 'same-origin',
      cache: 'no-store',
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Proposal access is required.')
    setProposal(result.proposal)
    setShowProposalAccess(false)
    window.history.replaceState({}, '', accessResult.route)
  }

  const exitProposal = async () => {
    await fetch('/api/proposals/logout', { method: 'POST', credentials: 'same-origin' })
    setProposal(null)
    window.history.replaceState({}, '', '/')
  }

  return (
    <div
      className={`app-container ${INTERACTIVE_CONTENT_SECTIONS_ENABLED && !proposal ? 'interactive-content-enabled' : ''} ${proposal ? 'proposal-mode' : ''}`}
    >
      <div className="chat-viewport" id="dekode-chat">
        <ChatApp
          onOpenProposalAccess={() => setShowProposalAccess(true)}
          onExitProposal={exitProposal}
        />
      </div>
      {proposal && (
        <ProposalExperience
          proposal={proposal}
          onExit={exitProposal}
        />
      )}
      {INTERACTIVE_CONTENT_SECTIONS_ENABLED && !proposal && (
        <Suspense fallback={<div className="interactive-section-placeholder" aria-hidden="true" />}>
          <InteractiveContentSections />
        </Suspense>
      )}
      {CLIENT_PROPOSALS_ENABLED && showProposalAccess && !proposal && (
        <ProposalAccessGateway
          onClose={() => setShowProposalAccess(false)}
          onAccess={activateProposal}
        />
      )}
    </div>
  )
}

export default App
