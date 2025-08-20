import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from './icons/Icons';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface HeroProps {
  language: Language;
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const navigate = useNavigate();
  const t = translations[language].hero;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    params.set('status', activeTab === 'buy' ? 'For Sale' : 'For Rent');
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (propertyType !== 'all') {
      params.set('type', propertyType);
    }
    if (priceRange !== 'all') {
      params.set('price', priceRange);
    }

    navigate(`/properties?${params.toString()}`);
  };

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
        
        <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg shadow-2xl border border-gray-700">
          <div className="flex border-b border-gray-600 mb-4">
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'buy' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}
            >
              {t.buy}
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-6 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'rent' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}
            >
              {t.rent}
            </button>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center" onSubmit={handleSearch}>
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="all">{t.propertyType}</option>
                <option value="Apartment">{t.apartment}</option>
                <option value="Villa">{t.villa}</option>
                <option value="Commercial">{t.commercial}</option>
                <option value="Land">{t.land}</option>
              </select>
              <select 
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">{t.price}</option>
                <option value="low">{t.priceRange1}</option>
                <option value="medium">{t.priceRange2}</option>
                <option value="high">{t.priceRange3}</option>
              </select>
            </div>
            <button type="submit" className="w-full md:w-auto bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 flex items-center justify-center gap-2">
              <SearchIcon className="h-5 w-5" />
              <span>{t.search}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;