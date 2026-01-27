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

  console.log('[Worker] Received:', { action, text });

  if (action === 'init') {
    try {
      self.postMessage({ status: 'progress', progress: 0, message: 'ONNX Runtime 초기화 중...' });
      console.log('[Worker] Initializing model:', MODEL_NAME);

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
      console.log('[Worker] Model ready!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      self.postMessage({ status: 'error', error: errorMessage });
      self.postMessage({ status: 'error', error: error.message || error.toString() });
    }
  }

  if (action === 'generate') {
    try {
      console.log('[Worker] Generating text for:', text);
      self.postMessage({ status: 'generating' });

      const output = await generator(text, {
        max_new_tokens: 100,
        temperature: 0.7
      });

      // text2text-generation 결과 형식: [{ generated_text: string }]
      const generatedText = output[0]?.generated_text || text;
      console.log('[Worker] Generated:', generatedText);

      self.postMessage({ status: 'complete', output: generatedText });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      console.error('[Worker] Generate error:', error);
      self.postMessage({ status: 'error', error: errorMessage });
    }
  }
};

// TypeScript export workaround
export {};
