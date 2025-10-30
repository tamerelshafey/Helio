import React from 'react';
import { Link } from 'react-router-dom';
import type { Language, PortfolioItem } from '../types';
import { translations } from '../data/translations';
import { useData } from './shared/DataContext';

interface FinishingPageProps {
  language: Language;
}

const FinishingPage: React.FC<FinishingPageProps> = ({ language }) => {
    const t = translations[language].finishingPage;
    const { portfolio, partners } = useData();

    const finishingPartners = partners.filter(p => p.type === 'finishing');

    const uniquePartnerWorks = Array.from(
        new Map(
            portfolio
            .filter(item => finishingPartners.some(p => p.id === item.partnerId))
            .map(item => [item.partnerId, item])
        ).values()
    );

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{t.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{t.heroSubtitle}</p>
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
                             const localizedPartner = translations[language].partners.finishing_companies.find(f => f.id === item.partnerId);
                             if (!localizedPartner) return null;
                             return (
                                <Link to={`/partners/${item.partnerId}`} key={item.partnerId} className="group relative overflow-hidden rounded-lg shadow-lg aspect-w-1 aspect-h-1 block">
                                    <img src={item.src} alt={item.alt} className="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-300" />
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