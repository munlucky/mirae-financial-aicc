import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Bell, Menu, User, Briefcase, TrendingUp, TrendingDown, Star, Award, Users, AlertCircle } from 'lucide-react';
import { DashboardStat } from '../../types';

// Mock Data
const stats: DashboardStat[] = [
  { title: '상담 처리', value: '23', change: '150%', isPositive: true, icon: <Briefcase size={20} /> },
  { title: '평균 시간', value: '5m 30s', change: '30s', isPositive: true, icon: <ClockIcon /> },
  { title: '만족도', value: '4.8', change: '0.2', isPositive: true, icon: <Star size={20} /> },
];

const activityData = [
  { time: '9시', count: 4 },
  { time: '10시', count: 8 },
  { time: '11시', count: 12 },
  { time: '12시', count: 5 },
  { time: '13시', count: 9 },
  { time: '14시', count: 15 },
  { time: '15시', count: 10 },
];

const queueData = [
  { time: '09:00', waiting: 2 },
  { time: '09:15', waiting: 4 },
  { time: '09:30', waiting: 8 },
  { time: '09:45', waiting: 5 },
  { time: '10:00', waiting: 3 },
  { time: '10:15', waiting: 6 },
  { time: '10:30', waiting: 9 },
  { time: '10:45', waiting: 7 },
  { time: '11:00', waiting: 4 },
];

function ClockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

interface Props {
  onNavigateWorkspace: () => void;
}

export const AgentDashboard: React.FC<Props> = ({ onNavigateWorkspace }) => {
  const [showNotification, setShowNotification] = useState(false);

  // Simulate incoming real-time alert
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      // Auto dismiss
      setTimeout(() => setShowNotification(false), 5000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell size={20} className={showNotification ? 'animate-swing text-red' : ''} />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User size={16} /></div>
            <span className="text-sm font-medium text-gray-700">김미래 상담원</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Stats Row */}
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4">오늘의 성과</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
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
                   <AreaChart data={queueData}>
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
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">상담 중 (3)</h4>
                   <div className="space-y-2">
                     {[1,2,3].map(i => (
                       <div key={i} onClick={onNavigateWorkspace} className="flex items-center gap-3 p-3 bg-white border-l-4 border-emerald-500 rounded shadow-sm hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">👤</div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">고객 #{100+i}</p>
                            <p className="text-xs text-gray-500">대출 문의 · 3분</p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">대기 중 (2)</h4>
                   <div className="space-y-2">
                     {[1,2].map(i => (
                       <div key={i} className="flex items-center gap-3 p-3 bg-red-50/50 border-l-4 border-red-400 rounded cursor-pointer hover:bg-red-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm">⏳</div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">고객 #{200+i}</p>
                            <p className="text-xs text-red-500">긴급 · 5분 대기</p>
                          </div>
                       </div>
                     ))}
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
                  <span className="text-xs text-gray-500">5분 전 업데이트</span>
               </div>
               <div className="space-y-3">
                 {[
                   { name: '김미래', count: 23, rank: 1, medal: '🥇' },
                   { name: '이철수', count: 21, rank: 2, medal: '🥈' },
                   { name: '박영희', count: 18, rank: 3, medal: '🥉' },
                 ].map((agent) => (
                   <div key={agent.rank} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{agent.medal}</span>
                        <span className="text-sm font-medium text-gray-800">{agent.rank}. {agent.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{agent.count}건</span>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
               <h3 className="text-sm font-bold text-gray-800 mb-4">팀 공지사항</h3>
               <div className="space-y-3">
                 <div className="bg-[#FFFEF2] border-l-4 border-orange p-3 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📢</span>
                      <span className="font-bold text-sm text-gray-800">시스템 점검 안내</span>
                    </div>
                    <p className="text-xs text-gray-600 pl-7">오늘 밤 22:00 - 23:00 서버 패치가 있습니다.</p>
                 </div>
                 <div className="bg-gray-50 border-l-4 border-gray-400 p-3 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📋</span>
                      <span className="font-bold text-sm text-gray-800">신규 스크립트 업데이트</span>
                    </div>
                    <p className="text-xs text-gray-600 pl-7">변경된 대출 정책을 확인해주세요.</p>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </main>
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 1s infinite;
        }
      `}</style>
    </div>
  );
};

const Badge = ({ text, color }: { text: string, color: string }) => (
  <span className={`px-2 py-0.5 text-[10px] font-bold rounded bg-${color}-100 text-${color}-600 uppercase tracking-wide`}>
    {text}
  </span>
);