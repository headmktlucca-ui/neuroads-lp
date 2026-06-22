'use client';

import React, { useState } from 'react';
import {
  Users, UserPlus, Mail, Shield, ShieldCheck, Crown,
  MoreHorizontal, CheckCircle2, Clock, X, Search, Send,
} from 'lucide-react';

type Role = 'admin' | 'editor' | 'viewer';

const ROLE_CONFIG: Record<Role, { label: string; desc: string; icon: React.ElementType; cls: string }> = {
  admin:  { label: 'Admin',        desc: 'Acesso total',           icon: Crown,       cls: 'text-[#FF6A00] bg-[#FF6A00]/10 border-[#FF6A00]/20' },
  editor: { label: 'Editor',       desc: 'Edita e executa',        icon: ShieldCheck, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  viewer: { label: 'Visualizador', desc: 'Somente leitura',        icon: Shield,      cls: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

type Member = { id: number; name: string; email: string; role: Role; status: 'active' | 'pending'; avatar: string; joinedAt: string };

const INITIAL_MEMBERS: Member[] = [
  { id: 1, name: 'Você',            email: 'avante@neuroads.com.br', role: 'admin',  status: 'active',  avatar: 'VN', joinedAt: 'Jan 2026' },
  { id: 2, name: 'Ana Ferreira',    email: 'ana@empresa.com.br',     role: 'editor', status: 'active',  avatar: 'AF', joinedAt: 'Mar 2026' },
  { id: 3, name: 'Carlos Mendes',   email: 'carlos@empresa.com.br',  role: 'viewer', status: 'active',  avatar: 'CM', joinedAt: 'Mai 2026' },
  { id: 4, name: 'Beatriz Santos',  email: 'bia@empresa.com.br',     role: 'editor', status: 'pending', avatar: 'BS', joinedAt: '—' },
];

const AVATAR_COLORS = ['bg-[#FF6A00]/20', 'bg-emerald-500/20', 'bg-slate-500/20', 'bg-purple-500/20', 'bg-amber-500/20'];

export default function HubTimesPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('editor');
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember: Member = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'pending',
      avatar: inviteEmail.slice(0, 2).toUpperCase(),
      joinedAt: '—',
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
    setShowInvite(false);
  };

  const changeRole = (id: number, role: Role) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    setOpenMenu(null);
  };

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setOpenMenu(null);
  };

  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header className="py-8 border-b border-white/[0.06] mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_6px_rgba(255,106,0,0.8)] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Times</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Sua Equipe</h1>
            <p className="text-[#8fa0b5] text-[15px] mt-2 max-w-xl leading-relaxed">
              Adicione membros da sua equipe ou de clientes para colaborar no Hub com permissões personalizadas.
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white font-bold text-[14px] transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Convidar membro
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Membros ativos',    value: activeCount,  icon: Users,        color: 'text-[#FF6A00]',   glow: 'rgba(255,106,0,0.1)' },
          { label: 'Convites pendentes', value: pendingCount, icon: Clock,        color: 'text-amber-400',   glow: 'rgba(251,191,36,0.1)' },
          { label: 'Limite do plano',   value: '10 membros', icon: ShieldCheck,  color: 'text-emerald-400', glow: 'rgba(52,211,153,0.1)' },
        ].map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0d1a2a]/40 border border-[#FF6A00]/20 backdrop-blur-md relative overflow-hidden group hover:bg-[#0d1a2a]/60 hover:border-[#FF6A00]/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: kpi.glow }} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-[13px] font-medium text-[#8fa0b5]">{kpi.label}</p>
                <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal convidar */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0d1a2a] border border-[#FF6A00]/20 shadow-[0_32px_80px_rgba(0,0,0,0.7)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-black text-white">Convidar membro</h2>
              <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#8fa0b5] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#8fa0b5] mb-1.5">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colega@empresa.com"
                    required
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#8fa0b5] mb-1.5">Nível de acesso</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setInviteRole(key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        inviteRole === key
                          ? 'border-[#FF6A00]/50 bg-[#FF6A00]/10'
                          : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <cfg.icon className={`w-4 h-4 ${inviteRole === key ? 'text-[#FF6A00]' : 'text-[#8fa0b5]'}`} />
                      <span className={`text-[11px] font-bold ${inviteRole === key ? 'text-white' : 'text-[#8fa0b5]'}`}>{cfg.label}</span>
                      <span className="text-[10px] text-[#8fa0b5]">{cfg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white font-bold text-[14px] transition-all shadow-[0_0_20px_rgba(255,106,0,0.25)] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Enviar convite
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tabela de membros */}
      <div className="rounded-2xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#FF6A00]" />
            <h2 className="text-[15px] font-bold text-white">Membros ({members.length})</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar membro..."
              className="h-9 w-52 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-8 pr-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/40 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {filtered.map((member, idx) => {
            const role = ROLE_CONFIG[member.role];
            const isOwner = member.id === 1;
            return (
              <div key={member.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors group relative">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} ${
                    member.role === 'admin' ? 'text-[#FF6A00]' : member.role === 'editor' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-white">{member.name}</p>
                      {isOwner && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/20">Você</span>}
                    </div>
                    <p className="text-[12px] text-[#8fa0b5]">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Status */}
                  {member.status === 'pending' ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Clock className="w-3.5 h-3.5" /> Pendente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                    </span>
                  )}

                  {/* Role badge */}
                  <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${role.cls}`}>
                    <role.icon className="w-3.5 h-3.5" />
                    {role.label}
                  </span>

                  {/* Menu */}
                  {!isOwner && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#8fa0b5] hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenu === member.id && (
                        <div className="absolute right-0 top-8 z-20 w-44 rounded-2xl bg-[#0d1a2a] border border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden">
                          <div className="p-1.5">
                            <p className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#8fa0b5]">Alterar papel</p>
                            {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([key, cfg]) => (
                              <button
                                key={key}
                                onClick={() => changeRole(member.id, key)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold transition-colors hover:bg-white/[0.06] ${
                                  member.role === key ? 'text-[#FF6A00]' : 'text-white/70 hover:text-white'
                                }`}
                              >
                                <cfg.icon className="w-3.5 h-3.5" />
                                {cfg.label}
                                {member.role === key && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-white/[0.06] p-1.5">
                            <button
                              onClick={() => removeMember(member.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Remover membro
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela de permissões */}
      <div className="rounded-2xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-[15px] font-bold text-white">Permissões por papel</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#8fa0b5]">Recurso</th>
                {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([key, cfg]) => (
                  <th key={key} className="px-5 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg border ${cfg.cls}`}>
                      <cfg.icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {[
                ['Ver Dashboard', true, true, true],
                ['Gerenciar Agentes IA', true, true, false],
                ['Criar Automações', true, true, false],
                ['Conectar Integrações', true, true, false],
                ['Convidar Membros', true, false, false],
                ['Gerenciar Faturamento', true, false, false],
                ['Acessar API Keys', true, false, false],
              ].map(([label, admin, editor, viewer], i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-[#8fa0b5]">{label as string}</td>
                  {[admin, editor, viewer].map((allowed, j) => (
                    <td key={j} className="px-5 py-3 text-center">
                      {allowed
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <X className="w-4 h-4 text-white/20 mx-auto" />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
