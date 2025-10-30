import React from 'react';
import { Link } from 'react-router-dom';
import FeatureSection from './FeatureSection';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { useData } from './shared/DataContext';
import { isListingActive } from '../utils/propertyUtils';

interface SocialProofProps {
  language: Language;
}

const SocialProof: React.FC<SocialProofProps> = ({ language }) => {
  const t = translations[language];
  const { properties, loading } = useData();

  const featuredProperties = properties
    .filter(isListingActive)
    .sort((a, b) => new Date(b.listingStartDate || 0).getTime() - new Date(a.listingStartDate || 0).getTime())
    .slice(0, 4);

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
            featuredProperties.map((prop) => (
              <FeatureSection key={prop.id} {...prop} language={language} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialProof;