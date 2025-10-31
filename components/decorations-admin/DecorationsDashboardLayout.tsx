import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { CubeIcon, QuoteIcon, WrenchScrewdriverIcon } from '../icons/Icons';

interface DecorationsDashboardLayoutProps {
    language: Language;
}

const DecorationsDashboardLayout: React.FC<DecorationsDashboardLayoutProps> = ({ language }) => {
    const t = translations[language];
    const { currentUser, logout } = useAuth();
    
    const baseLinkClasses = "flex items-center px-4 py-3 text-md font-medium rounded-lg transition-colors";
    const activeLinkClasses = "bg-amber-500 text-gray-900";
    const inactiveLinkClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

    const managementLinks = [
        { name: t.adminDashboard.decorationsManagement.portfolioTab, href: "/decorations-admin/portfolio", icon: <CubeIcon className="w-5 h-5" /> },
        { name: t.adminDashboard.decorationsManagement.requestsTab, href: "/decorations-admin/requests", icon: <QuoteIcon className="w-5 h-5" /> },
        { name: t.adminDashboard.decorationsManagement.categoriesTab, href: "/decorations-admin/categories", icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            <aside className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="text-center mb-8">
                    <img src={currentUser?.imageUrl} alt={currentUser?.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-amber-500 object-cover" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.dashboard.welcome}</h2>
                    <p className="text-amber-500">{currentUser?.name}</p>
                </div>
                <nav className="flex-grow">
                    <p className="px-4 mt-6 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t.adminDashboard.decorationsManagement.title}</p>
                    <ul className="space-y-2">
                        {managementLinks.map(link => (
                            <li key={link.href}>
                                <NavLink to={link.href} className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                    <span className={language === 'ar' ? 'ml-3' : 'mr-3'}>{link.icon}</span>
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div>
                     <button onClick={logout} className="w-full text-left text-red-500 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-colors">
                        {t.auth.logout}
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DecorationsDashboardLayout;
