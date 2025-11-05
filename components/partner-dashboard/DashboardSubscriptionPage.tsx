import React, { useMemo } from 'react';
import type { Language, SubscriptionPlan, SubscriptionPlanDetails, PartnerType } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { CheckCircleIcon } from '../icons/Icons';
import { getPlanLimit } from '../../utils/subscriptionUtils';
import { useApiQuery } from '../shared/useApiQuery';
import { getPropertiesByPartnerId } from '../../api/properties';
import { getProjectsByPartnerId } from '../../api/projects';
import { getPortfolioByPartnerId } from '../../api/portfolio';

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

const UsageBar: React.FC<{ label: string; count: number; limit: number; }> = ({ label, count, limit }) => {
    const usagePercentage = limit === Infinity ? 0 : (count / limit) * 100;
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                    {count} {limit !== Infinity ? `/ ${limit}` : ''}
                </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div 
                    className="bg-amber-500 h-4 rounded-full transition-all duration-500" 
                    style={{width: `${usagePercentage > 100 ? 100 : usagePercentage}%`}}>
                </div>
            </div>
        </div>
    );
};

const DashboardSubscriptionPage: React.FC<{ language: Language }> = ({ language }) => {
    const t = translations[language].dashboardSubscription;
    const { currentUser } = useAuth();
    
    if (!currentUser || !('type' in currentUser)) {
        return <div className="text-center p-8">Loading...</div>;
    }
    
    const partnerType = currentUser.type as PartnerType;
    const planCategory = partnerType as 'developer' | 'agency' | 'finishing';

    const { data: projectsData, isLoading: isLoadingProjects } = useApiQuery(
        `projects-sub-${currentUser.id}`,
        () => getProjectsByPartnerId(currentUser.id),
        { enabled: partnerType === 'developer' }
    );
    const { data: propertiesData, isLoading: isLoadingProperties } = useApiQuery(
        `properties-sub-${currentUser.id}`,
        () => getPropertiesByPartnerId(currentUser.id),
        { enabled: partnerType === 'developer' || partnerType === 'agency' }
    );
    const { data: portfolioData, isLoading: isLoadingPortfolio } = useApiQuery(
        `portfolio-sub-${currentUser.id}`,
        () => getPortfolioByPartnerId(currentUser.id),
        { enabled: partnerType === 'finishing' }
    );

    const isLoading = useMemo(() => {
        if (partnerType === 'developer') return isLoadingProjects || isLoadingProperties;
        if (partnerType === 'agency') return isLoadingProperties;
        if (partnerType === 'finishing') return isLoadingPortfolio;
        return false;
    }, [partnerType, isLoadingProjects, isLoadingProperties, isLoadingPortfolio]);

    const renderUsage = () => {
        if (isLoading) {
            return <div className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>;
        }

        switch (partnerType) {
            case 'developer': {
                const projectCount = (projectsData || []).length;
                const projectLimit = getPlanLimit('developer', currentUser.subscriptionPlan, 'projects');
                const unitCount = (propertiesData || []).length;
                const unitLimit = getPlanLimit('developer', currentUser.subscriptionPlan, 'units');

                return (
                    <div className="space-y-6">
                        <UsageBar label={translations[language].dashboardHome.totalProjects} count={projectCount} limit={projectLimit} />
                        <UsageBar label={translations[language].dashboardHome.totalUnits} count={unitCount} limit={unitLimit} />
                    </div>
                );
            }
            case 'agency': {
                const propertyCount = (propertiesData || []).length;
                const propertyLimit = getPlanLimit('agency', currentUser.subscriptionPlan, 'properties');
                return <UsageBar label={t.propertiesListed} count={propertyCount} limit={propertyLimit} />;
            }
            case 'finishing': {
                const portfolioCount = (portfolioData || []).length;
                const portfolioLimit = getPlanLimit('finishing', currentUser.subscriptionPlan, 'portfolio');
                return <UsageBar label={translations[language].dashboardHome.totalPortfolio} count={portfolioCount} limit={portfolioLimit} />;
            }
            default:
                return null;
        }
    };
    
    if (!['developer', 'agency', 'finishing'].includes(planCategory)) {
        return <div>Subscription management is not available for your account type.</div>;
    }
    
    const plansForCurrentUserType = translations[language].subscriptionPlans[planCategory];
    const currentPlanKey = currentUser.subscriptionPlan;
    const currentPlanDetails = plansForCurrentUserType[currentPlanKey as keyof typeof plansForCurrentUserType];
    
    const planOrder: SubscriptionPlan[] = useMemo(() => {
        if (currentUser.type === 'finishing') return ['commission', 'professional', 'elite'];
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
                        {renderUsage()}
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