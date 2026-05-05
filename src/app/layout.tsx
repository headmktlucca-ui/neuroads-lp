import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

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
      <body className={`${inter.variable} ${manrope.variable} min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
