export type FinalStatus = "completed" | "pending" | "not_completed";

export interface IArchivedTask {
    _id:               string;
    originalTaskId:    string;
    userId:            string;
    title:             string;
    description:       string | null;
    finalStatus:       FinalStatus;
    taskDate:          string;
    completedAt:       string | null;
    originalCreatedAt: string;
    archivedAt:        string;
}

export interface ArchivedStats {
    completed:     number;
    pending:       number;
    not_completed: number;
    completionPct: number;
}

export interface ArchivedTasksByDateResponse {
    date:  string;
    tasks: IArchivedTask[];
    total: number;
    stats: ArchivedStats;
}

export interface ArchivedTaskState {
    archivedTasks:  IArchivedTask[];
    total:          number;
    date:           string | null;
    stats:          ArchivedStats | null;
    archivedDates:  string[];
    fetchLoading:   boolean;
    datesLoading:   boolean;
}