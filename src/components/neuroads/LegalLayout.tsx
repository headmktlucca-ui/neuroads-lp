'use client';

import React, { useEffect, useState } from 'react';


// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalSection {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  children: React.ReactNode;
  /** Optional: list of sections to build sticky sidebar nav */
  sections?: LegalSection[];
  /** Title shown in the sidebar header */
  docTitle?: string;
  /** ISO date string: "Junho de 2026" */
  updatedAt?: string;
}

// ─── Sidebar TOC ──────────────────────────────────────────────────────────────

function TableOfContents({
  sections,
  docTitle,
  updatedAt,
}: {
  sections: LegalSection[];
  docTitle?: string;
  updatedAt?: string;
}) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="hidden lg:block w-[220px] shrink-0">
      <div className="sticky top-28 space-y-5">
        {docTitle && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff8f3a] mb-1">Documento</p>
            <p className="text-[13px] font-black text-white leading-snug">{docTitle}</p>
          </div>
        )}

        <nav>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 mb-3">Conteúdo</p>
          <ul className="space-y-1">
            {sections.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`block text-[12px] font-bold py-1 pl-3 border-l-2 transition-all leading-snug ${
                      isActive
                        ? 'border-[#ff6a00] text-[#ff8f3a]'
                        : 'border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {updatedAt && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
            Atualizado em<br />{updatedAt}
          </p>
        )}
      </div>
    </aside>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function LegalLayout({
  children,
  sections = [],
  docTitle,
  updatedAt,
}: LegalLayoutProps) {
  const hasSidebar = sections.length > 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000] text-white">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 20% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 80% 30%, rgba(30,30,30,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 500px at 35% 100%, rgba(255,106,0,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10">


        <section className="mx-auto max-w-[1200px] px-5 md:px-10 pb-24 pt-6">
          <div className="h-[84px]" />

          {/* Two-column layout when sidebar present */}
          <div className={`flex gap-14 items-start ${hasSidebar ? '' : 'justify-center'}`}>
            {hasSidebar && (
              <TableOfContents sections={sections} docTitle={docTitle} updatedAt={updatedAt} />
            )}

            {/* Main content card */}
            <div className={`flex-1 min-w-0 ${!hasSidebar ? 'max-w-[860px]' : ''}`}>
              <div className="rounded-[24px] border border-white/8 bg-zinc-950/75 p-7 sm:p-9 lg:p-11 shadow-[0_20px_52px_rgba(0,0,0,0.45)] backdrop-blur-md">
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
