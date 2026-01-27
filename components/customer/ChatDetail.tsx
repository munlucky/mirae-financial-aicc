import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { ArrowLeft, MoreVertical, Info, Mic, Send, Volume2, ChevronDown, Check, CheckCheck, Pause, Square, Paperclip, FileText, X, Play, StopCircle, Image as ImageIcon, Music, File, Download, AlertCircle } from 'lucide-react';
import { Message, VoiceState } from '../../types';
import { Badge } from '../Badge';
import { Modal } from '../Modal';
import { Button } from '../Button';
import {
  READ_RECEIPT_DELAY,
  AI_RESPONSE_BASE_DELAY,
  AI_RESPONSE_RANDOM_DELAY,
  FILE_RESPONSE_DELAY,
  VOICE_PROCESSING_DELAY,
} from '../../lib/constants/timing';
import { createSpeechRecognition } from '../../lib/services/speechRecognition';
import { createSpeechSynthesis } from '../../lib/services/speechSynthesis';
import type { SpeechRecognitionResult } from '../../types/speech';
import '../../styles/animations.css';

interface Props {
  onBack: () => void;
}

const initialMessages: Message[] = [
  { id: '1', sender: 'user', text: '대출 상담을 받고 싶어요.', timestamp: '14:23', read: true },
  { 
    id: '2', 
    sender: 'ai', 
    text: '네, 도와드리겠습니다. 주택담보대출과 신용대출 중 어떤 상품을 찾으시나요?', 
    timestamp: '14:23', 
    confidence: 'high',
    quickReplies: ['신용대출', '주택담보대출', '자동차대출']
  }
];

// Simple AI Analysis Logic
const getSmartResponse = (input: string) => {
  const text = input.trim();
  
  if (text.match(/대출|돈|자금/i)) {
    return {
      text: "고객님의 금융 데이터를 기반으로 분석한 결과, '직장인 신용대출'과 '마이너스 통장' 상품 신청이 가능합니다. 상세 조건을 확인하시겠습니까?",
      quickReplies: ['직장인 신용대출', '마이너스 통장', '금리 비교']
    };
  }
  
  if (text.match(/금리|이자|비용/i)) {
    return {
      text: "현재 고객님의 신용점수(KCB 950점)를 반영한 예상 최저 금리는 연 4.2%입니다. 금리인하요구권 대상 여부도 함께 확인해 드릴까요?",
      quickReplies: ['금리인하요구권 조회', '월 상환액 계산', '다른 상품 비교']
    };
  }

  if (text.match(/서류|제출|준비/i)) {
    return {
      text: "대출 심사는 '스크래핑' 기술을 통해 서류 없이 자동으로 진행됩니다. 다만, 추가 소득 증빙이 필요한 경우 아래 서류를 요청드릴 수 있습니다.\n\n- 소득금액증명원\n- 원천징수영수증",
      quickReplies: ['자동 제출 시작', '직접 업로드']
    };
  }
  
  if (text.match(/안녕|반가|하이/i)) {
      return {
          text: "안녕하세요! 미래금융 AI 어시스턴트입니다. 24시간 언제든 금융 관련 궁금증을 해결해 드립니다.",
          quickReplies: ['대출 상담', '계좌 조회', '카드 발급']
      };
  }
  
  if (text.match(/상담원|사람/i)) {
      return {
          text: "전문 상담원 연결을 위해 대기 인원을 실시간으로 확인하고 있습니다.\n현재 예상 대기 시간은 약 3분입니다. 연결해 드릴까요?",
          quickReplies: ['상담원 연결', '전화 상담 요청', '취소']
      };
  }

  return {
    text: "죄송합니다. 문의주신 내용을 명확히 이해하지 못했습니다. 아래 추천 메뉴에서 선택해 주시거나, 더 구체적으로 말씀해 주세요.",
    quickReplies: ['대출 한도 조회', '이자 납입일 확인', '상담원 연결']
  };
};

export const ChatDetail: React.FC<Props> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [interimText, setInterimText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>(VoiceState.IDLE);
  const [isTyping, setIsTyping] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sttServiceRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null);
  const ttsServiceRef = useRef<ReturnType<typeof createSpeechSynthesis> | null>(null);

  // Initialize Speech Services
  useEffect(() => {
    // Initialize STT service
    sttServiceRef.current = createSpeechRecognition(
      {
        onResult: (result: SpeechRecognitionResult) => {
          setInterimText('');
          setInputValue(result.transcript);
          setVoiceState(VoiceState.COMPLETE);
        },
        onInterimResult: (result: SpeechRecognitionResult) => {
          setInterimText(result.transcript);
        },
        onError: (error) => {
          setRecognitionError(error.message);
          setVoiceState(VoiceState.IDLE);
          setInterimText('');
          // Auto-hide error after 3 seconds
          setTimeout(() => setRecognitionError(null), 3000);
        },
        onStart: () => {
          setInterimText('');
          setRecognitionError(null);
        },
        onEnd: () => {
          // Voice state will be updated by onResult
        },
      },
      { lang: 'ko-KR', continuous: false, interimResults: true }
    );

    // Initialize TTS service
    ttsServiceRef.current = createSpeechSynthesis({ lang: 'ko-KR' });

    // Cleanup
    return () => {
      sttServiceRef.current?.destroy();
      ttsServiceRef.current?.destroy();
    };
  }, []);

  // Load chat from localStorage with error handling
  useEffect(() => {
    try {
      const savedChat = localStorage.getItem('mirae_chat_history');
      if (savedChat) {
        try {
          setMessages(JSON.parse(savedChat));
        } catch {
          // Invalid chat history format, reset to initial messages
          setMessages(initialMessages);
          localStorage.removeItem('mirae_chat_history');
        }
      }
    } catch (error) {
      // localStorage access failed (e.g., Safari private mode)
      console.warn('localStorage access failed:', error);
    }
  }, []);

  // Save chat to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('mirae_chat_history', JSON.stringify(messages));
    } catch (error) {
      // localStorage access failed (e.g., quota exceeded, private mode)
      console.warn('Failed to save chat history:', error);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, voiceState, isTyping]);

  const handleSend = (type: 'text' | 'audio' = 'text') => {
    if (!inputValue.trim() && type === 'text') return;
    
    // For audio messages, we assume the inputValue is the transcription
    const textContent = inputValue.trim() || (type === 'audio' ? '음성 메시지' : '');

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      hasAudio: type === 'audio'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setVoiceState(VoiceState.IDLE); // Reset voice state if sending audio
    setIsTyping(true);

    // Simulate Read Receipt
    setTimeout(() => {
       setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, read: true } : m));
    }, READ_RECEIPT_DELAY);
    
    // AI Auto-Reply Logic
    setTimeout(() => {
      const aiResponse = getSmartResponse(newMessage.text);

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 'high',
        quickReplies: aiResponse.quickReplies
      }]);
    }, AI_RESPONSE_BASE_DELAY + Math.random() * AI_RESPONSE_RANDOM_DELAY); 
  };

  // File Attachment Logic with Image Preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      
      const processAttachment = (url?: string) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: 'user',
          text: isImage ? '사진을 전송했습니다.' : '파일을 첨부했습니다.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          attachment: {
            name: file.name,
            type: isImage ? 'image' : 'file',
            url: url
          }
        };
        setMessages(prev => [...prev, newMessage]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsTyping(true);
        
        // AI Response simulation for file
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: isImage
              ? `보내주신 사진(${file.name}) 잘 받았습니다. 이미지를 분석하여 처리하겠습니다.`
              : `파일(${file.name})을 정상적으로 수신했습니다. 내용을 분석하여 곧 안내드리겠습니다.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: 'high'
          }]);
        }, FILE_RESPONSE_DELAY);
      };

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          processAttachment(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        processAttachment();
      }
    }
  };

  // Helper to get file icon and info
  const getFileDisplayInfo = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    let icon = <FileText size={20} className="text-gray-500" />;
    
    if (['pdf'].includes(ext || '')) icon = <FileText size={20} className="text-red-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) icon = <FileText size={20} className="text-emerald-600" />;
    if (['doc', 'docx'].includes(ext || '')) icon = <FileText size={20} className="text-blue-600" />;
    if (['ppt', 'pptx'].includes(ext || '')) icon = <FileText size={20} className="text-orange-500" />;
    
    return { icon, ext: ext?.toUpperCase() || 'FILE' };
  };

  // Text-to-Speech Logic (TTS)
  const toggleSpeech = (msg: Message) => {
    if (!ttsServiceRef.current) return;

    if (playingMessageId === msg.id) {
      ttsServiceRef.current.cancel();
      setPlayingMessageId(null);
    } else {
      ttsServiceRef.current.cancel();
      ttsServiceRef.current.speak(msg.text);
      setPlayingMessageId(msg.id);

      // Reset playing state when speech ends
      const checkEnd = setInterval(() => {
        if (!ttsServiceRef.current?.isSpeaking()) {
          setPlayingMessageId(null);
          clearInterval(checkEnd);
        }
      }, 100);
    }
  };

  // Improved Voice Interaction Logic (STT)
  const handleMicClick = () => {
    if (!sttServiceRef.current) return;

    if (voiceState === VoiceState.IDLE) {
      setVoiceState(VoiceState.LISTENING);
      sttServiceRef.current.start();
    } else if (voiceState === VoiceState.LISTENING) {
      setVoiceState(VoiceState.PAUSED);
      sttServiceRef.current.stop();
    } else if (voiceState === VoiceState.PAUSED) {
      setVoiceState(VoiceState.LISTENING);
      sttServiceRef.current.start();
    }
  };

  const finishVoice = () => {
    setVoiceState(VoiceState.PROCESSING);
    sttServiceRef.current?.stop();
  };

  const closeVoiceUI = () => {
    setVoiceState(VoiceState.IDLE);
    setInterimText('');
    setRecognitionError(null);
    sttServiceRef.current?.stop();
  };

  // Auto-reset voice state when sending
  useEffect(() => {
    if (voiceState === VoiceState.IDLE && interimText) {
      setInterimText('');
    }
  }, [voiceState, interimText]);

  // Waveform generation for visual effect
  const waveformBars = [40, 70, 100, 60, 80, 40, 90, 50, 70, 100, 60, 40, 80, 50, 90];

  return (
    <div className="flex flex-col h-full bg-white sm:max-w-[480px] sm:mx-auto sm:border-x sm:border-gray-200 sm:shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="px-3 py-3 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm z-20">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">AI 상담사</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-emerald-600 font-medium">온라인</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600" onClick={() => setShowComingSoonModal(true)}><Info size={24} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600" onClick={() => setShowComingSoonModal(true)}><MoreVertical size={24} /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scroll p-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm relative ${
              msg.sender === 'user' 
                ? 'bg-[#E6F2FF] text-gray-800 rounded-tr-none' 
                : 'bg-[#FFFEF2] border border-orange-100 text-gray-800 rounded-tl-none'
            }`}>
              {/* AI Header */}
              {msg.sender === 'ai' && (
                 <div className="flex items-center justify-between mb-2">
                   <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs mr-2">🤖</div>
                   {msg.confidence === 'high' && (
                     <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">✓ 신뢰도 높음</span>
                   )}
                 </div>
              )}
              
              {/* Attachment Display */}
              {msg.attachment && (
                <div className="mb-2">
                  {msg.attachment.type === 'image' ? (
                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white cursor-pointer">
                      <img src={msg.attachment.url} alt="Attached" className="w-full h-auto object-cover max-h-48" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between">
                         <p className="text-white text-xs truncate max-w-[80%]">{msg.attachment.name}</p>
                         <button className="p-1 text-white hover:text-emerald-300" onClick={() => setShowComingSoonModal(true)}><Download size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm group hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        {getFileDisplayInfo(msg.attachment.name).icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{msg.attachment.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[10px] text-gray-500 font-medium">1.2 MB</span>
                           <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                           <span className="text-[10px] text-gray-400 font-bold">{getFileDisplayInfo(msg.attachment.name).ext}</span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-primary">
                         <Download size={16} />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Audio Message Display */}
              {msg.hasAudio ? (
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20">
                     <Play size={14} fill="currentColor" />
                   </div>
                   <div className="h-8 flex-1 flex items-center gap-0.5">
                      {[...Array(15)].map((_, i) => (
                        <div key={i} className="w-1 bg-primary/40 rounded-full" style={{height: Math.random() * 16 + 8 + 'px'}}></div>
                      ))}
                   </div>
                   <span className="text-[10px] text-gray-500 font-mono">0:05</span>
                 </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              )}
              
              {/* AI Extras & Audio Playback (For Text Messages) */}
              {msg.sender === 'ai' && !msg.hasAudio && (
                <div className="mt-3 space-y-2">
                  <button 
                    onClick={() => toggleSpeech(msg)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded border transition-colors ${
                      playingMessageId === msg.id 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-primary border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {playingMessageId === msg.id ? <StopCircle size={12} /> : <Volume2 size={12} />}
                    {playingMessageId === msg.id ? '중지' : '음성 듣기'}
                  </button>
                  {msg.quickReplies && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.quickReplies.map((reply) => (
                        <button key={reply} onClick={() => setInputValue(reply)} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={`absolute bottom-2 flex items-center gap-1 ${msg.sender === 'user' ? 'left-2' : 'right-3'}`}>
                 <span className={`text-[10px] ${msg.sender === 'user' ? 'text-blue-300' : 'text-gray-400'}`}>
                  {msg.timestamp}
                 </span>
                 {msg.sender === 'user' && (
                   msg.read ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} className="text-blue-300" />
                 )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start w-full mb-4 animate-fade-in">
             <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
                <span className="text-xs text-gray-400 font-medium">분석 중...</span>
             </div>
          </div>
        )}

        {/* Voice UI Overlay (Inline) */}
        {voiceState !== VoiceState.IDLE && (
           <div className="w-full mb-4 animate-fade-in-up sticky bottom-0 z-30">
              <div
                className={`
                w-full rounded-2xl p-5 flex flex-col items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden shadow-xl
                ${(voiceState === VoiceState.LISTENING || voiceState === VoiceState.PAUSED) ? 'bg-primary text-white' : ''}
                ${voiceState === VoiceState.PROCESSING ? 'bg-orange text-white' : ''}
                ${voiceState === VoiceState.COMPLETE ? 'bg-emerald text-white cursor-pointer' : ''}
              `}>
                {voiceState === VoiceState.COMPLETE && <div className="absolute inset-0 z-0 bg-emerald-500"></div>}

                {/* Recognition Error Display */}
                {recognitionError && (
                  <div className="w-full bg-red-500/90 text-white px-4 py-3 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-medium">{recognitionError}</p>
                  </div>
                )}

                {(voiceState === VoiceState.LISTENING || voiceState === VoiceState.PAUSED) && (
                  <>
                    <div className="flex items-center justify-between w-full z-10">
                        <div className="flex items-center gap-2">
                          {voiceState === VoiceState.LISTENING && <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>}
                          {voiceState === VoiceState.PAUSED && <Pause size={16} className="fill-white" />}
                          <span className="font-bold text-base tracking-wide">{voiceState === VoiceState.LISTENING ? '듣고 있어요...' : '일시정지됨'}</span>
                        </div>
                        <span className="text-xs font-mono opacity-80">{sttServiceRef.current?.getState() === 'listening' ? '00:00' : '00:00'}</span>
                    </div>

                    {/* Interim Text Display */}
                    {interimText && (
                      <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                        <p className="text-sm text-white/90">{interimText}</p>
                      </div>
                    )}
                    
                    {voiceState === VoiceState.LISTENING && (
                      <div className="w-full h-16 flex items-center justify-center gap-1.5 z-0 opacity-90 my-2">
                        {waveformBars.map((h, i) => (
                          <div 
                            key={i} 
                            className="w-1.5 bg-white rounded-full animate-waveform shadow-sm" 
                            style={{
                                height: `${h}%`, 
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.6s' 
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                     {voiceState === VoiceState.PAUSED && (
                        <div className="w-full h-16 flex items-center justify-center gap-1.5 opacity-50 my-2">
                           <div className="w-full h-1 bg-white/30 rounded-full"></div>
                        </div>
                     )}

                    <div className="flex gap-4 mt-2 z-20 w-full justify-center">
                       <button onClick={handleMicClick} className="flex-1 max-w-[120px] py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold border border-white/20 backdrop-blur-sm transition-colors flex items-center justify-center gap-2">
                          {voiceState === VoiceState.LISTENING ? <><Pause size={14} /> 일시정지</> : <><Mic size={14} /> 계속하기</>}
                       </button>
                       <button onClick={finishVoice} className="flex-1 max-w-[120px] py-2.5 bg-white text-primary hover:bg-gray-100 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors transform active:scale-95">
                          <Square size={12} className="fill-primary" /> 완료
                       </button>
                    </div>
                  </>
                )}
                {voiceState === VoiceState.PROCESSING && (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold text-lg">답변 생성 중...</span>
                    <span className="text-xs text-white/80">잠시만 기다려주세요</span>
                  </div>
                )}
                {voiceState === VoiceState.COMPLETE && (
                  <div className="flex flex-col items-center gap-3 z-10 w-full animate-fade-in">
                    <div className="flex items-center gap-2 text-white mb-2">
                      <div className="p-1 bg-white/20 rounded-full">
                         <Check size={20} />
                      </div>
                      <span className="font-bold text-lg">음성 인식 완료</span>
                    </div>
                    {/* Recognized Text Display */}
                    {inputValue && (
                      <div className="w-full bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 mb-2">
                        <p className="text-sm text-white">{inputValue}</p>
                      </div>
                    )}
                    <div className="flex gap-3 w-full px-2">
                       <button 
                         onClick={() => handleSend('text')}
                         className="flex-1 bg-white text-emerald-700 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-gray-50 transition-colors"
                       >
                         텍스트로 전송
                       </button>
                       <button 
                         onClick={() => handleSend('audio')}
                         className="flex-1 bg-emerald-800 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-900 transition-colors flex items-center justify-center gap-2 border border-emerald-600"
                       >
                         <Music size={16} /> 음성 메시지
                       </button>
                    </div>
                    <button onClick={closeVoiceUI} className="text-xs text-white/80 hover:text-white mt-2 p-2">닫기</button>
                  </div>
                )}
              </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-3 pb-6 sm:pb-3">
        <div className="flex items-end gap-2">
          {/* File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <Paperclip size={20} />
          </button>

          <div className="flex-1 bg-gray-100 rounded-xl flex items-center min-h-[44px]">
             <input 
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend('text')}
               placeholder="메시지를 입력하세요..."
               className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none max-h-24"
             />
          </div>
          
          <button 
            onClick={handleMicClick}
            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              (voiceState === VoiceState.LISTENING || voiceState === VoiceState.PAUSED) ? 'bg-red text-white animate-pulse shadow-lg ring-2 ring-red ring-offset-2' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {voiceState === VoiceState.PAUSED ? <Pause size={22} /> : <Mic size={22} />}
          </button>
          
          <button
            onClick={() => handleSend('text')}
            disabled={!inputValue.trim()}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-primary text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>

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