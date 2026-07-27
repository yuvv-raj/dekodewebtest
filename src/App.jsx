import React, { lazy, Suspense } from 'react'
import ChatApp from './components/ChatApp'

const InteractiveContentSections = lazy(
  () => import('./components/InteractiveContentSections'),
)

export const INTERACTIVE_CONTENT_SECTIONS_ENABLED =
  import.meta.env.VITE_INTERACTIVE_CONTENT_SECTIONS_ENABLED !== 'false'

function App() {
  return (
    <div
      className={`app-container ${INTERACTIVE_CONTENT_SECTIONS_ENABLED ? 'interactive-content-enabled' : ''}`}
    >
      <div className="chat-viewport" id="dekode-chat">
        <ChatApp />
      </div>
      {INTERACTIVE_CONTENT_SECTIONS_ENABLED && (
        <Suspense fallback={<div className="interactive-section-placeholder" aria-hidden="true" />}>
          <InteractiveContentSections />
        </Suspense>
      )}
    </div>
  )
}

export default App
