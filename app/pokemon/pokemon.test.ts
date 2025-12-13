import { describe, it, expect, vi, beforeEach } from "vitest";
import { pokemonOptions, pokemonOptions2 } from "./pokemon";
import type { Pokemon, PokemonList } from "./pokemon_type";

// Mock fetch globally
global.fetch = vi.fn();

describe("pokemonOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return correct query options for pokemon ID", () => {
    const pokemonId = "25";
    const options = pokemonOptions(pokemonId);

    expect(options.queryKey).toEqual(["pokemon", "25"]);
    expect(typeof options.queryFn).toBe("function");
  });

  it("should fetch and return pokemon data successfully", async () => {
    const pokemonId = "25";
    const mockPokemon: Pokemon = {
      id: 25,
      name: "pikachu",
      base_experience: 112,
      height: 4,
      is_default: true,
      order: 35,
      weight: 60,
      abilities: [],
      forms: [],
      game_indices: [],
      held_items: [],
      location_area_encounters: "",
      moves: [],
      past_abilities: [],
      past_types: [],
      sprites: {
        back_default: null,
        back_female: null,
        back_shiny: null,
        back_shiny_female: null,
        front_default: "https://pokeapi.co/sprites/pokemon/25.png",
        front_female: null,
        front_shiny: null,
        front_shiny_female: null,
      },
      cries: {
        latest:
          "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
      },
      species: {
        name: "pikachu",
        url: "https://pokeapi.co/api/v2/pokemon-species/25/",
      },
      stats: [],
      types: [],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemon,
    } as Response);

    const options = pokemonOptions(pokemonId);
    if (!options.queryFn) {
      throw new Error("queryFn is not defined");
    }
    const result = await options.queryFn({} as never);

    expect(fetch).toHaveBeenCalledWith(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
    );
    expect(result).toEqual(mockPokemon);
    expect(result.id).toBe(25);
    expect(result.name).toBe("pikachu");
  });

  it("should throw error when fetch fails", async () => {
    const pokemonId = "99999";

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    } as Response);

    const options = pokemonOptions(pokemonId);
    if (!options.queryFn) {
      throw new Error("queryFn is not defined");
    }

    await expect(options.queryFn({} as never)).rejects.toThrow(
      "Failed to fetch pokemon: Not Found"
    );
  });

  it("should handle network errors", async () => {
    const pokemonId = "25";

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const options = pokemonOptions(pokemonId);
    if (!options.queryFn) {
      throw new Error("queryFn is not defined");
    }

    await expect(options.queryFn({} as never)).rejects.toThrow("Network error");
  });
});

describe("pokemonOptions2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return correct query options for pokemon list", () => {
    const options = pokemonOptions2;

    expect(options.queryKey).toEqual(["pokemon-list"]);
    expect(typeof options.queryFn).toBe("function");
  });

  it("should fetch and return pokemon list successfully", async () => {
    const mockPokemonList: PokemonList = {
      results: [
        { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
        { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
        { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon/3/" },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonList,
    } as Response);

    if (!pokemonOptions2.queryFn) {
      throw new Error("queryFn is not defined");
    }
    const result = await pokemonOptions2.queryFn({} as never);

    expect(fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon?offset=20&limit=1328"
    );
    expect(result).toEqual(mockPokemonList);
    expect(result.results).toHaveLength(3);
    expect(result.results[0].name).toBe("bulbasaur");
  });

  it("should throw error when fetch fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: "Internal Server Error",
    } as Response);

    if (!pokemonOptions2.queryFn) {
      throw new Error("queryFn is not defined");
    }
    await expect(pokemonOptions2.queryFn({} as never)).rejects.toThrow(
      "Failed to fetch pokemon list: Internal Server Error"
    );
  });

  it("should handle empty pokemon list", async () => {
    const mockPokemonList: PokemonList = {
      results: [],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPokemonList,
    } as Response);

    if (!pokemonOptions2.queryFn) {
      throw new Error("queryFn is not defined");
    }
    const result = await pokemonOptions2.queryFn({} as never);

    expect(result.results).toHaveLength(0);
  });

  it("should handle network errors", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    if (!pokemonOptions2.queryFn) {
      throw new Error("queryFn is not defined");
    }
    await expect(pokemonOptions2.queryFn({} as never)).rejects.toThrow(
      "Network error"
    );
  });
});
