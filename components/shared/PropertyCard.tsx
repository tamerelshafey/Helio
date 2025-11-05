import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon, HeartIcon, FloorIcon, CompoundIcon, TagIcon } from '../icons/Icons';
import type { Property, Language, Project } from '../../types';
import { translations } from '../../data/translations';
import { useFavorites } from './FavoritesContext';
import { isCommercial } from '../../utils/propertyUtils';

interface PropertyCardProps extends Property {
  language: Language;
  project?: Project;
}

const PropertyCard: React.FC<PropertyCardProps> = (props) => {
  const {
    id,
    imageUrl,
    imageUrl_small,
    imageUrl_medium,
    imageUrl_large,
    status,
    price,
    pricePerMeter,
    title,
    beds,
    baths,
    area,
    floor,
    type,
    finishingStatus,
    isInCompound,
    partnerId,
    partnerName,
    installmentsAvailable,
    language,
    project,
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
          <img 
            src={imageUrl_large || imageUrl}
            srcSet={`${imageUrl_small} 480w, ${imageUrl_medium} 800w, ${imageUrl_large || imageUrl} 1200w`}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
            alt={title[language]} 
            className="w-full h-56 object-cover"
            loading="lazy"
          />
          <span className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-white font-semibold px-3 py-1 rounded-md text-sm ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
            {status[language]}
          </span>
           {isInCompound && (
             <span className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} p-2 rounded-full bg-black/50`} title={t.propertiesPage.inCompound}>
                <CompoundIcon className="w-5 h-5 text-white" />
             </span>
           )}
          <div className={`absolute top-14 ${language === 'ar' ? 'right-4' : 'left-4'} flex flex-col gap-2 items-center`}>
            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors"
              aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}
            >
              <HeartIcon className={`w-6 h-6 transition-colors ${isFav ? 'text-red-500 fill-current' : 'text-white'}`} />
            </button>
            {installmentsAvailable && isForSale && (
                <div className="p-2 rounded-full bg-black/50" title={t.propertiesPage.installments}>
                    <TagIcon className="w-6 h-6 text-white" />
                </div>
            )}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-2xl font-bold text-amber-500 mb-1">{price[language]}</p>
          {isForSale && pricePerMeter && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{pricePerMeter[language]}</p>
          )}
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-1 group-hover:text-amber-500 transition-colors">{title[language]}</h3>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
              {finishingStatus && (
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{finishingStatus[language]}</span>
              )}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-grow">
            {partnerName && partnerId !== 'individual-listings' ? (
                <p>
                    {t.propertyCard.by}{' '}
                    <Link to={`/partners/${partnerId}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-gray-700 dark:text-gray-300 hover:text-amber-500 hover:underline">
                        {partnerName}
                    </Link>
                </p>
            ) : partnerName ? (
                 <p>{t.propertyCard.by} {partnerName}</p>
            ) : null}

            {project && (
                <Link to={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()} className="text-amber-600 dark:text-amber-500 hover:underline text-xs">
                    {t.propertyCard.viewProject}
                </Link>
            )}
          </div>

          <div className="flex justify-around items-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4 mt-auto">
            {!isCommercialProp && (
                <>
                    <div className="flex items-center gap-2" title={`${beds} ${t.propertyCard.beds}`}>
                        <BedIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium">{beds}</span>
                    </div>
                    <div className="flex items-center gap-2" title={`${baths} ${t.propertyCard.baths}`}>
                        <BathIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm font-medium">{baths}</span>
                    </div>
                </>
            )}
            <div className="flex items-center gap-2" title={`${area} ${t.propertyCard.area}`}>
                <AreaIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium">{area} {t.propertyCard.area}</span>
            </div>
            {floor !== undefined && (type.en === 'Apartment' || type.en === 'Commercial') && (
                 <div className="flex items-center gap-2" title={`${floor} ${t.propertyCard.floor}`}>
                    <FloorIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium">{floor}</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
