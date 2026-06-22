 'use client';

import { useState, type FormEvent } from 'react';

export default function NewsletterSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Informe um e-mail válido.');
      setStatus('error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/hostinger-reach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source: 'alem-do-algoritmo' }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
      } else {
        const data = await res.json();
        setErrorMsg(data?.error || 'Erro ao cadastrar.');
        setStatus('error');
      }
    } catch (e) {
      setErrorMsg('Erro de conexão. Tente novamente mais tarde.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-[#252a34] bg-[#0d121b] p-6 shadow-[0_18px_38px_rgba(0,0,0,0.28)]">
      <h3 className="text-lg font-black text-white">Receba nossas atualizações</h3>
      <p className="mt-2 text-sm text-slate-400">Assine a newsletter semanal e receba insights direto no seu e-mail.</p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nome (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 rounded-xl border border-[#1f2937] bg-[#0b1318] px-3 text-sm text-white placeholder:text-slate-500"
        />

        <input
          type="email"
          placeholder="Seu melhor e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 rounded-xl border border-[#1f2937] bg-[#0b1318] px-3 text-sm text-white placeholder:text-slate-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black text-white ${
            loading ? 'bg-[#7a4b20] opacity-80' : 'bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500]'
          }`}
        >
          {loading ? 'Enviando...' : 'Assinar semanalmente'}
        </button>

        {status === 'success' && <p className="text-sm text-green-400">Obrigado! Verifique seu e-mail para confirmar.</p>}
        {status === 'error' && <p className="text-sm text-rose-400">{errorMsg}</p>}
      </form>
    </div>
  );
}
