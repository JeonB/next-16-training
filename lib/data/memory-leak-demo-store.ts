/**
 * [데모 전용] 서버 사이드 메모리 누수 위험 패턴 모음
 *
 * 프로덕션에서 사용 금지.
 * @see app/api/memory-leak-demo/route.ts
 */

// ========== 1. 무제한 캐시 (eviction 없음) ==========
// 요청이 올 때마다 캐시에 추가만 하고, 만료/크기 제한이 없음
const unboundedCache = new Map<string, { value: unknown; createdAt: number }>();

export function setUnboundedCache(key: string, value: unknown): void {
  unboundedCache.set(key, { value, createdAt: Date.now() });
}

export function getUnboundedCache(key: string): unknown {
  return unboundedCache.get(key)?.value;
}

export function getUnboundedCacheSize(): number {
  return unboundedCache.size;
}

// ========== 2. 요청별 컨텍스트를 모듈 레벨 배열에 보관 (절대 삭제 안 함) ==========
// 각 요청의 메타데이터/클로저를 보관해 GC가 회수하지 못하게 함
const requestContextLog: Array<{
  requestId: string;
  url: string;
  timestamp: number;
  // 큰 페이로드를 시뮬레이션 (실제로는 클로저나 응답 버퍼 등이 붙을 수 있음)
  _payload: string;
}> = [];

const PAYLOAD_SIZE = 100 * 1024; // 100KB per request

export function appendRequestContext(requestId: string, url: string): void {
  requestContextLog.push({
    requestId,
    url,
    timestamp: Date.now(),
    _payload: "x".repeat(PAYLOAD_SIZE),
  });
}

export function getRequestContextLogLength(): number {
  return requestContextLog.length;
}

// ========== 3. 서버에서 setInterval (한 번 시작되면 프로세스 생존 동안 유지) ==========
// clearInterval을 호출하지 않으면 타이머가 계속 돌며 클로저를 유지
let leakyIntervalId: ReturnType<typeof setInterval> | null = null;
const intervalAccumulator: number[] = [];

export function startLeakyInterval(): boolean {
  if (leakyIntervalId !== null) return false;
  leakyIntervalId = setInterval(() => {
    intervalAccumulator.push(Date.now());
    // 실전에서는 여기서 외부 참조를 붙여 누수 시나리오를 만듦
  }, 1000);
  return true;
}

export function getLeakyIntervalTickCount(): number {
  return intervalAccumulator.length;
}

export function isLeakyIntervalRunning(): boolean {
  return leakyIntervalId !== null;
}
