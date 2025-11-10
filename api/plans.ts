

import type { SubscriptionPlan, SubscriptionPlanDetails, PlanCategory } from '../types';

const SIMULATED_DELAY = 300;

// In-memory cache to simulate a database for plans which are part of translations
let plansCache: Record<PlanCategory, Record<SubscriptionPlan, { ar: SubscriptionPlanDetails, en: SubscriptionPlanDetails }>> | null = null;

const fetchAndCachePlans = async () => {
    try {
        const [arResponse, enResponse] = await Promise.all([
            fetch('/locales/ar.json'),
            fetch('/locales/en.json')
        ]);
        if (!arResponse.ok || !enResponse.ok) {
            throw new Error('Failed to fetch translation files for plans');
        }
        const arTranslations = await arResponse.json();
        const enTranslations = await enResponse.json();

        const arPlans = arTranslations.subscriptionPlans;
        const enPlans = enTranslations.subscriptionPlans;
      
        plansCache = {
            developer: {
                basic: { ar: arPlans?.developer?.basic, en: enPlans?.developer?.basic },
                professional: { ar: arPlans?.developer?.professional, en: enPlans?.developer?.professional },
                elite: { ar: arPlans?.developer?.elite, en: enPlans?.developer?.elite },
            },
            agency: {
                 basic: { ar: arPlans?.agency?.basic, en: enPlans?.agency?.basic },
                professional: { ar: arPlans?.agency?.professional, en: enPlans?.agency?.professional },
                elite: { ar: arPlans?.agency?.elite, en: enPlans?.agency?.elite },
            },
            finishing: {
                commission: { ar: arPlans?.finishing?.commission, en: enPlans?.finishing?.commission },
                professional: { ar: arPlans?.finishing?.professional, en: enPlans?.finishing?.professional },
                elite: { ar: arPlans?.finishing?.elite, en: enPlans?.finishing?.elite },
            },
            individual: {
                paid_listing: { ar: arPlans?.individual?.paid_listing, en: enPlans?.individual?.paid_listing },
                commission: { ar: arPlans?.individual?.commission, en: enPlans?.individual?.commission },
            }
        } as any; // Cast to avoid deep type checking for this mock
        return plansCache;

    } catch (error) {
        console.error("Failed to fetch and cache plans:", error);
        return null;
    }
};


export const getPlans = async (): Promise<Record<PlanCategory, any>> => {
    if (!plansCache) {
        await fetchAndCachePlans();
    }
    return new Promise((resolve) => {
        // Return a deep copy to prevent direct mutation from outside
        setTimeout(() => resolve(JSON.parse(JSON.stringify(plansCache))), SIMULATED_DELAY);
    });
};


export const updatePlan = (planType: PlanCategory, planKey: SubscriptionPlan, updates: { ar: Partial<SubscriptionPlanDetails>, en: Partial<SubscriptionPlanDetails> }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!plansCache) {
                console.error("Cache not initialized for updating plan.");
                resolve(false);
                return;
            }

            const planToUpdate = (plansCache as any)[planType]?.[planKey];

            if (planToUpdate) {
                // Mutate the in-memory cache
                Object.assign(planToUpdate.ar, updates.ar);
                Object.assign(planToUpdate.en, updates.en);
                resolve(true);
            } else {
                console.error(`Plan not found for type: ${planType}, key: ${planKey}`);
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};
