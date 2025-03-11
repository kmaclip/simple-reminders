export interface DBResult {
    lastID?: number;
    changes?: number;
}

export interface TaskDB {
    id: number;
    text: string;
    priority: string;
    status: string;
    date_created: string;
    date_updated: string;
    date_completed?: string;
}

export interface TaskHistoryDB {
    id: number;
    task_id: number;
    previous_status: string;
    new_status: string;
    changed_at: string;
}