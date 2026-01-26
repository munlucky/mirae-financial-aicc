# 금융그룹 AI 고객센터 (AICC) 프론트엔드 PRD v2.0

**최종 버전**: 2.0  
**작성일**: 2026년 1월 23일  
**대상 런칭**: 2026년 Q2  
**담당팀**: 프론트엔드 개발팀  
**상태**: 개발 착수 가능

---

## 📌 Executive Summary

금융그룹의 생명/손보 통합 AI 고객센터 플랫폼 프론트엔드는 **두 가지 사용자 경험**을 극대화합니다:

### 고객(CX): 음성 우선의 자연스러운 상담 경험
```
"말하는 대로 해결되는 금융 상담"

✨ Voice-First: 음성 입력으로 채팅의 번거로움 제거
📱 Mobile-First: 스마트폰 70%의 이용패턴 반영
⚡ Real-time: 3초 이상 대기 없음 (목표)
🔒 Safe: 민감정보 자동 마스킹
```

### 상담사(EX): AI 조력을 통한 효율적 업무
```
"고객을 가장 잘 아는 지능형 워크스페이스"

📊 Data-Dense: 한 화면에 필요한 모든 정보
⚡ AI-Assisted: 실시간 답변 제안(NBA)
🎯 Efficient: 단축키로 즉시 작업
📈 Real-time: 고객 감정 트래킹
```

---

## 🎯 1. 프로덕트 비전 & 스코프

### 1.1 사용자 그룹 정의

#### **사용자 1: 고객 (Customer)**
- **디바이스 분포**: 스마트폰 70%, 웹 20%, 태블릿 10%
- **주요 행동**: 음성 상담, 채팅, 상품 문의, 빠른 신청
- **특성**: 빠른 응답 기대, 간단한 UI 선호
- **목표**: 최소 입력으로 즉시 해결

#### **사용자 2: 상담사 (Agent)**
- **디바이스**: 데스크톱 80%, 노트북 20%
- **주요 행동**: 고객 관리, 실시간 상담, 상품 추천, 정보 검색
- **특성**: 동시 다중 고객 처리, 정보 밀도 높음 선호
- **목표**: 고객 만족도 극대화와 처리시간 단축

### 1.2 프로덕트 스코프

**포함 (In Scope)**:
```
✅ 고객 웹/모바일 애플리케이션
   ├─ 반응형 디자인 (모바일 우선)
   ├─ 음성 입력/출력 완전 지원
   ├─ 실시간 메시징 (WebSocket)
   ├─ 오프라인 캐싱
   └─ 감정 반응형 UI

✅ 상담사 웹 애플리케이션
   ├─ 데스크톱 최적화 (고밀도)
   ├─ 멀티 패널 레이아웃 (resizable)
   ├─ 고객 다중 관리
   ├─ AI 제안 (NBA)
   ├─ 단축키 지원
   └─ 실시간 감정 분석

✅ 공통 기능
   ├─ 엔드-투-엔드 암호화 (E2EE)
   ├─ 민감정보 자동 마스킹
   ├─ 실시간 활동 동기화
   ├─ 다국어 지원 (KO/EN)
   └─ 접근성 (WCAG 2.1 AA)
```

**제외 (Out of Scope)**:
```
❌ 기존 앱(원모바일) 수정
❌ 백엔드 API 개발
❌ AI 음성처리 엔진
❌ 데이터베이스 설계
```

---

## 🏗️ 2. 기술 스택 & 아키텍처

### 2.1 기술 선택 (실제 구현 기준)

```typescript
// 프론트엔드 기술 스택
Framework:
  └─ Vite 6.2.0 + React 19.2.3 (단일 프로젝트)
     ├─ TypeScript 5.8.2 (Strict Mode)
     └─ SPA (Single Page Application)

Language:
  └─ TypeScript 5.8.2 (Strict Mode)

State Management:
  └─ Zustand 4.5.7 (전역 상태)

Styling:
  └─ Tailwind CSS 3.x (CDN)

UI Components:
  └─ Custom Components (Badge, Button, Input)

HTTP Client:
  └─ Axios 1.13.3

Icons:
  └─ Lucide React 0.344.0

Charts:
  └─ Recharts 2.12.2

Testing:
  ├─ Vitest 4.0.18 (유닛)
  ├─ Testing Library (React, DOM, User Event)
  └─ jsdom/happy-dom (테스트 환경)

Security:
  └─ 민감정보 마스킹 라이브러리 (lib/services/masking.ts)

Performance:
  └─ 반응형 디자인 (모바일 우선)
```

### 2.2 프로젝트 아키텍처 (단일 프로젝트)

```
mirae-financial-aicc/
├── components/                    # React 컴포넌트
│   ├── Badge.tsx                 # 공통: 뱃지 컴포넌트
│   ├── Button.tsx                # 공통: 버튼 컴포넌트
│   ├── Input.tsx                 # 공통: 입력 컴포넌트
│   ├── customer/                 # 고객용 컴포넌트
│   │   ├── CustomerLogin.tsx     # 로그인 페이지
│   │   ├── ChatHome.tsx          # 채팅 홈
│   │   └── ChatDetail.tsx        # 채팅 상세
│   └── agent/                    # 상담사용 컴포넌트
│       ├── AgentDashboard.tsx    # 대시보드
│       └── AgentWorkspace.tsx    # 워크스페이스
│
├── lib/                          # 공유 라이브러리
│   ├── api/                      # API 계층
│   │   ├── client.ts             # Axios 클라이언트
│   │   └── mock/                 # Mock API
│   │       ├── chatApi.ts        # 채팅 Mock API
│   │       ├── agentApi.ts       # 상담사 Mock API
│   │       └── authApi.ts        # 인증 Mock API
│   ├── services/                 # 비즈니스 로직
│   │   ├── masking.ts            # 민감정보 마스킹
│   │   └── masking.test.ts       # 마스킹 테스트 (40개)
│   ├── store/                    # Zustand 스토어
│   │   ├── chatStore.ts          # 채팅 상태
│   │   ├── agentStore.ts         # 상담사 상태
│   │   └── authStore.ts          # 인증 상태
│   └── constants/
│       └── timing.ts             # 타이밍 상수
│
├── styles/                       # 스타일
│   └── animations.css            # 애니메이션
│
├── App.tsx                       # 앱 엔트리
├── index.tsx                     # 진입점
└── index.html                    # HTML 템플릿
```

### 2.3 환경 설정

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 2.4 디자인 시스템 (Tailwind CDN)

```javascript
// index.html - Tailwind 설정
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A', // Mirae-Navy
          hover: '#1E2D4A',
        },
        emerald: {
          DEFAULT: '#10B981', // Safe-Emerald
        },
        orange: {
          DEFAULT: '#F97316', // Caution-Orange
        },
        red: {
          DEFAULT: '#DC2626', // Risk-Red
        }
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace']
      }
    }
  }
}
```

---

## 📱 3. 고객용(Customer) 애플리케이션 상세 설계

### 3.1 고객 여정 맵

```
[로그인] → [채팅 홈] → [채팅 선택] → [대화 상세]
           (채팅 목록)  (채팅 시작)   (음성/텍스트)
```

### 3.2 화면 설계

#### **3.2.1 로그인 (반응형)**

모바일 (375px):
```
┌─────────────────────────────┐
│     금융그룹 AI고객센터      │
│        [로고 이미지]        │
├─────────────────────────────┤
│ 사용자명                    │
│ [_______________]           │
│                             │
│ 비밀번호                    │
│ [_____________]             │
│                             │
│ [    로그인     ]           │
│                             │
│ ────────────────────────    │
│ [지문] [카톡] [네이버]     │
│                             │
│ 비밀번호 찾기 | 회원가입   │
└─────────────────────────────┘
```

PC (1024px+):
```
┌──────────────────────────────────────┐
│   ┌──────────────────────┐           │
│   │   금융그룹 AI고객센터│           │
│   │    [로고 이미지]     │           │
│   │                      │           │
│   │ 사용자명             │           │
│   │ [______________]     │           │
│   │                      │           │
│   │ 비밀번호             │           │
│   │ [______________]     │           │
│   │                      │           │
│   │ [     로그인      ]  │           │
│   │ ────────────────────  │           │
│   │ [지문][카톡][네이버] │           │
│   └──────────────────────┘           │
└──────────────────────────────────────┘
```

#### **3.2.2 채팅 홈 (모바일 우선)**

모바일 (375px):
```
┌─────────────────────────────┐
│ 💬 채팅      [🔍] [≡] [⚙] │ ← 헤더 (56px)
├─────────────────────────────┤
│ 검색...                     │
├─────────────────────────────┤
│                             │
│ 진행 중인 상담              │
│ ┌─────────────────────────┐ │
│ │ 🤖 AI 상담 (30분 전)   │ │
│ │ "대출 상담 중..."      │ │
│ │ 마지막: "월금리가..."  │ │
│ │ ❌ 읽지않음: 1        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤 상담원 (2시간 전)   │ │
│ │ "계좌개설 완료"        │ │
│ │ 마지막: "확인해주세요" │ │
│ └─────────────────────────┘ │
│                             │
│      ⊕ 새 채팅             │ ← FAB
└─────────────────────────────┘
```

PC (1024px+):
```
┌────────────────────────────────────────┐
│ 💬 채팅       [🔍 검색...] [≡] [⚙]   │
├────────────────────────────────────────┤
│                                        │
│ 진행 중인 상담                         │
│ ┌──────────┬──────────┬──────────┐   │
│ │ 🤖AI상담 │ 👤상담원 │ 🤖신한AI│   │
│ │ (30분전) │ (2시간전)│ (1일전) │   │
│ │          │          │          │   │
│ │ "대출"   │ "계좌OK" │ "펀드OK"│   │
│ │ 미읽음:1 │ 읽음     │ 읽음    │   │
│ └──────────┴──────────┴──────────┘   │
│                                        │
│ 추천 상담                              │
│ ┌────────┬────────┬────────┬────────┐ │
│ │ 📊포트 │ 💳카드 │ 💰예금 │ 🏦대출│ │
│ │ 폴리오 │ 추천   │ 금리   │ 상담  │ │
│ └────────┴────────┴────────┴────────┘ │
└────────────────────────────────────────┘
```

#### **3.2.3 채팅 상세 (핵심)**

모바일 (375px):
```
┌─────────────────────────────┐
│ 🤖 AI 상담원  [i] [⋮]      │ ← 헤더 (52px)
│ 온라인 · 응답: 2초         │
├─────────────────────────────┤
│                             │
│ [메시지 리스트 - 스크롤]   │
│                             │
│ 당신: "대출 받고 싶어요"   │
│ 14:23 ✓✓ (읽음)           │
│                             │
│ 🤖 AI:                      │
│ "좋습니다! 전세자금 대출이 │
│ 필요하신 것 같네요. 현재   │
│ 상황을 파악해보겠습니다."  │
│ [🔊 재생] 신뢰도: ✓✓      │
│ [참고자료 ∨]               │
│ [빠른응답1] [빠른응답2]    │
│                             │
│ [입력 중... ⚫⚫⚫]        │
│                             │
├─────────────────────────────┤
│ [메시지 입력...]  [🎤] [→] │ ← 입력 (56px)
└─────────────────────────────┘
```

PC (1024px+):
```
┌──────────────────────────────────────────┐
│ AI 상담원  온라인 · 응답: 2초  [i] [⋮] │
├──────────────────────────────────────────┤
│                                          │
│ [메시지 리스트 - 여유있는 패딩]        │
│                                          │
│ 당신: "대출 받고 싶어요"               │
│ 14:23 ✓✓ (읽음)                       │
│                                          │
│ 🤖 AI 상담원                            │
│ 좋습니다! 전세자금 대출이 필요하신     │
│ 것 같네요. 현재 상황을 파악해보겠습니다.│
│                                          │
│ [🔊 재생] 신뢰도: ✓✓ 매우 확실        │
│                                          │
│ 📎 참고자료                             │
│ ├─ [대출상품 비교]                      │
│ ├─ [금리 시뮬레이터]                    │
│ └─ [신청 방법]                          │
│                                          │
│ 빠른 응답:                              │
│ [이 상품으로 진행] [다른 상품] [상담원]│
│                                          │
│ [입력 중... ⚫⚫⚫]                      │
│                                          │
├──────────────────────────────────────────┤
│ [메시지 입력...         ] [🎤] [→]    │
└──────────────────────────────────────────┘
```

### 3.3 음성 입력 UI (고객용 차별화)

#### **모바일 음성 버튼 (하단 시트)**

Idle 상태:
```
┌────────────────┐
│ 🎤             │
│ 음성로 말씀해주 │
└────────────────┘
배경: #F0F0F0
높이: 60px
터치: 길게 누르기
```

Listening 상태:
```
┌────────────────────────────┐
│ 🔴 [████▓░░░░░░░░░]      │
│ 1초 · 길게 누르고 있으세요 │
└────────────────────────────┘
배경: #FF4444 (빨강)
Waveform: 5개 막대
```

#### **PC 음성 입력 (인라인)**

Idle:
```
[🎤 음성으로 말씀해주세요]
너비: 200px
```

Listening:
```
[🔴 [████▓░] 1초]
너비: 240px
```

### 3.4 반응형 브레이크포인트

```typescript
// constants/breakpoints.ts
export const BREAKPOINTS = {
  xs: 375,    // 스마트폰 (iPhone SE)
  sm: 480,    // 스마트폰 (일반)
  md: 768,    // 태블릿 (iPad)
  lg: 1024,   // 노트북 (MacBook Air)
  xl: 1440,   // 데스크톱 (일반)
  '2xl': 1920 // 대형 모니터
} as const;
```

**고객용 최적화**:
```
xs (375px): 1열, 음성 버튼 큼 (56px), 터치 영역 44px
sm (480px): 1열, 약간 더 여유
md (768px): 1-2열, 태블릿 모드
lg (1024px): 중앙 정렬 (최대 800px)
xl (1440px): 좌우 여백
```

---

## 💼 4. 상담사용(Agent) 애플리케이션 상세 설계

### 4.1 상담사 여정 맵

```
[로그인] → [대시보드] → [워크스페이스]
          (통계/큐)    (멀티 패널)
          
대시보드: 업무 시작 전 KPI 확인
워크스페이스: 실제 상담 진행
```

### 4.2 대시보드 (데스크톱 중심)

```
┌────────────────────────────────────────┐
│ 🏢 상담원 대시보드    [알림] [≡] [프로필]│
├────────────────────────────────────────┤
│                                        │
│ 📊 상담 통계 (오늘)                    │
│ ┌──────────────┬──────────────┬───────┐│
│ │ 처리건수     │ 평균처리시간 │ 만족도││
│ │ 23건         │ 5분 30초     │ 87점  ││
│ │ ↑150% (어제) │ ↓30초 (어제) │ ↑3pt  ││
│ └──────────────┴──────────────┴───────┘│
│                                        │
│ 📞 실시간 상담 상태                    │
│ ┌──────────────────────────────┐      │
│ │ 진행 중 (6명)   대기 중 (3명)│      │
│ ├──────────────────────────────┤      │
│ │ ├─ 👤 김철수 (3분)          │      │
│ │ │  "대출 상담"               │      │
│ │ ├─ 👤 박민지 (5분)          │      │
│ │ │  "펀드 상담"               │      │
│ │ ├─ 👤 정선호 (1분)          │      │
│ │ │  "보험 상담"               │      │
│ │ └─ (3명 더)                 │      │
│ └──────────────────────────────┘      │
│                                        │
│ ⭐ 성과 순위      📢 팀 공지          │
│ ┌───────────────┐ ┌──────────────┐  │
│ │ 1. 김철수     │ │ 📢 점심 시간 │  │
│ │ 2. 박민지     │ │ 12:00~13:00  │  │
│ │ 3. 이영희     │ │              │  │
│ │ 4. 최영수     │ │ 📢 회의      │  │
│ │ 5. 강미영     │ │ 15:00~      │  │
│ └───────────────┘ └──────────────┘  │
└────────────────────────────────────────┘
```

### 4.3 상담 워크스페이스 (멀티 패널)

데스크톱 (1440px):
```
┌─────────────────────────────────────────────────────┐
│ 👤 김철수 대출상담     [←] [+] [☎] [📞] [🔙]      │
├────────────┬──────────────────────┬─────────────────┤
│            │                      │                 │
│ 고객 목록  │ 채팅                 │ 고객 정보       │
│            │                      │                 │
│ [👤철수]  │ 당신:                │ 👤 김철수      │
│            │ "대출받고싶어요"    │ 29세 · 직장인  │
│ [👤민지]  │                      │                 │
│            │ 🤖:                 │ 📊 신용등급:  │
│ [👤선호]  │ "좋습니다..."      │ A 등급        │
│            │ [🔊] 신뢰도: ✓✓   │                 │
│ [대기-1명] │ [참고자료]          │ 💡 AI 제안:    │
│            │ [빠른응답1][2]      │ ┌────────────┐│
│ ≡ 더보기   │                      │ │ 전세자금.. ││
│            │ [입력...]  [🎤] [→]│ │ 신청 버튼  ││
│            │                      │ └────────────┘│
│            │ ─────────────────    │                 │
│            │ 입력 중... ⚫⚫⚫     │ 📋 상담 이력: │
│            │                      │ · 총 5회      │
│            │                      │ · 만족도 4.5  │
│            │                      │                 │
│            │                      │ 📝 메모       │
│            │                      │ [메모 입력..] │
│            │                      │                 │
│            │                      │ [상품 추천]   │
└────────────┴──────────────────────┴─────────────────┘
```

### 4.4 상담사용 핵심 기능

#### **AI 어시스턴트 (Copilot)**

```typescript
// AI 제안 인터페이스
interface AIAssistant {
  // 1. 실시간 요약 (3줄)
  summary: {
    current: "고객이 전세자금 대출 문의 중",
    context: "신용등급 A, 연소득 5000만원",
    action: "대출 상품 비교 안내 필요"
  };

  // 2. NBA (Next Best Action) - 3개 제안
  nextActions: [
    {
      rank: 1,
      action: "대출 상품 비교 보여주기",
      confidence: 0.95,
      preset: "전세자금 대출 비교표"
    },
    {
      rank: 2,
      action: "금리 시뮬레이터 링크 전송",
      confidence: 0.88,
      preset: "금리 시뮬레이터"
    },
    {
      rank: 3,
      action: "상담원 연결 제안",
      confidence: 0.72,
      preset: "상담원 연결"
    }
  ];

  // 3. 고객 감정 분석
  sentiment: {
    score: -0.2, // -1(분노) ~ +1(긍정)
    trend: "향상 중", // 향상/악화/유지
    lastChange: "2분 전"
  };
}
```

#### **단축키 지원**

```
📌 상담 제어
├─ Ctrl+Enter: 빠른응답 1번
├─ Ctrl+Shift+Enter: 빠른응답 2번
├─ Ctrl+Shift+3: 빠른응답 3번
├─ Ctrl+K: 고객 검색
├─ Ctrl+1~9: 다중 고객 전환 (1번, 2번... 9번)
├─ Ctrl+W: 상담 종료
└─ Space (장시간): 음성 입력

🎤 음성 제어
├─ Ctrl+Alt+M: 마이크 토글
├─ Ctrl+Alt+S: 스피커 토글
├─ Shift: 음성 버튼 활성화
└─ ESC: 음성 취소

📊 정보 제어
├─ Ctrl+I: 고객정보 패널 토글
├─ Ctrl+A: AI 제안 보기
├─ Ctrl+N: 메모 모드
└─ Ctrl+T: 상담 기록

🖥️ 화면 제어
├─ Ctrl+Shift+D: 대시보드로
├─ Ctrl+L: 고객 목록 포커스
├─ Ctrl+?: 단축키 가이드
└─ F11: 풀스크린
```

### 4.5 레이아웃 최적화

```
노트북 (1024px-1199px):
├─ 2패널 토글 (고객목록 | 채팅+정보)
├─ 우측 패널 너비: 300px (조정 가능)
├─ 중앙 채팅: 나머지
└─ 폰트: 13px

데스크톱 (1200px+):
├─ 3패널 고정 (목록 | 채팅 | 정보)
├─ 좌측: 200px (조정 가능)
├─ 중앙: 600px (조정 가능)
├─ 우측: 350px (조정 가능)
└─ 폰트: 14px

초대형 (1920px+):
├─ 3패널 + 분석 (추가)
└─ 좌측 여백 추가
```

---

## 🔒 5. 보안 & 성능

### 5.1 보안 요구사항

```typescript
// 1. 민감정보 자동 마스킹
maskingSrvc.mask("010-1234-5678") // "010-****-5678"
maskingSrvc.mask("123456-1234567") // "123456-*******"
maskingSrvc.mask("1234-5678-9012-3456") // "1234-****-****-3456"

// 2. 엔드-투-엔드 암호화 (E2EE)
message = "민감한 상담 내용";
encrypted = encryptE2E(message, customerKey);
// 전송 -> 수신 시에만 복호화

// 3. 스크린샷 방지 (상담사)
// 워터마크 오버레이: "Agent ID: 12345" (비가시적)

// 4. API 보안
// ├─ CSRF 토큰
// ├─ CORS 정책
// ├─ Rate Limiting
// └─ JWT 검증

// 5. CSP (Content Security Policy)
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';"
}
```

### 5.2 성능 목표

| 지표 | 목표 | 달성 방법 |
|------|------|---------|
| **FCP** | 0.8초 이하 | SSR + Edge Functions |
| **TTFB** | 100ms 이하 | API 캐싱 + CDN |
| **TTFT** | 1.5초 이하 | 스트리밍 응답 |
| **LCP** | 2.5초 이하 | 이미지 최적화 |
| **INP** | 200ms 이하 | 이벤트 디바운싱 |
| **CLS** | 0.1 이하 | 레이아웃 안정성 |
| **번들크기** | 200KB 이하 | Tree Shaking |
| **접근성** | 95점 이상 | WCAG 2.1 AA |

### 5.3 모니터링

```typescript
// Sentry (에러 추적)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Web Vitals (성능 메트릭)
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFCP(console.log); // First Contentful Paint
getFID(console.log); // First Input Delay
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// 커스텀 메트릭
performance.measure('STT-latency', 'stt-start', 'stt-end');
performance.measure('LLM-latency', 'llm-start', 'llm-end');
```

---

## 📊 6. 개발 로드맵

### Phase 1 (Week 1-4): 기반 구축
```
✅ 모노레포 환경 설정
✅ 디자인 토큰 시스템 구축
✅ 공유 UI 컴포넌트 50종 제작 (shadcn/ui 커스터마이징)
✅ 마스킹/암호화 라이브러리 개발
✅ 인증 미들웨어 (SSO)
✅ API 클라이언트 생성
```

### Phase 2 (Week 5-10): 핵심 기능
```
✅ WebSocket 실시간 메시징
✅ 음성 입력/출력 (STT/TTS)
✅ 고객 앱 기본 화면 (홈, 채팅)
✅ 상담사 대시보드
✅ 상담 워크스페이스 (1/2 패널)
```

### Phase 3 (Week 11-15): 고도화 & 출시
```
✅ AI 기능 (NBA, 감정 분석)
✅ 반응형 최적화 (모든 디바이스)
✅ 성능 튜닝 (Core Web Vitals)
✅ 보안 검증 (침투 테스트)
✅ 사용성 테스트 (UAT)
✅ 배포 및 모니터링
```

---

## 🎯 7. 성공 지표 (KPI)

### 고객용
- **음성 입력 사용률**: 60% 이상
- **평균 응답 시간**: 3초 이내
- **앱 유지율**: DAU 기준 30% 이상
- **만족도**: 4.0/5.0 이상

### 상담사용
- **처리 건수 증가**: +30% (AI 제안 활용)
- **평균 상담 시간**: -15% (효율성)
- **만족도**: 4.2/5.0 이상
- **단축키 사용률**: 50% 이상

---

## 📋 8. 체크리스트 (현행화 완료)

> **기준**: Vite + React 단일 프로젝트, npm 패키지 매니저
> **갱신일**: 2026년 1월 26일

---

### Phase 1 (W1-4): 기반 구축

#### 개발 환경
- [x] Vite 6.2.0 + React 19.2.3 프로젝트 설정
- [x] TypeScript 5.8.2 strict mode 설정
- [x] Vitest 4.0.18 테스트 환경 구성
- [ ] ~~pnpm monorepo~~ → npm 단일 프로젝트 (변경됨)
- [ ] ESLint/Prettier 설정

#### 상태 관리
- [x] Zustand 4.5.7 상태 관리 도입
- [x] chatStore (채팅 상태)
- [x] agentStore (상담사 상태)
- [x] authStore (인증 상태)
- [ ] React Query v5 서버 상태 (미구현)

#### 스타일링
- [x] Tailwind CSS 3.x (CDN) 설정
- [x] 디자인 토큰 정의 (colors, fonts, shadows)
- [x] Pretendard Variable 폰트 적용
- [x] 커스텀 스크롤바 스타일
- [ ] ~~shadcn/ui~~ 커스터마이징 (대신 Custom Components)

#### 공통 컴포넌트
- [x] Badge 컴포넌트
- [x] Button 컴포넌트
- [x] Input 컴포넌트
- [ ] Card 컴포넌트 (미구현)
- [ ] Modal 컴포넌트 (미구현)
- [ ] Dropdown 컴포넌트 (미구현)

#### 서비스/유틸리티
- [x] 금융권 마스킹 라이브러리 (lib/services/masking.ts)
- [x] 마스킹 라이브러리 테스트 40개 통과
- [x] Axios API 클라이언트 (lib/api/client.ts)
- [x] Mock API (chatApi, agentApi, authApi)
- [ ] ~~OpenAPI 기반 코드 생성~~ (미사용)

#### 문서화
- [ ] ~~Storybook~~ (미구현)
- [x] 주요 컴포넌트 주석 문서화

#### 인증
- [x] 인증 Mock API (authApi.ts)
- [x] authStore Zustand 스토어
- [x] 고객용 로그인 페이지 (CustomerLogin.tsx)
- [ ] SSO 연동 (백엔드 구현 필요)
- [ ] JWT 검증 (백엔드 구현 필요)

---

### Phase 2 (W5-10): 핵심 기능

#### 고객용 화면
- [x] 로그인 페이지 (반응형)
- [x] 채팅 홈 (ChatHome.tsx)
- [x] 채팅 상세 (ChatDetail.tsx)
- [ ] 설정 페이지 (미구현)
- [ ] 회원가입 페이지 (미구현)
- [ ] 비밀번호 찾기 페이지 (미구현)

#### 상담사용 화면
- [x] 대시보드 (AgentDashboard.tsx)
- [x] 워크스페이스 (AgentWorkspace.tsx)
- [ ] 분석 페이지 (미구현)
- [ ] 상담원 프로필 페이지 (미구현)

#### 실시간 기능
- [x] WebSocket 실시간 메시징 (lib/services/websocket.ts 구현 완료)
- [ ] Socket.io 연동 (미구현)
- [ ] MessagePack 전송 최적화 (미구현)
- [x] Mock API 기반 메시징 시뮬레이션

#### 음성 기능
- [x] 음성 입력 STT (lib/services/speechRecognition.ts 구현 완료)
- [ ] Web Audio API 녹음 (미구현)
- [ ] wavesurfer.js 파형 시각화 (미구현)
- [x] TTS (Text-to-Speech) (lib/services/speechSynthesis.ts 구현 완료)
- [x] STT (Speech-to-Text) (Web Speech API 구현 완료)

#### 반응형 디자인
- [x] 모바일 우선 설계 (375px 기준)
- [x] 태블릿 지원 (768px)
- [x] 데스크톱 지원 (1024px+)
- [ ] 반응형 테스트 자동화 (미구현)

---

### Phase 3 (W11-15): 고도화

#### AI 기능
- [x] AI Copilot 요약 (ConversationSummary 컴포넌트 구현)
- [x] NBA (Next Best Action) 제안 (NBAProposals 컴포넌트 구현)
- [x] 감정 분석 UI (SentimentTracker 컴포넌트 구현)
- [x] 고객 감정 트래킹 (AICopilotPanel 통합 완료)

#### 보안 강화
- [x] 민감정보 마스킹 (전화번호, 계좌, 카드)
- [x] E2EE (TweetNaCl.js) (lib/services/encryption.ts 구현 완료)
- [ ] 스크린샷 방지 워터마크 (미구현)
- [ ] CSP 헤더 설정 (미구현)
- [ ] CSRF 토큰 (백엔드 필요)

#### 성능 최적화
- [x] Core Web Vitals 최적화 (DNS 프리페치, 메타 태그, Open Graph 추가)
- [ ] Lighthouse CI (미구현)
- [ ] Bundle Analyzer (미구현)
- [ ] 이미지 최적화 (AVIF, WebP) (미구현)
- [x] 코드 분할 (React.lazy + Suspense 구현 완료)

#### 모니터링
- [x] Sentry 에러 추적 (lib/services/errorTracking.ts MOCK 구현)
- [ ] Web Vitals (미구현)
- [ ] 커스텀 메트릭 (미구현)

#### 테스트 강화
- [x] 단위 테스트 (Vitest 49개)
- [x] 통합 테스트 (MOCK API 테스트 추가)
- [ ] E2E 테스트 (Playwright) (미구현)
- [ ] 접근성 테스트 (Axe) (미구현)

#### 배포
- [x] CI/CD 파이프라인 (.github/workflows/ci.yml 구현 완료)
- [ ] 스테이징 환경 (미구현)
- [ ] 프로덕션 배포 자동화 (미구현)
- [ ] UAT 문서화 (PRD 완료)

---

### 완료율 요약

| Phase | 완료 | 전체 | 완료율 |
|-------|------|------|--------|
| Phase 1 (기반 구축) | 14 | 26 | 54% |
| Phase 2 (핵심 기능) | 11 | 23 | 48% |
| Phase 3 (고도화) | 14 | 26 | 54% |
| **전체** | **39** | **75** | **52%** |

---

### 우선순위별 미완료 항목

#### 🔴 높은 우선순위 (즉시 필요)
1. ~~WebSocket 실시간 메시징 구현~~ (완료)
2. ~~음성 입력/출력 기능 구현~~ (완료)
3. ~~AI Copilot (요약, NBA) 연동~~ (완료)
4. ~~감정 분석 UI 구현~~ (완료)

#### 🟡 중간 우선순위 (다음 단계)
1. E2EE 암호화 구현
2. Core Web Vitals 최적화
3. 통합 테스트 작성
4. CI/CD 파이프라인 구축

#### 🟢 낮은 우선순위 (장기 개선)
1. Storybook 문서화
2. E2E 테스트 (Playwright)
3. 접근성 테스트 (Axe)
4. 스크린샷 방지 워터마크

---

## 🔗 부록: 기술 참고 자료

### 실제 패키지 버전 (package.json 기준)
```json
{
  "dependencies": {
    "axios": "^1.13.3",
    "js-cookie": "^3.0.5",
    "lucide-react": "0.344.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "recharts": "2.12.2",
    "zustand": "^4.5.7"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "happy-dom": "^20.3.9",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "vitest": "^4.0.18"
  }
}
```

### 환경 변수 (.env)
```bash
# .env.local
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_GEMINI_API_KEY=your_api_key_here

# .env.production
VITE_API_URL=https://api.fingroup.kr
VITE_WS_URL=wss://api.fingroup.kr
VITE_GEMINI_API_KEY=your_production_key
```

---

**문서 버전 이력**:
- v1.0 (2026-01-20): 초안
- v2.0 (2026-01-23): 고객/상담사 중점 개선
- v2.1 (2026-01-26): 체크리스트 현행화 (Vite + React 단일 프로젝트 기준)

**최종 승인**: ________________  
**승인일**: __________________
