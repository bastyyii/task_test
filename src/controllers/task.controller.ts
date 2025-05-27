import { Request, Response } from 'express';
import db from '../services/db';

import { Task } from '../models/task.model';

export const getTasks = (_: Request, res: Response) => {
  try {
    const tasks = db
      .prepare(`
        SELECT * 
        FROM tasks 
        ORDER BY 
          COALESCE(updateDate, creationDate) DESC
      `)
      .all() as Task[];
      
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving tasks' });
  }
};

export const createTask = (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const insert = db.prepare(`
      INSERT INTO tasks (title, description)
      VALUES (?, ?)
    `);
    const result = insert.run(title, description || null);

    const newTask = db
      .prepare(`
        SELECT 
          id, 
          title, 
          description, 
          status, 
          creationDate, 
          updateDate
        FROM tasks
        WHERE id = ?
      `)
      .get(result.lastInsertRowid) as Task;

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Server error creating task' });
  }
};

export const updateTaskStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'pending' && status !== 'completed') {
      return res.status(400).json({ error: 'Invalid status. Must be "pending" or "compled".' });
    }

    const result = db.prepare(`
      UPDATE tasks
      SET status = ?, updateDate = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = db
      .prepare(`
        SELECT 
          id, 
          title, 
          description, 
          status, 
          creationDate, 
          updateDate
        FROM tasks
        WHERE id = ?
      `)
      .get(id) as Task;

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating task status' });
  }
};

export const deleteTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting task' });
  }
};
