"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { 
  ArrowLeft, Plus, Trash2, Save, Target, 
  Upload, FileSpreadsheet, Sparkles, Database, 
  Info, LayoutGrid, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

interface ColumnDef {
  name: string;
  dtype: string;
  required: boolean;
}

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetCol, setTargetCol] = useState("");
  
  const [columns, setColumns] = useState<ColumnDef[]>([
    { name: "", dtype: "object", required: true }
  ]);

  const handleAutoFill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n");
      if (lines.length < 1) return;

      const headers = lines[0].split(",").map(h => h.trim().replace(/['"\r]/g, ''));
      const sampleData = lines.length > 1 ? lines[1].split(",") : [];

      const newSchema: ColumnDef[] = headers.map((header, index) => {
        let detectedType = "object"; 
        if (sampleData[index]) {
            const val = sampleData[index].trim();
            if (!isNaN(Number(val)) && val !== "") {
                detectedType = val.includes(".") ? "float" : "int";
            }
        }
        return { name: header, dtype: detectedType, required: true };
      });

      setColumns(newSchema);
    };
    reader.readAsText(file);
  };

  const addColumn = () => {
    setColumns([...columns, { name: "", dtype: "object", required: true }]);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      const newCols = [...columns];
      newCols.splice(index, 1);
      setColumns(newCols);
    }
  };

  const updateColumn = (index: number, field: keyof ColumnDef, value: any) => {
    const newCols = [...columns];
    // @ts-ignore
    newCols[index][field] = value;
    setColumns(newCols);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name, description, target_column: targetCol, schema_definition: columns };
      await api.post("/projects/", payload);
      router.push("/dashboard");
    } catch (error) {
      alert("Error creating project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500 font-sans">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Cancel</span>
          </Link>
          <div className="flex items-center gap-2">
            <Database size={18} className="text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">New_Contract</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SECTION 1: HEADER & INFO */}
          <section className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Define Data Contract</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">Establish the rules for your data ingestion and modeling pipeline.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-white dark:bg-zinc-900/40 p-6 md:p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Project Identifier</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                  placeholder="e.g. Credit_Risk_Scoring_v1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Target size={12} className="text-indigo-500" /> Target Column
                  </label>
                  <input 
                    type="text" required value={targetCol} onChange={(e) => setTargetCol(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                    placeholder="e.g. label_churn"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Metadata Description</label>
                  <input 
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                    placeholder="Optional project details..."
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: SCHEMA DEFINITION */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
              <div className="flex items-center gap-3">
                <LayoutGrid size={20} className="text-indigo-500" />
                <h2 className="text-xl font-black tracking-tight uppercase">Schema_Specification</h2>
              </div>
              
              <div className="flex w-full sm:w-auto gap-2">
                 <div className="relative flex-1 sm:flex-initial">
                    <input type="file" accept=".csv" onChange={handleAutoFill} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <button type="button" className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 py-3 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition">
                        <Sparkles size={14} /> Auto-fill CSV
                    </button>
                 </div>
                 <button type="button" onClick={addColumn} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 transition">
                    <Plus size={14} /> Add Row
                 </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {columns.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] bg-zinc-100/30 dark:bg-zinc-900/10">
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                    <p className="text-zinc-500 text-sm font-medium">No columns defined. Use auto-fill or add manual row.</p>
                </div>
              ) : (
                columns.map((col, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl animate-in slide-in-from-left-2 duration-300 group hover:border-indigo-500/30 transition-colors">
                    <div className="flex-1 space-y-1">
                      <label className="sm:hidden text-[9px] font-bold text-zinc-400 uppercase ml-1">Column Name</label>
                      <input 
                        type="text" required value={col.name} placeholder="Column Name"
                        onChange={(e) => updateColumn(index, "name", e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 sm:w-32 space-y-1">
                        <label className="sm:hidden text-[9px] font-bold text-zinc-400 uppercase ml-1">Data Type</label>
                        <select 
                          value={col.dtype} onChange={(e) => updateColumn(index, "dtype", e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer font-bold"
                        >
                          <option value="object">String</option>
                          <option value="int">Integer</option>
                          <option value="float">Float</option>
                        </select>
                      </div>
                      <div className="flex flex-col items-center justify-center space-y-1">
                         <label className="sm:hidden text-[9px] font-bold text-zinc-400 uppercase">Req</label>
                         <div className="h-full px-4 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                            <input 
                              type="checkbox" checked={col.required}
                              onChange={(e) => updateColumn(index, "required", e.target.checked)}
                              className="accent-indigo-600 h-5 w-5 rounded-md cursor-pointer"
                            />
                         </div>
                      </div>
                      <button 
                        type="button" onClick={() => removeColumn(index)}
                        className="p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SUBMIT SECTION */}
          <footer className="pt-10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-zinc-500">
                <Info size={16} />
                <p className="text-xs">Contracts can be updated later from the project dashboard.</p>
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full sm:w-auto bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:opacity-80 transition disabled:opacity-50 shadow-2xl shadow-indigo-600/20 cursor-pointer"
            >
              {loading ? <Activity className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
              {loading ? "Finalising..." : "Save_Project_Node"}
            </button>
          </footer>

        </form>
      </main>
    </div>
  );
}