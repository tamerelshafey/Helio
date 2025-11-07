import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, AdminPartner } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllLeads } from '../../api/leads';
import { getAllPartnersForAdmin } from '../../api/partners';
import { WrenchScrewdriverIcon, InboxIcon, CheckCircleIcon, SparklesIcon } from '../icons/Icons';
import { translations } from '../../data/translations';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.FC<{ className?: string }> }> = ({ title, value, icon: Icon }) => (
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

const ServiceManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const t_service = translations[language].adminDashboard.serviceManagerHome;
    const t_leads = translations[language].dashboard.leadTable;

    const { data: allLeads, isLoading: loadingLeads } = useApiQuery('allLeads', getAllLeads);
    const { data: allPartners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);

    const isLoading = loadingLeads || loadingPartners;
    
    const serviceManagerId = 'service-manager-1';

    const serviceData = useMemo(() => {
        if (!allLeads || !allPartners) return null;

        const serviceLeads = allLeads.filter(lead => lead.managerId === serviceManagerId);

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = {
            new: serviceLeads.filter(l => l.status === 'new').length,
            inProgress: serviceLeads.filter(l => ['contacted', 'site-visit', 'quoted', 'in-progress'].includes(l.status)).length,
            completedThisMonth: serviceLeads.filter(l => l.status === 'completed' && new Date(l.updatedAt) >= firstDayOfMonth).length,
            total: serviceLeads.length,
        };

        const recentRequests = [...serviceLeads]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        
        return { stats, recentRequests };

    }, [allLeads, allPartners]);

    if (isLoading || !serviceData) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                {Array.from({length: 4}).map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>)}
            </div>
        );
    }
    
    const { stats, recentRequests } = serviceData;
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_service.title}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t_service.subtitle}</p>
            </div>
            
            <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title={t_service.newRequests} value={stats.new} icon={InboxIcon} />
                    <StatCard title={t_service.inProgress} value={stats.inProgress} icon={WrenchScrewdriverIcon} />
                    <StatCard title={t_service.completedThisMonth} value={stats.completedThisMonth} icon={CheckCircleIcon} />
                    <StatCard title={t_service.totalRequests} value={stats.total} icon={SparklesIcon} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t_service.recentActivity}</h2>
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
                                {recentRequests.map(lead => {
                                    const link = lead.serviceTitle.includes('تشطيب') || lead.serviceTitle.toLowerCase().includes('finishing')
                                        ? `/admin/finishing-requests/${lead.id}`
                                        : `/admin/decoration-requests/${lead.id}`;

                                    return (
                                        <tr key={lead.id}>
                                            <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{lead.customerName}</td>
                                            <td className="py-3 text-gray-600 dark:text-gray-300 truncate max-w-xs" title={lead.serviceTitle}>{lead.serviceTitle}</td>
                                            <td className="py-3 text-gray-500 dark:text-gray-400">{new Date(lead.updatedAt).toLocaleDateString(language, { day: 'numeric', month: 'short' })}</td>
                                            <td className="py-3">
                                                <Link to={link} className="font-medium text-amber-600 hover:underline">
                                                    {t_service.manage}
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagerHomePage;