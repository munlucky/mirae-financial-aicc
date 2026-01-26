/**
 * Speech Synthesis Service (TTS)
 * Uses Web Speech API for text-to-speech conversion
 */

import type {
  SpeechSynthesisConfig,
  SpeechSynthesisVoice,
  SpeechSynthesisState,
} from '../../types/speech';
import { createLogger } from '../utils/logger';

const logger = createLogger('SpeechSynthesis');

export class SpeechSynthesisService {
  private synthesis: SpeechSynthesis | null = null;
  private state: SpeechSynthesisState = 'idle';
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private config: SpeechSynthesisConfig;
  private voices: SpeechSynthesisVoice[] = [];

  constructor(config?: Partial<SpeechSynthesisConfig>) {
    this.config = {
      lang: config?.lang || 'ko-KR',
      pitch: config?.pitch ?? 1,
      rate: config?.rate ?? 1,
      volume: config?.volume ?? 1,
    };

    if (this.isSupported()) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synthesis) return;

    // Load voices immediately if available
    const load = () => {
      const availableVoices = this.synthesis?.getVoices() || [];
      this.voices = availableVoices
        .filter((voice) => voice.lang.startsWith('ko'))
        .map((voice) => ({
          name: voice.name,
          lang: voice.lang,
        }));
    };

    load();

    // Voices load asynchronously in some browsers
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = load;
    }
  }

  speak(text: string, voiceIndex: number = 0): void {
    if (!this.isSupported()) {
      logger.warn('Speech Synthesis API is not supported in this browser.');
      return;
    }

    // Stop any current speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.lang;
    utterance.pitch = this.config.pitch;
    utterance.rate = this.config.rate;
    utterance.volume = this.config.volume;

    // Set Korean voice if available
    const allVoices = this.synthesis?.getVoices() || [];
    const koreanVoices = allVoices.filter((voice) => voice.lang.startsWith('ko'));
    if (koreanVoices.length > 0 && koreanVoices[voiceIndex]) {
      utterance.voice = koreanVoices[voiceIndex];
    }

    utterance.onstart = () => {
      this.state = 'speaking';
    };

    utterance.onend = () => {
      this.state = 'idle';
      this.currentUtterance = null;
    };

    utterance.onerror = (event) => {
      logger.warn('Speech synthesis error:', event.error);
      this.state = 'idle';
      this.currentUtterance = null;
    };

    utterance.onpause = () => {
      this.state = 'paused';
    };

    utterance.onresume = () => {
      this.state = 'speaking';
    };

    this.currentUtterance = utterance;
    this.synthesis?.speak(utterance);
  }

  pause(): void {
    if (this.synthesis && this.state === 'speaking') {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis && this.state === 'paused') {
      this.synthesis.resume();
    }
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.state = 'idle';
      this.currentUtterance = null;
    }
  }

  getState(): SpeechSynthesisState {
    return this.state;
  }

  getVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  isSpeaking(): boolean {
    return this.state === 'speaking';
  }

  isPaused(): boolean {
    return this.state === 'paused';
  }

  updateConfig(config: Partial<SpeechSynthesisConfig>): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    this.cancel();
    this.synthesis = null;
    this.voices = [];
  }
}

/**
 * Factory function to create a speech synthesis instance
 */
export const createSpeechSynthesis = (
  config?: Partial<SpeechSynthesisConfig>
): SpeechSynthesisService => {
  return new SpeechSynthesisService(config);
};
