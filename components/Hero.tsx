import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../types';
import { translations } from '../data/translations';

interface HeroProps {
  language: Language;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const t = translations[language].hero;

  return (
    <section className="relative h-[85vh] flex items-center justify-center text-center text-white bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop')" }}>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="relative z-20 px-4 container mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          {t.title}
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mb-10">
          {t.subtitle}
        </p>
        
        <Link 
            to="/properties" 
            className="bg-amber-500 text-gray-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-lg shadow-amber-500/20"
        >
            {t.browseProperties}
        </Link>
      </div>
    </section>
  );
};

export default Hero;