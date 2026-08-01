import React from 'react';
import { NavTab, RoleType } from '../../types';
import {
  LayoutDashboard,
  UploadCloud,
  ClipboardList,
  Sparkles,
  BarChart3,
  Lightbulb,
  FileSpreadsheet,
  Activity,
  Settings,
  ArrowLeftRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentRole: RoleType;
  roleName: string;
  agentName: string;
  onSwitchRole: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  roleName,
  agentName,
  onSwitchRole,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'tasks', label: 'Task Manager', icon: <ClipboardList className="w-4 h-4" /> },
    ...(currentRole !== 'master'
      ? [{ id: 'upload' as NavTab, label: 'Data Upload', icon: <UploadCloud className="w-4 h-4" /> }]
      : []),
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports Repository', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'health', label: 'Agent Health', icon: <Activity className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200/90 text-zinc-700 flex flex-col justify-between h-screen sticky top-0 z-30 font-sans shadow-sm">
      {/* Top Branding & Workspace */}
      <div className="p-4 border-b border-zinc-200/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#F5C527] flex items-center justify-center text-black font-extrabold shadow-md shadow-[#F5C527]/20">
            <Zap className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight">
              Control Tower AI
            </h1>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
              Autonomous v3.8
            </span>
          </div>
        </div>

        {/* Current Role Card & Quick Switcher */}
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200/80">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Active Workspace
            </span>
            <button
              onClick={onSwitchRole}
              title="Switch Agent Role"
              className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 rounded-md hover:bg-zinc-200/60 cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
            >
              <ArrowLeftRight className="w-3 h-3 text-[#F5C527]" />
              <span>Switch</span>
            </button>
          </div>
          <div className="text-sm font-bold text-zinc-900 truncate">{roleName}</div>
          <div className="text-xs text-zinc-500 truncate flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {agentName}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-1 mb-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#18181B] text-white shadow-md font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className={isActive ? 'text-[#F5C527]' : 'text-zinc-500'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C527] ml-auto" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Role Switcher & System Info */}
      <div className="p-3 border-t border-zinc-200/80">
        <button
          onClick={onSwitchRole}
          className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-900" />
          <span>Role Selection Menu</span>
        </button>
      </div>
    </aside>
  );
};
