'use client';

import Image from 'next/image';

export function AuthPagesBackdrop() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat bg-[#0A0A0A]"
          style={{ backgroundImage: "url('/images/backgrd_dark.png')" }}
        />
      </div>

      <div className="pointer-events-auto fixed left-4 top-4 z-20 sm:left-6 sm:top-6 lg:left-10">
        <a href="https://neuroads.com.br" rel="noopener noreferrer" className="block group">
          <Image
            src="/images/logo2026.png"
            alt="NeuroAds"
            width={240}
            height={52}
            priority
            className="h-auto w-[150px] sm:w-[190px] lg:w-[230px] cursor-pointer group-hover:scale-[1.02] transition-all duration-300 brightness-0 invert"
          />
        </a>
      </div>
    </>
  );
}
