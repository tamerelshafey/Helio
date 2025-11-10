

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Language, SubscriptionPlan, AdminPartner, PlanCategory } from '../../types';
import { CloseIcon } from '../icons/Icons';
import FormField, { selectClasses, inputClasses } from '../shared/FormField';
import { getPlans } from '../../api/plans';
import { updatePartnerAdmin } from '../../api/partners';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';

interface AdminPartnerEditModalProps {
    partner: AdminPartner;
    onClose: () => void;
    onSave: () => void;
}

const AdminPartnerEditModal: React.FC<AdminPartnerEditModalProps> = ({ partner, onClose, onSave }) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_shared = t.adminShared;
    const { data: plans, isLoading: plansLoading } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    const modalRef = useRef<HTMLDivElement>(null);

    const [plan, setPlan] = useState<SubscriptionPlan>(partner.subscriptionPlan);
    const [endDate, setEndDate] = useState(partner.subscriptionEndDate?.split('T')[0] || '');
    const [contactMethods, setContactMethods] = useState(partner.contactMethods || {
        whatsapp: { enabled: false, number: '' },
        phone: { enabled: false, number: '' },
        form: { enabled: true },
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleContactMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked, value } = e.target;
        const [method, field] = name.split('.');
        
        setContactMethods(prev => ({
            ...prev,
            [method]: {
                ...prev[method as keyof typeof prev],
                [field]: field === 'enabled' ? checked : value,
            }
        }));
    };

    const handleSave = async () => {
        await updatePartnerAdmin(partner.id, {
            subscriptionPlan: plan,
            subscriptionEndDate: new Date(endDate).toISOString(),
            contactMethods,
        });
        onSave();
    };
    
    const partnerPlanCategory = useMemo(() => {
        if (partner.type === 'developer') return 'developer';
        if (partner.type === 'agency') return 'agency';
        if (partner.type === 'finishing') return 'finishing';
        return 'agency'; // Default
    }, [partner.type]);

    const availablePlans = plans?.[partnerPlanCategory];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {t_admin.editPartnerTitle}: {language === 'ar' ? partner.nameAr || partner.name : partner.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    <FormField label={t_admin.changePlan} id="subscriptionPlan">
                        <select
                            id="subscriptionPlan"
                            value={plan}
                            onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
                            className={selectClasses}
                            disabled={plansLoading}
                        >
                            {availablePlans && Object.keys(availablePlans).map(planKey => (
                                <option key={planKey} value={planKey}>
                                    {(availablePlans as any)[planKey][language].name}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t_admin.updateSubscription} id="subscriptionEndDate">
                        <input
                            type="date"
                            id="subscriptionEndDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={inputClasses}
                        />
                    </FormField>

                    <fieldset className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <legend className="text-lg font-semibold text-amber-500">{t_admin.partnerTable.contactMethods}</legend>
                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input type="checkbox" name="whatsapp.enabled" checked={contactMethods.whatsapp.enabled} onChange={handleContactMethodChange} className="h-4 w-4 rounded"/>
                                {t_admin.partnerTable.enableWhatsApp}
                            </label>
                            {contactMethods.whatsapp.enabled && (
                                <input type="text" name="whatsapp.number" value={contactMethods.whatsapp.number} onChange={handleContactMethodChange} placeholder={t_admin.partnerTable.whatsAppNumber} className={inputClasses} />
                            )}
                        </div>

                         <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input type="checkbox" name="phone.enabled" checked={contactMethods.phone.enabled} onChange={handleContactMethodChange} className="h-4 w-4 rounded"/>
                                {t_admin.partnerTable.enablePhone}
                            </label>
                            {contactMethods.phone.enabled && (
                                <input type="text" name="phone.number" value={contactMethods.phone.number} onChange={handleContactMethodChange} placeholder={t_admin.partnerTable.phoneNumber} className={inputClasses} />
                            )}
                        </div>
                        
                         <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input type="checkbox" name="form.enabled" checked={contactMethods.form.enabled} onChange={handleContactMethodChange} className="h-4 w-4 rounded"/>
                                {t_admin.partnerTable.enableForm}
                            </label>
                        </div>
                    </fieldset>
                </div>

                <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">{t_shared.cancel}</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-amber-500 text-gray-900 font-semibold hover:bg-amber-600">{t_shared.save}</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPartnerEditModal;
