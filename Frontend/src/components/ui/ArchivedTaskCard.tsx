import { FinalStatusBadge } from "./FinalStatusBadge";

export const ArchivedTaskCard = ({ task }: { task: any }) => (
    <div className="bg-[#110d20] border border-purple-900/50 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className={`text-sm font-medium truncate
                    ${task.finalStatus === "completed" ? "line-through text-gray-500" : "text-white"}`}
                >
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-gray-500 font-light line-clamp-2">{task.description}</p>
                )}
            </div>
            <FinalStatusBadge status={task.finalStatus} />
        </div>
        <p className="text-xs text-gray-600 font-light">
            Created {new Date(task.originalCreatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            {task.completedAt && (
                <> · Completed {new Date(task.completedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</>
            )}
        </p>
    </div>
);