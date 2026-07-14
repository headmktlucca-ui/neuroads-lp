'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/flexnative-tabs'

const items = [
  {
    label: 'Dashboard',
    description: 'Visualize indicadores',
    src: '/images/prints/print1.png',
  },
  {
    label: 'Integrações',
    description: 'Conecte seus canais',
    src: '/images/prints/print2.png',
  },
  {
    label: 'Agentes IA',
    description: 'Automatize e atribua',
    src: '/images/prints/print3.png',
  },
] as const

export function ScreenshotShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hovered, setHovered] = useState(false)

  // Auto-advance every 3.5 s, pause on hover
  useEffect(() => {
    if (hovered) return
    const id = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length)
    }, 3500)
    return () => clearInterval(id)
  }, [hovered])

  return (
    <Tabs
      value={String(activeIndex)}
      onValueChange={v => setActiveIndex(Number(v))}
      className="w-full items-center gap-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tab triggers */}
      <div className="flex w-full justify-center">
        <TabsList className="h-auto gap-1 bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-2xl p-1">
          {items.map((tab, index) => (
            <TabsTrigger
              key={tab.label}
              value={String(index)}
              className="rounded-xl px-4 py-2 text-sm font-medium border-none shadow-none
                         text-slate-500 hover:text-slate-700 hover:bg-slate-100/70
                         data-[state=active]:bg-[#FF6A00] data-[state=active]:text-white
                         data-[state=active]:shadow-md transition-all duration-200"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Screenshot area — browser mockup */}
      <div className="relative w-full">
        {/* Browser frame */}
        <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_24px_64px_rgba(0,0,0,0.13),0_4px_16px_rgba(0,0,0,0.07)] bg-white">
          {/* macOS-style title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#f0f0f2] border-b border-slate-200/70">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <div className="flex-1 mx-3 bg-white/80 rounded-md px-3 py-1 text-[10px] text-slate-400 border border-slate-200/60 font-mono">
              app.neuroads.com.br/hub
            </div>
          </div>

          {/* Screenshot with cross-fade */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {items.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'absolute inset-0 transition-opacity duration-500',
                  index === activeIndex ? 'opacity-100' : 'opacity-0',
                )}
              >
                <img
                  src={item.src}
                  alt={item.label}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 size-full object-cover object-top"
                  draggable={false}
                />
              </div>
            ))}

            {/* Gradient vignette bottom */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Orange left accent stripe */}
        <div
          className="absolute left-0 top-[44px] bottom-0 w-[3px] rounded-bl-2xl z-10"
          style={{ background: 'linear-gradient(180deg, #FF6A00 0%, #FF9A56 100%)' }}
        />

        {/* Progress dots */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver ${items[i].label}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === activeIndex ? 'w-6 bg-[#FF6A00]' : 'w-1.5 bg-slate-300 hover:bg-slate-400',
              )}
            />
          ))}
        </div>

        {/* NeuroAds watermark */}
        <div className="absolute bottom-3 left-5 z-20">
          <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">NeuroAds</span>
        </div>
      </div>
    </Tabs>
  )
}
