import { describe, it, expect } from "vitest";
import { extractPokemonId } from "./pokemon-list";

describe("extractPokemonId", () => {
  it("should extract pokemon ID from standard PokeAPI URL", () => {
    const url = "https://pokeapi.co/api/v2/pokemon/25/";
    expect(extractPokemonId(url)).toBe("25");
  });

  it("should extract pokemon ID from URL without trailing slash", () => {
    const url = "https://pokeapi.co/api/v2/pokemon/25";
    expect(extractPokemonId(url)).toBe("25");
  });

  it("should extract pokemon ID from URL with multiple path segments", () => {
    const url = "https://pokeapi.co/api/v2/pokemon-species/25/";
    expect(extractPokemonId(url)).toBe("25");
  });

  it("should handle URL with query parameters", () => {
    const url = "https://pokeapi.co/api/v2/pokemon/25/?format=json";
    expect(extractPokemonId(url)).toBe("json");
  });

  it("should return empty string for empty URL", () => {
    expect(extractPokemonId("")).toBe("");
  });

  it("should return empty string for URL with no ID", () => {
    const url = "https://pokeapi.co/api/v2/pokemon/";
    expect(extractPokemonId(url)).toBe("");
  });

  it("should handle URL with only domain", () => {
    const url = "https://pokeapi.co";
    expect(extractPokemonId(url)).toBe("pokeapi.co");
  });

  it("should extract string IDs correctly", () => {
    const url = "https://pokeapi.co/api/v2/pokemon/pikachu/";
    expect(extractPokemonId(url)).toBe("pikachu");
  });
});
