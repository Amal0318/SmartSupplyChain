import React, { useState } from 'react';
import { DepartmentReportItem, RoleType } from '../../types/santhosh';
import { FileText, Download, Calendar, Layers, Eye, CheckCircle2, ShieldCheck, Filter, Search } from 'lucide-react';

interface DepartmentReportRepositoryProps {
  reports: DepartmentReportItem[];
  activeRole: RoleType;
}

const ROLE_NAMES: Record<RoleType, string> = {
  procurement: 'Procurement Department',
  inventory: 'Inventory Department',
  production: 'Production Department',
  logistics: 'Logistics Department',
  master: 'Master Executive',
};

export const DepartmentReportRepository: React.FC<DepartmentReportRepositoryProps> = ({
  reports,
  activeRole,
}) => {
  const [selectedReport, setSelectedReport] = useState<DepartmentReportItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Strict department isolation: Department managers see ONLY their own department reports. Master Executive sees all.
  const visibleReports = reports.filter((rep) => {
    if (activeRole !== 'master' && rep.departmentId !== activeRole) {
      return false;
    }
    const matchesSearch =
      rep.reportTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDownloadReport = (rep: DepartmentReportItem) => {
    const reportContent = `===================================================================
DEPARTMENT REPORT: ${rep.reportTitle.toUpperCase()}
Department: ${rep.departmentName}
Generated At: ${rep.generatedAt}
Total Records Analyzed: ${rep.recordCount}
===================================================================

1. EXECUTIVE SUMMARY:
-------------------------------------------------------------------
${rep.summary}

2. KEY PERFORMANCE INDICATORS (KPIs):
-------------------------------------------------------------------
${rep.kpis.map((k) => `• ${k.label}: ${k.value}`).join('\n')}

3. AUTONOMOUS DEPARTMENT RECOMMENDATIONS:
-------------------------------------------------------------------
${rep.recommendations.map((r, idx) => `[${idx + 1}] ${r}`).join('\n')}

===================================================================
CONFIDENTIAL - AUTOMATED DEPARTMENT REPORT REPOSITORY
===================================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rep.departmentId.toUpperCase()}_Report_${rep.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <FileText className="w-4 h-4 text-[#F5C527]" />
            {activeRole === 'master' ? 'Consolidated Department Reports Repository' : `${ROLE_NAMES[activeRole]} Report Archive`}
          </div>
          <h3 className="text-lg font-bold text-zinc-900">
            Isolated Department Report Repository ({visibleReports.length})
          </h3>
          <p className="text-xs text-zinc-500">
            {activeRole === 'master'
              ? 'Central repository aggregating reports from Procurement, Inventory, Production, and Logistics.'
              : `Secure repository storing verified reports for ${ROLE_NAMES[activeRole]}. Strictly isolated from other departments.`}
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report titles or metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-800 placeholder-zinc-400 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleReports.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl">
            <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-medium">
              No department reports found matching this criteria.
            </p>
          </div>
        ) : (
          visibleReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-300 transition-colors space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-0.5 rounded">
                    {rep.id}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {rep.generatedAt}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 leading-snug">{rep.reportTitle}</h4>
                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">{rep.summary}</p>
              </div>

              {/* KPIs Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/80">
                {rep.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-xl border border-zinc-200 text-xs">
                    <span className="text-[10px] text-zinc-500 block truncate">{kpi.label}</span>
                    <span className="font-bold text-zinc-900 font-mono text-xs">{kpi.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-200/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedReport(rep)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#F5C527]" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => handleDownloadReport(rep)}
                  className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  title="Download Report as TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 font-sans max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase">
                  {selectedReport.departmentName}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 mt-1">{selectedReport.reportTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-zinc-400 hover:text-zinc-700 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-1">
                  Executive Department Summary
                </h4>
                <p className="text-zinc-700 leading-relaxed">{selectedReport.summary}</p>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-2">
                  Key Metrics & Operational KPIs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedReport.kpis.map((kpi, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <span className="text-[10px] text-zinc-500 block">{kpi.label}</span>
                      <span className="text-sm font-extrabold text-zinc-900 font-mono">{kpi.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[11px] mb-2">
                  AI Department Recommendations
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="font-medium">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
              <button
                onClick={() => handleDownloadReport(selectedReport)}
                className="px-4 py-2 bg-zinc-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-black"
              >
                <Download className="w-4 h-4 text-[#F5C527]" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
