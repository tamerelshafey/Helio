
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, AdminPartner } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllLeads } from '../../api/leads';
import { getAllPartnersForAdmin } from '../../api/partners';
import { WrenchScrewdriverIcon, InboxIcon, CheckCircleIcon, ClipboardDocumentListIcon } from '../icons/Icons';
import { translations } from '../../data/translations';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useLanguage } from '../shared/LanguageContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.FC<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

const ServiceManagerHomePage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.finishingRequests;
    const t_leads = translations[language].dashboard.leadTable;

    const { data: allLeads, isLoading: loadingLeads } = useApiQuery('allLeads', getAllLeads);
    const { data: allPartners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);

    const isLoading = loadingLeads || loadingPartners;
    
    const finishingManagerId = 'finishing-manager-1';

    const finishingData = useMemo(() => {
        if (!allLeads || !allPartners) return null;

        const finishingLeads = allLeads.filter(lead => lead.managerId === finishingManagerId);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = {
            new: finishingLeads.filter(l => l.status === 'new').length,
            inProgress: finishingLeads.filter(l => ['contacted', 'site-visit', 'quoted', 'in-progress'].includes(l.status)).length,
            completedThisMonth: finishingLeads.filter(l => l.status === 'completed' && new Date(l.updatedAt) >= firstDayOfMonth).length,
            total: finishingLeads.length,
        };

        const recentRequests = [...finishingLeads]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        
        return { stats, recentRequests };

    }, [allLeads, allPartners]);

    if (isLoading || !finishingData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {Array.from({length: 4}).map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>)}
            </div>
        );
    }
    
    const { stats, recentRequests } = finishingData;
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Finishing Requests Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Overview of finishing service requests.</p>
            </div>
            
            <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title={t.newRequests} value={stats.new} icon={InboxIcon} />
                    <StatCard title={t.inProgress} value={stats.inProgress} icon={WrenchScrewdriverIcon} />
                    <StatCard title={t.completedThisMonth} value={stats.completedThisMonth} icon={CheckCircleIcon} />
                    <StatCard title={t.totalRequests} value={stats.total} icon={ClipboardDocumentListIcon} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.recentActivity}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="py-2">{t_leads.customer}</th>
                                    <th className="py-2">{t_leads.service}</th>
                                    <th className="py-2">{translations[language].adminDashboard.decorationsManagement.lastUpdated}</th>
                                    <th className="py-2">{t_leads.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {recentRequests.map(lead => (
                                    <tr key={lead.id}>
                                        <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{lead.customerName}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-300 truncate max-w-xs" title={lead.serviceTitle}>{lead.serviceTitle}</td>
                                        <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(lead.updatedAt).toLocaleDateString(language, { day: 'numeric', month: 'short' })}</td>
                                        <td className="py-3">
                                            <Link to={`/admin/finishing-requests/${lead.id}`} className="font-medium text-amber-600 hover:underline">
                                                {t.manage}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagerHomePage;
