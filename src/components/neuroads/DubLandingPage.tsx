'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Zap, Link2, Globe, Shield, Activity } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

// MaxWidthWrapper interno (padrão Dub.co)
const MaxWidthWrapper = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`mx-auto w-full max-w-screen-xl px-2.5 md:px-20 ${className}`}>
    {children}
  </div>
);

export default function DubLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-purple-100 text-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <a
          className="mx-auto mb-5 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.1)] backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50"
          href="#"
        >
          <p className="text-sm font-semibold text-gray-700">✨ Conheça a Nova Inteligência Preditiva</p>
        </a>
        
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          Marketing inteligente para marcas{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            modernas
          </span>
        </h1>
        
        <p className="mt-5 max-w-prose text-zinc-500 sm:text-lg">
          A NeuroAds é a infraestrutura de marketing orientada a dados. Reduza o CAC, aumente o LTV e tome decisões com base em neurociência e machine learning.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#"
            className="rounded-full bg-gray-900 text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            Começar Gratuitamente
          </a>
          <a
            href="#"
            className="rounded-full bg-white border border-gray-200 text-gray-900 px-8 py-3 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            Agendar Demonstração <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </MaxWidthWrapper>

      {/* Value Proposition Image (Tilted Mockup) */}
      <div>
        <div className="relative isolate">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>

          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mt-16 flow-root sm:mt-24">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4"
              >
                <div className="rounded-md bg-white border border-gray-200 shadow-2xl ring-1 ring-gray-900/10 overflow-hidden aspect-video flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                   {/* Placeholder para a Dashboard */}
                   <div className="text-center">
                     <BarChart3 className="w-16 h-16 mx-auto text-purple-200 mb-4" />
                     <p className="text-gray-400 font-medium">[ MOCKUP DA DASHBOARD AQUI ]</p>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Logos Section */}
      <MaxWidthWrapper className="mt-24 pt-10">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
          Apoiando as equipes de marketing mais modernas
        </p>
        <div className="flex flex-wrap justify-center gap-10 opacity-50 grayscale">
          {/* Placeholder Logos */}
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-32 bg-gray-300 rounded"></div>
          <div className="h-8 w-20 bg-gray-300 rounded"></div>
          <div className="h-8 w-28 bg-gray-300 rounded"></div>
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
        </div>
      </MaxWidthWrapper>

      {/* Bento Grid Features */}
      <MaxWidthWrapper className="mt-32 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Tudo que você precisa em um só lugar</h2>
          <p className="mt-4 text-lg text-gray-600">A NeuroAds consolida dados fragmentados para construir campanhas escaláveis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1 (Large) */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="p-8 pb-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Zap className="w-5 h-5" /></div>
                <h3 className="text-xl font-bold text-gray-900">Velocidade Extrema</h3>
              </div>
              <p className="text-gray-600 mb-8 max-w-md">Análise em tempo real de métricas avançadas, permitindo a mudança de lances antes mesmo do concorrente agir.</p>
            </div>
            <div className="h-64 bg-gray-50 border-t border-gray-100 w-full flex items-center justify-center overflow-hidden">
               {/* Visual Element Placeholder */}
               <div className="w-[80%] h-[120%] bg-white rounded-t-xl border border-gray-200 shadow-lg mt-10"></div>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Shield className="w-5 h-5" /></div>
                <h3 className="text-xl font-bold text-gray-900">Segurança</h3>
              </div>
              <p className="text-gray-600 mb-8">Auditoria completa dos seus dados sem vazar informações de leads.</p>
              
              <div className="mt-auto h-32 w-full flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-blue-300" />
                 </div>
              </div>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Globe className="w-5 h-5" /></div>
                <h3 className="text-xl font-bold text-gray-900">Global</h3>
              </div>
              <p className="text-gray-600 mb-8">Infraestrutura preparada para tráfego internacional de alto volume.</p>
            </div>
          </div>

          {/* Bento Card 4 (Large) */}
          <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
            <div className="p-8 md:flex gap-8 items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600"><Activity className="w-5 h-5" /></div>
                  <h3 className="text-xl font-bold text-gray-900">Métricas Precisas</h3>
                </div>
                <p className="text-gray-600 mb-6">Integração nativa com todas as plataformas de anúncios para centralizar a inteligência do negócio.</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Meta Ads</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Google Ads</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> TikTok Ads</li>
                </ul>
              </div>
              <div className="flex-1 mt-8 md:mt-0 bg-gray-50 rounded-xl h-48 border border-gray-100 flex items-center justify-center">
                 <p className="text-gray-400 font-medium text-sm">[ GRÁFICO PLACEHOLDER ]</p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>

      {/* CTA Section */}
      <div className="border-t border-gray-200 bg-white">
        <MaxWidthWrapper className="py-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para dominar o algoritmo?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se às agências mais inovadoras do Brasil e coloque a sua operação em modo automático.
          </p>
          <a
            href="#"
            className="inline-block rounded-full bg-gray-900 text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-all shadow-lg"
          >
            Criar Conta Grátis
          </a>
        </MaxWidthWrapper>
      </div>

      <Footer />
    </div>
  );
}
