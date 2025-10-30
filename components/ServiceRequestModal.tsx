import React, { useRef, useEffect, useState } from 'react';
import type { Language } from '../types';
import { translations } from '../data/translations';
import FormField, { inputClasses } from './shared/FormField';
import { addLead } from '../api/leads';

interface ServiceRequestModalProps {
    onClose: () => void;
    serviceTitle: string;
    partnerId: string;
    language: Language;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ onClose, serviceTitle, partnerId, language }) => {
    const t = translations[language].serviceRequestModal;
    const modalRef = useRef<HTMLDivElement>(null);
    const selectClasses = `${inputClasses} appearance-none`;

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        contactTime: '',
        customerNotes: ''
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
        await addLead({ ...formData, partnerId, serviceTitle });
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
                ref={modalRef}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{t.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">({serviceTitle})</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t.fullName} id="customerName">
                                <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label={t.phone} id="customerPhone">
                                <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputClasses} required dir="ltr" />
                            </FormField>
                        </div>

                         <FormField label={t.preferredContactTime} id="contactTime">
                            <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} text-gray-500 dark:text-gray-400`} required>
                                <option value="" disabled>{t.preferredContactTimeDefault}</option>
                                <option value={t.preferredContactTimeMorning} className="text-gray-900 dark:text-white">{t.preferredContactTimeMorning}</option>
                                <option value={t.preferredContactTimeAfternoon} className="text-gray-900 dark:text-white">{t.preferredContactTimeAfternoon}</option>
                                <option value={t.preferredContactTimeEvening} className="text-gray-900 dark:text-white">{t.preferredContactTimeEvening}</option>
                            </select>
                        </FormField>
                        
                        <FormField label={t.notes} id="customerNotes">
                            <textarea id="customerNotes" name="customerNotes" rows={4} value={formData.customerNotes} onChange={handleChange} placeholder={t.notesPlaceholder} className={inputClasses}></textarea>
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

export default ServiceRequestModal;