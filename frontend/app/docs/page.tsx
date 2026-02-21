"use client";

import Link from "next/link";
import { 
  ArrowLeft, Terminal, Database, Cpu, 
  ShieldCheck, FileJson, Layers, ChevronRight,
  BookOpen, Code2, Workflow, Globe, Zap
} from "lucide-react";

export default function Documentation() {
  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-200 font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* HEADER PROGRESS / NAV */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Exit Docs</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Manual_v1.0</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-24">
        
        {/* DOCUMENT HEADER */}
        <header className="mb-20 border-b border-zinc-200 dark:border-zinc-800 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
               <Terminal size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Introduction</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-zinc-900 dark:text-white tracking-tighter leading-[0.9]">
            DATA<span className="text-indigo-600">ION</span> Docs<span className="text-indigo-600">.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium tracking-tight">
            A deep-dive into the End-to-End Data Platform architecture, schema enforcement, and automated machine learning orchestration.
          </p>
        </header>

        {/* CONTENT SECTIONS */}
        <div className="space-y-32">

          {/* SECTION 1: CORE PHILOSOPHY */}
          <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-black px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded">01</span>
                <h2 className="text-2xl font-black uppercase tracking-tight">Core Philosophy</h2>
            </div>
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 space-y-6 text-base md:text-lg leading-relaxed">
              <p>
                In high-stakes production ML systems, <span className="text-zinc-900 dark:text-zinc-100 font-bold underline decoration-indigo-500/30">Data Quality is the ultimate bottleneck.</span> Models degrade not primarily due to weak algorithms, but due to schema drift and silent failures.
              </p>
              <p>
                DATAION operates as a <strong>Strict Ingestion Guard</strong>. By enforcing data contracts at the gate, we ensure that downstream training pipelines receive perfectly structured data, every single time.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<ShieldCheck size={20}/>} 
                title="Strict Validation" 
                desc="Reject invalid data types or missing columns immediately at the write layer."
              />
              <FeatureCard 
                icon={<Database size={20}/>} 
                title="Stateful Logs" 
                desc="Every ingestion is versioned and stored with structural metadata for full audit trails."
              />
              <FeatureCard 
                icon={<Zap size={20}/>} 
                title="AutoML Flow" 
                desc="Integrated training engine supporting XGBoost & Random Forest with zero config."
              />
            </div>
          </section>

          {/* SECTION 2: WORKFLOW */}
          <section>
            <div className="flex items-center gap-3 mb-10">
                <span className="text-xs font-black px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded">02</span>
                <h2 className="text-2xl font-black uppercase tracking-tight">Platform Workflow</h2>
            </div>
            
            <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 space-y-16">
              <StepItem 
                number="01"
                title="Contract Definition"
                content="Establish your project schema. Use 'Auto-fill' to programmatically infer column types (Int, Float, String) from existing CSV samples."
              />
              <StepItem 
                number="02"
                title="Schema Enforcement"
                content="Upload raw datasets. The engine parses every row against your contract. Valid data proceeds; deviations are flagged as Invalid."
              />
              <StepItem 
                number="03"
                title="Automated Exploration"
                content="Access computed statistical distributions and feature correlations without writing a single line of Python or SQL."
              />
              <StepItem 
                number="04"
                title="Artifact Deployment"
                content="Trigger training on validated nodes. Download production-ready .joblib assets or run real-time inference in the console."
              />
            </div>
          </section>

          {/* SECTION 3: API REFERENCE */}
          <section>
            <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-black px-2 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded">03</span>
                <h2 className="text-2xl font-black uppercase tracking-tight">API Architecture</h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-10 text-base">
              The DATAION backend is powered by a high-concurrency <strong>FastAPI</strong> service. Standardized endpoints allow for programmatic contract management.
            </p>

            <div className="space-y-4 font-mono">
              <Endpoint method="GET" path="/projects/" desc="List active project nodes." />
              <Endpoint method="POST" path="/data/validate/{id}" desc="Trigger ingestion validation." />
              <Endpoint method="POST" path="/models/train/{id}" desc="Execute AutoML orchestration." />
              <Endpoint method="GET" path="/datasets/{id}/stats" desc="Fetch computed EDA metadata." />
            </div>
          </section>

        </div>

        {/* DOCUMENT FOOTER */}
        <footer className="mt-32 pt-12 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 grayscale opacity-40">
             <Globe size={20} />
             <div className="h-px w-12 bg-zinc-400" />
             <Workflow size={20} />
             <div className="h-px w-12 bg-zinc-400" />
             <Code2 size={20} />
          </div>
          <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-[0.4em] text-center">
            DATAION Platform • Engine v1.0.0 Stable
          </div>
        </footer>

      </div>
    </div>
  );
}

// --- REFINED COMPONENTS ---

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-white dark:bg-zinc-900/40 hover:border-indigo-500/50 transition-all group">
      <div className="text-indigo-600 dark:text-indigo-400 mb-6 bg-indigo-500/10 w-fit p-3 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-black text-zinc-900 dark:text-zinc-200 mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepItem({ number, title, content }: { number: string, title: string, content: string }) {
  return (
    <div className="ml-10 relative group">
      <div className="absolute -left-[57px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-[10px] font-black text-white dark:text-zinc-900 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
        {number}
      </div>
      <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base md:text-lg">{content}</p>
    </div>
  )
}

function Endpoint({ method, path, desc }: { method: string, path: string, desc: string }) {
  const methodColor = method === "GET" ? "text-indigo-500" : "text-emerald-500";
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-950 transition-colors group">
      <div className="flex items-center gap-4 mb-3 md:mb-0">
        <span className={`text-xs font-black px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${methodColor}`}>{method}</span>
        <code className="text-xs md:text-sm font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-500 transition-colors">{path}</code>
      </div>
      <span className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">{desc}</span>
    </div>
  )
}