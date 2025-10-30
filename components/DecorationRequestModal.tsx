import React, { useRef, useEffect, useState } from 'react';
import type { Language, PortfolioItem } from '../types';
import { translations } from '../data/translations';
import FormField, { inputClasses } from './shared/FormField';
import { addLead } from '../api/leads';
import Lightbox from './shared/Lightbox';

interface DecorationRequestModalProps {
    onClose: () => void;
    workItem: PortfolioItem;
    language: Language;
}

const DecorationRequestModal: React.FC<DecorationRequestModalProps> = ({ onClose, workItem, language }) => {
    const t = translations[language].decorationRequestModal;
    const modalRef = useRef<HTMLDivElement>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerNotes: '',
        contactTime: '',
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        const firstFocusableElement = modalRef.current?.querySelector<HTMLElement>('input, select, textarea, button');
        firstFocusableElement?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const serviceTitle = `${t.reference} ${workItem.title[language]}`;
        await addLead({ ...formData, partnerId: workItem.partnerId, serviceTitle });
        alert(t.successMessage);
        onClose();
    };

    return (
        <>
        {isLightboxOpen && (
             <Lightbox 
                images={[workItem.src]}
                startIndex={0}
                onClose={() => setIsLightboxOpen(false)}
                language={language}
            />
        )}
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                ref={modalRef}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors z-10`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-amber-500 mb-2">{t.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
                    </div>

                     <div className="mb-6">
                        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-2">{t.reference}</p>
                        <button 
                            type="button" 
                            onClick={() => setIsLightboxOpen(true)}
                            className="w-full block rounded-lg overflow-hidden group relative shadow-md"
                            aria-label={t.viewLarger}
                        >
                            <img src={workItem.src} alt={workItem.alt} className="w-full h-64 object-cover rounded-lg" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-bold text-lg">{t.viewLarger}</span>
                            </div>
                        </button>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-center mt-3 text-lg">{workItem.title[language]}</h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormField label={t.fullName} id="customerName">
                            <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClasses} required />
                        </FormField>
                        <FormField label={t.phone} id="customerPhone">
                            <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputClasses} required dir="ltr" />
                        </FormField>
                        <FormField label={translations[language].serviceRequestModal.preferredContactTime} id="contactTime">
                            <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${inputClasses} appearance-none text-gray-500 dark:text-gray-400`} required>
                                <option value="" disabled>{translations[language].serviceRequestModal.preferredContactTimeDefault}</option>
                                <option value={translations[language].serviceRequestModal.preferredContactTimeMorning} className="text-gray-900 dark:text-white">{translations[language].serviceRequestModal.preferredContactTimeMorning}</option>
                                <option value={translations[language].serviceRequestModal.preferredContactTimeAfternoon} className="text-gray-900 dark:text-white">{translations[language].serviceRequestModal.preferredContactTimeAfternoon}</option>
                                <option value={translations[language].serviceRequestModal.preferredContactTimeEvening} className="text-gray-900 dark:text-white">{translations[language].serviceRequestModal.preferredContactTimeEvening}</option>
                            </select>
                        </FormField>
                        <FormField label={t.notes} id="customerNotes">
                            <textarea id="customerNotes" name="customerNotes" rows={3} value={formData.customerNotes} onChange={handleChange} placeholder={t.notesPlaceholder} className={inputClasses}></textarea>
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
        </>
    );
};

export default DecorationRequestModal;