import PrimaryTopMenu from './PrimaryTopMenu';
import PrimaryFooter from './PrimaryFooter';
import HomePageBackground from './HomePageBackground';

type InDevelopmentPageProps = {
  title: string;
};

export default function InDevelopmentPage({ title }: InDevelopmentPageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#1a1f2c]">
      <HomePageBackground />
      <div className="relative z-10">
        <PrimaryTopMenu />

        <section className="mx-auto max-w-[1260px] px-5 pb-10 pt-5 md:px-8">
          <div className="h-[84px]" />

          <div className="flex min-h-[calc(100vh-180px)] items-center justify-center py-10">
            <div className="w-full max-w-[980px] rounded-[30px] border border-[#e5eaf1] bg-white px-8 py-20 text-center shadow-[0_16px_32px_rgba(20,28,40,0.05)]">
              <h1 className="text-[48px] font-extrabold leading-tight text-[#151b27] md:text-[56px]">{title}</h1>
              <p className="mt-5 text-[28px] font-semibold text-[#6f7786] md:text-[34px]">em desenvolvimento</p>
            </div>
          </div>
        </section>

        <PrimaryFooter />
      </div>
    </main>
  );
}
