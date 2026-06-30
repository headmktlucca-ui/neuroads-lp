'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Send, Paperclip, Mic, ChevronDown, ChevronUp,
  Search, Download, LayoutGrid, LineChart, TrendingUp,
  FileText, Terminal, Link2, BarChart2, Globe, Database,
  Target, CheckCircle2, AlertTriangle, Sparkles,
  Film, Music, File, X, Copy, Table2, User, RefreshCw,
  Settings2, ChevronRight, Zap, Hash, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { chatWithLuccaHub, type LuccaLeftPanelData } from '../../actions/lucca-hub-chat';
import { saveChatSession, type ChatMessage as StoredChatMessage } from '../../../lib/chat-history';


/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */
type ChatState = 'idle' | 'thinking' | 'streaming';
type ToneMode = 'formal' | 'criativo' | 'direto';
type AttachType = 'pdf' | 'audio' | 'video';
type PanelTab = 'resumir' | 'comparar' | 'top';
type ViewMode = 'table' | 'chart';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  verified?: boolean;
  partial?: boolean;
  resultId?: string;
  nextSteps?: string[];
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

const ANALYSIS_CONTENT: Record<string, Record<PanelTab, React.ReactNode>> = {
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

function LeftPanel({ result, isLoading }: { result: ResultPanel | null; isLoading: boolean }) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [activeTab, setActiveTab] = useState<PanelTab>('resumir');
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [analysisOpen, setAnalysisOpen] = useState(true);

  useEffect(() => { if (result) { setActiveTab('resumir'); setSummaryOpen(true); setAnalysisOpen(true); } }, [result?.id]);

  const filteredRows = result?.tableRows.filter(row =>
    !search || row.cells.some(c => c.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB] overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading ? (
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
        ) : !result ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-y-auto">
            <EmptyLeftPanel />
          </motion.div>
        ) : (
          <motion.div key={result.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex-1 flex flex-col overflow-y-auto">
            {/* Panel header */}
            <div className="px-5 pt-5 pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-[15px] font-bold text-[#111827] leading-tight">{result.title}</h2>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[#F3F4F6] text-[#374151]' : 'text-[#9CA3AF] hover:text-[#374151]'}`}>
                    <Table2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setViewMode('chart')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'chart' ? 'bg-[#F3F4F6] text-[#374151]' : 'text-[#9CA3AF] hover:text-[#374151]'}`}>
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#374151] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${BADGE_STYLES[result.badgeVariant]}`}>
                <Globe className="w-3 h-3" />{result.badge}
              </span>
              {result.aiData?.isSimulated && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3" />Dados Simulados
                </span>
              )}
            </div>

            {/* Summary */}
            <div className="border-b border-[#F3F4F6]">
              <button onClick={() => setSummaryOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFA] transition-colors">
                <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[#9CA3AF]" />Descrição resumida</div>
                {summaryOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />}
              </button>
              <AnimatePresence>
                {summaryOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-5 pb-4">
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={result.searchPlaceholder}
                          className="w-full pl-8 pr-3 py-2 text-[13px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg outline-none focus:border-[#FF6A00]/40 focus:ring-1 focus:ring-[#FF6A00]/20 transition-all placeholder:text-[#9CA3AF]" />
                      </div>
                      <p className="text-[13px] text-[#6B7280] leading-relaxed">{result.summary}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Table */}
            <div className="border-b border-[#F3F4F6]">
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

            {/* Analysis section */}
            <div className="flex-1">
              <button onClick={() => setAnalysisOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFA] transition-colors border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2"><BarChart2 className="w-3.5 h-3.5 text-[#9CA3AF]" />Análise</div>
                {analysisOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />}
              </button>
              <AnimatePresence>
                {analysisOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-5 pt-3 pb-2">
                      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                        {(['resumir', 'comparar', 'top'] as PanelTab[]).map(tab => {
                          const labels: Record<PanelTab, string> = { resumir: 'Resumir', comparar: 'Comparar campanhas', top: 'Identificar top' };
                          const icons: Record<PanelTab, React.ReactNode> = {
                            resumir: <FileText className="w-3 h-3" />,
                            comparar: <BarChart2 className="w-3 h-3" />,
                            top: <TrendingUp className="w-3 h-3" />,
                          };
                          return (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all border ${activeTab === tab
                                ? 'bg-[#111827] text-white border-[#111827]'
                                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#9CA3AF]'
                              }`}>
                              {icons[tab]}{labels[tab]}
                            </button>
                          );
                        })}
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                          {/* AI-generated analysis items take priority */}
                          {result.aiData?.analysisItems && activeTab === 'resumir' ? (
                            <div className="space-y-2 text-[13px] text-[#374151] leading-relaxed">
                              {result.aiData.analysisItems.map((item, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            ANALYSIS_CONTENT[result.id]?.[activeTab] || (
                              <p className="text-[12px] text-[#9CA3AF] italic">Análise gerada pelo Lucca com base nos dados acima.</p>
                            )
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* More */}
            <button className="flex items-center gap-1.5 px-5 py-3 text-[12px] text-[#6B7280] hover:text-[#374151] border-t border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors">
              <ChevronDown className="w-3.5 h-3.5" />Mais dados
            </button>
          </motion.div>
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
    idx.current = 0; setShown('');
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
}: {
  msg: Message;
  isStreaming: boolean;
  onStreamDone: () => void;
  userPhoto?: string | null;
  userName?: string;
  onNextStep?: (step: string) => void;
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
        <div className="w-7 h-7 shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-blue-500 shadow-sm">
          <Image
            src="/images/Avatar_Lucca_Novo.jpeg"
            alt="Lucca"
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
          <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-[#111827] shadow-sm leading-relaxed">
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


function AnalyzingIndicator() {
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
        <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-300 shadow-sm">
          <Image
            src="/images/Avatar_Lucca_Novo.jpeg"
            alt="Lucca"
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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Olá! Sou o Lucca, seu consultor de marketing com IA.\n\nPosso analisar campanhas, criativos, métricas e gerar insights em tempo real. Como posso ajudar?',
      verified: true,
      nextSteps: [
        'Análise de ROAS das últimas 4 semanas',
        'Quais criativos têm o melhor CTR?',
        'Identificar campanhas abaixo da meta de CPA',
        'Visão geral do investimento por canal',
      ],
    },
  ]);
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [currentResult, setCurrentResult] = useState<ResultPanel | null>(null);
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
        activeAgents: ['Agente Performance', 'Agente Criativos', 'Agente Técnico'],
      };

      // Call real AI
      const aiResponse = await chatWithLuccaHub(
        history.map(m => ({ ...m, role: m.role as 'user' | 'assistant' | 'system' })),
        context
      );

      if (!aiResponse.success) throw new Error(aiResponse.error);

      // Update left panel with AI-generated data
      if (aiResponse.leftPanelData) {
        const aiPanel: ResultPanel = {
          id: `ai-${Date.now()}`,
          title: aiResponse.leftPanelData.title || 'Resultado',
          badge: aiResponse.leftPanelData.badge || 'IA',
          badgeVariant: 'orange',
          summary: aiResponse.leftPanelData.description || '',
          searchPlaceholder: 'Buscar...',
          tableHeaders: aiResponse.leftPanelData.tableHeaders || [],
          tableRows: (aiResponse.leftPanelData.tableRows || []).map((row, i) => ({
            cells: Object.values(row),
            highlight: i === 0,
          })),
          aiData: aiResponse.leftPanelData,
        };
        setCurrentResult(aiPanel);
      }
      setLeftLoading(false);

      const aId = `a-${Date.now()}`;
      const assistantMsg: Message = {
        id: aId,
        role: 'assistant',
        content: aiResponse.message || 'Desculpe, não consegui gerar uma resposta.',
        verified: !aiResponse.leftPanelData?.isSimulated,
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
  }, [messages, userName, profile, persistChat]);

  const handleStreamDone = useCallback(() => {
    setChatState('idle');
    setStreamingId(null);
  }, []);

  const showSuggestions = messages.length === 1 && chatState === 'idle';


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex w-full h-full bg-[#EBEBED] overflow-hidden rounded-xl border border-[#E0E0E3] shadow-sm"
    >
      {/* ── LEFT PANEL ── */}
      <div className="w-[48%] min-w-0 flex flex-col border-r border-[#E0E0E3] overflow-hidden">
        <LeftPanel result={currentResult} isLoading={leftLoading} />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F5F7] overflow-hidden">
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
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#D1D5DB] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                isStreaming={streamingId === msg.id}
                onStreamDone={handleStreamDone}
                userPhoto={userPhoto}
                userName={userName}
                onNextStep={(step) => chatState === 'idle' && handleSend(step)}
              />
            ))}
            {chatState === 'thinking' && <AnalyzingIndicator key="analyzing" />}
          </AnimatePresence>

          {/* Suggestion chips — initial state */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }} className="pt-2">
                <p className="text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-2 font-medium">Sugestões</p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button key={s.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                      onClick={() => handleSend(s.prompt)}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#374151] hover:border-[#D1D5DB] hover:shadow-sm transition-all text-left group">
                      <span className="text-[#FF6A00]">{s.icon}</span>
                      <span className="flex-1">{s.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#374151] transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* Input dock */}
        <InputDock onSend={handleSend} chatState={chatState} lastQuery={lastQuery} />
      </div>
    </motion.div>
  );
}
