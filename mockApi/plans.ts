import { translations } from '../data/translations';
import type { PlanCategory, SubscriptionPlan, SubscriptionPlanDetails } from '../types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

type AllPlans = Record<PlanCategory, Record<SubscriptionPlan, { ar: SubscriptionPlanDetails, en: SubscriptionPlanDetails }>>;

export const getPlans = async (): Promise<AllPlans> => {
    await delay(100);
    return JSON.parse(JSON.stringify(translations.en.subscriptionPlans));
};

export const updatePlan = async (
    planType: PlanCategory, 
    planKey: SubscriptionPlan, 
    updates: { ar: Omit<SubscriptionPlanDetails, 'name'>, en: Omit<SubscriptionPlanDetails, 'name'> }
): Promise<boolean> => {
    await delay(300);
    try {
        const arPlan = (translations.ar.subscriptionPlans as any)[planType][planKey];
        const enPlan = (translations.en.subscriptionPlans as any)[planType][planKey];
        
        Object.assign(arPlan, updates.ar);
        Object.assign(enPlan, updates.en);
        
        return true;
    } catch (error) {
        console.error("Failed to update plan:", error);
        return false;
    }
};
