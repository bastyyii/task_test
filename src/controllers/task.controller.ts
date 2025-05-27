import { Request, Response } from 'express';
import db from '../services/db';
import { Task } from '../models/task.model';

export const getTasks = (_: Request, res: Response) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
};

export const createTask = (req: Request, res: Response) => {
    try {
        const { titulo, descripcion } = req.body;
        if (!titulo || titulo.length > 100) {
            res.status(400).json({ error: 'Título inválido' });
            return
        }

        const stmt = db.prepare(`
            INSERT INTO tasks (titulo, descripcion) VALUES (?, ?)
        `);
        const info = stmt.run(titulo, descripcion || null);

        const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'});
    }
};

export const updateTaskStatus = (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    db.prepare(`
        UPDATE tasks SET status = ?, fechaActualizacion = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(updated);
};

export const deleteTask = (req: Request, res: Response) => {
    const { id } = req.params;
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.status(204).send();
};