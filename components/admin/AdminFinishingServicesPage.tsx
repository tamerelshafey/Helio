


import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses } from '../shared/FormField';
import { TrashIcon } from '../icons/Icons';
import { getContent, updateContent as updateSiteContent } from '../../api/content';
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
        showToast('Finishing services updated successfully!', 'success');
    };

    if (dataLoading) {
        return <div>Loading services...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.adminDashboard.nav.finishingServices}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage pricing and descriptions for finishing services offered on the public site.</p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="space-y-6">
                        {(watchFinishingServices || []).map((service, serviceIndex) => (
                            <div key={serviceIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">Service {serviceIndex + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title (AR)</label>
                                        <input {...register(`finishingServices.${serviceIndex}.title.ar`)} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title (EN)</label>
                                        <input {...register(`finishingServices.${serviceIndex}.title.en`)} className={inputClasses} />
                                    </div>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Description (AR)</label>
                                    <textarea {...register(`finishingServices.${serviceIndex}.description.ar`)} className={inputClasses} rows={3}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Description (EN)</label>
                                    <textarea {...register(`finishingServices.${serviceIndex}.description.en`)} className={inputClasses} rows={3}/>
                                </div>
                                
                                {service.price !== undefined && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (EGP)</label>
                                        <input type="number" {...register(`finishingServices.${serviceIndex}.price`, { valueAsNumber: true })} className={inputClasses} />
                                    </div>
                                )}

                                {service.pricingTiers && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <h5 className="font-semibold text-gray-800 dark:text-gray-200">Pricing Tiers</h5>
                                        {service.pricingTiers.map((tier, tierIndex) => (
                                            <div key={tierIndex} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-300 dark:border-gray-600 relative">
                                                <button type="button" onClick={() => handleRemoveTier(serviceIndex, tierIndex)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"><TrashIcon className="w-4 h-4" /></button>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div><label className="text-xs">Unit Type (AR)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType.ar`)} className={inputClasses} /></div>
                                                        <div><label className="text-xs">Unit Type (EN)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType.en`)} className={inputClasses} /></div>
                                                        <div><label className="text-xs">Area Range (AR)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange.ar`)} className={inputClasses} /></div>
                                                        <div><label className="text-xs">Area Range (EN)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange.en`)} className={inputClasses} /></div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs">Price (EGP)</label>
                                                        <input type="number" {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.price`, { valueAsNumber: true })} className={inputClasses} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                         <button type="button" onClick={() => handleAddTier(serviceIndex)} className="text-sm font-semibold text-amber-600 hover:text-amber-500">+ Add New Tier</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600 dark:text-yellow-400">You have unsaved changes.</span>}
                    <button type="submit" disabled={isSubmitting || !isDirty} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : 'Save Finishing Services'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminFinishingServicesPage;