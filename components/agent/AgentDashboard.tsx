import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Bell, Menu, User, Briefcase, TrendingUp, TrendingDown, Star, Award, Users, AlertCircle, Clock, Info } from 'lucide-react';
import { useAgentStore } from '../../lib/store/agentStore';
import { useAuthStore } from '../../lib/store/authStore';
import { Modal } from '../Modal';
import { Button } from '../Button';
import '../../styles/animations.css';

function ClockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

interface Props {
  onNavigateWorkspace: () => void;
}

export const AgentDashboard: React.FC<Props> = ({ onNavigateWorkspace }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // Store에서 데이터 가져오기
  const {
    stats,
    consultingCustomers,
    waitingCustomers,
    teamRanking,
    notices,
    isLoading,
    error,
    loadStats,
    loadCustomers,
    loadTeamRanking,
    loadNotices,
    selectCustomer
  } = useAgentStore();

  const { user } = useAuthStore();

  // Store의 상태를 직접 참조하여 의존성 문제 해결
  const customers = useAgentStore((state) => state.customers);

  // 계산된 헬퍼 함수 (의존성 문제 방지)
  const getConsultingCustomers = useCallback(() => {
    return customers.filter((c) => c.status === 'consulting');
  }, [customers]);

  const getWaitingCustomers = useCallback(() => {
    return customers.filter((c) => c.status === 'waiting');
  }, [customers]);

  // 컴포넌트 마운트 시 데이터 로드 (의존성 제거로 무한 루프 방지)
  useEffect(() => {
    loadStats();
    loadCustomers();
    loadTeamRanking();
    loadNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 대기 중인 고객이 있으면 알림 표시
  useEffect(() => {
    const waiting = getWaitingCustomers();
    if (waiting.length > 0) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [customers, getWaitingCustomers]); // customers 상태를 의존성으로 사용

  // 통계 카드 생성
  const statsCards = stats
    ? [
        {
          title: '상담 처리',
          value: stats.today.consultCount.toString(),
          change: stats.today.change.consultCount,
          isPositive: true,
          icon: <Briefcase size={20} />,
        },
        {
          title: '평균 시간',
          value: stats.today.avgDuration,
          change: stats.today.change.avgDuration,
          isPositive: true,
          icon: <ClockIcon />,
        },
        {
          title: '만족도',
          value: stats.today.satisfaction.toFixed(1),
          change: stats.today.change.satisfaction,
          isPositive: true,
          icon: <Star size={20} />,
        },
      ]
    : [];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">
      {/* Toast Notification */}
      {showNotification && (
        <div className="absolute top-20 right-6 z-50 animate-slide-in-right cursor-pointer" onClick={onNavigateWorkspace}>
          <div className="bg-white border-l-4 border-red shadow-lg rounded-r-lg p-4 flex items-start gap-3 max-w-sm">
             <div className="p-2 bg-red-50 rounded-full text-red">
                <AlertCircle size={20} />
             </div>
             <div>
                <h4 className="font-bold text-gray-800 text-sm">긴급 상담 요청</h4>
                <p className="text-xs text-gray-600 mt-1">VIP 고객님의 대출 관련 긴급 문의가 접수되었습니다.</p>
                <button className="text-xs font-bold text-red mt-2 hover:underline">바로 연결하기 →</button>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <h1 className="text-xl font-bold text-gray-800">상담원 대시보드</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full" onClick={() => setShowComingSoonModal(true)}>
            <Bell size={20} className={showNotification ? 'animate-swing text-red' : ''} />
            {getWaitingCustomers().length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red rounded-full border-2 border-white"></span>
            )}
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User size={16} /></div>
            <span className="text-sm font-medium text-gray-700">{user?.name || '상담원'}님</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
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
          <div className="max-w-7xl mx-auto">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">데이터를 불러오는데 실패했습니다</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Stats Row */}
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4">오늘의 성과</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statsCards.map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors">
                        {stat.icon}
                      </div>
                      <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-50 text-emerald' : 'bg-red-50 text-red'}`}>
                        {stat.isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.title}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity Chart & Live Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
              {/* Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-bold text-gray-700">실시간 대기 현황</h3>
                   <Badge text="Live" color="red" />
                 </div>
                 <div className="flex-1 min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={stats?.queue || []}>
                       <defs>
                         <linearGradient id="colorWaiting" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis
                         dataKey="time"
                         axisLine={false}
                         tickLine={false}
                         tick={{ fontSize: 12, fill: '#9CA3AF' }}
                       />
                       <YAxis
                         axisLine={false}
                         tickLine={false}
                         tick={{ fontSize: 12, fill: '#9CA3AF' }}
                       />
                       <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                       />
                       <Area type="monotone" dataKey="waiting" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorWaiting)" />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Live Status Lists */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">실시간 현황</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">상담 중 ({getConsultingCustomers().length})</h4>
                     <div className="space-y-2">
                       {getConsultingCustomers().length === 0 ? (
                         <p className="text-xs text-gray-500 py-2">상담 중인 고객이 없습니다.</p>
                       ) : (
                         getConsultingCustomers().map((customer) => (
                           <div
                             key={customer.id}
                             onClick={() => { selectCustomer(customer.id); onNavigateWorkspace(); }}
                             className="flex items-center gap-3 p-3 bg-white border-l-4 border-emerald-500 rounded shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
                           >
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">👤</div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{customer.name}</p>
                                <p className="text-xs text-gray-500">{customer.segment || '일반'} · 상담 중</p>
                              </div>
                           </div>
                         ))
                       )}
                     </div>
                  </div>
                  <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">대기 중 ({getWaitingCustomers().length})</h4>
                     <div className="space-y-2">
                       {getWaitingCustomers().length === 0 ? (
                         <p className="text-xs text-gray-500 py-2">대기 중인 고객이 없습니다.</p>
                       ) : (
                         getWaitingCustomers().map((customer) => (
                           <div
                             key={customer.id}
                             onClick={() => { selectCustomer(customer.id); onNavigateWorkspace(); }}
                             className={`flex items-center gap-3 p-3 border-l-4 rounded cursor-pointer transition-colors ${
                               customer.priority === 'high' || customer.priority === 'urgent'
                                 ? 'bg-red-50/50 border-red-400 hover:bg-red-50'
                                 : 'bg-yellow-50/50 border-yellow-400 hover:bg-yellow-50'
                             }`}
                           >
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm">⏳</div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{customer.name}</p>
                                <p className={`text-xs ${customer.priority === 'high' || customer.priority === 'urgent' ? 'text-red-500' : 'text-yellow-600'}`}>
                                  {customer.priority === 'high' || customer.priority === 'urgent' ? '긴급' : '일반'}
                                </p>
                              </div>
                           </div>
                         ))
                       )}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Rank & Notice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800">팀 랭킹</h3>
                    <span className="text-xs text-gray-500">실시간</span>
                 </div>
                 <div className="space-y-3">
                   {teamRanking?.slice(0, 5).map((agent) => (
                     <div key={agent.rank} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{agent.rank === 1 ? '🥇' : agent.rank === 2 ? '🥈' : agent.rank === 3 ? '🥉' : `  ${agent.rank}.`}</span>
                          <span className="text-sm font-medium text-gray-800">{agent.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{agent.consultCount}건</span>
                     </div>
                   ))}
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                 <h3 className="text-sm font-bold text-gray-800 mb-4">팀 공지사항</h3>
                 <div className="space-y-3">
                   {notices && notices.length > 0 ? (
                     notices.map((notice) => (
                       <div
                         key={notice.id}
                         className={`border-l-4 p-3 rounded-r-lg ${
                           notice.type === 'urgent'
                             ? 'bg-red-50 border-red-400'
                             : notice.type === 'update'
                               ? 'bg-yellow-50 border-yellow-400'
                               : 'bg-gray-50 border-gray-400'
                         }`}
                       >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{notice.type === 'urgent' ? '📢' : '📋'}</span>
                            <span className="font-bold text-sm text-gray-800">{notice.title}</span>
                          </div>
                          <p className="text-xs text-gray-600 pl-7">{notice.content}</p>
                       </div>
                     ))
                   ) : (
                     <p className="text-xs text-gray-500 py-2">공지사항이 없습니다.</p>
                   )}
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 추후 개발 안내 모달 */}
      <Modal
        isOpen={showComingSoonModal}
        onClose={() => setShowComingSoonModal(false)}
        title="알림"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Info className="text-blue-600" size={24} />
          </div>
          <p className="text-gray-700">해당 기능은 추후 개발 예정입니다.</p>
          <Button
            onClick={() => setShowComingSoonModal(false)}
            className="w-full"
            size="lg"
          >
            확인
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const Badge = ({ text, color }: { text: string, color: string }) => (
  <span className={`px-2 py-0.5 text-[10px] font-bold rounded bg-${color}-100 text-${color}-600 uppercase tracking-wide`}>
    {text}
  </span>
);