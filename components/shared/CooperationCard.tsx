
import React from 'react';
import type { Language, SubscriptionPlan, PlanCategory, SubscriptionPlanDetails } from '../../types';
import { CheckCircleIcon } from '../ui/Icons';
import { useLanguage } from './LanguageContext';
import { Card, CardContent } from '../ui/Card';

interface CooperationCardProps {
    type: 'paid_listing' | 'commission';
    isSelected: boolean;
    onSelect: () => void;
    plans?: Record<PlanCategory, any>;
    isLoadingPlans: boolean;
}

const CooperationCard: React.FC<CooperationCardProps> = ({ type, isSelected, onSelect, plans, isLoadingPlans }) => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const planDetails: SubscriptionPlanDetails | undefined = plans?.individual?.[type]?.[language];
    const defaultContent = t_page.cooperation[type];

    if (isLoadingPlans || !plans) {
        return <div className="border-2 rounded-lg p-6 h-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
    }
    
    return (
        <Card
            onClick={onSelect}
            className={`relative p-0 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col text-center
                ${isSelected ? 'border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 shadow-xl' : ''}`
            }
        >
            {isSelected && <CheckCircleIcon className="w-7 h-7 text-amber-500 absolute top-4 right-4" />}
            <CardContent className="p-6 flex flex-col h-full text-center">
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{planDetails?.name || defaultContent.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 my-4 flex-grow">{planDetails?.description || defaultContent.description}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white mb-4">{planDetails?.price || defaultContent.price}</p>
                
                {planDetails?.commissionRate && planDetails.commissionRate > 0 && (
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        {t.adminDashboard.plans.commissionRate.replace('(%)', '')}: {planDetails.commissionRate}%
                    </p>
                )}
                
                <ul className="space-y-2 mb-6 text-sm text-left">
                    {(planDetails?.features || defaultContent.benefits).map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className={`text-gray-600 dark:text-gray-300 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{benefit}</span>
                        </li>
                    ))}
                </ul>
                <button type="button" className={`w-full font-bold py-3 rounded-lg mt-auto transition-colors ${isSelected ? 'bg-amber-500 text-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    {t_page.cooperation.selectButton}
                </button>
            </CardContent>
        </Card>
    )
};

export default CooperationCard;