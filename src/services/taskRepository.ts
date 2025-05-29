import db from './db';
import { Task } from '../models/task.model';

export const getAllTasks = (): Task[] => {
  const statement = db.prepare(`
    SELECT * 
    FROM tasks 
    ORDER BY 
      COALESCE(updateDate, creationDate) DESC
  `);
  return statement.all() as Task[];
};

export const createTaskInDb = (title: string, description?: string): Task => {
  const insert = db.prepare(`
    INSERT INTO tasks (title, description)
    VALUES (?, ?)
  `);
  const result = insert.run(title, description || null);

  const newTask = db.prepare(`
    SELECT 
      id, 
      title, 
      description, 
      status, 
      creationDate, 
      updateDate
    FROM tasks
    WHERE id = ?
  `).get(result.lastInsertRowid) as Task;

  return newTask;
};

export const updateTaskStatusInDb = (id: string, status: 'pending' | 'completed'): Task | null => {
  const update = db.prepare(`
    UPDATE tasks
    SET status = ?, updateDate = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = update.run(status, id);

  if (result.changes === 0) {
    return null;
  }

  const updatedTask = db.prepare(`
    SELECT 
      id, 
      title, 
      description, 
      status, 
      creationDate, 
      updateDate
    FROM tasks
    WHERE id = ?
  `).get(id) as Task;

  return updatedTask;
};

export const deleteTaskInDb = (id: string): boolean => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
};