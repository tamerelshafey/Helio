import React from 'react';
import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon, HeartIcon, FloorIcon, CompoundIcon } from './icons/Icons';
import type { Property, Language } from '../types';
import { translations } from '../data/translations';
import { useFavorites } from './shared/FavoritesContext';
import { isCommercial } from '../utils/propertyUtils';

interface FeatureSectionProps extends Property {
  language: Language;
}

const FeatureSection: React.FC<FeatureSectionProps> = (props) => {
  const {
    id,
    imageUrl,
    status,
    price,
    title,
    beds,
    baths,
    area,
    floor,
    type,
    finishingStatus,
    isInCompound,
    partnerName,
    language,
  } = props;
  const t = translations[language];
  const { isFavorite, toggleFavorite } = useFavorites();
  const isForSale = status.en === 'For Sale';
  const isFav = isFavorite(id);
  const isCommercialProp = isCommercial(props);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };


  return (
    <Link to={`/properties/${id}`} className="block h-full">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group h-full flex flex-col">
        <div className="relative">
          <img src={imageUrl} alt={title[language]} className="w-full h-56 object-cover" />
          <span className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-white font-semibold px-3 py-1 rounded-md text-sm ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
            {status[language]}
          </span>
           {isInCompound && (
             <span className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-2 rounded-full bg-black/50`} title={t.propertiesPage.inCompound}>
                <CompoundIcon className="w-5 h-5 text-white" />
             </span>
           )}
          <div className={`absolute top-14 ${language === 'ar' ? 'left-4' : 'right-4'} flex gap-2`}>
            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors"
              aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}
            >
              <HeartIcon className={`w-6 h-6 transition-colors ${isFav ? 'text-red-500 fill-current' : 'text-white'}`} />
            </button>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-2xl font-bold text-amber-500 mb-2">{price[language]}</p>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-1 group-hover:text-amber-500 transition-colors">{title[language]}</h3>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
              {finishingStatus && (
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{finishingStatus[language]}</span>
              )}
              {floor !== undefined && !isCommercialProp && (
                  <span>{t.propertyCard.floor} {floor}</span>
              )}
          </div>

          {partnerName && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">{t.propertyCard.by} {partnerName}</p>}
          <div className="flex justify-between items-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
            {isCommercialProp ? (
                <>
                    <div className="flex items-center gap-2">
                        <FloorIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span>{floor} {t.propertyCard.floor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AreaIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span>{area} {t.propertyCard.area}</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <BedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span>{beds} {t.propertyCard.beds}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BathIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span>{baths} {t.propertyCard.baths}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <AreaIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span>{area} {t.propertyCard.area}</span>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureSection;