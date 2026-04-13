'use client';

const problems = [
  {
    emoji: '💸',
    q: '"Invisto em anúncios todo mês, mas não sei se está dando resultado de verdade."',
    a: 'O dinheiro sai, os números do painel parecem bons, mas as vendas não batem com o que as métricas mostram. Isso acontece quando campanhas não têm rastreamento correto nem otimização contínua orientada por dados reais.',
    tag: 'Solução: Campanhas com Lucca',
    delay: ''
  },
  {
    emoji: '🔍',
    q: '"Meu concorrente aparece no Google. Eu não. E agora nem sei o que é essa tal IA de busca."',
    a: 'A visibilidade orgânica mudou. Além do Google tradicional, o ChatGPT, Gemini e Perplexity já respondem perguntas dos seus clientes — sem mostrar links. Se você não está nessas respostas, está invisível para metade do mercado.',
    tag: 'Solução: SEO + GEO',
    delay: 'd1'
  },
  {
    emoji: '⏳',
    q: '"Minha equipe perde horas com follow-up, qualificação e tarefas que poderiam ser automáticas."',
    a: 'Cada hora que um vendedor passa preenchendo planilha ou respondendo pergunta de FAQ é uma hora que ele não está fechando venda. A IA não substitui sua equipe — ela libera as pessoas para fazer o que só gente faz: relacionamento e fechamento.',
    tag: 'Solução: Agentes de IA',
    delay: 'd2'
  },
  {
    emoji: '🧩',
    q: '"Tenho agência de tráfego, agência de SEO e um cara de tecnologia — e eles não conversam entre si."',
    a: 'Quando cada fornecedor defende o seu próprio território, o resultado são dados contraditórios e ninguém responsável pelo número que importa: sua receita. Uma estratégia integrada por um único responsável muda completamente esse cenário.',
    tag: 'Solução: NeuroAds 3 em 1',
    delay: 'd3'
  }
];

export default function ProblemsSection() {
  return (
    <section className="py-20 lg:py-28 border-b border-black/10">
      <div className="max-w-[1160px] mx-auto px-10">
        <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-4 reveal">
          <span className="w-[18px] h-[1.5px] bg-green-brand" />
          O que me trazem
        </p>
        <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.01em] text-ink reveal">
          Quatro situações que <em className="italic text-green-brand font-medium">vejo todo dia</em><br />em empresas como a sua
        </h2>
        <p className="text-[1rem] text-ink2 font-light leading-[1.8] max-w-[540px] mt-5 reveal">
          Depois de trabalhar com centenas de PMEs, percebi que os problemas se repetem. Veja se algum te parece familiar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5px] bg-black/10 border border-black/10 rounded-[6px] overflow-hidden mt-14">
          {problems.map((p, i) => (
            <div key={i} className={`bg-cream p-9 transition-colors hover:bg-white reveal ${p.delay}`}>
              <span className="text-[1.5rem] mb-[1.1rem] block">{p.emoji}</span>
              <h3 className="font-serif text-[1.1rem] font-semibold text-ink mb-[0.7rem] leading-[1.45]">{p.q}</h3>
              <p className="text-[0.84rem] text-ink3 leading-[1.7] font-light">{p.a}</p>
              <div className="flex items-center gap-[0.35rem] mt-5 text-[0.68rem] font-semibold text-green-brand tracking-[0.08em] uppercase">
                <span className="text-[0.72rem]">→</span> {p.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
