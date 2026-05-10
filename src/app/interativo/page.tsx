import type { Metadata } from "next";
import { InterativoExperience } from "@/components/interativo/InterativoExperience";

export const metadata: Metadata = {
  title: "NeuroAds Interativo | Sistema Operacional de Inteligencia Comercial",
  description:
    "Landing page cinematografica da NeuroAds com IA agentica, motion design premium e experiencia imersiva orientada a performance.",
  alternates: {
    canonical: "https://www.neuroads.com.br/interativo",
  },
  openGraph: {
    title: "NeuroAds Interativo",
    description:
      "Explore uma operacao comercial viva com agentes de IA, dashboards em tempo real e storytelling cinematico.",
    url: "https://www.neuroads.com.br/interativo",
    siteName: "NeuroAds",
    locale: "pt_BR",
    type: "website",
  },
};

export default function InterativoPage() {
  return <InterativoExperience />;
}
