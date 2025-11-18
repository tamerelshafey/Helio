
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../shared/SEO';
import { useLanguage } from '../shared/LanguageContext';
import { GridIcon, ListIcon } from '../ui/Icons';
import PropertyFilters from './PropertyFilters';
import PropertyCard from './PropertyCard';
import PropertyListItem from './PropertyListItem';
import PropertyCardSkeleton from '../shared/PropertyCardSkeleton';
import PropertyListItemSkeleton from '../shared/PropertyListItemSkeleton';
import PropertyInquiryModal from '../shared/PropertyInquiryModal';
import { getAllProjects } from '../../services/projects';
import { getAllPartnersForAdmin } from '../../services/partners';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../services/filters';
import { getPaginatedProperties } from '../../services/properties';
import { usePropertyFilters } from '../../hooks/usePropertyFilters';
import Pagination from '../ui/Pagination';

const ITEMS_PER_PAGE = 12;

const PropertiesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.propertiesPage;
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    
    // Use local state for view to prevent URL updates triggering refetches
    const [view, setView] = useState<'grid' | 'list'>('grid');

    // Use the hook to manage filter state via URL parameters
    const filterControls = usePropertyFilters();
    const { 
        page, status, type, query, minPrice, maxPrice, project, 
        finishing, installments, realEstateFinance, floor, compound, delivery, 
        amenities: amenitiesFilter, beds, baths, setFilter, setPage
    } = filterControls;
    
    // Fetch dependencies (dropdown options)
    const { data: projects, isLoading: pLoading } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: partners, isLoading: paLoading } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: propertyTypes, isLoading: ptLoading } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: fsLoading } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: amLoading } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    
    // Memoize filters to prevent unnecessary query refetches
    const queryFilters = useMemo(() => ({
        status, type, query, minPrice, maxPrice, project, finishing, 
        installments, realEstateFinance, floor, compound, delivery, 
        amenities: amenitiesFilter, beds, baths
    }), [
        status, type, query, minPrice, maxPrice, project, finishing, 
        installments, realEstateFinance, floor, compound, delivery, 
        amenitiesFilter, beds, baths
    ]);

    // Fetch properties
    const { data: propertiesData, isLoading: propsLoading } = useQuery({
        queryKey: ['properties', page, queryFilters],
        queryFn: () => getPaginatedProperties({ 
            page: page, 
            limit: ITEMS_PER_PAGE, 
            filters: queryFilters,
            disablePagination: false,
        }),
        keepPreviousData: true,
    });
    
    const isLoadingDependencies = pLoading || paLoading || ptLoading || fsLoading || amLoading;
    const properties = propertiesData?.properties || [];
    const totalProperties = propertiesData?.total || 0;
    const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);

    const gridClasses = view === 'list' 
        ? 'grid-cols-1 gap-4' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8';

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <SEO title={`${t.nav.properties} | ONLY HELIO`} description={t_page.subtitle} />
            {isInquiryModalOpen && <PropertyInquiryModal onClose={() => setIsInquiryModalOpen(false)} />}
            
            {/* Toolbar Section */}
            <div className="bg-gray-100 border-b border-gray-200 py-4 sticky top-16 lg:top-20 z-40 shadow-sm">
                <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600 font-medium">
                        {t.propertiesPage.resultsFound.replace('{count}', String(totalProperties))}
                    </p>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                        <button
                            onClick={() => setView('grid')}
                            className={`p-2 rounded-md transition-all ${view === 'grid' ? 'bg-amber-500 text-white shadow' : 'text-gray-500 hover:bg-gray-100'}`}
                            aria-label="Grid View"
                            title={language === 'ar' ? 'عرض شبكي' : 'Grid View'}
                        >
                            <GridIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`p-2 rounded-md transition-all ${view === 'list' ? 'bg-amber-500 text-white shadow' : 'text-gray-500 hover:text-gray-100'}`}
                            aria-label="List View"
                             title={language === 'ar' ? 'عرض قائمة' : 'List View'}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white border-b border-gray-200 shadow-sm relative z-30">
                <div className="container mx-auto px-6 py-8">
                    <PropertyFilters
                        filters={filterControls as any}
                        projects={projects || []}
                        partners={partners || []}
                        propertyTypes={propertyTypes || []}
                        finishingStatuses={finishingStatuses || []}
                        amenities={amenities || []}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow relative flex flex-col">
                <div className="container mx-auto px-6 py-8 flex-grow">
                        {isLoadingDependencies || propsLoading ? (
                        <div className={`grid ${gridClasses}`}>
                            {Array.from({ length: 6 }).map((_, i) => view === 'list' ? <PropertyListItemSkeleton key={i} /> : <PropertyCardSkeleton key={i} />)}
                        </div>
                    ) : (
                        <>
                            {properties.length > 0 ? (
                                <div className={`grid ${gridClasses}`}>
                                    {properties.map(prop => (
                                        view === 'list' ? (
                                            <PropertyListItem key={prop.id} {...prop} />
                                        ) : (
                                            <PropertyCard key={prop.id} {...prop} />
                                        )
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <p className="text-xl text-gray-500 mb-6">{t_page.noResults}</p>
                                    <div className="text-center">
                                        <h3 className="font-bold text-lg">{t_page.cantFindTitle}</h3>
                                        <p className="text-sm text-gray-500 my-2">{t_page.cantFindSubtitle}</p>
                                        <button onClick={() => setIsInquiryModalOpen(true)} className="mt-2 text-amber-500 font-semibold hover:underline">
                                            {t_page.leaveRequestButton}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="mt-12">
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertiesPage;
