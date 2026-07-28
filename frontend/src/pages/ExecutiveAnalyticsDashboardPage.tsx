import React, { useEffect, useState } from 'react';
import { analyticsService, ExecutiveSummary, DemandForecast } from '../services/analyticsService';
import { BarChart3, TrendingUp, DollarSign, Box, Factory, Truck, Download, Calendar, ShieldCheck } from 'lucide-react';

export const ExecutiveAnalyticsDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, f] = await Promise.all([analyticsService.getExecutiveSummary(), analyticsService.getForecasts()]);
        setSummary(s);
        setForecasts(f);
      } catch {
        // Fallback for demonstration
        setSummary({
          total_procurement_spend: 1248500.0,
          total_inventory_valuation: 489250.0,
          overall_equipment_effectiveness: 98.4,
          on_time_delivery_rate: 96.8,
          vendor_otif_average: 94.5,
          active_work_orders_count: 4,
          low_stock_alerts_count: 4,
          total_employees_count: 48,
          system_health: 'HEALTHY (100% OPERATIONAL)',
        });

        setForecasts([
          {
            id: '1',
            product_id: 'SKU-RAW-101 (MCU Unit)',
            forecast_period: '2026-Q3',
            predicted_demand_qty: 2400,
            confidence_score: 94.2,
            algorithm_type: 'PROPHET_ARIMA_HYBRID',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            product_id: 'SKU-ALU-205 (Aluminum Sheet)',
            forecast_period: '2026-Q3',
            predicted_demand_qty: 850,
            confidence_score: 91.8,
            algorithm_type: 'EXPONENTIAL_SMOOTHING',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    };
    loadData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Executive Intelligence & Cross-Module Analytics Engine</h1>
          <p className="text-xs text-slate-400">Enterprise BI Metrics, Demand Forecasting Placeholders & Cross-Department Reports</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 rounded-xl transition">
            <Download className="w-3.5 h-3.5" />
            Export Executive PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 rounded-xl transition">
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Cross-Module KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-blue-500/10 px-2 py-0.5 rounded text-blue-300">PROCUREMENT</span>
          </div>
          <p className="text-xs text-slate-400">Total Spend</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">${summary?.total_procurement_spend.toLocaleString() || '1,248,500'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <Box className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-300">INVENTORY</span>
          </div>
          <p className="text-xs text-slate-400">Stock Valuation</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">${summary?.total_inventory_valuation.toLocaleString() || '489,250'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <Factory className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-purple-500/10 px-2 py-0.5 rounded text-purple-300">FACTORY OEE</span>
          </div>
          <p className="text-xs text-slate-400">Equipment Effectiveness</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{summary?.overall_equipment_effectiveness || 98.4}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <Truck className="w-5 h-5" />
            <span className="text-[10px] font-mono bg-amber-500/10 px-2 py-0.5 rounded text-amber-300">LOGISTICS OTD</span>
          </div>
          <p className="text-xs text-slate-400">On-Time Delivery</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{summary?.on_time_delivery_rate || 96.8}%</p>
        </div>
      </div>

      {/* Demand Forecast Placeholders Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Predictive Demand & Reorder Forecast Placeholders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Product Target</th>
                <th className="py-3 px-4">Forecast Period</th>
                <th className="py-3 px-4">Predicted Demand Qty</th>
                <th className="py-3 px-4">Confidence Score</th>
                <th className="py-3 px-4">Algorithm Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {forecasts.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-medium text-slate-100">{f.product_id}</td>
                  <td className="py-3 px-4 text-slate-400">{f.forecast_period}</td>
                  <td className="py-3 px-4 font-bold text-blue-400">{f.predicted_demand_qty.toLocaleString()} units</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">
                      {f.confidence_score}% Confidence
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{f.algorithm_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
