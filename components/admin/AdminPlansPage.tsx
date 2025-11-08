
import React, { useState } from 'react';
import type { SubscriptionPlan, SubscriptionPlanDetails, PlanCategory } from '../../types';
import { translations } from '../../data/translations';
import AdminPlanEditModal from './AdminPlanEditModal';
import { CheckCircleIcon } from '../icons/Icons';
import { getPlans } from '../../api/plans';
import { useApiQuery } from '../shared/useApiQuery';
import { useLanguage } from '../shared/LanguageContext';

const PlanCard: React.FC<{ 
    plan: SubscriptionPlanDetails, 
    onEdit: () => void,
    language: 'ar' | 'en'
}> = ({ plan, onEdit, language }) => {
    return (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{plan.name}</h3>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white my-4">{plan.price}</p>
            
            {plan.commissionRate !== undefined && plan.commissionRate > 0 && (
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 my-2">
                   {translations[language].adminDashboard.plans.commissionRate.replace('(%)', '')}: {plan.commissionRate}%
                </p>
            )}

            <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">{plan.description}</p>
            
            <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className={`text-gray-700 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onEdit}
                className="w-full font-bold py-2 rounded-lg mt-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-amber-500 hover:text-gray-900 transition-colors"
            >
                {translations[language].adminShared.edit}
            </button>
        </div>
    );
};


const AdminPlansPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].adminDashboard.plans;
    const { data: plans, isLoading: loading, refetch } = useApiQuery('plans', getPlans);
    
    const [activeTab, setActiveTab] = useState<PlanCategory>('developer');
    const [editingPlan, setEditingPlan] = useState<{ planType: PlanCategory, planKey: SubscriptionPlan } | null>(null);
    
    const tabs: { key: PlanCategory, name: string }[] = [
        { key: 'developer', name: t.planCategories.developer },
        { key: 'agency', name: t.planCategories.agency },
        { key: 'finishing', name: t.planCategories.finishing },
        { key: 'individual', name: t.planCategories.individual },
    ];

    const handleSave = () => {
        refetch();
        setEditingPlan(null);
    }

    return (
        <div>
             {editingPlan && (
                <AdminPlanEditModal 
                    planType={editingPlan.planType}
                    planKey={editingPlan.planKey}
                    onClose={() => setEditingPlan(null)}
                    onSave={handleSave}
                />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${
                                activeTab === tab.key
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>


            {loading || !plans || !plans[activeTab] ? (
                <p>Loading plans...</p>
            ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(Object.keys(plans[activeTab]) as SubscriptionPlan[]).map(planKey => (
                        <PlanCard 
                            key={planKey}
                            plan={(plans[activeTab] as any)[planKey][language]}
                            onEdit={() => setEditingPlan({ planType: activeTab, planKey })}
                            language={language}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPlansPage;
