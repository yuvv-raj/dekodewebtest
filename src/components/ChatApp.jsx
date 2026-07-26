import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Calendar, CheckCircle2, Bot, Mic, ChevronDown } from 'lucide-react';
import AnimationPanel from './AnimationPanel';
import CompanyKnowledgePanel from './CompanyKnowledgePanel';
import ParticleBackground from './ParticleBackground';
import TypewriterText from './TypewriterText';
import DekodeVoiceSession from './voice/DekodeVoiceSession';
import { voiceConfig } from '../voice/config';
import { BrowserSpeechToTextProvider } from '../voice/providers/browserSpeechToTextProvider';
import { placeholderInterval, placeholderMessages } from './chatComposerConfig';
import { extractDomain, detectTone, extractTag, getTypingDelay, generateAudienceResponse, generateTimelineResponse, isTooVague, detectPlatform, generateCustomPlatformQuestion, generateCustomComplexityQuestion } from '../utils/chatIntelligence';
import {
  classifyCompanyIntent,
  createCompanyConversationContext,
  generateCompanyResponse,
  leaveCompanyConversation,
  rememberCompanyTurn,
} from '../knowledge';

const PROJECT_OPTIONS = [
  'Mobile App',
  'Web Application',
  'AI Agent',
  'Cloud Infrastructure',
  'E-commerce Platform',
];

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState('');
  
  // States: 'centered' (hero), 'active' (chatting)
  const [step, setStep] = useState('centered'); 
  const [projectType, setProjectType] = useState(null);
  const [gatheredTags, setGatheredTags] = useState([]);
  const [chatContext, setChatContext] = useState({ projectType: null, domain: null, tone: 'neutral' });
  const [companyPanel, setCompanyPanel] = useState(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVisualPanelExpanded, setIsVisualPanelExpanded] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.matchMedia('(max-width: 1180px)').matches);
  
  const scrollRef = useRef(null);
  const companyContextRef = useRef(createCompanyConversationContext());
  const speechProviderRef = useRef(null);
  const committedTranscriptRef = useRef('');
  const voiceStatusTimerRef = useRef(null);

  useEffect(() => {
    speechProviderRef.current = new BrowserSpeechToTextProvider();
    return () => {
      speechProviderRef.current?.stop();
      if (voiceStatusTimerRef.current) clearTimeout(voiceStatusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (isInputFocused || inputValue || reduceMotion.matches) return undefined;

    const intervalId = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % placeholderMessages.length);
    }, placeholderInterval);

    return () => window.clearInterval(intervalId);
  }, [isInputFocused, inputValue]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, step, isListening]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1180px)');
    const updateLayoutMode = (event) => setIsCompactLayout(event.matches);
    media.addEventListener('change', updateLayoutMode);
    return () => media.removeEventListener('change', updateLayoutMode);
  }, []);

  useEffect(() => {
    const constrainedHeight = window.matchMedia('(max-height: 640px)');
    const collapseForKeyboardOrLandscape = (event) => {
      if (event.matches) setIsVisualPanelExpanded(false);
    };
    collapseForKeyboardOrLandscape(constrainedHeight);
    constrainedHeight.addEventListener('change', collapseForKeyboardOrLandscape);
    return () => constrainedHeight.removeEventListener('change', collapseForKeyboardOrLandscape);
  }, []);

  const simulateAiTyping = (text, metadata = {}) => {
    setIsTyping(true);
    const delay = getTypingDelay(text);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now(), sender: 'ai', text, ...metadata }]);
    }, delay);
  };

  const startConversation = (initialMessage, preserveHistory = false) => {
    const userEntry = { id: Date.now(), sender: 'user', text: initialMessage };
    setMessages((prev) => preserveHistory ? [...prev, userEntry] : [userEntry]);
    setCompanyPanel(null);
    companyContextRef.current = leaveCompanyConversation(companyContextRef.current);
    
    const matchedOption = PROJECT_OPTIONS.find(opt => opt === initialMessage || initialMessage.includes(opt));
    const finalProjectType = matchedOption || 'Custom Project';
    
    setProjectType(finalProjectType);
    setGatheredTags([finalProjectType]);
    setChatContext(prev => ({ ...prev, projectType: finalProjectType }));
    
    if (finalProjectType === 'Custom Project') {
      setStep('custom_discovery_problem');
      if (isTooVague(initialMessage)) {
        simulateAiTyping("That sounds interesting! Could you describe it in a bit more detail? What's the core problem you're trying to solve?");
      } else {
        const prefix = initialMessage.split(' ').slice(0, 4).join(' ');
        simulateAiTyping(`A ${prefix}... that sounds unique! To help us plan the right architecture, what is the core problem this project solves?`);
      }
      return;
    }
    
    setStep('gathering_audience');
    
    const cleanName = finalProjectType.replace(/[^a-zA-Z ]/g, '').trim();
    let initialQuestion = `Awesome, a ${finalProjectType.toLowerCase()} sounds exciting! Who is the primary audience or user base for this project?`;
    if (finalProjectType.includes('AI')) {
      initialQuestion = "Awesome, an AI Agent sounds exciting! What specific tasks or workflows do you want this agent to automate for you?";
    } else if (finalProjectType.includes('E-commerce')) {
      initialQuestion = "Awesome, an E-commerce Platform sounds exciting! What kind of products will you be selling, and who is your target market?";
    }
    
    simulateAiTyping(initialQuestion);
  };

  const handleOptionSelect = (option) => {
    startConversation(option);
  };

  const handleCompanyPrompt = (userMessage) => {
    if (!userMessage.trim() || isTyping) return;

    const intent = classifyCompanyIntent(userMessage, companyContextRef.current);
    const response = generateCompanyResponse(userMessage, {
      ...intent,
      isCompanyRelated: true,
      topic: intent.topic || companyContextRef.current.lastTopic || 'company',
    });

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);
    if (step === 'centered') setStep('company');
    companyContextRef.current = rememberCompanyTurn(companyContextRef.current, response.topic);
    setCompanyPanel(response);
    simulateAiTyping(response.text, {
      companyTopic: response.topic,
      suggestions: response.suggestions,
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (step === 'scheduling' || step === 'done' || isTyping) return;
    if (isListening) {
      speechProviderRef.current?.stop();
      setIsListening(false);
      setVoiceStatus('');
    }

    // Trigger send pulse animation
    setIsSending(true);
    setTimeout(() => setIsSending(false), 300);

    const userMessage = inputValue;
    setInputValue('');

    const companyIntent = classifyCompanyIntent(userMessage, companyContextRef.current);
    if (companyIntent.isCompanyRelated) {
      handleCompanyPrompt(userMessage);
      return;
    }

    if (step === 'centered') {
      startConversation(userMessage);
      return;
    }

    if (step === 'company') {
      startConversation(userMessage, true);
      return;
    }

    setCompanyPanel(null);
    companyContextRef.current = leaveCompanyConversation(companyContextRef.current);
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userMessage }]);

    // Custom Project Flow
    if (step === 'custom_discovery_problem') {
      setChatContext(prev => ({ ...prev, coreProblem: userMessage }));
      setStep('custom_discovery_platform');
      simulateAiTyping(generateCustomPlatformQuestion(userMessage));
      setGatheredTags(prev => [...prev, extractTag(userMessage, 'Problem Defined')]);
      return;
    } else if (step === 'custom_discovery_platform') {
      const platform = detectPlatform(userMessage);
      setChatContext(prev => ({ ...prev, platform }));
      setStep('custom_discovery_complexity');
      simulateAiTyping(generateCustomComplexityQuestion(userMessage, { ...chatContext, platform }));
      setGatheredTags(prev => [...prev, extractTag(userMessage, 'Platform Defined')]);
      return;
    } else if (step === 'custom_discovery_complexity') {
      setStep('gathering_timeline');
      simulateAiTyping("This is taking shape nicely. Last question — do you have a target timeline or launch deadline in mind for this?");
      setGatheredTags(prev => [...prev, extractTag(userMessage, 'Scope Defined')]);
      return;
    }

    // Standard State machine for gathering requirements
    if (step === 'gathering_audience') {
      setStep('gathering_features');
      
      const domain = extractDomain(userMessage);
      const tone = detectTone(userMessage);
      const newContext = { ...chatContext, domain: domain || chatContext.domain, tone };
      setChatContext(newContext);
      
      const nextQuestion = generateAudienceResponse(userMessage, newContext);
      const tagText = extractTag(userMessage, 'Audience Defined');
      
      setGatheredTags(prev => [...prev, tagText]);
      simulateAiTyping(nextQuestion);
    } else if (step === 'gathering_features') {
      setStep('gathering_timeline');
      
      let nextQuestion = "Perfect. And do you have a specific timeline or deadline in mind for launching this?";
      let defaultTag = 'Core Features';
      if (projectType.includes('AI')) {
        nextQuestion = "Perfect. What's your ideal timeline for getting a prototype of this agent up and running?";
        defaultTag = 'Tools Integrated';
      } else if (projectType.includes('E-commerce')) {
        nextQuestion = "Perfect. When are you aiming to launch your store?";
        defaultTag = 'Store Features';
      }
      
      const tagText = extractTag(userMessage, defaultTag);
      
      setGatheredTags(prev => [...prev, tagText]);
      simulateAiTyping(nextQuestion);
    } else if (step === 'gathering_timeline') {
      setStep('scheduling');
      
      const tagText = extractTag(userMessage, 'Timeline Set');
      const nextQuestion = generateTimelineResponse(userMessage, chatContext);
      
      setGatheredTags(prev => [...prev, tagText]);
      simulateAiTyping(nextQuestion);
    }
  };

  const handleScheduleTime = (time) => {
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: `I'm available on ${time}` }]);
    setStep('done');
    simulateAiTyping("Perfect! Your request has been securely sent to our team. We've booked that slot on our calendar and sent a confirmation email to you. We look forward to speaking with you!");
  };

  const showVoiceStatus = (message, persist = false) => {
    if (voiceStatusTimerRef.current) clearTimeout(voiceStatusTimerRef.current);
    setVoiceStatus(message);
    if (!persist) {
      voiceStatusTimerRef.current = window.setTimeout(() => setVoiceStatus(''), 5000);
    }
  };

  const formatRecognitionError = (error) => {
    const code = String(error?.message || error || '').toLowerCase();
    if (code.includes('not-allowed') || code.includes('permission') || code.includes('denied')) {
      return 'Microphone permission was denied. You can keep typing instead.';
    }
    if (code.includes('audio-capture') || code.includes('unavailable') || code.includes('notfound')) {
      return 'No microphone is available. You can keep typing instead.';
    }
    if (code.includes('no-speech')) {
      return 'No speech was detected. Try again or keep typing.';
    }
    if (code.includes('aborted')) {
      return 'Voice typing was cancelled.';
    }
    if (code.includes('network')) {
      return 'Voice recognition timed out. Try again or keep typing.';
    }
    return 'Voice typing stopped unexpectedly. You can keep typing instead.';
  };

  const handleSpeech = async () => {
    const provider = speechProviderRef.current;
    if (!provider?.isSupported()) {
      showVoiceStatus('Voice typing is not supported in this browser.');
      return;
    }

    if (isListening) {
      provider.stop();
      setIsListening(false);
      showVoiceStatus('Voice typing stopped.');
      return;
    }

    showVoiceStatus('Requesting microphone access…', true);
    try {
      await provider.requestPermission();
      committedTranscriptRef.current = inputValue.trim();
      provider.start({
        onInterim: (transcript) => {
          const prefix = committedTranscriptRef.current;
          setInputValue(prefix ? `${prefix} ${transcript}` : transcript);
        },
        onFinal: (transcript) => {
          const prefix = committedTranscriptRef.current;
          const nextValue = prefix ? `${prefix} ${transcript}` : transcript;
          committedTranscriptRef.current = nextValue;
          setInputValue(nextValue);
        },
        onError: (error) => {
          setIsListening(false);
          showVoiceStatus(formatRecognitionError(error));
        },
        onEnd: () => {
          setIsListening(false);
          setVoiceStatus((current) => current === 'Listening…' ? '' : current);
        },
      });
      setIsListening(true);
      showVoiceStatus('Listening…', true);
    } catch (error) {
      setIsListening(false);
      showVoiceStatus(formatRecognitionError(error));
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    if (isListening) committedTranscriptRef.current = event.target.value.trim();
  };

  const renderComposerInput = ({ readOnly = false, autoFocus = false } = {}) => (
    <div className="chat-input-field">
      {!inputValue && !readOnly && (
        <span key={placeholderMessages[placeholderIndex]} className="rotating-placeholder" aria-hidden="true">
          {placeholderMessages[placeholderIndex]}
        </span>
      )}
      <textarea
        rows="1"
        className="chat-input"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleComposerKeyDown}
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-label="Message"
      />
    </div>
  );

  const renderVoiceTypingButton = (disabled = false) => (
    <button
      type="button"
      onClick={handleSpeech}
      className={`chat-mic-btn ${isListening ? 'is-listening' : ''}`}
      aria-label={isListening ? 'Stop voice typing' : 'Start voice typing'}
      aria-pressed={isListening}
      disabled={disabled}
      title={isListening ? 'Stop voice typing' : 'Start voice typing'}
    >
      <Mic size={19} />
    </button>
  );

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const handleVoiceTurn = ({ userText, assistantText, response }) => {
    const turnId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: turnId, sender: 'user', text: userText, source: 'voice' },
      { id: turnId + 1, sender: 'ai', text: assistantText, source: 'voice' },
    ]);
    if (step === 'centered') setStep('company');
    setCompanyPanel(response);
    companyContextRef.current = rememberCompanyTurn(companyContextRef.current, response.topic || 'company');
  };

  const handleVoiceSwitchToText = (draft = '') => {
    setIsVoiceOpen(false);
    setInputValue(draft);
  };

  const getAnimationLevel = () => {
    if (step === 'centered') return 0;
    if (step === 'gathering_audience') return 1;
    if (step === 'gathering_features') return 2;
    if (step === 'gathering_timeline') return 3;
    if (step === 'scheduling' || step === 'done') return 4;
    return 0;
  };

  const renderAnimationCard = (classNameExt = '') => (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, type: 'spring', damping: 20 }}
      className={`floating-animation-panel ${classNameExt} ${isVisualPanelExpanded ? 'visual-panel-expanded' : 'visual-panel-collapsed'}`}
    >
      <div className="anim-header">
        <span className="anim-title">
          <Bot size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> 
          {companyPanel ? 'Company Knowledge' : 'Building Context'}
        </span>
        <div className="anim-header-actions">
          <div className="anim-window-dots" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <button
            type="button"
            className="visual-panel-toggle"
            onClick={() => setIsVisualPanelExpanded((expanded) => !expanded)}
            aria-expanded={isVisualPanelExpanded}
            aria-controls="supporting-visual-content"
            aria-label={isVisualPanelExpanded ? 'Collapse supporting visual' : 'Expand supporting visual'}
          >
            <span>{isVisualPanelExpanded ? 'Collapse' : 'Expand'}</span>
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
      
      {/* Requirement Tags & Progress Bar */}
      <div className="anim-body-container" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {companyPanel ? (
          <motion.div
            key={companyPanel.topic}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="knowledge-topic-label"
          >
            <span className="knowledge-live-dot" />
            {companyPanel.topic === 'why' ? 'Why DEKODE' : companyPanel.topic}
          </motion.div>
        ) : (
          <>
        {/* Progress Tracker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="step-dot" style={{ 
              width: '20px', height: '20px', borderRadius: '50%', 
              background: getAnimationLevel() >= num ? 'var(--color-brand-blue)' : '#0f172a',
              border: `2px solid ${getAnimationLevel() >= num ? 'var(--color-brand-blue)' : 'rgba(255,255,255,0.2)'}`,
              color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
              transition: 'all 0.3s ease'
            }}>
              {num}
            </div>
          ))}
        </div>
        
        {/* Tag Chips */}
        <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <AnimatePresence>
            {gatheredTags.map(tag => (
              <motion.div
                key={tag}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ background: 'rgba(53, 118, 193, 0.3)', border: '1px solid rgba(53, 118, 193, 0.5)', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', color: '#60a5fa' }}
              >
                {tag}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
          </>
        )}
      </div>

      <div
        className="anim-content"
        id="supporting-visual-content"
        aria-hidden={isCompactLayout && !isVisualPanelExpanded}
        inert={isCompactLayout && !isVisualPanelExpanded ? true : undefined}
      >
        <div className="anim-scale-wrapper">
          {companyPanel ? (
            <CompanyKnowledgePanel panel={companyPanel.panel} onSelect={handleCompanyPrompt} />
          ) : (
            <AnimationPanel projectType={projectType} level={getAnimationLevel()} />
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      <div className="vibrant-background" />
      <ParticleBackground />
      <div className="brand-logo">DEKODE</div>
      
      <AnimatePresence mode="wait">
        {step === 'centered' ? (
          <motion.div 
            key="centered"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="centered-layout"
          >
            <h1 className="hero-title">Let's DEKODE Together</h1>
            
            <div className="input-container">
              <form className="chat-input-form" onSubmit={handleSendMessage}>
                {renderComposerInput()}
                {renderVoiceTypingButton()}
                <button
                  type="submit"
                  className={`chat-submit-btn ${isSending ? 'shake-anim' : ''}`}
                  disabled={!inputValue.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className={`composer-status ${voiceStatus ? 'is-visible' : ''}`} role="status" aria-live="polite">
                {voiceStatus}
              </div>
            </div>

            <div className="options-container">
              {PROJECT_OPTIONS.map((opt) => (
                <button key={opt} className="action-pill" onClick={() => handleOptionSelect(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="active-chat-layout"
          >
            <div className="chat-section">
              <div className="chat-scroll-area" ref={scrollRef}>
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 250, damping: 20 }}
                      className={`message-row ${msg.sender === 'ai' ? 'message-ai' : 'message-user'}`}
                    >
                      <div className="message-bubble">
                        {msg.sender === 'ai' ? (
                          idx === messages.length - 1 ? (
                            <TypewriterText text={msg.text} delay={30} />
                          ) : (
                            msg.text
                          )
                        ) : (
                          msg.text
                        )}
                        {msg.sender === 'ai' && msg.suggestions?.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="company-suggestion-chips"
                          >
                            {msg.suggestions.map((suggestion) => (
                              <button
                                key={suggestion.label}
                                type="button"
                                onClick={() => handleCompanyPrompt(suggestion.prompt)}
                                disabled={isTyping}
                              >
                                {suggestion.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="message-row message-ai"
                  >
                    <div className="message-bubble" style={{ display: 'flex', gap: '6px', padding: '1.25rem' }}>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="browser-dot" style={{background: 'rgba(255,255,255,0.5)'}}></motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="browser-dot" style={{background: 'rgba(255,255,255,0.5)'}}></motion.span>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="browser-dot" style={{background: 'rgba(255,255,255,0.5)'}}></motion.span>
                    </div>
                  </motion.div>
                )}

                {step === 'scheduling' && !isTyping && (
                  <motion.div className="schedule-card-wrapper" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white', fontWeight: 600 }}>
                        <Calendar size={20} /> Select a Discovery Call Time
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Tomorrow, 10:00 AM', 'Tomorrow, 2:00 PM', 'Next Monday, 11:30 AM'].map(time => (
                          <button key={time} className="action-pill" style={{ background: 'rgba(255,255,255,0.15)' }} onClick={() => handleScheduleTime(time)}>{time}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'done' && !isTyping && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <CheckCircle2 size={48} style={{ margin: '0 auto 1rem', color: '#22c55e' }} />
                    <h3 style={{ color: 'white' }}>Request Submitted!</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>We'll talk to you soon.</p>
                  </motion.div>
                )}
              </div>

              <div className="chat-input-wrapper">
                <div className="input-container active-mode">
                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    {renderComposerInput({ readOnly: step === 'scheduling' || step === 'done' })}
                    {renderVoiceTypingButton(step === 'scheduling' || step === 'done')}
                    <button
                      type="submit"
                      className={`chat-submit-btn ${isSending ? 'shake-anim' : ''}`}
                      disabled={!inputValue.trim() || step === 'scheduling' || step === 'done' || isTyping}
                      aria-label="Send message"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                  <div className={`composer-status ${voiceStatus ? 'is-visible' : ''}`} role="status" aria-live="polite">
                    {voiceStatus}
                  </div>
                </div>
              </div>
            </div>
            
            {renderAnimationCard('responsive-visual-panel')}

          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {voiceConfig.enabled && isVoiceOpen && (
          <DekodeVoiceSession
            onClose={() => setIsVoiceOpen(false)}
            onSwitchToText={handleVoiceSwitchToText}
            onTurn={handleVoiceTurn}
            onPanelChange={setCompanyPanel}
          />
        )}
      </AnimatePresence>
    </>
  );
}
