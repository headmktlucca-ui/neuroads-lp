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
      className="w-full flex flex-col gap-6"
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

      {/* Screenshot area — laptop mockup */}
      <div className="relative w-full mx-auto max-w-4xl">
        {/* Laptop Body mockup image */}
        <img
          src="/images/note.png"
          alt="Laptop Mockup"
          className="w-full h-auto block select-none pointer-events-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          draggable={false}
        />

        {/* Laptop Screen - overlaying the black screen area in the photo */}
        <div 
          className="absolute overflow-hidden rounded-[0.8%] bg-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)]"
          style={{
            top: '6.0%',
            left: '10.8%',
            width: '78.4%',
            height: '72.6%'
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                index === activeIndex ? 'opacity-100 animate-in fade-in-50 duration-500' : 'opacity-0',
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
          {/* Subtle screen reflection layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        </div>

        {/* Progress dots - positioned elegantly under the laptop */}
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
      </div>
    </Tabs>
  )
}
