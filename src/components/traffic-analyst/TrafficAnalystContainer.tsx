'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Target,
  Globe,
  Camera,
  Play,
  FileText,
  Mail,
  Share2,
  BrainCircuit,
  BarChart3,
  Layers,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { TrafficData } from '../../lib/prompt-master';
import { analyzeTraffic } from '../../app/actions/ai-analysis';
import { useAuth } from '../../context/AuthContext';
import AuthOverlay from '../auth/AuthOverlay';
import { Clock, Key } from 'lucide-react';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '../../lib/firebase';
import { syncTrafficData } from '../../app/actions/traffic-sync';
import { saveConnection, removeConnection } from '../../app/actions/ad-accounts';
import { scheduleAutomation, saveToHistory } from '../../app/actions/automations';
import { sendDiagnosisEmailAction } from '../../app/actions/mail';
import Link from 'next/link';

import { Calendar, History } from 'lucide-react';



type Step = 'channel' | 'objective' | 'data' | 'insights' | 'generating' | 'report';

export type ActiveAppConfig = {
  title: string;
  description: string;
  status: string;
};

interface AdAccount {
  id: string;
  name: string;
  isManager: boolean;
  loginCustomerId?: string;
}

type FirebaseAuthError = Error & { code?: string };

export default function TrafficAnalystContainer({ activeApp }: { activeApp?: ActiveAppConfig | null }) {
  const [step, setStep] = useState<Step>('channel');
  const [data, setData] = useState<TrafficData>({
    plataforma: '',
    objetivo: '',
    investimento: '',
    impressoes: '',
    cliques: '',
    ctr: '',
    cpc: '',
    conversoes: '',
    cpa: '',
    roas: '',
    produto: '',
    ticket: '',
    publico: '',
    criativo: '',
    dificuldade: ''
  });
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, checkUsageLimit } = useAuth();
  const [limitError, setLimitError] = useState<string | null>(null);
  const [adAccountEmail, setAdAccountEmail] = useState('');
  const [showIdInput, setShowIdInput] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<AdAccount[]>([]);
  const [isSelectingAccount, setIsSelectingAccount] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [loginCustomerId, setLoginCustomerId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState('Semanal');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  
  // Load saved connection for Max plan
  useEffect(() => {
    if (profile?.isPremium && profile.connections && data.plataforma) {
      const platformKey = data.plataforma.toLowerCase().replace(' ', '_');
      const connection = profile.connections[platformKey];
      if (connection && connection.isActive) {
        setConnectedAccountId(connection.accountId);
        setAccessToken(connection.accessToken);
        setLoginCustomerId(connection.loginCustomerId || null);
      } else {
        setConnectedAccountId(null);
        setAccessToken('');
        setLoginCustomerId(null);
      }
    }
  }, [profile, data.plataforma]);

  // Step 1: Read token from URL on mount and persist to sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gadsToken = params.get('google_ads_token');
    const gadsError = params.get('google_ads_error');

    if (gadsError) {
      const messages: Record<string, string> = {
        missing_credentials: 'Credenciais OAuth não configuradas no servidor. Contacte o suporte.',
        token_exchange_failed: 'Falha ao trocar o código de autorização. Tente novamente.',
        callback_error: 'Erro inesperado no callback OAuth.',
        authorization_failed: 'Autorização negada pelo usuário.',
      };
      sessionStorage.setItem('gads_error', messages[gadsError] || `Erro OAuth: ${gadsError}`);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (gadsToken) {
      // Persist token to sessionStorage BEFORE cleaning URL
      sessionStorage.setItem('gads_pending_token', gadsToken);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Step 2: When activeApp becomes available, process any pending token
  useEffect(() => {
    if (!activeApp) return;

    // Handle pending error
    const pendingError = sessionStorage.getItem('gads_error');
    if (pendingError) {
      setError(pendingError);
      sessionStorage.removeItem('gads_error');
      return;
    }

    // Handle pending token
    const pendingToken = sessionStorage.getItem('gads_pending_token');
    if (!pendingToken) return;

    sessionStorage.removeItem('gads_pending_token');
    setAccessToken(pendingToken);
    setIsSyncing(true);
    setError(null);

    fetch(`/api/google-ads/accounts?access_token=${encodeURIComponent(pendingToken)}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        const seeds: string[] = (json.resourceNames || []).map((name: string) =>
          name.replace('customers/', '')
        );
        if (seeds.length === 0) {
          setError('Nenhuma conta do Google Ads encontrada para este e-mail.');
          return;
        }
        setAvailableAccounts(seeds.map(id => ({ id, name: id, isManager: false })));
        setIsSelectingAccount(true);
      })
      .catch(err => {
        setError(err.message || 'Erro ao listar contas do Google Ads.');
      })
      .finally(() => setIsSyncing(false));
  }, [activeApp]);



  if (!activeApp) return null;

  const updateData = (field: keyof TrafficData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    if (!data.plataforma) return;
    
    setError(null);

    if (data.plataforma === 'Google Ads') {
      // Use proper OAuth 2.0 Authorization Code flow via server-side route
      // This avoids Firebase token scope issues and CORS problems
      window.location.href = '/api/auth/google-ads/start';
      return;
    }

    setIsSyncing(true);
    
    try {
      let token = '';

      if (data.plataforma === 'Meta Ads') {
        const auth = getFirebaseAuth();
        const provider = new FacebookAuthProvider();
        provider.addScope('ads_read');
        provider.addScope('read_insights');
        const result = await signInWithPopup(auth, provider);
        const credential = FacebookAuthProvider.credentialFromResult(result);
        token = credential?.accessToken || '';
        if (token) {
          setAccessToken(token);
          setShowIdInput(true);
        }
      } else if (data.plataforma === 'TikTok Ads') {
        token = prompt('Insira seu Access Token do TikTok For Business (Modo Desenvolvedor)') || '';
        if (token) {
          setAccessToken(token);
          setShowIdInput(true);
        }
      }

      if (!token) {
        throw new Error('Não foi possível obter a credencial de acesso.');
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'Erro durante a conexão.';
      const authError = err as FirebaseAuthError;
      if (authError.code === 'auth/account-exists-with-different-credential') {
        message = 'Este e-mail já está associado a outra conta. Por favor, use o mesmo método de login anterior.';
      } else if (authError.message) {
        message = authError.message;
      }
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSelectAccount = async (account: AdAccount | string) => {
    const accId = typeof account === 'string' ? account : account.id;
    const loginId = typeof account === 'object' ? account.loginCustomerId ?? null : null;

    setConnectedAccountId(accId);
    setLoginCustomerId(loginId);
    setIsSelectingAccount(false);
    
    if (profile?.isPremium && user) {
      await saveConnection(user.uid, data.plataforma as string, accId, accessToken, loginId ?? undefined);
    }

    // Trigger initial sync automatically after connection
    await executeSync(accId, accessToken, loginId ?? undefined);
  };

  const executeSync = async (accountId: string, manualToken?: string, manualLoginId?: string) => {
    const tokenToUse = manualToken || accessToken;
    const loginIdToUse = manualLoginId !== undefined ? manualLoginId : loginCustomerId;

    if (!tokenToUse) {
      setError('Token de acesso não encontrado. Por favor, conecte novamente.');
      return;
    }

    setIsSyncing(true);
    setSyncSuccess(false);
    setError(null);

    try {
      const syncResult = await syncTrafficData(
        data.plataforma as string, 
        tokenToUse, 
        accountId, 
        loginIdToUse || undefined
      );
      
      if (syncResult.success && syncResult.data) {
        setData(prev => ({ ...prev, ...syncResult.data }));
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      } else {
        throw new Error(syncResult.error || 'Erro ao sincronizar dados.');
      }
    } catch (err: unknown) {
      console.error('Sync error:', err);
      const message = err instanceof Error ? err.message : 'Erro desconhecido ao sincronizar.';
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (profile?.isPremium && user) {
      await removeConnection(user.uid, data.plataforma as string);
    }
    setConnectedAccountId(null);
    setLoginCustomerId(null);
    setAccessToken('');
    setAvailableAccounts([]);
    setShowIdInput(false);
    setIsSelectingAccount(false);
  };


  const nextStep = (next: Step) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setStep(next);
  };

  // Animations
  const fadeSlide = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.8 } },
    exit: { opacity: 0, x: -20 },
  };

  const titleParts = activeApp.title.split(' ');
  const lastWord = titleParts.pop();
  const restTitle = titleParts.join(' ');

  return (
    <section id="analista" className="py-24 bg-black relative">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight uppercase">
            {restTitle ? `${restTitle} ` : ''}
            <span className="text-[var(--color-brand-orange)]">{lastWord}</span>
          </h2>
          <p className="text-slate-500 font-mono text-xs md:text-sm tracking-[0.15em] [word-spacing:0.3em] uppercase max-w-2xl mx-auto">
            {activeApp.description}
          </p>
        </div>

        {/* App Framework */}
        <div className="glass-card min-h-[500px] rounded-none border-white/5 relative overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-green)]"
              initial={{ width: '0%' }}
              animate={{ 
                width: 
                  step === 'channel' ? '20%' : 
                  step === 'objective' ? '40%' : 
                  step === 'data' ? '60%' : 
                  step === 'insights' ? '80%' : 
                  step === 'generating' ? '95%' : '100%' 
              }}
            />
          </div>

          <div className="p-8 md:p-12 flex-grow">
            <AnimatePresence mode="wait">
              {/* Step 1: Channel */}
              {step === 'channel' && (
                <motion.div key="channel" {...fadeSlide} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Layers className="text-[var(--color-brand-orange)]" />
                      1. Selecione o Canal de Tráfego
                    </h3>
                    <p className="text-slate-400">Onde sua campanha está rodando atualmente?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'Google Ads', icon: Globe, color: 'text-blue-400' },
                      { id: 'Meta Ads', icon: Camera, color: 'text-pink-400' },
                      { id: 'TikTok Ads', icon: Play, color: 'text-white' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          updateData('plataforma', item.id);
                          nextStep('objective');
                        }}
                        className={`p-6 border ${data.plataforma === item.id ? 'border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'border-white/10 bg-white/5'} hover:border-[var(--color-brand-orange)] transition-all flex flex-col items-center gap-4 group`}
                      >
                        <item.icon size={32} className={`${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="font-bold tracking-tight">{item.id}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Objective */}
              {step === 'objective' && (
                <motion.div key="objective" {...fadeSlide} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Target className="text-[var(--color-brand-orange)]" />
                      2. Qual o Objetivo Principal?
                    </h3>
                    <p className="text-slate-400">Isso determina as métricas de sucesso da análise IA.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {['Leads', 'Vendas', 'Tráfego', 'Branding'].map((obj) => (
                      <button
                        key={obj}
                        onClick={() => {
                          updateData('objetivo', obj);
                          nextStep('data');
                        }}
                        className={`p-6 border ${data.objetivo === obj ? 'border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5' : 'border-white/10 bg-white/5'} hover:border-[var(--color-brand-orange)] transition-all font-bold text-lg`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => nextStep('channel')} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono uppercase tracking-widest mt-4">
                    <ChevronLeft size={16} /> Voltar
                  </button>
                </motion.div>
              )}

              {/* Step 3: Data Input */}
              {step === 'data' && (
                <motion.div key="data" {...fadeSlide} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <BarChart3 className="text-[var(--color-brand-orange)]" />
                      3. Input de Métricas Principais
                    </h3>
                    <p className="text-slate-400">Insira manualmente ou sincronize com o canal.</p>
                  </div>
                  
                  {/* Neural Sync Module */}
                   <div className="relative group/sync mb-8">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-green)] opacity-10 group-hover/sync:opacity-20 transition duration-500 blur"></div>
                    <div className="relative glass-card border-dashed border-white/10 p-6 flex flex-col items-center justify-between gap-6 overflow-hidden">
                       <div className="flex flex-col w-full flex-grow">
                          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">AUTOMAÇÃO EM TEMPO REAL</span>
                          <h4 className="text-sm font-bold tracking-tight">
                            {connectedAccountId ? `CONECTADO: ${connectedAccountId}` : `VINCULAR CONTA ${data.plataforma ? data.plataforma.toUpperCase() : 'DE TRÁFEGO'}`}
                          </h4>
                                         {isSelectingAccount && (
                             <div className="mt-4 space-y-2">
                               <label className="text-[10px] font-mono text-slate-500 uppercase">Selecione a conta de anúncios:</label>
                               <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                                 {availableAccounts.map(acc => (
                                   <button 
                                     key={acc.id}
                                     onClick={() => handleSelectAccount(acc)}
                                     className="text-left p-3 bg-white/5 border border-white/10 hover:border-[var(--color-brand-orange)] text-[10px] font-mono transition-colors flex justify-between items-center group"
                                   >
                                     <span className="truncate mr-2 border-b border-transparent group-hover:border-[var(--color-brand-orange)]">{acc.name || acc.id}</span>
                                     <span className="text-[8px] text-slate-600 shrink-0 font-bold uppercase">{acc.isManager ? 'Manager' : 'Client'}</span>
                                   </button>
                                 ))}
                               </div>
                               <button onClick={() => setIsSelectingAccount(false)} className="text-[10px] text-slate-500 mt-2 underline">Cancelar</button>
                             </div>
                          )}

                          {showIdInput && !connectedAccountId && (
                            <div className="mt-4 flex items-center bg-white/5 border border-white/10 p-2 pl-4 focus-within:border-[var(--color-brand-orange)] transition-colors">
                              <Key size={14} className="text-slate-500" />
                                <input 
                                  type="text"
                                  value={adAccountEmail}
                                  onChange={(e) => setAdAccountEmail(e.target.value)}
                                  onBlur={() => adAccountEmail && handleSelectAccount(adAccountEmail)}
                                  placeholder={`Account ID ou E-mail do ${data.plataforma} (Ex: act_12345)`}
                                  className="w-full bg-transparent border-none text-xs font-mono focus:outline-none focus:ring-0 ml-3 text-white placeholder:text-slate-600"
                                />
                            </div>
                          )}
                          
                          {error && step === 'data' && (
                             <p className="mt-2 text-red-400 text-xs font-mono">{error}</p>
                          )}
                       </div>
                       
                       <div className="flex gap-4 w-full md:w-auto">
                        {connectedAccountId ? (
                          <>
                            <button 
                              onClick={() => executeSync(connectedAccountId)}
                              disabled={isSyncing}
                              className="px-6 py-3 bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/30 text-[var(--color-brand-green)] font-bold text-xs tracking-widest hover:bg-[var(--color-brand-green)]/20 transition-all flex items-center justify-center gap-3 w-full md:w-auto"
                            >
                              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                              ATUALIZAR DADOS
                            </button>
                            <button 
                              onClick={handleDisconnect}
                              className="px-6 py-3 border border-red-500/20 text-red-500/50 hover:text-red-500 hover:border-red-500/50 font-bold text-xs tracking-widest transition-all"
                            >
                              DESVINCULAR
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={handleConnect}
                            disabled={isSyncing}
                            className={`px-6 py-3 border border-white/20 font-bold text-xs tracking-widest hover:border-[var(--color-brand-orange)] hover:text-[var(--color-brand-orange)] transition-all flex items-center justify-center gap-3 w-full md:w-auto whitespace-nowrap ${isSyncing ? 'animate-pulse opacity-50 cursor-wait' : ''}`}
                          >
                            {isSyncing ? (
                              <> <RefreshCw size={14} className="animate-spin" /> AUTENTICANDO CONTA... </>
                            ) : syncSuccess ? (
                              <> <CheckCircle2 size={14} className="text-[var(--color-brand-green)]" /> CONECTADO_OK </>
                            ) : (
                              <> <Key size={14} /> CONECTAR CANAL </>
                            )}
                          </button>
                        )}
                       </div>
                    </div>
                  </div>

                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Investimento Total (R$)" value={data.investimento} onChange={(v) => updateData('investimento', v)} placeholder="Ex: 5000" />
                    <InputField label="Impressões" value={data.impressoes} onChange={(v) => updateData('impressoes', v)} placeholder="Ex: 100000" />
                    <InputField label="Cliques" value={data.cliques} onChange={(v) => updateData('cliques', v)} placeholder="Ex: 1540" />
                    <InputField label="Conversões" value={data.conversoes} onChange={(v) => updateData('conversoes', v)} placeholder="Ex: 45" />
                    <InputField label="CPA (R$)" value={data.cpa} onChange={(v) => updateData('cpa', v)} placeholder="Ex: 110" />
                    <InputField label="ROAS" value={data.roas} onChange={(v) => updateData('roas', v)} placeholder="Ex: 3.5" />
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <button onClick={() => nextStep('objective')} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono uppercase tracking-widest">
                      <ChevronLeft size={16} /> Voltar
                    </button>
                    <button 
                      onClick={() => nextStep('insights')} 
                      className="px-8 py-3 bg-white text-black font-bold flex items-center gap-2 hover:bg-[var(--color-brand-orange)] transition-colors"
                    >
                      CONTINUAR PARA INSIGHTS <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Insights Questions */}
              {step === 'insights' && (
                <motion.div key="insights" {...fadeSlide} className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <BrainCircuit className="text-[var(--color-brand-orange)]" />
                      4. Perguntas Inteligentes (Diferencial)
                    </h3>
                    <p className="text-slate-400">Contexto é mais importante que números. Explique seu negócio.</p>
                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono">
                        ⚠️ ERROR: {error}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <TextAreaField label="Qual o Produto/Serviço?" value={data.produto} onChange={(v) => updateData('produto', v)} placeholder="Ex: Mentoria de Negócios High Ticket" />
                    <TextAreaField label="Público-alvo e Criativo (Descreva)" value={data.publico} onChange={(v) => updateData('publico', v)} placeholder="Ex: Empresários de 30-50 anos interessados em escala." />
                    <TextAreaField label="Qual sua maior dificuldade hoje?" value={data.dificuldade} onChange={(v) => updateData('dificuldade', v)} placeholder="Ex: CPA subindo e qualidade dos leads caindo." />
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <button onClick={() => nextStep('data')} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm font-mono uppercase tracking-widest">
                      <ChevronLeft size={16} /> Voltar
                    </button>
                    <button 
                      onClick={async () => {
                        const canAccess = await checkUsageLimit('traffic-analyst');
                        if (!canAccess) {
                          setLimitError('Você atingiu o limite de 01 diagnóstico por semana na versão Freemium.');
                          return;
                        }

                        setStep('generating');
                        setError(null);
                        setLimitError(null);
                        const result = await analyzeTraffic(data);
                        if (result.success && result.diagnosis) {
                          setDiagnosis(result.diagnosis);
                          setStep('report');
                          
                          // Save to history if logged in
                          if (user) {
                            await saveToHistory(user.uid, {
                              plataforma: data.plataforma,
                              objetivo: data.objetivo,
                              diagnosis: result.diagnosis,
                              metrics: {
                                investimento: data.investimento,
                                conversoes: data.conversoes,
                                roas: data.roas
                              }
                            });

                            // NEW: Send email for Max users
                            if (profile?.isPremium && user.email) {
                              await sendDiagnosisEmailAction(
                                user.email,
                                user.displayName || 'Usuário',
                                data.plataforma as string,
                                result.diagnosis
                              );
                            }
                          }
                        } else {
                          setError(result.error || 'Erro desconhecido');
                          setStep('insights');
                        }
                      }} 
                      className="px-8 py-3 bg-[var(--color-brand-orange)] text-black font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(249,166,32,0.4)] transition-all"
                    >
                      GERAR DIAGNÓSTICO FINAL <ZapIcon size={18} className="fill-current" />
                    </button>
                  </div>
                  {limitError && (
                    <div className="mt-4 p-4 border border-[var(--color-brand-orange)] bg-[var(--color-brand-orange)]/5 text-[var(--color-brand-orange)] text-xs font-bold text-center">
                      UPGRADE NECESSÁRIO: {limitError}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'generating' && (
                <motion.div key="generating" {...fadeSlide} className="flex flex-col items-center justify-center py-20 space-y-8 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-[var(--color-brand-orange)]/30 rounded-full animate-ping absolute inset-0" />
                    <div className="w-24 h-24 border-t-2 border-t-[var(--color-brand-orange)] rounded-full animate-spin" />
                    <BrainCircuit size={48} className="absolute inset-0 m-auto text-[var(--color-brand-orange)]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">PROCESSANDO DADOS...</h3>
                    <p className="text-slate-500 font-mono text-sm">RODANDO LÓGICA DE PERFORMANCE NEUROADS v4.0</p>
                  </div>
                  <div className="w-full max-w-xs space-y-2">
                    <LoadingBar label="Analisando Médricas" delay={0} />
                    <LoadingBar label="Identificando Gargalos" delay={1} />
                    <LoadingBar label="Gerando Plano de Ação" delay={2} />
                  </div>
                </motion.div>
              )}

              {/* Step 6: Report (Mock for now) */}
              {step === 'report' && (
                <motion.div key="report" {...fadeSlide} className="space-y-8">
                  <div className="flex justify-between items-start">
                     <div className="space-y-2">
                        <h3 className="text-3xl font-black">RELATÓRIO DE PERFORMANCE</h3>
                        <div className="flex gap-2">
                           <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-mono font-bold">STATUS: CRÍTICO</span>
                           <span className="px-2 py-0.5 bg-white/10 text-white/50 border border-white/20 text-[10px] font-mono font-bold">ID: NA-82B0D</span>
                        </div>
                     </div>
                     <button onClick={() => window.print()} className="p-3 border border-white/10 hover:border-[var(--color-brand-orange)] transition-colors">
                        <FileText size={20} />
                     </button>
                     <Link href="/historico" className="p-3 border border-white/10 hover:border-[var(--color-brand-green)] transition-all flex items-center gap-2 text-xs font-mono uppercase tracking-widest bg-white/5">
                        <History size={16} /> Ver Histórico
                     </Link>
                  </div>

                  <div className="glass-card p-6 border-l-4 border-l-[var(--color-brand-orange)] bg-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <BrainCircuit size={18} className="text-[var(--color-brand-orange)]" /> 
                        ANÁLISE ESTRATÉGICA NEURAL
                      </h4>
                      <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                         {diagnosis}
                      </div>
                   </div>

                  <div className="flex justify-center pt-8">
                     <button 
                        onClick={() => nextStep('channel')} 
                        className="px-8 py-4 bg-white text-black font-bold text-sm tracking-widest hover:bg-[var(--color-brand-orange)] transition-all"
                     >
                        NOVA ANÁLISE
                     </button>
                  </div>
                  
                  <div className="flex justify-center gap-6 pt-8 border-t border-white/5">
                    <SocialIcon icon={Share2} href="#" />
                    <SocialIcon icon={Target} href="#" />
                    <SocialIcon icon={Globe} href="#" />
                    <SocialIcon icon={Mail} href="#" />
                  </div>

                  {/* Premium Automation Scheduling UI */}
                  {profile?.isPremium && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 p-8 border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar size={80} className="text-[var(--color-brand-green)]" />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 bg-[var(--color-brand-green)]/10 rounded-lg">
                            <Clock className="text-[var(--color-brand-green)]" size={20} />
                          </div>
                          <h4 className="font-black text-lg tracking-tight uppercase">Programar Automação Neural</h4>
                        </div>

                        <p className="text-sm text-slate-400 mb-8 max-w-xl leading-relaxed">
                          Como usuário <span className="text-[var(--color-brand-green)] font-bold">MAX</span>, você pode automatizar este diagnóstico. 
                          A NeuroAds sincronizará seus dados e enviará o relatório pronto para seu colo.
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                          {['Diário', 'Semanal', 'Quinzenal', 'Mensal'].map((freq) => (
                            <button
                              key={freq}
                              onClick={() => setFrequency(freq)}
                              className={`py-3 px-4 border text-[10px] font-bold tracking-widest transition-all ${frequency === freq ? 'bg-[var(--color-brand-green)] text-black border-[var(--color-brand-green)]' : 'border-white/10 text-slate-500 hover:border-white/30'}`}
                            >
                              {freq.toUpperCase()}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={async () => {
                            if (!user || !connectedAccountId) return;
                            setIsScheduling(true);
                            const res = await scheduleAutomation(user.uid, {
                              platform: data.plataforma as string,
                              frequency,
                              accountId: connectedAccountId,
                              email: user.email || ''
                            });
                            setIsScheduling(false);
                            if (res.success) {
                              setScheduleSuccess(true);
                              setTimeout(() => setScheduleSuccess(false), 3000);
                            }
                          }}
                          disabled={isScheduling}
                          className="w-full py-4 bg-[var(--color-brand-green)] text-black font-black text-sm tracking-[0.2em] hover:brightness-110 transition-all uppercase flex items-center justify-center gap-3"
                        >
                          {isScheduling ? 'CONFIGURANDO...' : scheduleSuccess ? 'AGENDADO COM SUCESSO! ✓' : 'PROGRAMAR AGORA'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <AuthOverlay isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </section>
  );
}

// Sub-components
function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 p-4 focus:border-[var(--color-brand-orange)] focus:outline-none transition-colors font-mono"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">{label}</label>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-white/5 border border-white/10 p-4 focus:border-[var(--color-brand-orange)] focus:outline-none transition-colors resize-none"
      />
    </div>
  );
}

function LoadingBar({ label, delay }: { label: string, delay: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
        <span>{label}</span>
      </div>
      <div className="h-1 bg-white/5 overflow-hidden">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, delay: delay * 0.5 }}
          className="h-full w-1/2 bg-[var(--color-brand-orange)]"
        />
      </div>
    </div>
  );
}

function ZapIcon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: React.ComponentType<{ size?: number; className?: string }>, href: string }) {
  return (
    <a 
      href={href} 
      className="text-slate-600 hover:text-[var(--color-brand-orange)] transition-all hover:scale-110"
    >
      <Icon size={18} />
    </a>
  );
}
