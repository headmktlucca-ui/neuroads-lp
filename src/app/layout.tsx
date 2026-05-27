import type { Metadata } from "next";
import Script from 'next/script';
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
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
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-head",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuroAds | Gestão de Tráfego de Alta Performance e Funis Automatizados",
  description: "Escale suas vendas com a NeuroAds. Gestão de tráfego focado em ROI, inteligência neural e funis preditivos para empresas que querem dominar seu mercado.",
  metadataBase: new URL("https://www.neuroads.com.br"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/icon_neuroads_transparente.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icon_neuroads_transparente.png' },
    ],
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
      className="h-full antialiased scroll-smooth"
    >
      <body className={`${inter.variable} ${manrope.variable} min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]`}>
        {/* HubSpot tracking script - loads after the page is interactive */}
        <Script
          id="hs-script-loader"
          src="//js.hs-scripts.com/51491374.js"
          strategy="afterInteractive"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
