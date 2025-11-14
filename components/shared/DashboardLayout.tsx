import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from './LanguageContext';
import GlobalSearch from '../admin/GlobalSearch';
import DashboardSidebar from './DashboardSidebar';
import { MenuIcon } from '../ui/Icons';
import { Permission } from '../../types';
import type { NavLinkItem } from '../../data/navigation';

interface DashboardLayoutProps {
  navLinks: NavLinkItem[];
  pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ navLinks, pageTitle }) => {
    const { language, t } = useLanguage();
    const { currentUser: user, logout: onLogout, hasPermission } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');

    if (!user) return null;
    
    const isAdminDashboard = hasPermission(Permission.MANAGE_USERS);
    const isRTL = language === 'ar';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
            <DashboardSidebar 
                user={user}
                navLinks={navLinks}
                onLogout={onLogout}
                hasPermission={hasPermission}
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen} 
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            
            <div className={`transition-all duration-300 ${isRTL ? (isCollapsed ? 'lg:mr-20' : 'lg:mr-72') : (isCollapsed ? 'lg:pl-20' : 'lg:pl-72')}`}>
                 {/* This header is for mobile and also provides a container for global search on desktop */}
                <div className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="h-6 w-6" />
                    </button>

                    {/* Separator for mobile */}
                    <div className="h-6 w-px bg-gray-900/10 dark:bg-gray-50/10 lg:hidden" aria-hidden="true" />
                    
                    <div className="flex flex-1 justify-center lg:justify-end">
                        {isAdminDashboard && <GlobalSearch />}
                    </div>
                </div>

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                       <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;