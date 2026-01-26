/**
 * 상담사 스토어 (Zustand)
 * 상담사 대시보드 및 고객 관리 상태 관리
 */

import { create } from 'zustand';
import type { DashboardStats, Customer, SentimentData, AIProposal } from '../../types/api';
import { agentApi } from '../api/mock/agentApi';
import {
  wsService,
  WSIncomingEvent,
  type AgentWaitingUpdateData,
  type AgentNewCustomerData,
  type AgentSentimentUpdateData,
} from '../services/websocket';
import { createLogger } from '../utils/logger';

const logger = createLogger('AgentStore');

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
  waitingCount: number;
  consultingCount: number;

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

  // WebSocket 액션
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  // 내부 액션
  setError: (error: string | null) => void;
  clearError: () => void;

  // WebSocket 이벤트 핸들러
  handleWaitingUpdate: (data: AgentWaitingUpdateData) => void;
  handleNewCustomer: (data: AgentNewCustomerData) => void;
  handleSentimentUpdate: (data: AgentSentimentUpdateData) => void;
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
  waitingCount: 0,
  consultingCount: 0,

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

  // ============================================================================
  // WebSocket 액션
  // ============================================================================

  // 액션: WebSocket 연결
  connectWebSocket: () => {
    logger.log('[AgentStore] Connecting WebSocket...');

    // 이벤트 리스너 등록
    wsService.on<AgentWaitingUpdateData>(WSIncomingEvent.AGENT_WAITING_UPDATE, get().handleWaitingUpdate);
    wsService.on<AgentNewCustomerData>(WSIncomingEvent.AGENT_NEW_CUSTOMER, get().handleNewCustomer);
    wsService.on<AgentSentimentUpdateData>(WSIncomingEvent.AGENT_SENTIMENT_UPDATE, get().handleSentimentUpdate);
  },

  // 액션: WebSocket 연결 해제
  disconnectWebSocket: () => {
    logger.log('[AgentStore] Disconnecting WebSocket...');

    // 이벤트 리스너 제거
    wsService.off(WSIncomingEvent.AGENT_WAITING_UPDATE, get().handleWaitingUpdate);
    wsService.off(WSIncomingEvent.AGENT_NEW_CUSTOMER, get().handleNewCustomer);
    wsService.off(WSIncomingEvent.AGENT_SENTIMENT_UPDATE, get().handleSentimentUpdate);
  },

  // ============================================================================
  // WebSocket 이벤트 핸들러
  // ============================================================================

  // 핸들러: 대기 인원 업데이트
  handleWaitingUpdate: (data: AgentWaitingUpdateData) => {
    const { waitingCount, consultingCount } = data;

    logger.log('[AgentStore] Received waiting update:', data);

    set({
      waitingCount,
      consultingCount,
    });

    // 통계 업데이트 (있는 경우)
    const { stats } = get();
    if (stats) {
      set({
        stats: {
          ...stats,
          realTime: {
            ...stats.realTime,
            waitingCustomers: waitingCount,
            activeConsults: consultingCount,
          },
        },
      });
    }
  },

  // 핸들러: 새 고객 연결
  handleNewCustomer: (data: AgentNewCustomerData) => {
    const { customer } = data;

    logger.log('[AgentStore] Received new customer:', data);

    const { customers } = get();

    // 이미 존재하는 고객이면 업데이트, 없으면 추가
    const existingIndex = customers.findIndex((c) => c.id === customer.id);
    if (existingIndex >= 0) {
      // 기존 고객 업데이트
      set({
        customers: customers.map((c, index) =>
          index === existingIndex ? customer : c
        ),
      });
    } else {
      // 새 고객 추가
      set({
        customers: [customer, ...customers],
      });
    }
  },

  // 핸들러: 감정 상태 업데이트
  handleSentimentUpdate: (data: AgentSentimentUpdateData) => {
    const { customerId, sentiment } = data;

    logger.log('[AgentStore] Received sentiment update:', data);

    const { sentiments, customers } = get();

    // 감정 데이터 업데이트
    set({
      sentiments: {
        ...sentiments,
        [customerId]: sentiment,
      },
    });

    // 고객 정보 업데이트 (감정 상태 반영)
    // Customer 타입에 sentiment 필드가 없으므로 comments
    // 고객 목록은 실제 API를 통해서만 업데이트되도록 함
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
