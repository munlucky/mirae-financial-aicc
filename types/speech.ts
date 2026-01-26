/**
 * Speech Recognition and Synthesis Types
 */

export interface SpeechRecognitionConfig {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export type SpeechRecognitionState = 'idle' | 'listening' | 'paused' | 'processing';

export interface SpeechRecognitionCallbacks {
  onResult: (result: SpeechRecognitionResult) => void;
  onInterimResult: (result: SpeechRecognitionResult) => void;
  onError: (error: SpeechRecognitionError) => void;
  onStart: () => void;
  onEnd: () => void;
}

export type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'audio-capture'
  | 'not-allowed'
  | 'network'
  | 'aborted'
  | 'unknown';

export interface SpeechRecognitionError {
  code: SpeechRecognitionErrorCode;
  message: string;
}

export interface SpeechSynthesisConfig {
  lang: string;
  pitch: number;
  rate: number;
  volume: number;
}

export type SpeechSynthesisState = 'idle' | 'speaking' | 'paused' | 'cancelled';

export interface SpeechSynthesisVoice {
  name: string;
  lang: string;
}
