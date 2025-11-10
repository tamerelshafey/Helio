
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BellIcon } from '../icons/Icons';
import type { Notification } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getNotificationsByUserId, markNotificationsAsRead } from '../../services/notifications';
import { useLanguage } from './LanguageContext';

const NotificationBell: React.FC = () => {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    const { data: notifications, refetch } = useQuery({
        queryKey: ['notifications', currentUser?.id],
        queryFn: () => currentUser ? getNotificationsByUserId(currentUser.id) : Promise.resolve([]),
        enabled: !!currentUser,
    });

    const userNotifications = useMemo(() => notifications || [], [notifications]);

    const unreadCount = useMemo(() => userNotifications.filter(n => !n.isRead).length, [userNotifications]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (isOpen && !(event.target as HTMLElement).closest('.notification-bell-wrapper')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, [isOpen]);

    const handleToggle = async () => {
        const shouldOpen = !isOpen;
        setIsOpen(shouldOpen);

        if (shouldOpen && unreadCount > 0 && currentUser) {
            const unreadIds = userNotifications.filter(n => !n.isRead).map(n => n.id);
            await markNotificationsAsRead(currentUser.id, unreadIds);
            refetch(); // Refetch to update the read status visually
        }
    };
    
    const handleNotificationClick = (link: string) => {
        setIsOpen(false);
        navigate(link);
    };

    return (
        <div className="relative notification-bell-wrapper">
            <button 
                onClick={handleToggle}
                className="relative text-gray-500 dark:text-gray-400 hover:text-amber-500 transition-colors"
                aria-label="Toggle notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-fadeIn`}>
                    <div className="p-3 font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
                        {t.notifications.title}
                    </div>
                    {userNotifications.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                            {userNotifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.link)}
                                    className={`w-full text-left p-3 text-sm flex items-start gap-3 transition-colors ${!notification.isRead ? 'bg-amber-50/50 dark:bg-amber-900/20' : ''} hover:bg-gray-100 dark:hover:bg-gray-700`}
                                >
                                    {!notification.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>}
                                    <div className="flex-grow">
                                        <p className="text-gray-700 dark:text-gray-300">{notification.message[language]}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                            {t.notifications.noNotifications}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
