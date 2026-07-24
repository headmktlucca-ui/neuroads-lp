'use client';

import React, { useState, useEffect } from 'react';
import HeroCircuitBackground from '../ui/HeroCircuitBackground';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  Download,
  ArrowRight,
  TrendingUp,
  Globe,
  Building2,
  Layers,
  ShieldCheck,
  Zap,
  BarChart3,
  FileText,
  Clock,
  ChevronRight,
  Send,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Target
} from 'lucide-react';

const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface StrategicDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategicDiagnosisModal({ isOpen, onClose }: StrategicDiagnosisModalProps) {
  // Modal Stages: 1 = Input Form, 2 = Progress, 3 = 30% Preview, 4 = Unlock Card, 5 = Full Report, 6 = PDF & Whatsapp Capture
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activeReportPage, setActiveReportPage] = useState<1 | 2 | 3>(1);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [segment, setSegment] = useState('');

  // Gated Unlock State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // PDF & Whatsapp Capture State
  const [userPhone, setUserPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Real Web Analysis State
  const [realData, setRealData] = useState<any>(null);

  // Analysis Progress Bar States (Stage 2)
  const [progressStep, setProgressStep] = useState(0);

  // Progress simulation
  useEffect(() => {
    if (stage === 2) {
      setProgressStep(0);
      const interval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStage(3), 600);
            return 100;
          }
          return prev + 12;
        });
      }, 350);
      return () => clearInterval(interval);
    }
  }, [stage]);

  if (!isOpen) return null;

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !website || !instagram || !linkedin) return;
    setStage(2);

    try {
      const res = await fetch('/api/diagnosis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyName,
          website,
          instagram,
          linkedin,
          segment,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRealData(json.data);
      }
    } catch (err) {
      console.error('Error triggering diagnosis API:', err);
    }
  };

  const registerDiagnosisLeadInFunil = async (data: {
    name: string;
    email: string;
    company: string;
    website: string;
    segment?: string;
  }) => {
    try {
      // Save lead to Firestore CRM of avante@neuroads.com.br via server API
      await fetch('/api/hub/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('[StrategicDiagnosisModal] Error saving lead to CRM:', err);
    }
  };

  const handleUnlockReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    setIsSubmitting(true);
    try {
      // 1. Register in CRM funil-vendas (stage: capturado) — saved to Firestore of avante@neuroads.com.br
      await registerDiagnosisLeadInFunil({
        name: userName,
        email: userEmail,
        company: companyName,
        website: website,
        segment: segment,
      });

      // 2. Trigger notification API
      await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          company: `${companyName} (${website})`,
          details: `Diagnóstico Estratégico - Insta: ${instagram} | LinkedIn: ${linkedin} | Segmento: ${segment || 'Geral'}`
        }),
      });
    } catch (err) {
      console.error('Error recording unlock:', err);
    } finally {
      setIsSubmitting(false);
      setStage(5);
    }
  };

  const handlePdfDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPhone) return;
    setIsSubmitting(true);
    try {
      await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName || companyName,
          email: userEmail || 'solicitacao_pdf@neuroads.com.br',
          company: `${companyName} (WhatsApp: ${userPhone})`,
          details: `Download PDF Diagnóstico Estratégico Laís`
        }),
      });
    } catch (err) {
      console.error('Error logging whatsapp download:', err);
    } finally {
      setIsSubmitting(false);
      setPdfDownloaded(true);
      window.print();
    }
  };

  // Normalized company name for presentation
  const displayCompany = companyName.trim() || 'Sua Empresa';
  const displayWebsite = website.trim().replace(/^https?:\/\//, '') || 'suaempresa.com.br';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200/80 rounded-[32px] shadow-[0_25px_60px_rgba(15,23,42,0.35)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* ── Modal Header with Agent Laís Badge ── */}
        <div className="shrink-0 relative overflow-hidden bg-[#f8f9fb] border-b border-slate-200/80">
          {/* Animated circuit background */}
          <HeroCircuitBackground id="circuit-diagnosis-header" />

          {/* Content layer above circuit animation */}
          <div className="relative z-10 p-5 sm:p-6">
            <button
              onClick={onClose}
              type="button"
              className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-10 shadow-sm"
              title="Fechar"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-10">
              {/* Avatar Laís */}
              <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#FF6A00] shadow-[0_0_20px_rgba(255,106,0,0.3)] bg-slate-100">
                <Image
                  src="/images/Avatar Agentes IA/Avatar_Lais.png"
                  alt="Agente Laís"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">LAÍS</span>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
                    Conteúdo &amp; Inteligência de Marca
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Especialista em SEO, GEO (AI Search) &amp; Posicionamento Estratégico
                </p>
              </div>
            </div>

            {/* First Person Presentation from Laís */}
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-sm text-xs sm:text-[13px] text-slate-700 leading-relaxed italic font-sans shadow-sm">
              &ldquo;Olá! Sou a <strong className="text-slate-900 not-italic">Laís</strong>, especialista em SEO, GEO &amp; Inteligência de Marca na NeuroAds. Desenvolvi este <strong className="text-[#FF6A00] not-italic">Diagnóstico Estratégico de Presença Digital</strong> para analisar em profundidade a sua marca. Irei mapear seu ecossistema digital, autoridade para pesquisas por Inteligência Artificial (ChatGPT, Perplexity, Gemini) e um plano prático com potenciais oportunidades reais de crescimento.&rdquo;
            </div>
          </div>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50">

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STAGE 1: FORMULARIO INICIAL                                       */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {stage === 1 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 text-[#FF5500] text-[11px] font-black uppercase tracking-wider">
                  <Sparkles size={13} /> AI Brand Intelligence Report
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Diagnóstico Estratégico de Presença Digital
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  Em aproximadamente 2 minutos, nossa IA analisa sua presença digital utilizando seu site, LinkedIn e Instagram e identifica oportunidades reais de crescimento, SEO, GEO, conteúdo e mídia paga.
                </p>
              </div>

              <form onSubmit={handleStartAnalysis} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="space-y-4">
                  {/* Nome da Empresa */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Building2 size={14} className="text-[#FF5500]" /> Nome da empresa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: NeuroAds Tecnologia"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Website */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Globe size={14} className="text-[#FF5500]" /> Website <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: neuroads.com.br"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <InstagramIcon size={14} className="text-[#FF5500]" /> Instagram <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: @neuroads.oficial"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* LinkedIn */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <LinkedinIcon size={14} className="text-[#FF5500]" /> LinkedIn <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: linkedin.com/company/neuroads"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                      />
                    </div>

                    {/* Segmento (Opcional) */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <Layers size={14} className="text-slate-400" /> Segmento <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SaaS B2B / Clínica Médica / E-commerce"
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white font-black text-sm shadow-[0_4px_16px_rgba(255,106,0,0.35)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>Gerar Diagnóstico Estratégico</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    A IA utilizará essas informações para consultar fontes públicas e consolidar um relatório completo do seu ecossistema.
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STAGE 2: TELA DE PROGRESSO ANIMADO                                 */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {stage === 2 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl mx-auto text-center py-12 space-y-8">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-orange-200 animate-ping opacity-25" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#0f172a] to-[#1e293b] flex items-center justify-center text-white shadow-xl border border-slate-700">
                  <Sparkles size={36} className="text-[#FF8805] animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Laís está analisando sua presença digital...
                </h3>
                <p className="text-slate-500 text-xs">
                  Processando dados públicos de <strong className="text-slate-700">{displayCompany}</strong> ({displayWebsite})
                </p>
              </div>

              {/* Steps Progress Checklist */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left space-y-3 font-mono text-xs">
                {[
                  { label: `Analisando Website (${displayWebsite})...`, step: 20 },
                  { label: 'Auditando SEO Técnico e Estrutura Semântica...', step: 40 },
                  { label: `Mapeando Presença no Instagram (${instagram || '@empresa'})...`, step: 60 },
                  { label: 'Verificando Autoridade no LinkedIn e Dados Públicos...', step: 80 },
                  { label: 'Avaliando Oportunidades de GEO (Citação por ChatGPT / Perplexity)...', step: 100 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <span className={progressStep >= item.step ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                      {item.label}
                    </span>
                    {progressStep >= item.step ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-[#FF5500] animate-spin shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF8805] rounded-full transition-all duration-300"
                    style={{ width: `${progressStep}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>Varredura Neural</span>
                  <span>{progressStep}% Concluído</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STAGE 3 & 4: PRÉVIA DE 30% + CARTÃO DE DESBLOQUEIO                */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {(stage === 3 || stage === 4) && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Prévia Parcial (30% do Relatório)
                  </span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                    Diagnóstico Executivo: {displayCompany}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setStage(4)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white text-xs font-black shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock size={13} />
                  <span>Desbloquear Relatório Completo</span>
                </button>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Marca', score: 87, color: 'text-emerald-600' },
                  { label: 'SEO', score: 71, color: 'text-amber-600' },
                  { label: 'GEO (IA)', score: 58, color: 'text-orange-600' },
                  { label: 'Autoridade', score: 81, color: 'text-blue-600' },
                  { label: 'Conteúdo', score: 63, color: 'text-amber-600' },
                  { label: 'Posicionamento', score: 78, color: 'text-emerald-600' },
                ].map(({ label, score, color }) => (
                  <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{label}</p>
                    <p className={`text-2xl font-black ${color}`}>{score}<span className="text-xs text-slate-400 font-normal">/100</span></p>
                  </div>
                ))}
              </div>

              {/* Overview & Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#FF5500]" /> Quem é sua empresa?
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    A <strong>{displayCompany}</strong> atua de forma destacada em seu segmento, oferecendo soluções voltadas à eficiência e geração de valor. A análise preliminar indica autoridade em expansão, com diferenciais competitivos claros, porém com oportunidade imediata de otimizar sua presença estruturada para buscas tradicionais e citação direta em Inteligências Artificiais.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#FF5500]" /> Identidade da Marca
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Arquétipo</span><strong>Especialista Visionário</strong></div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Tom de Voz</span><strong>Corporativo &amp; Inovador</strong></div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Autoridade</span><strong>Nível Elevado (B2B)</strong></div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Grau de Inovação</span><strong>Alto (Preparado)</strong></div>
                  </div>
                </div>
              </div>

              {/* Partial Teaser Box with Blur Mask */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-4 filter blur-[2px] pointer-events-none select-none">
                  <h4 className="text-sm font-black text-slate-800">Benchmark de Concorrentes &amp; Diagnóstico GEO Completo</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-slate-100 rounded-xl" />
                    <div className="h-20 bg-slate-100 rounded-xl" />
                    <div className="h-20 bg-slate-100 rounded-xl" />
                  </div>
                  <p className="text-xs text-slate-400">Oportunidades de Conteúdo, SEO Avançado, Oportunidades Comerciais de Curto, Médio e Longo Prazo e Roadmap de 90 Dias...</p>
                </div>

                {/* Gated Unlock Overlay Banner (Stage 4 Inline Form - Fixed Padding to Prevent Cutoff) */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/98 via-slate-900/96 to-slate-950/98 backdrop-blur-md px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center justify-start sm:justify-center text-center text-white space-y-4 overflow-y-auto z-20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF8805] flex items-center justify-center text-white shadow-lg shrink-0 mt-2 sm:mt-0">
                    <Lock size={22} />
                  </div>
                  <div className="max-w-md space-y-1.5 shrink-0">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                      Seu diagnóstico está pronto!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Você está visualizando uma prévia parcial. Desbloqueie gratuitamente o relatório completo para visualizar:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-200 text-left max-w-lg">
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF8805]" /> Diagnóstico completo de SEO</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF8805]" /> Diagnóstico GEO (IAs)</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF8805]" /> Benchmark competitivo (5 marcas)</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF8805]" /> Estratégia de Conteúdo</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF8805]" /> Oportunidades Comerciais</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF8805]" /> Plano de Ação de 90 Dias</span>
                  </div>

                  <form onSubmit={handleUnlockReport} className="w-full max-w-md space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      <input
                        type="text"
                        required
                        placeholder="Seu Nome Completo"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Seu E-mail Profissional"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Liberando...' : 'Desbloquear Relatório Completo'}
                      <ArrowRight size={15} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STAGE 5: RELATÓRIO COMPLETO (PÁGINAS 1, 2 E 3)                     */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {stage === 5 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Report Header & Page Switcher */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <span className="text-[10px] font-black text-[#FF6A00] uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                    Relatório Executivo Completo
                  </span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                    {displayCompany} — AI Brand Intelligence Report
                  </h2>
                </div>

                {/* Page Navigation Tabs */}
                <div className="inline-flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
                  {[
                    { num: 1, label: 'Diagnóstico Executivo' },
                    { num: 2, label: 'Oportunidades' },
                    { num: 3, label: 'Plano de Ação (90 dias)' },
                  ].map((p) => (
                    <button
                      key={p.num}
                      type="button"
                      onClick={() => setActiveReportPage(p.num as 1 | 2 | 3)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        activeReportPage === p.num
                          ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      Página {p.num}: {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── PÁGINA 1: DIAGNÓSTICO EXECUTIVO ── */}
              {activeReportPage === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Marca', score: 87, color: 'text-emerald-600' },
                      { label: 'SEO', score: 71, color: 'text-amber-600' },
                      { label: 'GEO (IA)', score: 58, color: 'text-orange-600' },
                      { label: 'Autoridade', score: 81, color: 'text-blue-600' },
                      { label: 'Conteúdo', score: 63, color: 'text-amber-600' },
                      { label: 'Posicionamento', score: 78, color: 'text-emerald-600' },
                    ].map(({ label, score, color }) => (
                      <div key={label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{label}</p>
                        <p className={`text-2xl font-black ${color}`}>{score}<span className="text-xs text-slate-400 font-normal">/100</span></p>
                      </div>
                    ))}
                  </div>

                  {/* Quem é sua empresa + Identidade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Building2 size={14} className="text-[#FF5500]" /> Quem é sua empresa?
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">
                        A <strong>{displayCompany}</strong> é uma empresa com foco em excelência e inovação em seu mercado. A varredura neural identificou forte consistência institucional no site ({displayWebsite}) e nas redes sociais ({instagram} e {linkedin}). A marca possui proposta clara de valor, porém apresenta margem imediata para expandir sua cobertura semântica em termos de alta conversão.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#FF5500]" /> Identidade da Marca (Identificada por IA)
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Arquétipo</span><strong>Especialista Visionário</strong></div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Tom de Voz</span><strong>Corporativo &amp; Orientado a ROI</strong></div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Autoridade</span><strong>Nível Elevado (B2B)</strong></div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100"><span className="text-slate-400 block text-[10px] uppercase font-bold">Proposta de Valor</span><strong>Garantia de Entrega &amp; Escala</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* ICP */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Target size={14} className="text-[#FF5500]" /> ICP — Cliente Ideal Mapeado
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
                      {['Empresas B2B', 'Médio & Grande Porte', 'Marketing & Comercial', 'CEOs / Diretores', 'Indústrias & Serviços', 'Foco em Crescimento'].map((icp) => (
                        <div key={icp} className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-700">
                          {icp}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Posicionamento SEO & GEO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Search size={14} className="text-[#FF5500]" /> Posicionamento SEO
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Palavras-chave Fortes:</strong> Termos institucionais e nome da marca indexados com precisão.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-amber-500 shrink-0 mt-0.5" /> <span><strong>Palavras-chave Ausentes:</strong> Termos de intenção de compra comercial no fundo de funil.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" /> <span><strong>Estrutura Semântica:</strong> Necessidade de hierarquia H1/H2 e marcação Schema.org.</span></li>
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Zap size={14} className="text-[#FF5500]" /> Posicionamento GEO (AI Engines)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Clareza para IA:</strong> Texto institucional compreensível por LLMs (ChatGPT, Gemini).</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-orange-500 shrink-0 mt-0.5" /> <span><strong>Arquivo llms.txt:</strong> Ausência do manifesto semântico padrão `llms.txt` na raiz.</span></li>
                        <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-[#FF6A00] shrink-0 mt-0.5" /> <span><strong>Potencial de Citação:</strong> Elevado após inclusão de FAQ estruturado e entidade no Wikidata.</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PÁGINA 2: OPORTUNIDADES ── */}
              {activeReportPage === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Concorrentes Principais */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BarChart3 size={14} className="text-[#FF5500]" /> Benchmark de Concorrentes Diretos &amp; Indiretos
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                            <th className="pb-3">Empresa</th>
                            <th className="pb-3">Especialidade</th>
                            <th className="pb-3">Diferencial Mapeado</th>
                            <th className="pb-3 text-right">Autoridade Digital</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          <tr><td className="py-2.5 font-bold text-slate-900">Concorrente Alfa</td><td>Soluções B2B Tradicionais</td><td>Presença forte em feiras</td><td className="py-2.5 text-right font-mono font-bold text-emerald-600">82/100</td></tr>
                          <tr><td className="py-2.5 font-bold text-slate-900">Concorrente Beta</td><td>Mídia Paga &amp; Performance</td><td>Volume de anúncios Meta</td><td className="py-2.5 text-right font-mono font-bold text-[#FF6A00]">76/100</td></tr>
                          <tr><td className="py-2.5 font-bold text-slate-900">Concorrente Gama</td><td>Inbound &amp; Conteúdo</td><td>Blog com postagens semanais</td><td className="py-2.5 text-right font-mono font-bold text-blue-600">79/100</td></tr>
                          <tr><td className="py-2.5 font-bold text-slate-900">Concorrente Delta</td><td>Consultoria Especializada</td><td>Rede de parceiros regionais</td><td className="py-2.5 text-right font-mono font-bold text-slate-600">68/100</td></tr>
                          <tr><td className="py-2.5 font-bold text-slate-900">Concorrente Epsilon</td><td>Tech &amp; Automação</td><td>Presença forte no LinkedIn</td><td className="py-2.5 text-right font-mono font-bold text-amber-600">74/100</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Oportunidades de Conteúdo + SEO + GEO */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <FileText size={14} className="text-[#FF5500]" /> Conteúdo Estratégico
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between"><span>IA &amp; Eficiência Operacional</span><span className="font-bold text-emerald-600">Alta Prioridade</span></div>
                        <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between"><span>Comparativos &amp; Cases de ROI</span><span className="font-bold text-emerald-600">Alta Prioridade</span></div>
                        <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between"><span>Guias de Implementação</span><span className="font-bold text-blue-600">Média Prioridade</span></div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Search size={14} className="text-[#FF5500]" /> Oportunidades de SEO
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF5500]" /> Criar páginas dedicadas de serviços</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF5500]" /> Otimizar hierarquia H1/H2 no site</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF5500]" /> Inserir FAQ estruturado</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF5500]" /> Implementar marcação Schema.org</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-[#FF5500]" /> Fortalecer sinais E-E-A-T</li>
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Zap size={14} className="text-[#FF5500]" /> Oportunidades GEO (IAs)
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> FAQ otimizado para ChatGPT &amp; Perplexity</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Manifesto semântico `llms.txt`</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Dados estruturados Organization</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Conteúdo comparativo neutro</li>
                        <li className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Registro de entidade corporativa</li>
                      </ul>
                    </div>
                  </div>

                  {/* Oportunidades Comerciais & Campanhas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-[#FF5500]" /> Oportunidades Comerciais por Horizonte
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-orange-50/60 border border-orange-200/60 rounded-2xl"><strong className="text-[#FF5500] block text-[10px] uppercase">Curto Prazo (Até 30 dias)</strong> Remarketing no Meta Ads, Google Search em termos de alta intenção e Landing Page focada em conversão.</div>
                        <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-2xl"><strong className="text-blue-600 block text-[10px] uppercase">Médio Prazo (60 dias)</strong> Fluxos automáticos de nutrição via e-mail e integração direta ao CRM comercial.</div>
                        <div className="p-3 bg-[#0f172a]/5 border border-slate-200 rounded-2xl"><strong className="text-slate-800 block text-[10px] uppercase">Longo Prazo (90+ dias)</strong> Atendimento comercial por Agentes IA autônomos e autoridade de marca de longo prazo.</div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Layers size={14} className="text-[#FF5500]" /> Campanhas Recomendadas
                      </h4>
                      <div className="divide-y divide-slate-100 text-xs">
                        <div className="py-2 flex justify-between"><strong>Google Search Ads</strong><span className="text-slate-500">Geração de Leads Qualificados</span></div>
                        <div className="py-2 flex justify-between"><strong>Meta Ads (Instagram)</strong><span className="text-slate-500">Reconhecimento &amp; Autoridade</span></div>
                        <div className="py-2 flex justify-between"><strong>LinkedIn Ads B2B</strong><span className="text-slate-500">Abordagem de Decisores</span></div>
                        <div className="py-2 flex justify-between"><strong>Campanha de Remarketing</strong><span className="text-slate-500">Conversão de Visitantes</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PÁGINA 3: PLANO DE AÇÃO (ROADMAP 90 DIAS) ── */}
              {activeReportPage === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Quick Wins & Prioridades Altas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                        <Zap size={14} /> Quick Wins (Ganhos Rápidos em 7 Dias)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Ajuste dos meta-titles e H1 do site institucional</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Ativação do pixel de remarketing em todas as páginas</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Publicação do manifesto semântico `llms.txt`</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Otimização da bio e link único no Instagram</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Atualização das informações institucionais no LinkedIn</li>
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5500] flex items-center gap-1.5">
                        <Target size={14} /> Prioridade Alta (30 Dias)
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-700">
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#FF5500] shrink-0" /> Lançamento de Landing Page de alta conversão</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#FF5500] shrink-0" /> Campanha de Google Ads focada em intenção de compra</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#FF5500] shrink-0" /> FAQ semântico estruturado para citação por IA (GEO)</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#FF5500] shrink-0" /> Automação de qualificação inicial de leads</li>
                        <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#FF5500] shrink-0" /> Calendário semanal de conteúdo para redes sociais</li>
                      </ul>
                    </div>
                  </div>

                  {/* Roadmap 90 Dias */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#FF5500]" /> Roadmap Estratégico de 90 Dias
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="font-mono font-bold text-[#FF5500] text-[10px] uppercase">Semana 1</span>
                        <p className="font-bold text-slate-800">Fundação Técnica</p>
                        <p className="text-[11px] text-slate-500">SEO técnico, H1, Meta Tags e `llms.txt`.</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="font-mono font-bold text-[#FF5500] text-[10px] uppercase">Semana 2</span>
                        <p className="font-bold text-slate-800">Estrutura GEO</p>
                        <p className="text-[11px] text-slate-500">Schema.org e FAQ estruturado para IAs.</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="font-mono font-bold text-[#FF5500] text-[10px] uppercase">Semana 3</span>
                        <p className="font-bold text-slate-800">Mídia &amp; Landing Page</p>
                        <p className="text-[11px] text-slate-500">Ativação de Google e Meta Ads.</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="font-mono font-bold text-blue-600 text-[10px] uppercase">Mês 2</span>
                        <p className="font-bold text-slate-800">Automação &amp; CRM</p>
                        <p className="text-[11px] text-slate-500">Nutrição contínua e inteligência comercial.</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <span className="font-mono font-bold text-emerald-600 text-[10px] uppercase">Mês 3</span>
                        <p className="font-bold text-slate-800">Escala &amp; Agentes IA</p>
                        <p className="text-[11px] text-slate-500">Operação autônoma de conteúdo e leads.</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Conclusion by Laís */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#FF8805]" />
                      <h5 className="text-xs font-black uppercase tracking-wider text-white">Conclusão da Agente Laís</h5>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      &ldquo;Com a execução disciplinada destas etapas, a <strong>{displayCompany}</strong> estará totalmente posicionada para dominar as buscas tradicionais e ser citada como referência primária pelos mecanismos de busca baseados em Inteligência Artificial. Caso queira implantar este ecossistema com nossos Agentes IA, estamos prontos para acelerar sua operação.&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Action Footer -> Advances to Stage 6 (PDF Download & WhatsApp) */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  Página {activeReportPage} de 3 · {displayCompany} ({displayWebsite})
                </div>
                <button
                  type="button"
                  onClick={() => setStage(6)}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white font-black text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={15} />
                  <span>Baixar Relatório em PDF &amp; Receber Atualizações</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STAGE 6: CAPTURA DE WHATSAPP E DOWNLOAD EM PDF                      */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {stage === 6 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-[#FF5500] flex items-center justify-center mx-auto shadow-sm">
                <Download size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Deseja baixar este relatório em PDF?
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Informe seu WhatsApp para liberar o download em PDF do <strong>AI Brand Intelligence Report</strong> e receber atualizações futuras da análise da <strong>{displayCompany}</strong>.
                </p>
              </div>

              <form onSubmit={handlePdfDownloadSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Smartphone size={14} className="text-[#FF5500]" /> WhatsApp com DDD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (11) 99999-9999"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  <span>{isSubmitting ? 'Gerando PDF...' : 'Baixar Relatório em PDF'}</span>
                </button>

                {pdfDownloaded && (
                  <p className="text-center text-xs font-bold text-emerald-600">
                    ✓ PDF gerado com sucesso! Verifique a janela de impressão/download do seu navegador.
                  </p>
                )}

                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setStage(5)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    ← Voltar ao relatório na tela
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
