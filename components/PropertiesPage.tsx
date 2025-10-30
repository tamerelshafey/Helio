import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import FeatureSection from './FeatureSection';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { SearchIcon } from './icons/Icons';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import { inputClasses, selectClasses } from './shared/FormField';
import { useData } from './shared/DataContext';
import { isListingActive } from '../utils/propertyUtils';

interface PropertiesPageProps {
  language: Language;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ language }) => {
    const t = translations[language].propertiesPage;
    const [searchParams, setSearchParams] = useSearchParams();
    const { properties, loading: isLoading } = useData();

    const activeProperties = useMemo(() => properties.filter(isListingActive), [properties]);

    const statusFilter = searchParams.get('status') || 'all';
    const typeFilter = searchParams.get('type') || 'all';
    const queryFilter = searchParams.get('q') || '';
    const minPriceFilter = searchParams.get('minPrice') || '';
    const maxPriceFilter = searchParams.get('maxPrice') || '';
    const finishingFilter = searchParams.get('finishing') || 'all';
    const installmentsFilter = searchParams.get('installments') || 'all';
    const floorFilter = searchParams.get('floor') || '';
    const compoundFilter = searchParams.get('compound') || 'all';
    const deliveryFilter = searchParams.get('delivery') || 'all';

    const handleFilterChange = (filterName: string, value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value === 'all' || !value) {
            newParams.delete(filterName);
        } else {
            newParams.set(filterName, value);
        }
        setSearchParams(newParams, { replace: true });
    };

    const filteredProperties = useMemo(() => {
        return activeProperties.filter(p => {
            const statusMatch = statusFilter === 'all' || p.status.en === statusFilter;
            const typeMatch = typeFilter === 'all' || p.type.en === typeFilter;
            
            const queryMatch = !queryFilter || 
              p.title.ar.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.title.en.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.address.ar.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.address.en.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.partnerName?.toLowerCase().includes(queryFilter.toLowerCase());

            const minPrice = parseInt(minPriceFilter, 10);
            const maxPrice = parseInt(maxPriceFilter, 10);
            const priceMatch = (!minPrice || p.priceNumeric >= minPrice) && (!maxPrice || p.priceNumeric <= maxPrice);

            const finishingMatch = (() => {
                if (finishingFilter === 'all') return true;
                if (p.type.en === 'Land' || p.type.en === 'Commercial') return true; 
                return p.finishingStatus?.en === finishingFilter;
            })();

            const installmentsMatch = installmentsFilter === 'all' ||
                (installmentsFilter === 'yes' && p.installmentsAvailable) ||
                (installmentsFilter === 'no' && !p.installmentsAvailable);
            
            const floorMatch = !floorFilter || (p.type.en === 'Commercial' && p.floor === parseInt(floorFilter, 10));

            const compoundMatch = compoundFilter === 'all' || 
                (compoundFilter === 'yes' && p.isInCompound) ||
                (compoundFilter === 'no' && !p.isInCompound);

            const deliveryMatch = deliveryFilter === 'all' ||
                (deliveryFilter === 'immediate' && p.delivery?.isImmediate);

            return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && installmentsMatch && floorMatch && compoundMatch && deliveryMatch;
        });
    }, [activeProperties, statusFilter, typeFilter, queryFilter, minPriceFilter, maxPriceFilter, finishingFilter, installmentsFilter, floorFilter, compoundFilter, deliveryFilter]);
    
    const isForRent = statusFilter === 'For Rent';
    const isLandOrCommercial = typeFilter === 'Land' || typeFilter === 'Commercial';

    return (
        <div className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
            </div>
            
            <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <div className="relative sm:col-span-2 lg:col-span-4 xl:col-span-5">
                        <label htmlFor="search-query" className="sr-only">{t.searchPlaceholder}</label>
                        <input 
                            type="text" 
                            id="search-query"
                            value={queryFilter} 
                            onChange={e => handleFilterChange('q', e.target.value)} 
                            placeholder={t.searchPlaceholder}
                            className={`${inputClasses} ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                        />
                         <SearchIcon className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} h-5 w-5 text-gray-400 dark:text-gray-400`} />
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.allStatuses}</label>
                        <select id="status-filter" value={statusFilter} onChange={e => handleFilterChange('status', e.target.value)} className={selectClasses}>
                            <option value="all">{t.allStatuses}</option>
                            <option value="For Sale">{t.forSale}</option>
                            <option value="For Rent">{t.forRent}</option>
                        </select>
                    </div>
                    <div>
                         <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.allTypes}</label>
                        <select id="type-filter" value={typeFilter} onChange={e => handleFilterChange('type', e.target.value)} className={selectClasses}>
                            <option value="all">{t.allTypes}</option>
                            <option value="Apartment">{t.apartment}</option>
                            <option value="Villa">{t.villa}</option>
                            <option value="Commercial">{t.commercial}</option>
                            <option value="Land">{t.land}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="finishing-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.finishing}</label>
                        <select id="finishing-filter" value={finishingFilter} onChange={e => handleFilterChange('finishing', e.target.value)} className={selectClasses} disabled={isLandOrCommercial}>
                            <option value="all">{t.allFinishes}</option>
                            <option value="Fully Finished">{t.fullyFinished}</option>
                            <option value="Semi-finished" disabled={isForRent}>{t.semiFinished}</option>
                            <option value="Without Finishing" disabled={isForRent}>{t.withoutFinishing}</option>
                            <option value="Super Lux">{t.superLux}</option>
                            <option value="Luxury Finishing">{t.luxuryFinishing}</option>
                            <option value="Fully Furnished">{t.fullyFurnished}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="installments-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.installments}</label>
                        <select id="installments-filter" value={installmentsFilter} onChange={e => handleFilterChange('installments', e.target.value)} className={selectClasses} disabled={isForRent}>
                            <option value="all">{t.allInstallments}</option>
                            <option value="yes">{t.installmentsYes}</option>
                            <option value="no">{t.installmentsNo}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="compound-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.inCompound}</label>
                        <select id="compound-filter" value={compoundFilter} onChange={e => handleFilterChange('compound', e.target.value)} className={selectClasses}>
                            <option value="all">{t.allCompound}</option>
                            <option value="yes">{t.compoundYes}</option>
                            <option value="no">{t.compoundNo}</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="delivery-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.delivery}</label>
                        <select id="delivery-filter" value={deliveryFilter} onChange={e => handleFilterChange('delivery', e.target.value)} className={selectClasses}>
                            <option value="all">{t.allDelivery}</option>
                            <option value="immediate">{t.immediateDelivery}</option>
                        </select>
                    </div>
                    {typeFilter === 'Commercial' && (
                        <div>
                            <label htmlFor="floor-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.floor}</label>
                            <input
                                type="number"
                                id="floor-filter"
                                placeholder={t.floor}
                                value={floorFilter}
                                onChange={e => handleFilterChange('floor', e.target.value)}
                                className={inputClasses}
                                min="0"
                            />
                        </div>
                    )}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.priceRange}</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder={t.minPricePlaceholder} 
                                value={minPriceFilter} 
                                onChange={e => handleFilterChange('minPrice', e.target.value)} 
                                className={inputClasses} 
                                min="0"
                            />
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                            <input 
                                type="number" 
                                placeholder={t.maxPricePlaceholder} 
                                value={maxPriceFilter} 
                                onChange={e => handleFilterChange('maxPrice', e.target.value)} 
                                className={inputClasses} 
                                min="0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((prop) => (
                    <FeatureSection key={prop.id} {...prop} language={language} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                    <p className="text-xl text-gray-500 dark:text-gray-400">{t.noResults}</p>

                </div>
              )}
            </div>
          </div>
        </div>
    );
};

export default PropertiesPage;