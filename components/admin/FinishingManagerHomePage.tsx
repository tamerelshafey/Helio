import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllLeads } from '../../api/leads';
import { WrenchScrewdriverIcon, InboxIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';

const FinishingManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { data: leads, isLoading } = useApiQuery('allLeads', getAllLeads);

    const finishingLeads = (leads || []).filter(lead => lead.serviceTitle.toLowerCase().includes('finishing'));
    const newLeadsCount = finishingLeads.filter(l => l.status === 'new').length;

    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Finishing Requests Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Overview of finishing service requests.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Total Finishing Leads"
                    value={finishingLeads.length}
                    icon={WrenchScrewdriverIcon}
                    linkTo="/admin/leads?tab=finishing"
                />
                 <StatCard 
                    title="New Finishing Leads"
                    value={newLeadsCount}
                    icon={InboxIcon}
                    linkTo="/admin/leads?tab=finishing"
                />
            </div>
             <div className="mt-8">
                <Link to="/admin/leads?tab=finishing" className="text-amber-600 hover:underline font-semibold">
                    View all finishing leads &rarr;
                </Link>
            </div>
        </div>
    );
};

export default FinishingManagerHomePage;
