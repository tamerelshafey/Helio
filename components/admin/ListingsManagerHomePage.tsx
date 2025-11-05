import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllProperties } from '../../api/properties';
import { getAllPropertyRequests } from '../../api/propertyRequests';
import { ClipboardDocumentListIcon, BuildingIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';
import { isListingActive } from '../../utils/propertyUtils';

const ListingsManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { data: properties, isLoading: loadingProps } = useApiQuery('allProperties', getAllProperties);
    const { data: propertyRequests, isLoading: loadingReqs } = useApiQuery('propertyRequests', getAllPropertyRequests);

    const activeProperties = (properties || []).filter(isListingActive).length;
    const pendingRequests = (propertyRequests || []).filter(r => r.status === 'pending').length;

    if (loadingProps || loadingReqs) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Listings & Requests Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Overview of property listings and requests.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Active Properties"
                    value={activeProperties}
                    icon={BuildingIcon}
                    linkTo="/admin/properties"
                />
                 <StatCard 
                    title="Pending Listing Requests"
                    value={pendingRequests}
                    icon={ClipboardDocumentListIcon}
                    linkTo="/admin/property-requests"
                />
            </div>
        </div>
    );
};

export default ListingsManagerHomePage;
