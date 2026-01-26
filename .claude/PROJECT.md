# AICC 금융 AI 고객센터 - 프로젝트 규칙

> 프로젝트별 개발 가이드라인 및 검증 명령

## 프로젝트 개요

- **이름**: 미래금융그룹 AI 고객센터 (AICC) 프론트엔드
- **기술 스택**: Vite 6.2.0 + React 19.2.3 + TypeScript 5.8.2
- **상태 관리**: Zustand 4.5.7
- **스타일링**: Tailwind CSS 3.x (CDN)
- **테스트**: Vitest 4.0.18 + Testing Library

## 검증 명령

### 빌드 확인
```bash
npm run build
```
**기준**: 빌드 성공, 빌드 시간 < 10초

### 타입 체크
```bash
npx tsc --noEmit
```
**기준**: 타입 에러 0개

### 테스트 실행
```bash
npm run test
```
**기준**: 모든 테스트 PASS

### 테스트 커버리지
```bash
npm run test:coverage
```
**기준**: 커버리지 80% 이상

### 개발 서버
```bash
npm run dev
```
**기준**: http://localhost:3000 접속 가능

## 프로젝트별 규칙

### 1. 보안 규칙 (CRITICAL)

- **API 키**: 절대 클라이언트 번들에 포함 금지
  - 백엔드 프록시 서버 사용 권장
  - 환경 변수는 `VITE_` prefix만 사용 (Vite 자동 처리)

- **민감정보 저장**: LocalStorage에 토큰 저장 금지
  - 대신 HttpOnly, Secure, SameSite 쿠키 사용

- **마스킹 처리**: 모든 민감정보 자동 마스킹
  - `lib/services/masking.ts` 사용
  - 전화번호, 계좌번호, 카드번호, 주민번호

### 2. 코드 품질 규칙

- **console.log 금지**: 프로덕션 코드에 console.log 금지
  - 대신 `lib/utils/logger.ts` 사용
  - 개발 환경에서만 로그 출력

- **메모리 누수 방지**: 모든 타이머/이벤트 리스너 정리
  - store에 `cleanup()` 함수 필수
  - useEffect cleanup 함수 필수

- **불변성 패턴**: 상태 업데이트 시 불변성 준수
  - spread operator 사용: `const newState = { ...state, field: newValue }`
  - 배열 메서드: push 대신 [...arr, item]

### 3. React 성능 규칙

- **Waterfall 제거**: 병렬 실행
  ```typescript
  // ❌ Bad
  const user = await fetchUser();
  const posts = await fetchPosts();

  // ✅ Good
  const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
  ```

- **코드 분할**: React.lazy + Suspense 사용
  ```typescript
  const AgentWorkspace = lazy(() => import('./components/agent/AgentWorkspace'));
  ```

- **RSC 직렬화 최소화**: 필요한 필드만 전달
  ```typescript
  // ❌ Bad
  <Profile user={user} />

  // ✅ Good
  <Profile name={user.name} avatar={user.avatar} />
  ```

### 4. 테스트 규칙

- **TDD 원칙**: 테스트 먼저 작성 → 구현
- **커버리지**: 최소 80% 목표
- **파일 명명**: `{Component}.test.tsx` 또는 `{feature}.integration.test.ts`

## 디렉토리 구조

```
mirae-financial-aicc/
├── components/           # React 컴포넌트
│   ├── customer/        # 고객용
│   └── agent/           # 상담사용
├── lib/
│   ├── api/             # API 클라이언트, Mock API
│   ├── services/        # 비즈니스 로직
│   ├── store/           # Zustand 스토어
│   └── utils/           # 유틸리티
├── types/               # TypeScript 타입
└── .claude/             # Claude 설정
    ├── docs/            # 문서
    └── skills/          # 스킬
```

## 환경 변수

```bash
# .env.local (개발)
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# .env.production (프로덕션)
VITE_API_URL=https://api.fingroup.kr
VITE_WS_URL=wss://api.fingroup.kr
```

## Git 커밋 메시지 규칙

- **feat**: 새로운 기능
- **fix**: 버그 수정
- **refactor**: 리팩토링
- **style**: 스타일 수정 (로직 변경 없음)
- **test**: 테스트 추가/수정
- **docs**: 문서 수정
- **chore**: 빌드/설정 수정

## 참고 문서

- PRD: `AICC-Frontend-PRD.md`
- Context: `.claude/docs/tasks/aicc-frontend-build/context.md`
- 글로벌 규칙: `.claude/rules/`
