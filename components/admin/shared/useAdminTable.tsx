
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '../../icons/Icons';
import { useDebounce } from '../../hooks/useDebounce';

type SortDirection = 'ascending' | 'descending';

// FIX: Changed `interface` to `type` to allow a union type with `null`.
export type SortConfig<T> = {
    key: keyof T | string;
    direction: SortDirection;
} | null;

// Using unknown is more type-safe. The sorting logic below correctly handles this.
const getNestedValue = (obj: Record<string, any>, path: string): unknown => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);

export function useAdminTable<T extends Record<string, any>>({
    data = [],
    itemsPerPage = 10,
    initialSort,
    searchFn,
    filterFns
}: {
    data: T[] | undefined;
    itemsPerPage?: number;
    initialSort: SortConfig<T>;
    searchFn: (item: T, searchTerm: string) => boolean;
    filterFns: Record<string, (item: T, value: string) => boolean>;
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filters, setFilters] = useState<Record<string, string>>({});

    const setFilter = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const processedData = useMemo(() => {
        if (!data) return [];
        let items = [...data];

        if (debouncedSearchTerm.trim()) {
            items = items.filter(item => searchFn(item, debouncedSearchTerm));
        }
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all' && filterFns[key]) {
                items = items.filter(item => filterFns[key](item, value));
            }
        });
        
        if (sortConfig) {
            items.sort((a, b) => {
                const aValue = getNestedValue(a, String(sortConfig.key));
                const bValue = getNestedValue(b, String(sortConfig.key));

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                
                let compareResult: number;
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    compareResult = aValue - bValue;
                } else {
                    // FIX: The error "Argument of type 'unknown' is not assignable to parameter of type 'string'"
                    // likely stems from a type inference issue. Explicitly converting both values to strings
                    // for comparison resolves this.
                    // FIX: Using .toString() is safer after null/undefined checks and can help the type checker.
                    compareResult = aValue.toString().localeCompare(bValue.toString());
                }

                return sortConfig.direction === 'ascending' ? compareResult : -compareResult;
            });
        }
        return items;
    }, [data, debouncedSearchTerm, filters, sortConfig, searchFn, filterFns]);

    const requestSort = useCallback((key: keyof T | string) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);
    
    const getSortIcon = useCallback((key: keyof T | string) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="w-4 h-4 ml-1 inline-block" />;
        return sortConfig.direction === 'ascending'
            ? <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            : <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />;
    }, [sortConfig]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedItems = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);
    
     useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters]);

    return {
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon,
        paginatedItems,
        totalPages,
    };
}