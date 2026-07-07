'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ArrowRight, 
  Check, 
  Database,
  Filter,
  Cpu,
  Mail,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import RadialOrbitalTimeline from '../../components/ui/radial-orbital-timeline';

interface FAQItem {
  question: string;
  answer: string;
}

// Orbitals definition matching src/app/page.tsx
const orbitalItems = [
  {
    id: 1,
    title: 'Ulisses',
    image: '/images/Avatar Agentes IA/Avatar_Ulisses.png',
    category: 'Orquestrador Central',
    bio: 'Ulisses é o orquestrador central do ecossistema NeuroAds. Ele distribui os briefings diários para os demais agentes, acompanha o status de cada conversão e consolida relatórios analíticos de alta performance para os gestores, garantindo a integração contínua do funil comercial.',
    channels: ['Slack', 'E-mail', 'WhatsApp', 'Hub']
  },
  {
    id: 2,
    title: 'Vitor',
    image: '/images/Avatar Agentes IA/Avatar_Vitor.png',
    category: 'Agente SDR',
    bio: 'Vitor atua na linha de frente do comercial. Ele monitora páginas de captura de alta intenção, aciona sequências de qualificação personalizadas em tempo real e realiza o handoff automático de leads quentes para que o time comercial finalize o fechamento.',
    channels: ['WhatsApp', 'E-mail', 'Hub']
  },
  {
    id: 3,
    title: 'Manu',
    image: '/images/Avatar Agentes IA/Avatar_Manu.png',
    category: 'Agente de Suporte',
    bio: 'Manu soluciona chamados recorrentes de nível 1 instantaneamente. Ela analisa o sentimento do cliente e, quando detecta um padrão de dúvida repetido, alerta o time de conteúdo para a criação imediata de materiais educativos de suporte.',
    channels: ['WhatsApp', 'Slack', 'Hub']
  },
  {
    id: 4,
    title: 'Igor',
    image: '/images/Avatar Agentes IA/Avatar_Igor.png',
    category: 'Agente de Inteligência de Dados',
    bio: 'Igor audita funis de vendas, cruzando dados de anúncios com o CRM. Ele calcula o custo de aquisição (CAC), o retorno de investimento (ROI) e envia notificações automáticas ao time de tráfego se detectar desvios de orçamento ou queda de performance.',
    channels: ['Hub', 'Slack', 'E-mail']
  },
  {
    id: 5,
    title: 'Tainá',
    image: '/images/Avatar Agentes IA/Avatar_Taina.png',
    category: 'Agente de Conteúdo',
    bio: 'Tainá desenvolve textos persuasivos para anúncios pagos, redige newsletters semanais e cria artigos focados em educação de leads, baseando-se nas objeções mapeadas pelo time comercial e nas dúvidas vindas do suporte.',
    channels: ['Hub', 'WordPress', 'E-mail']
  },
  {
    id: 6,
    title: 'Breno',
    image: '/images/Avatar Agentes IA/Avatar_Breno.png',
    category: 'Agente Closer',
    bio: 'Breno gerencia negociações complexas. Ele formula propostas comerciais com base no budget do lead, automatiza follow-ups após o envio e encaminha o contrato assinado diretamente para a fase de onboarding de novos clientes.',
    channels: ['E-mail', 'WhatsApp', 'Hub']
  },
  {
    id: 7,
    title: 'Paola',
    image: '/images/Avatar Agentes IA/Avatar_Paola.png',
    category: 'Agente de Tráfego',
    bio: 'Paola atua no Google Ads e Meta Ads. Ela analisa o ROAS em tempo real, substitui criativos em fadiga, realiza testes A/B de headlines e descobre novos públicos semelhantes (lookalike) com menor custo por mil impressões (CPM).',
    channels: ['Google Ads', 'Meta Ads', 'Hub']
  },
  {
    id: 8,
    title: 'Raíssa',
    image: '/images/Avatar Agentes IA/Avatar_Raissa.png',
    category: 'Agente de Upsell & Reativação',
    bio: 'Raíssa monitora a satisfação e o uso da plataforma pelos clientes ativos. Ela ativa campanhas automáticas de upsell no momento de maior engajamento e cria fluxos de recuperação para reativar clientes inativos há mais de 30 dias.',
    channels: ['WhatsApp', 'E-mail', 'Hub']
  },
  {
    id: 9,
    title: 'Heitor',
    image: '/images/Avatar Agentes IA/Avatar_Heitor.png',
    category: 'Agente de Processos & Integrações',
    bio: 'Heitor gerencia a integração técnica de novos leads. Ele conecta o CRM a ferramentas externas, valida chaves de API do cliente e garante que toda a esteira de onboarding de marketing/vendas funcione perfeitamente sem falhas.',
    channels: ['Hub', 'APIs', 'Webhooks']
  },
  {
    id: 10,
    title: 'Laís',
    image: '/images/Avatar Agentes IA/Avatar_Lais.png',
    category: 'Agente de SEO & GEO',
    bio: 'Laís monitora o posicionamento orgânico da marca. Ela otimiza o SEO do blog para novas palavras-chave de baixa concorrência e estrutura dados de forma a posicionar o negócio no topo de buscadores generativos de IA (GEO).',
    channels: ['Hub', 'Google Search', 'SEO Tools']
  }
];

function AgentProfileCard({ agent }: { agent: any }) {
  if (!agent) return null;

  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full mt-8 flex flex-col md:flex-row items-center gap-6 relative"
    >
      {/* Left Side: Avatar Image */}
      <div className="w-[110px] h-[110px] rounded-2xl overflow-hidden border border-[#EAEAEA] bg-white shadow-sm z-10 shrink-0 relative">
        <Image
          src={agent.image}
          alt={agent.title}
          fill
          className="object-cover object-center scale-[1.05]"
          sizes="110px"
          priority
        />
      </div>

      {/* Right Side: Details Card */}
      <div className="w-full p-6 rounded-2xl border border-[#EAEAEA] bg-white shadow-xs z-20 flex flex-col space-y-3">
        <div className="space-y-0.5">
          <h4 className="font-head font-extrabold text-lg text-black tracking-tight leading-none">
            {agent.title}
          </h4>
          <p className="text-[9px] font-extrabold text-[#FF5500] uppercase tracking-wider">
            {agent.category}
          </p>
        </div>

        <p className="text-slate-500 text-[11px] leading-relaxed font-normal min-h-[45px]">
          {agent.bio}
        </p>

        <div className="pt-2.5 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
            Canais de Integração
          </span>
          <div className="flex gap-2">
            {agent.channels?.map((channel: string, idx: number) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center text-slate-500 hover:text-[#FF5500] hover:scale-[1.05] transition-all duration-200 cursor-pointer"
                title={channel}
              >
                {channel === 'Slack' && <Cpu size={10} className="stroke-[2.5]" />}
                {channel === 'E-mail' && <Mail size={10} className="stroke-[2.5]" />}
                {channel === 'WhatsApp' && <MessageSquare size={10} className="stroke-[2.5]" />}
                {channel === 'Hub' && <Database size={10} className="stroke-[2.5]" />}
                {channel !== 'Slack' && channel !== 'E-mail' && channel !== 'WhatsApp' && channel !== 'Hub' && (
                  <span className="text-[8px] font-black uppercase">{channel.slice(0, 2)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TempLandingPage() {
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isSobreOpen, setIsSobreOpen] = useState(false);

  useEffect(() => {
    setActiveAgent(orbitalItems[0]);
  }, []);

  const centerLogoNode = (
    <div className="w-20 h-20 rounded-full overflow-hidden bg-black flex items-center justify-center shadow-[4px_4px_12px_rgba(0,0,0,0.15),_inset_2px_2px_5px_rgba(255,255,255,0.1)] border border-neutral-950 select-none">
      <Image
        src="/images/icon_neuroads_transparente.png"
        alt="NeuroAds Center Icon"
        width={56}
        height={56}
        className="object-contain"
        priority
      />
    </div>
  );

  // FAQ Content adapted from NeuroAds home page texts
  const faqs: FAQItem[] = [
    {
      question: "O que é a NeuroAds e como funcionam os Agentes de IA?",
      answer: "A NeuroAds une campanhas patrocinadas, automação e um ecossistema de 10 agentes de inteligência artificial especializados para transformar o marketing e o comercial da sua empresa B2B. Nossos agentes (como Vitor SDR, Paola Tráfego e Igor Dados) realizam tarefas diárias de qualificação de leads, criação de criativos e auditoria de campanhas 24/7."
    },
    {
      question: "Qual o valor do investimento e existe fidelidade?",
      answer: "Oferecemos um Plano Único de apenas R$ 79,90/mensal que garante acesso completo a todos os 10 agentes especializados, orquestração central, RAG integrado e conexões de automação com seu CRM. E o melhor: você pode experimentar por 14 dias sem custos e cancelar quando quiser, sem qualquer taxa ou fidelidade."
    },
    {
      question: "Como os dados são integrados com meu CRM?",
      answer: "Nossos workflows dinâmicos conectam o CRM a ferramentas externas via webhooks e APIs públicas. Cada lead qualificado pelo Vitor (SDR) ou fechado pelo Breno (Closer) é enviado automaticamente ao seu funil do CRM, sincronizando contatos, produtos e status de negociação sem a necessidade de digitação manual."
    },
    {
      question: "Como o Igor (Agente de Dados) ajuda a monitorar os resultados?",
      answer: "O Igor realiza análises preditivas cruzando o investimento de mídia com o faturamento do CRM. Ele monitora métricas como CAC, ROI e taxa de conversão em tempo real. Se detectar desvios de orçamento ou quedas na conversão do funil, ele notifica o time instantaneamente no Slack para ações corretivas."
    },
    {
      question: "Quais as garantias de segurança das credenciais de anúncios?",
      answer: "Adotamos padrões rígidos de criptografia (AES-256-GCM) para armazenar todas as credenciais de anúncios e tokens de CRM em repouso. O tráfego de dados é efetuado de forma blindada por canais HTTPS/TLS seguros, assegurando total governança e isolamento por usuário."
    }
  ];

  return (
    <div className="min-h-screen bg-[#EDF1F5] text-[#111111] font-sans selection:bg-[#FF5500]/10 selection:text-[#FF5500] antialiased relative overflow-hidden">
      
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#EDF1F5]/95 backdrop-blur-md border-b border-[#EAEAEA] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/temp-lp" className="flex items-center gap-2">
            <Image
              src="/images/logo-neuroads-attached.png"
              alt="NeuroAds Logo"
              width={140}
              height={36}
              className="object-contain"
              priority
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold text-slate-500">
            <Link href="#publico-alvo" className="hover:text-black transition-colors">Público-Alvo</Link>
            <Link href="#agentes" className="hover:text-black transition-colors">Agentes IA</Link>
            <Link href="#solucoes" className="hover:text-black transition-colors">Soluções</Link>
            <Link href="#demonstracao" className="hover:text-black transition-colors">Demonstração</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13px] font-bold text-slate-500 hover:text-black transition-colors">
              Acessar Hub
            </Link>
            <Link href="/cadastro" className="text-[12px] font-extrabold bg-[#FF5500] hover:bg-[#E64D00] text-white px-5 py-2.5 rounded-full transition-all">
              Ativar Ecossistema
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section id="agentes" className="px-6 pt-16 pb-24 md:pt-24 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side Content */}
        <div className="lg:col-span-7 space-y-8 flex flex-col items-start text-left">
          
          <div className="inline-flex items-center gap-2 bg-[#F5F5F7] border border-[#EAEAEA] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]"></span>
            Marketing · Vendas · Automação · Agentes IA
          </div>

          <h1 className="font-head text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.05] max-w-2xl">
            Operações IA Estratégicas em <span className="text-[#FF5500]">Marketing & Vendas B2B</span>.
          </h1>

          <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed">
            A NeuroAds une campanhas patrocinadas, automação e um ecossistema de agentes inteligentes para transformar o marketing e o comercial da sua empresa B2B em uma máquina previsível de receita.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <Link 
              href="/cadastro" 
              className="w-full sm:w-auto inline-flex items-center justify-center font-bold text-sm bg-black hover:bg-neutral-800 text-white px-8 py-4 rounded-full transition-all hover:scale-[1.01] active:scale-[0.99] group"
            >
              Ativar meu ecossistema
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-left pl-2">
              <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase block">
                14 dias sem custos
              </span>
              <span className="text-slate-500 text-xs font-semibold block">
                Setup rápido e sem cartão.
              </span>
            </div>
          </div>

          {/* Dynamic Interactive Agent Profile Card (Anexo 03 Style) */}
          <div className="w-full max-w-2xl">
            <AgentProfileCard agent={activeAgent} />
          </div>

        </div>

        {/* Right Side - Radial Orbital Timeline (Matching attached image) */}
        <div className="lg:col-span-5 flex items-center justify-center relative mt-8 lg:mt-0">
          <RadialOrbitalTimeline
            items={orbitalItems}
            centerLabel={centerLogoNode}
            theme="light"
            onActiveItemChange={(item) => {
              if (item) {
                const fullAgent = orbitalItems.find((a) => a.id === item.id);
                setActiveAgent(fullAgent || item);
              }
            }}
            showTooltip={false}
          />
        </div>

      </section>

      {/* ── Testimonials (Claudio Müller) ── */}
      <section className="bg-white border-y border-[#EAEAEA] py-12 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-[#EAEAEA] shrink-0 relative shadow-sm">
            <Image
              src="/images/eu.jpeg"
              alt="Claudio Müller"
              fill
              className="object-cover"
            />
          </div>
          <div className="h-6 w-px bg-slate-300 hidden md:block"></div>
          <p className="text-slate-700 text-sm md:text-base font-semibold italic max-w-xl leading-relaxed">
            &ldquo;A NeuroAds resolveu o que nenhuma outra empresa conseguiu: personalização de IA real com dados de verdade. Conseguimos ver o comportamento, o que funciona e acompanhar o processo comercial completo — tudo isso com atendimento muito próximo.&rdquo;
          </p>
          <div className="shrink-0 text-left border-t md:border-t-0 md:border-l border-slate-300 pt-3 md:pt-0 md:pl-6">
            <span className="text-xs font-bold text-black block">Claudio Müller</span>
            <span className="text-[9px] font-extrabold text-[#FF5500] uppercase tracking-wider block">Analista em Marketing & IA</span>
          </div>
        </div>
      </section>

      {/* ── Who is this for? (Audience grid adapted) ── */}
      <section id="publico-alvo" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">Público-Alvo</span>
          <h2 className="font-head text-3xl font-black text-black tracking-tight">Para quem é a NeuroAds?</h2>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Unifique dados, automatize funis e coloque agentes de inteligência artificial para otimizar suas conversões comerciais todos os dias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="border border-[#EAEAEA] rounded-[24px] p-6 hover:border-[#FF5500] transition-colors bg-white space-y-4">
            <h4 className="font-head font-bold text-[#FF5500] text-sm uppercase tracking-wider">Freelancers</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Atraia clientes de alto ticket de forma previsível no piloto automático. Maximize seus ganhos em cada projeto sem taxas de assinatura abusivas.
            </p>
          </div>

          {/* Card 2 */}
          <div className="border border-[#EAEAEA] rounded-[24px] p-6 hover:border-[#FF5500] transition-colors bg-white space-y-4">
            <h4 className="font-head font-bold text-[#FF5500] text-sm uppercase tracking-wider">Agências</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Recupere horas faturáveis e mude o foco do time de relatórios estáticos para o crescimento real dos clientes através da nossa inteligência.
            </p>
          </div>

          {/* Card 3 */}
          <div className="border border-[#EAEAEA] rounded-[24px] p-6 hover:border-[#FF5500] transition-colors bg-white space-y-4">
            <h4 className="font-head font-bold text-[#FF5500] text-sm uppercase tracking-wider">Consultorias</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Atraia clientes ideais graças à melhoria de fluxo e ofereça propostas comerciais de alto padrão totalmente qualificadas por IA.
            </p>
          </div>

          {/* Card 4 */}
          <div className="border border-[#EAEAEA] rounded-[24px] p-6 hover:border-[#FF5500] transition-colors bg-white space-y-4">
            <h4 className="font-head font-bold text-[#FF5500] text-sm uppercase tracking-wider">eCommerce</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Converta cliques e carrinhos abandonados em vendas recorrentes no caixa sem lidar com o capital congelado em canais de anúncios.
            </p>
          </div>

          {/* Card 5 */}
          <div className="border border-[#EAEAEA] rounded-[24px] p-6 hover:border-[#FF5500] transition-colors bg-white space-y-4">
            <h4 className="font-head font-bold text-[#FF5500] text-sm uppercase tracking-wider">Cross Border</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Alcance novos mercados internacionais e conquiste contratos globais com uma estratégia ágil para capturar conversões de qualquer lugar.
            </p>
          </div>

          {/* Card 6 */}
          <div className="border border-[#EAEAEA] rounded-[24px] p-6 hover:border-[#FF5500] transition-colors bg-white space-y-4">
            <h4 className="font-head font-bold text-[#FF5500] text-sm uppercase tracking-wider">Incorporadoras</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Mapeie e qualifique leads de alta renda para empreendimentos de luxo, segmentando com base no score de compra de forma automatizada.
            </p>
          </div>

        </div>
      </section>

      {/* ── Comparison Section (Standard vs NeuroAds) ── */}
      <section id="comparacao" className="py-20 bg-[#EDF1F5] border-y border-[#EAEAEA] px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">O Problema das Agências</span>
            <h2 className="font-head text-3xl font-black text-black tracking-tight leading-tight">
              A maior parte das agências de tráfego é lenta, cara e confusa.
            </h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
              Sua operação comercial precisa de dados integrados de marketing e vendas rodando em tempo real, sem planilhas confusas e sem ter que delegar tarefas manualmente.
            </p>
            <div className="pt-2">
              <Link href="/cadastro" className="inline-flex items-center font-bold text-xs bg-black hover:bg-neutral-800 text-white px-6 py-3 rounded-full transition-all">
                Conectar Minhas Campanhas
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Slow */}
            <div className="border border-[#EAEAEA] rounded-2xl p-6 bg-white space-y-4">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">Lento</span>
              <h4 className="font-head font-bold text-black text-xs">Relatórios Estáticos</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Você precisa de respostas rápidas para seus lances, mas recebe relatórios estáticos em PDF semanas após o encerramento do mês.
              </p>
            </div>

            {/* Expensive */}
            <div className="border border-[#EAEAEA] rounded-2xl p-6 bg-white space-y-4">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">Caro</span>
              <h4 className="font-head font-bold text-black text-xs">Assinaturas Bloadas</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Paga dezenas de licenças mensais para ferramentas de marketing que não conversam entre si, acumulando custos no final do mês.
              </p>
            </div>

            {/* Confusing */}
            <div className="border border-[#EAEAEA] rounded-2xl p-6 bg-white space-y-4">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">Confuso</span>
              <h4 className="font-head font-bold text-black text-xs">Falta de Contexto</h4>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                IAs comuns trabalham sem contexto de vendas e alucinam constantemente ao ler informações desorganizadas em arquivos de prompt.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── Key Benefits Grid (Manrope / Acctual style) ── */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">Recursos Principais</span>
          <h2 className="font-head text-3xl font-black text-black tracking-tight">Projetamos uma experiência de marketing focada em lucro</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Benefit 1 */}
          <div className="p-8 border border-[#EAEAEA] rounded-[24px] bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="font-head font-bold text-black text-lg">Crie copys e criativos sem contratar um designer profissional</h4>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Crie variações de anúncios de alta conversão em poucos segundos. Nosso ecossistema gera criativos adaptados à identidade de marca de forma automatizada pela Tainá (Conteúdo).
              </p>
            </div>
            <p className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider">Aproveite copys prontas instantaneamente</p>
          </div>

          {/* Benefit 2 */}
          <div className="p-8 border border-[#EAEAEA] rounded-[24px] bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="font-head font-bold text-black text-lg">Qualifique e faça follow-up com leads usando links dinâmicos</h4>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Vitor (SDR) cuida de iniciar e acompanhar negociações B2B instantaneamente. Envie links personalizados com toda a esteira de atendimento integrada e aumente suas taxas de reunião em 3.2x.
              </p>
            </div>
            <p className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider">100% no-code e pronto para usar</p>
          </div>

          {/* Benefit 3 */}
          <div className="p-8 border border-[#EAEAEA] rounded-[24px] bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="font-head font-bold text-black text-lg">Receba alertas de anomalias no caixa em tempo real direto no Slack</h4>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Esqueça surpresas no fechamento de caixa. Igor (Dados) monitora seu custo de aquisição (CAC), investimento de mídia e ROI 24h, enviando alertas automáticos em caso de queda de desempenho.
              </p>
            </div>
            <p className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider">Visibilidade total da operação</p>
          </div>

          {/* Benefit 4 */}
          <div className="p-8 border border-[#EAEAEA] rounded-[24px] bg-white flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h4 className="font-head font-bold text-black text-lg">Automatize integrações com ferramentas de CRM e webhooks</h4>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Conecte HubSpot, Kommo, Pipedrive e demais ferramentas nativas da sua operação. Sincronize contatos, produtos e histórico de interações automaticamente sob a orquestração de Heitor.
              </p>
            </div>
            <p className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider">Sync seguro e sem digitação manual</p>
          </div>

        </div>
      </section>

      {/* ── Integrations Section (QuickBooks style layout) ── */}
      <section className="py-20 bg-[#EDF1F5] border-y border-[#EAEAEA] px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="space-y-4">
            <h2 className="font-head text-3xl font-black text-black tracking-tight">
              Sincronização automática com suas ferramentas de mídia e CRM
            </h2>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
              Integre suas contas de anúncios e conectores prediletos. O Data Core atualiza contatos, eventos de conversão e transações no seu sistema de gestão de forma totalmente autônoma.
            </p>
          </div>

          {/* Sync icons mock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-black">M</span>
              <span className="text-xs font-bold text-black">Meta Ads</span>
            </div>
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-black">G</span>
              <span className="text-xs font-bold text-black">Google Ads</span>
            </div>
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center text-white text-xs font-black">L</span>
              <span className="text-xs font-bold text-black">LinkedIn Ads</span>
            </div>
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">H</span>
              <span className="text-xs font-bold text-black">HubSpot CRM</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── FAQ Section (Accordions) ── */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto space-y-12">
        <h2 className="font-head text-3xl font-black text-center text-black tracking-tight">
          Perguntas Frequentes
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-xs md:text-sm text-black focus:outline-none hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 text-slate-500 text-xs md:text-sm leading-relaxed border-t border-[#EAEAEA] pt-4 bg-white">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Demo & Access Block ── */}
      <DemoAndAccessSection />

      {/* ── Footer ── */}
      <footer className="bg-[#EDF1F5] text-slate-500 py-16 px-6 border-t border-[#EAEAEA] text-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="font-head font-black text-slate-900 text-base">
              Neuro<span className="text-[#FF5500]">Ads</span>
            </span>
            <p className="text-slate-500 text-xs leading-relaxed">
              Operações IA estratégicas para marketing e vendas B2B. Conectando dados em tempo real, automatizando funis e convertendo oportunidades.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase tracking-wider text-[10px] mb-4">Plataforma</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="#solucoes" className="hover:text-black transition-colors">Soluções</Link></li>
              <li><Link href="#valores" className="hover:text-black transition-colors">Valores</Link></li>
              <li><Link href="/cadastro" className="hover:text-black transition-colors">Começar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase tracking-wider text-[10px] mb-4">Recursos</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/conteudos" className="hover:text-black transition-colors">Blog</Link></li>
              <li><Link href="/whitepaper_ia_vendas" className="hover:text-black transition-colors">Whitepapers</Link></li>
              <li><Link href="/conteudos/faq" className="hover:text-black transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-black uppercase tracking-wider text-[10px] mb-4">Contato</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>avante@neuroads.com.br</li>
              <li>Suporte 24/7</li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Sistemas Online
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="max-w-6xl mx-auto border-t border-[#EAEAEA] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} NeuroAds. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link href="/termos" className="hover:text-black transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-black transition-colors">Privacidade</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}


function DemoAndAccessSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && isHuman) {
      try {
        const res = await fetch('/api/access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, company }),
        });
        if (res.ok) {
          setFormSubmitted(true);
        }
      } catch (err) {
        console.error("Access submission error", err);
      }
    }
  };

  return (
    <section id="demonstracao" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center pb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          DEMONSTRAÇÃO & ACESSO
        </div>
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto">
          Conheça a NeuroAds em ação e <span className="text-[#FF5500]">solicite seu acesso.</span>
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-4 max-w-xl mx-auto">
          Assista ao vídeo demonstrativo de 2 minutos para ver os agentes trabalhando ao vivo, e preencha o formulário para garantir sua vaga exclusiva.
        </p>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Video Mockup */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7"
        >
          <div className="relative aspect-video rounded-[32px] overflow-hidden border border-[#EAEAEA] bg-slate-950 shadow-sm group cursor-pointer">
            {/* Mockup Dashboard Image background */}
            <Image
              src="/images/tools/diagnostico_lp.png"
              alt="Dashboard Demonstration preview"
              fill
              className="object-cover opacity-60 group-hover:scale-[1.02] transition-transform duration-700"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#FF5500] transition-all duration-300">
                <svg className="w-8 h-8 text-[#FF5500] group-hover:text-white transition-colors ml-1.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Video duration tag */}
            <span className="absolute bottom-6 right-6 bg-black/75 text-white font-extrabold text-[9px] px-3 py-1.5 rounded-full tracking-wider">
              2:14 MIN
            </span>
          </div>
        </motion.div>

        {/* Right Column: Request Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5"
        >
          <div className="bg-white border border-[#EAEAEA] rounded-[28px] p-8 flex flex-col justify-between relative shadow-sm">
            <h3 className="font-head font-extrabold text-black text-lg mb-2 text-left">
              Solicite seu acesso
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 text-left">
              Preencha os campos abaixo e entraremos em contato para liberar seu painel NeuroAds.
            </p>

            <AnimatePresence mode="wait">
              {!formSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25 focus:border-[#FF5500] text-xs font-bold transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      placeholder="voce@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25 focus:border-[#FF5500] text-xs font-bold transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Empresa</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome da sua empresa"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25 focus:border-[#FF5500] text-xs font-bold transition-all shadow-inner"
                    />
                  </div>

                  {/* Slide to Verify human challenge */}
                  <div className="relative w-full h-12 bg-[#EDF1F5] rounded-xl border border-slate-200/50 flex items-center justify-start px-1.5 overflow-hidden select-none mt-2 shadow-inner">
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pointer-events-none">
                      {slideProgress >= 100 ? 'Humano Confirmado' : 'DESLIZE PARA VERIFICAR'}
                    </span>
                    <div 
                      className="h-8 w-20 rounded-lg bg-gradient-to-r from-[#FF5500] to-[#FF7A00] flex items-center justify-center text-white text-base font-bold shadow-md select-none transition-all duration-75"
                      style={{ 
                        transform: `translateX(calc((100% - 92px) * ${slideProgress / 100}))`
                      }}
                    >
                      {slideProgress >= 100 ? '✓' : '→'}
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slideProgress}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSlideProgress(val);
                        if (val >= 100) {
                          setIsHuman(true);
                        }
                      }}
                      disabled={isHuman}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isHuman}
                    className={`w-full py-4 rounded-xl font-bold text-xs text-center transition-all shadow-sm mt-4 select-none ${
                      isHuman 
                        ? 'bg-black hover:bg-neutral-800 text-white cursor-pointer active:scale-[0.98]' 
                        : 'bg-[#EDF1F5] text-slate-400 cursor-not-allowed border border-slate-200/50'
                    }`}
                  >
                    Solicitar Acesso Completo
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
                    <CheckCircle2 size={32} className="stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-head font-extrabold text-slate-900 text-base">Solicitação enviada!</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed max-w-[240px] mx-auto">
                      Obrigado, {name.split(' ')[0]}. Nossa equipe entrará em contato em seu e-mail ({email}) para configurar seu onboarding.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
