import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { PartnerRequest, PropertyInquiryRequest, AddPropertyRequest, ContactRequest } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPropertyRequests } from '../../api/propertyRequests';
import { getAllPropertyInquiries } from '../../api/propertyInquiries';
import { getAllContactRequests } from '../../api/contactRequests';
import { InboxIcon, ClipboardDocumentListIcon, SearchIcon } from '../icons/Icons';
import { translations } from '../../data/translations';
import RequestList from './shared/RequestList';
import { useLanguage } from '../shared/LanguageContext';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.FC<{ className?: string }>; linkTo: string; }> = ({ title, value, icon: Icon, linkTo }) => (
    <Link to={linkTo} className="block bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </Link>
);


const CustomerRelationsHomePage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.customerRelationsHome;

    const { data: propertyRequests, isLoading: loadingPropReqs } = useApiQuery('propertyRequests', getAllPropertyRequests);
    const { data: propertyInquiries, isLoading: loadingInquiries } = useApiQuery('propertyInquiries', getAllPropertyInquiries);
    const { data: contactRequests, isLoading: loadingContacts } = useApiQuery('contactRequests', getAllContactRequests);

    const isLoading = loadingPropReqs || loadingInquiries || loadingContacts;

    const stats = useMemo(() => {
        if (isLoading) return null;
        return {
            pendingPropertyRequests: (propertyRequests || []).filter(r => r.status === 'pending').length,
            pendingInquiries: (propertyInquiries || []).filter(r => r.status === 'pending').length,
            pendingContacts: (contactRequests || []).filter(r => r.status === 'pending').length,
        };
    }, [isLoading, propertyRequests, propertyInquiries, contactRequests]);

    if (isLoading || !stats) {
        return <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title={t.newListingRequests} 
                    value={stats.pendingPropertyRequests}
                    icon={ClipboardDocumentListIcon}
                    linkTo="/admin/property-requests"
                />
                <StatCard 
                    title={t.newSearchRequests}
                    value={stats.pendingInquiries}
                    icon={SearchIcon}
                    linkTo="/admin/property-inquiries"
                />
                <StatCard 
                    title={t.newContactMessages}
                    value={stats.pendingContacts}
                    icon={InboxIcon}
                    linkTo="/admin/contact-requests"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RequestList<AddPropertyRequest>
                    title={t.recentPropertyRequests}
                    requests={propertyRequests}
                    linkTo="/admin/property-requests"
                    itemRenderer={(item, lang) => (
                        <li key={item.id} className="py-3">
                            <Link to={`/admin/property-requests/${item.id}`} className="flex justify-between items-center group">
                                <div>
                                    <p className="font-medium group-hover:text-amber-600">{item.customerName}</p>
                                    <p className="text-sm text-gray-500">{item.propertyDetails.propertyType[lang]} - {item.propertyDetails.area}m²</p>
                                </div>
                                <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString(lang)}</p>
                            </Link>
                        </li>
                    )}
                />

                <RequestList<PropertyInquiryRequest>
                    title={t.recentInquiries}
                    requests={propertyInquiries}
                    linkTo="/admin/property-inquiries"
                    itemRenderer={(item, lang) => (
                         <li key={item.id} className="py-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.customerName}</p>
                                    <p className="text-sm text-gray-500 truncate max-w-xs" title={item.details}>{item.details}</p>
                                </div>
                                <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString(lang)}</p>
                            </div>
                        </li>
                    )}
                />
            </div>
             <RequestList<ContactRequest>
                title={t.recentContacts}
                requests={contactRequests}
                linkTo="/admin/contact-requests"
                itemRenderer={(item, lang) => (
                    <li key={item.id} className="py-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500 truncate max-w-md" title={item.message}>{item.message}</p>
                            </div>
                            <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString(lang)}</p>
                        </div>
                    </li>
                )}
            />
        </div>
    );
};

export default CustomerRelationsHomePage;