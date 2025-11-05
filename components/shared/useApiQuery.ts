import { useState, useEffect, useCallback } from 'react';

// Simple in-memory cache
const cache = new Map<string, any>();

// Simple hook for on-demand data fetching with refetch capability and caching
export function useApiQuery<T>(
    queryKey: string, 
    queryFn: () => Promise<T>, 
    options?: { enabled?: boolean }
) {
    const { enabled = true } = options || {};
    const [data, setData] = useState<T | undefined>(cache.get(queryKey));
    const [isLoading, setIsLoading] = useState(enabled && !cache.has(queryKey));
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (isRefetch = false) => {
        if (!enabled) {
            setIsLoading(false);
            return;
        }

        if (cache.has(queryKey) && !isRefetch) {
            setData(cache.get(queryKey));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await queryFn();
            cache.set(queryKey, result);
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [queryKey, queryFn, enabled]);

    const refetch = useCallback(() => {
        cache.delete(queryKey);
        fetchData(true);
    }, [queryKey, fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refetch };
}
