import type  { FinalStatus } from "../../types/archived-task.types";

export const FinalStatusBadge = ({ status }: { status: FinalStatus }) => {
    const config = {
        completed:     { label: "Completed",    class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
        pending:       { label: "Pending",       class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
        not_completed: { label: "Not Completed", class: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    const s = config[status];
    return (
        <span className={`text-xs px-2.5 py-1 rounded-full border font-light ${s.class}`}>
            {s.label}
        </span>
    );
};