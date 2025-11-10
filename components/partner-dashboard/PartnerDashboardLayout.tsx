import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { partnerNavLinks } from '../../data/navigation';
import { useLanguage } from '../shared/LanguageContext';
import DashboardSidebar from '../shared/DashboardSidebar';

const PartnerDashboardLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser: user, logout: onLogout, hasPermission } = useAuth();
    const isRTL = language === 'ar';

    if (!user) return null;

    return (
        <div className={`flex min-h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <DashboardSidebar
                user={user}
                navLinks={partnerNavLinks}
                onLogout={onLogout}
                pageTitle={t.dashboard.title}
                hasPermission={hasPermission}
            />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default PartnerDashboardLayout;
