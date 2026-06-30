import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preview — Chat Assistente IA | NeuroAds Hub',
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EBEBED]">
      {children}
    </div>
  );
}
