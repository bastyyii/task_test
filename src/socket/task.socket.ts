import { Server } from 'socket.io';
import db from '../services/db';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {

    socket.on('newTask', () => {
      const tasks = db.prepare('SELECT * FROM tasks').all();
      io.emit('tasksUpdated', tasks);
    });

    socket.on('disconnect', () => {
    });
  });
};
