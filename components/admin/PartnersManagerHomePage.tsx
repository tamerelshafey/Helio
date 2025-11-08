

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { getAllPartnersForAdmin } from '../../api/partners';
import { UserPlusIcon, UsersIcon } from '../icons/Icons';
import { translations } from '../../data/translations';
import StatCard from '../shared/StatCard';
import RequestList from './shared/RequestList';
import { useLanguage } from '../shared/LanguageContext';
import type { PartnerRequest, Language } from '../../types';

const PartnerRelationsHomePage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.partnersManagement;
    
    const { data: partnerRequests, isLoading: loadingPartnerRequests } = useApiQuery('partnerRequests', getAllPartnerRequests);
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartnersAdmin', getAllPartnersForAdmin);

    const isLoading = loadingPartnerRequests || loadingPartners;

    const stats = useMemo(() => {
        if (isLoading) return null;
        return {
            pendingRequests: (partnerRequests || []).filter(r => r.status === 'pending').length,
            totalPartners: (partners || []).filter(p => p.type !== 'admin').length,
        };
    }, [isLoading, partnerRequests, partners]);

    if (isLoading || !stats) {
        return <div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>;
    }

    return (
       <div className="space-y-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
           <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <StatCard 
                   title={translations[language].adminDashboard.home.pendingPartnerRequests} 
                   value={stats.pendingRequests}
                   icon={UserPlusIcon}
                   linkTo="/admin/partner-requests"
               />
               <StatCard 
                   title={t.totalPartners}
                   value={stats.totalPartners}
                   icon={UsersIcon}
                   linkTo="/admin/partners"
               />
           </div>

           <RequestList<PartnerRequest>
               title={t.recentPartnerRequests}
               requests={partnerRequests}
               linkTo="/admin/partner-requests"
               // FIX: Removed redundant language prop, as the component uses context.
               itemRenderer={(item, lang) => (
                   <li key={item.id} className="py-3">
                       <Link to={`/admin/partner-requests/${item.id}`} className="flex justify-between items-center group">
                           <div>
                               <p className="font-medium group-hover:text-amber-600">{item.companyName}</p>
                               <p className="text-sm text-gray-500">{item.contactName}</p>
                           </div>
                           <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString(lang)}</p>
                       </Link>
                   </li>
               )}
           />
       </div>
    );
};

export default PartnerRelationsHomePage;