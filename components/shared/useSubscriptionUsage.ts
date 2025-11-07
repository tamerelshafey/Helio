import { useMemo } from 'react';
import type { PartnerType, SubscriptionPlan, Property, Project, PortfolioItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useDataContext } from './DataContext';
import { getPlanLimit } from '../../utils/subscriptionUtils';

type UsageType = 'properties' | 'projects' | 'units' | 'portfolio';

export const useSubscriptionUsage = (usageType: UsageType) => {
    const { currentUser } = useAuth();
    const { allProperties, allProjects, allPortfolioItems, isLoading, refetchAll } = useDataContext();

    const data = useMemo(() => {
        if (!currentUser || isLoading) return [];
        switch (usageType) {
            case 'properties':
            case 'units': // units are properties for a developer
                return (allProperties || []).filter(p => p.partnerId === currentUser.id);
            case 'projects':
                return (allProjects || []).filter(p => p.partnerId === currentUser.id);
            case 'portfolio':
                return (allPortfolioItems || []).filter(p => p.partnerId === currentUser.id);
            default:
                return [];
        }
    }, [allProperties, allProjects, allPortfolioItems, currentUser, usageType, isLoading]);

    const usageCount = useMemo(() => data.length, [data]);

    const limit = useMemo(() => {
        if (!currentUser || !('type' in currentUser)) return Infinity;
        return getPlanLimit(currentUser.type, currentUser.subscriptionPlan, usageType);
    }, [currentUser, usageType]);

    const isLimitReached = useMemo(() => {
        if (limit === Infinity) return false;
        return usageCount >= limit;
    }, [usageCount, limit]);

    return {
        data: data as (Property[] | Project[] | PortfolioItem[]),
        isLoading,
        usageCount,
        limit,
        isLimitReached,
        refetch: refetchAll,
    };
};
