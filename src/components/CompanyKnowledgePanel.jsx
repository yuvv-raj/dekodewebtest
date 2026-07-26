import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Code2,
  Layers3,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { loadCompanyKnowledge } from '../knowledge/companyKnowledgeLoader';

const knowledge = loadCompanyKnowledge();

const serviceIcons = [BrainCircuit, Bot, Code2, Sparkles, Workflow, Cloud];

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const itemMotion = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function PanelButton({ children, prompt, onSelect, className = '' }) {
  return (
    <motion.button
      variants={itemMotion}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`knowledge-panel-button ${className}`}
      onClick={() => onSelect(prompt)}
      type="button"
    >
      {children}
    </motion.button>
  );
}

function OverviewPanel({ onSelect }) {
  const milestones = [
    ['Mission', knowledge.company.mission],
    ['Capabilities', 'Strategy, products, automation, cloud, and security'],
    ['Services', `${knowledge.services.length} connected service families`],
    ['Industries', `${knowledge.industries.length} sectors named in the company profile`],
    ['Innovation', 'Accessible, useful AI and digital transformation'],
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="knowledge-timeline">
      {milestones.map(([title, description], index) => (
        <PanelButton key={title} prompt={title === 'Mission' ? 'Tell me about DEKODE' : `Tell me about your ${title}`} onSelect={onSelect} className="timeline-card">
          <span className="timeline-index">{String(index + 1).padStart(2, '0')}</span>
          <span>
            <strong>{title}</strong>
            <small>{description}</small>
          </span>
        </PanelButton>
      ))}
    </motion.div>
  );
}

function ServicesPanel({ onSelect }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="knowledge-card-grid services-panel-grid">
      {knowledge.services.map((service, index) => {
        const Icon = serviceIcons[index % serviceIcons.length];
        return (
          <PanelButton key={service.id} prompt={`Tell me more about ${service.name}`} onSelect={onSelect}>
            <Icon size={18} />
            <span>{service.name.replace(' Development', '').replace(' & Consulting', '')}</span>
          </PanelButton>
        );
      })}
    </motion.div>
  );
}

function IndustriesPanel({ onSelect }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="knowledge-card-grid industry-panel-grid">
      {knowledge.industries.map((industry) => (
        <PanelButton key={industry} prompt={`Tell me about your work in ${industry}`} onSelect={onSelect}>
          <Layers3 size={16} />
          <span>{industry}</span>
        </PanelButton>
      ))}
    </motion.div>
  );
}

function TechnologiesPanel({ onSelect }) {
  const technologies = [...knowledge.technologies, 'AI', 'Machine Learning', 'Generative AI', 'APIs'];
  return (
    <div className="tech-orbit">
      <div className="tech-orbit-core"><Code2 size={22} /><span>Practical stack</span></div>
      {technologies.map((technology, index) => (
        <motion.button
          key={technology}
          type="button"
          className="tech-badge"
          style={{ '--tech-index': index }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={{ opacity: { delay: index * 0.08 }, scale: { delay: index * 0.08 }, y: { repeat: Infinity, duration: 2.4 + index * 0.12 } }}
          onClick={() => onSelect(`Tell me about your ${technology} capabilities`)}
        >
          {technology}
        </motion.button>
      ))}
    </div>
  );
}

function ProcessPanel({ onSelect }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="process-panel">
      {knowledge.developmentProcess.map((step, index) => (
        <React.Fragment key={step.name}>
          <PanelButton prompt={`Tell me more about the ${step.name} stage`} onSelect={onSelect} className="process-step-card">
            <span className="process-step-number">{index + 1}</span>
            <span>{step.name}</span>
          </PanelButton>
          {index < knowledge.developmentProcess.length - 1 && <motion.div variants={itemMotion} className="process-connector" />}
        </React.Fragment>
      ))}
    </motion.div>
  );
}

function WhyPanel({ onSelect }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="why-panel">
      {knowledge.whyChooseUs.map((item) => (
        <PanelButton key={item.name} prompt={`What does ${item.name} mean at DEKODE?`} onSelect={onSelect}>
          <CheckCircle2 size={18} />
          <span>
            <strong>{item.name}</strong>
            <small>{item.description}</small>
          </span>
        </PanelButton>
      ))}
    </motion.div>
  );
}

function AiPanel({ onSelect }) {
  const nodes = ['Strategy', 'Custom AI', 'Copilots', 'Knowledge', 'Automation'];
  return (
    <div className="ai-knowledge-graph">
      <motion.button
        type="button"
        className="ai-graph-core"
        initial={{ scale: 0 }}
        animate={{ scale: 1, boxShadow: ['0 0 0 rgba(53,118,193,0)', '0 0 28px rgba(53,118,193,.55)', '0 0 0 rgba(53,118,193,0)'] }}
        transition={{ scale: { type: 'spring' }, boxShadow: { repeat: Infinity, duration: 2.5 } }}
        onClick={() => onSelect('Tell me about your AI services')}
      >
        <BrainCircuit size={26} />
        <span>AI</span>
      </motion.button>
      {nodes.map((node, index) => (
        <React.Fragment key={node}>
          <motion.span className={`ai-graph-line ai-line-${index + 1}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.2 + index * 0.08 }} />
          <motion.button
            type="button"
            className={`ai-graph-node ai-node-${index + 1}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 0.25 + index * 0.08 }}
            onClick={() => onSelect(`Tell me about ${node}`)}
          >
            {node}
          </motion.button>
        </React.Fragment>
      ))}
    </div>
  );
}

function RecommendationsPanel({ onSelect }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="knowledge-card-grid services-panel-grid">
      {knowledge.services.slice(0, 6).map((service, index) => {
        const Icon = serviceIcons[index % serviceIcons.length];
        return (
          <PanelButton key={service.id} prompt={`Tell me more about ${service.name}`} onSelect={onSelect}>
            <Icon size={18} />
            <span>
              <strong>{service.name}</strong>
              <small>{service.summary}</small>
            </span>
          </PanelButton>
        );
      })}
    </motion.div>
  );
}

function MeetingPanel({ onSelect }) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="why-panel">
      <PanelButton prompt="I would like to request a meeting" onSelect={onSelect}>
        <CheckCircle2 size={18} />
        <span><strong>Preferred meeting time</strong><small>Choose a temporary preference in DEKODE Voice. The team confirms availability after submission.</small></span>
      </PanelButton>
      <PanelButton prompt="Help me prepare an enquiry instead" onSelect={onSelect}>
        <Workflow size={18} />
        <span><strong>Prepare an enquiry</strong><small>Review and edit all conversation-inferred details before submitting.</small></span>
      </PanelButton>
    </motion.div>
  );
}

const panels = {
  overview: OverviewPanel,
  services: ServicesPanel,
  industries: IndustriesPanel,
  technologies: TechnologiesPanel,
  process: ProcessPanel,
  why: WhyPanel,
  ai: AiPanel,
  recommendations: RecommendationsPanel,
  meeting: MeetingPanel,
};

export default function CompanyKnowledgePanel({ panel = 'overview', onSelect }) {
  const Panel = panels[panel] || OverviewPanel;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panel}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="company-knowledge-panel"
      >
        <Panel onSelect={onSelect} />
      </motion.div>
    </AnimatePresence>
  );
}
