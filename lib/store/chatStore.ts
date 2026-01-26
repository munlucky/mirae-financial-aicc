/**
 * 채팅 스토어 (Zustand)
 * 채팅 관련 상태 관리
 */

import { create } from 'zustand';
import type { ChatSession, Message } from '../../types/api';
import { chatApi } from '../api/mock/chatApi';
import {
  wsService,
  WSIncomingEvent,
  type ChatMessageData,
  type ChatReadData,
  type ChatTypingData,
  initializeWebSocket,
  cleanupWebSocket,
} from '../services/websocket';
import { createLogger } from '../utils/logger';

const logger = createLogger('ChatStore');

// ============================================================================
// 타이머 관리 (setTimeout 누수 방지)
// ============================================================================
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearTypingTimer = (key: string) => {
  const timer = typingTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    typingTimers.delete(key);
  }
};

// ============================================================================
// 스토어 상태 타입
// ============================================================================

interface ChatStore {
  // 상태
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  typingUsers: Record<string, Set<string>>; // sessionId -> Set of userIds

  // 계산된 속성
  currentSession: () => ChatSession | null;
  currentMessages: () => Message[];
  unreadCount: () => number;
  isTyping: () => boolean;

  // 액션
  loadSessions: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  sendMessage: (text: string, attachment?: { type: 'image' | 'file' | 'voice'; data?: string }) => Promise<void>;
  sendQuickReply: (messageId: string, reply: string) => Promise<void>;
  createSession: (options?: { category?: string; title?: string }) => Promise<void>;
  uploadVoice: (audioBlob: Blob, duration: number) => Promise<void>;

  // WebSocket 액션
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  // 내부 액션
  setError: (error: string | null) => void;
  clearError: () => void;

  // 정리 액션
  cleanup: () => void;

  // WebSocket 이벤트 핸들러
  handleChatMessage: (data: ChatMessageData) => void;
  handleChatRead: (data: ChatReadData) => void;
  handleChatTyping: (data: ChatTypingData) => void;
}

// ============================================================================
// 스토어 생성
// ============================================================================

export const useChatStore = create<ChatStore>((set, get) => ({
  // 초기 상태
  sessions: [],
  currentSessionId: null,
  messages: {},
  isLoading: false,
  isSending: false,
  error: null,
  typingUsers: {},

  // 계산된 속성 (게터)
  currentSession() {
    const { sessions, currentSessionId } = get();
    return sessions.find((s) => s.id === currentSessionId) || null;
  },

  currentMessages() {
    const { messages, currentSessionId } = get();
    return currentSessionId ? (messages[currentSessionId] || []) : [];
  },

  unreadCount() {
    const { sessions } = get();
    return sessions.reduce((sum, s) => sum + s.unreadCount, 0);
  },

  isTyping() {
    const { typingUsers, currentSessionId } = get();
    if (!currentSessionId) return false;
    const typingSet = typingUsers[currentSessionId];
    return typingSet ? typingSet.size > 0 : false;
  },

  // 액션: 세션 목록 로드
  loadSessions: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await chatApi.getSessions();

      set({
        sessions: response.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `세션 목록을 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 세션 선택
  selectSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      // 이미 메시지가 있으면 스킵
      const { messages, sessions } = get();
      if (!messages[sessionId]) {
        const response = await chatApi.getMessages(sessionId);

        set({
          messages: {
            ...messages,
            [sessionId]: response.data,
          },
        });
      }

      // 읽지 않은 메시지 카운트 초기화
      set({
        currentSessionId: sessionId,
        sessions: sessions.map((s) =>
          s.id === sessionId ? { ...s, unreadCount: 0 } : s
        ),
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `메시지를 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 메시지 전송
  sendMessage: async (text: string, attachment?) => {
    const { currentSessionId, messages, sessions } = get();

    if (!currentSessionId) {
      set({ error: '선택된 세션이 없습니다.' });
      return;
    }

    set({ isSending: true, error: null });

    try {
      const response = await chatApi.sendMessage(currentSessionId, { text, attachment });

      const currentMessages = messages[currentSessionId] || [];

      set({
        messages: {
          ...messages,
          [currentSessionId]: [...currentMessages, response.data.message],
        },
      });

      // AI 응답이 있으면 추가
      if (response.data.aiResponse) {
        set({
          messages: {
            ...messages,
            [currentSessionId]: [...currentMessages, response.data.message, response.data.aiResponse],
          },
        });
      }

      // 세션 미리보기 업데이트
      set({
        sessions: sessions.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                preview: response.data.aiResponse?.text || response.data.message.text,
                lastMessageTime: response.data.message.timestamp,
              }
            : s
        ),
        isSending: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `메시지 전송에 실패했습니다. ${errorMessage}`,
        isSending: false,
      });
    }
  },

  // 액션: 빠른 답변 전송
  sendQuickReply: async (messageId: string, reply: string) => {
    const { currentSessionId, messages, sessions } = get();

    if (!currentSessionId) {
      set({ error: '선택된 세션이 없습니다.' });
      return;
    }

    set({ isSending: true, error: null });

    try {
      const response = await chatApi.sendQuickReply(messageId, { reply });

      const currentMessages = messages[currentSessionId] || [];

      set({
        messages: {
          ...messages,
          [currentSessionId]: [...currentMessages, response.data.message, response.data.aiResponse!],
        },
        sessions: sessions.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                preview: response.data.aiResponse?.text || response.data.message.text,
                lastMessageTime: response.data.message.timestamp,
              }
            : s
        ),
        isSending: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `빠른 답변 전송에 실패했습니다. ${errorMessage}`,
        isSending: false,
      });
    }
  },

  // 액션: 새 세션 생성
  createSession: async (options?) => {
    set({ isLoading: true, error: null });

    try {
      const response = await chatApi.createSession(options);

      set({
        sessions: [response.data, ...get().sessions],
        currentSessionId: response.data.id,
        messages: {
          ...get().messages,
          [response.data.id]: [],
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `세션 생성에 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 음성 업로드
  uploadVoice: async (audioBlob: Blob, duration: number) => {
    const { currentSessionId, messages, sessions } = get();

    if (!currentSessionId) {
      set({ error: '선택된 세션이 없습니다.' });
      return;
    }

    set({ isSending: true, error: null });

    try {
      const response = await chatApi.uploadVoice(currentSessionId, audioBlob, duration);

      const currentMessages = messages[currentSessionId] || [];

      set({
        messages: {
          ...messages,
          [currentSessionId]: [...currentMessages, response.data.message],
        },
        sessions: sessions.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                preview: response.data.transcription || '음성 메시지',
                lastMessageTime: response.data.message.timestamp,
              }
            : s
        ),
        isSending: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `음성 업로드에 실패했습니다. ${errorMessage}`,
        isSending: false,
      });
    }
  },

  // 내부 액션: 에러 설정
  setError: (error: string | null) => {
    set({ error });
  },

  // 내부 액션: 에러 초기화
  clearError: () => {
    set({ error: null });
  },

  // ============================================================================
  // WebSocket 액션
  // ============================================================================

  // 액션: WebSocket 연결
  connectWebSocket: () => {
    logger.log('[ChatStore] Connecting WebSocket...');

    // WebSocket 서비스 연결
    initializeWebSocket();

    // 이벤트 리스너 등록
    wsService.on<ChatMessageData>(WSIncomingEvent.CHAT_MESSAGE, get().handleChatMessage);
    wsService.on<ChatReadData>(WSIncomingEvent.CHAT_READ, get().handleChatRead);
    wsService.on<ChatTypingData>(WSIncomingEvent.CHAT_TYPING, get().handleChatTyping);
  },

  // 액션: WebSocket 연결 해제
  disconnectWebSocket: () => {
    logger.log('[ChatStore] Disconnecting WebSocket...');

    // 이벤트 리스너 제거
    wsService.off(WSIncomingEvent.CHAT_MESSAGE, get().handleChatMessage);
    wsService.off(WSIncomingEvent.CHAT_READ, get().handleChatRead);
    wsService.off(WSIncomingEvent.CHAT_TYPING, get().handleChatTyping);

    // WebSocket 서비스 연결 해제
    cleanupWebSocket();
  },

  // ============================================================================
  // WebSocket 이벤트 핸들러
  // ============================================================================

  // 핸들러: 새 메시지 수신
  handleChatMessage: (data: ChatMessageData) => {
    const { sessionId, message } = data;
    const { messages, sessions, currentSessionId } = get();

    logger.log('[ChatStore] Received message:', data);

    // 메시지 추가
    const currentMessages = messages[sessionId] || [];
    set({
      messages: {
        ...messages,
        [sessionId]: [...currentMessages, message],
      },
    });

    // 세션 미리보기 업데이트
    set({
      sessions: sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              preview: message.text,
              lastMessageTime: message.timestamp,
              // 현재 세션이 아니면 읽지 않은 카운트 증가
              unreadCount: s.id === currentSessionId ? s.unreadCount : s.unreadCount + 1,
            }
          : s
      ),
    });
  },

  // 핸들러: 읽음 상태 수신
  handleChatRead: (data: ChatReadData) => {
    const { sessionId, messageId } = data;
    const { messages } = get();

    logger.log('[ChatStore] Received read receipt:', data);

    // 메시지 읽음 상태 업데이트
    const sessionMessages = messages[sessionId] || [];
    const updatedMessages = sessionMessages.map((msg) =>
      msg.id === messageId ? { ...msg, read: true } : msg
    );

    set({
      messages: {
        ...messages,
        [sessionId]: updatedMessages,
      },
    });
  },

  // 핸들러: 입력 중 상태 수신
  handleChatTyping: (data: ChatTypingData) => {
    const { sessionId, userId, isTyping } = data;
    const { typingUsers } = get();

    logger.log('[ChatStore] Received typing indicator:', data);

    // 기존 타이머 정리
    const timerKey = `${sessionId}:${userId}`;
    clearTypingTimer(timerKey);

    set({
      typingUsers: {
        ...typingUsers,
        [sessionId]: isTyping
          ? new Set([...(typingUsers[sessionId] || []), userId])
          : new Set([...(typingUsers[sessionId] || [])].filter((id) => id !== userId)),
      },
    });

    // 3초 후 자동 해제 (안전장치)
    if (isTyping) {
      const timer = setTimeout(() => {
        get().handleChatTyping({ sessionId, userId, isTyping: false });
        typingTimers.delete(timerKey);
      }, 3000);
      typingTimers.set(timerKey, timer);
    }
  },

  // 정리: 모든 타이머 정리
  cleanup: () => {
    logger.log('[ChatStore] Cleanup: clearing all typing timers');
    typingTimers.forEach((timer) => clearTimeout(timer));
    typingTimers.clear();
    get().disconnectWebSocket();
  },
}));

// ============================================================================
// 선택자 (Selectors)
// ============================================================================

export const selectCurrentSession = (state: ChatStore) => state.currentSession;
export const selectCurrentMessages = (state: ChatStore) => state.currentMessages;
export const selectUnreadCount = (state: ChatStore) => state.unreadCount;
export const selectIsTyping = (state: ChatStore) => state.isTyping;
export const selectIsLoading = (state: ChatStore) => state.isLoading;
export const selectIsSending = (state: ChatStore) => state.isSending;
export const selectError = (state: ChatStore) => state.error;
