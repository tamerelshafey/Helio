import React from 'react';
import { BuildingIcon, CheckCircleIcon, PriceIcon, LocationMarkerIcon } from './icons/Icons';
import type { Language } from '../types';
import { translations } from '../data/translations';

interface IntegrationsProps {
  language: Language;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-transparent hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-1 h-full shadow-sm hover:shadow-lg">
        <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 p-4 rounded-full mb-6 inline-block">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);


const Integrations: React.FC<IntegrationsProps> = ({ language }) => {
    const t = translations[language].whyUs;
    
    const features = [
        {
            icon: <BuildingIcon className="w-8 h-8" />,
            title: t.feature1Title,
            description: t.feature1Desc
        },
        {
            icon: <PriceIcon className="w-8 h-8" />,
            title: t.feature2Title,
            description: t.feature2Desc
        },
        {
            icon: <CheckCircleIcon className="w-8 h-8" />,
            title: t.feature3Title,
            description: t.feature3Desc
        },
        {
            icon: <LocationMarkerIcon className="w-8 h-8" />,
            title: t.feature4Title,
            description: t.feature4Desc
        }
    ];

    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                       {t.title}
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
                       {t.description}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature) => (
                        <FeatureCard key={feature.title} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Integrations;