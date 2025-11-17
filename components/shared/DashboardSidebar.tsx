

import React, { useMemo, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { 
    ChevronDoubleLeftIcon, ChevronDoubleRightIcon, LogoutIcon, CloseIcon, HelioLogo 
} from '../ui/Icons';
import { type Partner, Permission, Role } from '../../types';

interface NavLinkItem {
  name: (t: any) => string;
  href: string;
  icon: React.FC<{ className?: string }>;
  exact?: boolean;
  group: string;
  permission: Permission;
  roles?: Role[];
}

interface DashboardSidebarProps {
  user: Partner;
  navLinks: NavLinkItem[];
  onLogout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const SidebarContent: React.FC<Omit<DashboardSidebarProps, 'isOpen' | 'setIsOpen' | 'setIsCollapsed'> & {onLinkClick: () => void}> = ({
    user,
    navLinks,
    onLogout,
    hasPermission,
    isCollapsed,
    onLinkClick
}) => {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';

    const visibleNavLinks = useMemo(() => {
        if (!user) return [];
        return navLinks.filter(link => 
            hasPermission(link.permission) && 
            (!link.roles || link.roles.includes(user.role))
        );
    }, [navLinks, hasPermission, user]);
    
    const linkGroups = useMemo(() => {
        const groupOrder = ['Overview', 'Request Triage', 'Platform Operations', 'Partner & Content Management', 'System', 'Partner'];
        const groups: { [key: string]: typeof visibleNavLinks } = {};
        
        visibleNavLinks.forEach(link => {
            if (!groups[link.group]) groups[link.group] = [];
            groups[link.group].push(link);
        });

        return groupOrder
            .map(groupName => ({ name: groupName, links: groups[groupName] }))
            .filter(group => group.links && group.links.length > 0);
            
    }, [visibleNavLinks]);

    const partnerName = t.partnerInfo[user.id]?.name || user.name;
    const isAdminDashboard = hasPermission(Permission.MANAGE_USERS);
    const dashboardTitle = isAdminDashboard ? (t.partnerInfo[user.id]?.name || user.name) : t.dashboard.title;

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-4 py-4 dashboard-sidebar">
             <div className={`flex h-16 shrink-0 items-center gap-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <HelioLogo className={`h-8 w-auto text-amber-500`} />
                <span className={`font-bold text-lg text-gray-800 dark:text-white ${isCollapsed ? 'hidden' : ''}`}>ONLY HELIO</span>
            </div>
            
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                         <div className={`text-center space-y-2 ${isCollapsed ? 'px-1' : ''}`}>
                             <img src={user.imageUrl} alt={partnerName} className={`mx-auto border-2 border-amber-500 object-cover rounded-full transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'}`} />
                            <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
                                 <h2 className="text-md font-bold text-gray-900 dark:text-white truncate" title={partnerName}>{partnerName}</h2>
                                 <p className="text-xs text-amber-500 capitalize truncate">{dashboardTitle}</p>
                            </div>
                        </div>
                    </li>
                    
                    {linkGroups.map((group, index) => (
                         <li key={group.name}>
                            <div className={`text-xs font-semibold leading-6 text-gray-400 px-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}>
                                {group.name.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <ul role="list" className="mt-2 space-y-1">
                                {group.links.map(link => {
                                    const Icon = link.icon;
                                    const t_group = group.name === 'Partner' ? t.dashboard : t.adminDashboard;
                                    
                                    let linkName = link.name(t_group);
                                    // Dynamically change "All Requests" to "My Requests" for managers
                                    if (link.href === '/admin/requests' && user.role !== Role.SUPER_ADMIN) {
                                        linkName = t.adminDashboard.nav.myRequests;
                                    }

                                    return (
                                        <li key={link.href} className="relative group">
                                            <NavLink 
                                                to={link.href} 
                                                end={link.exact} 
                                                onClick={onLinkClick}
                                                className={({isActive}) => `flex items-center w-full p-3 text-md font-medium rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-amber-500 text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                            >
                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 absolute' : `opacity-100 w-auto ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{linkName}</span>
                                            </NavLink>
                                            {isCollapsed && (
                                                <div className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10`}>
                                                    {linkName}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    ))}

                    <li className="mt-auto">
                        <button onClick={onLogout} title={t.auth.logout} className={`w-full flex items-center p-3 rounded-lg transition-colors text-red-500 hover:bg-red-500/10 ${isCollapsed ? 'justify-center' : ''}`}>
                            <LogoutIcon className="w-5 h-5 flex-shrink-0"/>
                            <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 absolute' : `opacity-100 w-auto ${isRTL ? 'mr-3' : 'ml-3'}`}`}>{t.auth.logout}</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
};


const DashboardSidebar: React.FC<DashboardSidebarProps> = (props) => {
    const { isOpen, setIsOpen, isCollapsed, setIsCollapsed } = props;
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }, [isCollapsed]);

    return (
        <>
            {/* Mobile sidebar */}
            <div className={`relative z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsOpen(false)} />
                <div className="fixed inset-0 flex">
                    <div className={`relative flex h-full w-full max-w-xs flex-1 transition-transform duration-300 ease-in-out 
                        ${isRTL ? 'ml-auto' : 'mr-auto'} 
                        ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`
                    }>
                        <div className={`absolute top-0 flex w-16 justify-center pt-5 ${isRTL ? 'right-full' : 'left-full'}`}>
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsOpen(false)}>
                                <span className="sr-only">Close sidebar</span>
                                <CloseIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <SidebarContent {...props} isCollapsed={false} onLinkClick={() => setIsOpen(false)} />
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-[width] duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-700">
                    <SidebarContent {...props} onLinkClick={() => {}} />
                    <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                        >
                            <span className="sr-only">Collapse sidebar</span>
                             {isRTL ? (
                                isCollapsed ? <ChevronDoubleLeftIcon className="h-5 w-5" /> : <ChevronDoubleRightIcon className="h-5 w-5" />
                            ) : (
                                isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardSidebar;
