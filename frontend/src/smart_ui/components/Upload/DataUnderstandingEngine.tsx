import React, { useState } from 'react';
import { UploadedDataset } from '../../types';
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Cpu,
  BrainCircuit,
  Send,
  Eye,
  Check,
} from 'lucide-react';

interface DataUnderstandingEngineProps {
  dataset: UploadedDataset;
  onConfirmSchema?: () => void;
  onSendToMaster?: (dataset: UploadedDataset) => void;
}

export const DataUnderstandingEngine: React.FC<DataUnderstandingEngineProps> = ({
  dataset,
  onConfirmSchema,
  onSendToMaster,
}) => {
  const [isSent, setIsSent] = useState(false);
  const previewRows = dataset.records ? dataset.records.slice(0, 8) : [];
  const displayCols = dataset.columns && dataset.columns.length > 0
    ? dataset.columns
    : previewRows.length > 0
    ? Object.keys(previewRows[0])
    : [];

  const handleSend = () => {
    if (onSendToMaster) {
      onSendToMaster(dataset);
      setIsSent(true);
      setTimeout(() => setIsSent(false), 4000);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs mb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5C527]/20 border border-[#F5C527]/40 flex items-center justify-center text-zinc-900">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-900 block font-bold bg-[#F5C527] px-1.5 py-0.5 rounded w-fit mb-1">
              Autonomous Schema Recognition
            </span>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              AI Data Understanding & Preview Engine
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
            <span className="text-zinc-500 mr-1.5">File:</span>
            <span className="text-zinc-900 font-mono font-bold">{dataset.fileName}</span>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
            <span className="text-zinc-500 mr-1.5">Agent Domain:</span>
            <span className="text-zinc-900 font-bold capitalize">{dataset.domain}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 font-bold">
            {dataset.records.length} Records Parsed
          </div>
        </div>
      </div>

      {/* Detected Columns Pills */}
      <div className="mb-6">
        <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#F5C527]" />
          <span>Detected Business Columns ({dataset.columns.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {dataset.columns.map((col, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-800 font-medium"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Semantic Mapping Table */}
      <div className="mb-6">
        <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#F5C527]" />
            <span>Semantic Schema Mapping</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            All Standard Mappings Verified
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs text-zinc-800">
            <thead className="bg-zinc-50 text-zinc-600 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3">Original Column</th>
                <th className="px-4 py-3">AI Understanding</th>
                <th className="px-4 py-3">Standard Field</th>
                <th className="px-4 py-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {dataset.mappings.map((mapItem, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-4 py-3 text-zinc-900 font-sans font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C527]" />
                    {mapItem.originalColumn}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 font-sans">
                    {mapItem.aiUnderstanding}
                  </td>
                  <td className="px-4 py-3 text-zinc-900 font-bold">
                    <span className="bg-[#F5C527]/20 px-2 py-0.5 rounded border border-[#F5C527]/40">
                      {mapItem.standardField}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {Math.round(mapItem.confidence * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parsed Data Preview Table */}
      <div className="mb-6">
        <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-[#F5C527]" />
            <span>Parsed Records Data Preview (Showing top {previewRows.length} rows)</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            Satisfied with analysis? Click Send to Master Manager below.
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs text-zinc-800 font-mono">
            <thead className="bg-zinc-100 text-zinc-700 uppercase text-[10px] tracking-wider font-bold sticky top-0 border-b border-zinc-200">
              <tr>
                <th className="px-3 py-2 text-zinc-400">#</th>
                {displayCols.slice(0, 7).map((col, cIdx) => (
                  <th key={cIdx} className="px-3 py-2 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {previewRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-zinc-50">
                  <td className="px-3 py-2 text-zinc-400 font-sans">{rIdx + 1}</td>
                  {displayCols.slice(0, 7).map((col, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-zinc-800">
                      {String(row[col] ?? row[cIdx] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Send to Master Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 bg-zinc-50 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 mb-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preview Verified & Agent Analysis Completed</span>
          </div>
          <p className="text-xs text-zinc-500">
            If you are satisfied with this dataset preview, send it directly to the Master Executive Control Tower.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onConfirmSchema && (
            <button
              onClick={onConfirmSchema}
              className="px-3 py-2 rounded-xl bg-zinc-200 text-zinc-800 font-semibold text-xs hover:bg-zinc-300 transition-colors"
            >
              Timeline View
            </button>
          )}

          <button
            onClick={handleSend}
            disabled={isSent}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
              isSent
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-white hover:bg-black'
            }`}
          >
            {isSent ? (
              <>
                <Check className="w-4 h-4 text-[#F5C527]" />
                <span>Sent to Master Agent!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#F5C527]" />
                <span>Send to Master Agent Manager Dashboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

