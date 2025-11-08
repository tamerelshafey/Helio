

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Role, Project, Property, Lead, PortfolioItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { translations } from '../../data/translations';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllProperties } from '../../api/properties';
import { getAllProjects } from '../../api/projects';
import { getAllLeads } from '../../api/leads';
import { getAllPortfolioItems } from '../../api/portfolio';
import StatCard from '../shared/StatCard';
import { CubeIcon, BuildingIcon, InboxIcon, ClipboardDocumentListIcon, PhotoIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';

// --- Reusable Recent Leads Component ---
const RecentLeads: React.FC<{ leads: Lead[] | undefined }> = ({ leads }) => {
    const { language } = useLanguage();
    const t = translations[language].dashboardHome;
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
                                    {new Date(lead.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.noRecentLeads}</p>
            )}
        </div>
    );
};


const DashboardHomePage: React.FC = () => {
    const { language } = useLanguage();
    const { currentUser } = useAuth();
    const t = translations[language].dashboardHome;
    
    // Fetch all necessary data on demand, enabled only if there's a current user
    const { data: allProperties, isLoading: loadingProps } = useApiQuery('allProperties', getAllProperties, { enabled: !!currentUser });
    const { data: allProjects, isLoading: loadingProjs } = useApiQuery('allProjects', getAllProjects, { enabled: !!currentUser });
    const { data: allLeads, isLoading: loadingLeads } = useApiQuery('allLeadsAdmin', getAllLeads, { enabled: !!currentUser });
    const { data: allPortfolioItems, isLoading: loadingPortfolio } = useApiQuery('allPortfolioItems', getAllPortfolioItems, { enabled: !!currentUser });

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
        const planName = (translations[language].subscriptionPlans as any)[planCategory]?.[currentUser.subscriptionPlan]?.name || currentUser.subscriptionPlan;
        
        const newLeadsCount = (leads || []).filter(l => l.status === 'new').length;
        const items = [{ title: t.newLeads, value: newLeadsCount, icon: InboxIcon, linkTo: "/dashboard/leads" }];

        switch (currentUser.role) {
            case Role.DEVELOPER_PARTNER:
                items.unshift({ title: t.totalUnits, value: (properties || []).length, icon: BuildingIcon, linkTo: "/dashboard/projects" });
                items.unshift({ title: t.totalProjects, value: (projects || []).length, icon: CubeIcon, linkTo: "/dashboard/projects" });
                break;
            case Role.FINISHING_PARTNER:
                items.unshift({ title: t.totalPortfolio, value: (portfolio || []).length, icon: PhotoIcon, linkTo: "/dashboard/portfolio" });
                break;
            case Role.AGENCY_PARTNER:
                items.unshift({ title: t.totalProperties, value: (properties || []).length, icon: BuildingIcon, linkTo: "/dashboard/properties" });
                break;
        }
        
        items.push({ title: t.currentPlan, value: planName, icon: ClipboardDocumentListIcon, linkTo: "/dashboard/subscription" });
        return { items, planName };

    }, [isLoading, projects, properties, portfolio, leads, currentUser, language, t]);

    if (isLoading || !currentUser || !('type' in currentUser)) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.items.map(stat => (
                    <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} linkTo={stat.linkTo} />
                ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentLeads leads={leads as Lead[]} />

                {currentUser.role === Role.DEVELOPER_PARTNER && (
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
                )}
            </div>
        </div>
    );
};

export default DashboardHomePage;