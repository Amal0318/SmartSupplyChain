import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Bell, Cpu, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [autoHeal, setAutoHeal] = useState(true);
  const [realtimeSync, setRealtimeSync] = useState(true);
  const [sensitivity, setSensitivity] = useState('High');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-[#FFD84D]" />
          <h2 className="text-xl font-extrabold text-white">
            Control Tower & Multi-Agent System Settings
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          Configure autonomous agent tolerances, heartbeat frequencies, and model parameters.
        </p>
      </div>

      <div className="bg-[#121216] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Auto Healing */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h4 className="text-sm font-bold text-white">Autonomous Agent Auto-Healing</h4>
            <p className="text-xs text-zinc-400">
              Automatically re-allocates memory and restarts failed sub-agents upon fault detection.
            </p>
          </div>
          <button
            onClick={() => setAutoHeal(!autoHeal)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
              autoHeal ? 'bg-[#FFD84D]' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                autoHeal ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Real-time Sync */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h4 className="text-sm font-bold text-white">Live Data Stream Sync</h4>
            <p className="text-xs text-zinc-400">
              Polls shop floor IoT controllers and satellite GPS feeds every 30 seconds.
            </p>
          </div>
          <button
            onClick={() => setRealtimeSync(!realtimeSync)}
            className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
              realtimeSync ? 'bg-[#FFD84D]' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                realtimeSync ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Risk Sensitivity */}
        <div className="pb-4 border-b border-zinc-800">
          <h4 className="text-sm font-bold text-white mb-2">Neural Risk Model Sensitivity</h4>
          <div className="flex items-center gap-3">
            {['Low', 'Medium', 'High'].map((s) => (
              <button
                key={s}
                onClick={() => setSensitivity(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sensitivity === s
                    ? 'bg-[#FFD84D] text-black shadow-md'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s} Sensitivity
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved Successfully
            </span>
          )}
          {!saved && <div />}
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#FFD84D] text-black font-bold text-xs rounded-xl hover:bg-[#ffe270] transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
