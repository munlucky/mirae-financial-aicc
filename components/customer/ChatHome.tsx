import React, { useEffect } from 'react';
import { Search, Menu, Settings, MessageCircle, Clock, Plus, BarChart, FileText, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { useChatStore } from '../../lib/store/chatStore';

interface Props {
  onSelectChat: (id: string) => void;
}

// 시간 포맷 헬퍼
const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return '방금';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
};

export const ChatHome: React.FC<Props> = ({ onSelectChat }) => {
  const { sessions, isLoading, error, loadSessions, createSession } = useChatStore();

  // 컴포넌트 마운트 시 세션 목록 로드
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = () => {
    createSession({ title: '새 상담' });
  };
  return (
    <div className="flex flex-col h-full bg-white sm:max-w-[480px] sm:mx-auto sm:border-x sm:border-gray-200 sm:shadow-xl">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageCircle className="text-primary" size={24} />
          대화
        </h1>
        <div className="flex items-center gap-4 text-gray-600">
          <Search size={24} className="cursor-pointer hover:text-primary" />
          <Menu size={24} className="cursor-pointer hover:text-primary" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="대화 검색..." 
            className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">로딩 중...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">오류가 발생했습니다</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Recommended Section (Horizontal Scroll) */}
            <section className="mt-2 mb-6">
              <div className="px-4 flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800">빠른 실행</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {[
                  { icon: <BarChart size={24} className="text-indigo-600" />, label: '포트폴리오' },
                  { icon: <FileText size={24} className="text-emerald" />, label: '거래내역' },
                  { icon: <Shield size={24} className="text-orange" />, label: '보안센터' },
                  { icon: <MessageCircle size={24} className="text-blue-500" />, label: '자주묻는질문' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 w-[72px] h-[80px] bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 cursor-pointer transition-colors">
                    {item.icon}
                    <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Active Chats List */}
            <section className="px-4">
              <h2 className="text-sm font-bold text-gray-800 mb-3">최근 상담 내역</h2>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-500">상담 내역이 없습니다.</p>
                    <p className="text-xs text-gray-400 mt-1">하단의 + 버튼을 눌러 새 상담을 시작하세요.</p>
                  </div>
                ) : (
                  sessions.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] transition-transform duration-100"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl border border-gray-100 flex-shrink-0">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 truncate pr-2">{chat.title}</h3>
                          <span className="text-[11px] text-gray-500 whitespace-nowrap">{formatTime(chat.lastMessageTime)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500 truncate">{chat.preview}</p>
                          {chat.unreadCount > 0 && (
                            <span className="ml-2 w-5 h-5 bg-red rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleCreateSession}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-hover hover:shadow-xl hover:scale-105 transition-all"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};