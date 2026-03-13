import type { TaskStatus } from "../../types/task.types";
export const StatusBadge = ({ status }: { status: TaskStatus }) => {
    const config = {
        pending: { label: "Pending", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
        in_progress: { label: "In Progress", class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        completed: { label: "Completed", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    };
    const s = config[status];
    return (
        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${s.class}`}>
            {s.label}
        </span>
    );
};
