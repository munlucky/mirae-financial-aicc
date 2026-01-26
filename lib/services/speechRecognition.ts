/**
 * Speech Recognition Service (STT)
 * Uses Web Speech API for speech-to-text conversion
 */

import type {
  SpeechRecognitionConfig,
  SpeechRecognitionResult,
  SpeechRecognitionCallbacks,
  SpeechRecognitionError,
  SpeechRecognitionErrorCode,
  SpeechRecognitionState,
} from '../../types/speech';

// Browser compatibility check
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export class SpeechRecognitionService {
  private recognition: any | null = null;
  private state: SpeechRecognitionState = 'idle';
  private callbacks: SpeechRecognitionCallbacks;
  private config: SpeechRecognitionConfig;

  constructor(callbacks: SpeechRecognitionCallbacks, config?: Partial<SpeechRecognitionConfig>) {
    this.config = {
      lang: config?.lang || 'ko-KR',
      continuous: config?.continuous ?? false,
      interimResults: config?.interimResults ?? true,
      maxAlternatives: config?.maxAlternatives || 1,
    };

    this.callbacks = callbacks;

    if (this.isSupported()) {
      this.initRecognition();
    }
  }

  private initRecognition(): void {
    if (!SpeechRecognitionAPI) {
      this.callbacks.onError({
        code: 'unknown',
        message: 'Speech Recognition API is not supported in this browser. Please use Chrome or Edge.',
      });
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = this.config.lang;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const result = event.results[last];

      const speechResult: SpeechRecognitionResult = {
        transcript: result[0].transcript,
        confidence: result[0].confidence,
        isFinal: result.isFinal,
      };

      if (result.isFinal) {
        this.callbacks.onResult(speechResult);
      } else {
        this.callbacks.onInterimResult(speechResult);
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorCode = this.mapErrorCode(event.error);
      const error: SpeechRecognitionError = {
        code: errorCode,
        message: this.getErrorMessage(errorCode),
      };
      this.callbacks.onError(error);
      this.state = 'idle';
    };

    this.recognition.onstart = () => {
      this.state = 'listening';
      this.callbacks.onStart();
    };

    this.recognition.onend = () => {
      this.state = 'idle';
      this.callbacks.onEnd();
    };
  }

  private mapErrorCode(error: string): SpeechRecognitionErrorCode {
    const errorMap: Record<string, SpeechRecognitionErrorCode> = {
      'no-speech': 'no-speech',
      'audio-capture': 'audio-capture',
      'not-allowed': 'not-allowed',
      'network': 'network',
      'aborted': 'aborted',
    };
    return errorMap[error] || 'unknown';
  }

  private getErrorMessage(code: SpeechRecognitionErrorCode): string {
    const messages: Record<SpeechRecognitionErrorCode, string> = {
      'no-speech': '음성이 감지되지 않았습니다. 다시 말씀해 주세요.',
      'audio-capture': '마이크를 찾을 수 없습니다. 마이크 연결을 확인해 주세요.',
      'not-allowed': '마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.',
      'network': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.',
      'aborted': '음성 인식이 중단되었습니다.',
      'unknown': '알 수 없는 오류가 발생했습니다.',
    };
    return messages[code];
  }

  start(): void {
    if (!this.isSupported()) {
      this.callbacks.onError({
        code: 'unknown',
        message: 'Speech Recognition API is not supported in this browser. Please use Chrome or Edge.',
      });
      return;
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.state === 'listening') {
      return;
    }

    try {
      this.recognition?.start();
    } catch (error) {
      this.callbacks.onError({
        code: 'unknown',
        message: '음성 인식을 시작할 수 없습니다.',
      });
    }
  }

  stop(): void {
    if (this.recognition && this.state === 'listening') {
      this.recognition.stop();
      this.state = 'idle';
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.state = 'idle';
    }
  }

  getState(): SpeechRecognitionState {
    return this.state;
  }

  isSupported(): boolean {
    return !!SpeechRecognitionAPI;
  }

  destroy(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
    this.state = 'idle';
  }
}

/**
 * Factory function to create a speech recognition instance
 */
export const createSpeechRecognition = (
  callbacks: SpeechRecognitionCallbacks,
  config?: Partial<SpeechRecognitionConfig>
): SpeechRecognitionService => {
  return new SpeechRecognitionService(callbacks, config);
};
