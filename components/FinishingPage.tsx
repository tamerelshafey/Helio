import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language, PortfolioItem } from '../types';
import { translations } from '../data/translations';
import BannerDisplay from './shared/BannerDisplay';
import { useDataContext } from './shared/DataContext';
import AIEstimator from './ai/AIEstimator';
import SEO from './shared/SEO';

interface FinishingPageProps {
  language: Language;
}

const FinishingPage: React.FC<FinishingPageProps> = ({ language }) => {
    const t = translations[language].finishingPage;
    const navigate = useNavigate();
    const [isEstimatorOpen, setIsEstimatorOpen] = useState(false);

    const { allPortfolioItems: portfolio, allPartners: partners, siteContent, isLoading } = useDataContext();

    const handleRequestService = (serviceTitle: string) => {
        navigate('/request-service', { 
            state: { 
                serviceTitle, 
                partnerId: 'admin-user', // Internal team for finishing
                serviceType: 'finishing'
            } 
        });
    };
    
    const services = useMemo(() => {
        if (!siteContent?.finishingServices) return [];
        return siteContent.finishingServices;
    }, [siteContent]);


    const finishingPartners = (partners || []).filter(p => p.type === 'finishing');

    const uniquePartnerWorks = Array.from(
        new Map(
            (portfolio || [])
            .filter(item => finishingPartners.some(p => p.id === item.partnerId))
            .map(item => [item.partnerId, item])
        ).values()
    );
    
    if (isLoading) {
        return <div className="animate-pulse h-screen bg-gray-50 dark:bg-gray-800"></div>
    }

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <SEO 
                title={`${translations[language].nav.finishing} | ONLY HELIO`}
                description={t.heroSubtitle}
            />
            {isEstimatorOpen && <AIEstimator language={language} serviceType="finishing" onClose={() => setIsEstimatorOpen(false)} />}
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1600&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{t.heroSubtitle}</p>
                </div>
            </section>
            
            <BannerDisplay location="finishing" language={language} />

            {/* AI Estimator CTA */}
            <section className="py-16 bg-amber-50 dark:bg-amber-900/10">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-400">{translations[language].aiEstimator.ctaTitle}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-3 max-w-2xl mx-auto">{translations[language].aiEstimator.ctaSubtitle}</p>
                    <button
                        onClick={() => setIsEstimatorOpen(true)}
                        className="mt-6 bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20 transform hover:scale-105"
                    >
                        {translations[language].aiEstimator.ctaButton}
                    </button>
                </div>
            </section>
            
            {/* Services Packages Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">{t.servicesTitle}</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">{t.servicesIntro}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {services.map(service => (
                            <div key={service.title[language]} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col text-center">
                                <h3 className="text-2xl font-bold text-amber-500 mb-4">{service.title[language]}</h3>
                                <p className="text-gray-600 dark:text-gray-400 flex-grow mb-6">{service.description[language]}</p>
                                
                                {service.price && (
                                    <>
                                        <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                                            {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(service.price)}
                                        </p>
                                        <button
                                            onClick={() => handleRequestService(service.title[language])}
                                            className="w-full bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 mt-auto"
                                        >
                                            {t.requestButton}
                                        </button>
                                    </>
                                )}

                                {service.pricingTiers && (
                                    <div className="mt-auto space-y-3">
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">{language === 'ar' ? 'باقات التسعير' : 'Pricing Tiers'}</h4>
                                        <ul className="divide-y divide-gray-200 dark:divide-gray-600 text-left">
                                            {service.pricingTiers.map((tier, index) => (
                                                <li key={index} className="py-3 sm:flex items-center justify-between">
                                                    <div className="mb-2 sm:mb-0">
                                                        <p className="font-semibold text-gray-900 dark:text-white">{tier.unitType[language]} <span className="text-gray-500 dark:text-gray-400">({tier.areaRange[language]})</span></p>
                                                        <p className="text-amber-500 font-bold">{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(tier.price)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRequestService(`${service.title[language]} - ${tier.unitType[language]} (${tier.areaRange[language]})`)}
                                                        className="w-full sm:w-auto bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm"
                                                    >
                                                        {t.requestButton}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold">{t.galleryTitle}</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.gallerySubtitle}</p>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {uniquePartnerWorks.slice(0, 8).map((item: PortfolioItem) => {
                             const localizedPartner = (translations[language].partnerInfo as any)[item.partnerId];
                             if (!localizedPartner) return null;
                             return (
                                <Link to={`/partners/${item.partnerId}`} key={item.partnerId} className="group relative overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1 block">
                                    <img src={item.imageUrl} alt={item.alt} className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h3 className="text-white text-lg font-bold">{localizedPartner?.name}</h3>
                                        <p className="text-amber-400 text-sm">{language === 'ar' ? 'عرض الأعمال' : 'View Works'}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        {t.ctaTitle}
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400 mb-8">
                       {t.ctaSubtitle}
                    </p>
                    <Link to="/contact" className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20">
                        {t.ctaButton}
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default FinishingPage;