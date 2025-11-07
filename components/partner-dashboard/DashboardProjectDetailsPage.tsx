import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Language, Property, Lead } from '../../types';
import { translations } from '../../data/translations';
import { useDataContext } from '../shared/DataContext';
import { deleteProject as apiDeleteProject } from '../../api/projects';
import { deleteProperty as apiDeleteProperty } from '../../api/properties';
import { BuildingIcon, ChartBarIcon, InboxIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
import UpgradePlanModal from '../UpgradePlanModal';
import StatCard from '../shared/StatCard';
import { useSubscriptionUsage } from '../shared/useSubscriptionUsage';

const DashboardProjectDetailsPage: React.FC<{ language: Language }> = ({ language }) => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const t = translations[language];
    const t_proj = t.projectDashboard;
    const t_prop_table = t.dashboard.propertyTable;
    const t_analytics = t.dashboard.projectAnalytics;

    const { 
        allProjects, 
        allProperties, 
        allLeads, 
        isLoading, 
        refetchAll 
    } = useDataContext();

    const { isLimitReached: isUnitsLimitReached } = useSubscriptionUsage('units');
    
    const [activeTab, setActiveTab] = useState('units');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const project = useMemo(() => (allProjects || []).find(p => p.id === projectId), [allProjects, projectId]);
    const projectProperties = useMemo(() => (allProperties || []).filter(p => p.projectId === projectId && p.partnerId === currentUser?.id), [allProperties, projectId, currentUser?.id]);

    const handleAddUnitClick = () => {
        if (!project) return;
        if (isUnitsLimitReached) {
            setIsUpgradeModalOpen(true);
        } else {
            navigate(`/dashboard/properties/new?projectId=${project.id}`);
        }
    };

    const handleDeleteProject = async () => {
        if (project && window.confirm(t_proj.confirmDelete)) {
            const propertyDeletions = projectProperties.map(p => apiDeleteProperty(p.id));
            await Promise.all(propertyDeletions);
            await apiDeleteProject(project.id);
            refetchAll();
            navigate('/dashboard/projects');
        }
    };
    
    const handleDeleteProperty = async (propertyId: string) => {
        if (window.confirm(t_prop_table.confirmDelete)) {
            await apiDeleteProperty(propertyId);
            refetchAll();
        }
    };
    
    const projectAnalytics = useMemo(() => {
        if (!allLeads || !projectProperties) return { totalLeads: 0, topUnits: [] };
        
        const propertyIdMap = new Map<string, string>();
        projectProperties.forEach(p => {
            propertyIdMap.set(p.title.ar, p.id);
            propertyIdMap.set(p.title.en, p.id);
        });

        const projectLeads = allLeads.filter(lead => {
            const titleMatch = lead.serviceTitle.match(/"([^"]+)"/);
            if(titleMatch) {
                const propertyId = propertyIdMap.get(titleMatch[1]);
                return !!propertyId;
            }
            return false;
        });

        const leadCounts: Record<string, number> = {};
        projectLeads.forEach(lead => {
             const titleMatch = lead.serviceTitle.match(/"([^"]+)"/);
             if(titleMatch) {
                const propertyId = propertyIdMap.get(titleMatch[1]);
                if(propertyId) {
                    leadCounts[propertyId] = (leadCounts[propertyId] || 0) + 1;
                }
             }
        });

        const topUnits = Object.entries(leadCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([propertyId, count]) => ({
                property: projectProperties.find(p => p.id === propertyId),
                count,
            }))
            .filter(item => item.property);

        return { totalLeads: projectLeads.length, topUnits };

    }, [allLeads, projectProperties]);


    if (isLoading) {
        return <div className="text-center p-8">Loading project details...</div>;
    }

    if (!project) {
        return <div className="text-center p-8">Project not found.</div>;
    }

    return (
        <div>
            {isUpgradeModalOpen && <UpgradePlanModal language={language} onClose={() => setIsUpgradeModalOpen(false)} />}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex flex-col sm:flex-row gap-6">
                    <img src={project.imageUrl} alt={project.name[language]} className="w-full sm:w-48 h-48 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-grow">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name[language]}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{project.description[language]}</p>
                        <div className="mt-4 flex items-center gap-4 text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-2"><BuildingIcon className="w-5 h-5" /> {projectProperties.length} {t_proj.units}</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col gap-2">
                        <Link to={`/dashboard/projects/edit/${project.id}`} className="text-center bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">{t_proj.editProjectButton}</Link>
                        <button onClick={handleDeleteProject} className="text-center bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">{t_proj.deleteProjectButton}</button>
                    </div>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('units')} className={`py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'units' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {t_proj.units} ({projectProperties.length})
                    </button>
                     <button onClick={() => setActiveTab('analytics')} className={`py-4 px-1 border-b-2 font-medium text-lg ${activeTab === 'analytics' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {language === 'ar' ? 'التحليلات' : 'Analytics'}
                    </button>
                </nav>
            </div>

            {activeTab === 'units' && (
                <div className="animate-fadeIn">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleAddUnitClick} className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            {t_proj.addUnit}
                        </button>
                    </div>
                     <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t_prop_table.image}</th>
                                    <th scope="col" className="px-6 py-3">{t_prop_table.title}</th>
                                    <th scope="col" className="px-6 py-3">{t_prop_table.status}</th>
                                    <th scope="col" className="px-6 py-3">{t_prop_table.price}</th>
                                    <th scope="col" className="px-6 py-3">{t_prop_table.actions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projectProperties.length > 0 ? projectProperties.map(prop => (
                                     <tr key={prop.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4">
                                            <img src={prop.imageUrl} alt={prop.title[language]} className="w-16 h-16 object-cover rounded-md" />
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {prop.title[language]}
                                        </th>
                                        <td className="px-6 py-4">{prop.status[language]}</td>
                                        <td className="px-6 py-4">{prop.price[language]}</td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            <Link to={`/dashboard/properties/edit/${prop.id}`} className="font-medium text-amber-600 dark:text-amber-500 hover:underline">{t_prop_table.edit}</Link>
                                            <button onClick={() => handleDeleteProperty(prop.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">{t_prop_table.delete}</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center p-8">{t_prop_table.noProperties}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {activeTab === 'analytics' && (
                <div className="animate-fadeIn space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard title={t.dashboardHome.totalUnits} value={projectProperties.length} icon={BuildingIcon} linkTo="#"/>
                        <StatCard title={t_analytics.totalLeads} value={projectAnalytics.totalLeads} icon={InboxIcon} linkTo="#"/>
                     </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t_analytics.topPerformingUnits}</h3>
                        {projectAnalytics.topUnits.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {projectAnalytics.topUnits.map(({ property, count }) => (
                                    property && (
                                        <li key={property.id} className="py-3">
                                            <Link to={`/properties/${property.id}`} target="_blank" className="flex items-center justify-between p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <img src={property.imageUrl} alt={property.title[language]} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                                                    <div className="overflow-hidden">
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{property.title[language]}</p>
                                                        <p className="text-sm text-gray-500">{property.price[language]}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-4">
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{count}</p>
                                                    <p className="text-sm text-gray-500">{t_analytics.leadsCount}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    )
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">{language === 'ar' ? 'لا توجد بيانات كافية لعرض الوحدات الأعلى أداءً.' : 'Not enough data to show top performing units.'}</p>
                        )}
                     </div>
                </div>
            )}
        </div>
    );
};

export default DashboardProjectDetailsPage;
