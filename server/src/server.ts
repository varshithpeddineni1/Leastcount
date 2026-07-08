import 'dotenv/config';
import { createServer } from 'node:http';
import { Server as SocketIoServer } from 'socket.io';
import { createApp } from './app.js';
import { logger } from './logger.js';

const port = Number(process.env.PORT ?? 3000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';

const app = createApp();
const httpServer = createServer(app);

const io = new SocketIoServer(httpServer, {
  cors: { origin: clientOrigin },
});

io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'socket connected');
});

httpServer.listen(port, () => {
  logger.info({ port }, 'server listening');
});
