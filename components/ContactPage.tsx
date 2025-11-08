import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Language, PartnerType } from '../types';
import { translations } from '../data/translations';
import { inputClasses, selectClasses } from './shared/FormField';
import { addContactRequest } from '../api/contactRequests';
import { useToast } from './shared/ToastContext';
import SEO from './shared/SEO';
import { useApiQuery } from './shared/useApiQuery';
import { getContent } from '../api/content';
import { useLanguage } from './shared/LanguageContext';

type FormData = {
    name: string;
    phone: string;
    contactTime: string;
    message: string;
    inquiryType: 'client' | 'partner';
    companyName: string;
    businessType: PartnerType | '';
};

const ContactPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].contactPage;
    const { data: siteContent, isLoading: isLoadingContent } = useApiQuery('siteContent', getContent);
    const { showToast } = useToast();
    
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        defaultValues: {
            inquiryType: 'client',
            contactTime: '',
            businessType: '',
        }
    });

    const inquiryType = watch('inquiryType');

    const handleInquiryTypeChange = (type: 'client' | 'partner') => {
        setValue('inquiryType', type);
    };

    const onSubmit = async (data: FormData) => {
        const requestData = {
            name: data.name,
            phone: data.phone,
            contactTime: data.contactTime,
            message: data.message,
            inquiryType: data.inquiryType,
            companyName: data.inquiryType === 'partner' ? data.companyName : undefined,
            businessType: data.inquiryType === 'partner' && data.businessType ? data.businessType : undefined,
        };
        try {
            await addContactRequest(requestData);
            showToast(t.successMessage, 'success');
            reset({
                inquiryType: 'client',
                contactTime: '',
                businessType: '',
                name: '',
                phone: '',
                message: '',
                companyName: '',
            });
        } catch (error) {
            console.error("Contact form submission failed:", error);
            showToast(t.errorMessage, 'error');
        }
    };

    return (
        <div className="py-20 bg-white dark:bg-gray-900">
            <SEO 
                title={`${translations[language].nav.contact} | ONLY HELIO`}
                description={t.subtitle}
            />
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.formTitle}</h2>
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.inquiryTypeLabel}</label>
                                <div className="flex gap-4 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                    <button type="button" onClick={() => handleInquiryTypeChange('client')} className={`w-full py-2 rounded-md transition-colors ${inquiryType === 'client' ? 'bg-white dark:bg-gray-800 shadow text-amber-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>{t.clientOption}</button>
                                    <button type="button" onClick={() => handleInquiryTypeChange('partner')} className={`w-full py-2 rounded-md transition-colors ${inquiryType === 'partner' ? 'bg-white dark:bg-gray-800 shadow text-amber-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>{t.partnerOption}</button>
                                </div>
                            </div>
                            
                            {inquiryType === 'partner' && (
                                <div className="space-y-6 p-4 border border-amber-500/20 rounded-lg animate-fadeIn">
                                    <div>
                                        <label htmlFor="companyName" className="sr-only">{t.companyNamePlaceholder}</label>
                                        <input type="text" id="companyName" {...register("companyName", { required: inquiryType === 'partner' })} placeholder={t.companyNamePlaceholder} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label htmlFor="businessType" className="sr-only">{t.businessTypeLabel}</label>
                                         <select id="businessType" {...register("businessType", { required: inquiryType === 'partner' })} className={`${selectClasses} ${!watch('businessType') ? 'text-gray-500 dark:text-gray-400' : ''}`} >
                                            <option value="" disabled>{t.businessTypeLabel}</option>
                                            <option value="developer" className="text-gray-900 dark:text-white">{t.developerOption}</option>
                                            <option value="finishing" className="text-gray-900 dark:text-white">{t.finishingOption}</option>
                                            <option value="agency" className="text-gray-900 dark:text-white">{t.agencyOption}</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="sr-only">{t.namePlaceholder}</label>
                                <input type="text" id="name" {...register("name", { required: true })} placeholder={t.namePlaceholder} className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="phone" className="sr-only">{t.phonePlaceholder}</label>
                                <input type="tel" id="phone" {...register("phone", { required: true })} placeholder={t.phonePlaceholder} className={inputClasses} dir="ltr" />
                            </div>
                            <div>
                                <label htmlFor="contactTime" className="sr-only">{t.contactTimeLabel}</label>
                                <select id="contactTime" {...register("contactTime", { required: true })} className={`${selectClasses} ${!watch('contactTime') ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                                    <option value="" disabled>{t.contactTimeDefault}</option>
                                    <option value="morning" className="text-gray-900 dark:text-white">{t.contactTimeMorning}</option>
                                    <option value="afternoon" className="text-gray-900 dark:text-white">{t.contactTimeAfternoon}</option>
                                    <option value="evening" className="text-gray-900 dark:text-white">{t.contactTimeEvening}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">{t.messagePlaceholder}</label>
                                <textarea id="message" {...register("message", { required: true })} rows={5} placeholder={t.messagePlaceholder} className={inputClasses}></textarea>
                            </div>
                            <div>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                    {isSubmitting ? '...' : t.sendButton}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.contactInfoTitle}</h2>
                        {isLoadingContent ? <div className="animate-pulse space-y-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div></div> : (
                            <>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">📍</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.addressTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{siteContent?.footer[language].address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">📞</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.phoneTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400" dir="ltr">{siteContent?.footer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">✉️</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.emailTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{siteContent?.footer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">⏰</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.hoursTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{siteContent?.footer[language].hours}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;