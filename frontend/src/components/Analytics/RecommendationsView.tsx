import React from 'react';
import { RoleConfig } from '../../types/santhosh';
import { Lightbulb, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface RecommendationsViewProps {
  currentRoleConfig: RoleConfig;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ currentRoleConfig }) => {
  const allRecommendations = [
    {
      id: 'proc-1',
      title: 'Automate Tier-1 Supplier SLA Escalation',
      domain: 'Procurement',
      roleId: 'procurement',
      impact: 'High ($42k cost reduction)',
      description: 'Configure automatic PO volume reallocation when vendor on-time delivery falls below 85%.',
    },
    {
      id: 'proc-2',
      title: 'Consolidate MicroTech Order Batches',
      domain: 'Procurement',
      roleId: 'procurement',
      impact: 'Medium ($18k volume discount)',
      description: 'Combine bi-weekly semiconductor purchase orders to unlock tier-2 bulk pricing.',
    },
    {
      id: 'inv-1',
      title: 'Re-Balance Warehouse Stock (Atlanta → Chicago)',
      domain: 'Inventory',
      roleId: 'inventory',
      impact: 'Critical (Prevents line stoppage)',
      description: 'Transfer 800 units of SKU-8819 via expedited hub transfer.',
    },
    {
      id: 'inv-2',
      title: 'Adjust Safety Stock Threshold for SKU-1092',
      domain: 'Inventory',
      roleId: 'inventory',
      impact: 'High (Reduces holding cost by 12%)',
      description: 'Lower reorder trigger point from 1,200 to 850 units based on updated lead-time forecasting.',
    },
    {
      id: 'prod-1',
      title: 'Optimize Assembly Line 2 SMT Feeder Calibration',
      domain: 'Production',
      roleId: 'production',
      impact: 'Medium (+12% OEE boost)',
      description: 'Schedule 15-minute maintenance check during shift transition.',
    },
    {
      id: 'prod-2',
      title: 'Reroute Component Queue to Standby Robotic Cell 4',
      domain: 'Production',
      roleId: 'production',
      impact: 'Critical (Clears 45-min bottleneck)',
      description: 'Bypass jammed conveyer node #3 and activate secondary assembly line.',
    },
    {
      id: 'log-1',
      title: 'Reroute Pacific Freight via Air Expedite',
      domain: 'Logistics',
      roleId: 'logistics',
      impact: 'Critical (Saves 48-hour port delay)',
      description: 'Re-allocate 12 freight containers from ocean cargo to chartered air freight.',
    },
    {
      id: 'log-2',
      title: 'Pre-Clear Customs Documentation for Rotterdam Hub',
      domain: 'Logistics',
      roleId: 'logistics',
      impact: 'High (Eliminates 18-hr hold risk)',
      description: 'Submit automated digital manifest filings to EU border inspection portal.',
    },
  ];

  const filteredRecommendations = currentRoleConfig.id === 'master'
    ? allRecommendations
    : allRecommendations.filter((r) => r.roleId === currentRoleConfig.id);

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-zinc-900" />
          <h2 className="text-xl font-extrabold text-zinc-900">
            Autonomous AI Recommendations — {currentRoleConfig.roleName}
          </h2>
        </div>
        <p className="text-xs text-zinc-500">
          Prioritized strategic actions generated specifically by {currentRoleConfig.agentName}.
        </p>
      </div>

      <div className="space-y-4">
        {filteredRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-zinc-900 uppercase bg-[#F5C527] px-2 py-0.5 rounded">
                  {rec.domain}
                </span>
                <span className="text-xs text-emerald-700 font-bold">{rec.impact}</span>
              </div>
              <h4 className="text-base font-bold text-zinc-900 mb-1">{rec.title}</h4>
              <p className="text-xs text-zinc-600">{rec.description}</p>
            </div>

            <button className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs flex-shrink-0">
              <span>Execute Action</span>
              <ArrowRight className="w-4 h-4 text-[#F5C527]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
