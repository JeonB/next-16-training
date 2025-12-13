import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { pokemonOptions } from "@/app/pokemon/pokemon";
import { getQueryClient } from "@/components/providers/get-query-client";
import { PokemonInfo } from "@/app/pokemon/pokemon-info";

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ pokemonId: string }>;
}) {
  const { pokemonId } = await params;
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery(pokemonOptions(pokemonId));
  } catch {
    // Prefetch 실패 시 클라이언트에서 재시도하도록 에러를 throw하지 않음
    // 클라이언트의 useSuspenseQuery가 자동으로 재시도함
  }

  return (
    <main className="min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PokemonInfo pokemonId={pokemonId} />
      </HydrationBoundary>
    </main>
  );
}
