import axiosInstance from "./axiosInstance";

const archivedTaskService = {

    getArchivedTasksByDate: async (date: string) => {
        const res = await axiosInstance.get(`/archived/history?date=${date}`);
        return res.data;
    },

    getArchivedDates: async () => {
        const res = await axiosInstance.get("/archived/dates");
        return res.data;
    },

};

export default archivedTaskService;