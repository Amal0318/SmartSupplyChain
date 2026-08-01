import React, { useState } from 'react';
import { LogisticsRecord, RoleType, AssignedTask, UploadedDataset } from '../../types/santhosh';
import { AgentSyncBanner } from './AgentSyncBanner';
import { DepartmentTaskSection } from '../Department/DepartmentTaskSection';
import { DashboardQuickUploader } from '../Upload/DashboardQuickUploader';
import {
  Truck,
  CheckCircle2,
  Clock,
  Navigation,
  Globe,
  MapPin,
  Search,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface LogisticsDashboardProps {
  records: LogisticsRecord[];
  tasks?: AssignedTask[];
  onUpdateTaskStatus?: (taskId: string, status: AssignedTask['status']) => void;
  onSendToMaster?: (role: RoleType) => void;
  onRerouteShipment?: (shipmentId: string) => void;
  onRequestClick?: () => void;
  onDatasetUploaded?: (dataset: UploadedDataset) => void;
}

export const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({
  records,
  tasks = [],
  onUpdateTaskStatus,
  onSendToMaster,
  onRerouteShipment,
  onRequestClick,
  onDatasetUploaded,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Top KPI calculations (Section 6 Specs)
  const activeShipments = records.filter(
    (r) => r.currentStatus === 'In Transit' || r.currentStatus === 'Delayed' || r.currentStatus === 'Customs Hold'
  ).length;

  const deliveredOrders = records.filter((r) => r.currentStatus === 'Delivered').length;

  const delayedShipments = records.filter(
    (r) => r.currentStatus === 'Delayed' || r.currentStatus === 'Customs Hold'
  ).length;

  const avgEtaAccuracy = Math.round(
    records.reduce((acc, r) => acc + r.etaAccuracy, 0) / (records.length || 1)
  );

  const filteredRecords = records.filter(
    (r) =>
      r.shipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const carrierChartData = records.map((r) => ({
    carrier: r.carrier.length > 15 ? r.carrier.substring(0, 15) + '...' : r.carrier,
    etaAccuracy: r.etaAccuracy,
    delayHours: r.delayHours,
  }));

  return (
    <div className="space-y-6 font-sans">
      {onDatasetUploaded && (
        <DashboardQuickUploader
          currentDomain="logistics"
          onDatasetUploaded={onDatasetUploaded}
        />
      )}

      {onSendToMaster && (
        <AgentSyncBanner
          role="logistics"
          agentName="Logistics AI Agent"
          recordCount={records.length}
          onSendToMaster={onSendToMaster}
          onRequestClick={onRequestClick}
        />
      )}

      <DepartmentTaskSection
        currentRole="logistics"
        tasks={tasks}
        onUpdateTaskStatus={onUpdateTaskStatus}
      />

      {/* Top KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Shipments */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Shipments
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{activeShipments}</div>
          <p className="text-xs text-zinc-500 font-medium">In transit across air, ocean, road</p>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Delivered Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{deliveredOrders}</div>
          <p className="text-xs text-emerald-600 font-semibold">Fulfilled within target SLA</p>
        </div>

        {/* Delayed Shipments */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Delayed Shipments
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1 text-red-600">{delayedShipments}</div>
          <p className="text-xs text-red-500 font-medium">Port or customs bottleneck</p>
        </div>

        {/* ETA Accuracy */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              ETA Accuracy
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{avgEtaAccuracy}%</div>
          <p className="text-xs text-zinc-500 font-medium">AI Machine Learning Predictive Rate</p>
        </div>
      </div>

      {/* ETA Accuracy & Delay Chart */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Carrier ETA Accuracy (%) & Delay Duration (Hours)</h4>
            <p className="text-xs text-zinc-500">Logistics AI Agent carrier benchmarking</p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-1 rounded-md">Satellite GPS Telemetry</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={carrierChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="carrier" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', color: '#18181b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="etaAccuracy" fill="#F5C527" name="ETA Accuracy %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayHours" fill="#18181B" name="Delay Duration (Hrs)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Freight Tracking Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Active Freight Tracking & Route Risk</h3>
            <p className="text-xs text-zinc-500">Real-time GPS tracking across international shipping lanes</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tracking ID or carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50 text-zinc-600 uppercase text-[10px] tracking-wider font-bold border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Carrier</th>
                <th className="px-4 py-3">Route (Origin → Destination)</th>
                <th className="px-4 py-3">Expected ETA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delay (Hrs)</th>
                <th className="px-4 py-3 text-right">Route Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {filteredRecords.map((item) => (
                <tr key={item.shipmentId} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-zinc-900">{item.shipmentId}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-zinc-900">{item.carrier}</td>
                  <td className="px-4 py-3 font-sans text-zinc-600 flex items-center gap-1.5">
                    <span>{item.origin}</span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-zinc-900 font-semibold">{item.destination}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{item.expectedEta}</td>
                  <td className="px-4 py-3 font-sans">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.currentStatus === 'Delayed' || item.currentStatus === 'Customs Hold'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : item.currentStatus === 'In Transit'
                          ? 'bg-[#F5C527] text-black'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={item.delayHours > 0 ? 'text-red-600 font-bold' : 'text-zinc-500'}>
                      {item.delayHours > 0 ? `+${item.delayHours} hrs` : 'On Time'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRerouteShipment && onRerouteShipment(item.shipmentId)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 text-white hover:bg-black font-sans font-semibold text-[10px] transition-colors cursor-pointer shadow-xs"
                    >
                      {item.currentStatus === 'Delayed' || item.currentStatus === 'Customs Hold'
                        ? 'Expedite & Reroute'
                        : 'Optimize Route'}
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
