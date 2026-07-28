import React, { useEffect, useState } from 'react';
import { supplierService } from '../services/supplierService';
import { productService } from '../services/productService';
import { Supplier } from '../types/supplier';
import { Product } from '../types/product';
import { Users, Package, Star, Search, Filter, ShieldCheck, Download } from 'lucide-react';

export const SupplierProductDashboardPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'products'>('suppliers');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, p] = await Promise.all([supplierService.getAll(), productService.getAll()]);
        setSuppliers(s);
        setProducts(p);
      } catch {
        // Fallback for demonstration
        setSuppliers([
          {
            id: '1',
            code: 'SUP-001',
            company_name: 'Acme Components Corp',
            email: 'sales@acme.com',
            rating: 4.8,
            otif_rate: 96.5,
            lead_time_days: 5,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            code: 'SUP-002',
            company_name: 'Global Logistics & Supply Ltd',
            email: 'orders@globallogistics.com',
            rating: 4.2,
            otif_rate: 88.0,
            lead_time_days: 9,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);

        setProducts([
          {
            id: '1',
            sku: 'SKU-RAW-101',
            name: 'Industrial Microcontroller Unit (MCU-V2)',
            unit_of_measure: 'pcs',
            unit_cost: 42.50,
            reorder_level: 100,
            safety_stock: 50,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            sku: 'SKU-ALU-205',
            name: 'Precision Anodized Aluminum Sheet (4x8ft)',
            unit_of_measure: 'sheets',
            unit_cost: 115.00,
            reorder_level: 40,
            safety_stock: 20,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    };
    fetchData();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (s) => s.company_name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Supplier & Product Management Workspace</h1>
          <p className="text-xs text-slate-400">Master Data Catalog, Performance Rating Metrics, SKU Specifications & Import/Export</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 rounded-xl transition">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'suppliers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Suppliers Directory ({suppliers.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Product Catalog ({products.length})
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'suppliers' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            Verified Vendor Directory & OTIF Ratings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Vendor Code</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">OTIF Score</th>
                  <th className="py-3 px-4">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-blue-400">{s.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-100">{s.company_name}</td>
                    <td className="py-3 px-4 text-slate-400">{s.email}</td>
                    <td className="py-3 px-4 text-slate-300">{s.lead_time_days} days</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        s.otif_rate >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {s.otif_rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {s.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-400" />
            Product SKU Master Catalog & Reorder Thresholds
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">UOM</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-4">Safety Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-blue-400">{p.sku}</td>
                    <td className="py-3 px-4 font-medium text-slate-100">{p.name}</td>
                    <td className="py-3 px-4 text-slate-400 uppercase">{p.unit_of_measure}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">${p.unit_cost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-amber-400 font-medium">{p.reorder_level}</td>
                    <td className="py-3 px-4 text-slate-400">{p.safety_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
