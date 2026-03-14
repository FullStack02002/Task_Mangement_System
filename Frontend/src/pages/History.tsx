import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { getArchivedDatesThunk, getArchivedTasksByDateThunk } from "../features/archived-task/archivedTaskThunk";
import { clearArchivedTasks } from "../features/archived-task/archivedTaskSlice";
import type { FinalStatus } from "../types/archived-task.types";

// ─────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────
const FinalStatusBadge = ({ status }: { status: FinalStatus }) => {
    const config = {
        completed: { label: "Completed", class: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
        pending: { label: "Pending", class: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
        not_completed: { label: "Not Completed", class: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    const s = config[status];
    return (
        <span className={`text-xs px-2.5 py-1 rounded-full border font-light ${s.class}`}>
            {s.label}
        </span>
    );
};

// ─────────────────────────────────────────
// Archived Task Card
// ─────────────────────────────────────────
const ArchivedTaskCard = ({ task }: { task: any }) => (
    <div className="bg-[#110d20] border border-purple-900/50 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className={`text-sm font-medium truncate
                    ${task.finalStatus === "completed"
                        ? "line-through text-gray-500"
                        : "text-white"
                    }`}
                >
                    {task.title}
                </p>
                {task.description && (
                    <p className="text-xs text-gray-500 font-light line-clamp-2">
                        {task.description}
                    </p>
                )}
            </div>
            <FinalStatusBadge status={task.finalStatus} />
        </div>
        <p className="text-xs text-gray-600 font-light">
            Created {new Date(task.originalCreatedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            })}
            {task.completedAt && (
                <> · Completed {new Date(task.completedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}</>
            )}
        </p>
    </div>
);

// ─────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────
const TaskSkeleton = () => (
    <div className="bg-[#110d20] border border-purple-900/30 rounded-xl p-4 flex flex-col gap-3 animate-pulse">
        <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 flex-1">
                <div className="h-3.5 bg-purple-900/30 rounded w-3/4" />
                <div className="h-3 bg-purple-900/20 rounded w-1/2" />
            </div>
            <div className="h-6 w-24 bg-purple-900/30 rounded-full" />
        </div>
        <div className="h-3 bg-purple-900/20 rounded w-1/3" />
    </div>
);

// ─────────────────────────────────────────
// Mini Calendar
// ─────────────────────────────────────────
const Calendar = ({
    archivedDates,
    selectedDate,
    onSelectDate,
}: {
    archivedDates: string[];
    selectedDate: string | null;
    onSelectDate: (date: string) => void;
}) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthLabel = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

    const hasData = (day: number): boolean => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return archivedDates.some((d) => {
            // convert UTC date from DB to local date string for comparison
            const localDate = new Date(d);
            const localStr = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
            return localStr === dateStr;
        });
    };


    const isSelected = (day: number): boolean => {
        if (!selectedDate) return false;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return selectedDate === dateStr;
    };

    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        );
    };
    const handleDayClick = (day: number) => {
        if (!hasData(day)) return;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        onSelectDate(dateStr);
    };
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const blanks = Array(firstDay).fill(null);
    const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-5">

            {/* ── Month nav ── */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="text-gray-500 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-purple-900/30"
                >
                    ←
                </button>
                <p className="text-sm font-medium text-white">{monthLabel}</p>
                <button
                    onClick={nextMonth}
                    className="text-gray-500 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-purple-900/30"
                >
                    →
                </button>
            </div>

            {/* ── Day headers ── */}
            <div className="grid grid-cols-7 mb-2">
                {days.map((d) => (
                    <div key={d} className="text-center text-xs text-gray-600 font-light py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* ── Day cells ── */}
            <div className="grid grid-cols-7 gap-y-1">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {dayNums.map((day) => (
                    <div
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`
                            relative flex flex-col items-center justify-center
                            h-9 w-full rounded-lg text-xs transition-all
                            ${hasData(day)
                                ? "cursor-pointer hover:bg-purple-900/40"
                                : "cursor-default"
                            }
                            ${isSelected(day)
                                ? "bg-purple-600 text-white font-medium"
                                : isToday(day)
                                    ? "text-purple-400"
                                    : hasData(day)
                                        ? "text-white"
                                        : "text-gray-700"
                            }
                        `}
                    >
                        {day}
                        {/* ── dot indicator for dates with data ── */}
                        {hasData(day) && !isSelected(day) && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-500" />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-purple-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-xs text-gray-600 font-light">Has archived tasks</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// History Page
// ─────────────────────────────────────────
const History = () => {
    const dispatch = useAppDispatch();
    const {
        archivedTasks,
        total,
        stats,
        archivedDates,
        fetchLoading,
        datesLoading,
    } = useAppSelector((state) => state.archivedTask);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // ── fetch all archived dates on mount ──
    useEffect(() => {
        (dispatch as any)(getArchivedDatesThunk());
        return () => { dispatch(clearArchivedTasks()); };
    }, []);

    // ── fetch tasks when date is selected ──
    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        (dispatch as any)(getArchivedTasksByDateThunk(date));
    };

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month:   "long",
        day:     "numeric",
        year:    "numeric",
    })
    : null;

    return (
        <div className="min-h-screen bg-[#0d0a1a] px-4 py-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-xl font-light text-white tracking-tight">
                        Task History
                    </h1>
                    <p className="text-gray-600 text-xs font-light mt-0.5">
                        Select a date to view archived tasks
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">

                    {/* ── Calendar ── */}
                    {datesLoading ? (
                        <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-5 animate-pulse h-64" />
                    ) : (
                        <Calendar
                            archivedDates={archivedDates}
                            selectedDate={selectedDate}
                            onSelectDate={handleSelectDate}
                        />
                    )}

                    {/* ── Right panel ── */}
                    <div className="flex flex-col gap-4">

                        {!selectedDate ? (
                            <div className="bg-[#110d20] border border-purple-900/50 rounded-2xl p-10 text-center flex flex-col items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-600/40 flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                                        <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                                        <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                                        <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-400 font-light">
                                    Select a date from the calendar
                                </p>
                                <p className="text-xs text-gray-600 font-light">
                                    Dates with a purple dot have archived tasks
                                </p>
                            </div>
                        ) : fetchLoading ? (
                            <div className="flex flex-col gap-3">
                                <TaskSkeleton />
                                <TaskSkeleton />
                                <TaskSkeleton />
                            </div>
                        ) : (
                            <>
                                {/* ── Date heading ── */}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-white">{selectedDateLabel}</p>
                                    <p className="text-xs text-gray-600 font-light">{total} tasks</p>
                                </div>

                                {/* ── Stats ── */}
                                {stats && total > 0 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { label: "Total", value: total, color: "text-white" },
                                            { label: "Completed", value: stats.completed, color: "text-purple-400" },
                                            { label: "Pending", value: stats.pending, color: "text-yellow-400" },
                                            { label: "Not completed", value: stats.not_completed, color: "text-red-400" },
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-[#110d20] border border-purple-900/50 rounded-xl p-3 flex flex-col gap-1 text-center">
                                                <p className={`text-xl font-light ${stat.color}`}>{stat.value}</p>
                                                <p className="text-xs text-gray-600 font-light">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Progress bar ── */}
                                {stats && total > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 font-light">Completion rate</p>
                                            <p className="text-xs text-purple-400 font-medium">{stats.completionPct}%</p>
                                        </div>
                                        <div className="w-full h-1 bg-purple-900/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                                style={{ width: `${stats.completionPct}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── Task list ── */}
                                {archivedTasks.length === 0 ? (
                                    <div className="bg-[#110d20] border border-purple-900/50 rounded-xl p-8 text-center">
                                        <p className="text-sm text-gray-500 font-light">No tasks found for this date</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {archivedTasks.map((task) => (
                                            <ArchivedTaskCard key={task._id} task={task} />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;