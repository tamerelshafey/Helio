import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Role } from '../../types';
import type { Language, Lead, AdminPartner, Property, AddPropertyRequest, ContactRequest } from '../../types';
import { translations } from '../../data/translations';
import { UserPlusIcon, ClipboardDocumentListIcon, InboxIcon, BuildingIcon, UsersIcon, CheckCircleIcon, ChartBarIcon } from '../icons/Icons';
import { isListingActive } from '../../utils/propertyUtils';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { getAllPropertyRequests } from '../../api/propertyRequests';
import { getAllContactRequests } from '../../api/contactRequests';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllProperties } from '../../api/properties';
import { getAllLeads } from '../../api/leads';
import { useApiQuery } from '../shared/useApiQuery';
import StatCard from '../shared/StatCard';
import { useAuth } from '../auth/AuthContext';
import FinishingManagerHomePage from './FinishingManagerHomePage';
import ListingsManagerHomePage from './ListingsManagerHomePage';
import PartnersManagerHomePage from './PartnersManagerHomePage';
import DecorationsManagerHomePage from './DecorationsManagerHomePage';
import ContentManagerHomePage from './ContentManagerHomePage';

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

const QuickStatCard: React.FC<{ title: string; value: string | number; icon: React.FC<{className?: string}>; }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Icon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);


const SuperAdminDashboard: React.FC<{ language: Language, memoizedData: any }> = ({ language, memoizedData }) => {
    const t = translations[language].adminDashboard.home;
    const t_analytics = translations[language].adminAnalytics;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            {/* Action Center */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t.actionableItems}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ActionCard title={t.pendingPartnerRequests} count={memoizedData.pendingPartners} linkTo="/admin/partner-requests" icon={UserPlusIcon} language={language} />
                    <ActionCard title={t.pendingPropertyRequests} count={memoizedData.pendingProperties} linkTo="/admin/property-requests" icon={ClipboardDocumentListIcon} language={language} />
                    <ActionCard title={t.newContactMessages} count={memoizedData.newContacts} linkTo="/admin/contact-requests" icon={InboxIcon} language={language} />
                </div>
            </div>

            {/* Key Metrics */}
             <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Key Metrics</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickStatCard title="Active Partners" value={memoizedData.activePartnersCount} icon={UsersIcon} />
                    <QuickStatCard title="Active Properties" value={memoizedData.activePropertiesCount} icon={BuildingIcon} />
                    <QuickStatCard title="New Leads (Today)" value={memoizedData.newLeadsTodayCount} icon={InboxIcon} />
                    <QuickStatCard title="Total Leads" value={memoizedData.totalLeadsCount} icon={ChartBarIcon} />
                </div>
            </div>

            {/* Performance Analytics */}
            <div>
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Performance Analytics</h2>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        {/* You can place charts here if needed, for now just top lists */}
                    </div>
                    <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t.topPerformingPartners}</h2>
                            <ul className="space-y-4">
                                {memoizedData.topPartners.map(({ partner, count }: {partner: AdminPartner, count: number}) => partner && (
                                    <li key={partner.id}>
                                        <Link to={`/partners/${partner.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                                {memoizedData.topProperties.map(({ property, count }: {property: Property, count: number}) => property && (
                                    <li key={property.id}>
                                        <Link to={`/properties/${property.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
        </div>
    );
};

const AdminHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { currentUser } = useAuth();
    
    const { data: partnerRequests, isLoading: loadingPartnerRequests } = useApiQuery('partnerRequests', getAllPartnerRequests);
    const { data: propertyRequests, isLoading: loadingPropertyRequests } = useApiQuery('propertyRequests', getAllPropertyRequests);
    const { data: contactRequests, isLoading: loadingContactRequests } = useApiQuery('contactRequests', getAllContactRequests);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartners', getAllPartnersForAdmin);
    const { data: properties, isLoading: loadingProperties } = useApiQuery('allProperties', getAllProperties);
    const { data: leads, isLoading: loadingLeads } = useApiQuery('allLeads', getAllLeads);

    const loading = loadingPartnerRequests || loadingPropertyRequests || loadingContactRequests || loadingPartners || loadingProperties || loadingLeads;

    const memoizedData = useMemo(() => {
        if (loading) return null;

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        // Key Metrics
        const activePartnersCount = (partners || []).filter(p => p.status === 'active').length;
        const activePropertiesCount = (properties || []).filter(isListingActive).length;
        const totalLeadsCount = (leads || []).length;
        const newLeadsTodayCount = (leads || []).filter(l => new Date(l.createdAt) > twentyFourHoursAgo).length;

        // Actionable Items
        const pendingPartners = (partnerRequests || []).filter(r => r.status === 'pending').length;
        const pendingProperties = (propertyRequests || []).filter(r => r.status === 'pending').length;
        const newContacts = (contactRequests || []).filter(r => r.status === 'pending').length;

        // Performance Analytics
        const leadStats = (leads || []).reduce((acc, lead) => {
            if (lead.propertyId) {
                acc.propertyLeads[lead.propertyId] = (acc.propertyLeads[lead.propertyId] || 0) + 1;
            }
            if (lead.partnerId) {
                acc.partnerLeads[lead.partnerId] = (acc.partnerLeads[lead.partnerId] || 0) + 1;
            }
            return acc;
        }, {
            propertyLeads: {} as Record<string, number>,
            partnerLeads: {} as Record<string, number>
        });
        
        const topPartners = Object.entries(leadStats.partnerLeads)
            .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
            .slice(0, 5)
            .map(([partnerId, count]) => ({
                partner: (partners || []).find(p => p.id === partnerId),
                count
            })).filter(p => p.partner && p.partner.type !== 'admin');

        const topProperties = Object.entries(leadStats.propertyLeads)
            .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
            .slice(0, 5)
            .map(([propertyId, count]) => ({
                property: (properties || []).find(p => p.id === propertyId),
                count
            })).filter(p => p.property);
        

        return {
            pendingPartners, pendingProperties, newContacts,
            activePartnersCount, activePropertiesCount, totalLeadsCount, newLeadsTodayCount,
            topPartners,
            topProperties
        };
    }, [loading, partnerRequests, propertyRequests, contactRequests, leads, properties, partners, language]);


    if (loading || !memoizedData) {
        return <div className="text-center p-8">Loading dashboard...</div>;
    }

    switch (currentUser?.role) {
        case Role.SUPER_ADMIN:
            return <SuperAdminDashboard language={language} memoizedData={memoizedData} />;
        case Role.FINISHING_MANAGER:
            return <FinishingManagerHomePage language={language} />;
        case Role.LISTINGS_MANAGER:
            return <ListingsManagerHomePage language={language} />;
        case Role.PARTNER_RELATIONS_MANAGER:
            return <PartnersManagerHomePage language={language} />;
        case Role.DECORATIONS_MANAGER:
             return <DecorationsManagerHomePage language={language} />;
        case Role.CONTENT_MANAGER:
             return <ContentManagerHomePage language={language} />;
        default:
            return <div className="text-center p-8">Dashboard for this role is not available yet.</div>
    }
};

export default AdminHomePage;
