import React from 'react';
import { Outlet } from 'react-router-dom';
import PartnerSidebar from './PartnerSidebar';
import { useLanguage } from '../shared/LanguageContext';

const PartnerDashboardLayout: React.FC = () => {
    const { language } = useLanguage();
    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            <PartnerSidebar />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default PartnerDashboardLayout;