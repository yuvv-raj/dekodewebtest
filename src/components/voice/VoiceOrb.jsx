import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Sparkles } from 'lucide-react';

export default function VoiceOrb({ state }) {
  const active = state === 'listening' || state === 'speaking';
  const Icon = state === 'speaking' ? Sparkles : Mic;
  return (
    <div className={`voice-orb-wrap voice-orb-${state}`} aria-hidden="true">
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="voice-orb-ring"
          animate={active ? { scale: [1, 1.25 + ring * 0.09, 1], opacity: [0.34, 0.05, 0.34] } : { scale: 1, opacity: 0.12 }}
          transition={{ repeat: active ? Infinity : 0, duration: 1.8, delay: ring * 0.18 }}
        />
      ))}
      <motion.div
        className="voice-orb-core"
        animate={state === 'processing' ? { rotate: 360 } : { scale: active ? [1, 1.07, 1] : 1 }}
        transition={{ repeat: Infinity, duration: state === 'processing' ? 1.2 : 1.6, ease: 'linear' }}
      >
        <Icon size={30} />
      </motion.div>
    </div>
  );
}
