import type { CreateTaskDTO,ITask } from "../../types/task.types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const TaskModal = ({
  open,
  onClose,
  onSubmit,
  loading,
  editTask,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDTO) => void;
  loading: boolean;
  editTask: ITask | null;
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateTaskDTO>();

  useEffect(() => {
    if (editTask) {
      reset({ title: editTask.title, description: editTask.description ?? "" });
    } else {
      reset({ title: "", description: "" });
    }
  }, [editTask, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal ── */}
      <div className="relative w-full max-w-md bg-[#110d20] border border-purple-900/50 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-white">
            {editTask ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-300 transition-colors text-lg leading-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* ── Title ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
              Title
            </label>
            <input
              placeholder="What needs to be done?"
              className={`w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-bold
                                ${errors.title
                  ? "border-red-500/60 focus:border-red-400"
                  : "border-purple-900/50 focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20"
                }`}
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 200, message: "Title too long" },
              })}
            />
            {errors.title && (
              <span className="text-xs text-red-400 font-bold">{errors.title.message}</span>
            )}
          </div>

          {/* ── Description ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-400 tracking-[0.08em] uppercase">
              Description <span className="text-gray-600 normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Add more details..."
              className="w-full px-4 py-3 rounded-xl bg-[#0d0a1a] border border-purple-900/50 text-white text-sm outline-none transition-all duration-200 placeholder-gray-700 font-bold focus:border-purple-600/80 focus:ring-1 focus:ring-purple-600/20 resize-none"
              {...register("description", {
                maxLength: { value: 2000, message: "Description too long" },
              })}
            />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-purple-900/50 text-gray-400 hover:text-white hover:border-purple-700/60 text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2
                                ${loading
                  ? "bg-purple-900/40 cursor-not-allowed text-purple-400/60"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 cursor-pointer"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                  {editTask ? "Saving..." : "Creating..."}
                </>
              ) : (
                editTask ? "Save changes →" : "Create task →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};