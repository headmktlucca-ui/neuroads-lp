'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHubTrialInfo } from '../../lib/hub-access';

/**
 * Faixa de período restante do Trial — renderiza APENAS para usuários que estão
 * de fato no período de teste (sem contratação paga) e cujo prazo não expirou.
 * Para clientes pagantes ou fora do trial, retorna null (nada é exibido).
 */
export default function HubTrialBanner() {
  const { profile } = useAuth();

  // Reavalia o tempo restante a cada minuto para manter o contador vivo.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const trial = useMemo(() => getHubTrialInfo(profile, now), [profile, now]);

  if (!trial.isTrialing) return null;

  const totalMs = 14 * 24 * 60 * 60 * 1000;
  const pct = Math.min(100, Math.max(4, ((totalMs - trial.msRemaining) / totalMs) * 100));

  // Últimas 48h → tom de urgência (âmbar); caso contrário, laranja da marca.
  const urgent = trial.msRemaining <= 48 * 60 * 60 * 1000;
  const accent = urgent ? '#D97706' : '#FF6A00';
  const accentLight = urgent ? '#FFFBEB' : '#FFF4ED';

  const remainingLabel =
    trial.daysRemaining > 1
      ? `${trial.daysRemaining} dias restantes`
      : trial.hoursRemaining > 1
        ? `${trial.hoursRemaining} horas restantes`
        : 'Último dia de teste';

  const endsDate = trial.trialEndsAt
    ? new Date(trial.trialEndsAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    : null;

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ background: '#FFFFFF', borderColor: '#E2E8F0' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accentLight }}
      >
        <Clock size={19} style={{ color: accent }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: accent }}>
            Período de teste
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ color: accent, background: accentLight }}
          >
            {remainingLabel}
          </span>
        </div>
        <p className="text-[13px] mt-1 leading-snug" style={{ color: '#475569' }}>
          {urgent
            ? 'Seu trial está acabando. Contrate para não perder o acesso ao Hub.'
            : 'Você está no trial gratuito.'}
          {endsDate ? <> Acesso ativo até <span style={{ color: '#0F172A', fontWeight: 700 }}>{endsDate}</span>.</> : null}
        </p>
        {/* Barra de progresso do trial */}
        <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, #FF8805)` }}
          />
        </div>
      </div>

      <Link
        href="/onboarding?step=plan"
        className="shrink-0 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-white text-[13px] font-bold transition-all duration-150 hover:scale-[1.02]"
        style={{ background: `linear-gradient(135deg, #F24900, #FF8805)` }}
      >
        <Sparkles size={14} />
        Ativar plano
      </Link>
    </div>
  );
}
