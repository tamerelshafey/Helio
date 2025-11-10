
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllProperties } from '../../services/properties';
import { getAllProjects } from '../../services/projects';
import { ClipboardDocumentListIcon, BuildingIcon, CubeIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';
import { isListingActive } from '../../utils/propertyUtils';
import { useLanguage } from '../shared/LanguageContext';

const ListingsManagerHomePage: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard.listingsManagerHome;
    const { data: properties, isLoading: loadingProps } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });
    const { data: projects, isLoading: loadingProjs } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });

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