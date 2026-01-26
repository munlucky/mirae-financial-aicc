/**
 * 대화 요약 컴포넌트
 * AI가 생성한 실시간 대화 요약 (3줄) 표시
 */

import React from 'react';
import { FileText, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '../Badge';

export interface SummaryData {
  current: string;    // 현재 상황 요약
  context: string;    // 고객 문맥
  action: string;     // 제안된 다음 행동
  lastUpdated: string;
}

interface Props {
  summary: SummaryData | null;
  isLoading?: boolean;
}

export const ConversationSummary: React.FC<Props> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-gray-400" />
          <h4 className="text-sm font-bold text-gray-700">대화 요약</h4>
        </div>
        <p className="text-xs text-gray-400">대화가 시작되면 AI가 요약를 생성합니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-primary" />
          <h4 className="text-sm font-bold text-gray-800">대화 요약</h4>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock size={10} />
          <span>{new Date(summary.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Summary Items */}
      <div className="space-y-3">
        {/* Current Situation */}
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">현재 상황</p>
            <p className="text-xs text-gray-700 leading-relaxed">{summary.current}</p>
          </div>
        </div>

        {/* Context */}
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">고객 문맥</p>
            <p className="text-xs text-gray-700 leading-relaxed">{summary.context}</p>
          </div>
        </div>

        {/* Suggested Action */}
        <div className="flex items-start gap-2">
          <TrendingUp size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">다음 행동</p>
            <p className="text-xs text-gray-700 leading-relaxed">{summary.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
