# 보안 강화: LocalStorage → 쿠키로 토큰 저장 변경

## 개요
현재 시스템에서 인증 토큰(access_token, refresh_token)을 LocalStorage에 저장하고 있습니다. 이는 XSS 취약점에 노출될 수 있는 CRITICAL 보안 이슈입니다. HttpOnly 쿠키로 변경하여 보안을 강화합니다.

## 문제 정의

### 현재 문제점
- **lib/api/client.ts**: `localStorage.setItem('access_token', access)` 사용
- **lib/store/authStore.ts**: `localStorage.getItem('access_token')` 사용
- XSS 공격 시 토큰 탈취 가능
- 모든 JavaScript에서 토큰 접근 가능

### 보안 위험도
- **위험도**: CRITICAL
- **영향**: 인증 토큰 탈취 → 계정 도용 가능
- **OWASP Top 10**: A01:2021 – Broken Access Control

## 솔루션

### 기술 변경사항
1. **저장 방식**: LocalStorage → HttpOnly, Secure, SameSite 쿠키
2. **라이브러리**: js-cookie 사용 (간단한 구현 가능)
3. **보안 설정**:
   - `HttpOnly`: JavaScript 접근 불가 (XSS 방지)
   - `Secure`: HTTPS 전용
   - `SameSite`: Lax (CSRF 방지)

### 쿠키 설정
| 쿠키 이름 | 만료 | HttpOnly | Secure | SameSite |
|-----------|------|----------|--------|----------|
| access_token | 1시간 | false (클라이언트 전송 필요) | true | Lax |
| refresh_token | 7일 | true | true | Lax |

## 변경 파일

### 1. lib/api/client.ts
- **변경 전**: `localStorage.setItem/getItem/removeItem`
- **변경 후**: `Cookies.set/get/remove` (js-cookie)
- **보안 설정**: 쿠키 옵션 적용

### 2. lib/store/authStore.ts
- **변경 전**: `localStorage.getItem('access_token')`
- **변경 후**: `Cookies.get('access_token')`
- **영향 범위**: 토큰 로드 로직만 변경

## 제약 조건

1. **UI/기능 변경 없음**: 사용자 관점에서 동일하게 동작
2. **기존 API 호환성**: 백엔드 변경 없음
3. **브라우저 호환성**: 모던 브라우저 지원
4. **localStorage 유지 항목**: 채팅 기록, 메모는 localStorage 유지 (쿠키는 4KB 제한)

## Acceptance Tests

### T1: 쿠키 설정 확인
```typescript
// lib/api/client.ts.test.ts
describe('setTokens', () => {
  it('should set access_token cookie with Secure flag', () => {
    setTokens('access123', 'refresh123')
    const cookie = document.cookie
    expect(cookie).toContain('access_token')
    // HttpOnly는 서버에서만 설정 가능하므로 클라이언트에서는 Secure 확인
  })

  it('should set refresh_token with 7 days expiry', () => {
    // TODO: 쿠키 만료 기간 확인
  })
})
```

### T2: 쿠키 읽기/삭제
```typescript
describe('Token Management', () => {
  it('should load tokens from cookies', () => {
    Cookies.set('access_token', 'test123')
    loadTokens()
    expect(authToken).toBe('test123')
  })

  it('should clear tokens on logout', () => {
    setTokens('access', 'refresh')
    clearTokens()
    expect(Cookies.get('access_token')).toBeUndefined()
    expect(Cookies.get('refresh_token')).toBeUndefined()
  })
})
```

### T3: 빌드 확인
```bash
# TypeScript 컴파일 통과
npm run build
```

## 검증 계획

### Phase 1: 구현
1. js-cookie 라이브러리 설치: `npm install js-cookie @types/js-cookie`
2. lib/api/client.ts 수정
3. lib/store/authStore.ts 수정

### Phase 2: 검증
1. TypeScript 컴파일: `npm run build` 또는 `tsc --noEmit`
2. 빌드 성공 확인
3. 브라우저 개발자도구에서 쿠키 확인

### Phase 3: 완료 기준
- [ ] TypeScript 컴파일 통과
- [ ] 빌드 성공
- [ ] LocalStorage 사용 코드 제거
- [ ] 쿠키로 토큰 저장/로드/삭제 동작

## 구현 상태

| Phase | 상태 | 비고 |
|-------|------|------|
| Phase 0: 테스트 작성 | 🔴 PENDING | 선택사항 (simple bugfix) |
| Phase 1: 구현 | 🔴 PENDING | 현재 단계 |
| Phase 2: 검증 | 🔴 PENDING | 빌드 확인 |
| Phase 3: 완료 | 🔴 PENDING | 모든 기준 충족 |

## 참고

### js-cookie 사용 예시
```typescript
import Cookies from 'js-cookie'

// 설정
Cookies.set('access_token', token, {
  expires: 1/24,  // 1시간
  secure: true,
  sameSite: 'Lax'
})

// 읽기
const token = Cookies.get('access_token')

// 삭제
Cookies.remove('access_token', { secure: true, sameSite: 'Lax' })
```

### localStorage 유지 항목
| 키 | 파일 | 용도 | 유지 사유 |
|----|------|------|----------|
| mirae_chat_history | ChatDetail.tsx | 채팅 기록 | 대용량 데이터 |
| agent_workspace_memo | AgentWorkspace.tsx | 메모 | 대용량 데이터 |

### 주의사항
- HttpOnly 쿠키는 클라이언트 JavaScript에서 설정 불가
- 서버에서 Set-Cookie 헤더로 설정해야 함
- 현재 구현에서는 Secure, SameSite만 적용 (HttpOnly는 백엔드 필요)
