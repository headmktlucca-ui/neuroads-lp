'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Download, Eye, History, MoreVertical, Sparkles, Trash2, X, Power, Edit, Activity, Database, ChevronRight, Cpu } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DnaBrandPresentationPanel } from '../../../../components/agents/DnaBrandWorkspace';
import GenericAgentWorkspace from '../../../../components/agents/GenericAgentWorkspace';
import { getWorkspaceForAgent } from '../../../../lib/agent-workspace-registry';
import { useAuth } from '../../../../context/AuthContext';
import type { DnaBrandPresentation, DnaBrandSource } from '../../../actions/dna-brand';
import {
  getAgentBySlug,
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../../../lib/hub-agents';
import { Agent, agents as allSpecialties } from '../../../../data/agents';
import { TEAM_AGENTS, TeamAgent } from '../../../../data/team-agents';
import { getFirebaseDb } from '../../../../lib/firebase';
import {
  deleteAgentReportFromDb,
  downloadAgentReport,
  getLatestAgentReportsFromDb,
  type AgentReportHistoryEntry,
} from '../../../../lib/agent-report-history';
import { buildAutomationTimestamps } from '../../../../lib/hub-automations';
import {
  CONNECTOR_DEFINITIONS,
  getConnectorStatusFromConnections,
  type ConnectorConnection,
  type ConnectorKey,
} from '../../../../lib/connectors';

interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'url';
  placeholder: string;
}

const SPECIALTY_FIELDS: Record<string, CustomField[]> = {
  'Analista de Tráfego': [
    { name: 'plataforma', label: 'Plataforma de Anúncios', type: 'text', placeholder: 'Meta Ads, Google Ads ou ambos' },
    { name: 'cpa_alvo', label: 'CPA Alvo (R$)', type: 'number', placeholder: 'Ex: 50' },
  ],
  'Gerador de Criativos': [
    { name: 'produto', label: 'Nome do Produto/Serviço', type: 'text', placeholder: 'Ex: Curso de Marketing' },
    { name: 'publico', label: 'Público-Alvo', type: 'text', placeholder: 'Ex: Empreendedores digitais' },
  ],
  'Gerador de Copies de Conversão': [
    { name: 'produto', label: 'Nome do Produto/Serviço', type: 'text', placeholder: 'Ex: Mentoria de Negócios' },
    { name: 'beneficios', label: 'Principais Benefícios', type: 'text', placeholder: 'Ex: Aumentar vendas em 30%' },
  ],
  'Análise Viral': [
    { name: 'nicho', label: 'Nicho/Setor', type: 'text', placeholder: 'Ex: Moda Feminina, Fitness' },
    { name: 'canal', label: 'Rede Social Principal', type: 'text', placeholder: 'Ex: Instagram, TikTok' },
  ],
  'Rastreador Cirúrgico': [
    { name: 'site', label: 'URL do Site', type: 'url', placeholder: 'Ex: https://meusite.com.br' },
    { name: 'pixel_id', label: 'ID do Pixel (opcional)', type: 'text', placeholder: 'Ex: 1234567890' },
  ],
  'Preditor de Funil': [
    { name: 'cpc_medio', label: 'CPC Médio (R$)', type: 'number', placeholder: 'Ex: 1.50' },
    { name: 'taxa_conversao', label: 'Taxa de Conversão da LP (%)', type: 'number', placeholder: 'Ex: 2.5' },
    { name: 'ticket_medio', label: 'Ticket Médio (R$)', type: 'number', placeholder: 'Ex: 197' },
  ],
  'Diagnóstico de Landing Page': [
    { name: 'url_lp', label: 'URL da Landing Page', type: 'url', placeholder: 'Ex: https://meusite.com.br/landing' },
    { name: 'objetivo', label: 'Objetivo de Conversão', type: 'text', placeholder: 'Ex: Venda, Lead, Cadastro' },
  ],
  'Simulador de ROAS': [
    { name: 'meta_faturamento', label: 'Meta de Faturamento (R$)', type: 'number', placeholder: 'Ex: 50000' },
    { name: 'ticket_medio', label: 'Ticket Médio (R$)', type: 'number', placeholder: 'Ex: 250' },
  ],
  'SEO & GEO': [
    { name: 'url_site', label: 'URL do Site', type: 'url', placeholder: 'Ex: https://meusite.com.br' },
    { name: 'palavras_chave', label: 'Palavras-Chave Foco', type: 'text', placeholder: 'Ex: neuroads, trafego pago' },
  ],
  'Diagnóstico de Funil': [
    { name: 'visitas', label: 'Visitas Mensais', type: 'number', placeholder: 'Ex: 10000' },
    { name: 'leads', label: 'Leads Gerados', type: 'number', placeholder: 'Ex: 1500' },
    { name: 'vendas', label: 'Vendas Realizadas', type: 'number', placeholder: 'Ex: 150' },
  ],
  'Gerador de Testes A/B': [
    { name: 'pagina', label: 'Página do Teste', type: 'url', placeholder: 'Ex: https://meusite.com.br' },
    { name: 'elemento', label: 'Elemento a Testar', type: 'text', placeholder: 'Ex: Botão de CTA, Headline' },
  ],
  'Prospector Outbound': [
    { name: 'segmento', label: 'Segmento Alvo', type: 'text', placeholder: 'Ex: Tecnologia, E-commerce, Clínicas' },
    { name: 'cargo', label: 'Cargo do Decisor', type: 'text', placeholder: 'Ex: CEO, Diretor de Marketing' },
  ],
  'Qualificador de ICP': [
    { name: 'lead_name', label: 'Nome do Lead', type: 'text', placeholder: 'Ex: Carlos Souza' },
    { name: 'lead_empresa', label: 'Empresa do Lead', type: 'text', placeholder: 'Ex: Logística Express' },
  ],
  'Atendimento 24/7': [
    { name: 'canal', label: 'Canal de Atendimento', type: 'text', placeholder: 'Ex: WhatsApp, Webchat' },
    { name: 'faq_url', label: 'URL da FAQ/Ajuda', type: 'url', placeholder: 'Ex: https://ajuda.meusite.com' },
  ],
  'Histórico de Cliente': [
    { name: 'email_cliente', label: 'E-mail do Cliente', type: 'text', placeholder: 'Ex: cliente@empresa.com' },
  ],
  'Closer por Chat': [
    { name: 'lead_name', label: 'Nome do Lead', type: 'text', placeholder: 'Ex: Mariana Silva' },
    { name: 'proposta_valor', label: 'Valor Proposto (R$)', type: 'number', placeholder: 'Ex: 15000' },
  ],
  'Contrato & Pagamento': [
    { name: 'email_cliente', label: 'E-mail para Envio', type: 'text', placeholder: 'Ex: cliente@empresa.com' },
    { name: 'valor_contrato', label: 'Valor do Contrato (R$)', type: 'number', placeholder: 'Ex: 15000' },
  ],
  'Reativação de Inativos': [
    { name: 'dias_inativo', label: 'Dias de Inatividade', type: 'number', placeholder: 'Ex: 30' },
    { name: 'oferta', label: 'Oferta de Reativação', type: 'text', placeholder: 'Ex: Desconto de 20% no primeiro mês' },
  ],
  'Upsell Inteligente': [
    { name: 'email_cliente', label: 'E-mail do Cliente', type: 'text', placeholder: 'Ex: joao@empresa.com' },
    { name: 'plano_atual', label: 'Plano Atual', type: 'text', placeholder: 'Ex: Plano Standard' },
  ],
  'Fluxos de Nutrição': [
    { name: 'segmento', label: 'Segmento de Leads', type: 'text', placeholder: 'Ex: E-books / Leads Frios' },
    { name: 'plataforma', label: 'Plataforma de E-mail', type: 'text', placeholder: 'Ex: RD Station, ActiveCampaign' },
  ],
  'Lead Scoring': [
    { name: 'pontuacao_minima', label: 'Pontuação Mínima para Abordagem', type: 'number', placeholder: 'Ex: 80' },
  ],
  'Briefing de Reunião': [
    { name: 'nome_reuniao', label: 'Assunto da Reunião', type: 'text', placeholder: 'Ex: Reunião Comercial' },
    { name: 'participantes', label: 'Participantes Principais', type: 'text', placeholder: 'Ex: CEO e Diretor de Vendas' },
  ],
  'Gestor de Tarefas': [
    { name: 'titulo_tarefa', label: 'Título da Tarefa', type: 'text', placeholder: 'Ex: Revisar criativos da campanha' },
    { name: 'responsavel', label: 'Responsável', type: 'text', placeholder: 'Ex: Paola' },
  ],
  'Auditor de Desperdício': [
    { name: 'plataforma', label: 'Plataforma de Anúncios', type: 'text', placeholder: 'Ex: Google Ads, Meta Ads' },
    { name: 'cpa_limite', label: 'CPA Limite Máximo (R$)', type: 'number', placeholder: 'Ex: 60' },
  ],
  'Otimizador de Orçamento': [
    { name: 'orcamento_mensal', label: 'Orçamento Mensal (R$)', type: 'number', placeholder: 'Ex: 10000' },
    { name: 'meta_roas', label: 'Meta de ROAS Mínimo', type: 'number', placeholder: 'Ex: 3.5' },
  ],
  'Agente Editorial': [
    { name: 'tema', label: 'Tema / Pauta do Conteúdo', type: 'text', placeholder: 'Ex: Tendências de IA B2B' },
    { name: 'formato', label: 'Formato Principal', type: 'text', placeholder: 'Ex: Artigo de opinião, Post longo' },
  ],
  'Gerador de Carrossel': [
    { name: 'tema', label: 'Tema do Carrossel', type: 'text', placeholder: 'Ex: 5 erros no tráfego pago B2B' },
    { name: 'quantidade_slides', label: 'Quantidade de Slides', type: 'number', placeholder: 'Ex: 7' },
  ],
  'Roteirista de Vídeo': [
    { name: 'gancho', label: 'Gancho Inicial / Ideia', type: 'text', placeholder: 'Ex: Como dobrar conversões com SDR' },
    { name: 'plataforma', label: 'Plataforma de Vídeo', type: 'text', placeholder: 'Ex: Meta (Reels), TikTok, YouTube' },
  ],
  'Redator de Artigos': [
    { name: 'titulo_sugerido', label: 'Título Sugerido ou Palavra-Chave', type: 'text', placeholder: 'Ex: Guia Completo de CRO' },
    { name: 'objetivo', label: 'Objetivo do Artigo', type: 'text', placeholder: 'Ex: Captar Leads, SEO, Autoridade' },
  ],
  'Analisador de Público': [
    { name: 'site_concorrente', label: 'Site do Concorrente (URL)', type: 'url', placeholder: 'Ex: https://concorrente.com' },
    { name: 'publico_alvo', label: 'Público Atual da Empresa', type: 'text', placeholder: 'Ex: Gestores de Performance B2B' },
  ],
  'Avaliador de Oferta': [
    { name: 'oferta_descricao', label: 'Descrição da Oferta Atual', type: 'text', placeholder: 'Ex: Plano trimestral com 20% OFF' },
    { name: 'valor_produto', label: 'Preço / Valor (R$)', type: 'number', placeholder: 'Ex: 497' },
  ],
  'Radar de Oportunidades': [
    { name: 'objetivo_negocio', label: 'Principal Objetivo de Negócio', type: 'text', placeholder: 'Ex: Escalar receita com mesmo CAC' },
    { name: 'canal_foco', label: 'Canal de Foco', type: 'text', placeholder: 'Ex: Meta Ads, Outbound' },
  ],
  'Análise de Concorrentes': [
    { name: 'url_concorrente', label: 'URL do Concorrente', type: 'url', placeholder: 'Ex: https://concorrente.com' },
    { name: 'itens_analisar', label: 'Itens para Focar', type: 'text', placeholder: 'Ex: Preço, Proposta de valor, Copy' },
  ],
  'Público-Alvo Ideal': [
    { name: 'produto_servico', label: 'Seu Produto/Serviço', type: 'text', placeholder: 'Ex: Software CRM de Vendas' },
    { name: 'ticket_medio', label: 'Ticket Médio (R$)', type: 'number', placeholder: 'Ex: 1500' },
  ],
};

type AutomationSuggestion = {
  id: string;
  title: string;
  objective: string;
  cadence: string;
  monthlyExecutions: number;
  distribution: string;
  scheduleOptions: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getDnaHistoryPayload(entry: AgentReportHistoryEntry | null): {
  presentation: DnaBrandPresentation;
  sources: DnaBrandSource[];
} | null {
  if (!entry || entry.agentTitle !== 'DNA da Marca') return null;
  const metadata = entry.metadata;
  if (!isRecord(metadata)) return null;

  const presentationRaw = metadata.dnaPresentation;
  const sourcesRaw = metadata.dnaSources;

  if (!isRecord(presentationRaw) || !Array.isArray(sourcesRaw)) return null;

  return {
    presentation: presentationRaw as unknown as DnaBrandPresentation,
    sources: sourcesRaw as unknown as DnaBrandSource[],
  };
}

function getCadenceContext(category: string, title: string) {
  const byCategory: Record<string, { objective: string; distribution: string }> = {
    Performance: {
      objective: 'Ajustes rápidos em campanhas, orçamento e segmentações para sustentar ROI.',
      distribution: 'Seg: diagnóstico | Qua: otimização | Sex: validação de performance',
    },
    Inteligência: {
      objective: 'Análises estratégicas e decisões orientadas por sinais de mercado e comportamento.',
      distribution: 'Ter: pesquisa e insights | Qui: refinamento de direcionamento | Sex: plano de ação',
    },
    Criativos: {
      objective: 'Ciclos contínuos de ideação, variações e melhoria de mensagens criativas.',
      distribution: 'Seg: briefing | Qua: variações | Sex: revisão de conversão',
    },
    Técnico: {
      objective: 'Estabilidade de tracking, testes técnicos e evolução da infraestrutura de marketing.',
      distribution: 'Ter: auditoria técnica | Qui: implementação | Sex: validação e monitoramento',
    },
  };

  const fallback = {
    objective: 'Rotina estratégica para evolução contínua da operação com foco em previsibilidade.',
    distribution: 'Seg: planejamento | Qua: execução | Sex: revisão',
  };

  if (title === 'SEO & GEO') {
    return {
      objective: 'Evolução contínua de autoridade orgânica e presença em respostas de IAs generativas.',
      distribution: 'Seg: auditoria e keywords | Qua: otimização on-page/schema | Sex: GEO e menções externas',
    };
  }

  return byCategory[category] ?? fallback;
}

function getAgentHeroDescription(agent: Agent | null): React.ReactNode | null {
  if (!agent?.heroDescription) return null;
  const titleStr = agent.title;
  const match = titleStr === 'Agente Editorial' 
    ? `O <strong className="text-[#0f172a]">${titleStr}</strong> `
    : `O agente <strong className="text-[#0f172a]">${titleStr}</strong> `;

  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: match }} />
      {agent.heroDescription}
    </>
  );
}

function getRequiredConnectorKeysForAgent(agent: Agent | null): ConnectorKey[] {
  if (agent?.requiredConnectors && agent.requiredConnectors.length > 0) {
    return agent.requiredConnectors;
  }
  // Fallbacks if not specified
  if (agent?.category === 'Performance') return ['googleAds', 'metaAds', 'linkedinAds', 'ga4'];
  if (agent?.category === 'Criativos') return ['googleAds', 'metaAds', 'ga4'];
  if (agent?.category === 'Técnico') return ['ga4', 'serverTracking', 'warehouse'];
  return ['ga4', 'crm', 'warehouse'];
}

function getConnectionStatusFromProfile(profile: unknown): Record<ConnectorKey, boolean> {
  const profileRecord = isRecord(profile) ? profile : null;
  const connectionsRaw = profileRecord?.connections;
  const connections = isRecord(connectionsRaw)
    ? (connectionsRaw as Record<string, ConnectorConnection | null | undefined>)
    : null;
  return getConnectorStatusFromConnections(connections);
}

function buildAutomationSuggestions(entry: { title: string; category: string; planSummary?: { monthlyLimit?: number } }): AutomationSuggestion[] {
  const limit = Math.max(6, entry.planSummary?.monthlyLimit ?? 12);
  const context = getCadenceContext(entry.category, entry.title);

  const conservative = Math.max(4, Math.round(limit * 0.45));
  const balanced = Math.max(conservative + 1, Math.round(limit * 0.75));
  const scale = limit;

  const toCadence = (executions: number) => {
    const weekly = Math.max(1, Math.round(executions / 4));
    const days =
      weekly <= 2
        ? '2x por semana'
        : weekly <= 4
          ? '4x por semana'
          : weekly <= 6
            ? '6x por semana'
            : 'execução diária';
    return `${days} (${weekly} rotinas/semana)`;
  };

  return [
    {
      id: 'conservative',
      title: 'Cadência Essencial',
      objective: `${context.objective} Com foco em consistência e baixo esforço operacional.`,
      cadence: toCadence(conservative),
      monthlyExecutions: conservative,
      distribution: context.distribution,
      scheduleOptions: [
        { id: 'conservative_mon_thu_0900', label: 'Seg e Qui • 09:00', detail: 'Revisão no início da manhã para ajustes rápidos antes do pico.' },
        { id: 'conservative_tue_fri_1430', label: 'Ter e Sex • 14:30', detail: 'Acompanhamento no meio da tarde com janela para correções no mesmo dia.' },
      ],
    },
    {
      id: 'balanced',
      title: 'Cadência Estratégica',
      objective: `${context.objective} Equilíbrio ideal entre aprendizado, execução e estabilidade.`,
      cadence: toCadence(balanced),
      monthlyExecutions: balanced,
      distribution: context.distribution,
      scheduleOptions: [
        { id: 'balanced_mon_wed_fri_0830', label: 'Seg, Qua e Sex • 08:30', detail: 'Ritmo clássico para abrir, ajustar e consolidar a semana.' },
        { id: 'balanced_tue_thu_sat_1000', label: 'Ter, Qui e Sáb • 10:00', detail: 'Distribuição equilibrada com revisão extra no sábado.' },
        { id: 'balanced_mon_wed_fri_1700', label: 'Seg, Qua e Sex • 17:00', detail: 'Leitura de fechamento diário para replanejar o dia seguinte.' },
      ],
    },
    {
      id: 'scale',
      title: 'Cadência Máxima do Plano',
      objective: `${context.objective} Uso total do limite contratado para acelerar resultados.`,
      cadence: toCadence(scale),
      monthlyExecutions: scale,
      distribution: context.distribution,
      scheduleOptions: [
        { id: 'scale_weekdays_0800', label: 'Seg a Sex • 08:00', detail: 'Ajustes agressivos na abertura de cada dia útil.' },
        { id: 'scale_weekdays_1230', label: 'Seg a Sex • 12:30', detail: 'Correções no meio do dia, após sinais iniciais de performance.' },
        { id: 'scale_weekdays_1800', label: 'Seg a Sex • 18:00', detail: 'Fechamento de rotina para rebalanceamento noturno.' },
        { id: 'scale_daily_0900', label: 'Seg a Dom • 09:00', detail: 'Operação contínua inclusive fim de semana para contas com alto giro.' },
      ],
    },
  ];
}

export default function AgentEntryPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isCustomAutomationModalOpen, setIsCustomAutomationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<AgentReportHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyActionError, setHistoryActionError] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [historyMenuReportId, setHistoryMenuReportId] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [selectedScheduleOptionId, setSelectedScheduleOptionId] = useState<string | null>(null);
  const [automationActivated, setAutomationActivated] = useState(false);
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [isLoadingAutomation, setIsLoadingAutomation] = useState(false);
  const [automationNotice, setAutomationNotice] = useState<string | null>(null);

  const [selectedOperationTitle, setSelectedOperationTitle] = useState('');
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, string>>({});

  const contracts = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const agent = useMemo(() => (slug ? getAgentBySlug(slug) : undefined), [slug]);
  const entry = useMemo(() => (agent ? getAgentEntryDefinition(agent, contracts) : null), [agent, contracts]);

  const teamAgent = useMemo(() => {
    if (!agent) return null;
    return TEAM_AGENTS.find((ta) => ta.specialtyTitles.includes(agent.title)) || null;
  }, [agent]);

  useEffect(() => {
    if (entry) {
      setSelectedOperationTitle(entry.title);
    }
  }, [entry]);
  const automationSuggestions = useMemo(() => {
    if (!entry) return [];
    return buildAutomationSuggestions(entry);
  }, [entry]);
  const selectedSuggestion = useMemo(
    () => automationSuggestions.find((item) => item.id === selectedAutomationId) ?? null,
    [automationSuggestions, selectedAutomationId]
  );
  const selectedScheduleOption = useMemo(() => {
    if (!selectedSuggestion) return null;
    return selectedSuggestion.scheduleOptions.find((item) => item.id === selectedScheduleOptionId) ?? null;
  }, [selectedScheduleOptionId, selectedSuggestion]);
  const selectedHistoryEntry = useMemo(() => {
    if (!historyEntries.length) return null;
    if (!selectedHistoryId) return historyEntries[0];
    return historyEntries.find((item) => item.id === selectedHistoryId) ?? historyEntries[0];
  }, [historyEntries, selectedHistoryId]);
  const dnaHistoryPayload = useMemo(
    () => getDnaHistoryPayload(selectedHistoryEntry),
    [selectedHistoryEntry]
  );
  const agentAutomationKey = useMemo(() => (entry ? slugifyAgentTitle(entry.title) : ''), [entry]);
  const heroDescription = useMemo(() => getAgentHeroDescription(agent ?? null), [agent]);
  const connectorStatus = useMemo(() => getConnectionStatusFromProfile(profile), [profile]);
  const requiredConnectorKeys = useMemo(
    () => getRequiredConnectorKeysForAgent(agent ?? null),
    [agent]
  );
  const requiredConnectors = useMemo(() => {
    if (!entry) return [];
    return requiredConnectorKeys.map((key) => {
      const definition = CONNECTOR_DEFINITIONS.find((item) => item.key === key);
      return {
        key,
        name: definition?.name ?? key,
        source: definition?.source ?? 'Conector',
        isActive: connectorStatus[key],
      };
    });
  }, [connectorStatus, entry, requiredConnectorKeys]);
  const inactiveRequiredConnectors = useMemo(
    () => requiredConnectors.filter((connector) => !connector.isActive),
    [requiredConnectors]
  );

  const formatHistoryDate = (dateIso: string) => {
    const parsed = new Date(dateIso);
    if (Number.isNaN(parsed.getTime())) return 'Data indisponível';
    return parsed.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openHistoryModal = async () => {
    if (!user?.uid || !entry) {
      setHistoryEntries([]);
      setSelectedHistoryId(null);
      setHistoryError('Faça login para acessar o histórico.');
      setIsHistoryModalOpen(true);
      return;
    }

    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setHistoryError(null);
    setHistoryActionError(null);
    setHistoryMenuReportId(null);
    try {
      const entries = await getLatestAgentReportsFromDb(user.uid, entry.slug, 10);
      setHistoryEntries(entries);
      setSelectedHistoryId(entries[0]?.id ?? null);
    } catch (error) {
      console.error('Erro ao abrir histórico do agente:', error);
      setHistoryEntries([]);
      setSelectedHistoryId(null);
      setHistoryError('Não foi possível carregar o histórico neste momento.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteHistoryEntry = async (reportId: string) => {
    if (!user?.uid) {
      setHistoryActionError('Faça login para excluir relatórios.');
      return;
    }

    const shouldDelete = window.confirm('Deseja realmente excluir este relatório do histórico?');
    if (!shouldDelete) return;

    setHistoryActionError(null);
    setHistoryMenuReportId(null);
    setDeletingReportId(reportId);
    try {
      const deleteResult = await deleteAgentReportFromDb(user.uid, reportId);
      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Falha ao excluir relatório.');
      }

      setHistoryEntries((prev) => {
        const next = prev.filter((entry) => entry.id !== reportId);
        setSelectedHistoryId((current) => {
          if (current !== reportId) return current;
          return next[0]?.id ?? null;
        });
        return next;
      });
    } catch (error) {
      console.error('Erro ao excluir relatório do histórico:', error);
      setHistoryActionError('Não foi possível excluir este relatório agora. Tente novamente.');
    } finally {
      setDeletingReportId(null);
    }
  };

  useEffect(() => {
    if (!historyMenuReportId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-history-menu-root="true"]')) return;
      setHistoryMenuReportId(null);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [historyMenuReportId]);

  useEffect(() => {
    if (!automationSuggestions.length) return;
    setSelectedAutomationId((current) => current ?? automationSuggestions[1]?.id ?? automationSuggestions[0].id);
  }, [automationSuggestions]);

  useEffect(() => {
    if (!selectedSuggestion) return;
    setSelectedScheduleOptionId((current) => {
      const exists = selectedSuggestion.scheduleOptions.some((option) => option.id === current);
      if (exists) return current;
      return selectedSuggestion.scheduleOptions[0]?.id ?? null;
    });
  }, [selectedSuggestion]);

  useEffect(() => {
    const loadPersistedAutomation = async () => {
      if (!user || !entry || !agentAutomationKey) return;

      setIsLoadingAutomation(true);
      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const userData = snapshot.data() as
          | { automations?: Record<string, { cadenceId?: string; status?: string; scheduleOptionId?: string }> }
          | undefined;
        const persisted = userData?.automations?.[agentAutomationKey];

        if (persisted) {
          // Support legacy records that may have `status` but no `cadenceId`.
          setAutomationActivated(persisted.status === 'active');
          if (persisted.cadenceId) {
            setSelectedAutomationId(persisted.cadenceId);
          }
          if (persisted.scheduleOptionId) {
            setSelectedScheduleOptionId(persisted.scheduleOptionId);
          }
        } else {
          setAutomationActivated(false);
        }
      } catch (error) {
        console.error('Erro ao carregar automação persistida:', error);
      } finally {
        setIsLoadingAutomation(false);
      }
    };

    loadPersistedAutomation();
  }, [agentAutomationKey, entry, user]);

  return (
    <div className="w-full space-y-6 text-slate-800">
      <div className="relative">
        <div className="relative z-10 py-6">
          {!agent || !entry ? (
            <div className="max-w-3xl mx-auto p-8 md:p-10 rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff] text-center text-slate-800">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Agente</p>
              <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-4">Agente não encontrado</h1>
              <p className="text-base text-slate-600 font-semibold mb-8">
                O endereço informado não corresponde a um agente válido do Hub.
              </p>
              <button
                type="button"
                onClick={() => router.push('/hub')}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/50 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] text-slate-700 font-bold px-6 text-[13px] transition-all hover:scale-105 active:scale-95"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : !entry.isActive ? (
            <div className="max-w-3xl mx-auto p-8 md:p-10 rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff] text-slate-800">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold mb-3">{entry.category}</p>
              <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-4">{entry.title}</h1>
              <p className="text-base text-slate-600 font-semibold mb-8">
                Este agente ainda não está ativo na sua conta. Faça a contratação no Hub para liberar a janela funcional individual.
              </p>
              <div className="mb-8 rounded-2xl border border-white/20 bg-[#eef2f7] p-4 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#0f172a]">Canais necessários para operação</p>
                  <button
                    type="button"
                    onClick={() => router.push('/hub/conectores')}
                    className="rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-700 font-bold px-4 py-2 text-xs transition-all"
                  >
                    Abrir Conectores
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {requiredConnectors.map((connector) => (
                    <div
                      key={connector.key}
                      className={`rounded-full border px-5 py-2.5 shadow-[1px_1px_2px_#d1d9e6,_-1px_-1px_2px_#ffffff] ${
                        connector.isActive
                           ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                           : 'border-red-500/20 bg-red-500/10 text-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-slate-700">{connector.name}</p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
                            connector.isActive
                              ? 'border-emerald-500/20 bg-emerald-500/20 text-emerald-700'
                              : 'border-red-500/20 bg-red-500/20 text-red-700'
                          }`}
                        >
                          {connector.isActive ? 'ATIVA' : 'INATIVA'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/hub')}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/50 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] text-slate-700 font-bold px-6 text-[13px] transition-all hover:scale-105 active:scale-95"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 py-8 mb-8">
                <div className="flex items-start lg:items-center gap-4">
                  <div className="shrink-0 w-16 h-16 rounded-[16px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]">
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#eef2f7]">
                      <Image src={agent.icon} alt={entry.title} fill className="object-cover" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-[#0f172a] leading-none">
                      {entry.title}
                    </h1>
                    <p className="text-[12px] font-bold text-[#FF6B00] mt-1.5 uppercase tracking-widest">
                      {entry.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAutomationNotice(null);
                      setIsCustomAutomationModalOpen(true);
                    }}
                    className="h-11 px-6 rounded-xl border border-[#FF6B00]/40 bg-gradient-to-br from-[#FF6B00] to-[#FF8F1F] text-white text-[13px] font-bold uppercase tracking-wider transition-all shadow-[3px_3px_6px_rgba(255,106,0,0.2),_-3px_-3px_6px_#ffffff] hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <Activity size={14} className="inline mr-2 -mt-[2px]" />
                    Programar Automação
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void openHistoryModal();
                    }}
                    className="h-11 px-6 rounded-xl border border-white/50 bg-[#eef2f7] text-[13px] font-bold uppercase tracking-wider text-slate-700 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
                  >
                    <History size={14} className="inline mr-2 -mt-[2px] text-slate-500" />
                    Histórico
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/hub')}
                    className="h-11 px-6 rounded-xl border border-white/50 bg-[#eef2f7] text-[13px] font-bold uppercase tracking-wider text-slate-700 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
                  >
                    Voltar ao Hub
                  </button>
                </div>
              </header>

              {heroDescription ? (
                <div className="p-6 rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
                  <p className="max-w-[800px] text-[14px] leading-relaxed text-slate-600 font-semibold [&_strong]:text-[#0f172a]">
                    {heroDescription}
                  </p>
                </div>
              ) : null}

              <section className="relative overflow-hidden p-6 rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff] text-slate-800">
                <div className="pb-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-transparent">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">Canais Necessários</p>
                    <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">Status operacional deste agente</h2>
                    <p className="text-xs font-semibold text-slate-500">
                      As conexões são gerenciadas exclusivamente na janela <strong>Conectores</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/hub/conectores')}
                    className="rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-700 font-bold px-4 py-2 text-xs transition-all"
                  >
                    Abrir Conectores
                  </button>
                </div>

                <div className="pt-6">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {requiredConnectors.map((connector) => (
                      <div
                        key={connector.key}
                        className={`rounded-[24px] border p-4 transition-all duration-200 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] ${
                          connector.isActive
                            ? 'border-emerald-500/20 bg-[#eef2f7]'
                            : 'border-red-500/20 bg-[#eef2f7]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-[#0f172a]">{connector.name}</p>
                            <p className="text-xs text-slate-400 font-semibold">{connector.source}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${
                              connector.isActive
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
                                : 'border-red-500/20 bg-red-500/10 text-red-700'
                            }`}
                          >
                            {connector.isActive ? 'ATIVA' : 'INATIVA'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 text-slate-800">
                {(() => {
                  // ── Registry lookup: O(1) — adicionar novo agente = 2 linhas em agent-workspace-registry.ts
                  const WorkspaceComponent = getWorkspaceForAgent(entry.title);
                  const workspaceProps = {
                    userId: user?.uid,
                    agentSlug: entry.slug,
                    agentTitle: entry.title,
                    agentCategory: entry.category,
                  };

                  if (WorkspaceComponent) {
                    return (
                      <div className="col-span-1">
                        <WorkspaceComponent {...workspaceProps} />
                      </div>
                    );
                  }

                  // Fallback: agente sem workspace específico
                  return (
                    <div className="col-span-1">
                      <GenericAgentWorkspace
                        key={`${user?.uid ?? 'anon'}-${entry.slug}`}
                        userId={user?.uid}
                        agentTitle={entry.title}
                        category={entry.category}
                        description={agent.longDescription}
                        monthlyLimit={entry.planSummary?.monthlyLimit}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {entry && isAutomationModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4 py-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsAutomationModalOpen(false)} />

          <div className="relative w-full max-w-[1120px] max-h-[96vh] rounded-[32px] bg-[#eef2f7] border border-white/80 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] overflow-hidden animate-in fade-in zoom-in-95 duration-250 text-slate-800 flex flex-col">
            <div className="relative border-b border-slate-200 bg-[#eef2f7] px-6 py-5 flex flex-col gap-1 shrink-0">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">Automação Inteligente</p>
              <h3 className="text-2xl font-black text-[#0f172a]">Ativar Rotina do Agente</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Selecione uma cadência para <strong>{entry.title}</strong>, respeitando o plano atual e o limite contratado.
              </p>
              <button
                type="button"
                onClick={() => setIsAutomationModalOpen(false)}
                className="absolute right-5 top-5 rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 p-2 transition-all hover:scale-105 active:scale-95 z-50 animate-all"
                aria-label="Fechar modal de automação"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="rounded-xl border border-white/30 bg-[#eef2f7] px-4 py-3 text-sm text-slate-600 font-semibold shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                Plano: <strong className="text-[#0f172a]">{entry.planSummary?.planName ?? 'A confirmar'}</strong> • Limite mensal:{' '}
                <strong className="text-[#0f172a]">{entry.planSummary?.monthlyLimit ?? 0} execuções</strong>
              </div>
              {isLoadingAutomation && (
                <div className="rounded-xl border border-white/30 bg-[#eef2f7] px-4 py-3 text-sm text-slate-600 font-semibold shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  Carregando configuração de automação salva…
                </div>
              )}
              {inactiveRequiredConnectors.length > 0 && (
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-700 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  Para ativar esta automação, conecte primeiro: {inactiveRequiredConnectors.map((connector) => connector.name).join(', ')}.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {automationSuggestions.map((option) => {
                  const isSelected = selectedAutomationId === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelectedAutomationId(option.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedAutomationId(option.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className={`w-full cursor-pointer text-left rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] text-[#0f172a]'
                          : 'border-white/50 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] text-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-base font-black text-[#0f172a]">{option.title}</p>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">
                          {option.monthlyExecutions} execuções/mês
                        </span>
                      </div>
                      <p className={`mt-2 text-xs leading-relaxed ${isSelected ? 'text-slate-600 font-semibold' : 'text-slate-500 font-semibold line-clamp-2'}`}>{option.objective}</p>
                      <p className="mt-3 text-xs text-slate-500 font-semibold">
                        Cadência: <strong className="text-[#0f172a]">{option.cadence}</strong>
                      </p>
                      {isSelected ? <p className="mt-1.5 text-xs text-slate-500 font-semibold">{option.distribution}</p> : null}
                      {isSelected ? (
                        <div className="mt-4 rounded-xl border border-white/20 bg-[#eef2f7] p-3.5 space-y-2 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">
                            Sugestões de dias e horários
                          </p>
                          <div className="mt-2 grid grid-cols-1 gap-2">
                            {option.scheduleOptions.map((schedule) => {
                              const isScheduleSelected = selectedScheduleOptionId === schedule.id;
                              return (
                                <button
                                  key={schedule.id}
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedScheduleOptionId(schedule.id);
                                  }}
                                  className={`cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 w-full ${
                                    isScheduleSelected
                                      ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                                      : 'border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]'
                                  }`}
                                >
                                  <p className="text-xs font-black text-[#0f172a]">{schedule.label}</p>
                                  <p className="mt-1 text-[11px] leading-snug text-slate-500 font-semibold">{schedule.detail}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAutomationModalOpen(false)}
                  className="rounded-xl border border-white/50 bg-[#eef2f7] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all hover:scale-105 active:scale-95"
                >
                  Fechar
                </button>

                <button
                  type="button"
                  disabled={!selectedSuggestion || !selectedScheduleOption || inactiveRequiredConnectors.length > 0}
                  onClick={async () => {
                    if (!selectedSuggestion || !selectedScheduleOption || !user || !entry || !agentAutomationKey) return;
                    if (inactiveRequiredConnectors.length > 0) {
                      setAutomationNotice(
                        `Conecte os canais obrigatórios antes de confirmar: ${inactiveRequiredConnectors
                          .map((connector) => connector.name)
                          .join(', ')}.`
                      );
                      return;
                    }

                    const shouldConfirm = window.confirm(
                      `Confirmar programação para ${entry.title}?\n\nCadência: ${selectedSuggestion.title}\nAgenda sugerida: ${selectedScheduleOption.label}`
                    );
                    if (!shouldConfirm) return;

                    setIsSavingAutomation(true);
                    setAutomationNotice(null);
                    try {
                      const timestamps = buildAutomationTimestamps({
                        cadence: selectedSuggestion.cadence,
                        monthlyExecutions: selectedSuggestion.monthlyExecutions,
                        scheduleOptionLabel: selectedScheduleOption.label,
                      });
                      const db = getFirebaseDb();
                      const userRef = doc(db, 'users', user.uid);
                      const payload = {
                        [`automations.${agentAutomationKey}`]: {
                          status: 'active',
                          agentTitle: entry.title,
                          agentCategory: entry.category,
                          cadenceId: selectedSuggestion.id,
                          cadenceTitle: selectedSuggestion.title,
                          cadence: selectedSuggestion.cadence,
                          monthlyExecutions: selectedSuggestion.monthlyExecutions,
                          distribution: selectedSuggestion.distribution,
                          objective: selectedSuggestion.objective,
                          scheduleOptionId: selectedScheduleOption.id,
                          scheduleOptionLabel: selectedScheduleOption.label,
                          scheduleOptionDetail: selectedScheduleOption.detail,
                          planName: entry.planSummary?.planName ?? null,
                          monthlyLimit: entry.planSummary?.monthlyLimit ?? null,
                          activatedAt: Date.now(),
                          updatedAt: Date.now(),
                          lastUpdateAt: timestamps.lastUpdateAt,
                          nextUpdateAt: timestamps.nextUpdateAt,
                        },
                      };

                      await setDoc(userRef, payload, { merge: true });
                      setAutomationActivated(true);
                      setAutomationNotice('Programação salva com sucesso no seu perfil.');
                      setIsAutomationModalOpen(false);
                    } catch (error) {
                      console.error('Erro ao salvar automação:', error);
                      setAutomationActivated(false);
                      setAutomationNotice('Falha ao salvar automação. Tente novamente.');
                    } finally {
                      setIsSavingAutomation(false);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedSuggestion && !isSavingAutomation && inactiveRequiredConnectors.length === 0
                      ? 'bg-gradient-to-br from-[#08B760] to-[#0A9D57] text-white shadow-[3px_3px_6px_rgba(8,183,96,0.2),_-3px_-3px_6px_#ffffff] hover:brightness-105 active:scale-98'
                      : 'bg-[#eef2f7] text-slate-400 border border-white/20 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={14} className="shrink-0" />
                  {isSavingAutomation ? 'Salvando…' : 'Confirmar Automação'}
                </button>
              </div>

              {automationActivated && selectedSuggestion && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Automação ativada com a configuração <strong>{selectedSuggestion.title}</strong> para o agente{' '}
                    <strong>{entry.title}</strong>.
                    {selectedScheduleOption ? (
                      <>
                        {' '}
                        Agenda selecionada: <strong>{selectedScheduleOption.label}</strong>.
                      </>
                    ) : null}
                  </span>
                </div>
              )}
              {automationNotice && !automationActivated && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  {automationNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCustomAutomationModalOpen && teamAgent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4 py-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsCustomAutomationModalOpen(false)} />

          <div className="relative w-full max-w-[1080px] max-h-[96vh] rounded-[32px] bg-[#eef2f7] border border-white/80 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] overflow-hidden animate-in fade-in zoom-in-95 duration-250 text-slate-800 flex flex-col">
            {/* Header */}
            <div className="relative border-b border-slate-200 bg-[#eef2f7] px-6 py-5 flex flex-col gap-1 shrink-0">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">Programação Automática</p>
              <h3 className="text-2xl font-black text-[#0f172a]">Programar Automação</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Configure a rotina automática para o agente <strong>{teamAgent.nome}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setIsCustomAutomationModalOpen(false)}
                className="absolute right-5 top-5 rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 p-2 transition-all hover:scale-105 active:scale-95 z-50 animate-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start text-left">
                
                {/* Left Column: Configuration */}
                <div className="space-y-5">
                  {/* Step 1: Select Operation */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                      1. Selecione a Operação do Agente:
                    </label>
                    <select
                      value={selectedOperationTitle}
                      onChange={(e) => {
                        setSelectedOperationTitle(e.target.value);
                        setCustomFieldsValues({});
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#FF6A00]/15 transition-all cursor-pointer text-slate-700"
                    >
                      <option value="">— Selecione uma Operação —</option>
                      {teamAgent.specialtyTitles.map((title) => (
                        <option key={title} value={title}>
                          ⚡ {title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedOperationTitle && (
                    <>
                      {/* Step 2: Connected Channels */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                          2. Canais Necessários para esta Operação:
                        </label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(() => {
                            const specObj = allSpecialties.find(s => s.title === selectedOperationTitle);
                            const requiredKeys = specObj?.requiredConnectors || [];
                            if (requiredKeys.length === 0) {
                              return <p className="text-xs text-slate-500 italic">Nenhum canal obrigatório para esta operação.</p>;
                            }
                            return requiredKeys.map((key) => {
                              const isConnected = connectorStatus[key];
                              return (
                                <div
                                  key={key}
                                  className={`rounded-full border px-4 py-2 flex items-center justify-between text-xs font-semibold ${
                                    isConnected
                                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700'
                                      : 'border-red-500/20 bg-red-500/5 text-red-700'
                                  }`}
                                >
                                  <span>{key}</span>
                                  <span className="text-[10px] font-black">{isConnected ? 'CONECTADO' : 'DESCONECTADO'}</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Step 3: Custom Fields for Specialty */}
                      {(() => {
                        const fields = SPECIALTY_FIELDS[selectedOperationTitle] || [];
                        if (fields.length === 0) return null;
                        return (
                          <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                              3. Configurações da Operação (Campos Necessários):
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                              {fields.map((f) => (
                                <div key={f.name} className="flex flex-col gap-1.5">
                                  <label className="text-xs font-bold text-slate-500">{f.label}</label>
                                  <input
                                    type={f.type === 'number' ? 'text' : f.type}
                                    placeholder={f.placeholder}
                                    value={customFieldsValues[f.name] || ''}
                                    onChange={(e) => setCustomFieldsValues(prev => ({ ...prev, [f.name]: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-white outline-none focus:ring-2 focus:ring-[#FF6A00]/15 transition-all text-slate-700"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Right Column: Cadence & Schedule */}
                <div className="space-y-5">
                  {selectedOperationTitle && (
                    <div className="space-y-4">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                        4. Cadência e Cronograma de Execução:
                      </label>
                      
                      {/* Cadences */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {automationSuggestions.map((suggestion) => {
                          const isSelected = selectedAutomationId === suggestion.id;
                          return (
                            <div
                              key={suggestion.id}
                              onClick={() => setSelectedAutomationId(suggestion.id)}
                              className={`cursor-pointer rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                                isSelected
                                  ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-[#0f172a]'
                                  : 'border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                              }`}
                            >
                              <p className="text-xs font-black text-[#0f172a]">{suggestion.title}</p>
                              <p className="mt-1 text-[10px] text-slate-500 font-semibold">{suggestion.cadence}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Schedule Options */}
                      {selectedSuggestion && (
                        <div className="mt-2 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Dias e horários recomendados</p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {selectedSuggestion.scheduleOptions.map((opt) => {
                              const isOptSelected = selectedScheduleOptionId === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedScheduleOptionId(opt.id)}
                                  className={`cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 w-full ${
                                    isOptSelected
                                      ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                                      : 'border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]'
                                  }`}
                                >
                                  <p className="text-xs font-black text-[#0f172a]">{opt.label}</p>
                                  <p className="mt-0.5 text-[10px] text-slate-500 font-semibold leading-tight">{opt.detail}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {automationNotice && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 shadow-sm mt-4">
                      {automationNotice}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-[#eef2f7] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomAutomationModalOpen(false)}
                className="rounded-xl border border-white/50 bg-[#eef2f7] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSavingAutomation || !selectedOperationTitle || !selectedSuggestion || !selectedScheduleOption}
                onClick={async () => {
                  if (!user || !teamAgent || !selectedOperationTitle || !selectedSuggestion || !selectedScheduleOption) return;
                  setIsSavingAutomation(true);
                  setAutomationNotice(null);
                  try {
                    const timestamps = buildAutomationTimestamps({
                      cadence: selectedSuggestion.cadence,
                      monthlyExecutions: selectedSuggestion.monthlyExecutions,
                      scheduleOptionLabel: selectedScheduleOption.label,
                    });
                    const db = getFirebaseDb();
                    const userRef = doc(db, 'users', user.uid);
                    
                    const automationKey = `${slugifyAgentTitle(teamAgent.nome)}-${slugifyAgentTitle(selectedOperationTitle)}`;
                    const payload = {
                      [`automations.${automationKey}`]: {
                        status: 'active',
                        agentTitle: selectedOperationTitle,
                        agentCategory: teamAgent.categoria,
                        cadenceId: selectedSuggestion.id,
                        cadenceTitle: selectedSuggestion.title,
                        cadence: selectedSuggestion.cadence,
                        monthlyExecutions: selectedSuggestion.monthlyExecutions,
                        distribution: selectedSuggestion.distribution,
                        objective: selectedSuggestion.objective,
                        scheduleOptionId: selectedScheduleOption.id,
                        scheduleOptionLabel: selectedScheduleOption.label,
                        scheduleOptionDetail: selectedScheduleOption.detail,
                        planName: entry?.planSummary?.planName || 'Growth',
                        monthlyLimit: entry?.planSummary?.monthlyLimit || 12,
                        activatedAt: Date.now(),
                        updatedAt: Date.now(),
                        lastUpdateAt: timestamps.lastUpdateAt,
                        nextUpdateAt: timestamps.nextUpdateAt,
                        customFieldsData: customFieldsValues,
                      },
                    };

                    await setDoc(userRef, payload, { merge: true });
                    setAutomationNotice('Automação programada com sucesso!');
                    setAutomationActivated(true);
                    setTimeout(() => {
                      setIsCustomAutomationModalOpen(false);
                      setAutomationNotice(null);
                    }, 1500);
                  } catch (error) {
                    console.error('Erro ao programar automação:', error);
                    setAutomationNotice('Erro ao salvar programação de automação.');
                  } finally {
                    setIsSavingAutomation(false);
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedOperationTitle && selectedSuggestion && selectedScheduleOption && !isSavingAutomation
                    ? 'bg-gradient-to-br from-[#08B760] to-[#0A9D57] text-white shadow-[3px_3px_6px_rgba(8,183,96,0.2),_-3px_-3px_6px_#ffffff] hover:brightness-105 active:scale-98'
                    : 'bg-[#eef2f7] text-slate-400 border border-white/20 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] cursor-not-allowed'
                }`}
              >
                {isSavingAutomation ? 'Programando...' : 'Programar Automação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {entry && isHistoryModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsHistoryModalOpen(false)} />

          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[32px] border border-white/80 bg-[#eef2f7] shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] text-slate-800 flex flex-col animate-in fade-in duration-250">
            <div className="relative border-b border-slate-200 bg-[#eef2f7] px-6 py-5 flex flex-col gap-1 shrink-0">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">{entry.category}</p>
              <h3 className="text-2xl font-black text-[#0f172a]">Histórico de Relatórios</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Últimos 10 relatórios do agente <strong>{entry.title}</strong>, prontos para visualização e download.
              </p>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="absolute right-5 top-5 rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 p-2 transition-all hover:scale-105 active:scale-95 shadow-sm z-50 animate-all"
                aria-label="Fechar histórico"
              >
                <X size={16} />
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="p-6">
                <div className="rounded-xl border border-white/30 bg-[#eef2f7] px-5 py-6 text-sm text-slate-500 font-semibold shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  Carregando histórico…
                </div>
              </div>
            ) : historyError ? (
              <div className="p-6">
                <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-5 py-6 text-sm text-orange-700 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  {historyError}
                </div>
              </div>
            ) : historyEntries.length === 0 ? (
              <div className="p-6">
                <div className="rounded-xl border border-white/30 bg-[#eef2f7] px-5 py-6 text-sm text-slate-500 font-semibold shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                  Ainda não existem relatórios salvos neste agente. Gere um relatório para iniciar o histórico.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 min-h-0 flex-1 overflow-hidden">
                <aside className="border-r border-slate-200 p-4 overflow-y-auto bg-[#eef2f7] shadow-[inset_3px_0_6px_-3px_#d1d9e6]">
                  {historyActionError ? (
                    <div className="mb-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-700 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                      {historyActionError}
                    </div>
                  ) : null}
                  <div className="space-y-3">
                    {historyEntries.map((item, index) => {
                      const isSelected = selectedHistoryEntry?.id === item.id;
                      const websiteUrl =
                        typeof item.metadata?.websiteUrl === 'string' ? item.metadata.websiteUrl : '';
                      const cleanedUrl = websiteUrl ? websiteUrl.replace(/^https?:\/\//i, '') : '';
                      const isDeletingCurrent = deletingReportId === item.id;
                      return (
                        <div
                          key={item.id}
                          data-history-menu-root="true"
                          className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-[#FF6B00]/40 bg-[#FF6B00]/5 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] text-[#0f172a]'
                              : 'border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] text-slate-700'
                          }`}
                          onClick={() => setSelectedHistoryId(item.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Relatório {historyEntries.length - index}</p>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHistoryMenuReportId((current) => (current === item.id ? null : item.id));
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500"
                                aria-label="Abrir menu de ações do relatório"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {historyMenuReportId === item.id ? (
                                <div className="absolute right-0 top-9 z-20 min-w-[148px] overflow-hidden rounded-2xl border border-white/80 bg-[#eef2f7] shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff]">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedHistoryId(item.id);
                                      setHistoryMenuReportId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#0f172a] hover:bg-slate-200"
                                  >
                                    <Eye size={13} className="text-slate-500" />
                                    Visualizar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void downloadAgentReport(item);
                                      setHistoryMenuReportId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-500/10"
                                  >
                                    <Download size={13} />
                                    Download
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleDeleteHistoryEntry(item.id);
                                    }}
                                    disabled={isDeletingCurrent}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold ${
                                      isDeletingCurrent
                                        ? 'cursor-not-allowed text-red-700 bg-red-500/10'
                                        : 'text-red-700 hover:bg-red-500/20'
                                    }`}
                                  >
                                    <Trash2 size={13} />
                                    {isDeletingCurrent ? 'Excluindo…' : 'Excluir'}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-bold text-[#0f172a] break-all">{item.reportTitle || cleanedUrl}</p>
                          <p className="mt-1 text-xs text-slate-500 font-semibold">{formatHistoryDate(item.generatedAt)}</p>
                          {item.metadata?.websiteUrl ? (
                            <p className="mt-2 text-xs text-slate-400 font-semibold line-clamp-2">{String(item.metadata.websiteUrl)}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </aside>

                <section className="p-5 md:p-6 overflow-y-auto flex-1 bg-transparent">
                  {selectedHistoryEntry ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-4 text-slate-600 font-semibold shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Agente</p>
                            <p className="mt-1 font-bold text-[#0f172a] break-all">{selectedHistoryEntry.agentTitle}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Gerado em</p>
                            <p className="mt-1 font-bold text-[#0f172a]">{formatHistoryDate(selectedHistoryEntry.generatedAt)}</p>
                          </div>
                        </div>
                        {selectedHistoryEntry.metadata?.websiteUrl ? (
                          <div className="mt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Referência</p>
                            <p className="mt-1 text-sm font-bold text-[#0f172a] break-all">{String(selectedHistoryEntry.metadata.websiteUrl)}</p>
                          </div>
                        ) : null}
                        {selectedHistoryEntry.metadata?.businessContext ? (
                          <div className="mt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">Contexto informado</p>
                            <p className="mt-1 text-sm text-slate-700">{String(selectedHistoryEntry.metadata.businessContext)}</p>
                          </div>
                        ) : null}
                      </div>

                      <article className="rounded-2xl border border-white/50 bg-[#eef2f7] p-5 shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                          <h4 className="text-base font-black text-[#0f172a]">Resultado Completo</h4>
                          <button
                            type="button"
                            onClick={() => {
                              void downloadAgentReport(selectedHistoryEntry);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_6px_rgba(8,183,96,0.2),_-3px_-3px_6px_#ffffff] transition-all hover:brightness-105"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                        {dnaHistoryPayload ? (
                          <DnaBrandPresentationPanel
                            presentation={dnaHistoryPayload.presentation}
                            sources={dnaHistoryPayload.sources}
                            generatedAt={selectedHistoryEntry.generatedAt}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-700 font-semibold font-sans">
                            {selectedHistoryEntry.reportContent}
                          </pre>
                        )}
                      </article>
                    </div>
                  ) : null}
                </section>
              </div>
            )}
          </div>
        </div>
      )}

      </div>
  );
}
