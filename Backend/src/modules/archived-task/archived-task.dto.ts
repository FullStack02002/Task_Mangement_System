import type { FinalStatus } from "./archived-task.types.js";

export interface ArchivedTaskResponseDTO {
    _id:              string;
    originalTaskId:   string;
    userId:           string;
    title:            string;
    description:      string | null;
    finalStatus:      FinalStatus;
    taskDate:         Date;
    completedAt:      Date | null;
    originalCreatedAt: Date;
    archivedAt:       Date;
}

export interface ArchivedTasksByDateDTO {
    date:  Date;
    tasks: ArchivedTaskResponseDTO[];
    total: number;
    stats: {
        completed:      number;
        pending:        number;
        not_completed:  number;
        completionPct:  number;
    };
}

export const toArchivedTaskResponseDTO = (task: any): ArchivedTaskResponseDTO => ({
    _id:               task._id.toString(),
    originalTaskId:    task.originalTaskId.toString(),
    userId:            task.userId.toString(),
    title:             task.title,
    description:       task.description ?? null,
    finalStatus:       task.finalStatus,
    taskDate:          task.taskDate,
    completedAt:       task.completedAt ?? null,
    originalCreatedAt: task.originalCreatedAt,
    archivedAt:        task.archivedAt,
});