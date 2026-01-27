import { useEffect, useState, useCallback, useRef } from 'react';
import {
  initializeModel,
  generateText,
  isModelReady,
  terminateModel,
  type ModelStatus
} from '../utils/modelInference';

interface UseModelInferenceReturn {
  status: ModelStatus;
  progress: number;
  error: string | null;
  generate: (text: string) => Promise<string>;
}

/**
 * Web Worker 기반 AI 모델 추론 훅
 * 메인 스레드를 차단하지 않고 백그라운드에서 AI 추론 수행
 */
export function useModelInference(): UseModelInferenceReturn {
  const [status, setStatus] = useState<ModelStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);

  /**
   * 모델 초기화 - 컴포넌트 마운트 시 자동 실행
   */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 이미 초기화 중이면 중복 실행 방지
      if (initializingRef.current) {
        console.log('[useModelInference] Already initializing, skipping');
        return;
      }

      // 이미 준비된 상태면 건너뜀
      if (isModelReady()) {
        console.log('[useModelInference] Model already ready');
        if (mounted) {
          setStatus('ready');
          setProgress(100);
          setError(null);
        }
        return;
      }

      initializingRef.current = true;
      console.log('[useModelInference] Starting initialization');

      setStatus('loading');
      setProgress(0);
      setError(null);

      try {
        // 워커에서 실시간 진행률을 받음
        await initializeModel((prog, message) => {
          if (mounted) {
            const pct = Math.round(prog * 100);
            setProgress(pct);
            console.log(`[useModelInference] Progress: ${pct}% - ${message || ''}`);
          }
        });

        if (mounted) {
          console.log('[useModelInference] Initialization complete!');
          setStatus('ready');
          setProgress(100);
          setError(null);
        }
      } catch (err: unknown) {
        console.error('[useModelInference] Init error:', err);
        if (mounted) {
          const message = err instanceof Error ? err.message : '모델 로딩 실패';
          setStatus('error');
          setError(message);
        }
      } finally {
        initializingRef.current = false;
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * 텍스트 생성
   */
  const generate = useCallback(async (text: string): Promise<string> => {
    console.log('[useModelInference] Generate called:', text);
    if (!isModelReady()) {
      console.warn('[useModelInference] Model not ready');
      throw new Error('모델이 준비되지 않았습니다');
    }

    setStatus('generating');

    try {
      const result = await generateText(text);
      console.log('[useModelInference] Generate result:', result);
      setStatus('ready');
      return result;
    } catch (err: unknown) {
      console.error('[useModelInference] Generate error:', err);
      const message = err instanceof Error ? err.message : '생성 실패';
      setStatus('error');
      setError(message);
      throw err;
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 필요시 워커 종료: terminateModel();
    };
  }, []);

  return { status, progress, error, generate };
}
