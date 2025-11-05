import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllPartnersForAdmin } from '../../api/partners';
import { getAllPartnerRequests } from '../../api/partnerRequests';
import { UsersIcon, UserPlusIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';

const PartnersManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { data: partners, isLoading: loadingPartners } = useApiQuery('allPartners', getAllPartnersForAdmin);
    const { data: partnerRequests, isLoading: loadingReqs } = useApiQuery('partnerRequests', getAllPartnerRequests);

    const activePartners = (partners || []).filter(p => p.status === 'active' && p.type !== 'admin').length;
    const pendingRequests = (partnerRequests || []).filter(r => r.status === 'pending').length;

    if (loadingPartners || loadingReqs) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Partner Relations Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Overview of partner accounts and join requests.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Active Partners"
                    value={activePartners}
                    icon={UsersIcon}
                    linkTo="/admin/partners"
                />
                 <StatCard 
                    title="Pending Join Requests"
                    value={pendingRequests}
                    icon={UserPlusIcon}
                    linkTo="/admin/partner-requests"
                />
            </div>
        </div>
    );
};

export default PartnersManagerHomePage;
