/**
 * 감정 추적 컴포넌트
 * 고객 감정 분석 결과 표시 (실시간 감정, 트렌드, 키워드)
 */

import React from 'react';
import { Smile, Meh, Frown, Angry, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import type { SentimentData } from '../../types/api';

interface Props {
  sentiment: SentimentData | null;
  isLoading?: boolean;
}

const EMOTION_CONFIG = {
  positive: {
    icon: Smile,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: '긍정적',
  },
  neutral: {
    icon: Meh,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: '중립',
  },
  negative: {
    icon: Frown,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: '부정적',
  },
  angry: {
    icon: Angry,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: '화남',
  },
} as const;

const RISK_CONFIG = {
  low: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '낮음' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '중간' },
  high: { color: 'text-red-600', bg: 'bg-red-100', label: '높음' },
} as const;

export const SentimentTracker: React.FC<Props> = ({ sentiment, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
        <div className="h-16 bg-gray-200 rounded mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    );
  }

  if (!sentiment) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Smile size={16} className="text-gray-400" />
          <h4 className="text-sm font-bold text-gray-700">감정 분석</h4>
        </div>
        <p className="text-xs text-gray-400">감정 데이터가 없습니다.</p>
      </div>
    );
  }

  const currentEmotion = EMOTION_CONFIG[sentiment.currentSentiment];
  const EmotionIcon = currentEmotion.icon;
  const riskConfig = RISK_CONFIG[sentiment.riskLevel];

  // 감정 점수에 따른 색상 (-100 ~ 100)
  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-emerald-500';
    if (score >= 20) return 'text-emerald-400';
    if (score >= -20) return 'text-gray-400';
    if (score >= -50) return 'text-orange-400';
    return 'text-red-500';
  };

  // 트렌드 계산 (가장 최근 2개 데이터 비교)
  const getTrend = () => {
    if (sentiment.sentimentHistory.length < 2) return null;
    const recent = sentiment.sentimentHistory.slice(-2);
    const prev = recent[0].score;
    const curr = recent[1].score;
    if (curr > prev + 10) return 'up';
    if (curr < prev - 10) return 'down';
    return 'stable';
  };

  const trend = getTrend();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <EmotionIcon size={16} className={currentEmotion.color} />
          <h4 className="text-sm font-bold text-gray-800">감정 분석</h4>
        </div>
        <div className="flex items-center gap-2">
          {/* Risk Badge */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${riskConfig.bg} ${riskConfig.color}`}>
            {riskConfig.label}
          </span>
          {/* Trend Indicator */}
          {trend === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
          {trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
          {trend === 'stable' && <Minus size={14} className="text-gray-400" />}
        </div>
      </div>

      {/* Sentiment Score */}
      <div className={`flex items-center justify-center p-4 rounded-lg ${currentEmotion.bgColor} border ${currentEmotion.borderColor} mb-3`}>
        <div className="text-center">
          <EmotionIcon size={32} className={currentEmotion.color} />
          <div className="mt-2">
            <span className={`text-2xl font-bold ${getScoreColor(sentiment.sentimentScore)}`}>
              {sentiment.sentimentScore > 0 ? '+' : ''}{sentiment.sentimentScore}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">{currentEmotion.label}</p>
          </div>
        </div>
      </div>

      {/* Keywords */}
      {sentiment.keywords.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">주요 키워드</p>
          <div className="flex flex-wrap gap-1.5">
            {sentiment.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-md font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Actions */}
      {sentiment.suggestedActions && sentiment.suggestedActions.length > 0 && (
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
            <AlertTriangle size={10} className="text-orange-400" />
            제안된 행동
          </p>
          <div className="space-y-1.5">
            {sentiment.suggestedActions.map((action, index) => (
              <div
                key={index}
                className="text-xs text-gray-700 bg-gray-50 px-2 py-1.5 rounded-md border border-gray-100"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sentiment History (Mini) */}
      {sentiment.sentimentHistory.length > 1 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">감정 변화</p>
          <div className="flex items-end gap-1 h-8">
            {sentiment.sentimentHistory.slice(-6).map((item, index) => {
              const heightPercent = Math.abs(item.score) + 20;
              const colorClass = item.score >= 0 ? 'bg-emerald-400' : 'bg-red-400';
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full rounded-t-sm ${colorClass}`}
                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  ></div>
                  <span className="text-[8px] text-gray-400">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
