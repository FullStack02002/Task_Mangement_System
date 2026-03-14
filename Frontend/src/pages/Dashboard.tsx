import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hook";
import { getTodayTasksThunk, createTaskThunk, updateTaskThunk, deleteTaskThunk } from "../features/task/taskThunk";
import { getArchivedDatesThunk, getArchivedTasksByDateThunk } from "../features/archived-task/archivedTaskThunk";
import { clearArchivedTasks } from "../features/archived-task/archivedTaskSlice";
import type { ITask, CreateTaskDTO, TaskStatus } from "../types/task.types";
import { TaskCard, TaskModal, ArchivedTaskCard } from "../components/ui";
import { Calendar } from "../components/ui";

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
      <div className="h-6 w-20 bg-purple-900/30 rounded-full" />
    </div>
    <div className="flex gap-2 pt-1">
      <div className="h-7 w-16 bg-purple-900/20 rounded-lg" />
      <div className="h-7 w-12 bg-purple-900/20 rounded-lg" />
    </div>
  </div>
);


// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────
const Dashboard = () => {
  const dispatch = useAppDispatch();

  const { tasks, total, fetchLoading, createLoading, updateLoading, deleteLoading } =
    useAppSelector((state) => state.task);
  const {
    archivedTasks,
    total: archiveTotal,
    stats,
    archivedDates,
    fetchLoading: archiveFetchLoading,
    datesLoading,
  } = useAppSelector((state) => state.archivedTask);
  const user = useAppSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState<"today" | "history">("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<ITask | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ── Today stats ──
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    (dispatch as any)(getTodayTasksThunk());
    (dispatch as any)(getArchivedDatesThunk());
    return () => { dispatch(clearArchivedTasks()); };
  }, []);

  // ── clear history state when switching back to today ──
  useEffect(() => {
    if (activeTab === "today") {
      setSelectedDate(null);
      dispatch(clearArchivedTasks());
    }
  }, [activeTab]);

  // ── Task handlers ──
  const handleCreate = async (data: CreateTaskDTO) => {
    const result = await (dispatch as any)(createTaskThunk(data));
    if (result.meta.requestStatus === "fulfilled") setModalOpen(false);
  };

  const handleEdit = (task: ITask) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleUpdate = async (data: CreateTaskDTO) => {
    if (!editTask) return;
    const result = await (dispatch as any)(updateTaskThunk({
      id: editTask._id,
      updates: { title: data.title, description: data.description },
    }));
    if (result.meta.requestStatus === "fulfilled") {
      setModalOpen(false);
      setEditTask(null);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await (dispatch as any)(updateTaskThunk({ id, updates: { status } }));
  };

  const handleDelete = async (id: string) => {
    await (dispatch as any)(deleteTaskThunk(id));
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditTask(null);
  };

  // ── History handler ──
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    (dispatch as any)(getArchivedTasksByDateThunk(date));
  };

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    })
    : null;

  return (
    <>
      <div className=" bg-[#0d0a1a] px-4 py-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {greeting()},{" "}
                <span className="text-purple-400 font-medium">{user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="text-gray-600 text-xs font-bold mt-0.5">{todayLabel}</p>
            </div>
            {activeTab === "today" && (
              <button
                onClick={() => { setEditTask(null); setModalOpen(true); }}
                className="text-sm px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-900/40 cursor-pointer"
              >
                + New task
              </button>
            )}
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 bg-[#110d20] border border-purple-900/50 rounded-xl p-1">
            {(["today", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm transition-all cursor-pointer
                                ${activeTab === tab
                    ? "bg-purple-600 text-white font-medium shadow-lg shadow-purple-900/40"
                    : "text-gray-500 hover:text-gray-300 font-light"
                  }`}
              >
                {tab === "today" ? "Today's Board" : "History"}
              </button>
            ))}
          </div>

          {/* ════════════════════
                    TODAY TAB
                ════════════════════ */}
          {activeTab === "today" && (
            <>
              {/* ── Stats ── */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total", value: total, color: "text-white" },
                  { label: "Pending", value: pending, color: "text-yellow-400" },
                  { label: "In progress", value: inProgress, color: "text-blue-400" },
                  { label: "Completed", value: completed, color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#110d20] border border-purple-900/50 rounded-xl p-3 flex flex-col gap-1 text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-600 font-bold">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Progress bar ── */}
              {total > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-bold">Today's progress</p>
                    <p className="text-xs text-purple-400 font-medium">{completionPct}%</p>
                  </div>
                  <div className="w-full h-1 bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ── Task list ── */}
              <div className="flex flex-col gap-3">
                {fetchLoading ? (
                  <><TaskSkeleton /><TaskSkeleton /><TaskSkeleton /></>
                ) : tasks.length === 0 ? (
                  <div className="bg-[#110d20] border border-purple-900/50 rounded-xl p-10 text-center flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-600/40 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="3" width="12" height="2" rx="1" fill="#a78bfa" />
                        <rect x="2" y="7" width="8" height="2" rx="1" fill="#a78bfa" opacity="0.7" />
                        <rect x="2" y="11" width="10" height="2" rx="1" fill="#a78bfa" opacity="0.4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400 font-bold">No tasks for today</p>
                    <p className="text-xs text-gray-600 font-bold">Create your first task to get started</p>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="mt-1 text-sm px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-600/40 text-purple-300 hover:bg-purple-600/30 transition-all font-bold cursor-pointer"
                    >
                      + Add a task
                    </button>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                      deleteLoading={deleteLoading}
                      updateLoading={updateLoading}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* ════════════════════
                    HISTORY TAB
                ════════════════════ */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-5">

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

              {/* ── No date selected ── */}
              {!selectedDate ? (
                <div className="bg-[#110d20] border border-purple-900/50 rounded-xl p-8 text-center flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-400 font-light">Select a date from the calendar</p>
                  <p className="text-xs text-gray-600 font-light">Dates with a purple dot have archived tasks</p>
                </div>

              ) : archiveFetchLoading ? (
                <><TaskSkeleton /><TaskSkeleton /><TaskSkeleton /></>

              ) : (
                <>
                  {/* ── Date heading ── */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{selectedDateLabel}</p>
                    <p className="text-xs text-gray-600 font-light">{archiveTotal} tasks</p>
                  </div>

                  {/* ── Stats ── */}
                  {stats && archiveTotal > 0 && (
                    <>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Total", value: archiveTotal, color: "text-white" },
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

                      {/* ── Progress ── */}
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
                    </>
                  )}

                  {/* ── Archived task list ── */}
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
          )}
        </div>

        {/* ── Modal ── */}
        <TaskModal
          open={modalOpen}
          onClose={handleModalClose}
          onSubmit={editTask ? handleUpdate : handleCreate}
          loading={editTask ? updateLoading : createLoading}
          editTask={editTask}
        />
      </div>
    </>

  );
};

export default Dashboard;