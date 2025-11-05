import React, { useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Role } from '../../types';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { adminNavLinks } from '../../data/navigation';
import GlobalSearch from './GlobalSearch';

const AdminDashboardLayout: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const { currentUser, logout, hasPermission } = useAuth();
    
    const baseLinkClasses = "flex items-center px-4 py-3 text-md font-medium rounded-lg transition-colors";
    const activeLinkClasses = "bg-amber-500 text-gray-900";
    const inactiveLinkClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

    const visibleNavLinks = useMemo(() => {
        if (!currentUser) return [];
        return adminNavLinks.filter(link => 
            hasPermission(link.permission) && 
            (!link.roles || link.roles.includes(currentUser.role))
        );
    }, [currentUser, hasPermission]);
    
    const linkGroups = useMemo(() => {
        const groups: { [key: string]: typeof visibleNavLinks } = {
            main: [],
            requests: [],
            management: []
        };
        const groupKeys: { [key: string]: 'main' | 'requests' | 'management' } = {
            'Super Admin': 'main',
            'Super Admin Requests': 'requests',
            'Super Admin Management': 'management'
        };

        visibleNavLinks.forEach(link => {
            const groupKey = groupKeys[link.group];
            if (groupKey) {
                groups[groupKey].push(link);
            }
        });
        return [groups.main, groups.requests, groups.management].filter(g => g.length > 0);
    }, [visibleNavLinks]);

    const pageTitle = useMemo(() => {
        if (!currentUser) return t.title;

        // Get localized name from translations if available
        const userInfo = (translations[language].partnerInfo as any)[currentUser.id];
        if (userInfo && userInfo.name) {
            return userInfo.name;
        }
        
        // Fallback to deriving from Role enum
        const roleName = Object.keys(Role).find(key => (Role as any)[key] === currentUser.role);
        return roleName ? roleName.replace(/_/g, ' ').replace('PARTNER', '').trim() : t.title;
    }, [currentUser, t.title, language]);
    
    if (!currentUser) {
        return null;
    }
    
    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            <aside className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="text-center mb-8">
                    <img src={currentUser.imageUrl} alt={currentUser.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-amber-500 object-cover" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                    <p className="text-sm text-amber-500 mt-1 capitalize">{pageTitle.toLowerCase()}</p>
                </div>
                <nav className="flex-grow overflow-y-auto">
                    {linkGroups.map((group, index) => (
                        <ul key={index} className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 first:border-t-0 first:mt-0 first:pt-0">
                            {group.map(link => {
                                const Icon = link.icon;
                                return (
                                <li key={link.href}>
                                    <NavLink to={link.href} end={link.exact} className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                        <span className={language === 'ar' ? 'ml-3' : 'mr-3'}><Icon className="w-5 h-5" /></span>
                                        {link.name(t)}
                                    </NavLink>
                                </li>
                            )})}
                        </ul>
                    ))}
                </nav>
                <div className="mt-4">
                     <button onClick={logout} className="w-full text-left text-red-500 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-colors">
                        {translations[language].auth.logout}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50 p-4 flex items-center justify-center sticky top-20 z-30 backdrop-blur-sm">
                    <GlobalSearch language={language} />
                </header>
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
