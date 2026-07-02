'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export interface OrbitalItem {
  id: number;
  title: string;
  image: string;
  category?: string;
}

interface RadialOrbitalTimelineProps {
  items: OrbitalItem[];
  centerImage?: string;
  centerLabel?: string | React.ReactNode;
  theme?: 'dark' | 'light';
  onActiveItemChange?: (item: OrbitalItem | null) => void;
  showTooltip?: boolean;
}

function assignOrbits(items: OrbitalItem[]) {
  const rings = [
    { radius: 110, count: 4, duration: 22 },
    { radius: 185, count: 6, duration: 34 },
    { radius: 260, count: 8, duration: 48 },
  ];

  let itemIdx = 0;
  const result: (OrbitalItem & { orbitRadius: number; orbitDuration: number; orbitDelay: number })[] = [];

  for (const ring of rings) {
    for (let i = 0; i < ring.count && itemIdx < items.length; i++) {
      result.push({
        ...items[itemIdx],
        orbitRadius: ring.radius,
        orbitDuration: ring.duration,
        orbitDelay: -(i * ring.duration) / ring.count,
      });
      itemIdx++;
    }
  }

  return result;
}

interface OrbiterProps {
  item: ReturnType<typeof assignOrbits>[number];
  isActive: boolean;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
  isPaused: boolean;
}

function Orbiter({ item, isActive, onHover, onClick, isPaused }: OrbiterProps) {
  const size = 52;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        animation: `orbit-rotate ${item.orbitDuration}s linear ${item.orbitDelay}s infinite`,
        animationPlayState: isPaused ? 'paused' : 'running',
        transformOrigin: 'center center'
      }}
    >
      <motion.div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          width: size, height: size,
          top: '50%', left: '50%',
          marginTop: -size / 2,
          marginLeft: item.orbitRadius - size / 2,
          animation: `orbit-counter-rotate ${item.orbitDuration}s linear ${item.orbitDelay}s infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
          transformOrigin: 'center center'
        }}
        onHoverStart={() => onHover(item.id)}
        onHoverEnd={() => onHover(null)}
        onClick={() => onClick(item.id)}
        whileHover={{ scale: 1.25 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute inset-[-4px] rounded-full"
          animate={{
            boxShadow: isActive
              ? '0 0 0 2px rgba(255,106,0,0.9), 0 0 20px 6px rgba(255,106,0,0.5)'
              : '0 0 0 1.5px rgba(255,106,0,0.3), 0 0 8px 2px rgba(255,106,0,0.15)',
          }}
          transition={{ duration: 0.3 }}
        />
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#ff6a00]/50 bg-zinc-900">
          <Image src={item.image} alt={item.title} width={size} height={size} className="w-full h-full object-cover" />
        </div>
      </motion.div>
    </div>
  );
}

export default function RadialOrbitalTimeline({
  items,
  centerImage,
  centerLabel = 'NeuroAds',
  theme = 'dark',
  onActiveItemChange,
  showTooltip = true,
}: RadialOrbitalTimelineProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const assignedItems = assignOrbits(items);
  const activeItem = assignedItems.find((i) => i.id === (clicked ?? activeId));
  const isPaused = activeId !== null;

  const handleHover = useCallback((id: number | null) => {
    if (clicked === null) setActiveId(id);
  }, [clicked]);

  const handleClick = useCallback((id: number) => {
    setClicked((prev) => (prev === id ? null : id));
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (onActiveItemChange) {
      onActiveItemChange(activeItem || null);
    }
  }, [activeItem, onActiveItemChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) { setClicked(null); setActiveId(null); }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center select-none" style={{ width: 580, height: 580, maxWidth: '100%' }}>
      {[110, 185, 260].map((r) => (
        <div 
          key={r} 
          className={`absolute rounded-full border pointer-events-none transition-colors duration-300 ${
            theme === 'light' 
              ? 'border-slate-300/40 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05),_1px_1px_2px_#ffffff]' 
              : 'border-white/[0.06]'
          }`} 
          style={{ width: r * 2, height: r * 2 }} 
        />
      ))}
      <div className="absolute rounded-full pointer-events-none" style={{ width: 160, height: 160, background: 'radial-gradient(circle, rgba(255,106,0,0.18) 0%, transparent 70%)', filter: 'blur(20px)' }} />
      <div className="relative flex flex-col items-center gap-2">
        {centerImage ? (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#ff6a00]/60 shadow-[0_0_24px_rgba(255,106,0,0.4)]">
            <Image src={centerImage} alt={typeof centerLabel === 'string' ? centerLabel : 'NeuroAds'} width={64} height={64} className="w-full h-full object-cover" />
          </div>
        ) : typeof centerLabel === 'string' ? (
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#ff6a00] to-[#FF8805] shadow-[0_0_32px_rgba(255,106,0,0.5)]">
            <span className="text-white font-black text-lg">N</span>
          </div>
        ) : null}
        {typeof centerLabel === 'string' ? (
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">{centerLabel}</span>
        ) : (
          centerLabel
        )}
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {assignedItems.map((item) => (
          <Orbiter key={item.id} item={item} isActive={item.id === (clicked ?? activeId)} onHover={handleHover} onClick={handleClick} isPaused={isPaused} />
        ))}
      </div>
      <AnimatePresence>
        {showTooltip && activeItem && (
          <motion.div
            key={activeItem.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-[-72px] left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-xl border border-[#ff6a00]/30 backdrop-blur-md shadow-xl pointer-events-none whitespace-nowrap ${
              theme === 'light'
                ? 'bg-[#EDF1F5]/90 text-slate-800 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff]'
                : 'bg-zinc-950/90 text-white shadow-2xl'
            }`}
          >
            <p className={`text-[12px] font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{activeItem.title}</p>
            {activeItem.category && <p className="text-[10px] text-[#ff8f3a] font-medium">{activeItem.category}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbit-counter-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}} />
    </div>
  );
}
