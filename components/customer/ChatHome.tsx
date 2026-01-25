import React, { useState } from 'react';
import { Search, Menu, Settings, MessageCircle, Clock, Plus, BarChart, FileText, Shield, ChevronRight } from 'lucide-react';
import { ChatSession } from '../../types';

interface Props {
  onSelectChat: (id: string) => void;
}

// Mock Data
const activeChats: ChatSession[] = [
  {
    id: '1',
    avatar: '🤖',
    title: 'AI 대출 상담사',
    preview: '금리 관련해서 도와드릴까요?',
    lastMessageTime: '30분 전',
    unreadCount: 1,
    status: 'active'
  },
  {
    id: '2',
    avatar: '👤',
    title: '일반 문의',
    preview: '상담원 대기 중...',
    lastMessageTime: '어제',
    unreadCount: 0,
    status: 'waiting'
  }
];

export const ChatHome: React.FC<Props> = ({ onSelectChat }) => {
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
            {activeChats.map((chat) => (
              <div 
                key={chat.id} 
                onClick={() => onSelectChat(chat.id)}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99] transition-transform duration-100"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl border border-gray-100 flex-shrink-0">
                  {chat.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">{chat.title}</h3>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{chat.lastMessageTime}</span>
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
            ))}
          </div>
        </section>
      </div>

      {/* FAB */}
      <button className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-hover hover:shadow-xl hover:scale-105 transition-all">
        <Plus size={28} />
      </button>
    </div>
  );
};