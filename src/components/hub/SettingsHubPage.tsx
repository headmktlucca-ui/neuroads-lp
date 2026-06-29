'use client';

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const KnowledgeExplorer = lazy(() => import('./KnowledgeExplorer'));
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Crown, Activity, Workflow, Fingerprint,
  ShieldAlert, Trash2, Building2, Globe, CreditCard, DollarSign,
  ShieldCheck, Calendar, Gauge
} from 'lucide-react';
import { getFirebaseDb } from '../../lib/firebase';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';
import { getHubProfileSummary } from '../../lib/hub-profile';


// Reusing identical helper functions from Navbar
function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

const DEFAULT_COMPANY_FORM = {
  companyName: '',
  site: HTTPS_PREFIX,
  instagram: '',
  linkedin: '',
  tiktok: '',
  blog: '',
};

const SETTINGS_LABEL = "text-[10px] font-black uppercase tracking-widest text-slate-400";
const SETTINGS_PANEL = "hub-neu-card p-5";
const SETTINGS_INPUT = "w-full h-[46px] rounded-xl border border-white/30 bg-[#eef2f7] px-4 text-sm font-semibold text-slate-800 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-colors focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6A00]/10 placeholder:text-slate-400 placeholder:font-medium";
const SETTINGS_PRIMARY_BUTTON = "inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-6 text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] transition-all hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50";

export default function SettingsHubPage() {
  const { user, profile, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const activeTab = searchParams.get('tab') || 'perfil';

  // Profile State
  const [whatsApp, setWhatsApp] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);

  // Company State
  const [companyForm, setCompanyForm] = useState(DEFAULT_COMPANY_FORM);
  const [companySaved, setCompanySaved] = useState(false);

  // Financial State
  const [isManagingPlan, setIsManagingPlan] = useState(false);

  // Derived Info
  const userEmail = user?.email || readString((profile as Record<string, unknown> | null)?.email);
  const hubProfile = useMemo(() => getHubProfileSummary(profile), [profile]);
  const connectedPlatforms = profile?.connections
    ? Object.values(profile.connections).filter((connection: unknown) => (connection as Record<string, unknown>)?.isActive).length
    : 0;
  const planDisplayLabel = hubProfile.planName ?? (profile?.isPremium ? 'NeuroAds IA Pro' : 'NeuroAds IA Pro');
  const financialPlanName = hubProfile.planName ?? planDisplayLabel;
  const financialPlanAmount = (hubProfile.planAmountCents ?? 0) > 0 ? `R$ ${((hubProfile.planAmountCents ?? 0) / 100).toFixed(2).replace('.', ',')}` : 'Grátis';
  const usageCount = profile?.usageStats ? Object.keys(profile.usageStats).length : 0;

  // Formatting helpers for trial
  const formatTrialRemaining = (ms?: number | null) => {
    if (!ms || ms <= 0) return 'Expirado';
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return `${days} dia${days === 1 ? '' : 's'}`;
  };
  const formatDateTime = (ts?: number | null) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('pt-BR');
  };
  
  const trialEndsAtLabel = formatDateTime(hubProfile.trialEndsAt);
  const trialRemainingLabel = formatTrialRemaining(hubProfile.trialRemainingMs);

  // Load Initial Data
  useEffect(() => {
    if (!user) return;
    const profileRecord = readRecord(profile) || {};
    const onboardingRecord = readRecord(profileRecord?.onboarding) || {};
    const profileDetailsRecord = readRecord(profileRecord?.profileDetails) || {};

    const fallbackCompanyForm = {
      companyName: readString(profileRecord?.companyName ?? profileRecord?.company ?? onboardingRecord?.companyName ?? onboardingRecord?.company),
      site: normalizeHttpsMaskedUrlInput(readString(profileRecord?.site ?? profileRecord?.website ?? onboardingRecord?.site ?? profileDetailsRecord?.site)),
      instagram: readString(profileRecord?.instagram ?? onboardingRecord?.instagram ?? profileDetailsRecord?.instagram),
      linkedin: readString(profileRecord?.linkedin ?? onboardingRecord?.linkedin ?? profileDetailsRecord?.linkedin),
      tiktok: '',
      blog: '',
    };
    
    let nextCompanyForm = {
      ...DEFAULT_COMPANY_FORM,
      ...fallbackCompanyForm,
      site: fallbackCompanyForm.site && !isHttpsPlaceholderOnly(fallbackCompanyForm.site) ? fallbackCompanyForm.site : HTTPS_PREFIX,
    };

    const companyKey = `neuroads_company_profile_${user.uid}`;
    const companyRaw = window.localStorage.getItem(companyKey);
    if (companyRaw) {
      try {
        const parsed = JSON.parse(companyRaw);
        nextCompanyForm = {
          companyName: nextCompanyForm.companyName || parsed.companyName || '',
          site: !isHttpsPlaceholderOnly(nextCompanyForm.site) ? nextCompanyForm.site : (parsed.site ? normalizeHttpsMaskedUrlInput(parsed.site) : HTTPS_PREFIX),
          instagram: nextCompanyForm.instagram || parsed.instagram || '',
          linkedin: nextCompanyForm.linkedin || parsed.linkedin || '',
          tiktok: parsed.tiktok || '',
          blog: parsed.blog || '',
        };
      } catch {}
    }
    setCompanyForm(nextCompanyForm);

    const fallbackWhatsapp = readString(profileRecord?.whatsapp ?? onboardingRecord?.whatsapp ?? profileDetailsRecord?.whatsapp);
    let nextWhatsapp = fallbackWhatsapp;
    const contactKey = `neuroads_profile_contact_${user.uid}`;
    const contactRaw = window.localStorage.getItem(contactKey);
    if (contactRaw) {
      try {
        const parsed = JSON.parse(contactRaw);
        nextWhatsapp = nextWhatsapp || parsed.whatsapp || fallbackWhatsapp;
      } catch {}
    }
    setWhatsApp(nextWhatsapp);
  }, [user, profile]);

  // Handlers
  const handleTabChange = (tab: string) => {
    router.replace(`/hub/configuracoes?tab=${tab}`, { scroll: false });
  };

  const handleSaveWhatsApp = async () => {
    if (!user) return;
    const normalizedWhatsapp = whatsApp.trim();
    const authenticatedEmail = userEmail;
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        whatsapp: normalizedWhatsapp,
        updatedAt: Date.now(),
        ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
        onboarding: { whatsapp: normalizedWhatsapp },
      }, { merge: true });
      const contactKey = `neuroads_profile_contact_${user.uid}`;
      window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: normalizedWhatsapp }));
      alert('WhatsApp atualizado com sucesso.');
    } catch (error) {
      console.warn('Falha ao salvar WhatsApp:', error);
      alert('Não foi possível salvar o WhatsApp.');
    }
  };

  const handleSaveCompany = async () => {
    if (!user) return;
    const normalizedSite = normalizeHttpsMaskedUrlInput(companyForm.site);
    const authenticatedEmail = userEmail;
    const payload = {
      companyName: companyForm.companyName.trim(),
      site: normalizedSite,
      instagram: companyForm.instagram.trim(),
      linkedin: companyForm.linkedin.trim(),
      tiktok: companyForm.tiktok.trim(),
      blog: companyForm.blog.trim(),
      updatedAt: Date.now(),
      ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
      onboarding: {
        companyName: companyForm.companyName.trim(),
        site: normalizedSite,
        instagram: companyForm.instagram.trim(),
        linkedin: companyForm.linkedin.trim(),
        tiktok: companyForm.tiktok.trim(),
        blog: companyForm.blog.trim(),
      },
    };

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, payload, { merge: true });
      const companyKey = `neuroads_company_profile_${user.uid}`;
      window.localStorage.setItem(companyKey, JSON.stringify({ ...companyForm, site: normalizedSite }));
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 2200);
    } catch (error) {
      console.warn('Falha ao salvar dados da empresa:', error);
      alert('Não foi possível salvar os dados da empresa.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || isDeletingAccount) return;
    const firstConfirmation = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação vai cancelar seu plano e remover seus dados do banco.');
    if (!firstConfirmation) return;
    const secondConfirmation = window.confirm('Confirmação final: esta ação é irreversível. Deseja continuar com a exclusão da conta?');
    if (!secondConfirmation) return;

    setDeleteAccountError(null);
    setIsDeletingAccount(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: userEmail }),
      });
      if (!response.ok) throw new Error('Não foi possível concluir a exclusão da conta.');
      
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Falha ao excluir conta:', error);
      setDeleteAccountError(error instanceof Error ? error.message : 'Falha na exclusão.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleManagePlan = async () => {
    if (!user || isManagingPlan) return;
    setIsManagingPlan(true);
    try {
      const token = await user.getIdToken();
      const returnUrl = `${window.location.origin}/hub/configuracoes?tab=financeiro`;
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl }),
      });
      const data = await response.json();
      if (!response.ok || !data?.url) throw new Error(data?.error || 'Não foi possível abrir o gerenciamento.');
      window.open(data.url, '_blank');
    } catch {
      alert('Não foi possível acessar o gerenciamento do plano agora.');
    } finally {
      setIsManagingPlan(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 border border-slate-300 text-slate-500">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#0f172a] leading-none">
              Configurações
            </h1>
            <p className="text-[11px] font-black text-slate-500 mt-1 uppercase tracking-widest">
              Gerencie seu perfil, detalhes institucionais e financeiro
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 px-1">
        {[
          { id: 'perfil', label: 'Meu Perfil' },
          { id: 'empresa', label: 'Sua Empresa' },
          { id: 'financeiro', label: 'Financeiro' },
          { id: 'conhecimento', label: 'Base de Conhecimento' }
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold border transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-[#eef2f7] text-[#FF6A00] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20'
                  : 'bg-[#eef2f7] border border-white/40 text-slate-600 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <User size={13} />
                <span className={SETTINGS_LABEL}>Nome</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{user.displayName || 'Não informado'}</p>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Mail size={13} />
                <span className={SETTINGS_LABEL}>E-mail</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">{user.email || 'Não informado'}</p>
            </div>
            <div className={`${SETTINGS_PANEL} sm:col-span-2`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Phone size={13} />
                <span className={SETTINGS_LABEL}>WhatsApp</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row relative">
                <input
                  value={whatsApp}
                  onChange={(e) => setWhatsApp(e.target.value)}
                  placeholder="(51) 98175-8382"
                  className={SETTINGS_INPUT}
                />
                <button type="button" onClick={handleSaveWhatsApp} className={SETTINGS_PRIMARY_BUTTON}>
                  Salvar
                </button>
              </div>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Crown size={13} />
                <span className={SETTINGS_LABEL}>Plano</span>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${hubProfile.isSubscriptionActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-[#FF6B00] border border-orange-100'}`}>
                {planDisplayLabel}
              </span>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Activity size={13} />
                <span className={SETTINGS_LABEL}>Plataformas conectadas</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{connectedPlatforms}</p>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Workflow size={13} />
                <span className={SETTINGS_LABEL}>Aplicações em uso</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{usageCount}</p>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Fingerprint size={13} />
                <span className={SETTINGS_LABEL}>ID do usuário</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 break-all bg-[#eef2f7] px-2 py-1 rounded border border-white/20 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">{user.uid}</p>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-3 sm:col-span-2 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]">
              <div className="flex items-center gap-1.5 text-rose-600">
                <ShieldAlert size={16} />
                <span className="text-xs uppercase tracking-wider font-black">Zona de risco</span>
              </div>
              <p className="text-xs text-rose-700/80 font-medium leading-relaxed">
                Ao excluir a conta, seu plano será cancelado imediatamente e o cadastro será removido do banco de dados de forma definitiva.
              </p>
              <button onClick={handleDeleteAccount} disabled={isDeletingAccount} className="inline-flex items-center justify-center gap-2 px-5 h-[42px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase transition-all shadow-[0_4px_12px_rgba(225,29,72,0.25)] hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer">
                <Trash2 size={13} />
                {isDeletingAccount ? 'Excluindo...' : 'Excluir conta'}
              </button>
              {deleteAccountError && <p className="text-xs font-semibold text-rose-600 mt-1">{deleteAccountError}</p>}
            </div>
          </div>
        )}

        {activeTab === 'empresa' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-6 rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Building2 size={13} />
                <span className={SETTINGS_LABEL}>Nome da Empresa</span>
              </label>
              <input
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                className={SETTINGS_INPUT}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Globe size={13} />
                <span className={SETTINGS_LABEL}>Site</span>
              </label>
              <input
                value={companyForm.site}
                onChange={(e) => setCompanyForm(prev => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))}
                onBlur={(e) => setCompanyForm(prev => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))}
                className={SETTINGS_INPUT}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Globe size={13} />
                <span className={SETTINGS_LABEL}>Instagram</span>
              </label>
              <input
                value={companyForm.instagram}
                onChange={(e) => setCompanyForm(prev => ({ ...prev, instagram: e.target.value }))}
                className={SETTINGS_INPUT}
                placeholder="@perfil"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Globe size={13} />
                <span className={SETTINGS_LABEL}>LinkedIn</span>
              </label>
              <input
                value={companyForm.linkedin}
                onChange={(e) => setCompanyForm(prev => ({ ...prev, linkedin: e.target.value }))}
                className={SETTINGS_INPUT}
                placeholder="linkedin.com/company/..."
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Globe size={13} />
                <span className={SETTINGS_LABEL}>TikTok</span>
              </label>
              <input
                value={companyForm.tiktok}
                onChange={(e) => setCompanyForm(prev => ({ ...prev, tiktok: e.target.value }))}
                className={SETTINGS_INPUT}
                placeholder="tiktok.com/@perfil"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Globe size={13} />
                <span className={SETTINGS_LABEL}>Blog</span>
              </label>
              <input
                value={companyForm.blog}
                onChange={(e) => setCompanyForm(prev => ({ ...prev, blog: e.target.value }))}
                className={SETTINGS_INPUT}
                placeholder="blog.seudominio.com"
              />
            </div>
             <div className="sm:col-span-2 pt-4 flex items-center justify-between border-t border-slate-200 mt-2">
              <p className={`text-xs font-bold ${companySaved ? 'text-emerald-600' : 'text-slate-500'}`}>
                {companySaved ? '✓ Dados salvos com sucesso.' : 'Preencha os dados da empresa.'}
              </p>
              <button type="button" onClick={handleSaveCompany} className={SETTINGS_PRIMARY_BUTTON}>
                Salvar
              </button>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-6 rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Crown size={13} />
                <span className={SETTINGS_LABEL}>Plano atual</span>
              </div>
              <p className="text-sm font-black text-[#0f172a]">{financialPlanName}</p>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <DollarSign size={13} />
                <span className={SETTINGS_LABEL}>Valor mensal</span>
              </div>
              <p className="text-sm font-black text-[#0f172a]">{financialPlanAmount}</p>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Activity size={13} />
                <span className={SETTINGS_LABEL}>Status da assinatura</span>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] ${hubProfile.isSubscriptionActive ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-orange-50 text-[#FF6B00] border border-orange-100'}`}>
                {hubProfile.statusLabel}
              </span>
            </div>
            <div className={SETTINGS_PANEL}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ShieldCheck size={13} />
                <span className={SETTINGS_LABEL}>Acesso operacional</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{hubProfile.accessLabel}</p>
            </div>
            <div className={`${SETTINGS_PANEL} sm:col-span-2`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Workflow size={13} />
                <span className={SETTINGS_LABEL}>Recursos incluídos</span>
              </div>
              <p className="text-sm font-bold text-slate-700">{hubProfile.operationLabel}</p>
              {hubProfile.includedExecutions != null && (
                <div className="mt-3 flex items-center gap-2 bg-[#eef2f7] border border-white/20 rounded-lg p-2.5 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  <Gauge size={14} className="text-slate-400" />
                  <p className="text-xs font-semibold text-slate-600">
                    Execuções inclusas por mês: <span className="font-bold text-[#0f172a]">{hubProfile.includedExecutions.toLocaleString('pt-BR')}</span>
                  </p>
                </div>
              )}
            </div>
            {hubProfile.isTrialing && (hubProfile.trialRemainingMs ?? 0) > 0 ? (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-2.5 sm:col-span-2 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]">
                <div className="flex items-center gap-1.5 text-[#FF6B00]">
                  <Calendar size={16} />
                  <span className="text-xs uppercase tracking-wider font-black">Período gratuito ativo</span>
                </div>
                <p className="text-base font-black text-slate-800">{trialRemainingLabel}</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Sua primeira cobrança no valor de <span className="font-bold text-slate-800">{financialPlanAmount}</span> está prevista para: <span className="font-bold text-slate-700 bg-[#eef2f7] px-2 py-0.5 rounded border border-white/20 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">{trialEndsAtLabel}</span>.
                </p>
              </div>
            ) : null}
            <div className="sm:col-span-2 pt-2">
              <button onClick={handleManagePlan} disabled={isManagingPlan} className={SETTINGS_PRIMARY_BUTTON}>
                <CreditCard size={14} />
                {isManagingPlan ? 'Abrindo...' : 'Gerenciar Plano'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'conhecimento' && (
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-black text-slate-800">Base de Conhecimento</h2>
              <p className="text-xs text-slate-500 mt-0.5">Todos os relatórios gerados pelos Agentes e conversas com o Lucca, organizados por categoria.</p>
            </div>
            <Suspense fallback={
              <div className="flex items-center justify-center h-48">
                <div className="w-6 h-6 rounded-full border-2 border-[#FF6B00]/30 border-t-[#FF6B00] animate-spin" />
              </div>
            }>
              <KnowledgeExplorer />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
