'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Download, Sparkles, Star, ArrowRight, ArrowLeft, Palette, Layout, Target, HelpCircle, Layers, Video } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { generateHybridCreative, type HybridCreativeOutput } from '../../app/actions/creative-suite';
import CreativeStudioCanvas, { type StudioCreativeData } from './CreativeStudioCanvas';
import CreativeCarouselWorkspace, { type CarouselSlide } from './CreativeCarouselWorkspace';
import CreativeVideoWorkspace, { type VideoScene } from './CreativeVideoWorkspace';

type CreativeGeneratorWorkspaceProps = {
  userId?: string;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
};

type ChannelKey = 'googleAds' | 'metaAds' | 'linkedinAds';

type ConnectorAuth = {
  oauthConnected: boolean;
  isActive: boolean;
  accountId: string;
  loginCustomerId?: string;
  connectedAt?: number;
};

type ConnectorState = Record<ChannelKey, ConnectorAuth>;

const EMPTY_CONNECTOR: ConnectorAuth = {
  oauthConnected: false,
  isActive: false,
  accountId: '',
  loginCustomerId: '',
};

const DEFAULT_CONNECTORS: ConnectorState = {
  googleAds: { ...EMPTY_CONNECTOR },
  metaAds: { ...EMPTY_CONNECTOR },
  linkedinAds: { ...EMPTY_CONNECTOR },
};

const CHANNEL_CONNECTION_KEY: Record<ChannelKey, string> = {
  googleAds: 'google_ads',
  metaAds: 'meta_ads',
  linkedinAds: 'linkedin_ads',
};

const CHANNELS = [
  { id: 'metaAds', name: 'Meta Ads (Facebook/Instagram)', desc: 'Ideal para Feed 1:1 e Stories 9:16 altamente visuais.' },
  { id: 'googleAds', name: 'Google Ads (Display/PMax)', desc: 'Banners horizontais 16:9 e responsivos.' },
  { id: 'linkedinAds', name: 'LinkedIn Ads (B2B)', desc: 'Imagens 1:1 institucionais com tom corporativo.' }
] as const;

const FORMATS = [
  { id: 'Imagem Estática', name: 'Arte Estática', icon: Layout, desc: 'Imagens avulsas e banners de alta definição.' },
  { id: 'Carrossel', name: 'Carrossel de Storytelling', icon: Layers, desc: 'Sequência lógica de 3 a 5 lâminas de funil.' },
  { id: 'Vídeo Curto', name: 'Vídeo Curto Animado', icon: Video, desc: 'Roteiros de 15s Reels/TikTok com timeline e legendas.' }
] as const;

const CONTENT_TYPES = [
  { id: 'Topo de Funil', name: 'Topo de Funil (Atração)', desc: 'Foco na dor do cliente e atração em massa.' },
  { id: 'Meio de Funil', name: 'Meio de Funil (Desejo)', desc: 'Apresenta a solução com foco técnico ou valor.' },
  { id: 'Fundo de Funil', name: 'Fundo de Funil (Ação)', desc: 'Chamada direta (CTA) estratégica com alta conversão.' },
  { id: 'Oferta Direta', name: 'Oferta Direta (Vendas)', desc: 'Preço, bônus ou convite expresso.' }
] as const;

const DESIGN_STYLES = [
  { id: 'Minimalista SaaS', name: 'SaaS Minimalista', colors: { p: '#0F172A', s: '#FF6B00' }, desc: 'Moderno, elegante, muito contraste e tipografia Outfit.' },
  { id: 'Premium Teal & Gold', name: 'Premium Teal & Gold', colors: { p: '#0f9488', s: '#d97706' }, desc: 'Estética sofisticada, ideal para serviços high-ticket.' },
  { id: 'Clean Corporate', name: 'Clean Corporate', colors: { p: '#1e293b', s: '#0ea5e9' }, desc: 'Fundo sóbrio, azul comercial, focado em credibilidade B2B.' },
  { id: 'Brutalista Glow', name: 'Brutalista Glow', colors: { p: '#000000', s: '#f43f5e' }, desc: 'Estilo cyber, contrastes pretos e neons de alto impacto.' }
] as const;

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseStoredCreative(value: unknown): StudioCreativeData | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const id = readString(item.id);
  const title = readString(item.title);
  if (!id || !title) return null;

  return {
    id,
    title,
    concept: readString(item.concept),
    copy: readString(item.copy),
    cta: readString(item.cta),
    headline: readString(item.headline),
    subheading: readString(item.subheading),
    backgroundImageUrl: readString(item.backgroundImageUrl),
    channel: readString(item.channel) || 'Meta Ads',
    format: readString(item.format) || 'Imagem Estática',
    contentType: readString(item.contentType) || 'Topo de Funil',
  };
}

export default function CreativeGeneratorWorkspace({
  userId,
  agentTitle,
  agentCategory,
}: CreativeGeneratorWorkspaceProps) {
  const { profile } = useAuth();
  
  // Connectors State
  const [connectors, setConnectors] = useState<ConnectorState>(DEFAULT_CONNECTORS);
  
  // Interactive Steps Flow
  const [step, setStep] = useState<number>(1); // Step 1: Branding, Step 2: Channel & Style, Step 3: Format & Intent
  
  // Selection States
  const [selectedChannel, setSelectedChannel] = useState<string>('metaAds');
  const [selectedFormat, setSelectedFormat] = useState<string>('Imagem Estática');
  const [selectedContentType, setSelectedContentType] = useState<string>('Topo de Funil');
  const [selectedStyle, setSelectedStyle] = useState<string>('Minimalista SaaS');
  
  // Brand Custom Colors & Logo
  const [primaryColor, setPrimaryColor] = useState<string>('#0F172A');
  const [secondaryColor, setSecondaryColor] = useState<string>('#FF6B00');
  
  // Library and active editor creative
  const [creatives, setCreatives] = useState<StudioCreativeData[]>([]);
  const [activeCreative, setActiveCreative] = useState<StudioCreativeData | null>(null);
  
  // State variables for loaders & logic
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');

  const companyName = useMemo(() => {
    if (!profile || typeof profile !== 'object') return 'Empresa';
    const root = profile as Record<string, unknown>;
    const onboarding = root.onboarding && typeof root.onboarding === 'object' ? (root.onboarding as Record<string, unknown>) : {};
    return readString(root.companyName) || readString(root.company) || readString(onboarding.companyName) || 'Empresa';
  }, [profile]);

  const profileConnections = useMemo(() => {
    if (!profile || typeof profile !== 'object') return {} as Record<string, Record<string, unknown> | undefined>;
    const maybeConnections = (profile as Record<string, unknown>).connections;
    if (!maybeConnections || typeof maybeConnections !== 'object') return {} as Record<string, Record<string, unknown> | undefined>;
    return maybeConnections as Record<string, Record<string, unknown> | undefined>;
  }, [profile]);

  const activeChannels = useMemo(
    () => (Object.keys(connectors) as ChannelKey[]).filter((key) => connectors[key].isActive),
    [connectors]
  );

  // Sync connections status from profile
  useEffect(() => {
    const next: ConnectorState = {
      googleAds: { ...EMPTY_CONNECTOR },
      metaAds: { ...EMPTY_CONNECTOR },
      linkedinAds: { ...EMPTY_CONNECTOR },
    };

    (Object.keys(next) as ChannelKey[]).forEach((key) => {
      const connection = profileConnections[CHANNEL_CONNECTION_KEY[key]];
      const accessToken = readString(connection?.accessToken);
      const accountId = readString(connection?.accountId);
      const loginCustomerId = readString(connection?.loginCustomerId);
      next[key] = {
        ...next[key],
        oauthConnected: Boolean(connection?.isActive && accessToken),
        isActive: Boolean(connection?.isActive && accessToken && accountId),
        accountId,
        loginCustomerId,
      };
    });

    setConnectors(next);
  }, [profileConnections]);

  // Sync selected styles with color inputs
  useEffect(() => {
    const styleObj = DESIGN_STYLES.find((s) => s.id === selectedStyle);
    if (styleObj) {
      setPrimaryColor(styleObj.colors.p);
      setSecondaryColor(styleObj.colors.s);
    }
  }, [selectedStyle]);

  // Load past creative library from Firebase Firestore
  useEffect(() => {
    const loadCreativeLibrary = async () => {
      if (!userId) return;

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        if (!snapshot.exists()) return;

        const userData = snapshot.data() as Record<string, unknown>;
        const libraryRaw = userData.creativeLibrary;
        if (!libraryRaw || typeof libraryRaw !== 'object') return;
        const library = libraryRaw as Record<string, unknown>;

        const itemsRaw = Array.isArray(library.latestItems) ? library.latestItems : [];
        const restored = itemsRaw
          .map((item) => parseStoredCreative(item))
          .filter((item): item is StudioCreativeData => Boolean(item))
          .slice(0, 40);

        if (restored.length) {
          setCreatives(restored);
          setActiveCreative(restored[0]);
        }
      } catch (loadError) {
        console.error('Erro ao carregar biblioteca de criativos:', loadError);
      }
    };

    void loadCreativeLibrary();
  }, [userId]);

  const persistCreativeLibrary = async (nextItems: StudioCreativeData[]) => {
    if (!userId) return;
    try {
      const db = getFirebaseDb();
      await setDoc(
        doc(db, 'users', userId),
        {
          creativeLibrary: {
            updatedAt: Date.now(),
            totalItems: nextItems.length,
            latestItems: nextItems.slice(0, 15),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Erro ao persistir biblioteca de criativos no Firebase:', err);
    }
  };

  const handleUpdateActiveCreative = (updated: StudioCreativeData) => {
    setActiveCreative(updated);
    
    // Sync the local library array
    const updatedLib = creatives.map((item) => {
      if (item.id === updated.id) {
        return updated;
      }
      return item;
    });
    setCreatives(updatedLib);
    void persistCreativeLibrary(updatedLib);
  };

  // Generate hybrid visual creative via Server Actions
  const handleGenerateCreatives = async () => {
    setError(null);
    setIsGenerating(true);

    const phases = [
      'Acessando base de conhecimento do DNA da Marca...',
      'Analisando concorrência e CTR histórico...',
      'Gerando prompts criativos baseados em neuromarketing...',
      'Consultando OpenAI gpt-4o para copies magnéticas...',
      'Chamando motor visual DALL-E 3 para imagem de fundo...',
      'Finalizando montagem de camadas e layouts no NeuroAds...'
    ];

    let currentPhaseIdx = 0;
    setGenerationPhase(phases[0]);

    const phaseTimer = setInterval(() => {
      currentPhaseIdx = Math.min(currentPhaseIdx + 1, phases.length - 1);
      setGenerationPhase(phases[currentPhaseIdx]);
    }, 2800);

    try {
      // 1. Gather all themes from brand or defaults
      const interestThemes = profile && typeof profile === 'object' && (profile as any).onboarding?.objectives
        ? (profile as any).onboarding.objectives
        : ['conversão de tráfego', 'escala de ROI', 'autoridade de marca'];

      const toneOfVoice = profile && typeof profile === 'object' && (profile as any).onboarding?.toneOfVoice
        ? (profile as any).onboarding.toneOfVoice
        : 'Consultivo, persuasivo e altamente focado em resultados tangíveis';

      // 2. Call server action generateHybridCreative
      const response = await generateHybridCreative({
        companyName,
        brandSegment: (profile as any)?.onboarding?.segment || 'Marketing Digital / B2B SaaS',
        interestThemes,
        toneOfVoice,
        channel: CHANNELS.find((c) => c.id === selectedChannel)?.name || 'Meta Ads',
        format: selectedFormat,
        contentType: selectedContentType,
        styleName: selectedStyle,
        primaryColor,
        secondaryColor
      });

      clearInterval(phaseTimer);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro desconhecido na geração visual por IA.');
      }

      // 3. Insert and save
      const output = response.data;
      const updatedLib = [output, ...creatives].slice(0, 40);
      
      setCreatives(updatedLib);
      setActiveCreative(output);
      
      await persistCreativeLibrary(updatedLib);
      
      // Reset step to show work area
      setStep(1);
    } catch (genErr) {
      clearInterval(phaseTimer);
      console.error('Erro ao gerar criativo neural:', genErr);
      setError(genErr instanceof Error ? genErr.message : 'Falha na conexão neural de criação de artes. Tente novamente.');
    } finally {
      setIsGenerating(false);
      setGenerationPhase('');
    }
  };

  return (
    <section className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)] select-none">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <header className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FF6B00]">{agentCategory}</p>
              <h3 className="mt-1 text-2xl font-black text-text-main">{agentTitle}</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Adotando a <strong className="text-text-main font-bold">Opção C (Estúdio Híbrido)</strong>. Gere criativos visuais premium e modifique camadas diretamente na tela em tempo real.
              </p>
            </div>
            
            {/* Platform Status Tooltip badge */}
            <div className="flex bg-[#F1F5F9] px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-black text-[#1D4ED8] items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#08B760]" />
              Motor DALL-E 3 & html2canvas Ativo
            </div>
          </header>

          {/* Loader Overlay when generating */}
          {isGenerating && (
            <div className="fixed inset-0 bg-[#0B0F19]/90 z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Glowing effects */}
                <div className="absolute inset-0 rounded-full border border-orange-500/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-orange-500/50 animate-pulse" />
                <div className="w-16 h-16 rounded-full border-4 border-[#FF6B00] border-t-transparent animate-spin" />
                <Sparkles className="absolute h-6 w-6 text-orange-400" />
              </div>

              <h3 className="text-white text-xl font-black uppercase tracking-widest mt-8">Gerando Arte Neural Híbrida</h3>
              <p className="text-[#FF9A63] text-sm font-bold uppercase tracking-wider mt-2.5 animate-pulse">
                {generationPhase}
              </p>
              
              <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 mt-6 text-xs text-[#C8D3E6]">
                <p className="font-bold text-white mb-1 uppercase tracking-wide">Diretiva de Arte da IA</p>
                <p className="leading-relaxed">
                  Estamos instruindo a IA a gerar um fundo abstrato com alta densidade estética que garanta legibilidade absoluta dos seus textos.
                </p>
              </div>
            </div>
          )}

          {/* Core Panel: Active Studio Work Area OR Setup wizard */}
          {activeCreative && !isGenerating ? (
            <div className="space-y-6">
              
              {/* Studio Header (Selector of items in library + Setup trigger) */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-dim">Biblioteca de Criativos ({creatives.length}):</span>
                  <select
                    value={activeCreative.id}
                    onChange={(e) => {
                      const found = creatives.find((item) => item.id === e.target.value);
                      if (found) setActiveCreative(found);
                    }}
                    className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-1.5 text-xs text-text-main font-bold focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
                  >
                    {creatives.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.channel}] {c.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)} // start generation process
                  className="inline-flex items-center gap-2 bg-[#FFF4EC] text-[#FF6B00] border border-[#FFE4D1] hover:bg-[#FFEADA] px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar Novo Lote de Artes
                </button>
              </div>

              {/* Render dynamic workspaces based on the active format */}
              {activeCreative.format.includes('Carrossel') ? (
                <CreativeCarouselWorkspace
                  key={activeCreative.id}
                  initialSlides={[]}
                  backgroundImageUrl={activeCreative.backgroundImageUrl}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  companyName={companyName}
                  channel={activeCreative.channel}
                />
              ) : activeCreative.format.includes('Vídeo') ? (
                <CreativeVideoWorkspace
                  key={activeCreative.id}
                  initialScenes={[]}
                  backgroundImageUrl={activeCreative.backgroundImageUrl}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  companyName={companyName}
                  ctaText={activeCreative.cta}
                />
              ) : (
                <CreativeStudioCanvas
                  key={activeCreative.id}
                  creative={activeCreative}
                  onChange={handleUpdateActiveCreative}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  companyName={companyName}
                />
              )}

            </div>
          ) : (
            /* Setup Wizard Form (Step layout) */
            <div className="bg-[#FBFCFD] border border-[#E4EAF2] rounded-[24px] p-6 space-y-6">
              
              {/* Steps indicators */}
              <div className="flex items-center justify-between max-w-lg mx-auto border-b border-gray-100 pb-4 mb-4 select-none">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        step === num
                          ? 'bg-[#FF6B00] text-white shadow-sm'
                          : step > num
                            ? 'bg-[#08B760] text-white'
                            : 'bg-[#E2E8F0] text-text-muted'
                      }`}
                    >
                      {num}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${step === num ? 'text-[#FF6B00]' : 'text-text-dim'}`}>
                      {num === 1 ? 'Identidade' : num === 2 ? 'Canais & Estilo' : 'Formatos'}
                    </span>
                  </div>
                ))}
              </div>

              {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

              {/* STEP 1: Branding and Brand Identity details */}
              {step === 1 && (
                <div className="space-y-5">
                  <header>
                    <h4 className="text-base font-black text-text-main flex items-center gap-1.5">
                      <Palette className="h-4.5 w-4.5 text-[#FF6B00]" />
                      Passo 1: Identidade da Marca e Direcionamento
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Defina as cores e o nome de exibição nos banners patrocinados para manter a coesão institucional.
                    </p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-dim mb-1">Nome Fantasia (Exibição)</label>
                      <input
                        type="text"
                        disabled
                        value={companyName}
                        className="w-full rounded-xl border border-[#D6DEE8] bg-gray-100 px-3 py-2.5 text-xs text-text-muted font-bold focus:outline-none"
                      />
                      <p className="text-[10px] text-text-muted mt-1">Sincronizado automaticamente da conta NeuroAds.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-text-dim mb-1">Cor Primária</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0 shrink-0"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-full rounded-xl border border-[#D6DEE8] bg-white px-2 py-1 text-xs text-text-main uppercase font-bold"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-text-dim mb-1">Cor de Destaque</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0 shrink-0"
                          />
                          <input
                            type="text"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-full rounded-xl border border-[#D6DEE8] bg-white px-2 py-1 text-xs text-text-main uppercase font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B00] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_18px_rgba(255,107,0,0.25)] hover:brightness-105"
                    >
                      Próximo Passo
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Channel selection and Estilo estético */}
              {step === 2 && (
                <div className="space-y-5">
                  <header>
                    <h4 className="text-base font-black text-text-main flex items-center gap-1.5">
                      <Target className="h-4.5 w-4.5 text-[#FF6B00]" />
                      Passo 2: Canais de Tráfego e Estética da Arte
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Selecione onde planeja veicular a campanha. A IA ajustará as redes neurais e proporções.
                    </p>
                  </header>

                  {/* Channel selectors */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-text-dim mb-2">Canal Principal</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {CHANNELS.map((ch) => {
                        const active = selectedChannel === ch.id;
                        return (
                          <div
                            key={ch.id}
                            onClick={() => setSelectedChannel(ch.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              active
                                ? 'border-[#FF6B00] bg-[#FFF8F3]'
                                : 'border-[#E2E8F0] bg-white hover:border-[#FFBE94]'
                            }`}
                          >
                            <p className="text-xs font-black text-text-main">{ch.name}</p>
                            <p className="text-[10px] text-text-muted mt-1 leading-normal">{ch.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Style presets */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-text-dim mb-2">Estética Visual dos Templates</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DESIGN_STYLES.map((st) => {
                        const active = selectedStyle === st.id;
                        return (
                          <div
                            key={st.id}
                            onClick={() => setSelectedStyle(st.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex gap-3 items-start ${
                              active
                                ? 'border-[#FF6B00] bg-[#FFF8F3]'
                                : 'border-[#E2E8F0] bg-white hover:border-[#FFBE94]'
                            }`}
                          >
                            {/* Color preview dot */}
                            <div className="flex gap-1 shrink-0 mt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.colors.p }} />
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.colors.s }} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-text-main">{st.name}</p>
                              <p className="text-[10px] text-text-muted mt-1 leading-normal">{st.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D6DEE8] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-text-muted hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Voltar
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B00] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_18px_rgba(255,107,0,0.25)] hover:brightness-105"
                    >
                      Próximo Passo
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Formatos e Tipos de conteúdo/funil */}
              {step === 3 && (
                <div className="space-y-5">
                  <header>
                    <h4 className="text-base font-black text-text-main flex items-center gap-1.5">
                      <Layout className="h-4.5 w-4.5 text-[#FF6B00]" />
                      Passo 3: Escolha do Formato e Intenção de Funil
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Finalize as configurações da peça para gerar a copy lógica e o template visual correspondente.
                    </p>
                  </header>

                  {/* Formatos selector */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-text-dim mb-2">Formato de Saída</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {FORMATS.map((fo) => {
                        const Icon = fo.icon;
                        const active = selectedFormat === fo.id;
                        return (
                          <div
                            key={fo.id}
                            onClick={() => setSelectedFormat(fo.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-1.5 ${
                              active
                                ? 'border-[#FF6B00] bg-[#FFF8F3]'
                                : 'border-[#E2E8F0] bg-white hover:border-[#FFBE94]'
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${active ? 'text-[#FF6B00]' : 'text-text-dim'}`} />
                            <p className="text-xs font-black text-text-main">{fo.name}</p>
                            <p className="text-[10px] text-text-muted leading-normal">{fo.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content type selector */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-text-dim mb-2">Etapa do Funil (Intenção de Conversão)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CONTENT_TYPES.map((ct) => {
                        const active = selectedContentType === ct.id;
                        return (
                          <div
                            key={ct.id}
                            onClick={() => setSelectedContentType(ct.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              active
                                ? 'border-[#FF6B00] bg-[#FFF8F3]'
                                : 'border-[#E2E8F0] bg-white hover:border-[#FFBE94]'
                            }`}
                          >
                            <p className="text-xs font-black text-text-main">{ct.name}</p>
                            <p className="text-[10px] text-text-muted mt-1 leading-normal">{ct.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#D6DEE8] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-text-muted hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Voltar
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateCreatives}
                      className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-7 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.35)] hover:brightness-105"
                    >
                      <Sparkles className="h-4 w-4" />
                      Gerar Criativos Visuais
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Extra Strategy Tip box */}
          {creatives.length > 0 && (
            <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-4 py-3.5 text-xs text-[#1E3A8A] flex gap-2 items-start">
              <Layers className="h-4.5 w-4.5 mt-0.5 text-[#1D4ED8] shrink-0" />
              <div>
                <p className="font-black uppercase tracking-wide mb-1">Evolução do Design System Híbrido</p>
                <p className="leading-relaxed">
                  Para carrosséis, o NeuroAds mantém os fundos visualmente coesos de forma a maximizar o scroll-through rate de anúncios no Instagram. Ao exportar em PNGs, suas artes serão salvas com resolução duplicada (2x) para garantir nitidez retina absoluta na veiculação de anúncios.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
