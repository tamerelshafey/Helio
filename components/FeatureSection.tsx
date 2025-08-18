import React from 'react';
import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon } from './icons/Icons';
import type { Property } from '../data/properties';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface FeatureSectionProps extends Property {
  language: Language;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  id,
  imageUrl,
  status,
  price,
  title,
  beds,
  baths,
  area,
  language,
}) => {
  const t = translations[language].propertyCard;
  const isForSale = status.en === 'For Sale';

  return (
    <Link to={`/properties/${id}`} className="block h-full">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group h-full flex flex-col">
        <div className="relative">
          <img src={imageUrl} alt={title[language]} className="w-full h-56 object-cover" />
          <span className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} text-white font-semibold px-3 py-1 rounded-md text-sm ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
            {status[language]}
          </span>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-2xl font-bold text-amber-500 mb-2">{price[language]}</p>
          <h3 className="text-lg font-bold text-gray-100 truncate mb-4 group-hover:text-amber-500 transition-colors flex-grow">{title[language]}</h3>
          <div className="flex justify-between items-center text-gray-400 border-t border-gray-700 pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <BedIcon className="w-5 h-5 text-gray-500" />
              <span>{beds} {t.beds}</span>
            </div>
            <div className="flex items-center gap-2">
              <BathIcon className="w-5 h-5 text-gray-500" />
              <span>{baths} {t.baths}</span>
            </div>
            <div className="flex items-center gap-2">
              <AreaIcon className="w-5 h-5 text-gray-500" />
              <span>{area} {t.area}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeatureSection;