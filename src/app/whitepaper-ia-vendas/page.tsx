import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Whitepaper IA Vendas e Marketing",
  description: "Acesse o whitepaper exclusivo sobre o impacto da Inteligência Artificial em Vendas e Marketing pela NeuroAds.",
};

export default function WhitepaperPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[var(--background)]">
      {/* Container do Iframe ocupando a tela inteira */}
      <div className="flex-1 w-full relative h-screen">
        <iframe 
          src="https://claude.site/public/artifacts/72ca27aa-1788-4e05-be5c-bb8034286350/embed" 
          title="whitepaper-ia-vendas-marketing.html" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allow="clipboard-write" 
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </main>
  );
}
