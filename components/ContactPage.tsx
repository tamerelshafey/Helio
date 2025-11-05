import React, { useState } from 'react';
import type { Language } from '../types';
import { translations } from '../data/translations';
import { inputClasses, selectClasses } from './shared/FormField';
import { addContactRequest } from '../mockApi/contactRequests';
import { CheckCircleIcon } from './icons/Icons';

interface ContactPageProps {
  language: Language;
}

const ContactPage: React.FC<ContactPageProps> = ({ language }) => {
    const t = translations[language].contactPage;
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        contactTime: '',
        message: '',
        inquiryType: 'client' as 'client' | 'partner',
        companyName: '',
        businessType: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInquiryTypeChange = (type: 'client' | 'partner') => {
        setFormData(prev => ({ 
            ...prev, 
            inquiryType: type,
            // Reset partner fields if switching back to client
            companyName: type === 'client' ? '' : prev.companyName,
            businessType: type === 'client' ? '' : prev.businessType,
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const requestData = {
            name: formData.name,
            phone: formData.phone,
            contactTime: formData.contactTime,
            message: formData.message,
            inquiryType: formData.inquiryType,
            companyName: formData.inquiryType === 'partner' ? formData.companyName : undefined,
            businessType: formData.inquiryType === 'partner' ? formData.businessType : undefined,
        };

        await addContactRequest(requestData);
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
                </div>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                    {submitted ? (
                        <div className="md:col-span-2 text-center py-10">
                            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.successMessage}</h2>
                        </div>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.formTitle}</h2>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.inquiryTypeLabel}</label>
                                        <div className="flex gap-4 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                                            <button type="button" onClick={() => handleInquiryTypeChange('client')} className={`w-full py-2 rounded-md transition-colors ${formData.inquiryType === 'client' ? 'bg-white dark:bg-gray-800 shadow text-amber-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>{t.clientOption}</button>
                                            <button type="button" onClick={() => handleInquiryTypeChange('partner')} className={`w-full py-2 rounded-md transition-colors ${formData.inquiryType === 'partner' ? 'bg-white dark:bg-gray-800 shadow text-amber-600 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>{t.partnerOption}</button>
                                        </div>
                                    </div>
                                    
                                    {formData.inquiryType === 'partner' && (
                                        <div className="space-y-6 p-4 border border-amber-500/20 rounded-lg animate-fadeIn">
                                            <div>
                                                <label htmlFor="companyName" className="sr-only">{t.companyNamePlaceholder}</label>
                                                <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder={t.companyNamePlaceholder} className={inputClasses} required />
                                            </div>
                                            <div>
                                                <label htmlFor="businessType" className="sr-only">{t.businessTypeLabel}</label>
                                                 <select id="businessType" name="businessType" value={formData.businessType} onChange={handleChange} className={`${selectClasses} ${!formData.businessType ? 'text-gray-500 dark:text-gray-400' : ''}`} required>
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
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder={t.namePlaceholder} className={inputClasses} required />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="sr-only">{t.phonePlaceholder}</label>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={t.phonePlaceholder} className={inputClasses} required dir="ltr" />
                                    </div>
                                    <div>
                                        <label htmlFor="contactTime" className="sr-only">{t.contactTimeLabel}</label>
                                        <select id="contactTime" name="contactTime" value={formData.contactTime} onChange={handleChange} className={`${selectClasses} ${!formData.contactTime ? 'text-gray-500 dark:text-gray-400' : ''}`} required>
                                            <option value="" disabled>{t.contactTimeDefault}</option>
                                            <option value="morning" className="text-gray-900 dark:text-white">{t.contactTimeMorning}</option>
                                            <option value="afternoon" className="text-gray-900 dark:text-white">{t.contactTimeAfternoon}</option>
                                            <option value="evening" className="text-gray-900 dark:text-white">{t.contactTimeEvening}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="sr-only">{t.messagePlaceholder}</label>
                                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} placeholder={t.messagePlaceholder} className={inputClasses} required></textarea>
                                    </div>
                                    <div>
                                        <button type="submit" disabled={loading} className="w-full bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                                            {loading ? '...' : t.sendButton}
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-amber-500 mb-6">{t.contactInfoTitle}</h2>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">📍</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.addressTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{t.addressText}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">📞</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.phoneTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400" dir="ltr">+20 123 456 7890</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">✉️</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.emailTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">info@onlyhelio.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="text-amber-500 mt-1">⏰</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t.hoursTitle}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{t.hoursText}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;