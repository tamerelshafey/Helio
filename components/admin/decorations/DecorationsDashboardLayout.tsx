
import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useLanguage } from '../../shared/LanguageContext';

const DecorationsLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const t_decor = t.adminDashboard.decorationsManagement;

    const tabs = [
        { name: t_decor.portfolioTab, href: 'portfolio' },
        { name: t_decor.categoriesTab, href: 'categories' },
    ];

    const baseClasses = "px-4 py-3 font-semibold text-md border-b-4 transition-colors duration-200";
    const activeClasses = "border-amber-500 text-amber-500";
    const inactiveClasses = "border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50";

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_decor.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_decor.subtitle}</p>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                 <div className="flex flex-wrap -mb-px" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.href}
                            to={tab.href}
                            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </div>
            </div>
            
            <Outlet />
        </div>
    );
};

export default DecorationsLayout;
