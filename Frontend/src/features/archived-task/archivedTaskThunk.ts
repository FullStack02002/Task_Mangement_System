import { createAsyncThunk } from "@reduxjs/toolkit";
import archivedTaskService from "../../services/archived-task.service";
import { toast } from "sonner";

// ─────────────────────────────────────────
// Get Archived Dates
// ─────────────────────────────────────────
export const getArchivedDatesThunk = createAsyncThunk(
    "archivedTask/getArchivedDates",
    async (_, { rejectWithValue }) => {
        try {
            const res = await archivedTaskService.getArchivedDates();
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch archived dates";
            toast.error("Failed to fetch dates", { description: message });
            return rejectWithValue(null);
        }
    }
);

// ─────────────────────────────────────────
// Get Archived Tasks By Date
// ─────────────────────────────────────────
export const getArchivedTasksByDateThunk = createAsyncThunk(
    "archivedTask/getArchivedTasksByDate",
    async (date: string, { rejectWithValue }) => {
        try {
            const res = await archivedTaskService.getArchivedTasksByDate(date);
            return res.data;
        } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to fetch archived tasks";
            toast.error("Failed to fetch tasks", { description: message });
            return rejectWithValue(null);
        }
    }
);