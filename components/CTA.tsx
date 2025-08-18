import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface CTAProps {
  language: Language;
}

const CTA: React.FC<CTAProps> = ({ language }) => {
  const t = translations[language].cta;
  return (
    <section className="py-20 md:py-32 bg-gray-900">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
          {t.title}
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-8">
          {t.subtitle}
        </p>
        <Link to="/contact" className="bg-amber-500 text-gray-900 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20">
          {t.button}
        </Link>
      </div>
    </section>
  );
};

export default CTA;