'use client';

import Image from 'next/image';

export function AuthPagesBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth/fundo_componente.png')" }}
      />

      <div className="absolute left-4 top-4 sm:left-7 sm:top-6 pointer-events-auto z-10">
        <a href="https://neuroads.com.br" rel="noopener noreferrer">
          <Image
            src="/images/auth/logo-neuroads23-generated.png"
            alt="NeuroAds"
            width={280}
            height={76}
            priority
            className="h-auto w-[180px] sm:w-[230px] lg:w-[280px] cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
}
