import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import SupportChat from "../components/support/SupportChat";

export const metadata: Metadata = {
  title: "NeuroAds | Gestão de Tráfego de Alta Performance e Funis Automatizados",
  description: "Escale suas vendas com a NeuroAds. Gestão de tráfego focado em ROI, inteligência neural e funis preditivos para empresas que querem dominar seu mercado.",
  icons: {
    icon: [
      { url: '/images/icon_neuroads_transparente.png' },
      { url: '/images/icon_neuroads_transparente.png', sizes: '32x32', type: 'image/png' },
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
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          {children}
          <SupportChat />
        </AuthProvider>
      </body>
    </html>
  );
}
