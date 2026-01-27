/**
 * Web Worker-based Model Inference Manager
 * AI 모델 실행을 백그라운드 워커로 위임하여 메인 스레드 차단 방지
 */

const WORKER_URL = new URL('../workers/worker.ts', import.meta.url);

// 워커 메시지 타입 정의
type WorkerMessage =
  | { status: 'progress'; progress: number; message?: string }
  | { status: 'ready'; progress: number }
  | { status: 'generating' }
  | { status: 'complete'; output: string }
  | { status: 'error'; error: string };

type ModelStatus = 'idle' | 'loading' | 'ready' | 'generating' | 'error';

// 요청 ID 생성을 위한 카운터 (전역)
let generateCounter = 0;

class WorkerManager {
  private worker: Worker | null = null;
  private status: ModelStatus = 'idle';
  private progress: number = 0;
  private error: string | null = null;
  private progressCallback: ((progress: number, message?: string) => void) | null = null;
  private pendingGenerates: Map<string, { resolve: (value: string) => void; reject: (error: Error) => void }> = new Map();
  private initResolve: (() => void) | null = null;
  private initReject: ((error: Error) => void) | null = null;
  private initResolved = false;

  constructor() {
    // 기본 생성자 - 실제 초기화는 initialize에서
  }

  /**
   * 워커 초기화 및 모델 로딩 시작
   */
  async initialize(onProgress?: (progress: number, message?: string) => void): Promise<void> {
    if (this.worker) {
      console.log('[WorkerManager] Already initialized');
      return; // 이미 초기화됨
    }

    this.progressCallback = onProgress || null;
    this.status = 'loading';
    this.progress = 0;
    this.initResolved = false;

    return new Promise((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;

      try {
        console.log('[WorkerManager] Creating worker:', WORKER_URL.toString());
        this.worker = new Worker(WORKER_URL, { type: 'module' });

        this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
          const data = event.data;
          console.log('[WorkerManager] Received message:', data);

          switch (data.status) {
            case 'progress':
              this.progress = data.progress;
              console.log('[WorkerManager] Progress:', Math.round(data.progress * 100) + '%', data.message);
              if (this.progressCallback) {
                this.progressCallback(data.progress, data.message);
              }
              break;

            case 'ready':
              console.log('[WorkerManager] Model ready!');
              this.status = 'ready';
              this.progress = 1;
              this.error = null;
              if (!this.initResolved && this.initResolve) {
                this.initResolve();
                this.initResolved = true;
              }
              break;

            case 'complete':
              console.log('[WorkerManager] Generation complete:', data.output);
              const generateId = this.getGenerateId();
              const pending = this.pendingGenerates.get(generateId);
              if (pending) {
                pending.resolve(data.output);
                this.pendingGenerates.delete(generateId);
              }
              this.status = 'ready';
              break;

            case 'error':
              console.error('[WorkerManager] Error:', data.error);
              // 생성 중 에러인지 초기화 중 에러인지 구분
              if (this.pendingGenerates.size > 0) {
                const pendingError = this.pendingGenerates.get(this.getGenerateId());
                if (pendingError) {
                  pendingError.reject(new Error(data.error));
                  this.pendingGenerates.delete(this.getGenerateId());
                }
              } else if (!this.initResolved && this.initReject) {
                this.status = 'error';
                this.error = data.error;
                this.initReject(new Error(this.error));
                this.initResolved = true;
              }
              break;
          }
        };

        this.worker.onerror = (error) => {
          console.error('[WorkerManager] Worker error:', error);
          this.status = 'error';
          this.error = error.message || 'Worker error';
          if (!this.initResolved && this.initReject) {
            this.initReject(new Error(this.error));
            this.initResolved = true;
          }
        };

        // 워커에 초기화 명령 전송
        console.log('[WorkerManager] Sending init command');
        this.worker.postMessage({ action: 'init' });

      } catch (err: unknown) {
        console.error('[WorkerManager] Init error:', err);
        this.status = 'error';
        this.error = err instanceof Error ? err.message : 'Worker initialization failed';
        if (!this.initResolved && this.initReject) {
          this.initReject(new Error(this.error));
          this.initResolved = true;
        }
      }
    });
  }

  /**
   * 텍스트 생성 요청
   */
  async generate(text: string): Promise<string> {
    if (!this.worker) {
      console.error('[WorkerManager] Generate: Worker not initialized');
      throw new Error('Worker not initialized. Call initialize() first.');
    }

    if (this.status === 'loading') {
      console.warn('[WorkerManager] Generate: Model still loading');
      throw new Error('Model is still loading');
    }

    if (this.status === 'error') {
      console.error('[WorkerManager] Generate: Model in error state');
      throw new Error(this.error || 'Model error state');
    }

    console.log('[WorkerManager] Generate request:', text);
    this.status = 'generating';

    return new Promise((resolve, reject) => {
      const generateId = this.getGenerateId();
      this.pendingGenerates.set(generateId, { resolve, reject });
      console.log('[WorkerManager] Pending generates:', this.pendingGenerates.size);

      try {
        this.worker!.postMessage({ action: 'generate', text });
      } catch (err: unknown) {
        console.error('[WorkerManager] Generate post error:', err);
        this.pendingGenerates.delete(generateId);
        reject(err instanceof Error ? err : new Error('Generate request failed'));
      }
    });
  }

  /**
   * 모델 준비 상태 확인
   */
  isReady(): boolean {
    return this.status === 'ready';
  }

  /**
   * 현재 상태 반환
   */
  getStatus(): ModelStatus {
    return this.status;
  }

  /**
   * 진행률 반환 (0-1)
   */
  getProgress(): number {
    return this.progress;
  }

  /**
   * 에러 메시지 반환
   */
  getError(): string | null {
    return this.error;
  }

  /**
   * 워커 종료
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.status = 'idle';
    this.progress = 0;
    this.error = null;
    this.pendingGenerates.clear();
    this.initResolved = false;
  }

  /**
   * 생성 요청 ID 생성 (카운터 기반으로 동시 요청 충돌 방지)
   */
  private getGenerateId(): string {
    return `gen-${Date.now()}-${++generateCounter}`;
  }
}

// 싱글톤 인스턴스
let manager: WorkerManager | null = null;

/**
 * 모델 초기화 (워커 시작)
 */
export async function initializeModel(onProgress?: (progress: number, message?: string) => void): Promise<void> {
  if (!manager) {
    manager = new WorkerManager();
  }
  return manager.initialize(onProgress);
}

/**
 * 텍스트 생성
 */
export async function generateText(text: string): Promise<string> {
  if (!manager) {
    throw new Error('Model not initialized. Call initializeModel() first.');
  }
  return manager.generate(text);
}

/**
 * 모델 준비 상태 확인
 */
export function isModelReady(): boolean {
  return manager?.isReady() ?? false;
}

/**
 * 현재 상태 가져오기
 */
export function getModelStatus(): ModelStatus {
  return manager?.getStatus() ?? 'idle';
}

/**
 * 진행률 가져오기
 */
export function getModelProgress(): number {
  return manager?.getProgress() ?? 0;
}

/**
 * 에러 메시지 가져오기
 */
export function getModelError(): string | null {
  return manager?.getError() ?? null;
}

/**
 * 워커 종료
 */
export function terminateModel(): void {
  if (manager) {
    manager.terminate();
    manager = null;
  }
}
