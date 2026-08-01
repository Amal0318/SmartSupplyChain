import React, { useState } from 'react';
import { AssignedTask, RoleType } from '../../types/santhosh';
import {
  ClipboardList,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Check,
  UserCheck,
  Filter,
} from 'lucide-react';

interface TaskManagerProps {
  currentRole?: RoleType;
  tasks: AssignedTask[];
  onAddTask: (task: Omit<AssignedTask, 'id' | 'createdAt'>) => void;
  onUpdateTaskStatus: (taskId: string, status: AssignedTask['status']) => void;
  onDeleteTask?: (taskId: string) => void;
}

const DEPARTMENT_OPTIONS: { id: RoleType; name: string; color: string }[] = [
  { id: 'procurement', name: 'Procurement Department', color: 'bg-amber-100 text-amber-800' },
  { id: 'inventory', name: 'Inventory Department', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'production', name: 'Production Department', color: 'bg-orange-100 text-orange-800' },
  { id: 'logistics', name: 'Logistics Department', color: 'bg-blue-100 text-blue-800' },
];

export const TaskManager: React.FC<TaskManagerProps> = ({
  currentRole = 'master',
  tasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>(
    currentRole !== 'master' ? currentRole : 'All'
  );
  
  // New task form state
  const [title, setTitle] = useState('');
  const [assignedDepartment, setAssignedDepartment] = useState<RoleType>('procurement');
  const [priority, setPriority] = useState<AssignedTask['priority']>('High');
  const [deadline, setDeadline] = useState('2026-08-05');
  const [description, setDescription] = useState('');

  const isExecutive = currentRole === 'master';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isExecutive) return;

    onAddTask({
      title,
      assignedDepartment,
      priority,
      deadline,
      description,
      status: 'Pending',
      createdBy: 'Supply Chain Executive',
    });

    // Reset form
    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (departmentFilter === 'All') return true;
    return t.assignedDepartment === departmentFilter;
  });

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1">
            <ClipboardList className="w-4 h-4 text-[#F5C527]" />
            Executive Task Delegation Engine
          </div>
          <h3 className="text-lg font-bold text-zinc-900">
            Departmental Task Assignments ({tasks.length})
          </h3>
          <p className="text-xs text-zinc-500">
            Create, assign, set priorities, and track progress across specialized AI department teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent text-zinc-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="procurement">Procurement</option>
              <option value="inventory">Inventory</option>
              <option value="production">Production</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>

          {isExecutive ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#F5C527]" />
              <span>Raise New Task</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Only Executive Can Raise Tasks</span>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-300 rounded-2xl">
            <UserCheck className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-500 font-medium">
              No task assignments found for this department filter.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const deptInfo = DEPARTMENT_OPTIONS.find((d) => d.id === task.assignedDepartment);
            return (
              <div
                key={task.id}
                className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-900 bg-[#F5C527] px-2 py-0.5 rounded">
                      {task.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${deptInfo?.color || 'bg-zinc-200 text-zinc-800'}`}>
                      {deptInfo?.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : task.priority === 'High'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      Due: {task.deadline}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900">{task.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">{task.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as AssignedTask['status'])}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                      task.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : task.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {onDeleteTask && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F5C527]" />
                Assign Department Task
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit supplier SLA lead time variance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Target Department</label>
                  <select
                    value={assignedDepartment}
                    onChange={(e) => setAssignedDepartment(e.target.value as RoleType)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900 font-medium"
                  >
                    <option value="procurement">Procurement Agent</option>
                    <option value="inventory">Inventory Agent</option>
                    <option value="production">Production Agent</option>
                    <option value="logistics">Logistics Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AssignedTask['priority'])}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900 font-medium"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Completion Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Detailed Description & Directive</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify operational goals, constraints, and actionable expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#F5C527]" />
                  <span>Confirm Task Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
