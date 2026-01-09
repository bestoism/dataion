"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Save, Target, Upload, FileSpreadsheet, Sparkles } from "lucide-react";
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

  // --- FITUR BARU: AUTO-FILL DARI CSV ---
  const handleAutoFill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Ambil baris pertama (Header) dan baris kedua (Data untuk sampel tipe)
      const lines = text.split("\n");
      if (lines.length < 1) return;

      const headers = lines[0].split(",").map(h => h.trim().replace(/['"\r]/g, ''));
      const sampleData = lines.length > 1 ? lines[1].split(",") : [];

      // Mapping Logic
      const newSchema: ColumnDef[] = headers.map((header, index) => {
        let detectedType = "object"; // Default String
        
        // Cek data sampel untuk menebak tipe
        if (sampleData[index]) {
            const val = sampleData[index].trim();
            if (!isNaN(Number(val)) && val !== "") {
                if (val.includes(".")) {
                    detectedType = "float";
                } else {
                    detectedType = "int";
                }
            }
        }

        return {
            name: header,
            dtype: detectedType,
            required: true // Default semua required
        };
      });

      setColumns(newSchema);
    };
    reader.readAsText(file);
  };
  // --------------------------------------

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
      const payload = {
        name,
        description,
        target_column: targetCol,
        schema_definition: columns
      };
      
      await api.post("/projects/", payload);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Error creating project. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 md:p-12 max-w-4xl mx-auto bg-white dark:bg-[#09090b] transition-colors duration-300">
      <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition text-sm">
        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">Create New Data Contract</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PROJECT INFO */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Project Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded p-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 transition"
                placeholder="e.g. Titanic Survival Prediction"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Target Column</label>
                    <div className="relative">
                        <Target size={16} className="absolute left-3 top-3.5 text-zinc-400" />
                        <input 
                            type="text" 
                            required
                            value={targetCol}
                            onChange={(e) => setTargetCol(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded p-3 pl-10 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 transition"
                            placeholder="e.g. Survived"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Description</label>
                    <input 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded p-3 text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-500 transition"
                        placeholder="Project description..."
                    />
                </div>
            </div>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800 my-8" />

          {/* SCHEMA DEFINITION */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs uppercase tracking-wider text-zinc-500">Schema Definition</label>
              
              <div className="flex gap-3">
                 {/* TOMBOL AUTO-FILL BARU */}
                 <div className="relative">
                    <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleAutoFill}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button type="button" className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800">
                        <Sparkles size={14} /> Auto-fill from CSV
                    </button>
                 </div>

                 <button 
                    type="button"
                    onClick={addColumn}
                    className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition px-2 py-2"
                 >
                    <Plus size={14} /> Add Manual
                 </button>
              </div>
            </div>
            
            {/* Area Informasi jika kosong */}
            {columns.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg">
                    <FileSpreadsheet className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                    <p className="text-sm text-zinc-500">Upload a CSV to auto-generate schema or add manually.</p>
                </div>
            )}

            <div className="space-y-3">
              {columns.map((col, index) => (
                <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <input 
                    type="text" 
                    placeholder="Column Name"
                    required
                    value={col.name}
                    onChange={(e) => updateColumn(index, "name", e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded p-2 text-sm text-zinc-900 dark:text-zinc-300 focus:border-zinc-500 outline-none"
                  />
                  <select 
                    value={col.dtype}
                    onChange={(e) => updateColumn(index, "dtype", e.target.value)}
                    className="w-32 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded p-2 text-sm text-zinc-900 dark:text-zinc-300 focus:border-zinc-500 outline-none"
                  >
                    <option value="object">String</option>
                    <option value="int">Integer</option>
                    <option value="float">Float</option>
                  </select>
                  <div className="flex items-center justify-center h-10 w-10 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded" title="Is Required?">
                    <input 
                      type="checkbox" 
                      checked={col.required}
                      onChange={(e) => updateColumn(index, "required", e.target.checked)}
                      className="accent-zinc-900 dark:accent-white h-4 w-4"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeColumn(index)}
                    className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold py-3 rounded hover:bg-zinc-700 dark:hover:bg-zinc-200 transition disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? "Creating..." : <><Save size={18} /> Save Project</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}