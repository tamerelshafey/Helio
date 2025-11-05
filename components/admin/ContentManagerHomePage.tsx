import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../types';
import { useApiQuery } from '../shared/useApiQuery';
import { getAllBanners } from '../../api/banners';
import { getContent } from '../../api/content';
import { PhotoIcon, QuoteIcon, CogIcon, ClipboardDocumentListIcon } from '../icons/Icons';
import StatCard from '../shared/StatCard';
import { translations } from '../../data/translations';

const ContentManagerHomePage: React.FC<{ language: Language }> = ({ language }) => {
    const { data: banners, isLoading: loadingBanners } = useApiQuery('banners', getAllBanners);
    const { data: siteContent, isLoading: loadingContent } = useApiQuery('siteContent', getContent);

    const isLoading = loadingBanners || loadingContent;

    const activeBannersCount = (banners || []).filter(b => b.status === 'active').length;
    const totalQuotesCount = (siteContent?.quotes || []).length;

    if (isLoading) return <div>Loading content dashboard...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Content Management Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Overview of website content and banners.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Active Banners"
                    value={activeBannersCount}
                    icon={PhotoIcon}
                    linkTo="/admin/banners"
                />
                 <StatCard 
                    title="Total Wisdom Quotes"
                    value={totalQuotesCount}
                    icon={QuoteIcon}
                    linkTo="/admin/content" // Link to content management page
                />
            </div>
            <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Quick Links</h3>
                <div className="flex flex-wrap gap-4">
                     <Link to="/admin/banners" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <PhotoIcon className="w-5 h-5" /> {translations[language].adminDashboard.nav.manageBanners}
                    </Link>
                     <Link to="/admin/content" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-5 h-5" /> {translations[language].adminDashboard.nav.contentManagement}
                    </Link>
                     <Link to="/admin/filters" className="text-amber-600 hover:underline font-semibold flex items-center gap-2">
                        <CogIcon className="w-5 h-5" /> {translations[language].adminDashboard.nav.manageFilters}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContentManagerHomePage;
