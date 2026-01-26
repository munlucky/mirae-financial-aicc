/**
 * NBA (Next Best Action) 컴포넌트
 * AI가 생성한 다음 최적 행동 제안 표시
 */

import React from 'react';
import { Lightbulb, TrendingUp, BookOpen, FileText, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../Button';
import type { AIProposal } from '../../types/api';

interface Props {
  proposals: AIProposal[];
  isLoading?: boolean;
  onProposalClick?: (proposal: AIProposal) => void;
}

const PROPOSAL_CONFIG = {
  next_best_action: {
    icon: TrendingUp,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'NBA',
  },
  knowledge: {
    icon: BookOpen,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: '지식',
  },
  script: {
    icon: FileText,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: '스크립트',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: '경고',
  },
} as const;

const PRIORITY_CONFIG = {
  high: { color: 'text-red-600', bg: 'bg-red-100', label: '높음' },
  normal: { color: 'text-gray-600', bg: 'bg-gray-100', label: '보통' },
  low: { color: 'text-gray-400', bg: 'bg-gray-50', label: '낮음' },
} as const;

export const NBAProposals: React.FC<Props> = ({ proposals, isLoading, onProposalClick }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="space-y-2">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-gray-400" />
          <h4 className="text-sm font-bold text-gray-700">AI 제안</h4>
        </div>
        <p className="text-xs text-gray-400">현재 새로운 제안이 없습니다.</p>
      </div>
    );
  }

  // Sort by priority (high > normal > low) and confidence
  const sortedProposals = [...proposals].sort((a, b) => {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.confidence - a.confidence;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-yellow-500" />
          <h4 className="text-sm font-bold text-gray-800">AI 제안</h4>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold">
            {proposals.length}개
          </span>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-2">
        {sortedProposals.map((proposal) => {
          const config = PROPOSAL_CONFIG[proposal.type];
          const ProposalIcon = config.icon;
          const priorityConfig = PRIORITY_CONFIG[proposal.priority];

          return (
            <div
              key={proposal.id}
              className={`p-3 rounded-lg border ${config.bg} ${config.border} hover:shadow-md transition-all cursor-pointer group`}
              onClick={() => onProposalClick?.(proposal)}
            >
              {/* Proposal Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex-shrink-0 ${config.color}`}>
                    <ProposalIcon size={14} />
                  </div>
                  <h5 className="text-xs font-bold text-gray-800 truncate">{proposal.title}</h5>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Priority Badge */}
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${priorityConfig.bg} ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                  {/* Confidence Score */}
                  <span className="text-[10px] text-gray-400 font-medium">
                    {Math.round(proposal.confidence * 100)}%
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                {proposal.description}
              </p>

              {/* Metadata */}
              {proposal.metadata && (
                <div className="flex items-center gap-2">
                  {proposal.category && (
                    <span className="px-2 py-0.5 bg-white bg-opacity-60 text-gray-500 text-[9px] rounded border border-gray-200">
                      {proposal.category}
                    </span>
                  )}
                  {proposal.metadata.reason && (
                    <span className="text-[9px] text-gray-400 truncate flex-1">
                      사유: {proposal.metadata.reason}
                    </span>
                  )}
                </div>
              )}

              {/* Action Button for Script Type */}
              {proposal.type === 'script' && proposal.metadata?.scriptId && (
                <div className="mt-2 pt-2 border-t border-gray-200 border-opacity-50">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProposalClick?.(proposal);
                    }}
                  >
                    <CheckCircle2 size={12} className="mr-1" />
                    스크립트 적용
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {proposals.length > 2 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center">
            총 {proposals.length}개의 제안이 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};
