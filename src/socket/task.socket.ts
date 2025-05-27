import { Server } from 'socket.io';
import db from '../services/db';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('newTask', () => {
      const tasks = db.prepare('SELECT * FROM tasks').all();
      io.emit('tasksUpdated', tasks);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};
