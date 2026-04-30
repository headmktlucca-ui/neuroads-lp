'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../components/neuroads/Navbar';
import HeroSection from '../components/neuroads/HeroSection';
import AboutSection from '../components/neuroads/AboutSection';
import ProblemsSection from '../components/neuroads/ProblemsSection';
import ServicesSection from '../components/neuroads/ServicesSection';
import LuccaSection from '../components/neuroads/LuccaSection';
import GeoSection from '../components/neuroads/GeoSection';
import ProcessSection from '../components/neuroads/ProcessSection';
import TestimonialsSection from '../components/neuroads/TestimonialsSection';
import CTASection from '../components/neuroads/CTASection';
import FAQSection from '../components/neuroads/FAQSection';
import Footer from '../components/neuroads/Footer';

export default function Home() {
  useEffect(() => {
    // Scroll reveal logic for any element using the .reveal class
    const observerOptions = {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('up');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="relative">
        {/* BACKGROUND CONTINUES TO ABOUT SECTION */}
        <div className="absolute top-[10vh] left-0 right-0 bottom-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-main via-transparent to-transparent z-10 h-32" />
          <Image 
            src="/images/background_neuroads_26_hd_3840.png" 
            alt="NeuroAds Background" 
            fill
            sizes="100vw"
            quality={100}
            className="object-cover object-top"
            priority
          />
        </div>
        {/* Long, smooth fade to avoid any visible hard cut between sections */}
        <div
          className="absolute inset-x-0 bottom-0 h-44 sm:h-56 lg:h-64 pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(to bottom, rgba(247,247,248,0) 0%, rgba(247,247,248,0.45) 45%, rgba(247,247,248,0.85) 75%, #f7f7f8 100%)',
          }}
        />
        <div className="relative z-10">
          <HeroSection />
          <AboutSection />
        </div>
      </div>
      <ProblemsSection />
      <ServicesSection />
      <LuccaSection />
      <GeoSection />
      <ProcessSection />
      <TestimonialsSection />
      <CTASection />
      <FAQSection />
      
      <Footer />
    </main>
  );
}
