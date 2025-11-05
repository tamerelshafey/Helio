import React from 'react';
import type { Language, SubscriptionPlan, PlanCategory, SubscriptionPlanDetails } from '../../types';
import { translations } from '../../data/translations';
import { CheckCircleIcon } from '../icons/Icons';

interface CooperationCardProps {
    type: 'paid_listing' | 'commission';
    isSelected: boolean;
    onSelect: () => void;
    language: Language;
    plans?: Record<PlanCategory, any>;
    isLoadingPlans: boolean;
}

const CooperationCard: React.FC<CooperationCardProps> = ({ type, isSelected, onSelect, language, plans, isLoadingPlans }) => {
    const t = translations[language].addPropertyPage;
    const planDetails: SubscriptionPlanDetails | undefined = plans?.individual?.[type]?.[language];
    const defaultContent = t.cooperation[type];

    if (isLoadingPlans || !plans) {
        return <div className="border-2 rounded-lg p-6 h-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
    }
    
    return (
        <div 
            onClick={onSelect}
            className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col text-center
                ${isSelected ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 shadow-xl' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900'}`
            }
        >
            {isSelected && <CheckCircleIcon className="w-7 h-7 text-amber-500 absolute top-4 right-4" />}
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{planDetails?.name || defaultContent.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 my-4 flex-grow">{planDetails?.description || defaultContent.description}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white mb-4">{planDetails?.price || defaultContent.price}</p>
            
            {planDetails?.commissionRate && planDetails.commissionRate > 0 && (
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    {translations[language].adminDashboard.plans.commissionRate.replace('(%)', '')}: {planDetails.commissionRate}%
                </p>
            )}
            
            <ul className="space-y-2 mb-6 text-sm text-left">
                {(planDetails?.features || defaultContent.benefits).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{benefit}</span>
                    </li>
                ))}
            </ul>
            <button type="button" className={`w-full font-bold py-3 rounded-lg mt-auto transition-colors ${isSelected ? 'bg-amber-500 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {t.cooperation.selectButton}
            </button>
        </div>
    )
};

export default CooperationCard;