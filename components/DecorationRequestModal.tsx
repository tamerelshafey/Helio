import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';

interface FormFieldProps {
    label: string;
    id: string;
    children: React.ReactNode;
}

const inputClasses = "w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white placeholder-gray-400";

const FormField: React.FC<FormFieldProps> = ({ label, id, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    {children}
  </div>
);

interface DecorationRequestModalProps {
    onClose: () => void;
    serviceTitle: string;
    serviceType: string;
    language: Language;
}

const DecorationRequestModal: React.FC<DecorationRequestModalProps> = ({ onClose, serviceTitle, serviceType, language }) => {
    const t = translations[language].decorationRequestModal;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Decoration request submitted for:", serviceTitle);
        alert(t.successMessage);
        onClose();
    };

    const isWallDecor = serviceType === 'wall-decor';

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-400 hover:text-white transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{serviceTitle}</h2>
                    <p className="text-gray-400 text-center mb-6">{t.subtitle}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.fullName} id="fullName">
                                <input type="text" id="fullName" className={inputClasses} required />
                            </FormField>
                            <FormField label={t.phone} id="phone">
                                <input type="tel" id="phone" className={inputClasses} required dir="ltr" />
                            </FormField>
                        </div>
                        
                        {isWallDecor && (
                             <FormField label={t.dimensions} id="dimensions">
                                <input type="text" id="dimensions" placeholder={t.dimensionsPlaceholder} className={inputClasses} />
                            </FormField>
                        )}

                        <FormField label={t.description} id="description">
                            <textarea id="description" rows={4} placeholder={t.descriptionPlaceholder} className={inputClasses} required></textarea>
                        </FormField>

                        <FormField label={t.attachImage} id="imageUpload">
                            <p className="text-xs text-gray-500 mb-2">{t.attachImageHint}</p>
                            <input type="file" id="imageUpload" className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-gray-900 hover:file:bg-amber-600 cursor-pointer`} />
                        </FormField>

                        <div className="pt-2 flex justify-end">
                            <button type="submit" className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200">
                                {t.submitButton}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DecorationRequestModal;