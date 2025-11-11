

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnerRequests } from '../../services/partnerRequests';
import { getAllPartnersForAdmin } from '../../services/partners';
import { UserPlusIcon, UsersIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';
import RequestList from '../shared/RequestList';
import { useLanguage } from '../shared/LanguageContext';
import type { PartnerRequest, Language } from '../../types';

const PartnerRelationsHomePage: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard.partnersManagement;
    
    const { data: partnerRequests, isLoading: loadingPartnerRequests } = useQuery({ queryKey: ['partnerRequests'], queryFn: getAllPartnerRequests });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });

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
                   title={i18n.adminDashboard.home.pendingPartnerRequests} 
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
               itemRenderer={(item) => (
                   <li key={item.id} className="py-3">
                       <Link to={`/admin/partner-requests/${item.id}`} className="flex justify-between items-center group">
                           <div>
                               <p className="font-medium group-hover:text-amber-600">{item.companyName}</p>
                               <p className="text-sm text-gray-500">{item.contactName}</p>
                           </div>
                           <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString(language)}</p>
                       </Link>
                   </li>
               )}
           />
       </div>
    );
};

export default PartnerRelationsHomePage;