/**
 * [데모 전용] 서버 사이드 메모리 누수 위험 시나리오 API
 *
 * 프로덕션에서 사용 금지.
 *
 * 위험 패턴:
 * 1. GET ?action=stats - 현재 누수 데모 상태 조회
 * 2. GET ?action=cache&key=... - 무제한 캐시에 쌓기 (key당 1건 추가)
 * 3. POST { "action": "request-log" } - 요청 컨텍스트를 모듈 레벨 배열에 무한 추가
 * 4. POST { "action": "start-interval" } - 서버에서 setInterval 시작 (clear 없음)
 */

import { NextRequest } from "next/server";
import {
  setUnboundedCache,
  getUnboundedCacheSize,
  appendRequestContext,
  getRequestContextLogLength,
  startLeakyInterval,
  getLeakyIntervalTickCount,
  isLeakyIntervalRunning,
} from "@/lib/data/memory-leak-demo-store";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");
  const key = request.nextUrl.searchParams.get("key");

  if (action === "stats") {
    return Response.json({
      unboundedCacheSize: getUnboundedCacheSize(),
      requestContextLogLength: getRequestContextLogLength(),
      leakyIntervalRunning: isLeakyIntervalRunning(),
      leakyIntervalTickCount: getLeakyIntervalTickCount(),
    });
  }

  if (action === "cache" && key) {
    setUnboundedCache(key, { cachedAt: Date.now(), key });
    return Response.json({
      ok: true,
      message: "캐시에 추가됨 (eviction 없음)",
      cacheSize: getUnboundedCacheSize(),
    });
  }

  return Response.json(
    { error: "usage: ?action=stats | ?action=cache&key=..." },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  let body: { action?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON body required" }, { status: 400 });
  }

  if (body.action === "request-log") {
    const requestId = `req-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    const url = request.url ?? "";
    appendRequestContext(requestId, url);
    return Response.json({
      ok: true,
      message: "요청 컨텍스트가 모듈 레벨 배열에 추가됨 (삭제 로직 없음)",
      logLength: getRequestContextLogLength(),
    });
  }

  if (body.action === "start-interval") {
    const started = startLeakyInterval();
    return Response.json({
      ok: true,
      started,
      message: started
        ? "서버에 setInterval 시작됨 (clearInterval 없음)"
        : "이미 실행 중",
      tickCount: getLeakyIntervalTickCount(),
    });
  }

  return Response.json(
    { error: "body.action: request-log | start-interval" },
    { status: 400 }
  );
}
