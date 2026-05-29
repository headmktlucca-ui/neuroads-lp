'use client';

import Image from 'next/image';

export function AuthPagesBackdrop() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-white"
          style={{ backgroundImage: "url('/images/background_hub_custom_wave.png')" }}
        />
      </div>

      <div className="pointer-events-auto fixed left-1/2 top-4 -translate-x-1/2 z-20 sm:top-6 flex justify-center">
        <a href="https://neuroads.com.br" rel="noopener noreferrer" className="block group">
          <Image
            src="/images/logo2026.png"
            alt="NeuroAds"
            width={240}
            height={52}
            priority
            className="h-auto w-[150px] sm:w-[190px] lg:w-[230px] cursor-pointer group-hover:scale-[1.02] transition-all duration-300"
          />
        </a>
      </div>
    </>
  );
}
