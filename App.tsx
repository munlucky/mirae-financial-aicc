import React, { useState, useEffect, lazy, Suspense } from 'react';
import { UserRole } from './types';
import { useChatStore } from './lib/store/chatStore';
import { useAgentStore } from './lib/store/agentStore';

// 코드 분할: 동적 import
const CustomerLogin = lazy(() => import('./components/customer/CustomerLogin'));
const ChatHome = lazy(() => import('./components/customer/ChatHome'));
const ChatDetail = lazy(() => import('./components/customer/ChatDetail'));
const AgentDashboard = lazy(() => import('./components/agent/AgentDashboard'));
const AgentWorkspace = lazy(() => import('./components/agent/AgentWorkspace'));

// App State Management
enum Screen {
  LOGIN,
  CUSTOMER_HOME,
  CUSTOMER_CHAT,
  AGENT_DASHBOARD,
  AGENT_WORKSPACE
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [role, setRole] = useState<UserRole | null>(null);

  // WebSocket 연결 관리
  const connectWebSocket = useChatStore((state) => state.connectWebSocket);
  const disconnectWebSocket = useChatStore((state) => state.disconnectWebSocket);
  const connectAgentWebSocket = useAgentStore((state) => state.connectWebSocket);
  const disconnectAgentWebSocket = useAgentStore((state) => state.disconnectWebSocket);

  // 앱 마운트 시 WebSocket 연결
  useEffect(() => {
    connectWebSocket();
    connectAgentWebSocket();

    // 앱 언마운트 시 WebSocket 연결 해제
    return () => {
      disconnectWebSocket();
      disconnectAgentWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket, connectAgentWebSocket, disconnectAgentWebSocket]);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === UserRole.CUSTOMER) {
      setCurrentScreen(Screen.CUSTOMER_HOME);
    } else {
      setCurrentScreen(Screen.AGENT_DASHBOARD);
    }
  };

  // Render Logic
  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.LOGIN:
        return <CustomerLogin onLogin={() => handleLogin(UserRole.CUSTOMER)} />; // Default login screen look
      case Screen.CUSTOMER_HOME:
        return <ChatHome onSelectChat={() => setCurrentScreen(Screen.CUSTOMER_CHAT)} />;
      case Screen.CUSTOMER_CHAT:
        return <ChatDetail onBack={() => setCurrentScreen(Screen.CUSTOMER_HOME)} />;
      case Screen.AGENT_DASHBOARD:
        return <AgentDashboard onNavigateWorkspace={() => setCurrentScreen(Screen.AGENT_WORKSPACE)} />;
      case Screen.AGENT_WORKSPACE:
        return <AgentWorkspace onBack={() => setCurrentScreen(Screen.AGENT_DASHBOARD)} />;
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
        {renderScreen()}
      </Suspense>

      {/* Development Role Switcher Overlay */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 opacity-30 hover:opacity-100 transition-opacity">
        <div className="bg-black/80 text-white p-2 rounded-lg text-xs backdrop-blur-sm">
          <p className="font-bold mb-1">개발자 도구</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleLogin(UserRole.CUSTOMER)} 
              className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-500"
            >
              고객 화면
            </button>
            <button 
              onClick={() => handleLogin(UserRole.AGENT)} 
              className="px-2 py-1 bg-emerald-600 rounded hover:bg-emerald-500"
            >
              상담원 화면
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;