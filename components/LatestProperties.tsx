import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './shared/PropertyCard';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import type { Language, Project } from '../types';
import { translations } from '../data/translations';
import { isListingActive } from '../utils/propertyUtils';
import { getProperties } from '../api/properties';
import { getAllProjects } from '../api/projects';
import { useApiQuery } from './shared/useApiQuery';


interface LatestPropertiesProps {
  language: Language;
}

const LatestProperties: React.FC<LatestPropertiesProps> = ({ language }) => {
  const t = translations[language];
  const { data: properties, isLoading: isLoadingProperties } = useApiQuery('properties', getProperties);
  const { data: projects, isLoading: isLoadingProjects } = useApiQuery('allProjects', getAllProjects);

  const loading = isLoadingProperties || isLoadingProjects;

  const featuredProperties = (properties || [])
    .filter(isListingActive)
    .sort((a, b) => new Date(b.listingStartDate || 0).getTime() - new Date(a.listingStartDate || 0).getTime())
    .slice(0, 4);

  const projectsMap = useMemo(() => {
    if (!projects) return new Map<string, Project>();
    return new Map(projects.map(p => [p.id, p]));
  }, [projects]);

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t.latestProperties}
            </h2>
            <Link to="/properties" className="text-amber-500 font-semibold hover:underline">
                {t.viewAll}
            </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => <PropertyCardSkeleton key={index} />)
          ) : (
            featuredProperties.map((prop) => {
              const project = prop.projectId ? projectsMap.get(prop.projectId) : undefined;
              return <PropertyCard key={prop.id} {...prop} language={language} project={project} />;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestProperties;