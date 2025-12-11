"use client";

import { useState, useEffect, useRef } from "react";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { pokemonOptions2, pokemonOptions } from "./pokemon";
import Image from "next/image";
import Link from "next/link";
import type { PokemonSpecies } from "./pokemon_type";

function extractPokemonId(url: string): string {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function GachaSpinner({
  pokemonList,
  onComplete,
}: {
  pokemonList: PokemonSpecies[];
  onComplete: (pokemon: PokemonSpecies) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSpinning) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }

    const spinDuration = 2000;
    const fastInterval = 50;

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / spinDuration;

      if (progress >= 1) {
        setIsSpinning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        const finalIndex = Math.floor(Math.random() * pokemonList.length);
        onComplete(pokemonList[finalIndex]);
        return;
      }

      setCurrentIndex((prev) => (prev + 1) % pokemonList.length);
    }, fastInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSpinning, pokemonList, onComplete]);

  if (pokemonList.length === 0) return null;

  const currentPokemon = pokemonList[currentIndex];
  const pokemonId = extractPokemonId(currentPokemon.url);

  return (
    <div className="w-64 h-64 relative flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center animate-gacha-spin">
        <div className="w-48 h-48 relative">
          <Image
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
            alt={currentPokemon.name}
            fill
            className="object-contain drop-shadow-2xl brightness-75"
            sizes="192px"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

function RevealedPokemon({
  pokemonId,
  randomPokemonList,
}: {
  pokemonId: string;
  randomPokemonList: PokemonSpecies[];
}) {
  const { data, isLoading } = useQuery(pokemonOptions(pokemonId));
  const [loadingPokemonId, setLoadingPokemonId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading && randomPokemonList.length > 0) {
      const interval = setInterval(() => {
        const randomIndex = Math.floor(
          Math.random() * randomPokemonList.length
        );
        const randomPokemon = randomPokemonList[randomIndex];
        setLoadingPokemonId(extractPokemonId(randomPokemon.url));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isLoading, randomPokemonList]);

  if (isLoading) {
    return (
      <div className="w-64 h-64 relative flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center animate-gacha-spin">
          {loadingPokemonId && (
            <div className="w-48 h-48 relative">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${loadingPokemonId}.png`}
                alt="Loading pokemon"
                fill
                className="object-contain drop-shadow-2xl brightness-75"
                sizes="192px"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const imageUrl =
    data.sprites.other?.["official-artwork"]?.front_default ??
    data.sprites.front_shiny ??
    data.sprites.front_default ??
    "";

  return (
    <Link
      href={`/pokemon/${pokemonId}`}
      className="group relative transition-all duration-500 hover:scale-110"
    >
      {/* 시안색 광선 버스트 효과 */}
      <div className="burst-rays-effect animate-burst-rays" />

      {/* 중앙 흰색 코어 펄스 효과 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-24 h-24 rounded-full bg-white animate-core-pulse" />
      </div>

      {/* 호버 효과 */}
      <div className="absolute inset-0 bg-linear-to-r from-yellow-400 to-yellow-600 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

      <div className="relative animate-fade-in-scale z-10">
        <div className="w-64 h-64 relative">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={data.name}
              fill
              className="object-contain drop-shadow-2xl animate-reveal-gradual"
              sizes="256px"
              priority
            />
          )}
        </div>
      </div>
    </Link>
  );
}

export function PokemonList() {
  const { data } = useSuspenseQuery(pokemonOptions2);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonSpecies | null>(
    null
  );
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleReveal = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setIsRevealed(false);
    setSelectedPokemon(null);
  };

  const handleGachaComplete = (pokemon: PokemonSpecies) => {
    setSelectedPokemon(pokemon);
    setIsRevealed(true);
    setIsSpinning(false);
  };

  const handleNewPokemon = () => {
    setSelectedPokemon(null);
    setIsRevealed(false);
    setIsSpinning(false);
  };

  const pokemonId = selectedPokemon
    ? extractPokemonId(selectedPokemon.url)
    : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-400 via-red-500 to-red-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] mb-4">
            Who&apos;s That Pokémon?
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center gap-8">
            {isSpinning && (
              <GachaSpinner
                pokemonList={data.results}
                onComplete={handleGachaComplete}
              />
            )}

            {!isSpinning && !isRevealed && (
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-9xl font-bold text-blue-900/80 animate-bounce">
                    ?
                  </div>
                </div>
              </div>
            )}

            {isRevealed && pokemonId && (
              <RevealedPokemon
                pokemonId={pokemonId}
                randomPokemonList={data.results}
              />
            )}

            {!isSpinning && !isRevealed && (
              <div className="text-center space-y-4">
                <button
                  onClick={handleReveal}
                  className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold text-xl rounded-full shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  Reveal Pokémon!
                </button>
              </div>
            )}

            {isRevealed && selectedPokemon && (
              <div className="text-center space-y-4 animate-fade-in">
                <h2 className="text-4xl font-bold text-yellow-300 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] uppercase">
                  {selectedPokemon.name}
                </h2>
                <button
                  onClick={handleNewPokemon}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
