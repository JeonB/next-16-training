import { queryOptions } from "@tanstack/react-query";
import type { Pokemon, PokemonList } from "./pokemon_type";

export const pokemonOptions = (pokemonId: string) =>
  queryOptions({
    queryKey: ["pokemon", pokemonId],
    queryFn: async (): Promise<Pokemon> => {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch pokemon: ${response.statusText}`);
      }

      return response.json();
    },
  });

export const pokemonOptions2 = queryOptions({
  queryKey: ["pokemon-list"],
  queryFn: async (): Promise<PokemonList> => {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?offset=20&limit=1328"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon list: ${response.statusText}`);
    }

    return response.json();
  },
});
