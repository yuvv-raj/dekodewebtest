export const VOICE_STATES = Object.freeze({
  INACTIVE: 'inactive',
  REQUESTING_PERMISSION: 'requesting_permission',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  INTERRUPTED: 'interrupted',
  SELECTING_SLOT: 'selecting_slot',
  REVIEWING_SUBMISSION: 'reviewing_submission',
  SUBMITTING: 'submitting',
  COMPLETED: 'completed',
  ENDED: 'ended',
  ERROR: 'error',
});

const transitions = {
  inactive: ['requesting_permission'],
  requesting_permission: ['listening', 'speaking', 'error', 'ended'],
  listening: ['processing', 'ended', 'error'],
  processing: ['speaking', 'selecting_slot', 'error', 'ended'],
  speaking: ['listening', 'interrupted', 'selecting_slot', 'ended', 'error'],
  interrupted: ['listening', 'processing', 'ended'],
  selecting_slot: ['reviewing_submission', 'listening', 'ended', 'error'],
  reviewing_submission: ['submitting', 'listening', 'ended', 'error'],
  submitting: ['completed', 'reviewing_submission', 'error'],
  completed: ['ended', 'listening'],
  error: ['listening', 'ended'],
  ended: ['requesting_permission', 'reviewing_submission'],
};

export function canTransition(from, to) {
  return Boolean(transitions[from]?.includes(to));
}

export class VoiceSessionController {
  constructor(initialState = VOICE_STATES.INACTIVE) {
    this.state = initialState;
  }

  transition(next) {
    if (!canTransition(this.state, next)) {
      throw new Error(`Invalid voice state transition: ${this.state} -> ${next}`);
    }
    this.state = next;
    return this.state;
  }
}
