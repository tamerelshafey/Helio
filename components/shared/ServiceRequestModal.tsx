
import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../../types';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { addLead } from '../../services/leads';
import { useToast } from './ToastContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from './LanguageContext';
import { CloseIcon } from '../ui/Icons';

interface ServiceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerId: string;
    serviceTitle: string;
    propertyId?: string;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ isOpen, onClose, partnerId, serviceTitle, propertyId }) => {
    const { language, t } = useLanguage();
    const t_modal = t.serviceRequestModal;
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const modalRef = useRef<HTMLDivElement>(null);
    
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        contactTime: '',
        customerNotes: '',
    });

    const mutation = useMutation({
        mutationFn: addLead,
        onSuccess: () => {
            showToast(t_modal.successMessage, 'success');
            onClose();
        },
        onError: () => {
            showToast('Submission failed.', 'error');
        }
    });

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ ...formData, partnerId, serviceTitle, propertyId, serviceType: 'property' });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{serviceTitle}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                     <FormField label={t_modal.fullName} id="customerName">
                        <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClasses} required />
                    </FormField>
                    <FormField label={t_modal.phone} id="customerPhone">
                        <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputClasses} required dir="ltr" />
                    </FormField>
                    <FormField label={t_modal.preferredContactTime} id="contactTime">
                        <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} ${!formData.contactTime ? 'text-gray-500' : ''}`} required>
                            <option value="" disabled>{t_modal.preferredContactTimeDefault}</option>
                            <option value={t_modal.preferredContactTimeMorning} className="text-gray-900 dark:text-white">{t_modal.preferredContactTimeMorning}</option>
                            <option value={t_modal.preferredContactTimeAfternoon} className="text-gray-900 dark:text-white">{t_modal.preferredContactTimeAfternoon}</option>
                            <option value={t_modal.preferredContactTimeEvening} className="text-gray-900 dark:text-white">{t_modal.preferredContactTimeEvening}</option>
                        </select>
                    </FormField>
                    <FormField label={t_modal.notes} id="customerNotes">
                        <textarea id="customerNotes" name="customerNotes" rows={3} value={formData.customerNotes} onChange={handleChange} placeholder={t_modal.notesPlaceholder} className={inputClasses}></textarea>
                    </FormField>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={mutation.isPending} className="bg-amber-500 text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                            {mutation.isPending ? '...' : t_modal.submitButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ServiceRequestModal;