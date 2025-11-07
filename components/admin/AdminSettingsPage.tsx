import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { Language, SiteContent } from '../../types';
import { inputClasses } from '../shared/FormField';
import { translations } from '../../data/translations';
import { CloseIcon, PhotoIcon } from '../icons/Icons';
import { getContent, updateContent as updateSiteContent } from '../../api/content';
import { useApiQuery } from '../shared/useApiQuery';
import { useToast } from '../shared/ToastContext';

interface AdminSettingsPageProps {
  language: Language;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ language }) => {
    const { data: siteContent, isLoading: dataLoading, refetch } = useApiQuery('siteContent', getContent);
    const t = translations[language];
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
                                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Logo</label>
                                    <div className="flex items-center gap-4">
                                        {watchLogoUrl ? 
                                            <img src={watchLogoUrl} alt="Logo preview" className="w-20 h-20 rounded-full object-contain border p-1 bg-gray-100 dark:bg-gray-700" />
                                            : <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">No Logo</div>
                                        }
                                        <input 
                                            type="file" 
                                            id="logoUrl" 
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                        />
                                    </div>
                                </div>
                                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label htmlFor="locationPickerMapUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Picker Map URL</label>
                                    <input type="url" {...register('locationPickerMapUrl')} className={inputClasses} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'contact' && (
                             <div className="space-y-4 animate-fadeIn">
                                <p className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-700">
                                    This information is used across the site, including the footer and the contact page.
                                </p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address (AR)</label>
                                    <input {...register('footer.ar.address')} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address (EN)</label>
                                    <input {...register('footer.en.address')} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Hours (AR)</label>
                                    <input {...register('footer.ar.hours')} className={inputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Hours (EN)</label>
                                    <input {...register('footer.en.hours')} className={inputClasses} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                        <input {...register('footer.phone')} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                        <input type="email" {...register('footer.email')} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'social' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                                        <input type="url" {...register('footer.social.facebook')} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter URL</label>
                                        <input type="url" {...register('footer.social.twitter')} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                                        <input type="url" {...register('footer.social.instagram')} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                                        <input type="url" {...register('footer.social.linkedin')} className={inputClasses} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600 dark:text-yellow-400">You have unsaved changes.</span>}
                    <button type="submit" disabled={isSubmitting || !isDirty} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;