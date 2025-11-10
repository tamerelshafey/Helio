import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Role, Project, Property, Lead, PortfolioItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getAllProperties } from '../../services/properties';
import { getAllProjects } from '../../services/projects';
import { getAllLeads } from '../../services/leads';
import { getAllPortfolioItems } from '../../services/portfolio';
import StatCard from '../shared/StatCard';
import { CubeIcon, BuildingIcon, InboxIcon, ClipboardDocumentListIcon, PhotoIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LeadsChart: React.FC<{ leads: Lead[] | undefined }> = ({ leads }) => {
    const { language, t } = useLanguage();

    const chartData = useMemo(() => {
        const labels: string[] = [];
        const data: number[] = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            labels.push(date.toLocaleDateString(language, { weekday: 'short', day: 'numeric' }));
            
            const dateString = date.toISOString().split('T')[0];
            const leadsOnDate = (leads || []).filter(lead => lead.createdAt.startsWith(dateString)).length;
            data.push(leadsOnDate);
        }

        return {
            labels,
            datasets: [
                {
                    label: t.dashboardHome.newLeads,
                    data,
                    fill: true,
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    borderColor: '#F59E0B',
                    tension: 0.3,
                },
            ],
        };
    }, [leads, language, t.dashboardHome.newLeads]);
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
             x: { ticks: { color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280' } },
             y: { beginAtZero: true, ticks: { stepSize: 1, color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280' } },
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <InboxIcon className="w-6 h-6 text-amber-500" />
                    {t.dashboardHome.recentLeads}
                </h2>
                <Link to="/dashboard/leads" className="text-sm font-semibold text-amber-600 hover:underline">
                    {t.dashboardHome.viewAllLeads}
                </Link>
            </div>
            <div className="h-64">
                <Line options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

const DashboardHomePage: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const t_home = t.dashboardHome;
    
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
                <div className="lg:col-span-2">
                    <LeadsChart leads={leads as Lead[]} />
                </div>

                {currentUser.role === Role.DEVELOPER_PARTNER && (
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
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