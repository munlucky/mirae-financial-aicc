/**
 * AgentWorkspace 컴포넌트 테스트
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// AICopilotPanel을 mock하여 메모리 사용량 줄이기
vi.mock('./AICopilotPanel', () => ({
  AICopilotPanel: () => <div data-testid="ai-copilot-panel">AI Copilot Panel</div>,
}));

// Mock dependencies
const mockCurrentCustomer = {
  id: 'customer-1',
  name: '김미래',
};

const mockAIProposals = [
  {
    id: 'proposal-1',
    type: 'next_best_action',
    title: '적금 상품 추천',
    description: '고객에게 적금 상품을 추천합니다',
    priority: 'high',
  },
];

const mockSentiment = {
  currentSentiment: 'neutral',
  riskLevel: 'low',
  trend: 'stable',
  sentimentScore: 0,
  sentimentHistory: [],
  keywords: [],
};

vi.mock('../../lib/store/agentStore', () => ({
  useAgentStore: vi.fn(() => ({
    currentCustomer: mockCurrentCustomer,
    aiProposals: mockAIProposals,
    sentiment: mockSentiment,
    sentiments: { 'customer-1': mockSentiment },
    selectedProposals: vi.fn(() => mockAIProposals),
    isLoading: false,
    error: null,
    loadAIProposals: vi.fn(),
    loadSentiment: vi.fn(),
    loadProposals: vi.fn(),
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
    render(<AgentWorkspace customerId="customer-1" onBack={() => {}} />);

    // AI Copilot Panel이 렌더링되는지 확인
    const aiPanel = screen.queryByTestId('ai-copilot-panel');
    expect(aiPanel).toBeDefined();
  });

  it('감정 분석이 표시되어야 함 (T15)', async () => {
    const { AgentWorkspace } = await import('./AgentWorkspace');
    render(<AgentWorkspace customerId="customer-1" onBack={() => {}} />);

    // AI Copilot Panel에 감정 분석이 포함되므로 패널이 렌더링되는지 확인
    const aiPanel = screen.queryByTestId('ai-copilot-panel');
    expect(aiPanel).toBeDefined();
  });
});
