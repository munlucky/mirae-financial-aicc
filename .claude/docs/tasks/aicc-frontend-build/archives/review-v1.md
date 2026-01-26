# 코드 리뷰 보고서

> **리뷰 날짜**: 2026-01-26
> **리뷰 대상**: AICC 금융 AI 고객센터 프론트엔드 전체 코드
> **리뷰어**: Claude (Code Reviewer Expert)

---

## 요약 (Summary)

**판정**: ⚠️ **WARNING** - CRITICAL/HIGH 이슈로 인해 수정 필요

- **CRITICAL 이슈**: 2건 (보안 관련)
- **HIGH 이슈**: 4건 (에러 처리, 코드 품질)
- **MEDIUM 이슈**: 6건 (React 성능, 타입 안전성)
- **LOW 이슈**: 2건 (테스트, 타입 일관성)

---

## CRITICAL 이슈 (즉시 수정 필요)

### 1. 보안 - API 키 클라이언트 노출 🔴

**파일**: `C:\dev\mirae-financial-aicc\vite.config.ts:14-15`

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

**문제점**:
- GEMINI_API_KEY가 클라이언트 번들에 하드코딩됨
- 브라우저 개발자 도구에서 노출됨
- 소스코드에 포함되어 Git에 커밋 위험

**수정 제안**:
```typescript
// API 키는 절대 클라이언트에 노출하지 마세요
// 대신 백엔드 프록시 서버를 통해 호출하세요
// 예: /api/gemini/chat -> 백엔드에서 API 키 사용
```

---

### 2. 보안 - LocalStorage에 민감 토큰 저장 🔴

**파일**:
- `C:\dev\mirae-financial-aicc\lib\api\client.ts:24-27`
- `C:\dev\mirae-financial-aicc\lib\store\authStore.ts:62-63, 96`

```typescript
// client.ts
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);
```

**문제점**:
- XSS 공격으로 토큰 탈취 가능
- CSRF 방어 불가 (쿠키의 SameSite 속성 사용 불가)
- 브라우저 종료 후에도 토큰 유지 (보안 위험)

**수정 제안**:
```typescript
// 1. HttpOnly, Secure, SameSite 쿠키 사용 (백엔드 설정)
// 2. 메모리 내 상태 관리 (Zustand persist 제외)
// 3. 세션 스토리지 사용 (브라우저 종료 시 삭제)
```

---

## HIGH 이슈

### 3. 에러 처리 부족 🟠

**파일**:
- `C:\dev\mirae-financial-aicc\lib\store\chatStore.ts`
- `C:\dev\mirae-financial-aicc\lib\store\agentStore.ts`
- `C:\dev\mirae-financial-aicc\lib\store\authStore.ts`

**문제점**:
- try-catch는 있으나 사용자 피드백이 부족
- 네트워크 오류 시 `error.message`만 표시
- 오류 발생 후 상태가 불확실해짐

**수정 제안**:
```typescript
catch (error) {
  const userMessage = error instanceof ApiError
    ? error.userMessage // 사용자 친화적 메시지
    : '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

  set({ error: userMessage, isLoading: false });

  // 오류 로깅 (Sentry 등)
  logError(error);
}
```

---

### 4. 콘솔 로그 존재 🟠

**파일**: `C:\dev\mirae-financial-aicc\components\customer\ChatDetail.tsx:83`

```typescript
console.error("Failed to load chat history", e);
```

**문제점**:
- 프로덕션 코드에 console.log/console.error 존재
- 코딩 스타일 가이드 위배

**수정 제안**:
```typescript
// 개발 환경에서만 로그
if (import.meta.env.DEV) {
  console.error("Failed to load chat history", e);
}

// 또는 로깅 라이브러리 사용
logger.error("Failed to load chat history", e);
```

---

### 5. 매직 넘버 (하드코딩된 숫자) 🟠

**파일들**:
- `ChatDetail.tsx:119-122`: `setTimeout(..., 800)`, `setTimeout(..., 1500 + Math.random() * 1000)`
- `AgentDashboard.tsx:46`: `setTimeout(..., 5000)`
- `AgentWorkspace.tsx:64`: `setTimeout(..., 2000)`
- `client.ts:11`: `API_TIMEOUT = 30000`

**문제점**:
- 숫자의 의미가 명확하지 않음
- 일관성 없이 사용됨
- 유지보수 어려움

**수정 제안**:
```typescript
// constants.ts
export const TIMING = {
  READ_RECEIPT_DELAY: 800,
  AI_RESPONSE_MIN_DELAY: 1500,
  AI_RESPONSE_MAX_DELAY: 2500,
  NOTIFICATION_AUTO_CLOSE: 5000,
  AUTO_SAVE_DEBOUNCE: 2000,
} as const;

export const API_TIMEOUT = 30000;
```

---

### 6. 잘못된 TypeScript 게터 문법 🟠

**파일**:
- `C:\dev\mirae-financial-aicc\lib\store\chatStore.ts:24-26`
- `C:\dev\mirae-financial-aicc\lib\store\agentStore.ts:38-43`
- `C:\dev\mirae-financial-aicc\lib\store\authStore.ts`

```typescript
interface ChatStore {
  // ...
  get currentSession(): ChatSession | null;  // ❌ 잘못된 문법
  get currentMessages(): Message[];          // ❌ 잘못된 문법
}
```

**문제점**:
- TypeScript 인터페이스에서 `get` 키워드는 유효하지 않음
- Zustand 스토어에서 실제로는 함수로 구현됨

**수정 제안**:
```typescript
interface ChatStore {
  // ...
  currentSession: ChatSession | null;  // ✅ 일반 속성
  currentMessages: Message[];
}

// 구현 시 게터 패턴 사용
export const useChatStore = create<ChatStore>((set, get) => ({
  // ...
  get currentSession() {
    const { sessions, currentSessionId } = get();
    return sessions.find((s) => s.id === currentSessionId) || null;
  },
}));
```

---

## MEDIUM 이슈

### 7. useEffect 의존성 누락/무한 루프 위험 🟡

**파일들**:
- `ChatHome.tsx:29-31`
- `AgentDashboard.tsx:35-40`

```typescript
useEffect(() => {
  loadSessions();
}, [loadSessions]);  // loadSessions가 매번 새로운 참조
```

**문제점**:
- Zustand 스토어 함수를 의존성으로 사용하면 무한 루프 위험
- ESLint 규칙을 비활성화하는 패턴 반복

**수정 제안**:
```typescript
// 방법 1: useCallback 사용
const loadSessions = useCallback(() => {
  // ...
}, []); // 빈 의존성

// 방법 2: 스토어 액션 직접 호출 (의존성 제거)
useEffect(() => {
  useChatStore.getState().loadSessions();
}, []);

// 방법 3: zustand의 unstable_batchUpdates
```

---

### 8. 인라인 `<style>` 태그 사용 🟡

**파일**:
- `C:\dev\mirae-financial-aicc\components\customer\ChatDetail.tsx:531-546`
- `C:\dev\mirae-financial-aicc\components\agent\AgentDashboard.tsx:315-333`
- `C:\dev\mirae-financial-aicc\components\agent\AgentWorkspace.tsx:460-475`

```tsx
<style>{`
  @keyframes waveform {
    0%, 100% { height: 20%; opacity: 0.5; }
    50% { height: 100%; opacity: 1; }
  }
  .animate-waveform {
    animation: waveform 0.8s infinite ease-in-out;
  }
`}</style>
```

**문제점**:
- 컴포넌트가 렌더링될 때마다 DOM에 새 `<style>` 요소가 추가됨
- 메모리 누수 가능성
- 성능 저하

**수정 제안**:
```typescript
// 1. 전역 CSS 파일로 이동 (globals.css)
@keyframes waveform {
  0%, 100% { height: 20%; opacity: 0.5; }
  50% { height: 100%; opacity: 1; }
}
.animate-waveform {
  animation: waveform 0.8s infinite ease-in-out;
}

// 2. 또는 CSS Modules 사용
// 3. 또는 Tailwind 애니메이션 사용
```

---

### 9. React 컴포넌트 최적화 미흡 🟡

**파일**: `C:\dev\mirae-financial-aicc\components\customer\ChatDetail.tsx:272-375`

```typescript
{messages.map((msg) => (
  <div key={msg.id} className={...}>
    {/* 복잡한 메시지 렌더링 로직 */}
  </div>
))}
```

**문제점**:
- 메시지가 추가될 때마다 모든 메시지가 다시 렌더링됨
- `React.memo`, `useMemo`, `useCallback` 미사용

**수정 제안**:
```typescript
// 메시지 컴포넌트 분리 및 메모이제이션
const MessageItem = React.memo(({ msg, isMatch, isCurrent }: MessageItemProps) => {
  // ...
});

// 컴포넌트 내부
const memoizedMessages = useMemo(() =>
  messages.map(msg => ({ msg, isMatch: ..., isMatch: ... })),
  [messages, matchingIds, currentMatchIdx]
);
```

---

### 10. localStorage 오류 처리 부족 🟡

**파일**:
- `C:\dev\mirae-financial-aicc\lib\api\client.ts:24-27, 34-37`
- `C:\dev\mirae-financial-aicc\lib\store\authStore.ts:195-197`

```typescript
// try-catch 없이 직접 접근
localStorage.setItem('access_token', access);
```

**문제점**:
- Safari 프라이빗 모드에서 예외 발생 가능
- 쿼터 초과 시 예외 발생 가능
- 앱 크래시 위험

**수정 제안**:
```typescript
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    // Safari 프라이빗 모드, 쿼터 초과 등
    console.warn('localStorage unavailable:', e);
    return false;
  }
};
```

---

### 11. 타입 안전성 - `any` 타입 사용 🟡

**파일들**:
- `C:\dev\mirae-financial-aicc\lib\api\client.ts:83, 111, 125`
- `C:\dev\mirae-financial-aicc\lib\store\authStore.ts:70, 78`

```typescript
const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
```

**문제점**:
- `any` 타입 사용으로 타입 안전성 보장 어려움
- 런타임 오류 가능성

**수정 제안**:
```typescript
interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const originalRequest = error.config as RetryableAxiosRequestConfig;
```

---

### 12. 입력 검증 부족 (XSS 위험) 🟡

**파일**:
- `C:\dev\mirae-financial-aicc\components\customer\CustomerLogin.tsx`
- `C:\dev\mirae-financial-aicc\components\customer\ChatDetail.tsx`

```typescript
<Input
  value={username}
  onChange={(e) => setUsername(e.target.value)}  // 검증 없음
/>
```

**문제점**:
- 아이디/비밀번호 형식 검증 없음
- XSS 공격 가능성 (AI 응답 표시 시)

**수정 제안**:
```typescript
// 입력 검증 유틸
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, ''); // HTML 태그 제거
};

// 컴포넌트에서 사용
const isValid = validateEmail(username);
if (!isValid) {
  setError('유효한 이메일을 입력해주세요.');
}
```

---

## LOW 이슈

### 13. 테스트 커버리지 부족 🔵

**문제점**:
- `lib/services/masking.test.ts`만 존재
- vitest.config.ts는 있으나 다른 테스트 파일 없음
- 컴포넌트, 스토어, API 클라이언트 테스트 부족

**수정 제안**:
```
lib/api/
├── client.test.ts           # API 클라이언트 테스트
├── mock/chatApi.test.ts     # MOCK API 테스트
lib/store/
├── chatStore.test.ts        # 스토어 테스트
components/
├── customer/
│   ├── ChatHome.test.tsx    # 컴포넌트 테스트
│   └── ChatDetail.test.tsx
└── agent/
    ├── AgentDashboard.test.tsx
    └── AgentWorkspace.test.tsx
```

---

### 14. 타입 정의 불일치 🔵

**파일들**:
- `C:\dev\mirae-financial-aicc\types.ts:16-31`
- `C:\dev\mirae-financial-aicc\types\api.ts:97-119`

```typescript
// types.ts
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  confidence?: 'high' | 'medium' | 'low';
  hasAudio?: boolean;
  quickReplies?: string[];
  isReference?: boolean;
  read?: boolean;
  attachment?: {...};
}

// types/api.ts (다른 정의)
export interface Message {
  id: string;
  sessionId: string;          // 추가됨
  sender: 'user' | 'ai' | 'agent';  // agent 추가됨
  senderId?: string;          // 추가됨
  senderName?: string;        // 추가됨
  text: string;
  timestamp: string;
  confidence?: 'high' | 'medium' | 'low';
  hasAudio?: boolean;
  audioUrl?: string;          // 추가됨
  audioDuration?: number;     // 추가됨
  quickReplies?: string[];
  isReference?: boolean;
  read?: boolean;
  attachment?: {...};
  metadata?: Record<string, unknown>;  // 추가됨
}
```

**문제점**:
- 두 곳에서 `Message` 타입이 다르게 정의됨
- 어떤 타입을 사용해야 할지 혼란
- 잠재적 타입 오류

**수정 제안**:
```typescript
// types.ts 삭제 또는 types/api.ts로 통합
// 하나의 진실 공급원(Single Source of Truth) 유지
export type { Message } from './api';
```

---

## React/Next.js 성능 검토 (Vercel Best Practices)

### Waterfall 패턴 (⚠️ 해당 없음)

`Promise.all()`을 사용해 병렬 로딩을 구현한 부분이 확인되지 않았습니다. 하지만 현재는 MOCK API라서 Waterfall 문제가 드러나지 않을 수 있습니다. 실제 API 연동 시 다음을 확인하세요:

```typescript
// ❌ Bad - 순차 실행
const stats = await loadStats();
const customers = await loadCustomers();

// ✅ Good - 병렬 실행
const [stats, customers] = await Promise.all([
  loadStats(),
  loadCustomers()
]);
```

### 번들 최적화 (⚠️ 해당 없음)

현재 barrel file imports를 사용하는 패턴은 발견되지 않았습니다. 향후 모듈이 커질 때 주의하세요.

---

## 개선사항 (Refactoring)

### 15. AI 응답 로직 중복

**파일들**:
- `ChatDetail.tsx:22-65` (getSmartResponse)
- `lib/api/mock/chatApi.ts:393-435` (generateAIResponse)

**문제점**:
- 두 곳에서 AI 응답 생성 로직이 중복됨
- 로직 수정 시 두 곳 모두 수정 필요

**수정 제안**:
```typescript
// lib/services/aiResponse.ts로 통합
export const generateAIResponse = (userText: string): AIResponse => {
  // 통합된 로직
};

// 컴포넌트와 MOCK API에서 import 사용
import { generateAIResponse } from '../../services/aiResponse';
```

---

## 검증 결과 (Verification)

```bash
# 타입 체크
npx tsc --noEmit
# 결과: ❌ 타입 오류 존재 (게터 문법, any 타입)

# 빌드
npm run build
# 결과: ✅ 빌드 성공

# 테스트
npm run test
# 결과: ✅ masking.test.ts만 통과 (40개)
```

---

## 우선순위 수정 가이드

### Phase 1: 보안 (CRITICAL) - 1일
1. API 키 제거 (`vite.config.ts`)
2. 토큰 저장소 변경 (localStorage → HttpOnly 쿠키)

### Phase 2: 타입 안전성 (HIGH) - 2일
1. 게터 문법 수정 (Store 인터페이스)
2. `any` 타입 제거
3. 타입 정의 통합

### Phase 3: 에러 처리 (HIGH) - 2일
1. Store 에러 처리 개선
2. localStorage 오류 처리 추가
3. 입력 검증 추가

### Phase 4: React 최적화 (MEDIUM) - 3일
1. 인라인 스타일 제거
2. 컴포넌트 메모이제이션
3. useEffect 의존성 수정

### Phase 5: 테스트 (LOW) - 3일
1. API 클라이언트 테스트
2. Store 테스트
3. 컴포넌트 테스트

---

## 결론 (Verdict)

**판정**: ⚠️ **WARNING** - CRITICAL/HIGH 이슈로 인해 수정 필요

### 즉시 수정 필요 (Before Production)
- 🔴 API 키 노출 (보안)
- 🔴 LocalStorage 토큰 저장 (보안)

### 최우선 수정 (High Priority)
- 🟠 에러 처리 개선
- 🟠 콘솔 로그 제거
- 🟠 매직 넘버 상수화
- 🟠 게터 문법 수정

### 차기 수정 (Medium Priority)
- 🟡 React 성능 최적화
- 🟡 타입 안전성 강화

### 장기 개선 (Low Priority)
- 🔵 테스트 커버리지 확대
- 🔵 타입 정의 통합

---

**리뷰 완료**: 2026-01-26
**다음 리뷰 예정**: 수정 완료 후
