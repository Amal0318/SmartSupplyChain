import React, { useState } from 'react';
import { RoleType } from '../../types';
import { Send, Check, Sparkles, CheckCircle2, Bot, Inbox } from 'lucide-react';

interface AgentSyncBannerProps {
  role: RoleType;
  agentName: string;
  recordCount: number;
  onSendToMaster: (role: RoleType) => void;
  onRequestClick?: () => void;
}

export const AgentSyncBanner: React.FC<AgentSyncBannerProps> = ({
  role,
  agentName,
  recordCount,
  onSendToMaster,
  onRequestClick,
}) => {
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    onSendToMaster(role);
    setIsSent(true);
    setTimeout(() => setIsSent(false), 3500);
  };

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#F5C527] text-black flex items-center justify-center font-bold shadow-sm">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-tight">
              {agentName}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Analysis Satisfied ({recordCount} Active Records)
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Agent analyzed operational feed. Dispatch dataset and risk metrics to Master Manager Dashboard.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRequestClick && (
          <button
            onClick={onRequestClick}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Inbox className="w-4 h-4 text-[#F5C527]" />
            <span>Submit Request</span>
          </button>
        )}

        <button
          onClick={handleSend}
          disabled={isSent}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
            isSent
              ? 'bg-emerald-500 text-zinc-950'
              : 'bg-[#F5C527] text-zinc-950 hover:bg-[#e0b21e]'
          }`}
        >
          {isSent ? (
            <>
              <Check className="w-4 h-4 text-zinc-950" />
              <span>Received in Master Manager Control Tower!</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-zinc-950" />
              <span>Send Data & Insights to Master Manager</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
