import Image from 'next/image';
import Link from 'next/link';

type InDevelopmentPageProps = {
  title: string;
};

export default function InDevelopmentPage({ title }: InDevelopmentPageProps) {
  return (
    <main className="min-h-screen bg-[#f4f6fa] text-[#1a1f2c]">
      <section className="mx-auto max-w-[1260px] px-5 pb-10 pt-5 md:px-8">
        <header className="flex items-center justify-between rounded-full border border-black/[0.06] bg-white px-5 py-3 shadow-[0_8px_26px_rgba(10,18,30,0.04)] md:px-7">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo2026.png" alt="NeuroAds" width={156} height={34} className="h-8 w-auto" priority />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#d8dee9] bg-white px-5 py-2.5 text-[12px] font-extrabold text-[#2b3240] transition hover:border-[#ffcfb0] hover:text-[#ff6a00]"
          >
            Voltar para Home
          </Link>
        </header>

        <div className="flex min-h-[calc(100vh-180px)] items-center justify-center py-10">
          <div className="w-full max-w-[980px] rounded-[30px] border border-[#e5eaf1] bg-white px-8 py-20 text-center shadow-[0_16px_32px_rgba(20,28,40,0.05)]">
            <h1 className="text-[48px] font-extrabold leading-tight text-[#151b27] md:text-[56px]">{title}</h1>
            <p className="mt-5 text-[28px] font-semibold text-[#6f7786] md:text-[34px]">em desenvolvimento</p>
          </div>
        </div>
      </section>
    </main>
  );
}
