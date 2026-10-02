import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { db } from './db.js';
import { Message } from './types.js';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Client joins room for their user ID
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Client joins room for their mentorship workspace
    socket.on('join_mentorship', (mentorshipId: string) => {
      if (mentorshipId) {
        socket.join(`mentorship:${mentorshipId}`);
      }
    });

    // Real-time message event from client
    socket.on('send_message', (data: { recipientId: string; content: string; mentorshipId?: string; senderId: string }) => {
      try {
        const sender = db.getUserById(data.senderId);
        const recipient = db.getUserById(data.recipientId);
        if (!sender || !recipient || !data.content?.trim()) return;

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          mentorshipId: data.mentorshipId,
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role,
          recipientId: recipient.id,
          recipientName: recipient.name,
          content: data.content.trim(),
          timestamp: new Date().toISOString(),
          read: false
        };

        db.messages.push(newMessage);

        db.addNotification(
          recipient.id,
          `New message from ${sender.name}`,
          data.content.slice(0, 80),
          'mentorship',
          sender.role === 'student' ? '/faculty/messages' : '/student/my-mentoring'
        );

        broadcastMessage(newMessage);
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('disconnect', () => {
      // Client disconnected
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastMessage(message: Message) {
  if (!io) return;
  try {
    if (message.mentorshipId) {
      io.to(`mentorship:${message.mentorshipId}`).emit('receive_message', message);
    }
    io.to(`user:${message.recipientId}`).emit('receive_message', message);
    io.to(`user:${message.senderId}`).emit('receive_message', message);
    io.emit('new_message', message);
  } catch (err) {
    console.error('Error broadcasting message via socket:', err);
  }
}
