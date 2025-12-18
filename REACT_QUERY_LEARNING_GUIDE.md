# React Query 학습 가이드

이 문서는 생성된 React Query 예시 코드를 단계별로 학습하는 가이드입니다.

## 📚 학습 순서

### 1단계: 기본 개념 이해

#### 1.1 React Query란?

- **목적**: 서버 상태 관리 라이브러리
- **핵심 기능**: 데이터 페칭, 캐싱, 동기화, 업데이트
- **장점**:
  - 자동 캐싱 및 리패칭
  - 로딩/에러 상태 관리
  - 중복 요청 제거
  - 백그라운드 업데이트

**학습 파일**: `lib/queries/user-queries.ts` (1-26줄)

```typescript
// 쿼리 키: 데이터를 식별하는 고유한 키
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  // ...
};
```

**핵심 개념**:

- 쿼리 키는 배열 형태로 구조화
- 계층적 구조로 무효화 범위 제어 가능
- `as const`로 타입 안전성 확보

---

### 2단계: 쿼리 키 (Query Keys)

#### 2.1 쿼리 키의 역할

- 데이터를 고유하게 식별
- 캐싱의 기준이 됨
- 무효화(invalidation)의 범위 결정

**학습 파일**: `lib/queries/user-queries.ts` (15-26줄)

```typescript
export const userKeys = {
  all: ["users"] as const, // 모든 사용자 관련 쿼리
  lists: () => [...userKeys.all, "list"] as const, // 모든 목록 쿼리
  list: (filters) => [...userKeys.lists(), filters], // 특정 필터의 목록
  details: () => [...userKeys.all, "detail"], // 모든 상세 쿼리
  detail: (id) => [...userKeys.details(), id], // 특정 사용자 상세
};
```

**학습 포인트**:

- `userKeys.all` 무효화 → 모든 사용자 쿼리 무효화
- `userKeys.lists()` 무효화 → 모든 목록 쿼리만 무효화
- `userKeys.detail(id)` 무효화 → 특정 사용자만 무효화

**실습**: 쿼리 키 구조를 변경해보고 무효화 범위가 어떻게 달라지는지 확인

---

### 3단계: queryOptions 패턴 (TanStack Query v5)

#### 3.1 queryOptions란?

- 쿼리 설정을 객체로 반환하는 팩토리 함수
- 타입 안전성과 재사용성 향상
- 서버 컴포넌트에서 prefetch 가능

**학습 파일**: `lib/queries/user-queries.ts` (28-61줄)

```typescript
export function userListOptions(filters) {
  return queryOptions({
    queryKey: userKeys.list(filters),  // 쿼리 키
    queryFn: () => apiGet(...),        // 데이터 페칭 함수
    staleTime: 60 * 1000,              // 1분간 fresh 상태 유지
  });
}
```

**핵심 옵션**:

- `queryKey`: 쿼리 식별자
- `queryFn`: 데이터를 가져오는 함수
- `staleTime`: 데이터가 fresh로 유지되는 시간
- `enabled`: 쿼리 실행 여부 제어

**학습 포인트**:

- `staleTime`: 이 시간 동안은 리패치하지 않음
- `enabled: false`면 쿼리가 실행되지 않음
- `queryOptions`는 서버/클라이언트 모두에서 사용 가능

---

### 4단계: useQuery - 기본 데이터 조회

#### 4.1 useQuery 기본 사용법

- 데이터를 가져오는 가장 기본적인 훅
- 로딩, 에러, 데이터 상태 자동 관리

**학습 파일**: `app/react-query-demo/user-list.tsx` (41-42줄)

```typescript
const { data, isLoading, isError, error } = useQuery(queryOptions);
```

**반환값**:

- `data`: 쿼리 결과 데이터
- `isLoading`: 초기 로딩 중인지 여부
- `isError`: 에러 발생 여부
- `error`: 에러 객체
- `isFetching`: 백그라운드 리패칭 중인지 여부
- `refetch`: 수동 리패치 함수

**학습 파일**: `app/react-query-demo/user-list.tsx` (50-100줄)

```typescript
// 로딩 상태 처리
{isLoading && <div>로딩 중...</div>}

// 에러 상태 처리
{isError && <div>에러: {error.message}</div>}

// 데이터 표시
{data && data.users.map(user => ...)}
```

**학습 포인트**:

- `isLoading` vs `isFetching`: 초기 로딩 vs 백그라운드 리패칭
- 에러는 `ErrorBoundary`와 함께 사용 가능
- 데이터가 없을 때도 처리 필요

**실습**:

1. 네트워크를 느리게 설정하고 로딩 상태 확인
2. 잘못된 API 호출로 에러 상태 확인

---

### 5단계: 페이지네이션과 검색

#### 5.1 동적 쿼리 옵션

- 상태 변경에 따라 쿼리 옵션 재생성
- `useMemo`로 불필요한 재생성 방지

**학습 파일**: `app/react-query-demo/user-list.tsx` (15-39줄)

```typescript
const [page, setPage] = useState(1);
const [search, setSearch] = useState("");

// 검색어 debounce
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 300);
  return () => clearTimeout(timer);
}, [search]);

// 쿼리 옵션 메모이제이션
const queryOptions = useMemo(
  () => userListOptions({ page, limit, search: debouncedSearch }),
  [page, limit, debouncedSearch]
);
```

**학습 포인트**:

- 검색어는 debounce로 API 호출 최소화
- 페이지 변경 시 쿼리 키가 달라져 자동 리패치
- `useMemo`로 동일한 옵션 재사용

**실습**:

1. 검색어 입력 시 debounce 동작 확인
2. 페이지 변경 시 쿼리 키 변경 확인

---

### 6단계: useSuspenseQuery - Suspense 통합

#### 6.1 useSuspenseQuery란?

- React Suspense와 통합된 쿼리 훅
- 로딩 상태를 Suspense fallback으로 처리
- 서버 컴포넌트와 함께 사용 시 prefetch 가능

**학습 파일**: `app/react-query-demo/user-detail.tsx`

```typescript
// Suspense 경계 설정
<Suspense fallback={<UserDetailSkeleton />}>
  <UserDetailContent userId={userId} />
</Suspense>;

// useSuspenseQuery 사용
function UserDetailContent({ userId }) {
  const { data: user } = useSuspenseQuery(userDetailOptions(userId));
  // 로딩 상태는 Suspense가 처리
  return <div>{user.name}</div>;
}
```

**차이점**:

- `useQuery`: `isLoading`으로 로딩 처리
- `useSuspenseQuery`: Suspense fallback으로 로딩 처리

**학습 포인트**:

- 서버에서 prefetch 후 클라이언트에서 hydration
- 에러는 ErrorBoundary로 처리
- 더 선언적인 코드 작성 가능

**실습**:

1. Suspense fallback이 표시되는지 확인
2. 서버 prefetch 동작 확인

---

### 7단계: useMutation - 데이터 변경

#### 7.1 useMutation 기본 사용법

- 데이터 생성/수정/삭제에 사용
- 로딩, 에러, 성공 상태 관리

**학습 파일**: `app/react-query-demo/user-form.tsx` (25-35줄)

```typescript
const createMutation = useMutation({
  mutationFn: createUserMutationFn,
  onSuccess: () => {
    // 성공 시 쿼리 무효화하여 자동 리패치
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    onSuccess?.();
  },
});

// 사용
createMutation.mutate({ name: "John", email: "john@example.com" });
```

**반환값**:

- `mutate`: 뮤테이션 실행 함수
- `mutateAsync`: Promise 반환하는 뮤테이션
- `isPending`: 뮤테이션 진행 중인지
- `isError`: 에러 발생 여부
- `isSuccess`: 성공 여부

**학습 포인트**:

- `onSuccess`: 성공 시 실행할 콜백
- `onError`: 에러 시 실행할 콜백
- `onSettled`: 성공/실패 관계없이 실행

**실습**:

1. 사용자 생성 후 목록 자동 업데이트 확인
2. 에러 발생 시 처리 확인

---

### 8단계: 쿼리 무효화 (Invalidation)

#### 8.1 쿼리 무효화란?

- 캐시된 데이터를 stale로 표시
- 자동으로 리패치 트리거
- 관련 쿼리만 선택적으로 무효화 가능

**학습 파일**: `app/react-query-demo/user-form.tsx` (30-32줄)

```typescript
// 특정 쿼리 무효화
queryClient.invalidateQueries({ queryKey: userKeys.lists() });

// 모든 사용자 관련 쿼리 무효화
queryClient.invalidateQueries({ queryKey: userKeys.all });

// 특정 사용자만 무효화
queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
```

**학습 포인트**:

- 구조화된 쿼리 키로 부분 무효화 가능
- `invalidateQueries`는 비동기로 리패치 트리거
- `refetchQueries`는 즉시 리패치

**실습**:

1. 사용자 생성 후 목록 자동 업데이트 확인
2. 사용자 수정 후 상세 정보 자동 업데이트 확인

---

### 9단계: 옵티미스틱 업데이트 (Optimistic Updates)

#### 9.1 옵티미스틱 업데이트란?

- 서버 응답 전에 UI를 먼저 업데이트
- 사용자 경험 향상
- 실패 시 롤백 필요

**학습 파일**: `app/react-query-demo/user-form.tsx` (40-95줄)

```typescript
const updateMutation = useMutation({
  mutationFn: updateUserMutationFn,

  // 1. 뮤테이션 시작 전: 진행 중인 쿼리 취소 및 이전 데이터 저장
  onMutate: async ({ id, input }) => {
    await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

    const previousUser = queryClient.getQueryData(userKeys.detail(id));

    // 옵티미스틱 업데이트
    queryClient.setQueryData(userKeys.detail(id), {
      ...previousUser,
      ...input,
      updatedAt: new Date().toISOString(),
    });

    return { previousUser }; // 롤백을 위한 컨텍스트
  },

  // 2. 에러 발생 시: 이전 데이터로 롤백
  onError: (error, variables, context) => {
    if (context?.previousUser) {
      queryClient.setQueryData(
        userKeys.detail(variables.id),
        context.previousUser
      );
    }
  },

  // 3. 성공/실패 후: 서버 데이터로 동기화
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries({
      queryKey: userKeys.detail(variables.id),
    });
  },
});
```

**단계별 설명**:

1. **onMutate**: 뮤테이션 시작 전 실행

   - 진행 중인 쿼리 취소 (낙관적 업데이트와 충돌 방지)
   - 이전 데이터 스냅샷 저장
   - 옵티미스틱 업데이트 적용
   - 롤백을 위한 컨텍스트 반환

2. **onError**: 에러 발생 시 실행

   - 저장된 이전 데이터로 롤백
   - 사용자에게 에러 알림

3. **onSettled**: 성공/실패 관계없이 실행
   - 서버 데이터로 동기화
   - 쿼리 무효화로 최신 데이터 확보

**학습 포인트**:

- `cancelQueries`: 진행 중인 쿼리 취소 (중요!)
- `setQueryData`: 캐시 직접 업데이트
- `getQueryData`: 캐시에서 데이터 읽기
- 컨텍스트로 이전 상태 저장 및 롤백

**실습**:

1. 네트워크를 느리게 설정하고 옵티미스틱 업데이트 확인
2. 네트워크를 끊고 에러 발생 시 롤백 확인

---

### 10단계: 서버 컴포넌트와 Prefetch

#### 10.1 서버에서 Prefetch

- Next.js 서버 컴포넌트에서 데이터 미리 가져오기
- 초기 로딩 시간 단축
- HydrationBoundary로 클라이언트에 전달

**학습 파일**: `app/react-query-demo/page.tsx`

```typescript
export default async function ReactQueryDemoPage() {
  const queryClient = getQueryClient();

  // 서버에서 데이터 prefetch
  await queryClient.prefetchQuery(userListOptions({ page: 1, limit: 10 }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
}
```

**학습 포인트**:

- `prefetchQuery`: 서버에서 데이터 미리 가져오기
- `dehydrate`: 쿼리 클라이언트 상태를 직렬화
- `HydrationBoundary`: 클라이언트에 상태 전달
- 클라이언트에서 즉시 데이터 사용 가능

**실습**:

1. 서버 prefetch 후 클라이언트에서 즉시 데이터 표시 확인
2. 네트워크 탭에서 초기 요청 확인

---

## 🎯 실습 과제

### 초급

1. ✅ `useQuery`로 데이터 조회하기
2. ✅ 로딩/에러 상태 처리하기
3. ✅ 페이지네이션 구현하기

### 중급

4. ✅ 검색 기능에 debounce 적용하기
5. ✅ `useMutation`으로 데이터 생성/수정/삭제하기
6. ✅ 쿼리 무효화로 자동 리패치하기

### 고급

7. ✅ 옵티미스틱 업데이트 구현하기
8. ✅ `useSuspenseQuery`로 Suspense 통합하기
9. ✅ 서버 컴포넌트에서 prefetch하기

---

## 📖 추가 학습 자료

### 공식 문서

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Query Keys 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [Optimistic Updates 가이드](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

### 핵심 개념 정리

#### 캐싱 전략

- `staleTime`: 데이터가 fresh로 유지되는 시간
- `gcTime` (구 `cacheTime`): 사용되지 않는 데이터가 메모리에 남는 시간
- `refetchOnWindowFocus`: 창 포커스 시 자동 리패치

#### 쿼리 상태

- `fresh`: 아직 유효한 데이터 (리패치 불필요)
- `stale`: 오래된 데이터 (리패치 필요)
- `fetching`: 현재 요청 중
- `paused`: 일시 중지됨

#### 무효화 전략

- `invalidateQueries`: stale로 표시하고 리패치
- `refetchQueries`: 즉시 리패치
- `resetQueries`: 캐시 초기화
- `removeQueries`: 캐시에서 제거

---

## 🔍 코드 탐색 가이드

### 파일별 학습 포인트

1. **`lib/queries/user-queries.ts`**

   - 쿼리 키 구조화
   - queryOptions 패턴
   - 타입 안전성

2. **`app/react-query-demo/page.tsx`**

   - 서버 prefetch
   - HydrationBoundary 사용

3. **`app/react-query-demo/user-list.tsx`**

   - useQuery 기본 사용
   - 페이지네이션
   - 검색 및 debounce

4. **`app/react-query-demo/user-detail.tsx`**

   - useSuspenseQuery 사용
   - Suspense 통합

5. **`app/react-query-demo/user-form.tsx`**
   - useMutation 사용
   - 옵티미스틱 업데이트
   - 에러 처리 및 롤백

---

## 💡 팁과 모범 사례

1. **쿼리 키는 항상 구조화하기**

   - 무효화 범위 제어가 쉬워짐
   - 타입 안전성 확보

2. **queryOptions 패턴 사용하기**

   - 서버/클라이언트 모두에서 사용 가능
   - 타입 추론이 잘 됨

3. **옵티미스틱 업데이트는 신중하게**

   - 롤백 로직 필수
   - 중요한 데이터는 서버 응답 확인

4. **에러 처리는 사용자 친화적으로**

   - 명확한 에러 메시지
   - 재시도 옵션 제공

5. **불필요한 리패치 방지**
   - `staleTime` 적절히 설정
   - `refetchOnWindowFocus: false` 고려

---

## 🚀 다음 단계

이 가이드를 따라 학습한 후:

1. 실제 프로젝트에 적용해보기
2. 무한 스크롤 구현하기 (`useInfiniteQuery`)
3. 쿼리 디바운싱/스로틀링 고급 패턴
4. React Query DevTools 활용하기
