"use server";

import { revalidatePath, revalidateTag, refresh } from "next/cache";

/**
 * Next.js 16 Refresh 기능 데모용 Server Actions
 *
 * 1. revalidatePath: 특정 경로의 캐시를 무효화하여 다음 요청 시 새 데이터를 가져옵니다.
 * 2. revalidateTag: 태그가 지정된 캐시를 무효화합니다 (Next.js 16 스타일).
 * 3. refresh: Server Actions와 uncached 컴포넌트만 다시 실행합니다.
 */

// 캐시된 시간 데이터를 가져오는 함수 (태그 사용)
export async function getCachedTimeAction(tag: string): Promise<string> {
  // 실제로는 fetch를 사용하지만, 데모를 위해 서버 시간 반환
  const now = new Date();
  return now.toISOString();
}

// revalidatePath 예시: 특정 경로의 캐시 무효화
export async function revalidatePathAction(
  path: string
): Promise<{ success: boolean; message: string }> {
  try {
    revalidatePath(path);
    return {
      success: true,
      message: `경로 "${path}"의 캐시가 무효화되었습니다.`,
    };
  } catch (error) {
    console.error("Error revalidating path:", error);
    return {
      success: false,
      message: "캐시 무효화에 실패했습니다.",
    };
  }
}

// revalidateTag 예시: 태그 기반 캐시 무효화 (Next.js 16 스타일)
export async function revalidateTagAction(
  tag: string,
  profile: "max" | "hours" | "days" = "max"
): Promise<{ success: boolean; message: string }> {
  try {
    // Next.js 16 스타일: profile 파라미터 사용
    revalidateTag(tag, profile);
    return {
      success: true,
      message: `태그 "${tag}"의 캐시가 무효화되었습니다. (profile: ${profile})`,
    };
  } catch (error) {
    console.error("Error revalidating tag:", error);
    return {
      success: false,
      message: "캐시 무효화에 실패했습니다.",
    };
  }
}

// refresh 예시: uncached 컴포넌트만 갱신
export async function refreshAction(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // refresh는 Server Actions와 uncached 컴포넌트만 다시 실행
    // 캐시된 데이터는 그대로 유지되므로 빠른 업데이트가 가능합니다
    refresh();
    return {
      success: true,
      message: "페이지가 새로고침되었습니다. (uncached 컴포넌트만)",
    };
  } catch (error) {
    console.error("Error refreshing:", error);
    return {
      success: false,
      message: "새로고침에 실패했습니다.",
    };
  }
}

// 실무 예시: 데이터 업데이트 후 관련 캐시 무효화
export async function updateDataAndRevalidateAction(
  dataId: number,
  newData: { title: string }
): Promise<{ success: boolean; message: string }> {
  try {
    // 1. 데이터 업데이트 (실제 API 호출)
    // await fetchWithAuth(`/api/data/${dataId}`, { method: 'PUT', body: JSON.stringify(newData) });

    // 2. 관련 캐시 무효화
    // 방법 1: 특정 경로 무효화
    revalidatePath("/revalidate-refresh");

    // 방법 2: 태그 기반 무효화 (여러 경로에서 사용하는 데이터인 경우)
    revalidateTag("demo-data", "max");

    // 방법 3: refresh (빠른 UI 업데이트가 필요한 경우)
    // refresh();

    return {
      success: true,
      message: "데이터가 업데이트되고 캐시가 무효화되었습니다.",
    };
  } catch (error) {
    console.error("Error updating data:", error);
    return {
      success: false,
      message: "데이터 업데이트에 실패했습니다.",
    };
  }
}
