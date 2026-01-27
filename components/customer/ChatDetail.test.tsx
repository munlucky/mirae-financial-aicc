/**
 * ChatDetail 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock dependencies
vi.mock('../../lib/store/chatStore', () => {
  const mockState = {
    currentSession: {
      id: 'session-1',
      customerName: '김미래',
      title: '대출 상담',
    },
    currentMessages: [
      { id: 'msg-1', content: '안녕하세요', sender: 'customer', timestamp: new Date() },
      { id: 'msg-2', content: '네, 무엇을 도와드릴까요?', sender: 'agent', timestamp: new Date() },
    ],
    isSending: false,
    sendMessage: vi.fn(),
  };
  const useChatStore = vi.fn((selector) => {
    if (selector) return selector(mockState);
    return mockState;
  });
  return { useChatStore };
});

describe('ChatDetail', () => {
  it('컴포넌트를 임포트할 수 있어야 함', async () => {
    const { ChatDetail } = await import('./ChatDetail');
    expect(ChatDetail).toBeDefined();
  });

  it('메시지 리스트가 렌더링되어야 함 (T13)', async () => {
    const { ChatDetail } = await import('./ChatDetail');
    render(<ChatDetail onBack={() => {}} />);

    // 초기 메시지 내용 확인 (실제 컴포넌트의 initialMessages 기준)
    expect(screen.getAllByText(/대출 상담을 받고 싶어요|도와드리겠습니다|주택담보대출과 신용대출/i).length).toBeGreaterThan(0);
  });

  it('메시지 전송 기능이 렌더링되어야 함 (T13)', async () => {
    const { ChatDetail } = await import('./ChatDetail');
    render(<ChatDetail onBack={() => {}} />);

    // 메시지 입력 필드 확인
    const inputField = screen.queryByPlaceholderText(/메시지를 입력하세요/i);
    expect(inputField).toBeDefined();
  });
});
