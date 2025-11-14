import React from 'react';
import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon } from '../ui/Icons';
import type { Property, Language, Project } from '../../types';
import { isCommercial } from '../../utils/propertyUtils';
import { useLanguage } from '../shared/LanguageContext';

interface PropertyListItemProps extends Omit<Property, 'language'> {
  project?: Project;
}

const PropertyListItem: React.FC<PropertyListItemProps> = (props) => {
    const { language, t } = useLanguage();
    const t_card = t.propertyCard;
    const { id, imageUrl, status, price, title, beds, baths, area } = props;
    const isForSale = status.en === 'For Sale';
    const isCommercialProp = isCommercial(props);

    return (
        <Link to={`/properties/${id}`} className="block">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 group flex h-full">
                <div className="relative w-28 md:w-40 flex-shrink-0">
                    <img src={imageUrl} alt={title[language]} className="w-full h-full object-cover" loading="lazy" />
                     <span className={`absolute top-2 ${language === 'ar' ? 'right-2' : 'left-2'} text-white font-semibold px-2 py-0.5 rounded-md text-xs ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}>
                        {status[language]}
                    </span>
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-grow">
                    <h3 className="text-sm md:text-md font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-500 transition-colors line-clamp-2">{title[language]}</h3>
                    <p className="text-md md:text-lg font-bold text-amber-500 my-1">{price[language]}</p>
                    <div className="flex-grow"></div>
                    <div className="flex items-center gap-3 md:gap-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-2">
                         {!isCommercialProp && (
                            <>
                                <div className="flex items-center gap-1.5" title={`${beds} ${t_card.beds}`}>
                                    <BedIcon className="w-4 h-4" />
                                    <span>{beds}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title={`${baths} ${t_card.baths}`}>
                                    <BathIcon className="w-4 h-4" />
                                    <span>{baths}</span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-1.5" title={`${area} ${t_card.area}`}>
                            <AreaIcon className="w-4 h-4" />
                            <span>{area} {t_card.area}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PropertyListItem;