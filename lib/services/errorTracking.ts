/**
 * 에러 추적 서비스 (Sentry Mock)
 * 실제 Sentry 연동 전 MOCK 형태로 구현
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('ErrorTracking');

interface ErrorContext {
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

interface ErrorBreadcrumb {
  category: string;
  message: string;
  level?: ErrorContext['level'];
  timestamp?: number;
}

let isInitialized = false;
let userId: string | null = null;

/**
 * Sentry 초기화
 */
export const initSentry = (dsn: string, environment: string, userIdParam?: string) => {
  // MOCK: 실제 Sentry 초기화 대신 로거에 기록
  logger.log('초기화', { dsn, environment, userId: userIdParam });

  isInitialized = true;
  userId = userIdParam || 'anonymous';
};

/**
 * 에러 보고
 */
export const captureError = (error: Error, context?: ErrorContext) => {
  if (!isInitialized) {
    logger.warn('[Sentry Mock] 초기화되지 않음');
    return;
  }

  const errorLog = {
    message: error.message,
    stack: error.stack,
    context,
    userId,
    timestamp: Date.now(),
  };

  // 로거에 기록 (실제 환경에서는 Sentry로 전송)
  logger.error('에러 보고:', errorLog);
};

/**
 * 메시지 보고
 */
export const captureMessage = (message: string, level: ErrorContext['level'] = 'info', context?: ErrorContext) => {
  if (!isInitialized) {
    logger.warn('[Sentry Mock] 초기화되지 않음');
    return;
  }

  const messageLog = {
    message,
    level,
    context,
    userId,
    timestamp: Date.now(),
  };

  logger.log(`메시지 (${level}):`, messageLog);
};

/**
 * 사용자 정보 설정
 */
export const setUser = (id: string, email?: string, username?: string) => {
  userId = id;
  logger.log('사용자 설정:', { id, email, username });
};

/**
 * 브레드크럼프 추가
 */
export const addBreadcrumb = (breadcrumb: ErrorBreadcrumb) => {
  if (!isInitialized) return;

  logger.log('브레드크럼프:', breadcrumb);
};

/**
 * 세션 종료
 */
export const closeSentry = () => {
  logger.log('세션 종료');
  isInitialized = false;
  userId = null;
};

/**
 * 에러 추적 서비스 인터페이스
 */
export const errorTrackingService = {
  initSentry,
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
  closeSentry,
};
