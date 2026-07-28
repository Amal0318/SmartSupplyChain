import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Activity, 
  Box, 
  Truck, 
  Factory, 
  ShoppingCart, 
  BrainCircuit, 
  LogOut, 
  Shield, 
  CheckCircle2, 
  Warehouse as WarehouseIcon,
  Users,
  Sliders
} from 'lucide-react';

import { ProcurementDashboardPage } from './ProcurementDashboardPage';
import { InventoryDashboardPage } from './InventoryDashboardPage';
import { ProductionDashboardPage } from './ProductionDashboardPage';
import { LogisticsDashboardPage } from './LogisticsDashboardPage';
import { AgentHealthDashboardPage } from './AgentHealthDashboardPage';
import { ExecutiveAnalyticsDashboardPage } from './ExecutiveAnalyticsDashboardPage';
import { WarehouseOperationsDashboardPage } from './WarehouseOperationsDashboardPage';
import { SupplierProductDashboardPage } from './SupplierProductDashboardPage';
import { AdminDashboardPage } from './AdminDashboardPage';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'procurement' | 'inventory' | 'production' | 'logistics' | 'ai' | 'warehouse' | 'supplier' | 'admin'>('overview');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">Smart Supply Chain Control Tower</h1>
            <p className="text-[10px] text-slate-400">Multi-Agent AI Decision Intelligence Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Agent Control Tower: 🟢 HEALTHY</span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">{user?.first_name || 'Alexander'} {user?.last_name || 'Vance'}</p>
              <p className="text-[10px] text-blue-400 font-mono">{user?.role || 'ADMIN'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900/50 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Modules</p>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              Executive Control Tower
            </button>

            <button
              onClick={() => setActiveTab('procurement')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'procurement' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Procurement & Sourcing
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Box className="w-4 h-4" />
              Inventory & Balance
            </button>

            <button
              onClick={() => setActiveTab('warehouse')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'warehouse' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <WarehouseIcon className="w-4 h-4" />
              Warehouse Operations
            </button>

            <button
              onClick={() => setActiveTab('production')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'production' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Factory className="w-4 h-4" />
              Production & Factory
            </button>

            <button
              onClick={() => setActiveTab('logistics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'logistics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              Logistics & Transit
            </button>

            <button
              onClick={() => setActiveTab('supplier')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'supplier' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Supplier Catalog
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'ai' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Multi-Agent Health & AI
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              System Admin
            </button>
          </nav>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs mt-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-300">System Mode</span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise SCM operational base with AI Fault Tolerance layer active.</p>
          </div>
        </aside>

        {/* Content View */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950">
          {activeTab === 'overview' && <ExecutiveAnalyticsDashboardPage />}
          {activeTab === 'procurement' && <ProcurementDashboardPage />}
          {activeTab === 'inventory' && <InventoryDashboardPage />}
          {activeTab === 'warehouse' && <WarehouseOperationsDashboardPage />}
          {activeTab === 'production' && <ProductionDashboardPage />}
          {activeTab === 'logistics' && <LogisticsDashboardPage />}
          {activeTab === 'supplier' && <SupplierProductDashboardPage />}
          {activeTab === 'ai' && <AgentHealthDashboardPage />}
          {activeTab === 'admin' && <AdminDashboardPage />}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
