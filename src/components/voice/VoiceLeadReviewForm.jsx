import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { validateLeadForm } from '../../leads/leadFormGenerator.js';

const fields = [
  ['name', 'Name', 'text'],
  ['email', 'Email', 'email'],
  ['company', 'Company', 'text'],
  ['projectType', 'Project type', 'text'],
  ['timeline', 'Timeline', 'text'],
  ['budgetRange', 'Budget range (optional)', 'text'],
];

export default function VoiceLeadReviewForm({ initialForm, onSubmit, onBack, isSubmitting }) {
  const [form, setForm] = useState(initialForm);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateLeadForm(form, consent);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form, consent);
  };

  return (
    <form className="voice-review-form" onSubmit={submit}>
      <div className="voice-form-grid">
        {fields.map(([key, label, type]) => (
          <label key={key}>
            <span>{label}{initialForm.inferredFields.includes(key) && <em>Inferred</em>}</span>
            <input type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} />
            {errors[key] && <small role="alert">{errors[key]}</small>}
          </label>
        ))}
      </div>
      <label>
        <span>Interested services{initialForm.inferredFields.includes('recommendedServices') && <em>Inferred</em>}</span>
        <input value={form.interestedServices.join(', ')} onChange={(event) => update('interestedServices', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} />
      </label>
      <label>
        <span>Project summary{initialForm.inferredFields.includes('projectSummary') && <em>Inferred</em>}</span>
        <textarea rows="3" value={form.projectSummary} onChange={(event) => update('projectSummary', event.target.value)} />
        {errors.projectSummary && <small role="alert">{errors.projectSummary}</small>}
      </label>
      {form.preferredMeetingTime && (
        <div className="voice-meeting-preference">
          <strong>Preferred meeting time</strong>
          <span>{form.preferredMeetingTime}</span>
          <small>The DEKODE team will confirm availability.</small>
        </div>
      )}
      <label className="voice-consent-check">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I consent to DEKODE using these details to respond to my enquiry. Nothing is sent until I press Submit.</span>
      </label>
      {errors.consent && <small className="voice-form-error" role="alert">{errors.consent}</small>}
      <div className="voice-form-actions">
        <button type="button" className="voice-secondary-btn" onClick={onBack}><ArrowLeft size={16} /> Return to conversation</button>
        <button type="submit" className="voice-primary-btn" disabled={isSubmitting}><Send size={16} /> {isSubmitting ? 'Preparing…' : 'Submit enquiry'}</button>
      </div>
    </form>
  );
}
