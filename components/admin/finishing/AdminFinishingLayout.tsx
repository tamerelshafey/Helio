
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLanguage } from '../../shared/LanguageContext';

const AdminFinishingLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const t_nav = t.adminDashboard.nav;

    const tabs = [
        { name: t_nav.dashboard, href: '/admin/finishing-management', exact: true },
        { name: t_nav.finishingRequests, href: '/admin/finishing-management/requests', exact: false },
        { name: language === 'ar' ? 'باقات الخدمات (تصميم/استشارة)' : 'Service Packages', href: '/admin/finishing-management/services', exact: false },
        { name: t_nav.subscriptionPlans, href: '/admin/finishing-management/plans', exact: false },
        { name: language === 'ar' ? 'مقدر التكلفة (AI)' : 'AI Estimator', href: '/admin/finishing-management/estimator', exact: false },
    ];

    const baseClasses = "px-4 py-3 font-semibold text-md border-b-4 transition-colors duration-200";
    const activeClasses = "border-amber-500 text-amber-500 bg-amber-50/50 dark:bg-amber-900/10";
    const inactiveClasses = "border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-gray-50 dark:hover:bg-gray-800";

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_nav.finishingManagement}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                {language === 'ar' 
                    ? 'إدارة منظومة التشطيبات: الطلبات، الباقات الاستشارية، وباقات التنفيذ.' 
                    : 'Manage the finishing ecosystem: Requests, Consultation Packages, and Execution Plans.'}
            </p>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                 <div className="flex flex-wrap -mb-px gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.href}
                            to={tab.href}
                            end={tab.exact}
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

export default AdminFinishingLayout;
