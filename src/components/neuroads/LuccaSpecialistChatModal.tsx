'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Send, X } from 'lucide-react';
import Image from 'next/image';
import { chatWithSupport } from '../../app/actions/chat-support';
import { submitLuccaLeadAction } from '../../app/actions/lucca-leads';

type LuccaFlow = 'idle' | 'analise';
type MessageRole = 'assistant' | 'user';

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  links?: Array<{ label: string; href: string }>;
};

interface LuccaSpecialistChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoUserMessage?: string | null;
}

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

export default function LuccaSpecialistChatModal({
  isOpen,
  onClose,
  autoUserMessage,
}: LuccaSpecialistChatModalProps) {
  const hasAutoDemoRequest = Boolean(autoUserMessage?.trim());
  const introMessage: ChatMessage = {
    id: 'intro',
    role: 'assistant',
    text: `${getGreetingByHour()}! Eu sou o Lucca, Secretário Executivo da NeuroAds. Para começarmos, qual é o seu nome?`,
  };
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (!hasAutoDemoRequest) return [introMessage];
    return [
      introMessage,
      {
        id: 'auto-user',
        role: 'user',
        text: autoUserMessage?.trim() || '',
      },
      {
        id: 'auto-assistant',
        role: 'assistant',
        text: 'Perfeito. Para solicitar sua demonstração, me envie os dados cadastrais iniciais: Nome, Email, WhatsApp e Site da Empresa.',
      },
    ];
  });
  const [clientName, setClientName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(hasAutoDemoRequest);
  const [flow, setFlow] = useState<LuccaFlow>(hasAutoDemoRequest ? 'analise' : 'idle');
  const [freeText, setFreeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hideOptionCards] = useState(hasAutoDemoRequest);

  const [analysisForm, setAnalysisForm] = useState({ name: '', site: '', email: '', whatsapp: '' });

  const optionCards = useMemo(
    () => [
      { id: 'analise', title: 'Solicite uma Análise para sua empresa.' },
      { id: 'claudio', title: 'Contato com especialista | Claudio Müller.' },
    ],
    [],
  );

  if (!isOpen) return null;

  const appendMessage = (role: MessageRole, text: string, links?: Array<{ label: string; href: string }>) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, links }]);
  };

  const handleSelectOption = async (optionId: string) => {
    if (!isNameConfirmed) return;

    if (optionId === 'analise') {
      setFlow('analise');
      setAnalysisForm((prev) => ({ ...prev, name: clientName }));
      appendMessage('assistant', 'Perfeito. Para a análise inicial, me envie: Nome, Site da empresa, principal e-mail e WhatsApp.');
      return;
    }

    appendMessage(
      'assistant',
      'Perfeito. Você pode falar direto com o especialista Claudio Müller pelo link abaixo.',
      [{ label: 'Agendar atendimento com Claudio', href: 'https://cal.com/atendimento-neuroads/atendimento?overlayCalendar=true' }],
    );

    await submitLuccaLeadAction({
      flow: 'claudio',
      clientName: clientName || 'Lead sem nome',
      message: 'Cliente solicitou contato com especialista Claudio Müller.',
    });
  };

  const handleSubmitAnalysis = async () => {
    const normalizedName = analysisForm.name.trim() || clientName.trim();
    if (!normalizedName || !analysisForm.site.trim() || !analysisForm.email.trim() || !analysisForm.whatsapp.trim()) return;

    setLoading(true);
    const result = await submitLuccaLeadAction({
      flow: 'analise',
      clientName: normalizedName,
      site: analysisForm.site.trim(),
      email: analysisForm.email.trim(),
      whatsapp: analysisForm.whatsapp.trim(),
      message: hideOptionCards
        ? 'Solicitação de demonstração via Lucca Chat.'
        : 'Solicitação de análise via Lucca Chat.',
    });
    setLoading(false);

    if (!result.success) {
      appendMessage('assistant', `Não consegui concluir o registro agora: ${result.error}`);
      return;
    }

    setClientName(normalizedName);
    appendMessage(
      'assistant',
      'Dados recebidos e registrados no CRM da NeuroAds. Será enviado por email as instruções de acesso e detalhes para implantação.',
    );
    setFlow('idle');
    setAnalysisForm({ name: '', site: '', email: '', whatsapp: '' });
  };

  const handleSendFreeText = async () => {
    if (!freeText.trim()) return;
    const userText = freeText.trim();
    appendMessage('user', userText);
    setFreeText('');
    setLoading(true);

    const aiResult = await chatWithSupport(asHistory([...messages, { id: 'tmp', role: 'user', text: userText }]));

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
        .map((button) => ({
          label: String(button?.label || ''),
          href: String(button?.url || ''),
        }))
        .filter((item) => item.label && item.href);

      if (safeLinks.length > 0) {
        appendMessage('assistant', 'Atalhos recomendados:', safeLinks);
      }
    }

    await submitLuccaLeadAction({
      flow: 'mensagem_livre',
      clientName: clientName || 'Lead sem nome',
      message: userText,
    });

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-start justify-center overflow-y-auto bg-[#060d18]/72 px-3 py-3 backdrop-blur-[3px] sm:items-center sm:px-4 sm:py-5">
      <div className="relative flex h-[calc(100dvh-1.5rem)] min-h-[calc(100dvh-1.5rem)] w-full max-w-[980px] flex-col rounded-[22px] border border-[#e6e8ee] bg-[#f8f9fc] shadow-[0_35px_90px_rgba(0,0,0,0.35)] sm:h-[90vh] sm:min-h-0 sm:rounded-[26px]">
        <div className="flex items-center justify-between rounded-t-[22px] border-b border-[#e7ebf2] bg-white px-4 py-3 sm:rounded-t-[26px] sm:px-7 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#e1e6f0] bg-[#f3f6fb] shadow-[0_4px_12px_rgba(8,18,38,0.14)]">
              <Image
                src="/images/Avatar_Lucca_1000x1000.jpg"
                alt="Avatar do Lucca"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#ff6a00]">Lucca | Secretário Executivo</p>
              <p className="text-[13px] font-semibold text-[#1d2431]">Consultoria NeuroAds com IA agêntica</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dde3ef] bg-white text-[#556074] hover:bg-[#f2f5fb]"
            aria-label="Fechar chat do Lucca"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 sm:px-7 sm:py-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed sm:max-w-[82%] ${
                  message.role === 'user'
                    ? 'bg-[#0f172a] text-white'
                    : 'border border-[#e1e6f0] bg-white text-[#202a3a]'
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
                        className="inline-flex items-center gap-2 rounded-full border border-[#ffd9c2] bg-[#fff4ec] px-3 py-1.5 text-[12px] font-extrabold text-[#ff6a00]"
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

          {!isNameConfirmed && (
            <div className="rounded-2xl border border-[#e2e7f0] bg-white p-5">
              <label className="text-[13px] font-bold text-[#586173]">Qual é o seu nome?</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Digite seu nome"
                  className="flex-1 rounded-xl border border-[#d8deea] bg-white px-3 py-2.5 text-[15px] font-semibold text-[#1f2737] outline-none focus:border-[#ff8b41]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const normalizedName = clientName.trim();
                    if (!normalizedName) return;
                    setClientName(normalizedName);
                    setIsNameConfirmed(true);
                    appendMessage('assistant', `Prazer, ${normalizedName}.`);
                    appendMessage('assistant', 'Escolha uma opção para eu te ajudar agora:');
                  }}
                  className="rounded-xl bg-[#ff6a00] px-4 py-2 text-[12px] font-black text-white"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {isNameConfirmed && !hideOptionCards && (
            <div className="grid gap-2.5 md:grid-cols-3">
              {optionCards.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option.id)}
                  className="rounded-2xl border border-[#dce2ee] bg-white px-4 py-3.5 text-left text-[12px] font-bold text-[#263043] hover:border-[#ffcda8] hover:bg-[#fff7f1]"
                >
                  {option.title}
                </button>
              ))}
            </div>
          )}

          {flow === 'analise' && (
            <div className="rounded-2xl border border-[#e3e7f1] bg-white p-5 space-y-2.5">
              <input
                value={analysisForm.name}
                onChange={(event) => setAnalysisForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nome"
                className="w-full rounded-xl border border-[#d8deea] px-3 py-2.5 text-[15px] font-semibold text-[#1f2737] outline-none focus:border-[#ff8b41]"
              />
              <input
                value={analysisForm.site}
                onChange={(event) => setAnalysisForm((prev) => ({ ...prev, site: event.target.value }))}
                placeholder="Site da empresa"
                className="w-full rounded-xl border border-[#d8deea] px-3 py-2.5 text-[15px] font-semibold text-[#1f2737] outline-none focus:border-[#ff8b41]"
              />
              <input
                value={analysisForm.email}
                onChange={(event) => setAnalysisForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Principal e-mail"
                className="w-full rounded-xl border border-[#d8deea] px-3 py-2.5 text-[15px] font-semibold text-[#1f2737] outline-none focus:border-[#ff8b41]"
              />
              <input
                value={analysisForm.whatsapp}
                onChange={(event) => setAnalysisForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                placeholder="WhatsApp"
                className="w-full rounded-xl border border-[#d8deea] px-3 py-2.5 text-[15px] font-semibold text-[#1f2737] outline-none focus:border-[#ff8b41]"
              />
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmitAnalysis}
                className="rounded-xl bg-[#ff6a00] px-4 py-2 text-[12px] font-black text-white disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar dados para análise'}
              </button>
            </div>
          )}

        </div>

        <div className="rounded-b-[22px] border-t border-[#e7ebf2] bg-white px-4 py-3 sm:rounded-b-[26px] sm:px-7 sm:py-4">
          <div className="flex items-center gap-2 rounded-full border border-[#dbe1ec] bg-[#f5f7fb] px-3 py-2">
            <input
              value={freeText}
              onChange={(event) => setFreeText(event.target.value)}
              placeholder="Envie sua mensagem personalizada para o Lucca..."
              className="flex-1 bg-transparent text-[15px] font-medium text-[#253148] outline-none placeholder:text-[#8a94a6]"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSendFreeText();
                }
              }}
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleSendFreeText}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3f66ff] text-white disabled:opacity-60"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
