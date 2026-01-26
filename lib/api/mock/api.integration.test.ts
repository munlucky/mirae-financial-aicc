/**
 * MOCK API 통합 테스트
 */

import { describe, it, expect } from 'vitest';
import { chatApi } from './chatApi';
import { agentApi } from './agentApi';
import { authApi } from './authApi';

describe('MOCK API 통합 테스트', () => {
  describe('채팅 API (T7)', () => {
    it('채팅 세션 목록 조회가 정상 동작해야 함 (T7)', async () => {
      const result = await chatApi.getSessions();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('customerName');
    });

    it('메시지 전송 및 응답이 정상 동작해야 함 (T8)', async () => {
      const sessionId = 'session-1';
      const text = '테스트 메시지';

      const result = await chatApi.sendMessage(sessionId, { text });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.message).toHaveProperty('id');
      expect(result.data.message.sessionId).toBe(sessionId);
      expect(result.data.message.text).toBe(text);
      expect(result.data.aiResponse).toBeDefined();
    });

    it('퀵 리플라이가 정상 동작해야 함 (T8)', async () => {
      const messageId = 'msg-session-1-1';
      const reply = '예';

      const result = await chatApi.sendQuickReply(messageId, { reply });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.message).toHaveProperty('id');
      expect(result.data.message.text).toBe(reply);
    });
  });

  describe('상담사 API (T9)', () => {
    it('상담사 통계 조회가 정상 동작해야 함 (T9)', async () => {
      const result = await agentApi.getStats();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // 실제 구조: today, realTime, activity, queue
      expect(result.data).toHaveProperty('today');
      expect(result.data).toHaveProperty('realTime');
      expect(result.data.today).toHaveProperty('consultCount');
      expect(result.data.realTime).toHaveProperty('activeConsults');
    });

    it('고객 목록 조회가 정상 동작해야 함 (T9)', async () => {
      const result = await agentApi.getCustomers();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
    });

    it('감정 분석 조회가 정상 동작해야 함 (T9)', async () => {
      const customerId = 'customer-1';
      const result = await agentApi.getSentiment(customerId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // 실제 구조: customerId, customerName, currentSentiment, sentimentScore, etc.
      expect(result.data).toHaveProperty('customerId');
      expect(result.data).toHaveProperty('currentSentiment');
      expect(result.data).toHaveProperty('riskLevel');
      expect(result.data).toHaveProperty('sentimentScore');
    });

    it('AI 제안 목록 조회가 정상 동작해야 함 (T9)', async () => {
      const customerId = 'customer-1';
      const result = await agentApi.getAIProposals(customerId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('proposals');
      expect(Array.isArray(result.data.proposals)).toBe(true);
    });
  });

  describe('인증 API', () => {
    it('로그인이 정상 동작해야 함', async () => {
      const result = await authApi.login({ username: 'customer', password: 'customer123' });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // 실제 구조: { user, token: { accessToken, refreshToken, expiresIn } }
      expect(result.data).toHaveProperty('user');
      expect(result.data).toHaveProperty('token');
      expect(result.data.token).toHaveProperty('accessToken');
      expect(result.data.token).toHaveProperty('refreshToken');
    });

    it('로그아웃이 정상 동작해야 함', async () => {
      const result = await authApi.logout();

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
