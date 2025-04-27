import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Notification } from '../types/notification';
import { User } from '../models/User';

class WebSocketService {
  private io: Server;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
      },
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('authenticate', async (token: string) => {
        try {
          const user = await this.authenticateUser(token);
          if (user) {
            this.userSockets.set(user._id.toString(), socket.id);
            socket.emit('authenticated', { userId: user._id });
          }
        } catch (error) {
          socket.emit('error', { message: 'Authentication failed' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        for (const [userId, socketId] of this.userSockets.entries()) {
          if (socketId === socket.id) {
            this.userSockets.delete(userId);
            break;
          }
        }
      });
    });
  }

  private async authenticateUser(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId: string };

      return await User.findById(decoded.userId);
    } catch (error) {
      return null;
    }
  }

  sendNotification(userId: string, notification: Notification): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }
  }

  broadcastToAdmins(event: string, data: any): void {
    this.io.emit(`admin:${event}`, data);
  }

  broadcastToInstructors(event: string, data: any): void {
    this.io.emit(`instructor:${event}`, data);
  }

  broadcastToStudents(event: string, data: any): void {
    this.io.emit(`student:${event}`, data);
  }

  sendToUser(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  joinRoom(socketId: string, room: string): void {
    this.io.sockets.sockets.get(socketId)?.join(room);
  }

  leaveRoom(socketId: string, room: string): void {
    this.io.sockets.sockets.get(socketId)?.leave(room);
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }
}

let websocketService: WebSocketService;

export const initializeWebSocket = (server: HttpServer): void => {
  websocketService = new WebSocketService(server);
};

export const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    throw new Error('WebSocket service not initialized');
  }
  return websocketService;
}; 