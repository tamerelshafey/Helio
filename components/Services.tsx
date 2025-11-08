
import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingIcon, DecorationIcon, FinishingIcon, SparklesIcon } from './icons/Icons';
import { useApiQuery } from './shared/useApiQuery';
import { getContent } from '../api/content';
import { useLanguage } from './shared/LanguageContext';

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
    BuildingIcon,
    FinishingIcon,
    DecorationIcon,
    SparklesIcon,
};

const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string; }> = ({ icon, title, description, link }) => (
    <Link to={link} className="block group h-full">
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-2xl p-8 h-full transform hover:-translate-y-2 transition-transform duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col items-start">
            <div className="flex-shrink-0 bg-amber-500/10 text-amber-500 p-4 rounded-full mb-6 inline-block group-hover:bg-amber-500/20 transition-colors">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-500 transition-colors">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">{description}</p>
        </div>
    </Link>
);


const Services: React.FC = () => {
    const { language } = useLanguage();
    const { data: siteContent, isLoading } = useApiQuery('siteContent', getContent);

    if (isLoading || !siteContent) {
        return <section className="py-20 bg-gray-50 dark:bg-gray-800 animate-pulse h-96"></section>;
    }

    const t = siteContent.services[language];
    
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-800 subtle-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                       {t.title}
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto">
                       {t.description}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {t.features.map((feature) => {
                        const IconComponent = iconMap[feature.icon] || BuildingIcon;
                        return <ServiceCard key={feature.title} {...feature} icon={<IconComponent className="w-8 h-8" />} />
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;