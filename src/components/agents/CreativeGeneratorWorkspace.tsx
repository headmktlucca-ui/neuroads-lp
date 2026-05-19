'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Download, Link2, Sparkles, Star } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import ChannelConnectionHelpTooltip from './ChannelConnectionHelpTooltip';

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

type GeneratedCreative = {
  id: string;
  createdAt: number;
  channel: string;
  format: string;
  contentType: string;
  title: string;
  copy: string;
  cta: string;
  concept: string;
  modelFromId?: string;
};

const CHANNEL_PROVIDER: Record<ChannelKey, string> = {
  googleAds: 'google',
  metaAds: 'meta',
  linkedinAds: 'linkedin',
};

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

const FORMATS = ['Imagem Estática', 'Carrossel', 'Vídeo Curto', 'Stories', 'Banner Display', 'Thumbnail'] as const;
const CONTENT_TYPES = ['Topo de Funil', 'Meio de Funil', 'Fundo de Funil', 'Oferta Direta', 'Prova Social', 'Educativo'] as const;

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseStoredCreative(value: unknown): GeneratedCreative | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const id = readString(item.id);
  const title = readString(item.title);
  if (!id || !title) return null;

  const createdAtRaw = Number(item.createdAt);
  const createdAt = Number.isFinite(createdAtRaw) && createdAtRaw > 0 ? createdAtRaw : Date.now();

  return {
    id,
    createdAt,
    channel: readString(item.channel) || 'Canal não informado',
    format: readString(item.format) || 'Formato não informado',
    contentType: readString(item.contentType) || 'Conteúdo não informado',
    title,
    copy: readString(item.copy),
    cta: readString(item.cta),
    concept: readString(item.concept),
    modelFromId: readString(item.modelFromId) || undefined,
  };
}

function labelForChannel(key: ChannelKey): string {
  if (key === 'googleAds') return 'Google Ads';
  if (key === 'metaAds') return 'Meta Ads';
  return 'LinkedIn Ads';
}

function isOauthConnected(profile: unknown, channelKey: string): boolean {
  if (!profile || typeof profile !== 'object') return false;
  const connectionsRaw = (profile as Record<string, unknown>).connections;
  if (!connectionsRaw || typeof connectionsRaw !== 'object') return false;
  const connection = (connectionsRaw as Record<string, unknown>)[channelKey];
  if (!connection || typeof connection !== 'object') return false;
  const connectionRecord = connection as Record<string, unknown>;
  return Boolean(connectionRecord.isActive && readString(connectionRecord.accessToken));
}

function downloadCreative(creative: GeneratedCreative) {
  const content = [
    `Título: ${creative.title}`,
    `Canal: ${creative.channel}`,
    `Formato: ${creative.format}`,
    `Tipo de Conteúdo: ${creative.contentType}`,
    '',
    'Conceito:',
    creative.concept,
    '',
    'Copy:',
    creative.copy,
    '',
    `CTA: ${creative.cta}`,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `criativo-${creative.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function CreativeGeneratorWorkspace({
  userId,
  agentTitle,
  agentCategory,
}: CreativeGeneratorWorkspaceProps) {
  const { profile } = useAuth();
  const [connectors, setConnectors] = useState<ConnectorState>(DEFAULT_CONNECTORS);
  const [formats, setFormats] = useState<string[]>(['Imagem Estática']);
  const [contentTypes, setContentTypes] = useState<string[]>(['Topo de Funil']);
  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const companyName = useMemo(() => {
    if (!profile || typeof profile !== 'object') return 'Empresa';
    const root = profile as Record<string, unknown>;
    const onboarding = root.onboarding && typeof root.onboarding === 'object' ? (root.onboarding as Record<string, unknown>) : {};
    return readString(root.companyName) || readString(root.company) || readString(onboarding.companyName) || 'Empresa';
  }, [profile]);

  const activeChannels = useMemo(
    () => (Object.keys(connectors) as ChannelKey[]).filter((key) => connectors[key].isActive),
    [connectors]
  );

  const selectedModel = useMemo(
    () => creatives.find((item) => item.id === selectedModelId) ?? null,
    [creatives, selectedModelId]
  );

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
          .filter((item): item is GeneratedCreative => Boolean(item))
          .slice(0, 40);

        if (restored.length) setCreatives(restored);

        const restoredSelectedModelId = readString(library.selectedModelId);
        if (restoredSelectedModelId) setSelectedModelId(restoredSelectedModelId);
      } catch (loadError) {
        console.error('Erro ao carregar biblioteca de criativos:', loadError);
      }
    };

    void loadCreativeLibrary();
  }, [userId]);

  const toggleSelection = (
    list: string[],
    value: string,
    setter: (next: string[]) => void
  ) => {
    if (list.includes(value)) {
      if (list.length === 1) return;
      setter(list.filter((item) => item !== value));
      return;
    }
    setter([...list, value]);
  };

  const persistCreativeLibrary = async (nextItems: GeneratedCreative[]) => {
    if (!userId) return;
    const db = getFirebaseDb();
    await setDoc(
      doc(db, 'users', userId),
      {
        creativeLibrary: {
          updatedAt: Date.now(),
          selectedModelId,
          totalItems: nextItems.length,
          latestItems: nextItems.slice(0, 12),
        },
      },
      { merge: true }
    );
  };

  const saveSelectedModel = async (nextModelId: string) => {
    setSelectedModelId(nextModelId);
    if (!userId) return;

    try {
      const db = getFirebaseDb();
      await setDoc(
        doc(db, 'users', userId),
        {
          creativeLibrary: {
            selectedModelId: nextModelId,
            updatedAt: Date.now(),
          },
        },
        { merge: true }
      );
    } catch (persistError) {
      console.error('Erro ao salvar modelo de criativo:', persistError);
    }
  };

  const generateCreatives = async () => {
    if (!activeChannels.length) {
      setError('Ative ao menos 1 canal para gerar os criativos.');
      return;
    }
    if (!formats.length || !contentTypes.length) {
      setError('Selecione ao menos 1 formato e 1 tipo de conteúdo.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    try {
      const nextItems: GeneratedCreative[] = [];
      const now = Date.now();
      const maxItems = 10;

      for (const channel of activeChannels) {
        for (const format of formats) {
          for (const contentType of contentTypes) {
            if (nextItems.length >= maxItems) break;
            const modelHint = selectedModel ? `Baseado no modelo "${selectedModel.title}".` : '';

            nextItems.push({
              id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: now,
              channel: labelForChannel(channel),
              format,
              contentType,
              title: `${companyName}: criativo ${contentType.toLowerCase()} para ${labelForChannel(channel)}`,
              concept: `Peça ${format.toLowerCase()} para ${labelForChannel(channel)}, com foco em ${contentType.toLowerCase()} e clareza comercial.`,
              copy: `${modelHint} Destaque o principal diferencial da operação e conecte a mensagem com impacto financeiro e previsibilidade de resultado.`,
              cta: contentType === 'Fundo de Funil' || contentType === 'Oferta Direta' ? 'Solicitar diagnóstico estratégico' : 'Ver plano de crescimento',
              modelFromId: selectedModel?.id,
            });
          }
        }
      }

      const merged = [...nextItems, ...creatives].slice(0, 40);
      setCreatives(merged);
      await persistCreativeLibrary(merged);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Erro ao gerar criativos.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <header className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FF6B00]">{agentCategory}</p>
            <h3 className="mt-1 text-xl font-black text-text-main">{agentTitle}</h3>
          </header>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">1. Canais para veiculação</h3>
            <p className="mt-1 text-sm text-text-muted">
              Conecte e ative os canais que serão usados para publicação dos criativos.
            </p>

            <div className="mt-4 space-y-4">
              {(Object.keys(connectors) as ChannelKey[]).map((key) => {
                const oauthConnected = isOauthConnected(profile, CHANNEL_CONNECTION_KEY[key]);
                const isActive = connectors[key].isActive;
                const oauthHref = `/api/auth/connectors/${key}/start?provider=${CHANNEL_PROVIDER[key]}&next=/hub/agente/gerador-de-criativos`;

                return (
                  <div key={key} className="rounded-xl border border-[#E1E7F0] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-text-main">{labelForChannel(key)}</p>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Canal ativo
                        </span>
                      ) : oauthConnected ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-3 py-1 text-xs font-bold text-[#92400E]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Autenticado (pendente ativação)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] bg-white px-3 py-1 text-xs font-bold text-[#6B7280]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Não autenticado
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={connectors[key].accountId}
                        onChange={(event) =>
                          setConnectors((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], accountId: event.target.value },
                          }))
                        }
                        placeholder={
                          key === 'googleAds'
                            ? 'Customer ID'
                            : key === 'metaAds'
                              ? 'Ad Account ID'
                              : 'Sponsored Account ID'
                        }
                        className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                      />
                      {key === 'googleAds' ? (
                        <input
                          value={connectors[key].loginCustomerId || ''}
                          onChange={(event) =>
                            setConnectors((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], loginCustomerId: event.target.value },
                            }))
                          }
                          placeholder="Login Customer ID (MCC) opcional"
                          className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                        />
                      ) : (
                        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-text-dim flex items-center">
                          Autenticação via e-mail logado
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={oauthHref}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D9E2F4] bg-[#EEF4FF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1D4ED8]"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Autenticar Canal
                      </a>
                      <ChannelConnectionHelpTooltip channel={key} />
                      <button
                        type="button"
                        onClick={() =>
                          setConnectors((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], isActive: true, connectedAt: Date.now() },
                          }))
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                      >
                        Ativar Canal
                      </button>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            setConnectors((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], isActive: false },
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-[#FFF1F2] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#B42318]"
                        >
                          Desativar
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">2. Formato do criativo e tipo de conteúdo</h3>
            <p className="mt-1 text-sm text-text-muted">
              Selecione os formatos e conteúdos desejados para gerar o novo lote.
            </p>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-2">Formato do criativo</p>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((format) => {
                  const selected = formats.includes(format);
                  return (
                    <button
                      key={format}
                      type="button"
                      onClick={() => toggleSelection(formats, format, setFormats)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                        selected
                          ? 'border-[#FF9A63] bg-[#FFF4EC] text-[#C2410C]'
                          : 'border-[#D6DEE8] bg-white text-text-muted hover:border-[#FFBE94]'
                      }`}
                    >
                      {format}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-2">Tipo de conteúdo</p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => {
                  const selected = contentTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleSelection(contentTypes, type, setContentTypes)}
                      className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                        selected
                          ? 'border-[#FF9A63] bg-[#FFF4EC] text-[#C2410C]'
                          : 'border-[#D6DEE8] bg-white text-text-muted hover:border-[#FFBE94]'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  void generateCreatives();
                }}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Gerando...' : 'Gerar Criativos'}
              </button>

              {selectedModel ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]">
                  <Star className="h-3.5 w-3.5" />
                  Modelo ativo: {selectedModel.title}
                </span>
              ) : null}
            </div>
          </section>

          {error ? <p className="text-sm font-semibold text-[#B42318]">{error}</p> : null}

          <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-text-main">3. Gestão dos criativos gerados</h3>
              <span className="text-xs font-semibold text-text-dim">{creatives.length} criativo(s)</span>
            </div>

            {!creatives.length ? (
              <p className="mt-3 text-sm text-text-muted">
                Nenhum criativo gerado ainda. Gere o primeiro lote para visualizar, usar como modelo e baixar.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {creatives.map((creative) => {
                  const isModel = selectedModelId === creative.id;
                  return (
                    <article
                      key={creative.id}
                      className={`rounded-xl border p-4 ${
                        isModel
                          ? 'border-[#FF9A63] bg-[#FFF8F3]'
                          : 'border-[#E4EAF2] bg-[#FCFDFF]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-text-main">{creative.title}</p>
                          <p className="text-xs text-text-dim mt-1">
                            {creative.channel} • {creative.format} • {creative.contentType}
                          </p>
                        </div>
                        {isModel ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#FFD0B2] bg-[#FFF1E8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#C2410C]">
                            Modelo
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-3 text-xs text-text-muted leading-relaxed">{creative.copy}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void saveSelectedModel(creative.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-[#D6DEE8] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-text-main"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Usar como modelo
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadCreative(creative)}
                          className="inline-flex items-center gap-1 rounded-full border border-[#B5E8CB] bg-[#F2FFF7] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#0A9D57]"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-4 py-3 text-xs text-[#1E3A8A]">
            <p className="font-black uppercase tracking-wide mb-1">Sugestão complementar</p>
            <p>
              Próximo ganho de eficiência: conectar esta gestão com o resultado real de mídia por criativo
              (CTR/CPL por peça) para promover automaticamente os vencedores como modelo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
