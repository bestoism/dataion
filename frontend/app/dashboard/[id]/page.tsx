"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  ShieldAlert,
  Cpu,
  Activity,
  BarChart3,
  Database,
  Trash2,
  Pencil,
  Save,
  X,
  AlertTriangle,
  ExternalLink,
  Download
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

    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`);
        setProject(response.data);
        setEditedSchema(response.data.schema_definition);
      } catch (error) {
        console.error("Failed to load project", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDatasets = async () => {
      try {
        const res = await api.get(`/projects/${projectId}/datasets`);
        setDatasets(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProject();
    fetchDatasets();
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
      const response = await api.post(
        `/data/validate/${projectId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
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
      const response = await api.post(
        `/models/train/${projectId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error("Training error", error);
      alert("Training failed. Check console.");
    } finally {
      setTraining(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    if (deleteInput !== project.name) return;

    setIsDeleting(true);
    try {
        await api.delete(`/projects/${projectId}`);
        router.push("/dashboard");
    } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete project");
        setIsDeleting(false);
    }
  };

  const handleSchemaChange = (index: number, field: keyof ColumnDef, value: any) => {
    const newSchema = [...editedSchema];
    // @ts-ignore
    newSchema[index][field] = value;
    setEditedSchema(newSchema);
  };

  const saveSchema = async () => {
    try {
        const res = await api.put(`/projects/${projectId}/schema`, editedSchema);
        setProject(res.data);
        setIsEditing(false);
        alert("Schema updated successfully!");
    } catch (error) {
        console.error("Update failed", error);
        alert("Failed to update schema");
    }
  };

  const handleDownloadModel = (filename: string) => {
    // Karena download file, kita bisa pakai window.open atau link biasa
    // Tapi biar rapi pakai URL backend langsung
    window.open(`http://127.0.0.1:8000/models/download/${filename}`, "_blank");
  };

  // Loading State yang lebih rapi (Center)
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#09090b]">
        <div className="flex items-center gap-2 text-zinc-500 animate-pulse">
            <Activity size={20} /> Loading modules...
        </div>
    </div>
  );
  
  if (!project) return <div className="p-12 text-zinc-500">Project not found.</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-white dark:bg-[#09090b] transition-colors duration-300 relative">
      
      {/* === MODAL DELETE CONFIRMATION === */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-4">
                    <AlertTriangle size={24} />
                    <h3 className="text-lg font-bold">Delete Project?</h3>
                </div>
                
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
                    This action cannot be undone. This will permanently delete the 
                    <span className="font-bold text-zinc-900 dark:text-white mx-1">{project.name}</span> 
                    project and all associated datasets.
                </p>

                <div className="mb-6">
                    <label className="block text-xs font-medium text-zinc-500 mb-2">
                        To confirm, type <span className="select-all font-mono text-zinc-800 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{project.name}</span> in the box below
                    </label>
                    <input 
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition"
                        placeholder={project.name}
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => {
                            setIsDeleteModalOpen(false);
                            setDeleteInput("");
                        }}
                        className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDeleteProject}
                        disabled={deleteInput !== project.name || isDeleting}
                        className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isDeleting ? "Deleting..." : "Delete Project"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex justify-between items-center mb-4">
            <Link
            href="/dashboard"
            className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition text-sm"
            >
            <ArrowLeft size={16} className="mr-2" /> Back to Projects
            </Link>

            <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded border border-red-200 dark:border-red-900/30 transition hover:shadow-sm"
            >
                <Trash2 size={14} /> Delete Project
            </button>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              {project.name}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
              {project.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">
              Target Column
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-mono font-bold text-lg">
              {project.target_column}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: SCHEMA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Database size={16} className="text-zinc-400 dark:text-zinc-500" /> Data Contract
                </h3>
                
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-zinc-500 hover:text-blue-500 transition" title="Edit Schema">
                        <Pencil size={14} />
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-red-500 transition" title="Cancel">
                            <X size={14} />
                        </button>
                        <button onClick={saveSchema} className="text-green-600 hover:text-green-500 transition" title="Save">
                            <Save size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-3">
              {(isEditing ? editedSchema : project.schema_definition).map((col, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 border rounded text-sm ${
                    col.name === project.target_column
                      ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30"
                      : "bg-white dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-900"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className={`font-mono font-medium ${
                        col.name === project.target_column
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {col.name}
                      {col.name === project.target_column && " (Target)"}
                    </div>
                    
                    {!isEditing ? (
                        <div className="text-xs text-zinc-500 dark:text-zinc-600 uppercase">
                        {col.dtype}
                        </div>
                    ) : (
                        <select 
                            value={col.dtype}
                            onChange={(e) => handleSchemaChange(idx, "dtype", e.target.value)}
                            className="mt-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-1 py-0.5 w-full outline-none text-zinc-900 dark:text-white"
                        >
                            <option value="object">String</option>
                            <option value="int">Integer</option>
                            <option value="float">Float</option>
                        </select>
                    )}
                  </div>

                  {!isEditing ? (
                    col.required && (
                        <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500 px-2 py-0.5 rounded">
                        REQ
                        </span>
                    )
                  ) : (
                    <input 
                        type="checkbox"
                        checked={col.required}
                        onChange={(e) => handleSchemaChange(idx, "required", e.target.checked)}
                        className="accent-blue-600 h-4 w-4"
                    />
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
                <p className="text-[10px] text-zinc-500 mt-4 text-center italic">
                    Uncheck box to make column optional.
                </p>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: WORKSPACE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* UPLOAD AREA */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
            <input type="file" id="csvUpload" accept=".csv" onChange={handleFileChange} className="hidden" />
            
            {!file ? (
              <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4"><Upload size={24} /></div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">Click to upload dataset</p>
                <p className="text-sm text-zinc-500 mt-1">.csv files only</p>
              </label>
            ) : (
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-4"><FileText size={24} /></div>
                <p className="text-zinc-800 dark:text-zinc-200 font-medium mb-4">{file.name}</p>
                <div className="flex gap-3">
                   <label htmlFor="csvUpload" className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition">Change File</label>
                   {!result?.valid && (
                      <button onClick={handleValidate} disabled={uploading} className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded hover:bg-zinc-700 dark:hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer">
                        {uploading ? "Checking..." : "Run Validation"}
                      </button>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* VALIDATION RESULT */}
          {result && (
            <div className={`border rounded-lg p-6 ${result.valid ? 'bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${result.valid ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                  {result.valid ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold mb-1 ${result.valid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                    {result.valid ? "Validation Passed" : "Validation Failed"}
                  </h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Schema check completed for {result.filename}</p>

                  {!result.valid && result.details?.errors && (
                    <div className="bg-white dark:bg-black/40 rounded border border-red-200 dark:border-red-900/20 p-4 font-mono text-sm text-red-600 dark:text-red-400/80">
                      <ul className="space-y-1 list-disc list-inside">{result.details.errors.map((err, i) => <li key={i}>{err}</li>)}</ul>
                    </div>
                  )}

                  {result.valid && !metrics && (
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-900/30 flex items-center justify-between">
                          <span className="text-sm text-green-600 dark:text-green-500/80">Data is ready for modeling.</span>
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

          {/* TRAINING METRICS */}
          {metrics && (
              <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400"><BarChart3 size={24} /></div>
                          <div>
                              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Model Performance</h3>
                              <p className="text-sm text-zinc-500">AutoML Training Results</p>
                          </div>
                      </div>
                      
                      {metrics.artifact_path && (
                          <button 
                              onClick={() => handleDownloadModel(metrics.artifact_path!)}
                              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded shadow-lg hover:opacity-90 transition"
                          >
                              <Download size={16} /> Download .joblib
                          </button>
                      )}
                  </div>                  

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Accuracy</div>
                          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{(metrics.accuracy * 100).toFixed(1)}%</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Algorithm</div>
                          <div className="text-lg font-bold text-zinc-900 dark:text-white truncate" title={metrics.model_type}>Random Forest</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Rows Trained</div>
                          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics.dataset_rows}</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg">
                          <div className="text-xs text-zinc-500 uppercase mb-1">Features</div>
                          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{metrics.features_used.length}</div>
                      </div>
                  </div>
              </div>
          )}

          {/* DATASET HISTORY */}
          <div className="mt-8 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-4">
              Dataset History
            </h3>

            {datasets.length === 0 ? (
              <p className="text-zinc-500 text-sm">
                No datasets uploaded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-100 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Filename</th>
                      <th className="px-4 py-3">Rows</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((ds) => (
                      <tr
                        key={ds.id}
                        className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition group"
                      >
                        <td className="px-4 py-3 font-mono text-zinc-700 dark:text-zinc-300">
                          {ds.filename}
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{ds.row_count}</td>
                        <td className="px-4 py-3">
                          {ds.is_valid === 1 ? (
                            <span className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs border border-green-200 dark:border-green-900/30">
                              Valid
                            </span>
                          ) : (
                            <span className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs border border-red-200 dark:border-red-900/30">
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {new Date(ds.upload_date).toLocaleDateString()}
                        </td>
                        
                        {/* BUTTON EXPLORE */}
                        <td className="px-4 py-3">
                            <div className="flex justify-end">
                                <Link href={`/dashboard/${projectId}/dataset/${ds.id}`}>
                                <button className="
                                    flex items-center gap-1.5 
                                    text-xs font-medium 
                                    text-blue-600 dark:text-blue-400
                                    border border-blue-200 dark:border-blue-900/30
                                    px-3 py-1.5 rounded-md
                                    hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500
                                    transition-all duration-200
                                ">
                                    Explore <ExternalLink size={12} />
                                </button>
                                </Link>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}