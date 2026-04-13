'use client';

export default function AboutSection() {
  return (
    <section className="bg-cream2 border-y border-black/10" id="claudio">
      <div className="max-w-[1160px] mx-auto px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-10 lg:gap-28 items-start py-20 lg:py-28">
          
          <div className="hidden lg:block relative reveal">
            <div className="w-full aspect-[3/4] rounded-[4px] overflow-hidden relative">
              <img 
                src="/images/05.jpeg" 
                alt="Claudio Müller Estrategista" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {['Google Ads Certified', 'Meta Blueprint', 'GA4 Advanced', '25 anos de mercado'].map((cert) => (
                <span key={cert} className="bg-cream border border-black/10 rounded-full py-[0.3rem] px-[0.85rem] text-[0.7rem] font-medium text-ink2">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-4 reveal">
              <span className="w-[18px] h-[1.5px] bg-green-brand" />
              Quem está por trás da NeuroAds
            </p>
            <h2 className="font-serif text-[clamp(2.2rem,3.5vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.01em] text-ink reveal">
              Claudio Müller —<br /><em className="italic text-green-brand font-medium">estrategista, não vendedor.</em>
            </h2>

            <p className="font-serif text-[1.65rem] font-medium leading-[1.45] text-ink mt-7 mb-7 italic reveal">
              "Eu não acredito em campanha como produto. Acredito em sistema como resultado."
            </p>

            <p className="text-[0.96rem] text-ink2 font-light leading-[1.9] mb-5 reveal">
              Com 25 anos de experiência em marketing digital, já passei por todas as fases do mercado — da era dos banners, pelo advento do Google Ads, pela explosão das redes sociais, e agora pela revolução da IA generativa. Cada ciclo me ensinou algo diferente: o que muda é a ferramenta, o que permanece é a necessidade de entender o negócio do cliente antes de qualquer coisa.
            </p>

            <p className="text-[0.96rem] text-ink2 font-light leading-[1.9] mb-5 reveal">
              Fundei a NeuroAds com um propósito claro: trazer para as PMEs brasileiras o nível de estratégia e tecnologia que costuma ficar restrito às grandes empresas. Não terceirizo. Não coloco estagiário pra gerenciar seu dinheiro. Cada conta passa por mim.
            </p>

            <div className="bg-green-light border-l-2 border-green-brand p-[1.25rem_1.5rem] rounded-r-[3px] my-8 reveal">
              <p className="text-[0.95rem] text-green-brand font-medium leading-[1.65]">
                A NeuroAds não é uma agência de tráfego. É um sistema integrado de crescimento que une campanhas pagas, visibilidade orgânica e automação comercial — sob uma única estratégia e um único responsável: eu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 pt-8 border-t border-black/10 reveal">
              <div>
                <div className="font-serif text-[2.4rem] font-bold text-ink leading-none">R$10<span className="text-green-brand">M+</span></div>
                <div className="text-[0.76rem] text-ink3 mt-2 leading-[1.4]">em campanhas gerenciadas com resultado comprovado</div>
              </div>
              <div>
                <div className="font-serif text-[2.4rem] font-bold text-ink leading-none">25<span className="text-green-brand">+</span></div>
                <div className="text-[0.76rem] text-ink3 mt-2 leading-[1.4]">anos de experiência em crescimento digital</div>
              </div>
              <div>
                <div className="font-serif text-[2.4rem] font-bold text-ink leading-none">3<span className="text-green-brand">em1</span></div>
                <div className="text-[0.76rem] text-ink3 mt-2 leading-[1.4]">soluções integradas sob uma única estratégia</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
