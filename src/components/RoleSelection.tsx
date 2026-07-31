import React from 'react';
import { RoleConfig, RoleType } from '../types';
import {
  ShoppingBag,
  Boxes,
  Factory,
  Truck,
  ShieldCheck,
  ArrowRight,
  Activity,
  Bot,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RoleSelectionProps {
  roles: RoleConfig[];
  onSelectRole: (roleId: RoleType) => void;
}

const getRoleIcon = (id: RoleType) => {
  switch (id) {
    case 'procurement':
      return <ShoppingBag className="w-6 h-6 text-zinc-900" />;
    case 'inventory':
      return <Boxes className="w-6 h-6 text-zinc-900" />;
    case 'production':
      return <Factory className="w-6 h-6 text-zinc-900" />;
    case 'logistics':
      return <Truck className="w-6 h-6 text-zinc-900" />;
    case 'master':
      return <ShieldCheck className="w-6 h-6 text-zinc-900" />;
    default:
      return <Bot className="w-6 h-6 text-zinc-900" />;
  }
};

export const RoleSelection: React.FC<RoleSelectionProps> = ({ roles, onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900 flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-[#F5C527] selection:text-black dot-grid">
      {/* Top Bar / Brand */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between border-b border-zinc-200 pb-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5C527] flex items-center justify-center text-black font-extrabold shadow-md shadow-[#F5C527]/20">
            <Zap className="w-6 h-6 fill-black text-black" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              Autonomous Enterprise System
            </span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              AI Supply Chain Control Tower
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-zinc-200 text-xs text-zinc-700 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">5 Autonomous Agents Online</span>
          <span className="text-zinc-300">|</span>
          <span className="font-mono text-zinc-500">v3.8 Enterprise</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto w-full text-center my-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-800 shadow-xs mb-4">
          <Bot className="w-4 h-4 text-[#F5C527]" />
          Multi-Agent Neural Control Matrix
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-3">
          AI Supply Chain Control Tower
        </h2>
        <p className="text-zinc-600 text-base md:text-lg max-w-2xl mx-auto font-normal">
          Select your operational workspace powered by autonomous AI agents
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {roles.map((role) => {
          const isMaster = role.id === 'master';
          return (
            <div
              key={role.id}
              className={`group relative rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between ${
                isMaster
                  ? 'bg-[#18181B] text-white border-2 border-[#F5C527] shadow-xl md:col-span-2 lg:col-span-1'
                  : 'bg-white text-zinc-900 hover:shadow-xl hover:scale-[1.01] border border-zinc-200/90 shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isMaster
                        ? 'bg-[#F5C527] text-black shadow-md'
                        : 'bg-zinc-100 border border-zinc-200'
                    }`}
                  >
                    {getRoleIcon(role.id)}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        role.status === 'Active'
                          ? isMaster
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-emerald-100 text-emerald-800'
                          : isMaster
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {role.status}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isMaster ? 'text-zinc-400' : 'text-zinc-400'
                      }`}
                    >
                      Sync: {role.lastSync}
                    </span>
                  </div>
                </div>

                {/* Titles */}
                <div className="mb-3">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                      isMaster ? 'text-[#F5C527]' : 'text-zinc-500'
                    }`}
                  >
                    {role.agentName}
                  </span>
                  <h3
                    className={`text-xl font-bold tracking-tight ${
                      isMaster ? 'text-white' : 'text-zinc-900'
                    }`}
                  >
                    {role.roleName}
                  </h3>
                </div>

                <p
                  className={`text-sm mb-5 leading-relaxed ${
                    isMaster ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {role.description}
                </p>

                {/* Responsibilities list */}
                <div className="mb-6 space-y-2 border-t pt-4 border-zinc-200 dark:border-zinc-800">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isMaster ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    Agent Capabilities
                  </span>
                  <ul className="space-y-1.5 text-xs">
                    {role.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                            isMaster ? 'text-[#F5C527]' : 'text-zinc-900'
                          }`}
                        />
                        <span
                          className={isMaster ? 'text-zinc-300' : 'text-zinc-700'}
                        >
                          {resp}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onSelectRole(role.id)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer ${
                    isMaster
                      ? 'bg-[#F5C527] text-black hover:bg-[#f3bd14] shadow-lg font-bold'
                      : 'bg-zinc-900 text-white hover:bg-black shadow-md'
                  }`}
                >
                  <span>Open {role.dashboardName}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Status Bar */}
      <div className="max-w-7xl mx-auto w-full pt-6 mt-6 border-t border-zinc-200 text-center text-xs text-zinc-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium">
          <Activity className="w-4 h-4 text-[#F5C527]" />
          <span>System Status: Autonomous Operational Matrix Synchronized</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <span>Target Platform: Enterprise Cloud Run</span>
          <span>•</span>
          <span>Security SLA: 99.99%</span>
        </div>
      </div>
    </div>
  );
};
