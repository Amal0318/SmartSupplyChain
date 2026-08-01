import React, { useState } from 'react';
import { ProcurementRecord, RoleType, AssignedTask, UploadedDataset } from '../../types/santhosh';
import { AgentSyncBanner } from './AgentSyncBanner';
import { DepartmentTaskSection } from '../Department/DepartmentTaskSection';
import { DashboardQuickUploader } from '../Upload/DashboardQuickUploader';
import {
  Users,
  FileCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ProcurementDashboardProps {
  records: ProcurementRecord[];
  tasks?: AssignedTask[];
  onUpdateTaskStatus?: (taskId: string, status: AssignedTask['status']) => void;
  onTriggerReorder?: (vendorId: string) => void;
  onSendToMaster?: (role: RoleType) => void;
  onRequestClick?: () => void;
  onDatasetUploaded?: (dataset: UploadedDataset) => void;
}

const COLORS = ['#F5C527', '#18181B', '#10B981', '#3B82F6', '#EC4899'];

export const ProcurementDashboard: React.FC<ProcurementDashboardProps> = ({
  records,
  tasks = [],
  onUpdateTaskStatus,
  onTriggerReorder,
  onSendToMaster,
  onRequestClick,
  onDatasetUploaded,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // KPI calculations
  const totalSuppliers = new Set(records.map((r) => r.vendorId)).size;
  const activePOs = records.filter((r) => r.status === 'Active' || r.status === 'Delayed').length;
  const avgRiskScore = Math.round(
    records.reduce((acc, r) => acc + r.riskScore, 0) / (records.length || 1)
  );
  const delayedOrders = records.filter((r) => r.status === 'Delayed' || r.status === 'Critical').length;

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Chart Data
  const categorySpendData = records.reduce((acc: any[], item) => {
    const spend = item.quantity * item.unitPrice;
    const existing = acc.find((a) => a.name === item.category);
    if (existing) {
      existing.value += spend;
    } else {
      acc.push({ name: item.category, value: spend });
    }
    return acc;
  }, []);

  const supplierRiskData = records.map((item) => ({
    name: item.supplierName.length > 12 ? item.supplierName.substring(0, 12) + '...' : item.supplierName,
    onTimeRate: item.onTimeRate,
    riskScore: item.riskScore,
  }));

  return (
    <div className="space-y-6 font-sans">
      {onDatasetUploaded && (
        <DashboardQuickUploader
          currentDomain="procurement"
          onDatasetUploaded={onDatasetUploaded}
        />
      )}

      {onSendToMaster && (
        <AgentSyncBanner
          role="procurement"
          agentName="Procurement AI Agent"
          recordCount={records.length}
          onSendToMaster={onSendToMaster}
          onRequestClick={onRequestClick}
        />
      )}

      <DepartmentTaskSection
        currentRole="procurement"
        tasks={tasks}
        onUpdateTaskStatus={onUpdateTaskStatus}
      />

      {/* Top KPI Cards (Styling based on template) */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dark High-Contrast Stat Card */}
        <div className="bg-[#18181B] text-white rounded-2xl p-5 border border-zinc-800 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Active POs
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#F5C527]">
              +11.02%
            </span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mb-1 text-white">{activePOs}</div>
          <p className="text-xs text-zinc-400 font-medium">New Orders in Procurement</p>
        </div>

        {/* Clean White Stat Card */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Suppliers
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mb-1">{totalSuppliers}</div>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2 onboarded this month</span>
          </p>
        </div>

        {/* Yellow Highlight Stat Card */}
        <div className="bg-[#F5C527] text-black rounded-2xl p-5 border border-[#e2b21b] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black/70">
              Avg Risk Score
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/10 text-black">
              Safe Matrix
            </span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mb-1 text-black">{avgRiskScore}</div>
          <p className="text-xs text-black/80 font-bold">AI Calculated Network Risk</p>
        </div>

        {/* Delayed Orders Card */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Delayed Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mb-1 text-red-600">{delayedOrders}</div>
          <p className="text-xs text-red-500 font-semibold">Requires Agent Intervention</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-Time Rate vs Risk Bar Chart */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Supplier On-Time Delivery % vs Risk Score</h4>
              <p className="text-xs text-zinc-500">AI evaluation of vendor performance</p>
            </div>
            <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-1 rounded-md">Real-Time AI</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', color: '#18181b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="onTimeRate" fill="#F5C527" name="On-Time Rate %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="riskScore" fill="#18181B" name="Risk Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend Category Pie Chart */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Procurement Spend Distribution</h4>
              <p className="text-xs text-zinc-500">Total volume allocated across material categories</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categorySpendData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => `$${Number(val).toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', color: '#18181b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Supplier Performance Data Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Active Supplier Purchase Orders</h3>
            <p className="text-xs text-zinc-500">Autonomous Procurement Agent tracking vendor SLAs</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vendor or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50 text-zinc-600 uppercase text-[10px] tracking-wider font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">Vendor Code</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Order Qty</th>
                <th className="px-4 py-3">Delivery Date</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">AI Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {filteredRecords.map((item) => (
                <tr key={item.vendorId} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-zinc-900">{item.vendorId}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-zinc-900">{item.supplierName}</td>
                  <td className="px-4 py-3 font-sans text-zinc-500">{item.category}</td>
                  <td className="px-4 py-3 text-zinc-800">{item.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-600">{item.deliveryDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.riskScore > 70
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : item.riskScore > 30
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.riskScore}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Delayed' || item.status === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : item.status === 'Active'
                          ? 'bg-[#F5C527] text-black'
                          : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onTriggerReorder && onTriggerReorder(item.vendorId)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white hover:bg-black font-sans font-semibold text-[10px] transition-colors cursor-pointer"
                    >
                      Optimize PO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
