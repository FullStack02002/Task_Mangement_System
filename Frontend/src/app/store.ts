import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import taskReducer from "../features/task/taskSlice";
import archivedTaskReducer from "../features/archived-task/archivedTaskSlice"


export const store = configureStore({
    reducer: {
        auth: authReducer,
        task: taskReducer,
        archivedTask: archivedTaskReducer,
    }
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


