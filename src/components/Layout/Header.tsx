import React, { useState } from 'react';
import { RoleConfig, RoleType } from '../../types';
import {
  Bot,
  RefreshCw,
  Sparkles,
  User,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  currentRoleConfig: RoleConfig;
  allRoles: RoleConfig[];
  onSelectRole: (roleId: RoleType) => void;
  onRefreshData?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoleConfig,
  allRoles,
  onSelectRole,
  onRefreshData,
  isSyncing = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-zinc-200/90 px-6 flex items-center justify-between sticky top-0 z-20 font-sans shadow-xs">
      {/* Left: Agent Info */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
          <Bot className="w-5 h-5 text-zinc-900" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              {currentRoleConfig.agentName}
            </h2>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                currentRoleConfig.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {currentRoleConfig.status}
            </span>
          </div>
          <span className="text-xs text-zinc-500 font-normal">
            Workspace: {currentRoleConfig.roleName}
          </span>
        </div>
      </div>

      {/* Center/Right: Metrics & User Profile */}
      <div className="flex items-center gap-4">
        {/* Sync Status */}
        <div className="hidden sm:flex items-center gap-2 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-600">
          <button
            onClick={onRefreshData}
            title="Trigger Instant AI Sync"
            className="hover:text-zinc-900 transition-colors p-0.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#F5C527]' : 'text-zinc-700'}`} />
          </button>
          <span className="text-zinc-400">Last Sync:</span>
          <span className="font-mono font-medium text-zinc-800">{currentRoleConfig.lastSync}</span>
        </div>

        {/* AI Confidence Score */}
        <div className="hidden md:flex items-center gap-2 bg-[#F5C527]/20 border border-[#F5C527]/40 px-3 py-1.5 rounded-xl text-xs">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
          <span className="text-zinc-700 font-medium">AI Confidence:</span>
          <span className="font-bold text-zinc-900 font-mono">
            {currentRoleConfig.confidenceScore}%
          </span>
        </div>

        {/* User Profile & Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-900 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#F5C527] text-black flex items-center justify-center font-bold text-[10px]">
              EX
            </div>
            <span className="hidden sm:inline">Exec Manager</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-zinc-100 text-xs">
                <p className="font-semibold text-zinc-900">santhoshkrishnan256@gmail.com</p>
                <p className="text-[10px] text-zinc-500">Enterprise Control Tower User</p>
              </div>

              <div className="py-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase px-3 py-1 block">
                  Switch Agent Workspace
                </span>
                {allRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      onSelectRole(role.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      role.id === currentRoleConfig.id
                        ? 'bg-[#F5C527] text-black font-bold'
                        : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{role.roleName}</span>
                    <span className="text-[10px] font-mono opacity-80">{role.agentName.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
