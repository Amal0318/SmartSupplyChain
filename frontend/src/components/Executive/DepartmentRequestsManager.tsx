import React from 'react';
import { DepartmentRequest, RoleType } from '../../types/santhosh';
import { Inbox, CheckCircle2, XCircle, Clock, Send, ShieldAlert } from 'lucide-react';

interface DepartmentRequestsManagerProps {
  requests: DepartmentRequest[];
  onUpdateRequestStatus: (requestId: string, status: 'Approved' | 'Rejected') => void;
}

const DEPARTMENT_NAMES: Record<RoleType, string> = {
  procurement: 'Procurement Department',
  inventory: 'Inventory Department',
  production: 'Production Department',
  logistics: 'Logistics Department',
  master: 'Master Executive',
};

export const DepartmentRequestsManager: React.FC<DepartmentRequestsManagerProps> = ({
  requests,
  onUpdateRequestStatus,
}) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <Inbox className="w-4 h-4 text-[#F5C527]" />
            Department Request Authorization System
          </div>
          <h3 className="text-lg font-bold text-zinc-900">
            Incoming Department Requests ({requests.length})
          </h3>
          <p className="text-xs text-zinc-500">
            Review and approve cross-department requests for budget expansion, stock shifts, and emergency maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl">
            {requests.filter((r) => r.status === 'Pending').length} Pending Approval
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl">
            <Inbox className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-medium">
              No department requests submitted yet.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-0.5 rounded">
                    {req.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-white font-mono">
                    {DEPARTMENT_NAMES[req.fromDepartment] || req.fromDepartment}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {req.requestType}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {req.timestamp}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900">{req.title}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">{req.details}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  req.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : req.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {req.status}
                </span>

                {req.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => onUpdateRequestStatus(req.id, 'Rejected')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
