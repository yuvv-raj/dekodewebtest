import React from 'react';
import { AudioLines } from 'lucide-react';

export default function DekodeVoiceEntry({ onClick, compact = false }) {
  return (
    <button type="button" className={`dekode-voice-entry ${compact ? 'is-compact' : ''}`} onClick={onClick} aria-label="Talk to DEKODE Voice">
      <AudioLines size={17} />
      {!compact && <span>Talk to DEKODE Voice</span>}
    </button>
  );
}
