'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { chatWithSupport } from '../../app/actions/chat-support';

type MessageRole = 'assistant' | 'user';
type SupportMessage = {
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

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'Cliente';
  const first = fullName.trim().split(/\s+/)[0];
  return first || 'Cliente';
}

export default function LuccaHubSupportWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'intro',
      role: 'assistant',
      text: `${getGreetingByHour()}! Eu sou o Lucca | Suporte. Posso te ajudar com indicadores, plano ativo e próximos passos da sua operação.`,
    },
  ]);

  const supportContext = useMemo(() => {
    const companyStorageKey = user ? `neuroads_company_profile_${user.uid}` : '';
    const connectorsStorageKey = user ? `neuroads_dashboard_connectors_${user.uid}` : '';
    const companyRaw = typeof window !== 'undefined' && companyStorageKey ? window.localStorage.getItem(companyStorageKey) : null;
    const connectorsRaw =
      typeof window !== 'undefined' && connectorsStorageKey ? window.localStorage.getItem(connectorsStorageKey) : null;

    let companyName = 'Empresa não cadastrada';
    let site = 'Site não cadastrado';
    if (companyRaw) {
      try {
        const parsed = JSON.parse(companyRaw) as { companyName?: string; site?: string };
        companyName = parsed.companyName?.trim() || companyName;
        site = parsed.site?.trim() || site;
      } catch {
        // fallback mantido
      }
    }

    const connectorDefaults = {
      googleAds: false,
      metaAds: false,
      ga4: false,
      serverTracking: false,
      crm: false,
      payments: false,
      warehouse: false,
    };
    let connectorStatus = connectorDefaults;
    if (connectorsRaw) {
      try {
        connectorStatus = { ...connectorDefaults, ...(JSON.parse(connectorsRaw) as Partial<typeof connectorDefaults>) };
      } catch {
        connectorStatus = connectorDefaults;
      }
    }

    const requiredTotal = Object.keys(connectorDefaults).length;
    const connectedRequired = Object.values(connectorStatus).filter(Boolean).length;
    const readinessPercent = Math.round((connectedRequired / requiredTotal) * 100);

    return {
      clientId: user?.uid || 'anon',
      clientName: getFirstName(user?.displayName || user?.email),
      companyName,
      site,
      planName: 'Pro Scale',
      activePage: pathname || '/hub',
      kpis: [],
      connectors: {
        connectedRequired,
        requiredTotal,
        readinessPercent,
      },
    };
  }, [pathname, user]);

  const appendMessage = (role: MessageRole, text: string, links?: Array<{ label: string; href: string }>) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, text, links }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    appendMessage('user', text);
    setInput('');
    setLoading(true);

    const history = [...messages, { id: 'tmp', role: 'user' as const, text }].map((item) => ({
      role: item.role,
      content: item.text,
    }));

    const result = await chatWithSupport(history, supportContext);

    if (!result.success) {
      appendMessage('assistant', result.error || 'Falha ao responder agora. Tente novamente em instantes.');
      setLoading(false);
      return;
    }

    appendMessage('assistant', result.content || 'Posso te ajudar com mais alguma informação?');

    if (Array.isArray(result.buttons) && result.buttons.length > 0) {
      const safeLinks = result.buttons
        .map((button) => ({
          label: String(button?.label || ''),
          href: String(button?.url || ''),
        }))
        .filter((item) => item.label && item.href);

      if (safeLinks.length > 0) {
        appendMessage('assistant', 'Atalhos recomendados:', safeLinks);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[300] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-white shadow-[0_14px_28px_rgba(255,90,0,0.35)] transition hover:brightness-105"
        aria-label="Abrir chat do Lucca Suporte"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen ? (
        <div className="fixed bottom-24 right-6 z-[320] w-[94vw] max-w-[430px] rounded-[24px] border border-[#E8ECF1] bg-white shadow-[0_24px_50px_rgba(15,23,42,0.25)]">
          <div className="flex items-center justify-between rounded-t-[24px] border-b border-[#E8ECF1] bg-[#FCFCFD] px-4 py-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-primary">Lucca | Suporte</p>
              <p className="text-xs text-[#4B5563]">Contexto do cliente ativo</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
              aria-label="Fechar chat"
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user' ? 'bg-[#111827] text-white' : 'border border-[#E5E7EB] bg-white text-[#1F2937]'
                  }`}
                >
                  <p>{message.text}</p>
                  {message.links && message.links.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.links.map((link) => (
                        <a
                          key={`${message.id}-${link.href}`}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[#FFD4B8] bg-[#FFF4EC] px-3 py-1 text-xs font-bold text-primary"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-b-[24px] border-t border-[#E8ECF1] bg-[#FCFCFD] px-4 py-3">
            <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pergunte ao Lucca sobre sua operação..."
                className="flex-1 bg-transparent text-sm text-[#1F2937] outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={loading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#3F66FF] text-white disabled:opacity-60"
                aria-label="Enviar mensagem"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
