import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface PartnersProps {
    language: Language;
}

const PartnerLogo: React.FC<{ name: string }> = ({ name }) => (
    <div className="h-12 flex items-center justify-center text-gray-400 text-2xl font-semibold opacity-70 hover:opacity-100 hover:text-white transition-all duration-300">
        {name}
    </div>
);

const Partners: React.FC<PartnersProps> = ({ language }) => {
    const t = translations[language].partners;
    const partners = [t.partner1, t.partner2, t.partner3, t.partner4];

    return (
        <div className="py-20 bg-gray-900">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
                    {t.title}
                </h2>
                 <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10">
                    {t.description}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
                    {partners.map((name) => (
                        <PartnerLogo key={name} name={name} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Partners;