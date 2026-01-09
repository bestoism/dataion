"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Folder, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

// Definisikan tipe data sesuai dengan response Backend
interface Project {
  id: number;
  name: string;
  description: string;
  schema_definition: any[];
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi fetch data dari Backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects/"); // Panggil endpoint backend
        setProjects(response.data);
      } catch (error) {
        console.error("Gagal mengambil data project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your data contracts and pipelines</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <p className="text-gray-500 animate-pulse">Loading projects...</p>
        ) : projects.length === 0 ? (
          // Tampilan jika belum ada project
          <div className="text-center py-20 border border-gray-800 rounded-xl bg-gray-900/50">
            <Folder className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300">No projects found</h3>
            <p className="text-gray-500 mb-6">Start by creating your first data contract.</p>
          </div>
        ) : (
          // Grid tampilan project yang sudah ada
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                className="group p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500/50 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <Folder size={24} />
                  </div>
                  <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded">
                    ID: {proj.id}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition">
                  {proj.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {proj.description || "No description provided."}
                </p>
                
                <div className="flex items-center text-sm text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Project <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}