import { useMemo, useCallback } from 'react';
import type { PartnerType, SubscriptionPlan, Property, Project, PortfolioItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { useApiQuery } from './useApiQuery';
import { getAllProperties } from '../../api/properties';
import { getAllProjects } from '../../api/projects';
import { getAllPortfolioItems } from '../../api/portfolio';

type UsageType = 'properties' | 'projects' | 'units' | 'portfolio';

export const useSubscriptionUsage = (usageType: UsageType) => {
    const { currentUser } = useAuth();
    
    const { data: allProperties, isLoading: isLoadingProperties, refetch: refetchProperties } = useApiQuery('allProperties', getAllProperties, { enabled: !!currentUser });
    const { data: allProjects, isLoading: isLoadingProjects, refetch: refetchProjects } = useApiQuery('allProjects', getAllProjects, { enabled: !!currentUser });
    const { data: allPortfolioItems, isLoading: isLoadingPortfolio, refetch: refetchPortfolio } = useApiQuery('allPortfolioItems', getAllPortfolioItems, { enabled: !!currentUser });

    const isLoading = isLoadingProperties || isLoadingProjects || isLoadingPortfolio;

    const refetchAll = useCallback(() => {
        refetchProperties();
        refetchProjects();
        refetchPortfolio();
    }, [refetchProperties, refetchProjects, refetchPortfolio]);

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