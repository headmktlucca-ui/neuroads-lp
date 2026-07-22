'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, Trash2, ArrowRight, CheckCircle2,
  Bot, ShieldAlert, Send, Play, Cpu, Trash, X, ChevronRight
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';
import { subscribeToCRMLeads } from '../../../lib/crm-sync';
import { IconFunnel3D } from '../../../components/hub/HubUiIcons3D';
import {
  IconNeuKpiAgentes,
  IconNeuKpiClock,
  IconNeuKpiImpacto,
  IconNeuKpiTicket,
} from '../../../components/hub/NeumorphicMenuIcons';

/* ─── 3D KPI icons (plastic/clay style) ──────────────────────────────────── */

function KpiIconLeads() {
  return (
    <svg viewBox="0 0 40 40" width="76" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kpi-leads-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A55" /><stop offset="1" stopColor="#E63E00" />
        </linearGradient>
        <filter id="kpi-leads-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#C93700" floodOpacity="0.4" /></filter>
      </defs>
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#C93700" opacity="0.18" />
      <circle cx="14" cy="14" r="6" fill="url(#kpi-leads-g)" filter="url(#kpi-leads-s)" />
      <path d="M4 32 C4 25 9 22 14 22 C19 22 24 25 24 32 Z" fill="url(#kpi-leads-g)" filter="url(#kpi-leads-s)" />
      <circle cx="27" cy="15" r="4.5" fill="#FFB27A" filter="url(#kpi-leads-s)" />
      <path d="M20.5 31 C21 25.5 24 23.5 27 23.5 C30.5 23.5 35 26 35 31 Z" fill="#FFB27A" filter="url(#kpi-leads-s)" />
      <ellipse cx="12" cy="11.5" rx="3" ry="1.8" fill="white" opacity="0.35" />
      <ellipse cx="25.5" cy="13" rx="2" ry="1.2" fill="white" opacity="0.35" />
    </svg>
  );
}

function KpiIconClock() {
  return (
    <svg viewBox="0 0 40 40" width="76" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kpi-clock-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5AAEFF" /><stop offset="1" stopColor="#1240B8" />
        </linearGradient>
        <filter id="kpi-clock-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#0C2E9E" floodOpacity="0.4" /></filter>
      </defs>
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#0C2E9E" opacity="0.18" />
      <circle cx="20" cy="19" r="14" fill="url(#kpi-clock-g)" filter="url(#kpi-clock-s)" />
      <circle cx="20" cy="19" r="10.5" fill="white" opacity="0.16" />
      <circle cx="20" cy="19" r="9.5" fill="url(#kpi-clock-g)" />
      <line x1="20" y1="19" x2="20" y2="12.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20" y1="19" x2="25" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="20" cy="19" r="1.6" fill="white" />
      <ellipse cx="15" cy="11" rx="4.5" ry="2.5" fill="white" opacity="0.3" />
    </svg>
  );
}

function KpiIconMoney() {
  return (
    <svg viewBox="0 0 40 40" width="76" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kpi-money-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3EE59A" /><stop offset="1" stopColor="#036C4A" />
        </linearGradient>
        <filter id="kpi-money-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#02523A" floodOpacity="0.4" /></filter>
      </defs>
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#02523A" opacity="0.18" />
      <circle cx="20" cy="19" r="14" fill="url(#kpi-money-g)" filter="url(#kpi-money-s)" />
      <circle cx="20" cy="19" r="10.5" fill="white" opacity="0.14" />
      <circle cx="20" cy="19" r="9.5" fill="url(#kpi-money-g)" />
      <path d="M20 11.5 L20 26.5 M23.5 14.5 C23.5 12.8 21.8 12 20 12 C18 12 16.5 13 16.5 15 C16.5 17 18.2 17.8 20 18.4 C21.8 19 23.5 19.8 23.5 21.8 C23.5 23.8 22 25 20 25 C18.2 25 16.5 24 16.5 22.3"
        stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="15" cy="11" rx="4.5" ry="2.5" fill="white" opacity="0.3" />
    </svg>
  );
}

function KpiIconTicket() {
  return (
    <svg viewBox="0 0 40 40" width="76" height="76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="kpi-ticket-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B487F5" /><stop offset="1" stopColor="#54189E" />
        </linearGradient>
        <filter id="kpi-ticket-s"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#3E0E7A" floodOpacity="0.4" /></filter>
      </defs>
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#3E0E7A" opacity="0.18" />
      <path d="M6 14 C6 12.3 7.3 11 9 11 L31 11 C32.7 11 34 12.3 34 14 L34 17 C32.3 17 31 18.3 31 20 C31 21.7 32.3 23 34 23 L34 26 C34 27.7 32.7 29 31 29 L9 29 C7.3 29 6 27.7 6 26 L6 23 C7.7 23 9 21.7 9 20 C9 18.3 7.7 17 6 17 Z"
        fill="url(#kpi-ticket-g)" filter="url(#kpi-ticket-s)" />
      <line x1="16" y1="12" x2="16" y2="28" stroke="white" strokeWidth="1.4" strokeDasharray="2.4 2.6" strokeOpacity="0.65" />
      <path d="M23.5 15.5 L24.7 18.3 L27.7 18.6 L25.4 20.6 L26.1 23.5 L23.5 21.9 L20.9 23.5 L21.6 20.6 L19.3 18.6 L22.3 18.3 Z" fill="white" fillOpacity="0.85" />
      <ellipse cx="13" cy="13.5" rx="5" ry="2" fill="white" opacity="0.28" />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeadLog {
  timestamp: number;
  agentName: string;
  agentCor: string;
  message: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  email: string;
  phone: string;
  stage: 'capturado' | 'qualificado' | 'proposta' | 'fechamento' | 'ganho';
  originAgent: string;
  originAgentCor: string;
  statusText: string;
  history: LeadLog[];
  createdAt: number;
}

const STAGES = [
  { id: 'capturado' as const, title: 'Capturado', color: '#60A5FA', desc: 'Identificado por Vitor/Igor' },
  { id: 'qualificado' as const, title: 'Qualificado', color: '#34D399', desc: 'Fit de ICP validado' },
  { id: 'proposta' as const, title: 'Proposta Enviada', color: '#FBBF24', desc: 'Negociação de valores' },
  { id: 'fechamento' as const, title: 'Em Fechamento', color: '#FB923C', desc: 'Contrato e pagamento' },
  { id: 'ganho' as const, title: 'Ganho / Fechado', color: '#10B981', desc: 'Onboarding iniciado' },
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Carlos Souza',
    company: 'Logística Express',
    value: 12000,
    email: 'carlos@logisticaexpress.com',
    phone: '(11) 98765-4321',
    stage: 'capturado',
    originAgent: 'VITOR (SDR)',
    originAgentCor: '#34D399',
    statusText: 'Identificado via prospecção outbound no LinkedIn.',
    history: [
      {
        timestamp: Date.now() - 3600000 * 2,
        agentName: 'VITOR (SDR)',
        agentCor: '#34D399',
        message: 'Lead capturado: Perfil respondeu positivamente ao cold message sobre otimização logística.',
      }
    ],
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'lead-2',
    name: 'Mariana Silva',
    company: 'E-commerce Estrela',
    value: 8500,
    email: 'mariana@lojaestrela.com.br',
    phone: '(21) 99888-7777',
    stage: 'qualificado',
    originAgent: 'IGOR (SEO & GEO)',
    originAgentCor: '#A78BFA',
    statusText: 'Qualificado. Visitou página de preços 3x nas últimas 24h.',
    history: [
      {
        timestamp: Date.now() - 3600000 * 5,
        agentName: 'IGOR (Dados & SEO)',
        agentCor: '#A78BFA',
        message: 'Lead identificado: Tráfego orgânico via busca "neuroads ferramenta de tráfego".',
      },
      {
        timestamp: Date.now() - 3600000 * 4,
        agentName: 'VITOR (SDR)',
        agentCor: '#34D399',
        message: 'Qualificação: ICP validado. E-commerce fatura > R$ 50k/mês. Dor: ROAS instável no Meta Ads.',
      }
    ],
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'lead-3',
    name: 'Luiz Henrique',
    company: 'Marmoraria Premium',
    value: 15000,
    email: 'contato@marmorariapremium.com',
    phone: '(31) 97777-6666',
    stage: 'proposta',
    originAgent: 'PAOLA (Tráfego)',
    originAgentCor: '#FACC15',
    statusText: 'Aguardando retorno da proposta comercial.',
    history: [
      {
        timestamp: Date.now() - 3600000 * 24,
        agentName: 'PAOLA (Tráfego)',
        agentCor: '#FACC15',
        message: 'Conversão em anúncios: Capturado via Formulário de Leads (Meta Ads).',
      },
      {
        timestamp: Date.now() - 3600000 * 22,
        agentName: 'VITOR (SDR)',
        agentCor: '#34D399',
        message: 'Qualificação: Reunião agendada e realizada com sucesso.',
      },
      {
        timestamp: Date.now() - 3600000 * 20,
        agentName: 'BRENO (Closer)',
        agentCor: '#34D399',
        message: 'Proposta comercial enviada: Plano Growth (R$ 15.000 recorrente anual).',
      }
    ],
    createdAt: Date.now() - 3600000 * 24,
  }
];

export default function FunilVendasPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActionLeadId, setActiveActionLeadId] = useState<string | null>(null);
  const [actionText, setActionText] = useState('');
  
  // Form state for creating new lead
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadValue, setNewLeadValue] = useState(5000);
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadOrigin, setNewLeadOrigin] = useState('VITOR (SDR)');

  // Details/Edit modal state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editValue, setEditValue] = useState(0);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatusText, setEditStatusText] = useState('');
  const [editStage, setEditStage] = useState<'capturado' | 'qualificado' | 'proposta' | 'fechamento' | 'ganho'>('capturado');

  const handleOpenLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditName(lead.name);
    setEditCompany(lead.company);
    setEditValue(lead.value);
    setEditEmail(lead.email || 'contato@empresa.com');
    setEditPhone(lead.phone || '(11) 99999-9999');
    setEditStatusText(lead.statusText || '');
    setEditStage(lead.stage);
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    if (!selectedLead) return;

    const updated = leads.map(l => {
      if (l.id === selectedLead.id) {
        const hasStageChanged = l.stage !== editStage;
        const newHistory = [...l.history];
        if (hasStageChanged) {
          const nextStageTitle = STAGES.find(s => s.id === editStage)?.title || editStage;
          newHistory.push({
            timestamp: Date.now(),
            agentName: 'SISTEMA',
            agentCor: '#64748B',
            message: `Etapa alterada de ${STAGES.find(s => s.id === l.stage)?.title} para ${nextStageTitle} via edição manual.`,
          });
        }

        const infoChanged = l.name !== editName || l.company !== editCompany || l.value !== editValue || l.email !== editEmail || l.phone !== editPhone || l.statusText !== editStatusText;
        if (infoChanged && !hasStageChanged) {
          newHistory.push({
            timestamp: Date.now(),
            agentName: 'SISTEMA',
            agentCor: '#64748B',
            message: `Informações do negócio atualizadas via edição manual.`,
          });
        }

        const updatedLead: Lead = {
          ...l,
          name: editName,
          company: editCompany,
          value: Number(editValue),
          email: editEmail,
          phone: editPhone,
          stage: editStage,
          statusText: editStatusText,
          history: newHistory,
        };

        setSelectedLead(updatedLead);
        return updatedLead;
      }
      return l;
    });

    saveLeads(updated);
    setIsEditMode(false);
  };

  const [originFilter, setOriginFilter] = useState<'all' | 'google' | 'meta' | 'linkedin' | 'outbound' | 'seo'>('all');
  const [runningPlaybookStage, setRunningPlaybookStage] = useState<string | null>(null);

  const handleRunPlaybook = (stageId: string) => {
    setRunningPlaybookStage(stageId);
    const duration = 3000;
    
    setTimeout(() => {
      // Find leads in this stage and advance them!
      const updated = leads.map(l => {
        if (l.stage === stageId) {
          const currentIdx = STAGES.findIndex(s => s.id === stageId);
          if (currentIdx < STAGES.length - 1) {
            const nextStage = STAGES[currentIdx + 1].id;
            const nextStageTitle = STAGES[currentIdx + 1].title;
            return {
              ...l,
              stage: nextStage,
              statusText: `Lead avançado via Playbook Inteligente de ${stageId === 'capturado' ? 'VITOR (SDR)' : stageId === 'qualificado' ? 'BRENO (Closer)' : stageId === 'proposta' ? 'BRENO (Closer)' : 'HEITOR (Processos)'}.`,
              history: [
                ...l.history,
                {
                  timestamp: Date.now(),
                  agentName: 'ORQUESTRADOR',
                  agentCor: '#FF6A00',
                  message: `Playbook automatizado executado. Lead qualificado e avançado para ${nextStageTitle}.`,
                }
              ]
            };
          }
        }
        return l;
      });
      
      saveLeads(updated);
      setRunningPlaybookStage(null);
      alert(`Playbook executado com sucesso! Os leads da coluna foram processados e avançados.`);
    }, duration);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      if (originFilter === 'all') return true;
      const originUpper = l.originAgent.toUpperCase();
      if (originFilter === 'google') return originUpper.includes('GOOGLE') || originUpper.includes('PAOLA');
      if (originFilter === 'meta') return originUpper.includes('META');
      if (originFilter === 'linkedin') return originUpper.includes('LINKEDIN');
      if (originFilter === 'outbound') return originUpper.includes('VITOR') || originUpper.includes('OUTBOUND');
      if (originFilter === 'seo') return originUpper.includes('IGOR') || originUpper.includes('SEO') || originUpper.includes('GEO');
      return true;
    });
  }, [leads, originFilter]);

  // Load leads & subscribe to real-time CRM updates
  useEffect(() => {
    async function loadLeads() {
      if (user) {
        try {
          const db = getFirebaseDb();
          const docRef = doc(db, 'users', user.uid, 'leads_funil', 'main');
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().leads) {
            setLeads(snap.data().leads);
          } else {
            setLeads(INITIAL_LEADS);
          }
        } catch {
          // fallback to localStorage
          const local = localStorage.getItem(`leads_funil_${user.uid}`);
          if (local) {
            setLeads(JSON.parse(local));
          } else {
            setLeads(INITIAL_LEADS);
          }
        }
      } else {
        const local = localStorage.getItem('leads_funil_guest');
        if (local) {
          setLeads(JSON.parse(local));
        } else {
          setLeads(INITIAL_LEADS);
        }
      }
      setLoading(false);
    }
    loadLeads();

    const unsubscribe = subscribeToCRMLeads(user?.uid, (remoteLeads) => {
      if (Array.isArray(remoteLeads) && remoteLeads.length > 0) {
        setLeads(remoteLeads);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Persist leads
  const saveLeads = async (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    if (user) {
      localStorage.setItem(`leads_funil_${user.uid}`, JSON.stringify(updatedLeads));
      try {
        const db = getFirebaseDb();
        const docRef = doc(db, 'users', user.uid, 'leads_funil', 'main');
        await setDoc(docRef, { leads: updatedLeads }, { merge: true });
      } catch { /* noop */ }
    } else {
      localStorage.setItem('leads_funil_guest', JSON.stringify(updatedLeads));
    }
  };

  // Add lead manually
  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    let originCor = '#34D399';
    if (newLeadOrigin.includes('IGOR')) originCor = '#A78BFA';
    if (newLeadOrigin.includes('PAOLA')) originCor = '#FACC15';

    // eslint-disable-next-line react-hooks/purity
    const newLead: Lead = {
      // eslint-disable-next-line react-hooks/purity
      id: `lead-${Date.now()}`,
      name: newLeadName,
      company: newLeadCompany,
      value: Number(newLeadValue),
      email: newLeadEmail || 'contato@empresa.com',
      phone: newLeadPhone || '(11) 99999-9999',
      stage: 'capturado',
      originAgent: newLeadOrigin,
      originAgentCor: originCor,
      statusText: 'Capturado e aguardando qualificação.',
      // eslint-disable-next-line react-hooks/purity
      createdAt: Date.now(),
      history: [
        {
          // eslint-disable-next-line react-hooks/purity
          timestamp: Date.now(),
          agentName: newLeadOrigin,
          agentCor: originCor,
          message: `Lead registrado manualmente na plataforma. Origem definida como ${newLeadOrigin}.`,
        }
      ]
    };

    saveLeads([newLead, ...leads]);
    
    // reset form
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadValue(5000);
    setNewLeadEmail('');
    setNewLeadPhone('');
    setShowAddForm(false);
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    const filtered = leads.filter(l => l.id !== leadId);
    saveLeads(filtered);
  };

  // Move lead stage
  const moveLead = (leadId: string, direction: 'next' | 'prev') => {
    const updated = leads.map(lead => {
      if (lead.id === leadId) {
        const currentIdx = STAGES.findIndex(s => s.id === lead.stage);
        let nextIdx = currentIdx;
        if (direction === 'next' && currentIdx < STAGES.length - 1) nextIdx++;
        if (direction === 'prev' && currentIdx > 0) nextIdx--;
        
        const nextStage = STAGES[nextIdx].id;
        const stageName = STAGES[nextIdx].title;
        
        return {
          ...lead,
          stage: nextStage,
          statusText: `Lead movido manualmente para a etapa ${stageName}.`,
          history: [
            ...lead.history,
            {
              timestamp: Date.now(),
              agentName: 'SISTEMA',
              agentCor: '#64748B',
              message: `Lead movido manualmente para a etapa: ${stageName}.`,
            }
          ]
        };
      }
      return lead;
    });
    saveLeads(updated);
  };

  // Execute Agent Operation on Lead
  const handleExecuteAgentOperation = (leadId: string, operationType: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    setActiveActionLeadId(leadId);
    
    let simulatedText = '';
    let nextStage = lead.stage;
    let agentName = '';
    let agentCor = '';
    
    if (operationType === 'qualificar') {
      simulatedText = 'Vitor (SDR) está rodando o algoritmo de qualificação de ICP...';
      agentName = 'VITOR (SDR)';
      agentCor = '#34D399';
    } else if (operationType === 'proposta') {
      simulatedText = 'Breno (Closer) está elaborando e disparando a proposta comercial...';
      agentName = 'BRENO (Closer)';
      agentCor = '#34D399';
    } else if (operationType === 'fechar') {
      simulatedText = 'Breno (Closer) está coletando a assinatura e validando o gateway de pagamento...';
      agentName = 'BRENO (Closer)';
      agentCor = '#34D399';
    } else if (operationType === 'onboarding') {
      simulatedText = 'Heitor (Processos) está automatizando as configurações de rastreamento server-side...';
      agentName = 'HEITOR (Processos)';
      agentCor = '#60A5FA';
    } else if (operationType === 'nutrir') {
      simulatedText = 'Tainá (Nutrição) está ativando fluxo de réguas personalizadas para engajamento...';
      agentName = 'TAINÁ (Nutrição)';
      agentCor = '#F472B6';
    }

    setActionText(simulatedText);

    setTimeout(() => {
      const updated = leads.map(l => {
        if (l.id === leadId) {
          let logMessage = '';
          let newStatusText = '';

          if (operationType === 'qualificar') {
            nextStage = 'qualificado';
            logMessage = `Qualificação concluída: ICP Qualificado (Score: 94/100). Dor principal detectada: Falta de automação de vendas e perdas no acompanhamento.`;
            newStatusText = 'Qualificado com sucesso. Reunião de fechamento agendada pelo Vitor.';
          } else if (operationType === 'proposta') {
            nextStage = 'proposta';
            logMessage = `Proposta Comercial de R$ ${l.value.toLocaleString('pt-BR')} enviada via WhatsApp e e-mail.`;
            newStatusText = 'Aguardando validação dos termos contratuais pelo cliente.';
          } else if (operationType === 'fechar') {
            nextStage = 'fechamento';
            logMessage = `Contrato enviado para assinatura digital. Alerta de pix pendente enviado.`;
            newStatusText = 'Contrato assinado eletronicamente pelo decisor. Aguardando ativação.';
          } else if (operationType === 'onboarding') {
            nextStage = 'ganho';
            logMessage = `Onboarding ativo: Rastreamento Server-side configurado via Google Tag Manager Server. Integrações ativadas no painel.`;
            newStatusText = 'Onboarding finalizado. Cliente ativo e faturando.';
          } else if (operationType === 'nutrir') {
            logMessage = `Régua de e-mail disparada: Artigo sobre 'ROI em IA' enviado. Taxa de clique registrada de 48%.`;
            newStatusText = 'Engajamento reaquecido. Tainá enviou sequências educativas.';
          }

          return {
            ...l,
            stage: nextStage,
            statusText: newStatusText,
            history: [
              ...l.history,
              {
                timestamp: Date.now(),
                agentName,
                agentCor,
                message: logMessage,
              }
            ]
          };
        }
        return l;
      });

      saveLeads(updated);
      setActiveActionLeadId(null);
      setActionText('');
    }, 2500); // 2.5s simulation delay
  };

  // Funnel stats
  const stats = useMemo(() => {
    const activeLeads = filteredLeads.filter(l => l.stage !== 'ganho');
    const wonLeads = filteredLeads.filter(l => l.stage === 'ganho');
    
    const valueInNegotiation = activeLeads.reduce((acc, curr) => acc + curr.value, 0);
    const totalWonValue = wonLeads.reduce((acc, curr) => acc + curr.value, 0);
    const averageTicket = filteredLeads.length > 0 ? (filteredLeads.reduce((acc, curr) => acc + curr.value, 0) / filteredLeads.length) : 0;

    return {
      valueInNegotiation,
      totalWonValue,
      averageTicket,
      totalLeads: filteredLeads.length,
    };
  }, [filteredLeads]);

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="py-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <IconFunnel3D size={32} />
            CRM
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed max-w-2xl">
            Acompanhe a jornada dos leads capturados pelas operações dos Agentes IA. Execute ações dos agentes em tempo real para conduzi-los até o fechamento.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_8px_rgba(255,106,0,0.25)] cursor-pointer self-start md:self-auto"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
        >
          <Plus size={14} /> Novo Lead
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Leads no Funil', value: stats.totalLeads, icon: <IconNeuKpiAgentes size={44} /> },
          { label: 'Em Negociação', value: `R$ ${stats.valueInNegotiation.toLocaleString('pt-BR')}`, icon: <IconNeuKpiClock size={44} /> },
          { label: 'Faturamento Fechado', value: `R$ ${stats.totalWonValue.toLocaleString('pt-BR')}`, icon: <IconNeuKpiImpacto size={44} /> },
          { label: 'Ticket Médio', value: `R$ ${Math.round(stats.averageTicket).toLocaleString('pt-BR')}`, icon: <IconNeuKpiTicket size={44} /> },
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

      {/* ── Add Lead Form ── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#eef2f7] border border-white/80 rounded-2xl p-5 shadow-sm"
          >
            <h3 className="text-[14px] font-extrabold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-[#FF6A00]" /> Registrar Novo Lead Manualmente
            </h3>
            <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Nome do Lead</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Souza"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#FF6A00] transition"
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Logística Express"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#FF6A00] transition"
                  value={newLeadCompany}
                  onChange={e => setNewLeadCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Valor Estimado (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 8500"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#FF6A00] transition"
                  value={newLeadValue}
                  onChange={e => setNewLeadValue(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Agente Capturador</label>
                <select
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-600 outline-none focus:border-[#FF6A00] transition"
                  value={newLeadOrigin}
                  onChange={e => setNewLeadOrigin(e.target.value)}
                >
                  <option value="VITOR (SDR)">Vitor (SDR)</option>
                  <option value="IGOR (SEO & GEO)">Igor (SEO & GEO)</option>
                  <option value="PAOLA (Tráfego)">Paola (Tráfego)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl text-[12px] font-black text-white hover:brightness-110 transition cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="h-10 px-3.5 rounded-xl border border-slate-300 text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Simulation Overlay Loader ── */}
      <AnimatePresence>
        {activeActionLeadId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#FF8805] flex items-center justify-center mx-auto shadow-md animate-pulse">
                <Cpu className="w-8 h-8 text-white animate-spin duration-1000" />
              </div>
              <div>
                <h4 className="text-[16px] font-black text-slate-800 uppercase tracking-wider">Agente em Ação</h4>
                <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">
                  {actionText}
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.3, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-[#FF4D00] to-[#FF8805]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Playbook Execution Overlay Loader ── */}
      <AnimatePresence>
        {runningPlaybookStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#FF8805] flex items-center justify-center mx-auto shadow-md animate-pulse">
                <Bot className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="text-[16px] font-black text-slate-800 uppercase tracking-wider">Playbook em Execução</h4>
                <p className="text-[13px] text-slate-500 mt-2 font-medium leading-relaxed">
                  Orquestrador está coordenando os Agentes de Vendas para qualificar, atualizar dados e notificar os leads na coluna {STAGES.find(s => s.id === runningPlaybookStage)?.title}...
                </p>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.8, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-[#FF4D00] to-[#FF8805]"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Toolbar ── */}
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-1.5 rounded-2xl border border-slate-800/80 shadow-[0_4px_14px_rgba(15,23,42,0.18)] flex-wrap w-full sm:w-auto">
        <span className="text-[10px] font-black uppercase text-slate-400 px-3.5 py-1.5 tracking-wider">Filtrar Origem:</span>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'google', label: 'Google Ads' },
          { id: 'meta', label: 'Meta Ads' },
          { id: 'linkedin', label: 'LinkedIn Ads' },
          { id: 'outbound', label: 'Outbound SDR' },
          { id: 'seo', label: 'SEO & Orgânico' },
        ].map(opt => {
          const isActive = originFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setOriginFilter(opt.id as 'all' | 'google' | 'meta' | 'linkedin' | 'outbound' | 'seo')}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white shadow-[0_2px_8px_rgba(255,106,0,0.35)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              style={{ border: 'none' }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* ── Kanban Columns Grid ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6A00]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start select-none">
          {STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
            const totalStageValue = stageLeads.reduce((acc, curr) => acc + curr.value, 0);

            return (
              <div 
                key={stage.id} 
                className="bg-[#eef2f7] border border-white/60 rounded-3xl p-4 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] space-y-4"
              >
                {/* Column Header */}
                <div className="flex items-start justify-between border-b border-slate-200/60 pb-3">
                  <div>
                    <h3 className="text-[13px] font-black text-[#0f172a] leading-none flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stage.title}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase leading-none">{stage.desc}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {stage.id !== 'ganho' && (
                      <button
                        onClick={() => handleRunPlaybook(stage.id)}
                        className="text-[8px] font-black bg-white hover:bg-slate-50 border border-slate-200 text-[#FF6A00] px-1.5 py-0.5 rounded shadow-sm hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                        title={`Disparar playbook automático na coluna ${stage.title}`}
                      >
                        ⚡ Run
                      </button>
                    )}
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/80 border text-slate-500 shadow-sm leading-none ml-1">
                      {stageLeads.length}
                    </span>
                  </div>
                </div>

                {/* Column Stats */}
                <div className="text-[11px] font-extrabold text-slate-500 bg-white/40 px-3 py-1.5 rounded-xl border border-white/60">
                  Total: <span className="text-slate-700">R$ {totalStageValue.toLocaleString('pt-BR')}</span>
                </div>

                {/* Leads List */}
                <div className="space-y-3 min-h-[400px] overflow-y-auto max-h-[600px] pr-0.5">
                  {stageLeads.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-300/40 rounded-2xl py-8 text-center text-[11px] text-slate-400 font-bold uppercase">
                      Sem leads
                    </div>
                  ) : (
                    stageLeads.map(lead => (
                      <motion.div
                        key={lead.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3.5 relative group/card"
                      >
                        {/* Action buttons (manual delete) */}
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover/card:opacity-100"
                          title="Remover Lead"
                        >
                          <Trash size={12} />
                        </button>

                        {/* Card Header info */}
                        <div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span 
                              className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border"
                              style={{ color: lead.originAgentCor, backgroundColor: `${lead.originAgentCor}15`, borderColor: `${lead.originAgentCor}35` }}
                            >
                              {lead.originAgent}
                            </span>
                            {(() => {
                              const origin = lead.originAgent.toUpperCase();
                              if (origin.includes('GOOGLE')) {
                                return (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-yellow-500/20 bg-yellow-500/5 text-yellow-600">
                                    Google Ads
                                  </span>
                                );
                              }
                              if (origin.includes('META') || origin.includes('FACEBOOK') || origin.includes('PAOLA')) {
                                return (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-blue-500/20 bg-blue-500/5 text-blue-600">
                                    Meta Ads
                                  </span>
                                );
                              }
                              if (origin.includes('LINKEDIN')) {
                                return (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-sky-500/20 bg-sky-500/5 text-sky-600">
                                    LinkedIn Ads
                                  </span>
                                );
                              }
                              if (origin.includes('VITOR') || origin.includes('OUTBOUND')) {
                                return (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-600">
                                    Outbound SDR
                                  </span>
                                );
                              }
                              if (origin.includes('SEO') || origin.includes('IGOR') || origin.includes('GEO') || origin.includes('ORGANIC')) {
                                return (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-slate-500/20 bg-slate-500/5 text-slate-600">
                                    SEO Orgânico
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <h4 className="text-[13px] font-extrabold text-slate-800 mt-1.5 leading-tight">{lead.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase leading-none">{lead.company}</p>
                        </div>

                        {/* Value & Info */}
                        <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                          <span>R$ {lead.value.toLocaleString('pt-BR')}</span>
                          <span className="text-[9px] font-medium text-slate-400">#{lead.id.split('-')[1]}</span>
                        </div>

                        {/* Current Status Message */}
                        <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed italic border-l-2 border-[#FF6A00]/80 pl-2">
                          &ldquo;{lead.statusText}&rdquo;
                        </p>

                        {/* Interactive Handoff/Agent Actions */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Ações do Agente</p>
                          <div className="flex gap-1.5 flex-wrap">
                            {lead.stage === 'capturado' && (
                              <>
                                <button
                                  onClick={() => handleExecuteAgentOperation(lead.id, 'qualificar')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black text-white hover:brightness-110 transition cursor-pointer"
                                  style={{ background: 'linear-gradient(135deg, #34D399, #10B981)' }}
                                >
                                  <Play size={8} /> Qualificar ICP
                                </button>
                                <button
                                  onClick={() => handleExecuteAgentOperation(lead.id, 'nutrir')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
                                >
                                  <Send size={8} /> Nutrir Leads
                                </button>
                              </>
                            )}

                            {lead.stage === 'qualificado' && (
                              <>
                                <button
                                  onClick={() => handleExecuteAgentOperation(lead.id, 'proposta')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black text-white hover:brightness-110 transition cursor-pointer"
                                  style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)' }}
                                >
                                  <Play size={8} /> Enviar Proposta
                                </button>
                                <button
                                  onClick={() => handleExecuteAgentOperation(lead.id, 'nutrir')}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer border border-slate-200"
                                >
                                  <Send size={8} /> Nutrir
                                </button>
                              </>
                            )}

                            {lead.stage === 'proposta' && (
                              <button
                                onClick={() => handleExecuteAgentOperation(lead.id, 'fechar')}
                                className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black text-white hover:brightness-110 transition cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)' }}
                              >
                                <Play size={8} /> Fechar Contrato (Closer)
                              </button>
                            )}

                            {lead.stage === 'fechamento' && (
                              <button
                                onClick={() => handleExecuteAgentOperation(lead.id, 'onboarding')}
                                className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black text-white hover:brightness-110 transition cursor-pointer"
                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                              >
                                <CheckCircle2 size={8} /> Concluir & Onboarding
                              </button>
                            )}

                            {lead.stage === 'ganho' && (
                              <div className="w-full text-center py-1 text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 uppercase tracking-widest">
                                Fechamento Concluído!
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Handoff Manual navigation */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <button
                            disabled={lead.stage === 'capturado'}
                            onClick={() => moveLead(lead.id, 'prev')}
                            className="text-[9px] font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                          >
                            Voltar
                          </button>
                          <button
                            onClick={() => handleOpenLead(lead)}
                            className="text-[10px] font-black text-[#FF6A00] hover:text-[#e05d00] transition cursor-pointer"
                          >
                            Abrir
                          </button>
                          <button
                            disabled={lead.stage === 'ganho'}
                            onClick={() => moveLead(lead.id, 'next')}
                            className="text-[9px] font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                          >
                            Avançar
                          </button>
                        </div>

                        {/* Logs list accordion-style or just last log summary */}
                        <div className="pt-2 border-t border-slate-100">
                          <details className="outline-none cursor-pointer">
                            <summary className="text-[9px] font-bold text-slate-400 hover:text-slate-600 select-none">
                              Ver histórico ({lead.history.length})
                            </summary>
                            <div className="mt-2 space-y-2 max-h-[120px] overflow-y-auto pl-1 pr-0.5">
                              {lead.history.map((log, logIdx) => (
                                <div key={logIdx} className="text-[9.5px] leading-snug border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 mb-0.5">
                                    <span style={{ color: log.agentCor }}>{log.agentName}</span>
                                    <span>{new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-slate-600 font-medium">{log.message}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>

                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lead Details / Edit Modal ── */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-[#eef2f7] border border-white/80 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedLead(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 border border-white/40 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] active:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] transition cursor-pointer"
              >
                <X size={15} />
              </button>

              {/* Title & Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[1px_1px_3px_#d1d9e6,_-1px_-1px_3px_#ffffff] mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedLead.originAgentCor }} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Origem: {selectedLead.originAgent}
                  </span>
                </div>
                <h2 className="text-[20px] font-black text-[#0f172a] leading-tight">
                  {isEditMode ? 'Editar Informações do Negócio' : selectedLead.name}
                </h2>
                {!isEditMode && (
                  <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mt-1">{selectedLead.company}</p>
                )}
              </div>

              {/* Content Form / View */}
              {isEditMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Nome do Lead</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Empresa</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition"
                      value={editCompany}
                      onChange={e => setEditCompany(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Valor Estimado (R$)</label>
                    <input
                      type="number"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition"
                      value={editValue}
                      onChange={e => setEditValue(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Etapa do Funil</label>
                    <select
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition"
                      value={editStage}
                      onChange={e => setEditStage(e.target.value as Lead['stage'])}
                    >
                      {STAGES.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">E-mail</label>
                    <input
                      type="email"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Telefone</label>
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 h-10 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">Status Atual / Última Interação</label>
                    <textarea
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#FF6A00] transition resize-none"
                      value={editStatusText}
                      onChange={e => setEditStatusText(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Detailed Info Cards */}
                  <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm space-y-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Valor do Negócio</p>
                      <p className="text-[16px] font-black text-slate-800">R$ {selectedLead.value.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Etapa Atual</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGES.find(s => s.id === selectedLead.stage)?.color }} />
                        <span className="text-[12px] font-bold text-slate-700">
                          {STAGES.find(s => s.id === selectedLead.stage)?.title}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Criado em</p>
                      <p className="text-[12px] font-semibold text-slate-600">{new Date(selectedLead.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm space-y-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">E-mail de Contato</p>
                      <p className="text-[12px] font-bold text-slate-700 truncate">{selectedLead.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Telefone / WhatsApp</p>
                      <p className="text-[12px] font-bold text-slate-700">{selectedLead.phone || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">ID do Lead</p>
                      <p className="text-[11px] font-mono text-slate-500">#{selectedLead.id}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-white/60 bg-white p-4 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Status Atual / Resumo do Negócio</p>
                    <p className="text-[12px] font-semibold text-slate-600 leading-relaxed mt-1 border-l-2 border-[#FF6A00] pl-2.5">
                      &ldquo;{selectedLead.statusText}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* History Section (only in view mode) */}
              {!isEditMode && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Histórico de Interações ({selectedLead.history.length})</h4>
                  <div className="border border-white/60 rounded-2xl bg-white/50 p-4 max-h-[160px] overflow-y-auto space-y-3.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.03)]">
                    {selectedLead.history.map((log, idx) => (
                      <div key={idx} className="text-[11px] leading-relaxed border-b border-slate-200/50 pb-2.5 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center text-[9px] font-black text-slate-400 mb-0.5">
                          <span style={{ color: log.agentCor }}>{log.agentName}</span>
                          <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-slate-600 font-semibold">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2.5 rounded-xl text-[12px] font-black text-white hover:brightness-110 transition cursor-pointer shadow-[0_2px_6px_rgba(255,106,0,0.25)]"
                      style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
                    >
                      Salvar Alterações
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-[#eef2f7] text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-5 py-2.5 rounded-xl text-[12px] font-black text-white hover:brightness-110 transition cursor-pointer shadow-[0_2px_6px_rgba(255,106,0,0.25)]"
                      style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
                    >
                      Editar Informações
                    </button>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 bg-[#eef2f7] text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Fechar Janela
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
