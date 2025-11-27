
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '../ui/Icons';
import { useDebounce } from '../../hooks/useDebounce';

type SortDirection = 'ascending' | 'descending';

export type SortConfig<T> = {
    key: string;
    direction: SortDirection;
} | null;

const getNestedValue = (obj: Record<string, any>, path: string): any => {
    if (!path) return obj;
    return path.split('.').reduce((o: any, i) => (o ? o[i] : undefined), obj);
};

export function useAdminTable<T extends Record<string, any>>({
    data = [],
    itemsPerPage = 10,
    initialSort,
    initialFilters = {},
    searchFn,
    filterFns,
}: {
    data: T[] | undefined;
    itemsPerPage?: number;
    initialSort: SortConfig<T>;
    initialFilters?: Record<string, string>;
    searchFn: (item: T, searchTerm: string) => boolean;
    filterFns: Record<string, (item: T, value: string) => boolean>;
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

    // Update filters if initialFilters change (e.g. navigation between dashboard links)
    useEffect(() => {
        if (Object.keys(initialFilters).length > 0) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters]);

    const setFilter = useCallback((key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset page when filters change
    }, []);

    const processedData = useMemo(() => {
        if (!data) return [];
        let items = [...data];

        if (debouncedSearchTerm.trim()) {
            const lowercasedTerm = debouncedSearchTerm.trim().toLowerCase();
            items = items.filter((item) => searchFn(item, lowercasedTerm));
        }

        for (const key in filters) {
            if (Object.prototype.hasOwnProperty.call(filters, key)) {
                const value = filters[key];
                if (value && value !== 'all' && filterFns[key]) {
                    items = items.filter((item) => filterFns[key](item, value));
                }
            }
        }

        if (sortConfig) {
            items.sort((a, b) => {
                const aValue = getNestedValue(a, sortConfig.key);
                const bValue = getNestedValue(b, sortConfig.key);
                const dir = sortConfig.direction === 'ascending' ? 1 : -1;

                // Rule 1: Handle null, undefined, or empty values. They go to the end.
                const aIsNull = aValue == null || aValue === '';
                const bIsNull = bValue == null || bValue === '';
                if (aIsNull && bIsNull) return 0;
                if (aIsNull) return 1; // a is null, b is not, so a goes after b
                if (bIsNull) return -1; // b is null, a is not, so b goes after a

                // Rule 2: If both are numbers, compare numerically.
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return (aValue - bValue) * dir;
                }
                
                // Rule 3: If both are booleans, compare them.
                if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                    if (aValue === bValue) return 0;
                    return (aValue ? -1 : 1) * dir;
                }

                // Rule 4: Coerce to string for all other types (string, date, etc.)
                // This is safe because we've handled null/undefined.
                const stringA = aValue.toString();
                const stringB = bValue.toString();

                return stringA.localeCompare(stringB) * dir;
            });
        }
        return items;
    }, [data, debouncedSearchTerm, filters, sortConfig, searchFn, filterFns]);

    useEffect(() => {
        // Reset to page 1 if filters or search reduce total pages
        const newTotalPages = Math.ceil(processedData.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (currentPage === 0 && newTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [processedData.length, itemsPerPage, currentPage]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedData.slice(start, start + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const requestSort = useCallback(
        (key: string) => {
            let direction: SortDirection = 'ascending';
            if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            setSortConfig({ key, direction });
        },
        [sortConfig],
    );

    const getSortIcon = useCallback(
        (key: string) => {
            if (!sortConfig || sortConfig.key !== key) {
                return (
                    <span className="w-4 h-4 ml-1 inline-block opacity-0 group-hover:opacity-50">
                        <ArrowUpIcon />
                    </span>
                );
            }
            return sortConfig.direction === 'ascending' ? (
                <ArrowUpIcon className="w-4 h-4 ml-1 inline-block" />
            ) : (
                <ArrowDownIcon className="w-4 h-4 ml-1 inline-block" />
            );
        },
        [sortConfig]
    );

    return {
        paginatedItems,
        totalPages,
        currentPage,
        setCurrentPage,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
        requestSort,
        getSortIcon,
    };
}
