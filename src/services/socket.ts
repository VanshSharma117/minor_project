import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      // Socket connected successfully
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection warning (polling fallback active):', error.message);
    });
  }

  return socket;
}

export function subscribeToMessages(
  userId: string | undefined,
  mentorshipId: string | undefined,
  onNewMessage: (message: Message) => void
): () => void {
  const s = getSocket();

  if (userId) {
    s.emit('join_user', userId);
  }

  if (mentorshipId) {
    s.emit('join_mentorship', mentorshipId);
  }

  const handleMessage = (msg: Message) => {
    // Only process if it belongs to this conversation/mentorship or user
    if (
      (!mentorshipId || msg.mentorshipId === mentorshipId) ||
      (userId && (msg.recipientId === userId || msg.senderId === userId))
    ) {
      onNewMessage(msg);
    }
  };

  s.on('receive_message', handleMessage);
  s.on('new_message', handleMessage);

  return () => {
    s.off('receive_message', handleMessage);
    s.off('new_message', handleMessage);
  };
}
