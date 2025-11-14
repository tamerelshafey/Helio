import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import type { Language } from '../../types';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import { HelioLogo } from '../ui/Icons';
import { useToast } from '../shared/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnersForAdmin } from '../../services/partners';
import { useLanguage } from '../shared/LanguageContext';

const ServiceRequestPage: React.FC = () => {
    const { language, t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const t_modal = t.serviceRequestModal;
    const t_decor_modal = t.decorationRequestModal;
    const t_custom_decor_modal = t.customDecorationRequestModal;
    const t_decor = t.decorationsPage;
    const queryClient = useQueryClient();

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
    
    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.LEAD, data),
        onSuccess: () => {
            showToast(t_modal.successMessage, 'success');
            setFormData({ customerName: '', customerPhone: '', contactTime: '', customerNotes: '' });
            setReferenceImage(null);
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
            setTimeout(() => navigate(-1), 2000);
        },
        onError: (error) => {
            console.error("Failed to submit lead:", error);
            showToast('Submission failed. Please try again.', 'error');
        }
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
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
        
        mutation.mutate({
            requesterInfo: { name: formData.customerName, phone: formData.customerPhone },
            payload: {
                contactTime: formData.contactTime,
                customerNotes: finalNotes,
                partnerId: partnerId,
                serviceTitle: serviceTitle,
                managerId: managerId,
                propertyId: propertyId,
                serviceType: serviceType
            }
        });
    };

    return (
        <div className="py-20 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-6">
                            <HelioLogo className="h-10 w-10" />
                            <span className="text-2xl">ONLY HELIO</span>
                        </Link>
                    </div>
                    
                    <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                        <h2 className="text-3xl font-bold text-amber-500 mb-2 text-center">
                            {workItem ? t_decor_modal.title : isCustom ? t_custom_decor_modal.title : t_modal.title}
                        </h2>
                        <p className="text-gray-500 text-center mb-8">({serviceTitle})</p>
                        
                        {workItem && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">{t_decor_modal.reference}</p>
                                <div className="flex gap-4 items-start">
                                    <img src={workItem.imageUrl} alt={workItem.alt} className="w-24 h-24 object-cover rounded-lg flex-shrink-0 shadow-md" />
                                    <div className="space-y-1 text-sm">
                                        <h3 className="font-bold text-gray-900 text-base">{workItem.title[language]}</h3>
                                        {workItem.price != null && <p className="font-semibold text-amber-500">{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(workItem.price)}</p>}
                                        {workItem.dimensions && <p className="text-gray-500">{t_decor.dimensions}: {workItem.dimensions}</p>}
                                        {workItem.availability && <p className="text-gray-500">{t_decor.availability}: {workItem.availability === 'In Stock' ? t_decor.inStock : t_decor.madeToOrder}</p>}
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
                                <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} ${!formData.contactTime ? 'text-gray-500' : ''}`} required>
                                    <option value="" disabled>{t_modal.preferredContactTimeDefault}</option>
                                    <option value={t_modal.preferredContactTimeMorning} className="text-gray-900">{t_modal.preferredContactTimeMorning}</option>
                                    <option value={t_modal.preferredContactTimeAfternoon} className="text-gray-900">{t_modal.preferredContactTimeAfternoon}</option>
                                    <option value={t_modal.preferredContactTimeEvening} className="text-gray-900">{t_modal.preferredContactTimeEvening}</option>
                                </select>
                            </FormField>
                            
                            <FormField label={isCustom ? t_custom_decor_modal.ideaDescription : t_modal.notes} id="customerNotes">
                                <textarea
                                    id="customerNotes"
                                    name="customerNotes"
                                    rows={4}
                                    value={formData.customerNotes}
                                    onChange={handleChange}
                                    placeholder={isCustom ? t_custom_decor_modal.ideaPlaceholder : t_modal.notesPlaceholder}
                                    className={inputClasses}
                                    required={isCustom}
                                />
                            </FormField>

                            {isCustom && (
                                <FormField label={t_custom_decor_modal.referenceImage} id="referenceImage">
                                    <input
                                        type="file"
                                        id="referenceImage"
                                        onChange={handleFileChange}
                                        className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                        accept="image/*"
                                    />
                                    {referenceImage && <p className="text-xs text-gray-500 mt-1">{referenceImage.name}</p>}
                                </FormField>
                            )}
                            
                            <div className="pt-4 flex justify-end">
                                <button type="submit" disabled={mutation.isPending} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                    {mutation.isPending ? '...' : (isCustom ? t_custom_decor_modal.submitButton : t_modal.submitButton)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestPage;