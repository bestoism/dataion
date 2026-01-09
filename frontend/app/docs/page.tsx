import Link from "next/link";
import { ArrowLeft, Terminal, Database, Cpu, ShieldCheck, FileJson, Layers } from "lucide-react";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-200 font-mono transition-colors duration-300">
      
      {/* Container Utama - Padding lega di atas (py-24) */}
      <div className="max-w-4xl mx-auto px-6 py-24">
        
        {/* Navigasi Balik */}
        <Link 
          href="/" 
          className="inline-flex items-center text-zinc-500 hover:text-black dark:hover:text-white mb-12 transition-colors text-sm group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Return to Landing
        </Link>

        {/* Header Dokumen */}
        <div className="mb-16 border-b border-zinc-200 dark:border-zinc-800 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
               <Terminal size={24} className="text-zinc-700 dark:text-zinc-300" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">System Manual v1.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white tracking-tight">
            DATAION Documentation
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            A comprehensive guide to the End-to-End Data Platform architecture, schema enforcement, and automated machine learning pipelines.
          </p>
        </div>

        {/* Konten Utama */}
        <div className="space-y-20">

          {/* SECTION 1: INTRODUCTION */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">01.</span> Core Philosophy
            </h2>
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 space-y-4">
              <p>
                In production ML systems, <strong>Data Quality</strong> is often the bottleneck. Models fail not because of bad algorithms, but because of bad data (drift, missing values, wrong types).
              </p>
              <p>
                DATAION enforces a strict <strong>Data Contract</strong> at the ingestion layer. If the data doesn't match the schema, it never reaches the model. This ensures 100% reliability for downstream training pipelines.
              </p>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<ShieldCheck />} 
                title="Strict Validation" 
                desc="Schema-on-write enforcement. Invalid data types or missing required columns are rejected immediately."
              />
              <FeatureCard 
                icon={<Database />} 
                title="Dataset Versioning" 
                desc="Every uploaded file is hashed, versioned, and stored with metadata for full reproducibility."
              />
              <FeatureCard 
                icon={<Cpu />} 
                title="AutoML Engine" 
                desc="Integrated Scikit-learn pipeline that automatically encodes categorical features and trains Random Forest models."
              />
            </div>
          </section>

          {/* SECTION 2: WORKFLOW */}
          <section>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">02.</span> Platform Workflow
            </h2>
            
            <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-12">
              
              <StepItem 
                number="1"
                title="Define Project Schema"
                content="Create a new project and define your Data Contract. You can set column names, data types (Int, Float, String), and requirement status. Use the 'Auto-fill from CSV' feature to infer schema instantly."
              />
              
              <StepItem 
                number="2"
                title="Ingest & Validate"
                content="Upload your raw CSV dataset. The backend engine validates every single row against the schema. If even one required field is missing, the upload is flagged as Invalid."
              />
              
              <StepItem 
                number="3"
                title="EDA & Exploration"
                content="Visualize column distributions, detect missing values, and inspect sample data to understand your dataset health before training."
              />

              <StepItem 
                number="4"
                title="Train & Deploy"
                content="One-click training using the AutoML engine. The system handles preprocessing (Imputation, One-Hot Encoding) and training. Finally, download the serialized model (.joblib) for production use."
              />

            </div>
          </section>

          {/* SECTION 3: API REFERENCE */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400">03.</span> API Architecture
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              The platform is built on a high-performance <strong>FastAPI</strong> backend. Below are the core endpoints exposed by the service.
            </p>

            <div className="space-y-4">
              <Endpoint method="GET" path="/projects/" desc="List all active data contracts." />
              <Endpoint method="POST" path="/data/validate/{id}" desc="Upload CSV and run schema validation logic." />
              <Endpoint method="POST" path="/models/train/{id}" desc="Trigger AutoML pipeline on validated data." />
              <Endpoint method="GET" path="/datasets/{id}/stats" desc="Compute statistical distribution (EDA) for visualization." />
            </div>
          </section>

        </div>

        {/* Footer Kecil */}
        <div className="mt-24 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 uppercase tracking-widest">
          DATAION Platform • Built with Next.js & Python
        </div>

      </div>
    </div>
  );
}

// --- Komponen Kecil untuk Kerapian ---

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
      <div className="text-zinc-900 dark:text-white mb-3">{icon}</div>
      <h3 className="font-bold text-zinc-900 dark:text-zinc-200 mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function StepItem({ number, title, content }: { number: string, title: string, content: string }) {
  return (
    <div className="ml-8 relative">
      <div className="absolute -left-[41px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-[#09090b] text-sm font-bold text-zinc-500">
        {number}
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{content}</p>
    </div>
  )
}

function Endpoint({ method, path, desc }: { method: string, path: string, desc: string }) {
  const color = method === "GET" ? "text-blue-500" : method === "POST" ? "text-green-500" : "text-orange-500";
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900/30 font-mono text-sm">
      <div className="flex items-center gap-3 mb-2 md:mb-0">
        <span className={`font-bold ${color}`}>{method}</span>
        <span className="text-zinc-700 dark:text-zinc-300">{path}</span>
      </div>
      <span className="text-zinc-500 text-xs md:text-sm">{desc}</span>
    </div>
  )
}