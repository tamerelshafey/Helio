

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Language } from '../../types';
import { LocationMarkerIcon, CloseIcon } from '../ui/Icons';
import { useQuery } from '@tanstack/react-query';
// FIX: Corrected import path for content API.
import { getContent } from '../../services/content';
import { useLanguage } from './LanguageContext';

interface LocationPickerModalProps {
    onClose: () => void;
    onLocationSelect: (location: { lat: number, lng: number }) => void;
    initialLocation?: { lat: number, lng: number };
}

// Estimated geographical boundaries for the map image
const MAP_BOUNDS = {
    maxLat: 30.17,
    minLat: 30.09,
    minLng: 31.58,
    maxLng: 31.68,
};

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({ onClose, onLocationSelect, initialLocation }) => {
    const { language } = useLanguage();
    const defaultCenter = { lat: 30.139407, lng: 31.678342 }; // Center of New Heliopolis
    const [pin, setPin] = useState<{ lat: number, lng: number } | null>(initialLocation || defaultCenter);
    const modalRef = useRef<HTMLDivElement>(null);
    const { data: siteContent, isLoading: isLoadingContent } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        const lngRange = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;
        const latRange = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;

        const lng = MAP_BOUNDS.minLng + (xPercent / 100) * lngRange;
        const lat = MAP_BOUNDS.maxLat - (yPercent / 100) * latRange;

        setPin({ lat, lng });
    };

    const handleConfirm = () => {
        if (pin) {
            onLocationSelect(pin);
        }
    };

    const pinPosition = useMemo(() => {
        if (!pin) return { top: '50%', left: '50%' };

        const latRange = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
        const lngRange = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;

        const yPercent = ((MAP_BOUNDS.maxLat - pin.lat) / latRange) * 100;
        const xPercent = ((pin.lng - MAP_BOUNDS.minLng) / lngRange) * 100;

        return { top: `${yPercent}%`, left: `${xPercent}%` };
    }, [pin]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="location-picker-title">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 id="location-picker-title" className="text-xl font-bold text-gray-900">
                        {language === 'ar' ? 'حدد الموقع على الخريطة' : 'Select Location on Map'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label={language === 'ar' ? 'إغلاق' : 'Close'}>
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow relative bg-gray-200" onClick={handleMapClick}>
                     {isLoadingContent ? (
                        <div className="w-full h-full bg-gray-300 animate-pulse flex items-center justify-center">
                            <p className="text-gray-500">Loading map...</p>
                        </div>
                    ) : siteContent?.locationPickerMapUrl ? (
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('${siteContent.locationPickerMapUrl}')` }}
                            title={language === 'ar' ? 'خريطة مدينة هليوبوليس الجديدة وما حولها' : 'Map of New Heliopolis and surrounding areas'}
                        ></div>
                    ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <p className="text-red-500">Map image not configured.</p>
                        </div>
                    )}
                    {pin && (
                        <div className="absolute transform -translate-x-1/2 -translate-y-full" style={pinPosition}>
                            <LocationMarkerIcon className="w-10 h-10 text-red-600 drop-shadow-lg" />
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm font-mono text-gray-700">
                        {pin ? `Lat: ${pin.lat.toFixed(6)}, Lng: ${pin.lng.toFixed(6)}` : (language === 'ar' ? 'انقر على الخريطة لتحديد موقع' : 'Click on the map to set a location')}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                        <button onClick={handleConfirm} disabled={!pin} className="px-6 py-2 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600 transition-colors disabled:opacity-50">
                            {language === 'ar' ? 'تأكيد الموقع' : 'Confirm Location'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;