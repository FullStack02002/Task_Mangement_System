import axiosInstance from "./axiosInstance";
import type { CreateTaskDTO, UpdateTaskDTO } from "../types/task.types";

const taskService = {

    createTask: async (data: CreateTaskDTO) => {
        const res = await axiosInstance.post("/tasks", data);
        return res.data;
    },

    getTaskById: async (id: string) => {
        const res = await axiosInstance.get(`/tasks/${id}`);
        return res.data;
    },

    updateTask: async (id: string, data: UpdateTaskDTO) => {
        const res = await axiosInstance.patch(`/tasks/${id}`, data);
        return res.data;
    },

    deleteTask: async (id: string) => {
        const res = await axiosInstance.delete(`/tasks/${id}`);
        return res.data;
    },

    getTodayTasks: async () => {
        const res = await axiosInstance.get("/tasks/today");
        return res.data;
    },
};

export default taskService;