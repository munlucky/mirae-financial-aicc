# Code Review v2 - AICC MOCK API 및 스토어 구현

**Date**: 2026-01-26
**Commit**: feat: AICC 금융 AI 고객센터 MOCK API 및 스토어 구현
**Reviewer**: Claude (Codex fallback)
**Mode**: Advisory

---

## Summary

최근 커밋에 대해 Zustand 기반 상태 관리 스토어 2개와 WebSocket MOCK 서비스를 리뷰했습니다.

**Changed Files:**
- `lib/store/agentStore.ts` (new, 381 lines)
- `lib/store/chatStore.ts` (new, 448 lines)
- `lib/services/websocket.ts` (new, 565 lines)

**Functionality:**
- Agent store: Dashboard stats, customer management, sentiment analysis, AI proposals
- Chat store: Session/message management, WebSocket integration
- WebSocket service: Mock real-time events using setTimeout

---

## Critical Issues (Must Fix)

### 1. console.log in Production Code

**Locations:**
- `lib/store/agentStore.ts:270, 280, 296, 323, 348`
- `lib/store/chatStore.ts:331, 344, 364, 396, 417`
- `lib/services/websocket.ts:183, 197, 214, 246, 279, 336, 352, ... (20+)`

**Problem:** 20+ console.log statements in production code

**Impact:** Debug info exposure, performance overhead, console pollution

**Suggested Fix:**
```typescript
// Bad
console.log('[AgentStore] Connecting WebSocket...');

// Good
if (process.env.NODE_ENV === 'development') {
  logger.debug('[AgentStore] Connecting WebSocket...');
}
```

---

### 2. setTimeout Leak Potential

**Location:** `lib/store/chatStore.ts:428-433`

**Problem:** setTimeout used without cleanup mechanism

**Impact:** Memory leak, state updates after unmount

**Code:**
```typescript
// Current (problematic)
if (isTyping) {
  setTimeout(() => {
    get().handleChatTyping({ sessionId, userId, isTyping: false });
  }, 3000);
}
```

**Suggested Fix:**
```typescript
// Store timer IDs in state
interface ChatStore {
  typingTimers: Map<string, ReturnType<typeof setTimeout>>;
  // ...
}

// Store timer ID
const timerId = setTimeout(() => {
  get().handleChatTyping({ sessionId, userId, isTyping: false });
}, 3000);
get().typingTimers.set(`${sessionId}-${userId}`, timerId);

// Clear in cleanup
clearTimeout(get().typingTimers.get(`${sessionId}-${userId}`));
```

---

## Warnings (Recommended Fixes)

### 1. Immutability Violation - Duplicate set() Calls

**Location:** `lib/store/chatStore.ts:176-184`

**Problem:** Two set() calls to add AI response

```typescript
// Current
set({ messages: { ...messages, [currentSessionId]: [...currentMessages, response.data.message] } });
if (response.data.aiResponse) {
  set({ messages: { ...messages, [currentSessionId]: [...currentMessages, response.data.message, response.data.aiResponse] } });
}
```

**Suggested Fix:**
```typescript
const newMessages = [...currentMessages, response.data.message];
if (response.data.aiResponse) {
  newMessages.push(response.data.aiResponse);
}
set({
  messages: { ...messages, [currentSessionId]: newMessages },
  sessions: sessions.map(s => /* ... */),
  isSending: false,
});
```

---

### 2. Non-null Assertion (!)

**Location:** `lib/store/chatStore.ts:227`

```typescript
// Current
messages: {
  ...messages,
  [currentSessionId]: [...currentMessages, response.data.message, response.data.aiResponse!],
}

// Better
const messagesToAdd = [...currentMessages, response.data.message];
if (response.data.aiResponse) {
  messagesToAdd.push(response.data.aiResponse);
}
```

---

### 3. Magic Numbers

**Locations:**
- `lib/services/websocket.ts:151` - `maxReconnectAttempts = 5`
- `lib/services/websocket.ts:152` - `reconnectDelay = 1000`
- `lib/services/websocket.ts:359` - `getRandomInterval(2000, 10000)`
- `lib/store/chatStore.ts:432` - `3000` ms

**Suggested Fix:**
```typescript
const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  INITIAL_RECONNECT_DELAY_MS: 1000,
  MOCK_EVENT_MIN_INTERVAL_MS: 2000,
  MOCK_EVENT_MAX_INTERVAL_MS: 10000,
  TYPING_TIMEOUT_MS: 3000,
} as const;
```

---

## Recommendations

### 1. Separate Mock from Real Implementation

Current `WebSocketService` contains mock logic. Consider:

```typescript
interface IWebSocketService {
  connect(url?: string): void;
  disconnect(): void;
  send<T>(event: WSOutgoingEvent, data: T): void;
  on<T>(event: WSIncomingEvent, listener: EventListener<T>): () => void;
}

class MockWebSocketService implements IWebSocketService { /* ... */ }
class RealWebSocketService implements IWebSocketService { /* ... */ }
```

---

### 2. Store Getter Pattern

Current pattern (functions in state) works, but consider selectors:

```typescript
// Current: state.selectedCustomer()
// Alternative:
export const selectSelectedCustomer = (state: AgentStore) =>
  state.customers.find((c) => c.id === state.selectedCustomerId) || null;
```

---

### 3. Timer Cleanup Verification

Verify that `stopMockSimulation()` in `lib/services/websocket.ts:365-376` clears all timers, including those from `simulateTyping()` and `mockSendResponse()`.

---

## Positive Points

1. **Immutability**: Most state updates use spread operators correctly
2. **Type Safety**: Comprehensive TypeScript type definitions
3. **Error Handling**: All async functions have try-catch blocks
4. **Dependency Separation**: Clean separation between stores, API layer, and WebSocket service
5. **Comments**: Well-commented in Korean for readability
6. **Mock Implementation**: Allows testing without real WebSocket

---

## Verdict: WARNING

**Reason:**
- **HIGH**: 20+ console.log statements must be removed
- **MEDIUM**: setTimeout leak potential, duplicate set() calls, non-null assertion

**Re-review Recommended After:**
1. Remove all console.log or use conditional logging
2. Add timer cleanup in chatStore typing handler
3. Improve immutability pattern (merge duplicate set() calls)

---

## Reviewer Notes

**codex-fallback**: Claude performed review directly (Codex MCP unavailable)

**Review Mode**: Advisory (read-only)
