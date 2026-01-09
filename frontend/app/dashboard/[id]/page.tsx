"use client";

import { useEffect, useState, use } from "react";
import api from "@/lib/api";
import { ArrowLeft, Upload, FileText, CheckCircle, ShieldAlert, Cpu, Activity, BarChart3, Database } from "lucide-react";
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
  target_column: string;
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

interface TrainingMetrics {
  model_type: string;
  accuracy: number;
  dataset_rows: number;
  features_used: string[];
}

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>("");
  
  useEffect(() => {
    params.then((unwrap) => setProjectId(unwrap.id));
  }, [params]);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Upload & Validasi
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  
  // State Training
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setMetrics(null);
    }
  };

const handleValidate = async () => {
    if (!file || !projectId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // PERBAIKAN: Tambahkan parameter ke-3 (options) untuk header
      const response = await api.post(`/data/validate/${projectId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setResult(response.data);
      setMetrics(null); 
    } catch (error) {
      console.error("Validation error", error);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

const handleTrain = async () => {
    if (!file || !projectId) return;
    setTraining(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
        // PERBAIKAN: Tambahkan parameter ke-3 (options) untuk header
        const response = await api.post(`/models/train/${projectId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        
        setMetrics(response.data.metrics);
    } catch (error) {
        console.error("Training error", error);
        alert("Training failed. Check console.");
    } finally {
        setTraining(false);
    }
  };

  if (loading) return <div className="p-12 text-zinc-500">Loading modules...</div>;
  if (!project) return <div className="p-12 text-zinc-500">Project not found.</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-white mb-4 transition text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </Link>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-semibold text-white tracking-tight">{project.name}</h1>
                <p className="text-zinc-400 mt-2 max-w-2xl">{project.description}</p>
            </div>
            <div className="text-right">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Target Column</div>
                <div className="text-blue-400 font-mono font-bold text-lg">{project.target_column}</div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: SCHEMA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database size={16} className="text-zinc-500" /> Data Contract
            </h3>
            <div className="space-y-3">
              {project.schema_definition.map((col, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 border rounded text-sm ${col.name === project.target_column ? 'bg-blue-900/10 border-blue-900/30' : 'bg-zinc-950/50 border-zinc-900'}`}>
                  <div>
                    <div className={`font-mono font-medium ${col.name === project.target_column ? 'text-blue-400' : 'text-zinc-300'}`}>
                        {col.name} {col.name === project.target_column && " (Target)"}
                    </div>
                    <div className="text-xs text-zinc-600 uppercase">{col.dtype}</div>
                  </div>
                  {col.required && <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">REQ</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: WORKSPACE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Upload Area */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors">
            <input type="file" id="csvUpload" accept=".csv" onChange={handleFileChange} className="hidden" />
            
            {!file ? (
              <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4"><Upload size={24} /></div>
                <p className="text-zinc-300 font-medium">Click to upload dataset</p>
                <p className="text-sm text-zinc-500 mt-1">.csv files only</p>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 mb-4"><FileText size={24} /></div>
                <p className="text-zinc-200 font-medium mb-4">{file.name}</p>
                <div className="flex gap-3">
                   <label htmlFor="csvUpload" className="px-4 py-2 text-sm text-zinc-500 hover:text-white cursor-pointer transition">Change File</label>
                   {!result?.valid && (
                      <button onClick={handleValidate} disabled={uploading} className="px-6 py-2 bg-white text-black text-sm font-semibold rounded hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer">
                        {uploading ? "Checking..." : "Run Validation"}
                      </button>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Validation Console */}
          {result && (
            <div className={`border rounded-lg p-6 ${result.valid ? 'bg-green-950/10 border-green-900/30' : 'bg-red-950/10 border-red-900/30'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${result.valid ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                  {result.valid ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold mb-1 ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.valid ? "Validation Passed" : "Validation Failed"}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-4">Schema check completed for {result.filename}</p>

                  {/* Jika Error */}
                  {!result.valid && result.details?.errors && (
                    <div className="bg-black/40 rounded border border-red-900/20 p-4 font-mono text-sm text-red-400/80">
                      <ul className="space-y-1 list-disc list-inside">{result.details.errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
                    </div>
                  )}

                  {/* Jika Valid: Tampilkan Tombol Train */}
                  {result.valid && !metrics && (
                      <div className="mt-4 pt-4 border-t border-green-900/30 flex items-center justify-between">
                          <span className="text-sm text-green-500/80">Data is ready for modeling.</span>
                          <button 
                             onClick={handleTrain} 
                             disabled={training}
                             className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium transition shadow-lg shadow-green-900/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             {training ? <Activity className="animate-spin" size={18}/> : <Cpu size={18} />}
                             {training ? "Training Model..." : "Train Model"}
                          </button>
                      </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Training Metrics (Hasil Akhir) */}
          {metrics && (
              <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><BarChart3 size={24} /></div>
                      <div>
                          <h3 className="text-lg font-semibold text-white">Model Performance</h3>
                          <p className="text-sm text-zinc-500">AutoML Training Results</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Accuracy</div>
                          <div className="text-2xl font-bold text-white">{(metrics.accuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Algorithm</div>
                          <div className="text-lg font-bold text-white truncate" title={metrics.model_type}>Random Forest</div>
                      </div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Rows Trained</div>
                          <div className="text-2xl font-bold text-white">{metrics.dataset_rows}</div>
                      </div>
                      <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Features</div>
                          <div className="text-2xl font-bold text-white">{metrics.features_used.length}</div>
                      </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-zinc-500">Model artifact is ready for deployment.</p>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}