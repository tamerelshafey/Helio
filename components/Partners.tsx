import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../types';
import { translations } from '../data/translations';

interface PartnersProps {
    language: Language;
}

interface Partner {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 group h-full flex flex-col">
        <img src={partner.imageUrl} alt={partner.name} className="w-full h-48 object-cover" />
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-amber-500 mb-2 group-hover:text-amber-400 transition-colors">{partner.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">{partner.description}</p>
        </div>
    </div>
);

const Partners: React.FC<PartnersProps> = ({ language }) => {
    const t = translations[language].partners;

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t.title}
                    </h2>
                     <p className="max-w-3xl mx-auto text-lg text-gray-500 dark:text-gray-400 mb-12">
                        {t.description}
                    </p>
                </div>

                <div className="mb-16">
                    <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-8">{t.developers_title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {t.developers.map((partner) => (
                           <Link to={`/partners/${partner.id}`} key={partner.id} className="block h-full">
                                <PartnerCard partner={partner} />
                           </Link>
                        ))}
                    </div>
                </div>

                <div className="mb-16">
                    <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-8">{t.finishing_companies_title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {t.finishing_companies.map((partner) => (
                            <Link to={`/partners/${partner.id}`} key={partner.id} className="block h-full">
                                <PartnerCard partner={partner} />
                            </Link>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-8">{t.agencies_title}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {t.agencies.map((partner) => (
                            <Link to={`/partners/${partner.id}`} key={partner.id} className="block h-full">
                                <PartnerCard partner={partner} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Partners;