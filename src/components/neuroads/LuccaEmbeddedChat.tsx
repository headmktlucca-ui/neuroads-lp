'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowRight, Send, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { chatWithSupport } from '../../app/actions/chat-support';
import { submitLuccaLeadAction } from '../../app/actions/lucca-leads';
import { sendPersonalizedPresentationAction } from '../../app/actions/send-presentation';
import { type Agent as CatalogAgent } from '../../data/agents';

type MessageRole = 'assistant' | 'user' | 'system';

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  links?: Array<{ label: string; href: string }>;
};

function getGreetingByHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function asHistory(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.text,
  }));
}

interface SlotsState {
  aquisicao: CatalogAgent | null;
  conversao: CatalogAgent | null;
  escala: CatalogAgent | null;
}

export default function LuccaEmbeddedChat({ slots }: { slots: SlotsState }) {
  const introMessage: ChatMessage = {
    id: 'intro',
    role: 'assistant',
    text: `${getGreetingByHour()}! Eu sou o Lucca, Secretário Executivo da NeuroAds.`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    introMessage,
    { id: 'intro-q', role: 'assistant', text: 'Para começarmos a montar sua estratégia, vá selecionando os Agentes desejados nos slots ao lado. Vou te orientar nesse passo a passo.' }
  ]);

  const previousSlotsCountRef = useRef(0);

  const [clientName, setClientName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const optionCards = useMemo(
    () => [
      { id: 'analise', title: 'Solicite uma Análise' },
      { id: 'claudio', title: 'Contato com Especialista' },
    ],
    []
  );

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const currentCount = [slots.aquisicao, slots.conversao, slots.escala].filter(Boolean).length;
    const prevCount = previousSlotsCountRef.current;

    if (currentCount > prevCount) {
      if (currentCount === 1) {
        appendMessage('assistant', 'Ótima escolha para o primeiro slot! Agora, selecione um Agente para a próxima etapa.');
      } else if (currentCount === 2) {
        appendMessage('assistant', 'Perfeito! Falta apenas um Agente para completarmos o seu time estratégico.');
      } else if (currentCount === 3) {
        setIsNameConfirmed(true); // Automatically advance the flow since agents are selected
        appendMessage('assistant', '🔥 Time completo ativado! Para que eu possa analisar e gerar seus insights executivos pontuais, por favor, me envie a URL principal do site da sua empresa e o seu e-mail abaixo.');
      }
    }
    previousSlotsCountRef.current = currentCount;
  }, [slots.aquisicao, slots.conversao, slots.escala]);

  const appendMessage = (role: MessageRole, text: string, links?: Array<{ label: string; href: string }>) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, links }]);
  };

  const processChatInteraction = async (userText: string) => {
    appendMessage('user', userText);
    setLoading(true);

    const activeAgentsMsg = `[Contexto do Sistema: O usuário selecionou os agentes: Aquisição: ${slots.aquisicao?.title || 'nenhum'}, Conversão: ${slots.conversao?.title || 'nenhum'}, Escala: ${slots.escala?.title || 'nenhum'}. Gere 2 a 3 insights executivos PONTUAIS DE ALTO IMPACTO baseados nestes agentes. Se o usuário fornecer e-mail e URL, avise que a apresentação detalhada foi enviada para o e-mail.]`;

    const historyWithContext = [
      { id: 'ctx', role: 'system' as MessageRole, text: activeAgentsMsg },
      ...messages,
      { id: 'tmp', role: 'user' as MessageRole, text: userText }
    ];

    const aiResult = await chatWithSupport(asHistory(historyWithContext));

    if (!aiResult.success) {
      setLoading(false);
      appendMessage('assistant', aiResult.error || 'Não consegui responder agora. Tente novamente em instantes.');
      return;
    }

    if (aiResult.clientName && !clientName) {
      setClientName(aiResult.clientName);
    }

    appendMessage('assistant', aiResult.content || 'Posso te ajudar com mais alguma etapa?');

    if (Array.isArray(aiResult.buttons) && aiResult.buttons.length > 0) {
      const safeLinks = aiResult.buttons
        .map((button: any) => ({
          label: String(button?.label || ''),
          href: String(button?.url || ''),
        }))
        .filter((item: any) => item.label && item.href);

      if (safeLinks.length > 0) {
        appendMessage('assistant', 'Acesse o link abaixo:', safeLinks);
      }
    }

    await submitLuccaLeadAction({
      flow: 'mensagem_livre',
      clientName: aiResult.clientName || clientName || 'Lead sem nome',
      message: userText,
    });

    if (aiResult.leadData && aiResult.leadData.email && aiResult.leadData.url) {
       appendMessage('assistant', 'Preparando e enviando sua apresentação...');
       
       const sendResult = await sendPersonalizedPresentationAction({
         email: aiResult.leadData.email,
         url: aiResult.leadData.url,
         clientName: aiResult.clientName || clientName,
         historyContext: asHistory(historyWithContext).map(m => m.content).join(' | '),
       });

       if (sendResult.success) {
         appendMessage('assistant', '✅ Apresentação personalizada enviada com sucesso para o seu e-mail! Em breve nossos especialistas farão contato.');
       } else {
         appendMessage('assistant', '⚠️ Tivemos um pequeno problema ao enviar o e-mail, mas seus dados já estão com nosso time.');
       }
    }

    setLoading(false);
  };

  const handleSelectOption = async (optionId: string) => {
    if (!isNameConfirmed) return;

    if (optionId === 'analise') {
      processChatInteraction('Gostaria de solicitar uma análise para minha empresa.');
      return;
    }

    appendMessage(
      'assistant',
      'Perfeito. Você pode falar direto com o especialista Claudio Müller pelo link abaixo.',
      [{ label: 'Agendar atendimento com Claudio', href: 'https://cal.com/atendimento-neuroads/atendimento?overlayCalendar=true' }]
    );

    await submitLuccaLeadAction({
      flow: 'claudio',
      clientName: clientName || 'Lead sem nome',
      message: 'Cliente solicitou contato com especialista Claudio Müller.',
    });
  };

  const handleSendFreeText = () => {
    if (!freeText.trim()) return;
    const text = freeText;
    setFreeText('');
    processChatInteraction(text);
  };

  return (
    <div className="rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/85 backdrop-blur-xl p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col h-[520px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6a00]/5 filter blur-[50px] rounded-full pointer-events-none" />
      
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-[#ff6a00]/15 pb-4 mb-5 shrink-0">
        <div className="relative">
          <Image
            src="/images/Avatar_Lucca_Novo.jpeg"
            alt="Lucca IA"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover border-2 border-[#ff6a00]/50"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">Lucca</p>
          <p className="text-[10px] text-[#ff8f3a] font-mono uppercase tracking-wide">Agente Estratégico NeuroAds</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400">ONLINE</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 space-y-4 overflow-y-auto scrollbar-none pr-1 pb-4"
      >
        {messages.filter(m => m.role !== 'system').map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <Image
                src="/images/Avatar_Lucca_Novo.jpeg"
                alt="Lucca"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover border border-[#ff6a00]/30 shrink-0 mt-0.5 mr-3"
              />
            )}
            <div
              className={`max-w-[85%] rounded-[16px] px-4 py-3 text-xs leading-relaxed ${
                message.role === 'user'
                  ? 'bg-[#ff6a00] text-white rounded-tr-[4px]'
                  : 'bg-zinc-900/60 border border-[#ff6a00]/10 text-slate-300 rounded-tl-[4px]'
              }`}
            >
              <p>{message.text}</p>
              {message.links && message.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.links.map((link) => (
                    <a
                      key={`${message.id}-${link.href}`}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1.5 text-[11px] font-extrabold text-[#ff8f3a] hover:bg-[#ff6a00]/20 transition-colors"
                    >
                      {link.label}
                      <ArrowRight size={11} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <Image
              src="/images/Avatar_Lucca_Novo.jpeg"
              alt="Lucca"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover border border-[#ff6a00]/30 shrink-0 mt-0.5"
            />
            <div className="bg-zinc-900/60 border border-[#ff6a00]/10 rounded-[16px] rounded-tl-[4px] px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#ff8f3a]" />
              <span className="text-xs font-semibold text-slate-400">Lucca está digitando...</span>
            </div>
          </div>
        )}

        {!isNameConfirmed && !loading && messages.length <= 4 && (
          <div className="bg-zinc-900/40 border border-white/5 rounded-[16px] p-4 mt-2 ml-11">
            <p className="text-xs font-bold text-[#ff8f3a] animate-pulse mb-1">
              Aguardando seleção dos agentes...
            </p>
            <p className="text-xs text-slate-400">
              Complete os 3 slots ao lado para liberar a análise estratégica do seu time.
            </p>
          </div>
        )}

        {isNameConfirmed && !loading && messages.length <= 4 && (
          <div className="grid gap-2 mt-2 ml-11">
            {optionCards.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                className="rounded-xl border border-white/10 bg-zinc-900/40 px-4 py-3 text-left text-xs font-bold text-slate-300 hover:border-[#ff6a00]/50 hover:bg-zinc-900 transition-colors"
              >
                {option.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      {isNameConfirmed && (
        <div className="mt-2 border-t border-[#ff6a00]/15 pt-4 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFreeText();
                }
              }}
              placeholder="Envie sua mensagem para o Lucca..."
              className="w-full rounded-full border border-white/10 bg-zinc-900/60 py-3.5 pl-5 pr-14 text-xs text-white placeholder-slate-500 outline-none focus:border-[#ff6a00]/50"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleSendFreeText}
              disabled={loading || !freeText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6a00] text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={14} className="ml-[-2px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
