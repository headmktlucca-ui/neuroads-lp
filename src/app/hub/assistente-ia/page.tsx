'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Send, Paperclip, Mic, ChevronDown, ChevronUp,
  Search, Download, LayoutGrid, LineChart, TrendingUp,
  FileText, Terminal, Link2, BarChart2, Globe, Database,
  Target, CheckCircle2, AlertTriangle, Sparkles, Cpu,
  Film, Music, File, X, Copy, Table2, User, RefreshCw,
  Settings2, Hash, ArrowRight, MessageSquare, BookmarkPlus, FileDown,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { chatWithLuccaHub, type LuccaLeftPanelData } from '../../actions/lucca-hub-chat';
import { saveResultToKnowledge } from '../../actions/save-to-knowledge';
import { saveChatSession, type ChatMessage as StoredChatMessage } from '../../../lib/chat-history';
import { getTeamAgentById, type TeamAgent, TEAM_AGENTS } from '../../../data/team-agents';
import { agents as allSpecialties } from '../../../data/agents';
import { getHubAutomationsFromProfile } from '../../../lib/hub-automations';



/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */
type ChatState = 'idle' | 'thinking' | 'streaming';
type ToneMode = 'formal' | 'criativo' | 'direto';
type AttachType = 'pdf' | 'audio' | 'video';
type PanelTab = 'resumir' | 'comparar' | 'top' | 'resposta' | 'tabela';
type ViewMode = 'table' | 'chart';

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
  'DNA da Marca': [
    { name: 'marca', label: 'Nome da Marca / Empresa', type: 'text', placeholder: 'Ex: NeuroAds' },
    { name: 'tom_voz', label: 'Tom de Voz Desejado', type: 'text', placeholder: 'Ex: Profissional, ousado, direto' },
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


interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  partial?: boolean;
  resultId?: string;
  nextSteps?: string[];
  fields?: CustomField[];
  specialty?: string;
}


interface TableRow { cells: string[]; highlight?: boolean }

interface ResultPanel {
  id: string;
  title: string;
  badge: string;
  badgeVariant: 'orange' | 'blue' | 'teal' | 'slate';
  summary: string;
  searchPlaceholder: string;
  tableHeaders: string[];
  tableRows: TableRow[];
  // Support AI-generated data
  aiData?: LuccaLeftPanelData;
  fullMessage?: string;
}


interface AttachedFile {
  name: string;
  type: AttachType;
}

interface SourceTag {
  label: string;
  type: string;
  icon: React.ReactNode;
}

/* ═══════════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════════ */
const RESULT_PANELS: ResultPanel[] = [
  {
    id: 'r1',
    title: 'Campanhas de Alta Performance',
    badge: 'Meta Ads',
    badgeVariant: 'orange',
    summary:
      'Aqui estão as campanhas com melhor desempenho nas últimas 4 semanas. A carteira inclui 8 campanhas ativas, sendo 3 com ROAS acima do benchmark setorial. Duas campanhas pertencem à vertical de Prospecting e cinco à vertical de Retargeting.',
    searchPlaceholder: 'Buscar campanha...',
    tableHeaders: ['Campanha', 'ROAS', 'CPA', 'Budget'],
    tableRows: [
      { cells: ['Black Friday Hero — Retarg.', '5.2x', 'R$ 28', 'R$ 14.200'], highlight: true },
      { cells: ['Produto Principal — Broad', '4.1x', 'R$ 38', 'R$ 9.800'] },
      { cells: ['Lookalike 1-3% — Prosp.', '3.4x', 'R$ 47', 'R$ 7.200'] },
      { cells: ['Interesse Empreend.', '2.8x', 'R$ 61', 'R$ 5.600'] },
    ],
  },
  {
    id: 'r2',
    title: 'Análise de Criativos',
    badge: 'Google Ads',
    badgeVariant: 'blue',
    summary:
      'Foram analisados 14 criativos ativos em campanhas de Performance Max e Search. Criativos em formato Vídeo curto (≤15s) superaram estáticos em 40% no CTR médio. Três criativos lideram em conversão com taxa acima de 3,2%.',
    searchPlaceholder: 'Buscar criativo...',
    tableHeaders: ['Criativo', 'CTR', 'Conv. Rate', 'Impressões'],
    tableRows: [
      { cells: ['Video_30s_BlackFriday_v3', '4.8%', '3.9%', '182.400'], highlight: true },
      { cells: ['Carrossel_ProdutoHero_v2', '3.2%', '3.1%', '94.200'] },
      { cells: ['Imagem_Depoimento_v1', '2.7%', '2.4%', '67.800'] },
      { cells: ['Video_15s_Urgencia_v2', '2.1%', '1.9%', '43.100'] },
    ],
  },
  {
    id: 'r3',
    title: 'Visão Geral da Conta',
    badge: 'Multi-Canal',
    badgeVariant: 'teal',
    summary:
      'Resumo consolidado de todas as plataformas. Investimento total de R$ 48.200 no período. ROAS médio ponderado de 3.8x. CPA médio de R$ 42. Crescimento de 18% em receita atribuída vs. período anterior.',
    searchPlaceholder: 'Buscar canal...',
    tableHeaders: ['Canal', 'ROAS', 'Spend', 'Receita'],
    tableRows: [
      { cells: ['Meta Ads', '4.2x', 'R$ 22.400', 'R$ 94.080'], highlight: true },
      { cells: ['Google Ads', '3.6x', 'R$ 18.300', 'R$ 65.880'] },
      { cells: ['TikTok Ads', '2.9x', 'R$ 7.500', 'R$ 21.750'] },
    ],
  },
];

const ANALYSIS_CONTENT: Record<string, Partial<Record<PanelTab, React.ReactNode>>> = {
  r1: {
    resumir: (
      <div className="space-y-3 text-[13px] text-[#374151] leading-relaxed">
        <p>Aqui está uma comparação das <strong>3 campanhas com melhor ROAS</strong>:</p>
        <ul className="space-y-2">
          {[
            { name: 'Black Friday Hero', note: 'Foca em audiência de remarketing de 30 dias com criativo de urgência. Alta relevância = CPA baixo.' },
            { name: 'Produto Principal', note: 'Campanha Broad com bid de Menor CPA. Escala razoável, estável há 3 semanas.' },
            { name: 'Lookalike 1-3%', note: 'Prospecting frio com audience LAL. Eficiência acima da média para topo de funil.' },
          ].map(item => (
            <li key={item.name} className="flex gap-2">
              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
              <span><strong>{item.name}</strong> — {item.note}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
    comparar: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Melhor ROAS', value: '5.2x', sub: 'Black Friday Hero' },
            { label: 'Menor CPA', value: 'R$ 28', sub: 'Black Friday Hero' },
            { label: 'Maior Escala', value: 'R$ 14.2k', sub: 'Budget investido' },
          ].map(m => (
            <div key={m.label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3">
              <p className="text-[11px] text-[#6B7280] mb-1">{m.label}</p>
              <p className="text-[15px] font-bold text-[#111827]">{m.value}</p>
              <p className="text-[11px] text-[#9CA3AF]">{m.sub}</p>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-[#6B7280]">
          A campanha de Prospecting Frio apresenta CPA 2.8× maior que a de Retargeting,
          o que é esperado para topo de funil. Recomendamos aumentar o orçamento da
          <strong className="text-[#111827]"> Black Friday Hero</strong> enquanto o público não satura.
        </p>
      </div>
    ),
    top: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-[#FFF7F0] border border-[#FF6A00]/20 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#FF6A00] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827]">Black Friday Hero — Retargeting</p>
            <p className="text-[12px] text-[#6B7280]">ROAS 5.2x · CPA R$ 28 · Budget R$ 14.200</p>
          </div>
        </div>
        <p className="text-[12px] text-[#6B7280] leading-relaxed">
          Esta campanha lidera em eficiência. Recomendamos criar uma versão B com
          headline alternativa e aumentar o orçamento em 25% para validar escalabilidade.
        </p>
      </div>
    ),
  },
  r2: {
    resumir: (
      <div className="text-[13px] text-[#374151] space-y-2 leading-relaxed">
        <p>Foram analisados <strong>14 criativos</strong> nas últimas 4 semanas. O formato <strong>vídeo curto (≤15s)</strong> supera estáticos em CTR médio.</p>
        <ul className="space-y-1.5">
          {['CTR médio Vídeo: 3.8% vs Imagem: 2.4%', 'Taxa de conversão vídeo: 3.1% vs imagem: 2.1%', '3 criativos respondem por 68% das conversões totais'].map(t => (
            <li key={t} className="flex gap-2 items-start">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
    comparar: (
      <div className="text-[13px] text-[#374151] space-y-2">
        <p>Comparação por formato:</p>
        <div className="space-y-2">
          {[{ label: 'Vídeo ≤15s', pct: 78 }, { label: 'Carrossel', pct: 52 }, { label: 'Imagem', pct: 38 }].map(f => (
            <div key={f.label}>
              <div className="flex justify-between text-[12px] mb-1"><span>{f.label}</span><span className="font-medium">{f.pct}%</span></div>
              <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    top: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827]">Video_30s_BlackFriday_v3</p>
            <p className="text-[12px] text-[#6B7280]">CTR 4.8% · Conv. 3.9% · 182k impressões</p>
          </div>
        </div>
        <p className="text-[12px] text-[#6B7280] leading-relaxed">Criativo top performer. Teste variações com CTA alternativo para maximizar conversão.</p>
      </div>
    ),
  },
  r3: {
    resumir: (
      <div className="text-[13px] text-[#374151] space-y-2 leading-relaxed">
        <p>Consolidado de <strong>3 canais ativos</strong> no período de 28 dias.</p>
        <ul className="space-y-1.5">
          {['Meta Ads lidera em ROAS (4.2x) e volume de receita', 'Google Ads apresenta maior estabilidade mês a mês', 'TikTok Ads em crescimento: +34% em receita atribuída'].map(t => (
            <li key={t} className="flex gap-2 items-start">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" /><span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
    comparar: (
      <div className="text-[13px] text-[#374151] space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[{ c: 'Meta', v: '4.2x', color: 'bg-[#FF6A00]' }, { c: 'Google', v: '3.6x', color: 'bg-blue-500' }, { c: 'TikTok', v: '2.9x', color: 'bg-teal-500' }].map(i => (
            <div key={i.c} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 text-center">
              <p className="text-[11px] text-[#6B7280]">{i.c}</p>
              <p className={`text-[15px] font-bold mt-1`}>{i.v}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    top: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111827]">Meta Ads</p>
            <p className="text-[12px] text-[#6B7280]">ROAS 4.2x · R$ 22.4k investidos · R$ 94k receita</p>
          </div>
        </div>
        <p className="text-[12px] text-[#6B7280]">Canal de melhor eficiência. Recomendamos aumentar alocação de orçamento em 15%.</p>
      </div>
    ),
  },
};

const MOCK_RESPONSES: Array<{ content: string; verified: boolean; resultId: string }> = [
  {
    content:
      'Há **8 campanhas ativas** no período. As campanhas de Retargeting com ROAS acima de 4x são: Black Friday Hero (5.2x), Produto Principal (4.1x) e Lookalike 1-3% (3.4x).\n\nA campanha com melhor custo-benefício no momento é a **Black Friday Hero**, com CPA de R$ 28 — 40% abaixo da média da conta.',
    verified: true,
    resultId: 'r1',
  },
  {
    content:
      'Foram analisados **14 criativos** nas últimas 4 semanas. O formato de vídeo curto (≤15s) supera imagens estáticas em **40% no CTR** médio.\n\nO criativo top performer é o **Video_30s_BlackFriday_v3** com CTR de 4.8% e taxa de conversão de 3.9%. Recomendo criar variações com CTA alternativo para testar escalabilidade.',
    verified: true,
    resultId: 'r2',
  },
  {
    content:
      'Visão consolidada de **3 canais ativos**: Meta Ads (4.2x ROAS), Google Ads (3.6x) e TikTok Ads (2.9x). Investimento total de R$ 48.200 gerando R$ 181.710 em receita atribuída.\n\nROAS médio ponderado de **3.8x**, com crescimento de 18% vs. período anterior. O TikTok Ads tem o maior crescimento percentual (+34%).',
    verified: false,
    resultId: 'r3',
  },
];

const SUGGESTIONS = [
  { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Análise de ROAS', prompt: 'Quais campanhas têm o melhor ROAS nas últimas 4 semanas?' },
  { icon: <Film className="w-3.5 h-3.5" />, label: 'Criativos top', prompt: 'Qual criativo está performando melhor e por quê?' },
  { icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Visão geral', prompt: 'Me dê um resumo consolidado de todos os canais.' },
  { icon: <Target className="w-3.5 h-3.5" />, label: 'Otimizar CPA', prompt: 'Como posso reduzir o CPA das campanhas de prospecting?' },
];

const SOURCES: SourceTag[] = [
  { label: 'Meta Ads', type: 'Plataforma de Mídia', icon: <Globe className="w-3 h-3" /> },
  { label: 'Google Ads', type: 'Plataforma de Mídia', icon: <Target className="w-3 h-3" /> },
  { label: 'CRM interno', type: 'Dados Internos', icon: <Database className="w-3 h-3" /> },
  { label: 'Analytics', type: 'Dados Internos', icon: <BarChart2 className="w-3 h-3" /> },
];

const BADGE_STYLES: Record<string, string> = {
  orange: 'bg-[#FFF3E8] text-[#FF6A00] border-[#FF6A00]/20',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

/* ═══════════════════════════════════════════════════════════════════
   THINKING PHASE TEXT — cycles through analysis steps
═══════════════════════════════════════════════════════════════════ */
const THINKING_PHASES = [
  { main: 'Consultando fontes de dados...', sub: 'Meta Ads · Google Ads · CRM' },
  { main: 'Processando campanhas...', sub: '8 campanhas encontradas' },
  { main: 'Calculando métricas...', sub: 'ROAS · CPA · Budget · CTR' },
  { main: 'Gerando análise...', sub: 'Insights e recomendações' },
];

function ThinkingPhaseText() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => (p + 1) % THINKING_PHASES.length), 1100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-center h-10 flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          <p className="text-[13px] font-medium text-[#374151]">{THINKING_PHASES[phase].main}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">{THINKING_PHASES[phase].sub}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ORBITAL THINKING ANIMATION
═══════════════════════════════════════════════════════════════════ */
function OrbitalAnimation({ size = 80 }: { size?: number }) {
  const s = size;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: s, height: s, perspective: s * 5 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: s * 0.55,
          height: s * 0.55,
          background: 'radial-gradient(circle, rgba(255,106,0,0.12) 0%, transparent 70%)',
          filter: `blur(${s * 0.1}px)`,
        }}
      />
      {/* Ring 1 — orange, rotates Y */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s, height: s,
          border: `${Math.max(1.5, s * 0.02)}px solid rgba(255,106,0,0.6)`,
          boxShadow: '0 0 8px rgba(255,106,0,0.25)',
        }}
        animate={{ rotateY: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      />
      {/* Ring 2 — blue, tilted 60deg rotates Z */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 0.78, height: s * 0.78,
          border: `${Math.max(1.5, s * 0.018)}px solid rgba(59,130,246,0.55)`,
          rotateX: '60deg',
          boxShadow: '0 0 6px rgba(59,130,246,0.2)',
        }}
        animate={{ rotateZ: 360 }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Ring 3 — teal, tilted -60deg rotates Z */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 0.58, height: s * 0.58,
          border: `${Math.max(1, s * 0.016)}px solid rgba(16,185,129,0.5)`,
          rotateX: '-60deg',
        }}
        animate={{ rotateZ: -360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Ring 4 — outer, slow, orange faint */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s * 0.95, height: s * 0.95,
          border: `1px solid rgba(255,106,0,0.18)`,
          rotateX: '30deg',
        }}
        animate={{ rotateY: -360 }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Orbiting dot — orange, fast */}
      <motion.div
        className="absolute"
        style={{ width: s * 0.11, height: s * 0.11, transformOrigin: `${s * 0.475}px 0px` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="rounded-full bg-[#FF6A00]"
          style={{
            width: '100%', height: '100%',
            boxShadow: `0 0 ${s * 0.1}px rgba(255,106,0,0.9), 0 0 ${s * 0.06}px rgba(255,106,0,0.5)`,
          }}
        />
      </motion.div>
      {/* Orbiting dot — blue, slow */}
      <motion.div
        className="absolute"
        style={{ width: s * 0.085, height: s * 0.085, transformOrigin: `${-s * 0.36}px 0px` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="rounded-full bg-blue-400"
          style={{
            width: '100%', height: '100%',
            boxShadow: `0 0 ${s * 0.08}px rgba(59,130,246,0.8)`,
          }}
        />
      </motion.div>
      {/* Core */}
      <motion.div
        className="rounded-full bg-white border-2 border-[#FF6A00]"
        style={{
          width: s * 0.18, height: s * 0.18,
          boxShadow: `0 0 ${s * 0.12}px rgba(255,106,0,0.6), 0 0 ${s * 0.06}px rgba(255,106,0,0.4)`,
        }}
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LEFT PANEL — RESULTS
═══════════════════════════════════════════════════════════════════ */
function LeftPanelLoading({ activeAgent }: { activeAgent?: TeamAgent }) {
  return (
    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-5">
      <OrbitalAnimation size={88} />
      <ThinkingPhaseText />
      {/* Skeleton rows */}
      <div className="w-full max-w-xs px-6 mt-2 space-y-2.5">
        {[72, 88, 58, 80, 48].map((w, i) => (
          <motion.div
            key={i}
            className="h-2.5 bg-[#F0F0F2] rounded-full"
            style={{ width: `${w}%` }}
            animate={{ opacity: [0.35, 0.75, 0.35] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function EmptyLeftPanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center"
      >
        <Sparkles className="w-7 h-7 text-[#9CA3AF]" />
      </motion.div>
      <div>
        <p className="text-[14px] font-semibold text-[#374151]">Resultados aparecem aqui</p>
        <p className="text-[12px] text-[#9CA3AF] mt-1 max-w-[200px]">
          Faça uma pergunta ao Lucca e os dados estruturados serão exibidos neste painel.
        </p>
      </div>
      <div className="flex flex-col gap-1.5 w-full max-w-xs">
        {SUGGESTIONS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[12px] text-[#6B7280]"
          >
            <span className="text-[#FF6A00]">{s.icon}</span>
            {s.label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OrchestratorControlPanel({
  onSelectSuggestion,
}: {
  onSelectSuggestion: (agentId: string, specialty: string) => void;
}) {
  const agents = useMemo(() => {
    return TEAM_AGENTS.filter(ta => ta.id !== 'ulisses').map(ta => {
      const specialties = allSpecialties.filter(s => ta.specialtyTitles.includes(s.title));
      return {
        id: ta.id,
        nome: ta.nome,
        funcao: ta.funcao,
        avatarSrc: ta.avatarSrc,
        cor: ta.cor,
        status: ta.genero === 'F' ? 'Pronta' : 'Pronto',
        atividades: specialties.map(s => ({
          title: s.title,
          desc: s.description,
        })),
      };
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6 bg-slate-50/50">
      {/* Top Banner Status */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-800 leading-tight">Orquestração Central</h3>
              <p className="text-[11px] text-slate-400 font-medium">Ulisses Chief of Staff</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Ativo</span>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-slate-100">
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 text-center">
            <p className="text-[18px] font-black text-slate-700 leading-tight">4</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Agentes Ativos</p>
          </div>
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 text-center">
            <p className="text-[18px] font-black text-slate-700 leading-tight">11</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Operações</p>
          </div>
          <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 text-center">
            <p className="text-[18px] font-black text-slate-700 leading-tight">100%</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">SLA Operacional</p>
          </div>
        </div>
      </motion.div>

      {/* Agents workflow pipeline */}
      <div className="space-y-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Selecione uma Atividade para Delegar</p>
        <div className="space-y-3.5">
          {agents.map((ag, agIdx) => (
            <motion.div
              key={ag.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: agIdx * 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              {/* Left accent color bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: ag.cor }} />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200/60 shadow-sm relative">
                    <Image src={ag.avatarSrc} alt={ag.nome} width={32} height={32} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[13px] font-extrabold text-slate-800 leading-none">{ag.nome}</h4>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold border border-slate-200/50 leading-none">{ag.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">{ag.funcao}</p>
                  </div>
                </div>
              </div>

              {/* Suggestions chips grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {ag.atividades.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectSuggestion(ag.id, act.title)}
                    className="flex flex-col items-start text-left p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 hover:bg-slate-50 transition-all group/btn"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold text-slate-700 leading-tight group-hover/btn:text-[#FF6A00] transition-colors">{act.title}</span>
                      <ArrowRight className="w-3/5 h-3 text-slate-300 group-hover/btn:translate-x-0.5 group-hover/btn:text-[#FF6A00] transition-all" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5 line-clamp-1">{act.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Modal: Salvar na Base de Conhecimento (Sprint 3 / P0) ─────────── */
const SAVE_CATEGORIES = ['Operações', 'Tráfego', 'Conteúdo', 'Vendas', 'Suporte', 'SEO & GEO', 'Outros'];

function SaveToKnowledgeModal({
  defaultTitle,
  defaultCategory,
  onClose,
  onSave,
}: {
  defaultTitle: string;
  defaultCategory: string;
  onClose: () => void;
  onSave: (fields: { title: string; category: string; tags: string[] }) => Promise<{ success: boolean; error?: string }>;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [category, setCategory] = useState(
    SAVE_CATEGORIES.includes(defaultCategory) ? defaultCategory : 'Operações'
  );
  const [tagsText, setTagsText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (status === 'saving' || status === 'saved') return;
    setStatus('saving');
    setErrorMsg('');
    const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
    const result = await onSave({ title: title.trim(), category, tags });
    if (result.success) {
      setStatus('saved');
      setTimeout(onClose, 1200);
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Não foi possível salvar. Tente novamente.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-4 h-4 text-[#FF6A00]" />
            <h3 className="text-[14px] font-bold text-[#111827]">Salvar na Base de Conhecimento</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] text-[#111827] focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
              placeholder="Ex: Simulação de ROAS — Janeiro"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[13px] text-[#111827] focus:outline-none focus:border-[#FF6A00]/50 transition-all cursor-pointer"
            >
              {SAVE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
              Tags <span className="normal-case font-semibold text-[#9CA3AF]">(separadas por vírgula, opcional)</span>
            </label>
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 text-[13px] text-[#111827] focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
              placeholder="roas, google ads, planejamento"
            />
          </div>

          {status === 'error' && (
            <p className="text-[12px] font-semibold text-red-600">{errorMsg}</p>
          )}
          <p className="text-[11px] text-[#6B7280] leading-relaxed">
            O documento salvo fica disponível na Base de Conhecimento e passa a alimentar as próximas operações dos Agentes.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#F3F4F6] bg-[#F9FAFB]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-[12px] font-bold text-[#6B7280] hover:text-[#374151] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === 'saving' || status === 'saved' || !title.trim()}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold text-white transition-all disabled:opacity-60 ${
              status === 'saved' ? 'bg-emerald-500' : 'bg-[#FF6A00] hover:bg-[#e85f00]'
            }`}
          >
            {status === 'saved' ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Salvo!</>
            ) : status === 'saving' ? (
              <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Salvando…</>
            ) : (
              <><BookmarkPlus className="w-3.5 h-3.5" /> Salvar</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LeftPanel({
  result,
  isLoading,
  activeAgent,
  onSelectSuggestion,
  historyIndex,
  historyTotal,
  onHistoryNav,
  connectedSources,
}: {
  result: ResultPanel | null;
  isLoading: boolean;
  activeAgent?: TeamAgent;
  onSelectSuggestion: (agentId: string, specialty: string) => void;
  historyIndex: number;
  historyTotal: number;
  onHistoryNav: (direction: -1 | 1) => void;
  connectedSources: string[];
}) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [activeTab, setActiveTab] = useState<PanelTab>('resposta');
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { user, profile } = useAuth();

  const activeAutomations = useMemo(() => {
    if (!profile || !activeAgent) return [];
    
    // Obter todas as automações do perfil do usuário
    const allAutos = getHubAutomationsFromProfile(profile);
    
    // Filtrar apenas automações que estão ativas ('active')
    const activeAutos = allAutos.filter(a => a.status === 'active');
    
    // Filtrar automações associadas ao agente ativo atual (comparando o nome de forma normalizada ou id)
    return activeAutos.filter(a => {
      const autoAgentName = (a.agentTitle || '').trim().toUpperCase();
      const currentAgentName = (activeAgent.nome || '').trim().toUpperCase();
      
      const keyMatches = a.key.toLowerCase().includes(activeAgent.id.toLowerCase());
      
      return autoAgentName === currentAgentName || keyMatches;
    }).map(a => ({
      name: a.objective || a.cadenceTitle || 'Automação',
      description: a.scheduleOptionDetail || `Executado com cadência ${a.cadence}.`,
    }));
  }, [profile, activeAgent]);


  useEffect(() => {
    if (result) {
      setActiveTab('resposta'); // eslint-disable-line react-hooks/set-state-in-effect
      setSearch(''); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [result?.id]);

  const filteredRows = result?.tableRows.filter(row =>
    !search || row.cells.some(c => c.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  const hasTable = (result?.tableHeaders?.length ?? 0) > 0 && (result?.tableRows?.length ?? 0) > 0;

  /* Helper to render formatted report content with color hierarchy */
  function renderContent(text: string) {
    if (!text) return null;
    const lines = text.split('\n');
    let hCount = 0;
    return lines.map((line, i) => {
      // Headers with color accent bars
      if (line.startsWith('### ')) {
        hCount++;
        const headerColors = ['text-blue-700', 'text-emerald-700', 'text-violet-700', 'text-amber-700', 'text-rose-700'];
        const hc = headerColors[hCount % headerColors.length];
        return (
          <motion.h4 key={i}
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
            className={`text-sm font-bold ${hc} mt-4 mb-1.5 flex items-center gap-1.5`}
          >
            <span className="w-1 h-3.5 rounded-full bg-current opacity-50 shrink-0" />
            {line.replace('### ', '')}
          </motion.h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <motion.h3 key={i}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.4) }}
            className="text-[14px] font-black text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-1"
          >{line.replace('## ', '')}</motion.h3>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <motion.h2 key={i}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-[16px] font-black text-slate-900 mt-6 mb-3"
          >{line.replace('# ', '')}</motion.h2>
        );
      }

      // Bullet points — rotating color dots
      let isBullet = false;
      let content = line;
      if (line.trim().match(/^[•\-\*]/)) {
        isBullet = true;
        content = line.replace(/^[•\s\-\*]+/, '');
      }

      // Bold parsing: **text**
      const parts = content.split('**');
      const renderedLine = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-extrabold text-slate-900">{part}</strong>;
        }
        return part;
      });

      if (isBullet) {
        const dotColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'];
        const dc = dotColors[i % dotColors.length];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
            className="flex gap-2.5 items-start ml-1 my-1.5 text-[13px] text-slate-600"
          >
            <span className={`mt-2 shrink-0 w-1.5 h-1.5 rounded-full ${dc}`} />
            <span className="leading-relaxed">{renderedLine}</span>
          </motion.div>
        );
      }

      if (!line.trim()) return <div key={i} className="h-1.5" />;

      return (
        <motion.p
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.5) }}
          className="text-[13px] text-slate-600 leading-relaxed my-1"
        >
          {renderedLine}
        </motion.p>
      );
    });
  }

  /* Exporta a tabela atual como CSV real ou texto da resposta */
  const handleDownload = () => {
    if (!result) return;
    let fileContent = '';
    let fileName = `${result.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    let fileType = 'text/plain;charset=utf-8';

    if (hasTable && activeTab === 'tabela') {
      const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const lines: string[] = [];
      lines.push(esc(result.title));
      if (result.summary) lines.push(esc(result.summary));
      lines.push(result.tableHeaders.map(esc).join(';'));
      result.tableRows.forEach(row => lines.push(row.cells.map(esc).join(';')));
      fileContent = lines.join('\n');
      fileName = `${result.title.toLowerCase().replace(/\s+/g, '_')}.csv`;
      fileType = 'text/csv;charset=utf-8';
    } else {
      fileContent = `${result.title}\n\n${result.fullMessage || result.summary}`;
    }

    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = result.fullMessage || result.summary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Monta o conteúdo markdown completo do resultado para a Base de Conhecimento */
  const buildSaveContent = (): string => {
    if (!result) return '';
    const parts: string[] = [];

    if (result.summary) parts.push(result.summary);
    if (result.fullMessage && result.fullMessage !== result.summary) parts.push(result.fullMessage);

    if (result.tableHeaders.length > 0 && result.tableRows.length > 0) {
      const table = [
        `| ${result.tableHeaders.join(' | ')} |`,
        `| ${result.tableHeaders.map(() => '---').join(' | ')} |`,
        ...result.tableRows.map((r) => `| ${r.cells.join(' | ')} |`),
      ].join('\n');
      parts.push(`## Tabela de Dados\n${table}`);
    }

    const ai = result.aiData;
    if (ai?.analysisItems?.length) {
      parts.push(`## ${ai.analysisTitle || 'Análise'}\n${ai.analysisItems.map((i) => `- ${i}`).join('\n')}`);
    }
    if (ai?.sources?.length) {
      parts.push(`## Fontes\n${ai.sources.map((s) => `- ${s}`).join('\n')}`);
    }

    return parts.join('\n\n');
  };

  /* Exporta o resultado como PDF com identidade NeuroAds — reaproveita o
     gerador jsPDF da Base de Conhecimento (agent-report-history.ts) */
  const handleExportPdf = async () => {
    if (!result) return;
    const { downloadAgentReport } = await import('../../../lib/agent-report-history');
    await downloadAgentReport({
      id: result.id,
      agentKey: activeAgent?.id || 'assistente',
      agentTitle: activeAgent ? `${activeAgent.nome} (${activeAgent.funcao})` : 'Assistente IA',
      agentCategory: 'Operações',
      reportTitle: result.title,
      reportContent: buildSaveContent(),
      reportFormat: 'markdown',
      generatedAt: new Date().toISOString(),
      createdAtMs: Date.now(),
      metadata: result.aiData?.sources?.length ? { fontes: result.aiData.sources } : {},
    });
  };

  const handleSaveToKnowledge = async (fields: { title: string; category: string; tags: string[] }) => {
    if (!user) return { success: false, error: 'Faça login para salvar na Base de Conhecimento.' };
    return saveResultToKnowledge({
      userId: user.uid,
      title: fields.title,
      content: buildSaveContent(),
      agentKey: activeAgent?.id || 'assistente',
      agentTitle: activeAgent ? `${activeAgent.nome} (${activeAgent.funcao})` : 'Assistente IA',
      category: fields.category,
      tags: fields.tags,
    });
  };

  /* Extrai comparações se houver dados tabulares numéricos */
  const comparison = useMemo(() => {
    if (!result || result.tableHeaders.length < 2 || result.tableRows.length < 2) return [];
    const metrics: Array<{ header: string; best: { label: string; value: string }; worst: { label: string; value: string } }> = [];

    result.tableHeaders.slice(1).forEach((header, colIdx) => {
      let bestRow = result.tableRows[0];
      let worstRow = result.tableRows[0];
      let maxVal = -Infinity;
      let minVal = Infinity;
      let isNumericCol = true;

      result.tableRows.forEach(row => {
        const cell = row.cells[colIdx + 1];
        if (!cell) return;
        const num = parseFloat(cell.replace(/[^\d,\.\-]/g, '').replace(',', '.'));
        if (isNaN(num)) {
          isNumericCol = false;
        } else {
          if (num > maxVal) { maxVal = num; bestRow = row; }
          if (num < minVal) { minVal = num; worstRow = row; }
        }
      });

      if (isNumericCol) {
        metrics.push({
          header,
          best: { label: bestRow.cells[0], value: bestRow.cells[colIdx + 1] },
          worst: { label: worstRow.cells[0], value: worstRow.cells[colIdx + 1] },
        });
      }
    });
    return metrics;
  }, [result]);

  const topRow = useMemo(() => {
    if (!result || result.tableRows.length === 0) return null;
    return result.tableRows.find(r => r.highlight) || result.tableRows[0];
  }, [result]);

  const tabs: { id: PanelTab; label: string; icon: React.ReactNode }[] = [
    { id: 'resposta' as const, label: 'Relatório do Agente', icon: <FileText className="w-3.5 h-3.5" /> },
    ...(hasTable ? [{ id: 'tabela' as const, label: 'Tabela de Dados', icon: <Table2 className="w-3.5 h-3.5" /> }] : []),
    ...(comparison.length > 0 ? [{ id: 'comparar' as const, label: 'Comparar Métricas', icon: <BarChart2 className="w-3.5 h-3.5" /> }] : []),
    ...(topRow ? [{ id: 'top' as const, label: 'Item Destaque', icon: <TrendingUp className="w-3.5 h-3.5" /> }] : []),
  ];

  return (
    <div className="w-full border-r border-[#E5E7EB] bg-white flex flex-col h-full overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LeftPanelLoading activeAgent={activeAgent} />
        ) : !result ? (
          <EmptyLeftPanel />
        ) : (
          <motion.div key={result.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex-1 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="px-5 pt-5 pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-[15px] font-bold text-[#111827] leading-tight">{result.title}</h2>
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasTable && activeTab === 'tabela' && (
                    <>
                      <button title="Ver como tabela" onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#F3F4F6] text-[#374151]' : 'text-[#9CA3AF] hover:text-[#374151]'}`}>
                        <Table2 className="w-3.5 h-3.5" />
                      </button>
                      <button title="Ver como cards" onClick={() => setViewMode('chart')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'chart' ? 'bg-[#F3F4F6] text-[#374151]' : 'text-[#9CA3AF] hover:text-[#374151]'}`}>
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button title="Copiar resultado" onClick={handleCopy} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button title="Baixar resultado (CSV/TXT)" onClick={handleDownload} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button title="Exportar PDF" onClick={handleExportPdf} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                  <button title="Salvar na Base de Conhecimento" onClick={() => setShowSaveModal(true)} className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#FF6A00] transition-colors">
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${BADGE_STYLES[result.badgeVariant]}`}>
                <Globe className="w-3 h-3" />{result.badge}
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 border-b border-[#F3F4F6] bg-slate-50/20 py-2">
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all border ${
                      activeTab === t.id
                        ? 'bg-[#111827] text-white border-[#111827]'
                        : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Body based on Active Tab */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {activeTab === 'resposta' && result.id === 'init-panel' ? (
                  <div className="flex-1 p-5 overflow-y-auto bg-slate-50/30 space-y-4 select-text">
                    {/* Welcome banner */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="bg-gradient-to-br from-[#111827] to-[#1F2937] text-white rounded-2xl p-5 shadow-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF6A00]/20 to-transparent rounded-full filter blur-xl" />
                      <div className="flex items-start gap-4 mb-4 relative z-10">
                        {activeAgent?.avatarSrc ? (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-lg relative bg-slate-800">
                            <Image 
                              src={activeAgent.avatarSrc} 
                              alt={activeAgent.nome} 
                              width={80}
                              height={80}
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#FF8805] flex items-center justify-center shrink-0 shadow-lg">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                          </div>
                        )}
                        <div className="pt-1">
                          <p className="text-[11px] font-bold text-[#FF6A00] uppercase tracking-wider">Painel Operacional</p>
                          <h3 className="text-[20px] font-black leading-tight mb-1.5">{activeAgent?.nome || 'Lucca'}</h3>
                          <p className="text-[12px] text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            "{activeAgent?.frase || 'Seu orquestrador de operações de marketing.'}"
                          </p>
                        </div>
                      </div>

                      {/* Detailed Agent Specs */}
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-[12px] relative z-10 leading-relaxed">
                        <div>
                          <span className="font-bold text-[#FF6A00] block mb-0.5 uppercase tracking-wider text-[10px]">Função:</span>
                          <p className="text-slate-200 font-medium">{activeAgent?.funcao || 'Orquestrador Virtual'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[#FF6A00] block mb-0.5 uppercase tracking-wider text-[10px]">Atividades:</span>
                          <p className="text-slate-300">{activeAgent?.atividades || activeAgent?.descricao}</p>
                        </div>
                        <div>
                          <span className="font-bold text-[#FF6A00] block mb-0.5 uppercase tracking-wider text-[10px]">Objetivos:</span>
                          <p className="text-slate-300">{activeAgent?.objetivos || 'Otimizar a operação de marketing e vendas.'}</p>
                        </div>
                      </div>
                    </motion.div>
                    {/* Operational status card */}
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <h4 className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-[#FF6A00]" /> Status da Operação
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Status Geral</span>
                          <span className="text-[13px] font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            Ativo & Estável
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Orquestração</span>
                          <span className="text-[13px] font-black text-slate-700 mt-0.5">
                            Síncrona (100% Real)
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Automações Ativas */}
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <h4 className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#FF6A00]" /> Automações Ativas
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {activeAutomations.length > 0 ? (
                          activeAutomations.map((auto, idx) => (
                            <div key={idx} className="flex flex-col px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] hover:border-slate-200 hover:bg-slate-100/50 transition-all">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                <span className="font-bold text-slate-800">{auto.name}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{auto.description}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[12px] text-slate-400 italic py-1 px-1">
                            Nenhuma automação ativa para este agente.
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {/* Connected integrations status */}
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <h4 className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-[#FF6A00]" /> Fontes de Dados Conectadas
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {connectedSources.length > 0 ? (
                          connectedSources.map(src => (
                            <span key={src} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 border border-emerald-100 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {src}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-slate-400 italic">Nenhum canal ativo no momento.</span>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ) : activeTab === 'resposta' && (
                  <div className="flex-1 overflow-y-auto select-text">
                    {/* ── Hero Summary Card ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mx-4 mt-4 relative overflow-hidden rounded-2xl p-5 shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e293b 60%, #0f172a 100%)' }}
                    >
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(255,106,0,0.35), transparent 55%)' }} />
                      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 10% 80%, rgba(59,130,246,0.2), transparent 55%)' }} />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                          <span className="text-[9px] font-black text-[#FF6A00] uppercase tracking-widest">Síntese da Análise</span>
                          <div className="flex-1 h-px bg-white/10" />
                          <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[9px] text-emerald-400 font-bold">LIVE</span>
                          </motion.span>
                        </div>
                        <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                          {result.summary || 'Resultado da análise gerado pelo agente.'}
                        </p>
                      </div>
                    </motion.div>

                    {/* ── Insight Chips ── */}
                    {result.aiData?.analysisItems && result.aiData.analysisItems.length > 0 && (
                      <div className="px-4 pt-4 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {result.aiData.analysisTitle || 'Insights & Oportunidades'}
                        </p>
                        {result.aiData.analysisItems.map((item, i) => {
                          const palettes: Array<{ g: string; bg: string; border: string; text: string; icon: string }> = [
                            { g: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200/60', text: 'text-blue-900', icon: '📈' },
                            { g: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200/60', text: 'text-emerald-900', icon: '✅' },
                            { g: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', border: 'border-amber-200/60', text: 'text-amber-900', icon: '⚡' },
                            { g: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', border: 'border-violet-200/60', text: 'text-violet-900', icon: '🎯' },
                            { g: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', border: 'border-rose-200/60', text: 'text-rose-900', icon: '🔥' },
                          ];
                          const pal = palettes[i % 5];
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.08 + i * 0.07 }}
                              whileHover={{ x: 4, transition: { duration: 0.15 } }}
                              className={`flex items-start gap-3 p-3.5 ${pal.bg} border ${pal.border} rounded-xl cursor-default`}
                            >
                              <span className={`shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br ${pal.g} flex items-center justify-center text-xs shadow-sm`}>
                                {pal.icon}
                              </span>
                              <p className={`text-[12px] font-semibold ${pal.text} leading-snug mt-0.5`}>{item}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Full Agent Report ── */}
                    {result.fullMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="mx-4 mt-4 mb-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                          <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Relatório Completo do Agente</span>
                        </div>
                        <div className="p-4 space-y-1">
                          {renderContent(result.fullMessage)}
                        </div>
                      </motion.div>
                    )}

                    {!result.fullMessage && !result.summary && (
                      <div className="px-4 py-8 text-center">
                        <p className="text-[12px] text-slate-400">Nenhum conteúdo disponível.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tabela' && (
                  <div className="flex-1 overflow-y-auto bg-slate-50/30 p-5">
                    {/* search bar for table */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={result.searchPlaceholder || "Buscar na tabela..."}
                        className="w-full pl-8 pr-3 py-2 text-[13px] bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/20 transition-all placeholder:text-[#9CA3AF]"
                      />
                    </div>
                    {viewMode === 'table' ? (
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="bg-[#F9FAFB]">
                                {result.tableHeaders.map(h => (
                                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide border-b border-[#E5E7EB]">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRows.map((row, i) => (
                                <tr key={i} className={`border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors ${row.highlight ? 'bg-[#FFFBF7]' : ''}`}>
                                  {row.cells.map((cell, j) => (
                                    <td key={j} className={`px-4 py-2.5 ${j === 0 ? 'text-blue-600 font-medium' : 'text-[#374151]'} ${row.highlight && j === 0 ? 'text-[#FF6A00] font-semibold' : ''}`}>
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredRows.map((row, i) => (
                          <div key={i} className={`p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${row.highlight ? 'ring-1 ring-[#FF6A00]/30' : ''}`}>
                            {row.highlight && (
                              <div className="absolute top-0 right-0 bg-[#FF6A00] text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wide">
                                Melhor
                              </div>
                            )}
                            <h4 className="text-[12px] font-extrabold text-slate-800 line-clamp-1 mb-3" style={{ maxWidth: '85%' }}>
                              {row.cells[0]}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {row.cells.slice(1).map((cell, j) => {
                                const header = result.tableHeaders[j + 1] || 'Métrica';
                                return (
                                  <div key={j} className="flex flex-col gap-0.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{header}</span>
                                    <span className="text-[13px] font-black text-slate-700">{cell}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'comparar' && (
                  <div className="flex-1 p-5 overflow-y-auto bg-slate-50/30 space-y-3">
                    {comparison.map((m) => (
                      <div key={m.header} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-2 border-b border-slate-100 pb-1.5">{m.header}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-50/30 border border-emerald-100 p-3 rounded-xl">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Melhor desempenho</p>
                            <p className="text-[14px] font-black text-[#111827] truncate mt-1" title={m.best.label}>{m.best.label}</p>
                            <p className="text-[13px] text-emerald-600 font-black font-mono mt-0.5">{m.best.value}</p>
                          </div>
                          <div className="bg-rose-50/30 border border-rose-100 p-3 rounded-xl">
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Menor desempenho</p>
                            <p className="text-[14px] font-black text-[#111827] truncate mt-1" title={m.worst.label}>{m.worst.label}</p>
                            <p className="text-[13px] text-rose-500 font-black font-mono mt-0.5">{m.worst.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'top' && (
                  <div className="flex-1 p-5 overflow-y-auto bg-slate-50/30">
                    <div className="bg-[#FFFDFB] border border-[#FF6A00]/25 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF4D00] to-[#FF8805] flex items-center justify-center shrink-0 shadow-md">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-[#FF6A00] uppercase tracking-wider">Líder do Período</p>
                          <h3 className="text-[15px] font-black text-[#111827] truncate mt-0.5" title={topRow ? topRow.cells[0] : ''}>{topRow ? topRow.cells[0] : ''}</h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
                        {topRow?.cells.slice(1).map((cell, j) => {
                          const header = result.tableHeaders[j + 1] || 'Métrica';
                          return (
                            <div key={j} className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{header}</span>
                              <span className="text-[13px] font-black text-slate-700">{cell}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="bg-orange-50/40 border border-orange-100/50 rounded-xl p-3 text-[12px] text-slate-600 leading-relaxed">
                        Este item apresentou o maior rendimento sob a análise do agente **{activeAgent?.nome || 'Lucca'}**. 
                        Pergunte ao especialista como escalar ou replicar esse padrão nas demais frentes da operação.
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Histórico de resultados da sessão */}
            {historyTotal > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[#F3F4F6] shrink-0 bg-white">
                <button
                  onClick={() => onHistoryNav(-1)}
                  disabled={historyIndex <= 0}
                  className="flex items-center gap-1 text-[12px] text-[#6B7280] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />Anterior
                </button>
                <span className="text-[11px] font-semibold text-[#9CA3AF]">
                  Resultado {historyIndex + 1} de {historyTotal}
                </span>
                <button
                  onClick={() => onHistoryNav(1)}
                  disabled={historyIndex >= historyTotal - 1}
                  className="flex items-center gap-1 text-[12px] text-[#6B7280] hover:text-[#374151] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Próximo<ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Salvar na Base de Conhecimento */}
      <AnimatePresence>
        {showSaveModal && result && (
          <SaveToKnowledgeModal
            defaultTitle={result.title}
            defaultCategory={(() => {
              const f = (activeAgent?.funcao || '').toLowerCase();
              if (f.includes('tráfego')) return 'Tráfego';
              if (f.includes('conteúdo') || f.includes('editorial')) return 'Conteúdo';
              if (f.includes('sdr') || f.includes('closer') || f.includes('venda')) return 'Vendas';
              if (f.includes('suporte')) return 'Suporte';
              if (f.includes('seo')) return 'SEO & GEO';
              return 'Operações';
            })()}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSaveToKnowledge}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════════════
   CHAT MESSAGES
═══════════════════════════════════════════════════════════════════ */
function StreamText({ text, onDone }: { text: string; onDone: () => void }) {
  const [shown, setShown] = useState('');
  const idx = useRef(0);
  useEffect(() => {
    idx.current = 0; setShown(''); // eslint-disable-line react-hooks/set-state-in-effect
    const tick = () => {
      if (idx.current < text.length) { idx.current++; setShown(text.slice(0, idx.current)); setTimeout(tick, 14); }
      else onDone();
    };
    const t = setTimeout(tick, 60);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line
  return (
    <span className="whitespace-pre-wrap">
      {shown}
      <motion.span className="inline-block w-0.5 h-3.5 bg-[#374151] ml-0.5 align-middle" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
    </span>
  );
}

function ChatMessage({
  msg,
  isStreaming,
  onStreamDone,
  userPhoto,
  userName,
  onNextStep,
  activeAgent,
  onFormSubmit,
}: {
  msg: Message;
  isStreaming: boolean;
  onStreamDone: () => void;
  userPhoto?: string | null;
  userName?: string;
  onNextStep?: (step: string) => void;
  activeAgent?: TeamAgent;
  onFormSubmit?: (specialty: string, data: Record<string, string>, fields: CustomField[]) => void;
}) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden flex items-center justify-center border border-[#E5E7EB] bg-gradient-to-br from-[#FF6A00] to-[#FF8805]">
          {userPhoto ? (
            <Image src={userPhoto} alt={userName || 'User'} width={28} height={28} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-[11px] font-black">{(userName?.charAt(0) || 'U').toUpperCase()}</span>
          )}
        </div>
      ) : (
        <div 
          className="w-7 h-7 shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-sm"
          style={{ backgroundColor: activeAgent?.cor || '#3b82f6' }}
        >
          <Image
            src={activeAgent?.avatarSrc || "/images/Avatar_Lucca_Novo.jpeg"}
            alt={activeAgent?.nome || "Lucca"}
            width={28}
            height={28}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = 'none';
              if (el.parentElement) {
                el.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
              }
            }}
          />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Unverified badge */}
        {!isUser && msg.verified === false && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-medium text-amber-700">
            <AlertTriangle className="w-3 h-3" />Não verificado
          </motion.span>
        )}

        {/* Bubble */}
        {isUser ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-[#111827] shadow-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </div>
        ) : (
          <div className="text-[13px] text-[#374151] leading-relaxed">
            {isStreaming
              ? <StreamText text={msg.content} onDone={onStreamDone} />
              : <span className="whitespace-pre-wrap">{msg.content}</span>
            }
          </div>
        )}

        {/* Form fields rendering if they exist */}
        {!isUser && msg.fields && msg.fields.length > 0 && (
          <div className="mt-3 w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-[12px] font-black text-slate-700 uppercase tracking-wider mb-2">Dados da Operação</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: Record<string, string> = {};
              msg.fields!.forEach(f => {
                data[f.name] = formData.get(f.name) as string;
              });
              onFormSubmit?.(msg.specialty || '', data, msg.fields!);
            }} className="space-y-3">
              {msg.fields.map(f => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type === 'number' ? 'text' : f.type}
                    placeholder={f.placeholder}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-[13px] bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#FF6A00]/15 outline-none transition-all"
                    name={f.name}
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-[12px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_6px_rgba(255,106,0,0.2)] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
              >
                Executar Operação
              </button>
            </form>
          </div>
        )}

        {/* Next Steps chips — only for assistant messages with nextSteps */}
        {!isUser && !isStreaming && msg.nextSteps && msg.nextSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-1.5 w-full mt-1"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Próximos passos</p>
            <div className="flex flex-col gap-1.5">
              {msg.nextSteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => onNextStep?.(step)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:border-[#FF6A00]/40 hover:bg-orange-50/50 transition-all text-left text-[12px] text-[#374151] font-medium group shadow-sm"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF6A00] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  {step}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}


function AnalyzingIndicator({ activeAgent }: { activeAgent?: TeamAgent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, x: -8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3"
    >
      {/* Lucca avatar with pulsing ring while thinking */}
      <div className="relative w-7 h-7 shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400/30"
          animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div 
          className="w-7 h-7 rounded-full overflow-hidden border shadow-sm"
          style={{ borderColor: activeAgent?.cor || '#93c5fd' }}
        >
          <Image
            src={activeAgent?.avatarSrc || "/images/Avatar_Lucca_Novo.jpeg"}
            alt={activeAgent?.nome || "Lucca"}
            width={28}
            height={28}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <ThinkingPhaseText />
      </div>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   FILE PICKER POPOVER
═══════════════════════════════════════════════════════════════════ */
function FilePickerPopover({ onSelect, onClose }: { onSelect: (t: AttachType) => void; onClose: () => void }) {
  const options: { type: AttachType; label: string; ext: string; icon: React.ReactNode }[] = [
    { type: 'pdf', label: 'Documento PDF', ext: '.pdf, .docx', icon: <FileText className="w-4 h-4" /> },
    { type: 'audio', label: 'Arquivo de Áudio', ext: '.mp3, .wav', icon: <Music className="w-4 h-4" /> },
    { type: 'video', label: 'Arquivo de Vídeo', ext: '.mp4, .mov', icon: <Film className="w-4 h-4" /> },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden z-50">
      <div className="px-3 py-2.5 border-b border-[#F3F4F6]">
        <p className="text-[12px] font-semibold text-[#374151]">Selecionar arquivo para análise</p>
      </div>
      {options.map(o => (
        <button key={o.type} onClick={() => { onSelect(o.type); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F9FAFB] transition-colors text-left">
          <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">{o.icon}</div>
          <div>
            <p className="text-[13px] text-[#374151] font-medium">{o.label}</p>
            <p className="text-[11px] text-[#9CA3AF]">{o.ext}</p>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CLI COMMAND MODAL
═══════════════════════════════════════════════════════════════════ */
function CLIModal({ input, tone, sources, onClose }: { input: string; tone: ToneMode; sources: SourceTag[]; onClose: () => void }) {
  const cmd = [
    'lucca query \\',
    `  --prompt "${input || 'Analise o ROAS das últimas 4 semanas'}" \\`,
    `  --source ${sources.map(s => s.label.toLowerCase().replace(/ /g, '-')).join(',')} \\`,
    '  --period 28d \\',
    `  --tone ${tone} \\`,
    '  --format table',
  ].join('\n');
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#374151]" />
            <span className="text-[14px] font-semibold text-[#111827]">Comando CLI</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F3F4F6] rounded-lg text-[#9CA3AF] transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-[12px] text-[#6B7280] mb-3">Esta conversa foi convertida em um comando reutilizável:</p>
          <div className="relative bg-[#0F172A] rounded-xl p-4 font-mono text-[12px] text-[#94A3B8] overflow-x-auto">
            <pre className="whitespace-pre">{cmd}</pre>
            <button onClick={copy} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-3">Execute este comando na CLI do NeuroAds para reproduzir esta análise a qualquer momento.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INPUT DOCK
═══════════════════════════════════════════════════════════════════ */
function InputDock({
  onSend, chatState, lastQuery,
}: {
  onSend: (prompt: string, tone: ToneMode, attachedFile?: AttachedFile) => void;
  chatState: ChatState;
  lastQuery: string;
}) {
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<ToneMode>('formal');
  const [showTone, setShowTone] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [showCLI, setShowCLI] = useState(false);
  const [focused, setFocused] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || chatState !== 'idle') return;
    onSend(input.trim(), tone, attachedFile || undefined);
    setInput('');
    setAttachedFile(null);
    if (textRef.current) { textRef.current.style.height = 'auto'; }
  };

  const tones: { id: ToneMode; label: string }[] = [
    { id: 'formal', label: 'Formal' },
    { id: 'criativo', label: 'Criativo' },
    { id: 'direto', label: 'Direto' },
  ];

  const fileIcons: Record<AttachType, React.ReactNode> = {
    pdf: <FileText className="w-3 h-3" />,
    audio: <Music className="w-3 h-3" />,
    video: <Film className="w-3 h-3" />,
  };

  return (
    <div className="shrink-0 px-4 pb-4 pt-2 border-t border-[#E5E7EB] bg-[#F5F5F7]">
      {/* Previous query pill (when AI responded) */}
      <AnimatePresence>
        {lastQuery && chatState === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-full text-[12px] text-[#6B7280] max-w-full overflow-hidden shadow-sm">
              <Hash className="w-3 h-3 shrink-0 text-[#9CA3AF]" />
              <span className="truncate max-w-[240px]">{lastQuery}</span>
              <span className="shrink-0 ml-1 px-1.5 py-0.5 rounded-full bg-[#F3F4F6] text-[10px] font-bold text-[#6B7280]">+3</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tone controls strip */}
      <AnimatePresence>
        {showTone && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
            <div className="flex items-center gap-1.5 pb-2">
              <span className="text-[11px] text-[#9CA3AF] mr-1">Tom:</span>
              {tones.map(t => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  className={`px-2.5 py-1 rounded-full text-[12px] font-medium border transition-all ${tone === t.id ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached file chip */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-[12px] text-[#374151]">
              <span className="text-[#FF6A00]">{fileIcons[attachedFile.type]}</span>
              <span>{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-[#9CA3AF] hover:text-[#374151]"><X className="w-3 h-3" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input container */}
      <div className={`relative flex items-end gap-1 bg-white border rounded-2xl px-1 py-1 shadow-sm transition-all duration-200 ${focused ? 'border-[#D1D5DB] shadow-[0_0_0_3px_rgba(0,0,0,0.06)]' : 'border-[#E5E7EB]'}`}>
        {/* Left buttons */}
        <div className="flex items-center shrink-0">
          <div className="relative">
            <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setShowFilePicker(v => !v)}
              className="p-2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
              <Paperclip className="w-4 h-4" />
            </motion.button>
            <AnimatePresence>{showFilePicker && <FilePickerPopover onSelect={(type) => setAttachedFile({ name: `arquivo.${type}`, type })} onClose={() => setShowFilePicker(false)} />}</AnimatePresence>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textRef}
          value={input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => {
            setInput(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={chatState !== 'idle'}
          placeholder={chatState === 'thinking' ? 'Lucca está analisando...' : 'Como posso ajudar?'}
          className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-none resize-none outline-none text-[14px] text-[#111827] placeholder:text-[#9CA3AF] py-2.5 px-1 leading-relaxed disabled:opacity-50"
          rows={1}
        />

        {/* Right buttons */}
        <div className="flex items-center gap-0.5 shrink-0 pb-1">
          <motion.button type="button" whileTap={{ scale: 0.9 }} className="p-2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
            <Mic className="w-4 h-4" />
          </motion.button>
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setShowTone(v => !v)}
            className={`p-2 transition-colors ${showTone ? 'text-[#111827]' : 'text-[#9CA3AF] hover:text-[#374151]'}`}>
            <Settings2 className="w-4 h-4" />
          </motion.button>
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => setShowCLI(true)}
            className="p-2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
            <Terminal className="w-4 h-4" />
          </motion.button>
          {/* Send */}
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || chatState !== 'idle'}
            whileTap={{ scale: 0.88 }}
            animate={input.trim() && chatState === 'idle' ? { scale: 1 } : { scale: 1 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ml-0.5 ${input.trim() && chatState === 'idle' ? 'bg-[#111827] text-white shadow-md hover:bg-[#1F2937]' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Source tags */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {SOURCES.slice(0, 3).map(s => (
          <button key={s.label} className="flex items-center gap-1 text-[11px] text-[#6B7280] hover:text-[#374151] transition-colors">
            <span className="underline underline-offset-2 decoration-dotted">{s.label}</span>
            <span className="text-[#9CA3AF]">·</span>
            <span className="text-[#9CA3AF]">{s.type}</span>
          </button>
        ))}
        <button className="text-[11px] text-[#9CA3AF] hover:text-[#374151] transition-colors ml-1">+{SOURCES.length - 2}</button>
      </div>

      {/* CLI Modal */}
      <AnimatePresence>{showCLI && <CLIModal input={input} tone={tone} sources={SOURCES} onClose={() => setShowCLI(false)} />}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function HubAssistentePage() {
  const { user, profile } = useAuth();
  const userName = user?.displayName || profile?.companyName || 'Você';
  const userPhoto = user?.photoURL || null;
  const sessionIdRef = useRef<string | undefined>(undefined);
  const [dataAccessWarning, setDataAccessWarning] = useState<string | null>(null);

  // Build real connector lists from profile
  const { connectedSources, disconnectedSources } = React.useMemo(() => {
    const CONNECTOR_LABELS: Record<string, string> = {
      meta_ads: 'Meta Ads', google_ads: 'Google Ads', ga4: 'GA4',
      tiktok_ads: 'TikTok Ads', rd_station_crm: 'RD Station CRM',
      rd_station_marketing: 'RD Station Marketing', linkedin_ads: 'LinkedIn Ads',
      search_console: 'Search Console', gtm_server: 'GTM Server CAPI',
      stripe: 'Stripe / Pagamentos', bigquery: 'BigQuery',
      instagram: 'Instagram', crm: 'CRM HubSpot',
    };
    const connections = profile?.connections || {};
    const connected: string[] = [];
    const disconnected: string[] = [];
    Object.entries(CONNECTOR_LABELS).forEach(([key, label]) => {
      if (connections[key]?.isActive) connected.push(label);
      else disconnected.push(label);
    });
    return { connectedSources: connected, disconnectedSources: disconnected };
  }, [profile?.connections]);

  const realActiveAgents = React.useMemo(() => {
    const map = (profile?.activeAgents ?? {}) as Record<string, { isActive?: boolean } | undefined>;
    return Object.entries(map)
      .filter(([, v]) => v?.isActive)
      .map(([title]) => title);
  }, [profile?.activeAgents]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const agentId = searchParams.get('agent');
  const specialtyTitle = searchParams.get('specialty');

  const activeAgent = useMemo(() => {
    return getTeamAgentById(agentId || 'ulisses');
  }, [agentId]);

  const initialMessage = useMemo(() => {
    if (activeAgent) {
      const specFields = specialtyTitle ? SPECIALTY_FIELDS[specialtyTitle] : undefined;
      
      let initialContent = specialtyTitle
        ? `Olá! Sou o **${activeAgent.nome}**, seu especialista em ${activeAgent.funcao}.\n\nPara iniciar a operação **${specialtyTitle}**, preciso que você preencha os seguintes dados:`
        : `Olá! Sou o **${activeAgent.nome}**, seu especialista em ${activeAgent.funcao}.\n\n"${activeAgent.frase}"\n\nComo posso ajudar você hoje?`;

      if (activeAgent.id === 'ulisses' && !specialtyTitle) {
        initialContent = `Olá! Sou o **Ulisses**, seu Chief of Staff Virtual da NeuroAds.

Como orquestrador principal da operação, coordeno nosso time de agentes especialistas para maximizar seus resultados. Aqui estão algumas atividades-chave que posso direcionar e acompanhar:

📡 **PAOLA (Tráfego)**: Otimizar orçamento de mídia ou Simular seu ROAS.
✍️ **LAÍS (Conteúdo)**: Criar copies de alta conversão ou Roteiros de criativos.
⚙️ **HEITOR (Processos)**: Diagnóstico de funil de vendas ou Previsão de ROI.
🔭 **IGOR (Dados & SEO)**: Análise de concorrentes ou Auditoria de SEO/GEO.

Diga-me qual é a sua meta atual ou escolha uma atividade abaixo para começar:`;
      }

      const nextSteps = activeAgent.id === 'ulisses' && !specialtyTitle
        ? [
            'Simular ROAS de Campanha (com Paola)',
            'Gerar Copies de Alta Conversão (com Laís)',
            'Fazer Diagnóstico de Funil de Vendas (com Heitor)',
            'Análise de SEO & GEO do meu Site (com Igor)',
          ]
        : activeAgent.specialtyTitles.map(s => `Executar: ${s}`);

      return {
        id: 'init',
        role: 'assistant' as const,
        content: initialContent,
        verified: true,
        nextSteps,
        fields: specFields,
        specialty: specialtyTitle || undefined,
      };
    }
    return {
      id: 'init',
      role: 'assistant' as const,
      content: 'Olá! Sou o Lucca, seu consultor de marketing com IA.\n\nPosso analisar campanhas, criativos, métricas e gerar insights em tempo real. Como posso ajudar?',
      verified: true,
      nextSteps: [
        'Análise de ROAS das últimas 4 semanas',
        'Quais criativos têm o melhor CTR?',
        'Identificar campanhas abaixo da meta de CPA',
        'Visão geral do investimento por canal',
      ],
    };
  }, [activeAgent, specialtyTitle]);

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    setMessages([initialMessage]);
    const initPanel: ResultPanel = {
      id: 'init-panel',
      title: specialtyTitle || `Painel de Operações - ${activeAgent?.nome ?? 'Ulisses'}`,
      badge: activeAgent?.id === 'ulisses' ? 'Orquestrador' : 'Agente IA',
      badgeVariant: 'orange',
      summary: activeAgent?.frase || 'Seu orquestrador de operações de marketing.',
      searchPlaceholder: 'Buscar...',
      tableHeaders: [],
      tableRows: [],
      fullMessage: initialMessage.content,
    };
    setResults([initPanel]);
    setResultIndex(0);
  }, [initialMessage, specialtyTitle, activeAgent]);

  const [chatState, setChatState] = useState<ChatState>('idle');
  const [results, setResults] = useState<ResultPanel[]>([]);
  const [resultIndex, setResultIndex] = useState(0);
  const currentResult = results[resultIndex] ?? null;
  const [leftLoading, setLeftLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatState]);

  // Persist chat to Firestore knowledge base
  const persistChat = useCallback(async (msgs: Message[]) => {
    if (!user) return;
    const userMsgs = msgs.filter(m => m.role === 'user');
    if (userMsgs.length === 0) return;
    const stored: StoredChatMessage[] = msgs
      .filter(m => m.content)
      .map(m => ({ role: m.role, text: m.content, createdAtMs: Date.now() }));
    const result = await saveChatSession(user.uid, stored, sessionIdRef.current);
    if (result.id) sessionIdRef.current = result.id;
  }, [user]);

  const handleSend = useCallback(async (prompt: string) => {
    setLastQuery(prompt);
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: prompt };
    setMessages(p => [...p, userMsg]);
    setChatState('thinking');
    setLeftLoading(true);

    try {
      // Build conversation history for AI context
      const history = messages
        .filter(m => m.id !== 'init')
        .slice(-10) // last 10 messages for context
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      history.push({ role: 'user', content: prompt });

      const context = {
        userName,
        companyName: profile?.companyName,
        site: profile?.site,
        userId: user?.uid,
        connectedSources,
        disconnectedSources,
        activeAgents: realActiveAgents,
        agentId: agentId || 'ulisses',
      };

      // Call real AI
      const aiResponse = await chatWithLuccaHub(
        history.map(m => ({ ...m, role: m.role as 'user' | 'assistant' | 'system' })),
        context
      );

      if (!aiResponse.success) throw new Error(aiResponse.error);

      // A resposta SEMPRE alimenta o painel esquerdo: usa o leftPanel da IA
      // ou sintetiza um painel a partir da própria mensagem.
      const panelData = aiResponse.leftPanelData ?? {
        title: specialtyTitle || `Análise de ${activeAgent?.nome ?? 'Lucca'}`,
        badge: 'Resposta do Agente',
        description: aiResponse.message || '',
        analysisTitle: 'Próximos passos',
        analysisItems: aiResponse.nextSteps,
      };
      const aiPanel: ResultPanel = {
        id: `ai-${Date.now()}`,
        title: panelData.title || 'Resultado',
        badge: panelData.badge || 'IA',
        badgeVariant: 'orange',
        summary: panelData.description || '',
        searchPlaceholder: 'Buscar...',
        tableHeaders: panelData.tableHeaders || [],
        tableRows: (panelData.tableRows || []).map((row, i) => ({
          cells: Object.values(row),
          highlight: i === 0,
        })),
        aiData: panelData,
        fullMessage: aiResponse.message || '',
      };
      setResults(prev => {
        const next = [...prev, aiPanel];
        setResultIndex(next.length - 1);
        return next;
      });
      setLeftLoading(false);

      const aId = `a-${Date.now()}`;
      // Brief executive insight for chat — full analysis lives in the left panel only
      const executiveSummary = panelData.description
        ? panelData.description.split(/\.\s+/).slice(0, 2).join('. ').trim() + '.'
        : (aiResponse.message?.split('\n')[0] || 'Análise concluída.');
      const assistantMsg: Message = {
        id: aId,
        role: 'assistant',
        content: `Insight: ${executiveSummary}\n\n-> Relatório completo no painel ao lado.`,
        verified: true,
        nextSteps: aiResponse.nextSteps,
      };
      // Show data access warning if present
      if (aiResponse.dataAccessWarning) {
        setDataAccessWarning(aiResponse.dataAccessWarning);
      } else {
        setDataAccessWarning(null);
      }
      setMessages(prev => {
        const updated = [...prev, assistantMsg];
        // Persist after update
        persistChat(updated).catch(console.error);
        return updated;
      });
      setChatState('streaming');
      setStreamingId(aId);
    } catch (err) {
      console.error('[HubChat]', err);
      setLeftLoading(false);
      const aId = `a-err-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: aId,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        verified: false,
      }]);
      setChatState('idle');
    }
  }, [messages, userName, profile, persistChat, agentId, connectedSources, disconnectedSources, user]);

  const handleFormSubmit = useCallback((specialty: string, data: Record<string, string>, fields: CustomField[]) => {
    const lines = [
      `Executar operação: **${specialty}**`,
      `Parâmetros enviados:`,
      ...fields.map(f => `• **${f.label}**: ${data[f.name] || 'N/A'}`)
    ];
    handleSend(lines.join('\n'));
  }, [handleSend]);

  const handleStreamDone = useCallback(() => {
    setChatState('idle');
    setStreamingId(null);
  }, []);

  /* Mobile: one pane at a time (panel ⇄ chat); desktop keeps both side by side */
  const [mobilePane, setMobilePane] = useState<'panel' | 'chat'>('chat');

  useEffect(() => {
    // When a fresh analysis result lands on a small screen, surface the panel
    if (currentResult && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobilePane('panel');
    }
  }, [currentResult]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex w-full h-full bg-[#EBEBED] overflow-hidden rounded-xl border border-[#E0E0E3] shadow-sm"
    >
      {/* ── Mobile pane switcher ── */}
      <div className="lg:hidden absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 p-1 rounded-full bg-white/85 backdrop-blur-md border border-[#E0E0E3] shadow-[0_4px_16px_rgba(15,23,42,0.10)]">
        <button
          type="button"
          onClick={() => setMobilePane('panel')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all duration-200 ${
            mobilePane === 'panel'
              ? 'bg-[#111827] text-white shadow-sm'
              : 'text-slate-500 active:scale-95'
          }`}
        >
          <LayoutGrid size={12} />
          Painel
        </button>
        <button
          type="button"
          onClick={() => setMobilePane('chat')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all duration-200 ${
            mobilePane === 'chat'
              ? 'bg-[#FF6A00] text-white shadow-sm'
              : 'text-slate-500 active:scale-95'
          }`}
        >
          <MessageSquare size={12} />
          Chat
        </button>
      </div>

      {/* ── LEFT PANEL ── */}
      <div
        className={`${
          mobilePane === 'panel' ? 'flex' : 'hidden'
        } w-full pt-12 lg:pt-0 lg:flex lg:w-[55%] min-w-0 flex-col lg:border-r border-[#E0E0E3] overflow-hidden`}
      >
        <LeftPanel
          result={currentResult}
          isLoading={leftLoading}
          activeAgent={activeAgent}
          onSelectSuggestion={(agId, specTitle) => {
            router.push(`/hub/assistente-ia?agent=${agId}&specialty=${encodeURIComponent(specTitle)}`);
          }}
          historyIndex={resultIndex}
          historyTotal={results.length}
          onHistoryNav={(direction) => {
            setResultIndex(prev => Math.min(Math.max(prev + direction, 0), results.length - 1));
          }}
          connectedSources={connectedSources}
        />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className={`${
          mobilePane === 'chat' ? 'flex' : 'hidden'
        } w-full pt-12 lg:pt-0 lg:flex flex-1 flex-col min-w-0 bg-[#F5F5F7] overflow-hidden`}
      >
        {/* Data access warning banner */}
        <AnimatePresence>
          {dataAccessWarning && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-[12px] font-semibold text-amber-800 overflow-hidden"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="flex-1">{dataAccessWarning}</span>
              <button
                onClick={() => setDataAccessWarning(null)}
                className="ml-1 p-0.5 rounded hover:bg-amber-100 transition-colors"
              >
                <X className="w-3 h-3 text-amber-600" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                isStreaming={streamingId === msg.id}
                onStreamDone={handleStreamDone}
                userPhoto={userPhoto}
                userName={userName}
                onNextStep={(step) => {
                  if (chatState !== 'idle') return;
                  if (step.includes('(com Paola)')) {
                    router.push('/hub/assistente-ia?agent=paola&specialty=Simulador de ROAS');
                    return;
                  }
                  if (step.includes('(com Laís)')) {
                    router.push('/hub/assistente-ia?agent=lais&specialty=Gerador de Copies de Conversão');
                    return;
                  }
                  if (step.includes('(com Heitor)')) {
                    router.push('/hub/assistente-ia?agent=heitor&specialty=Diagnóstico de Funil');
                    return;
                  }
                  if (step.includes('(com Igor)')) {
                    router.push('/hub/assistente-ia?agent=igor&specialty=SEO & GEO');
                    return;
                  }
                  if (step.startsWith('Executar: ')) {
                    const specialtyName = step.replace('Executar: ', '');
                    router.push(`/hub/assistente-ia?agent=${activeAgent?.id || 'ulisses'}&specialty=${encodeURIComponent(specialtyName)}`);
                    return;
                  }
                  handleSend(step);
                }}
                activeAgent={activeAgent}
                onFormSubmit={handleFormSubmit}
              />
            ))}
            {chatState === 'thinking' && <AnalyzingIndicator key="analyzing" activeAgent={activeAgent} />}
          </AnimatePresence>



          <div ref={endRef} />
        </div>

        {/* Input dock */}
        <InputDock onSend={handleSend} chatState={chatState} lastQuery={lastQuery} />
      </div>
    </motion.div>
  );
}
