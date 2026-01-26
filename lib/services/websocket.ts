/**
 * WebSocket 서비스 (MOCK)
 *
 * 실제 WebSocket 서버 없이 setTimeout으로 실시간 이벤트 시뮬레이션
 * 향후 실제 WebSocket 연동 시 인터페이스만 유지하며 내부 구현 교체
 */

import type { Message, ChatSession, Customer, SentimentData } from '../../types/api';
import { createLogger } from '../utils/logger';

const logger = createLogger('WebSocket');

// ============================================================================
// 타입 정의
// ============================================================================

/**
 * WebSocket 이벤트 타입 (송신)
 */
export enum WSOutgoingEvent {
  CHAT_SEND = 'chat:send',
  CHAT_READ = 'chat:read',
  CHAT_TYPING = 'chat:typing',
}

/**
 * WebSocket 이벤트 타입 (수신)
 */
export enum WSIncomingEvent {
  CHAT_MESSAGE = 'chat:message',
  CHAT_READ = 'chat:read',
  CHAT_TYPING = 'chat:typing',
  SYSTEM_CONNECTED = 'system:connected',
  SYSTEM_ERROR = 'system:error',
  AGENT_WAITING_UPDATE = 'agent:waiting_update',
  AGENT_NEW_CUSTOMER = 'agent:new_customer',
  AGENT_SENTIMENT_UPDATE = 'agent:sentiment_update',
  STATE_CHANGED = 'state:changed',
}

/**
 * WebSocket 메시지 기본 형식
 */
export interface WSMessage<T = unknown> {
  event: WSIncomingEvent | WSOutgoingEvent;
  data: T;
  timestamp: string;
}

// ============================================================================
// 수신 이벤트 데이터 타입
// ============================================================================

export interface ChatMessageData {
  sessionId: string;
  message: Message;
}

export interface ChatReadData {
  sessionId: string;
  messageId: string;
  userId: string;
}

export interface ChatTypingData {
  sessionId: string;
  userId: string;
  isTyping: boolean;
}

export interface SystemConnectedData {
  userId: string;
  connectionId: string;
}

export interface SystemErrorData {
  code: string;
  message: string;
  retryable: boolean;
}

export interface AgentWaitingUpdateData {
  waitingCount: number;
  consultingCount: number;
}

export interface AgentNewCustomerData {
  customer: Customer;
}

export interface AgentSentimentUpdateData {
  customerId: string;
  sentiment: SentimentData;
}

export interface StateChangedData {
  previousState: WebSocketState;
  currentState: WebSocketState;
  reconnectAttempt?: number;
  maxReconnectAttempts?: number;
  reason?: string;
}

// ============================================================================
// 송신 이벤트 데이터 타입
// ============================================================================

export interface ChatSendData {
  sessionId: string;
  text: string;
  attachment?: {
    type: 'image' | 'file' | 'voice';
    data?: string;
  };
}

export interface ChatReadSendData {
  sessionId: string;
  messageId: string;
}

export interface ChatTypingSendData {
  sessionId: string;
  isTyping: boolean;
}

// ============================================================================
// 이벤트 리스너 타입
// ============================================================================

type EventListener<T = unknown> = (data: T) => void;

interface WebSocketEventListeners {
  [WSIncomingEvent.CHAT_MESSAGE]: EventListener<ChatMessageData>;
  [WSIncomingEvent.CHAT_READ]: EventListener<ChatReadData>;
  [WSIncomingEvent.CHAT_TYPING]: EventListener<ChatTypingData>;
  [WSIncomingEvent.SYSTEM_CONNECTED]: EventListener<SystemConnectedData>;
  [WSIncomingEvent.SYSTEM_ERROR]: EventListener<SystemErrorData>;
  [WSIncomingEvent.AGENT_WAITING_UPDATE]: EventListener<AgentWaitingUpdateData>;
  [WSIncomingEvent.AGENT_NEW_CUSTOMER]: EventListener<AgentNewCustomerData>;
  [WSIncomingEvent.AGENT_SENTIMENT_UPDATE]: EventListener<AgentSentimentUpdateData>;
  [WSIncomingEvent.STATE_CHANGED]: EventListener<StateChangedData>;
}

// ============================================================================
// WebSocket 상태
// ============================================================================

export enum WebSocketState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

// ============================================================================
// WebSocket 서비스 클래스 (MOCK)
// ============================================================================

class WebSocketService {
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5; // 최대 재연결 시도 횟수
  private reconnectDelay = 1000; // 초기 재연결 지연 (ms)
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private mockTimers: ReturnType<typeof setTimeout>[] = [];

  private listeners: Map<WSIncomingEvent, Set<EventListener>> = new Map();

  // 인증 관련 상태
  private authToken: string | null = null;
  private tokenRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private tokenRefreshInterval = 5 * 60 * 1000; // 5분마다 토큰 갱신 확인

  // MOCK용 상태
  private mockConnected = false;
  private mockMessageInterval: ReturnType<typeof setInterval> | null = null;

  // ============================================================================
  // 상태 관리
  // ============================================================================

  getState(): WebSocketState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === WebSocketState.CONNECTED;
  }

  /**
   * 인증 토큰 설정
   */
  setAuthToken(token: string | null): void {
    const previousToken = this.authToken;
    this.authToken = token;

    // 토큰이 변경되고 연결된 상태면 재연결
    if (previousToken !== token && this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }

  /**
   * 내부 상태 변경 및 이벤트 발행
   */
  private setState(newState: WebSocketState, reason?: string): void {
    const previousState = this.state;
    if (previousState === newState) return;

    this.state = newState;

    // 상태 변경 이벤트 발행
    this.emit<StateChangedData>(WSIncomingEvent.STATE_CHANGED, {
      previousState,
      currentState: newState,
      reconnectAttempt: this.reconnectAttempts > 0 ? this.reconnectAttempts : undefined,
      maxReconnectAttempts: this.maxReconnectAttempts,
      reason,
    });
  }

  // ============================================================================
  // 연결 관리
  // ============================================================================

  /**
   * WebSocket 연결 시작
   */
  connect(url?: string): void {
    if (this.state === WebSocketState.CONNECTED || this.state === WebSocketState.CONNECTING) {
      logger.warn('Already connected or connecting');
      return;
    }

    logger.log('Connecting...', url ? `to ${url}` : '');

    this.setState(WebSocketState.CONNECTING, 'Connection initiated');

    // MOCK: 연결 지연 시뮬레이션
    setTimeout(() => {
      this.mockConnected = true;
      this.setState(WebSocketState.CONNECTED, 'Connection established');
      this.reconnectAttempts = 0;

      logger.log('Connected');

      // 연결 완료 이벤트 발송
      this.emit<SystemConnectedData>(WSIncomingEvent.SYSTEM_CONNECTED, {
        userId: 'mock-user-id',
        connectionId: 'mock-connection-id',
      });

      // 토큰 갱신 모니터링 시작
      this.startTokenRefreshMonitoring();

      // MOCK: 실시간 이벤트 시뮬레이션 시작
      this.startMockSimulation();
    }, 500);
  }

  /**
   * WebSocket 연결 종료
   */
  disconnect(): void {
    logger.log('Disconnecting...');

    this.stopMockSimulation();
    this.clearReconnectTimer();
    this.clearTokenRefreshTimer();

    this.mockConnected = false;
    this.setState(WebSocketState.DISCONNECTED, 'Disconnected by user');
    this.reconnectAttempts = 0;

    logger.log('Disconnected');
  }

  /**
   * 재연결 시도
   */
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached');
      this.setState(WebSocketState.ERROR, 'Max reconnect attempts reached');
      this.emit<SystemErrorData>(WSIncomingEvent.SYSTEM_ERROR, {
        code: 'MAX_RECONNECT_ATTEMPTS',
        message: '최대 재연결 시도 횟수를 초과했습니다.',
        retryable: false,
      });
      return;
    }

    this.setState(WebSocketState.RECONNECTING, `Reconnecting (attempt ${this.reconnectAttempts + 1})`);
    this.reconnectAttempts++;

    // 지수 백오프 (exponential backoff)
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    logger.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} (delay: ${delay}ms)`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 토큰 갱신 타이머 정리
   */
  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * 토큰 갱신 모니터링 시작
   */
  private startTokenRefreshMonitoring(): void {
    this.clearTokenRefreshTimer();

    // 5분마다 토큰 갱신 확인 (실제 구현에서는 토큰 만료 시간 확인)
    this.tokenRefreshTimer = setInterval(() => {
      // MOCK: 토큰 갱신 필요 여부 확인
      // 실제 구현에서는 authStore에서 토큰을 가져와서 갱신
      if (this.authToken) {
        logger.log('Token refresh check - token is valid');
        // 토큰이 만료되었으면 재연결
        // this.disconnect();
        // this.connect();
      }
    }, this.tokenRefreshInterval);
  }

  // ============================================================================
  // 메시지 송수신
  // ============================================================================

  /**
   * 서버로 메시지 전송
   */
  send<T>(event: WSOutgoingEvent, data: T): void {
    if (!this.isConnected()) {
      logger.warn('Cannot send message: not connected');
      return;
    }

    const message: WSMessage<T> = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    logger.log('Sent:', message);

    // MOCK: 수신 응답 시뮬레이션
    this.mockSendResponse(event, data);
  }

  // ============================================================================
  // 이벤트 리스너
  // ============================================================================

  /**
   * 이벤트 리스너 등록
   */
  on<T = unknown>(event: WSIncomingEvent, listener: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(listener as EventListener);

    // 구독 취소 함수 반환
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * 이벤트 리스너 제거
   */
  off<T = unknown>(event: WSIncomingEvent, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener);
    }
  }

  /**
   * 모든 리스너 제거
   */
  removeAllListeners(event?: WSIncomingEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 이벤트 발송
   */
  private emit<T>(event: WSIncomingEvent, data: T): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          logger.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // ============================================================================
  // MOCK 시뮬레이션
  // ============================================================================

  /**
   * 실시간 이벤트 시뮬레이션 시작
   */
  private startMockSimulation(): void {
    if (this.mockMessageInterval) return;

    logger.log('Starting mock simulation...');

    // 랜덤 간격(2-10초)으로 가상 이벤트 발생
    this.mockMessageInterval = setInterval(() => {
      if (!this.mockConnected) return;

      this.simulateRandomEvent();
    }, this.getRandomInterval(2000, 10000));
  }

  /**
   * 실시간 이벤트 시뮬레이션 종료
   */
  private stopMockSimulation(): void {
    if (this.mockMessageInterval) {
      clearInterval(this.mockMessageInterval);
      this.mockMessageInterval = null;
    }

    // 모든 mock 타이머 정리
    this.mockTimers.forEach((timer) => clearTimeout(timer));
    this.mockTimers = [];

    logger.log('Stopped mock simulation');
  }

  /**
   * 랜덤 이벤트 시뮬레이션
   */
  private simulateRandomEvent(): void {
    const events = [
      this.simulateChatMessage,
      this.simulateWaitingUpdate,
      this.simulateSentimentUpdate,
      this.simulateTyping,
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.call(this);
  }

  /**
   * 채팅 메시지 수신 시뮬레이션
   */
  private simulateChatMessage(): void {
    const mockMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: 'mock-session-1',
      sender: 'ai',
      senderId: 'ai-agent-1',
      senderName: 'AI Assistant',
      text: this.getRandomMockMessage(),
      timestamp: new Date().toISOString(),
      confidence: Math.random() > 0.3 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
      hasAudio: Math.random() > 0.7,
    };

    this.emit<ChatMessageData>(WSIncomingEvent.CHAT_MESSAGE, {
      sessionId: 'mock-session-1',
      message: mockMessage,
    });
  }

  /**
   * 대기 인원 업데이트 시뮬레이션
   */
  private simulateWaitingUpdate(): void {
    const waitingCount = Math.floor(Math.random() * 20) + 1;
    const consultingCount = Math.floor(Math.random() * 10) + 1;

    this.emit<AgentWaitingUpdateData>(WSIncomingEvent.AGENT_WAITING_UPDATE, {
      waitingCount,
      consultingCount,
    });
  }

  /**
   * 감정 상태 업데이트 시뮬레이션
   */
  private simulateSentimentUpdate(): void {
    const sentiments: Array<'positive' | 'neutral' | 'negative' | 'angry'> = ['positive', 'neutral', 'negative', 'angry'];
    const currentSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

    this.emit<AgentSentimentUpdateData>(WSIncomingEvent.AGENT_SENTIMENT_UPDATE, {
      customerId: 'mock-customer-1',
      sentiment: {
        customerId: 'mock-customer-1',
        customerName: 'Mock Customer',
        currentSentiment,
        sentimentScore: Math.floor(Math.random() * 200) - 100,
        sentimentHistory: [],
        keywords: [],
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      },
    });
  }

  /**
   * 입력 중 상태 시뮬레이션
   */
  private simulateTyping(): void {
    this.emit<ChatTypingData>(WSIncomingEvent.CHAT_TYPING, {
      sessionId: 'mock-session-1',
      userId: 'mock-user-id',
      isTyping: true,
    });

    // 3초后 입력 중 상태 해제
    const timer = setTimeout(() => {
      this.emit<ChatTypingData>(WSIncomingEvent.CHAT_TYPING, {
        sessionId: 'mock-session-1',
        userId: 'mock-user-id',
        isTyping: false,
      });
    }, 3000);

    this.mockTimers.push(timer);
  }

  /**
   * 송신 응답 시뮬레이션
   */
  private mockSendResponse<T>(event: WSOutgoingEvent, data: T): void {
    if (event === WSOutgoingEvent.CHAT_SEND) {
      const senddata = data as ChatSendData;

      // AI 응답 시뮬레이션 (1-3초 후)
      const timer = setTimeout(() => {
        const mockResponse: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sessionId: senddata.sessionId,
          sender: 'ai',
          senderId: 'ai-agent-1',
          senderName: 'AI Assistant',
          text: this.getRandomMockResponse(senddata.text),
          timestamp: new Date().toISOString(),
          confidence: 'high',
          hasAudio: true,
          quickReplies: this.getRandomQuickReplies(),
        };

        this.emit<ChatMessageData>(WSIncomingEvent.CHAT_MESSAGE, {
          sessionId: senddata.sessionId,
          message: mockResponse,
        });
      }, this.getRandomInterval(1000, 3000));

      this.mockTimers.push(timer);
    }
  }

  // ============================================================================
  // 유틸리티
  // ============================================================================

  private getRandomInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomMockMessage(): string {
    const messages = [
      '안녕하세요! 무엇을 도와드릴까요?',
      '계좌 조회를 원하시나요?',
      '대출 상품 안내가 필요하신가요?',
      '최근 거래 내역을 확인하시겠습니까?',
      '다른 서비스가 필요하시면 말씀해 주세요.',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private getRandomMockResponse(userMessage: string): string {
    const responses = [
      `네, "${userMessage}"에 대해 안내해 드리겠습니다.`,
      '요청하신 내용을 확인했습니다.',
      '추가 정보가 필요하시면 말씀해 주세요.',
      '잠시만 기다려 주시면 상세 정보를 안내해 드리겠습니다.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getRandomQuickReplies(): string[] {
    const allQuickReplies = [
      ['계좌 조회', '거래 내역', '대출 상품'],
      ['네', '아니오', '더 알아보기'],
      ['상담원 연결', '자동 응답', '메인 메뉴'],
    ];
    return allQuickReplies[Math.floor(Math.random() * allQuickReplies.length)];
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

export const wsService = new WebSocketService();

// ============================================================================
// 초기화
// ============================================================================

/**
 * 앱 시작 시 WebSocket 연결
 */
export function initializeWebSocket(url?: string): void {
  wsService.connect(url);
}

/**
 * 앱 종료 시 WebSocket 연결 해제
 */
export function cleanupWebSocket(): void {
  wsService.disconnect();
}
