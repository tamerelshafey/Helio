import React from 'react';
import { BuildingIcon, DecorationIcon, FinishingIcon } from './icons/Icons';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface ServicesProps {
    language: Language;
}

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-100 mb-1">{title}</h3>
            <p className="text-gray-400">{description}</p>
        </div>
    </div>
);


const Services: React.FC<ServicesProps> = ({ language }) => {
    const t = translations[language].services;
    const features = [
        {
            icon: <BuildingIcon className="w-6 h-6" />,
            title: t.feature1Title,
            description: t.feature1Desc
        },
        {
            icon: <FinishingIcon className="w-6 h-6" />,
            title: t.feature2Title,
            description: t.feature2Desc
        },
        {
            icon: <DecorationIcon className="w-6 h-6" />,
            title: t.feature3Title,
            description: t.feature3Desc
        }
    ];

    return (
        <section className="py-20 bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                           {t.title}
                        </h2>
                        <p className="text-gray-400 text-lg">
                           {t.description}
                        </p>
                        <div className="space-y-6">
                            {features.map((feature) => (
                                <FeatureItem key={feature.title} {...feature} />
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center justify-center">
                        <img 
                            src="https://images.unsplash.com/photo-1600585152915-d208bec867a1?q=80&w=1972&auto=format&fit=crop"
                            alt="Modern architectural facade details" 
                            className="rounded-2xl shadow-xl w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;