'use client';

type ChannelKey = 'googleAds' | 'metaAds' | 'linkedinAds';

type ChannelConnectionHelpTooltipProps = {
  channel: ChannelKey;
};

function channelLabel(channel: ChannelKey): string {
  if (channel === 'googleAds') return 'Google Ads';
  if (channel === 'metaAds') return 'Meta Ads';
  return 'LinkedIn Ads';
}

function buildInstructions(channel: ChannelKey): string[] {
  const base = [
    'Clique em "Autenticar Canal".',
    'Faça login com o mesmo e-mail da sua sessão no Hub.',
    'Autorize as permissões solicitadas pela plataforma.',
    'Retorne para esta tela, preencha o ID da conta e clique em "Ativar Canal".',
  ];

  if (channel === 'googleAds') {
    return [
      ...base,
      'Se usar MCC, informe o "Login Customer ID (MCC)" para liberar a leitura correta da conta.',
    ];
  }

  return base;
}

export default function ChannelConnectionHelpTooltip({ channel }: ChannelConnectionHelpTooltipProps) {
  const instructions = buildInstructions(channel);
  const label = channelLabel(channel);

  return (
    <div className="group relative inline-flex">
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#D6DEE8] bg-white text-[13px] font-black text-[#475467] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBE94]"
        aria-label={`Como conectar ${label}`}
      >
        ?
      </button>

      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-[300px] -translate-x-1/2 rounded-xl border border-[#E4EAF2] bg-white p-3 text-left shadow-[0_16px_32px_rgba(15,23,42,0.14)] group-hover:block group-focus-within:block">
        <p className="text-xs font-black uppercase tracking-wide text-[#1D4ED8]">Como conectar {label}</p>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#475467]">
          {instructions.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-[6px] inline-flex h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
