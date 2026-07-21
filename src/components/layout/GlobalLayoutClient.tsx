'use client';

import { usePathname } from 'next/navigation';
import PublicTopNav from './PublicTopNav';
import HubFooter from '../hub/HubFooter';
import WhatsAppFloatingWidget from '../neuroads/WhatsAppFloatingWidget';

// Standalone routes (Hub and Auth pages) render their own dedicated chrome/layout
const STANDALONE_PREFIXES = [
  '/hub',
  '/login',
  '/cadastro',
  '/onboarding',
  '/verificar-email',
  '/recuperar-senha',
  '/preview-chat',
];

// Public landing pages with self-contained navbar and footer
const SELF_CHROME_PREFIXES = ['/servicos', '/agentes-ia', '/conteudos', '/a-neuroads'];
const SELF_CHROME_EXACT = ['/', '/temp-lp', '/termos', '/privacidade'];

function isStandaloneRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return STANDALONE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasOwnChrome(pathname: string | null): boolean {
  if (!pathname) return false;
  if (SELF_CHROME_EXACT.includes(pathname)) return true;
  return SELF_CHROME_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function GlobalLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Auth & Hub routes render clean without PublicTopNav or HubFooter
  if (isStandaloneRoute(pathname)) {
    return <>{children}</>;
  }

  if (hasOwnChrome(pathname)) {
    return (
      <>
        {children}
        <WhatsAppFloatingWidget />
      </>
    );
  }

  return (
    <>
      <PublicTopNav />
      {children}
      <WhatsAppFloatingWidget />
      <HubFooter />
    </>
  );
}
