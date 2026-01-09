"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  ArrowLeft, BarChart3, Binary, FileText, Hash, 
  Table, Cpu, AlertCircle, Activity, CheckCircle, Download // <--- Tambah Import Download
} from "lucide-react";
import Link from "next/link";

// Definisikan tipe data statistik
interface ColumnStat {
  name: string;
  type: string;
  missing: number;
  missing_pct: number;
  unique: number;
  sample: any[];
  mean?: number;
  min?: number;
  max?: number;
  distribution?: Record<string, number>;
}

interface DatasetStats {
  filename: string;
  total_rows: number;
  total_cols: number;
  columns: ColumnStat[];
}

interface TrainingMetrics {
  model_type: string;
  accuracy: number;
  dataset_rows: number;
  features_used: string[];
  artifact_path?: string; // <--- Tambah field ini
}

export default function DatasetExplorer({
  params,
}: {
  params: Promise<{ id: string; datasetId: string }>;
}) {
  const [ids, setIds] = useState<{ id: string; datasetId: string } | null>(null);
  
  // Unwrapping params
  useEffect(() => {
    params.then(setIds);
  }, [params]);

  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Training State
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);

  useEffect(() => {
    if (!ids) return;

    const fetchData = async () => {
      try {
        const res = await api.get(`/datasets/${ids.datasetId}/stats`);
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ids]);

  const handleTrain = async () => {
    if (!ids) return;
    setTraining(true);
    setMetrics(null);

    try {
      const res = await api.post(`/models/train-existing/${ids.datasetId}`);
      setMetrics(res.data.metrics);
      // Scroll ke bawah otomatis
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert("Training failed. Check console.");
      console.error(error);
    } finally {
      setTraining(false);
    }
  };

  // Fungsi Download Model
  const handleDownloadModel = (filename: string) => {
    window.open(`http://127.0.0.1:8000/models/download/${filename}`, "_blank");
  };

  if (!ids || loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#09090b]">
        <div className="flex items-center gap-2 text-zinc-500 animate-pulse">
            <Activity size={20} /> Analyzing dataset structure...
        </div>
    </div>
  );
  
  if (!stats) return <div className="p-12 text-red-500">Failed to load dataset statistics.</div>;

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-white dark:bg-[#09090b] transition-colors duration-300">
      
      {/* HEADER */}
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6 flex justify-between items-start">
        <div>
            <Link
            href={`/dashboard/${ids.id}`}
            className="inline-flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-4 transition text-sm"
            >
            <ArrowLeft size={16} className="mr-2" /> Back to Project
            </Link>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                <FileText className="text-blue-600" /> {stats.filename}
            </h1>
            <p className="text-zinc-500 mt-2">Exploratory Data Analysis (EDA) & Modeling</p>
        </div>

        {/* TOMBOL TRAIN DI ATAS */}
        <button 
            onClick={handleTrain}
            disabled={training}
            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-lg"
        >
            {training ? <Activity className="animate-spin" /> : <Cpu />}
            {training ? "Training Model..." : "Train Model on this Data"}
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Total Rows</div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.total_rows.toLocaleString()}</div>
        </div>
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Total Columns</div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.total_cols}</div>
        </div>
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-500 uppercase tracking-wider mb-1">Data Health</div>
            <div className="text-xl font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircle size={20} /> Ready for ML
            </div>
        </div>
      </div>

      {/* EDA GRID */}
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
        <BarChart3 size={20} /> Column Distribution
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.columns.map((col, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="font-mono font-bold text-lg text-zinc-800 dark:text-zinc-200">{col.name}</div>
                        <div className="text-xs text-zinc-500 uppercase bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded inline-block mt-1">
                            {col.type}
                        </div>
                    </div>
                    {col.missing > 0 ? (
                        <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 px-2 py-1 rounded">
                            {col.missing_pct}% Missing
                        </span>
                    ) : (
                        <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 px-2 py-1 rounded">
                            Clean
                        </span>
                    )}
                </div>

                {/* STATISTIK DATA */}
                <div className="space-y-3 text-sm">
                    {/* Jika Numerik */}
                    {col.mean !== undefined && (
                        <div className="grid grid-cols-3 gap-2 text-center bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase">Min</div>
                                <div className="font-mono text-zinc-700 dark:text-zinc-300">{col.min}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase">Mean</div>
                                <div className="font-mono font-bold text-zinc-900 dark:text-white">{col.mean}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase">Max</div>
                                <div className="font-mono text-zinc-700 dark:text-zinc-300">{col.max}</div>
                            </div>
                        </div>
                    )}

                    {/* Jika Kategori */}
                    {col.distribution && (
                         <div className="space-y-1">
                            <div className="text-[10px] text-zinc-500 uppercase mb-1">Top Categories</div>
                            {Object.entries(col.distribution).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-xs">
                                    <span className="truncate w-32 text-zinc-700 dark:text-zinc-300">{key}</span>
                                    <div className="flex-1 mx-2 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500" 
                                            style={{ width: `${(val / stats.total_rows) * 100}%` }} 
                                        />
                                    </div>
                                    <span className="font-mono text-zinc-500">{val}</span>
                                </div>
                            ))}
                         </div>
                    )}

                    {/* Sampel Data */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-zinc-400 uppercase mb-1">Sample Values</div>
                        <div className="flex gap-2 flex-wrap">
                            {col.sample.map((s, i) => (
                                <span key={i} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-xs font-mono">
                                    {String(s)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* HASIL TRAINING (DENGAN TOMBOL DOWNLOAD) */}
      {metrics && (
          <div className="mt-12 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl p-8 animate-in slide-in-from-bottom-10 fade-in duration-700 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50">
                          <BarChart3 size={32} className="text-white" />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold">Model Trained Successfully!</h2>
                          <p className="text-zinc-400">Result from {stats.filename}</p>
                      </div>
                  </div>

                  {/* TOMBOL DOWNLOAD */}
                  {metrics.artifact_path && (
                    <button 
                        onClick={() => handleDownloadModel(metrics.artifact_path!)}
                        className="flex items-center gap-2 px-5 py-3 bg-white text-zinc-900 font-bold text-sm uppercase tracking-wide rounded hover:bg-zinc-200 transition shadow-lg cursor-pointer"
                    >
                        <Download size={18} /> Download Model
                    </button>
                  )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="text-xs text-zinc-400 uppercase mb-1">Accuracy</div>
                      <div className="text-4xl font-bold text-green-400">{(metrics.accuracy * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="text-xs text-zinc-400 uppercase mb-1">Algorithm</div>
                      <div className="text-xl font-bold truncate" title={metrics.model_type}>{metrics.model_type}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="text-xs text-zinc-400 uppercase mb-1">Rows Used</div>
                      <div className="text-2xl font-bold">{metrics.dataset_rows}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className="text-xs text-zinc-400 uppercase mb-1">Features</div>
                      <div className="text-2xl font-bold">{metrics.features_used.length}</div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}