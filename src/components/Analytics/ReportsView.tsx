import React from 'react';
import { FileSpreadsheet, Download, Share2, Printer, CheckCircle2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const reportsList = [
    { name: 'Q3 Global Supply Chain Performance Audit', date: '2026-07-28', size: '2.4 MB', type: 'PDF' },
    { name: 'Supplier Risk & Quality SLA Analysis', date: '2026-07-25', size: '1.8 MB', type: 'XLSX' },
    { name: 'Multi-Warehouse Inventory Turnover Report', date: '2026-07-22', size: '3.1 MB', type: 'CSV' },
    { name: 'Master Executive Control Tower Briefing', date: '2026-07-20', size: '4.2 MB', type: 'PDF' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileSpreadsheet className="w-6 h-6 text-zinc-900" />
            <h2 className="text-xl font-extrabold text-zinc-900">Automated AI Executive Reports</h2>
          </div>
          <p className="text-xs text-zinc-500">
            Exportable compliance, audit, and strategic briefing documents.
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <div className="space-y-3">
          {reportsList.map((rep, idx) => (
            <div
              key={idx}
              className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between hover:border-zinc-300 transition-colors"
            >
              <div>
                <h4 className="text-sm font-bold text-zinc-900">{rep.name}</h4>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1 font-mono">
                  <span>Generated: {rep.date}</span>
                  <span>•</span>
                  <span>Size: {rep.size}</span>
                  <span>•</span>
                  <span className="text-zinc-900 bg-[#F5C527] px-1.5 py-0.5 rounded font-bold">{rep.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Downloading ${rep.name}...`)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-black text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#F5C527]" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
