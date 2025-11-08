

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language, PortfolioItem } from '../types';
import { translations } from '../data/translations';
import BannerDisplay from './shared/BannerDisplay';
import SEO from './shared/SEO';
import { useApiQuery } from './shared/useApiQuery';
import { getAllPortfolioItems } from '../api/portfolio';
import { getDecorationCategories } from '../api/decorations';
import { useLanguage } from './shared/LanguageContext';

const DecorationsPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].decorationsPage;
    const t_decor_modal = translations[language].decorationRequestModal;
    const t_custom_decor_modal = translations[language].customDecorationRequestModal;
    const navigate = useNavigate();

    const { data: allWorks, isLoading: isLoadingWorks } = useApiQuery('allPortfolioItems', getAllPortfolioItems);
    const { data: decorationCategories, isLoading: isLoadingCats } = useApiQuery('decorationCategories', getDecorationCategories);
    const isLoading = isLoadingWorks || isLoadingCats;

    const tabs = useMemo(() => (decorationCategories || []).map(cat => ({
        key: cat.id,
        name: cat.name[language],
        desc: cat.description[language]
    })), [decorationCategories, language]);
    
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        if (tabs.length > 0 && !activeTab) {
            setActiveTab(tabs[0].name);
        }
    }, [tabs, activeTab]);

    const filteredWorks = useMemo(() => {
        if (!activeTab || !allWorks) return [];
        return allWorks.filter(work => work.category[language] === activeTab);
    }, [allWorks, activeTab, language]);

    const openRequestPage = (work: PortfolioItem) => {
        const serviceTitle = `${t_decor_modal.reference} ${work.title[language]}`;
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: 'admin-user',
                workItem: work,
                serviceType: 'decorations'
            }
        });
    };
    
    const openCustomRequestPage = () => {
        const serviceTitle = `${t_custom_decor_modal.serviceTitle}: ${activeTab}`;
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: 'admin-user',
                categoryName: activeTab,
                isCustom: true,
                serviceType: 'decorations'
            }
        });
    };
    
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <SEO 
                title={`${translations[language].nav.decorations} | ONLY HELIO`}
                description={t.heroSubtitle}
            />
            
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1600&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{t.heroSubtitle}</p>
                </div>
            </section>

            <div className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap -mb-px space-x-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`px-6 py-3 font-semibold text-xl border-b-4 transition-colors duration-200 ${
                                        activeTab === tab.name
                                        ? 'border-amber-500 text-amber-500'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center max-w-4xl mx-auto mb-12 animate-fadeIn">
                         <p className="text-lg text-gray-600 dark:text-gray-400">
                            {tabs.find(tab => tab.name === activeTab)?.desc}
                        </p>
                        <button
                            onClick={openCustomRequestPage}
                            className="mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                        >
                            {t.requestCustomDesign}
                        </button>
                    </div>

                     {/* AI Estimator CTA */}
                    <section className="py-16 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                        <div className="container mx-auto px-6 text-center">
                            <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{translations[language].aiEstimator.ctaTitle}</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">{translations[language].aiEstimator.ctaSubtitle}</p>
                            <Link
                                to="/cost-estimator"
                                className="mt-6 inline-block bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20 transform hover:scale-105"
                            >
                                {translations[language].aiEstimator.ctaButton}
                            </Link>
                        </div>
                    </section>

                    <BannerDisplay location="decorations" />
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fadeIn mt-12">
                       {isLoading && !activeTab ? (
                           Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg aspect-[4/5] animate-pulse"></div>
                           ))
                       ) : filteredWorks.map((work, index) => (
                           <div key={`${work.imageUrl}-${index}`} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="relative">
                                    <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-700">
                                         <img src={work.imageUrl} alt={work.alt} className="w-full h-full object-cover" />
                                    </div>
                                    {work.availability && (
                                        <span className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} text-xs font-bold px-2 py-1 rounded-full text-white ${work.availability === 'In Stock' ? 'bg-green-600' : 'bg-sky-600'}`}>
                                            {work.availability === 'In Stock' ? t.inStock : t.madeToOrder}
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-2">{work.title[language]}</h3>
                                    <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap gap-2">
                                        {work.price != null && <span className="font-semibold text-amber-500 text-base">{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(work.price)}</span>}
                                        {work.dimensions && <span className="text-xs">{t.dimensions}: {work.dimensions}</span>}
                                    </div>
                                    <button 
                                        onClick={() => openRequestPage(work)}
                                        className="w-full mt-auto bg-amber-500 text-gray-900 font-bold px-4 py-3 rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        {t.inquireNow}
                                    </button>
                                </div>
                            </div>
                       ))}
                   </div>

                   { !isLoading && filteredWorks.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'لا توجد أعمال في هذا القسم حاليًا.' : 'No works in this section currently.'}
                            </p>
                        </div>
                   )}

                </div>
            </div>
        </div>
    );
};

export default DecorationsPage;