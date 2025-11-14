import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads } from '../../../services/leads';
import { InboxIcon, WrenchScrewdriverIcon, CheckCircleIcon } from '../../ui/Icons';
import StatCard from '../../shared/StatCard';
import { useLanguage } from '../../shared/LanguageContext';

const AdminFinishingDashboardPage: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard.finishingRequests;
    const { data: allLeads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeads'], queryFn: getAllLeads });

    const stats = useMemo(() => {
        if (!allLeads) return { new: 0, inProgress: 0, completedThisMonth: 0 };

        const finishingLeads = allLeads.filter(lead => lead.serviceType === 'finishing');
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            new: finishingLeads.filter(l => l.status === 'new').length,
            inProgress: finishingLeads.filter(l => ['contacted', 'quoted', 'in-progress', 'site-visit'].includes(l.status)).length,
            completedThisMonth: finishingLeads.filter(l => l.status === 'completed' && new Date(l.updatedAt) >= firstDayOfMonth).length,
        };
    }, [allLeads]);

    if (loadingLeads) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t.newRequests} value={stats.new} icon={InboxIcon} linkTo="/admin/finishing-management/requests" />
                <StatCard title={t.inProgress} value={stats.inProgress} icon={WrenchScrewdriverIcon} linkTo="/admin/finishing-management/requests" />
                <StatCard title={t.completedThisMonth} value={stats.completedThisMonth} icon={CheckCircleIcon} linkTo="/admin/finishing-management/requests" />
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700 text-center">
                <h2 className="text-2xl font-bold">Welcome to Finishing Management</h2>
                <p className="text-gray-500 mt-2">Use the tabs above to manage requests, services, and AI estimator settings.</p>
            </div>
        </div>
    );
};

export default AdminFinishingDashboardPage;
