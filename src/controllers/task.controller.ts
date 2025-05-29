import { Request, Response } from 'express';
import { createTaskInDb, deleteTaskInDb, getAllTasks, updateTaskStatusInDb } from '../services/taskRepository';

export const getTasks = (_: Request, res: Response) => {
  try {
    const tasks = getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving tasks' });
  }
};

export const createTask = (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const newTask = createTaskInDb(title, description);
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
      return res.status(400).json({ error: 'Invalid status. Must be "pending" or "completed".' });
    }

    const updatedTask = updateTaskStatusInDb(id, status);

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error updating task status' });
  }
};

export const deleteTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = deleteTaskInDb(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting task' });
  }
};
