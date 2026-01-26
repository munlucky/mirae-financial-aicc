# Plan Review: AICC 프론트엔드 구축 계획

**리뷰어**: Claude (Codex fallback)
**날짜**: 2026-01-26
**대상**: `.claude/docs/tasks/aicc-frontend-build/context.md`
**복잡도**: complex

---

## 평가 결과: ⚠️ **REJECT** - 주요 개선 필요

---

## 4가지 기준 평가

### 1. 명확성 (Clarity) - ⚠️ 부분적

**양호**:
- ✅ 목표 명확: "미래금융그룹 AI 고객센터(AICC) 프론트엔드 구축"
- ✅ 범위 잘 정의됨 (포함/제외 항목)
- ✅ 5단계 구현 계획 구체적

**개선 필요**:
- ⚠️ "Mock API 연동 완료" - 구체적 정의 부재
- ⚠️ 일부 우선순위 작업의 완료 기준이 모호함

### 2. 검증 가능성 (Verifiability) - ❌ 부족

**문제점**:
- ❌ 테스트 커버리지 모순: masking만 통과, 핵심 기능 테스트는 PENDING
- ❌ 검증 명령 미정의: `npm run lint`, `npm run test` 설정 안 됨
- ⚠️ 일부 완료 기준이 정성적 ("반응형 최적화 부분 완료" - 무엇이 기준인가?)

### 3. 완전성 (Completeness) - ❌ 심각한 간격

**누락된 항목**:
1. **PRD와의 기술 스택 불일치** - 현재 Vite vs PRD Next.js (결정은 있으나 영향 분석 부족)
2. **Critical 보안 이슈 처리 계획 부재**:
   - API 키 하드코딩 (`vite.config.ts:14-15`)
   - LocalStorage 토큰 저장 (XSS 취약)
3. **메모리 누수 수정 계획 구체화 부족** (`chatStore.ts:428-433` setTimeout cleanup)
4. **실제 작업을 시뮬레이션해보면 갭 발견**:
   - Phase 2에서 컴포넌트를 Mock API에 연동한다고 되어 있지만, 기존 컴포넌트의 로컬 상태를 어떻게 스토어로 마이그레이션할지 구체적 절차 부재
   - React Router 추가 계획 있으나 라우팅 구조 설계 부족

### 4. 큰 그림 (Big Picture) - ⚠️ 부분적

**양호**:
- ✅ 단계적 접근 (Phase 1-5)
- ✅ 리스크 식별됨

**개선 필요**:
- ⚠️ 기술 스택 변경(Vite → Next.js)의 장기적 영향 분석 부족
- ⚠️ 백엔드 API 연동 전략 (현재 Mock만, 실제 연동 계획?)

---

## Top 5 개선 필요 사항

### 1. Critical 보안 이슈 처리 계획 추가

```yaml
# Phase 0 (또는 Phase 1 선행)으로 추가:
보안 하드닝:
  우선순위: CRITICAL
  작업:
    - API 키를 백엔드 프록시로 이동 또는 환경 변수만 사용
    - LocalStorage → HttpOnly, Secure, SameSite 쿠키
  완료 기준:
    - security-review 스킬 통과
    - API 키가 클라이언트 번들에 포함되지 않음
    - 토큰이 쿠키로 저장됨
```

### 2. 테스트 완성도 구체화

```yaml
# 현재: "테스트 작성 (목표 커버리지 80%)"
# 개선:
Phase 4: 테스트 작성
  필수 테스트 (완료 조건):
    - API 클라이언트: 3개 테스트 (T4-T6) 🟢 PASS
    - MOCK API: 3개 테스트 (T7-T9) 🟢 PASS
    - 스토어: 2개 테스트 (T10-T11) 🟢 PASS
    - 컴포넌트: 4개 테스트 (T12-T15) 🟢 PASS
  검증 명령:
    - vitest.config.ts 설정
    - npm run test 추가
    - 커버리지 리포트: --coverage
  완료 기준: 모든 테스트 🟢 PASS, 커버리지 ≥ 80%
```

### 3. 기술 스택 불일치 영향 분석 추가

```yaml
# Risks and Alternatives에 구체적 분석 추가:
Risk 1 상세:
  영향 분석:
    - SEO: 필요 시점 파악 (고객센터는 SPA가 적합할 수 있음)
    - 초기 로딩: Vite는 이미 최적화됨 (코드 분할, DNS 프리페치 완료)
    - SSR 필요성: 공개 페이지 여부 확인 (현재는 인증 필요)
  마이그레이션 비용:
    - 시간: 2-3주 추정
    - 리스크: 라우팅, 상태 관리 재작성
  결정 근거: Vite 유지의 명확한 이유 (개발 속도, 충분한 성능)
```

### 4. 상태 관리 마이그레이션 절차 구체화

```yaml
# Phase 3.2에 상세 절차 추가:
컴포넌트 리팩토링 절차:
  1. ChatHome.tsx:
     - 기존: const [sessions, setSessions] = useState()
     - 변경: const { sessions, loadSessions } = useChatStore()
     - 삭제: 로컬 MOCK 데이터 (useMockSessions)
  2. ChatDetail.tsx:
     - 메시지 상태 → 스토어로 이동
     - sendMessage 액션 연결
  3. AgentDashboard.tsx:
     - 통계 데이터 → agentStore.getStats() 연결
  완료 기준: 컴포넌트 내 로컬 상태 0개 (UI 상태 제외)
```

### 5. 코드 품질 기준 강화

```yaml
# Phase 1에 추가:
코드 품질 기준:
  - console.log: 0개 (프로덕션 코드)
  - 매직 넘버: 상수로 정의
  - 타입 안전성: any 금지, unknown 사용
  - 에러 처리: 모든 비동기 함수 try-catch
검증:
  - ESLint 규칙 추가 (no-console, no-magic-numbers)
  - npm run lint -- --fix
```

---

## 추가 권장사항

1. **PROJECT.md 생성**: 프로젝트별 검증 명령 정의
2. **API 스펙 정의서**: Mock API와 실제 API의 매핑 계획
3. **성능 기준**: Lighthouse 점수 목표, 번들 크기 제한

---

## 최종 판정

**REJECT** - 계획의 구조는 양호하나, 실행 가능성에 치명적인 간격이 존재합니다. 특히:
- Critical 보안 이슈 처리 누락
- 테스트 검증 가능성 부족
- 상태 관리 마이그레이션 절차 모호

위 5가지 개선 사항을 반영 후 재검토 권장합니다.

---

**참고**: 이 리뷰는 Claude가 직접 수행했습니다 (Codex MCP 서버 미구성으로 인한 fallback).
