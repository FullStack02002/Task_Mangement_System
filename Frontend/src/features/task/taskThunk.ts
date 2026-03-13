import { createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "../../services/task.service";
import { toast } from "sonner";
import type { CreateTaskDTO, UpdateTaskDTO } from "../../types/task.types";

// ─────────────────────────────────────────
// Create Task
// ─────────────────────────────────────────
export const createTaskThunk = createAsyncThunk(
    "task/createTask",
    async (data: CreateTaskDTO, { rejectWithValue }) => {
        try {
            const res = await taskService.createTask(data);
            toast.success("Task created successfully");
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to create task";
            toast.error("Failed to create task", { description: message });
            return rejectWithValue(null);
        }
    }
);

// ─────────────────────────────────────────
// Get Today's Tasks
// ─────────────────────────────────────────
export const getTodayTasksThunk = createAsyncThunk(
    "task/getTodayTasks",
    async (_, { rejectWithValue }) => {
        try {
            const res = await taskService.getTodayTasks();
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch tasks";
            toast.error("Failed to fetch tasks", { description: message });
            return rejectWithValue(null);
        }
    }
);

// ─────────────────────────────────────────
// Get Task By Id
// ─────────────────────────────────────────
export const getTaskByIdThunk = createAsyncThunk(
    "task/getTaskById",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await taskService.getTaskById(id);
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch task";
            toast.error("Failed to fetch task", { description: message });
            return rejectWithValue(null);
        }
    }
);

// ─────────────────────────────────────────
// Update Task
// ─────────────────────────────────────────
export const updateTaskThunk = createAsyncThunk(
    "task/updateTask",
    async (data: { id: string; updates: UpdateTaskDTO }, { rejectWithValue }) => {
        try {
            const res = await taskService.updateTask(data.id, data.updates);
            toast.success("Task updated successfully");
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to update task";
            toast.error("Failed to update task", { description: message });
            return rejectWithValue(null);
        }
    }
);

// ─────────────────────────────────────────
// Delete Task
// ─────────────────────────────────────────
export const deleteTaskThunk = createAsyncThunk(
    "task/deleteTask",
    async (id: string, { rejectWithValue }) => {
        try {
            await taskService.deleteTask(id);
            toast.success("Task deleted successfully");
            return id;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to delete task";
            toast.error("Failed to delete task", { description: message });
            return rejectWithValue(null);
        }
    }
);