/**
 * AI Copilot 통합 패널
 * 요약, NBA, 감정 분석을 하나의 패널로 통합
 */

import React, { useEffect, useState } from 'react';
import { Bot, RefreshCw, Minimize2, Maximize2 } from 'lucide-react';
import { ConversationSummary, type SummaryData } from './ConversationSummary';
import { SentimentTracker } from './SentimentTracker';
import { NBAProposals } from './NBAProposals';
import type { SentimentData, AIProposal } from '../../types/api';
import { useAgentStore } from '../../lib/store/agentStore';

interface Props {
  customerId: string;
  onProposalApply?: (proposal: AIProposal) => void;
}

export const AICopilotPanel: React.FC<Props> = ({ customerId, onProposalApply }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  // Store에서 데이터 가져오기
  const {
    sentiments,
    selectedProposals,
    isLoading,
    error,
    loadSentiment,
    loadProposals,
  } = useAgentStore();

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (customerId) {
      loadSentiment(customerId);
      loadProposals(customerId);

      // TODO: 실제 요약 API 호출 (현재는 mock)
      // loadSummary(customerId);
      setSummary({
        current: '고객이 전세자금 대출 문의 중',
        context: '신용등급 A, 연소득 5000만원',
        action: '대출 상품 비교 안내 필요',
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [customerId, loadSentiment, loadProposals]);

  // 새로고침
  const handleRefresh = () => {
    if (customerId) {
      loadSentiment(customerId);
      loadProposals(customerId);
    }
  };

  const currentSentiment = sentiments[customerId] || null;
  const currentProposals = selectedProposals();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <Bot size={16} />
          <p className="text-sm font-bold">AI Copilot 오류</p>
        </div>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    );
  }

  if (!isExpanded) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-primary animate-pulse" />
            <span className="text-sm font-bold text-gray-800">AI Copilot</span>
            {currentProposals.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">
                {currentProposals.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-primary animate-pulse" />
            <span className="text-sm font-bold text-gray-800">AI Copilot</span>
            {currentProposals.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">
                {currentProposals.length}개 제안
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="새로고침"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-gray-600 transition-colors"
              title="접기"
            >
              <Minimize2 size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          실시간 대화 분석 및 AI 제안을 제공합니다.
        </p>
      </div>

      {/* Conversation Summary */}
      <ConversationSummary summary={summary} isLoading={isLoading} />

      {/* Sentiment Tracker */}
      <SentimentTracker sentiment={currentSentiment} isLoading={isLoading} />

      {/* NBA Proposals */}
      <NBAProposals
        proposals={currentProposals}
        isLoading={isLoading}
        onProposalClick={onProposalApply}
      />
    </div>
  );
};
