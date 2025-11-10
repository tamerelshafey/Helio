import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, LogoutIcon } from '../icons/Icons';
import type { Partner, Permission } from '../../types';

interface NavLinkItem {
  name: (t: any) => string;
  href: string;
  icon: React.FC<{ className?: string }>;
  exact?: boolean;
  group: string;
}

interface DashboardSidebarProps {
  user: Partner;
  navLinks: NavLinkItem[];
  onLogout: () => void;
  pageTitle: string;
  hasPermission: (permission: Permission) => boolean;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user, navLinks, onLogout, pageTitle, hasPermission }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    const visibleNavLinks = useMemo(() => {
        return navLinks.filter(link => hasPermission(link.permission));
    }, [navLinks, hasPermission]);
    
    const linkGroups = useMemo(() => {
        const groupOrder = ['Main', 'Requests', 'Entities', 'Content', 'System', 'Partner'];
        const groups: { [key: string]: typeof visibleNavLinks } = {};
        
        visibleNavLinks.forEach(link => {
            if (!groups[link.group]) {
                groups[link.group] = [];
            }
            groups[link.group].push(link);
        });

        return groupOrder
            .map(groupName => ({ name: groupName, links: groups[groupName] }))
            .filter(group => group.links && group.links.length > 0);
            
    }, [visibleNavLinks]);

    const partnerName = t.partnerInfo[user.id]?.name || user.name;
    const dashboardTitle = isFullAdmin(pageTitle) ? (t.partnerInfo[user.id]?.name || user.name) : t.dashboard.title;

    function isFullAdmin(title: string): boolean {
        return title === t.adminDashboard.title;
    }

    return (
        <aside className={`dashboard-sidebar flex-shrink-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-4 flex flex-col h-[calc(100vh-80px)] sticky top-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-24' : 'w-72'} ${isRTL ? 'border-l' : 'border-r'}`}>
            <div className="flex flex-col h-full">
                <div className={`text-center mb-8 ${isSidebarCollapsed ? 'px-1' : 'px-4'}`}>
                    <img src={user.imageUrl} alt={partnerName} className={`w-24 h-24 rounded-full mx-auto mb-4 border-2 border-amber-500 object-cover transition-all duration-300 ${isSidebarCollapsed ? '!w-12 !h-12' : ''}`} />
                    <div className={`transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={partnerName}>{partnerName}</h2>
                        <p className="text-sm text-amber-500 mt-1 capitalize truncate">{dashboardTitle}</p>
                    </div>
                </div>
                <nav className="flex-grow overflow-y-auto overflow-x-hidden -mr-2 pr-2">
                    {linkGroups.map((group, index) => (
                        <ul key={index} className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 first:border-t-0 first:mt-0 first:pt-0">
                            {group.links.map(link => {
                                const Icon = link.icon;
                                const t_group = group.name === 'Partner' ? t.dashboard : t.adminDashboard;
                                const linkName = link.name(t_group);
                                return (
                                <li key={link.href}>
                                    <NavLink to={link.href} end={link.exact} className={({isActive}) => `flex items-center px-4 py-3 text-md font-medium rounded-lg transition-colors ${isSidebarCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-amber-500 text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`} title={isSidebarCollapsed ? linkName : ''}>
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 w-0' : `opacity-100 w-auto ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{linkName}</span>
                                    </NavLink>
                                </li>
                            )})}
                        </ul>
                    ))}
                </nav>
                <div className={`mt-auto flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700`}>
                    <button onClick={onLogout} title={t.auth.logout} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors text-red-500 hover:bg-red-500/10 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogoutIcon className="w-5 h-5 flex-shrink-0"/>
                        <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 w-0' : `opacity-100 w-auto ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{t.auth.logout}</span>
                    </button>
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="w-full flex items-center px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                        {isRTL ? (
                            isSidebarCollapsed ? <ChevronDoubleLeftIcon className="w-5 h-5 flex-shrink-0"/> : <ChevronDoubleRightIcon className="w-5 h-5 flex-shrink-0"/>
                        ) : (
                            isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5 flex-shrink-0"/> : <ChevronDoubleLeftIcon className="w-5 h-5 flex-shrink-0"/>
                        )}
                        <span className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? 'opacity-0 w-0' : `opacity-100 w-auto ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{language === 'ar' ? 'طي القائمة' : 'Collapse Menu'}</span>
                    </button>
                </div>
          </div>
        </aside>
    );
};

export default DashboardSidebar;
