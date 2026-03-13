import axios from "axios";
import { store } from "../app/store";
import { setAccessToken, clearAuth } from "../features/auth/authSlice";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/users/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.data.accessToken;
                store.dispatch(setAccessToken(newToken));
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch {
                store.dispatch(clearAuth());
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;