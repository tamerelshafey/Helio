import React from 'react';
import type { Language } from '../App';
import { translations } from '../data/translations';
import FormField, { inputClasses } from './shared/FormField';

interface FinishingRequestModalProps {
    onClose: () => void;
    serviceTitle: string;
    language: Language;
}

const FinishingRequestModal: React.FC<FinishingRequestModalProps> = ({ onClose, serviceTitle, language }) => {
    const t = translations[language].finishingRequestModal;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Finishing request submitted for:", serviceTitle);
        alert(t.successMessage);
        onClose();
    };

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
                    <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{t.title}</h2>
                    <p className="text-gray-400 text-center mb-6">({serviceTitle})</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.fullName} id="fullName">
                                <input type="text" id="fullName" className={inputClasses} required />
                            </FormField>
                            <FormField label={t.phone} id="phone">
                                <input type="tel" id="phone" className={inputClasses} required dir="ltr" />
                            </FormField>
                        </div>

                         <FormField label={t.preferredContactTime} id="contactTime">
                            <select id="contactTime" className={`${inputClasses} text-gray-400`} required defaultValue="">
                                <option value="" disabled>{t.preferredContactTimeDefault}</option>
                                <option value="morning" className="text-white">{t.preferredContactTimeMorning}</option>
                                <option value="afternoon" className="text-white">{t.preferredContactTimeAfternoon}</option>
                                <option value="evening" className="text-white">{t.preferredContactTimeEvening}</option>
                            </select>
                        </FormField>
                        
                        <FormField label={t.notes} id="notes">
                            <textarea id="notes" rows={4} placeholder={t.notesPlaceholder} className={inputClasses}></textarea>
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

export default FinishingRequestModal;