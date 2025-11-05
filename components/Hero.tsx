import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { SearchIcon } from './icons/Icons';
import { useApiQuery } from './shared/useApiQuery';
import { getContent } from '../api/content';

interface HeroProps {
  language: Language;
}

const heroImages = [
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593696140826-c58b02198d47?q=80&w=2070&auto=format&fit=crop",
];

const Hero: React.FC<HeroProps> = ({ language }) => {
  const { data: siteContent, isLoading } = useApiQuery('siteContent', getContent);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearTimeout(timer);
  }, [currentImageIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/properties?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/properties');
    }
  };


  return (
    <section className="relative h-[85vh] flex items-center justify-center text-center text-white">
      {heroImages.map((src, index) => (
        <div
          key={src}
          className={`slider-image bg-cover bg-center ${index === currentImageIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url('${src}')` }}
          aria-hidden={index !== currentImageIndex}
        />
      ))}
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="relative z-20 px-4 container mx-auto flex flex-col items-center">
        {isLoading || !siteContent ? (
            <div className="animate-pulse w-full max-w-4xl">
                <div className="h-10 md:h-16 bg-gray-400/30 rounded-md w-3/4 mx-auto mb-4"></div>
                <div className="h-6 md:h-8 bg-gray-400/30 rounded-md w-full max-w-3xl mx-auto mb-10"></div>
            </div>
        ) : (
            <>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow">
                    {siteContent.hero[language].title}
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mb-10 text-shadow">
                    {siteContent.hero[language].subtitle}
                </p>
            </>
        )}
        
        <form onSubmit={handleSearch} className="w-full max-w-2xl bg-white/20 backdrop-blur-md p-3 rounded-xl border border-white/30 shadow-lg">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث عن عقارات...' : 'Search for properties...'}
              className="w-full bg-transparent border-none text-white text-lg placeholder-gray-300 focus:ring-0"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            <button
              type="submit"
              className="bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg text-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <SearchIcon className="w-6 h-6" />
              <span>{language === 'ar' ? 'بحث' : 'Search'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;