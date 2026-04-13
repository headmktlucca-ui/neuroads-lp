'use client';

export default function CTASection() {
  return (
    <section className="bg-ink py-20 lg:py-28 relative overflow-hidden" id="contato">
      {/* Background glow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(110,226,168,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          <div>
            <p className="flex items-center gap-[0.6rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-bright mb-4">
              <span className="w-[18px] h-[1.5px] bg-green-bright" />
              Próximo passo
            </p>
            <h2 className="font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] font-bold leading-[1.1] tracking-[-0.01em] text-cream mb-5">
              Vamos conversar sobre<br />
              o <em className="italic text-green-bright font-medium">crescimento real</em><br />
              da sua empresa?
            </h2>
            <p className="text-[0.97rem] text-white/55 font-light leading-[1.8]">
              O diagnóstico é gratuito, dura 30 minutos e já sai com clareza sobre o que está funcionando, o que está desperdiçando seu dinheiro e onde está a maior oportunidade de crescimento.
            </p>
            <ul className="list-none mt-8 flex flex-col gap-2.5">
              {[
                'Análise das suas campanhas atuais (se houver)',
                'Diagnóstico da sua visibilidade no Google e nas IAs',
                'Identificação do principal gargalo no seu comercial',
                'Recomendações práticas que você pode usar agora'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[0.87rem] text-white/60 leading-normal">
                  <span className="text-green-bright font-bold flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-white/[0.07]">
              <div className="w-[52px] h-[52px] rounded-full bg-green-bright/10 border border-green-bright/15 flex items-center justify-center font-serif font-bold text-green-bright text-[1.1rem] flex-shrink-0">
                CM
              </div>
              <div>
                <div className="font-semibold text-[0.9rem] text-cream">Claudio Müller</div>
                <div className="text-[0.74rem] text-white/40 mt-0.5">Você fala diretamente comigo. Sem intermediários.</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[6px] p-8 lg:p-10 border border-white/5 shadow-2xl">
            <h3 className="font-serif text-[1.4rem] font-bold text-ink mb-1.5">Solicite seu diagnóstico gratuito</h3>
            <p className="text-[0.8rem] text-ink3 mb-7 leading-normal">Sem compromisso. Preencha abaixo e entrarei em contato em até 2 horas úteis.</p>

            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-semibold text-ink2 tracking-[0.05em] uppercase">Seu nome</label>
                <input type="text" className="w-full p-[0.8rem_1rem] border-[1.5px] border-black/10 rounded-[3px] font-sans text-[0.88rem] text-ink bg-white outline-none focus:border-green-brand transition-colors placeholder:text-ink3/55" placeholder="Como prefere ser chamado?" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-semibold text-ink2 tracking-[0.05em] uppercase">Nome da empresa</label>
                <input type="text" className="w-full p-[0.8rem_1rem] border-[1.5px] border-black/10 rounded-[3px] font-sans text-[0.88rem] text-ink bg-white outline-none focus:border-green-brand transition-colors placeholder:text-ink3/55" placeholder="Empresa ou nome do negócio" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-semibold text-ink2 tracking-[0.05em] uppercase">Seu WhatsApp</label>
                <input type="tel" className="w-full p-[0.8rem_1rem] border-[1.5px] border-black/10 rounded-[3px] font-sans text-[0.88rem] text-ink bg-white outline-none focus:border-green-brand transition-colors placeholder:text-ink3/55" placeholder="(00) 00000-0000" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] font-semibold text-ink2 tracking-[0.05em] uppercase">Seu maior desafio hoje</label>
                <select className="w-full p-[0.8rem_1rem] border-[1.5px] border-black/10 rounded-[3px] font-sans text-[0.88rem] text-ink bg-white outline-none appearance-none cursor-pointer focus:border-green-brand transition-colors bg-[url('data:image/svg+xml,%3Csvg_xmlns=%22http://www.w3.org/2000/svg%22_width=%2212%22_height=%228%22_viewBox=%220_0_12_8%22%3E%3Cpath_d=%22M1_1l5_5_5-5%22_stroke=%22%237A6F63%22_stroke-width=%221.5%22_fill=%22none%22_stroke-linecap=%22round%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]">
                  <option value="" disabled selected>Selecione a situação mais próxima</option>
                  <option>Quero gerar mais leads com anúncios</option>
                  <option>Preciso reduzir o custo por cliente</option>
                  <option>Quero aparecer no Google e nas IAs</option>
                  <option>Quero automatizar meu operacional comercial</option>
                  <option>Preciso das três coisas</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-green-brand text-white font-sans font-bold text-[0.9rem] p-4 rounded-[3px] cursor-pointer mt-2 transition-all hover:bg-green-medium hover:-translate-y-[1px] tracking-[0.02em]">
                Quero falar com o Claudio →
              </button>
              <p className="text-center text-[0.74rem] text-ink3 mt-4 leading-normal">
                Prefere ir direto? <a href="#" className="color-green-brand no-underline font-semibold hover:underline">Chame no WhatsApp agora</a>.<br />
                Sem spam. Suas informações são tratadas com sigilo.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
