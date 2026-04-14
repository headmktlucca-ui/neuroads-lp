'use client';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#05060F] selection:bg-blue-1/30">
      <Navbar />
      <div className="pt-32 pb-24 px-8">
        <div className="max-w-[800px] mx-auto overflow-hidden">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
