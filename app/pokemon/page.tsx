import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { pokemonOptions2 } from "./pokemon";
import { getQueryClient } from "@/components/providers/get-query-client";
import { PokemonList } from "./pokemon-list";

export default function Home() {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(pokemonOptions2);

  return (
    <main>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PokemonList />
      </HydrationBoundary>
    </main>
  );
}
