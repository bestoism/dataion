import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle"; // <--- Import tombol

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center px-4 relative bg-white dark:bg-[#09090b] transition-colors duration-300">
      
      {/* Tombol Toggle di pojok kanan atas */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none" />

      <div className="z-10 text-center max-w-2xl space-y-8">
        
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50 text-xs text-zinc-600 dark:text-zinc-400 font-medium tracking-wide">
          v1.0.0 • Public Beta
        </div>

        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white">
          DATAION.
        </h1>
        
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
          The strict data contract platform for engineering teams.
          <br />
          Validate schema, enforce quality, deploy with confidence.
        </p>
        
        <div className="pt-4 flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard">
            <button className="h-12 px-8 rounded bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all duration-200 text-sm tracking-wide cursor-pointer">
              Open Console
            </button>
          </Link>
          
          <Link href="/docs">
            <button className="h-12 px-8 flex items-center justify-center rounded border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-200 text-sm cursor-pointer">
              Documentation
            </button>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest">
        Engineered for Reliability
      </div>
    </main>
  );
}