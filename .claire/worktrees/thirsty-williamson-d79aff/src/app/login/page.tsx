import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPageClient } from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Entrar | NeuroAds Hub',
  description:
    'Acesse o Hub Estratégico da NeuroAds. Gerencie agentes de IA, dashboards e performance em tempo real.',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginPageClient />
    </Suspense>
  );
}
