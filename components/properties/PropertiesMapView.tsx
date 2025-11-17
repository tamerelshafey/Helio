import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Language, Property } from '../../types';
import PropertyCard from './PropertyCard';
import PropertyCardSkeleton from '../shared/PropertyCardSkeleton';
import { LocationMarkerIcon } from '../ui/Icons';
import { useQuery } from '@tanstack/react-query';
import { getContent } from '../../services/content';
import { useLanguage } from '../shared/LanguageContext';

interface PropertiesMapViewProps {
    properties: Property[];
    loading: boolean;
    activePropertyId: string | null;
    setActivePropertyId: (id: string | null) => void;
}

const MapTooltip: React.FC<{ property: Property, language: Language }> = ({ property, language }) => {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img src={property.imageUrl} alt={property.title[language]} className="w-full h-32 object-cover" />
            <div className="p-3">
                <h3 className="font-bold text-sm truncate text-gray-900 dark:text-white">{property.title[language]}</h3>
                <p className="text-amber-500 font-semibold text-sm">{property.price[language]}</p>
            </div>
        </div>
    );
};

// Fixed geographical boundaries for the static map image
const MAP_BOUNDS = {
    maxLat: 30.17,
    minLat: 30.09,
    minLng: 31.58,
    maxLng: 31.68,
};

const PropertiesMapView: React.FC<PropertiesMapViewProps> = ({ properties, loading, activePropertyId, setActivePropertyId }) => {
    const { language, t } = useLanguage();
    const listRef = useRef<HTMLDivElement>(null);
    const { data: siteContent, isLoading: isLoadingContent } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    
    // Function to convert geo-coords to pixel coords based on fixed bounds
    const convertToPixel = useCallback((lat: number, lng: number) => {
        const latRange = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
        const lngRange = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;

        const x = ((lng - MAP_BOUNDS.minLng) / lngRange) * 100;
        const y = ((MAP_BOUNDS.maxLat - lat) / latRange) * 100;

        return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
    }, []);

    const markers = useMemo(() => {
        return properties.map(p => ({
            id: p.id,
            ...convertToPixel(p.location.lat, p.location.lng),
        }));
    }, [properties, convertToPixel]);
    
    const scrollToListing = useCallback((id: string | null) => {
        if (id && listRef.current) {
            const element = listRef.current.querySelector(`[data-property-id="${id}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, []);

    // Scroll list to active property
    useEffect(() => {
        scrollToListing(activePropertyId);
    }, [activePropertyId, scrollToListing]);
    
    const handleMarkerClick = (id: string) => {
        setActivePropertyId(id);
        scrollToListing(id);
    };

    const activeProperty = useMemo(() => {
        return properties.find(p => p.id === activePropertyId);
    }, [activePropertyId, properties]);

    return (
        <div className="flex flex-col md:flex-row h-full">
            {/* Property List */}
            <div ref={listRef} className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 h-1/2 md:h-full overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                ) : properties.length > 0 ? (
                    properties.map(prop => (
                        <div 
                            key={prop.id}
                            data-property-id={prop.id}
                            onMouseEnter={() => setActivePropertyId(prop.id)}
                            onMouseLeave={() => setActivePropertyId(null)}
                            className={`rounded-lg transition-all duration-300 ${activePropertyId === prop.id ? 'shadow-2xl ring-2 ring-amber-500' : ''}`}
                        >
                           <PropertyCard {...prop} />
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                        {t.propertiesPage.noResults}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="flex-1 h-1/2 md:h-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                 {isLoadingContent ? (
                    <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
                 ) : (
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${siteContent?.locationPickerMapUrl}')` }}
                        title={language === 'ar' ? 'خريطة مدينة هليوبوليس الجديدة وما حولها' : 'Map of New Heliopolis and surrounding areas'}
                    ></div>
                 )}
                <div className="relative w-full h-full">
                    {markers.map(marker => (
                        <button
                            key={marker.id}
                            className="absolute transform -translate-x-1/2 -translate-y-full focus:outline-none z-10"
                            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                            onClick={() => handleMarkerClick(marker.id)}
                            onMouseEnter={() => setActivePropertyId(marker.id)}
                            onMouseLeave={() => setActivePropertyId(null)}
                            aria-label={`Property ${marker.id}`}
                        >
                            <LocationMarkerIcon className={`w-10 h-10 drop-shadow-lg transition-all duration-200 ${
                                activePropertyId === marker.id 
                                ? 'text-amber-500 scale-150' 
                                : 'text-red-600 dark:text-red-500 hover:text-amber-400'
                            }`}/>
                        </button>
                    ))}
                    {activeProperty && (
                        <div
                            className="absolute transform -translate-x-1/2 -translate-y-[calc(100%+20px)] transition-opacity z-20 pointer-events-none"
                            style={{
                                left: `${convertToPixel(activeProperty.location.lat, activeProperty.location.lng).x}%`,
                                top: `${convertToPixel(activeProperty.location.lat, activeProperty.location.lng).y}%`,
                            }}
                        >
                            <MapTooltip property={activeProperty} language={language} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertiesMapView;