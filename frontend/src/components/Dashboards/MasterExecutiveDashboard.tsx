import React, { useState } from 'react';
import {
  CascadingRisk,
  ExecutiveReport,
  AgentHealthItem,
  AgentSubmission,
  AssignedTask,
  DepartmentRequest,
  DepartmentReportItem,
  UploadedDataset,
} from '../../types/santhosh';
import { TaskManager } from '../Executive/TaskManager';
import { DepartmentRequestsManager } from '../Executive/DepartmentRequestsManager';
import { DepartmentReportRepository } from '../Reports/DepartmentReportRepository';
import { DashboardQuickUploader } from '../Upload/DashboardQuickUploader';
import { exportExecutiveReportToPDF } from '../../utils/pdfExport';
import {
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  CheckCircle2,
  FileText,
  Zap,
  Download,
  Eye,
  X,
  Database,
  Layers,
} from 'lucide-react';

interface MasterExecutiveDashboardProps {
  healthScore: number;
  agentHealthList: AgentHealthItem[];
  cascadingRisks: CascadingRisk[];
  executiveReport: ExecutiveReport;
  agentSubmissions?: AgentSubmission[];
  tasks: AssignedTask[];
  requests: DepartmentRequest[];
  departmentReports: DepartmentReportItem[];
  onAddTask: (task: Omit<AssignedTask, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: AssignedTask['status']) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateRequestStatus: (requestId: string, status: 'Approved' | 'Rejected') => void;
  onRefreshReport?: () => void;
  onDatasetUploaded?: (dataset: UploadedDataset) => void;
}

export const MasterExecutiveDashboard: React.FC<MasterExecutiveDashboardProps> = ({
  healthScore,
  agentHealthList,
  cascadingRisks,
  executiveReport,
  agentSubmissions = [],
  tasks,
  requests,
  departmentReports,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onUpdateRequestStatus,
  onRefreshReport,
  onDatasetUploaded,
}) => {
  const [aiQuery, setAiQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<ExecutiveReport | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState<AgentSubmission | null>(null);

  const activeReport = customAnalysis || executiveReport;

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsQuerying(true);
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: aiQuery,
          domain: 'Master Executive Control Tower',
          contextData: { cascadingRisks, healthScore, submissionsCount: agentSubmissions.length },
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        setCustomAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDownloadReport = () => {
    exportExecutiveReportToPDF(activeReport, healthScore, agentSubmissions, tasks);
  };

  return (
    <div className="space-y-8 font-sans">
      {onDatasetUploaded && (
        <DashboardQuickUploader
          currentDomain="master"
          onDatasetUploaded={onDatasetUploaded}
        />
      )}

      {/* Top Banner: Supply Chain Health Score + Agent Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supply Chain Health Score Card */}
        <div className="bg-[#18181B] text-white border border-zinc-800 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono text-[#F5C527] uppercase font-bold tracking-widest block">
                Control Tower Master Score
              </span>
              <h3 className="text-xl font-extrabold text-white">Supply Chain Health Score</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F5C527] text-black flex items-center justify-center font-extrabold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white font-mono tracking-tight">
                {healthScore}
              </span>
              <span className="text-lg font-bold text-[#F5C527] font-mono">/ 100</span>
            </div>
            <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Network Resilience Index: Optimal</span>
            </p>
          </div>

          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-4">
            <div
              className="bg-[#F5C527] h-full rounded-full transition-all duration-500"
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Agent Monitoring Grid */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Autonomous Agent Monitoring</h3>
              <p className="text-xs text-zinc-500">Sub-agent heartbeat & runtime state</p>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
              4 Sub-Agents Online
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {agentHealthList
              .filter((a) => a.id !== 'master')
              .map((agent) => (
                <div
                  key={agent.id}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase truncate">
                      {agent.agentName.replace(' AI Agent', '')}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        agent.status === 'Active'
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <div className="text-xs font-bold text-zinc-900 capitalize">{agent.status}</div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-1">
                    Latency: {agent.responseTimeMs}ms
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* RECEIVED SUB-AGENT SUBMISSIONS SECTION */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
              <Database className="w-4 h-4 text-[#F5C527]" />
              Sub-Agent Operational Feeds
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Received Sub-Agent Submissions ({agentSubmissions.length})</h3>
            <p className="text-xs text-zinc-500">
              Live data feeds dispatched from Procurement, Inventory, Production, and Logistics agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-[#F5C527] text-black px-2.5 py-1 rounded-lg">
              Dynamic Synchronization Active
            </span>
          </div>
        </div>

        {agentSubmissions.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl">
            <Bot className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-zinc-900 mb-1">No Sub-Agent Datasets Sent Yet</h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Switch to any domain dashboard or Upload section, upload/verify a dataset, and click "Send to Master Agent" to see it received live here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-[#F5C527] flex items-center justify-center font-bold text-xs font-mono">
                    {sub.agentId.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900">{sub.agentName}</span>
                      <span className="text-[10px] font-mono text-zinc-500">[{sub.timestamp}]</span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600 font-mono mt-0.5">
                      File: <span className="font-bold text-zinc-900">{sub.fileName}</span> ({sub.recordCount} records)
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{sub.summaryMetrics.keyHighlight}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      sub.summaryMetrics.riskLevel === 'Critical' || sub.summaryMetrics.riskLevel === 'High'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : sub.summaryMetrics.riskLevel === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    Risk: {sub.summaryMetrics.riskLevel}
                  </span>

                  <button
                    onClick={() => setPreviewSubmission(sub)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F5C527]" />
                    <span>Preview Data</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Intelligence Cards */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <AlertTriangle className="w-4 h-4 text-[#F5C527]" />
            Autonomous Risk Intelligence
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Department Risk Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <span className="text-xs text-zinc-500 block mb-1">Supplier Risk</span>
            <div className="text-2xl font-bold text-amber-600 font-mono">Medium (34%)</div>
            <span className="text-[10px] text-zinc-500">Tier-1 microchip lead time variance</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <span className="text-xs text-zinc-500 block mb-1">Inventory Risk</span>
            <div className="text-2xl font-bold text-red-600 font-mono">High (68%)</div>
            <span className="text-[10px] text-zinc-500">Chicago Hub safety stock depletion</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <span className="text-xs text-zinc-500 block mb-1">Production Risk</span>
            <div className="text-2xl font-bold text-amber-600 font-mono">Medium (42%)</div>
            <span className="text-[10px] text-zinc-500">Assembly Line #2 feeder slowdown</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <span className="text-xs text-zinc-500 block mb-1">Delivery Risk</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono">Low (18%)</div>
            <span className="text-[10px] text-zinc-500">Freight OTIF SLA holding stable</span>
          </div>
        </div>
      </div>

      {/* Cross Department Analysis */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-mono text-zinc-900 bg-[#F5C527] px-2 py-0.5 rounded uppercase font-bold tracking-widest block w-fit mb-1">
              Multi-Agent Neural Propagation
            </span>
            <h3 className="text-lg font-bold text-zinc-900">Cross-Department Cascading Risk Analysis</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Cascade Matrix v3.8</span>
        </div>

        <div className="space-y-6">
          {cascadingRisks.map((cascade) => (
            <div
              key={cascade.id}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-0.5 rounded">
                  {cascade.id}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-red-600 font-mono">
                    Financial Impact: {cascade.estimatedFinancialImpact}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cascade.severity === 'Critical'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {cascade.severity}
                  </span>
                </div>
              </div>

              {/* Visual Cascade Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 p-4 bg-white rounded-xl border border-zinc-200">
                <div className="flex flex-col justify-between">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    1. Supplier Delay ({cascade.triggerSource})
                  </span>
                  <p className="text-xs text-zinc-900 font-semibold">{cascade.triggerEvent}</p>
                </div>

                <div className="flex flex-col justify-between md:border-l md:border-zinc-200 md:pl-4">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
                    2. Production Delay
                  </span>
                  <p className="text-xs text-zinc-700">{cascade.intermediateImpact}</p>
                </div>

                <div className="flex flex-col justify-between md:border-l md:border-zinc-200 md:pl-4">
                  <span className="text-[10px] font-semibold text-red-700 uppercase tracking-wider mb-1">
                    3. Shipment Delay
                  </span>
                  <p className="text-xs text-zinc-700">{cascade.finalConsequence}</p>
                </div>
              </div>

              <div className="p-3 bg-[#F5C527]/15 border border-[#F5C527]/40 rounded-xl text-xs text-zinc-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-zinc-900 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 mr-1">AI Master Mitigation:</span>
                  <span>{cascade.aiMitigation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Report Section */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5C527] text-black flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Finalized Master Executive Strategy Report</h3>
              <p className="text-xs text-zinc-500">Produced by Master AI Agent based on active sub-agent feeds</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshReport}
              className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 flex items-center gap-2 cursor-pointer transition-colors border border-zinc-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-900" />
              <span>Regenerate Report</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-[#F5C527]" />
              <span>Download Finalized Report</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Situation */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Current Situation & Sub-Agent Synthesis
            </h4>
            <p className="text-xs text-zinc-700 leading-relaxed">{activeReport.currentSituation}</p>
          </div>

          {/* Critical Issues & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2">
                Critical Issues
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-700 list-disc list-inside">
                {activeReport.criticalIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
                Root Cause Analysis
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed">{activeReport.rootCause}</p>
              
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-4 mb-1">
                Estimated Business Impact
              </h4>
              <p className="text-xs text-zinc-800 font-mono font-bold">{activeReport.businessImpact}</p>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">
              Autonomous Recommended Actions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeReport.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-xl border border-zinc-200 text-xs text-zinc-800 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-[#F5C527] text-black font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE TASK ASSIGNMENT MODULE */}
      <TaskManager
        tasks={tasks}
        onAddTask={onAddTask}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onDeleteTask={onDeleteTask}
      />

      {/* DEPARTMENT REQUESTS MANAGER */}
      <DepartmentRequestsManager
        requests={requests}
        onUpdateRequestStatus={onUpdateRequestStatus}
      />

      {/* DEPARTMENT REPORTS REPOSITORY */}
      <DepartmentReportRepository
        reports={departmentReports}
        activeRole="master"
      />

      {/* Interactive AI Strategy Query Prompt */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-zinc-900" />
          <h3 className="text-base font-bold text-zinc-900">Query Master AI Control Tower</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          Ask questions or run scenario simulations across procurement, inventory, production, and logistics datasets.
        </p>

        <form onSubmit={handleAskAI} className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder="e.g. What happens to assembly lines if MicroTech delay increases to 8 days?"
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
          />
          <button
            type="submit"
            disabled={isQuerying}
            className="px-5 py-2.5 bg-zinc-900 text-white font-bold text-xs rounded-xl hover:bg-black transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isQuerying ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#F5C527]" />
            ) : (
              <Send className="w-4 h-4 text-[#F5C527]" />
            )}
            <span>Analyze</span>
          </button>
        </form>
      </div>

      {/* DATA PREVIEW MODAL FOR RECEIVED AGENT SUBMISSION */}
      {previewSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5C527] text-black flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Received Dataset Preview: {previewSubmission.agentName}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono">
                    File: {previewSubmission.fileName} | Timestamp: {previewSubmission.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewSubmission(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
                <span className="font-bold text-zinc-900 block mb-1">Key Agent Analysis Highlight:</span>
                <p className="text-zinc-600">{previewSubmission.summaryMetrics.keyHighlight}</p>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-white font-mono text-xs">
                <table className="w-full text-left text-zinc-800">
                  <thead className="bg-zinc-100 text-zinc-700 uppercase text-[10px] tracking-wider font-bold border-b border-zinc-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-zinc-400">#</th>
                      {(previewSubmission.columns && previewSubmission.columns.length > 0
                        ? previewSubmission.columns
                        : Object.keys(previewSubmission.previewRecords[0] || {})
                      ).slice(0, 7).map((col, idx) => (
                        <th key={idx} className="px-3 py-2 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {previewSubmission.previewRecords.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-zinc-50">
                        <td className="px-3 py-2 text-zinc-400 font-sans">{rIdx + 1}</td>
                        {(previewSubmission.columns && previewSubmission.columns.length > 0
                          ? previewSubmission.columns
                          : Object.keys(previewSubmission.previewRecords[0] || {})
                        ).slice(0, 7).map((col, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-zinc-800">
                            {String(row[col] ?? row[cIdx] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setPreviewSubmission(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

