import { translations } from '../data/translations';
import type { SubscriptionPlan, SubscriptionPlanDetails, PlanCategory } from '../types';

const SIMULATED_DELAY = 300;

export const getPlans = (): Promise<Record<PlanCategory, Record<SubscriptionPlan, { ar: SubscriptionPlanDetails, en: SubscriptionPlanDetails }>>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        const plansData = {
            developer: {
                ar: translations.ar.subscriptionPlans.developer,
                en: translations.en.subscriptionPlans.developer,
            },
            agency: {
                ar: translations.ar.subscriptionPlans.agency,
                en: translations.en.subscriptionPlans.agency,
            },
            finishing: {
                ar: translations.ar.subscriptionPlans.finishing,
                en: translations.en.subscriptionPlans.finishing,
            },
            individual: {
                ar: translations.ar.subscriptionPlans.individual,
                en: translations.en.subscriptionPlans.individual,
            }
        };
      
        const structuredData = {
            developer: {
                basic: { ar: plansData.developer.ar.basic, en: plansData.developer.en.basic },
                professional: { ar: plansData.developer.ar.professional, en: plansData.developer.en.professional },
                elite: { ar: plansData.developer.ar.elite, en: plansData.developer.en.elite },
            },
            agency: {
                basic: { ar: plansData.agency.ar.basic, en: plansData.agency.en.basic },
                professional: { ar: plansData.agency.ar.professional, en: plansData.agency.en.professional },
                elite: { ar: plansData.agency.ar.elite, en: plansData.agency.en.elite },
            },
            finishing: {
                commission: { ar: plansData.finishing.ar.commission, en: plansData.finishing.en.commission },
                professional: { ar: plansData.finishing.ar.professional, en: plansData.finishing.en.professional },
                elite: { ar: plansData.finishing.ar.elite, en: plansData.finishing.en.elite },
            },
            individual: {
                paid_listing: { ar: plansData.individual.ar.paid_listing, en: plansData.individual.en.paid_listing },
                commission: { ar: plansData.individual.ar.commission, en: plansData.individual.en.commission },
            }
        };

      resolve(structuredData as any);
    }, SIMULATED_DELAY);
  });
};


export const updatePlan = (planType: PlanCategory, planKey: SubscriptionPlan, updates: { ar: Partial<SubscriptionPlanDetails>, en: Partial<SubscriptionPlanDetails> }): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const arPlans = (translations.ar.subscriptionPlans as any)[planType];
            const enPlans = (translations.en.subscriptionPlans as any)[planType];

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