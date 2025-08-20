import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';
import { GoogleGenAI, Type } from "@google/genai";
import FormField, { inputClasses, selectClasses } from './shared/FormField';

// Initialize the AI client once to avoid re-creation on every call
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AddPropertyModalProps {
  onClose: () => void;
  language: Language;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, language }) => {
  const t = translations[language].addPropertyModal;
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    contactTime: '',
    propertyType: '',
    area: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    address: '',
    mapLocation: '',
    description: '',
    keywords: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    firstElement.focus();

    const handleTabKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };
    
    const currentModalRef = modalRef.current;
    currentModalRef?.addEventListener('keydown', handleTabKeyPress);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        currentModalRef?.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.propertyType || !formData.area || !formData.keywords) {
      alert(t.errorFillFields);
      return;
    }
    
    setIsGenerating(true);
    try {
        let promptDetails = `
            - Property Type: ${formData.propertyType}
            - Area: ${formData.area} square meters
            - Key features & keywords: ${formData.keywords}
        `;
        if (formData.bedrooms && (formData.propertyType === 'apartment' || formData.propertyType === 'villa')) {
            promptDetails += `\n- Bedrooms: ${formData.bedrooms}`;
        }

      const prompt = `
        Act as a professional real estate marketer. Based on the following details, write a compelling and attractive property description in both Arabic and English.
        ${promptDetails}

        The description should highlight the key features and create a sense of luxury and desirability.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ar: { type: Type.STRING, description: "The property description in Arabic." },
              en: { type: Type.STRING, description: "The property description in English." },
            },
            propertyOrdering: ["ar", "en"],
          }
        }
      });

      const jsonResponse = JSON.parse(response.text);
      setFormData(prev => ({ ...prev, description: jsonResponse[language] }));

    } catch (error) {
      console.error("Error generating description:", error);
      alert(t.errorGeneration);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    onClose();
  };

  const showBedroomAndBathFields = formData.propertyType === 'apartment' || formData.propertyType === 'villa';

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
            <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-400 hover:text-white transition-colors`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
            <h2 className="text-3xl font-bold text-amber-500 mb-6 text-center">{t.title}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="border-b border-gray-700 pb-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-4">{t.ownerInfo}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t.fullName} id="ownerName">
                            <input type="text" id="ownerName" className={inputClasses} required value={formData.ownerName} onChange={handleChange} />
                        </FormField>
                         <FormField label={t.phone} id="ownerPhone">
                            <input type="tel" id="ownerPhone" className={inputClasses} required dir="ltr" value={formData.ownerPhone} onChange={handleChange} />
                        </FormField>
                        <FormField label={t.emailOptional} id="ownerEmail">
                            <input type="email" id="ownerEmail" className={inputClasses} value={formData.ownerEmail} onChange={handleChange} />
                        </FormField>
                        <FormField label={t.contactTime} id="contactTime">
                            <select id="contactTime" className={selectClasses} required value={formData.contactTime} onChange={handleChange}>
                                <option value="">{t.selectTime}</option>
                                <option value="morning">{t.morning}</option>
                                <option value="afternoon">{t.afternoon}</option>
                                <option value="evening">{t.evening}</option>
                            </select>
                        </FormField>
                    </div>
                </div>

                <div className="border-b border-gray-700 pb-6">
                     <h3 className="text-lg font-semibold text-gray-100 mb-4">{t.propertyDetails}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t.propertyType} id="propertyType">
                            <select id="propertyType" className={selectClasses} required value={formData.propertyType} onChange={handleChange}>
                                <option value="">{t.selectType}</option>
                                <option value="apartment">{t.apartment}</option>
                                <option value="villa">{t.villa}</option>
                                <option value="commercial">{t.commercial}</option>
                                <option value="land">{t.land}</option>
                            </select>
                        </FormField>
                        <FormField label={t.area} id="area">
                            <input type="number" id="area" className={inputClasses} required min="1" value={formData.area} onChange={handleChange} />
                        </FormField>

                        {showBedroomAndBathFields && (
                            <>
                                <FormField label={t.bedrooms} id="bedrooms">
                                    <input type="number" id="bedrooms" className={inputClasses} required min="0" value={formData.bedrooms} onChange={handleChange} />
                                </FormField>
                                <FormField label={t.bathrooms} id="bathrooms">
                                    <input type="number" id="bathrooms" className={inputClasses} required min="0" value={formData.bathrooms} onChange={handleChange} />
                                </FormField>
                            </>
                        )}
                        
                        <div className="md:col-span-2">
                           <FormField label={t.price} id="price">
                                <input type="number" id="price" className={inputClasses} required min="0" value={formData.price} onChange={handleChange} />
                            </FormField>
                        </div>
                         <div className="md:col-span-2">
                           <FormField label={t.address} id="address">
                                <input type="text" id="address" className={inputClasses} required value={formData.address} onChange={handleChange} />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                           <FormField label={t.mapLocation} id="mapLocation">
                                <input type="text" id="mapLocation" placeholder={t.mapLocationPlaceholder} className={inputClasses} value={formData.mapLocation} onChange={handleChange} />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                           <FormField label={t.keywords} id="keywords">
                                <textarea id="keywords" rows={2} className={inputClasses} placeholder={t.keywordsPlaceholder} value={formData.keywords} onChange={handleChange}></textarea>
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-300">{t.description}</label>
                                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-sm text-amber-500 font-semibold hover:text-amber-400 disabled:text-gray-500 disabled:cursor-wait flex items-center gap-1">
                                    {isGenerating ? t.generating : t.generateWithAI} ✨
                                </button>
                           </div>
                           <textarea id="description" rows={5} className={inputClasses} value={formData.description} onChange={handleChange}></textarea>
                        </div>
                     </div>
                </div>
                
                <div>
                     <h3 className="text-lg font-semibold text-gray-100 mb-4">{t.imagesAndPlan}</h3>
                     <div className="space-y-4">
                        <FormField label={t.uploadImages} id="propertyImages">
                            <input type="file" id="propertyImages" multiple className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-gray-900 hover:file:bg-amber-600`} />
                        </FormField>
                        <FormField label={t.listingPlan} id="listingPlan">
                             <select id="listingPlan" className={selectClasses} required>
                                <option value="">{t.selectPlan}</option>
                                <option value="paid">{t.paidListing}</option>
                                <option value="commission">{t.commissionListing}</option>
                            </select>
                        </FormField>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">
                        {t.submit}
                    </button>
                </div>

            </form>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyModal;