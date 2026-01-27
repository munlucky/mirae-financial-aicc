import { useEffect, useState } from 'react';
import { initializeModel, generateText, isModelReady } from '../utils/modelInference';

type ModelStatus = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

interface UseModelInferenceReturn {
  status: ModelStatus;
  progress: number;
  error: string | null;
  generate: (text: string) => Promise<string>;
}

export function useModelInference(): UseModelInferenceReturn {
  const [status, setStatus] = useState<ModelStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // 모델 초기화
    const init = async () => {
      if (isModelReady()) {
        setStatus('ready');
        setProgress(100);
        return;
      }

      setStatus('loading');
      setProgress(0);

      try {
        // 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev < 90) return prev + 10;
            return prev;
          });
        }, 500);

        await initializeModel();

        clearInterval(progressInterval);

        if (mounted) {
          setStatus('ready');
          setProgress(100);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setStatus('error');
          setError(err.message || '모델 로딩 실패');
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const generate = async (text: string): Promise<string> => {
    if (!isModelReady()) {
      throw new Error('모델이 준비되지 않았습니다');
    }

    setStatus('generating');

    try {
      const result = await generateText(text);
      setStatus('ready');
      return result;
    } catch (err: any) {
      setStatus('error');
      setError(err.message || '생성 실패');
      throw err;
    }
  };

  return { status, progress, error, generate };
}
