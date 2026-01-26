# AICC 금융 AI 고객센터 프론트엔드 구축

> Project rules: `.claude/PROJECT.md`
> PRD: `AICC-Frontend-PRD.md`

## Metadata

- **Author**: Claude (Context Builder Agent)
- **Created**: 2026-01-26
- **Branch**: main
- **Complexity**: complex
- **Related doc**: PRD v2.0 (AICC-Frontend-PRD.md)

## Task Overview

- **Goal**: 미래금융그룹 AI 고객센터(AICC) 프론트엔드 구축 - 고객용/상담사용 웹 애플리케이션 개발
- **Scope**:
  - **포함**: 고객용 앱(로그인, 채팅 홈/상세), 상담사용 앱(대시보드, 워크스페이스), 공통 UI 컴포넌트, MOCK API 구현
  - **제외**: 백엔드 API 개발, AI 음성 엔진, 기존 앱(원모바일) 수정
- **Impact**: 2개 사용자 앱(고객/상담사), 공통 UI 라이브러리

## Current State

### 기술 스택 (현재)
```
Framework: Vite 6.2.0 + React 19.2.3 + TypeScript 5.8.2
Styling: Tailwind CSS (설치 필요)
Icons: lucide-react 0.344.0
Charts: recharts 2.12.2
Build: Vite (dev server, build, preview)
```

### 기술 스택 (PRD 기반, 이전 목표)
```
Framework: Next.js 15 (App Router) + React 18.3
State: Zustand + React Query v5
Styling: Tailwind CSS + Radix UI
Real-time: Socket.io, WebSocket
Audio: Web Audio API, wavesurfer.js
Testing: Vitest, Testing Library, Playwright
```

### 기존 컴포넌트 (8개 완성)

**공통 (3개)**:
- `components/Button.tsx` - 버튼 컴포넌트 (variant, size, 전체/아웃라인/고스트)
- `components/Input.tsx` - 입력 컴포넌트 (label, icon, error)
- `components/Badge.tsx` - 뱃지 컴포넌트 (상태 표시)

**고객용 (3개)**:
- `components/customer/CustomerLogin.tsx` - 로그인 페이지 (아이디/비밀번호, 간편로그인)
- `components/customer/ChatHome.tsx` - 채팅 홈 (검색, 빠른실행, 최신상담목록)
- `components/customer/ChatDetail.tsx` - 채팅 상세 (메시지 리스트, 음성입력)

**상담사용 (2개)**:
- `components/agent/AgentDashboard.tsx` - 대시보드 (통계, 실시간상담상태)
- `components/agent/AgentWorkspace.tsx` - 워크스페이스 (다중패널, AI제안)

### PRD 체크리스트 현황

**Phase 1: 기반 구축 (Week 1-4)**
- [x] 디자인 토큰 시스템 (Tailwind CSS)
- [x] 공유 UI 컴포넌트 (Button, Input, Badge)
- [ ] 마스킹/암호화 라이브러리 (미구현)
- [ ] 인증 미들웨어 SSO (미구현)
- [ ] API 클라이언트 (미구현)

**Phase 2: 핵심 기능 (Week 5-10)**
- [x] 고객 앱 기본 화면 (로그인, 홈, 상세)
- [x] 상담사 대시보드/워크스페이스
- [ ] WebSocket 실시간 메시징 (미구현)
- [ ] 음성 입력/출력 STT/TTS (미구현)

**Phase 3: 고도화 (Week 11-15)**
- [ ] AI Copilot (요약, NBA) (미구현)
- [ ] 감정 분석 UI (미구현)
- [ ] 반응형 최적화 (부분 완료)
- [ ] 성능 튜닝 (미구현)

## Target Files

### New (생성 필요)

**MOCK API 레이어**:
```
lib/api/
├── mock/
│   ├── chatApi.ts          # 채팅 관련 MOCK
│   ├── agentApi.ts         # 상담사 관련 MOCK
│   └── customerApi.ts      # 고객 관련 MOCK
├── client.ts               # API 클라이언트 (axios/fetch wrapper)
└── types.ts                # API 타입 정의
```

**서비스 계층**:
```
lib/services/
├── masking.ts              # 민감정보 마스킹
├── encryption.ts           # E2EE 암호화
├── socket.ts               # WebSocket 연결
└── audio.ts                # 음성 처리
```

**상태 관리**:
```
lib/store/
├── chatStore.ts            # 채팅 상태 (Zustand)
├── agentStore.ts           # 상담사 상태
└── customerStore.ts        # 고객 상태
```

**타입 정의**:
```
types/
├── chat.ts                 # 채팅 타입
├── agent.ts                # 상담사 타입
├── customer.ts             # 고객 타입
└── api.ts                  # API 응답 타입
```

### Modified (수정 필요)

**App.tsx**:
- 라우팅 개선 (React Router 추가)
- 인증 플로우 연동
- 역할별 권한 분리

**컴포넌트들**:
- MOCK 데이터 제거 → API 연동
- 로딩/에러 상태 추가
- 액세서빌리티 개선

## Implementation Plan

### Phase 1: 프로젝트 기반 강화 (Week 1)

**1.1 의존성 설치**
```bash
pnpm add zustand@^4.4.0 axios@^1.6.0
pnpm add -D @types/react-router-dom@^6.0.0
# 테스트 프레임워크
pnpm add -D vitest@^1.0.0 @testing-library/react@^14.0.0
```

**1.2 API 레이어 구축**
- API 클라이언트 생성 (`lib/api/client.ts`)
- MOCK API 구현 (`lib/api/mock/`)
- 타입 정의 (`types/api.ts`)

**1.3 서비스 계층**
- 민감정보 마스킹 (`lib/services/masking.ts`)
- 기본 암호화 유틸 (`lib/services/encryption.ts`)

### Phase 2: MOCK API 구현 (Week 2-3)

**2.1 채팅 API**
```typescript
// lib/api/mock/chatApi.ts
export const chatApi = {
  getSessions: () => Promise<ChatSession[]>
  getMessages: (sessionId: string) => Promise<Message[]>
  sendMessage: (sessionId: string, text: string) => Promise<Message>
  quickReply: (messageId: string, reply: string) => Promise<Message>
}
```

**2.2 상담사 API**
```typescript
// lib/api/mock/agentApi.ts
export const agentApi = {
  getStats: () => Promise<DashboardStats>
  getCustomers: () => Promise<Customer[]>
  getSentiment: (customerId: string) => Promise<SentimentData>
  getAIProposals: (customerId: string) => Promise<AIProposal[]>
}
```

**2.3 컴포넌트 API 연동**
- ChatHome: `chatApi.getSessions()` 연결
- ChatDetail: `chatApi.getMessages()`, `chatApi.sendMessage()` 연결
- AgentDashboard: `agentApi.getStats()`, `agentApi.getCustomers()` 연결
- AgentWorkspace: `agentApi.getAIProposals()`, `agentApi.getSentiment()` 연결

### Phase 3: 상태 관리 (Week 4)

**3.1 Zustand 스토어 생성**
```typescript
// lib/store/chatStore.ts
interface ChatStore {
  sessions: ChatSession[]
  currentSession: ChatSession | null
  messages: Record<string, Message[]>
  actions: {
    loadSessions: () => Promise<void>
    selectSession: (id: string) => void
    sendMessage: (text: string) => Promise<void>
  }
}
```

**3.2 컴포넌트 리팩토링**
- 로컬 상태 → 스토어 상태
- props drilling 제거

### Phase 4: 테스트 작성 (Week 5)

**4.1 유닛 테스트**
- 서비스 함수 (masking, encryption)
- 유틸리티 함수
- 컴포넌트 렌더링

**4.2 통합 테스트**
- API 클라이언트
- 스토어 액션

### Phase 5: 검증 (Week 6)

```bash
# 1. 타입 체크
npx tsc --noEmit

# 2. 빌드
npm run build

# 3. 린트
npm run lint  # 설정 필요

# 4. 테스트
npm run test  # 설정 필요
```

## MOCK API 사양

### 채팅 관련

| 엔드포인트 | 메서드 | 설명 | MOCK 구현 |
|-----------|--------|------|-----------|
| `/api/sessions` | GET | 채팅 세션 목록 | `chatApi.getSessions()` |
| `/api/sessions/:id/messages` | GET | 메시지 목록 | `chatApi.getMessages(id)` |
| `/api/sessions/:id/messages` | POST | 메시지 전송 | `chatApi.sendMessage(id, text)` |
| `/api/voice/upload` | POST | 음성 업로드 | `chatApi.uploadVoice(blob)` |

### 상담사 관련

| 엔드포인트 | 메서드 | 설명 | MOCK 구현 |
|-----------|--------|------|-----------|
| `/api/agent/stats` | GET | 대시보드 통계 | `agentApi.getStats()` |
| `/api/agent/customers` | GET | 고객 목록 | `agentApi.getCustomers()` |
| `/api/agent/sentiment/:id` | GET | 감정 분석 | `agentApi.getSentiment(id)` |
| `/api/agent/proposals/:id` | GET | AI 제안 (NBA) | `agentApi.getAIProposals(id)` |

### 인증 관련

| 엔드포인트 | 메서드 | 설명 | MOCK 구현 |
|-----------|--------|------|-----------|
| `/api/auth/login` | POST | 로그인 | `authApi.login(id, pw)` |
| `/api/auth/logout` | POST | 로그아웃 | `authApi.logout()` |
| `/api/auth/verify` | GET | 토큰 검증 | `authApi.verify()` |

## Acceptance Tests (완료 기준)

### 테스트 실행 결과 (2026-01-26 10:30:14)

**전체 현황**: 40개 테스트 모두 통과 ✅

| ID | 테스트 설명 | 유형 | 파일 | 상태 |
|----|------------|------|------|------|
| T1-T40 | [마스킹 유틸] 전체 마스킹 기능 (전화번호, 주민번호, 카드번호, 계좌번호, 이메일, 이름, 주소, etc.) | Unit | lib/services/masking.test.ts | 🟢 PASS |

### 테스트 상세

**마스킹 유틸 테스트 (40개 통과)**:
- ✅ 전화번호 마스킹 (다양한 형식 지원)
- ✅ 주민등록번호 마스킹
- ✅ 카드번호 마스킹
- ✅ 계좌번호 마스킹
- ✅ 이메일 마스킹
- ✅ 이름 마스킹
- ✅ 주소 마스킹
- ✅ 기타 민감정보 마스킹

**완료 조건**: ✅ 달성 - 모든 테스트 🟢 PASS

### 미구현 테스트 (PENDING)

| ID | 테스트 설명 | 유형 | 파일 | 상태 |
|----|------------|------|------|------|
| T4 | [API 클라이언트] GET 요청 성공 응답 | Unit | lib/api/client.test.ts | 🔴 PENDING (파일 미존재) |
| T5 | [API 클라이언트] POST 요청 성공 응답 | Unit | lib/api/client.test.ts | 🔴 PENDING (파일 미존재) |
| T6 | [API 클라이언트] 에러 핸들링 (401, 403, 500) | Unit | lib/api/client.test.ts | 🔴 PENDING (파일 미존재) |
| T7 | [MOCK API] 채팅 세션 목록 조회 | Integration | lib/api/mock/chatApi.integration.test.ts | 🔴 PENDING (파일 미존재) |
| T8 | [MOCK API] 메시지 전송 및 응답 | Integration | lib/api/mock/chatApi.integration.test.ts | 🔴 PENDING (파일 미존재) |
| T9 | [MOCK API] 상담사 통계 조회 | Integration | lib/api/mock/agentApi.integration.test.ts | 🔴 PENDING (파일 미존재) |
| T10 | [스토어] 채팅 세션 로드 | Unit | lib/store/chatStore.test.ts | 🔴 PENDING (파일 미존재) |
| T11 | [스토어] 메시지 전송 | Unit | lib/store/chatStore.test.ts | 🔴 PENDING (파일 미존재) |
| T12 | [컴포넌트] ChatHome 렌더링 및 세션 목록 표시 | Unit | components/customer/ChatHome.test.tsx | 🔴 PENDING (파일 미존재) |
| T13 | [컴포넌트] ChatDetail 메시지 전송 | Unit | components/customer/ChatDetail.test.tsx | 🔴 PENDING (파일 미존재) |
| T14 | [컴포넌트] AgentDashboard 통계 카드 표시 | Unit | components/agent/AgentDashboard.test.tsx | 🔴 PENDING (파일 미존재) |
| T15 | [컴포넌트] AgentWorkspace AI 제안 표시 | Unit | components/agent/AgentWorkspace.test.tsx | 🔴 PENDING (파일 미존재) |

> **참고**: PENDING 테스트는 테스트 파일이 아직 작성되지 않았습니다. masking.test.ts만 구현되어 있습니다.

## Risks and Alternatives

### Risk 1: 기술 스택 불일치 (Vite vs Next.js)
- **현재**: Vite + React (SPA)
- **PRD**: Next.js (SSR, App Router)
- **영향**: SEO, 초기 로딩 성능, 서버 사이드 렌더링
- **대안**:
  1. Vite 유지 (현재 방향) - 개발 속도 우선
  2. Next.js로 마이그레이션 - PRD 준수, 장기적으로 더 나은 성능
- **결정**: 현재는 Vite 유지, 추후 마이그레이션 고려

### Risk 2: 테스트 인프라 미구축
- **현재**: vitest.config 없음
- **영향**: 코드 품질 보장 어려움
- **대안**:
  1. Vitest 설치 및 설정
  2. Testing Library 추가
  3. 커버리지 80% 목표

### Risk 3: 실시간 기능 미구현
- **현재**: WebSocket, Socket.io 미사용
- **영향**: 실시간 메시징 불가
- **대안**:
  1. MOCK API로 폴링 시뮬레이션
  2. 추후 WebSocket 연동

### Risk 4: 음성 처리 미구현
- **현재**: STT/TTS, Web Audio API 미사용
- **영향**: 음성 입력/출력 불가
- **대안**:
  1. UI만 구현, 기능은 MOCK
  2. 추후 웹 오디오 API 연동

## Dependencies

### 외부 의존성
- **API 스펙**: 미확정 (MOCK으로 개발)
- **백엔드**: 미구현 (별도 팀)
- **AI 엔진**: 미구현 (별도 팀)

### 내부 의존성
- **메뉴/권한**: 미정의 (현재는 개발자 오버레이로 역할 전환)
- **디자인 시스템**: Tailwind CSS (커스터마이징 필요)

## Checkpoints

- [ ] Phase 1: 의존성 설치 및 API 레이어 구축 완료
- [ ] Phase 2: MOCK API 구현 및 컴포넌트 연동 완료
- [ ] Phase 3: Zustand 스토어 생성 및 컴포넌트 리팩토링 완료
- [ ] Phase 4: 테스트 작성 (목표 커버리지 80%)
- [ ] Phase 5: 빌드/린트/테스트 통과

---

## Code Review (2026-01-26)

**리뷰 결과**: ⚠️ **WARNING** - CRITICAL/HIGH 이슈로 인해 수정 필요

### 요약

| 심각도 | 건수 | 주요 이슈 |
|--------|------|----------|
| CRITICAL | 2 | API 키 노출, LocalStorage 토큰 저장 |
| HIGH | 4 | 에러 처리, 콘솔 로그, 매직 넘버, 게터 문법 |
| MEDIUM | 6 | React 성능, 타입 안전성, 입력 검증 |
| LOW | 2 | 테스트 부족, 타입 정의 불일치 |

### 즉시 수정 필요 (Before Production)

1. **보안 - API 키 노출** 🔴
   - 파일: `vite.config.ts:14-15`
   - GEMINI_API_KEY가 클라이언트 번들에 하드코딩됨
   - → 백엔드 프록시 서버 사용 권장

2. **보안 - LocalStorage 토큰 저장** 🔴
   - 파일: `lib/api/client.ts`, `lib/store/authStore.ts`
   - XSS 공격으로 토큰 탈취 가능
   - → HttpOnly, Secure, SameSite 쿠키 사용 권장

### 상세 리뷰

전체 리뷰 내용은 `archives/review-v1.md`를 참조하세요.

---

## Open Questions

1. **기술 스택**: Vite 유지 vs Next.js 마이그레이션?
   - 현재 결정: Vite 유지
   - 검토 필요: SEO, SSR 필요성

2. **상태 관리**: Zustand 도입 시점?
   - 제안: Phase 3
   - 대안: React Context (간단한 경우)

3. **테스트 범위**: 어디까지 테스트?
   - 컴포넌트: 필수
   - 서비스: 필수
   - 스토어: 필수
   - E2E: 선택 (나중에)

4. **반응형 범위**: 어떤 디바이스 지원?
   - PRD: 모바일(375px) ~ 데스크톱(1920px+)
   - 현재: 부분 구현

5. **음성 기능**: 실제 구현 vs UI만?
   - PRD: Web Audio API, STT/TTS
   - 현실: UI만 먼저, 추후 연동

## References

### PRD 문서
- `AICC-Frontend-PRD.md` - 전체 요구사항

### 기존 코드
- `App.tsx` - 메인 앱 (라우팅, 역할 전환)
- `types.ts` - 공통 타입 정의
- `components/customer/` - 고객용 컴포넌트
- `components/agent/` - 상담사용 컴포넌트

### 프로젝트 규칙
- `.claude/PROJECT.md` - 프로젝트별 규칙 (현재 없음)
- `.claude/rules/` - 글로벌 코딩 규칙

### 템플릿
- `.claude/agents/context-builder/templates/context-template.md`

---

**문서 버전**: 1.0
**마지막 수정**: 2026-01-26
**상태**: Draft
