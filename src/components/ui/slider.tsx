import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderContextType {
  value: number[];
  min: number;
  max: number;
  onValueChange?: (val: number[]) => void;
}

const SliderContext = React.createContext<SliderContextType | null>(null);

interface SliderProps {
  value: number[];
  onValueChange: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  children?: React.ReactNode;
}

export const Slider: React.FC<SliderProps> & {
  Track: React.FC<{ className?: string; children?: React.ReactNode }>;
  Range: React.FC<{ className?: string }>;
  Thumb: React.FC<{ className?: string }>;
} = ({ value, onValueChange, min = 0, max = 100, step = 1, className, children }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    containerRef.current.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as PointerEvent).clientX;
    const percentage = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    onValueChange([steppedValue]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    containerRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <SliderContext.Provider value={{ value, min, max, onValueChange }}>
      <div
        ref={containerRef}
        className={cn("relative flex h-2 w-full touch-none select-none items-center cursor-pointer", className)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={(e) => {
          if (e.buttons > 0) {
            handlePointerMove(e);
          }
        }}
      >
        {children}
      </div>
    </SliderContext.Provider>
  );
};

Slider.Track = ({ className, children }) => {
  return (
    <div className={cn("relative h-1 w-full rounded-full bg-white/20", className)}>
      {children}
    </div>
  );
};

Slider.Range = ({ className }) => {
  const context = React.useContext(SliderContext);
  if (!context) throw new Error("Slider.Range must be used within Slider");
  const percent = ((context.value[0] - context.min) / (context.max - context.min)) * 100;
  return (
    <div
      className={cn("absolute h-full rounded-full bg-white/70", className)}
      style={{ width: `${percent}%` }}
    />
  );
};

Slider.Thumb = ({ className }) => {
  const context = React.useContext(SliderContext);
  if (!context) throw new Error("Slider.Thumb must be used within Slider");
  const percent = ((context.value[0] - context.min) / (context.max - context.min)) * 100;
  return (
    <div
      className={cn("block h-3 w-3 rounded-full bg-white shadow absolute top-1/2 -translate-y-1/2 -translate-x-1/2", className)}
      style={{ left: `${percent}%` }}
    />
  );
};

Slider.displayName = "Slider";
Slider.Track.displayName = "Slider.Track";
Slider.Range.displayName = "Slider.Range";
Slider.Thumb.displayName = "Slider.Thumb";
