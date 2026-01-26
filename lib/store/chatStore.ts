/**
 * 채팅 스토어 (Zustand)
 * 채팅 관련 상태 관리
 */

import { create } from 'zustand';
import type { ChatSession, Message } from '../../types/api';
import { chatApi } from '../api/mock/chatApi';

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

  // 계산된 속성
  currentSession: () => ChatSession | null;
  currentMessages: () => Message[];
  unreadCount: () => number;

  // 액션
  loadSessions: () => Promise<void>;
  selectSession: (sessionId: string) => Promise<void>;
  sendMessage: (text: string, attachment?: { type: 'image' | 'file' | 'voice'; data?: string }) => Promise<void>;
  sendQuickReply: (messageId: string, reply: string) => Promise<void>;
  createSession: (options?: { category?: string; title?: string }) => Promise<void>;
  uploadVoice: (audioBlob: Blob, duration: number) => Promise<void>;

  // 내부 액션
  setError: (error: string | null) => void;
  clearError: () => void;
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
}));

// ============================================================================
// 선택자 (Selectors)
// ============================================================================

export const selectCurrentSession = (state: ChatStore) => state.currentSession;
export const selectCurrentMessages = (state: ChatStore) => state.currentMessages;
export const selectUnreadCount = (state: ChatStore) => state.unreadCount;
export const selectIsLoading = (state: ChatStore) => state.isLoading;
export const selectIsSending = (state: ChatStore) => state.isSending;
export const selectError = (state: ChatStore) => state.error;
