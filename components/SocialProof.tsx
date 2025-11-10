import React from 'react';
import { useLanguage } from './shared/LanguageContext';

const stats = [
    { value: '150+', name: { en: 'Properties Listed', ar: 'عقار معروض' } },
    { value: '50+', name: { en: 'Happy Clients', ar: 'عميل سعيد' } },
    { value: '10+', name: { en: 'Years of Experience', ar: 'سنوات من الخبرة' } },
    { value: '20+', name: { en: 'Partner Companies', ar: 'شركة شريكة' } },
];

const SocialProof: React.FC = () => {
    const { language } = useLanguage();
    return (
        <section className="bg-gray-50 dark:bg-gray-800 py-20">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((stat) => (
                        <div key={stat.name.en}>
                            <p className="text-4xl md:text-5xl font-bold text-amber-500">{stat.value}</p>
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{stat.name[language]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
