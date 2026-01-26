/**
 * 타이밍 관련 상수
 * UI 애니메이션, 지연 시간 등에 사용
 */

/**
 * 읽음 표시 지연 시간 (ms)
 * 메시지 전송 후 읽음 표시가 나타날 때까지의 시간
 */
export const READ_RECEIPT_DELAY = 800;

/**
 * AI 응답 기본 지연 시간 (ms)
 * AI가 답변을 생성하기 시작할 때까지의 시간
 */
export const AI_RESPONSE_BASE_DELAY = 1500;

/**
 * AI 응답 추가 지연 범위 (ms)
 * AI 응답 시간에 랜덤성을 추가하기 위한 범위
 */
export const AI_RESPONSE_RANDOM_DELAY = 1000;

/**
 * 파일 처리 응답 지연 시간 (ms)
 * 파일/이미지 첨부 후 AI가 응답할 때까지의 시간
 */
export const FILE_RESPONSE_DELAY = 2000;

/**
 * 음성 처리 지연 시간 (ms)
 * 음성 인식 완료 후 텍스트로 변환될 때까지의 시간
 */
export const VOICE_PROCESSING_DELAY = 1500;
