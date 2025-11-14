
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../shared/SEO';
import { useLanguage } from '../shared/LanguageContext';
import { GridIcon, ListIcon, MapIcon } from '../ui/Icons';
import PropertyFilters from './PropertyFilters';
import PropertiesMapView from './PropertiesMapView';
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
    const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
    const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    const filters = usePropertyFilters();

    const { data: projects, isLoading: pLoading } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: partners, isLoading: paLoading } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: propertyTypes, isLoading: ptLoading } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: fsLoading } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: amLoading } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    
    const { data: propertiesData, isLoading: propsLoading } = useQuery({
        queryKey: ['properties', filters.page, filters],
        queryFn: () => getPaginatedProperties({ page: filters.page, limit: ITEMS_PER_PAGE, filters: filters as any }),
    });
    
    const isLoading = pLoading || paLoading || ptLoading || fsLoading || amLoading;
    const properties = propertiesData?.properties || [];
    const totalProperties = propertiesData?.total || 0;
    const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <SEO title={`${t.nav.properties} | ONLY HELIO`} description={t_page.subtitle} />
            {isInquiryModalOpen && <PropertyInquiryModal onClose={() => setIsInquiryModalOpen(false)} />}
            
            <div className={`container mx-auto px-6 ${view === 'map' ? 'py-0' : 'py-10 md:py-20'}`}>
                {view !== 'map' && (
                    <PropertyFilters
                        filters={filters as any}
                        projects={projects || []}
                        partners={partners || []}
                        propertyTypes={propertyTypes || []}
                        finishingStatuses={finishingStatuses || []}
                        amenities={amenities || []}
                    />
                )}
            </div>

            <div className={`${view === 'map' ? 'h-[calc(100vh-80px)]' : 'min-h-screen'}`}>
                 <div className={`container mx-auto px-6 ${view === 'map' ? 'max-w-full !px-0' : ''}`}>
                    {view !== 'map' && (
                        <div className="flex justify-between items-center mb-8">
                           <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t.propertiesPage.resultsFound.replace('{count}', String(totalProperties))}
                            </p>
                            <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
                                {(['grid', 'list', 'map'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={`p-2 rounded-md transition-colors ${view === v ? 'bg-white dark:bg-gray-700 text-amber-500 shadow' : 'text-gray-500 hover:text-amber-500'}`}
                                        aria-label={`${v} View`}
                                    >
                                        {v === 'grid' ? <GridIcon className="w-5 h-5" /> : v === 'list' ? <ListIcon className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isLoading || propsLoading ? (
                        <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid-cols-1 gap-4'}`}>
                            {Array.from({ length: 6 }).map((_, i) => view === 'grid' ? <PropertyCardSkeleton key={i} /> : <PropertyListItemSkeleton key={i} />)}
                        </div>
                    ) : view === 'map' ? (
                        <PropertiesMapView 
                            properties={properties} 
                            loading={propsLoading}
                            activePropertyId={activePropertyId}
                            setActivePropertyId={setActivePropertyId}
                        />
                    ) : (
                        <>
                            {properties.length > 0 ? (
                                <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'grid-cols-1 gap-4'}`}>
                                    {properties.map(prop => view === 'grid' ? <PropertyCard key={prop.id} {...prop} /> : <PropertyListItem key={prop.id} {...prop} />)}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">{t_page.noResults}</p>
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
                                <Pagination currentPage={filters.page} totalPages={totalPages} onPageChange={filters.setPage} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// FIX: Added default export to the component.
export default PropertiesPage;
