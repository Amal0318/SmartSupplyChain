import React from 'react';
import { AssignedTask, RoleType } from '../../types';
import { ClipboardList, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DepartmentTaskSectionProps {
  currentRole: RoleType;
  tasks: AssignedTask[];
  onUpdateTaskStatus?: (taskId: string, status: AssignedTask['status']) => void;
}

export const DepartmentTaskSection: React.FC<DepartmentTaskSectionProps> = ({
  currentRole,
  tasks,
  onUpdateTaskStatus,
}) => {
  const departmentTasks = tasks.filter((t) => t.assignedDepartment === currentRole);

  if (departmentTasks.length === 0) return null;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs font-sans mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#F5C527]" />
          <h3 className="text-base font-bold text-zinc-900">
            Executive Assigned Directives ({departmentTasks.length})
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Role Scope: {currentRole.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {departmentTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-[#F5C527] text-black px-2 py-0.5 rounded">
                {task.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                task.priority === 'Urgent'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : task.priority === 'High'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {task.priority}
              </span>
            </div>

            <h4 className="text-xs font-bold text-zinc-900">{task.title}</h4>
            <p className="text-xs text-zinc-600 leading-relaxed">{task.description}</p>

            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs">
              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                Due: {task.deadline}
              </span>

              {onUpdateTaskStatus ? (
                <select
                  value={task.status}
                  onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as AssignedTask['status'])}
                  className="bg-white border border-zinc-300 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              ) : (
                <span className="font-bold text-zinc-800">{task.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
