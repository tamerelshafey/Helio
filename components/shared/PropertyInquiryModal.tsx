import React, { useRef, useEffect, useState } from 'react';
import type { Language } from '../../types';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PropertyInquiryModalProps {
    onClose: () => void;
}

const PropertyInquiryModal: React.FC<PropertyInquiryModalProps> = ({ onClose }) => {
    const { language, t } = useLanguage();
    const t_modal = t.propertyInquiryModal;
    const t_contact = t.contactPage;
    const modalRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.PROPERTY_INQUIRY, data),
        onSuccess: () => {
            showToast(t_modal.successMessage, 'success');
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
            onClose();
        },
        onError: (error) => {
            console.error("Failed to submit inquiry:", error);
            showToast('Submission failed. Please try again.', 'error');
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        mutation.mutate({
            requesterInfo: {
                name: data.customerName as string,
                phone: data.customerPhone as string,
            },
            payload: {
                contactTime: data.contactTime,
                details: data.details,
            }
        });
    };

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
    

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300 animate-fadeIn"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                ref={modalRef}
                className="bg-white border border-gray-200 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <button onClick={onClose} className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-800 transition-colors`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLineCap="round" strokeLineJoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">{t_modal.title}</h2>
                    <p className="text-gray-500 text-center mb-6">{t_modal.subtitle}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t_modal.fullName} id="customerName">
                                <input type="text" id="customerName" name="customerName" className={inputClasses} required />
                            </FormField>
                            <FormField label={t_modal.phone} id="customerPhone">
                                <input type="tel" id="customerPhone" name="customerPhone" className={inputClasses} required dir="ltr" />
                            </FormField>
                        </div>

                        <FormField label={t_modal.contactTime} id="contactTime">
                            <select id="contactTime" name="contactTime" defaultValue="" className={`${selectClasses} text-gray-500`} required>
                                <option value="" disabled>{t_contact.contactTimeDefault}</option>
                                <option value="morning" className="text-gray-900">{t_contact.contactTimeMorning}</option>
                                <option value="afternoon" className="text-gray-900">{t_contact.contactTimeAfternoon}</option>
                                <option value="evening" className="text-gray-900">{t_contact.contactTimeEvening}</option>
                            </select>
                        </FormField>
                        
                        <FormField label={t_modal.propertyDetails} id="details">
                            <textarea id="details" name="details" rows={4} placeholder={t_modal.detailsPlaceholder} className={inputClasses} required></textarea>
                        </FormField>

                        <div className="pt-2 flex justify-end">
                            <button type="submit" disabled={mutation.isPending} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                {mutation.isPending ? '...' : t_modal.submitButton}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PropertyInquiryModal;