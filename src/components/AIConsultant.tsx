import { useState } from 'react';
import { useModelInference } from '../hooks/useModelInference';
import './AIConsultant.css';

export default function AIConsultant() {
  const { status, progress, error, generate } = useModelInference();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generate(input);
      setOutput(result);
    } catch (err) {
      console.error('생성 실패:', err);
      setOutput(`에러: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getAssistantResponse = (userQuestion: string): string => {
    return `질문: ${userQuestion}\n답변: `;
  };

  return (
    <div className="ai-consultant-container">
      <div className="ai-consultant-header">
        <h1>AI 금융 상담사</h1>
        <p className="subtitle">WebGPU 기반 브라우저 내 추론</p>
      </div>

      <div className="status-panel">
        <div className="status-row">
          <span className="status-label">상태:</span>
          <span className={`status-value status-${status}`}>{getStatusText(status)}</span>
        </div>
        {status === 'loading' && (
          <div className="progress-section">
            <div className="progress-header">
              <span>모델 로딩 중...</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <progress value={progress} max="1" className="progress-bar" />
          </div>
        )}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}
      </div>

      {status === 'ready' && (
        <div className="interaction-area">
          <div className="input-section">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="금융 관련 질문을 입력하세요..."
              className="input-textarea"
              rows={4}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="generate-button"
            >
              {isGenerating ? '생성 중...' : '답변 생성'}
            </button>
          </div>

          {output && (
            <div className="output-section">
              <h3>💬 AI 상담사 답변</h3>
              <div className="output-content">{output}</div>
            </div>
          )}
        </div>
      )}

      <div className="info-section">
        <h4>ℹ️ 안내</h4>
        <ul>
          <li>첫 로딩 시 모델 다운로드로 1-2분 소요될 수 있습니다</li>
          <li>WebGPU를 지원하는 브라우저(Chrome/Edge) 권장</li>
          <li>모든 추론은 브라우저 내에서 이루어지며 서버로 전송되지 않습니다</li>
        </ul>
      </div>
    </div>
  );
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    idle: '대기 중',
    loading: '로딩 중',
    ready: '준비 완료',
    generating: '생성 중',
    error: '오류'
  };
  return statusMap[status] || status;
}
