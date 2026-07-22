'use client';

import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const KnowledgeExplorer = lazy(() => import('./KnowledgeExplorer'));
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Crown, Activity, Workflow, Fingerprint,
  ShieldAlert, Trash2, Building2, Globe, CreditCard, DollarSign,
  ShieldCheck, Calendar, Gauge, ChevronRight
} from 'lucide-react';
import { IconUserBadge3D, IconGear3D, IconBook3D } from './HubUiIcons3D';
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
const SETTINGS_PANEL = "hub-neu-card p-5 !bg-white";
const SETTINGS_INPUT = "w-full h-[46px] rounded-xl border border-white/30 bg-[#eef2f7] px-4 text-sm font-semibold text-slate-800 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-colors focus:border-[#FF6A00] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6A00]/10 placeholder:text-slate-400 placeholder:font-medium";
const SETTINGS_PRIMARY_BUTTON = "inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-6 text-xs font-black uppercase tracking-widest text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] transition-all hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50";

export default function SettingsHubPage() {
  const { user, profile, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const activeTab = searchParams.get('tab') || 'perfil';

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
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
    setDisplayName((current) => current || user.displayName || readString(profileRecord?.displayName ?? profileRecord?.name));
  }, [user, profile]);

  // Handlers
  const handleTabChange = (tab: string) => {
    router.replace(`/hub/configuracoes?tab=${tab}`, { scroll: false });
  };

  const handleSaveName = async () => {
    if (!user) return;
    const normalizedName = displayName.trim();
    if (!normalizedName) {
      alert('Informe um nome válido.');
      return;
    }
    try {
      // Atualiza o displayName no Firebase Auth e replica no Firestore.
      await updateProfile(user, { displayName: normalizedName });
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid), {
        displayName: normalizedName,
        name: normalizedName,
        updatedAt: Date.now(),
      }, { merge: true });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2200);
    } catch (error) {
      console.warn('Falha ao salvar nome:', error);
      alert('Não foi possível salvar o nome.');
    }
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

  const handleSaveProfile = async () => {
    if (!user) return;
    const normalizedName = displayName.trim();
    if (!normalizedName) {
      alert('Informe um nome válido.');
      return;
    }
    const normalizedWhatsapp = whatsApp.trim();
    const authenticatedEmail = userEmail;
    try {
      // 1. Save Name
      await updateProfile(user, { displayName: normalizedName });
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: normalizedName,
        name: normalizedName,
        whatsapp: normalizedWhatsapp,
        updatedAt: Date.now(),
        ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
        onboarding: { whatsapp: normalizedWhatsapp },
      }, { merge: true });

      const contactKey = `neuroads_profile_contact_${user.uid}`;
      window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: normalizedWhatsapp }));

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2200);
    } catch (error) {
      console.warn('Falha ao salvar perfil:', error);
      alert('Não foi possível salvar os dados do perfil.');
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
    const firstConfirmation = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação vai cancelar seu plano e remover permanentemente todos os seus dados, documentos e relatórios.');
    if (!firstConfirmation) return;
    const secondConfirmation = window.confirm('Confirmação final: esta ação é irreversível e excluirá definitivamente todo o seu cadastro. Deseja prosseguir com a exclusão?');
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
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Não foi possível concluir a exclusão da conta.');
      }
      
      try {
        window.localStorage.clear();
      } catch {}

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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            {activeTab === 'conhecimento' ? <IconBook3D size={32} /> : <IconGear3D size={32} />}
            {activeTab === 'conhecimento' ? 'Base de Conhecimento' : 'Configurações'}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            {activeTab === 'conhecimento'
              ? 'Documentos e ativos da sua marca que alimentam com contexto as decisões dos Agentes IA.'
              : 'Gerencie seu perfil, detalhes institucionais, plano e preferências da sua conta.'}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-1.5 rounded-2xl border border-slate-800/80 shadow-[0_4px_14px_rgba(15,23,42,0.18)] flex-wrap w-full sm:w-auto">
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
              className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all duration-200 cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white shadow-[0_2px_8px_rgba(255,106,0,0.35)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              style={{ border: 'none' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-6 rounded-3xl border border-slate-200 bg-white shadow-[5px_5px_10px_#dfe5ee,_-5px_-5px_10px_#ffffff]">
              {/* Nome */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <User size={13} />
                  <span className={SETTINGS_LABEL}>Nome Completo</span>
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome completo"
                  className={SETTINGS_INPUT}
                />
              </div>

              {/* WhatsApp */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <Phone size={13} />
                  <span className={SETTINGS_LABEL}>WhatsApp</span>
                </label>
                <input
                  value={whatsApp}
                  onChange={(e) => setWhatsApp(e.target.value)}
                  placeholder="(51) 98175-8382"
                  className={SETTINGS_INPUT}
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <Mail size={13} />
                  <span className={SETTINGS_LABEL}>E-mail</span>
                </label>
                <input
                  disabled
                  value={user?.email || ''}
                  className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
                />
              </div>

              {/* Plano */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <Crown size={13} />
                  <span className={SETTINGS_LABEL}>Plano</span>
                </label>
                <input
                  disabled
                  value={planDisplayLabel}
                  className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed font-black text-[#FF6B00]`}
                />
              </div>

              {/* Plataformas Conectadas */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <Activity size={13} />
                  <span className={SETTINGS_LABEL}>Plataformas conectadas</span>
                </label>
                <input
                  disabled
                  value={connectedPlatforms}
                  className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
                />
              </div>

              {/* Aplicações em Uso */}
              <div>
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <Workflow size={13} />
                  <span className={SETTINGS_LABEL}>Aplicações em uso</span>
                </label>
                <input
                  disabled
                  value={usageCount}
                  className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
                />
              </div>

              {/* ID do Usuário */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                  <Fingerprint size={13} />
                  <span className={SETTINGS_LABEL}>ID do usuário</span>
                </label>
                <input
                  disabled
                  value={user?.uid || ''}
                  className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed font-mono`}
                />
              </div>

              {/* Save Bar */}
              <div className="sm:col-span-2 pt-4 flex items-center justify-between border-t border-slate-200 mt-2">
                <p className={`text-xs font-bold ${profileSaved ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {profileSaved ? '✓ Dados salvos com sucesso.' : 'Preencha os dados do perfil.'}
                </p>
                <button type="button" onClick={handleSaveProfile} className={SETTINGS_PRIMARY_BUTTON}>
                  Salvar
                </button>
              </div>
            </div>

            {/* Zona de Risco */}
            <div className="rounded-3xl border border-rose-200 bg-white p-6 space-y-3 shadow-[5px_5px_10px_#dfe5ee,_-5px_-5px_10px_#ffffff]">
              <div className="flex items-center gap-1.5 text-rose-600">
                <ShieldAlert size={16} />
                <span className="text-xs uppercase tracking-wider font-black">Zona de risco</span>
              </div>
              <p className="text-xs text-rose-700/80 font-semibold leading-relaxed">
                Ao excluir a conta, seu plano será cancelado imediatamente e o cadastro será removido do banco de dados de forma definitiva.
              </p>
              <button onClick={handleDeleteAccount} disabled={isDeletingAccount} className="inline-flex items-center justify-center gap-2 px-5 h-[42px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase transition-all shadow-[0_4px_12_rgba(225,29,72,0.25)] hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer">
                <Trash2 size={13} />
                {isDeletingAccount ? 'Excluindo...' : 'Excluir conta'}
              </button>
              {deleteAccountError && <p className="text-xs font-semibold text-rose-600 mt-1">{deleteAccountError}</p>}
            </div>
          </div>
        )}

        {activeTab === 'empresa' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-6 rounded-3xl border border-slate-200 bg-white shadow-[5px_5px_10px_#dfe5ee,_-5px_-5px_10px_#ffffff]">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-6 rounded-3xl border border-slate-200 bg-white shadow-[5px_5px_10px_#dfe5ee,_-5px_-5px_10px_#ffffff]">
            {/* Plano Atual */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Crown size={13} />
                <span className={SETTINGS_LABEL}>Plano Atual</span>
              </label>
              <input
                disabled
                value={financialPlanName}
                className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed font-black text-[#FF6B00]`}
              />
            </div>

            {/* Valor Mensal */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <DollarSign size={13} />
                <span className={SETTINGS_LABEL}>Valor Mensal</span>
              </label>
              <input
                disabled
                value={financialPlanAmount}
                className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
              />
            </div>

            {/* Status da Assinatura */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Activity size={13} />
                <span className={SETTINGS_LABEL}>Status da Assinatura</span>
              </label>
              <input
                disabled
                value={hubProfile.statusLabel}
                className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
              />
            </div>

            {/* Acesso Operacional */}
            <div>
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <ShieldCheck size={13} />
                <span className={SETTINGS_LABEL}>Acesso Operacional</span>
              </label>
              <input
                disabled
                value={hubProfile.accessLabel}
                className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
              />
            </div>

            {/* Recursos Incluídos */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                <Workflow size={13} />
                <span className={SETTINGS_LABEL}>Recursos Incluídos</span>
              </label>
              <input
                disabled
                value={hubProfile.operationLabel}
                className={`${SETTINGS_INPUT} opacity-60 cursor-not-allowed`}
              />
              {hubProfile.includedExecutions != null && (
                <p className="text-[11px] text-slate-500 font-semibold mt-1.5 ml-1">
                  Execuções inclusas por mês: <span className="font-bold text-slate-700">{hubProfile.includedExecutions.toLocaleString('pt-BR')}</span>
                </p>
              )}
            </div>

            {/* Trial Info */}
            {hubProfile.isTrialing && (hubProfile.trialRemainingMs ?? 0) > 0 ? (
              <div className="rounded-3xl border border-orange-200 bg-orange-50/50 p-5 space-y-2 sm:col-span-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-[#FF6B00]">
                  <Calendar size={16} />
                  <span className="text-xs uppercase tracking-wider font-black">Período gratuito ativo</span>
                </div>
                <p className="text-base font-black text-slate-800">{trialRemainingLabel}</p>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Sua primeira cobrança no valor de <span className="font-bold text-slate-800">{financialPlanAmount}</span> está prevista para: <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">{trialEndsAtLabel}</span>.
                </p>
              </div>
            ) : null}

            {/* Action Footer */}
            <div className="sm:col-span-2 pt-4 flex items-center justify-between border-t border-slate-200 mt-2">
              <p className="text-xs font-semibold text-slate-500">
                Acesse a área de faturamento do Stripe para baixar notas fiscais ou gerenciar pagamentos.
              </p>
              <button type="button" onClick={handleManagePlan} disabled={isManagingPlan} className={SETTINGS_PRIMARY_BUTTON}>
                <CreditCard size={14} className="mr-1" />
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
