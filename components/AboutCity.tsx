import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface AboutCityProps {
  language: Language;
}

const AboutCity: React.FC<AboutCityProps> = ({ language }) => {
    const t = translations[language].aboutCity;

    return (
        <section className="py-20 bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                           {t.title}
                        </h2>
                        <p className="text-gray-400 text-lg">
                           {t.description}
                        </p>
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time1Value}</p>
                                <p className="text-gray-400 text-sm">{t.time1Desc}</p>
                            </div>
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time2Value}</p>
                                <p className="text-gray-400 text-sm">{t.time2Desc}</p>
                            </div>
                             <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time3Value}</p>
                                <p className="text-gray-400 text-sm">{t.time3Desc}</p>
                            </div>
                             <div className="bg-gray-900 p-4 rounded-lg">
                                <p className="text-amber-500 text-2xl font-bold">{t.time4Value}</p>
                                <p className="text-gray-400 text-sm">{t.time4Desc}</p>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-6">
                        <img 
                            src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop"
                            alt={t.mapAlt}
                            className="rounded-2xl shadow-xl w-full h-auto object-cover border-4 border-gray-700"
                        />
                         <img 
                            src="https://images.unsplash.com/photo-1595995449553-15104a37b3f9?q=80&w=2070&auto=format&fit=crop"
                            alt={t.gateAlt}
                            className="rounded-2xl shadow-xl w-full h-auto object-cover border-4 border-gray-700"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutCity;