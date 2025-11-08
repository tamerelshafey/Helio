

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubscriptionPlan } from '../../types';
import { translations } from '../../data/translations';
import { useAuth } from '../auth/AuthContext';
import { inputClasses } from '../shared/FormField';
import { updatePartner } from '../../api/partners';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';

const textareaClasses = `${inputClasses} min-h-[120px]`;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const DashboardProfilePage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].dashboard;
    const t_plans_base = translations[language].subscriptionPlans;
    const { currentUser, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
    
    const [logoPreview, setLogoPreview] = useState<string | null>('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    
    useEffect(() => {
        if (currentUser && 'type' in currentUser) {
            // FIX: Ensure partnerInfo lookups are safe
            const arPartnerInfo = (translations.ar.partnerInfo as any)[currentUser.id];
            const enPartnerInfo = (translations.en.partnerInfo as any)[currentUser.id];

            reset({
                nameAr: arPartnerInfo?.name || '',
                descriptionAr: arPartnerInfo?.description || '',
                nameEn: enPartnerInfo?.name || '',
                descriptionEn: enPartnerInfo?.description || '',
            });
            setLogoPreview(currentUser.imageUrl);
        }
    }, [currentUser, reset]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            const previewUrl = URL.createObjectURL(file);
            setLogoPreview(previewUrl);
        }
    };

    const onSubmit = async (data: any) => {
        if (!currentUser || !('type' in currentUser)) return;

        let imageUrl = currentUser.imageUrl;
        if (logoFile) {
            imageUrl = await fileToBase64(logoFile);
        }
        
        const updates = {
            nameAr: data.nameAr,
            nameEn: data.nameEn,
            descriptionAr: data.descriptionAr,
            descriptionEn: data.descriptionEn,
            imageUrl: imageUrl,
        };

        const result = await updatePartner(currentUser.id, updates);

        if (result) {
            showToast(t.profileUpdateSuccess, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showToast('Failed to update profile.', 'error');
        }
    };
    
    if (authLoading || !currentUser || !('type' in currentUser)) return null;
    
    const partnerTypeKey = currentUser.type as 'developer' | 'agency' | 'finishing';
    const plansForType = (t_plans_base as any)[partnerTypeKey];
    const planDetails = plansForType ? plansForType[currentUser.subscriptionPlan as keyof typeof plansForType] : null;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.profileTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.profileSubtitle}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 max-w-2xl bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="nameAr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerName} (AR)</label>
                                <input type="text" id="nameAr" {...register("nameAr", { required: true })} className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="nameEn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerName} (EN)</label>
                                <input type="text" id="nameEn" {...register("nameEn", { required: true })} className={inputClasses} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="descriptionAr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerDescription} (AR)</label>
                            <textarea id="descriptionAr" {...register("descriptionAr", { required: true })} className={textareaClasses} />
                        </div>
                        <div>
                            <label htmlFor="descriptionEn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerDescription} (EN)</label>
                            <textarea id="descriptionEn" {...register("descriptionEn", { required: true })} className={textareaClasses} />
                        </div>
                        <div>
                            <label htmlFor="partnerImageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.partnerImageUrl}</label>
                            <div className="flex items-center gap-4">
                                {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" />}
                                <input 
                                    type="file" 
                                    id="partnerImageUrl" 
                                    accept="image/*"
                                    onChange={handleLogoChange} 
                                    className={`${inputClasses} p-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100`}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                                {isSubmitting ? '...' : t.saveChanges}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow border border-gray-200 dark:border-gray-700 h-fit">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t.subscription}</h2>
                    {planDetails ? (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-lg text-center">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t.currentPlan}</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{planDetails.name}</p>
                            <Link 
                                to="/dashboard/subscription"
                                className="mt-4 inline-block w-full text-center text-amber-600 dark:text-amber-400 font-semibold px-4 py-2 rounded-lg hover:bg-amber-500/20 transition-colors"
                            >
                                {t.manageSubscription}
                            </Link>
                        </div>
                    ) : <p className="text-sm text-gray-500">No active subscription.</p>}
                </div>
            </div>
        </div>
    );
};

export default DashboardProfilePage;