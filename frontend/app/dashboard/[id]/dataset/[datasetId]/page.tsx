"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  ArrowLeft, BarChart3, FileText, Cpu, Activity, 
  CheckCircle, Download, AlertTriangle, TrendingUp, Info,
  Terminal, Save
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
  feature_importance?: { feature: string; score: number }[]; // Update Interface
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
  
  // State baru untuk pemilihan model
  const [selectedModel, setSelectedModel] = useState("rf"); // Default Random Forest
  
  // State baru untuk proses cleaning
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
      // Mengirim model_type sebagai query parameter
      const res = await api.post(`/models/train-existing/${ids.datasetId}?model_type=${selectedModel}`);
      setMetrics(res.data.metrics);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
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
        alert("Success! A new cleaned version of this dataset has been created.");
        // Arahkan ke dataset hasil cleaning tersebut
        window.location.href = `/dashboard/${ids.id}/dataset/${res.data.new_dataset_id}`;
    } catch (err) {
        alert("Cleaning failed.");
    } finally {
        setIsCleaning(false);
    }
  };

  if (!ids || loading) return <div className="p-12 text-zinc-500 animate-pulse">Running advanced EDA...</div>;
  if (!stats) return <div className="p-12 text-red-500">Error loading data.</div>;

  // Sorting columns by correlation for "Top Features"
  const topFeatures = [...stats.columns]
    .filter(c => c.name !== stats.target_column)
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    .slice(0, 5);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-mono">
      
      {/* HEADER */}
      <div className="mb-10 border-b border-zinc-200 dark:border-zinc-800 pb-8 flex justify-between items-end">
        <div>
            <Link href={`/dashboard/${ids.id}`} className="text-zinc-500 hover:text-black dark:hover:text-white transition text-sm flex items-center gap-2 mb-4">
                <ArrowLeft size={16} /> Back to Project
            </Link>
            <h1 className="text-3xl font-bold tracking-tight uppercase tracking-widest">{stats.filename}</h1>
            <p className="text-zinc-500 mt-2 italic text-sm">Automated EDA & Statistical Insights</p>
        </div>
        
        {/* UI SELECT MODEL & TRAIN BUTTON */}
        <div className="flex gap-2">
            <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-xs font-bold outline-none focus:border-blue-500 transition cursor-pointer"
            >
                <option value="rf">Random Forest (Stable)</option>
                <option value="xgboost">XGBoost (High Performance)</option>
                <option value="lightgbm">LightGBM (Fast & Large Data)</option>
            </select>

            <button 
                onClick={handleTrain}
                disabled={training}
                className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded font-bold flex items-center gap-2 hover:opacity-80 transition disabled:opacity-50 cursor-pointer shadow-lg"
            >
                {training ? <Activity className="animate-spin" size={18} /> : <Cpu size={18} />}
                {training ? "Training..." : "EXECUTE_TRAINING"}
            </button>
        </div>
      </div>

      {/* QUICK INSIGHTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        
        {/* Quality Alerts */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-500" /> Data Quality Alerts
            </h3>
            <div className="space-y-3">
                {stats.columns.filter(c => c.missing > 0).length === 0 ? (
                    <div className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle size={14} /> All columns are 100% complete.
                    </div>
                ) : (
                    stats.columns.filter(c => c.missing > 0).map((c, i) => (
                        <div key={i} className="text-sm flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            <span className="text-zinc-600 dark:text-zinc-400">{c.name}</span>
                            <span className="text-orange-600 font-bold">{c.missing_pct}% Missing</span>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Top Correlations */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-500" /> Correlation to {stats.target_column}
            </h3>
            <div className="space-y-3">
                {topFeatures.map((f, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="font-bold">{f.name}</span>
                            <span className="text-blue-500">{f.correlation}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${Math.abs(f.correlation) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* DETAILED COLUMN LIST */}
      <div className="space-y-8">
        <h2 className="text-lg font-bold border-l-4 border-zinc-900 dark:border-white pl-3">COLUMN_SPECIFICATIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.columns.map((col, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800 p-6 rounded hover:border-zinc-400 dark:hover:border-zinc-600 transition shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                {col.name} {col.name === stats.target_column && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded">TARGET</span>}
                            </h4>
                            <code className="text-[10px] text-zinc-500 uppercase">{col.type} • {col.unique} Unique Values</code>
                        </div>
                        <div className="text-right">
                             <div className="text-[10px] text-zinc-400 uppercase">Missing</div>
                             <div className={`text-sm font-bold ${col.missing > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                {col.missing_pct}%
                             </div>
                        </div>
                    </div>

                    {/* ACTION BUTTONS FOR CLEANING */}
                    <div className="mb-6">
                        {col.missing > 0 && (
                            <div className="flex gap-2">
                                <button 
                                    disabled={isCleaning}
                                    onClick={() => runCleaning("drop_na", col.name)}
                                    className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100 transition cursor-pointer"
                                >
                                    DROP_MISSING_ROWS
                                </button>
                                {(col.mean !== undefined) && ( // Check if numeric (using mean existence)
                                    <button 
                                        disabled={isCleaning}
                                        onClick={() => runCleaning("fill_mean", col.name)}
                                        className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                                    >
                                        FILL_WITH_MEAN
                                    </button>
                                )}
                            </div>
                        )}

                        {/* KHUSUS UNTUK KASUS TotalCharges (Tipe Object padahal harusnya Float) */}
                        {col.type === "object" && col.name.toLowerCase().includes("charge") && (
                            <button 
                                disabled={isCleaning}
                                onClick={() => runCleaning("convert_numeric", col.name)}
                                className="mt-2 text-[10px] bg-orange-50 dark:bg-orange-900/20 text-orange-600 px-2 py-1 rounded border border-orange-200 hover:bg-orange-100 transition cursor-pointer w-full"
                            >
                                FIX: FORCE_NUMERIC_CONVERSION
                            </button>
                        )}
                    </div>

                    {/* Numeric Stats */}
                    {col.mean !== undefined ? (
                        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                            <StatBox label="Mean" value={col.mean} />
                            <StatBox label="Median" value={col.median} />
                            <StatBox label="Min" value={col.min} />
                            <StatBox label="Max" value={col.max} />
                        </div>
                    ) : (
                        <div className="mb-6">
                            <div className="text-[10px] text-zinc-500 uppercase mb-2">Distribution</div>
                            <div className="space-y-2">
                                {col.distribution && Object.entries(col.distribution).map(([k, v]) => (
                                    <div key={k} className="flex justify-between text-xs border-b border-zinc-50 dark:border-zinc-800 pb-1">
                                        <span className="truncate w-32">{k}</span>
                                        <span className="font-bold">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sample Row */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="text-[10px] text-zinc-500 uppercase mb-2">Samples</div>
                        <div className="flex gap-2">
                            {col.sample.map((s, i) => (
                                <span key={i} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono truncate max-w-[100px]">{String(s)}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MODELING RESULT OVERLAY - UPDATED PROFESSIONAL DASHBOARD */}
      {metrics && (
          <div className="mt-16 bg-zinc-900 text-white p-8 rounded shadow-2xl border border-blue-500/30 animate-in slide-in-from-bottom-10 duration-700">
              <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 rounded shadow-lg shadow-blue-500/20"><BarChart3 size={28}/></div>
                      <div>
                          <h3 className="text-2xl font-bold tracking-tighter uppercase">Model_Evaluation_Report</h3>
                          <p className="text-blue-400 text-sm font-bold">ALGORITHM: {metrics.model_type}</p>
                      </div>
                  </div>
                  {metrics.artifact_path && (
                      <button 
                          onClick={() => window.open(`http://127.0.0.1:8000/models/download/${metrics.artifact_path}`, "_blank")}
                          className="bg-white text-black px-4 py-2 rounded text-xs font-bold hover:bg-zinc-200 transition flex items-center gap-2 cursor-pointer"
                      >
                          <Download size={14} /> DOWNLOAD_MODEL
                      </button>
                  )}
              </div>

              {/* 1. TOP LEVEL METRICS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <MetricSquare label="OVERALL_ACCURACY" value={`${(metrics.accuracy * 100).toFixed(1)}%`} color="text-green-400" />
                  <MetricSquare label="MACRO_F1_SCORE" value={metrics.detailed_report?.['macro avg']?.['f1-score'].toFixed(3) || "N/A"} />
                  <MetricSquare label="SAMPLES_TRAINED" value={metrics.dataset_rows} />
                  <MetricSquare label="FEATURES_COUNT" value={metrics.features_used.length} />
              </div>

              {/* 2. DETAILED CLASSIFICATION REPORT TABLE */}
              <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Class_Specific_Metrics</h4>
                  <div className="overflow-hidden border border-zinc-800 rounded">
                      <table className="w-full text-sm text-left font-mono">
                          <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px]">
                              <tr>
                                  <th className="px-4 py-3">Class_Label</th>
                                  <th className="px-4 py-3">Precision</th>
                                  <th className="px-4 py-3">Recall</th>
                                  <th className="px-4 py-3">F1-Score</th>
                                  <th className="px-4 py-3">Support</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                              {metrics.detailed_report && Object.entries(metrics.detailed_report)
                                  .filter(([key]) => !['accuracy', 'macro avg', 'weighted avg'].includes(key))
                                  .map(([className, scores]: [string, any]) => (
                                      <tr key={className} className="hover:bg-white/5">
                                          <td className="px-4 py-3 font-bold text-blue-400">{className}</td>
                                          <td className="px-4 py-3">{(scores.precision * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3">{(scores.recall * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3">{(scores['f1-score'] * 100).toFixed(1)}%</td>
                                          <td className="px-4 py-3 text-zinc-500">{scores.support}</td>
                                      </tr>
                                  ))
                              }
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* 3. FEATURE IMPORTANCE & CODE SNIPPET */}
              <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Feature Importance List */}
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <TrendingUp size={14} /> Top_Inference_Drivers
                      </h4>
                      <div className="space-y-3 bg-black/20 p-4 rounded border border-zinc-800">
                          {metrics.feature_importance?.map((f, i) => (
                              <div key={i} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-mono">
                                      <span className="text-zinc-300">{f.feature}</span>
                                      <span className="text-blue-400">{(f.score * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                      <div 
                                          className="h-full bg-blue-600 transition-all duration-1000" 
                                          style={{ width: `${f.score * 100}%` }}
                                      />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Code Snippet Implementation */}
                  <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Terminal size={14} /> Python_Implementation
                      </h4>
                      <div className="relative group">
                          <pre className="bg-zinc-950 p-4 rounded border border-zinc-800 text-[10px] text-zinc-400 font-mono leading-relaxed overflow-x-auto">
{`import joblib
import pandas as pd

# 1. Load the DATAION artifact
artifact = joblib.load('${metrics.artifact_path}')
model = artifact['model']
features = artifact['features']

# 2. Prepare your data (must match training features)
# data = pd.get_dummies(raw_data).reindex(columns=features, fill_value=0)

# 3. Predict
# result = model.predict(data)`}
                          </pre>
                          <button 
                              onClick={() => {
                                  navigator.clipboard.writeText(`import joblib\nartifact = joblib.load('${metrics.artifact_path}')\nmodel = artifact['model']`);
                                  alert("Snippet copied!");
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-zinc-800 text-zinc-400 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                              <Save size={12} />
                          </button>
                      </div>
                  </div>
              </div>

              {/* 4. INSIGHT FOOTER */}
              <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center gap-3 text-xs text-zinc-500">
                  <Info size={14} className="text-blue-500" />
                  <p>Data Scientist Tip: High <strong>Recall</strong> is crucial for churn to minimize &quot;False Negatives&quot; (missing customers who actually leave).</p>
              </div>
          </div>
      )}

    </div>
  );
}

// -- Helper Components --

function StatBox({ label, value }: { label: string, value: any }) {
    return (
        <div className="p-2 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 rounded">
            <div className="text-[9px] text-zinc-500 uppercase mb-1">{label}</div>
            <div className="text-sm font-bold font-mono tracking-tighter">{value}</div>
        </div>
    )
}

function MetricSquare({ label, value, color = "text-white" }: { label: string, value: any, color?: string }) {
    return (
        <div className="bg-white/5 p-4 rounded border border-white/10">
            <div className="text-[9px] text-zinc-500 uppercase mb-1 tracking-widest">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
    )
}