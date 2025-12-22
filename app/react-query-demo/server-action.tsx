import { getUserList } from "@/lib/actions/user-actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { UserList } from "./user-list";
import { getQueryClient } from "@/components/providers/get-query-client";
import { userKeys } from "@/lib/queries/user-queries";

export default async function ReactQueryDemoPage() {
  const queryClient = getQueryClient();
  const initialData = await getUserList({ page: 1, limit: 10 });

  queryClient.setQueryData(userKeys.list({ page: 1, limit: 10 }), initialData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
}
