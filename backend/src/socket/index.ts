import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { logger } from '../utils/logger';

export class SocketServer {
  private io: SocketIOServer;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      try {
        const decoded = jwt.verify(token, jwtConfig.secret) as any;
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);
      logger.info(`User: ${socket.data.user?.email}`);

      // Join room
      socket.on('join_room', (room: string) => {
        socket.join(room);
        logger.info(`Client ${socket.id} joined room: ${room}`);
      });

      // Leave room
      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        logger.info(`Client ${socket.id} left room: ${room}`);
      });

      // Send message
      socket.on('send_message', (data: { room: string; message: string }) => {
        const { room, message } = data;
        const messageData = {
          room,
          message,
          userId: socket.data.user?.id,
          username: socket.data.user?.email,
          timestamp: new Date().toISOString(),
        };
        
        this.io.to(room).emit('new_message', messageData);
        logger.info(`Message sent to room ${room} by ${socket.data.user?.email}`);
      });

      // Disconnect
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Emit events to specific rooms
  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
  }

  // Emit events to all clients
  public emitToAll(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Get IO instance
  public getIO(): SocketIOServer {
    return this.io;
  }
}

let socketServer: SocketServer;

export const initializeSocket = (httpServer: HTTPServer): SocketServer => {
  socketServer = new SocketServer(httpServer);
  return socketServer;
};

export const getSocketServer = (): SocketServer => {
  if (!socketServer) {
    throw new Error('Socket server not initialized');
  }
  return socketServer;
};

