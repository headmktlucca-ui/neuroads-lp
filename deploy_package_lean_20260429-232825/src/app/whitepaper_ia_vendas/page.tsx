import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "IA em Vendas e Marketing — Whitepaper 2026 · NeuroAds",
  description: "Como a Inteligência Artificial está redefinindo a forma de atrair, converter e reter clientes — e o que sua empresa precisa fazer agora para não ficar para trás.",
};

export default function WhitepaperPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#FAFAF8]">
      {/* 
          Usamos um iframe para carregar o arquivo HTML estático.
          Isso garante que o CSS original do Whitepaper (que é bastante extenso e possui estilos globais como body/root)
          não interfira nos estilos do restante do site da NeuroAds.
      */}
      <div className="flex-1 w-full relative" style={{ height: '100vh' }}>
        <iframe 
          src="/assets/whitepaper-ia-vendas.html" 
          title="Whitepaper IA NeuroAds" 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          className="absolute inset-0 w-full h-full"
          allow="clipboard-write"
          allowFullScreen
        />
      </div>
    </main>
  );
}
