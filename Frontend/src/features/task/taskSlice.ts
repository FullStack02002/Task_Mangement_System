import { createSlice } from "@reduxjs/toolkit";
import type { TaskState } from "../../types/task.types";
import {
    createTaskThunk,
    getTodayTasksThunk,
    getTaskByIdThunk,
    updateTaskThunk,
    deleteTaskThunk,
} from "./taskThunk"

const initialState: TaskState = {
    tasks: [],
    currentTask: null,
    total: 0,
    date: null,
    loading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    fetchLoading: false,
};

const taskSlice = createSlice({
    name: "task",
    initialState,
    reducers: {
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        clearTasks: (state) => {
            state.tasks = [];
            state.total = 0;
            state.date = null;
        },
    },
    extraReducers: (builder) => {

        // ── Create Task ──
        builder
            .addCase(createTaskThunk.pending, (state) => { state.createLoading = true; })
            .addCase(createTaskThunk.fulfilled, (state, action) => {
                state.createLoading = false;
                state.tasks.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createTaskThunk.rejected, (state) => { state.createLoading = false; });

        // ── Get Today's Tasks ──
        builder
            .addCase(getTodayTasksThunk.pending, (state) => { state.fetchLoading = true; })
            .addCase(getTodayTasksThunk.fulfilled, (state, action) => {
                state.fetchLoading = false;
                state.tasks = action.payload.tasks;
                state.total = action.payload.total;
                state.date = action.payload.date;
            })
            .addCase(getTodayTasksThunk.rejected, (state) => { state.fetchLoading = false; });

        // ── Get Task By Id ──
        builder
            .addCase(getTaskByIdThunk.pending, (state) => { state.loading = true; })
            .addCase(getTaskByIdThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTask = action.payload;
            })
            .addCase(getTaskByIdThunk.rejected, (state) => { state.loading = false; });

        // ── Update Task ──
        builder
            .addCase(updateTaskThunk.pending, (state) => { state.updateLoading = true; })
            .addCase(updateTaskThunk.fulfilled, (state, action) => {
                state.updateLoading = false;
                const index = state.tasks.findIndex((t) => t._id === action.payload._id);
                if (index !== -1) state.tasks[index] = action.payload;
                if (state.currentTask?._id === action.payload._id) {
                    state.currentTask = action.payload;
                }
            })
            .addCase(updateTaskThunk.rejected, (state) => { state.updateLoading = false; });

        // ── Delete Task ──
        builder
            .addCase(deleteTaskThunk.pending, (state) => { state.deleteLoading = true; })
            .addCase(deleteTaskThunk.fulfilled, (state, action) => {
                state.deleteLoading = false;
                state.tasks = state.tasks.filter((t) => t._id !== action.payload);
                state.total -= 1;
            })
            .addCase(deleteTaskThunk.rejected, (state) => { state.deleteLoading = false; });
    },
});

export const { clearCurrentTask, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;