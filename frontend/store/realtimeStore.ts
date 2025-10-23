import { create } from 'zustand';
import { getSocket } from '@/lib/socket';
import type { Application, Interview } from '@ats/shared';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface RealtimeState {
  notifications: Notification[];
  onlineUsers: string[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  setupListeners: () => void;
  cleanupListeners: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  notifications: [],
  onlineUsers: [],

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  setupListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('application_updated', (data: any) => {
      get().addNotification({
        type: 'application',
        message: `Application status updated to ${data.status}`,
      });
    });

    socket.on('interview_scheduled', (data: any) => {
      get().addNotification({
        type: 'interview',
        message: 'New interview scheduled',
      });
    });

    socket.on('status_changed', (data: any) => {
      get().addNotification({
        type: 'status',
        message: `Status changed from ${data.oldStatus} to ${data.newStatus}`,
      });
    });

    socket.on('notification', (data: any) => {
      get().addNotification({
        type: data.type,
        message: data.message,
      });
    });
  },

  cleanupListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off('application_updated');
    socket.off('interview_scheduled');
    socket.off('status_changed');
    socket.off('notification');
  },
}));

