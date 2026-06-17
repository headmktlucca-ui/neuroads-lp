"use client";

import { useRef, useEffect, useState } from "react";

interface VideoParallaxBackgroundProps {
  src: string | string[];
  position?: "fixed" | "absolute";
  overlayOpacity?: string;
}

export default function VideoParallaxBackground({
  src,
  position = "fixed",
  overlayOpacity = "bg-black/50",
}: VideoParallaxBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const srcs = Array.isArray(src) ? src : [src];
  const currentSrc = srcs[currentVideoIndex];

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % srcs.length);
  };

  // Parallax movement logic
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate offsets between -1 and 1
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Linear interpolation loop for ultra-smooth movement
    let frameId: number;
    const tick = () => {
      mouseX += (targetX - mouseX) * 0.065;
      mouseY += (targetY - mouseY) * 0.065;

      if (containerRef.current) {
        // Translate opposite to mouse direction for a parallax depth effect
        const xTranslate = -mouseX * 18;
        const yTranslate = -mouseY * 14;
        containerRef.current.style.transform = `translate3d(${xTranslate}px, ${yTranslate}px, 0) scale(1.09)`;
      }

      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className={`${position} inset-0 w-full h-full z-0 overflow-hidden bg-[#040811] pointer-events-none`}>
      <div
        ref={containerRef}
        className="w-full h-full will-change-transform relative"
        style={{ transform: "scale(1.09)" }}
      >
        <video
          ref={videoRef}
          src={currentSrc}
          autoPlay
          loop={srcs.length === 1}
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform"
        />
      </div>
      {/* Darkening black overlay to ensure high text contrast */}
      <div className={`absolute inset-0 ${overlayOpacity} pointer-events-none z-20`} />
    </div>
  );
}


