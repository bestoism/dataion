"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  ArrowLeft, BarChart3, FileText, Cpu, Activity, 
  CheckCircle, Download, AlertTriangle, TrendingUp, Info,
  Terminal, Save, Layers, Database, MousePointerClick, 
  ChevronRight, Sparkles, Filter, Trash2, Wand2
} from "lucide-react";
import Link from "next/link";

interface ColumnStat {
  name: string;
  type: string;
  missing: number;
  missing_pct: number;
  unique: number;
  correlation: number;
  sample: any[];
  mean?: number;
  std?: number;
  median?: number;
  min?: number;
  max?: number;
  distribution?: Record<string, number>;
}

interface DatasetStats {
  filename: string;
  total_rows: number;
  total_cols: number;
  target_column: string;
  columns: ColumnStat[];
}

interface TrainingMetrics {
  model_type: string;
  accuracy: number;
  dataset_rows: number;
  features_used: string[];
  artifact_path?: string;
  detailed_report?: any; 
  feature_importance?: { feature: string; score: number }[];
}

export default function DatasetExplorer({
  params,
}: {
  params: Promise<{ id: string; datasetId: string }>;
}) {
  const [ids, setIds] = useState<{ id: string; datasetId: string } | null>(null);
  useEffect(() => { params.then(setIds); }, [params]);

  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [selectedModel, setSelectedModel] = useState("rf");
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    if (!ids) return;
    const fetchData = async () => {
      try {
        const res = await api.get(`/datasets/${ids.datasetId}/stats`);
        setStats(res.data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [ids]);

  const handleTrain = async () => {
    if (!ids) return;
    setTraining(true);
    try {
      const res = await api.post(`/models/train-existing/${ids.datasetId}?model_type=${selectedModel}`);
      setMetrics(res.data.metrics);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 300);
    } catch (error) { alert("Training failed"); } 
    finally { setTraining(false); }
  };

  const runCleaning = async (action: string, colName: string) => {
    if (!ids) return;
    setIsCleaning(true);
    try {
        const res = await api.post(`/datasets/${ids.datasetId}/clean`, {
            action: action,
            columns: [colName]
        });
        window.location.href = `/dashboard/${ids.id}/dataset/${res.data.new_dataset_id}`;
    } catch (err) {
        alert("Cleaning failed.");
    } finally {
        setIsCleaning(false);
    }
  };

  if (!ids || loading) return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
            <Activity className="text-indigo-600 animate-spin" size={32} />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">Running_Deep_EDA</span>
        </div>
    </div>
  );

  if (!stats) return <div className="p-12 text-rose-500 font-mono">ERR: Data_Fetch_Failed</div>;

  const topFeatures = [...stats.columns]
    .filter(c => c.name !== stats.target_column)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    .slice(0, 5);

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 font-sans transition-colors duration-500 pb-20 px-4 md:px-0">
      
      {/* STICKY TOP BAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/dashboard/${ids.id}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Project_Console</span>
          </Link>
          <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400">
                <BarChart3 size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-nowrap">Status: Computed</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* HERO SECTION */}
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                <Database size={14} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{stats.total_rows.toLocaleString()} Rows x {stats.total_cols} Cols</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white truncate max-w-2xl">{stats.filename}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg italic font-mono uppercase tracking-tighter">/ Automated_Statistical_Inference</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition cursor-pointer"
            >
                <option value="rf">Random Forest (Stable)</option>
                <option value="xgboost">XGBoost (Performance)</option>
                <option value="lightgbm">LightGBM (Large Scale)</option>
            </select>

            <button 
                onClick={handleTrain}
                disabled={training}
                className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-80 transition disabled:opacity-50 cursor-pointer shadow-2xl shadow-indigo-500/20"
            >
                {training ? <Activity className="animate-spin" size={18} /> : <Cpu size={18} />}
                {training ? "Executing..." : "Execute_AutoML"}
            </button>
          </div>
        </header>

        {/* QUICK INSIGHTS BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            
            {/* ALERT BOX (5 COLS) */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-500" /> Data_Quality_Pulse
                    </h3>
                </div>
                <div className="space-y-4">
                    {stats.columns.filter(c => c.missing > 0).length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500"><CheckCircle size={32} /></div>
                            <p className="text-xs font-bold uppercase tracking-widest">Health_100%_Optimal</p>
                        </div>
                    ) : (
                        stats.columns.filter(c => c.missing > 0).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 transition-all hover:scale-[1.02]">
                                <span className="font-mono text-xs font-bold">{c.name}</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{c.missing_pct}% Null</span>
                                    <div className="h-1 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1">
                                        <div className="h-full bg-orange-500" style={{ width: `${c.missing_pct}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CORRELATION BOX (7 COLS) */}
            <div className="lg:col-span-7 bg-zinc-950 text-white rounded-[2rem] p-8 shadow-2xl shadow-indigo-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={120} /></div>
                
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-10 flex items-center gap-2 relative">
                    <Sparkles size={16} className="text-indigo-400" /> Predictive_Drivers_to_{stats.target_column}
                </h3>
                
                <div className="space-y-6 relative">
                    {topFeatures.map((f, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="font-mono text-sm font-bold tracking-tight text-indigo-100">{f.name}</span>
                                <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest">Weight: {f.correlation.toFixed(3)}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                                    style={{ width: `${Math.abs(f.correlation) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* DETAILED SPECIFICATIONS SECTION */}
        <section className="space-y-10">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black tracking-tighter uppercase">Column_Specifications</h2>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stats.columns.map((col, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] hover:shadow-xl transition-all group">
                        
                        {/* Header Kolom */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="space-y-1">
                                <h4 className="font-black text-xl tracking-tight flex items-center gap-3">
                                    {col.name} 
                                    {col.name === stats.target_column && <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded tracking-widest">TARGET</span>}
                                </h4>
                                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                                    <span>{col.type}</span>
                                    <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                    <span>{col.unique.toLocaleString()} Uniques</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Null_Index</p>
                                <div className={`text-xl font-black font-mono ${col.missing > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {col.missing_pct}%
                                </div>
                            </div>
                        </div>

                        {/* CLEANING ACTIONS */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {col.missing > 0 && (
                                <>
                                    <ActionButton icon={<Trash2 size={12}/>} label="Drop_NA" onClick={() => runCleaning("drop_na", col.name)} />
                                    {col.mean !== undefined && <ActionButton icon={<Wand2 size={12}/>} label="Fill_Mean" onClick={() => runCleaning("fill_mean", col.name)} />}
                                </>
                            )}
                            {col.type === "object" && col.name.toLowerCase().includes("charge") && (
                                <button 
                                    onClick={() => runCleaning("convert_numeric", col.name)}
                                    className="px-3 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition uppercase tracking-widest cursor-pointer"
                                >
                                    Force_Numeric_Parse
                                </button>
                            )}
                        </div>

                        {/* STATS AREA */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            {col.mean !== undefined ? (
                                <>
                                    <MetricTile label="Mean" value={col.mean} />
                                    <MetricTile label="Median" value={col.median} />
                                    <MetricTile label="Min" value={col.min} />
                                    <MetricTile label="Max" value={col.max} />
                                </>
                            ) : (
                                <div className="col-span-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Frequency_Inference</p>
                                    <div className="space-y-2">
                                        {col.distribution && Object.entries(col.distribution).map(([k, v]) => (
                                            <div key={k} className="flex justify-between text-[11px] font-mono">
                                                <span className="text-zinc-500 truncate pr-4">{k}</span>
                                                <span className="font-bold">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* DATA SAMPLES */}
                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Ingested_Samples</p>
                            <div className="flex flex-wrap gap-2">
                                {col.sample.map((s, i) => (
                                    <span key={i} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg font-mono font-bold truncate max-w-[120px]">{String(s)}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* AUTOMATED EVALUATION REPORT */}
        {metrics && (
            <div id="report" className="mt-20 bg-zinc-950 text-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/20 border border-white/5 animate-in slide-in-from-bottom-12 duration-1000 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12"><BarChart3 size={250}/></div>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 relative">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-600/30"><Cpu size={40}/></div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Automated_Artifact_Report</h3>
                            <p className="text-indigo-400 text-xs font-mono font-bold tracking-widest uppercase">Kernel: {metrics.model_type}</p>
                        </div>
                    </div>
                    {metrics.artifact_path && (
                        <button 
                            onClick={() => window.open(`http://127.0.0.1:8000/models/download/${metrics.artifact_path}`, "_blank")}
                            className="bg-white text-zinc-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3 cursor-pointer shadow-lg"
                        >
                            <Download size={18} /> Download_Joblib_Asset
                        </button>
                    )}
                </header>

                {/* KPI METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative">
                    <ReportKPI label="Accuracy_Score" value={`${(metrics.accuracy * 100).toFixed(2)}%`} color="text-emerald-400" />
                    <ReportKPI label="F1_Macro_Avg" value={metrics.detailed_report?.['macro avg']?.['f1-score'].toFixed(4) || "N/A"} />
                    <ReportKPI label="Validation_Size" value={metrics.dataset_rows.toLocaleString()} />
                    <ReportKPI label="Fit_Parameters" value={metrics.features_used.length} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
                    {/* FEATURE IMPORTANCE (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp size={18} className="text-indigo-400" />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Decision_Drivers_Analysis</h4>
                        </div>
                        <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-4">
                            {metrics.feature_importance?.map((f, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-mono">
                                        <span className="text-zinc-300">{f.feature}</span>
                                        <span className="text-indigo-400 font-black">{(f.score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${f.score * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* IMPLEMENTATION (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal size={18} className="text-emerald-400" />
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Inference_Snippets</h4>
                        </div>
                        <div className="relative group">
                            <pre className="bg-black/40 p-6 rounded-[2rem] border border-white/5 text-[10px] text-zinc-400 font-mono leading-loose overflow-x-auto">
{`import joblib\n# Load Artifact\nnode = joblib.load('${metrics.artifact_path}')\nmodel = node['model']\n\n# Run Inference\npred = model.predict(X_new)`}
                            </pre>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`import joblib\nartifact = joblib.load('${metrics.artifact_path}')\nmodel = artifact['model']`);
                                    alert("Snippet copied to clipboard.");
                                }}
                                className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-xl transition cursor-pointer"
                            >
                                <Save size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-4 text-xs text-zinc-500">
                    <div className="p-2 bg-indigo-500/10 rounded text-indigo-400"><Info size={14}/></div>
                    <p className="font-mono italic uppercase tracking-tighter">Evaluation_Notice: Results may vary based on cross-validation seed. Ensure data drift is monitored.</p>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ActionButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-[9px] font-black border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition uppercase tracking-widest cursor-pointer flex items-center gap-2"
        >
            {icon} {label}
        </button>
    )
}

function MetricTile({ label, value }: { label: string, value: any }) {
    return (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</span>
            <span className="text-xs font-mono font-bold">{typeof value === 'number' ? value.toFixed(2) : value}</span>
        </div>
    )
}

function ReportKPI({ label, value, color = "text-white" }: { label: string, value: any, color?: string }) {
    return (
        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">{label}</p>
            <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
        </div>
    )
}