import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { TaskDB, TaskHistoryDB, DBResult } from '../types/database';

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'warehouse.db');
const db = new sqlite3.Database(dbPath);

// Database helper functions with proper typing
export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });
}

export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T);
        });
    });
}

export function dbRun(sql: string, params: any[] = []): Promise<DBResult> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

// Initialize database with tables
const initDb = async () => {
    try {
        // Create tasks table
        await dbRun(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL,
                date_created TEXT NOT NULL,
                date_updated TEXT DEFAULT CURRENT_TIMESTAMP,
                date_completed TEXT
            )
        `, []);

        // Create task_history table
        await dbRun(`
            CREATE TABLE IF NOT EXISTS task_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                previous_status TEXT,
                new_status TEXT,
                changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
            )
        `, []);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Initialize tables
initDb();

export default db;