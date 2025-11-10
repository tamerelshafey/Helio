import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Language } from '../types';
import FormField, { inputClasses, selectClasses } from './shared/FormField';
import { addLead } from '../services/leads';
import { HelioLogo } from './HelioLogo';
import { useToast } from './shared/ToastContext';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnersForAdmin } from '../services/partners';
import { useLanguage } from './shared/LanguageContext';

const ServiceRequestPage: React.FC = () => {
    const { language, t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const t_modal = t.serviceRequestModal;
    const t_decor_modal = t.decorationRequestModal;
    const t_custom_decor_modal = t.customDecorationRequestModal;
    const t_decor = t.decorationsPage;

    const { serviceTitle, partnerId, propertyId, workItem, isCustom, serviceType } = location.state || {};
    const { data: allPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { showToast } = useToast();
    
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        contactTime: '',
        customerNotes: '',
    });
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (!serviceTitle || !partnerId) {
            navigate('/');
        }
    }, [serviceTitle, partnerId, navigate]);

    if (!serviceTitle || !partnerId) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReferenceImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        let finalNotes = formData.customerNotes;
        if (isCustom && referenceImage) {
            finalNotes += `\n\n(Reference Image Uploaded: ${referenceImage.name})`;
        }
        
        let managerId: string | undefined = undefined;
        if (serviceType && allPartners) {
             const manager = allPartners.find(p => p.type === 'service_manager');
            if (manager) {
                managerId = manager.id;
            }
        }

        await addLead({ ...formData, customerNotes: finalNotes, partnerId, serviceTitle, managerId, propertyId, serviceType });
        setLoading(false);
        showToast(t_modal.successMessage, 'success');
        setFormData({
            customerName: '',
            customerPhone: '',
            contactTime: '',
            customerNotes: '',
        });
        setReferenceImage(null);
        setTimeout(() => navigate(-1), 2000);
    };

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-6">
                            <HelioLogo className="h-10 w-10" />
                            <span className="text-2xl">ONLY HELIO</span>
                        </Link>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">
                            {workItem ? t_decor_modal.title : isCustom ? t_custom_decor_modal.title : t_modal.title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">({serviceTitle})</p>
                        
                        {workItem && (
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t_decor_modal.reference}</p>
                                <div className="flex gap-4 items-start">
                                    <img src={workItem.imageUrl} alt={workItem.alt} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 shadow-md" />
                                    <div className="space-y-1 text-sm">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{workItem.title[language]}</h3>
                                        {workItem.price != null && <p className="font-semibold text-amber-500">{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(workItem.price)}</p>}
                                        {workItem.dimensions && <p className="text-gray-500 dark:text-gray-400">{t_decor.dimensions}: {workItem.dimensions}</p>}
                                        {workItem.availability && <p className="text-gray-500 dark:text-gray-400">{t_decor.availability}: {workItem.availability === 'In Stock' ? t_decor.inStock : t_decor.madeToOrder}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label={t_modal.fullName} id="customerName">
                                    <input type="text" id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} className={inputClasses} required />
                                </FormField>
                                <FormField label={t_modal.phone} id="customerPhone">
                                    <input type="tel" id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className={inputClasses} required dir="ltr" />
                                </FormField>
                            </div>

                            <FormField label={t_modal.preferredContactTime} id="contactTime">
                                <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} ${!formData.contactTime ? 'text-gray-500 dark:text-gray-400' : ''}`} required>
                                    <option value="" disabled>{t_modal.preferredContactTimeDefault}</option>
                                    <option value={t_modal.preferredContactTimeMorning} className="text-gray-900 dark:text-white">{t_modal.preferredContactTimeMorning}</option>
                                    <option value={t_modal.preferredContactTimeAfternoon} className="text-gray-900 dark:text-white">{t_modal.preferredContactTimeAfternoon}</option>
                                    <option value={t_modal.preferredContactTimeEvening} className="text-gray-900 dark:text-white">{t_modal.preferredContactTimeEvening}</option>
                                </select>
                            </FormField>
                            
                            <FormField label={isCustom ?