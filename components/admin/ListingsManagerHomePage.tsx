import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllProperties } from '../../api/properties';
import { getAllProjects } from '../../api/projects';
import { ClipboardDocumentListIcon, BuildingIcon, CubeIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';
import { isListingActive } from '../../utils/propertyUtils';
import { translations } from '../../data/translations';

const ListingsManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].adminDashboard.listingsManagerHome;
    const { data: properties, isLoading: loadingProps } = useApiQuery('allProperties', getAllProperties);
    const { data: projects, isLoading: loadingProjs } = useApiQuery('allProjects', getAllProjects);

    const activeProperties = (properties || []).filter(isListingActive).length;
    const totalProjects = (projects || []).length;

    if (loadingProps || loadingProjs) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title={t.activeProperties}
                    value={activeProperties}
                    icon={BuildingIcon}
                    linkTo="/admin/properties"
                />
                 <StatCard 
                    title={t.totalProjects}
                    value={totalProjects}
                    icon={CubeIcon}
                    linkTo="/admin/projects"
                />
            </div>
        </div>
    );
};

export default ListingsManagerHomePage;