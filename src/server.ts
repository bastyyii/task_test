import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './socket/task.socket';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

setupSocket(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
