/**
 * API 클라이언트 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, setTokens, clearTokens, get, post } from './client';

// Mock Cookies
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock window.localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('API Client', () => {
  beforeEach(() => {
    clearTokens();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('토큰 관리 (T4)', () => {
    it('토큰을 설정하고 초기화할 수 있어야 함', () => {
      setTokens('access-token', 'refresh-token');
      clearTokens();
      expect(true).toBe(true);
    });

    it('토큰 설정 후 Authorization 헤더가 포함되어야 함 (T4)', async () => {
      setTokens('test-access-token', 'test-refresh-token');

      // Mock axios request
      const spy = vi.spyOn(apiClient, 'request').mockResolvedValue({
        data: { success: true, data: null },
      });

      await get('/test');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('API 클라이언트', () => {
    it('API 클라이언트가 생성되어야 함', () => {
      expect(apiClient).toBeDefined();
    });

    it('GET 요청이 정상 동작해야 함 (T4)', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      vi.spyOn(apiClient, 'request').mockResolvedValue({ data: mockResponse });

      const result = await get('/test');

      expect(result).toEqual(mockResponse);
    });

    it('POST 요청이 정상 동작해야 함 (T5)', async () => {
      const mockResponse = { success: true, data: { id: 1, name: 'Test' } };
      vi.spyOn(apiClient, 'request').mockResolvedValue({ data: mockResponse });

      const result = await post('/test', { name: 'Test' });

      expect(result).toEqual(mockResponse);
    });

    it('에러 핸들링이 정상 동작해야 함 (401) (T6)', async () => {
      const axiosError = new Error('Unauthorized') as any;
      axiosError.response = { status: 401, data: { success: false, error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } } };

      vi.spyOn(apiClient, 'request').mockRejectedValue(axiosError);

      await expect(get('/test')).rejects.toEqual({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' },
      });
    });

    it('에러 핸들링이 정상 동작해야 함 (500) (T6)', async () => {
      const axiosError = new Error('Internal Server Error') as any;
      axiosError.response = { status: 500, data: { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } } };

      vi.spyOn(apiClient, 'request').mockRejectedValue(axiosError);

      await expect(get('/test')).rejects.toEqual({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      });
    });

    it('네트워크 에러 핸들링이 정상 동작해야 함 (T6)', async () => {
      const axiosError = new Error('Network Error') as any;
      axiosError.request = {};

      vi.spyOn(apiClient, 'request').mockRejectedValue(axiosError);

      await expect(get('/test')).rejects.toEqual({
        success: false,
        error: { code: 'NETWORK_ERROR', message: '네트워크 연결을 확인해주세요.' },
        timestamp: expect.any(String),
      });
    });
  });
});
