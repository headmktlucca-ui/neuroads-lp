'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Instagram, Facebook, Linkedin, ArrowRight, BrainCircuit } from 'lucide-react';

interface KnowledgeInputFormProps {
  onComplete: (links: Record<string, string>) => void;
  appName: string;
  requiredFields?: ('site' | 'instagram' | 'facebook' | 'linkedin')[];
}

export default function KnowledgeInputForm({ onComplete, appName, requiredFields = ['site', 'instagram', 'facebook', 'linkedin'] }: KnowledgeInputFormProps) {
  const [links, setLinks] = useState({
    site: '',
    instagram: '',
    facebook: '',
    linkedin: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulating scanning animation
    setTimeout(() => {
      onComplete(links);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-black/40 border border-white/5 backdrop-blur-xl relative overflow-hidden rounded-3xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-orange)]/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/20 flex items-center justify-center rounded-xl">
            <BrainCircuit className="text-[var(--color-brand-orange)]" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Scanner de Conhecimento</h2>
            <p className="text-slate-400 text-sm">Alimente o {appName} com suas fontes de dados.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Site */}
            {requiredFields.includes('site') && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
                  <Globe size={14} /> Website Principal
                </label>
                <input
                  type="url"
                  placeholder="https://suaempresa.com"
                  value={links.site}
                  onChange={(e) => setLinks({ ...links, site: e.target.value })}
                  className="w-full h-12 bg-white/5 border border-white/10 px-4 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-all"
                  required
                />
              </div>
            )}

            {/* Instagram */}
            {requiredFields.includes('instagram') && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
                  <Instagram size={14} /> Instagram
                </label>
                <input
                  type="url"
                  placeholder="instagram.com/perfil"
                  value={links.instagram}
                  onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                  className="w-full h-12 bg-white/5 border border-white/10 px-4 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-all"
                />
              </div>
            )}

            {/* LinkedIn */}
            {requiredFields.includes('linkedin') && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
                  <Linkedin size={14} /> LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="linkedin.com/company/abc"
                  value={links.linkedin}
                  onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                  className="w-full h-12 bg-white/5 border border-white/10 px-4 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-all"
                />
              </div>
            )}

            {/* Facebook */}
            {requiredFields.includes('facebook') && (
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-500 flex items-center gap-2">
                  <Facebook size={14} /> Facebook Ads
                </label>
                <input
                  type="url"
                  placeholder="facebook.com/pagina"
                  value={links.facebook}
                  onChange={(e) => setLinks({ ...links, facebook: e.target.value })}
                  className="w-full h-12 bg-white/5 border border-white/10 px-4 rounded-xl text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-all"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-14 bg-[var(--color-brand-orange)] text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-[var(--color-brand-green)] transition-all group disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ESCANEANDO CANAIS...
              </>
            ) : (
              <>
                INICIAR MAPEAMENTO NEURAL
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-[10px] text-center text-slate-500 uppercase tracking-widest font-mono">
          As informações serão processadas via motor neural neuroads v4.2
        </p>
      </div>
    </div>
  );
}
