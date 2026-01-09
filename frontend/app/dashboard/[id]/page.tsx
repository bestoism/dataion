"use client";

import { useEffect, useState, use } from "react"; 
import { useRouter } from "next/navigation"; // Hapus useParams, gunakan use() untuk params di Next.js 15/App Router terbaru atau props
import api from "@/lib/api";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface ColumnDef {
  name: string;
  dtype: string;
  required: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  schema_definition: ColumnDef[];
}

interface ValidationResult {
  valid: boolean;
  filename: string;
  details: {
    errors?: string[];
    message?: string;
  };
}

// Update Next.js App Router: params is a Promise now in some versions, 
// but standard generic usage for client component often uses props. 
// Untuk aman di versi terbaru, kita ambil params dari props page.
export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params (Next.js 15 compatible way)
  const [projectId, setProjectId] = useState<string>("");
  
  useEffect(() => {
    params.then((unwrap) => setProjectId(unwrap.id));
  }, [params]);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk Upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  // Fetch Project Data
  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error("Failed to load project", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Reset hasil validasi sebelumnya
    }
  };

  // Handle Upload & Validate
  const handleValidate = async () => {
    if (!file || !projectId) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Panggil API Backend
      const response = await api.post(`/data/validate/${projectId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(response.data);
    } catch (error: any) {
      console.error("Validation error", error);
      alert("Error uploading file. Check console.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-12 text-zinc-500">Loading modules...</div>;
  if (!project) return <div className="p-12 text-zinc-500">Project not found.</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-white mb-4 transition text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Link>
        <h1 className="text-3xl font-semibold text-white tracking-tight">{project.name}</h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: SCHEMA INFO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-zinc-500" /> Data Contract
            </h3>
            
            <div className="space-y-3">
              {project.schema_definition.map((col, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950/50 border border-zinc-900 rounded text-sm">
                  <div>
                    <div className="text-zinc-300 font-mono font-medium">{col.name}</div>
                    <div className="text-xs text-zinc-600 uppercase">{col.dtype}</div>
                  </div>
                  {col.required ? (
                    <span className="text-[10px] bg-red-900/20 text-red-400 px-2 py-0.5 rounded border border-red-900/30">REQ</span>
                  ) : (
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">OPT</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: UPLOAD & CONSOLE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upload Area */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center border-dashed hover:border-zinc-600 transition-colors">
            <input 
              type="file" 
              id="csvUpload" 
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {!file ? (
              <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                  <Upload size={24} />
                </div>
                <p className="text-zinc-300 font-medium">Click to upload dataset</p>
                <p className="text-sm text-zinc-500 mt-1">Supports .csv only</p>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                 <div className="h-12 w-12 bg-blue-900/20 rounded-full flex items-center justify-center text-blue-400 mb-4 border border-blue-900/30">
                  <FileText size={24} />
                </div>
                <p className="text-zinc-200 font-medium mb-4">{file.name}</p>
                
                <div className="flex gap-3">
                  <label htmlFor="csvUpload" className="px-4 py-2 text-sm text-zinc-400 hover:text-white cursor-pointer transition">
                    Change File
                  </label>
                  <button 
                    onClick={handleValidate}
                    disabled={uploading}
                    className="px-6 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-zinc-200 transition disabled:opacity-50"
                  >
                    {uploading ? "Running Checks..." : "Run Validation"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Validation Result Console */}
          {result && (
            <div className={`border rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${result.valid ? 'bg-green-950/10 border-green-900/30' : 'bg-red-950/10 border-red-900/30'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${result.valid ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                  {result.valid ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold mb-1 ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.valid ? "Validation Successful" : "Validation Failed"}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4">
                    Target: <span className="font-mono text-zinc-300">{result.filename}</span>
                  </p>

                  {/* Jika Valid */}
                  {result.valid && (
                     <div className="text-sm text-zinc-400 bg-black/20 p-4 rounded border border-green-900/20 font-mono">
                        System output: Data conforms to the schema contract.
                        <br/>
                        Ready for pipeline ingestion.
                     </div>
                  )}

                  {/* Jika Error */}
                  {!result.valid && result.details?.errors && (
                    <div className="bg-black/20 rounded border border-red-900/20 p-4 font-mono text-sm overflow-x-auto">
                      <p className="text-red-300 mb-2">// Error Log:</p>
                      <ul className="space-y-1 text-red-400/80 list-disc list-inside">
                        {result.details.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}