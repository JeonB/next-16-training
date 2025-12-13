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

  void queryClient.prefetchQuery(pokemonOptions(pokemonId));

  return (
    <main className="min-h-screen">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PokemonInfo pokemonId={pokemonId} />
      </HydrationBoundary>
    </main>
  );
}
