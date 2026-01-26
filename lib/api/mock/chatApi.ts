/**
 * 채팅 MOCK API
 * 채팅 관련 모든 API의 MOCK 구현
 */

import type {
  ApiResponse,
  ChatSession,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  QuickReplyRequest,
  VoiceUploadResponse,
} from '../../../types/api';

// ============================================================================
// MOCK 데이터
// ============================================================================

const mockSessions: ChatSession[] = [
  {
    id: 'session-1',
    customerId: 'customer-1',
    customerName: '김미래',
    agentId: 'agent-1',
    agentName: '김상담',
    title: 'AI 대출 상담사',
    preview: '금리 관련해서 도와드릴까요?',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 1,
    status: 'active',
    category: '대출',
    priority: 'normal',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'session-2',
    customerId: 'customer-2',
    customerName: '이철수',
    title: '일반 문의',
    preview: '상담원 대기 중...',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: 'waiting',
    category: '문의',
    priority: 'low',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'session-3',
    customerId: 'customer-3',
    customerName: '박영희',
    agentId: 'agent-1',
    agentName: '김상담',
    title: '적금 상품 문의',
    preview: '적금 금리가 얼마인가요?',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: 'completed',
    category: '적금',
    priority: 'low',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockMessages: Record<string, Message[]> = {
  'session-1': [
    {
      id: 'msg-1-1',
      sessionId: 'session-1',
      sender: 'ai',
      senderName: 'AI 상담사',
      text: '안녕하세요! 미래금융 AI 고객센터입니다. 무엇을 도와드릴까요?',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      confidence: 'high',
      hasAudio: true,
      quickReplies: ['대출 상품 안내', '금리 확인', '상담원 연결'],
    },
    {
      id: 'msg-1-2',
      sessionId: 'session-1',
      sender: 'user',
      senderId: 'customer-1',
      senderName: '김미래',
      text: '신용대출 금리가 어떻게 되나요?',
      timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'msg-1-3',
      sessionId: 'session-1',
      sender: 'ai',
      senderName: 'AI 상담사',
      text: '금리 관련해서 도와드릴까요?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      confidence: 'high',
      hasAudio: true,
      quickReplies: ['연 3.5%~7.5%', '금리 계산기', '신청 방법'],
    },
  ],
  'session-2': [
    {
      id: 'msg-2-1',
      sessionId: 'session-2',
      sender: 'user',
      senderId: 'customer-2',
      senderName: '이철수',
      text: '계좌 개설 방법 문의드립니다.',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
  ],
  'session-3': [
    {
      id: 'msg-3-1',
      sessionId: 'session-3',
      sender: 'user',
      senderId: 'customer-3',
      senderName: '박영희',
      text: '적금 상품 안내 부탁드립니다.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-3-2',
      sessionId: 'session-3',
      sender: 'agent',
      senderId: 'agent-1',
      senderName: '김상담',
      text: '네, 미래적금 상품을 안내해드리겠습니다.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1000).toISOString(),
    },
  ],
};

let messageIdCounter = 100;

// ============================================================================
// MOCK API 함수
// ============================================================================

/**
 * 채팅 세션 목록 조회
 * GET /api/sessions
 */
export const getSessions = async (): Promise<ApiResponse<ChatSession[]>> => {
  // 네트워크 지연 시뮬레이션
  await delay(300);

  return {
    success: true,
    data: mockSessions,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 특정 세션 조회
 * GET /api/sessions/:id
 */
export const getSession = async (sessionId: string): Promise<ApiResponse<ChatSession>> => {
  await delay(200);

  const session = mockSessions.find((s) => s.id === sessionId);

  if (!session) {
    throw {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '채팅 세션을 찾을 수 없습니다.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: session,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 메시지 목록 조회
 * GET /api/sessions/:id/messages
 */
export const getMessages = async (sessionId: string): Promise<ApiResponse<Message[]>> => {
  await delay(200);

  const messages = mockMessages[sessionId] || [];

  return {
    success: true,
    data: messages,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 메시지 전송
 * POST /api/sessions/:id/messages
 */
export const sendMessage = async (
  sessionId: string,
  request: SendMessageRequest
): Promise<ApiResponse<SendMessageResponse>> => {
  await delay(400);

  // 사용자 메시지 생성
  const userMessage: Message = {
    id: `msg-${sessionId}-${messageIdCounter++}`,
    sessionId,
    sender: 'user',
    text: request.text,
    timestamp: new Date().toISOString(),
    read: false,
  };

  // 세션의 메시지 배열에 추가
  if (!mockMessages[sessionId]) {
    mockMessages[sessionId] = [];
  }
  mockMessages[sessionId].push(userMessage);

  // 세션 미리보기 업데이트
  const session = mockSessions.find((s) => s.id === sessionId);
  if (session) {
    session.preview = request.text;
    session.lastMessageTime = new Date().toISOString();
    session.updatedAt = new Date().toISOString();
  }

  // AI 응답 생성 (시뮬레이션)
  await delay(500); // AI 응답 지연

  const aiMessage: Message = {
    id: `msg-${sessionId}-${messageIdCounter++}`,
    sessionId,
    sender: 'ai',
    senderName: 'AI 상담사',
    text: generateAIResponse(request.text),
    timestamp: new Date().toISOString(),
    confidence: 'high',
    hasAudio: true,
    quickReplies: generateQuickReplies(request.text),
  };

  mockMessages[sessionId].push(aiMessage);

  // 세션 미리보기 다시 업데이트
  if (session) {
    session.preview = aiMessage.text;
    session.lastMessageTime = new Date().toISOString();
    session.updatedAt = new Date().toISOString();
  }

  return {
    success: true,
    data: {
      message: userMessage,
      aiResponse: aiMessage,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 빠른 답변 전송
 * POST /api/messages/:id/quick-reply
 */
export const sendQuickReply = async (
  messageId: string,
  request: QuickReplyRequest
): Promise<ApiResponse<SendMessageResponse>> => {
  await delay(300);

  // 메시지 ID에서 세션 ID 추출 (간단 구현)
  const sessionId = messageId.split('-')[1];

  return sendMessage(sessionId, { text: request.reply });
};

/**
 * 음성 업로드
 * POST /api/voice/upload
 */
export const uploadVoice = async (
  sessionId: string,
  audioBlob: Blob,
  duration: number
): Promise<ApiResponse<VoiceUploadResponse>> => {
  await delay(800);

  // 사용자 메시지 생성 (음성 첨부)
  const userMessage: Message = {
    id: `msg-${sessionId}-${messageIdCounter++}`,
    sessionId,
    sender: 'user',
    text: '',
    timestamp: new Date().toISOString(),
    attachment: {
      name: 'voice-message.wav',
      type: 'voice',
    },
  };

  if (!mockMessages[sessionId]) {
    mockMessages[sessionId] = [];
  }
  mockMessages[sessionId].push(userMessage);

  // STT 결과 생성 (시뮬레이션)
  const transcription = '대출 금리가 궁금합니다.';

  // AI 응답 생성
  await delay(500);

  const aiMessage: Message = {
    id: `msg-${sessionId}-${messageIdCounter++}`,
    sessionId,
    sender: 'ai',
    senderName: 'AI 상담사',
    text: `네, "${transcription}" 문의에 대해 답변드리겠습니다.`,
    timestamp: new Date().toISOString(),
    confidence: 'high',
    hasAudio: true,
    quickReplies: ['금리 안내', '상담원 연결', '신청 방법'],
  };

  mockMessages[sessionId].push(aiMessage);

  return {
    success: true,
    data: {
      message: userMessage,
      transcription,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 세션 생성 (새 채팅 시작)
 * POST /api/sessions
 */
export const createSession = async (options?: {
  category?: string;
  title?: string;
}): Promise<ApiResponse<ChatSession>> => {
  await delay(300);

  const newSession: ChatSession = {
    id: `session-${Date.now()}`,
    customerId: 'current-customer',
    customerName: '현재 고객',
    title: options?.title || '새 상담',
    preview: '상담을 시작합니다.',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    status: 'active',
    category: options?.category,
    priority: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockSessions.unshift(newSession);
  mockMessages[newSession.id] = [];

  return {
    success: true,
    data: newSession,
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

/**
 * AI 응답 생성 (간단 규칙 기반)
 */
const generateAIResponse = (userText: string): string => {
  const text = userText.toLowerCase();

  if (text.includes('금리') || text.includes('이자')) {
    return '현재 연 3.5%~7.5%의 금리로 제공되고 있습니다. 신용 등급에 따라 차등 적용됩니다.';
  }
  if (text.includes('대출')) {
    return '대출 상품은 신용대출, 담보대출, 주택담보대출 등이 있습니다. 어떤 상품에 관심 있으신가요?';
  }
  if (text.includes('상담원') || text.includes('사람')) {
    return '네, 상담원 연결을 도와드리겠습니다. 잠시만 기다려 주세요.';
  }
  if (text.includes('계좌')) {
    return '계좌 개설은 영업점 방문 또는 모바일 앱에서 가능합니다. 어떤 방법을 선호하시나요?';
  }
  if (text.includes('적금')) {
    return '적금 상품은 목적별로 다양하게 준비되어 있습니다. 목표 금액과 기간을 알려주시면 최적의 상품을 추천해드리겠습니다.';
  }

  return '문의해주셔서 감사합니다. 더 자세한 안내를 위해 어떤 부분이 궁금하신가요?';
};

/**
 * 빠른 답변 생성
 */
const generateQuickReplies = (userText: string): string[] => {
  const text = userText.toLowerCase();

  if (text.includes('금리')) {
    return ['연 3.5%~7.5%', '금리 계산기', '신청 방법'];
  }
  if (text.includes('대출')) {
    return ['신용대출', '담보대출', '주택담보대출'];
  }
  if (text.includes('상담원')) {
    return ['상담원 연결', '계속 AI 상담'];
  }
  if (text.includes('계좌')) {
    return ['영업점 방문', '모바일 개설'];
  }

  return ['상담원 연결', '자주 묻는 질문', '메인 메뉴'];
};

// ============================================================================
// API 객체 (내보내기용)
// ============================================================================

export const chatApi = {
  getSessions,
  getSession,
  getMessages,
  sendMessage,
  sendQuickReply,
  uploadVoice,
  createSession,
};
