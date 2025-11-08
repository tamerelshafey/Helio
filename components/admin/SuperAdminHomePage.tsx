
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Lead, AdminPartner, Property, AddPropertyRequest, ContactRequest, PartnerRequest, PropertyInquiryRequest, Project, Language } from '../../types';
import { translations } from '../../data/translations';
import { UserPlusIcon, ClipboardDocumentListIcon, InboxIcon, BuildingIcon, UsersIcon, ChartBarIcon, CubeIcon } from '../icons/Icons';
import { isListingActive } from '../../utils/propertyUtils';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { getAllPropertyRequests } from '../../api/propertyRequests';
import { getAllContactRequests } from '../../api/contactRequests';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllProperties } from '../../api/properties';
import { getAllLeads } from '../../api/leads';
import { getAllProjects } from '../../api/projects';
import { useApiQuery } from '../shared/useApiQuery';
import StatCard from '../shared/StatCard';
import { useLanguage } from '../shared/LanguageContext';


const ActionCard: React.FC<{ title: string; count: number; linkTo: string; icon: React.FC<{className?: string}>; language: Language }> = ({ title, count, linkTo, icon: Icon, language }) => (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{count}</p>
            </div>
            <Icon className="w-8 h-8 text-amber-500" />
        </div>
        <Link to={linkTo} className="mt-4 text-center font-semibold text-amber-600 dark:text-amber-500 bg-amber-200/50 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 rounded-md py-2 transition-colors">
            {translations[language].adminDashboard.home.review}
        </Link>
    </div>
);

const SuperAdminHomePage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.home;
    const t_analytics = translations[language].adminAnalytics;
    
    const { data: partnerRequests, isLoading: loadingPartnerRequests } = useApiQuery('partnerRequests', getAllPartnerRequests);
    const { data: propertyRequests, isLoading: loadingPropertyRequests } = useApiQuery('propertyRequests', getAllPropertyRequests);
    const { data: contactRequests, isLoading: loadingContactRequests } = useApiQuery('contactRequests', getAllContactRequests);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartners', getAllPartnersForAdmin);
    const { data: properties, isLoading: loadingProperties } = useApiQuery('allProperties', getAllProperties);
    const { data: projects, isLoading: loadingProjects } = useApiQuery('allProjects', getAllProjects);
    const { data: leads, isLoading: loadingLeads } = useApiQuery('allLeads', getAllLeads);

    const loading = loadingPartnerRequests || loadingPropertyRequests || loadingContactRequests || loadingPartners || loadingProperties || loadingLeads || loadingProjects;

    const memoizedData = useMemo(() => {
        if (loading) return null;

        const activePartnersCount = (partners || []).filter(p => p.status === 'active').length;
        const activePropertiesCount = (properties || []).filter(isListingActive).length;
        const totalProjectsCount = (projects || []).length;
        const totalLeadsCount = (leads || []).length;

        const pendingPartners = (partnerRequests || []).filter(r => r.status === 'pending').length;
        const pendingProperties = (propertyRequests || []).filter(r => r.status === 'pending').length;
        const newContacts = (contactRequests || []).filter(r => r.status === 'pending').length;

        const leadStats = (leads || []).reduce((acc, lead) => {
            if (lead.propertyId) acc.propertyLeads[lead.propertyId] = (acc.propertyLeads[lead.propertyId] || 0) + 1;
            if (lead.partnerId) acc.partnerLeads[lead.partnerId] = (acc.partnerLeads[lead.partnerId] || 0) + 1;
            return acc;
        }, { propertyLeads: {} as Record<string, number>, partnerLeads: {} as Record<string, number> });
        
        const topPartners = Object.entries(leadStats.partnerLeads)
            .sort(([, countA], [, countB]) => Number(countB) - Number(countA)).slice(0, 5)
            .map(([partnerId, count]) => ({ partner: (partners || []).find(p => p.id === partnerId), count }))
            .filter(p => p.partner && p.partner.type !== 'admin');

        const topProperties = Object.entries(leadStats.propertyLeads)
            .sort(([, countA], [, countB]) => Number(countB) - Number(countA)).slice(0, 5)
            .map(([propertyId, count]) => ({ property: (properties || []).find(p => p.id === propertyId), count }))
            .filter(p => p.property);
        

        return {
            pendingPartners, pendingProperties, newContacts,
            activePartnersCount, activePropertiesCount, totalProjectsCount, totalLeadsCount,
            topPartners, topProperties
        };
    }, [loading, partnerRequests, propertyRequests, contactRequests, leads, properties, partners, projects, language]);

    if (loading || !memoizedData) {
        return <div className="animate-pulse h-screen bg-gray-50 dark:bg-gray-800"></div>
    }

    const { 
        pendingPartners, pendingProperties, newContacts, activePartnersCount, 
        activePropertiesCount, totalProjectsCount, totalLeadsCount, topPartners, topProperties 
    } = memoizedData;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t.actionableItems}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActionCard title={t.pendingPartnerRequests} count={pendingPartners} linkTo="/admin/partner-requests" icon={UserPlusIcon} language={language} />
                    <ActionCard title={t.pendingPropertyRequests} count={pendingProperties} linkTo="/admin/property-requests" icon={ClipboardDocumentListIcon} language={language} />
                    <ActionCard title={t.newContactMessages} count={newContacts} linkTo="/admin/contact-requests" icon={InboxIcon} language={language} />
                </div>
            </div>

             <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Key Metrics</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title={t.activePartners} value={activePartnersCount} icon={UsersIcon} linkTo="/admin/partners" />
                    <StatCard title={t.activeProperties} value={activePropertiesCount} icon={BuildingIcon} linkTo="/admin/properties" />
                    <StatCard title={translations[language].adminDashboard.listingsManagerHome.totalProjects} value={totalProjectsCount} icon={CubeIcon} linkTo="/admin/projects" />
                    <StatCard title={t.totalLeads} value={totalLeadsCount} icon={ChartBarIcon} linkTo="/admin/leads" />
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Performance Analytics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingPartners}</h2>
                        <ul className="space-y-4">
                            {topPartners.map(({ partner, count }) => partner && (
                                <li key={partner.id}>
                                     <Link to={`/admin/partners?edit=${partner.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <img src={partner.imageUrl} alt={partner.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{partner.name}</p>
                                            <p className="text-xs text-gray-500">{partner.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-amber-500">{count}</p>
                                            <p className="text-xs text-gray-500">{t_analytics.leads}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingProperties}</h2>
                        <ul className="space-y-4">
                            {topProperties.map(({ property, count }) => property && (
                                <li key={property.id}>
                                    <Link to={`/admin/properties/edit/${property.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <img src={property.imageUrl} alt={property.title[language]} className="w-10 h-10 rounded-md object-cover"/>
                                        <div className="flex-grow overflow-hidden">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate block">{property.title[language]}</p>
                                            <p className="text-xs text-gray-500">{property.partnerName}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-lg text-amber-500">{count}</p>
                                            <p className="text-xs text-gray-500">{t.inquiries}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminHomePage;
