'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Database,
  HelpCircle,
  Loader2,
  Network,
  Save,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { slugifyAgentTitle } from '../../lib/hub-agents';
import { saveAgentReportToDb } from '../../lib/agent-report-history';

type GenericAgentWorkspaceProps = {
  userId?: string;
  agentTitle: string;
  category: string;
  description: string;
  monthlyLimit?: number;
};

type AgentWorkspaceDraft = {
  objective: string;
  monthlyGoal: string;
  mainChannel: string;
  notes: string;
};

const DEFAULT_DRAFT: AgentWorkspaceDraft = {
  objective: '',
  monthlyGoal: '',
  mainChannel: '',
  notes: '',
};

function buildPlaybookByCategory(category: string): string[] {
  if (category === 'Performance') {
    return [
      'Auditar campanhas ativas e eliminar desperdício de verba.',
      'Priorizar conjuntos de anúncios com maior taxa de conversão.',
      'Recalibrar orçamento com base no custo real por oportunidade.',
    ];
  }

  if (category === 'Criativos') {
    return [
      'Definir 3 ângulos criativos conectados à dor principal do público.',
      'Gerar variações de headline e CTA para validação rápida.',
      'Publicar ciclos semanais e comparar impacto no custo por lead.',
    ];
  }

  if (category === 'Técnico') {
    return [
      'Validar rastreamento e integridade de eventos críticos de conversão.',
      'Eliminar gargalos de jornada (tempo de carregamento e passos extras).',
      'Documentar rotina de monitoramento para evitar perda de dados.',
    ];
  }

  return [
    'Mapear sinais de mercado e priorizar oportunidades acionáveis.',
    'Transformar análise em hipóteses testáveis com prazo definido.',
    'Consolidar aprendizados e ajustar estratégia para escala previsível.',
  ];
}

export default function GenericAgentWorkspace({
  userId,
  agentTitle,
  category,
  description,
  monthlyLimit,
}: GenericAgentWorkspaceProps) {
  // Global States
  const [draft, setDraft] = useState<AgentWorkspaceDraft>(() => {
    if (typeof window === 'undefined' || !userId) return DEFAULT_DRAFT;
    try {
      const key = `neuroads_agent_workspace_${userId}_${slugifyAgentTitle(agentTitle)}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) return DEFAULT_DRAFT;
      const parsed = JSON.parse(raw) as Partial<AgentWorkspaceDraft>;
      return {
        objective: parsed.objective ?? '',
        monthlyGoal: parsed.monthlyGoal ?? '',
        mainChannel: parsed.mainChannel ?? '',
        notes: parsed.notes ?? '',
      };
    } catch {
      return DEFAULT_DRAFT;
    }
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'specialist' | 'playbook'>('specialist');

  // Specialized Tool State variables
  const [toolLoading, setToolLoading] = useState(false);
  const [toolResult, setToolResult] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Specialist Form inputs
  // 1. Rastreador Cirúrgico inputs
  const [capiUrl, setCapiUrl] = useState('');
  const [capiPixelId, setCapiPixelId] = useState('');
  const [capiEvent, setCapiEvent] = useState('Lead');
  const [capiTestCode, setCapiTestCode] = useState('');

  // 2. Analisador de Público inputs
  const [pubNiche, setPubNiche] = useState('');
  const [pubCompetitor, setPubCompetitor] = useState('');
  const [pubAgeRange, setPubAgeRange] = useState('25-44');

  // 3. Diagnóstico de Funil inputs
  const [funnelViews, setFunnelViews] = useState('10000');
  const [funnelLeads, setFunnelLeads] = useState('1200');
  const [funnelSqls, setFunnelSqls] = useState('240');
  const [funnelSales, setFunnelSales] = useState('48');

  // 4. Gerador de Testes A/B inputs
  const [abElement, setAbElement] = useState('Headline do Hero');
  const [abBaseline, setAbBaseline] = useState('2.0');
  const [abUplift, setAbUplift] = useState('20');
  const [abTraffic, setAbTraffic] = useState('8000');

  // 5. Avaliador de Oferta inputs
  const [offPrice, setOffPrice] = useState('497');
  const [offAnchor, setOffAnchor] = useState('1497');
  const [offWarranty, setOffWarranty] = useState('7');
  const [offBonuses, setOffBonuses] = useState('3');
  const [offDifferential, setOffDifferential] = useState('Suporte Individual');

  // 6. Radar de Oportunidades inputs
  const [radarModel, setRadarModel] = useState('E-commerce');
  const [radarAge, setRadarAge] = useState('25-34');
  const [radarTicket, setRadarTicket] = useState('297');

  // 7. Análise de Concorrentes inputs
  const [compDomain, setCompDomain] = useState('');
  const [compHook, setCompHook] = useState('');

  // 8. Público-Alvo Ideal inputs
  const [idealProduct, setIdealProduct] = useState('');
  const [idealObjection, setIdealObjection] = useState('');

  const storageKey = useMemo(() => {
    if (!userId) return null;
    return `neuroads_agent_workspace_${userId}_${slugifyAgentTitle(agentTitle)}`;
  }, [agentTitle, userId]);

  const playbook = useMemo(() => buildPlaybookByCategory(category), [category]);

  const handleSave = () => {
    if (!storageKey || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handlePersistReport = async (reportTitle: string, reportContent: string, metadata: any) => {
    if (!userId) return;
    setSaveStatus('Salvando no histórico...');
    try {
      await saveAgentReportToDb({
        userId,
        agentKey: slugifyAgentTitle(agentTitle),
        agentTitle,
        agentCategory: category,
        reportTitle,
        reportContent,
        reportFormat: 'plain_text',
        generatedAt: new Date().toISOString(),
        metadata,
      });
      setSaveStatus('Salvo com sucesso!');
      window.setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      setSaveStatus('Falha ao salvar relatório.');
    }
  };

  // Run Custom Specialist Simulation Logic
  const handleRunSpecialist = () => {
    setToolLoading(true);
    setToolResult(null);

    window.setTimeout(async () => {
      let resultPayload: any = null;
      let mdReport = '';
      let title = '';

      if (agentTitle === 'Rastreador Cirúrgico') {
        const cleanUrl = capiUrl || 'neuroads-tracking-sandbox.vercel.app';
        const cleanPixel = capiPixelId || '8294829104819';
        const emq = Math.min(10.0, 7.5 + Math.random() * 2.2);
        const fbp = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1000000000)}`;
        const fbc = `fb.1.${Date.now() - 50000}.sub.92a83bc1a8f94`;

        resultPayload = {
          emq: Number(emq.toFixed(1)),
          fbp,
          fbc,
          status: 'success',
          payload: {
            event_name: capiEvent,
            event_time: Math.floor(Date.now() / 1000),
            user_data: {
              client_ip_address: '191.185.12.19',
              client_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              fbp,
              fbc,
              em: 'f660ab912ec121d1b1e928a0bb4bc61b15f5ad44d5efdc4e1c92a25e99b8e44a'
            },
            custom_data: {
              currency: 'BRL',
              value: capiEvent === 'Purchase' ? 497.0 : undefined
            },
            event_source: 'server',
            action_source: 'website',
            opt_out: false
          }
        };

        title = `Rastreador CAPI: Evento ${capiEvent}`;
        mdReport = `=== TESTE DE RASTREAMENTO CIRÚRGICO CAPI ===\n\nStatus: ✅ EVENTO RECEBIDO COM SUCESSO\nURL de Origem: ${cleanUrl}\nPixel ID: ${cleanPixel}\nEvento: ${capiEvent}\nScore EMQ: ${resultPayload.emq}/10.0\n\nDeduplicação:\n- FBP: ${fbp}\n- FBC: ${fbc}\n\nPayload Enviado (Server-Side):\n${JSON.stringify(resultPayload.payload, null, 2)}`;
      }

      else if (agentTitle === 'Analisador de Público') {
        const niche = pubNiche || 'Negócio Local / Estética';
        const comp = pubCompetitor || 'Mercado Geral';

        const segments = [
          {
            name: 'Público Oceano Azul (Interesses Ocultos)',
            interests: ['Medicina estética', 'Laser fracionado', 'Procedimentos dermatológicos', 'Spas de Luxo'],
            audienceSize: '1.2M - 1.6M',
            cpm: 'R$ 18.50',
            cpc: 'R$ 0.95',
            cpaScore: 'Forte (Baixo custo)',
            bidding: 'Lance de Volume de Conversões'
          },
          {
            name: 'Público Alta Intenção (Competitivo)',
            interests: [`Fãs de ${comp}`, 'Cosméticos premium', 'Cuidado pessoal de alto padrão'],
            audienceSize: '450k - 600k',
            cpm: 'R$ 28.00',
            cpc: 'R$ 1.60',
            cpaScore: 'Médio (Alta concorrência)',
            bidding: 'Lance de Custo Alvo'
          },
          {
            name: 'Lookalike Indireto (Escala Segura)',
            interests: ['Viagens de luxo', 'Boutique hotels', 'Pilates', 'Design de interiores'],
            audienceSize: '2.5M - 3.1M',
            cpm: 'R$ 14.20',
            cpc: 'R$ 0.70',
            cpaScore: 'Excelente (Escala saudável)',
            bidding: 'CBO Padrão com criativos dinâmicos'
          }
        ];

        resultPayload = { niche, comp, age: pubAgeRange, segments };

        title = `Segmentação Oceano Azul: ${niche}`;
        mdReport = `=== MAPEAMENTO DE PÚBLICO E INTERESSES OCULTOS ===\n\nNicho Estudado: ${niche}\nConcorrente de Referência: ${comp}\nFaixa Etária: ${pubAgeRange} anos\n\n=== SEGMENTOS SUGERIDOS ===\n\n` +
          segments.map((seg, i) => `${i + 1}. ${seg.name}\n- Interesses Exatos: ${seg.interests.join(', ')}\n- Tamanho: ${seg.audienceSize}\n- CPM Médio: ${seg.cpm} | CPC Estimado: ${seg.cpc}\n- Bidding Sugerido: ${seg.bidding}\n- Potencial de CPA: ${seg.cpaScore}\n`).join('\n');
      }

      else if (agentTitle === 'Diagnóstico de Funil') {
        const viewsVal = parseInt(funnelViews) || 10000;
        const leadsVal = parseInt(funnelLeads) || 800;
        const sqlsVal = parseInt(funnelSqls) || 120;
        const salesVal = parseInt(funnelSales) || 18;

        const rateLpToLead = (leadsVal / viewsVal) * 100;
        const rateLeadToSql = (sqlsVal / leadsVal) * 100;
        const rateSqlToSale = (salesVal / sqlsVal) * 100;
        const rateTotal = (salesVal / viewsVal) * 100;

        let leakPoint = '';
        let leakSeverity = 'Normal';
        let recommendations: string[] = [];

        if (rateLpToLead < 8) {
          leakPoint = 'Taxa de Conversão da Landing Page (LP to Lead)';
          leakSeverity = 'Crítico (Abaixo de 10%)';
          recommendations = [
            'A promessa da Landing Page pode estar desalinhada com a expectativa criada no anúncio.',
            'O tempo de carregamento no mobile pode estar afugentando mais de 40% das visitas (otimizar imagens/scripts).',
            'O formulário inicial está pedindo dados sensíveis muito cedo. Reduza para Nome/WhatsApp apenas.'
          ];
        } else if (rateLeadToSql < 18) {
          leakPoint = 'Qualificação de Oportunidades (Lead to SQL)';
          leakSeverity = 'Alto (Abaixo de 25%)';
          recommendations = [
            'Os leads gerados não possuem o perfil ideal de compra. Ajuste a segmentação ou negative interesses.',
            'Falta de automação rápida de contato. Se um lead demora mais de 15 minutos para ser contatado, a taxa cai 8x.',
            'Adicione uma pergunta qualificadora simples de orçamento ou urgência no formulário.'
          ];
        } else if (rateSqlToSale < 12) {
          leakPoint = 'Taxa de Fechamento Comercial (SQL to Venda)';
          leakSeverity = 'Moderado (Abaixo de 15%)';
          recommendations = [
            'O time de vendas comercial está demorando muito para realizar o pitch (falta playbook de fechamento rápido).',
            'Sua oferta não está com a ancoragem clara ou faltam bônus para quebrar a objeção imediata de preço.',
            'Estabelecer fluxo automático de recuperação no WhatsApp com depoimentos e prazos de escassez.'
          ];
        } else {
          leakPoint = 'Nenhum gargalo agudo detectado. Funil equilibrado.';
          leakSeverity = 'Excelente';
          recommendations = [
            'Funil saudável. O foco deve ser aumentar o volume de tráfego de entrada mantendo o CPA.',
            'Criar campanhas de Lookalike de compradores para acelerar a escala.',
            'Implementar upsells imediatos no checkout para elevar o ticket médio.'
          ];
        }

        resultPayload = {
          rateLpToLead: Number(rateLpToLead.toFixed(1)),
          rateLeadToSql: Number(rateLeadToSql.toFixed(1)),
          rateSqlToSale: Number(rateSqlToSale.toFixed(1)),
          rateTotal: Number(rateTotal.toFixed(2)),
          leakPoint,
          leakSeverity,
          recommendations
        };

        title = `Diagnóstico de Gargalos: Funil Comercial`;
        mdReport = `=== DIAGNÓSTICO E MAPEAMENTO DE GARGALOS DO FUNIL ===\n\nMetricas Consolidadas:\n- Visitas na LP: ${viewsVal}\n- Leads Gerados: ${leadsVal} (Conversão: ${resultPayload.rateLpToLead}%)\n- SQLs / Oportunidades: ${sqlsVal} (Qualificação: ${resultPayload.rateLeadToSql}%)\n- Vendas Efetivas: ${salesVal} (Fechamento: ${resultPayload.rateSqlToSale}%)\n- Taxa Geral: ${resultPayload.rateTotal}%\n\nPONTO CRÍTICO DE VAZAMENTO:\n📍 ${leakPoint}\nSeveridade: ${leakSeverity}\n\nRecomendações Práticas para Correção:\n` + recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
      }

      else if (agentTitle === 'Gerador de Testes A/B') {
        const base = parseFloat(abBaseline) || 2.0;
        const up = parseFloat(abUplift) || 20;
        const trafficVal = parseInt(abTraffic) || 6000;

        const targetConv = base * (1 + up / 100);
        // Standard statistical sample size formula approximation for A/B tests (Power 80%, Confidence 95%)
        const sSize = Math.round((16 * base * 100) / Math.pow(targetConv - base, 2) * 100);
        const daysRequired = Math.ceil((sSize * 2) / (trafficVal / 30));

        let copyBlueprint = '';
        if (abElement === 'Headline do Hero') {
          copyBlueprint = `Variante A (Controle): Focado em benefícios técnicos gerais.\nVariante B (Desafiante): Focado em eliminar a maior dor com garantia incondicional na headline (ex: "Tenha X sem Y ou não pague nada").`;
        } else if (abElement === 'Oferta de Preço') {
          copyBlueprint = `Variante A (Controle): Preço único à vista (ex: R$ 497,00).\nVariante B (Desafiante): Parcelamento facilitado enfatizando custo diário (ex: "Por menos de R$ 1,65 por dia") ou divisão do preço com bônus físico exclusivo incluído.`;
        } else {
          copyBlueprint = `Variante A (Controle): CTA padrão "Começar Agora" ou "Enviar Formulário".\nVariante B (Desafiante): CTA de menor fricção com micro-compromisso emocional (ex: "Quero meu diagnóstico gratuito" ou "Falar com especialista").`;
        }

        resultPayload = {
          targetConv: Number(targetConv.toFixed(2)),
          sampleSize: sSize,
          days: daysRequired,
          blueprint: copyBlueprint
        };

        title = `Protocolo A/B: Otimização de ${abElement}`;
        mdReport = `=== PLANEJAMENTO DE TESTE A/B ESTRUTURADO ===\n\nElemento sob Análise: ${abElement}\nConversão de Linha de Base: ${base}%\nUplift Estimado Alvo: +${up}% (Foco em alcançar ${resultPayload.targetConv}%)\nTráfego de Entrada Mensal: ${trafficVal} visitas\n\n=== REQUISITOS ESTATÍSTICOS ===\n- Tamanho Mínimo da Amostra: ${sSize} visitas por variação\n- Tempo de Duração Recomendado: ${daysRequired} dias úteis\n- Grau de Confiança de Validação: 95%\n\n=== DIRETRIZES DE COPYS DO TESTE ===\n${copyBlueprint}`;
      }

      else if (agentTitle === 'Avaliador de Oferta') {
        const prVal = parseFloat(offPrice) || 497;
        const ancVal = parseFloat(offAnchor) || 1997;
        const warVal = parseInt(offWarranty) || 7;
        const bonVal = parseInt(offBonuses) || 2;

        let score = 50;
        // Anchoring score
        const anchorRatio = ancVal / prVal;
        if (anchorRatio >= 3.5) score += 20;
        else if (anchorRatio >= 2.0) score += 10;

        // Warranty score
        if (warVal >= 30) score += 15;
        else if (warVal >= 15) score += 10;
        else if (warVal >= 7) score += 5;

        // Bonuses score
        score += Math.min(15, bonVal * 4);

        // Differential score
        if (offDifferential === 'Suporte Individual') score += 10;
        else if (offDifferential === 'Acesso Vitalício') score += 7;
        else score += 5;

        score = Math.min(100, score);
        let label = 'Razoável';
        let actionTip = '';

        if (score >= 85) {
          label = 'Oferta Irrecusável (Altamente Conversiva)';
          actionTip = 'Sua ancoragem está excelente e a percepção de valor excede muito o preço cobrado. O foco deve ser reforçar depoimentos e provas sociais na página para sustentar a escala de tráfego.';
        } else if (score >= 65) {
          label = 'Forte (Pronta para Tráfego Direto)';
          actionTip = 'A estrutura da oferta está equilibrada. Para transformá-la em irrecusável, aumente o prazo de garantia incondicional para 15 ou 30 dias, mitigando o risco percebido do comprador.';
        } else {
          label = 'Frágil (Alta fricção de venda)';
          actionTip = 'Sua oferta atual gera muita desconfiança ou tem pouco valor percebido. Recomendamos estruturar pelo menos 3 bônus exclusivos que resolvam a próxima dor do cliente e deixar a ancoragem explícita no checkout.';
        }

        resultPayload = { score, label, actionTip };

        title = `Scorecard da Oferta: Avaliação Comercial`;
        mdReport = `=== SCORE DE ATRATIVIDADE DA OFERTA (1-100) ===\n\nNicho Geral: ${category}\nPreço Anunciado: R$ ${prVal}\nPreço Ancorado na LP: R$ ${ancVal}\nPrazo de Garantia: ${warVal} dias\nBônus Oferecidos: ${bonVal} itens\nDiferencial Chave: ${offDifferential}\n\nSCORE GERAL: ⭐ ${score}/100\nClassificação: ${label}\n\nRECOMENDAÇÃO OPERACIONAL:\n💡 ${actionTip}`;
      }

      else if (agentTitle === 'Radar de Oportunidades') {
        const ticketVal = parseFloat(radarTicket) || 297;

        let suggestions: any[] = [];
        if (radarModel === 'B2B SaaS') {
          suggestions = [
            { name: 'LinkedIn Video Ads (Retargeting)', cpc: 'R$ 6.50 - R$ 9.00', scale: 4, match: 'Excelente para tomadores de decisão C-Level', budget: '25% da verba' },
            { name: 'TikTok Search Ads (Educacional)', cpc: 'R$ 1.20 - R$ 2.10', scale: 3.5, match: 'Nicho desenvolvedores e jovens fundadores buscando produtividade', budget: '15% da verba' },
            { name: 'Google Performance Max (PMax)', cpc: 'R$ 3.00 - R$ 4.50', scale: 4.8, match: 'Atração ampla baseada em intenção de termos corporativos', budget: '60% da verba' }
          ];
        } else if (radarModel === 'E-commerce') {
          suggestions = [
            { name: 'Pinterest Ads (Estilo de Vida & Visual)', cpc: 'R$ 0.45 - R$ 0.80', scale: 4.2, match: 'Excelente para moda, joias e casa se o avatar tiver +30 anos', budget: '20% da verba' },
            { name: 'Meta Advantage+ Catalog Ads', cpc: 'R$ 0.90 - R$ 1.30', scale: 5, match: 'Campanha dinâmica padrão com melhor custo-benefício comercial', budget: '50% da verba' },
            { name: 'Google Shopping com LIA (Local Inventory)', cpc: 'R$ 0.70 - R$ 1.10', scale: 4.5, match: 'Atração imediata de compradores em fase de decisão final', budget: '30% da verba' }
          ];
        } else if (radarModel === 'Negócio Local') {
          suggestions = [
            { name: 'Google Local Campaign (Maps)', cpc: 'R$ 1.10 - R$ 1.80', scale: 4.6, match: 'Aparecer no topo das buscas geolocalizadas próximas do estabelecimento', budget: '50% da verba' },
            { name: 'Meta Ads de Direct/WhatsApp', cpc: 'R$ 0.85 - R$ 1.20', scale: 4.2, match: 'Iniciar conversação rápida com público num raio de 5km do local', budget: '40% da verba' },
            { name: 'Waze Ads (Navegação Ativa)', cpc: 'R$ 0.40 - R$ 0.65', scale: 3, match: 'Mapear motoristas transitando na região no horário de pico', budget: '10% da verba' }
          ];
        } else { // Infoproduto
          suggestions = [
            { name: 'Taboola Native Ads (Anúncio Editorial)', cpc: 'R$ 0.35 - R$ 0.60', scale: 4.5, match: 'Ideal para advertoriais e nicho de saúde/finanças', budget: '30% da verba' },
            { name: 'YouTube Shorts de Conversão Direta', cpc: 'R$ 1.10 - R$ 1.65', scale: 4.8, match: 'Ideal se a oferta tiver forte apelo em vídeo e ticket médio < R$ 197', budget: '40% da verba' },
            { name: 'Meta Ads com CBO focado em Storytelling', cpc: 'R$ 1.00 - R$ 1.45', scale: 5, match: 'Aproveitar a inteligência dos pixels para cruzar com interesses amplos', budget: '30% da verba' }
          ];
        }

        resultPayload = { suggestions, model: radarModel, age: radarAge };

        title = `Radar de Canais: Oportunidades ${radarModel}`;
        mdReport = `=== ESCARETAMENTO DE CANAIS E OCEANO AZUL ===\n\nModelo de Negócio: ${radarModel}\nTicket Médio do Produto: R$ ${ticketVal}\n\n=== RECOMENDAÇÕES DE CANAIS SUBESTIMADOS ===\n\n` +
          suggestions.map((s, i) => `${i + 1}. ${s.name}\n- CPC Estimado: ${s.cpc}\n- Viabilidade de Escala: ${'⭐'.repeat(Math.round(s.scale))}\n- Aderência do Canal: ${s.match}\n- Divisão de Verba: ${s.budget}\n`).join('\n');
      }

      else if (agentTitle === 'Análise de Concorrentes') {
        const competitor = compDomain || 'Hotmart';
        const benefit = compHook || 'Crescimento Previsível';

        const hooks = [
          `Gancho 1: "O método ignorado pelos concorrentes para ter ${benefit} sem precisar contratar agências caras."`,
          `Gancho 2: "Como líderes de mercado estão blindando o caixa em épocas de CPC alto."`,
          `Gancho 3: "O checklist prático que reduziu o desperdício de mídia da ${competitor} à metade em 14 dias."`
        ];

        const structures = [
          'LP Section 1 (Hero): Headline de quebra de padrão, subtítulo de promessa incondicional e botão de formulário sem fricção.',
          'LP Section 2: O inimigo comum (o vilão que drena dinheiro na mídia tradicional).',
          'LP Section 3: Depoimentos de validação (prova social focada na superação do obstáculo inicial).'
        ];

        resultPayload = { competitor, benefit, hooks, structures };

        title = `Análise Competitiva: Estratégias da ${competitor}`;
        mdReport = `=== DOSSIÊ COMPLETO DE INTELIGÊNCIA COMPETITIVA ===\n\nConcorrente Alvo: ${competitor}\nGancho Primário: ${benefit}\n\n=== ANATOMIA DA LANDING PAGE DO CONCORRENTE ===\n` +
          structures.map((s, i) => `${i + 1}. ${s}`).join('\n') +
          `\n\n=== PROPOSTAS DE GANCHOS DE ANÚNCIOS (CONTRA-POSICIONAMENTO) ===\n` +
          hooks.map((h, i) => `- ${h}`).join('\n');
      }

      else { // Público-Alvo Ideal
        const prod = idealProduct || 'Mentoria Executiva';
        const obj = idealObjection || 'Falta de tempo';

        const avatar = {
          name: 'Roberto, o Gestor Sobrecarregado',
          desires: [
            'Escalar o faturamento da empresa com previsibilidade.',
            'Ter processos delegáveis para sair do operacional do dia a dia.',
            'Sentir segurança financeira nas tomadas de decisão táticas.'
          ],
          fears: [
            'Perder o controle dos custos e ver o caixa sangrar de uma hora para outra.',
            'Tornar-se escravo da própria empresa sem qualidade de vida.',
            'Ficar obsoleto em relação aos competidores que usam IA.'
          ],
          rationalizations: [
            `"${obj}: eu sei que preciso disso, mas minha rotina atual consome 12 horas diárias."`,
            '"Já tentei outras mentorias e o conteúdo era puramente teórico, nada prático."'
          ],
          copyTriggers: [
            `Headline: "O método de 15 minutos diários para implementar X na sua empresa mesmo se a sua agenda estiver colapsada."`,
            `Gatilho de Autoridade: Mostrar como a ${prod} automatiza a rotina gerando tempo em vez de consumir.`
          ]
        };

        resultPayload = { prod, obj, avatar };

        title = `Perfil de Persona: ${avatar.name}`;
        mdReport = `=== FICHA DA PERSONA COGNITIVA DEFINITIVA ===\n\nProduto Solucionador: ${prod}\nObjeção Dominante: ${obj}\n\nPERSONA ENCONTRADA: 👤 ${avatar.name}\n\n🎯 DESEJOS PRIMÁRIOS:\n` +
          avatar.desires.map((d) => `- ${d}`).join('\n') +
          `\n\n⚠️ PESADELOS SUBCONSCIENTES:\n` +
          avatar.fears.map((f) => `- ${f}`).join('\n') +
          `\n\n💬 RACIONALIZAÇÕES (OBJEÇÕES INTERNAS):\n` +
          avatar.rationalizations.map((o) => `- ${o}`).join('\n') +
          `\n\n⚡ GATILHOS DE CONVERSÃO RECOMENDADOS:\n` +
          avatar.copyTriggers.map((c) => `- ${c}`).join('\n');
      }

      setToolResult(resultPayload);
      setToolLoading(false);

      if (userId) {
        await handlePersistReport(title, mdReport, {
          ...resultPayload,
          isSimulation: true
        });
      }
    }, 1500);
  };

  return (
    <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-5 md:p-7 space-y-6">
          
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-bold">Workspace Inteligente</p>
              <h2 className="mt-1 text-2xl font-black text-text-main">{agentTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-muted">{description}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-black text-primary">
                Ativo na Operação
              </span>
              <span className="text-[11px] text-text-dim">
                Limite mensal: {monthlyLimit ?? 15} execuções
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E2E8F0] gap-2">
            <button
              onClick={() => setActiveTab('specialist')}
              className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 px-3 ${
                activeTab === 'specialist'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main'
              }`}
            >
              Ferramenta Especialista
            </button>
            <button
              onClick={() => setActiveTab('playbook')}
              className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 px-3 ${
                activeTab === 'playbook'
                  ? 'border-transparent text-text-muted hover:text-text-main'
                  : 'border-primary text-primary'
              }`}
            >
              Playbook & Configurações
            </button>
          </div>

          {activeTab === 'specialist' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
              
              {/* Left Column: Form & Simulator */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 space-y-4">
                  <h3 className="text-sm font-black text-text-main flex items-center gap-2">
                    <Zap size={16} className="text-primary" />
                    Parâmetros de Entrada do Agente
                  </h3>
                  <p className="text-xs text-text-muted -mt-2">
                    Preencha os dados abaixo para cruzar com a inteligência neural do agente de IA.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dynamic Form fields depending on agent */}
                    {agentTitle === 'Rastreador Cirúrgico' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">URL da Landing Page</span>
                          <input
                            value={capiUrl}
                            onChange={(e) => setCapiUrl(e.target.value)}
                            placeholder="ex: neuroads.com.br/conversao"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Meta Pixel ID</span>
                          <input
                            value={capiPixelId}
                            onChange={(e) => setCapiPixelId(e.target.value)}
                            placeholder="ex: 283948291048"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Evento de Conversão</span>
                          <select
                            value={capiEvent}
                            onChange={(e) => setCapiEvent(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="Lead">Lead (Geração de Cadastro)</option>
                            <option value="Purchase">Purchase (Compra Concluída)</option>
                            <option value="AddToCart">AddToCart (Adicionar ao Carrinho)</option>
                            <option value="InitiateCheckout">InitiateCheckout (Iniciar Pagamento)</option>
                          </select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Token CAPI de Teste (Opcional)</span>
                          <input
                            value={capiTestCode}
                            onChange={(e) => setCapiTestCode(e.target.value)}
                            placeholder="ex: TEST72948"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    )}

                    {agentTitle === 'Analisador de Público' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Nicho/Segmento do Negócio</span>
                          <input
                            value={pubNiche}
                            onChange={(e) => setPubNiche(e.target.value)}
                            placeholder="ex: Estética Facial, SaaS Financeiro"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Concorrente Referência</span>
                          <input
                            value={pubCompetitor}
                            onChange={(e) => setPubCompetitor(e.target.value)}
                            placeholder="ex: Kérastase, Clinique, XP Investimentos"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Faixa Etária Alvo</span>
                          <select
                            value={pubAgeRange}
                            onChange={(e) => setPubAgeRange(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="18-24">18-24 anos (Geração Z)</option>
                            <option value="25-44">25-44 anos (Público de Decisão)</option>
                            <option value="45-64">45-64 anos (Alto poder de compra)</option>
                            <option value="18-65">18-65 anos (Amplo)</option>
                          </select>
                        </label>
                      </>
                    )}

                    {agentTitle === 'Diagnóstico de Funil' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Visitantes na LP</span>
                          <input
                            type="number"
                            value={funnelViews}
                            onChange={(e) => setFunnelViews(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Leads Gerados</span>
                          <input
                            type="number"
                            value={funnelLeads}
                            onChange={(e) => setFunnelLeads(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">SQLs / Oportunidades</span>
                          <input
                            type="number"
                            value={funnelSqls}
                            onChange={(e) => setFunnelSqls(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Vendas Realizadas</span>
                          <input
                            type="number"
                            value={funnelSales}
                            onChange={(e) => setFunnelSales(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    )}

                    {agentTitle === 'Gerador de Testes A/B' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Variável de Teste</span>
                          <select
                            value={abElement}
                            onChange={(e) => setAbElement(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="Headline do Hero">Headline do Hero (Copy Principal)</option>
                            <option value="Oferta de Preço">Oferta de Preço e Bônus</option>
                            <option value="Vídeo de Vendas">Vídeo de Vendas (VSL)</option>
                            <option value="CTA Principal">CTA de Ação de Checkout</option>
                          </select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Taxa de Conversão Atual (%)</span>
                          <input
                            type="number"
                            step="0.1"
                            value={abBaseline}
                            onChange={(e) => setAbBaseline(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Melhoria Desejada (Uplift %)</span>
                          <input
                            type="number"
                            value={abUplift}
                            onChange={(e) => setAbUplift(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Tráfego Mensal na LP</span>
                          <input
                            type="number"
                            value={abTraffic}
                            onChange={(e) => setAbTraffic(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    )}

                    {agentTitle === 'Avaliador de Oferta' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Preço do Produto (R$)</span>
                          <input
                            type="number"
                            value={offPrice}
                            onChange={(e) => setOffPrice(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Preço Ancorado / Antigo (R$)</span>
                          <input
                            type="number"
                            value={offAnchor}
                            onChange={(e) => setOffAnchor(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Dias de Garantia</span>
                          <select
                            value={offWarranty}
                            onChange={(e) => setOffWarranty(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="7">7 dias (Mínimo por lei)</option>
                            <option value="15">15 dias (Diferencial competitivo)</option>
                            <option value="30">30 dias (Garantia Forte de Autoridade)</option>
                          </select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Quantidade de Bônus Inclusos</span>
                          <input
                            type="number"
                            value={offBonuses}
                            onChange={(e) => setOffBonuses(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block md:col-span-2">
                          <span className="text-xs font-bold text-text-main">Diferencial Agregado Principal</span>
                          <select
                            value={offDifferential}
                            onChange={(e) => setOffDifferential(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="Suporte Individual">Suporte Individual VIP no WhatsApp</option>
                            <option value="Acesso Vitalício">Acesso Vitalício ao Conteúdo</option>
                            <option value="Comunidade Exclusiva">Acesso a Comunidade fechada de membros</option>
                            <option value="Templates Executáveis">Templates e Modelos prontos para rodar</option>
                          </select>
                        </label>
                      </>
                    )}

                    {agentTitle === 'Radar de Oportunidades' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Modelo do Negócio</span>
                          <select
                            value={radarModel}
                            onChange={(e) => setRadarModel(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="E-commerce">E-commerce / Varejo Físico</option>
                            <option value="B2B SaaS">B2B SaaS / Serviços Corporativos</option>
                            <option value="Negócio Local">Negócio Local / Clínica / Consultório</option>
                            <option value="Infoproduto">Infoproduto / Lançamentos / Perpétuo</option>
                          </select>
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Ticket Médio do Produto (R$)</span>
                          <input
                            type="number"
                            value={radarTicket}
                            onChange={(e) => setRadarTicket(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Perfil Etário Dominante</span>
                          <select
                            value={radarAge}
                            onChange={(e) => setRadarAge(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          >
                            <option value="18-24">18-24 anos (Gen Z / Mobile-First)</option>
                            <option value="25-34">25-34 anos (Jovens Profissionais)</option>
                            <option value="35-54">35-54 anos (Decisores / Executivos)</option>
                            <option value="55+">55+ anos (Poder Aquisitivo / Tradicional)</option>
                          </select>
                        </label>
                      </>
                    )}

                    {agentTitle === 'Análise de Concorrentes' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Domínio/Nome do Concorrente</span>
                          <input
                            value={compDomain}
                            onChange={(e) => setCompDomain(e.target.value)}
                            placeholder="ex: hotmart.com"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Principal Promessa / Benefício</span>
                          <input
                            value={compHook}
                            onChange={(e) => setCompHook(e.target.value)}
                            placeholder="ex: Crescimento Previsível"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    )}

                    {agentTitle === 'Público-Alvo Ideal' && (
                      <>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Seu Produto / Serviço</span>
                          <input
                            value={idealProduct}
                            onChange={(e) => setIdealProduct(e.target.value)}
                            placeholder="ex: Curso de Finanças"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-xs font-bold text-text-main">Maior Objeção do Público</span>
                          <input
                            value={idealObjection}
                            onChange={(e) => setIdealObjection(e.target.value)}
                            placeholder="ex: Não tenho tempo, Produto é muito caro"
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                          />
                        </label>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRunSpecialist}
                    disabled={toolLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-xs font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] hover:brightness-105 disabled:opacity-60"
                  >
                    {toolLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Executando inteligência...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Executar Diagnóstico do Agente
                      </>
                    )}
                  </button>

                  {saveStatus && (
                    <p className="text-xs font-bold text-[#0A9D57] flex items-center gap-1.5 animate-pulse mt-2">
                      <CheckCircle2 size={13} />
                      {saveStatus}
                    </p>
                  )}
                </div>

                {/* Simulated Outputs & Visualizations */}
                {toolResult && (
                  <div className="rounded-2xl border border-[#BDE8CF] bg-[#F2FFF7] p-5 space-y-4 animate-fade-in">
                    <h3 className="text-sm font-black text-[#0A9D57] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      Análise Estruturada Concluída
                    </h3>

                    {/* 1. Rastreador Cirúrgico Visualization */}
                    {agentTitle === 'Rastreador Cirúrgico' && (
                      <div className="space-y-4 text-text-main">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="rounded-xl border border-[#BDE8CF] bg-white p-3 text-center">
                            <p className="text-[11px] font-bold text-text-dim uppercase">Status da Conexão</p>
                            <p className="text-xl font-black text-[#0A9D57] mt-1">ATIVA</p>
                          </div>
                          <div className="rounded-xl border border-[#BDE8CF] bg-white p-3 text-center">
                            <p className="text-[11px] font-bold text-text-dim uppercase">Evento Capturado</p>
                            <p className="text-xl font-black text-text-main mt-1">{capiEvent}</p>
                          </div>
                          <div className="rounded-xl border border-[#BDE8CF] bg-white p-3 text-center">
                            <p className="text-[11px] font-bold text-text-dim uppercase">Qualidade do Sinal (EMQ)</p>
                            <p className="text-xl font-black text-primary mt-1">{toolResult.emq}/10</p>
                          </div>
                        </div>

                        {/* Interactive flow trace */}
                        <div className="rounded-xl border border-[#E3E8EF] bg-white p-4 space-y-3">
                          <p className="text-xs font-black text-text-dim uppercase">Visualizador de Deduplicação de Eventos</p>
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-t border-[#EEF2F7]">
                            <div className="text-center md:text-left">
                              <p className="text-xs font-bold text-text-main">Pixel do Navegador (Client)</p>
                              <span className="mt-1 inline-flex items-center rounded-full bg-[#FFF1F2] border border-[#FECACA] px-2.5 py-0.5 text-[10px] font-bold text-[#B42318]">
                                ⚠️ Bloqueado / Cookies Limitados
                              </span>
                            </div>
                            <div className="h-6 w-px bg-[#E2E8F0] hidden md:block" />
                            <div className="text-center">
                              <p className="text-xs font-bold text-text-main">Deduplicação de ID</p>
                              <p className="text-xs font-mono bg-bg-secondary px-2.5 py-1 rounded border mt-1 select-all">{toolResult.fbp.slice(0, 16)}...</p>
                            </div>
                            <div className="h-6 w-px bg-[#E2E8F0] hidden md:block" />
                            <div className="text-center md:text-right">
                              <p className="text-xs font-bold text-text-main">NeuroAds Server API (CAPI)</p>
                              <span className="mt-1 inline-flex items-center rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 text-[10px] font-bold text-[#065F46] animate-pulse">
                                ✅ Recebido & Integrado (Server)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-text-main">Código de Transmissão (Meta CAPI Payload):</p>
                          <pre className="text-xs font-mono p-4 bg-bg-main text-[#EEF2F8] rounded-xl overflow-x-auto max-h-48 scrollbar-thin select-all">
                            {JSON.stringify(toolResult.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* 2. Analisador de Público */}
                    {agentTitle === 'Analisador de Público' && (
                      <div className="space-y-4">
                        <p className="text-sm text-text-muted">
                          Encontramos <strong>3 oportunidades de oceano azul</strong> com baixa concorrência e alto potencial de cliques para o nicho de <strong>{toolResult.niche}</strong>.
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {toolResult.segments.map((seg: any, idx: number) => (
                            <div key={idx} className="rounded-xl border border-[#D1E7DD] bg-white p-4 space-y-2 shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF2F7] pb-2">
                                <p className="text-sm font-black text-text-main">{seg.name}</p>
                                <span className="text-xs font-bold text-primary">{seg.audienceSize} pessoas</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <p className="text-text-dim uppercase font-bold">CPM Médio</p>
                                  <p className="font-semibold text-text-main mt-0.5">{seg.cpm}</p>
                                </div>
                                <div>
                                  <p className="text-text-dim uppercase font-bold">CPC Estimado</p>
                                  <p className="font-semibold text-text-main mt-0.5">{seg.cpc}</p>
                                </div>
                                <div>
                                  <p className="text-text-dim uppercase font-bold">CPA Score</p>
                                  <p className="font-semibold text-[#0A9D57] mt-0.5">{seg.cpaScore}</p>
                                </div>
                                <div>
                                  <p className="text-text-dim uppercase font-bold">Bidding Recomendado</p>
                                  <p className="font-semibold text-text-main mt-0.5">{seg.bidding}</p>
                                </div>
                              </div>
                              <div className="bg-bg-secondary p-2.5 rounded-lg border border-[#E3E8EF] mt-2">
                                <p className="text-[11px] font-black uppercase text-text-dim tracking-wide">Interesses Exatos do Gerenciador de Anúncios</p>
                                <p className="text-xs text-text-main mt-1 font-mono select-all font-bold">{seg.interests.join(', ')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Diagnóstico de Funil */}
                    {agentTitle === 'Diagnóstico de Funil' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                          <div className="bg-white border rounded-xl p-3 border-[#D1E7DD]">
                            <p className="text-xs text-text-dim font-bold">Conversão LP</p>
                            <p className="text-lg font-black text-text-main mt-1">{toolResult.rateLpToLead}%</p>
                          </div>
                          <div className="bg-white border rounded-xl p-3 border-[#D1E7DD]">
                            <p className="text-xs text-text-dim font-bold">Qualificação Leads</p>
                            <p className="text-lg font-black text-text-main mt-1">{toolResult.rateLeadToSql}%</p>
                          </div>
                          <div className="bg-white border rounded-xl p-3 border-[#D1E7DD]">
                            <p className="text-xs text-text-dim font-bold">Fechamento SQL</p>
                            <p className="text-lg font-black text-text-main mt-1">{toolResult.rateSqlToSale}%</p>
                          </div>
                          <div className="bg-white border rounded-xl p-3 border-[#D1E7DD]">
                            <p className="text-xs text-text-dim font-bold">Conversão Geral</p>
                            <p className="text-lg font-black text-primary mt-1">{toolResult.rateTotal}%</p>
                          </div>
                        </div>

                        {/* CSS-drawn Funnel Map */}
                        <div className="bg-white rounded-xl border border-[#E4EAF2] p-4 flex flex-col items-center justify-center space-y-2 py-6">
                          <p className="text-xs font-black uppercase text-text-dim mb-2">Estrutura Gráfica do Funil Comercial</p>
                          
                          <div className="w-full max-w-[280px] bg-primary/80 text-white rounded-lg text-center py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(255,107,0,0.15)]">
                            <Activity size={12} />
                            Visitas: {funnelViews}
                          </div>
                          <div className="w-0 h-0 border-l-[140px] border-l-transparent border-r-[140px] border-r-transparent border-t-[8px] border-t-primary/25" />

                          <div className="w-[85%] max-w-[238px] bg-primary/90 text-white rounded-lg text-center py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_10px_rgba(255,107,0,0.12)]">
                            Leads: {funnelLeads} ({toolResult.rateLpToLead}%)
                          </div>
                          <div className="w-0 h-0 border-l-[119px] border-l-transparent border-r-[119px] border-r-transparent border-t-[8px] border-t-primary/25" />

                          <div className="w-[70%] max-w-[196px] bg-primary text-white rounded-lg text-center py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_8px_rgba(255,107,0,0.1)]">
                            SQLs: {funnelSqls} ({toolResult.rateLeadToSql}%)
                          </div>
                          <div className="w-0 h-0 border-l-[98px] border-l-transparent border-r-[98px] border-r-transparent border-t-[8px] border-t-primary/25" />

                          <div className="w-[50%] max-w-[140px] bg-primary-dark bg-[#E05A00] text-white rounded-lg text-center py-2 text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_4px_8px_rgba(224,90,0,0.1)]">
                            Vendas: {funnelSales} ({toolResult.rateSqlToSale}%)
                          </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-[#9A3412]">
                          <p className="font-bold text-[15px] flex items-center gap-2">
                            <Target size={14} className="text-[#FF6B00]" />
                            Gargalo Crítico Isolado: {toolResult.leakPoint}
                          </p>
                          <p className="mt-1 text-xs font-black uppercase text-text-muted">Severidade: {toolResult.leakSeverity}</p>
                          <ul className="mt-3 space-y-1.5 text-xs text-text-main pl-1">
                            {toolResult.recommendations.map((rec: string, rIdx: number) => (
                              <li key={rIdx} className="flex gap-2">
                                <span className="mt-[6px] inline-flex h-1 w-1 rounded-full bg-primary shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 4. Gerador de Testes A/B */}
                    {agentTitle === 'Gerador de Testes A/B' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="rounded-xl border border-[#BDE8CF] bg-white p-3 text-center">
                            <p className="text-[11px] font-bold text-text-dim uppercase">Amostragem Mínima/Variante</p>
                            <p className="text-xl font-black text-text-main mt-1">{Intl.NumberFormat('pt-BR').format(toolResult.sampleSize)} visitas</p>
                          </div>
                          <div className="rounded-xl border border-[#BDE8CF] bg-white p-3 text-center">
                            <p className="text-[11px] font-bold text-text-dim uppercase">Período de Execução</p>
                            <p className="text-xl font-black text-primary mt-1">{toolResult.days} dias</p>
                          </div>
                          <div className="rounded-xl border border-[#BDE8CF] bg-white p-3 text-center">
                            <p className="text-[11px] font-bold text-text-dim uppercase">Meta de Conversão</p>
                            <p className="text-xl font-black text-[#0A9D57] mt-1">{toolResult.targetConv}%</p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 text-[#1E3A8A] text-sm">
                          <p className="font-bold flex items-center gap-2 uppercase tracking-wider text-xs">
                            <Target size={13} />
                            Roteiro do Experimento AB (Headline / Conceito)
                          </p>
                          <pre className="mt-2 whitespace-pre-line text-xs leading-relaxed text-text-main font-sans bg-white p-3 rounded-lg border">
                            {toolResult.blueprint}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* 5. Avaliador de Oferta */}
                    {agentTitle === 'Avaliador de Oferta' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4 border-b border-[#D1E7DD] pb-2">
                          <div>
                            <p className="text-xs text-text-dim uppercase font-bold">Classificação da Oferta</p>
                            <h4 className="text-base font-black text-text-main mt-0.5">{toolResult.label}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-text-dim uppercase font-bold">Score Geral</p>
                            <p className="text-2xl font-black text-primary mt-0.5">{toolResult.score}/100</p>
                          </div>
                        </div>

                        {/* Interactive Attractiveness Scale */}
                        <div>
                          <p className="text-xs font-bold text-text-dim uppercase mb-1.5">Índice de Força Comercial</p>
                          <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden flex">
                            <div
                              className="bg-gradient-to-r from-red-500 via-[#FF6B00] to-[#0A9D57] h-full rounded-full transition-all duration-1000"
                              style={{ width: `${toolResult.score}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-text-dim font-bold mt-1 uppercase">
                            <span>Fricção Alta</span>
                            <span>Aceitável</span>
                            <span>Irrecusável</span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#FFDCC7] bg-[#FFF8F3] p-4 text-[#9A3412] text-sm">
                          <p className="font-bold flex items-center gap-2">
                            <Award size={14} className="text-[#FF6B00]" />
                            Recomendação para Aumentar Atratividade:
                          </p>
                          <p className="mt-1 text-xs text-text-main leading-relaxed">{toolResult.actionTip}</p>
                        </div>
                      </div>
                    )}

                    {/* 6. Radar de Oportunidades */}
                    {agentTitle === 'Radar de Oportunidades' && (
                      <div className="space-y-4">
                        <p className="text-sm text-text-muted">
                          Analisamos o comportamento demográfico da faixa de <strong>{toolResult.age} anos</strong> e o modelo <strong>{toolResult.model}</strong>. Estes são os 3 canais de alta viabilidade que seus concorrentes ignoram:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {toolResult.suggestions.map((s: any, idx: number) => (
                            <div key={idx} className="rounded-xl border border-[#D1E7DD] bg-white p-4 space-y-2 flex flex-col justify-between shadow-sm">
                              <div>
                                <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-wide">{s.budget} da verba</p>
                                <p className="text-[14px] font-black text-text-main mt-1 leading-snug">{s.name}</p>
                                <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{s.match}</p>
                              </div>
                              <div className="border-t border-[#EEF2F7] pt-2 mt-3 text-xs">
                                <p className="text-text-dim uppercase font-bold">CPC Estimado</p>
                                <p className="font-semibold text-text-main mt-0.5">{s.cpc}</p>
                                <p className="text-text-dim uppercase font-bold mt-1.5">Escala Viável</p>
                                <p className="font-semibold text-text-main mt-0.5">{'⭐'.repeat(Math.round(s.scale))}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 7. Análise de Concorrentes */}
                    {agentTitle === 'Análise de Concorrentes' && (
                      <div className="space-y-4">
                        <p className="text-sm text-text-muted">
                          Dossiê de engenharia reversa para o domínio de referência <strong>{toolResult.competitor}</strong> e promessa de <strong>{toolResult.benefit}</strong>:
                        </p>

                        <div className="rounded-xl border border-[#E3E8EF] bg-white p-4 space-y-2">
                          <p className="text-xs font-black uppercase text-text-dim tracking-wider flex items-center gap-1.5">
                            <Search size={12} className="text-primary" />
                            Anatomia de LP Competitiva:
                          </p>
                          <ul className="text-xs text-text-muted space-y-1.5">
                            {toolResult.structures.map((s: string, idx: number) => (
                              <li key={idx} className="flex gap-2">
                                <span className="mt-1.5 h-1 w-1 bg-primary rounded-full shrink-0" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 space-y-2 text-[#1E3A8A]">
                          <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} />
                            Ganchos de Adugeridos (Para Vencê-los):
                          </p>
                          <ul className="text-xs text-text-main space-y-2">
                            {toolResult.hooks.map((h: string, idx: number) => (
                              <li key={idx} className="bg-white p-2 rounded-lg border border-[#D2DFEE] font-medium leading-relaxed">
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* 8. Público-Alvo Ideal */}
                    {agentTitle === 'Público-Alvo Ideal' && (
                      <div className="space-y-4 text-text-main">
                        <div className="flex flex-wrap items-center gap-3 border-b border-[#D1E7DD] pb-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-text-dim uppercase font-bold">Avatar Cognitivo Gerado</p>
                            <h4 className="text-sm font-black text-text-main">{toolResult.avatar.name}</h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-xl border border-[#E3E8EF] bg-white p-4 space-y-2">
                            <p className="text-xs font-black text-[#0A9D57] uppercase tracking-wider">🎯 Desejos e Sonhos Reais:</p>
                            <ul className="text-xs text-text-muted space-y-1.5">
                              {toolResult.avatar.desires.map((d: string) => (
                                <li key={d} className="flex gap-2">
                                  <span className="mt-1.5 h-1 w-1 bg-[#0A9D57] rounded-full shrink-0" />
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-[#E3E8EF] bg-white p-4 space-y-2">
                            <p className="text-xs font-black text-[#B42318] uppercase tracking-wider">⚠️ Pesadelos e Dores Latentes:</p>
                            <ul className="text-xs text-text-muted space-y-1.5">
                              {toolResult.avatar.fears.map((f: string) => (
                                <li key={f} className="flex gap-2">
                                  <span className="mt-1.5 h-1 w-1 bg-[#B42318] rounded-full shrink-0" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 text-[#1E3A8A]">
                          <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={12} />
                            Gatilhos Emocionais para Anúncios:
                          </p>
                          <ul className="mt-2 text-xs text-text-main space-y-2">
                            {toolResult.avatar.copyTriggers.map((c: string, idx: number) => (
                              <li key={idx} className="bg-white p-2.5 rounded-lg border border-[#CBD5E1] leading-relaxed">
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Mini Guidelines */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-4 text-sm text-text-main">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-dim">Estilo de Atuação</p>
                  <p className="mt-2 text-xs leading-relaxed text-text-muted">
                    Este agente atua de forma analítica e estratégica em ciclos semanais. As auditorias auxiliam o tomador de decisão a aplicar melhorias cirúrgicas na jornada de captação.
                  </p>
                  
                  <div className="mt-4 border-t border-[#EEF2F7] pt-4 space-y-3">
                    <div className="flex gap-2.5 items-start">
                      <div className="h-5 w-5 bg-primary/10 rounded-full border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingUp size={11} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-main">Escala Previsível</p>
                        <p className="text-[11px] text-text-muted">Foco em diminuir custo de aquisição e aumentar o ROI final.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 items-start">
                      <div className="h-5 w-5 bg-[#0A9D57]/10 rounded-full border border-[#0A9D57]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Database size={11} className="text-[#0A9D57]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-main">Integração CAPI/Banco</p>
                        <p className="text-[11px] text-text-muted">Garante histórico sólido e relatórios ricos integrados ao Firestore.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#FFDCC7] bg-[#FFF8F3] p-4 text-sm text-[#9A3412]">
                  <p className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                    <Target size={14} className="text-[#FF6B00]" />
                    Resultado estratégico
                  </p>
                  <p className="mt-1 text-xs text-text-main leading-relaxed">
                    A operação deixa de se apoiar em achismos ou testes dispersos, consolidando aprendizados reais para guiar investimentos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playbook' && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-dim">Configuração rápida</p>
                <div className="mt-3 space-y-3">
                  <input
                    value={draft.objective}
                    onChange={(event) => setDraft((prev) => ({ ...prev, objective: event.target.value }))}
                    placeholder="Objetivo principal (ex: reduzir CPL em 20%)"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                  />
                  <input
                    value={draft.monthlyGoal}
                    onChange={(event) => setDraft((prev) => ({ ...prev, monthlyGoal: event.target.value }))}
                    placeholder="Meta mensal em receita/oportunidades"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                  />
                  <input
                    value={draft.mainChannel}
                    onChange={(event) => setDraft((prev) => ({ ...prev, mainChannel: event.target.value }))}
                    placeholder="Canal prioritário (Google, Meta, Orgânico, etc.)"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                  />
                  <textarea
                    value={draft.notes}
                    onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Observações operacionais para o time"
                    rows={4}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(8,183,96,0.25)] hover:brightness-105"
                  >
                    <Save size={14} />
                    Salvar configuração
                  </button>
                  {saved ? (
                    <p className="inline-flex items-center gap-2 text-xs font-bold text-[#0A9D57] mt-1">
                      <CheckCircle2 size={14} />
                      Configuração salva neste dispositivo.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-dim">Playbook recomendado</p>
                <div className="mt-3 space-y-2">
                  {playbook.map((step) => (
                    <div key={step} className="rounded-xl border border-[#E3E8EF] bg-white px-3 py-2 text-xs text-text-main flex gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 bg-[#FF6B00] rounded-full shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border border-[#FFDCC7] bg-[#FFF8F3] px-3 py-3 text-sm text-[#9A3412]">
                  <p className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                    <Target size={14} />
                    Resultado esperado
                  </p>
                  <p className="mt-1 text-xs text-text-main">
                    Rotina ativa para gerar execução consistente e evolução de performance sem depender de tentativa e erro.
                  </p>
                </div>

                <div className="mt-3 rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-3 text-sm text-[#1E3A8A]">
                  <p className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-xs">
                    <Sparkles size={14} />
                    Próximo passo
                  </p>
                  <p className="mt-1 text-xs text-text-main">
                    Com esta base pronta, você já consegue operar este agente e evoluir para automações específicas na próxima sprint.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
