/**
 * AgentDashboard 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock dependencies
vi.mock('../../lib/store/agentStore', () => {
  const mockState = {
    stats: {
      today: {
        consultCount: 150,
        avgDuration: '5분 30초',
        satisfaction: 4.8,
        change: {
          consultCount: '+12%',
          avgDuration: '-8%',
          satisfaction: '+0.3',
        },
      },
      totalConsultations: 1500,
      activeConsultations: 3,
    },
    customers: [
      { id: 'customer-1', name: '김미래', status: 'consulting', title: '대출 상담' },
    ],
    teamRanking: [],
    notices: [],
    loadStats: vi.fn(),
    loadCustomers: vi.fn(),
    loadTeamRanking: vi.fn(),
    loadNotices: vi.fn(),
    selectCustomer: vi.fn(),
  };
  const useAgentStore = vi.fn((selector) => {
    if (selector) return selector(mockState);
    return mockState;
  });
  return { useAgentStore };
});

vi.mock('../../lib/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    user: { name: '테스트 상담사' },
  })),
}));

describe('AgentDashboard', () => {
  it('컴포넌트를 임포트할 수 있어야 함', async () => {
    const { AgentDashboard } = await import('./AgentDashboard');
    expect(AgentDashboard).toBeDefined();
  });

  it('통계 카드가 표시되어야 함 (T14)', async () => {
    const { AgentDashboard } = await import('./AgentDashboard');
    render(<AgentDashboard />);

    // 통계 카드 확인 (숫자나 통계 관련 텍스트)
    const stats = screen.queryAllByText(/\d+/, { exact: false });
    expect(stats.length).toBeGreaterThan(0);
  });

  it('고객 목록이 표시되어야 함 (T14)', async () => {
    const { AgentDashboard } = await import('./AgentDashboard');
    render(<AgentDashboard />);

    // 고객 이름 확인
    expect(screen.getByText(/김미래|customer/i)).toBeDefined();
  });
});
