/**
 * Logger 유틸리티
 * 개발 환경에서만 로그를 출력합니다.
 */

type LogLevel = 'log' | 'warn' | 'error' | 'debug';

const isDevelopment = import.meta.env.DEV;

const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (isDevelopment && import.meta.env.VITE_DEBUG) {
      console.debug('[DEBUG]', ...args);
    }
  },
};

// 네임스페이스 지원 로거
export const createLogger = (namespace: string) => ({
  log: (...args: unknown[]) => logger.log(`[${namespace}]`, ...args),
  warn: (...args: unknown[]) => logger.warn(`[${namespace}]`, ...args),
  error: (...args: unknown[]) => logger.error(`[${namespace}]`, ...args),
  debug: (...args: unknown[]) => logger.debug(`[${namespace}]`, ...args),
});

export default logger;
