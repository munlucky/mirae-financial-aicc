import { pipeline, env } from '@xenova/transformers';

// transformers.js 환경 설정 - Worker용
env.allowLocalModels = false;
env.allowRemoteModels = true;

// ONNX Runtime Web 백엔드 설정
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.simd = false;

const MODEL_NAME = 'Xenova/flan-t5-small';
let generator = null;

self.onmessage = async (event: MessageEvent) => {
  const { action, text } = event.data;

  if (action === 'init') {
    try {
      console.log(`모델 로딩 시작: ${MODEL_NAME}`);
      self.postMessage({ status: 'progress', progress: 0, message: 'ONNX Runtime 초기화 중...' });

      generator = await pipeline('text2text-generation', MODEL_NAME, {
        quantized: true,
        dtype: 'q8',
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            const pct = Math.round((progress.progress || 0) * 100);
            self.postMessage({
              status: 'progress',
              progress: progress.progress || 0,
              message: `${progress.file}: ${pct}%`
            });
          } else if (progress.status === 'loading') {
            self.postMessage({
              status: 'progress',
              progress: 0.95,
              message: '모델 초기화 중...'
            });
          }
        }
      });

      self.postMessage({ status: 'ready', progress: 1 });
      console.log('모델 로딩 완료');
    } catch (error: any) {
      console.error('모델 로딩 에러:', error);
      self.postMessage({ status: 'error', error: error.message || error.toString() });
    }
  }

  if (action === 'generate') {
    try {
      self.postMessage({ status: 'generating' });

      const output = await generator(text, {
        max_new_tokens: 100,
        temperature: 0.7
      });

      self.postMessage({ status: 'complete', output });
    } catch (error: any) {
      console.error('생성 에러:', error);
      self.postMessage({ status: 'error', error: error.message || error.toString() });
    }
  }
};

// TypeScript export workaround
export {};
