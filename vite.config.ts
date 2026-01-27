import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      fs: {
        strict: false
      }
    },
    plugins: [react()],
    // API 키는 클라이언트 번들에 포함되지 않도록 제거
    // 백엔드 프록시를 통해서만 접근해야 합니다
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
