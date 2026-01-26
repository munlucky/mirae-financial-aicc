/**
 * API 클라이언트
 * axios 기반 HTTP 클라이언트
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import type { ApiResponse, ApiError } from '../../types/api';

// 환경 변수
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT = 30000; // 30초

// 쿠키 설정 (보안 강화)
const COOKIE_OPTIONS = {
  secure: true,      // HTTPS 전용
  sameSite: 'Lax' as const,  // CSRF 방지
};

// 인증 토큰 관리
let authToken: string | null = null;
let refreshToken: string | null = null;

/**
 * 토큰 저장 (쿠키 사용 - XSS 방지)
 */
export const setTokens = (access: string, refresh: string) => {
  authToken = access;
  refreshToken = refresh;

  // 쿠키에 저장 (Secure, SameSite 적용)
  if (typeof window !== 'undefined') {
    // access_token: 1시간 만료
    Cookies.set('access_token', access, {
      ...COOKIE_OPTIONS,
      expires: 1 / 24,  // 1시간 (1/24일)
    });

    // refresh_token: 7일 만료
    Cookies.set('refresh_token', refresh, {
      ...COOKIE_OPTIONS,
      expires: 7,  // 7일
    });
  }
};

/**
 * 토큰 로드 (쿠키에서)
 */
export const loadTokens = () => {
  if (typeof window !== 'undefined') {
    authToken = Cookies.get('access_token') || null;
    refreshToken = Cookies.get('refresh_token') || null;
  }
};

/**
 * 토큰 초기화 (쿠키에서 삭제)
 */
export const clearTokens = () => {
  authToken = null;
  refreshToken = null;

  if (typeof window !== 'undefined') {
    Cookies.remove('access_token', COOKIE_OPTIONS);
    Cookies.remove('refresh_token', COOKIE_OPTIONS);
  }
};

/**
 * axios 인스턴스 생성
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터 - 토큰 추가
  instance.interceptors.request.use(
    (config) => {
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 - 에러 처리
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
      return response;
    },
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // 401 에러이고 재시도하지 않은 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // 리프레시 토큰이 있으면 토큰 갱신 시도
        if (refreshToken) {
          try {
            // TODO: 리프레시 토큰 엔드포인트 호출
            // const response = await axios.post('/auth/refresh', { refreshToken });
            // const { accessToken, refreshToken: newRefreshToken } = response.data;
            // setTokens(accessToken, newRefreshToken);
            // originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
            // return instance(originalRequest);
          } catch (refreshError) {
            // 리프레시 실패하면 토큰 초기화
            clearTokens();
            // 로그인 페이지로 리다이렉트 등 처리 필요
            return Promise.reject(refreshError);
          }
        } else {
          // 리프레시 토큰이 없으면 로그인 페이지로
          clearTokens();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// axios 인스턴스 생성
export const apiClient = createAxiosInstance();

/**
 * API 요청 헬퍼 함수
 */
export const request = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response) {
      // 서버에서 응답이 온 경우
      throw axiosError.response.data;
    } else if (axiosError.request) {
      // 요청을 보냈지만 응답이 없는 경우
      throw {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: '네트워크 연결을 확인해주세요.',
        },
        timestamp: new Date().toISOString(),
      };
    } else {
      // 요청 설정 중 에러
      throw {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: axiosError.message || '요청 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
};

/**
 * GET 요청
 */
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return request<T>({ ...config, method: 'GET', url });
};

/**
 * POST 요청
 */
export const post = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({ ...config, method: 'POST', url, data });
};

/**
 * PUT 요청
 */
export const put = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({ ...config, method: 'PUT', url, data });
};

/**
 * PATCH 요청
 */
export const patch = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  return request<T>({ ...config, method: 'PATCH', url, data });
};

/**
 * DELETE 요청
 */
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return request<T>({ ...config, method: 'DELETE', url });
};

// 초기화 시 토큰 로드
loadTokens();
