import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface PartnersProps {
    language: Language;
}

interface Partner {
    name: string;
    description: string;
    imageUrl: string;
}

const PartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 group">
        <img src={partner.imageUrl} alt={partner.name} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-bold text-amber-500 mb-2 group-hover:text-amber-400 transition-colors">{partner.name}</h3>
            <p className="text-gray-400 text-sm">{partner.description}</p>
        </div>
    </div>
);

const Partners: React.FC<PartnersProps> = ({ language }) => {
    const t = translations[language].partners;

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t.title}
                    </h2>
                     <p className="max-w-3xl mx-auto text-lg text-gray-400 mb-12">
                        {t.description}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {t.list.map((partner) => (
                        <PartnerCard key={partner.name} partner={partner} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Partners;