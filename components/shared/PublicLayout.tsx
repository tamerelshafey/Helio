

import React, { useState, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import QuietZone from './QuietZone';
import MobileNav from './MobileNav';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from './LanguageContext';
import { Permission } from '../../types';

const PublicLayout: React.FC = () => {
    const [isQuietZoneActive, setIsQuietZoneActive] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    const { currentUser, logout, hasPermission } = useAuth();
    const { t } = useLanguage();

    const dashboardPath = useMemo(() => {
        if (!currentUser) return '/login';
        if (hasPermission(Permission.VIEW_ADMIN_DASHBOARD)) {
            return '/admin';
        }
        if (hasPermission(Permission.VIEW_PARTNER_DASHBOARD)) {
            return '/dashboard';
        }
        return '/';
    }, [currentUser, hasPermission]);

    const dashboardText = hasPermission(Permission.VIEW_ADMIN_DASHBOARD)
        ? t.adminDashboard.title
        : t.dashboard.title;

    const handleToggleQuietZone = useCallback(() => {
        setIsQuietZoneActive(true);
        setIsMobileNavOpen(false); // Close nav when opening quiet zone from mobile
    }, []);

    const handleOpenMobileNav = useCallback(() => {
        setIsMobileNavOpen(true);
    }, []);
    
    const handleLogout = useCallback(() => {
        logout();
        setIsMobileNavOpen(false); // Close nav on logout
    }, [logout]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                onToggleQuietZone={handleToggleQuietZone}
                onOpenMobileNav={handleOpenMobileNav}
                currentUser={currentUser}
                dashboardPath={dashboardPath}
                dashboardText={dashboardText}
                logout={handleLogout}
            />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            {isQuietZoneActive && <QuietZone onClose={() => setIsQuietZoneActive(false)} />}

            <MobileNav
                id="mobile-nav-menu"
                isOpen={isMobileNavOpen}
                onClose={() => setIsMobileNavOpen(false)}
                onToggleQuietZone={handleToggleQuietZone}
                currentUser={currentUser}
                dashboardPath={dashboardPath}
                logout={handleLogout}
                hasPermission={hasPermission}
            />
        </div>
    );
};

export default PublicLayout;