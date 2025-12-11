"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { pokemonOptions } from "./pokemon";
import Image from "next/image";
import Link from "next/link";

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-600",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

const statNames: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export function PokemonInfo({ pokemonId }: { pokemonId: string }) {
  const { data } = useSuspenseQuery(pokemonOptions(pokemonId));

  const mainImageUrl =
    data.sprites.other?.["official-artwork"]?.front_default ??
    data.sprites.front_shiny ??
    data.sprites.front_default ??
    "";

  const formatStatName = (name: string): string => {
    return statNames[name] || name;
  };

  const getTypeColor = (typeName: string): string => {
    return typeColors[typeName] || "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 via-white to-red-100 p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/pokemon"
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          ← Back to Game
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          <div
            className={`h-4 bg-linear-to-r ${
              data.types[0]
                ? `${getTypeColor(data.types[0].type.name)}`
                : "bg-gray-400"
            } ${
              data.types[1]
                ? `via-${getTypeColor(data.types[1].type.name)}`
                : ""
            } ${
              data.types[1] ? `${getTypeColor(data.types[1].type.name)}` : ""
            }`}
          />

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-64 h-64 md:w-80 md:h-80 animate-scale-in">
                  {mainImageUrl && (
                    <Image
                      src={mainImageUrl}
                      alt={data.name}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="(max-width: 768px) 256px, 320px"
                      priority
                    />
                  )}
                </div>

                <div className="text-center space-y-2">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 capitalize">
                    {data.name}
                  </h1>
                  <p className="text-xl text-gray-600">
                    #{String(data.id).padStart(4, "0")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {data.types.map((type) => (
                    <span
                      key={type.slot}
                      className={`px-4 py-2 rounded-full text-white font-semibold shadow-md ${getTypeColor(
                        type.type.name
                      )}`}
                    >
                      {type.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6 animate-fade-in-delay">
                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Base Stats
                  </h2>
                  <div className="space-y-3">
                    {data.stats.map((stat) => (
                      <div key={stat.stat.name} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatStatName(stat.stat.name)}
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {stat.base_stat}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              stat.base_stat >= 100
                                ? "bg-green-500"
                                : stat.base_stat >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (stat.base_stat / 255) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Abilities
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {data.abilities.map((ability) => (
                      <span
                        key={ability.ability.name}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                          ability.is_hidden
                            ? "bg-purple-200 text-purple-800"
                            : "bg-blue-200 text-blue-800"
                        }`}
                      >
                        {ability.ability.name.replace("-", " ")}
                        {ability.is_hidden && " (Hidden)"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 shadow-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Height</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {(data.height / 10).toFixed(1)} m
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 shadow-lg text-center">
                    <p className="text-sm text-gray-600 mb-1">Weight</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {(data.weight / 10).toFixed(1)} kg
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Sprites
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {data.sprites.front_default && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">Normal</p>
                        <div className="relative w-24 h-24 mx-auto bg-gray-100 rounded-lg">
                          <Image
                            src={data.sprites.front_default}
                            alt={`${data.name} normal`}
                            fill
                            className="object-contain"
                            sizes="96px"
                          />
                        </div>
                      </div>
                    )}
                    {data.sprites.front_shiny && (
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-2">Shiny</p>
                        <div className="relative w-24 h-24 mx-auto bg-gray-100 rounded-lg">
                          <Image
                            src={data.sprites.front_shiny}
                            alt={`${data.name} shiny`}
                            fill
                            className="object-contain"
                            sizes="96px"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}
