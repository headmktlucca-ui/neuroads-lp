'use client';
import { useState } from 'react';
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
import { TrafficData } from '@/lib/prompt-master';
import { analyzeTraffic } from '@/app/actions/ai-analysis';
import { useAuth } from '@/context/AuthContext';
import AuthOverlay from '@/components/auth/AuthOverlay';
import { Clock, Key } from 'lucide-react';
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncTrafficData } from '@/app/actions/traffic-sync';

type Step = 'channel' | 'objective' | 'data' | 'insights' | 'generating' | 'report';

export type ActiveAppConfig = {
  title: string;
  description: string;
  status: string;
};

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
  const [adAccountId, setAdAccountId] = useState('');
  const [showIdInput, setShowIdInput] = useState(false);

  if (!activeApp) return null;

  const updateData = (field: keyof TrafficData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSync = async () => {
    if (!data.plataforma) return;
    
    // Se a plataforma precisa de ID de conta mas ainda não foi inserido
    if ((data.plataforma === 'Google Ads' || data.plataforma === 'Meta Ads' || data.plataforma === 'TikTok Ads') && !adAccountId && !showIdInput) {
      setShowIdInput(true);
      return;
    }

    if (showIdInput && !adAccountId) {
      setError('Por favor, informe o ID da sua Conta de Anúncios.');
      return;
    }

    setIsSyncing(true);
    setSyncSuccess(false);
    setError(null);
    
    try {
      let accessToken = '';

      if (data.plataforma === 'Google Ads') {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/adwords');
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken || '';
      } 
      else if (data.plataforma === 'Meta Ads') {
        const provider = new FacebookAuthProvider();
        provider.addScope('ads_read');
        provider.addScope('read_insights');
        const result = await signInWithPopup(auth, provider);
        const credential = FacebookAuthProvider.credentialFromResult(result);
        accessToken = credential?.accessToken || '';
      }
      else if (data.plataforma === 'TikTok Ads') {
        // TikTok não possui Provedor de Popup nativo no Firebase - requer fluxo OAuth customizado via backend
        // Para este MVP, solicitaremos o token de acesso de desenvolvedor se não houver backend
        accessToken = prompt('Insira seu Access Token do TikTok For Business (Modo Desenvolvedor)') || '';
        if (!accessToken) throw new Error('Autenticação TikTok cancelada ou inválida.');
      }

      if (!accessToken) {
        throw new Error('Não foi possível obter a credencial de acesso.');
      }

      const syncResult = await syncTrafficData(data.plataforma as string, accessToken, adAccountId);
      
      if (syncResult.success && syncResult.data) {
        setData(prev => ({ ...prev, ...syncResult.data }));
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      } else {
        throw new Error(syncResult.error || 'Erro desconhecido ao puxar os dados reais.');
      }

    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Erro durante a autenticação ou sincronização.';
      setError(message);
      
      // Fallback para dados mockados em caso de erro sem credencial válida durante desenvolvimento
      console.log("Aplicando dados mockados como fallback devido a erro de API real");
      const mockDataMap: Record<string, Partial<TrafficData>> = {
        'Google Ads': { investimento: '8500', impressoes: '125000', cliques: '1840', conversoes: '42', cpa: '202.38', roas: '4.2' },
        'Meta Ads': { investimento: '5000', impressoes: '85000', cliques: '2240', conversoes: '68', cpa: '73.53', roas: '5.8' },
        'TikTok Ads': { investimento: '3200', impressoes: '450000', cliques: '9850', conversoes: '31', cpa: '103.22', roas: '2.9' },
      };
      const platformData = mockDataMap[data.plataforma as string] || mockDataMap['Google Ads'];
      setData(prev => ({ ...prev, ...platformData }));
    } finally {
      setIsSyncing(false);
    }
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
                    <div className="relative glass-card border-dashed border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                       <div className="flex flex-col w-full md:w-auto flex-grow">
                          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-1">AUTOMAÇÃO EM TEMPO REAL</span>
                          <h4 className="text-sm font-bold tracking-tight">VINCULAR CONTA {data.plataforma ? data.plataforma.toUpperCase() : 'DE TRÁFEGO'}</h4>
                          {showIdInput && (
                            <div className="mt-4 flex items-center bg-white/5 border border-white/10 p-2 pl-4 focus-within:border-[var(--color-brand-orange)] transition-colors">
                              <Key size={14} className="text-slate-500" />
                              <input 
                                type="text"
                                value={adAccountId}
                                onChange={(e) => setAdAccountId(e.target.value)}
                                placeholder={`ID da sua conta ${data.plataforma} (Ex: 123-456-7890)`}
                                className="w-full bg-transparent border-none text-xs font-mono focus:outline-none focus:ring-0 ml-3 text-white placeholder:text-slate-600"
                              />
                            </div>
                          )}
                          {error && step === 'data' && (
                             <p className="mt-2 text-red-400 text-xs font-mono">{error}</p>
                          )}
                       </div>
                       
                       <button 
                         onClick={handleSync}
                         disabled={isSyncing}
                         className={`px-6 py-3 border border-white/20 font-bold text-xs tracking-widest hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] transition-all flex items-center justify-center gap-3 w-full md:w-auto whitespace-nowrap ${isSyncing ? 'animate-pulse opacity-50 cursor-wait' : ''}`}
                       >
                         {isSyncing ? (
                           <> <RefreshCw size={14} className="animate-spin" /> AUTENTICANDO CONTA... </>
                         ) : syncSuccess ? (
                           <> <CheckCircle2 size={14} className="text-[var(--color-brand-green)]" /> DADOS SINCRONIZADOS_OK </>
                         ) : showIdInput ? (
                           <> <RefreshCw size={14} /> CONTINUAR INTEGRAÇÃO </>
                         ) : (
                           <> <RefreshCw size={14} /> SINCRONIZAR DADOS AGORA </>
                         )}
                       </button>
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

                  {/* Premium Scheduling Logic */}
                  {profile?.isPremium && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-12 p-6 border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Clock className="text-[var(--color-brand-green)]" size={20} />
                          <h4 className="font-bold text-sm tracking-tight">AGENDAMENTO GOD MODE</h4>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-2 py-0.5">ATIVO</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-6">
                        Deseja que a NeuroAds execute este diagnóstico automaticamente e envie o PDF para seu email todo início de semana?
                      </p>
                      <button className="w-full py-3 bg-[var(--color-brand-green)] text-black font-bold text-xs tracking-widest hover:brightness-110 transition-all uppercase">
                        ATIVAR AGENDAMENTO SEMANAL
                      </button>
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

function SocialIcon({ icon: Icon, href }: { icon: React.ElementType, href: string }) {
  return (
    <a 
      href={href} 
      className="text-slate-600 hover:text-[var(--color-brand-orange)] transition-all hover:scale-110"
    >
      <Icon size={18} />
    </a>
  );
}
