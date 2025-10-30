import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';

interface DashboardLayoutProps {
    language: Language;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ language }) => {
    const t = translations[language].dashboard;
    const { currentUser, logout } = useAuth();
    
    const baseLinkClasses = "flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors";
    const activeLinkClasses = "bg-amber-500 text-gray-900";
    const inactiveLinkClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
    
    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="text-center mb-8">
                    <img src={currentUser?.imageUrl} alt={currentUser?.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-amber-500 object-cover" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.welcome}</h2>
                    <p className="text-amber-500">{currentUser?.name}</p>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {(currentUser?.type === 'developer' || currentUser?.type === 'agency') && (
                             <li>
                                <NavLink to="/dashboard" end className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                    {t.navProperties}
                                </NavLink>
                            </li>
                        )}
                        {currentUser?.type === 'finishing' && (
                            <li>
                                <NavLink to="/dashboard/portfolio" className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                    {t.navPortfolio}
                                </NavLink>
                            </li>
                        )}
                         <li>
                            <NavLink to="/dashboard/leads" className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                {t.navLeads}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboard/profile" className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                {t.navProfile}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div>
                     <button onClick={logout} className="w-full text-left text-red-500 hover:bg-red-500/10 px-4 py-3 rounded-lg transition-colors">
                        {translations[language].auth.logout}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;