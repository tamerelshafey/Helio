import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Language, Property } from '../types';
import { translations } from '../data/translations';
import PropertyCard from './FeatureSection';
import PropertyCardSkeleton from './shared/PropertyCardSkeleton';
import { LocationMarkerIcon } from './icons/Icons';

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

const PropertiesMapView: React.FC<PropertiesMapViewProps> = ({ properties, loading, language, activePropertyId, setActivePropertyId }) => {
    const listRef = useRef<HTMLDivElement>(null);
    
    // 1. Define Map Boundaries from data
    const mapBounds = useMemo(() => {
        if (properties.length === 0) {
            return { minLat: 30.11, maxLat: 30.14, minLng: 31.59, maxLng: 31.64 }; // Default bounds for New Heliopolis
        }
        const lats = properties.map(p => p.location.lat);
        const lngs = properties.map(p => p.location.lng);
        return {
            minLat: Math.min(...lats),
            maxLat: Math.max(...lats),
            minLng: Math.min(...lngs),
            maxLng: Math.max(...lngs),
        };
    }, [properties]);

    // 2. Function to convert geo-coords to pixel coords
    const convertToPixel = useCallback((lat: number, lng: number) => {
        const latRange = mapBounds.maxLat - mapBounds.minLat;
        const lngRange = mapBounds.maxLng - mapBounds.minLng;
        
        // Add some padding to prevent markers from being on the edge
        const paddedLatRange = latRange === 0 ? 0.01 : latRange * 1.2;
        const paddedLngRange = lngRange === 0 ? 0.01 : lngRange * 1.2;
        const latOffset = (paddedLatRange - latRange) / 2;
        const lngOffset = (paddedLngRange - lngRange) / 2;

        const x = ((lng - (mapBounds.minLng - lngOffset)) / paddedLngRange) * 100;
        const y = (((mapBounds.maxLat + latOffset) - lat) / paddedLatRange) * 100;

        return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
    }, [mapBounds]);

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
        <div className="flex flex-col md:flex-row h-[calc(100vh-280px)] border-t border-gray-200 dark:border-gray-700">
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
                <div className="absolute inset-0 bg-repeat bg-center opacity-40 dark:opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
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