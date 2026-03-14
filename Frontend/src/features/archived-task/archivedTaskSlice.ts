import { createSlice } from "@reduxjs/toolkit";
import type { ArchivedTaskState } from "../../types/archived-task.types";
import { getArchivedDatesThunk, getArchivedTasksByDateThunk } from "./archivedTaskThunk";

const initialState: ArchivedTaskState = {
    archivedTasks: [],
    total: 0,
    date: null,
    stats: null,
    archivedDates: [],
    fetchLoading: false,
    datesLoading: false,
};

const archivedTaskSlice = createSlice({
    name: "archivedTask",
    initialState,
    reducers: {
        clearArchivedTasks: (state) => {
            state.archivedTasks = [];
            state.total = 0;
            state.date = null;
            state.stats = null;
        },
    },
    extraReducers: (builder) => {

        // ── Get Archived Dates ──
        builder
            .addCase(getArchivedDatesThunk.pending, (state) => { state.datesLoading = true; })
            .addCase(getArchivedDatesThunk.fulfilled, (state, action) => {
                state.datesLoading = false;
                state.archivedDates = action.payload ?? [];
            })
            .addCase(getArchivedDatesThunk.rejected, (state) => { state.datesLoading = false; });

        // ── Get Archived Tasks By Date ──
        builder
            .addCase(getArchivedTasksByDateThunk.pending, (state) => {
                state.fetchLoading = true;
                state.archivedTasks = [];
                state.stats = null;
            })
            .addCase(getArchivedTasksByDateThunk.fulfilled, (state, action) => {
                state.fetchLoading = false;
                state.archivedTasks = action.payload.tasks;
                state.total = action.payload.total;
                state.date = action.payload.date;
                state.stats = action.payload.stats;
            })
            .addCase(getArchivedTasksByDateThunk.rejected, (state) => {
                state.fetchLoading = false;
            });
    },
});

export const { clearArchivedTasks } = archivedTaskSlice.actions;
export default archivedTaskSlice.reducer;