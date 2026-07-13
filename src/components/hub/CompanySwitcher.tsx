'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Check,
  ChevronDown,
  Globe,
  AtSign,
  Briefcase,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Company, CompanyFormData } from '../../types/company-types';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';

/* ─── Helpers ──────────────────────────────────────────────────────── */

function getCompanyInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getCompanyColor(name: string): string {
  const colors = [
    'from-[#FF6A00] to-[#FF8805]',
    'from-[#c24010] to-[#FF6A00]',
    'from-[#7a2500] to-[#c24010]',
    'from-[#e85f22] to-[#FF8340]',
    'from-[#FF8805] to-[#FFa34d]',
  ];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[index % colors.length];
}

/* ─── Empty form factory ──────────────────────────────────────────── */
const EMPTY_FORM: CompanyFormData = {
  companyName: '',
  site: HTTPS_PREFIX,
  instagram: '',
  linkedin: '',
  tiktok: '',
  blog: '',
  whatsapp: '',
};

/* ─── CompanySwitcher ─────────────────────────────────────────────── */
interface CompanySwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  isDark?: boolean;
}

export default function CompanySwitcher({
  isOpen,
  onClose,
  anchorRef,
  isDark = true,
}: CompanySwitcherProps) {
  const { userCompanies, activeCompanyId, setActiveCompany, createCompany, updateCompany } =
    useAuth();

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Reset mode when panel closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setMode('list');
        setForm(EMPTY_FORM);
        setEditingCompany(null);
        setError(null);
      }, 250);
    }
  }, [isOpen]);

  /* ── Handlers ── */
  const handleSelect = async (id: string) => {
    await setActiveCompany(id);
    onClose();
  };

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setForm(EMPTY_FORM);
    setError(null);
    setMode('create');
  };

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    setForm({
      companyName: company.companyName,
      site: company.site || HTTPS_PREFIX,
      instagram: company.instagram || '',
      linkedin: company.linkedin || '',
      tiktok: company.tiktok || '',
      blog: company.blog || '',
      whatsapp: company.whatsapp || '',
    });
    setError(null);
    setMode('edit');
  };

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      setError('Informe o nome da empresa.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const data: CompanyFormData = {
        ...form,
        site:
          isHttpsPlaceholderOnly(form.site) ? '' : normalizeHttpsMaskedUrlInput(form.site),
      };
      if (mode === 'create') {
        await createCompany(data);
      } else if (mode === 'edit' && editingCompany) {
        await updateCompany(editingCompany.id, data);
      }
      setMode('list');
    } catch (err) {
      setError('Erro ao salvar. Tente novamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  /* ── Styles ── */
  const panelBg = isDark
    ? 'bg-[#1a0a00] border-white/10'
    : 'bg-[#eef2f7] border-white/80';

  const inputClass = isDark
    ? 'w-full h-10 rounded-xl border border-white/10 bg-white/5 px-3.5 text-[13px] font-semibold text-white placeholder:text-white/30 focus:border-[#FF8805]/60 focus:outline-none focus:ring-2 focus:ring-[#FF8805]/20 transition-all'
    : 'w-full h-10 rounded-xl border border-white/30 bg-[#eef2f7] px-3.5 text-[13px] font-semibold text-slate-800 shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] placeholder:text-slate-400 focus:border-[#FF6A00] focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/15 transition-all';

  const labelClass = isDark
    ? 'text-[9px] font-black uppercase tracking-[0.12em] text-white/40 mb-1 block'
    : 'text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 mb-1 block';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          key="company-switcher"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-full left-0 right-0 mt-2 z-[200] rounded-[20px] border shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden ${panelBg}`}
          role="dialog"
          aria-label="Trocar empresa"
        >
          {/* ── List mode ── */}
          {mode === 'list' && (
            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between px-1 pb-2.5 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  Minhas Empresas
                </span>
                <button
                  onClick={onClose}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="Fechar"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Company list */}
              <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
                {userCompanies.length === 0 ? (
                  <div className={`py-6 text-center ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                    <Building2 size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-[12px] font-bold">Nenhuma empresa cadastrada</p>
                  </div>
                ) : (
                  userCompanies.map((company) => {
                    const isActive =
                      company.id === activeCompanyId ||
                      (!activeCompanyId && userCompanies[0]?.id === company.id);
                    return (
                      <button
                        key={company.id}
                        onClick={() => handleSelect(company.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-left transition-all duration-200 group ${
                          isActive
                            ? isDark
                              ? 'bg-white/10 border border-white/15'
                              : 'bg-gradient-to-r from-orange-500/8 to-orange-400/5 border border-orange-500/20'
                            : isDark
                              ? 'hover:bg-white/6 border border-transparent'
                              : 'hover:bg-white/60 border border-transparent hover:shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]'
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-[13px] select-none bg-gradient-to-br ${getCompanyColor(company.companyName)}`}
                        >
                          {getCompanyInitials(company.companyName)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[13px] font-black truncate leading-tight ${isDark ? 'text-white' : 'text-[#1e293b]'} ${isActive ? (isDark ? '' : 'text-[#FF6A00]') : ''}`}>
                            {company.companyName}
                          </p>
                          {company.site && !isHttpsPlaceholderOnly(company.site) && (
                            <p className={`text-[11px] font-semibold truncate leading-tight mt-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                              {company.site.replace(/^https?:\/\//i, '')}
                            </p>
                          )}
                        </div>

                        {/* Active indicator */}
                        {isActive ? (
                          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF8805] flex items-center justify-center shrink-0">
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(company); }}
                            className={`opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center transition-all text-[10px] font-black uppercase shrink-0 ${isDark ? 'text-white/40 hover:text-white bg-white/10' : 'text-slate-400 hover:text-[#FF6A00] bg-slate-100'}`}
                            aria-label="Editar empresa"
                            title="Editar"
                          >
                            ✏
                          </button>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* New company button */}
              <button
                onClick={handleOpenCreate}
                className={`w-full mt-2.5 flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] transition-all duration-200 border ${
                  isDark
                    ? 'border-dashed border-white/15 text-white/50 hover:text-white hover:border-white/30 hover:bg-white/5'
                    : 'border-dashed border-slate-300 text-slate-400 hover:text-[#FF6A00] hover:border-[#FF6A00]/40 hover:bg-orange-50/60'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-[#eef2f7] border border-white/60 shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]'}`}>
                  <Plus size={15} />
                </div>
                <span className="text-[13px] font-bold">Nova Empresa</span>
              </button>
            </div>
          )}

          {/* ── Create / Edit mode ── */}
          {(mode === 'create' || mode === 'edit') && (
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[13px] font-black ${isDark ? 'text-white' : 'text-[#1e293b]'}`}>
                  {mode === 'create' ? '+ Nova Empresa' : 'Editar Empresa'}
                </span>
                <button
                  onClick={() => setMode('list')}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label="Voltar"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                {/* Company Name */}
                <div>
                  <label className={labelClass}>Nome da Empresa *</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                    placeholder="Ex: Acme Ltda"
                    className={inputClass}
                    autoFocus
                  />
                </div>

                {/* Site */}
                <div>
                  <label className={labelClass}>
                    <Globe size={9} className="inline mr-1" />
                    Site
                  </label>
                  <input
                    type="text"
                    value={form.site}
                    onChange={(e) => setForm((f) => ({ ...f, site: e.target.value }))}
                    placeholder="https://www.exemplo.com.br"
                    className={inputClass}
                  />
                </div>

                {/* 2-col row: Instagram + LinkedIn */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>
                      <AtSign size={9} className="inline mr-1" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                      placeholder="@perfil"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <Briefcase size={9} className="inline mr-1" />
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={form.linkedin}
                      onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/…"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={labelClass}>WhatsApp</label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                    placeholder="+55 (11) 99999-9999"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-[12px] font-bold text-red-400">{error}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setMode('list')}
                  className={`flex-1 h-10 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                    isDark
                      ? 'bg-white/6 text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
                      : 'bg-[#eef2f7] text-slate-500 hover:text-slate-700 border border-white/60 shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-[12px] font-black uppercase tracking-widest text-white shadow-[0_4px_16px_rgba(255,106,0,0.35)] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    mode === 'create' ? 'Criar' : 'Salvar'
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Trigger button (the clickable sidebar header) ───────────────── */
interface CompanySwitcherTriggerProps {
  companyName: string;
  userName: string;
  userPhoto?: string | null;
  isDark?: boolean;
  className?: string;
}

export function CompanySwitcherTrigger({
  companyName,
  userName,
  userPhoto,
  isDark = true,
  className = '',
}: CompanySwitcherTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { userCompanies } = useAuth();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const greeting = getGreeting();

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  const hasMultipleCompanies = userCompanies.length > 1;
  const canSwitch = userCompanies.length >= 1;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full flex items-center gap-3 text-left transition-all duration-200 rounded-[16px] px-2 py-2 group ${
          isOpen
            ? isDark
              ? 'bg-white/12'
              : 'bg-orange-50/80 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff]'
            : isDark
              ? 'hover:bg-white/8'
              : 'hover:bg-white/60 hover:shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Trocar empresa"
      >
        {/* Avatar */}
        <div
          className={`relative w-[43px] h-[43px] rounded-full overflow-hidden shrink-0 ring-2 ring-white/60 shadow-[0_4px_14px_rgba(0,0,0,0.22)] flex items-center justify-center text-white font-black text-[15px] select-none bg-gradient-to-tr from-[#cc4400] to-[#FF8805]`}
        >
          {userPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userPhoto} alt="" className="w-full h-full object-cover" />
          ) : (
            (userName.charAt(0) || 'N').toUpperCase()
          )}
          {/* Multi-company badge */}
          {hasMultipleCompanies && (
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#FF8805] border-2 border-[#7a2500] flex items-center justify-center">
              <span className="text-white text-[8px] font-black leading-none">{userCompanies.length}</span>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0 flex-1">
          {companyName && (
            <span className={`text-[17px] font-black truncate block leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase()}
            </span>
          )}
          <div className="flex items-baseline gap-1 mt-0.5 min-w-0">
            <span className={`text-[10px] font-normal leading-none shrink-0 ${isDark ? 'text-white/60' : 'text-slate-400'}`}>
              {greeting}
            </span>
            <span className={`text-[10px] font-normal truncate leading-none ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
              {userName.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Chevron */}
        {canSwitch && (
          <ChevronDown
            size={14}
            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/30 group-hover:text-white/60' : 'text-slate-300 group-hover:text-slate-500'}`}
          />
        )}
      </button>

      {/* Dropdown */}
      <CompanySwitcher
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={triggerRef}
        isDark={isDark}
      />
    </div>
  );
}
