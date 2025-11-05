import React from 'react';
import { Outlet } from 'react-router-dom';
import type { Language } from '../../types';
import PartnerSidebar from './PartnerSidebar';

const PartnerDashboardLayout: React.FC<{ language: Language }> = ({ language }) => {
    return (
        <div className="flex min-h-[80vh] bg-gray-50 dark:bg-gray-800">
            <PartnerSidebar language={language} />
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default PartnerDashboardLayout;
