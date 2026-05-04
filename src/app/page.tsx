'use client';
import { useEffect } from 'react';
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
    <main className="min-h-screen site-bg">
      <div className="site-bg-media" aria-hidden="true" />
      <div className="site-bg-depth" aria-hidden="true" />
      <div className="site-bg-overlay" aria-hidden="true" />
      <div className="site-bg-sheen" aria-hidden="true" />
      <div className="site-bg-noise" aria-hidden="true" />

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ProblemsSection />
        <ServicesSection />
        <LuccaSection />
        <GeoSection />
        <ProcessSection />
        <TestimonialsSection />
        <CTASection />
        <FAQSection />
        <Footer />
      </div>
    </main>
  );
}
