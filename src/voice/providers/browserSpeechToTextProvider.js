export class BrowserSpeechToTextProvider {
  constructor() {
    this.recognition = null;
  }

  isSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async requestPermission() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone access is unavailable in this browser.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  }

  start({ onInterim, onFinal, onError, onEnd }) {
    if (!this.isSupported()) throw new Error('Speech recognition is unavailable.');
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-AU';
    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const text = event.results[index][0].transcript;
        if (event.results[index].isFinal) final += text;
        else interim += text;
      }
      if (interim) onInterim?.(interim.trim());
      if (final) onFinal?.(final.trim());
    };
    recognition.onerror = (event) => onError?.(new Error(event.error || 'Speech recognition failed.'));
    recognition.onend = () => onEnd?.();
    this.recognition = recognition;
    recognition.start();
  }

  stop() {
    if (!this.recognition) return;
    this.recognition.onend = null;
    this.recognition.stop();
    this.recognition = null;
  }
}
