/**
 * 인증 MOCK API
 * 로그인, 로그아웃, 토큰 검증 등의 MOCK 구현
 */

import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  VerifyTokenResponse,
} from '../../../types/api';

// ============================================================================
// MOCK 데이터
// ============================================================================

const mockUsers = [
  {
    id: 'customer-1',
    username: 'customer',
    password: 'customer123',
    name: '김미래',
    role: 'CUSTOMER' as const,
    email: 'customer@example.com',
    phone: '01012345678',
  },
  {
    id: 'agent-1',
    username: 'agent',
    password: 'agent123',
    name: '김상담',
    role: 'AGENT' as const,
    email: 'agent@mirae-finance.com',
    phone: '01098765432',
  },
];

// 현재 로그인한 사용자 (상태 관리용)
let currentUser: (typeof mockUsers)[0] | null = null;
let currentToken: string | null = null;

// ============================================================================
// MOCK API 함수
// ============================================================================

/**
 * 로그인
 * POST /api/auth/login
 */
export const login = async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  await delay(500);

  const { username, password } = request;

  // 사용자 찾기
  const user = mockUsers.find(
    (u) =>
      (u.username === username || u.email === username) && u.password === password
  );

  if (!user) {
    throw {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  // 토큰 생성 (간단 구현)
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // 현재 사용자 저장
  currentUser = user;
  currentToken = accessToken;

  const response: LoginResponse = {
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
    },
    token: {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1시간
    },
  };

  return {
    success: true,
    data: response,
    message: '로그인에 성공했습니다.',
    timestamp: new Date().toISOString(),
  };
};

/**
 * 간편 로그인 (생체 인증, 카카오, 네이버 등)
 * POST /api/auth/easy-login
 */
export const easyLogin = async (options: {
  type: 'bio' | 'kakao' | 'naver';
  token?: string;
}): Promise<ApiResponse<LoginResponse>> => {
  await delay(800);

  // 간편 로그인은 고객용만 지원 (간단 구현)
  const user = mockUsers.find((u) => u.role === 'CUSTOMER');

  if (!user) {
    throw {
      success: false,
      error: {
        code: 'EASY_LOGIN_FAILED',
        message: '간편 로그인에 실패했습니다.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  currentUser = user;
  currentToken = accessToken;

  const response: LoginResponse = {
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
    },
    token: {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    },
  };

  return {
    success: true,
    data: response,
    message: '간편 로그인에 성공했습니다.',
    timestamp: new Date().toISOString(),
  };
};

/**
 * 로그아웃
 * POST /api/auth/logout
 */
export const logout = async (): Promise<ApiResponse<{ success: boolean }>> => {
  await delay(200);

  currentUser = null;
  currentToken = null;

  return {
    success: true,
    data: { success: true },
    message: '로그아웃되었습니다.',
    timestamp: new Date().toISOString(),
  };
};

/**
 * 토큰 검증
 * GET /api/auth/verify
 */
export const verifyToken = async (token?: string): Promise<ApiResponse<VerifyTokenResponse>> => {
  await delay(100);

  const tokenToVerify = token || currentToken;

  if (!tokenToVerify || !currentUser) {
    return {
      success: true,
      data: {
        valid: false,
        user: {
          id: '',
          name: '',
          role: 'CUSTOMER',
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  // 토큰 유효성 검사 (간단 구현)
  const isValid = validateToken(tokenToVerify);

  return {
    success: true,
    data: {
      valid: isValid,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      },
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 토큰 갱신
 * POST /api/auth/refresh
 */
export const refreshToken = async (refreshTokenValue: string): Promise<ApiResponse<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}>> => {
  await delay(300);

  if (!currentUser) {
    throw {
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  const newAccessToken = generateToken(currentUser);
  const newRefreshToken = generateRefreshToken(currentUser);

  currentToken = newAccessToken;

  return {
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * 현재 사용자 정보 조회
 * GET /api/auth/me
 */
export const getMe = async (): Promise<ApiResponse<{
  id: string;
  name: string;
  role: 'CUSTOMER' | 'AGENT';
  email?: string;
  phone?: string;
}>> => {
  await delay(100);

  if (!currentUser) {
    throw {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '로그인이 필요합니다.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
      email: currentUser.email,
      phone: currentUser.phone,
    },
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
 * Unicode-safe base64 encoding
 */
const toBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString);
};

/**
 * 액세스 토큰 생성 (간단 구현 - 실제로는 JWT 사용)
 */
const generateToken = (user: typeof mockUsers[0]): string => {
  const header = toBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = toBase64(
    JSON.stringify({
      sub: user.id,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1시간
    })
  );
  const signature = toBase64('mock-signature');
  return `${header}.${payload}.${signature}`;
};

/**
 * 리프레시 토큰 생성 (간단 구현)
 */
const generateRefreshToken = (user: typeof mockUsers[0]): string => {
  return `refresh_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

/**
 * 토큰 유효성 검사 (간단 구현)
 */
const validateToken = (token: string): boolean => {
  if (!token || token === 'invalid') {
    return false;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false;
  }
};

/**
 * 현재 로그인한 사용자 가져오기 (테스트용)
 */
export const getCurrentUser = () => currentUser;

/**
 * 테스트용 사용자 설정
 */
export const setCurrentUser = (user: (typeof mockUsers)[0] | null) => {
  currentUser = user;
};

// ============================================================================
// API 객체 (내보내기용)
// ============================================================================

export const authApi = {
  login,
  easyLogin,
  logout,
  verifyToken,
  refreshToken,
  getMe,
};
