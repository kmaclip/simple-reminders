import { Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../config/database';
import { Task, TaskUpdate } from '../models/task.interface';
import { TaskDB } from '../types/database';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        const tasks = await dbAll<TaskDB>(
            'SELECT * FROM tasks WHERE date(date_created) = date(?) ORDER BY date_created',
            [date]
        );
        
        const organized = {
            todo: tasks.filter(task => task.status === 'todo'),
            inProgress: tasks.filter(task => task.status === 'inProgress'),
            complete: tasks.filter(task => task.status === 'complete')
        };
        
        res.json(organized);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { text, priority, status, date_created }: Task = req.body;
        const result = await dbRun(
            'INSERT INTO tasks (text, priority, status, date_created) VALUES (?, ?, ?, ?)',
            [text, priority, status, date_created]
        );
        
        const newTask = await dbGet<TaskDB>(
            'SELECT * FROM tasks WHERE id = ?', 
            [result.lastID]
        );
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates: TaskUpdate = req.body;
        
        // Get current task status
        const currentTask = await dbGet<TaskDB>(
            'SELECT status FROM tasks WHERE id = ?', 
            [id]
        );
        
        if (!currentTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update task
        await dbRun(`
            UPDATE tasks 
            SET text = COALESCE(?, text),
                priority = COALESCE(?, priority),
                status = COALESCE(?, status),
                date_updated = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [updates.text, updates.priority, updates.status, id]);
        
        // Record status change if status was updated
        if (updates.status && currentTask.status !== updates.status) {
            await dbRun(
                'INSERT INTO task_history (task_id, previous_status, new_status) VALUES (?, ?, ?)',
                [id, currentTask.status, updates.status]
            );
        }
        
        const updatedTask = await dbGet<TaskDB>(
            'SELECT * FROM tasks WHERE id = ?', 
            [id]
        );
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await dbRun('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getTaskHistory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const history = await dbAll(
            'SELECT * FROM task_history WHERE task_id = ? ORDER BY changed_at DESC',
            [id]
        );
        res.json(history);
    } catch (error) {
        console.error('Error fetching task history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};