import React, { useState } from 'react';
import { InventoryRecord, RoleType, AssignedTask, UploadedDataset } from '../../types';
import { AgentSyncBanner } from './AgentSyncBanner';
import { DepartmentTaskSection } from '../Department/DepartmentTaskSection';
import { DashboardQuickUploader } from '../Upload/DashboardQuickUploader';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  Warehouse,
  TrendingDown,
  Search,
  RefreshCw,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface InventoryDashboardProps {
  records: InventoryRecord[];
  tasks?: AssignedTask[];
  onUpdateTaskStatus?: (taskId: string, status: AssignedTask['status']) => void;
  onTriggerReorder?: (sku: string) => void;
  onSendToMaster?: (role: RoleType) => void;
  onRequestClick?: () => void;
  onDatasetUploaded?: (dataset: UploadedDataset) => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  records,
  tasks = [],
  onUpdateTaskStatus,
  onTriggerReorder,
  onSendToMaster,
  onRequestClick,
  onDatasetUploaded,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Top KPI calculations (Section 6 Specs)
  const totalStock = records.reduce((acc, r) => acc + r.stockLevel, 0);
  const lowStockItems = records.filter((r) => r.status === 'Low Stock' || r.status === 'Critical').length;
  const overstockItems = records.filter((r) => r.status === 'Overstock').length;
  
  const totalCapacity = records.reduce((acc, r) => acc + r.maxCapacity, 0);
  const warehouseUtilization = Math.round((totalStock / (totalCapacity || 1)) * 100);

  const filteredRecords = records.filter((r) =>
    r.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const warehouseChartData = records.map((r) => ({
    sku: r.sku,
    stockLevel: r.stockLevel,
    reorderPoint: r.reorderPoint,
    capacity: r.maxCapacity,
  }));

  return (
    <div className="space-y-6 font-sans">
      {onDatasetUploaded && (
        <DashboardQuickUploader
          currentDomain="inventory"
          onDatasetUploaded={onDatasetUploaded}
        />
      )}

      {onSendToMaster && (
        <AgentSyncBanner
          role="inventory"
          agentName="Inventory AI Agent"
          recordCount={records.length}
          onSendToMaster={onSendToMaster}
          onRequestClick={onRequestClick}
        />
      )}

      <DepartmentTaskSection
        currentRole="inventory"
        tasks={tasks}
        onUpdateTaskStatus={onUpdateTaskStatus}
      />

      {/* Top KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{totalStock.toLocaleString()}</div>
          <p className="text-xs text-zinc-500 font-medium">Units stored across network</p>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Low Stock Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1 text-amber-600">{lowStockItems}</div>
          <p className="text-xs text-amber-600 font-medium">Below safety buffer threshold</p>
        </div>

        {/* Overstock Items */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Overstock Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{overstockItems}</div>
          <p className="text-xs text-zinc-500 font-medium">Incurring holding cost excess</p>
        </div>

        {/* Warehouse Utilization */}
        <div className="bg-white text-zinc-900 rounded-2xl p-5 border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Warehouse Utilization
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold tracking-tight mb-1">{warehouseUtilization}%</div>
          <p className="text-xs text-emerald-600 font-semibold">Optimal Storage Capacity</p>
        </div>
      </div>

      {/* Stock Level vs Reorder Point Chart */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900">Stock Level vs Safety Reorder Point by SKU</h4>
            <p className="text-xs text-zinc-500">Inventory AI Agent real-time safety buffer monitoring</p>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-1 rounded-md">Auto-Reorder Engine</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={warehouseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="sku" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', color: '#18181b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              />
              <Legend />
              <Bar dataKey="stockLevel" fill="#F5C527" name="On-Hand Stock" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reorderPoint" fill="#18181B" name="Reorder Point Threshold" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Multi-Warehouse Inventory Stock</h3>
            <p className="text-xs text-zinc-500">Stock levels, safety points, and unit valuation</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search SKU, name, or facility..."
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
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Item Description</th>
                <th className="px-4 py-3">Warehouse Hub</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Reorder Point</th>
                <th className="px-4 py-3">Unit Valuation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {filteredRecords.map((item) => (
                <tr key={item.sku} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-zinc-900">{item.sku}</td>
                  <td className="px-4 py-3 font-sans font-semibold text-zinc-900">{item.itemName}</td>
                  <td className="px-4 py-3 font-sans text-zinc-500">{item.warehouseLocation}</td>
                  <td className="px-4 py-3 text-zinc-900 font-bold">{item.stockLevel.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-500">{item.reorderPoint.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-700 font-semibold">${item.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-3 font-sans">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Low Stock' || item.status === 'Critical'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : item.status === 'Overstock'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-[#F5C527] text-black'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onTriggerReorder && onTriggerReorder(item.sku)}
                      className="px-2.5 py-1 rounded-lg bg-[#F5C527] text-black font-sans font-bold text-[10px] hover:bg-[#f3bd14] transition-colors cursor-pointer"
                    >
                      Trigger Reorder
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
