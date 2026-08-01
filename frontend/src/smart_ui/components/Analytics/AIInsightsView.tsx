import React from 'react';
import { RoleConfig } from '../../types';
import { Sparkles, TrendingUp, ShieldAlert, Cpu, Lightbulb, ArrowUpRight } from 'lucide-react';
import { downloadExecutivePdfReportApi } from '../../../api/ai_reports';

interface AIInsightsViewProps {
  currentRoleConfig: RoleConfig;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ currentRoleConfig }) => {
  const getDomainInsights = () => {
    switch (currentRoleConfig.id) {
      case 'procurement':
        return [
          {
            type: 'Supplier Benchmark',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            title: 'Lead Time Buffer Optimization (+14.2%)',
            desc: 'Neural model projects Q3 supplier lead times extending by 4.2 days. Recommends raising PO issuance buffers by 14.2%.',
            meta: 'Confidence: 98.4% | Procurement AI Engine',
          },
          {
            type: 'Price Drift Warning',
            color: 'text-amber-700',
            bg: 'bg-amber-50 border-amber-200',
            title: 'MicroTech Component Price Variance',
            desc: 'Unit pricing on IC-9081 has drifted +3.8% above benchmark contract SLA across recent purchase orders.',
            meta: 'Action: Request contract audit or route POs to secondary supplier.',
          },
        ];
      case 'inventory':
        return [
          {
            type: 'Safety Stock Forecast',
            color: 'text-blue-700',
            bg: 'bg-blue-50 border-blue-200',
            title: 'Automated Reorder Trigger for SKU-8819',
            desc: 'Current stock depletion rate predicts safety buffer breach within 72 hours. Auto-reorder queue generated.',
            meta: 'Confidence: 99.1% | Inventory AI Engine',
          },
          {
            type: 'Capacity Optimization',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            title: 'Chicago Hub Space Utilization (91.2%)',
            desc: 'Warehouse capacity approaching optimal ceiling. Re-balancing pallet allocations to Atlanta secondary hub.',
            meta: 'Status: Balanced holding cost vs turnover rate.',
          },
        ];
      case 'production':
        return [
          {
            type: 'IoT Telemetry Prediction',
            color: 'text-purple-700',
            bg: 'bg-purple-50 border-purple-200',
            title: 'Robotic Cell #3 Feeder Calibration Alert',
            desc: 'Vibration sensors on line 2 report micro-stutter anomalies. Predictive maintenance prevents 2-hour downtime.',
            meta: 'Confidence: 96.5% | Production AI Engine',
          },
          {
            type: 'OEE Optimization',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            title: 'Line Throughput Target Surpassed (+8.4%)',
            desc: 'Automated speed modulation increased shift yield from 1,200 to 1,301 finished units without defect spikes.',
            meta: 'Status: Running at peak OEE efficiency.',
          },
        ];
      case 'logistics':
        return [
          {
            type: 'Route Weather & Port Delay',
            color: 'text-red-700',
            bg: 'bg-red-50 border-red-200',
            title: 'Rotterdam Customs Clearance Delay (+24 Hrs)',
            desc: 'Port congestion flagged by satellite telemetry. AI recommends expediting digital customs clearance manifests.',
            meta: 'Confidence: 97.2% | Logistics AI Engine',
          },
          {
            type: 'Carrier Performance',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            title: 'Apex Freight On-Time SLA Improvement (98.1%)',
            desc: 'Dynamic GPS route optimization reduced transit times by an average of 3.4 hours per intermodal shipment.',
            meta: 'Status: Carrier benchmarking score updated.',
          },
        ];
      default:
        return [
          {
            type: 'Cross-Domain Synergy',
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 border-emerald-200',
            title: 'Full Autonomous Supply Chain Alignment',
            desc: 'Multi-agent neural correlation across Procurement, Inventory, Production, and Logistics verified at 94.8%.',
            meta: 'Confidence: 99.5% | Master AI Executive Engine',
          },
          {
            type: 'Risk Mitigation',
            color: 'text-amber-700',
            bg: 'bg-amber-50 border-amber-200',
            title: 'Cascading Bottleneck Neutralized',
            desc: 'Master AI intercepted inventory deficit and triggered synchronized supplier expedites before shop floor stoppage.',
            meta: 'Status: Zero production hours lost.',
          },
        ];
    }
  };

  const domainInsights = getDomainInsights();

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-zinc-900" />
            <h2 className="text-xl font-extrabold text-zinc-900">
              AI Predictive Insights — {currentRoleConfig.roleName}
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            Neural model predictive projections generated specifically by {currentRoleConfig.agentName}.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await downloadExecutivePdfReportApi();
            } catch (err) {
              console.error('Failed to download PDF:', err);
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <TrendingUp className="w-4 h-4 text-[#F5C527]" />
          Download Executive PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {domainInsights.map((insight, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div className={`flex items-center gap-2 mb-3 ${insight.color} font-bold text-xs`}>
              <TrendingUp className="w-4 h-4" />
              <span>{insight.type}</span>
            </div>
            <h4 className="text-base font-bold text-zinc-900 mb-2">
              {insight.title}
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed mb-4">
              {insight.desc}
            </p>
            <div className="text-[10px] font-mono text-zinc-900 bg-[#F5C527] p-2.5 rounded-lg font-bold">
              {insight.meta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
