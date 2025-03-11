"use client"
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Plus, MoreVertical, Pencil, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const WarehouseDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    complete: []
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Theme initialization
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load tasks when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchTasks(selectedDate);
    }
  }, [selectedDate]);

  const fetchTasks = async (date: Date) => {
    try {
      setLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(`${API_URL}/tasks/${formattedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newTaskText,
          priority: 'medium',
          status: 'todo',
          date_created: format(selectedDate, 'yyyy-MM-dd')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, newTask]
      }));
      setNewTaskText('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const moveTask = async (taskId: number, fromColumn: string, toColumn: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: toColumn
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      setTasks(prev => ({
        ...prev,
        [fromColumn]: prev[fromColumn].filter(t => t.id !== taskId),
        [toColumn]: [...prev[toColumn], { ...prev[fromColumn].find(t => t.id === taskId), status: toColumn }]
      }));
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const deleteTask = async (taskId: number, column: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(prev => ({
        ...prev,
        [column]: prev[column].filter(task => task.id !== taskId)
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const TaskCard = ({ task, column }) => (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:hover:bg-zinc-800">
      <CardContent className="p-4">
        <div className={`w-2 h-2 rounded-full mb-2 ${
          task.priority === 'high' ? 'bg-red-500 dark:bg-red-400' :
          task.priority === 'medium' ? 'bg-yellow-500 dark:bg-yellow-400' :
          'bg-green-500 dark:bg-green-400'
        }`} />
        
        {editingTask === task.id ? (
          <Input
            value={task.text}
            onChange={(e) => {
              setTasks(prev => ({
                ...prev,
                [column]: prev[column].map(t =>
                  t.id === task.id ? { ...t, text: e.target.value } : t
                )
              }));
            }}
            onBlur={() => setEditingTask(null)}
            autoFocus
            className="dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
          />
        ) : (
          <p className="text-sm dark:text-zinc-100">{task.text}</p>
        )}
        
        <div className="flex justify-end mt-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingTask(task.id)}
            className="dark:hover:bg-zinc-700/50 dark:text-zinc-200"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="dark:hover:bg-zinc-700/50 dark:text-zinc-200">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-zinc-800 dark:border-zinc-700">
              {column !== 'todo' && (
                <DropdownMenuItem 
                  onClick={() => moveTask(task.id, column, 'todo')}
                  className="dark:focus:bg-zinc-700 dark:text-zinc-200"
                >
                  Move to Todo
                </DropdownMenuItem>
              )}
              {column !== 'inProgress' && (
                <DropdownMenuItem 
                  onClick={() => moveTask(task.id, column, 'inProgress')}
                  className="dark:focus:bg-zinc-700 dark:text-zinc-200"
                >
                  Move to In Progress
                </DropdownMenuItem>
              )}
              {column !== 'complete' && (
                <DropdownMenuItem 
                  onClick={() => moveTask(task.id, column, 'complete')}
                  className="dark:focus:bg-zinc-700 dark:text-zinc-200"
                >
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-500 dark:text-red-400 dark:focus:bg-zinc-700"
                onClick={() => deleteTask(task.id, column)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200">
      <div className="container mx-auto p-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            {/* Date Selector */}
            <div className="flex items-center gap-2">
              <DatePicker 
                date={selectedDate} 
                onSelect={handleDateChange}
              />
              <span className="text-sm dark:text-zinc-400">
                {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Input
              placeholder="Add new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="w-64 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
            <Button 
              onClick={addTask} 
              className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64 dark:text-zinc-400">
            Loading tasks...
          </div>
        ) : (
          /* Columns */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Todo Column */}
            <div className="bg-white dark:bg-zinc-800/30 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
              <h2 className="text-lg font-semibold mb-4 dark:text-zinc-100">To Do</h2>
              {tasks.todo.map(task => (
                <TaskCard key={task.id} task={task} column="todo" />
              ))}
            </div>

            {/* In Progress Column */}
            <div className="bg-white dark:bg-zinc-800/30 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
              <h2 className="text-lg font-semibold mb-4 dark:text-zinc-100">In Progress</h2>
              {tasks.inProgress.map(task => (
                <TaskCard key={task.id} task={task} column="inProgress" />
              ))}
            </div>

            {/* Complete Column */}
            <div className="bg-white dark:bg-zinc-800/30 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
              <h2 className="text-lg font-semibold mb-4 dark:text-zinc-100">Complete</h2>
              {tasks.complete.map(task => (
                <TaskCard key={task.id} task={task} column="complete" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDashboard;