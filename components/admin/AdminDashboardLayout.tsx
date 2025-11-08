
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { adminNavLinks } from '../../data/navigation';
import GlobalSearch from './GlobalSearch';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';

const AdminDashboardLayout: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard;
    const { currentUser, logout, hasPermission } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const location = useLocation();
    const isRTL = language === 'ar';

    useEffect(() => {
        // You might want to close the sidebar on mobile when navigating,
        // but with the new collapsible design, it might be better to keep its state.
        // For now, we'll keep it as is.
    }, [location]);


    const visibleNavLinks = useMemo(() => {
        if (!currentUser) return [];
        return adminNavLinks.filter(link => 
            hasPermission(link.permission) && 
            (!link.roles || link.roles.includes(currentUser.role))
        );
    }, [currentUser, hasPermission]);
    
    const linkGroups = useMemo(() => {
        const groupOrder = ['Main', 'Requests', 'Entities', 'Content', 'System'];
        const groups: { [key: string]: typeof visibleNavLinks } = {};
        
        visibleNavLinks.forEach(link => {
            if (!groups[link.group]) {
                groups[link.group] = [];
            }
            groups[link.group].push(link);
        });

        return groupOrder
            .map(groupName => groups[groupName])
            .filter(group => group && group.length > 0);
            
    }, [visibleNavLinks]);

    const pageTitle = useMemo(() => {
        if (!currentUser) return t.title;

        const userInfo = (translations[language].partnerInfo as any)[currentUser.id];
        if (userInfo && userInfo.name) {
            return userInfo.name;
        }
        
        const roleName = Object.keys(Role).find(key => (Role as any)[key] === currentUser.role);
        return roleName ? roleName.replace(/_/g, ' ').replace('PARTNER', '').trim() : t.title;
    }, [currentUser, t.title, language]);
    
    if (!currentUser) {
        return null;
    }
    
    const SidebarContent = () => (
        <>
            <div className={`text-center mb-8 ${isSidebarCollapsed ? 'px-2' : ''}`}>
                <img src={currentUser.imageUrl} alt={currentUser.name} className={`w-24 h-24 rounded-full mx-auto mb-4 border-2 border-amber-500 object-cover transition-all ${isSidebarCollapsed ? '!w-12 !h-12' : ''}`} />
                <div className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</h2>
                    <p className="text-sm text-amber-500 mt-1 capitalize truncate">{pageTitle.toLowerCase()}</p>
                </div>
            </div>
            <nav className="flex-grow overflow-y-auto overflow-x-hidden">
                {linkGroups.map((group, index) => (
                    <ul key={index} className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 first:border-t-0 first:mt-0 first:pt-0">
                        {group.map(link => {
                            const Icon = link.icon;
                            return (
                            <li key={link.href}>
                                <NavLink to={link.href} end={link.exact} className={({isActive}) => `flex items-center px-4 py-3 text-md font-medium rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-amber-500 text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <span className={`${isSidebarCollapsed ? 'hidden' : `block ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{link.name(t)}</span>
                                </NavLink>
                            </li>
                        )})}
                    </ul>
                ))}
            </nav>
            <div className={`mt-auto flex-shrink-0 ${isSidebarCollapsed ? 'border-t border-gray-200 dark:border-gray-700 pt-4' : ''}`}>
                 <button onClick={logout} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-red-500 hover:bg-red-500/10 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    {/* Placeholder for logout icon if needed */}
                    <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>{translations[language].auth.logout}</span>
                </button>
                 <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="w-full flex items-center px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                 >
                    {isRTL ? (
                        isSidebarCollapsed ? <ChevronDoubleLeftIcon className="w-5 h-5 mx-auto"/> : <ChevronDoubleRightIcon className="w-5 h-5"/>
                    ) : (
                        isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5 mx-auto"/> : <ChevronDoubleLeftIcon className="w-5 h-5"/>
                    )}
                    <span className={`${isSidebarCollapsed ? 'hidden' : `block ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{language === 'ar' ? 'تقليص' : 'Collapse'}</span>
                 </button>
            </div>
        </>
    );

    return (
        <div className="flex h-full">
            <aside className={`flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col h-[calc(100vh-80px)] sticky top-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
                <SidebarContent />
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 p-4 flex items-center justify-center sticky top-20 z-20">
                    <GlobalSearch />
                </header>
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
