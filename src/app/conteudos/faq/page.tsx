import type { Metadata } from 'next';
import StrategicContentPageShell, { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

export const metadata: Metadata = {
  title: 'FAQ NeuroAds | Perguntas Frequentes para PMEs',
  description:
    'FAQ da NeuroAds com respostas práticas sobre investimento, prazo, SEO + GEO, IA agêntica e execução comercial para PMEs.',
};

const content: StrategicContentPageData = {
  slug: 'conteudos-faq',
  eyebrow: 'Conteúdos NeuroAds',
  title: 'FAQ para empresários que querem',
  highlightedTitle: 'crescimento previsível sem achismo.',
  subtitle:
    'Aqui você encontra respostas diretas sobre operação, investimento e execução. O foco é tirar dúvida que trava decisão e transformar incerteza em próximo passo claro.',
  primaryCta: { label: 'Enviar minha dúvida', href: '/a-neuroads/contato' },
  secondaryCta: { label: 'Ver materiais de apoio', href: '/conteudos/materias-de-apoio' },
  highlights: [
    { title: 'Respostas objetivas', description: 'Sem enrolação e sem jargão solto.', icon: 'faq' },
    { title: 'Leitura financeira', description: 'Tudo traduzido para impacto em receita e margem.', icon: 'gauge' },
    { title: 'Foco em PME', description: 'Perguntas reais de quem já investe e quer escalar.', icon: 'goal' },
    { title: 'Próximo passo', description: 'Cada resposta aponta ação prática para evoluir.', icon: 'handshake' },
  ],
  sections: [
    {
      title: 'Dúvidas sobre resultado e investimento',
      description: 'As perguntas mais comuns antes de escalar orçamento e operação.',
      bullets: [
        'Como saber se o marketing está realmente gerando vendas?',
        'Quais indicadores priorizar além de volume de lead?',
        'Como reduzir desperdício sem perder crescimento?',
        'Quando aumentar investimento com segurança?',
      ],
    },
    {
      title: 'Dúvidas sobre método e operação',
      description: 'Questões práticas para alinhar equipe, processo e tecnologia.',
      bullets: [
        'Como integrar tráfego, SEO + GEO e comercial no mesmo sistema?',
        'Qual o papel da IA agêntica em uma PME?',
        'Como evitar depender de uma campanha isolada?',
        'Qual o primeiro passo para estruturar previsibilidade?',
      ],
    },
  ],
  resources: [
    {
      title: 'Nosso Método',
      description: 'Entenda o processo operacional usado para ganhar consistência.',
      href: '/a-neuroads/nosso-metodo',
    },
    {
      title: 'Além do Algoritmo',
      description: 'Canal editorial com visão aplicada para tomada de decisão.',
      href: '/conteudos/alem-do-algoritmo',
    },
    {
      title: 'Contato NeuroAds',
      description: 'Se sua dúvida é específica, envie seu cenário e receba orientação.',
      href: '/a-neuroads/contato',
    },
  ],
  faq: [
    {
      question: 'A NeuroAds garante resultado?',
      answer:
        'Não prometemos resultado garantido. Entregamos diagnóstico, execução disciplinada e otimização contínua para aumentar previsibilidade com dados reais.',
    },
    {
      question: 'Qual a diferença entre SEO e GEO na prática?',
      answer:
        'SEO melhora presença em buscadores tradicionais. GEO amplia presença em respostas de IA como ChatGPT, Gemini e Perplexity.',
    },
    {
      question: 'IA agêntica é viável para PME?',
      answer:
        'Sim, quando aplicada com objetivo claro. Ela reduz tarefas repetitivas, acelera resposta comercial e melhora consistência da operação.',
    },
    {
      question: 'Como vocês medem performance?',
      answer:
        'Com indicadores conectados ao negócio: CPL, custo de aquisição, taxa de conversão, receita incremental e margem operacional.',
    },
    {
      question: 'Em quanto tempo começo a ver evolução?',
      answer:
        'Depende do cenário atual. Normalmente os primeiros ganhos aparecem na eficiência e na qualidade da execução, antes da escala de volume.',
    },
    {
      question: 'Vocês trabalham só com tráfego pago?',
      answer:
        'Não. A proposta é ecossistema integrado: tráfego, SEO + GEO, funil de conversão e implantação de agentes de IA comercial.',
    },
    {
      question: 'Vou falar com especialista ou atendimento júnior?',
      answer: 'O atendimento é sênior e consultivo, com foco em decisão estratégica e clareza para o empresário.',
    },
    {
      question: 'Preciso de estrutura grande para começar?',
      answer: 'Não. O método é adaptado para equipes enxutas, priorizando o que gera impacto financeiro mais rápido.',
    },
  ],
  form: {
    title: 'Não encontrou sua pergunta?',
    description: 'Envie sua dúvida em contexto e nossa equipe retorna com direcionamento prático para sua operação.',
    ctaLabel: 'Enviar minha dúvida',
    flow: 'mensagem_livre',
    serviceContext: 'FAQ - Dúvida personalizada',
    successMessage: 'Dúvida enviada com sucesso. Retornaremos com orientação objetiva.',
    includeMessage: true,
  },
};

export default function Page() {
  return <StrategicContentPageShell data={content} />;
}

