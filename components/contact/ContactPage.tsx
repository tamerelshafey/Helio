
import React from 'react';
import { useForm } from 'react-hook-form';
import type { Language, PartnerType } from '../../types';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import { useToast } from '../shared/ToastContext';
import SEO from '../shared/SEO';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { WhatsAppIcon, PhoneIcon } from '../ui/Icons';

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
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading: isLoadingContent } = useSiteContent();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            inquiryType: 'client',
            contactTime: '',
            businessType: '',
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const routing = siteContent?.contactConfiguration?.routing || 'internal';
            const targetEmail = siteContent?.contactConfiguration?.targetEmail;

            // Simulate sending email
            if (routing === 'email' || routing === 'both') {
                if (targetEmail) {
                    console.log(`[Simulated Email] Sending contact form to ${targetEmail}:`, data);
                    // In a real app, you would call an API endpoint here to send the email
                } else {
                    console.warn("Target email not configured in settings.");
                }
            }

            // Save to internal database
            if (routing === 'internal' || routing === 'both') {
                 return addRequest(RequestType.CONTACT_MESSAGE, data);
            }

            // If email only, just return a success resolve for the mutation
            return Promise.resolve();
        },
        onSuccess: () => {
            showToast(t.contactPage.successMessage, 'success');
            reset({
                inquiryType: 'client',
                contactTime: '',
                businessType: '',
                name: '',
                phone: '',
                message: '',
                companyName: '',
            });
            if (siteContent?.contactConfiguration?.routing !== 'email') {
                queryClient.invalidateQueries({ queryKey: ['allRequests'] });
            }
        },
        onError: (error) => {
            console.error("Contact form submission failed:", error);
            showToast(t.contactPage.errorMessage, 'error');
        }
    });

    const inquiryType = watch('inquiryType');

    const handleInquiryTypeChange = (type: 'client' | 'partner') => {
        setValue('inquiryType', type);
    };

    const onSubmit = (data: FormData) => {
        const payload = {
            contactTime: data.contactTime,
            message: data.message,
            inquiryType: data.inquiryType,
            companyName: data.inquiryType === 'partner' ? data.companyName : undefined,
            businessType: data.inquiryType === 'partner' && data.businessType ? data.businessType : undefined,
        };
        mutation.mutate({
            requesterInfo: { name: data.name, phone: data.phone },
            payload: payload
        });
    };

    return (
        <div className="py-20 bg-white">
            <SEO 
                title={`${t.nav.contact} | ONLY HELIO`}
                description={t.contactPage.subtitle}
            />
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t.contactPage.title}</h1>
                    <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">{t.contactPage.subtitle}</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.contactPage.formTitle}</h2>
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t.contactPage.inquiryTypeLabel}</label>
                                <div className="flex gap-4 p-1 bg-gray-200 rounded-lg">
                                    <button type="button" onClick={() => handleInquiryTypeChange('client')} className={`w-full py-2 rounded-md transition-colors ${inquiryType === 'client' ? 'bg-white shadow text-amber-600 font-semibold' : 'text-gray-600'}`}>{t.contactPage.clientOption}</button>
                                    <button type="button" onClick={() => handleInquiryTypeChange('partner')} className={`w-full py-2 rounded-md transition-colors ${inquiryType === 'partner' ? 'bg-white shadow text-amber-600 font-semibold' : 'text-gray-600'}`}>{t.contactPage.partnerOption}</button>
                                </div>
                            </div>
                            
                            {inquiryType === 'partner' && (
                                <div className="space-y-6 p-4 border border-amber-500/20 rounded-lg animate-fadeIn">
                                    <div>
                                        <label htmlFor="companyName" className="sr-only">{t.contactPage.companyNamePlaceholder}</label>
                                        <Input type="text" id="companyName" {...register("companyName", { required: inquiryType === 'partner' })} placeholder={t.contactPage.companyNamePlaceholder} />
                                    </div>
                                    <div>
                                        <label htmlFor="businessType" className="sr-only">{t.contactPage.businessTypeLabel}</label>
                                         <Select id="businessType" {...register("businessType", { required: inquiryType === 'partner' })} className={!watch('businessType') ? 'text-gray-500' : ''} >
                                            <option value="" disabled>{t.contactPage.businessTypeLabel}</option>
                                            <option value="developer" className="text-gray-900">{t.contactPage.developerOption}</option>
                                            <option value="finishing" className="text-gray-900">{t.contactPage.finishingOption}</option>
                                            <option value="agency" className="text-gray-900">{t.contactPage.agencyOption}</option>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="sr-only">{t.contactPage.namePlaceholder}</label>
                                <Input type="text" id="name" {...register("name", { required: true })} placeholder={t.contactPage.namePlaceholder} />
                            </div>
                            <div>
                                <label htmlFor="phone" className="sr-only">{t.contactPage.phonePlaceholder}</label>
                                <Input type="tel" id="phone" {...register("phone", { required: true })} placeholder={t.contactPage.phonePlaceholder} dir="ltr" />
                            </div>
                            <div>
                                <label htmlFor="contactTime" className="sr-only">{t.contactPage.contactTimeLabel}</label>
                                <Select id="contactTime" {...register("contactTime", { required: true })} className={!watch('contactTime') ? 'text-gray-500' : ''}>
                                    <option value="" disabled>{t.contactPage.contactTimeDefault}</option>
                                    <option value="morning" className="text-gray-900">{t.contactPage.contactTimeMorning}</option>
                                    <option value="afternoon" className="text-gray-900">{t.contactPage.contactTimeAfternoon}</option>
                                    <option value="evening" className="text-gray-900">{t.contactPage.contactTimeEvening}</option>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">{t.contactPage.messagePlaceholder}</label>
                                <Textarea id="message" {...register("message", { required: true })} rows={5} placeholder={t.contactPage.messagePlaceholder}></Textarea>
                            </div>
                            <div>
                                <Button type="submit" isLoading={mutation.isPending} className="w-full" size="lg">
                                    {t.contactPage.sendButton}
                                </Button>
                            </div>
                        </form>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.contactPage.contactInfoTitle}</h2>
                        {isLoadingContent ? <div className="animate-pulse space-y-4"><div className="h-6 bg-gray-200 rounded w-3/4"></div><div className="h-6 bg-gray-200 rounded w-1/2"></div></div> : (
                            <>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">📍</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t.contactPage.addressTitle}</h3>
                                        <p className="text-gray-600">{siteContent?.footer[language].address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {siteContent?.footer.isWhatsAppOnly ? (
                                            <WhatsAppIcon className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <PhoneIcon className="w-5 h-5 text-amber-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t.contactPage.phoneTitle}</h3>
                                        <p className="text-gray-600" dir="ltr">{siteContent?.footer.phone}</p>
                                        {siteContent?.footer.isWhatsAppOnly && (
                                            <p className="text-xs text-green-600 mt-1">
                                                {language === 'ar' ? '(واتساب فقط)' : '(WhatsApp Only)'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">✉️</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t.contactPage.emailTitle}</h3>
                                        <p className="text-gray-600">{siteContent?.footer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">⏰</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t.contactPage.hoursTitle}</h3>
                                        <p className="text-gray-600">{siteContent?.footer[language].hours}</p>
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
