import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ArrowLeft, Plus, Phone, PhoneOff, LogOut, Search, MoreVertical, Mic, Send, Edit3, Clipboard, ShieldCheck, ChevronDown, CheckCircle, Bell, X, ChevronUp, Save, Loader2 } from 'lucide-react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Input } from '../Input';
import { Message } from '../../types';
import '../../styles/animations.css';

interface Props {
  onBack: () => void;
}

export const AgentWorkspace: React.FC<Props> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'user', text: '대출 상담 받고 싶습니다.', timestamp: '14:23' },
    { 
      id: '2', 
      sender: 'ai', 
      text: '네, 도와드리겠습니다. 주택담보대출과 신용대출 중 어떤 것을 원하시나요?', 
      timestamp: '14:23', 
      confidence: 'high',
      quickReplies: ['신용대출', '주택담보대출']
    },
    { id: '3', sender: 'user', text: '신용대출로 5천만원 정도 생각하고 있어요.', timestamp: '14:24' },
    { id: '4', sender: 'ai', text: '알겠습니다. 고객님 정보 기반으로 \'직장인 우대 대출\' 상품을 추천해 드립니다.', timestamp: '14:24', confidence: 'high' }
  ]);
  const [inputText, setInputText] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  // Chat Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [matchingIds, setMatchingIds] = useState<string[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Memo State
  const [memo, setMemo] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Simulate incoming message notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Load memo on mount with error handling
  useEffect(() => {
    try {
      const savedMemo = localStorage.getItem('agent_workspace_memo');
      if (savedMemo) {
        setMemo(savedMemo);
        setSaveStatus('saved');
      }
    } catch (error) {
      console.warn('Failed to load memo from localStorage:', error);
    }
  }, []);

  // Auto-save memo logic with error handling
  useEffect(() => {
    if (saveStatus === 'idle' && !memo) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('agent_workspace_memo', memo);
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (error) {
        console.warn('Failed to save memo to localStorage:', error);
        setSaveStatus('idle'); // Reset status on error
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [memo]);

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
  };

  // Search Logic: Find matches and highlight/scroll
  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      setMatchingIds([]);
      return;
    }
    const matches = messages
      .filter(m => m.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      .map(m => m.id);
    setMatchingIds(matches);
    
    if (matches.length > 0) {
      setCurrentMatchIdx(0);
      setTimeout(() => {
         messageRefs.current[matches[0]]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [chatSearchQuery, messages]);

  const navigateSearch = (direction: 'next' | 'prev') => {
    if (matchingIds.length === 0) return;
    
    let newIdx = direction === 'next' ? currentMatchIdx + 1 : currentMatchIdx - 1;
    if (newIdx >= matchingIds.length) newIdx = 0;
    if (newIdx < 0) newIdx = matchingIds.length - 1;
    
    setCurrentMatchIdx(newIdx);
    messageRefs.current[matchingIds[newIdx]]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Text highlighting helper (memoized for performance)
  const HighlightText = memo(({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i} className="bg-yellow-300 text-gray-900 rounded-sm px-0.5 font-semibold">{part}</mark> : part
        )}
      </span>
    );
  });
  HighlightText.displayName = 'HighlightText';

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
      {/* Notification Toast */}
      {showNotification && (
        <div className="absolute top-20 right-6 z-50 animate-slide-in-right">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
             <div className="relative">
                <Bell size={20} className="text-yellow-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red rounded-full animate-ping"></span>
             </div>
             <div>
                <p className="text-sm font-bold">새 메시지 도착</p>
                <p className="text-xs text-gray-300">고객님이 메시지를 보냈습니다.</p>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
             <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">👤</div>
             <div>
               <h1 className="text-base font-bold text-gray-800 leading-tight">김철수</h1>
               <p className="text-xs text-emerald-600 font-medium">대출 상담 · 03:21</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Plus size={16} /></Button>
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm"><Phone size={16} className="mr-2" /> 통화 시작</Button>
          <Button variant="danger" size="sm"><PhoneOff size={16} className="mr-2" /> 종료</Button>
        </div>
      </header>

      {/* Main Workspace (3 Columns) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Customer List (250px Fixed) */}
        <aside className="w-[250px] bg-white border-r border-gray-200 flex flex-col z-10 hidden lg:flex">
          <div className="p-4 border-b border-gray-100">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="검색..." />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <h3 className="px-3 py-2 text-xs font-bold text-gray-500 uppercase">진행 중</h3>
            <div className="mb-4 space-y-1">
              <div className="px-3 py-3 bg-[#E6F2FF] border-l-4 border-primary rounded-r-lg cursor-pointer group relative hover:shadow-sm transition-all">
                 <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-gray-900">김철수</span>
                       <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          상담 중
                       </span>
                    </div>
                    <span className="text-[10px] text-gray-500">03:21</span>
                 </div>
                 <p className="text-xs text-gray-600 truncate pl-0.5">대출 상담 문의</p>
              </div>
              
              <div className="px-3 py-3 hover:bg-gray-50 border-l-4 border-transparent rounded-r-lg cursor-pointer transition-colors relative group">
                 <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-gray-700">이민지</span>
                       <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          대기 중
                       </span>
                    </div>
                    <span className="text-[10px] text-gray-400">14:05</span>
                 </div>
                 <p className="text-xs text-gray-500 truncate pl-0.5">펀드 상품 문의</p>
              </div>
            </div>

            <h3 className="px-3 py-2 text-xs font-bold text-red-500 uppercase">대기 (1)</h3>
            <div className="space-y-1">
               <div className="px-3 py-3 bg-red-50 border-l-4 border-red-300 rounded-r-lg cursor-pointer hover:bg-red-100 transition-colors">
                 <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-sm text-gray-900">박선호</span>
                       <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          긴급
                       </span>
                    </div>
                    <span className="text-[10px] text-red-600 font-bold">2분 경과</span>
                 </div>
                 <p className="text-xs text-gray-700 truncate pl-0.5">보험금 청구 관련</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Panel: Chat (Flexible) */}
        <main className="flex-1 flex flex-col bg-white min-w-[400px]">
           {/* Chat Header with Search Toggle */}
           <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50/50">
             <div className="flex items-center gap-2">
               <span className="text-sm font-bold text-gray-700">AI 어시스턴트</span>
               <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded font-bold">실시간</span>
             </div>
             <div className="flex items-center gap-2">
               {isSearchOpen ? (
                 <div className="flex items-center bg-white border border-gray-300 rounded-md px-2 py-1 h-9 animate-fade-in shadow-sm gap-1">
                   <Search size={14} className="text-gray-400 ml-1" />
                   <input 
                     autoFocus
                     value={chatSearchQuery} 
                     onChange={(e) => setChatSearchQuery(e.target.value)}
                     onKeyDown={(e) => {
                       if(e.key === 'Enter') navigateSearch(e.shiftKey ? 'prev' : 'next');
                       if(e.key === 'Escape') { setIsSearchOpen(false); setChatSearchQuery(''); setMatchingIds([]); }
                     }}
                     className="text-xs outline-none w-32 bg-transparent ml-1" 
                     placeholder="검색..." 
                   />
                   <div className="flex items-center border-l border-gray-200 pl-1 gap-0.5 mr-1">
                      <span className="text-[10px] text-gray-400 w-8 text-center font-mono">
                        {matchingIds.length > 0 ? `${currentMatchIdx + 1}/${matchingIds.length}` : '0/0'}
                      </span>
                      <button onClick={() => navigateSearch('prev')} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30" disabled={matchingIds.length === 0}><ChevronUp size={14} className="text-gray-500" /></button>
                      <button onClick={() => navigateSearch('next')} className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30" disabled={matchingIds.length === 0}><ChevronDown size={14} className="text-gray-500" /></button>
                   </div>
                   <button onClick={() => { setIsSearchOpen(false); setChatSearchQuery(''); setMatchingIds([]); }} className="text-gray-400 hover:text-gray-600 mr-1">
                     <X size={14} />
                   </button>
                 </div>
               ) : (
                 <button onClick={() => setIsSearchOpen(true)} className="p-1.5 hover:bg-gray-200 rounded text-gray-500">
                   <Search size={18} />
                 </button>
               )}
               <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
             </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              {messages.map((msg) => {
                const isMatch = matchingIds.includes(msg.id);
                const isCurrent = isMatch && matchingIds[currentMatchIdx] === msg.id;
                
                return (
                <div 
                  key={msg.id} 
                  ref={el => (messageRefs.current[msg.id] = el)}
                  className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'} transition-all duration-300 ${isCurrent ? 'opacity-100 scale-[1.02]' : 'opacity-100'}`}
                >
                   <div className={`max-w-[70%] ${
                     msg.sender === 'user' 
                       ? 'bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-none' 
                       : 'bg-blue-50 border border-blue-100 rounded-2xl rounded-tr-none'
                   } p-4 shadow-sm relative group ${isCurrent ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[11px] font-bold text-gray-500 mb-1 block">
                          {msg.sender === 'user' ? '고객' : 'AI 어시스턴트'}
                        </span>
                        {msg.sender === 'ai' && msg.confidence === 'high' && <CheckCircle size={12} className="text-emerald-500" />}
                      </div>
                      
                      <p className="text-sm text-gray-800 leading-relaxed">
                        <HighlightText text={msg.text} highlight={chatSearchQuery} />
                      </p>
                      
                      {/* AI Quick Replies Display (Read-Only for Agent) */}
                      {msg.sender === 'ai' && msg.quickReplies && (
                         <div className="mt-3 pt-3 border-t border-blue-100/50">
                            <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase">고객에게 제안된 선택지</p>
                            <div className="flex flex-wrap gap-2 opacity-70">
                               {msg.quickReplies.map((reply, i) => (
                                 <span 
                                   key={i} 
                                   title="고객 전용 선택지입니다" 
                                   className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-500 cursor-not-allowed select-none hover:bg-gray-50"
                                 >
                                    {reply}
                                 </span>
                               ))}
                            </div>
                         </div>
                      )}
                      
                      {/* AI Suggestions for Agent */}
                      {msg.sender === 'ai' && !msg.quickReplies && (
                         <div className="mt-3 pt-3 border-t border-blue-100/50">
                            <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase">추천 작업 (클릭하여 입력)</p>
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => setInputText("'직장인 우대 대출' 선택")} 
                                 className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                               >
                                  '직장인 우대 대출' 선택
                               </button>
                               <button 
                                 onClick={() => setInputText("금리 정보 표시")} 
                                 className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                               >
                                  금리 정보 표시
                               </button>
                            </div>
                         </div>
                      )}
                      <span className="text-[10px] text-gray-400 absolute -bottom-5 right-0 group-hover:opacity-100 opacity-0 transition-opacity">{msg.timestamp}</span>
                   </div>
                </div>
              )})}
           </div>

           <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                 <div className="relative flex-1">
                    <input 
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                      placeholder="메시지 또는 명령어 입력 (Ctrl+/)..."
                    />
                    <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-primary" size={18} />
                 </div>
                 <Button className="h-[46px] w-[46px] rounded-lg flex items-center justify-center p-0">
                    <Send size={20} />
                 </Button>
              </div>
           </div>
        </main>

        {/* Right Panel: Customer Info (350px Fixed) */}
        <aside className="w-[350px] bg-white border-l border-gray-200 flex flex-col overflow-y-auto hidden xl:flex">
          <div className="p-6">
             <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900">김철수</h2>
                   <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="info">29세</Badge>
                      <Badge variant="default">직장인</Badge>
                      <Badge variant="default">서울</Badge>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                {/* Credit Score */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">신용 점수</span>
                      <span className="text-xs text-emerald-600 font-bold">우수</span>
                   </div>
                   <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-emerald-600">A</span>
                      <span className="text-sm text-gray-400 mb-1">901 ~ 1000</span>
                   </div>
                </div>

                {/* History */}
                <div>
                   <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Clipboard size={16} /> 상담 이력
                   </h3>
                   <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                         <span>총 상담 횟수</span>
                         <span className="font-bold">5회</span>
                      </div>
                      <div className="flex justify-between">
                         <span>최근 방문일</span>
                         <span>2024-01-10</span>
                      </div>
                      <div className="flex justify-between">
                         <span>만족도</span>
                         <span className="flex text-yellow-500">★★★★½</span>
                      </div>
                   </div>
                </div>

                {/* AI Suggestion */}
                <div>
                   <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-primary" /> AI 제안
                   </h3>
                   <div className="bg-[#E6F2FF] border border-blue-100 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">98% 일치</div>
                      <h4 className="font-bold text-primary mb-1">직장인 우대 대출</h4>
                      <p className="text-xs text-gray-600 mb-3">신용점수 우수 직장인을 위한 최적 금리 상품</p>
                      <Button 
                        size="sm" 
                        className="w-full bg-primary hover:bg-primary-hover active:scale-[0.98] transition-transform"
                        onClick={() => setInputText("직장인 우대 대출 상품 가입을 제안합니다.")}
                      >
                        가입 제안 (메시지 입력)
                      </Button>
                   </div>
                </div>

                {/* Memo */}
                <div>
                   <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                         <Edit3 size={16} /> 메모
                      </h3>
                      {saveStatus !== 'idle' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 animate-fade-in">
                          {saveStatus === 'saving' ? (
                            <>
                              <Loader2 size={10} className="animate-spin" />
                              <span>저장 중...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle size={10} className="text-emerald-500" />
                              <span>저장됨 {lastSavedTime}</span>
                            </>
                          )}
                        </div>
                      )}
                   </div>
                   <textarea 
                     value={memo}
                     onChange={handleMemoChange}
                     className="w-full bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-sm focus:outline-none focus:border-yellow-300 resize-none h-24" 
                     placeholder="메모를 입력하세요..."
                   ></textarea>
                </div>
             </div>
          </div>
        </aside>

      </div>
    </div>
  );
};