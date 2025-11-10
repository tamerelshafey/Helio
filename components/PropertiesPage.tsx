import React, { useMemo, useState, useEffect, useRef } from 'react';
import PropertyCard from './shared/PropertyCard';
import type { Project, Property } from '../types';
import { ListIcon, GridIcon, MapIcon } from './icons/Icons';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import PropertyListItem from './shared/PropertyListItem';
import PropertyListItemSkeleton from './shared/PropertyListItemSkeleton';
import { isListingActive } from '../utils/propertyUtils';
import BannerDisplay from './shared/BannerDisplay';
import PropertyInquiryModal from './shared/PropertyInquiryModal';
import { usePropertyFilters } from './shared/usePropertyFilters';
import SEO from './shared/SEO';
import PropertyFilters from './PropertyFilters';
import { useQuery } from '@tanstack/react-query';
import { getPaginatedProperties } from '../services/properties';
import { getAllProjects } from '../services/projects';
import { getAllPartnersForAdmin } from '../services/partners';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../services/filters';
import { useLanguage } from './shared/LanguageContext';
import { useDebounce } from './hooks/useDebounce';
import Pagination from './shared/Pagination';
import PropertiesMapView from './PropertiesMapView';

const ITEMS_PER_PAGE = 9;

const PropertiesPage: React.FC = () => {
    const { language, t } = useLanguage();
    
    const allFiltersAndControls = usePropertyFilters();
    const { page, setPage, type, finishing, setFilter } = allFiltersAndControls;
    
    const filterValues = useMemo(() => {
        const { page, setPage, setFilter, resetFilters, ...rest } = allFiltersAndControls;
        return rest;
    }, [allFiltersAndControls]);

    const debouncedFilters = useDebounce(filterValues, 500);

    const { data: projects, isLoading: isLoadingProjs } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: partners, isLoading: isLoadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: isLoadingAmenities } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });

    const isLoadingFilterData = isLoadingProjs || isLoadingPartners || isLoadingPropTypes || isLoadingFinishing || isLoadingAmenities;
    
    const { 
        data: paginatedData, 
        isFetching: isFetchingProperties 
    } = useQuery({
        queryKey: ['paginatedProperties', page, debouncedFilters],
        queryFn: () => getPaginatedProperties({
            page: page,
            limit: ITEMS_PER_PAGE,
            filters: debouncedFilters,
        }),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60, // 1 minute
    });

    const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

    const [announcement, setAnnouncement] = useState('');
    const isInitialMount = useRef(true);
    
    // This effect handles the programmatic filter change for 'Land' type
    useEffect(() => {
        if (type === 'Land' && finishing !== 'all') {
            setFilter('finishing', 'all');
        }
    }, [type, finishing, setFilter]);

    const propertiesToDisplay = paginatedData?.properties || [];
    const totalProperties = paginatedData?.total || 0;
    const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);
    
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (!isFetchingProperties) {
                setAnnouncement(t.propertiesPage.resultsFound.replace('{count}', String(totalProperties)));
            }
        }
    }, [totalProperties, isFetchingProperties, t.propertiesPage.resultsFound]);

    const renderSkeletons = () => {
        if (view === 'list') {
            return (
                <div className="space-y-4 max-w-4xl mx-auto">
                    {Array.from({ length: 6 }).map((_, index) => <PropertyListItemSkeleton key={index} />)}
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-900">
             <div className="sr-only" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
            <SEO 
                title={`${t.nav.properties} | ONLY HELIO`}
                description={t.propertiesPage.subtitle}
            />
            {isRequestModalOpen && <PropertyInquiryModal onClose={() => setIsRequestModalOpen(false)} />}
          <div className="container mx-auto px-6 pt-20">
            {isLoadingFilterData ? <div className="animate-pulse h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div> : (
              <PropertyFilters 
                filters={allFiltersAndControls}
                projects={projects || []}
                partners={partners || []}
                propertyTypes={propertyTypes || []}
                finishingStatuses={finishingStatuses || []}
                amenities={amenities || []}
              />
            )}
            <BannerDisplay location="properties" />
             <div className="flex justify-end items-center mb-6">
                <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow' : 'text-gray-500 hover:text-amber-500'}`}
                        aria-label="Grid View"
                    >
                        <GridIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow' : 'text-gray-500 hover:text-amber-500'}`}
                        aria-label="List View"
                    >
                        <ListIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setView('map')}
                        className={`p-2 rounded-md transition-colors ${view === 'map' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow' : 'text-gray-500 hover:text-amber-500'}`}
                        aria-label="Map View"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </div>
          
          <div className="pb-8">
            {view === 'map' ? (
                 <div className="h-[75vh]">
                    <PropertiesMapView
                        properties={propertiesToDisplay}
                        loading={isFetchingProperties}
                        activePropertyId={activePropertyId}
                        setActivePropertyId={setActivePropertyId}
                    />
                </div>
            ) : (
                <div className="container mx-auto px-6">
                    {isFetchingProperties && !paginatedData ? ( // Only show skeleton on initial load
                        <div className="animate-fadeIn">{renderSkeletons()}</div>
                      ) : (
                        <div className="animate-fadeIn">
                            {propertiesToDisplay.length > 0 ? (
                                view === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                                    {propertiesToDisplay.map((prop) => (
                                        <div
                                            key={prop.id}
                                            onMouseEnter={() => setActivePropertyId(prop.id)}
                                            onMouseLeave={() => setActivePropertyId(null)}
                                            className="rounded-lg"
                                        >
                                            <PropertyCard {...prop} />
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-w-4xl mx-auto">
                                        {propertiesToDisplay.map((prop) => <PropertyListItem key={prop.id} {...prop} />)}
                                    </div>
                                )
                              ) : (
                                <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-xl text-gray-600 dark:text-gray-400">{t.propertiesPage.noResults}</p>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-8">{t.propertiesPage.cantFindTitle}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">{t.propertiesPage.cantFindSubtitle}</p>
                                    <button
                                        onClick={() => setIsRequestModalOpen(true)}
                                        className="mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                                    >
                                        {t.propertiesPage.leaveRequestButton}
                                    </button>
                                </div>
                              )}
                        </div>
                      )}
                </div>
            )}
            
             {totalPages > 1 && (
                <div className="mt-12 container mx-auto px-6">
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
          </div>
        </div>
    );
};

export default PropertiesPage;