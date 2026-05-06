"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

type TiltCardProps = {
  title: string;
  body: string;
  className?: string;
};

export function TiltCard({ title, body, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 12;
    const rotateX = (0.5 - py) * 10;

    element.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
    element.style.boxShadow = "0 26px 60px rgba(0, 0, 0, 0.3), 0 0 35px rgba(255, 106, 0, 0.28)";
  };

  const onLeave = () => {
    const element = ref.current;
    if (!element) return;

    element.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    element.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.25)";
  };

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-6 backdrop-blur-xl transition duration-300",
        "shadow-[0_12px_32px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl transition group-hover:bg-orange-300/28" />
      <h3 className="relative text-xl font-semibold text-white">{title}</h3>
      <p className="relative mt-3 text-sm leading-relaxed text-white/76">{body}</p>
    </article>
  );
}
