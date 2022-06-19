import { nanoid } from 'nanoid';
import create, { GetState, SetState } from 'zustand';

export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
};

export const useNotificationStore = create<NotificationsStore>(
  (set: SetState<NotificationsStore>) => ({
    notifications: [],
    addNotification: (notification: Notification) =>
      set((state: NotificationsStore) => ({
        notifications: [...state.notifications, { id: nanoid(), ...notification }],
      })),
    dismissNotification: (id: string) =>
      set((state: NotificationsStore) => ({
        notifications: state.notifications.filter(
          (notification: Notification) => notification.id !== id
        ),
      })),
  })
);
