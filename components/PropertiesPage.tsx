import React, { useMemo, useState, useEffect, useRef } from 'react';
import PropertyCard from './shared/PropertyCard';
import type { Language, Project } from '../types';
import { translations } from '../data/translations';
import { ListIcon, GridIcon } from './icons/Icons';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import PropertyListItem from './shared/PropertyListItem';
import PropertyListItemSkeleton from './shared/PropertyListItemSkeleton';
import { isListingActive } from '../utils/propertyUtils';
import BannerDisplay from './shared/BannerDisplay';
import PropertyInquiryModal from './shared/PropertyInquiryModal';
import { usePropertyFilters } from './shared/usePropertyFilters';
import { useDataContext } from './shared/DataContext';
import SEO from './shared/SEO';
import PropertyFilters from './PropertyFilters';

interface PropertiesPageProps {
  language: Language;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ language }) => {
    const t = translations[language].propertiesPage;
    
    const filters = usePropertyFilters();

    const { 
        allProperties: properties, 
        allProjects: projects, 
        allPartners: partners, 
        propertyTypes, 
        finishingStatuses, 
        amenities, 
        isLoading 
    } = useDataContext();
    
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

    const [announcement, setAnnouncement] = useState('');
    const isInitialMount = useRef(true);

    const activeProperties = useMemo(() => (properties || []).filter(isListingActive), [properties]);
    
    const projectsMap = useMemo(() => {
        if (!projects) return new Map<string, Project>();
        return new Map(projects.map(p => [p.id, p]));
    }, [projects]);
    
    useEffect(() => {
        if (filters.type === 'Land' && filters.finishing !== 'all') {
            filters.setFilter('finishing', 'all');
        }
    }, [filters.type, filters.finishing, filters.setFilter]);

    const filteredProperties = useMemo(() => {
        if (!activeProperties) return [];
        return activeProperties.filter(p => {
            const statusMatch = filters.status === 'all' || p.status.en === filters.status;
            const typeMatch = filters.type === 'all' || p.type.en === filters.type;
            const projectMatch = filters.project === 'all' || p.projectId === filters.project;
            
            const queryMatch = !filters.query || 
              p.title.ar.toLowerCase().includes(filters.query.toLowerCase()) ||
              p.title.en.toLowerCase().includes(filters.query.toLowerCase()) ||
              p.address.ar.toLowerCase().includes(filters.query.toLowerCase()) ||
              p.address.en.toLowerCase().includes(filters.query.toLowerCase()) ||
              p.partnerName?.toLowerCase().includes(filters.query.toLowerCase());

            const minPrice = parseInt(filters.minPrice, 10);
            const maxPrice = parseInt(filters.maxPrice, 10);
            const priceMatch = (!minPrice || p.priceNumeric >= minPrice) && (!maxPrice || p.priceNumeric <= maxPrice);

            const finishingMatch = filters.finishing === 'all' || p.finishingStatus?.en === filters.finishing;

            const installmentsMatch = filters.installments === 'all' ||
                (filters.installments === 'yes' && p.installmentsAvailable) ||
                (filters.installments === 'no' && !p.installmentsAvailable);
            
            const realEstateFinanceMatch = filters.realEstateFinance === 'all' ||
                (filters.realEstateFinance === 'yes' && p.realEstateFinanceAvailable) ||
                (filters.realEstateFinance === 'no' && !p.realEstateFinanceAvailable);

            const floorMatch = !filters.floor || (p.floor !== undefined && p.floor === parseInt(filters.floor, 10));

            const compoundMatch = filters.compound === 'all' || 
                (filters.compound === 'yes' && p.isInCompound) ||
                (filters.compound === 'no' && !p.isInCompound);

            const deliveryMatch = filters.delivery === 'all' ||
                (filters.delivery === 'immediate' && p.delivery?.isImmediate);
            
            const amenitiesMatch = filters.amenities.length === 0 || filters.amenities.every(amenity => p.amenities.en.includes(amenity));

            const bedsMatch = !filters.beds || p.beds >= parseInt(filters.beds, 10);
            const bathsMatch = !filters.baths || p.baths >= parseInt(filters.baths, 10);

            return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && installmentsMatch && realEstateFinanceMatch && floorMatch && compoundMatch && deliveryMatch && amenitiesMatch && projectMatch && bedsMatch && bathsMatch;
        });
    }, [activeProperties, filters]);
    
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            if (!isLoading) {
                setAnnouncement(t.resultsFound.replace('{count}', filteredProperties.length.toString()));
            }
        }
    }, [filteredProperties.length, isLoading, t.resultsFound]);

    return (
        <div className="bg-white dark:bg-gray-900">
             <div className="sr-only" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
            <SEO 
                title={`${translations[language].nav.properties} | ONLY HELIO`}
                description={t.subtitle}
            />
            {isRequestModalOpen && <PropertyInquiryModal onClose={() => setIsRequestModalOpen(false)} language={language} />}
          <div className="container mx-auto px-6 pt-20">
            {isLoading ? <div className="animate-pulse h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg"></div> : (
              <PropertyFilters 
                language={language}
                filters={filters}
                projects={projects || []}
                partners={partners || []}
                propertyTypes={propertyTypes || []}
                finishingStatuses={finishingStatuses || []}
                amenities={amenities || []}
              />
            )}
            <BannerDisplay location="properties" language={language} />
          </div>

          <div className="pb-8">
            <div className="container mx-auto px-6">
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
                    </div>
                </div>
            {isLoading ? (
                 view === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)}
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {Array.from({ length: 6 }).map((_, index) => <PropertyListItemSkeleton key={index} />)}
                    </div>
                )
            ) : filteredProperties.length > 0 ? (
                view === 'grid' ? (
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
                     <div className="space-y-4 max-w-4xl mx-auto">
                        {filteredProperties.map((prop) => {
                            const project = prop.projectId ? projectsMap.get(prop.projectId) : undefined;
                            return <PropertyListItem key={prop.id} {...prop} language={language} project={project} />;
                        })}
                    </div>
                )
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
          </div>
        </div>
    );
};

export default PropertiesPage;