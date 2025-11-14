import React, { useState, useMemo } from 'react';
import type { Language, Project, AdminPartner, FilterOption } from '../../types';
import { SearchIcon, ArrowDownIcon, ChevronRightIcon, SparklesIcon } from '../ui/Icons';
import type { usePropertyFilters } from '../../hooks/usePropertyFilters';
import { useLanguage } from '../shared/LanguageContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../shared/ToastContext';

interface PropertyFiltersProps {
  filters: ReturnType<typeof usePropertyFilters>;
  projects: Project[];
  partners: AdminPartner[];
  propertyTypes: FilterOption[];
  finishingStatuses: FilterOption[];
  amenities: FilterOption[];
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  projects,
  partners,
  propertyTypes,
  finishingStatuses,
  amenities,
}) => {
    const { language, t: translations } = useLanguage();
    const t = translations.propertiesPage;
    const { propertyDetailsPage: t_details } = translations;
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { showToast } = useToast();
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const { 
        setFilter, 
        resetFilters,
        status: statusFilter, type: typeFilter, query: queryFilter, 
        minPrice: minPriceFilter, maxPrice: maxPriceFilter, project: projectFilter, 
        finishing: finishingFilter, installments: installmentsFilter, floor: floorFilter, 
        compound: compoundFilter, delivery: deliveryFilter, amenities: amenitiesFilter,
        beds: bedsFilter, baths: bathsFilter, realEstateFinance: realEstateFinanceFilter,
    } = filters;

    const isAnyFilterActive = useMemo(() => {
        return (
            statusFilter !== 'all' || typeFilter !== 'all' || queryFilter !== '' ||
            minPriceFilter !== '' || maxPriceFilter !== '' || projectFilter !== 'all' ||
            finishingFilter !== 'all' || installmentsFilter !== 'all' || realEstateFinanceFilter !== 'all' ||
            floorFilter !== '' || compoundFilter !== 'all' || deliveryFilter !== 'all' ||
            amenitiesFilter.length > 0 || bedsFilter !== '' || bathsFilter !== ''
        );
    }, [filters]);

    const megaProjects = useMemo(() => projects.filter(p => partners.find(partner => partner.id === p.partnerId)?.displayType === 'mega_project'), [projects, partners]);

    const handleAmenitiesChange = (amenityEn: string) => {
        const newAmenities = amenitiesFilter.includes(amenityEn)
            ? amenitiesFilter.filter(a => a !== amenityEn)
            : [...amenitiesFilter, amenityEn];
        setFilter('amenities', newAmenities);
    };
    
    const advancedFilterCount = [
        projectFilter !== 'all',
        installmentsFilter !== 'all',
        realEstateFinanceFilter !== 'all',
        compoundFilter !== 'all',
        deliveryFilter !== 'all',
        !!floorFilter,
        !!bedsFilter,
        !!bathsFilter,
        amenitiesFilter.length > 0
    ].filter(Boolean).length;

    const availableAmenities = useMemo(() => {
        if (typeFilter === 'all') return amenities;
        return amenities.filter(amenity => 
            !amenity.applicableTo || amenity.applicableTo.length === 0 || amenity.applicableTo.includes(typeFilter)
        );
    }, [amenities, typeFilter]);

    const availableFinishingStatuses = useMemo(() => {
        if (typeFilter === 'all' || typeFilter === '') return finishingStatuses.filter(status => status.applicableTo && !status.applicableTo.includes('Land'));
        if (typeFilter === 'Land') return [];
        return finishingStatuses.filter(status => 
            !status.applicableTo || status.applicableTo.length === 0 || status.applicableTo.includes(typeFilter)
        );
    }, [finishingStatuses, typeFilter]);

    const isForRent = statusFilter === 'For Rent';
    const isFinishingDisabled = typeFilter === 'Land' || availableFinishingStatuses.length === 0;

    const handleAiSearch = async () => {
        if (!queryFilter.trim()) return;
        setIsAiLoading(true);

        const filterSchema = {
            type: Type.OBJECT,
            properties: {
                type: { type: Type.STRING, enum: propertyTypes.map(p => p.en) },
                status: { type: Type.STRING, enum: ["For Sale", "For Rent"] },
                finishing: { type: Type.STRING, enum: finishingStatuses.map(f => f.en) },
                minPrice: { type: Type.NUMBER },
                maxPrice: { type: Type.NUMBER },
                beds: { type: Type.NUMBER },
                baths: { type: Type.NUMBER },
                area: { type: Type.NUMBER },
                compound: { type: Type.STRING, enum: ["yes", "no"] }
            },
        };

        const prompt = `You are an intelligent real estate search query parser for a website in Egypt. Your task is to analyze the user's search query and convert it into a structured JSON object based on the provided filter schema.
        User Query: "${queryFilter}"
        
        Instructions:
        - Analyze the query for property type, status (sale/rent), finishing level, price, number of bedrooms/bathrooms, and area.
        - Map Arabic/colloquial terms to the correct English enum values in the schema. For example: 'للبيع' -> 'For Sale', 'شقة' -> 'Apartment', 'تشطيب كامل' -> 'Fully Finished'.
        - For prices, parse numbers and currency symbols (EGP, جنيه, مليون). If a single price is mentioned, treat it as a maximum price.
        - If the user mentions "كمبوند" or "compound", set the compound filter to "yes".
        - Return ONLY the JSON object that matches the schema. Do not include any other text or explanations.`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                 config: {
                    responseMimeType: 'application/json',
                    responseSchema: filterSchema,
                },
            });
            const parsedFilters = JSON.parse(response.text);

            Object.entries(parsedFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    setFilter(key, String(value));
                }
            });
            showToast('AI filters applied!', 'success');

        } catch (error) {
            console.error("AI Search Failed:", error);
            showToast('Could not parse search query with AI. Please use manual filters.', 'error');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
      <>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        
        <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.searchLabel}</label>
              <div className="relative flex items-center">
                <Input 
                  type="text" 
                  id="search-query"
                  value={queryFilter} 
                  onChange={e => setFilter('q', e.target.value)} 
                  placeholder={language === 'ar' ? 'جرب: "شقة للبيع ٣ غرف تشطيب كامل"' : 'Try: "Apartment for sale 3 beds fully finished"'}
                  className={`${language === 'ar' ? 'pr-10' : 'pl-10'}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                />
                <SearchIcon className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} h-5 w-5 text-gray-400 dark:text-gray-400 pointer-events-none`} />
                <button
                  type="button"
                  onClick={handleAiSearch}
                  disabled={isAiLoading}
                  className={`absolute ${language === 'ar' ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 h-9 px-3 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors
                    bg-amber-500 text-gray-900 hover:bg-amber-600 disabled:bg-amber-300`}
                >
                  {isAiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  ) : (
                    <SparklesIcon className="w-4 h-4"/>
                  )}
                  <span>{language === 'ar' ? 'بحث ذكي' : 'AI Search'}</span>
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.statusLabel}</label>
              <Select id="status-filter" value={statusFilter} onChange={e => setFilter('status', e.target.value)}>
                <option value="all">{t.allStatuses}</option>
                <option value="For Sale">{t.forSale}</option>
                <option value="For Rent">{t.forRent}</option>
              </Select>
            </div>
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.typeLabel}</label>
              <Select id="type-filter" value={typeFilter} onChange={e => setFilter('type', e.target.value)}>
                <option value="all">{t.allTypes}</option>
                {propertyTypes.map(opt => (
                  <option key={opt.id} value={opt.en}>{opt[language]}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.priceRange}</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder={t.minPricePlaceholder} 
                  value={minPriceFilter} 
                  onChange={e => setFilter('minPrice', e.target.value)} 
                  min="0"
                />
                <span className="text-gray-400 dark:text-gray-500">-</span>
                <Input 
                  type="number" 
                  placeholder={t.maxPricePlaceholder} 
                  value={maxPriceFilter} 
                  onChange={e => setFilter('maxPrice', e.target.value)} 
                  min="0"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-500"
              aria-expanded={showAdvanced}
              aria-controls="advanced-filters-content"
            >
              <span>{showAdvanced ? t.hideFilters : t.advancedFilters}</span>
              <ArrowDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              {advancedFilterCount > 0 && (
                <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  {advancedFilterCount} {t.filtersApplied}
                </span>
              )}
            </button>
             {isAnyFilterActive && (
              <button onClick={resetFilters} className="text-sm font-semibold text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                  {language === 'ar' ? 'إعادة تعيين' : 'Reset Filters'}
              </button>
            )}
          </div>

          {showAdvanced && (
            <div id="advanced-filters-content" className="pt-4 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div>
                    <label htmlFor="finishing-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.finishing}</label>
                    <Select id="finishing-filter" value={finishingFilter} onChange={e => setFilter('finishing', e.target.value)} disabled={isFinishingDisabled}>
                      <option value="all">{t.allFinishes}</option>
                      {availableFinishingStatuses.map(opt => (
                        <option key={opt.id} value={opt.en}>{opt[language]}</option>
                      ))}
                    </Select>
                </div>
                {(typeFilter !== 'Commercial' && typeFilter !== 'Land') && <>
                    <div>
                      <label htmlFor="beds-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t_details.bedrooms}</label>
                      <Select id="beds-filter" value={bedsFilter} onChange={e => setFilter('beds', e.target.value)}>
                          <option value="">{language === 'ar' ? 'أي عدد' : 'Any'}</option>
                          <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="baths-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t_details.bathrooms}</label>
                      <Select id="baths-filter" value={bathsFilter} onChange={e => setFilter('baths', e.target.value)}>
                          <option value="">{language === 'ar' ? 'أي عدد' : 'Any'}</option>
                          <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
                      </Select>
                    </div>
                </>}
                {(typeFilter === 'Apartment' || typeFilter === 'Commercial') && (
                  <div>
                    <label htmlFor="floor-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.floor}</label>
                    <Input type="number" id="floor-filter" placeholder={t.floor} value={floorFilter} onChange={e => setFilter('floor', e.target.value)} min="0" />
                  </div>
                )}
              </div>
              
              <details className="pt-4 border-t border-gray-200 dark:border-gray-700" open>
                <summary className="font-semibold text-gray-800 dark:text-gray-300 cursor-pointer list-none flex items-center gap-2">
                  <ChevronRightIcon className="w-4 h-4 transition-transform duration-200 rotate-on-open" />
                  {t.additionalOptions}
                </summary>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div>
                    <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.project}</label>
                    <Select id="project-filter" value={projectFilter} onChange={e => setFilter('project', e.target.value)}>
                      <option value="all">{t.allProjects}</option>
                      {megaProjects.map(p => <option key={p.id} value={p.id}>{p.name[language]}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="installments-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.installments}</label>
                    <Select id="installments-filter" value={installmentsFilter} onChange={e => setFilter('installments', e.target.value)} disabled={isForRent}>
                      <option value="all">{t.allInstallments}</option>
                      <option value="yes">{t.installmentsYes}</option>
                      <option value="no">{t.installmentsNo}</option>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="real-estate-finance-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.realEstateFinance}</label>
                    <Select id="real-estate-finance-filter" value={realEstateFinanceFilter} onChange={e => setFilter('realEstateFinance', e.target.value)} disabled={isForRent}>
                      <option value="all">{t.allRealEstateFinance}</option>
                      <option value="yes">{t.realEstateFinanceYes}</option>
                      <option value="no">{t.realEstateFinanceNo}</option>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="compound-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.inCompound}</label>
                    <Select id="compound-filter" value={compoundFilter} onChange={e => setFilter('compound', e.target.value)}>
                      <option value="all">{t.allCompound}</option>
                      <option value="yes">{t.compoundYes}</option>
                      <option value="no">{t.compoundNo}</option>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="delivery-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.delivery}</label>
                    <Select id="delivery-filter" value={deliveryFilter} onChange={e => setFilter('delivery', e.target.value)}>
                      <option value="all">{t.allDelivery}</option>
                      <option value="immediate">{t.immediateDelivery}</option>
                    </Select>
                  </div>
                </div>
              </details>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">{t.amenities}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
                  {availableAmenities.map(amenity => (
                    <label key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <Checkbox
                        checked={amenitiesFilter.includes(amenity.en)}
                        onCheckedChange={() => handleAmenitiesChange(amenity.en)}
                        id={`amenity-${amenity.id}`}
                      />
                      {amenity[language]}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
};

export default PropertyFilters;
