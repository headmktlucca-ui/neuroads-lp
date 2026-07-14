'use client';

/**
 * Automações — exibe apenas as automações ativas do usuário logado.
 * Dados reais lidos do perfil Firebase (campo automations / workflows).
 * Se nenhuma automação estiver ativa, exibe empty state com CTA.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, Brain, CheckCircle2, ChevronRight,
  Clock, Cpu, ExternalLink, Power, Search, Sparkles, X, Zap, Edit, Trash2, Play, Pause, Database, Settings
} from 'lucide-react';
import { collection, onSnapshot, query, where, updateDoc, doc, addDoc, increment, deleteField } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';
import { getHubAutomationsFromProfile, formatAutomationDateTime, buildAutomationTimestamps, type HubAutomationEntry } from '../../../lib/hub-automations';

import { agents as allSpecialties } from '../../../data/agents';

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

// ─── Reusable KPI Icon Wrapper ──────────────────────────────────────────────

function KpiIconWrapper({
  children,
  fromColor,
  toColor,
  shadowColor
}: {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  shadowColor: string;
}) {
  return (
    <div 
      className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-white relative shrink-0"
      style={{
        background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
        boxShadow: `0 5px 10px ${shadowColor}`,
      }}
    >
      <div className="absolute top-[4px] left-[12px] w-[18px] h-[10px] bg-white/30 rounded-full"></div>
      <div className="absolute inset-[7px] rounded-full border border-white/15"></div>
      <div className="relative z-10 shrink-0">
        {children}
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  frequency: string;
  category: string;
  runsTotal: number;
  lastRunAt: string | null;
  createdAt: string;
  isActive: boolean;
  rawEntry?: HubAutomationEntry;
}

// ─── Category accent colors ───────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Performance:    '#0891b2',
  Criativos:      '#FF6A00',
  'Técnico':      '#7c3aed',
  'Inteligência': '#059669',
  Leads:          '#d97706',
  Relatórios:     '#6366f1',
};
function accentFor(category: string) {
  return CATEGORY_COLORS[category] ?? '#FF6A00';
}

const CATEGORY_FILTERS = ['Todos', 'Performance', 'Criativos', 'Técnico', 'Inteligência', 'Leads', 'Relatórios'];

// ─── Opportunity templates generated on execution ────────────────────────────
const OPPORTUNITY_TEMPLATES: Record<string, any> = {
  'Performance': {
    priority: 'alta',
    category: 'receita',
    title: 'Redistribuir budget do TikTok para Meta Ads',
    impact: 'Aumento de receita estimado',
    impactValue: '+R$ 38.200/mês',
    rationale: 'O Agente de Performance identificou que suas campanhas TikTok têm ROAS 1.8x contra 4.2x do Meta Ads. Com o mesmo investimento realocado, você projeta +R$ 38k/mês em receita atribuída sem aumentar o budget total.',
    actions: [
      'Reduzir budget TikTok em 40% (de R$ 12.000 para R$ 7.200)',
      'Alocar R$ 4.800 adicionais em campanhas de Retargeting Meta',
      'Criar conjunto de anúncios Mirror das campanhas Black Friday Hero',
      'Monitorar ROAS por 7 dias antes de escalar',
    ],
    agent: 'Agente Performance',
    effort: 'baixo',
    timeframe: '3–5 dias',
    source: ['Meta Ads', 'TikTok Ads', 'GA4'],
  },
  'Inteligência': {
    priority: 'alta',
    category: 'eficiencia',
    title: 'Ativar Lance Automático via IA nos top 3 grupos',
    impact: 'Redução de CPA esperada',
    impactValue: '–22% CPA',
    rationale: 'Com base nos últimos 28 dias, os grupos Retargeting 30d, Lookalike 2% e Interesses Broad têm padrões de conversão estáveis o suficiente para o Agente de Lances assumir controle e otimizar bid a cada 15min.',
    actions: [
      'Ativar modo Agente de Lances nos 3 grupos identificados',
      'Definir CPA alvo de R$ 28 (atual médio: R$ 36)',
      'Configurar alertas se CPA > R$ 42 por 6h consecutivas',
      'Revisar performance após 14 dias',
    ],
    agent: 'Agente de Lances IA',
    effort: 'baixo',
    timeframe: '1 dia',
    source: ['Google Ads', 'Meta Ads'],
  },
  'Técnico': {
    priority: 'alta',
    category: 'risco',
    title: 'Corrigir discrepância de atribuição CAPI vs pixel',
    impact: 'Conversões não contabilizadas',
    impactValue: '~34% eventos perdidos',
    rationale: 'O Agente Técnico detectou que 34% das conversões de compra não estão chegando via CAPI — apenas pelo pixel browser. Com iOS 17+ e bloqueadores, você está tomando decisões com dados incompletos, superestimando CPA real.',
    actions: [
      'Auditar configuração do GTM Server com o relatório de deduplicação',
      'Implementar event_id único compartilhado entre CAPI e pixel',
      'Validar eventos no Events Manager durante 48h',
      'Recalibrar metas de CPA após estabilização',
    ],
    agent: 'Agente Técnico',
    effort: 'medio',
    timeframe: '5–7 dias',
    source: ['GTM Server', 'Meta Ads', 'GA4'],
  },
  'Criativos': {
    priority: 'media',
    category: 'crescimento',
    title: 'Escalar criativos de vídeo curto — formato ganhador',
    impact: 'Potencial de escala de CTR',
    impactValue: '+40% CTR médio',
    rationale: 'O Agente de Criativos analisou 14 peças das últimas 4 semanas. Vídeos ≤15s superam imagens estáticas em 40% CTR e 28% taxa de conversão. O criativo Video_30s_BlackFriday_v3 está saturando — hora de criar variações.',
    actions: [
      'Produzir 3 variações do Video_30s_BlackFriday_v3 com CTA alternativo',
      'Testar headline "Oferta por tempo limitado" vs "Frete grátis hoje"',
      'Rodar teste A/B por 7 dias com budget de R$ 2.000 por variante',
      'Escalar o vencedor com orçamento do criativo saturado',
    ],
    agent: 'Agente Criativos',
    effort: 'medio',
    timeframe: '7–14 dias',
    source: ['Meta Ads', 'GA4'],
  },
  'Leads': {
    priority: 'media',
    category: 'receita',
    title: 'Ativar campanha de recuperação de carrinhos abandonados',
    impact: 'Receita recuperável estimada',
    impactValue: '+R$ 15.800/mês',
    rationale: 'O Agente CRM identificou que 68% dos carrinhos abandonados nas últimas 2 semanas não receberam follow-up. Com uma sequência de e-mail + WhatsApp em 1h, 3h e 24h, a taxa de recuperação histórica do setor é 18–22%.',
    actions: [
      'Configurar automação de carrinho no RD Station',
      'Criar sequência: E-mail 1h → WhatsApp 3h → E-mail 24h com desconto 10%',
      'Segmentar por ticket médio (>R$ 150 recebe oferta VIP)',
      'Medir taxa de recuperação após 30 dias',
    ],
    agent: 'Agente CRM',
    effort: 'medio',
    timeframe: '3–5 dias',
    source: ['RD Station', 'GA4', 'Stripe'],
  },
};

// ─── Automation card ──────────────────────────────────────────────────────────

function AutomationCard({
  automation,
  userId,
  onEdit,
}: {
  automation: Automation;
  userId?: string;
  onEdit?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const color = accentFor(automation.category);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (running || !userId) return;
    setRunning(true);
    setRunSuccess(false);

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', userId);
      const now = Date.now();

      await updateDoc(userRef, {
        [`automations.${automation.id}.lastUpdateAt`]: now,
        [`automations.${automation.id}.updatedAt`]: now,
      });

      const template = OPPORTUNITY_TEMPLATES[automation.category] ?? {
        priority: 'baixa',
        category: 'crescimento',
        title: 'Integrar Google Search Console para captar demanda orgânica',
        impact: 'Visibilidade de palavras-chave',
        impactValue: '480+ termos identificados',
        rationale: 'O Search Console ainda não está conectado. Com 480 palavras-chave captadas na última análise pública do domínio, você está perdendo dados cruciais de intenção de compra para alimentar campanhas de DSA.',
        actions: [
          'Conectar Google Search Console in Integrações',
          'Identificar termos de alta conversão',
        ],
        agent: 'Agente SEO',
        effort: 'baixo',
        timeframe: '1 dia',
        source: ['Search Console', 'GA4'],
      };

      const oppsRef = collection(db, 'users', userId, 'opportunities');
      await addDoc(oppsRef, {
        ...template,
        createdAt: Date.now(),
      });

      setRunSuccess(true);
      setTimeout(() => setRunSuccess(false), 3000);
    } catch (err) {
      console.error('Error running automation:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="hub-neu-card p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#d1d9e6,_-6px_-6px_14px_#ffffff] transition-all duration-300 cursor-pointer group"
      style={{ borderLeftColor: color }}
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),_inset_-2px_-2px_4px_#ffffff]"
          style={{ background: `${color}18` }}
        >
          <Zap size={20} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-black text-[#0f172a] truncate">{automation.name}</h3>
            {automation.isActive ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-700">
                <CheckCircle2 size={9} />
                Ativa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-700">
                <Pause size={9} />
                Pausada
              </span>
            )}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color, background: `${color}12`, borderColor: `${color}30` }}
            >
              {automation.category}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-500 font-semibold mt-0.5 leading-snug line-clamp-2">
            {automation.description}
          </p>
        </div>

        <ChevronRight
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-90' : ''} group-hover:text-[#FF6A00]`}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-semibold">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {automation.lastRunAt ?? 'Ainda não executada'}
        </span>
        <span className="flex items-center gap-1">
          <Activity size={10} />
          {automation.frequency}
        </span>
        {automation.runsTotal > 0 && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/8 border border-orange-500/15">
            <Sparkles size={9} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black text-[#FF6A00]">{automation.runsTotal} execuções</span>
          </span>
        )}
      </div>

      {/* Trigger & Action Row */}
      <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between gap-3">
        <span className="text-[10.5px] text-slate-400 font-bold truncate max-w-[45%]">
          Gatilho: {automation.trigger}
        </span>
        
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Pause Toggle Button */}
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              if (!userId) return;
              const db = getFirebaseDb();
              const userRef = doc(db, 'users', userId);
              await updateDoc(userRef, {
                [`automations.${automation.id}.status`]: automation.isActive ? 'paused' : 'active',
                [`automations.${automation.id}.updatedAt`]: Date.now(),
              });
            }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
            title={automation.isActive ? 'Pausar Automação' : 'Ativar Automação'}
          >
            <Power size={13} className={automation.isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'} />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Editar Automação"
          >
            <Edit size={13} />
          </button>

          {/* Exclude Button */}
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              if (!userId) return;
              if (!window.confirm('Tem certeza que deseja excluir esta automação?')) return;
              const db = getFirebaseDb();
              const userRef = doc(db, 'users', userId);
              await updateDoc(userRef, {
                [`automations.${automation.id}`]: deleteField()
              });
            }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-rose-500 hover:text-rose-600 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
            title="Excluir Automação"
          >
            <Trash2 size={13} />
          </button>

          {/* Run Now Button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              runSuccess
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                : 'bg-[#FF6A00] text-white hover:bg-[#e05d00] shadow-[2px_2px_6px_rgba(255,106,0,0.25)]'
            }`}
          >
            {running ? (
              <>
                <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin shrink-0" />
                Executando...
              </>
            ) : runSuccess ? (
              <>
                <CheckCircle2 size={12} />
                Sucesso!
              </>
            ) : (
              <>
                <Cpu size={12} />
                Executar Agora
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3">
              <p className="text-[11px] text-slate-400 font-semibold">
                <span className="font-black text-slate-600">Criada em:</span> {automation.createdAt}
              </p>
              
              {automation.rawEntry?.customFieldsData && Object.keys(automation.rawEntry.customFieldsData).length > 0 && (
                <div className="space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10.5px] font-black text-slate-500 uppercase tracking-wide">Configurações salvas:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                    {Object.entries(automation.rawEntry.customFieldsData).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{key}</span>
                        <span className="text-[11.5px] font-bold text-slate-700 break-all">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const POPULAR_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Alerta de ROAS Baixo',
    desc: 'Monitora quedas repentinas de performance nas campanhas ativas e aciona contramedidas de tráfego.',
    trigger: 'ROAS < 2.0 por 3h',
    flow: { trigger: 'Meta Ads', agents: 'Igor ➔ Paola', output: 'Slack & WhatsApp' },
    category: 'Performance',
  },
  {
    id: 'tpl-2',
    name: 'Fadiga de Criativos',
    desc: 'Detecta perda de CTR em anúncios vencedores e solicita automaticamente novos criativos da Tainá.',
    trigger: 'CTR > 25% queda / 7d',
    flow: { trigger: 'Campanhas', agents: 'Paola ➔ Tainá', output: 'Handoff Automático' },
    category: 'Criativos',
  },
  {
    id: 'tpl-3',
    name: 'Qualificação Outbound',
    desc: 'Identifica novas respostas no LinkedIn e qualifica o fit de ICP do lead antes de enviar ao Breno.',
    trigger: 'Nova resposta outbound',
    flow: { trigger: 'LinkedIn SDR', agents: 'Vitor ➔ Breno', output: 'CRM & WhatsApp' },
    category: 'Leads',
  }
];

export default function HubAutomacoesPage() {
  const { user, profile } = useAuth();

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomFields, setEditCustomFields] = useState<Record<string, string>>({});
  const [editCadenceId, setEditCadenceId] = useState('');
  const [editScheduleOptionId, setEditScheduleOptionId] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editNotice, setEditNotice] = useState<string | null>(null);

  useEffect(() => {
    if (editingAutomation && editingAutomation.rawEntry) {
      setEditCustomFields(editingAutomation.rawEntry.customFieldsData || {});
      setEditCadenceId(editingAutomation.rawEntry.cadenceId);
      setEditScheduleOptionId(editingAutomation.rawEntry.scheduleOptionId);
      setEditNotice(null);
    }
  }, [editingAutomation]);

  const editSuggestions = useMemo(() => {
    if (!editingAutomation || !editingAutomation.rawEntry) return [];
    return buildAutomationSuggestions({
      title: editingAutomation.rawEntry.agentTitle,
      category: editingAutomation.rawEntry.agentCategory,
      planSummary: { monthlyLimit: editingAutomation.rawEntry.monthlyLimit || 12 }
    });
  }, [editingAutomation]);

  const selectedEditSuggestion = useMemo(
    () => editSuggestions.find((item) => item.id === editCadenceId) ?? null,
    [editSuggestions, editCadenceId]
  );

  const selectedEditScheduleOption = useMemo(() => {
    if (!selectedEditSuggestion) return null;
    return selectedEditSuggestion.scheduleOptions.find((item) => item.id === editScheduleOptionId) ?? null;
  }, [editScheduleOptionId, selectedEditSuggestion]);

  useEffect(() => {
    if (!editSuggestions.length) return;
    setEditCadenceId((current) => current || editSuggestions[1]?.id || editSuggestions[0].id);
  }, [editSuggestions]);

  useEffect(() => {
    if (!selectedEditSuggestion) return;
    setEditScheduleOptionId((current) => {
      const exists = selectedEditSuggestion.scheduleOptions.some((option) => option.id === current);
      if (exists) return current;
      return selectedEditSuggestion.scheduleOptions[0]?.id ?? null;
    });
  }, [selectedEditSuggestion]);

  const handleActivateTemplate = (tpl: typeof POPULAR_TEMPLATES[number]) => {
    const newAuto: Automation = {
      id: `${tpl.id}-${Date.now()}`,
      name: `${tpl.name} (Template)`,
      description: tpl.desc,
      trigger: tpl.trigger,
      frequency: 'Tempo Real',
      category: tpl.category,
      runsTotal: 0,
      lastRunAt: null,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      isActive: true,
    };
    setAutomations((prev) => [newAuto, ...prev]);
    alert(`Fluxo "${tpl.name}" ativado com sucesso! Ele foi adicionado à sua operação.`);
  };

  // Synchronize automations with user profile (real active automations)
  useEffect(() => {
    if (!profile) {
      if (!user) {
        setAutomations([]);
        setLoading(false);
      }
      return;
    }
    const realAutos = getHubAutomationsFromProfile(profile)
      .filter((a) => a.status === 'active' || a.status === 'paused')
      .map((a) => ({
        id: a.key,
        name: `${a.agentTitle} (${a.objective})`,
        description: a.scheduleOptionDetail || `Automação executada com cadência ${a.cadence}.`,
        trigger: a.scheduleOptionLabel || 'Frequência agendada',
        frequency: a.cadence || 'Periódico',
        category: a.agentCategory || 'Performance',
        runsTotal: a.monthlyExecutions || 0,
        lastRunAt: a.lastUpdateAt ? formatAutomationDateTime(a.lastUpdateAt) : null,
        createdAt: a.activatedAt ? new Date(a.activatedAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        isActive: a.status === 'active',
        rawEntry: a,
      }));
    setAutomations(realAutos);
    setLoading(false);
  }, [profile, user]);

  const filtered = useMemo(() =>
    automations.filter((a) => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'Todos' || a.category === filterCategory;
      return matchSearch && matchCat;
    }),
    [automations, search, filterCategory]
  );

  // Category breakdown
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    automations.forEach((a) => { counts[a.category] = (counts[a.category] ?? 0) + 1; });
    return counts;
  }, [automations]);

  const totalActive = automations.length;
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
            <Cpu size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF6A00]">Automações</span>
          </div>
          <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">Fluxos Inteligentes</h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-xl">
            {loading
              ? 'Carregando automações…'
              : totalActive === 0
              ? 'Nenhuma automação ativa. Crie fluxos para automatizar sua operação.'
              : `${totalActive} automação${totalActive > 1 ? 'ões' : ''} ativa${totalActive > 1 ? 's' : ''} trabalhando na sua operação.`}
          </p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { 
            label: 'Ativas', 
            value: loading ? '…' : String(totalActive), 
            icon: (
              <KpiIconWrapper fromColor="#3EE59A" toColor="#036C4A" shadowColor="rgba(2, 82, 58, 0.4)">
                <Zap size={22} />
              </KpiIconWrapper>
            )
          },
          { 
            label: 'Performance', 
            value: loading ? '…' : String(byCategory['Performance'] ?? 0), 
            icon: (
              <KpiIconWrapper fromColor="#5AAEFF" toColor="#1240B8" shadowColor="rgba(12, 46, 158, 0.4)">
                <Activity size={22} />
              </KpiIconWrapper>
            )
          },
          { 
            label: 'Criativos', 
            value: loading ? '…' : String(byCategory['Criativos'] ?? 0), 
            icon: (
              <KpiIconWrapper fromColor="#FF9A55" toColor="#E63E00" shadowColor="rgba(201, 55, 0, 0.4)">
                <Cpu size={22} />
              </KpiIconWrapper>
            )
          },
          { 
            label: 'Top categoria', 
            value: loading ? '…' : topCategory, 
            icon: (
              <KpiIconWrapper fromColor="#B487F5" toColor="#54189E" shadowColor="rgba(62, 14, 122, 0.4)">
                <Sparkles size={22} />
              </KpiIconWrapper>
            )
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-white p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
              <div className="text-[20px] font-black text-slate-800">{value}</div>
            </div>
            <div className="shrink-0">{icon}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            className="flex-1 bg-transparent text-[13px] font-semibold text-slate-600 placeholder:text-slate-400 outline-none"
            placeholder="Buscar automação…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-[#FF6A00] transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 bg-[#eef2f7] ${
                filterCategory === cat
                  ? 'shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] border border-orange-500/20 text-[#FF6A00]'
                  : 'text-slate-500 border border-white/60 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid / Empty state ── */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
          <p className="text-[13px] font-black text-slate-400 mt-3">Carregando automações…</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {totalActive === 0 ? (
              /* No active automations at all */
              <motion.div
                key="empty-global"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2"
              >
                <div className="hub-neu-card p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/8 border border-orange-500/15 flex items-center justify-center">
                    <Zap size={28} className="text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-[#0f172a]">Nenhuma automação ativa</p>
                    <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                      Crie fluxos inteligentes para automatizar tarefas repetitivas da sua operação de marketing.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/hub/laboratorio-agentes"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:scale-[1.02] transition-all"
                      style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
                    >
                      <Brain size={14} />
                      Ativar Agentes
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : filtered.length === 0 ? (
              /* No results for current filter */
              <motion.div
                key="empty-filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 py-12 text-center"
              >
                <Zap size={28} className="mx-auto text-slate-300 mb-3" />
                <p className="text-[14px] font-black text-slate-400">Nenhuma automação encontrada.</p>
                <button
                  onClick={() => { setSearch(''); setFilterCategory('Todos'); }}
                  className="mt-3 text-[12px] font-black text-[#FF6A00] hover:underline"
                >
                  Limpar filtros
                </button>
              </motion.div>
            ) : (
              filtered.map((automation) => (
                <AutomationCard
                  key={automation.id}
                  automation={automation}
                  userId={user?.uid}
                  onEdit={() => {
                    setEditingAutomation(automation);
                    setIsEditModalOpen(true);
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}
      {/* ── Seção de Templates Populares ── */}
      <div className="space-y-6 mt-12 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-[#FF6A00]" />
          <h2 className="text-[16px] font-black uppercase tracking-wider text-[#0f172a]">Templates de Fluxos Recomendados</h2>
        </div>
        <p className="text-[12px] text-slate-500 font-semibold max-w-xl">
          Instale fluxos de trabalho pré-configurados e validados pela NeuroAds para acelerar o crescimento do seu negócio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POPULAR_TEMPLATES.map((tpl) => {
            const color = accentFor(tpl.category);
            return (
              <div
                key={tpl.id}
                className="hub-neu-card p-5 bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between gap-4 rounded-3xl"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      style={{ color, background: `${color}12`, borderColor: `${color}30` }}
                    >
                      {tpl.category}
                    </span>
                    <span className="text-[9px] font-black text-slate-400">Popular</span>
                  </div>
                  <h3 className="text-[14px] font-black text-slate-800 leading-tight">{tpl.name}</h3>
                  <p className="text-[11.5px] text-slate-500 font-semibold leading-snug">{tpl.desc}</p>

                  {/* Flow Diagram */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagrama de Fluxo</p>
                    <div className="flex items-center justify-between text-[9.5px] bg-[#eef2f7] p-2.5 rounded-xl border border-white/60 shadow-[inset_1px_1px_2px_#d1d9e6,inset_-1px_-1px_2px_#ffffff] font-mono leading-none">
                      <span className="bg-white/80 border text-slate-600 px-1 py-0.5 rounded font-bold shadow-sm">{tpl.flow.trigger}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="bg-orange-500/10 text-orange-600 px-1 py-0.5 rounded font-bold">{tpl.flow.agents}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded font-bold">{tpl.flow.output}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleActivateTemplate(tpl)}
                  className="w-full py-2 rounded-xl text-[11px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer text-center"
                  style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)', border: 'none' }}
                >
                  Ativar Fluxo
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {isEditModalOpen && editingAutomation && editingAutomation.rawEntry && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4 py-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />

          <div className="relative w-full max-w-[1080px] max-h-[96vh] rounded-[32px] bg-[#eef2f7] border border-white/80 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] overflow-hidden animate-in fade-in zoom-in-95 duration-250 text-slate-800 flex flex-col">
            {/* Header */}
            <div className="relative border-b border-slate-200 bg-[#eef2f7] px-6 py-5 flex flex-col gap-1 shrink-0">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">Editar Programação</p>
              <h3 className="text-2xl font-black text-[#0f172a]">Editar Automação</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Ajuste as configurações e cadência de <strong>{editingAutomation.rawEntry.agentTitle}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
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
                  {/* Custom fields */}
                  {(() => {
                    const fields = SPECIALTY_FIELDS[editingAutomation.rawEntry.agentTitle] || [];
                    if (fields.length === 0) return null;
                    return (
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                          1. Configurações da Operação:
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                          {fields.map((f) => (
                            <div key={f.name} className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-500">{f.label}</label>
                              <input
                                type={f.type === 'number' ? 'text' : f.type}
                                placeholder={f.placeholder}
                                value={editCustomFields[f.name] || ''}
                                onChange={(e) => setEditCustomFields(prev => ({ ...prev, [f.name]: e.target.value }))}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] bg-white outline-none focus:ring-2 focus:ring-[#FF6A00]/15 transition-all text-slate-700"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column: Cadence & Schedule */}
                <div className="space-y-5">
                  {/* Cadence Suggestions */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                      2. Cadência de Execução:
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {editSuggestions.map((suggestion) => {
                        const isSelected = editCadenceId === suggestion.id;
                        return (
                          <div
                            key={suggestion.id}
                            onClick={() => setEditCadenceId(suggestion.id)}
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
                  </div>

                  {/* Schedule options */}
                  {selectedEditSuggestion && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00]">3. Dias e horários recomendados</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {selectedEditSuggestion.scheduleOptions.map((opt) => {
                          const isOptSelected = editScheduleOptionId === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setEditScheduleOptionId(opt.id)}
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

                  {editNotice && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 shadow-sm mt-4">
                      {editNotice}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-[#eef2f7] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl border border-white/50 bg-[#eef2f7] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all active:scale-95 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSavingEdit || !selectedEditSuggestion || !selectedEditScheduleOption}
                onClick={async () => {
                  if (!user || !editingAutomation || !editingAutomation.rawEntry || !selectedEditSuggestion || !selectedEditScheduleOption) return;
                  setIsSavingEdit(true);
                  setEditNotice(null);
                  try {
                    const timestamps = buildAutomationTimestamps({
                      cadence: selectedEditSuggestion.cadence,
                      monthlyExecutions: selectedEditSuggestion.monthlyExecutions,
                      scheduleOptionLabel: selectedEditScheduleOption.label,
                    });
                    const db = getFirebaseDb();
                    const userRef = doc(db, 'users', user.uid);
                    
                    const payload = {
                      [`automations.${editingAutomation.id}.cadenceId`]: selectedEditSuggestion.id,
                      [`automations.${editingAutomation.id}.cadenceTitle`]: selectedEditSuggestion.title,
                      [`automations.${editingAutomation.id}.cadence`]: selectedEditSuggestion.cadence,
                      [`automations.${editingAutomation.id}.monthlyExecutions`]: selectedEditSuggestion.monthlyExecutions,
                      [`automations.${editingAutomation.id}.distribution`]: selectedEditSuggestion.distribution,
                      [`automations.${editingAutomation.id}.objective`]: selectedEditSuggestion.objective,
                      [`automations.${editingAutomation.id}.scheduleOptionId`]: selectedEditScheduleOption.id,
                      [`automations.${editingAutomation.id}.scheduleOptionLabel`]: selectedEditScheduleOption.label,
                      [`automations.${editingAutomation.id}.scheduleOptionDetail`]: selectedEditScheduleOption.detail,
                      [`automations.${editingAutomation.id}.customFieldsData`]: editCustomFields,
                      [`automations.${editingAutomation.id}.lastUpdateAt`]: timestamps.lastUpdateAt,
                      [`automations.${editingAutomation.id}.nextUpdateAt`]: timestamps.nextUpdateAt,
                      [`automations.${editingAutomation.id}.updatedAt`]: Date.now(),
                    };

                    await updateDoc(userRef, payload);
                    setEditNotice('Automação atualizada com sucesso!');
                    setTimeout(() => {
                      setIsEditModalOpen(false);
                      setEditNotice(null);
                    }, 1500);
                  } catch (error) {
                    console.error('Erro ao atualizar automação:', error);
                    setEditNotice('Erro ao salvar alterações.');
                  } finally {
                    setIsSavingEdit(false);
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedEditSuggestion && selectedEditScheduleOption && !isSavingEdit
                    ? 'bg-gradient-to-br from-[#08B760] to-[#0A9D57] text-white shadow-[3px_3px_6px_rgba(8,183,96,0.2),_-3px_-3px_6px_#ffffff] hover:brightness-105 active:scale-98'
                    : 'bg-[#eef2f7] text-slate-400 border border-white/20 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] cursor-not-allowed'
                }`}
              >
                {isSavingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
