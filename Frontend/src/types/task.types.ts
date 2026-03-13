export type TaskStatus = "pending" | "in_progress" | "completed";

export interface ITask {
    _id:         string;
    userId:      string;
    title:       string;
    description: string | null;
    status:      TaskStatus;
    taskDate:    string;
    completedAt: string | null;
    createdAt:   string;
    updatedAt:   string;
}

export interface TaskState {
    tasks:        ITask[];
    currentTask:  ITask | null;
    total:        number;
    date:         string | null;
    loading:      boolean;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
    fetchLoading:  boolean;
}

export interface CreateTaskDTO {
    title:        string;
    description?: string;
}

export interface UpdateTaskDTO {
    title?:       string;
    description?: string;
    status?:      TaskStatus;
}

export interface TasksResponseDTO {
    date:  string;
    tasks: ITask[];
    total: number;
}