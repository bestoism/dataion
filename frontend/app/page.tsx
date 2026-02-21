"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle"; 
import { BackgroundParticles } from "@/components/background-particles";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 overflow-hidden bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500">
      
      {/* Background Layer */}
      <BackgroundParticles />
      
      {/* Refined Grid Pattern - More subtle */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      {/* Top Navigation Utilities */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            D
          </div>
          <span className="font-sans font-bold tracking-tighter text-zinc-900 dark:text-white hidden sm:block">DATAION</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="z-10 text-center max-w-4xl flex flex-col items-center space-y-10">
        
        {/* Version Badge - Hybrid Mono */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          v1.0.0 • Public Beta
        </div>

        {/* Main Heading - Sans for Punchy Look */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tight text-zinc-900 dark:text-white leading-[0.9]">
            DATA<span className="text-indigo-600 dark:text-indigo-500">ION</span><span className="text-indigo-600">.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-base md:text-xl text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed tracking-tight">
            The strict <span className="text-zinc-900 dark:text-zinc-200 font-medium">data contract platform</span> for engineering teams.
            Validate schema, enforce quality, and deploy with absolute confidence.
          </p>
        </div>
        
        {/* Action Group */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="group relative w-full sm:w-auto h-14 px-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-sans font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-2xl shadow-indigo-500/10 flex items-center justify-center gap-2 cursor-pointer">
              Open Console
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          
          <Link href="/docs" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-14 px-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-sans font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-all duration-200 text-base cursor-pointer backdrop-blur-sm">
              Documentation
            </button>
          </Link>
        </div>

        {/* Trust/Tech Indicator - Mono for Technical feel */}
        <div className="pt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           <span className="font-mono text-[10px] font-bold tracking-widest uppercase">FastAPI</span>
           <span className="font-mono text-[10px] font-bold tracking-widest uppercase">XGBoost</span>
           <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Next.js 15</span>
           <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Scikit-Learn</span>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
        <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.4em]">
          Engineered for Reliability
        </span>
      </div>
    </main>
  );
}