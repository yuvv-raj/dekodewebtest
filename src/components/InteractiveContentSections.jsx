import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Calendar, MessageCircle, Mic, Sparkles } from "lucide-react";
import { interactiveSiteContent as content } from "../content/interactiveSiteContent";
import {
  openDekodeVoice,
  sendContentToChat,
  subscribeToSessionSummary,
} from "../content/ContentToChatBridge";
import "./interactive-content.css";

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

function ChatAction({ section, item, label, intent }) {
  return (
    <button
      type="button"
      className="content-chat-action"
      onClick={() =>
        sendContentToChat({
          sourceSection: section,
          topic: item.title,
          intent,
          displayLabel: label,
          suggestedPrompt: item.chatPrompt,
          metadata: { id: item.id },
        })
      }
    >
      <MessageCircle size={16} aria-hidden="true" />
      {label}
      <ArrowUpRight size={15} aria-hidden="true" />
    </button>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <header className="content-section-heading">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}

export default function InteractiveContentSections() {
  const shouldReduceMotion = useReducedMotion();
  const [activeCapability, setActiveCapability] = useState(content.capabilities[0].id);
  const [activeProject, setActiveProject] = useState(content.selectedWork[0].id);
  const [activeStage, setActiveStage] = useState(content.deliveryProcess[0].id);
  const [activeIndustry, setActiveIndustry] = useState(content.industries[0].id);
  const [sessionSummary, setSessionSummary] = useState("");

  useEffect(() => subscribeToSessionSummary(setSessionSummary), []);

  const capability = content.capabilities.find((item) => item.id === activeCapability);
  const project = content.selectedWork.find((item) => item.id === activeProject);
  const stage = content.deliveryProcess.find((item) => item.id === activeStage);
  const industry = content.industries.find((item) => item.id === activeIndustry);

  return (
    <main className="interactive-story" aria-label="Explore DEKODE">
      <motion.section className="story-section capabilities-section" {...(shouldReduceMotion ? { initial: false } : reveal)}>
        <SectionHeading
          eyebrow="Capabilities"
          title="What DEKODE builds"
          description="Strategy, software and secure foundations—connected as one practical delivery capability."
        />
        <div className="capability-layout">
          <div className="capability-map" aria-label="Select a DEKODE capability">
            <div className="capability-core" aria-hidden="true">
              <Sparkles size={19} />
              <span>DEKODE</span>
            </div>
            {content.capabilities.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={`capability-node node-${index + 1} ${item.id === activeCapability ? "is-active" : ""}`}
                aria-pressed={item.id === activeCapability}
                onClick={() => setActiveCapability(item.id)}
              >
                <span className="node-indicator" aria-hidden="true" />
                <strong>{item.title}</strong>
                <small>{item.shortDescription}</small>
              </button>
            ))}
          </div>
          <motion.article
            key={capability.id}
            className="expanded-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="panel-index">Selected capability</span>
            <h3>{capability.title}</h3>
            <p>{capability.fullDescription}</p>
            <p className="panel-value">{capability.value}</p>
            <div className="keyword-row">
              {capability.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
            <ChatAction section="capabilities" item={capability} label={`Discuss ${capability.title}`} />
          </motion.article>
        </div>
      </motion.section>

      <motion.section className="story-section work-section" {...(shouldReduceMotion ? { initial: false } : reveal)}>
        <SectionHeading
          eyebrow="Evidence"
          title="Selected work"
          description="Real operational problems, translated into digital systems people can use."
        />
        <div className="project-story">
          <div className="project-rail" role="tablist" aria-label="Selected projects">
            {content.selectedWork.map((item, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={item.id === activeProject}
                key={item.id}
                className={item.id === activeProject ? "is-active" : ""}
                onClick={() => setActiveProject(item.id)}
              >
                <span>0{index + 1}</span>
                <strong>{item.title}</strong>
                <small>{item.industry}</small>
              </button>
            ))}
          </div>
          <motion.article
            key={project.id}
            className="project-scene"
            role="tabpanel"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="project-signal" aria-hidden="true"><span /><span /><span /></div>
            <span className="panel-index">{project.industry}</span>
            <h3>{project.title}</h3>
            <div className="project-detail-grid">
              <div><strong>Challenge</strong><p>{project.challenge}</p></div>
              <div><strong>Approach</strong><p>{project.approach}</p></div>
              <div><strong>Solution</strong><p>{project.solution}</p></div>
              <div><strong>Outcome</strong><p>{project.outcome}</p></div>
            </div>
            <div className="project-footer">
              <span>{project.relatedCapability}</span>
              <ChatAction section="selected-work" item={project} label="Discuss a similar project" />
            </div>
          </motion.article>
        </div>
      </motion.section>

      <motion.section className="story-section process-section" {...(shouldReduceMotion ? { initial: false } : reveal)}>
        <SectionHeading
          eyebrow="Delivery"
          title="How DEKODE works"
          description="A clear, risk-reducing flow from the first question through ongoing improvement."
        />
        <div className="process-flow" role="tablist" aria-label="DEKODE delivery stages">
          {content.deliveryProcess.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={item.id === activeStage}
              key={item.id}
              className={item.id === activeStage ? "is-active" : ""}
              onClick={() => setActiveStage(item.id)}
            >
              <span>0{index + 1}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
        <motion.article key={stage.id} className="process-detail" initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <span className="panel-index">Current stage</span>
            <h3>{stage.title}</h3>
            <p>{stage.description}</p>
          </div>
          <ChatAction section="delivery-process" item={stage} label={stage.question} intent="guided_discovery" />
        </motion.article>
      </motion.section>

      <motion.section className="story-section industries-section" {...(shouldReduceMotion ? { initial: false } : reveal)}>
        <SectionHeading
          eyebrow="Business context"
          title="Industries and solutions"
          description="Select an industry to see how DEKODE capabilities connect around its operating context."
        />
        <div className="industry-layout">
          <div className="industry-network" aria-label="Select an industry">
            <div className="industry-core" aria-hidden="true"><span>DEKODE</span><small>Solution core</small></div>
            {content.industries.map((item, index) => (
              <button
                type="button"
                key={item.id}
                className={`industry-node industry-${index + 1} ${item.id === activeIndustry ? "is-active" : ""}`}
                aria-pressed={item.id === activeIndustry}
                onClick={() => setActiveIndustry(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <motion.article key={industry.id} className="expanded-panel industry-panel" initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <span className="panel-index">Industry context</span>
            <h3>{industry.title}</h3>
            <strong>Common challenge</strong>
            <p>{industry.challenge}</p>
            <strong>Relevant capabilities</strong>
            <div className="keyword-row">{industry.capabilities.map((item) => <span key={item}>{item}</span>)}</div>
            <strong>Solution direction</strong>
            <p>{industry.solution}</p>
            <ChatAction section="industries" item={industry} label={`Discuss a solution in ${industry.title}`} />
          </motion.article>
        </div>
      </motion.section>

      <motion.section className="story-section start-project-section" {...(shouldReduceMotion ? { initial: false } : reveal)}>
        <div className="conversion-glow" aria-hidden="true" />
        <span className="panel-index">Start a project</span>
        <h2>Have an idea?</h2>
        <p>Tell DEKODE what you are building.</p>
        {sessionSummary && <div className="session-summary"><span>Your conversation</span><p>{sessionSummary}</p></div>}
        <div className="conversion-actions">
          <button type="button" onClick={() => sendContentToChat({ sourceSection: "start-project", topic: "New project", displayLabel: "Start Chat", suggestedPrompt: content.conversionPrompts.start })}>
            <MessageCircle size={18} /> {sessionSummary ? "Continue the conversation" : "Start Chat"}
          </button>
          <button type="button" onClick={() => openDekodeVoice()}>
            <Mic size={18} /> Talk with DEKODE Voice
          </button>
          <button type="button" onClick={() => sendContentToChat({ sourceSection: "start-project", topic: "Meeting", intent: "meeting_request", displayLabel: "Request a Meeting", suggestedPrompt: content.conversionPrompts.meeting })}>
            <Calendar size={18} /> Request a Meeting
          </button>
        </div>
      </motion.section>
    </main>
  );
}
