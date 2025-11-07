import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export const usePropertyFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters = useMemo(() => ({
        status: searchParams.get('status') || 'all',
        type: searchParams.get('type') || 'all',
        query: searchParams.get('q') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        project: searchParams.get('project') || 'all',
        finishing: searchParams.get('finishing') || 'all',
        installments: searchParams.get('installments') || 'all',
        realEstateFinance: searchParams.get('realEstateFinance') || 'all',
        floor: searchParams.get('floor') || '',
        compound: searchParams.get('compound') || 'all',
        delivery: searchParams.get('delivery') || 'all',
        amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
        beds: searchParams.get('beds') || '',
        baths: searchParams.get('baths') || '',
    }), [searchParams]);

    const setFilter = useCallback((filterName: string, value: string | string[]) => {
        const newParams = new URLSearchParams(searchParams.toString());
        
        if (Array.isArray(value)) {
             if (value.length > 0) {
                newParams.set(filterName, value.join(','));
            } else {
                newParams.delete(filterName);
            }
        } else {
            if (value === 'all' || !value) {
                newParams.delete(filterName);
            } else {
                newParams.set(filterName, value);
            }
        }
        setSearchParams(newParams, { replace: true });
    }, [searchParams, setSearchParams]);

    return { ...filters, setFilter };
};