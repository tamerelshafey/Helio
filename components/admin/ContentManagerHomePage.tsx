



import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllBanners } from '../../services/banners';
import { getContent } from '../../services/content';
import { PhotoIcon, QuoteIcon, CogIcon, ClipboardDocumentListIcon, WrenchScrewdriverIcon } from '../ui/Icons';
import StatCard from '../shared/StatCard';
import { useLanguage } from '../shared/LanguageContext';

const ContentManagerHomePage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_home = t.adminDashboard.home;
    const t_nav = t.adminDashboard.nav;
    const t_content = t.adminDashboard.contentManagerHome;
    const { data: banners, isLoading: loadingBanners } = useQuery({ queryKey: ['banners'], queryFn: getAllBanners });
    const { data: siteContent, isLoading: loadingContent } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });

    const isLoading = loadingBanners || loadingContent;

    const activeBannersCount = (banners || []).filter(b => b.status === 'active').length;
    const totalQuotesCount = (siteContent?.quotes || []).length;

    if (isLoading) return <div>Loading content dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_content.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_content.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title={t_home.activeBanners}
                    value={activeBannersCount}
                    icon={PhotoIcon}
                    linkTo="/admin/banners"
                />
                 <StatCard 
                    title={t_home.totalQuotes}
                    value={totalQuotesCount}
                    icon={QuoteIcon}
                    linkTo="/admin/content"
                />
            </div>
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t_content.quickLinks}</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                     <Link to="/admin/banners" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <PhotoIcon className="w-5 h-5" /> {t_nav.banners}
                    </Link>
                     <Link to="/admin/content" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-5 h-5" /> {t_nav.siteContent}
                    </Link>
                     <Link to="/admin/filters" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <CogIcon className="w-5 h-5" /> {t_nav.propertyFilters}
                    </Link>
                     <Link to="/admin/finishing-services" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <WrenchScrewdriverIcon className="w-5 h-5" /> {t_nav.finishingServices}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContentManagerHomePage;