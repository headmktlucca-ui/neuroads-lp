'use client';
import Image from 'next/image';
import { Mail, Globe, Target, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-12 relative overflow-hidden">
      {/* Background Neural Grid (Faded) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-orange)_0%,_transparent_1px)] bg-[length:20px_20px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex-shrink-0">
            <div className="relative flex items-center group cursor-pointer">
              {/* Neural Vector Icon (SVG) */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-brand-orange)] opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500">
                <path d="M16 4C11.5817 4 8 7.58172 8 12C8 14.42 9.07 16.59 10.77 18.07C10.77 18.07 11.5 19.5 11.5 21C11.5 22.5 12.5 24 14.5 24H17.5C19.5 24 20.5 22.5 20.5 21C20.5 19.5 21.23 18.07 21.23 18.07C22.93 16.59 24 14.42 24 12C24 7.58172 20.4183 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                <path d="M12 15H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                <path d="M16 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 24V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              
              {/* Brand Text */}
              <span className="ml-2 text-2xl font-black tracking-tighter text-white/90 group-hover:text-white transition-colors">
                NEURO<span className="text-[var(--color-brand-green)] font-light">ADS</span>
              </span>
              
              {/* Version Badge */}
              <span className="ml-3 mt-1 text-[10px] font-mono text-slate-600">v4.0.2</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.3em] mb-2">Systems Contact</p>
            <a href="mailto:neuroads@gmail.com.br" className="text-slate-400 font-bold hover:text-[var(--color-brand-orange)] transition-colors text-sm">
              NEUROADS@GMAIL.COM.BR
            </a>
          </div>

          {/* Social Links */}
          <div className="flex gap-6">
            <SocialIcon icon={Share2} href="#" />
            <SocialIcon icon={Target} href="#" />
            <SocialIcon icon={Globe} href="#" />
            <SocialIcon icon={Mail} href="#" />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          <p>© 2026 NeuroAds Laboratory. All Neural Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy_Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Terms_of_Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: React.ElementType, href: string }) {
  return (
    <a 
      href={href} 
      className="text-slate-500 hover:text-[var(--color-brand-orange)] transition-colors p-2 bg-white/5 rounded-lg border border-white/10 hover:border-[var(--color-brand-orange)]/50"
    >
      <Icon size={18} />
    </a>
  );
}
