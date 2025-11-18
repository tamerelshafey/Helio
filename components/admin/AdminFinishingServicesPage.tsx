
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses } from '../ui/FormField';
import { TrashIcon } from '../ui/Icons';
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';

const AdminFinishingServicesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading: dataLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    const { showToast } = useToast();
    
    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty } } = useForm<{ finishingServices: SiteContent['finishingServices'] }>();
    
    useEffect(() => {
        if (siteContent) {
            reset({ finishingServices: siteContent.finishingServices });
        }
    }, [siteContent, reset]);

    const watchFinishingServices = watch('finishingServices');

    const handleAddTier = (serviceIndex: number) => {
        const currentTiers = watchFinishingServices?.[serviceIndex]?.pricingTiers || [];
        const newTier = { unitType: { ar: '', en: '' }, areaRange: { ar: '', en: '' }, price: 0 };
        setValue(`finishingServices.${serviceIndex}.pricingTiers`, [...currentTiers, newTier], { shouldDirty: true });
    };

    const handleRemoveTier = (serviceIndex: number, tierIndex: number) => {
        const currentTiers = watchFinishingServices?.[serviceIndex]?.pricingTiers || [];
        setValue(`finishingServices.${serviceIndex}.pricingTiers`, currentTiers.filter((_, i) => i !== tierIndex), { shouldDirty: true });
    };

    const onSubmit = async (formData: { finishingServices: SiteContent['finishingServices'] }) => {
        await updateSiteContent({ finishingServices: formData.finishingServices });
        refetch();
        showToast('Services updated successfully!', 'success');
    };

    if (dataLoading) {
        return <div>Loading services...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? 'باقات الخدمات (الاستشارة والتصميم)' : 'Service Packages (Consultation & Design)'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                {language === 'ar' 
                    ? 'قم بتعديل الباقات التي تظهر للعملاء في صفحة التشطيبات (مثل: الاستشارة، التصميم ثلاثي الأبعاد، إلخ).' 
                    : 'Manage the packages displayed to customers on the Finishing page (e.g., Consultation, 3D Design, etc.).'}
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="space-y-8">
                        {(watchFinishingServices || []).map((service, serviceIndex) => (
                            <div key={serviceIndex} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                                <h4 className="font-bold text-amber-600 dark:text-amber-500 text-lg mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Package {serviceIndex + 1}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Title (AR)</label>
                                        <input {...register(`finishingServices.${serviceIndex}.title.ar`)} className={inputClasses} dir="rtl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Title (EN)</label>
                                        <input {...register(`finishingServices.${serviceIndex}.title.en`)} className={inputClasses} dir="ltr" />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (AR)</label>
                                        <textarea {...register(`finishingServices.${serviceIndex}.description.ar`)} className={inputClasses} rows={3} dir="rtl"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                                        <textarea {...register(`finishingServices.${serviceIndex}.description.en`)} className={inputClasses} rows={3} dir="ltr"/>
                                    </div>
                                </div>
                                
                                {service.pricingTiers && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                                            <span>Pricing Tiers</span>
                                            <button type="button" onClick={() => handleAddTier(serviceIndex)} className="text-sm text-amber-600 hover:text-amber-500 font-bold">+ Add Tier</button>
                                        </h5>
                                        {service.pricingTiers.map((tier, tierIndex) => (
                                            <div key={tierIndex} className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 relative shadow-sm">
                                                <button type="button" onClick={() => handleRemoveTier(serviceIndex, tierIndex)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold">Unit Type (AR)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType.ar`)} className={inputClasses} dir="rtl" /></div>
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold">Unit Type (EN)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType.en`)} className={inputClasses} dir="ltr" /></div>
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold">Area/Scope (AR)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange.ar`)} className={inputClasses} dir="rtl" /></div>
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold">Area/Scope (EN)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange.en`)} className={inputClasses} dir="ltr" /></div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase font-bold">Price (EGP)</label>
                                                        <input type="number" {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.price`, { valueAsNumber: true })} className={inputClasses} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600 dark:text-yellow-400 animate-pulse">You have unsaved changes.</span>}
                    <button type="submit" disabled={isSubmitting || !isDirty} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminFinishingServicesPage;
