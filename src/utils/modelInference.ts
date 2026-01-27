import { pipeline, env } from '@xenova/transformers';

// transformers.js 환경 설정
env.allowLocalModels = false;
env.allowRemoteModels = true;

// ONNX Runtime Web 백엔드 설정
env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;

const MODEL_NAME = 'Xenova/flan-t5-small';
let generator: any = null;
let initPromise: Promise<any> | null = null;

// 싱글톤 패턴으로 모델 초기화
export function initializeModel() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log(`모델 로딩 시작: ${MODEL_NAME}`);

      generator = await pipeline('text2text-generation', MODEL_NAME, {
        quantized: true,
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            const pct = Math.round((progress.progress || 0) * 100);
            console.log(`${progress.file}: ${pct}%`);
          }
        }
      });

      console.log('모델 로딩 완료');
      return generator;
    } catch (error: any) {
      console.error('모델 로딩 에러:', error);
      initPromise = null; // 실패 시 재시도 가능하도록
      throw error;
    }
  })();

  return initPromise;
}

export async function generateText(text: string): Promise<string> {
  if (!generator) {
    await initializeModel();
  }

  try {
    const output = await generator(text, {
      max_new_tokens: 100,
      temperature: 0.7
    });

    // text2text-generation 결과 형식
    return output[0]?.generated_text || text;
  } catch (error: any) {
    console.error('생성 에러:', error);
    throw error;
  }
}

export function isModelReady(): boolean {
  return generator !== null;
}
