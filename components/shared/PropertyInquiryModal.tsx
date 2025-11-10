
import React, { useRef, useEffect, useState } from 'react';
import type { Language } from '../../types';
import FormField, { inputClasses, selectClasses } from './FormField';
import { addPropertyInquiry } from '../../services/propertyInquiries';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

interface PropertyInquiryModalProps {
    onClose: () => void;
}

const PropertyInquiryModal: React.FC<PropertyInquiryModalProps> = ({ onClose }) => {
    const { language, t } = useLanguage();
    const t_modal = t.propertyInquiryModal;
    const t_contact = t.contactPage;
    const modalRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        contactTime: '',
        details: '',
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        modalRef.current?.querySelector<HTMLElement>('input')?.focus();
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await addPropertyInquiry(formData);
        setLoading(false);
        showToast(t_modal.successMessage, 'success');
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
                    
                    <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{t_modal.title}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-6">{t_modal.subtitle}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t_modal.fullName} id="customerName">
                                <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClasses} required />
                            </FormField>
                            <FormField label={t_modal.phone} id="customerPhone">
                                <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputClasses} required dir="ltr" />
                            </FormField>
                        </div>

                        <FormField label={t_modal.contactTime} id="contactTime">
                            <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} ${!formData.contactTime ? 'text-gray-500 dark:text-gray-400' : ''}`} required>
                                <option value="" disabled>{t_contact.contactTimeDefault}</option>
                                <option value="morning" className="text-gray-900 dark:text-white">{t_contact.contactTimeMorning}</option>
                                <option value="afternoon" className="text-gray-900 dark:text-white">{t_contact.contactTimeAfternoon}</option>
                                <option value="evening" className="text-gray-900 dark:text-white">{t_contact.contactTimeEvening}</option>
                            </select>
                        </FormField>
                        
                        <FormField label={t_modal.propertyDetails} id="details">
                            <textarea id="details" name="details" rows={4} value={formData.details} onChange={handleChange} placeholder={t_modal.detailsPlaceholder} className={inputClasses} required></textarea>
                        </FormField>

                        <div className="pt-2 flex justify-end">
                            <button type="submit" disabled={loading} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                {loading ? '...' : t_modal.submitButton}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PropertyInquiryModal;