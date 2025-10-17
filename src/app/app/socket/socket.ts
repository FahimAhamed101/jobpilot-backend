// app/socket/socket.ts
import { Server, Socket } from 'socket.io';
import { logger } from '../../../shared/logger';

// Store user socket connections
const userSockets = new Map<string, string>();

export const socketHelper = {
  socket: (io: Server) => {
    io.on('connection', (socket: Socket) => {
      logger.info(`🔗 User connected: ${socket.id}`);

      // User joins their personal room
      socket.on('join-user-room', (userId: string) => {
        try {
          socket.join(userId);
          userSockets.set(userId, socket.id);
          logger.info(`👤 User ${userId} joined room with socket: ${socket.id}`);
          
          // Send confirmation to client
          socket.emit('room-joined', { 
            success: true, 
            userId, 
            message: 'Successfully joined user room' 
          });
        } catch (error) {
          logger.error(`Error joining room for user ${userId}:`, error);
          socket.emit('room-join-error', { error: 'Failed to join room' });
        }
      });

      // Handle notification events
      socket.on('mark-notification-read', (data: { notificationId: string, userId: string }) => {
        try {
          // Broadcast to all clients in the user room
          io.to(data.userId).emit('notification-read', data.notificationId);
          logger.info(`📖 Notification ${data.notificationId} marked as read for user ${data.userId}`);
        } catch (error) {
          logger.error('Error marking notification as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        logger.info(`🔌 User disconnected: ${socket.id}, Reason: ${reason}`);
        
        // Remove user from tracking
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            logger.info(`🗑️  Removed user ${userId} from tracking`);
            break;
          }
        }
      });

      // Handle connection errors
      socket.on('connect_error', (error) => {
        logger.error(`❌ Socket connection error: ${error.message}`);
      });

      // Ping-Pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });

    // Log connection stats periodically
    setInterval(() => {
      logger.info(`📊 Active socket connections: ${io.engine.clientsCount}`);
      logger.info(`👥 Tracked users: ${userSockets.size}`);
    }, 300000); // Every 5 minutes
  },

  // Helper method to get user socket ID
  getUserSocket: (userId: string): string | undefined => {
    return userSockets.get(userId);
  },

  // Helper method to send notification to specific user
  sendToUser: (io: Server, userId: string, event: string, data: any) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  },

  // Broadcast to all users in a room
  broadcastToRoom: (io: Server, room: string, event: string, data: any) => {
    io.to(room).emit(event, data);
  }
};