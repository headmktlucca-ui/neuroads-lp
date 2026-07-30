'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Gauge, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCreditUsage, type HubCreditUsage } from '../../lib/hub-credits';
import { getHubProfileSummary } from '../../lib/hub-profile';
import { HUB_BOOSTER, HUB_PLAN } from '../../data/hub-plan';
import BentoCard from './v2/BentoCard';

export default function CreditMeter({
  variant = 'default',
  isDark = false,
}: {
  variant?: 'default' | 'sidebar';
  isDark?: boolean;
}) {
  const { user, profile } = useAuth();
  const [usage, setUsage] = useState<HubCreditUsage | null>(null);
  const [isBoosterLoading, setIsBoosterLoading] = useState(false);
  const [boosterError, setBoosterError] = useState<string | null>(null);

  const isTrialing = useMemo(() => getHubProfileSummary(profile).isTrialing, [profile]);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setUsage(null);
      return;
    }

    getCreditUsage(user.uid, { isTrialing })
      .then((result) => {
        if (!cancelled) setUsage(result);
      })
      .catch(() => {
        if (!cancelled) setUsage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, isTrialing]);

  const handleBoosterCheckout = useCallback(async () => {
    if (!user?.uid || isBoosterLoading) return;

    try {
      setIsBoosterLoading(true);
      setBoosterError(null);

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: HUB_BOOSTER.stripe.priceId,
          userId: user.uid,
          email: user.email,
          returnUrl: window.location.origin + '/hub',
          mode: 'payment',
          kind: 'credito',
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setBoosterError(data.error || 'Não foi possível abrir o checkout.');
    } catch {
      setBoosterError('Não foi possível abrir o checkout.');
    } finally {
      setIsBoosterLoading(false);
    }
  }, [user?.uid, user?.email, isBoosterLoading]);

  const used = usage?.used ?? 0;
  const total = usage?.totalCredits ?? (isTrialing ? HUB_PLAN.trialCredits : HUB_PLAN.monthlyCredits);
  const ratio = usage?.ratio ?? 0;
  const isNearLimit = usage?.isNearLimit ?? false;
  const isExhausted = usage?.isExhausted ?? false;
  const barColor = isExhausted ? '#dc2626' : isNearLimit ? '#d97706' : '#FF6A00';

  if (variant === 'sidebar') {
    return (
      <div 
        className={`rounded-2xl p-3 mx-2 mb-2.5 border transition-all duration-200 ${
          isDark 
            ? 'bg-white/10 border-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]' 
            : 'bg-white/70 border-slate-200/60 text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),2px_2px_5px_#d1d9e6,-2px,-2px,5px,#ffffff]'
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Gauge size={13} className={isDark ? 'text-white/80' : 'text-[#FF6A00]'} />
            <span className={`text-[10px] font-black uppercase tracking-wider truncate ${isDark ? 'text-white/90' : 'text-slate-600'}`}>
              {isTrialing ? 'Créditos de Teste' : 'Créditos do Plano'}
            </span>
          </div>
          <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded shrink-0 ${
            isDark ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
          }`}>
            {usage ? `${usage.remaining}` : '—'} sob
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-1.5">
          <p className="text-[16px] font-black font-mono leading-none">
            {used}
            <span className={`text-[11px] font-semibold ${isDark ? 'text-white/60' : 'text-slate-400'}`}> / {total}</span>
          </p>
          <p className={`text-[9px] font-medium ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            ciclo {usage?.cycleKey ?? getCycleLabel()}
          </p>
        </div>

        <div
          className={`h-1.5 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={used}
          aria-label="Consumo de créditos do ciclo"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(ratio * 100)}%`, background: isDark ? (isExhausted ? '#ef4444' : '#fff') : barColor }}
          />
        </div>

        {(isNearLimit || isExhausted) && (
          <div className="mt-2 space-y-1.5">
            <p className={`text-[9px] font-bold leading-snug ${isDark ? 'text-white/85' : ''}`} style={isDark ? {} : { color: barColor }}>
              {isExhausted
                ? 'Créditos esgotados!'
                : `${Math.round(ratio * 100)}% consumidos.`}
            </p>
            {isTrialing ? (
              <Link
                href="/onboarding?step=plan"
                className="w-full flex items-center justify-center gap-1 rounded-lg bg-orange-500 hover:bg-orange-600 px-2 py-1 text-[9px] font-black text-white transition-colors"
              >
                <Zap size={9} />
                Assinar Plano
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleBoosterCheckout}
                disabled={isBoosterLoading}
                className="w-full flex items-center justify-center gap-1 rounded-lg bg-orange-500 hover:bg-orange-600 px-2 py-1 text-[9px] font-black text-white transition-colors disabled:opacity-60"
              >
                <Zap size={9} />
                {isBoosterLoading ? 'Carregando…' : 'Comprar Booster'}
              </button>
            )}
            {boosterError && <p className="text-[8px] font-bold text-red-500 leading-none mt-1">{boosterError}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <BentoCard variant="neumorphic" className="flex flex-col" glowColor="rgba(255, 106, 0, 0.04)">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/40">
        <Gauge size={15} className="text-[#FF6A00]" />
        <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">
          {isTrialing ? 'Créditos de Teste' : 'Créditos do Plano'}
        </span>
        <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
          {usage ? `${usage.remaining} restantes` : '—'}
        </span>
      </div>

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[22px] font-black text-[#0f172a] font-mono leading-none">
            {used}
            <span className="text-[13px] text-slate-400 font-semibold"> / {total}</span>
          </p>
          <p className="text-[11px] font-bold text-slate-400">ciclo {usage?.cycleKey ?? getCycleLabel()}</p>
        </div>

        <div
          className="h-2.5 w-full rounded-full border border-white/40 bg-[#eef2f7]"
          style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={used}
          aria-label="Consumo de créditos do ciclo"
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(ratio * 100)}%`, background: barColor }}
          />
        </div>

        {isTrialing && (
          <p className="text-[11px] font-semibold leading-snug text-slate-500">
            Período de teste: {HUB_PLAN.trialCredits} créditos para experimentar os agentes. A
            assinatura libera {HUB_PLAN.monthlyCredits} créditos por mês.
          </p>
        )}

        {(isNearLimit || isExhausted) && (
          <div className="space-y-2">
            <p className="text-[12px] font-semibold leading-snug" style={{ color: barColor }}>
              {isExhausted
                ? isTrialing
                  ? 'Créditos de teste esgotados. Assine para continuar operando com os agentes.'
                  : 'Créditos do ciclo esgotados. Novas execuções entram na fila do próximo ciclo.'
                : `Você já usou ${Math.round(ratio * 100)}% dos créditos ${isTrialing ? 'de teste' : 'deste ciclo'}.`}
            </p>
            {isTrialing ? (
              <Link
                href="/onboarding?step=plan"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-[#FF6A00] px-3 py-2 text-[12px] font-black text-white transition-opacity hover:opacity-90"
              >
                <Zap size={13} />
                Assinar e liberar {HUB_PLAN.monthlyCredits} créditos/mês
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleBoosterCheckout}
                disabled={isBoosterLoading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-[#FF6A00] px-3 py-2 text-[12px] font-black text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Zap size={13} />
                {isBoosterLoading
                  ? 'Abrindo checkout…'
                  : `${HUB_BOOSTER.name} — R$ ${(HUB_BOOSTER.priceCents / 100).toLocaleString('pt-BR')}`}
              </button>
            )}
            {boosterError && <p className="text-[11px] font-bold text-red-600">{boosterError}</p>}
          </div>
        )}
      </div>
    </BentoCard>
  );
}

function getCycleLabel(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
