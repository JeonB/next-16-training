import { getCachedTimeAction } from "@/lib/actions/revalidate-demo";
import CacheDemo from "@/components/revalidate-demo/cache-demo";
import RefreshControls from "@/components/revalidate-demo/refresh-controls";

export default async function RevalidateRefreshPage() {
  // 서버 컴포넌트에서 캐시된 데이터 가져오기
  const cachedTime = await getCachedTimeAction("demo-data");

  return (
    <div className="container mx-auto space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-sky-900">
          Next.js 16 Refresh 기능 데모
        </h1>
        <p className="text-sky-700/80">
          Next.js 16의 캐시 무효화 기능을 활용한 실무 예시입니다. 각 버튼을
          클릭하여 동작을 확인해보세요.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <CacheDemo
          initialTime={cachedTime}
          label="캐시된 데이터"
          tag="demo-data"
        />
        <div className="rounded-xl border border-sky-100 bg-white/90 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-sky-900">사용 방법</h3>
          <div className="space-y-4 text-sm text-sky-700">
            <div>
              <h4 className="font-semibold">1. revalidatePath</h4>
              <p className="mt-1 text-xs text-sky-600/80">
                특정 경로의 캐시를 무효화합니다. 해당 경로를 다시 방문하면 새
                데이터를 가져옵니다.
              </p>
              <pre className="mt-2 rounded bg-sky-50 p-2 text-xs">
                {`revalidatePath('/revalidate-refresh');`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">2. revalidateTag</h4>
              <p className="mt-1 text-xs text-sky-600/80">
                태그가 지정된 캐시를 무효화합니다. 여러 경로에서 같은 태그를
                사용하는 경우 유용합니다.
              </p>
              <pre className="mt-2 rounded bg-sky-50 p-2 text-xs">
                {`revalidateTag('demo-data', 'max');`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">3. refresh</h4>
              <p className="mt-1 text-xs text-sky-600/80">
                Server Actions와 uncached 컴포넌트만 다시 실행합니다. 캐시된
                데이터는 유지되므로 빠른 업데이트가 가능합니다.
              </p>
              <pre className="mt-2 rounded bg-sky-50 p-2 text-xs">{`refresh();`}</pre>
            </div>
          </div>
        </div>
      </div>

      <RefreshControls />

      <div className="rounded-xl border border-sky-100 bg-white/90 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-sky-900">
          실무 활용 팁
        </h3>
        <div className="space-y-3 text-sm text-sky-700">
          <div>
            <h4 className="font-semibold">언제 revalidatePath를 사용하나요?</h4>
            <p className="mt-1 text-xs text-sky-600/80">
              특정 페이지의 데이터가 변경되었을 때 사용합니다. 예: 게시글 수정
              후 목록 페이지 무효화
            </p>
          </div>
          <div>
            <h4 className="font-semibold">언제 revalidateTag를 사용하나요?</h4>
            <p className="mt-1 text-xs text-sky-600/80">
              여러 페이지에서 공유하는 데이터가 변경되었을 때 사용합니다. 예:
              사용자 프로필 정보가 여러 페이지에 표시되는 경우
            </p>
          </div>
          <div>
            <h4 className="font-semibold">언제 refresh를 사용하나요?</h4>
            <p className="mt-1 text-xs text-sky-600/80">
              빠른 UI 업데이트가 필요하지만 전체 캐시를 무효화할 필요가 없을 때
              사용합니다. 예: 알림 읽음 처리 후 알림 카운트만 업데이트
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
