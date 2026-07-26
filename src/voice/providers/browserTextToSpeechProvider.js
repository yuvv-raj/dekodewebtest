export class BrowserTextToSpeechProvider {
  isSupported() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  speak(text, { muted = false, onEnd, onError } = {}) {
    if (muted || !this.isSupported()) {
      onEnd?.();
      return;
    }
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || 'en-AU';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => onEnd?.();
    utterance.onerror = (event) => onError?.(new Error(event.error || 'Speech playback failed.'));
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}
