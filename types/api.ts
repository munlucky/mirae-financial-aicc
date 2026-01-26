/**
 * API 타입 정의
 * AICC 금융 AI 고객센터 API 관련 타입
 */

// ============================================================================
// 공통 타입
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// 인증 관련 타입
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
  easyLoginType?: 'bio' | 'kakao' | 'naver';
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    role: 'CUSTOMER' | 'AGENT';
    email?: string;
    phone?: string;
  };
  token: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: {
    id: string;
    name: string;
    role: 'CUSTOMER' | 'AGENT';
  };
}

// ============================================================================
// 채팅 관련 타입
// ============================================================================

export interface ChatSession {
  id: string;
  customerId: string;
  customerName: string;
  agentId?: string;
  agentName?: string;
  title: string;
  preview: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'completed' | 'waiting';
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai' | 'agent';
  senderId?: string;
  senderName?: string;
  text: string;
  timestamp: string;
  confidence?: 'high' | 'medium' | 'low';
  hasAudio?: boolean;
  audioUrl?: string;
  audioDuration?: number;
  quickReplies?: string[];
  isReference?: boolean;
  read?: boolean;
  attachment?: {
    name: string;
    type: 'image' | 'file' | 'voice';
    url?: string;
    size?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface SendMessageRequest {
  text: string;
  attachment?: {
    type: 'image' | 'file' | 'voice';
    url?: string;
    data?: string;
  };
}

export interface SendMessageResponse {
  message: Message;
  aiResponse?: Message;
}

export interface QuickReplyRequest {
  reply: string;
}

export interface VoiceUploadRequest {
  sessionId: string;
  audioBlob: Blob;
  duration: number;
}

export interface VoiceUploadResponse {
  message: Message;
  transcription?: string;
}

// ============================================================================
// 상담사 관련 타입
// ============================================================================

export interface DashboardStats {
  today: {
    consultCount: number;
    avgDuration: string; // "5m 30s"
    satisfaction: number; // 4.8
    change: {
      consultCount: string; // "150%"
      avgDuration: string; // "30s"
      satisfaction: string; // "0.2"
    };
  };
  realTime: {
    activeConsults: number;
    waitingCustomers: number;
    avgWaitTime: string;
  };
  activity: {
    time: string;
    count: number;
  }[];
  queue: {
    time: string;
    waiting: number;
  }[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  maskedPhone: string; // "010-****-5678"
  email?: string;
  maskedEmail?: string;
  segment?: 'vip' | 'general' | 'new';
  riskLevel?: 'low' | 'medium' | 'high';
  lastConsultDate?: string;
  consultCount: number;
  status?: 'consulting' | 'waiting' | 'completed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
  avatar?: string;
}

export interface SentimentData {
  customerId: string;
  customerName: string;
  currentSentiment: 'positive' | 'neutral' | 'negative' | 'angry';
  sentimentScore: number; // -100 to 100
  sentimentHistory: {
    time: string;
    score: number;
    emotion: 'positive' | 'neutral' | 'negative' | 'angry';
  }[];
  keywords: string[];
  riskLevel: 'low' | 'medium' | 'high';
  suggestedActions?: string[];
}

export interface AIProposal {
  id: string;
  type: 'next_best_action' | 'knowledge' | 'script' | 'warning';
  title: string;
  description: string;
  confidence: number; // 0 to 1
  category?: string;
  metadata?: {
    scriptId?: string;
    knowledgeId?: string;
    reason?: string;
  };
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

export interface AIProposalsResponse {
  customerId: string;
  proposals: AIProposal[];
  summary?: string;
}

// ============================================================================
// 에러 코드
// ============================================================================

export const ErrorCode = {
  // 인증 에러
  UNAUTHORIZED: 'AUTH_001',
  INVALID_CREDENTIALS: 'AUTH_002',
  TOKEN_EXPIRED: 'AUTH_003',
  TOKEN_INVALID: 'AUTH_004',

  // 리소스 에러
  NOT_FOUND: 'RES_001',
  ALREADY_EXISTS: 'RES_002',

  // 비즈니스 로직 에러
  INVALID_INPUT: 'BIZ_001',
  OPERATION_NOT_ALLOWED: 'BIZ_002',
  RATE_LIMIT_EXCEEDED: 'BIZ_003',

  // 서버 에러
  INTERNAL_ERROR: 'SRV_001',
  SERVICE_UNAVAILABLE: 'SRV_002',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
