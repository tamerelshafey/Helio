


import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Role, Project, Property, Lead, PortfolioItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
// FIX: Replaced deprecated `useApiQuery` with `useQuery` from `@tanstack/react-query`.
import { useQuery } from '@tanstack/react-query';
import { getAllProperties } from '../../api/properties';
import { getAllProjects } from '../../api/projects';
import { getAllLeads } from '../../api/leads';
import { getAllPortfolioItems } from '../../api/portfolio';
import StatCard from '../shared/StatCard';
import { CubeIcon, BuildingIcon, InboxIcon, ClipboardDocumentListIcon, PhotoIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';

// --- Reusable Recent Leads Component ---
const RecentLeads: React.FC<{ leads: Lead[] | undefined }> = ({ leads }) => {
    const { language, t } = useLanguage();
    const t_home = t.dashboardHome;
    const recentLeads = useMemo(() => {
        return (leads || [])
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    }, [leads]);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <InboxIcon className="w-6 h-6 text-amber-500" />
                    {t_home.recentLeads}
                </h2>
                <Link to="/dashboard/leads" className="text-sm font-semibold text-amber-600 hover:underline">
                    {t_home.viewAllLeads}
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
                                    {new Date(lead.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t_home.noRecentLeads}</p>
            )}
        </div>
    );
};


const DashboardHomePage: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const t_home = t.dashboardHome;
    
    // Fetch all necessary data on demand, enabled only if there's a current user
    const { data: allProperties, isLoading: loadingProps } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties, enabled: !!currentUser });
    const { data: allProjects, isLoading: loadingProjs } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects, enabled: !!currentUser });
    const { data: allLeads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeadsAdmin'], queryFn: getAllLeads, enabled: !!currentUser });
    const { data: allPortfolioItems, isLoading: loadingPortfolio } = useQuery({ queryKey: ['allPortfolioItems'], queryFn: getAllPortfolioItems, enabled: !!currentUser });

    const isLoading = loadingProps || loadingProjs || loadingLeads || loadingPortfolio;

    const properties = useMemo(() => (allProperties || []).filter(p => p.partnerId === currentUser?.id), [allProperties, currentUser?.id]);
    const projects = useMemo(() => (allProjects || []).filter(p => p.partnerId === currentUser?.id), [allProjects, currentUser?.id]);
    const leads = useMemo(() => (allLeads || []).filter(l => l.partnerId === currentUser?.id), [allLeads, currentUser?.id]);
    const portfolio = useMemo(() => (allPortfolioItems || []).filter(p => p.partnerId === currentUser?.id), [allPortfolioItems, currentUser?.id]);

    const projectsWithUnitCount = useMemo(() => {
        if (!projects || !properties) return [];
        return projects.map(project => ({
            ...project,
            unitCount: properties.filter(p => p.projectId === project.id).length
        }));
    }, [projects, properties]);

    const stats = useMemo(() => {
        if (isLoading || !currentUser || !('type' in currentUser)) {
            return { items: [], planName: '' };
        }

        const planCategory = ['developer', 'agency', 'finishing'].includes(currentUser.type) ? currentUser.type : 'agency';
        // @ts-ignore
        const planName = t.subscriptionPlans[planCategory]?.[currentUser.subscriptionPlan]?.name || currentUser.subscriptionPlan;
        
        const newLeadsCount = (leads || []).filter(l => l.status === 'new').length;
        const items = [{ title: t_home.newLeads, value: newLeadsCount, icon: InboxIcon, linkTo: "/dashboard/leads" }];

        switch (currentUser.role) {
            case Role.DEVELOPER_PARTNER:
                items.unshift({ title: t_home.totalUnits, value: (properties || []).length, icon: BuildingIcon, linkTo: "/dashboard/projects" });
                items.unshift({ title: t_home.totalProjects, value: (projects || []).length, icon: CubeIcon, linkTo: "/dashboard/projects" });
                break;
            case Role.FINISHING_PARTNER:
                items.unshift({ title: t_home.totalPortfolio, value: (portfolio || []).length, icon: PhotoIcon, linkTo: "/dashboard/portfolio" });
                break;
            case Role.AGENCY_PARTNER:
                items.unshift({ title: t_home.totalProperties, value: (properties || []).length, icon: BuildingIcon, linkTo: "/dashboard/properties" });
                break;
        }
        
        items.push({ title: t_home.currentPlan, value: planName, icon: ClipboardDocumentListIcon, linkTo: "/dashboard/subscription" });
        return { items, planName };

    }, [isLoading, projects, properties, portfolio, leads, currentUser, language, t_home, t.subscriptionPlans]);

    if (isLoading || !currentUser || !('type' in currentUser)) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_home.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_home.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.items.map(stat => (
                    <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} linkTo={stat.linkTo} />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentLeads leads={leads as Lead[]} />

                {currentUser.role === Role.DEVELOPER_PARTNER && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t_home.projectsOverview}</h2>
                        {projectsWithUnitCount.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {projectsWithUnitCount.map(p => (
                                    <li key={p.id} className="py-3">
                                        <Link to={`/dashboard/projects/${p.id}`} className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{p.name[language]}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{p.unitCount} {t.projectDashboard.units}</p>
                                            </div>
                                            <div className="text-right text-sm font-semibold text-amber-500">
                                                {t.projectDashboard.manageProject}
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.projectDashboard.noProjects}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHomePage;
