import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CircleStop, Keyboard, Mic, MicOff, PhoneOff, RotateCcw, Send, Trash2,
  Volume2, VolumeX, X, CalendarDays, ShieldCheck,
} from 'lucide-react';
import VoiceOrb from './VoiceOrb.jsx';
import VoiceLeadReviewForm from './VoiceLeadReviewForm.jsx';
import { BrowserSpeechToTextProvider } from '../../voice/providers/browserSpeechToTextProvider.js';
import { BrowserTextToSpeechProvider } from '../../voice/providers/browserTextToSpeechProvider.js';
import { KnowledgeConversationProvider } from '../../voice/realtimeConversationProvider.js';
import { emptyLeadProfile } from '../../voice/leadQualificationManager.js';
import { MockMeetingSlotProvider } from '../../meetings/mockMeetingSlotProvider.js';
import { generateLeadForm } from '../../leads/leadFormGenerator.js';
import { LeadNotificationService } from '../../leads/leadNotificationService.js';
import { voiceConfig } from '../../voice/config.js';
import { trackVoiceEvent } from '../../voice/analytics.js';
import { VOICE_STATES } from '../../voice/voiceSessionController.js';
import './voice.css';

const stateLabels = {
  requesting_permission: 'Microphone permission',
  listening: 'Listening',
  processing: 'Thinking',
  speaking: 'Speaking',
  selecting_slot: 'Choose a preferred time',
  reviewing_submission: 'Review your enquiry',
  submitting: 'Preparing your request',
  completed: 'Request prepared',
  ended: 'Conversation ended',
  error: 'Voice unavailable',
};

export default function DekodeVoiceSession({ onClose, onSwitchToText, onTurn, onPanelChange }) {
  const [state, setState] = useState(VOICE_STATES.REQUESTING_PERMISSION);
  const [transcript, setTranscript] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [fallbackInput, setFallbackInput] = useState('');
  const [error, setError] = useState('');
  const [micMuted, setMicMuted] = useState(false);
  const [outputMuted, setOutputMuted] = useState(false);
  const [leadProfile, setLeadProfile] = useState(emptyLeadProfile);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [leadForm, setLeadForm] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const sessionRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const stateRef = useRef(state);
  const leadRef = useRef(leadProfile);
  const stt = useMemo(() => new BrowserSpeechToTextProvider(), []);
  const tts = useMemo(() => new BrowserTextToSpeechProvider(), []);
  const conversation = useMemo(() => new KnowledgeConversationProvider(), []);
  const meetings = useMemo(() => new MockMeetingSlotProvider({ companyTimezone: voiceConfig.companyTimezone }), []);
  const notification = useMemo(() => new LeadNotificationService({ mode: voiceConfig.notificationMode, endpoint: voiceConfig.leadEndpoint }), []);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { leadRef.current = leadProfile; }, [leadProfile]);
  useEffect(() => () => { stt.stop(); tts.stop(); }, [stt, tts]);
  useEffect(() => { trackVoiceEvent('dekode_voice_opened', { provider: voiceConfig.provider }); }, []);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = sessionRef.current;
    dialog?.querySelector('button, input, textarea')?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  const beginListening = useCallback(() => {
    tts.stop();
    if (micMuted || !stt.isSupported()) {
      setState(VOICE_STATES.LISTENING);
      return;
    }
    setLiveTranscript('');
    setState(VOICE_STATES.LISTENING);
    try {
      stt.start({
        onInterim: setLiveTranscript,
        onFinal: (text) => processTurnRef.current?.(text),
        onError: (nextError) => {
          if (nextError.message.includes('no-speech')) return;
          setError('Voice input paused. You can continue by typing below.');
          trackVoiceEvent('voice_error', { reason: 'speech_recognition' });
        },
      });
    } catch {
      setError('Voice input is unavailable in this browser, but you can continue using text.');
    }
  }, [micMuted, stt, tts]);

  const speak = useCallback((text, after = beginListening) => {
    setState(VOICE_STATES.SPEAKING);
    tts.speak(text, {
      muted: outputMuted,
      onEnd: after,
      onError: () => {
        setError('Audio playback is unavailable. The response is shown as text.');
        after();
      },
    });
  }, [beginListening, outputMuted, tts]);

  const processTurn = useCallback(async (text) => {
    const clean = text.trim();
    if (!clean || stateRef.current === VOICE_STATES.PROCESSING) return;
    stt.stop();
    setLiveTranscript('');
    setTranscript((items) => [...items, { sender: 'user', text: clean }]);
    setState(VOICE_STATES.PROCESSING);
    setError('');
    try {
      const response = await conversation.respond(clean, { leadProfile: leadRef.current });
      setLeadProfile(response.leadProfile);
      setTranscript((items) => [...items, { sender: 'assistant', text: response.text }]);
      onPanelChange?.(response);
      onTurn?.({ userText: clean, assistantText: response.text, response });
      trackVoiceEvent('voice_question_completed', { topic: response.topic });
      if (response.action === 'offer_meeting' && voiceConfig.mockMeetingSlotsEnabled) {
        trackVoiceEvent('meeting_offer_shown');
        const nextSlots = await meetings.getAvailableSlots();
        setSlots(nextSlots);
        speak(response.text, () => setState(VOICE_STATES.SELECTING_SLOT));
      } else {
        speak(response.text);
      }
    } catch {
      setError('I could not complete that response. You can retry or continue in text.');
      setState(VOICE_STATES.ERROR);
      trackVoiceEvent('voice_error', { reason: 'conversation' });
    }
  }, [conversation, meetings, onPanelChange, onTurn, speak, stt]);
  const processTurnRef = useRef(processTurn);
  useEffect(() => { processTurnRef.current = processTurn; }, [processTurn]);

  const grantPermission = async () => {
    try {
      await stt.requestPermission();
      trackVoiceEvent('microphone_permission_granted');
      trackVoiceEvent('voice_session_started');
      const opening = conversation.getOpening();
      setTranscript([{ sender: 'assistant', text: opening }]);
      onPanelChange?.({ topic: 'company', panel: 'overview', text: opening });
      speak(opening);
    } catch {
      trackVoiceEvent('microphone_permission_denied');
      setError('Microphone access was not granted. You can continue the same conversation by typing.');
      setState(VOICE_STATES.LISTENING);
    }
  };

  const submitFallback = (event) => {
    event.preventDefault();
    if (!fallbackInput.trim()) return;
    const value = fallbackInput;
    setFallbackInput('');
    processTurn(value);
  };

  const interrupt = () => {
    tts.stop();
    setState(VOICE_STATES.INTERRUPTED);
    trackVoiceEvent('voice_interrupted');
    beginListening();
  };

  const endSession = () => {
    stt.stop();
    tts.stop();
    setState(VOICE_STATES.ENDED);
    trackVoiceEvent('voice_session_ended');
  };

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
    setLeadForm(generateLeadForm(leadProfile, slot));
    setState(VOICE_STATES.REVIEWING_SUBMISSION);
    trackVoiceEvent('meeting_slot_selected');
    trackVoiceEvent('lead_form_generated');
  };

  const openEnquiry = () => {
    setLeadForm(generateLeadForm(leadProfile, selectedSlot));
    setState(VOICE_STATES.REVIEWING_SUBMISSION);
    trackVoiceEvent('lead_form_generated');
  };

  const submitLead = async (form, consent) => {
    setState(VOICE_STATES.SUBMITTING);
    try {
      const result = await notification.submit(form, consent);
      setSubmissionResult(result);
      setState(VOICE_STATES.COMPLETED);
      trackVoiceEvent('lead_form_submitted');
    } catch (nextError) {
      setError(nextError.message);
      setState(VOICE_STATES.REVIEWING_SUBMISSION);
    }
  };

  const switchToText = () => {
    stt.stop();
    tts.stop();
    trackVoiceEvent('voice_switched_to_text');
    onSwitchToText?.(liveTranscript || fallbackInput);
  };

  const restart = () => {
    setTranscript([]);
    setLiveTranscript('');
    setError('');
    setSubmissionResult(null);
    setState(VOICE_STATES.REQUESTING_PERMISSION);
  };

  return (
    <motion.div className="voice-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section
        ref={sessionRef}
        className="voice-session"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-title"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
      >
        <header className="voice-session-header">
          <div>
            <span className="voice-ai-label"><ShieldCheck size={13} /> AI assistant</span>
            <h2 id="voice-title">DEKODE Voice</h2>
          </div>
          <button type="button" className="voice-icon-btn" onClick={onClose} aria-label="Close DEKODE Voice"><X /></button>
        </header>

        {state === VOICE_STATES.REQUESTING_PERMISSION ? (
          <div className="voice-permission">
            <VoiceOrb state={state} />
            <h3>Start a voice conversation</h3>
            <p>DEKODE Voice needs microphone access so you can speak with the assistant. Raw audio is not recorded or permanently stored.</p>
            <button type="button" className="voice-primary-btn" onClick={grantPermission}><Mic size={17} /> Allow microphone</button>
            <button type="button" className="voice-secondary-btn" onClick={() => setState(VOICE_STATES.LISTENING)}><Keyboard size={17} /> Continue with text fallback</button>
          </div>
        ) : state === VOICE_STATES.REVIEWING_SUBMISSION || state === VOICE_STATES.SUBMITTING ? (
          <div className="voice-review">
            <div className="voice-section-heading">
              <div><span>Review before submitting</span><h3>Your DEKODE enquiry</h3></div>
              <p>Every inferred field can be edited.</p>
            </div>
            <VoiceLeadReviewForm initialForm={leadForm} onSubmit={submitLead} onBack={beginListening} isSubmitting={state === VOICE_STATES.SUBMITTING} />
            {error && <div className="voice-error" role="alert">{error}</div>}
          </div>
        ) : state === VOICE_STATES.SELECTING_SLOT ? (
          <div className="voice-slots">
            <VoiceOrb state={state} />
            <h3>Choose a preferred meeting time</h3>
            <p>Times are shown in {slots[0]?.visitorTimezone || 'your local timezone'}. These are temporary options; DEKODE will confirm availability.</p>
            <div className="voice-slot-grid">
              {slots.slice(0, 12).map((slot) => (
                <button key={slot.id} type="button" onClick={() => selectSlot(slot)}>
                  <CalendarDays size={16} /><span>{slot.label}</span>
                </button>
              ))}
            </div>
            <button type="button" className="voice-secondary-btn" onClick={beginListening}>Not now — continue conversation</button>
          </div>
        ) : state === VOICE_STATES.COMPLETED ? (
          <div className="voice-ended">
            <ShieldCheck size={46} />
            <h3>{submissionResult?.delivered ? 'Enquiry submitted' : 'Enquiry prepared in development mode'}</h3>
            <p>{submissionResult?.delivered ? 'The DEKODE team has received your request.' : 'No email or booking was sent. The mock service validated and prepared the request safely.'}</p>
            <button type="button" className="voice-primary-btn" onClick={onClose}>Return to chat</button>
          </div>
        ) : state === VOICE_STATES.ENDED ? (
          <div className="voice-ended">
            <VoiceOrb state={state} />
            <h3>Conversation ended</h3>
            <p>{leadProfile.projectSummary || 'Your transcript remains available in this session until you close it.'}</p>
            <div className="voice-ended-actions">
              <button type="button" className="voice-primary-btn" onClick={restart}><RotateCcw size={16} /> Restart voice</button>
              <button type="button" className="voice-secondary-btn" onClick={switchToText}><Keyboard size={16} /> Continue in text</button>
              <button type="button" className="voice-secondary-btn" onClick={openEnquiry}><Send size={16} /> Send an enquiry</button>
            </div>
          </div>
        ) : (
          <div className="voice-live">
            <div className="voice-stage">
              <VoiceOrb state={state} />
              <span className={`voice-status voice-status-${state}`} role="status">{stateLabels[state]}</span>
              <p>{state === VOICE_STATES.LISTENING ? (micMuted ? 'Microphone muted — type below.' : 'Speak naturally, or use the text field.') : state === VOICE_STATES.PROCESSING ? 'Using approved DEKODE knowledge…' : 'You can interrupt at any time.'}</p>
            </div>
            <div className="voice-transcript" aria-live="polite">
              {transcript.length === 0 && <p className="voice-transcript-empty">Your conversation transcript will appear here.</p>}
              {transcript.map((item, index) => (
                <div className={`voice-transcript-line voice-transcript-${item.sender}`} key={`${item.sender}-${index}`}>
                  <strong>{item.sender === 'assistant' ? 'DEKODE Voice' : 'You'}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
              {liveTranscript && <div className="voice-transcript-line voice-transcript-live"><strong>You · live</strong><p>{liveTranscript}</p></div>}
            </div>
            {error && <div className="voice-error" role="alert">{error}</div>}
            <form className="voice-fallback-form" onSubmit={submitFallback}>
              <input aria-label="Type a message in voice mode" value={fallbackInput} onChange={(event) => setFallbackInput(event.target.value)} placeholder="Type if voice input is unavailable…" />
              <button type="submit" aria-label="Send typed message" disabled={!fallbackInput.trim() || state === VOICE_STATES.PROCESSING}><Send size={17} /></button>
            </form>
            <div className="voice-controls">
              <button type="button" onClick={() => { setMicMuted((value) => !value); stt.stop(); }} aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}>{micMuted ? <MicOff /> : <Mic />}</button>
              {state === VOICE_STATES.SPEAKING && <button type="button" onClick={interrupt} aria-label="Interrupt assistant"><CircleStop /><span>Interrupt</span></button>}
              <button type="button" onClick={() => { setOutputMuted((value) => !value); if (!outputMuted) tts.stop(); }} aria-label={outputMuted ? 'Unmute voice output' : 'Mute voice output'}>{outputMuted ? <VolumeX /> : <Volume2 />}</button>
              <button type="button" onClick={switchToText} aria-label="Switch to text"><Keyboard /><span>Text</span></button>
              <button type="button" onClick={() => setTranscript([])} aria-label="Clear transcript"><Trash2 /></button>
              <button type="button" className="voice-control-stop" onClick={endSession} aria-label="End voice conversation"><PhoneOff /><span>End</span></button>
            </div>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
