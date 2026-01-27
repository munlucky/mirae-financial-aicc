/**
 * 개발용 모델 미리 캐싱 스크립트
 * node scripts/cache-model.js 실행
 */

import { pipeline, env } from '@xenova/transformers';

// 개발용: 로컬 캐시 경로 설정
env.allowLocalModels = true;
env.allowRemoteModels = true;

async function cacheModel() {
  console.log('🔄 모델 다운로드 시작...');

  const models = [
    {
      name: 'Xenova/flan-t5-small',  // 가벼운 모델 (약 200MB)
      task: 'text2text-generation'
    },
    // 필요시 추가 모델
  ];

  for (const model of models) {
    try {
      console.log(`\n📦 ${model.name} 다운로드 중...`);

      const progress = {};
      const generator = await pipeline(model.task, model.name, {
        quantized: true,
        progress_callback: (data) => {
          if (data.status === 'downloading') {
            const pct = data.progress || 0;
            if (!progress[data.file]) {
              progress[data.file] = 0;
            }
            if (pct - progress[data.file] > 0.1) {
              progress[data.file] = pct;
              console.log(`  ${data.file}: ${(pct * 100).toFixed(0)}%`);
            }
          } else if (data.status === 'done') {
            console.log(`  ✅ ${data.file}`);
          }
        }
      });

      // 간단 테스트
      const output = await generator('Hello, world!', { max_length: 10 });
      console.log(`  ✅ 테스트 통과: ${output[0].generated_text}`);

    } catch (error) {
      console.error(`  ❌ 에러: ${error.message}`);
    }
  }

  console.log('\n✨ 캐싱 완료!');
  console.log('📂 캐시 위치:');

  // Windows
  if (process.platform === 'win32') {
    console.log(`  ${process.env.LOCALAPPDATA}\\@xenova\\transformers\\`);
  }
  // macOS/Linux
  else {
    console.log(`  ~/.cache/@xenova/transformers/`);
  }
}

cacheModel().catch(console.error);
