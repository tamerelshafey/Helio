import { useMemo } from 'react';
import type { PartnerType, SubscriptionPlan, Property, Project, PortfolioItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useApiQuery } from './useApiQuery';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { getPropertiesByPartnerId } from '../../api/properties';
import { getProjectsByPartnerId } from '../../api/projects';
import { getPortfolioByPartnerId } from '../../api/portfolio';

type UsageType = 'properties' | 'projects' | 'units' | 'portfolio';

// FIX: Update function signature to accept an optional 'options' object for conditional fetching.
export const useSubscriptionUsage = (usageType: UsageType, options?: { enabled?: boolean }) => {
    const { currentUser } = useAuth();
    const { enabled: optionEnabled = true } = options || {};

    const { data, isLoading, refetch } = useApiQuery(
        `${usageType}-${currentUser?.id}`,
        () => {
            if (!currentUser) return Promise.resolve([]);
            switch (usageType) {
                case 'properties':
                case 'units': // units are properties for a developer
                    return getPropertiesByPartnerId(currentUser.id);
                case 'projects':
                    return getProjectsByPartnerId(currentUser.id);
                case 'portfolio':
                    return getPortfolioByPartnerId(currentUser.id);
                default:
                    return Promise.resolve([]);
            }
        },
        { enabled: !!currentUser && optionEnabled }
    );

    const usageCount = useMemo(() => (data || []).length, [data]);

    const limit = useMemo(() => {
        // FIX: Add type guard to ensure currentUser is a Partner before accessing partner-specific properties.
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
        refetch
    };
};
