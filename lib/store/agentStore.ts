/**
 * 상담사 스토어 (Zustand)
 * 상담사 대시보드 및 고객 관리 상태 관리
 */

import { create } from 'zustand';
import type { DashboardStats, Customer, SentimentData, AIProposal } from '../../types/api';
import { agentApi } from '../api/mock/agentApi';

// ============================================================================
// 스토어 상태 타입
// ============================================================================

interface AgentStore {
  // 상태
  stats: DashboardStats | null;
  customers: Customer[];
  selectedCustomerId: string | null;
  sentiments: Record<string, SentimentData>;
  proposals: Record<string, AIProposal[]>;
  teamRanking: Array<{
    rank: number;
    name: string;
    consultCount: number;
    satisfaction: number;
  }> | null;
  notices: Array<{
    id: string;
    title: string;
    content: string;
    type: 'system' | 'update' | 'urgent';
    createdAt: string;
  }> | null;

  isLoading: boolean;
  error: string | null;

  // 계산된 속성
  selectedCustomer: () => Customer | null;
  selectedSentiment: () => SentimentData | null;
  selectedProposals: () => AIProposal[];
  consultingCustomers: () => Customer[];
  waitingCustomers: () => Customer[];

  // 액션
  loadStats: () => Promise<void>;
  loadCustomers: (options?: {
    status?: 'consulting' | 'waiting' | 'completed';
    segment?: 'vip' | 'general' | 'new';
    search?: string;
  }) => Promise<void>;
  selectCustomer: (customerId: string) => void;
  loadSentiment: (customerId: string) => Promise<void>;
  loadProposals: (customerId: string) => Promise<void>;
  loadTeamRanking: () => Promise<void>;
  loadNotices: () => Promise<void>;

  // 내부 액션
  setError: (error: string | null) => void;
  clearError: () => void;
}

// ============================================================================
// 스토어 생성
// ============================================================================

export const useAgentStore = create<AgentStore>((set, get) => ({
  // 초기 상태
  stats: null,
  customers: [],
  selectedCustomerId: null,
  sentiments: {},
  proposals: {},
  teamRanking: null,
  notices: null,
  isLoading: false,
  error: null,

  // 계산된 속성 (게터)
  selectedCustomer() {
    const { customers, selectedCustomerId } = get();
    return customers.find((c) => c.id === selectedCustomerId) || null;
  },

  selectedSentiment() {
    const { sentiments, selectedCustomerId } = get();
    return selectedCustomerId ? (sentiments[selectedCustomerId] || null) : null;
  },

  selectedProposals() {
    const { proposals, selectedCustomerId } = get();
    return selectedCustomerId ? (proposals[selectedCustomerId] || []) : [];
  },

  consultingCustomers() {
    return get().customers.filter((c) => c.status === 'consulting');
  },

  waitingCustomers() {
    return get().customers.filter((c) => c.status === 'waiting');
  },

  // 액션: 통계 로드
  loadStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await agentApi.getStats();

      set({
        stats: response.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `통계를 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 고객 목록 로드
  loadCustomers: async (options?) => {
    set({ isLoading: true, error: null });

    try {
      const response = await agentApi.getCustomers(options);

      set({
        customers: response.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `고객 목록을 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 고객 선택
  selectCustomer: (customerId: string) => {
    set({ selectedCustomerId: customerId });
  },

  // 액션: 감정 분석 로드
  loadSentiment: async (customerId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await agentApi.getSentiment(customerId);

      set({
        sentiments: {
          ...get().sentiments,
          [customerId]: response.data,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `감정 분석을 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: AI 제안 로드
  loadProposals: async (customerId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await agentApi.getAIProposals(customerId);

      set({
        proposals: {
          ...get().proposals,
          [customerId]: response.data.proposals,
        },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `AI 제안을 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 팀 랭킹 로드
  loadTeamRanking: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await agentApi.getTeamRanking();

      set({
        teamRanking: response.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `팀 랭킹을 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });
    }
  },

  // 액션: 공지사항 로드
  loadNotices: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await agentApi.getNotices();

      set({
        notices: response.data,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({
        error: `공지사항을 불러오는데 실패했습니다. ${errorMessage}`,
        isLoading: false,
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

export const selectStats = (state: AgentStore) => state.stats;
export const selectCustomers = (state: AgentStore) => state.customers;
export const selectSelectedCustomer = (state: AgentStore) => state.selectedCustomer;
export const selectSelectedSentiment = (state: AgentStore) => state.selectedSentiment;
export const selectSelectedProposals = (state: AgentStore) => state.selectedProposals;
export const selectConsultingCustomers = (state: AgentStore) => state.consultingCustomers;
export const selectWaitingCustomers = (state: AgentStore) => state.waitingCustomers;
export const selectTeamRanking = (state: AgentStore) => state.teamRanking;
export const selectNotices = (state: AgentStore) => state.notices;
export const selectIsLoading = (state: AgentStore) => state.isLoading;
export const selectError = (state: AgentStore) => state.error;
