import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroAds | Gestão de Tráfego de Alta Performance e Funis Automatizados",
  description: "Escale suas vendas com a NeuroAds. Gestão de tráfego focado em ROI, inteligência neural e funis preditivos para empresas que querem dominar seu mercado.",
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
      className={`${outfit.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
