import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { BuildingIcon, WrenchScrewdriverIcon, QuoteIcon, UserPlusIcon, ClipboardDocumentListIcon, InboxIcon, HomeIcon, CubeIcon } from '../icons/Icons';

interface AdminDashboardLayoutProps {
    language: Language;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ language }) => {
    const t = translations[language].adminDashboard;
    const { currentUser, logout } = useAuth();
    
    const baseLinkClasses = "flex items-center px-4 py-3 text-md font-medium rounded-lg transition-colors";
    const activeLinkClasses = "bg-amber-500 text-gray-900";
    const inactiveLinkClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";

    const requestLinks = [
        { name: t.nav.partnerRequests, href: "/admin/partner-requests", icon: <UserPlusIcon className="w-5 h-5" /> },
        { name: t.nav.propertyRequests, href: "/admin/property-requests", icon: <ClipboardDocumentListIcon className="w-5 h-5" /> },
        { name: t.nav.contactRequests, href: "/admin/contact-requests", icon: <InboxIcon className="w-5 h-5" /> },
    ];
    
    const managementLinks = [
        { name: t.nav.managePartners, href: "/admin/partners", icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
        { name: t.nav.manageProperties, href: "/admin/properties", icon: <BuildingIcon className="w-5 h-5" /> },
        { name: t.nav.manageLeads, href: "/admin/leads", icon: <QuoteIcon className="w-5 h-5" /> },
    ];
    
    const decorationLinks = [
        { name: t.nav.decorationsPortfolio, href: "/admin/decorations/portfolio", icon: <CubeIcon className="w-5 h-5" /> },
        { name: t.nav.decorationsRequests, href: "/admin/decorations/requests", icon: <InboxIcon className="w-5 h-5" /> },
        { name: t.nav.decorationsCategories, href: "/admin/decorations/categories", icon: <WrenchScrewdriverIcon className="w-5 h-5" /> },
    ];


    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            {/* Sidebar */}
            <aside className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                <div className="text-center mb-8">
                    <img src={currentUser?.imageUrl} alt={currentUser?.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-amber-500 object-cover" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translations[language].dashboard.welcome}</h2>
                    <p className="text-amber-500">{currentUser?.name}</p>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        <li>
                            <NavLink to="/admin" end className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                <span className={language === 'ar' ? 'ml-3' : 'mr-3'}><HomeIcon className="w-5 h-5" /></span>
                                {t.nav.dashboard}
                            </NavLink>
                        </li>
                    </ul>
                     <p className="px-4 mt-6 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Requests</p>
                    <ul className="space-y-2">
                        {requestLinks.map(link => (
                            <li key={link.href}>
                                <NavLink to={link.href} className={({isActive}) => `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}>
                                    <span className={language === 'ar' ? 'ml-3' : 'mr-3'}>{link.icon}</span>
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <p className="px-4 mt-6 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Management</p>
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
                     <p className="px-4 mt-6 text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{t.nav.manageDecorations}</p>
                    <ul className="space-y-2">
                        {decorationLinks.map(link => (
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

export default AdminDashboardLayout;