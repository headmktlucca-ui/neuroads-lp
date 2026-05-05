'use client';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import { isAdminEmail } from '../../lib/admin-auth';
import AdminControlCenter from '../../components/admin/AdminControlCenter';

export default function AdminPage() {
  const { user, loading, isAdmin, loginWithGoogle, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-bg-main flex items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-3xl border border-border bg-white p-8 shadow-sm">
          <p className="text-xs font-black tracking-[0.14em] uppercase text-primary">NeuroAds Admin</p>
          <h1 className="text-3xl font-black text-text-main mt-3">Acesso administrativo restrito</h1>
          <p className="text-sm text-text-muted mt-3">
            Entre com Google para acessar o painel de administração total do ecossistema.
          </p>
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="mt-6 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8B2D] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(255,107,0,0.3)]"
          >
            Entrar com Google
          </button>
        </section>
      </main>
    );
  }

  if (!isAdmin || !isAdminEmail(user.email)) {
    return (
      <main className="min-h-screen bg-bg-main flex items-center justify-center px-4">
        <section className="w-full max-w-lg rounded-3xl border border-[#FFD3D3] bg-[#FFF5F5] p-8 shadow-sm">
          <p className="text-xs font-black tracking-[0.14em] uppercase text-[#D14343]">Acesso negado</p>
          <h1 className="text-2xl font-black text-text-main mt-3">Conta sem permissão para o painel admin</h1>
          <p className="text-sm text-text-muted mt-3">
            Este ambiente aceita apenas o e-mail <span className="font-bold text-text-main">contato.neuroads@gmail.com</span>.
          </p>
          <p className="text-sm text-text-muted mt-2">
            Conta atual: <span className="font-bold text-text-main">{user.email || 'não identificado'}</span>
          </p>
          <button
            type="button"
            onClick={async () => {
              await logout();
              await loginWithGoogle();
            }}
            className="mt-4 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8B2D] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(255,107,0,0.3)]"
          >
            Trocar conta Google
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 rounded-xl border border-red-200 bg-white px-5 py-3 text-xs font-black tracking-widest uppercase text-[#D14343]"
          >
            Sair da conta atual
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />
      <div className="flex-grow pt-24 md:pt-28 px-4 md:px-6 pb-12">
        <div className="mx-auto max-w-[1320px] space-y-6">
          <section className="rounded-3xl border border-border bg-white p-6 md:p-8">
            <p className="text-xs font-black tracking-[0.14em] uppercase text-primary">Painel administrativo</p>
            <h1 className="text-3xl md:text-4xl font-black text-text-main mt-3">Administração total NeuroAds</h1>
            <p className="text-sm md:text-base text-text-muted mt-3 max-w-4xl">
              Controle operacional integrado do CRM, agentes de IA e financeiro, com foco em previsibilidade comercial e impacto direto no caixa.
            </p>
          </section>

          <AdminControlCenter userId={user.uid} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
