import type { Metadata } from "next";
import Script from 'next/script';
import { Inter, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import GlobalLayoutClient from "../components/layout/GlobalLayoutClient";
import fs from "fs";
import path from "path";

// Definitively copy the avatar image to a safe ASCII filename - 2026-05-27T05:27:00
try {
  const mediaPath = "C:\\Users\\claud\\.gemini\\antigravity-ide\\brain\\d9b70cb4-0e20-4f75-91bf-9ffecc217eb5\\media__1779859090069.png";
  const srcPath = path.join(process.cwd(), "public", "images", "Flávio Almeida.png");
  const destPath = path.join(process.cwd(), "public", "images", "flavio-almeida.png");
  
  if (fs.existsSync(mediaPath)) {
    fs.copyFileSync(mediaPath, destPath);
  } else if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
} catch (err) {
  // Silent fallback
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-head",
  display: "swap",
  preload: false,
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "NeuroAds | Agentes IA para Marketing e Vendas B2B",
  description: "A NeuroAds une campanhas patrocinadas, automação e um ecossistema de 10 agentes de IA especializados para transformar o marketing e o comercial da sua empresa B2B em uma máquina previsível de receita. Experimente grátis por 14 dias.",
  metadataBase: new URL("https://www.neuroads.com.br"),
  alternates: {
    canonical: "https://www.neuroads.com.br/",
  },
  keywords: [
    "agentes de IA para vendas",
    "automação comercial com inteligência artificial",
    "gestão de tráfego B2B",
    "SDR com IA",
    "ecossistema de agentes IA",
    "marketing B2B com IA",
    "CRM com inteligência artificial",
    "funil de vendas automatizado",
    "GEO SEO para empresas B2B",
    "plataforma de marketing e vendas B2B"
  ],
  authors: [{ name: "NeuroAds", url: "https://www.neuroads.com.br" }],
  creator: "NeuroAds",
  publisher: "NeuroAds",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.neuroads.com.br/",
    siteName: "NeuroAds",
    title: "NeuroAds | Agentes IA para Marketing e Vendas B2B",
    description: "Ecossistema de 10 agentes IA especializados (SDR, Closer, Suporte, Dados, Tráfego) que operam 24/7 para transformar o funil comercial B2B em uma máquina previsível de receita.",
    images: [
      {
        url: "/images/og-neuroads.png",
        width: 1200,
        height: 630,
        alt: "NeuroAds — Agentes IA para Marketing e Vendas B2B",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroAds | Agentes IA para Marketing e Vendas B2B",
    description: "Ecossistema de 10 agentes IA especializados (SDR, Closer, Suporte, Dados, Tráfego) que operam 24/7 para transformar o funil comercial B2B.",
    images: ["/images/og-neuroads.png"],
    creator: "@neuroads",
    site: "@neuroads",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/icon_neuroads_transparente.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icon_neurados_transparente.png' },
    ],
  },
  verification: {
    google: "google357a42d89079c6ac",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        {/* Organization Schema JSON-LD — Entity Recognition for Google KG + AI Citation */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.neuroads.com.br/#organization",
              "name": "NeuroAds",
              "legalName": "NeuroAds Operações IA Ltda",
              "url": "https://www.neuroads.com.br",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.neuroads.com.br/images/Logos/Logo_primario.png",
                "width": 172,
                "height": 39
              },
              "description": "Plataforma SaaS brasileira de operações IA estratégicas para marketing e vendas B2B. Ecossistema de 10 agentes de inteligência artificial especializados — SDR, Closer, Suporte, Dados e Tráfego — que operam de forma integrada para transformar o funil comercial em uma máquina previsível de receita.",
              "foundingDate": "2023",
              "numberOfEmployees": { "@type": "QuantitativeValue", "value": "10" },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "BR",
                "addressLocality": "Brasil"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "email": "avante@neuroads.com.br",
                "availableLanguage": "Portuguese",
                "hoursAvailable": "Mo-Su 00:00-23:59"
              },
              "sameAs": [
                "https://www.instagram.com/neuroads.com.br",
                "https://www.linkedin.com/company/neuroads",
                "https://www.youtube.com/@neuroads.vendas"
              ],
              "offers": {
                "@type": "Offer",
                "name": "Trial 14 Dias Grátis",
                "price": "0",
                "priceCurrency": "BRL",
                "url": "https://www.neuroads.com.br/cadastro",
                "description": "Experimente o ecossistema NeuroAds gratuitamente por 14 dias sem necessidade de cartão de crédito."
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Soluções NeuroAds",
                "itemListElement": [
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Agentes IA Comerciais", "description": "Ecossistema de 10 agentes IA especializados em SDR, atendimento, follow-up e orquestração." } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gestão de Tráfego Pago", "description": "Gestão ativa de campanhas no Google Ads, Meta Ads e LinkedIn Ads com foco em ROAS." } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Posicionamento & Autoridade (SEO/GEO)", "description": "Otimização da presença digital em buscadores tradicionais e motores de IA (ChatGPT, Perplexity, Gemini)." } },
                  { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Automação & CRM", "description": "Fluxos de nutrição, integrações e RAG conectados ao CRM da empresa." } }
                ]
              }
            })
          }}
        />
        {/* SoftwareApplication Schema — Product-level entity */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://www.neuroads.com.br/#software",
              "name": "NeuroAds Platform",
              "applicationCategory": "BusinessApplication",
              "applicationSubCategory": "CRM, Marketing Automation, AI Agents",
              "operatingSystem": "Web",
              "url": "https://www.neuroads.com.br",
              "description": "Plataforma integrada de marketing e vendas B2B com ecossistema de 10 agentes de IA, gestão de tráfego pago e automação de funil comercial.",
              "inLanguage": "pt-BR",
              "offers": {
                "@type": "Offer",
                "name": "Trial 14 Dias",
                "price": "0",
                "priceCurrency": "BRL",
                "eligibleDuration": { "@type": "QuantitativeValue", "value": 14, "unitCode": "DAY" }
              },
              "publisher": {
                "@id": "https://www.neuroads.com.br/#organization"
              },
              "featureList": [
                "10 Agentes IA especializados (SDR, Closer, Suporte, Dados, Tráfego, SEO)",
                "Gestão de campanhas Google Ads, Meta Ads, LinkedIn Ads",
                "Dashboard unificado de marketing e vendas em tempo real",
                "Automação de follow-up em WhatsApp e Email",
                "Integração nativa com CRMs (HubSpot, RD Station, Pipedrive, Kommo)",
                "Diagnóstico estratégico gratuito de presença digital",
                "Atendimento 24/7 via Agente SDR no WhatsApp"
              ]
            })
          }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-80X93TW8EK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-80X93TW8EK');
          `}
        </Script>
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-568QNBTQ');`}
        </Script>
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${sora.variable} min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-568QNBTQ"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* HubSpot tracking script - loads after the page is interactive */}
        <Script
          id="hs-script-loader"
          src="//js.hs-scripts.com/51491374.js"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <GlobalLayoutClient>
            {children}
          </GlobalLayoutClient>
        </AuthProvider>
      </body>
    </html>
  );
}
