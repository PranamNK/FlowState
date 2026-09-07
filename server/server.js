import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { registerSocketHandlers } from './sockets/sessionSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);
registerSocketHandlers(io);

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`[FLOWSTATE API] Server listening on http://localhost:${PORT}`);
      console.log(`[FLOWSTATE API] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[FLOWSTATE API] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
