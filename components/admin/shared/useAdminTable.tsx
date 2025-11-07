import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '../../icons/Icons';

type SortDirection = 'ascending' | 'descending';

export interface SortConfig<T> {
    key: keyof T | string;
    direction: SortDirection;
}

const getNestedValue = (obj: any, path: string): any => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);

export function useAdminTable<T>({
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
    const [filters, setFilters] = useState<Record<string, string>>({});

    const setFilter = useCallback((key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const processedData = useMemo(() => {
        if (!data) return [];
        let items = [...data];

        if (searchTerm.trim()) {
            items = items.filter(item => searchFn(item, searchTerm));
        }
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all' && filterFns[key]) {
                items = items.filter(item => filterFns[key](item, value));
            }
        });
        
        if (sortConfig) {
            items.sort((a, b) => {
                // FIX: Safely cast sortConfig.key to string to handle all possible key types (string, number, symbol).
                const aValue = getNestedValue(a, String(sortConfig.key));
                const bValue = getNestedValue(b, String(sortConfig.key));

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [data, searchTerm, filters, sortConfig, searchFn, filterFns]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

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

    return {
        currentPage, setCurrentPage,
        searchTerm, setSearchTerm,
        filters, setFilter,
        requestSort, getSortIcon,
        paginatedItems,
        totalPages,
    };
}