/**
 * 상담사 MOCK API
 * 상담사 대시보드, 고객 관리, AI 제안 등의 MOCK 구현
 */

import type {
  ApiResponse,
  DashboardStats,
  Customer,
  SentimentData,
  AIProposal,
  AIProposalsResponse,
} from '../../../types/api';

// ============================================================================
// MOCK 데이터
// ============================================================================

const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    name: '김미래',
    phone: '01012345678',
    maskedPhone: '010****5678',
    email: 'mirae@example.com',
    maskedEmail: 'mir***@example.com',
    segment: 'vip',
    riskLevel: 'low',
    lastConsultDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    consultCount: 15,
    status: 'consulting',
    tags: ['우수고객', '장기고객'],
    avatar: '👤',
  },
  {
    id: 'customer-2',
    name: '이철수',
    phone: '01023456789',
    maskedPhone: '010****6789',
    segment: 'general',
    riskLevel: 'medium',
    lastConsultDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    consultCount: 5,
    status: 'waiting',
    tags: ['신규'],
    avatar: '👤',
  },
  {
    id: 'customer-3',
    name: '박영희',
    phone: '01034567890',
    maskedPhone: '010****7890',
    email: 'younghee@example.com',
    maskedEmail: 'you***@example.com',
    segment: 'vip',
    riskLevel: 'low',
    lastConsultDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    consultCount: 23,
    status: 'consulting',
    tags: ['우수고객', '정회원'],
    avatar: '👤',
  },
  {
    id: 'customer-4',
    name: '최수진',
    phone: '01045678901',
    maskedPhone: '010****8901',
    segment: 'new',
    riskLevel: 'high',
    consultCount: 1,
    status: 'waiting',
    tags: ['긴급'],
    avatar: '👤',
  },
  {
    id: 'customer-5',
    name: '정준호',
    phone: '01056789012',
    maskedPhone: '010****9012',
    email: 'junho@example.com',
    maskedEmail: 'jun***@example.com',
    segment: 'general',
    riskLevel: 'low',
    lastConsultDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    consultCount: 3,
    status: 'completed',
    avatar: '👤',
  },
];

const mockSentiments: Record<string, SentimentData> = {
  'customer-1': {
    customerId: 'customer-1',
    customerName: '김미래',
    currentSentiment: 'positive',
    sentimentScore: 75,
    sentimentHistory: [
      { time: '10:00', score: 50, emotion: 'neutral' },
      { time: '10:15', score: 60, emotion: 'positive' },
      { time: '10:30', score: 75, emotion: 'positive' },
      { time: '10:45', score: 70, emotion: 'positive' },
    ],
    keywords: ['금리', '상환', '기간'],
    riskLevel: 'low',
    suggestedActions: ['추가 상품 추천', '만족도 조사 요청'],
  },
  'customer-2': {
    customerId: 'customer-2',
    customerName: '이철수',
    currentSentiment: 'neutral',
    sentimentScore: 10,
    sentimentHistory: [
      { time: '09:00', score: 0, emotion: 'neutral' },
      { time: '09:30', score: 10, emotion: 'neutral' },
    ],
    keywords: ['계좌', '개설', '서류'],
    riskLevel: 'medium',
    suggestedActions: ['필요 서류 안내', '영업점 방문 권유'],
  },
  'customer-4': {
    customerId: 'customer-4',
    customerName: '최수진',
    currentSentiment: 'negative',
    sentimentScore: -60,
    sentimentHistory: [
      { time: '11:00', score: -30, emotion: 'negative' },
      { time: '11:15', score: -50, emotion: 'negative' },
      { time: '11:30', score: -60, emotion: 'angry' },
    ],
    keywords: ['긴급', '불만', '지연'],
    riskLevel: 'high',
    suggestedActions: ['우선 배정', '팀장 에스컬레이션'],
  },
};

const mockAIProposals: Record<string, AIProposal[]> = {
  'customer-1': [
    {
      id: 'proposal-1-1',
      type: 'next_best_action',
      title: '신용대출 한도 상향 추천',
      description: '고객님의 최근 신용 등급 상승으로 신용대출 한도를 500만원에서 700만원으로 상향할 수 있습니다.',
      confidence: 0.92,
      category: '대출',
      metadata: {
        scriptId: 'script-loan-increase',
        reason: '신용등급 상승 (750 → 780)',
      },
      priority: 'high',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'proposal-1-2',
      type: 'knowledge',
      title: '대출 금리 인하 안내',
      description: '최근 금리 인하로 신용대출 금리가 연 4.5%에서 4.2%로 인하되었습니다.',
      confidence: 0.88,
      category: '대출',
      metadata: {
        knowledgeId: 'knowledge-rate-decrease',
      },
      priority: 'normal',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],
  'customer-2': [
    {
      id: 'proposal-2-1',
      type: 'script',
      title: '계좌 개설 절차 안내',
      description: '모바일 앱을 통한 계좌 개절 절차를 안내해주세요.',
      confidence: 0.85,
      category: '계좌',
      metadata: {
        scriptId: 'script-account-guide',
      },
      priority: 'normal',
      createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
  ],
  'customer-4': [
    {
      id: 'proposal-4-1',
      type: 'warning',
      title: '긴급: 고객 불만도 상승',
      description: '고객이 현재 불만을 표출하고 있습니다. 즉시 우선적으로 응대해주세요.',
      confidence: 0.95,
      category: '위험관리',
      metadata: {
        reason: '감정분석: angry (-60)',
      },
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
  ],
};

// ============================================================================
// MOCK API 함수
// ============================================================================

/**
 * 대시보드 통계 조회
 * GET /api/agent/stats
 */
export const getStats = async (): Promise<ApiResponse<DashboardStats>> => {
  await delay(300);

  const stats: DashboardStats = {
    today: {
      consultCount: 23,
      avgDuration: '5m 30s',
      satisfaction: 4.8,
      change: {
        consultCount: '150%',
        avgDuration: '30s',
        satisfaction: '0.2',
      },
    },
    realTime: {
      activeConsults: 3,
      waitingCustomers: 2,
      avgWaitTime: '4m 20s',
    },
    activity: [
      { time: '9시', count: 4 },
      { time: '10시', count: 8 },
      { time: '11시', count: 12 },
      { time: '12시', count: 5 },
      { time: '13시', count: 9 },
      { time: '14시', count: 15 },
      { time: '15시', count: 10 },
    ],
    queue: [
      { time: '09:00', waiting: 2 },
      { time: '09:15', waiting: 4 },
      { time: '09:30', waiting: 8 },
      { time: '09:45', waiting: 5 },
      { time: '10:00', waiting: 3 },
      { time: '10:15', waiting: 6 },
      { time: '10:30', waiting: 9 },
      { time: '10:45', waiting: 7 },
      { time: '11:00', waiting: 4 },
    ],
  };

  return {
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 고객 목록 조회
 * GET /api/agent/customers
 */
export const getCustomers = async (options?: {
  status?: 'consulting' | 'waiting' | 'completed';
  segment?: 'vip' | 'general' | 'new';
  search?: string;
}): Promise<ApiResponse<Customer[]>> => {
  await delay(300);

  let filtered = [...mockCustomers];

  // 상태 필터
  if (options?.status) {
    filtered = filtered.filter((c) => c.status === options.status);
  }

  // 세그먼트 필터
  if (options?.segment) {
    filtered = filtered.filter((c) => c.segment === options.segment);
  }

  // 검색 필터
  if (options?.search) {
    const search = options.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.maskedPhone.includes(search)
    );
  }

  return {
    success: true,
    data: filtered,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 특정 고객 조회
 * GET /api/agent/customers/:id
 */
export const getCustomer = async (customerId: string): Promise<ApiResponse<Customer>> => {
  await delay(200);

  const customer = mockCustomers.find((c) => c.id === customerId);

  if (!customer) {
    throw {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '고객을 찾을 수 없습니다.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: customer,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 고객 감정 분석 조회
 * GET /api/agent/sentiment/:id
 */
export const getSentiment = async (customerId: string): Promise<ApiResponse<SentimentData>> => {
  await delay(400);

  const sentiment = mockSentiments[customerId];

  if (!sentiment) {
    // 데이터가 없으면 기본값 반환
    const defaultSentiment: SentimentData = {
      customerId,
      customerName: '알 수 없음',
      currentSentiment: 'neutral',
      sentimentScore: 0,
      sentimentHistory: [],
      keywords: [],
      riskLevel: 'medium',
    };
    return {
      success: true,
      data: defaultSentiment,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: sentiment,
    timestamp: new Date().toISOString(),
  };
};

/**
 * AI 제안 (NBA) 조회
 * GET /api/agent/proposals/:id
 */
export const getAIProposals = async (
  customerId: string
): Promise<ApiResponse<AIProposalsResponse>> => {
  await delay(300);

  const proposals = mockAIProposals[customerId] || [];

  return {
    success: true,
    data: {
      customerId,
      proposals,
      summary: proposals.length > 0 ? `${proposals.length}개의 제안이 있습니다.` : '새로운 제안이 없습니다.',
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 대기 중인 고객 수 조회
 * GET /api/agent/waiting-count
 */
export const getWaitingCount = async (): Promise<ApiResponse<{ count: number }>> => {
  await delay(100);

  const waitingCount = mockCustomers.filter((c) => c.status === 'waiting').length;

  return {
    success: true,
    data: { count: waitingCount },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 상담 중인 고객 수 조회
 * GET /api/agent/active-count
 */
export const getActiveCount = async (): Promise<ApiResponse<{ count: number }>> => {
  await delay(100);

  const activeCount = mockCustomers.filter((c) => c.status === 'consulting').length;

  return {
    success: true,
    data: { count: activeCount },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 팀 랭킹 조회
 * GET /api/agent/team-ranking
 */
export const getTeamRanking = async (): Promise<
  ApiResponse<
    Array<{
      rank: number;
      name: string;
      consultCount: number;
      satisfaction: number;
    }>
  >
> => {
  await delay(200);

  const ranking = [
    { rank: 1, name: '김미래', consultCount: 23, satisfaction: 4.8 },
    { rank: 2, name: '이철수', consultCount: 21, satisfaction: 4.7 },
    { rank: 3, name: '박영희', consultCount: 18, satisfaction: 4.6 },
    { rank: 4, name: '최수진', consultCount: 15, satisfaction: 4.5 },
    { rank: 5, name: '정준호', consultCount: 12, satisfaction: 4.4 },
  ];

  return {
    success: true,
    data: ranking,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 공지사항 조회
 * GET /api/agent/notices
 */
export const getNotices = async (): Promise<
  ApiResponse<
    Array<{
      id: string;
      title: string;
      content: string;
      type: 'system' | 'update' | 'urgent';
      createdAt: string;
    }>
  >
> => {
  await delay(200);

  const notices = [
    {
      id: 'notice-1',
      title: '시스템 점검 안내',
      content: '오늘 밤 22:00 - 23:00 서버 패치가 있습니다.',
      type: 'system' as const,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notice-2',
      title: '신규 스크립트 업데이트',
      content: '변경된 대출 정책을 확인해주세요.',
      type: 'update' as const,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    success: true,
    data: notices,
    timestamp: new Date().toISOString(),
  };
};

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 네트워크 지연 시뮬레이션
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ============================================================================
// API 객체 (내보내기용)
// ============================================================================

export const agentApi = {
  getStats,
  getCustomers,
  getCustomer,
  getSentiment,
  getAIProposals,
  getWaitingCount,
  getActiveCount,
  getTeamRanking,
  getNotices,
};
