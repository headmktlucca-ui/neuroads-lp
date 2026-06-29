'use client';

import { usePathname } from 'next/navigation';
import PublicTopNav from './PublicTopNav';
import HubFooter from '../hub/HubFooter';

const HUB_PREFIXES = ['/hub', '/login', '/onboarding', '/cadastro', '/verificar-email'];


export default function GlobalLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivateRoute = HUB_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isPrivateRoute) return <>{children}</>;

  return (
    <>
      <PublicTopNav />
      {children}
      <HubFooter />
    </>
  );
}
