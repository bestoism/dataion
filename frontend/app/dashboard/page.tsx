"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Folder, Plus, Box, ArrowUpRight } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto">
      
      {/* Header Simple */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
            Projects
          </h1>
          <p className="text-sm text-zinc-500">
            Manage your data schemas and validation rules.
          </p>
        </div>
        
        <Link href="/dashboard/new">
          <button className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-4 py-2 rounded text-sm font-medium transition cursor-pointer">
            <Plus size={16} /> New Project
          </button>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-zinc-500 text-sm animate-pulse">Loading data...</div>
      ) : projects.length === 0 ? (
        // Empty State yang bersih
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
          <Box className="h-10 w-10 text-zinc-700 mb-3" />
          <h3 className="text-zinc-400 font-medium">No projects yet</h3>
        </div>
      ) : (
        // Grid Card yang "Clean Industrial"
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Link href={`/dashboard/${proj.id}`} key={proj.id}>
              <div 
                className="group relative p-6 bg-zinc-900/40 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-zinc-900 rounded border border-zinc-800 text-zinc-400">
                      <Folder size={18} />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 border border-zinc-800 px-2 py-1 rounded-full">
                      ID-{proj.id}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-medium text-zinc-200 group-hover:text-white mb-2">
                    {proj.name}
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                    {proj.description || "No description provided."}
                  </p>
                </div>

                {/* Link icon di pojok bawah */}
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <ArrowUpRight size={18} className="text-zinc-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
