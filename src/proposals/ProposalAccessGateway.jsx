import React, { useState } from 'react'
import { LockKeyhole, X } from 'lucide-react'

export default function ProposalAccessGateway({ onClose, onAccess }) {
  const [accessCode, setAccessCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!accessCode.trim() || !password) return
    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/proposals/access', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ accessCode, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      await onAccess(result)
    } catch (accessError) {
      setError(
        accessError.message ||
          'We could not verify these access details. Please check them or contact the DEKODE team.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="proposal-access-backdrop" role="presentation">
      <section
        className="proposal-access-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-access-title"
      >
        <button
          type="button"
          className="proposal-close-button"
          onClick={onClose}
          aria-label="Close proposal access"
        >
          <X size={18} />
        </button>
        <span className="proposal-lock-mark" aria-hidden="true">
          <LockKeyhole size={20} />
        </span>
        <p className="proposal-eyebrow">Private client area</p>
        <h2 id="proposal-access-title">Access your DEKODE proposal</h2>
        <p className="proposal-access-copy">
          Enter the access details provided by the DEKODE team.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="proposal-access-code">Proposal access code</label>
          <input
            id="proposal-access-code"
            value={accessCode}
            onChange={(event) => {
              setAccessCode(event.target.value)
              setError('')
            }}
            autoComplete="username"
            autoFocus
          />
          <label htmlFor="proposal-password">Password</label>
          <input
            id="proposal-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError('')
            }}
            autoComplete="current-password"
          />
          <div className="proposal-access-error" role="alert" aria-live="polite">
            {error}
          </div>
          <button
            type="submit"
            className="proposal-primary-button"
            disabled={isSubmitting || !accessCode.trim() || !password}
          >
            {isSubmitting ? 'Verifying…' : 'Access proposal'}
          </button>
        </form>
        <button
          type="button"
          className="proposal-contact-link"
          onClick={() => {
            onClose()
            document
              .querySelector('[data-section-id="start-a-conversation"]')
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          Need help? Contact the DEKODE team
        </button>
      </section>
    </div>
  )
}
