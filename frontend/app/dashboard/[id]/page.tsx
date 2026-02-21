"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft, Upload, FileText, CheckCircle, ShieldAlert, Cpu,
  Activity, BarChart3, Database, Trash2, Pencil, Save, X,
  AlertTriangle, ExternalLink, Download, Settings2,
  History, Sparkles, ShieldCheck
} from "lucide-react";
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
  artifact_path?: string;
  detailed_report?: any;
}

interface Dataset {
  id: number;
  filename: string;
  row_count: number;
  is_valid: number;
  upload_date: string;
}

export default function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    params.then((unwrap) => setProjectId(unwrap.id));
  }, [params]);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // States Fitur Utama
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  // States Edit Schema
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchema, setEditedSchema] = useState<ColumnDef[]>([]);

  // States Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const [projRes, dsRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/datasets`)
        ]);
        setProject(projRes.data);
        setEditedSchema(projRes.data.schema_definition);
        setDatasets(dsRes.data);
      } catch (error) {
        console.error("Failed to load project", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, result]);

  // --- HANDLERS ---
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
      const response = await api.post(`/data/validate/${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(response.data);
    } catch (error) {
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
      const response = await api.post(`/models/train/${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMetrics(response.data.metrics);
    } catch (error) {
      alert("Training failed.");
    } finally {
      setTraining(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || deleteInput !== project.name) return;
    setIsDeleting(true);
    try {
        await api.delete(`/projects/${projectId}`);
        router.push("/dashboard");
    } catch (error) {
        alert("Failed to delete project");
        setIsDeleting(false);
    }
  };

  const saveSchema = async () => {
    try {
        const res = await api.put(`/projects/${projectId}/schema`, editedSchema);
        setProject(res.data);
        setIsEditing(false);
    } catch (error) {
        alert("Failed to update schema");
    }
  };

  if (loading) return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
            <Activity className="text-indigo-600 animate-spin" size={32} />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">Initialising_Workspace</span>
        </div>
    </div>
  );
  
  if (!project) return <div className="p-12 text-zinc-500 font-mono">ERR: Project_Not_Found</div>;

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 font-sans transition-colors duration-500 pb-20">
      
      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
                <div className="flex items-center gap-4 text-rose-600">
                    <div className="p-3 bg-rose-500/10 rounded-full"><AlertTriangle size={24} /></div>
                    <h3 className="text-xl font-bold tracking-tight">Destructive Action</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                    Permanently delete <span className="font-bold underline decoration-rose-500/30">{project.name}</span>? This cannot be undone.
                </p>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirm Project Name</label>
                    <input 
                        type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none transition font-mono text-sm"
                        placeholder={project.name}
                    />
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition">Cancel</button>
                    <button onClick={handleDeleteProject} disabled={deleteInput !== project.name || isDeleting} className="flex-1 py-3 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {isDeleting ? <Activity className="animate-spin" size={16}/> : <Trash2 size={16}/>} Delete
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* TOP NAV BAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Explorer</span>
          </Link>
          <div className="flex items-center gap-3">
             <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"><Trash2 size={18} /></button>
             <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400">
                <Settings2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Workspace_Node</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* PROJECT HEADER */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">{project.name}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl text-base">{project.description}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Target_Label</span>
            <div className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-mono font-bold text-sm shadow-xl shadow-indigo-500/10">
              {project.target_column}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMN LEFT: DATA CONTRACT */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-zinc-100 dark:text-zinc-800 -mr-8 -mt-8 opacity-20 group-hover:opacity-100 transition-opacity">
                 <Database size={80} strokeWidth={1} />
              </div>
              
              <div className="flex justify-between items-center mb-6 relative">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-500" /> Data_Contract
                </h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition cursor-pointer"><Pencil size={14} /></button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="p-2 text-rose-500"><X size={16}/></button>
                    <button onClick={saveSchema} className="p-2 text-emerald-500"><Save size={16}/></button>
                  </div>
                )}
              </div>

              <div className="space-y-2 relative">
                {(isEditing ? editedSchema : project.schema_definition).map((col, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${col.name === project.target_column ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-bold truncate pr-2">{col.name}</div>
                      {!isEditing ? (
                        <div className={`text-[9px] uppercase font-bold ${col.name === project.target_column ? 'text-indigo-200' : 'text-zinc-500'}`}>{col.dtype}</div>
                      ) : (
                        <select 
                          value={col.dtype} 
                          onChange={(e) => {
                             const newSchema = [...editedSchema];
                             newSchema[idx].dtype = e.target.value;
                             setEditedSchema(newSchema);
                          }}
                          className="mt-1 text-[10px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded px-1 w-full outline-none"
                        >
                          <option value="object">String</option><option value="int">Integer</option><option value="float">Float</option>
                        </select>
                      )}
                    </div>
                    {col.required && !isEditing && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${col.name === project.target_column ? 'border-white/40' : 'border-zinc-200 dark:border-zinc-700 text-zinc-400'}`}>REQ</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COLUMN RIGHT: WORKSPACE */}
          <section className="lg:col-span-8 space-y-8">
            
            {/* UPLOAD & VALIDATE BENTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* UPLOAD CARD */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center group relative overflow-hidden transition-all hover:border-indigo-500/50">
                    <input type="file" id="csv" accept=".csv" onChange={handleFileChange} className="hidden" />
                    {!file ? (
                        <label htmlFor="csv" className="cursor-pointer flex flex-col items-center gap-4">
                            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500"><Upload size={28} /></div>
                            <div className="space-y-1">
                                <p className="font-bold text-sm font-sans tracking-tight">Ingest_New_Data</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Upload CSV Sample</p>
                            </div>
                        </label>
                    ) : (
                        <div className="space-y-6 w-full animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-4 p-4 bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <div className="p-3 bg-indigo-500 rounded-xl text-white"><FileText size={20}/></div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-bold text-xs truncate font-mono">{file.name}</p>
                                    <p className="text-[10px] text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <label htmlFor="csv" className="flex-1 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer">Change</label>
                                {!result?.valid && (
                                    <button onClick={handleValidate} disabled={uploading} className="flex-[2] py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition cursor-pointer shadow-xl shadow-indigo-500/10">
                                        {uploading ? "Validating..." : "Execute_Check"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* VALIDATION STATUS CARD */}
                <div className={`rounded-3xl p-8 flex flex-col justify-center border transition-all duration-500 ${!result ? 'bg-zinc-100/30 dark:bg-zinc-900/10 border-dashed border-zinc-200 dark:border-zinc-800' : result.valid ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                    {!result ? (
                        <div className="text-center space-y-2 opacity-40">
                            <ShieldAlert className="mx-auto text-zinc-400" size={32} />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Status: Ready</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-2xl ${result.valid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white'}`}>
                                    {result.valid ? <CheckCircle size={24}/> : <ShieldAlert size={24}/>}
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-tight">{result.valid ? 'Contract_Met' : 'Ingestion_Failed'}</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono">{result.filename}</p>
                                </div>
                            </div>
                            
                            {!result.valid && (
                                <div className="mt-4 p-4 bg-rose-500/10 rounded-xl border border-rose-500/10 font-mono text-[10px] text-rose-600 dark:text-rose-400 max-h-32 overflow-y-auto">
                                    <ul className="list-disc list-inside space-y-1">
                                        {result.details.errors?.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}

                            {result.valid && !metrics && (
                                <button onClick={handleTrain} disabled={training} className="mt-4 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3">
                                    {training ? <Activity className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                                    {training ? "Training..." : "Train_AutoML"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* TRAINING METRICS BENTO */}
            {metrics && (
                <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-500/20 animate-in slide-in-from-bottom-10 duration-1000 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><BarChart3 size={150}/></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-600/30"><Cpu size={32}/></div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase">Model_Artifact</h3>
                                <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase font-mono">Kernel: Random_Forest_v1</p>
                            </div>
                        </div>
                        {metrics.artifact_path && (
                             <button onClick={() => window.open(`http://127.0.0.1:8000/models/download/${metrics.artifact_path}`, "_blank")} className="px-6 py-3 bg-white text-zinc-950 rounded-xl text-xs font-bold hover:bg-zinc-200 transition flex items-center gap-2 cursor-pointer shadow-lg">
                                <Download size={16} /> DOWNLOAD_ASSET
                             </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                        <MetricBox label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(1)}%`} color="text-emerald-400" />
                        <MetricBox label="Rows" value={metrics.dataset_rows.toLocaleString()} />
                        <MetricBox label="Features" value={metrics.features_used.length} />
                        <MetricBox label="Status" value="Deployed" color="text-indigo-400" />
                    </div>
                </div>
            )}

            {/* HISTORY TABLE - PRIMARY FOCUS */}
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 overflow-hidden animate-in fade-in duration-1000">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500"><History size={18} /></div>
                        <h3 className="text-sm font-black uppercase tracking-widest font-sans">Dataset_Explorer</h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Audit_Logs</p>
                </div>
                
                {datasets.length === 0 ? (
                    <div className="py-20 text-center space-y-4 opacity-30">
                        <Database className="mx-auto" size={40} />
                        <p className="text-xs font-bold uppercase tracking-widest">No ingestion logs available.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-8">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] font-black uppercase text-zinc-400 tracking-widest border-y border-zinc-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-8 py-4">Filename</th>
                                    <th className="px-8 py-4">Rows</th>
                                    <th className="px-8 py-4">Contract_Status</th>
                                    <th className="px-8 py-4 text-right">Deep_Dive</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                                {datasets.map((ds) => (
                                    <tr key={ds.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                                        <td className="px-8 py-5 font-mono text-xs font-bold truncate max-w-[200px]" title={ds.filename}>{ds.filename}</td>
                                        <td className="px-8 py-5 text-xs text-zinc-500 font-mono">{ds.row_count.toLocaleString()}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${ds.is_valid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
                                                {ds.is_valid ? 'Verified' : 'Rejected'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <Link href={`/dashboard/${projectId}/dataset/${ds.id}`}>
                                                <button className="flex items-center gap-2 ml-auto px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg active:scale-95">
                                                    Analyze <ExternalLink size={12} />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function MetricBox({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="p-5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 font-sans">{label}</p>
            <p className={`text-2xl font-black tracking-tight font-mono ${color}`}>{value}</p>
        </div>
    )
}