export interface Task {
  id?: number;
  text: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'inProgress' | 'complete';
  date_created: Date;
  date_updated?: Date;
  date_completed?: Date;
}

export interface TaskUpdate {
  text?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'inProgress' | 'complete';
}