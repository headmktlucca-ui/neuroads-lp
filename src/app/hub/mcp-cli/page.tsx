'use client';

import React from 'react';
import { Terminal, Clock } from 'lucide-react';

export default function HubMcpCliPage() {
  return (
    <div className="w-full max-w-4xl mx-auto h-[50vh] flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.02)]">
        <Terminal className="w-10 h-10 text-[#FF6A00]" />
      </div>
      <h1 className="text-3xl font-black text-white tracking-tight text-center">MCP & CLI</h1>
      <p className="text-[#8fa0b5] mt-3 max-w-md text-center text-[15px]">
        Controle o NeuroAds via linha de comando e gerencie conexões do Model Context Protocol (MCP).
      </p>
      
      <div className="mt-8 px-5 py-2.5 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center gap-2">
        <Clock className="w-4 h-4 text-[#FF6A00]" />
        <span className="text-[13px] font-bold text-[#FF6A00] tracking-wider uppercase">Em breve</span>
      </div>
    </div>
  );
}
