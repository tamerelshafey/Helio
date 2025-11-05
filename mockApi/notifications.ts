import { notificationsData } from '../data/notifications';
import type { Notification } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    await delay(300);
    return notificationsData
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification => {
    const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
    };
    notificationsData.unshift(newNotification);
    return newNotification;
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]): Promise<void> => {
    await delay(100);
    notificationsData.forEach(n => {
        if (n.userId === userId && notificationIds.includes(n.id)) {
            n.isRead = true;
        }
    });
};
