import type { TaskStatus,ITask } from "../../types/task.types";
import { StatusBadge } from "./StatusBadge";

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  deleteLoading,
  updateLoading,
}: {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  deleteLoading: boolean;
  updateLoading: boolean;
}) => {
  const nextStatus: Record<TaskStatus, { label: string; status: TaskStatus }> = {
    pending: { label: "Start", status: "in_progress" },
    in_progress: { label: "Complete", status: "completed" },
    completed: { label: "Reopen", status: "pending" },
  };
  const next = nextStatus[task.status];

  return (
    <div className="bg-[#110d20] border border-purple-900/50 rounded-xl p-4 flex flex-col gap-3 hover:border-purple-700/60 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className={`text-sm font-medium text-white truncate ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 font-bold line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        {/* ── Status toggle ── */}
        <button
          onClick={() => onStatusChange(task._id, next.status)}
          disabled={updateLoading}
          className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 hover:bg-purple-600/30 transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {next.label}
        </button>

        {/* ── Edit ── */}
        <button
          onClick={() => onEdit(task)}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#0d0a1a] border border-purple-900/40 text-gray-400 hover:text-white hover:border-purple-700/60 transition-all font-bold cursor-pointer"
        >
          Edit
        </button>

        {/* ── Delete ── */}
        <button
          onClick={() => onDelete(task._id)}
          disabled={deleteLoading}
          className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-[#0d0a1a] border border-red-900/30 text-red-400/60 hover:text-red-400 hover:border-red-800/60 transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
