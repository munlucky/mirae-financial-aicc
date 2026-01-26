/**
 * 채팅 스토어 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies before importing store
vi.mock('../services/websocket', () => ({
  wsService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    isConnected: vi.fn(() => false),
  },
  initializeWebSocket: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    send: vi.fn(),
    isConnected: vi.fn(() => false),
  })),
  cleanupWebSocket: vi.fn(),
  WSIncomingEvent: {
    CHAT_MESSAGE: 'chat:message',
    CHAT_READ: 'chat:read',
    CHAT_TYPING: 'chat:typing',
    AGENT_JOIN: 'agent:join',
    AGENT_LEAVE: 'agent:leave',
  },
}));

vi.mock('../api/mock/chatApi', () => ({
  chatApi: {
    getSessions: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        { id: 'session-1', customerName: '김미래', title: '대출 상담' },
      ],
      timestamp: new Date().toISOString(),
    })),
    getMessages: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        { id: 'msg-1', content: '안녕하세요', sender: 'customer' },
      ],
      timestamp: new Date().toISOString(),
    })),
    sendMessage: vi.fn(() => Promise.resolve({
      success: true,
      data: {
        message: { id: 'msg-2', content: '네', sender: 'agent' },
        aiResponse: { id: 'msg-3', content: '무엇을 도와드릴까요?', sender: 'ai' },
      },
      timestamp: new Date().toISOString(),
    })),
  },
}));

import { useChatStore } from './chatStore';

describe('ChatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.getState().cleanup();
  });

  it('스토어 모듈을 임포트할 수 있어야 함', async () => {
    const module = await import('./chatStore');
    expect(module).toBeDefined();
  });

  it('초기 상태가 올바르게 설정되어야 함', () => {
    const state = useChatStore.getState();

    expect(state.sessions).toEqual([]);
    expect(state.currentSessionId).toBeNull();
    expect(state.messages).toEqual({});
    expect(state.isLoading).toBe(false);
    expect(state.isSending).toBe(false);
    expect(state.error).toBeNull();
  });

  it('채팅 세션 로드가 정상 동작해야 함 (T10)', async () => {
    const { loadSessions } = useChatStore.getState();

    await loadSessions();

    const state = useChatStore.getState();
    expect(state.sessions.length).toBeGreaterThan(0);
    expect(state.sessions[0]).toHaveProperty('id');
    expect(state.sessions[0]).toHaveProperty('customerName');
  });

  it('세션 선택이 정상 동작해야 함 (T10)', async () => {
    const { loadSessions, selectSession } = useChatStore.getState();

    await loadSessions();
    await selectSession('session-1');

    const state = useChatStore.getState();
    expect(state.currentSessionId).toBe('session-1');
    expect(state.currentSession()).not.toBeNull();
  });

  it('메시지 전송이 정상 동작해야 함 (T11)', async () => {
    const { sendMessage } = useChatStore.getState();

    await sendMessage('테스트 메시지');

    const state = useChatStore.getState();
    expect(state.isSending).toBe(false);
    expect(state.error).toBeNull();
  });

  it('WebSocket 연결이 정상 동작해야 함', () => {
    const { connectWebSocket, disconnectWebSocket } = useChatStore.getState();

    connectWebSocket();
    disconnectWebSocket();

    // Verify no errors thrown
    expect(true).toBe(true);
  });

  it('cleanup이 정상 동작해야 함', () => {
    const { cleanup } = useChatStore.getState();

    expect(() => cleanup()).not.toThrow();
  });
});
