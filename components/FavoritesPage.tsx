import React from 'react';
import { Link } from 'react-router-dom';
import FeatureSection from './FeatureSection';
import { propertiesData } from '../data/properties';
import type { Language } from '../App';
import { translations } from '../data/translations';
import { useFavorites } from './shared/FavoritesContext';
import { HeartIcon } from './icons/Icons';

interface FavoritesPageProps {
  language: Language;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ language }) => {
    const t = translations[language].favoritesPage;
    const { favorites } = useFavorites();

    const favoriteProperties = propertiesData.filter(p => favorites.includes(p.id));

    return (
        <div className="py-20 bg-gray-900 min-h-[60vh]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white">{t.title}</h1>
                <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
            </div>
            
            {favoriteProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {favoriteProperties.map((prop) => (
                        <FeatureSection key={prop.id} {...prop} language={language} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 flex flex-col items-center">
                    <HeartIcon className="w-16 h-16 text-gray-700 mb-4" />
                    <p className="text-xl text-gray-400 mb-6">{t.noFavorites}</p>
                    <Link to="/properties" className="bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">
                        {t.browseButton}
                    </Link>
                </div>
            )}
          </div>
        </div>
    );
};

export default FavoritesPage;