"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Folder, Plus, Box, ArrowUpRight, 
  Home, LayoutDashboard, Search, 
  ArrowLeft, Clock
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface Project {
  id: number;
  name: string;
  description: string;
  schema_definition: any[];
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects/");
        setProjects(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500 font-sans">
      
      {/* HEADER / NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-950 dark:hover:text-white group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <LayoutDashboard size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold tracking-tighter text-zinc-900 dark:text-white">CONSOLE</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* WELCOME SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Projects
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
              Review and manage your data contracts, schema validation rules, and AutoML assets.
            </p>
          </div>
          
          <Link href="/dashboard/new" className="w-full md:w-auto">
            <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer">
              <Plus size={18} />
              New Project
            </button>
          </Link>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-200/50 dark:bg-zinc-900/50 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-100/30 dark:bg-zinc-900/10 animate-in zoom-in-95 duration-500">
            <div className="p-4 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4 text-zinc-400 dark:text-zinc-600">
              <Box size={32} />
            </div>
            <h3 className="text-zinc-900 dark:text-white font-bold text-lg">No projects detected</h3>
            <p className="text-zinc-500 text-sm mb-8">Start by creating your first data contract project.</p>
            <Link href="/dashboard/new">
                <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Create project &rarr;
                </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {projects.map((proj) => (
              <Link href={`/dashboard/${proj.id}`} key={proj.id} className="group">
                <div className="relative h-full p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                  
                  {/* Decorative background accent */}
                  <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <Folder size={20} />
                      </div>
                      <code className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800">
                        PRJ-{proj.id.toString().padStart(3, '0')}
                      </code>
                    </div>
                    
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {proj.description || "No project description provided."}
                    </p>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                       <Clock size={12} /> Recent
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                      Open <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}