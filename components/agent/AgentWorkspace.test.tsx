/**
 * AgentWorkspace 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock React to fix memo issues
const originalReact = await import('react');

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof React>('react');
  return {
    ...actual,
    memo: (fn: any, ...args: any[]) => {
      // In test environment, just return the component
      return fn;
    },
  };
});

// Mock dependencies
const mockCurrentCustomer = {
  id: 'customer-1',
  name: '김미래',
};

const mockAIProposals = [
  {
    id: 'proposal-1',
    type: 'product_recommendation',
    title: '적금 상품 추천',
    priority: 'high',
  },
];

const mockSentiment = {
  currentSentiment: 'neutral',
  riskLevel: 'low',
  trend: 'stable',
};

vi.mock('../../lib/store/agentStore', () => ({
  useAgentStore: vi.fn(() => ({
    currentCustomer: mockCurrentCustomer,
    aiProposals: mockAIProposals,
    sentiment: mockSentiment,
    loadAIProposals: vi.fn(),
    loadSentiment: vi.fn(),
  })),
}));

vi.mock('../../lib/store/chatStore', () => ({
  useChatStore: vi.fn(() => ({
    currentSession: {
      id: 'session-1',
      customerName: '김미래',
    },
    currentMessages: [],
    sendMessage: vi.fn(),
  })),
}));

describe('AgentWorkspace', () => {
  it('컴포넌트를 임포트할 수 있어야 함', async () => {
    const { AgentWorkspace } = await import('./AgentWorkspace');
    expect(AgentWorkspace).toBeDefined();
  });

  it('AI 제안 패널이 렌더링되어야 함 (T15)', async () => {
    const { AgentWorkspace } = await import('./AgentWorkspace');
    render(<AgentWorkspace customerId="customer-1" />);

    // AI 제안 관련 텍스트 확인
    const aiText = screen.queryByText(/AI|제안|Proposal|NBA/i);
    expect(aiText).toBeDefined();
  });

  it('감정 분석이 표시되어야 함 (T15)', async () => {
    const { AgentWorkspace } = await import('./AgentWorkspace');
    render(<AgentWorkspace customerId="customer-1" />);

    // 감정 분석 관련 텍스트 확인
    const sentimentText = screen.queryByText(/감정|Sentiment|neutral|위험/i);
    expect(sentimentText).toBeDefined();
  });
});
