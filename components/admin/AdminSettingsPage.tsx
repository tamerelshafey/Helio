

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { Language, SiteContent } from '../../types';
import { inputClasses } from '../shared/FormField';
import { CloseIcon, PhotoIcon } from '../icons/Icons';
// FIX: Corrected import path from `api` to `services`.
import { getContent, updateContent as updateSiteContent } from '../../services/content';
// FIX: Replaced deprecated `useApiQuery` with `useQuery` from `@tanstack/react-query`.
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminSettingsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading: dataLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    const { showToast } = useToast();
    
    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty } } = useForm<SiteContent>();
    
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social'>('general');

    useEffect(() => {
        if (siteContent) {
            reset(siteContent); // Populate form with fetched data
        }
    }, [siteContent, reset]);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setValue('logoUrl', base64, { shouldDirty: true });
        }
    };
    
    const watchLogoUrl = watch('logoUrl');

    const onSubmit = async (formData: SiteContent) => {
        // Exclude finishingServices from the update
        const { finishingServices, ...dataToSave } = formData;
        await updateSiteContent(dataToSave as Partial<SiteContent>);
        refetch();
        showToast('Settings updated successfully!', 'success');
    };

    if (dataLoading) {
        return <div>Loading settings...</div>;
    }
    
    const TabButton: React.FC<{tabKey: 'general' | 'contact' | 'social', label: string}> = ({tabKey, label}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tabKey ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.adminDashboard.nav.settings}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage global settings for the website, such as footer content and contact information.</p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 border-b border-gray-200 dark:border-gray-700">
                         <div className="flex -mb-px space-x-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <TabButton tabKey="general" label="General Settings" />
                            <TabButton tabKey="contact" label="Contact Info" />
                            <TabButton tabKey="social" label="Social Media" />
                         </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {activeTab === 'general' && (
                             <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description (in Footer) (AR)</label>
                                    <textarea {...register('footer.ar.description')} className={inputClasses} rows={3}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description (in Footer) (EN)</label>
                                    <textarea {...register('footer.en.description')} className={inputClasses} rows={3}/>
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-30