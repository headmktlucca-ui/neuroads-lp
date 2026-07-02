'use client';

import { usePathname } from 'next/navigation';
import PublicTopNav from './PublicTopNav';
import HubFooter from '../hub/HubFooter';

// Rotas privadas (Hub/auth) renderizam seu próprio chrome.
const HUB_PREFIXES = ['/hub', '/login', '/onboarding', '/cadastro', '/verificar-email', '/preview-chat'];

// Rotas públicas que já trazem a própria navegação (PrimaryTopMenu) e o próprio
// rodapé (PrimaryFooter) — não devem receber a PublicTopNav/HubFooter globais,
// senão a página renderiza duas navbars e dois footers sobrepostos (ruim no mobile).
const SELF_CHROME_PREFIXES = ['/servicos', '/agentes-ia', '/conteudos/alem-do-algoritmo'];
const SELF_CHROME_EXACT = ['/conteudos', '/a-neuroads', '/', '/temp-lp'];

function hasOwnChrome(pathname: string | null): boolean {
  if (!pathname) return false;
  if (SELF_CHROME_EXACT.includes(pathname)) return true;
  return SELF_CHROME_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function GlobalLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivateRoute = HUB_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isPrivateRoute || hasOwnChrome(pathname)) return <>{children}</>;

  return (
    <>
      <PublicTopNav />
      {children}
      <HubFooter />
    </>
  );
}
