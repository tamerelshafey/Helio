import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { adminNavLinks } from '../../data/navigation';
import { useLanguage } from '../shared/LanguageContext';
import GlobalSearch from './GlobalSearch';
import DashboardSidebar from '../shared/DashboardSidebar';

const AdminDashboardLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser: user, logout: onLogout, hasPermission } = useAuth();
    const isRTL = language === 'ar';

    if (!user) return null;

    return (
        <div className={`flex min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <DashboardSidebar
                user={user}
                navLinks={adminNavLinks}
                onLogout={onLogout}
                pageTitle={t.adminDashboard.title}
                hasPermission={hasPermission}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 p-4 flex items-center justify-center sticky top-20 z-20">
                    <GlobalSearch />
                </header>
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
