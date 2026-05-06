"use client";

import dynamic from "next/dynamic";

const NeuralCanvas = dynamic(
  () => import("@/components/interativo/3d/NeuralCanvas").then((mod) => mod.NeuralCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,106,0,0.22),rgba(18,18,18,0.85))]" />
    ),
  }
);

type NeuralBackgroundProps = {
  reducedMotion: boolean;
};

export function NeuralBackground({ reducedMotion }: NeuralBackgroundProps) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,106,0,0.35),transparent_55%),radial-gradient(circle_at_80%_85%,rgba(255,140,0,0.22),transparent_58%)]" />
      <div className="absolute inset-0 opacity-90">
        <NeuralCanvas reducedMotion={reducedMotion} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(10,10,10,0.54)_40%,rgba(10,10,10,0.88)_100%)]" />
    </div>
  );
}
