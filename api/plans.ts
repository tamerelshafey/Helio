
import { translations } from '../data/translations';
import type { SubscriptionPlan, SubscriptionPlanDetails, PlanCategory } from '../types';

const SIMULATED_DELAY = 300;

export const getPlans = (): Promise<Record<PlanCategory, Record<SubscriptionPlan, { ar: SubscriptionPlanDetails, en: SubscriptionPlanDetails }>>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        // Fully robust implementation using optional chaining to prevent any crashes from missing translation data.
        const arPlans = translations?.ar?.subscriptionPlans;
        const enPlans = translations?.en?.subscriptionPlans;
      
        const structuredData = {
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
        };

      resolve(structuredData as any);
    }, SIMULATED_DELAY);
  });
};


export const updatePlan = (planType: PlanCategory, planKey: SubscriptionPlan, updates: { ar: Partial<SubscriptionPlanDetails>, en: Partial<SubscriptionPlanDetails> }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const arPlans = ((translations.ar as any).subscriptionPlans as any)[planType];
            const enPlans = ((translations.en as any).subscriptionPlans as any)[planType];

            if (arPlans && arPlans[planKey] && enPlans && enPlans[planKey]) {
                if(updates.ar.price) arPlans[planKey].price = updates.ar.price;
                if(updates.ar.description) arPlans[planKey].description = updates.ar.description;
                if(updates.ar.features) arPlans[planKey].features = updates.ar.features;
                if(updates.ar.commissionRate !== undefined) arPlans[planKey].commissionRate = updates.ar.commissionRate;

                if(updates.en.price) enPlans[planKey].price = updates.en.price;
                if(updates.en.description) enPlans[planKey].description = updates.en.description;
                if(updates.en.features) enPlans[planKey].features = updates.en.features;
                if(updates.en.commissionRate !== undefined) enPlans[planKey].commissionRate = updates.en.commissionRate;
                
                resolve(true);
            } else {
                console.error(`Plan not found for type: ${planType}, key: ${planKey}`);
                resolve(false);
            }
        }, SIMULATED_DELAY);
    });
};