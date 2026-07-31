import React, { useState } from 'react';
import { DepartmentRequest, RoleType } from '../../types';
import { Plus, Send, Inbox, Check } from 'lucide-react';

interface CreateDepartmentRequestModalProps {
  currentRole: RoleType;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (req: Omit<DepartmentRequest, 'id' | 'timestamp' | 'status'>) => void;
}

export const CreateDepartmentRequestModal: React.FC<CreateDepartmentRequestModalProps> = ({
  currentRole,
  isOpen,
  onClose,
  onSubmitRequest,
}) => {
  const [requestType, setRequestType] = useState<DepartmentRequest['requestType']>('Budget');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;

    onSubmitRequest({
      fromDepartment: currentRole,
      requestType,
      title,
      details,
    });

    setTitle('');
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5C527] text-black flex items-center justify-center font-bold">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Submit Request to Master Executive
              </h3>
              <p className="text-xs text-zinc-500">
                Direct request dispatch from {currentRole.toUpperCase()} Department
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Request Category</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as DepartmentRequest['requestType'])}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900 font-medium"
            >
              <option value="Material">Material Allocation</option>
              <option value="Stock">Stock Transfer / Buffer</option>
              <option value="Budget">Budget Authorization</option>
              <option value="Maintenance">Equipment / Line Maintenance</option>
              <option value="Escalation">Executive Escalation</option>
              <option value="Approval">Quality / Compliance Sign-off</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Request Subject / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Air freight emergency authorization for MicroTech chips"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block font-bold text-zinc-700 mb-1">Operational Context & Justification</label>
            <textarea
              rows={4}
              required
              placeholder="Detail financial impact, urgency, affected SKUs, or line downtime..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 font-bold text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5"
            >
              <Send className="w-4 h-4 text-[#F5C527]" />
              <span>Send Request to Executive</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
