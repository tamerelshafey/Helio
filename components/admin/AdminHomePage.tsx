import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { UserPlusIcon, ClipboardDocumentListIcon, InboxIcon, WrenchScrewdriverIcon, BuildingIcon } from '../icons/Icons';
import { useData } from '../shared/DataContext';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; linkTo: string }> = ({ title, value, icon, linkTo }) => (
    <Link to={linkTo} className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-amber-500/50 transition-all transform hover:-translate-y-1">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 p-3 rounded-full">
                {icon}
            </div>
        </div>
    </Link>
);

const AdminHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.home;
    const { 
        partnerRequests, 
        propertyRequests, 
        contactRequests, 
        partners, 
        properties, 
        loading 
    } = useData();

    const stats = {
        pendingPartners: partnerRequests.filter(r => r.status === 'pending').length,
        pendingProperties: propertyRequests.filter(r => r.status === 'pending').length,
        newContacts: contactRequests.filter(r => r.status === 'pending').length,
        totalPartners: partners.filter(p => p.status === 'active' && p.type !== 'admin').length,
        totalProperties: properties.length,
    };

    const statCards = [
        { title: t.pendingPartnerRequests, value: stats.pendingPartners, icon: <UserPlusIcon className="w-6 h-6" />, linkTo: "/admin/partner-requests" },
        { title: t.pendingPropertyRequests, value: stats.pendingProperties, icon: <ClipboardDocumentListIcon className="w-6 h-6" />, linkTo: "/admin/property-requests" },
        { title: t.newContactMessages, value: stats.newContacts, icon: <InboxIcon className="w-6 h-6" />, linkTo: "/admin/contact-requests" },
        { title: t.totalActivePartners, value: stats.totalPartners, icon: <WrenchScrewdriverIcon className="w-6 h-6" />, linkTo: "/admin/partners" },
        { title: t.totalProperties, value: stats.totalProperties, icon: <BuildingIcon className="w-6 h-6" />, linkTo: "/admin/properties" },
    ];
    
    if (loading) {
        return <div className="text-center p-8">Loading dashboard...</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map(card => (
                    <StatCard key={card.title} {...card} />
                ))}
            </div>
        </div>
    );
};

export default AdminHomePage;