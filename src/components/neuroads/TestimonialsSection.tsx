'use client';

const testimonials = [
  {
    stars: '★★★★★',
    text: '"Claudio é um profissional com grande entendimento da ferramenta. Trouxe muitos leads qualificados e ajudou na expansão da empresa em mercados que nem imaginávamos. A diferença antes e depois foi brutal, e o que mais valorizo é a comunicação direta — ele sempre explica o que está fazendo e por quê."',
    author: 'Carlos Eduardo',
    role: 'CEO — Empresa de Soluções Regulatórias',
    delay: ''
  },
  {
    stars: '★★★★★',
    text: '"Eu tinha tentado outras agências antes. Com a NeuroAds foi diferente desde o início — o Claudio olhou de verdade para o meu negócio, não fez proposta genérica. Hoje tenho clareza total do que está sendo feito com meu investimento, e os resultados aparecem todo mês."',
    author: 'Ana Paula',
    role: 'Diretora Comercial — Empresa B2B',
    delay: 'd1'
  },
  {
    stars: '★★★★★',
    text: '"O que mais me surpreendeu foi a integração entre os anúncios e a automação comercial. Nossa equipe de vendas passou a receber leads muito mais quentes — e o tempo de resposta caiu de horas para segundos. É a primeira vez que sinto que o marketing e o comercial trabalham juntos de verdade."',
    author: 'Rodrigo Motta',
    role: 'Sócio — Empresa de Serviços',
    delay: 'd2'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-10">
        <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-4 reveal">
          <span className="w-[18px] h-[1.5px] bg-green-brand" />
          O que dizem os clientes
        </p>
        <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.01em] text-ink reveal">
          Empresas que <em className="italic text-green-brand font-medium">cresceram</em><br />com a NeuroAds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5px] bg-black/10 border border-black/10 rounded-[6px] overflow-hidden mt-16">
          {testimonials.map((t, i) => (
            <div key={i} className={`bg-cream2 p-9 transition-colors hover:bg-white reveal ${t.delay}`}>
              <div className="text-amber text-[0.85rem] tracking-[0.05em] mb-4">{t.stars}</div>
              <p className="font-serif text-[0.975rem] text-ink2 leading-[1.8] italic font-medium mb-6">
                {t.text}
              </p>
              <div className="font-semibold text-[0.86rem] text-ink">{t.author}</div>
              <div className="text-[0.74rem] text-ink3 mt-1">{t.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
