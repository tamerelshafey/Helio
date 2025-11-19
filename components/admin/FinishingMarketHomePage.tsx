
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnersForAdmin } from '../../services/partners';
import { UsersIcon, CheckCircleIcon, WrenchScrewdriverIcon } from '../ui/Icons';
import StatCard from '../shared/StatCard';
import { useLanguage } from '../shared/LanguageContext';

const FinishingMarketHomePage: React.FC = () => {
    const { language, t } = useLanguage();
    
    const { data: partners, isLoading } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });

    const stats = useMemo(() => {
        if (!partners) return null;

        const finishingPartners = partners.filter(p => p.type === 'finishing');
        
        return {
            total: finishingPartners.length,
            active: finishingPartners.filter(p => p.status === 'active').length,
            pending: finishingPartners.filter(p => p.status === 'pending').length,
            companies: finishingPartners.filter(p => p.subscriptionPlan !== 'commission').length,
            providers: finishingPartners.filter(p => p.subscriptionPlan === 'commission').length,
        };
    }, [partners]);

    if (isLoading || !stats) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? 'لوحة تحكم سوق التشطيبات' : 'Finishing Market Dashboard'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {language === 'ar' 
                        ? 'نظرة عامة على شركاء التشطيب والديكور وأدائهم.' 
                        : 'Overview of finishing partners, decor companies, and their performance.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title={language === 'ar' ? 'إجمالي الشركاء' : 'Total Partners'} 
                    value={stats.total} 
                    icon={UsersIcon} 
                    linkTo="/admin/partners/list?type=finishing" 
                />
                <StatCard 
                    title={language === 'ar' ? 'الشركات النشطة' : 'Active Companies'} 
                    value={stats.active} 
                    icon={CheckCircleIcon} 
                    linkTo="/admin/partners/list?type=finishing&status=active" 
                />
                 <StatCard 
                    title={language === 'ar' ? 'مقدمي الخدمات (أفراد)' : 'Service Providers'} 
                    value={stats.providers} 
                    icon={WrenchScrewdriverIcon} 
                    linkTo="/admin/partners/list?type=finishing" 
                />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'أحدث الشركاء المنضمين' : 'Recently Joined Partners'}
                    </h2>
                    <Link to="/admin/partners/list?type=finishing" className="text-amber-600 hover:underline text-sm font-semibold">
                        {t.viewAll}
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(partners || []).filter(p => p.type === 'finishing').slice(0, 6).map(partner => (
                         <Link key={partner.id} to={`/admin/partners/list?edit=${partner.id}&highlight=${partner.id}`} className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-amber-300 hover:shadow-md transition-all bg-gray-50 dark:bg-gray-700/30">
                            <img src={partner.imageUrl} alt={partner.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-gray-800 dark:text-white">{language === 'ar' ? partner.nameAr : partner.name}</p>
                                <p className="text-xs text-gray-500 uppercase">{partner.subscriptionPlan}</p>
                            </div>
                            <div className={`ml-auto px-2 py-1 rounded text-xs font-semibold ${partner.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {partner.status}
                            </div>
                         </Link>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default FinishingMarketHomePage;
