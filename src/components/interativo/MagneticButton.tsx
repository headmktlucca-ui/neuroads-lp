"use client";

import { cn } from "@/lib/utils";
import { useMemo, useRef } from "react";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handlers = useMemo(
    () => ({
      onMouseMove: (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = ref.current;
        if (!button) return;

        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate3d(${x * 0.08}px, ${y * 0.08}px, 0)`;
      },
      onMouseLeave: () => {
        const button = ref.current;
        if (!button) return;

        button.style.transform = "translate3d(0px, 0px, 0px)";
      },
    }),
    []
  );

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "group relative inline-flex items-center justify-center rounded-xl border border-orange-300/35 px-7 py-3 text-sm font-semibold text-white transition duration-300 will-change-transform",
        "bg-gradient-to-r from-[#ff6a00] to-[#ff8c00] shadow-[0_0_42px_rgba(255,106,0,0.4)] hover:shadow-[0_0_52px_rgba(255,140,0,0.52)]",
        className
      )}
      {...handlers}
    >
      <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 blur-xl transition group-hover:opacity-100" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
