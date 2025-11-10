

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SiteContent } from '../../types';
// FIX: Corrected import path from `api` to `services`.
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../icons/Icons';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-3 font-semibold text-md border-b-4 transition-colors duration-200 ${
            isActive
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50'
        }`}
    >
        {label}
    </button>
);

const AdminContentManagementPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_content = t.adminDashboard.contentManagement;
    const { showToast } = useToast();
    const { data: initialContent, isLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });

    const [activeTab, setActiveTab] = useState('hero');
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting, isDirty },
    } = useForm<SiteContent>();

    const { fields: whyUsFields, append: appendWhyUs, remove: removeWhyUs } = useFieldArray({ control, name: 'whyUs.en.features' });
    const { remove: removeWhyUsAr } = useFieldArray({ control, name: 'whyUs.ar.features' });
    
    const { fields: quoteFields, append: appendQuote, remove: removeQuote, swap: swapQuote } = useFieldArray({ control, name: 'quotes' });

    useEffect(() => {
        if (initialContent) {
            reset(initialContent);
        }
    }, [initialContent, reset]);

    const onSubmit = async (data: SiteContent) => {
        // Omitting fields managed elsewhere to avoid overwriting them
        const { footer, finishingServices, ...contentToUpdate } = data;
        await updateSiteContent(contentToUpdate);
        showToast('Site content updated successfully!', 'success');
        refetch();
    };
    
    if (isLoading) {
        return <div>Loading content editor...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_content.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_content.subtitle}</p>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap -mb-px" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                           {Object.entries(t_content.tabs).map(([key, label]) => (
                                <TabButton key={key} label={label as string} isActive={activeTab === key} onClick={() => setActiveTab(key)} />
                           ))}
                        </div>
                    </div>

                    <div className="p-6 space-y-6 min-h-[50vh]">
                        {activeTab === 'hero' && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-xl font-bold">Hero Section</h3>
                                <div><label className="block text-sm font-medium">Title (AR)</label><Input {...register('hero.ar.title')} /></div>
                                <div><label className="block text-sm font-medium">Title (EN)</label><Input {...register('hero.en.title')} /></div>
                                <div><label className="block text-sm font-medium">Subtitle (AR)</label><Textarea {...register('hero.ar.subtitle')} rows={3}/></div>
                                <div><label className="block text-sm font-medium">Subtitle (EN)</label><Textarea {...register('hero.en.subtitle')} rows={3}/></div>
                            </div>
                        )}

                        {activeTab === 'whyUs' && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-xl font-bold">"Why Us" Section</h3>
                                <div><label className="block text-sm font-medium">Section Title (AR)</label><Input {...register('whyUs.ar.title')} /></div>
                                <div><label className="block text-sm font-medium">Section Title (EN)</label><Input {...register('whyUs.en.title')} /></div>
                                <div><label className="block text-sm font-medium">Section Description (AR)</label><Textarea {...register('whyUs.ar.description')} rows={2}/></div>
                                <div><label className="block text-sm font-medium">Section Description (EN)</label><Textarea {...register('whyUs.en.description')} rows={2}/></div>
                                
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="font-semibold mb-2">Features</h4>
                                    <div className="space-y-3">
                                        {whyUsFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-md space-y-3 relative">
                                                <Button type="button" size="icon" variant="ghost" onClick={() => { removeWhyUs(index); removeWhyUsAr(index); }} className="absolute top-1 right-1"><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                                                <div><label className="text-xs">Title (AR)</label><Input {...register(`whyUs.ar.features.${index}.title`)} /></div>
                                                <div><label className="text-xs">Title (EN)</label><Input {...register(`whyUs.en.features.${index}.title`)} /></div>
                                                <div><label className="text-xs">Description (AR)</label><Textarea {...register(`whyUs.ar.features.${index}.description`)} rows={2}/></div>
                                                <div><label className="text-xs">Description (EN)</label><Textarea {...register(`whyUs.en.features.${index}.description`)} rows={2}/></div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="secondary" className="mt-4" onClick={() => { appendWhyUs({ title: '', description: ''}); (control as any)._formValues.whyUs.ar.features.push({ title: '', description: '' }); }}>
                                        {t_content.addFeature}
                                    </Button>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'quotes' && (
                            <div className="space-y-4 animate-fadeIn">
                                <h3 className="text-xl font-bold">Wisdom Quotes</h3>
                                {quoteFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-md space-y-3 relative">
                                        <div className="flex justify-end gap-1 absolute top-2 right-2">
                                            <Button type="button" size="icon" variant="ghost" onClick={() => swapQuote(index, index - 1)} disabled={index === 0}><ArrowUpIcon className="w-4 h-4" /></Button>
                                            <Button type="button" size="icon" variant="ghost" onClick={() => swapQuote(index, index + 1)} disabled={index === quoteFields.length - 1}><ArrowDownIcon className="w-4 h-4" /></Button>
                                            <Button type="button" size="icon" variant="ghost" onClick={() => removeQuote(index)}><TrashIcon className="w-4 h-4 text-red-500"/></Button>
                                        </div>
                                        <div><label className="block text-sm font-medium">Quote (AR)</label><Textarea {...register(`quotes.${index}.quote.ar`)} rows={2} /></div>
                                        <div><label className="block text-sm font-medium">Author (AR)</label><Input {...register(`quotes.${index}.author.ar`)} /></div>
                                        <div><label className="block text-sm font-medium">Quote (EN)</label><Textarea {...register(`quotes.${index}.quote.en`)} rows={2} /></div>
                                        <div><label className="block text-sm font-medium">Author (EN)</label><Input {...register(`quotes.${index}.author.en`)} /></div>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" onClick={() => appendQuote({ quote: { ar: '', en: '' }, author: { ar: '', en: '' } })}>
                                    {t_content.addFeature.replace('Feature', 'Quote')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="mt-8 flex justify-end items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600 dark:text-yellow-400">{t_content.unsavedChanges}</span>}
                    <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                        {isSubmitting ? t_content.saving : t_content.saveChanges}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminContentManagementPage;