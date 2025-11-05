import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Language, Role } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { translations } from '../../data/translations';
import { ClipboardDocumentListIcon, InboxIcon } from '../icons/Icons';
import { getPropertiesByPartnerId } from '../../api/properties';
import { getProjectsByPartnerId } from '../../api/projects';
import { getLeadsByPartnerId } from '../../api/leads';
import { getPortfolioByPartnerId } from '../../api/portfolio';
import { useApiQuery } from '../shared/useApiQuery';
import StatCard from '../shared/StatCard';

const DashboardHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    const t = translations[language].dashboardHome;
    
    // Fetch all necessary data on demand, enabled only if there's a current user
    const { data: properties, isLoading: loadingProps } = useApiQuery(`props-${currentUser?.id}`, () => getPropertiesByPartnerId(currentUser!.id), { enabled: !!currentUser && (currentUser.role === Role.DEVELOPER_PARTNER || currentUser.role === Role.AGENCY_PARTNER) });
    const { data: projects, isLoading: loadingProjs } = useApiQuery(`projs-${currentUser?.id}`, () => getProjectsByPartnerId(currentUser!.id), { enabled: !!currentUser && currentUser.role === Role.DEVELOPER_PARTNER });
    const { data: leads, isLoading: loadingLeads } = useApiQuery(`leads-${currentUser?.id}`, () => getLeadsByPartnerId(currentUser!.id), { enabled: !!currentUser });
    const { data: portfolio, isLoading: loadingPortfolio } = useApiQuery(`portfolio-${currentUser?.id}`, () => getPortfolioByPartnerId(currentUser!.id), { enabled: !!currentUser && currentUser.role === Role.FINISHING_PARTNER });

    const loading = loadingProps || loadingProjs || loadingLeads || loadingPortfolio;

     const projectsWithUnitCount = useMemo(() => {
        if (currentUser?.role !== Role.DEVELOPER_PARTNER || !projects || !properties) return [];
        return projects.map(project => {
            const count = properties.filter(p => p.projectId === project.id).length;
            return { ...project, unitCount: count };
        });
    }, [projects, properties, currentUser]);
    
    // FIX: Add type guard to ensure currentUser is a Partner before accessing partner-specific properties.
    if (loading || !currentUser || !('type' in currentUser)) {
        return <div className="text-center p-8">Loading...</div>;
    }
    
    const getPlanName = () => {
        try {
            const planCategory = ['developer', 'agency', 'finishing'].includes(currentUser.type) ? currentUser.type : 'agency';
            // @ts-ignore
            return translations[language].subscriptionPlans[planCategory][currentUser.subscriptionPlan]?.name || currentUser.subscriptionPlan;
        } catch {
            return currentUser.subscriptionPlan;
        }
    }

    const partnerLeadsCount = (leads || []).filter(l => l.status === 'new').length;
    
    const currentPlanName = getPlanName();

    const recentLeads = useMemo(() => {
        return (leads || [])
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    }, [leads]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6`}>
                <StatCard title={t.newLeads} value={partnerLeadsCount} icon={InboxIcon} linkTo="/dashboard/leads" />
                <StatCard title={t.currentPlan} value={currentPlanName} icon={ClipboardDocumentListIcon} linkTo="/dashboard/subscription" />
            </div>

             {currentUser.role === Role.DEVELOPER_PARTNER && (
                <div className="mt-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.projectsOverview}</h2>
                        {projectsWithUnitCount.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {projectsWithUnitCount.map(p => (
                                     <li key={p.id} className="py-3">
                                        <Link to={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{p.name[language]}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{p.unitCount} {translations[language].projectDashboard.units}</p>
                                            </div>
                                             <div className="text-right text-sm font-semibold text-amber-500">
                                                {translations[language].projectDashboard.manageProject}
                                            </div>
                                        </Link>
                                     </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-gray-500 dark:text-gray-400 text-center py-4">{translations[language].projectDashboard.noProjects}</p>
                        )}
                    </div>
                </div>
            )}


            <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <InboxIcon className="w-6 h-6 text-amber-500" />
                            {t.recentLeads}
                        </h2>
                        <Link to="/dashboard/leads" className="text-sm font-semibold text-amber-600 hover:underline">
                            {t.viewAllLeads}
                        </Link>
                    </div>
                    {recentLeads.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {recentLeads.map(lead => (
                                <li key={lead.id} className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{lead.customerName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={lead.serviceTitle}>
                                                {lead.serviceTitle}
                                            </p>
                                        </div>
                                        <div className="text-right text-sm text-gray-400">
                                            {new Date(lead.createdAt).toLocaleString(language, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noRecentLeads}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHomePage;
