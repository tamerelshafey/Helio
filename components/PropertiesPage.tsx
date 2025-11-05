import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from './shared/PropertyCard';
import type { Language, Property, Project, Partner, FilterOption } from '../types';
import { translations } from '../data/translations';
import { SearchIcon, ArrowDownIcon, ListIcon, MapIcon } from './icons/Icons';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import { inputClasses, selectClasses } from './shared/FormField';
import { isListingActive } from '../utils/propertyUtils';
import BannerDisplay from './shared/BannerDisplay';
import PropertyInquiryModal from './shared/PropertyInquiryModal';
import PropertiesMapView from './PropertiesMapView';
import { getProperties } from '../mockApi/properties';
import { getAllProjects } from '../mockApi/projects';
import { getAllPartnersForAdmin } from '../mockApi/partners';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../mockApi/filters';
import { useApiQuery } from './shared/useApiQuery';
import { usePropertyFilters } from './shared/usePropertyFilters';

interface PropertiesPageProps {
  language: Language;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ language }) => {
    const t = translations[language].propertiesPage;
    
    const { 
        status: statusFilter, type: typeFilter, query: queryFilter, 
        minPrice: minPriceFilter, maxPrice: maxPriceFilter, project: projectFilter, 
        finishing: finishingFilter, installments: installmentsFilter, floor: floorFilter, 
        compound: compoundFilter, delivery: deliveryFilter, amenities: amenitiesFilter,
        beds: bedsFilter, baths: bathsFilter,
        setFilter 
    } = usePropertyFilters();

    // On-demand data fetching
    const { data: properties, isLoading: isLoadingProperties } = useApiQuery('properties', getProperties);
    const { data: projects, isLoading: isLoadingProjects } = useApiQuery('allProjects', getAllProjects);
    const { data: partners, isLoading: isLoadingPartners } = useApiQuery('allPartners', getAllPartnersForAdmin);
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useApiQuery('propertyTypes', getAllPropertyTypes);
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useApiQuery('finishingStatuses', getAllFinishingStatuses);
    const { data: amenities, isLoading: isLoadingAmenities } = useApiQuery('amenities', getAllAmenities);

    const isLoading = isLoadingProperties || isLoadingProjects || isLoadingPartners || isLoadingPropTypes || isLoadingFinishing || isLoadingAmenities;
    
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [view, setView] = useState<'list' | 'map'>('list');
    const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

    const activeProperties = useMemo(() => (properties || []).filter(isListingActive), [properties]);
    const megaProjects = useMemo(() => (projects || []).filter(p => (partners || []).find(partner => partner.id === p.partnerId)?.displayType === 'mega_project'), [projects, partners]);
    
    const projectsMap = useMemo(() => {
        if (!projects) return new Map<string, Project>();
        return new Map(projects.map(p => [p.id, p]));
    }, [projects]);
    
    useEffect(() => {
        if (typeFilter === 'Land' && finishingFilter !== 'all') {
            setFilter('finishing', 'all');
        }
    }, [typeFilter, finishingFilter, setFilter]);

    const handleAmenitiesChange = (amenityEn: string) => {
        const newAmenities = amenitiesFilter.includes(amenityEn)
            ? amenitiesFilter.filter(a => a !== amenityEn)
            : [...amenitiesFilter, amenityEn];
        setFilter('amenities', newAmenities);
    };
    
    const advancedFilterCount = [
        projectFilter !== 'all',
        finishingFilter !== 'all',
        installmentsFilter !== 'all',
        compoundFilter !== 'all',
        deliveryFilter !== 'all',
        !!floorFilter,
        amenitiesFilter.length > 0
    ].filter(Boolean).length;

    const availableAmenities = useMemo(() => {
        const allAmenities = amenities || [];
        if (typeFilter === 'all') return allAmenities;
        return allAmenities.filter(amenity => 
            !amenity.applicableTo || amenity.applicableTo.length === 0 || amenity.applicableTo.includes(typeFilter)
        );
    }, [amenities, typeFilter]);

    const availableFinishingStatuses = useMemo(() => {
        const allFinishingStatuses = finishingStatuses || [];
        if (typeFilter === 'all') return allFinishingStatuses;
        if (typeFilter === 'Land') return [];
        return allFinishingStatuses.filter(status => 
            !status.applicableTo || status.applicableTo.length === 0 || status.applicableTo.includes(typeFilter)
        );
    }, [finishingStatuses, typeFilter]);

    const filteredProperties = useMemo(() => {
        return activeProperties.filter(p => {
            const statusMatch = statusFilter === 'all' || p.status.en === statusFilter;
            const typeMatch = typeFilter === 'all' || p.type.en === typeFilter;
            const projectMatch = projectFilter === 'all' || p.projectId === projectFilter;
            
            const queryMatch = !queryFilter || 
              p.title.ar.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.title.en.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.address.ar.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.address.en.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.partnerName?.toLowerCase().includes(queryFilter.toLowerCase());

            const minPrice = parseInt(minPriceFilter, 10);
            const maxPrice = parseInt(maxPriceFilter, 10);
            const priceMatch = (!minPrice || p.priceNumeric >= minPrice) && (!maxPrice || p.priceNumeric <= maxPrice);

            const finishingMatch = finishingFilter === 'all' || p.finishingStatus?.en === finishingFilter;

            const installmentsMatch = installmentsFilter === 'all' ||
                (installmentsFilter === 'yes' && p.installmentsAvailable) ||
                (installmentsFilter === 'no' && !p.installmentsAvailable);
            
            const floorMatch = !floorFilter || (p.floor !== undefined && p.floor === parseInt(floorFilter, 10));

            const compoundMatch = compoundFilter === 'all' || 
                (compoundFilter === 'yes' && p.isInCompound) ||
                (compoundFilter === 'no' && !p.isInCompound);

            const deliveryMatch = deliveryFilter === 'all' ||
                (deliveryFilter === 'immediate' && p.delivery?.isImmediate);
            
            const amenitiesMatch = amenitiesFilter.length === 0 || amenitiesFilter.every(amenity => p.amenities.en.includes(amenity));

            const bedsMatch = !bedsFilter || p.beds >= parseInt(bedsFilter, 10);
            const bathsMatch = !bathsFilter || p.baths >= parseInt(bathsFilter, 10);

            return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && installmentsMatch && floorMatch && compoundMatch && deliveryMatch && amenitiesMatch && projectMatch && bedsMatch && bathsMatch;
        });
    }, [activeProperties, statusFilter, typeFilter, queryFilter, minPriceFilter, maxPriceFilter, finishingFilter, installmentsFilter, floorFilter, compoundFilter, deliveryFilter, amenitiesFilter, projectFilter, bedsFilter, bathsFilter]);
    
    const isForRent = statusFilter === 'For Rent';
    const isFinishingDisabled = typeFilter === 'Land' || availableFinishingStatuses.length === 0;

    const listOrGrid = (
         <div className="container mx-auto px-6">
            {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {filteredProperties.map((prop) => {
                    const project = prop.projectId ? projectsMap.get(prop.projectId) : undefined;
                    return (
                        <div
                            key={prop.id}
                            onMouseEnter={() => setActivePropertyId(prop.id)}
                            onMouseLeave={() => setActivePropertyId(null)}
                            className={`rounded-lg transition-all duration-300 ${activePropertyId === prop.id ? 'shadow-2xl ring-2 ring-amber-500' : ''}`}
                        >
                            <PropertyCard {...prop} language={language} project={project} />
                        </div>
                    )
                })}
                </div>
              ) : (
                <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xl text-gray-600 dark:text-gray-400">{t.noResults}</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-8">{t.cantFindTitle}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">{t.cantFindSubtitle}</p>
                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                    >
                        {t.leaveRequestButton}
                    </button>
                </div>
              )}
            </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900">
            {isRequestModalOpen && <PropertyInquiryModal onClose={() => setIsRequestModalOpen(false)} language={language} />}
          <div className="container mx-auto px-6 pt-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
            </div>
            
            <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                {/* Primary Filters */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <div className="sm:col-span-2 lg:col-span-4 xl:col-span-5">
                        <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.searchLabel}</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                id="search-query"
                                value={queryFilter} 
                                onChange={e => setFilter('q', e.target.value)} 
                                placeholder={t.searchPlaceholder}
                                className={`${inputClasses} ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                            />
                             <SearchIcon className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} h-5 w-5 text-gray-400 dark:text-gray-400`} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.statusLabel}</label>
                        <select id="status-filter" value={statusFilter} onChange={e => setFilter('status', e.target.value)} className={selectClasses}>
                            <option value="all">{t.allStatuses}</option>
                            <option value="For Sale">{t.forSale}</option>
                            <option value="For Rent">{t.forRent}</option>
                        </select>
                    </div>
                    <div>
                         <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.typeLabel}</label>
                        <select id="type-filter" value={typeFilter} onChange={e => setFilter('type', e.target.value)} className={selectClasses}>
                            <option value="all">{t.allTypes}</option>
                            {(propertyTypes || []).map(opt => (
                                <option key={opt.id} value={opt.en}>{opt[language]}</option>
                            ))}
                        </select>
                    </div>
                     <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.priceRange}</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                placeholder={t.minPricePlaceholder} 
                                value={minPriceFilter} 
                                onChange={e => setFilter('minPrice', e.target.value)} 
                                className={inputClasses} 
                                min="0"
                            />
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                            <input 
                                type="number" 
                                placeholder={t.maxPricePlaceholder} 
                                value={maxPriceFilter} 
                                onChange={e => setFilter('maxPrice', e.target.value)} 
                                className={inputClasses} 
                                min="0"
                            />
                        </div>
                    </div>
                </div>
                
                {/* Advanced Filters Toggle */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-500">
                        <span>{showAdvanced ? t.hideFilters : t.advancedFilters}</span>
                        <ArrowDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                        {advancedFilterCount > 0 && (
                             <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                {advancedFilterCount} {t.filtersApplied}
                             </span>
                        )}
                    </button>
                </div>

                {/* Advanced Filters Section */}
                {showAdvanced && (
                    <div className="pt-4 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.project}</label>
                                <select id="project-filter" value={projectFilter} onChange={e => setFilter('project', e.target.value)} className={selectClasses}>
                                    <option value="all">{t.allProjects}</option>
                                    {megaProjects.map(p => <option key={p.id} value={p.id}>{p.name[language]}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="finishing-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.finishing}</label>
                                <select id="finishing-filter" value={finishingFilter} onChange={e => setFilter('finishing', e.target.value)} className={selectClasses} disabled={isFinishingDisabled}>
                                    <option value="all">{t.allFinishes}</option>
                                    {availableFinishingStatuses.map(opt => (
                                        <option key={opt.id} value={opt.en}>{opt[language]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="installments-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.installments}</label>
                                <select id="installments-filter" value={installmentsFilter} onChange={e => setFilter('installments', e.target.value)} className={selectClasses} disabled={isForRent}>
                                    <option value="all">{t.allInstallments}</option>
                                    <option value="yes">{t.installmentsYes}</option>
                                    <option value="no">{t.installmentsNo}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="compound-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.inCompound}</label>
                                <select id="compound-filter" value={compoundFilter} onChange={e => setFilter('compound', e.target.value)} className={selectClasses}>
                                    <option value="all">{t.allCompound}</option>
                                    <option value="yes">{t.compoundYes}</option>
                                    <option value="no">{t.compoundNo}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="delivery-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.delivery}</label>
                                <select id="delivery-filter" value={deliveryFilter} onChange={e => setFilter('delivery', e.target.value)} className={selectClasses}>
                                    <option value="all">{t.allDelivery}</option>
                                    <option value="immediate">{t.immediateDelivery}</option>
                                </select>
                            </div>
                             {(typeFilter !== 'Villa' && typeFilter !== 'Land') && (
                                <div>
                                    <label htmlFor="floor-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.floor}</label>
                                    <input
                                        type="number"
                                        id="floor-filter"
                                        placeholder={t.floor}
                                        value={floorFilter}
                                        onChange={e => setFilter('floor', e.target.value)}
                                        className={inputClasses}
                                        min="0"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                             <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">{t.amenities}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
                                {availableAmenities.map(amenity => (
                                    <label key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={amenitiesFilter.includes(amenity.en)}
                                            onChange={() => handleAmenitiesChange(amenity.en)}
                                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        {amenity[language]}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end items-center mb-8 gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{language === 'ar' ? 'عرض:' : 'View:'}</span>
                <button 
                    onClick={() => setView('list')} 
                    className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    aria-label={t.listView}
                >
                    <ListIcon className="w-5 h-5" />
                </button>
                 <button 
                    onClick={() => setView('map')} 
                    className={`p-2 rounded-md transition-colors ${view === 'map' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    aria-label={t.mapView}
                >
                    <MapIcon className="w-5 h-5" />
                </button>
            </div>
            
            <BannerDisplay location="properties" language={language} />
          </div>

          <div className="pb-20">
              {view === 'list' ? listOrGrid : (
                  <PropertiesMapView 
                      properties={filteredProperties}
                      loading={isLoading}
                      language={language}
                      activePropertyId={activePropertyId}
                      setActivePropertyId={setActivePropertyId}
                  />
              )}
          </div>
        </div>
    );
};

export default PropertiesPage;