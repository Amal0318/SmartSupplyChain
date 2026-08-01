import React from 'react';
import { ProductionRecord, RoleType, AssignedTask, UploadedDataset } from '../../types/santhosh';
import { AgentSyncBanner } from './AgentSyncBanner';
import { DepartmentTaskSection } from '../Department/DepartmentTaskSection';
import { DashboardQuickUploader } from '../Upload/DashboardQuickUploader';
import {
  Factory,
  Zap,
  Cpu,
  AlertOctagon,
  Clock,
  PlayCircle,
  PauseCircle,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface ProductionDashboardProps {
  records: ProductionRecord[];
  tasks?: AssignedTask[];
  onUpdateTaskStatus?: (taskId: string, status: AssignedTask['status']) => void;
  onSendToMaster?: (role: RoleType) => void;
  onResolveBottleneck?: (jobId: string) => void;
  onRequestClick?: () => void;
  onDatasetUploaded?: (dataset: UploadedDataset) => void;
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({
  records,
  tasks = [],
  onUpdateTaskStatus,
  onSendToMaster,
  onResolveBottleneck,
  onRequestClick,
  onDatasetUploaded,
}) => {
  // KPI Calculations (Section 6 Specs)
  const activeJobs = records.filter((r) => r.status === 'Running' || r.status === 'Bottleneck').length;
  
  const avgOee = Math.round(
    records.reduce((acc, r) => acc + r.oeePercent, 0) / (records.length || 1)
  );

  const avgUtilization = Math.round(
    records.reduce((acc, r) => acc + r.machineUtilization, 0) / (records.length || 1)
  );

  const bottlenecks = records.filter((r) => r.status === 'Bottleneck' || r.status === 'Stalled').length;

  const chartData = records.map((r) => ({
    line: r.lineName.length > 15 ? r.lineName.substring(0, 15) + '...' : r.lineName,
    target: r.targetOutput,
    actual: r.actualOutput,
    oee: r.oeePercent,
  }));

  return (
    <div className="space-y-6 font-sans">
      {onDatasetUploaded && (
        <DashboardQuickUploader
          currentDomain="production"
          onDatasetUploaded={onDatasetUploaded}
        />
      )}

      {onSendToMaster && (
        <AgentSyncBanner
          role="production"
          agentName="Production AI Agent"
          recordCount={records.length}
          onSendToMaster={onSendToMaster}
          onRequestClick={onRequestClick}
        />
      )}

      <DepartmentTaskSection
        currentRole="production"
        tasks={tasks}
        onUpdateTaskStatus={onUpdateTaskStatus}
      />

      {/* Top KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Jobs */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Jobs
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{activeJobs}</div>
          <p className="text-xs text-zinc-500 font-medium">Work orders on shop floor</p>
        </div>

        {/* Production Efficiency (OEE) */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Production Efficiency
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{avgOee}%</div>
          <p className="text-xs text-emerald-600 font-semibold">Overall Equipment Effectiveness (OEE)</p>
        </div>

        {/* Machine Utilization */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Machine Utilization
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{avgUtilization}%</div>
          <p className="text-xs text-zinc-500 font-medium">Spindle & Robotic Cell Uptime</p>
        </div>

        {/* Bottlenecks */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Bottlenecks
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1 text-red-600">{bottlenecks}</div>
          <p className="text-xs text-red-500 font-medium">Production Stoppages Flagged</p>
        </div>
      </div>

      {/* Target Output vs Actual Output Chart */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Target Output vs Actual Units Produced by Line</h4>
            <p className="text-xs text-zinc-500">Production AI Agent shift throughput comparison</p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-1 rounded-md">Line Sensor Stream</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="line" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', color: '#18181b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="target" fill="#18181B" name="Target Target Output" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#F5C527" name="Actual Manufactured" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assembly Lines Status Cards */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="mb-6">
          <h3 className="text-base font-bold text-zinc-900">Assembly Line Real-Time Control Grid</h3>
          <p className="text-xs text-zinc-500">Live feed from shop floor IoT controllers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((line) => (
            <div
              key={line.jobId}
              className={`p-5 rounded-2xl border transition-all ${
                line.status === 'Bottleneck' || line.status === 'Stalled'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-900 uppercase font-bold bg-[#F5C527] px-1.5 py-0.5 rounded">
                    {line.jobId}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 mt-1">{line.lineName}</h4>
                  <p className="text-xs text-zinc-500">Product: {line.productName}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    line.status === 'Running'
                      ? 'bg-[#F5C527] text-black'
                      : line.status === 'Bottleneck'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {line.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4 bg-white p-3 rounded-xl border border-zinc-200 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Actual Output</span>
                  <span className="text-zinc-900 font-bold">{line.actualOutput} / {line.targetOutput}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Line OEE</span>
                  <span className="text-zinc-900 font-bold">{line.oeePercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Downtime</span>
                  <span className={line.downtimeMins > 30 ? 'text-red-600 font-bold' : 'text-zinc-700'}>
                    {line.downtimeMins} mins
                  </span>
                </div>
              </div>

              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    line.oeePercent > 80 ? 'bg-emerald-500' : line.oeePercent > 65 ? 'bg-[#F5C527]' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(line.oeePercent, 100)}%` }}
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onResolveBottleneck && onResolveBottleneck(line.jobId)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white hover:bg-black font-sans font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#F5C527]" />
                  <span>{line.status === 'Running' ? 'Calibrate Sensors' : 'Resolve Bottleneck'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
