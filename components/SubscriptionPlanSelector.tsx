import React, { useState, useEffect, useCallback } from 'react';
import type { Language, SubscriptionPlan, PlanCategory, SubscriptionPlanDetails } from '../types';
import { translations } from '../data/translations';
import { CheckCircleIcon } from './icons/Icons';
import { getPlans } from '../mockApi/plans';
import { useApiQuery } from './shared/useApiQuery';

interface SubscriptionPlanSelectorProps {
    language: Language;
    selectedPlan: string;
    onSelectPlan: (plan: SubscriptionPlan) => void;
    partnerType: PlanCategory;
}

const SubscriptionPlanSelector: React.FC<SubscriptionPlanSelectorProps> = ({ language, selectedPlan, onSelectPlan, partnerType }) => {
    const t = translations[language].subscriptionPlans;
    const { data: allPlans, isLoading: loading } = useApiQuery('plans', getPlans);

    if (loading || !allPlans || !allPlans[partnerType]) {
        return <div className="text-center p-8">Loading plans...</div>;
    }
    
    const plansForType = allPlans[partnerType];

    return (
        <div>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">{t.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(Object.keys(plansForType) as SubscriptionPlan[]).map(planKey => {
                    const plan = plansForType[planKey][language];
                    const isSelected = selectedPlan === planKey;

                    return (
                        <div 
                            key={planKey}
                            onClick={() => onSelectPlan(planKey)}
                            className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 h-full flex flex-col ${
                                isSelected 
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 shadow-xl' 
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
                            }`}
                        >
                            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{plan.name}</h3>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white my-4">{plan.price}</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">{plan.description}</p>
                            
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span className={`text-gray-700 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                className={`w-full font-bold py-3 rounded-lg mt-auto transition-colors ${
                                    isSelected 
                                    ? 'bg-amber-500 text-gray-900' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-amber-500 hover:text-gray-900'
                                }`}
                            >
                                {t.selectButton}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionPlanSelector;