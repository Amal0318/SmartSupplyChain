import React from 'react';
import { ProcessingStage } from '../../types/santhosh';
import { CheckCircle2, Clock, Sparkles, AlertCircle, ArrowDown } from 'lucide-react';

interface AgentProcessingTimelineProps {
  stages: ProcessingStage[];
}

export const AgentProcessingTimeline: React.FC<AgentProcessingTimelineProps> = ({ stages }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs mb-8 font-sans">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-mono text-zinc-900 uppercase tracking-widest block font-bold bg-[#F5C527] px-1.5 py-0.5 rounded w-fit mb-1">
            Autonomous Pipeline Execution
          </span>
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
            Agent Processing View
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs text-emerald-800 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Autonomous Pipeline Synchronized</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4 relative">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'completed';
          const isInProgress = stage.status === 'in_progress';
          const isPending = stage.status === 'pending';

          return (
            <React.Fragment key={stage.id}>
              <div
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-zinc-50 border-zinc-200'
                    : isInProgress
                    ? 'bg-[#F5C527]/15 border-zinc-900 shadow-md ring-2 ring-[#F5C527]'
                    : 'bg-zinc-50/50 border-zinc-200 opacity-60'
                }`}
              >
                {/* Step Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {isInProgress && (
                    <div className="w-7 h-7 rounded-full bg-[#F5C527] text-black flex items-center justify-center animate-spin">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-400 border border-zinc-300 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Step Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4
                      className={`text-sm font-bold ${
                        isCompleted
                          ? 'text-zinc-900'
                          : isInProgress
                          ? 'text-zinc-900'
                          : 'text-zinc-400'
                      }`}
                    >
                      {stage.label}
                    </h4>
                    {stage.timestamp && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        {stage.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600">{stage.description}</p>
                </div>
              </div>

              {/* Connecting Arrow */}
              {index < stages.length - 1 && (
                <div className="flex justify-center -my-2">
                  <ArrowDown
                    className={`w-4 h-4 ${
                      isCompleted ? 'text-zinc-900' : 'text-zinc-300'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
