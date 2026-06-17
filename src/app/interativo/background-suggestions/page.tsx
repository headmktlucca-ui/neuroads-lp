import type { Metadata } from "next";
import { BackgroundSuggestionsExperience } from "@/components/interativo/BackgroundSuggestionsExperience";

export const metadata: Metadata = {
  title: "Backgrounds Animados 3D | NeuroAds Sugestões",
  description:
    "Explore e configure as sugestões de backgrounds WebGL animados em loop para a landing page da NeuroAds, com efeitos de paralaxe e física reativa ao cursor.",
  alternates: {
    canonical: "https://www.neuroads.com.br/interativo/background-suggestions",
  },
};

export default function BackgroundSuggestionsPage() {
  return <BackgroundSuggestionsExperience />;
}
