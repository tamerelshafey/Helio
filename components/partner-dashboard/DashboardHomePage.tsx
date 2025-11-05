import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Language, Role, Project, Property, Lead } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { translations } from '../../data/translations';
import { useApiQuery } from '../shared/useApiQuery';
import { getProjectsByPartnerId } from '../../api/projects';
import { getPropertiesByPartnerId } from '../../api/properties';
import { getLeadsByPartnerId } from '../../api/leads';
import { getPortfolioByPartnerId } from '../../api/portfolio';
import StatCard from '../shared/StatCard';
import { CubeIcon, BuildingIcon, InboxIcon, ClipboardDocumentListIcon } from '../icons/Icons';

// --- Reusable Recent Leads Component ---
const RecentLeads: React.FC<{ leads: Lead[] | undefined; language: Language }> = ({ leads, language }) => {
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

// --- Developer Dashboard Component ---
const DeveloperDashboard: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    const t = translations[language].dashboardHome;

    const { data: projects, isLoading: loadingProjs } = useApiQuery(`projs-${currentUser?.id}`, () => getProjectsByPartnerId(currentUser!.id), { enabled: !!currentUser });
    const { data: properties, isLoading: loadingProps } = useApiQuery(`props-${currentUser?.id}`, () => getPropertiesByPartnerId(currentUser!.id), { enabled: !!currentUser });
    const { data: leads, isLoading: loadingLeads } = useApiQuery(`leads-${currentUser?.id}`, () => getLeadsByPartnerId(currentUser!.id), { enabled: !!currentUser });
    
    const loading = loadingProjs || loadingProps || loadingLeads;

    const stats = useMemo(() => {
        if (loading || !currentUser || !('type' in currentUser)) return { totalProjects: 0, totalUnits: 0, newLeads: 0, currentPlan: '' };
        
        const planCategory = 'developer';
        const planName = (translations[language].subscriptionPlans as any)[planCategory][currentUser.subscriptionPlan]?.name || currentUser.subscriptionPlan;

        return {
            totalProjects: (projects || []).length,
            totalUnits: (properties || []).length,
            newLeads: (leads || []).filter(l => l.status === 'new').length,
            currentPlan: planName
        };
    }, [loading, projects, properties, leads, currentUser, language]);
    
    const projectsWithUnitCount = useMemo(() => {
        if (!projects || !properties) return [];
        return projects.map(project => ({
            ...project,
            unitCount: properties.filter(p => p.projectId === project.id).length
        }));
    }, [projects, properties]);

    if (loading) return <div className="text-center p-8">Loading Dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t.totalProjects} value={stats.totalProjects} icon={CubeIcon} linkTo="/dashboard/projects" />
                <StatCard title={t.totalUnits} value={stats.totalUnits} icon={BuildingIcon} linkTo="/dashboard/projects" />
                <StatCard title={t.newLeads} value={stats.newLeads} icon={InboxIcon} linkTo="/dashboard/leads" />
                <StatCard title={t.currentPlan} value={stats.currentPlan} icon={ClipboardDocumentListIcon} linkTo="/dashboard/subscription" />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentLeads leads={leads} language={language} />

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
        </div>
    );
};

// --- Finishing Dashboard Component ---
const FinishingDashboard: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    const t = translations[language].dashboardHome;

    const { data: portfolio, isLoading: loadingPortfolio } = useApiQuery(`portfolio-${currentUser?.id}`, () => getPortfolioByPartnerId(currentUser!.id), { enabled: !!currentUser });
    const { data: leads, isLoading: loadingLeads } = useApiQuery(`leads-${currentUser?.id}`, () => getLeadsByPartnerId(currentUser!.id), { enabled: !!currentUser });
    
    const loading = loadingPortfolio || loadingLeads;

    const stats = useMemo(() => {
        if (loading || !currentUser || !('type' in currentUser)) return { totalPortfolio: 0, newLeads: 0, currentPlan: '' };
        
        const planCategory = 'finishing';
        const planName = (translations[language].subscriptionPlans as any)[planCategory][currentUser.subscriptionPlan]?.name || currentUser.subscriptionPlan;

        return {
            totalPortfolio: (portfolio || []).length,
            newLeads: (leads || []).filter(l => l.status === 'new').length,
            currentPlan: planName
        };
    }, [loading, portfolio, leads, currentUser, language]);

    if(loading) return <div className="text-center p-8">Loading Dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t.totalPortfolio} value={stats.totalPortfolio} icon={CubeIcon} linkTo="/dashboard/portfolio" />
                <StatCard title={t.newLeads} value={stats.newLeads} icon={InboxIcon} linkTo="/dashboard/leads" />
                <StatCard title={t.currentPlan} value={stats.currentPlan} icon={ClipboardDocumentListIcon} linkTo="/dashboard/subscription" />
            </div>
             <div className="mt-8">
                <RecentLeads leads={leads} language={language} />
            </div>
        </div>
    );
};

// --- Agency Dashboard Component ---
const AgencyDashboard: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    const t = translations[language].dashboardHome;

    const { data: properties, isLoading: loadingProps } = useApiQuery(`props-${currentUser?.id}`, () => getPropertiesByPartnerId(currentUser!.id), { enabled: !!currentUser });
    const { data: leads, isLoading: loadingLeads } = useApiQuery(`leads-${currentUser?.id}`, () => getLeadsByPartnerId(currentUser!.id), { enabled: !!currentUser });

    const loading = loadingProps || loadingLeads;

    const stats = useMemo(() => {
        if (loading || !currentUser || !('type' in currentUser)) return { totalProperties: 0, newLeads: 0, currentPlan: '' };
        
        const planCategory = 'agency';
        const planName = (translations[language].subscriptionPlans as any)[planCategory][currentUser.subscriptionPlan]?.name || currentUser.subscriptionPlan;

        return {
            totalProperties: (properties || []).length,
            newLeads: (leads || []).filter(l => l.status === 'new').length,
            currentPlan: planName
        };
    }, [loading, properties, leads, currentUser, language]);

    if(loading) return <div className="text-center p-8">Loading Dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t.totalProperties} value={stats.totalProperties} icon={BuildingIcon} linkTo="/dashboard/properties" />
                <StatCard title={t.newLeads} value={stats.newLeads} icon={InboxIcon} linkTo="/dashboard/leads" />
                <StatCard title={t.currentPlan} value={stats.currentPlan} icon={ClipboardDocumentListIcon} linkTo="/dashboard/subscription" />
            </div>
            <div className="mt-8">
                <RecentLeads leads={leads} language={language} />
            </div>
        </div>
    );
};

const DashboardHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();

    if (!currentUser) return null;

    switch (currentUser.role) {
        case Role.DEVELOPER_PARTNER:
            return <DeveloperDashboard language={language} />;
        case Role.FINISHING_PARTNER:
            return <FinishingDashboard language={language} />;
        case Role.AGENCY_PARTNER:
            return <AgencyDashboard language={language} />;
        default:
            return (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                        {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'مرحبًا بك في لوحة التحكم الخاصة بك.' : 'Welcome to your dashboard.'}
                    </p>
                </div>
            );
    }
};

export default DashboardHomePage;
