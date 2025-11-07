

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Language, Property } from '../types';
import { translations } from '../data/translations';
import PropertyCard from './shared/PropertyCard';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import { LocationMarkerIcon } from './icons/Icons';
import { useApiQuery } from './shared/useApiQuery';
import { getContent } from '../api/content';

interface PropertiesMapViewProps {
    properties: Property[];
    loading: boolean;
    language: Language;
    activePropertyId: string | null;
    setActivePropertyId: (id: string | null) => void;
}

const MapTooltip: React.FC<{ property: Property, language: Language }> = ({ property, language }) => {
    return (
        <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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

const PropertiesMapView: React.FC<PropertiesMapViewProps> = ({ properties, loading, language, activePropertyId, setActivePropertyId }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const { data: siteContent, isLoading: isLoadingContent } = useApiQuery('siteContent', getContent);
    
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

    // Scroll list to active property
    useEffect(() => {
        if (activePropertyId && listRef.current) {
            const element = listRef.current.querySelector(`[data-property-id="${activePropertyId}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [activePropertyId]);

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
                           <PropertyCard {...prop} language={language} />
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                        {translations[language].propertiesPage.noResults}
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
                            onClick={() => setActivePropertyId(marker.id)}
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
                            className="absolute transform -translate-x-1/2 -translate-y-[calc(100%+20px)] transition-opacity z-20"
                            style={{
                                left: `${convertToPixel(activeProperty.location.lat, activeProperty.location.lng).x}%`,
                                top: `${convertToPixel(activeProperty.location.lat, activeProperty.location.lng).y}%`,
                            }}
                            onMouseEnter={() => setActivePropertyId(activeProperty.id)}
                            onMouseLeave={() => setActivePropertyId(null)}
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