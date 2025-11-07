import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Role } from '../../types';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { adminNavLinks } from '../../data/navigation';
import GlobalSearch from './GlobalSearch';
import { MenuIcon, CloseIcon } from '../icons/Icons';

const AdminDashboardLayout: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const { currentUser, logout, hasPermission } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location]);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

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
                                <NavLink to={link.href} end={link.exact} className={({isActive}) => `flex items-center px-4 py-3 text-md font-medium rounded-lg transition-colors ${isActive ? 'bg-amber-500 text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
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
        </>
    );

    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            <div 
                className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            ></div>
            <aside className={`fixed lg:relative inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-40 transform transition-transform duration-300 w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-6 flex flex-col
                lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}
            >
                <button onClick={() => setIsSidebarOpen(false)} className={`lg:hidden absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-500 dark:text-gray-400 p-2`}>
                    <CloseIcon className="w-6 h-6"/>
                </button>
                <SidebarContent />
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/50 p-4 flex items-center justify-between lg:justify-center sticky top-20 z-20">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-600 dark:text-gray-300 p-2">
                        <MenuIcon className="w-6 h-6"/>
                    </button>
                    <GlobalSearch language={language} />
                    <div className="lg:hidden w-8"></div> {/* Spacer to help center search on mobile */}
                </header>
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;