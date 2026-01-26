/**
 * 인증 스토어 (Zustand)
 * 로그인, 로그아웃, 인증 상태 관리
 */

import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { LoginRequest, LoginResponse } from '../../types/api';
import { authApi } from '../api/mock/authApi';
import { setTokens, clearTokens, loadTokens as loadTokensFromStorage } from '../api/client';

// ============================================================================
// 스토어 상태 타입
// ============================================================================

interface AuthStore {
  // 상태
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    role: 'CUSTOMER' | 'AGENT';
    email?: string;
    phone?: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  login: (request: LoginRequest) => Promise<void>;
  easyLogin: (type: 'bio' | 'kakao' | 'naver', token?: string) => Promise<void>;
  logout: () => Promise<void>;
  verify: () => Promise<void>;
  loadTokens: () => void;

  // 내부 액션
  setError: (error: string | null) => void;
  clearError: () => void;
}

// ============================================================================
// 스토어 생성
// ============================================================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // 초기 상태
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // 액션: 로그인
  login: async (request: LoginRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(request);

      const { user, token } = response.data;

      // 토큰 저장 (API 클라이언트용)
      setTokens(token.accessToken, token.refreshToken);

      set({
        isAuthenticated: true,
        user,
        token: token.accessToken,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        error: `로그인에 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });

      throw error;
    }
  },

  // 액션: 간편 로그인
  easyLogin: async (type: 'bio' | 'kakao' | 'naver', token?: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.easyLogin({ type, token });

      const { user, token: authToken } = response.data;

      // 토큰 저장
      setTokens(authToken.accessToken, authToken.refreshToken);

      set({
        isAuthenticated: true,
        user,
        token: authToken.accessToken,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        error: `간편 로그인에 실패했습니다. ${errorMessage}`,
        isLoading: false,
      });

      throw error;
    }
  },

  // 액션: 로그아웃
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authApi.logout();

      // 토큰 초기화
      clearTokens();

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    } catch (error) {
      // 에러가 발생해도 로그아웃 처리
      clearTokens();

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  },

  // 액션: 토큰 검증
  verify: async () => {
    set({ isLoading: true, error: null });

    try {
      const { token } = get();

      if (!token) {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      const response = await authApi.verifyToken(token);

      set({
        isAuthenticated: response.data.valid,
        user: response.data.valid ? response.data.user : null,
        isLoading: false,
      });

      if (!response.data.valid) {
        // 토큰이 유효하지 않으면 초기화
        clearTokens();
        set({ token: null });
      }
    } catch (error) {
      // 에러 발생 시 인증 실패로 처리
      clearTokens();

      set({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      });
    }
  },

  // 액션: 저장된 토큰 로드
  loadTokens: () => {
    loadTokensFromStorage();

    // 쿠키에서 토큰 읽기
    const accessToken = Cookies.get('access_token');
    if (accessToken) {
      set({ token: accessToken });
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

export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectUser = (state: AuthStore) => state.user;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectIsCustomer = (state: AuthStore) => state.user?.role === 'CUSTOMER';
export const selectIsAgent = (state: AuthStore) => state.user?.role === 'AGENT';
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
