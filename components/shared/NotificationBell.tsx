
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { BellIcon, ArrowRightIcon } from '../ui/Icons';
import type { Notification } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { getNotificationsByUserId, markNotificationsAsRead } from '../../services/notifications';
import { useLanguage } from './LanguageContext';
import { Permission } from '../../types';

const NotificationBell: React.FC = () => {
    const { currentUser, hasPermission } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    const { data: notifications, refetch } = useQuery({
        queryKey: ['notifications', currentUser?.id],
        queryFn: () => currentUser ? getNotificationsByUserId(currentUser.id) : Promise.resolve([]),
        enabled: !!currentUser,
        // Polling to simulate real-time checks
        refetchInterval: 10000 
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
            refetch(); 
        }
    };
    
    const handleNotificationClick = (link: string) => {
        setIsOpen(false);
        navigate(link);
    };

    const notificationsLink = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/notifications' : '/dashboard/notifications';

    return (
        <div className="relative notification-bell-wrapper">
            <button 
                onClick={handleToggle}
                className="relative text-gray-500 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle notifications"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] font-bold items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fadeIn overflow-hidden origin-top-right`}>
                    <div className="p-3 font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                        <span>{t.notifications.title}</span>
                        {unreadCount > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                        {userNotifications.length > 0 ? (
                            userNotifications.slice(0, 5).map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification.link)}
                                    className={`w-full text-left p-3 text-sm flex items-start gap-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${!notification.isRead ? 'bg-amber-50/50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notification.isRead ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    <div className="flex-grow">
                                        <p className="text-gray-700 dark:text-gray-200 line-clamp-2">{notification.message[language]}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <BellIcon className="w-10 h-10 text-gray-300 mb-2" />
                                <p className="text-sm">{t.notifications.noNotifications}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
                        <Link 
                            to={notificationsLink} 
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center justify-center gap-1 py-1"
                        >
                            {language === 'ar' ? 'عرض كل الإشعارات' : 'View all notifications'}
                            <ArrowRightIcon className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
