import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeatureSection from './FeatureSection';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import { getFeaturedProperties } from '../api/properties';
import type { Property } from '../data/properties';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface SocialProofProps {
  language: Language;
}

const SocialProof: React.FC<SocialProofProps> = ({ language }) => {
  const t = translations[language];
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      const props = await getFeaturedProperties();
      setProperties(props);
      setIsLoading(false);
    };
    fetchProperties();
  }, []);


  return (
    <div className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t.latestProperties}
            </h2>
            <Link to="/properties" className="text-amber-500 font-semibold hover:underline">
                {t.viewAll}
            </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <PropertyCardSkeleton key={index} />)
          ) : (
            properties.map((prop) => (
              <FeatureSection key={prop.id} {...prop} language={language} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialProof;
