import React, { useMemo, useEffect, useState, useCallback } from 'react';
import type { Language, SubscriptionPlan, SubscriptionPlanDetails } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { CheckCircleIcon } from '../icons/Icons';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { useSubscriptionUsage } from '../shared/useSubscriptionUsage';

const PlanCard: React.FC<{
    planKey: SubscriptionPlan,
    plan: SubscriptionPlanDetails,
    isCurrent: boolean,
    isUpgradeOption: boolean,
    language: Language
}> = ({ planKey, plan, isCurrent, isUpgradeOption, language }) => {
    const t = translations[language].dashboardSubscription;

    const handleUpgrade = () => {
        alert('Upgrade functionality is coming soon!');
    };

    return (
        <div className={`border-2 rounded-lg p-6 h-full flex flex-col ${
            isCurrent 
            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20' 
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
        }`}>
             {isCurrent && <div className="text-center mb-4 text-sm font-bold text-amber-600 dark:text-amber-400">{t.yourCurrentPlan}</div>}
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

            {isUpgradeOption && (
                 <button
                    onClick={handleUpgrade}
                    className="w-full font-bold py-3 rounded-lg mt-auto bg-amber-500 text-gray-900 hover:bg-amber-600 transition-colors"
                >
                    {translations[language].dashboard.upgradePlan}
                </button>
            )}
        </div>
    );
};

const DashboardSubscriptionPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboardSubscription;
    const { currentUser } = useAuth();
    
    const usageType = useMemo(() => {
        if (!currentUser || !('type' in currentUser)) return 'properties';
        switch(currentUser.type) {
            case 'finishing': return 'portfolio';
            case 'agency': return 'properties';
            case 'developer': return 'units';
            default: return 'properties';
        }
    }, [currentUser]);

    const { usageCount, limit: currentLimit, isLoading } = useSubscriptionUsage(usageType);

    const usageLabel = useMemo(() => {
        if (!currentUser || !('type' in currentUser)) return '';
        const t_home = translations[language].dashboardHome;
        switch (currentUser.type) {
            case 'finishing': return t_home.totalPortfolio;
            case 'agency': return t.propertiesListed;
            case 'developer': return t_home.totalUnits;
            default: return t.propertiesListed;
        }
    }, [currentUser, language, t.propertiesListed]);

    // FIX: Add type guard to ensure currentUser is a Partner before accessing partner-specific properties.
    if (!currentUser || isLoading || !('type' in currentUser)) {
        return <div>Loading...</div>;
    }

    const planCategory = currentUser.type as 'developer' | 'agency' | 'finishing';
    if (!['developer', 'agency', 'finishing'].includes(planCategory)) {
        return <div>Subscription management is not available for your account type.</div>;
    }
    
    const plansForCurrentUserType = translations[language].subscriptionPlans[planCategory];
    const currentPlanKey = currentUser.subscriptionPlan;
    const currentPlanDetails = plansForCurrentUserType[currentPlanKey as keyof typeof plansForCurrentUserType];
    
    const usagePercentage = currentLimit === Infinity ? 0 : (usageCount / currentLimit) * 100;
    
    const planOrder: SubscriptionPlan[] = useMemo(() => {
        if (currentUser.type === 'finishing') {
            return ['commission', 'professional', 'elite'];
        }
        return ['basic', 'professional', 'elite'];
    }, [currentUser.type]);

    const upgradeOptions = planOrder.filter(p => planOrder.indexOf(p) > planOrder.indexOf(currentPlanKey));

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.subtitle}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.currentPlanTitle}</h2>
                     {currentPlanDetails ? (
                        <PlanCard
                            planKey={currentPlanKey}
                            plan={currentPlanDetails}
                            isCurrent={true}
                            isUpgradeOption={false}
                            language={language}
                        />
                    ) : (
                        <div className="border-2 border-red-500 bg-red-50/50 dark:bg-red-900/20 p-6 rounded-lg text-center">
                            <p className="font-bold text-red-700 dark:text-red-300">Plan Error</p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                {language === 'ar' ? 'تفاصيل الباقة الحالية غير متوفرة أو غير متوافقة.' : 'Current plan details are unavailable or inconsistent.'}
                            </p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.usageTitle}</h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{usageLabel}</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {usageCount} {currentLimit !== Infinity && `/ ${currentLimit}`}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                            <div 
                                className="bg-amber-500 h-4 rounded-full transition-all duration-500" 
                                style={{width: `${usagePercentage > 100 ? 100 : usagePercentage}%`}}>
                            </div>
                        </div>
                    </div>
                    
                    {upgradeOptions.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">{t.upgradeOptionsTitle}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upgradeOptions.map(planKey => (
                                    <PlanCard
                                        key={planKey}
                                        planKey={planKey}
                                        plan={plansForCurrentUserType[planKey as keyof typeof plansForCurrentUserType]}
                                        isCurrent={false}
                                        isUpgradeOption={true}
                                        language={language}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DashboardSubscriptionPage;
