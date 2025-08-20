import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import FeatureSection from './FeatureSection';
import { propertiesData } from '../data/properties';
import type { Language } from '../App';
import { translations } from '../data/translations';
import { SearchIcon } from './icons/Icons';

const inputClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-400";
const selectClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white";

interface PropertiesPageProps {
  onAddPropertyClick: () => void;
  language: Language;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ onAddPropertyClick, language }) => {
    const t = translations[language].propertiesPage;
    const [searchParams, setSearchParams] = useSearchParams();

    const statusFilter = searchParams.get('status') || 'all';
    const typeFilter = searchParams.get('type') || 'all';
    const priceFilter = searchParams.get('price') || 'all';
    const queryFilter = searchParams.get('q') || '';

    const handleFilterChange = (filterName: string, value: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        if (value === 'all' || !value) {
            newParams.delete(filterName);
        } else {
            newParams.set(filterName, value);
        }
        setSearchParams(newParams, { replace: true });
    };

    const filteredProperties = useMemo(() => {
        return propertiesData.filter(p => {
            const statusMatch = statusFilter === 'all' || p.status.en === statusFilter;
            const typeMatch = typeFilter === 'all' || p.type.en === typeFilter;
            
            const priceMatch = priceFilter === 'all' || (
                (priceFilter === 'low' && p.priceNumeric < 1000000) ||
                (priceFilter === 'medium' && p.priceNumeric >= 1000000 && p.priceNumeric <= 3000000) ||
                (priceFilter === 'high' && p.priceNumeric > 3000000)
            );

            const queryMatch = !queryFilter || 
              p.title.ar.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.title.en.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.address.ar.toLowerCase().includes(queryFilter.toLowerCase()) ||
              p.address.en.toLowerCase().includes(queryFilter.toLowerCase());

            return statusMatch && typeMatch && priceMatch && queryMatch;
        });
    }, [statusFilter, typeFilter, priceFilter, queryFilter]);

    return (
        <div className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-right mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">{t.title}</h1>
                    <p className="text-lg text-gray-400 mt-4 max-w-2xl mx-auto sm:mx-0">{t.subtitle}</p>
                </div>
                <button 
                  onClick={onAddPropertyClick}
                  className="bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20 mt-6 sm:mt-0 flex-shrink-0"
                >
                  {translations[language].addProperty}
                </button>
            </div>
            
            <div className="mb-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={queryFilter} 
                            onChange={e => handleFilterChange('q', e.target.value)} 
                            placeholder={t.searchPlaceholder}
                            className={`${inputClasses} ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                        />
                         <SearchIcon className={`absolute top-1/2 -translate-y-1/2 ${language === 'ar' ? 'right-3' : 'left-3'} h-5 w-5 text-gray-400`} />
                    </div>
                    <select value={statusFilter} onChange={e => handleFilterChange('status', e.target.value)} className={selectClasses}>
                        <option value="all">{t.allStatuses}</option>
                        <option value="For Sale">{t.forSale}</option>
                        <option value="For Rent">{t.forRent}</option>
                    </select>
                    <select value={typeFilter} onChange={e => handleFilterChange('type', e.target.value)} className={selectClasses}>
                        <option value="all">{t.allTypes}</option>
                        <option value="Apartment">{t.apartment}</option>
                        <option value="Villa">{t.villa}</option>
                        <option value="Commercial">{t.commercial}</option>
                        <option value="Land">{t.land}</option>
                    </select>
                    <select value={priceFilter} onChange={e => handleFilterChange('price', e.target.value)} className={selectClasses}>
                        <option value="all">{t.allPrices}</option>
                        <option value="low">{t.priceRange1}</option>
                        <option value="medium">{t.priceRange2}</option>
                        <option value="high">{t.priceRange3}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((prop) => (
                    <FeatureSection key={prop.id} {...prop} language={language} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                    <p className="text-xl text-gray-400">{t.noResults}</p>

                </div>
              )}
            </div>
          </div>
        </div>
    );
};

export default PropertiesPage;