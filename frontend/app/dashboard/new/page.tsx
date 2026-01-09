"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";

interface ColumnDef {
  name: string;
  dtype: string;
  required: boolean;
}

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Form Utama
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  // State Dynamic Schema (Default 1 kolom kosong)
  const [columns, setColumns] = useState<ColumnDef[]>([
    { name: "", dtype: "object", required: true }
  ]);

  // Fungsi menambah baris kolom
  const addColumn = () => {
    setColumns([...columns, { name: "", dtype: "object", required: true }]);
  };

  // Fungsi menghapus baris kolom
  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      const newCols = [...columns];
      newCols.splice(index, 1);
      setColumns(newCols);
    }
  };

  // Fungsi update data kolom saat diketik
  const updateColumn = (index: number, field: keyof ColumnDef, value: any) => {
    const newCols = [...columns];
    // @ts-ignore - simple type bypass for quick implementation
    newCols[index][field] = value;
    setColumns(newCols);
  };

  // Submit ke Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        schema_definition: columns
      };
      
      await api.post("/projects/", payload);
      router.push("/dashboard"); // Redirect balik ke dashboard setelah sukses
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Error creating project. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 md:p-12 max-w-4xl mx-auto">
      
      {/* Tombol Back */}
      <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition text-sm">
        <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-white mb-6">Create New Data Contract</h1>
        
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 focus:outline-none focus:border-zinc-600 transition"
                placeholder="e.g. Credit Scoring Model v1"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-zinc-200 focus:outline-none focus:border-zinc-600 transition h-24"
                placeholder="Describe the purpose of this data pipeline..."
              />
            </div>
          </div>

          <hr className="border-zinc-800 my-8" />

          {/* SCHEMA DEFINITION */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs uppercase tracking-wider text-zinc-500">Schema Definition</label>
              <button 
                type="button"
                onClick={addColumn}
                className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white transition"
              >
                <Plus size={14} /> Add Column
              </button>
            </div>

            <div className="space-y-3">
              {columns.map((col, index) => (
                <div key={index} className="flex gap-3 items-start">
                  {/* Column Name */}
                  <input 
                    type="text" 
                    placeholder="Column Name"
                    required
                    value={col.name}
                    onChange={(e) => updateColumn(index, "name", e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-zinc-600 outline-none"
                  />

                  {/* Data Type */}
                  <select 
                    value={col.dtype}
                    onChange={(e) => updateColumn(index, "dtype", e.target.value)}
                    className="w-32 bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-300 focus:border-zinc-600 outline-none"
                  >
                    <option value="object">String / Text</option>
                    <option value="int">Integer</option>
                    <option value="float">Float / Decimal</option>
                  </select>

                  {/* Required Checkbox */}
                  <div className="flex items-center justify-center h-10 w-10 border border-zinc-800 bg-zinc-950 rounded" title="Is Required?">
                    <input 
                      type="checkbox" 
                      checked={col.required}
                      onChange={(e) => updateColumn(index, "required", e.target.checked)}
                      className="accent-white h-4 w-4"
                    />
                  </div>

                  {/* Delete Button */}
                  <button 
                    type="button"
                    onClick={() => removeColumn(index)}
                    disabled={columns.length === 1}
                    className="h-10 w-10 flex items-center justify-center text-zinc-600 hover:text-red-400 disabled:opacity-30 disabled:hover:text-zinc-600 transition"
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
              className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-zinc-200 transition disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? "Creating..." : <><Save size={18} /> Create Project</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}