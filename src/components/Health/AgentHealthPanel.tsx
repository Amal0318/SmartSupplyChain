import React, { useState } from 'react';
import { AgentHealthItem, RoleType } from '../../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  ShieldCheck,
  Cpu,
  HardDrive,
  Terminal,
  Play,
} from 'lucide-react';

interface AgentHealthPanelProps {
  agents: AgentHealthItem[];
  onSimulateFault: (roleId: RoleType) => void;
  onSimulateHeal: (roleId: RoleType) => void;
}

export const AgentHealthPanel: React.FC<AgentHealthPanelProps> = ({
  agents,
  onSimulateFault,
  onSimulateHeal,
}) => {
  const [selectedAgentLogs, setSelectedAgentLogs] = useState<RoleType>('master');

  const activeAgent = agents.find((a) => a.id === selectedAgentLogs) || agents[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <Activity className="w-4 h-4 text-[#F5C527]" />
            Fault Tolerance & Agent Resilience
          </div>
          <h3 className="text-xl font-extrabold text-zinc-900">Autonomous Agent Health Matrix</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time monitoring of response latency, failure counters, and self-healing memory buffers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Auto-Healing Protocol Enabled</span>
          </div>
        </div>
      </div>

      {/* Agents Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgentLogs(agent.id)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative ${
                selectedAgentLogs === agent.id
                  ? 'bg-white border-zinc-900 shadow-md ring-2 ring-[#F5C527]'
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-900 uppercase font-bold bg-[#F5C527] px-1.5 py-0.5 rounded block w-fit mb-1">
                    {agent.id.toUpperCase()} AGENT
                  </span>
                  <h4 className="text-base font-bold text-zinc-900">{agent.agentName}</h4>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    agent.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : agent.status === 'Warning'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : agent.status === 'Recovering'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs font-mono mb-4">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Response Time</span>
                  <span className="text-zinc-900 font-bold">{agent.responseTimeMs} ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Last Execution</span>
                  <span className="text-zinc-700">{agent.lastExecution}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Failure Count</span>
                  <span className={agent.failureCount > 0 ? 'text-amber-700 font-bold' : 'text-zinc-700'}>
                    {agent.failureCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Memory Load</span>
                  <span className="text-zinc-700">{agent.memoryUsageMb} MB</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-600 mb-4 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                <span className="truncate">{agent.recoveryStatus}</span>
              </div>

              {/* Interactive Fault / Heal Triggers */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-200">
                {agent.status === 'Active' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSimulateFault(agent.id);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Simulate Fault</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSimulateHeal(agent.id);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span>Trigger Auto-Heal</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Agent Execution Terminal Logs */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-900" />
            <h4 className="text-sm font-bold text-zinc-900">
              Real-Time Execution Logs: {activeAgent.agentName}
            </h4>
          </div>
          <span className="text-xs font-mono text-zinc-500">Live Agent Stream</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-2 border border-zinc-800 max-h-48 overflow-y-auto">
          {activeAgent.logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-zinc-500 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
