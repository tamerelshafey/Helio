import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './shared/PropertyCard';
import type { Language, Project } from '../types';
import { useFavorites } from './shared/FavoritesContext';
import { HeartIcon } from './icons/Icons';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import { useQuery } from '@tanstack/react-query';
import { getAllProperties } from '../services/properties';
import { useLanguage } from './shared/LanguageContext';

const FavoritesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_fav = t.favoritesPage;
    const { favorites } = useFavorites();
    const { data: properties, isLoading } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });

    const favoriteProperties = (properties || []).filter(p => favorites.includes(p.id));

    return (
        <div className="py-20 bg-white dark:bg-gray-900 min-h-[60vh]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t_fav.title}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t_fav.subtitle}</p>
            </div>
            
            {isLoading ? (
                <div className="animate-fadeIn grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {Array.from({ length: favorites.length || 3 }).map((_, index) => <PropertyCardSkeleton key={index} />)}
                </div>
            ) : (
              <div className="animate-fadeIn">
                {favoriteProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        {favoriteProperties.map((prop) => (
                            <PropertyCard key={prop.id} {...prop} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center">
                        <HeartIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                        <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{t_fav.noFavorites}</p>
                        <Link to="/properties" className="bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">
                            {t_fav.browseButton}
                        </Link>
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
    );
};

export default FavoritesPage;