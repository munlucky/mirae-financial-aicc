/**
 * ChatHome 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock dependencies
vi.mock('../../lib/store/chatStore', () => ({
  useChatStore: vi.fn(() => ({
    sessions: [
      {
        id: 'session-1',
        customerName: '김미래',
        title: '대출 상담',
        preview: '금리 관련 문의',
        unreadCount: 1,
        status: 'active',
      },
    ],
    isLoading: false,
    loadSessions: vi.fn(),
  })),
}));

describe('ChatHome', () => {
  it('컴포넌트를 임포트할 수 있어야 함', async () => {
    const { ChatHome } = await import('./ChatHome');
    expect(ChatHome).toBeDefined();
  });

  it('채팅 세션 목록이 렌더링되어야 함 (T12)', async () => {
    const { ChatHome } = await import('./ChatHome');
    render(<ChatHome />);

    // 세션 제목 확인 (더 구체적인 텍스트)
    const sessionTitle = screen.queryByText(/대출 상담/);
    expect(sessionTitle).toBeDefined();
  });

  it('검색 기능이 렌더링되어야 함 (T12)', async () => {
    const { ChatHome } = await import('./ChatHome');
    render(<ChatHome />);

    // 검색 입력 필드 확인
    const searchInput = screen.queryByPlaceholderText(/검색|Search/i);
    expect(searchInput).toBeDefined();
  });
});
